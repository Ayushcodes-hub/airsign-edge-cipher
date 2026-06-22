import { LocalPredictorEngine } from './model.js';
import { runVigenereCipher, convertTextToBinaryBits, convertBinaryBitsToText } from './crypto.js';

const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output-canvas');
const canvasCtx = canvasElement.getContext('2d');
const outputText = document.getElementById('output-text');
const clearBtn = document.getElementById('clear-btn');
const toggleCamBtn = document.getElementById('toggle-cam-btn');
const statusTag = document.getElementById('model-status');

const hideBtn = document.getElementById('hide-btn');
const extractBtn = document.getElementById('extract-btn');
const downloadBtn = document.getElementById('download-btn');
const uploadFile = document.getElementById('upload-file');
const cipherKeyInput = document.getElementById('cipher-key');
const stegoCanvas = document.getElementById('stego-canvas');
const stegoCtx = stegoCanvas.getContext('2d');

let frameDebouncer = 0;
const SELECTION_COOLDOWN_VAL = 22;
let flatHandPanicFrameCount = 0;
const PANIC_WIPE_LIMIT = 45;

let cameraActiveState = true;
let videoHardwareStreamRef = null;
let liveAIPredictedSuggestion = "";

// Initialize Local AI model engine wrapper
const aiEngine = new LocalPredictorEngine();
aiEngine.initialize((txt) => { statusTag.innerText = txt; });

// Establish structural virtual keyboard coordinate targets
const keys = [];
const rowPatterns = ["QWERTYUIOP", "ASDFGHJKL ", "ZXCVBNM<- "];
const kW = 54; const kH = 46;
const startX = 45; const startY = 110;

rowPatterns.forEach((row, rIdx) => {
    for (let cIdx = 0; cIdx < row.length; cIdx++) {
        let character = row[cIdx];
        if (rIdx === 1 && cIdx === 9) character = "SPACE";
        if (rIdx === 2 && cIdx === 7) character = "BKSP";
        if (rIdx === 2 && cIdx === 8) character = "SPACE";
        if (rIdx === 2 && cIdx === 9) character = "SPACE";
        if (row[cIdx] === ' ' && character !== "BKSP") continue;

        keys.push({
            char: character, x: startX + cIdx * (kW + 5), y: startY + rIdx * (kH + 6),
            w: character === "SPACE" ? kW * 2.6 : kW, h: kH
        });
    }
});

const bannerBoxLocation = { x: startX, y: 50, w: 530, h: 42 };

function setupPlaceholderGraphics() {
    let grad = stegoCtx.createLinearGradient(0, 0, stegoCanvas.width, stegoCanvas.height);
    grad.addColorStop(0, '#1c160a'); grad.addColorStop(1, '#3a2f14');
    stegoCtx.fillStyle = grad; stegoCtx.fillRect(0, 0, stegoCanvas.width, stegoCanvas.height);
}
setupPlaceholderGraphics();

// Setup MediaPipe hands configuration pipeline instance
const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
hands.onResults(processInferenceFrames);

const camCaptureLoopRef = new Camera(videoElement, {
    onFrame: async () => { if (cameraActiveState) await hands.send({ image: videoElement }); },
    width: 640, height: 480
});

navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then(s => {
    videoHardwareStreamRef = s; videoElement.srcObject = s; camCaptureLoopRef.start();
});

// Trigger asynchronous background local language suggestion inferences
async function triggerBackgroundAISuggestionUpdate() {
    if(!aiEngine.isLoaded) return;
    const currentInput = outputText.value;
    if(!currentInput.trim()) { liveAIPredictedSuggestion = ""; return; }
    liveAIPredictedSuggestion = await aiEngine.getSuggestion(currentInput);
}

// Global Core System Coordination Engine Processing Loop
function processInferenceFrames(res) {
    if (!cameraActiveState) return;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    canvasCtx.save();
    canvasCtx.translate(canvasElement.width, 0); canvasCtx.scale(-1, 1);
    canvasCtx.drawImage(res.image, 0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.restore();

    renderSystemInterfaceOverlay();

    if (res.multiHandLandmarks && res.multiHandLandmarks.length > 0) {
        const pts = res.multiHandLandmarks[0];
        const idxTip = { x: (1 - pts[8].x) * canvasElement.width, y: pts[8].y * canvasElement.height };
        const thmbTip = { x: (1 - pts[4].x) * canvasElement.width, y: pts[4].y * canvasElement.height };
        const proximityDist = Math.hypot(idxTip.x - thmbTip.x, idxTip.y - thmbTip.y);

        // Detect open palm gesture parameters (the system wipe mechanism)
        const isFlatOpenPalm = pts[12].y < pts[9].y && pts[16].y < pts[13].y && pts[20].y < pts[17].y;
        if (isFlatOpenPalm && proximityDist > 60) {
            flatHandPanicFrameCount++;
            let progressRatio = Math.min(flatHandPanicFrameCount / PANIC_WIPE_LIMIT, 1);
            canvasCtx.strokeStyle = 'rgba(207, 60, 60, 0.9)'; canvasCtx.lineWidth = 6;
            canvasCtx.beginPath(); canvasCtx.arc(320, 240, 45, -Math.PI/2, (-Math.PI/2) + (Math.PI * 2 * progressRatio)); canvasCtx.stroke();
            if (flatHandPanicFrameCount >= PANIC_WIPE_LIMIT) { outputText.value = ""; flatHandPanicFrameCount = 0; triggerBackgroundAISuggestionUpdate(); }
        } else {
            flatHandPanicFrameCount = Math.max(0, flatHandPanicFrameCount - 2);
        }

        // Draw cursor tracking glow halo elements
        let glow = canvasCtx.createRadialGradient(idxTip.x, idxTip.y, 2, idxTip.x, idxTip.y, 16);
        glow.addColorStop(0, '#ffffff'); glow.addColorStop(0.4, '#d4af37'); glow.addColorStop(1, 'transparent');
        canvasCtx.fillStyle = glow; canvasCtx.beginPath(); canvasCtx.arc(idxTip.x, idxTip.y, 16, 0, Math.PI * 2); canvasCtx.fill();

        let hoveredKeyTarget = null; let overBannerSuggestionBox = false;

        if (idxTip.x >= bannerBoxLocation.x && idxTip.x <= bannerBoxLocation.x + bannerBoxLocation.w &&
            idxTip.y >= bannerBoxLocation.y && idxTip.y <= bannerBoxLocation.y + bannerBoxLocation.h) {
            overBannerSuggestionBox = true;
            canvasCtx.fillStyle = "rgba(214, 175, 55, 0.3)"; canvasCtx.fillRect(bannerBoxLocation.x, bannerBoxLocation.y, bannerBoxLocation.w, bannerBoxLocation.h);
        } else {
            keys.forEach(k => {
                if (idxTip.x >= k.x && idxTip.x <= k.x + k.w && idxTip.y >= k.y && idxTip.y <= k.y + k.h) {
                    hoveredKeyTarget = k;
                    canvasCtx.fillStyle = "rgba(214, 175, 55, 0.25)"; canvasCtx.fillRect(k.x, k.y, k.w, k.h);
                }
            });
        }

        // Catch spatial pinch intent triggers
        if (proximityDist < 38) {
            canvasCtx.strokeStyle = '#ffffff'; canvasCtx.lineWidth = 2;
            canvasCtx.beginPath(); canvasCtx.arc(idxTip.x, idxTip.y, 22, 0, Math.PI * 2); canvasCtx.stroke();

            if (frameDebouncer === 0) {
                if (overBannerSuggestionBox && liveAIPredictedSuggestion) {
                    const tokens = outputText.value.split(/\s+/); tokens.pop(); tokens.push(liveAIPredictedSuggestion);
                    outputText.value = tokens.join(" ") + " "; liveAIPredictedSuggestion = "";
                    frameDebouncer = SELECTION_COOLDOWN_VAL;
                    triggerBackgroundAISuggestionUpdate();
                } else if (hoveredKeyTarget) {
                    const char = hoveredKeyTarget.char;
                    if (char === "BKSP") outputText.value = outputText.value.slice(0, -1);
                    else if (char === "SPACE") outputText.value += " ";
                    else outputText.value += char;
                    frameDebouncer = SELECTION_COOLDOWN_VAL;
                    triggerBackgroundAISuggestionUpdate();
                }
            }
        }
    }
    if (frameDebouncer > 0) frameDebouncer--;
}

function renderSystemInterfaceOverlay() {
    // Render local inference suggestion banner box overlay component
    canvasCtx.fillStyle = "rgba(28, 25, 18, 0.95)"; canvasCtx.fillRect(bannerBoxLocation.x, bannerBoxLocation.y, bannerBoxLocation.w, bannerBoxLocation.h);
    canvasCtx.strokeStyle = liveAIPredictedSuggestion ? "rgba(214, 175, 55, 0.8)" : "rgba(58, 50, 26, 0.4)";
    canvasCtx.lineWidth = 1.5; canvasCtx.strokeRect(bannerBoxLocation.x, bannerBoxLocation.y, bannerBoxLocation.w, bannerBoxLocation.h);
    
    canvasCtx.fillStyle = liveAIPredictedSuggestion ? "#f3e5ab" : "#615947";
    canvasCtx.font = "italic bold 13px sans-serif"; canvasCtx.textAlign = "center"; canvasCtx.textBaseline = "middle";
    canvasCtx.fillText(liveAIPredictedSuggestion ? `LOCAL AI SUGGESTION: ${liveAIPredictedSuggestion} (PINCH BANNER TO ACCEPT)` : "[TYPE VIA VISUAL KEYS TO COMPUTE LOCAL INFERENCE]", bannerBoxLocation.x + bannerBoxLocation.w/2, bannerBoxLocation.y + bannerBoxLocation.h/2);

    // Draw keyboard grid
    keys.forEach(k => {
        canvasCtx.fillStyle = "rgba(20, 18, 14, 0.85)"; canvasCtx.fillRect(k.x, k.y, k.w, k.h);
        canvasCtx.strokeStyle = "rgba(214, 175, 55, 0.35)"; canvasCtx.strokeRect(k.x, k.y, k.w, k.h);
        canvasCtx.fillStyle = "#f4f1ea"; canvasCtx.font = "bold 15px monospace";
        canvasCtx.fillText(k.char, k.x + k.w/2, k.y + k.h/2);
    });
}

// Handle physical hardware cut switch loops offline cleanly
toggleCamBtn.addEventListener('click', () => {
    if (cameraActiveState) {
        if (videoHardwareStreamRef) videoHardwareStreamRef.getTracks().forEach(t => t.stop());
        cameraActiveState = false;
        toggleCamBtn.innerText = "INITIALIZE LOCAL HARDWARE STREAM (GO ONLINE)";
        toggleCamBtn.style.borderColor = "var(--safe-color)"; toggleCamBtn.style.color = "var(--safe-color)";
        executeFallbackOfflineInterfaceRenderLoop();
    } else {
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } }).then(s => {
            videoHardwareStreamRef = s; videoElement.srcObject = s; cameraActiveState = true;
            toggleCamBtn.innerText = "TERMINATE CAMERA FEED (GO OFFLINE)";
            toggleCamBtn.style.borderColor = "var(--alert-color)"; toggleCamBtn.style.color = "var(--alert-color)";
            camCaptureLoopRef.start();
        });
    }
});

function executeFallbackOfflineInterfaceRenderLoop() {
    if (cameraActiveState) return;
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.fillStyle = "#070604"; canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.strokeStyle = "rgba(214, 175, 55, 0.04)"; canvasCtx.lineWidth = 1;
    for(let i=0; i<canvasElement.width; i+=40) { canvasCtx.beginPath(); canvasCtx.moveTo(i,0); canvasCtx.lineTo(i,canvasElement.height); canvasCtx.stroke(); }
    
    canvasCtx.fillStyle = "rgba(207, 60, 60, 0.3)"; canvasCtx.font = "bold 11px monospace"; canvasCtx.textAlign = "left";
    canvasCtx.fillText("CAMERA RECOVERY DISCONNECTED // STANDALONE ISOLATED SYSTEM MODULE ACTIVE", 20, canvasElement.height - 20);

    renderSystemInterfaceOverlay();
    requestAnimationFrame(executeFallbackOfflineInterfaceRenderLoop);
}

clearBtn.addEventListener('click', () => { outputText.value = ""; triggerBackgroundAISuggestionUpdate(); });

// Steganographic Cryptography Bindings with Dynamic Master PIN Validation
hideBtn.addEventListener('click', () => {
    if (cipherKeyInput.value !== "AYUSH") {
        alert("ACCESS DENIED: Invalid Cipher Key Matrix. Please authenticate using the correct security PIN.");
        return;
    }
    const rawVal = outputText.value; if (!rawVal) return alert("Write payload strings before inject injection processes.");
    const hiddenObfuscatedString = runVigenereCipher(rawVal, cipherKeyInput.value, false);
    const bitStream = convertTextToBinaryBits(hiddenObfuscatedString) + "00000000";

    let graphicsFrame = stegoCtx.getImageData(0, 0, stegoCanvas.width, stegoCanvas.height);
    let px = graphicsFrame.data;

    let targetBitPtr = 0;
    for (let i = 0; i < px.length; i++) {
        if ((i + 1) % 4 === 0) continue;
        if (targetBitPtr < bitStream.length) {
            px[i] = (px[i] & 0xFE) | parseInt(bitStream[targetBitPtr], 2);
            targetBitPtr++;
        } else break;
    }
    stegoCtx.putImageData(graphicsFrame, 0, 0);
    alert("Payload securely embedded inside pixel layers.");
});

// Download triggered wiping logic sequence
downloadBtn.addEventListener('click', () => {
    const virtualLink = document.createElement('a');
    virtualLink.download = 'airsign_isolated_payload.png';
    virtualLink.href = stegoCanvas.toDataURL('image/png');
    virtualLink.click();
    
    // Immediate Volatile Security Flush Feature
    cipherKeyInput.value = ""; 
    console.log("Security Protocol Triggered: Cipher key storage wiped out post-download.");
});

uploadFile.addEventListener('change', (e) => {
    const attachedFile = e.target.files[0]; if (!attachedFile) return;
    const fileReaderInst = new FileReader();
    fileReaderInst.onload = function(event) {
        const imgObj = new Image();
        imgObj.onload = function() {
            stegoCtx.clearRect(0, 0, stegoCanvas.width, stegoCanvas.height);
            stegoCtx.drawImage(imgObj, 0, 0, stegoCanvas.width, stegoCanvas.height);
        };
        imgObj.src = event.target.result;
    };
    fileReaderInst.readAsDataURL(attachedFile);
});

extractBtn.addEventListener('click', () => {
    if (cipherKeyInput.value !== "AYUSH") {
        alert("ACCESS DENIED: Invalid Cipher Key Matrix. Pin authorization required to complete extraction reverse cipher execution.");
        return;
    }
    let graphicsFrame = stegoCtx.getImageData(0, 0, stegoCanvas.width, stegoCanvas.height);
    let px = graphicsFrame.data;
    let accumulatedBits = "";

    for (let i = 0; i < px.length; i++) {
        if ((i + 1) % 4 === 0) continue;
        accumulatedBits += (px[i] & 1).toString();
        if (accumulatedBits.length % 8 === 0 && accumulatedBits.slice(-8) === "00000000") {
            accumulatedBits = accumulatedBits.slice(0, -8);
            break;
        }
    }
    const extractedObfuscation = convertBinaryBitsToText(accumulatedBits);
    const clearDecryptedTextResult = runVigenereCipher(extractedObfuscation, cipherKeyInput.value, true);
    alert(`Decoded Payload Matrix:\n\n${clearDecryptedTextResult}`);
});