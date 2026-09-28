# Cognitive Screening System: One-Day Build Plan

*Researched 28 Sep 2026. Free-tier limits change often, so check each dashboard before relying on a number.*

## 1. Decisions (what to use, what to cut)

| Layer | Use | Why | Cost |
|---|---|---|---|
| Frontend | React + Vite + Tailwind + Recharts | Fast to scaffold; drop Chart.js (one chart lib is enough) | Free |
| Gaze / blink / head pose | MediaPipe Face Landmarker (`@mediapipe/tasks-vision`), runs in browser | Gives 478 landmarks incl. iris, 52 blendshapes (incl. eyeBlink), and a face transform matrix. No server needed, which supports your privacy claim | Free |
| Speech to text | Groq `whisper-large-v3-turbo` | Free tier, about 20 req/min, 2,000 req/day, about 8 h audio/day, OpenAI-compatible SDK | Free (API key from console.groq.com) |
| Audio features | Browser Web Audio (RMS energy, pauses) + Librosa in the backend for pitch | Speech rate = Whisper word count / duration | Free |
| Backend | **One** FastAPI (Python) service | Your synopsis says Node *and* Python; merging them saves hours. Scikit-learn and SHAP are Python anyway | Free (Render free tier) |
| ML | Scikit-learn (weighted composite + GradientBoosting/Ridge calibrated on pilot data) | See section 4 on the labels problem | Free |
| XAI | SHAP (TreeExplainer or linear) | Drop LIME; SHAP alone satisfies the objective | Free |
| Report narration LLM | **Groq `openai/gpt-oss-120b` or `llama-3.3-70b-versatile`** (primary), **Gemini Flash** via AI Studio (fallback) | Groq is OpenAI-compatible and fast. Gemini's free tier is Flash-only since May 2026 | Free |
| Auth + DB | Firebase Auth + Firestore (Spark plan) | Drop MongoDB; two databases add work and no value | Free |
| Hosting | Vercel (frontend) + Render (API) | Push-to-deploy | Free |
| Drop entirely | TensorFlow/PyTorch, Docker, LIME, Node/Express, MongoDB, RL engine | Not achievable in a day. Use a rule-based adaptive staircase and describe it as "RL-inspired" | n/a |

**API keys to create (about 10 minutes):**
1. Groq: console.groq.com → API Keys (Whisper + LLM).
2. Google AI Studio: aistudio.google.com → Get API key (Gemini fallback).
3. Firebase: console.firebase.google.com → new project → enable Authentication (Email + Google) and Firestore → copy the web config.
4. Vercel and Render accounts (GitHub login).

Keep keys in `.env` files. Call Groq/Gemini **only from the FastAPI backend**, never from the browser.

## 2. Privacy design (matches your synopsis)

- Video never leaves the browser. MediaPipe runs client-side and only derived numbers (gaze dispersion, blink rate, head-movement variance) are sent.
- Audio is sent to Groq for transcription. Say this clearly in the consent screen, or use in-browser Whisper (transformers.js) as an "edge" option if time permits.
- Send the LLM **only aggregated scores**, never raw data or names. Gemini's free tier may use inputs to improve Google products.
- Store a hashed user ID, not name or email, alongside session data.

## 3. Architecture

```
Browser (React)
 ├─ Tasks: N-back, Stroop, Reaction Time, Sustained Attention (PVT-style)
 ├─ MediaPipe → gaze/blink/head features (per 100 ms)
 ├─ Web Audio → energy/pause features; MediaRecorder → 10-30 s clip
 └─ Interaction logger: RT, accuracy, keystroke/mouse timing
        │ JSON of aggregated features per task
        ▼
FastAPI
 ├─ /transcribe → Groq Whisper → speech rate, hesitations
 ├─ /score      → feature vector → CPI + domain scores + SHAP
 ├─ /adapt      → next difficulty (staircase)
 └─ /report     → LLM narrative from scores + SHAP
        ▼
Firestore (sessions) → Dashboard (Recharts trends, SHAP bars, report)
```

## 4. CPI: the important honest part

You have no labelled cognitive dataset, so a "trained" model cannot be validated today. Do this instead:

1. **CPI v1 (rule-based, defensible):** z-score each metric against a baseline, then combine with weights, e.g. Attention 35% (RT variability, lapses, gaze on-screen ratio), Working memory 35% (N-back d-prime), Processing/executive 20% (Stroop interference cost), Cognitive load 10% (blink rate, pupil/gaze dispersion, speech pauses). Scale to 0-100.
2. **Baselines:** use published norms where available and collect 10-20 classmates as pilot data (your Phase 4 already plans this).
3. **ML layer:** train a Ridge or GradientBoosting model to predict CPI v1 from raw features on synthetic plus pilot data. Its purpose is demonstrating the pipeline and SHAP, not clinical prediction.
4. **Wording:** describe outputs as "performance indicators for awareness". Do **not** claim the system detects ASD, ADHD, anxiety or depression. Your own scope section says it is not diagnostic, so the objectives list should be softened to match.

## 5. Adaptive engine (rule-based, 30 minutes)

- N-back: start at 1-back. Two correct blocks (>=80% accuracy) then N+1. Two poor blocks (<60%) then N-1. Clamp to 1-4.
- Stroop: vary congruent ratio and stimulus time (1500 ms down to 800 ms).
- Reaction time: vary random inter-stimulus interval.

## 6. Build order (about 10-12 hours)

| # | Task | Tool | Time |
|---|---|---|---|
| 1 | Scaffold Vite + Tailwind, routes, Firebase Auth, consent + permission screen | Cursor | 1 h |
| 2 | Four task components with an interaction logger hook | Cursor | 2 h |
| 3 | `useGazeTracker` hook (MediaPipe): blink from blendshapes, gaze from iris landmarks relative to eye corners, head pose from transform matrix | Antigravity | 1.5 h |
| 4 | Audio capture + FastAPI `/transcribe` (Groq) | Antigravity | 1 h |
| 5 | FastAPI `/score` with CPI v1 + sklearn model + SHAP | Antigravity | 2 h |
| 6 | Adaptive engine | Cursor | 0.5 h |
| 7 | Dashboard (radar of domains, trend line, SHAP bar) + `/report` LLM | Cursor | 2 h |
| 8 | Deploy, end-to-end test on 3 devices, screenshots for report | Both | 1.5 h |

**Tool-split tip:** Cursor's free Hobby plan has limited agent requests on the Auto model, and Antigravity's free quota resets weekly and Google reserves the right to change it. Spread the work across both so one quota doesn't run out mid-day. Use each for what it is good at: Antigravity for backend/ML/agentic multi-file work, Cursor for UI iteration. Check the model selector in each app to see which models your account actually has.

## 7. Prompts to paste

**Cursor #1 (scaffold):**
> Create a Vite + React + Tailwind app "Cognitive Screening System". Firebase Auth (email + Google), protected routes, a consent screen explaining that video is processed locally and audio is sent for transcription, and a camera/mic permission screen with retry on denial. Routes: /login, /consent, /tasks, /dashboard. Use env vars for Firebase config.

**Cursor #2 (tasks):**
> Build N-back (1-4, letters, 2 s stimulus), Stroop (color-word, keyboard response), Reaction Time (random 1-5 s delay), and Sustained Attention (500 ms stimuli over 90 s). Each task takes a `difficulty` prop and returns `{accuracy, meanRT, rtSD, lapses, dPrime}` through an `onComplete` callback. Log every response with timestamps in a `useInteractionLogger` hook (keydown latency, mouse path jitter).

**Antigravity #1 (gaze):**
> Write a `useGazeTracker` React hook using @mediapipe/tasks-vision FaceLandmarker (VIDEO mode, blendshapes and transform matrix enabled, GPU delegate, load wasm from jsdelivr). Every frame compute: blink events from eyeBlinkLeft/Right (>0.5 threshold), iris-center offset relative to eye corners for gaze x/y, on-screen ratio, head yaw/pitch from the transform matrix. Expose `getSummary()` returning blink rate/min, gaze dispersion, fixation-like stability, head-movement variance, face-lost ratio. Never send video frames anywhere.

**Antigravity #2 (backend):**
> Create a FastAPI app with endpoints /transcribe (accepts audio, calls Groq whisper-large-v3-turbo, returns transcript, words per minute, hesitation count), /score (feature JSON in; CPI 0-100, four domain scores, SHAP contributions out), /adapt, /report (Groq gpt-oss-120b writes a plain-language summary from scores and SHAP only; fall back to Gemini Flash on 429). CPI v1 is a weighted z-score composite; also train a sklearn GradientBoostingRegressor on synthetic data generated around plausible ranges and use shap.TreeExplainer. Add CORS, .env loading and a Dockerless Render start command.

## 8. Risks and fixes

- **Free-tier 429s:** wrap LLM calls with retry and fallback (Groq to Gemini to a templated text report).
- **Gaze accuracy:** webcam gaze is coarse. Do a 5-point calibration screen and report "attention on screen" rather than exact fixation points.
- **Lighting/glasses:** show a face-quality check before starting.
- **Time overrun:** if behind, ship tasks + CPI + dashboard first, add speech last.

## 9. Fixes to make in your synopsis document

- Page XVI ends with a stray line ("There. Clean, structured, and sounds like you actually knew what you were doing all along.") that was pasted in from an AI chat. Delete it before submitting.
- Section 1 says "T.E." and "2023-2027", while the cover says 2025-2026 and the timeline runs to Sem VIII. Make these consistent.
- Section 6.3 says "A Python backend (Node.js/Express.js...)". Pick FastAPI and update it, along with the software table (remove MongoDB, LIME, TensorFlow if you follow section 1).
- The title on page XV reads "10.1 Block Diagram10.2 System Flowchart". Add a space or line break.
- The Lumsden reference (ref [2]) and Fehr (ref [8]) could not be verified as real papers. Check them, and replace with sources you can actually open (e.g., the CANTAB documentation, and MediaPipe/Whisper/SHAP papers, which are real).
