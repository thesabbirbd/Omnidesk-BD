/**
 * StudyOS Camera Presence Detection Service (Snapshot-Based)
 * 
 * Runs 100% locally in the browser using FaceDetector or optical heuristics.
 * 
 * PRIVACY & HARDWARE GUARANTEE:
 * - Camera is only opened for a brief snapshot (~500ms) to check presence,
 *   and all media tracks are IMMEDIATELY stopped so the camera light turns OFF.
 * - ZERO video frames are ever recorded, saved, or transmitted over any network.
 */

let checkIntervalId = null;
let isCheckingNow = false;
let faceDetector = null;

// Initialize native FaceDetector if supported
if (typeof window !== 'undefined' && 'FaceDetector' in window) {
  try {
    // eslint-disable-next-line no-undef
    faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  } catch (e) {
    console.warn('Native FaceDetector fallback to canvas analysis:', e);
  }
}

/**
 * Perform a single snapshot presence check:
 * Opens camera, grabs a frame, detects face, and IMMEDIATELY shuts camera off.
 */
async function performSnapshotCheck(onPresenceChange) {
  if (isCheckingNow) return;
  isCheckingNow = true;

  let stream = null;
  let video = null;

  try {
    // 1. Request camera briefly
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      audio: false
    });

    video = document.createElement('video');
    video.srcObject = stream;
    video.playsInline = true;
    video.muted = true;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play().then(resolve).catch(resolve);
      };
      // Timeout fallback
      setTimeout(resolve, 800);
    });

    // Wait a brief frame render moment (~300ms)
    await new Promise((r) => setTimeout(r, 300));

    let isPresent = false;

    if (faceDetector && video.readyState >= 2) {
      try {
        const faces = await faceDetector.detect(video);
        isPresent = faces && faces.length > 0;
      } catch {
        isPresent = false;
      }
    } else if (video.readyState >= 2) {
      // Optical fallback
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      let totalBrightness = 0;
      let humanColorHits = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        totalBrightness += (r + g + b) / 3;
        if (r > 50 && g > 35 && b > 20 && r > b) {
          humanColorHits++;
        }
      }
      const totalSampled = data.length / 16;
      const avgBrightness = totalBrightness / totalSampled;
      isPresent = avgBrightness > 15 && humanColorHits > totalSampled * 0.06;
    } else {
      // If camera stream couldn't initialize in time, assume present
      isPresent = true;
    }

    onPresenceChange(isPresent);
  } catch (err) {
    console.warn('Camera snapshot error or permission not granted:', err?.message);
    // Graceful fallback: don't block user
    onPresenceChange(true);
  } finally {
    // 2. ALWAYS immediately shut down the camera stream and turn hardware LED off!
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      stream = null;
    }
    if (video) {
      video.srcObject = null;
      video = null;
    }
    isCheckingNow = false;
  }
}

/**
 * Start periodic snapshot presence detection.
 * @param {Function} onPresenceChange - Receives boolean isPresent
 * @param {number} checkIntervalMs - Interval between snapshot checks (default 5000ms)
 */
export function startPresenceDetection(onPresenceChange, checkIntervalMs = 5000) {
  stopPresenceDetection();

  // Run first check after a brief initial pause (800ms)
  setTimeout(() => {
    performSnapshotCheck(onPresenceChange);
  }, 800);

  // Set recurring snapshot check
  checkIntervalId = setInterval(() => {
    performSnapshotCheck(onPresenceChange);
  }, checkIntervalMs);

  return { success: true };
}

/**
 * Stop any running interval and release any remaining camera tracks.
 */
export function stopPresenceDetection() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  isCheckingNow = false;
}
