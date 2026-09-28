# NeuroNova: Cognitive Modernization & Adult AuDHD Self-Screening Implementation Plan

**Document Version:** 1.0  
**Project:** NeuroNova Cognitive Screening & Neuro-Analytics Suite  
**Target Date:** September 2026  

---

## 1. Executive Summary & Scope

This implementation plan covers two coordinated enhancements to the existing NeuroNova codebase without restructuring or scaffolding a new project:

1. **Cognitive Testing Suite Modernization:**
   - **Reaction Time:** Redesigned into the standardized HumanBenchmark visual test (Red "Wait for green", false-start detection, bright green flash, millisecond reaction timing over 5 rounds with average and best scores).
   - **Working Memory:** Letter N-back replaced by an interactive **Digit Span Memory Test** (HumanBenchmark style: sequential digit flashes, number-pad / keyboard recall, dynamic span progression).
   - **Verbal Phonation & Fluency:** Upgraded to explicitly display the **transcribed speech text**, recognized target vocabulary words (e.g. animals), speech rate (WPM), and pause ratios.
   - **Vision & Oculomotor Verification Card:** Dedicated dashboard telemetry showing spontaneous blink rate, gaze on-screen percentage, fixation dispersion, and head posture variance, with plain-language explanations demonstrating active camera analysis.
   - **Test-by-Test Diagnostics:** A clean, simplified card breaking down each test score, performance tier, and a brief explanation of what went well vs. what showed fatigue.

2. **Adult ADHD + Autism Self-Screening Module (`features/screening/`):**
   - A self-contained, data-driven, privacy-first module allowing adults (18+) to complete validated questionnaires (ASRS v1.1, AQ-10, CAT-Q, and stubs for RAADS-R, AQ-50, RBQ-2A).
   - Entirely client-side scoring with non-diagnostic, neurodiversity-affirming language.
   - Clean clinical printable/PDF export to share with healthcare professionals.

---

## 2. Detailed Technical Specifications

### 2.1 Reaction Time Test Redesign (HumanBenchmark Paradigm)
- **File:** `frontend/src/components/TaskPVT.jsx`
- **User Experience:**
  - **State 1 (Idle / Instructions):** Blue/slate panel: *"Click anywhere to begin."*
  - **State 2 (Waiting):** Screen turns red with text: *"Wait for green..."* (randomized delay between 2000ms and 5000ms).
  - **State 3 (Early Click / False Start):** If clicked before green, screen stays red with message: *"Too soon! Click to try again."*
  - **State 4 (Stimulus Active):** Screen instantly turns electric green (`#10b981`) with large bold text: *"CLICK!"*
  - **State 5 (Round Result):** Displays reaction latency (e.g., `242 ms`) and prompt to continue.
  - **Protocol:** 5 rounds total. Automatically computes **Average Reaction Time** and **Best Reaction Time**.

### 2.2 Digit Span Working Memory Test (Replacing Letter N-Back)
- **File:** `frontend/src/components/TaskDigitSpan.jsx`
- **User Experience:**
  - **Stimulus Phase:** Numbers flash sequentially on screen (1.0 second per digit, with a 300ms inter-digit blank).
  - **Recall Phase:** Screen presents an input field and on-screen numpad (1–9). User enters the sequence from memory.
  - **Progression Logic:**
    - Starts at Level 3 (3 digits).
    - If correct: Sequence length increments (+1 digit: 3 → 4 → 5... up to 9+ digits).
    - If incorrect: User receives a second attempt at the current level. Two consecutive failures conclude the test.
  - **Psychometric Output:** Peak Digit Span Score (e.g., `7 Digits - Above Average Working Memory Buffer`), accuracy percentage, and trial log.

### 2.3 Verbal Fluency Results & Transcription Display
- **File:** `frontend/src/components/TaskVerbal.jsx` & `frontend/src/components/Dashboard.jsx`
- **User Experience:**
  - After 25 seconds of continuous speech recording, the UI displays:
    - **Full Transcribed Text:** Exact words spoken during the trial.
    - **Categorized Target Words:** Highlighted recognized animals/items found in the transcript.
    - **Fluency Metrics:** Word count, Words Per Minute (WPM), speech pause ratio, and articulation pace.

### 2.4 Camera & Oculomotor Verification Card
- **File:** `frontend/src/components/Dashboard.jsx`
- **User Experience:**
  - A prominent **Vision & Oculomotor Biometrics Card** explicitly showing:
    - **Blink Rate & Fatigue Indicator:** (e.g., `18 blinks/min` — Normal baseline range 14–22 blinks/min. Explains whether eye strain or fatigue was detected).
    - **Gaze On-Screen Attention:** (e.g., `94.2% on-screen focus ratio` — indicates visual focus maintenance).
    - **Fixation Dispersion:** (gaze wander in pixels — indicates saccadic stability).
    - **Head Posture Steadiness:** (yaw/pitch variance in degrees).
    - **Contextual Note:** *"MediaPipe vision landmarker tracked 478 facial landmarks and iris positions locally on your device to quantify visual fatigue and focus stability."*

### 2.5 Test-by-Test Diagnostics Card
- **File:** `frontend/src/components/Dashboard.jsx`
- **User Experience:**
  - A clean, scannable grid with one card per cognitive test:
    - **Reaction Time:** Score in ms, benchmark comparison, notes on lapse count.
    - **Dual-Rule Stroop:** Congruent vs. incongruent RT, interference latency cost, cognitive flexibility index.
    - **Digit Span:** Maximum digit capacity reached, working memory tier.
    - **Verbal Phonation:** Lexical retrieval speed, pause frequency, transcription snippet.

---

## 3. Adult ADHD + Autism Self-Screening Architecture (`features/screening/`)

### 3.1 Directory Structure
All questionnaire logic and components will be isolated within `frontend/src/features/screening/`:

```
frontend/src/features/screening/
├── tests/
│   ├── asrs6.js                     # ASRS v1.1 6Q (ADHD Screener)
│   ├── aq10.js                      # AQ-10 Adult (Autism Screener)
│   ├── catq.js                      # CAT-Q (Camouflaging / Masking Questionnaire)
│   ├── stubs.js                     # Stubs for RAADS-R, AQ-50, RBQ-2A ("Coming Soon")
│   └── index.js                     # Test registry
├── engine/
│   ├── scorer.js                    # Generic client-side scoring logic
│   └── scorer.test.js               # Scoring unit tests
├── components/
│   ├── ScreeningHome.jsx            # Flow selector: Quick AuDHD, Extended, Single Test
│   ├── AgeGateModal.jsx             # 18+ confirmation modal
│   ├── QuestionRenderer.jsx         # Accessible questionnaire interface
│   └── ScreeningDisclaimer.jsx      # Non-diagnostic ethical disclaimer
├── results/
│   ├── InterpretationCard.jsx       # Plain-language results and subscale breakdowns
│   ├── ClinicalSummaryExport.jsx    # Printable summary report for clinicians
│   └── supportResources.js          # Configurable support and mental health resources
└── README.md                        # Documentation on questionnaires, scoring, and licensing
```

### 3.2 Questionnaires & Psychometric Scoring Specifications

#### 1. ASRS v1.1 6-Question Screener (ADHD)
- **Citation:** Kessler et al., 2005. *Psychological Medicine*, 35(2), 245–256.
- **Scale:** Never (0), Rarely (1), Sometimes (2), Often (3), Very Often (4).
- **Dual Scoring Implementation:**
  - **Method A (Part A Shaded-Box Criteria):**
    - Items 1–3: Positive if response is *Sometimes*, *Often*, or *Very Often*.
    - Items 4–6: Positive if response is *Often* or *Very Often*.
    - Threshold: **4 or more shaded-box endorsements** indicates traits consistent with Adult ADHD.
  - **Method B (Sum Score 0–24):** Sum of all items with configurable bands flagged for Harvard scoring updates.

#### 2. AQ-10 Adult (Autism Quick Screen)
- **Citation:** Allison et al., 2012. *Journal of the American Academy of Child & Adolescent Psychiatry*, 51(2), 202–212.
- **Scale:** Definitely Agree, Slightly Agree, Slightly Disagree, Definitely Disagree.
- **Binary Scoring:**
  - **Agree-Scored (Items 1, 7, 8, 10):** 1 point for *Definitely Agree* or *Slightly Agree*.
  - **Disagree-Scored (Items 2, 3, 4, 5, 6, 9):** 1 point for *Definitely Disagree* or *Slightly Disagree*.
  - **Threshold:** Score of **6 or higher** out of 10 suggests traits consistent with autism and warrants further clinical assessment.

#### 3. CAT-Q (Camouflaging Autistic Traits Questionnaire)
- **Citation:** Hull et al., 2018. *Journal of Autism and Developmental Disorders*, 49(3), 819–833.
- **Scale:** 7-point Likert scale (1 = Strongly Disagree to 7 = Strongly Agree).
- **Reverse Scoring:** Items 3, 12, 19, 22, 24 are reverse-scored ($8 - \text{score}$).
- **Subscales:**
  - **Compensation** (9 items, range 9–63)
  - **Masking** (8 items, range 8–56)
  - **Assimilation** (8 items, range 8–56)
- **Interpretation:** Total score 25–175. Scores of **~100+** indicate significant camouflaging/masking. Explicitly notes gender differences and social anxiety interactions.

#### 4. Stubs ("Coming Soon"):
- Config files for **RAADS-R**, **AQ-50**, and **RBQ-2A** with empty item arrays and clear licensing notes to maintain data-driven extensibility without copyright infringement.

### 3.3 User Flows & Safety Disclaimers
1. **Entry Points:**
   - **Quick AuDHD Screen:** ASRS-6 + AQ-10 (~5 minutes).
   - **Extended Screen:** ASRS-6 + AQ-10 + CAT-Q (~10 minutes).
   - **Individual Screen:** Select any single questionnaire.
2. **Age Gate:** 18+ confirmation required before loading questions.
3. **Data Privacy:** 100% client-side. No answers or scores transmitted to any server or saved to localStorage without explicit user consent.
4. **Language Guardrails:** Strictly uses neutral, neurodiversity-affirming phrasing (e.g., *"Traits consistent with..."* instead of diagnostic statements like *"You have..."*).
5. **Printable Clinician Summary:** Formatted for easy print-to-PDF to bring to a medical or psychiatric consultation.

---

## 4. Wiring & Navigation Changes

- **Navigation Header (`Header.jsx`):** Add a sleek tab switcher:
  - 🧠 **Cognitive Performance Suite** (Reaction Time, Stroop, Digit Span, Verbal Phonation)
  - 📋 **Adult AuDHD Screener** (ASRS-6, AQ-10, CAT-Q)
- **App State (`App.jsx`):** Maintains active view (`'cognitive'` or `'screening'`) without breaking existing workflows.

---

## 5. File Action Plan

| File | Action | Description |
|---|---|---|
| `frontend/src/components/TaskPVT.jsx` | **Modify** | Convert to HumanBenchmark 5-round reaction time test |
| `frontend/src/components/TaskDigitSpan.jsx` | **Create** | Digit span working memory test (replaces letter N-back) |
| `frontend/src/components/TaskVerbal.jsx` | **Modify** | Display transcribed words and target vocabulary matches |
| `frontend/src/components/Dashboard.jsx` | **Modify** | Add vision/blink telemetry card & test-by-test diagnostics |
| `frontend/src/App.jsx` | **Modify** | Integrate Digit Span into cognitive flow; add AuDHD view state |
| `frontend/src/components/Header.jsx` | **Modify** | Add mode toggle between Cognitive Suite and AuDHD Screener |
| `frontend/src/features/screening/tests/asrs6.js` | **Create** | ASRS v1.1 test configuration & dual scoring |
| `frontend/src/features/screening/tests/aq10.js` | **Create** | AQ-10 test configuration with binary key |
| `frontend/src/features/screening/tests/catq.js` | **Create** | CAT-Q test configuration with 3 subscales |
| `frontend/src/features/screening/tests/stubs.js` | **Create** | Coming-soon stubs for RAADS-R, AQ-50, RBQ-2A |
| `frontend/src/features/screening/tests/index.js` | **Create** | Screener registry |
| `frontend/src/features/screening/engine/scorer.js` | **Create** | Generic questionnaire scoring engine |
| `frontend/src/features/screening/engine/scorer.test.js` | **Create** | Unit tests for scoring logic & edge cases |
| `frontend/src/features/screening/components/ScreeningHome.jsx` | **Create** | Flow selection screen |
| `frontend/src/features/screening/components/AgeGateModal.jsx` | **Create** | 18+ confirmation dialog |
| `frontend/src/features/screening/components/QuestionRenderer.jsx` | **Create** | Accessible survey question card with keyboard controls |
| `frontend/src/features/screening/components/ScreeningDisclaimer.jsx` | **Create** | Persistent non-diagnostic disclaimer |
| `frontend/src/features/screening/results/InterpretationCard.jsx` | **Create** | Plain-language results and subscale display |
| `frontend/src/features/screening/results/ClinicalSummaryExport.jsx` | **Create** | Print/PDF summary for healthcare providers |
| `frontend/src/features/screening/results/supportResources.js` | **Create** | International support resources |
| `frontend/src/features/screening/README.md` | **Create** | Documentation and instrument license notices |

---

## 6. Review & Approval

Please review this implementation plan. You can indicate any specific changes, adjustments, or additions you would like to make to:
- Test parameters (e.g. number of trials or digit progression)
- Visual styling or UI layout
- Questionnaire scoring or flow options

Once you provide your feedback or approval, implementation will begin immediately.
