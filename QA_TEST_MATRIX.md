# Omnidesk BD - QA Test Matrix

This document outlines the strict quality assurance checks that must be executed prior to marking a release as stable.
**CRITICAL RULE:** Never fake test results, progress, or analytics. Tests must run against the final compiled artifact.

## 1. Installation & Environment Verification
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Windows MSI/EXE Install** | Download and install on a clean Windows 10/11 VM. | Installs without SmartScreen blocks (if signed) and opens to Dashboard. | `[ ] Pending` |
| **Linux AppImage/DEB** | Execute AppImage and install DEB on Ubuntu 22.04. | App runs, icons appear, no library missing errors. | `[ ] Pending` |
| **Android APK Install** | Install on a physical device (Android 10+). | Installs successfully. Respects safe-area insets. | `[ ] Pending` |

## 2. Desktop Safety & Updater (Phase 28-29)
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Update DB Health Check** | Manually corrupt the DB and trigger check. | Update is blocked and shows "Database health check failed". | `[ ] Pending` |
| **Updater Disk Space** | Fill disk space to < 500MB, click update. | Update is blocked, warning about insufficient space. | `[ ] Pending` |
| **Cryptographic Signature** | Tamper with `latest.json` or binary. | Tauri rejects the update due to signature mismatch. | `[ ] Pending` |

## 3. UI/UX & Mobile Interactions (Phase 2)
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Mind Map Touch** | Use pinch-to-zoom and drag on mobile screen. | ReactFlow pans/zooms smoothly without page scrolling. | `[ ] Pending` |
| **Responsive Stacking** | Resize window to < 1024px. | Left sidebar transforms into the sleek bottom navigation bar. | `[ ] Pending` |
| **Error Boundary** | Force a crash in React DevTools. | Shows "Omnidesk encountered an unexpected error" with Reload/Home. | `[ ] Pending` |

## 4. Offline & Networking (Phase 21, 33)
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Offline Detection** | Disconnect Wi-Fi and open App. | Topbar shows "○ Offline". AI Input disables. | `[ ] Pending` |
| **AI Fallback** | Disconnect internet while asking AI. | Blocks request gracefully without crashing. | `[ ] Pending` |
| **Ollama Local Fallback** | Ensure internet is off, run local model. | Prompt executes locally if Ollama is marked available. | `[ ] Pending` |

## 5. Security & Migration Checks
| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Data Separation** | Install new update over old version. | User notes, StudySpaces, and DB `~/.omnidesk/` remain untouched. | `[ ] Pending` |
| **Secret Audit** | Unpack `.asar` or `.apk`. | `GEMINI_API_KEY` and `.keystore` strings are NOT present. | `[ ] Pending` |
