/**
 * StudyOS Camera Presence Detection Service
 * 
 * Runs 100% locally in the browser using the browser's native Shape Detection API (FaceDetector)
 * or local canvas brightness/optical frame-differencing fallback.
 * 
 * PRIVACY GUARANTEE:
 * - ZERO camera frames are ever saved, stored, or sent over any network.
 * - Processing happens purely in local browser memory.
 */

let videoElement = null;
let mediaStream = null;
let checkIntervalId = null;
let faceDetector = null;

// Initialize native FaceDetector if supported by the browser
if (typeof window !== 'undefined' && 'FaceDetector' in window) {
  try {
    // eslint-disable-next-line no-undef
    faceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  } catch (e) {
    console.warn('Native FaceDetector failed to initialize, using optical fallback.', e);
  }
}

/**
 * Start the local camera presence detection service.
 * @param {Function} onPresenceChange - Callback receiving boolean isPresent
 * @param {number} checkIntervalMs - Interval between checks (default 60 seconds)
 */
export async function startPresenceDetection(onPresenceChange, checkIntervalMs = 60000) {
  stopPresenceDetection();

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
      audio: false
    });

    videoElement = document.createElement('video');
    videoElement.srcObject = mediaStream;
    videoElement.playsInline = true;
    videoElement.muted = true;
    await videoElement.play();

    // Run an initial check after video stream stabilizes
    setTimeout(() => checkPresence(onPresenceChange), 1500);

    // Run periodic checks every checkIntervalMs (e.g. 60s)
    checkIntervalId = setInterval(() => {
      checkPresence(onPresenceChange);
    }, checkIntervalMs);

    return { success: true };
  } catch (error) {
    console.warn('Camera presence detection permission denied or unavailable:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Perform a single local frame presence check.
 */
async function checkPresence(onPresenceChange) {
  if (!videoElement || videoElement.readyState < 2) {
    return;
  }

  try {
    if (faceDetector) {
      // Use Chrome / Chromium native FaceDetector
      const faces = await faceDetector.detect(videoElement);
      const isPresent = faces && faces.length > 0;
      onPresenceChange(isPresent);
    } else {
      // Fallback: Local canvas optical presence check
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate average brightness and skin-tone range
      let totalBrightness = 0;
      let humanColorHits = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        totalBrightness += brightness;

        // Basic human illumination heuristics
        if (r > 60 && g > 40 && b > 20 && r > g && r > b) {
          humanColorHits++;
        }
      }

      const totalSampled = data.length / 16;
      const avgBrightness = totalBrightness / totalSampled;
      const isPresent = avgBrightness > 20 && humanColorHits > totalSampled * 0.08;
      onPresenceChange(isPresent);
    }
  } catch (err) {
    console.warn('Presence check error:', err);
    // On unexpected error, gracefully default to present
    onPresenceChange(true);
  }
}

/**
 * Stop camera tracks and clear interval.
 */
export function stopPresenceDetection() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (videoElement) {
    videoElement.srcObject = null;
    videoElement = null;
  }
}
