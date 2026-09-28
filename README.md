# NeuroNova — Multimodal Cognitive Screening & Analytics

> **Next-generation digital cognitive screening system with on-device edge vision, real-time acoustic phonation analysis, and explainable AI (SHAP).**

---

## 🧠 System Overview

**NeuroNova** is an end-to-end cognitive screening and neuro-analytics platform designed to quantify functional cognitive efficiency, executive control, sustained vigilance, and speech fluency.

### Key Capabilities:
- **Zero-Latency Psychometric Engine**:
  - **Task 1: Psychomotor Vigilance Task (PVT)** — Measures millisecond reaction velocities, premature false starts, and sustained attention lapses (>500ms).
  - **Task 2: Dual-Rule Stroop Task** — Quantifies cognitive interference latency and prefrontal response inhibition with an adaptive difficulty staircase.
  - **Task 3: N-Back Working Memory** — Computes Signal Detection Theory sensitivity index ($d'$) and active phonological buffer capacity.
  - **Task 4: Verbal Phonation & Fluency** — Assesses semantic lexical retrieval rate, phonation pause ratios, and articulation velocity.
- **Multimodal Edge Biomarkers**:
  - **Oculomotor Tracking**: MediaPipe FaceLandmarker running client-side with GPU/WASM delegates. Derives gaze-on-screen ratio, spontaneous blink rate, and head posture variance without transmitting raw video.
  - **Acoustic Profiling**: Native Web Audio API (`AnalyserNode`) measuring RMS volume stability, silence-to-speech ratios, and phonation hesitation.
  - **Neuromotor Kinetics**: Sub-millisecond keydown dwell times and mouse trajectory curvature analysis.
- **Cognitive Performance Index (CPI v1)**:
  - Standardized normative composite (0–100 scale, Population Mean = 75.0, SD = 12.0) across 4 cognitive domains:
    1. *Executive Function & Working Memory*
    2. *Sustained Attention & Vigilance*
    3. *Processing Speed & Neuromotor Kinetics*
    4. *Cognitive Stability & Load Resilience*
- **Explainable AI (SHAP)**:
  - TreeExplainer attribution breaking down exact positive contributors and task fatigue factors.
- **Executive Performance Reporting**:
  - LLM-powered narrative reports (Groq LLaMA 3.3 70B / Google Gemini Flash) with a 100% deterministic offline fallback.
  - Printable / Exportable PDF Clinical Profile.

---

## 🚀 Running NeuroNova

### Prerequisites:
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.12)

### 1. Start the Backend API (FastAPI)
```bash
cd backend
# Activate virtual environment
.\.venv\Scripts\activate   # Windows
# source .venv/bin/activate # macOS/Linux

# Start API server on port 8000
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start the Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🔑 Optional API Keys (Configured in `backend/.env`)

The system is designed with **100% zero-crash offline resilience** — it will run and calculate all scores and explanations locally even without any API keys. To enable live AI cloud features, add:

```env
# Optional: Groq for Whisper speech-to-text and ultra-fast LLaMA 3.3 narration
GROQ_API_KEY=your_groq_api_key_here

# Optional: Google Gemini 1.5 Flash for narrative reporting fallback
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🛡️ Privacy & Non-Diagnostic Disclosure

- **Edge Privacy Guarantee**: Raw webcam frames are processed exclusively in client browser memory via WebAssembly/GPU. No video files or images are ever transmitted over the network or saved to disk.
- **Functional Awareness**: NeuroNova evaluates functional performance indicators for cognitive wellness and research tracking. It does not provide medical diagnoses for ADHD, Autism, Dementia, or clinical psychiatric conditions.
