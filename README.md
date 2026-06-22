# AirSign // Secure On-Device Motion & Cryptographic Edge-AI Station

Built for **OSDHack 2026** under the core theme: **On Device AI**.

## 🚀 Architectural Vision
AirSign provides complete client-side text composition and cryptographic extraction without data ever leaving the local machine. By combining low-latency computer vision tracking with local language token processing engines, this application completely bypasses the security risks associated with traditional network-dependent soft-keyboards and cloud decryption engines.

### 🧠 On-Device AI Implementations
1. **Edge-Vision Spatial Tracking:** Utilizes browser-side WebAssembly compilation loops to intercept camera sensor streams, computing coordinate vectors locally.
2. **Local Token Inference Inference Engine:** Integrates `Transformers.js` to compile the quantized `Xenova/pico-bert` language model inside the native browser memory space. Next-token prediction runs 100% offline.

---

## 🛠️ Complete Feature Deep-Dive

### 1. Spatial Gesture Keying
The virtual keyboard matrix establishes fixed coordinate targets across canvas layers. When the system detects index-to-thumb closure parameters falling under the `38px` proximity threshold, it processes a character input.

### 2. Physical Kill Switch Integration
The hardware cutoff switch lets users instantly terminate active media data channels. When clicked, the application fully releases the webcam hardware interface while keeping the UI grid loops and local AI translation stacks active.

### 3. High-Level Steganography Pipeline
The system relies on an implementation of the Polyalphabetic Vigenère matrix to encode text entries. This rolling cipher maps shifts across print character sets (ASCII 32 to 126). 
* **Least Significant Bit (LSB) Injection:** The cipher string converts into binary streams injected into the canvas frame bytes, preserving texture layout aesthetics.

### 4. Gestural System Purge
Extending an open flat hand configuration triggers an automated timer frame accumulator. Reaching the `45-frame` mark automatically clears text fields, preventing visual shoulder-surfing exposure.

---

## ⚙️ Usage Instructions

### Run Locally (Zero Installation Required)
1. Clone this repository to your local device.
2. Launch a local static development server inside the root folder:
```bash
   # Using Python
   python -m http.server 8000
   # Or using Node.js
   npx serve .