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
# AirSign // Secure On-Device Motion & Cryptographic Edge-AI Station

![OSDHack 2026 Theme](https://img.shields.io/badge/OSDHack%202026-On%20Device%20AI-d4af37?style=for-the-badge)
![License](https://img.shields.io/github/license/Ayushcodes-hub/airsign-edge-cipher?color=5da470&style=for-the-badge)
![Built With](https://img.shields.io/badge/Built%20With-Transformers.js%20%26%20MediaPipe-8faec4?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Browser%20Edge%20%2F%20WASM-orange?style=for-the-badge)

AirSign provides a completely client-side, hardware-isolated environment for cryptographic text entry, file payload masking, and real-time textual predictions. It executes high-fidelity hand-tracking computer vision arrays alongside local transformer execution, ensuring absolute keystroke privacy—no cloud APIs required.

---

## 🧠 Architectural Overview & On-Device AI

Traditional virtual keyboards and web utilities process information through centralized cloud APIs, leaving communication metrics vulnerable to intercept vectors or remote logging. AirSign implements an alternate framework:

1. **Edge Computer Vision:** Hand spatial tracking arrays are compiled directly in the client application runtime space via WebAssembly, calculating real-time joint-vector interactions locally.
2. **Local Token Inference Engine:** Integrates `Transformers.js` to initialize and evaluate a quantized language model (`Xenova/pico-bert`) entirely within browser cache structures, facilitating offline text prediction loops.

---

## 🔒 Advanced Privacy Utilities

* **Volatile Memory Key Purge:** Built with zero-retention download security boundaries. The exact millisecond the user downloads an encrypted `.png` matrix asset, a runtime loop instantly flushes the cipher input field, protecting against memory retention exposure.
* **Master PIN Authorization Circuit:** Critical injection channels and cryptographic extractions are isolated behind strict verification pipelines, demanding explicit manual validation via the security PIN (`AYUSH`).
* **Hardware Intercept Kill Switch:** The platform features an override switch that forcefully terminates hardware media capture channels, safely enabling standalone cryptographic operations in local host environments.
* **Gestural System Wipe:** Spreading a flat hand configuration for 45 continuous frames triggers an input layer purge sequence to protect against local observational compromises.

---

## 🛠️ Repository File Tree

```text
├── /public
│   └── index.html      # UI Layout View Skeleton & Display Architecture
├── /src
│   ├── main.js         # Core Execution Orchestrator & MediaPipe Coordinate Tracks
│   ├── crypto.js       # Vigenère Polyalphabetic Cipher Processing Pipeline
│   └── model.js        # WebAssembly Model Initializer (Transformers.js Wrapper)
├── LICENSE             # Standard OSI-Compliant Open-Source MIT Validation
└── README.md           # Deployment documentation matrix
⚙️ Direct Local Installation
Execute this command sequence within the project root directory to spin up a local hosting worker instance:

Bash
# Initialize using standard Python server utilities
python -m http.server 8000

# Or execute using native Node lifecycle tooling
npx serve .
