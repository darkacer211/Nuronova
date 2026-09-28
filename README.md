# NeuroNova — Multimodal Cognitive Screening & Clinical Analytics

> **Next-generation digital cognitive screening system with on-device edge vision, real-time acoustic phonation analysis, explainable AI (SHAP), psychometric screening batteries, and an experimental Attention Lab.**

---

## 🧠 System Overview

**NeuroNova** is an end-to-end cognitive screening and neuro-analytics platform designed to quantify functional cognitive efficiency, executive control, sustained vigilance, and adult/pediatric neurodivergent traits.

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
- **Cognitive Performance Index (CPI v1)**: Standardized normative composite (0–100 scale, Population Mean = 75.0, SD = 12.0) across 4 cognitive domains.
- **Adult & Pediatric Questionnaires**: ASRS-6, AQ-10, CAT-Q, M-CHAT-R/F, AQ-Child, RAADS-R (80 items), AQ-50, RBQ-2A, and Vanderbilt.

---

## ⚖️ Copyright & Licensing Architecture (Zero-Code Dynamic Text Loading)

All proprietary, licensed clinical instruments (M-CHAT-R/F, AQ-Child, RAADS-R, AQ-50, RBQ-2A, Vanderbilt) are held in the codebase with **clearly marked placeholders** (`[Item X Placeholder: ... - Licensed text required]`). No copyrighted question text is hardcoded or reconstructed from memory.

### Central Registry & CI Auditing
- Config file: `frontend/src/features/screening/config/licensing.config.js`.
- Tracks `status` (`'licensed'`, `'free-with-conditions'`, `'permission-pending'`), copyright notices, publisher contacts, and `textLoaded` flags.
- **Automated CI / Startup Check**:
  ```bash
  cd frontend
  npm run check:licensing
  ```
  Fails the build if an unlicensed instrument has `textLoaded: true` or contains unmasked question text.

### Supplying Authorized Item Bundles
Clinicians and researchers who hold valid licenses can supply official text with **zero code modifications**:
1. Click **"Supply Authorized Text"** or **"View Licensing"** on any instrument card.
2. Upload a JSON or CSV file containing item wording:
   ```json
   {
     "mchat": [
       { "number": 1, "text": "Official Question 1 wording here..." },
       { "number": 2, "text": "Official Question 2 wording here..." }
     ]
   }
   ```
   Or CSV format:
   ```csv
   instrumentId,number,text
   mchat,1,"Official Question 1 wording here..."
   mchat,2,"Official Question 2 wording here..."
   ```
3. The loader dynamically hydrates the questionnaire, flips `textLoaded` to `true`, and unlocks the screener immediately.

---

## 🗄️ Database Persistence & Privacy Architecture (Opt-In, Supabase / Swappable)

### 1. Anonymous Mode by Default
Health data must never sit in an unencrypted plaintext file.
- Plaintext `sessions_cache.json` has been **completely eliminated** and added to `.gitignore`.
- Persistence is **OFF by default** (`PERSISTENCE_ENABLED=false`). In default mode, all assessments run client-side in ephemeral memory; zero health data touches persistent storage.

### 2. Switching Database Backends
NeuroNova uses an abstract repository/adapter pattern (`BaseScreeningRepository`) in `backend/app/db/`:
- **Supabase (Managed PostgreSQL)**: Default production adapter with Row-Level Security (RLS) and built-in auth.
- **SQLite / Local Vault**: Development adapter with encrypted storage.

To enable Supabase persistence, configure `backend/.env`:
```env
PERSISTENCE_ENABLED=true
PERSISTENCE_BACKEND=supabase

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

ENCRYPTION_KEY=your-32-byte-hex-encryption-key
DATA_RETENTION_DAYS=90
```

### 3. Privacy & Compliance Features (HIPAA, COPPA, GDPR)
- **Field-Level Encryption at Rest**: Sensitive clinical notes and diagnostic details are encrypted using authenticated keystreams (PBKDF2-HMAC-SHA256 with random IVs and tamper tags).
- **COPPA Pediatric Safeguards**: Minors under 13 strictly require verified parental consent (`parental_consent_verified: true`); only pseudonymous IDs are stored—no personal identifiers.
- **GDPR Article 20 (Data Portability)**: Export patient data in machine-readable JSON via `GET /api/v1/patients/{id}/export`.
- **GDPR Article 17 (Right to Erasure)**: Purge patient records and all sessions via `DELETE /api/v1/patients/{id}`.
- **HIPAA § 164.312(b) Audit Trail**: Append-only log of every read, write, export, and delete operation via `GET /api/v1/audit-log`.

---

## 👁️ EXPERIMENTAL Gaze-Analysis Module ("Attention Lab")

### Purpose & Research Reference
Modeled on **Deng et al., "Detection of ADHD based on eye movements during natural viewing", ECML PKDD 2022** ([aeye-lab/ecml-ADHD](https://github.com/aeye-lab/ecml-ADHD)), the Attention Lab optionally captures voluntary webcam movement during a free-viewing task to derive descriptive attention metrics.

### Key Privacy & Architecture Guarantees:
1. **Voluntary Consent Gate**: Default OFF. Requires explicit user consent (and parental authorization for minors). The system works 100% without a camera.
2. **100% On-Device Processing**: Runs MediaPipe FaceLandmarker in browser WebAssembly. **RAW VIDEO IS NEVER STORED, RECORDED, OR TRANSMITTED.** Video frames are discarded in memory immediately after computing eye coordinates.
3. **5-Point Calibration & Quality Filter**: Measures gaze accuracy before viewing. If tracking quality is below 60% (due to poor lighting, distance change, or low FPS < 18), analysis is withheld rather than emitting unreliable figures.
4. **Royalty-Free Stimulus**: Uses a dynamic generative fluid motion canvas (avoiding third-party copyrighted movie trailers).
5. **Numerical Feature Extraction**: Resamples gaze to 30 Hz and runs I-VT velocity thresholding to compute:
   - *Off-screen gaze diversion percentage*
   - *Spatial dispersion radius*
   - *Mean and median fixation duration (ms)*
   - *Exploratory saccade rate (/min)*
   - *Spontaneous blink rate (/min)*
6. **Strict Output Rules**:
   - **Never labels anyone "ADHD" or "not ADHD"**.
   - Output consists solely of descriptive distributions with plain-language explanations.
   - **Gaze metrics NEVER modify or feed into clinical questionnaire scores or referral wording.**
   - Prominent notice: *"Experimental. Not a diagnostic tool. Webcam eye tracking is far less precise than clinical eye trackers."*

### Honest Hardware Validity Assessment
| Attribute | Clinical Research Trackers (SMI RED250 / EyeLink 1000) | Consumer Webcam (Browser / MediaPipe) |
| :--- | :--- | :--- |
| **Spatial Precision** | $\le 0.5^\circ$ visual angle (~$5\text{ mm}$ on screen) | $2.0^\circ - 4.5^\circ$ visual angle (~$20 - 45\text{ mm}$ on screen) |
| **Sampling Rate** | $120 - 1000\text{ Hz}$ | $15 - 30\text{ fps}$ |
| **Head Movement** | Restrained (chin rest) | Unconstrained; natural head motion introduces drift |
| **Scientific Verdict** | Valid for micro-saccades and high-frequency scanpaths. | Valid for **gross macro-attention** (off-screen looking, quadrant dwell, blink rate). **Not valid** as a drop-in substitute for research eye-tracker models without domain adaptation. |

---

## 🧪 Running Automated Test Suites

### 1. Frontend Test Suites
```bash
cd frontend

# CI Licensing Compliance Audit
npm run check:licensing

# Text Loader Unit Tests
node src/features/screening/engine/textLoader.test.js

# Extended Batteries Psychometric Scoring Tests (RAADS-R, AQ-50, RBQ-2A)
node src/features/screening/tests/extendedBatteries.test.js

# Attention Lab Gaze & Zero-Leakage Privacy Tests
node src/features/gaze/tests/gazeAnalysis.test.js
```

### 2. Backend Test Suites
```bash
cd backend

# Security, Persistence, Encryption, and GDPR Tests
.\.venv\Scripts\python.exe test_persistence.py

# Attention Lab Network Privacy & Zero-Frame Leakage Tests
.\.venv\Scripts\python.exe test_gaze_privacy.py
```

---

## 🚀 Getting Started Locally

### 1. Backend Server
```bash
cd backend
# Create and activate virtual environment (if not already set up)
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Development Server
```bash
# You can run directly from root or inside frontend/
npm run dev
# Or:
cd frontend
npm install
npm run dev
```

---

## ⚡ Deploying to Vercel (Zero-Config)

NeuroNova is pre-configured with root and nested `vercel.json` manifests for immediate, zero-friction deployment on [Vercel](https://vercel.com).

### Option A: Via Vercel Dashboard (Connected to GitHub)
1. Push this repository to your GitHub account (see [GitHub Setup](#-github-repository-setup) below).
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. **Project Settings:**
   - **Framework Preset:** Vite (automatically detected)
   - **Root Directory:** `./` (default) or `frontend`
   - **Build Command:** `npm run build` (auto-detected via root `vercel.json`)
   - **Output Directory:** `frontend/dist`
4. **Environment Variables (Optional):**
   - `VITE_API_URL`: Your cloud backend URL (e.g. `https://your-api.onrender.com`).  
     *Note:* If left blank or if backend is offline, NeuroNova seamlessly executes client-side fallback computations for CPI and SHAP attributions without crashing.
5. Click **Deploy**.

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy from repository root
vercel

# Production deployment
vercel --prod
```

---

## 🐙 GitHub Repository Setup & CI Workflow

### 1. Push to GitHub
```bash
# Stage all tracked files
git add .

# Commit changes
git commit -m "feat: complete NeuroNova AuDHD screening engine with pastel design and Vercel/GitHub CI"

# Add your GitHub remote (if not already linked)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git branch -M main
git push -u origin main
```

### 2. Automated GitHub Actions CI Pipeline
This repository includes a production-ready CI workflow in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) that automatically runs on every push and pull request to `main` and `master`:
- **Node.js 20 Setup with npm caching**
- **Clinical licensing & IP audit** (`npm run check:licensing`)
- **Code hygiene & fast linting** (`npm run lint` via Oxlint)
- **Production Vite bundle build** (`npm run build`)

