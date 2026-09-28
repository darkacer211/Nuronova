# NeuroNova: Complete UI Elements & Screen Specification for Stitch

> **Design System Context:**  
> **Product:** NeuroNova — Multimodal Cognitive Neuro-Analytics & Dual-Track AuDHD Screening  
> **Design Language:** Ultra-Modern Clinical Glassmorphism, Deep Dark Mode, Radiant Cyan & Violet Glows, High-Legibility Monospace Telemetry, Zero-Placeholder Real Interactions.

---

## 1. Global Design System Tokens

### 1.1 Color Palette
- **Background Root:** `#030712` (Ultra-deep cosmic slate)
- **Glass Panel Surface:** `rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(16px)`
- **Glass Borders:** `1px solid rgba(255, 255, 255, 0.08)`
- **Interactive Surface (Hover):** `rgba(255, 255, 255, 0.05)`
- **Primary Accent (Cyan):** `#06b6d4` / Glow: `#22d3ee` (Used for Cognitive Telemetry, Speed, Gaze)
- **Secondary Accent (Violet):** `#8b5cf6` / Glow: `#a78bfa` (Used for Behavioral Screening, AuDHD, Pediatric)
- **Positive / Optimal (Emerald):** `#10b981` / Glow: `#34d399` (Top benchmark norms, verified, negative screen)
- **Caution / Warning (Amber):** `#f59e0b` / Glow: `#fbbf24` (Medium risk, fatigue, non-diagnostic disclaimers)
- **Negative / Latency Drag (Rose):** `#f43f5e` / Glow: `#fb7185` (Misses, elevated risk, inhibitory friction)
- **Typography:**
  - **Headings & Body:** Modern Sans (`Outfit`, `Inter`, or `Plus Jakarta Sans`)
  - **Metrics, Timers & Telemetry:** Monospace (`JetBrains Mono`, `Fira Code`, or `Space Mono`)

---

## 2. Global Layout & Fixed Elements

### 2.1 Header Bar (`Header`)
- **Brand Identity:**
  - Logo icon: Glowing Brain glyph (`#06b6d4` to `#8b5cf6` gradient).
  - Main Title: `NeuroNova` (Bold, letter-spacing `-0.02em`).
  - Subtitle Tagline: `COGNITIVE NEURO-ANALYTICS & SCREENING`.
  - Protocol Badge: `Unified Protocol: Cognitive Reflexes • Memory • Speech • AuDHD Traits`.
- **Live Status Telemetry Pills:**
  - `Privacy Guard`: ShieldCheck icon + Emerald glow (`Client-Side WASM`).
  - `Oculomotor Gaze`: Eye icon + dynamic state (`Standby`, `Tracking`, `Averted`, `Blink`).
  - `Phonation Audio`: Mic icon + dynamic state (`Standby`, `Recording`, `Calibrated`).
- **Global Actions:**
  - `Reset Session` button (RotateCcw icon, resets telemetry & returns to preflight).

### 2.2 Persistent Sensor Feed (Picture-in-Picture)
- Floating mini-video viewport (`150px × 112px`) docked at bottom-right or top-right.
- Active on all task steps; hidden on `dashboard` and `preflight`.
- Real-time MediaPipe face mesh landmarks overlay (discrete points).
- Privacy overlay watermark: `Local RAM Processing — No Video Uploaded`.

### 2.3 Diagnostic Recovery Overlay (`ErrorBoundary`)
- Centered glass card with alert icon (`#f43f5e`).
- Title: `Evaluation Screen Recovery`.
- Monospace error readout box.
- Actions: `Recover & Continue` (btn-primary), `Reload Application` (btn-secondary).

---

## 3. Screen 1: Pre-Flight Diagnostic & Pathway Selector

### Elements & Inputs:
1. **Hero Header:**
   - Badges: `NeuroNova Diagnostics` (Cyan) + `Clinical-Grade Architecture` (Violet).
   - Title: `Select Your Screening Pathway`.
   - Subtitle: Age-validated screening track selection.
2. **Pathway Selection Cards (2-Column Grid):**
   - **Card A: Adults & Youth (16+) — Comprehensive Battery**
     - User icon, time estimate (`~8–10 mins`), badge `Comprehensive Battery`.
     - Description: Computer reflex tasks (PVT, Stroop, Digit Span, Verbal Fluency) + Adult AuDHD Questionnaires (ASRS-6 & AQ-10).
     - Radio select indicator / active glowing border.
   - **Card B: Toddlers (16–30m) — Pediatric Milestone Screener**
     - Baby icon, time estimate (`~5 mins`), badge `16–30 Months`.
     - Description: Direct parent-assisted M-CHAT-R/F observation (bypasses laptop reflex tests).
     - Child Nickname input field (`Leo (optional)`).
3. **Hardware Sensor Diagnostic Deck:**
   - **Camera Diagnostic Card:**
     - Video preview box (`640x480` ratio) with face-detection boundary box.
     - Status badge: `Camera Active` (Emerald) or `Camera Required` (Amber).
     - Action button: `Enable Camera & Gaze Tracker`.
     - Note: Local MediaPipe WASM processing guarantee.
   - **Microphone Diagnostic Card:**
     - Dynamic audio frequency visualizer bar (green/cyan meter).
     - Status badge: `Microphone Ready` (Emerald) or `Microphone Test` (Amber).
     - Action button: `Test Microphone Level`.
4. **Consent & Launch Footer:**
   - Checkbox: `Participant Consent: I understand this test measures reaction kinetics, oculomotor gaze stability, and executive performance for cognitive awareness. It is non-diagnostic.`
   - Primary CTA: `Begin Full Assessment` (ArrowRight icon) or `Launch M-CHAT-R/F Questionnaire`.

---

## 4. Screen 2: Task 1 — Psychomotor Vigilance Task (PVT Reaction Time)

### Elements & Interaction:
1. **Task Header:**
   - Badge: `Task 1 of 4` + `Visual Reaction Velocity (PVT)`.
   - Round tracker: `Round X of 5`.
2. **Main Reaction Arena (Full Interactive Canvas):**
   - **State 1: Waiting (`#1e1b4b` Deep Blue / Red glow):**
     - Pulsing circle indicator.
     - Instruction: `Wait for GREEN...`
     - Subtext: `Click as soon as the screen flashes green. Random delay 2–5s.`
   - **State 2: Active Stimulus (`#10b981` Emerald Glow Flash):**
     - Full area flashes bright green.
     - Urgent label: `CLICK NOW!`
   - **State 3: Early False Start (`#f59e0b` Amber):**
     - Alert icon.
     - Warning: `Too Soon! Wait for the green flash before clicking.`
     - Button: `Try Round Again`.
   - **State 4: Single-Round Result:**
     - Latency readout in big monospace: `228 ms`.
     - Benchmark descriptor: `Top 15% Reflex Velocity`.
     - Button: `Next Round (Round X+1)`.
3. **Trial History Strip:**
   - 5 chip slots displaying completed latencies: `[R1: 234ms] [R2: 219ms] [R3: 245ms] [R4: --] [R5: --]`.

---

## 5. Screen 3: Task 2 — Dual-Rule Executive Stroop Inhibition

### Elements & Interaction:
1. **Task Header:**
   - Badge: `Task 2 of 4` + `Executive Inhibitory Control`.
   - Trial progress: `Trial X of 12`.
2. **Current Stimulus Arena:**
   - Big centered text stimulus (e.g. Word `"RED"` rendered in vivid **BLUE** ink).
   - High-contrast background with subtle particle backdrop.
3. **Dual-Rule Instruction Pill:**
   - Clear banner: `RULE: Identify the INK COLOR. Inhibit reading the text.`
4. **Speed Pressure Countdown Bar:**
   - Dynamic progress bar showing remaining presentation window (750ms to 1600ms adaptive staircase).
5. **Interactive Response Buttons (Keyboard & Touch):**
   - 4 color keys:
     - `[D] RED` (Red outline & glow)
     - `[F] GREEN` (Green outline & glow)
     - `[J] BLUE` (Blue outline & glow)
     - `[K] YELLOW` (Yellow outline & glow)
6. **Instant Feedback Flash Chip:**
   - Correct: `✓ Correct (485 ms)` (Emerald)
   - Miss: `✗ Miss! Ink color was Blue` (Rose)
   - Timeout: `⏱ Time Expired!` (Amber)

---

## 6. Screen 4: Task 3 — Digit Span Working Memory

### Elements & Interaction:
1. **Task Header:**
   - Badge: `Task 3 of 4` + `Working Memory Sequential Buffer`.
   - Level indicator: `Level X — X Digits`.
   - Strike indicator: 2 strike dots (`● ○`).
2. **Interactive Phases:**
   - **Phase A: Presentation Phase:**
     - Glowing single-digit flash at center screen (`1 digit every 900ms`).
     - Progress dots underneath showing digits displayed so far.
   - **Phase B: Recall Phase:**
     - Instruction: `Enter the digits in the exact order shown:`
     - Digit display boxes (e.g. `[ 7 ] [ 4 ] [ 9 ] [ _ ] [ _ ]`).
     - Numeric touch keypad (0–9, Clear, Backspace, Submit).
     - Physical keyboard number support.
3. **Normative Benchmark Bar:**
   - Miller's Law baseline marker: `Normal adult buffer: 7 ± 2 digits`.

---

## 7. Screen 5: Task 4 — Verbal Fluency & Speech Acoustics

### Elements & Interaction:
1. **Task Header:**
   - Badge: `Task 4 of 4` + `Verbal Fluency & Phonation Stability`.
   - Circular countdown clock: `25s remaining` (decreasing radial SVG ring).
2. **Prompt & Instructions:**
   - Prompt Hero: `Name as many ANIMALS as you can out loud.`
   - Rule guidance: `Speak clearly into your microphone. Any animal qualifies (mammals, birds, reptiles, fish).`
3. **Live Speech Capture Arena:**
   - Animated glowing microphone pulse ring reacting to sound amplitude.
   - Live Web Speech transcript bubble: real-time words appearing as spoken.
   - Live Volume & Pause ratio indicator bar.
4. **Post-Recording Review & Semantic Tagging Screen:**
   - Banner: `Transcription Complete — Verify Recognized Animals`.
   - Extracted Animal Chips with dismiss button:
     - `[ ✓ Elephant × ] [ ✓ Lion × ] [ ✓ Tiger × ] [ ✓ Zebra × ]`
   - Manual missing animal input field:
     - Input: `e.g. giraffe` + Button: `+ Add Animal`.
   - Summary stat metrics row:
     - `Total Words Generated`: `14`
     - `Speech Velocity`: `135 WPM`
     - `Acoustic Pause Ratio`: `18%`
   - Action CTA: `Submit & Proceed to Screening Router` (ArrowRight).

---

## 8. Screen 6: Age & Participant Adaptive Router Modal

### Elements & Interaction:
1. **Header Panel:**
   - Badges: `Part 2 of 2: Behavioral Screener` + `100% Client-Side Private`.
   - Title: `Age & Participant Adaptive Router`.
   - Subtitle: Route to appropriate standardized self-report or parent-report questionnaires.
2. **Choice Grid (Adult vs Child):**
   - **Option 1: Myself (Adult 18+ — Self-Report)**
     - User icon, title: `Adult Self-Report`.
     - Description: Standard ASRS-6 (ADHD) + AQ-10 (Autism) pairing.
   - **Option 2: My Child / Dependent (Parent-Assisted)**
     - Baby icon, title: `Child / Toddler`.
     - Sub-Option Radios:
       - `Toddler: 16 to 30 months (M-CHAT-R/F milestone screening)`
       - `Older Child: Roughly 4 to 15 years (AQ-Child guidance)`
     - Child nickname input.
3. **Navigation Options:**
   - Primary: `Proceed to Behavioral Questionnaire`.
   - Secondary / Skip: `Skip Behavioral Screening (Proceed to Cognitive Profile Only)`.

---

## 9. Screen 7: Standardized Behavioral Questionnaire (`QuestionRenderer`)

### Elements & Interaction:
1. **Header & Progress:**
   - Test shortname badge: `ASRS-v1.1`, `AQ-10`, `CAT-Q`, or `M-CHAT-R/F`.
   - Subscale pill: `Compensation`, `Masking`, `Inattention`, etc.
   - Question counter: `Question X of Y`.
   - Linear gradient progress bar (`0% → 100%`).
2. **Question Card:**
   - Large, clear question text with high readability.
   - Context examples in subtle parentheses.
3. **Scale Options Grid:**
   - **For 5-point Likert (ASRS):**
     - `[1] Never` • `[2] Rarely` • `[3] Sometimes` • `[4] Often` • `[5] Very Often`
     - Shaded-box clinical indicator tag on qualifying boxes.
   - **For 4-point Likert (AQ-10):**
     - `[1] Definitely Agree` • `[2] Slightly Agree` • `[3] Slightly Disagree` • `[4] Definitely Disagree`
   - **For 7-point Likert (CAT-Q):**
     - `[1] Strongly Disagree` through `[7] Strongly Agree`
   - **For Binary (M-CHAT-R/F):**
     - `[ YES ]` (Emerald border) vs `[ NO ]` (Amber border)
   - Keyboard shortcut numbers `[1] - [7]` indicated inside each button.
4. **Navigation Controls:**
   - `Previous Question` (ArrowLeft).
   - `Next Question` / `Complete Questionnaire` (ArrowRight).
   - `Cancel / Back to Dashboard`.

---

## 10. Screen 7b: M-CHAT-R/F Follow-Up Clarification (`MChatFollowUp`)

### Elements:
- Header: `M-CHAT-R/F Structured Follow-Up Clarification`.
- Item tracker: `Flagged Item X of Total Flagged`.
- Callout: Initial at-risk parent response highlight.
- Clarification scenario card:
  - `Does your child perform this behavior spontaneously, independently, and across different environments?`
- Dual Action buttons:
  - `Yes, they frequently do this normally (Behavior resolved / Not at-risk)` (Emerald check).
  - `No, they rarely or never do this, or only with extensive prompting (Concern confirmed)` (Rose alert).

---

## 11. Screen 8: Multi-Modal Analyzing Transition Screen

### Elements:
- Dual-orbital glowing spinner animation (`@keyframes spin`).
- Activity icon glowing at the center.
- Title: `Synthesizing Multi-Modal Diagnostics`.
- Dynamic status message ticker:
  - `Aggregating on-device sensor telemetry...`
  - `Extracting oculomotor dispersion & blink kinetics...`
  - `Computing Cognitive Performance Index (CPI) & SHAP attributions...`

---

## 12. Screen 9: Final Comprehensive Diagnostic Profile (`Dashboard`)

### Section Breakdown & Elements:

#### 12.1 Header & Export Bar
- Title: `NeuroNova Comprehensive Diagnostic Profile` (or `Pediatric Milestone Screening Report`).
- Badges: `Verified Screening Battery`, `Session ID: sess_xxxx`, `Adult / Pediatric Track`.
- Actions:
  - `Print / PDF Report` button (Printer / Download icon).
  - `New Assessment` button (RotateCcw icon).

#### 12.2 View Filter Navigation Tabs
- Pill buttons: `Complete Overview` | `Cognitive Test Results` | `Camera & Vision Telemetry` | `AuDHD Behavioral Screener` | `AI Explanations & Action Plan`.

#### 12.3 Hero Scorecard (Adult Cognitive CPI vs Pediatric Milestone)
- **Adult Track:**
  - Giant Monospace CPI Score: `84 / 100` with gradient text glow.
  - Classification Pill: `Optimal Neuro-Cognitive Function` (Emerald) / `Solid Average` (Cyan) / `Moderate Strain` (Amber).
  - Percentile rank pill: `88th Percentile Rank`.
  - 95% Confidence Interval: `95% CI: [81.5 – 86.5]`.
  - Population baseline marker: `Population Mean: 75.0 (SD=12)`.
  - 4 Core Domains Progress Bars:
    - Executive Function & Working Memory (`X / 100`)
    - Sustained Attention & Vigilance (`X / 100`)
    - Processing Speed & Motor Kinetics (`X / 100`)
    - Cognitive Stability & Stress Buffer (`X / 100`)
  - Radar Spider Chart (Recharts) mapping the 4 domains in a polygon against a 100-point perimeter.
- **Pediatric Track:**
  - Total Milestone Score: `X / 20`.
  - Risk Tier Badge: `Low Risk` (Emerald), `Medium Risk` (Amber), `High Risk` (Rose).
  - Milestone summary statement.

#### 12.4 Cognitive Test Detail Cards (2-Column Grid)
- **Card 1: PVT Reaction Time:**
  - Large Mean RT: `238 ms` (Top 15% Benchmark).
  - Lapses counter: `0 lapses (>500ms)`.
  - 5-Trial round chips: `[R1: 230ms] [R2: 240ms] [R3: 235ms] ...`.
  - Clinical outcome interpretation text.
- **Card 2: Stroop Executive Inhibition:**
  - Interference Cost: `+108 ms`.
  - Accuracy: `95%`.
  - Congruent vs Incongruent RT breakdown.
  - Prefrontal inhibitory control interpretation.
- **Card 3: Digit Span Memory:**
  - Max Capacity: `7 Digits`.
  - Rounds passed: `6`.
  - Miller's Law baseline comparison (`7 ± 2`).
  - Phonological buffer interpretation.
- **Card 4: Verbal Fluency & Speech:**
  - Speech velocity: `135 WPM`.
  - Word count: `14 words`.
  - Pause ratio: `16%`.
  - Full speech transcript quote block.
  - Recognized category animal chips list.

#### 12.5 Vision & Oculomotor Telemetry Card
- 4-tile biometric grid:
  - `Gaze On-Screen Focus Ratio`: `94.2%` (Normative > 90%).
  - `Spontaneous Blink Rate`: `18.2 / min` (Fatigue indicator).
  - `Fixation Dispersion (Iris Jitter)`: `41.5 px`.
  - `Head Pose Stability (Yaw Variance)`: `3.2°`.
- Privacy Guarantee Callout Box: `All video telemetry extracted via local WebAssembly in client RAM. No video feeds or images were ever stored or uploaded.`

#### 12.6 AuDHD Behavioral Screening Findings Section
- Rendered card for each completed questionnaire (`ASRS-6`, `AQ-10`, `CAT-Q`, `M-CHAT-R/F`):
  - Condition badge (`ADHD Screener`, `Autism Screener`, `Camouflaging`).
  - Quantitative score badge (e.g. `4 / 6 Criteria Endorsed (Positive Screen)`).
  - Headline outcome banner (`Elevated ADHD Symptoms Reported`).
  - Summary paragraph.
  - Subscale distribution cards (e.g. `Compensation: 42/63`, `Masking: 38/56`, `Assimilation: 35/56`) with percentage progress bars.
  - Clinical guidance recommendation box.

#### 12.7 Explainable AI (SHAP) Biomarker Attribution Waterfall
- Legend: `Performance Booster (+)` (Emerald) vs `Cognitive Drag / Latency (-)` (Rose).
- Horizontal impact bar cards:
  - Feature name (e.g. `Visual Reaction Velocity`, `Working Memory Digit Span`, `Oculomotor Focus Stability`).
  - Plain-language explanation of impact on CPI.
  - Impact badge: `+5.6 pts` (Emerald) or `-2.4 pts` (Rose).
  - Proportional visual fill bar.

#### 12.8 Executive Narrative, Strengths & Action Plan
- Executive narrative summary block.
- 2-Column Insight Grid:
  - `Demonstrated Cognitive Strengths` (Bulleted list with TrendingUp icon).
  - `Observed Friction & Fatigue Patterns` (Bulleted list with AlertCircle icon).
- `Actionable Evidence-Based Recommendations`:
  - 20-20-20 visual rest rule.
  - Dual-task sensory conflict resolution exercises.
  - External working memory scaffolds and reminders.
- `Non-Diagnostic Disclaimer Box`:
  - Amber border + warning icon: Explains that NeuroNova is an automated psychometric awareness screener, not a clinical medical diagnosis.

---

## 13. Ready-To-Use Stitch Prompt Template (Option A: Cyber-Clinical Dark Mode)

```markdown
Generate a modern, clinical-grade web application UI called "NeuroNova — Cognitive Neuro-Analytics & AuDHD Screening".

Aesthetics:
- Ultra-dark theme (#030712 background, dark slate cards rgba(15,23,42,0.7) with glassmorphism and subtle 1px border #ffffff15).
- Neon accents: Cyan (#06b6d4) for cognitive telemetry, Violet (#8b5cf6) for AuDHD screening, Emerald (#10b981) for optimal metrics, Amber (#f59e0b) for warnings, Rose (#f43f5e) for friction.
- Typography: Sans-serif (Inter/Outfit) for text, Monospace (JetBrains Mono) for numbers, milliseconds, and scores.

Pages/Views to design:
1. Top Navigation Bar: Brand logo, live status badges (Privacy Guard, Gaze Tracking, Mic Phonation), and Session Reset button.
2. Preflight Screening Selector: Dual cards for Adult Comprehensive Battery vs Toddler M-CHAT-R/F Screener, camera/mic preview tests, consent checkbox, and Begin CTA.
3. PVT Reaction Arena: Fullscreen reaction test with Waiting (Blue/Red pulse), Green flash (Click Now!), millisecond readout, and round history chips.
4. Stroop Inhibition Task: Word color conflict card, color response buttons [D] Red, [F] Green, [J] Blue, [K] Yellow, adaptive speed bar, and instant feedback flash.
5. Digit Span Memory: Sequential digit flash animation, numeric keypad for recall, level indicator, and strike tracker.
6. Verbal Fluency Task: 25-second countdown ring, animated audio wave visualizer, live spoken transcript bubble, and animal tag verification chips.
7. Age & Participant Router Modal: Adult vs Child selector with toddler/older-child sub-options.
8. Questionnaire Interface: Standardized questions with Likert scale chips (1-5 or 1-7), progress bar, subscale tags, and next/prev buttons.
9. Diagnostic Dashboard:
   - Giant CPI Score ring/number (e.g. 84/100) with percentile rank and 95% confidence interval.
   - 4 domain progress bars and Radar Spider Chart.
   - 4 cognitive task result cards with trials, reaction time, interference cost, and digit span.
   - Vision & Oculomotor card (gaze on-screen %, blink rate, iris dispersion).
   - AuDHD screener outcome cards with score cutoff and subscale bars.
   - SHAP biomarker attribution waterfall with positive green and negative red impact bars.
   - Executive narrative, strengths vs fatigue list, and clinical recommendation action items.
```

---

## 14. Alternative Theme Specification: Sensory-Friendly Calming Pastel (Option B)

### 14.1 Why Pastel is Clinically Superior for AuDHD & Cognitive Screening
1. **Sensory De-escalation & Photophobia Relief:** Autistic and ADHD participants frequently experience visual hypersensitivity (sensory overload, visual migraine, or contrast halation from pitch-black or stark fluorescent white). Soft, muted pastels on warm alabaster reduce autonomic nervous system arousal.
2. **Test Anxiety Mitigation:** Harsh neon alarms and red alert states trigger performance anxiety during timed tasks (e.g., PVT reflex or Stroop cognitive conflict). Soft sage, gentle lavender, and warm apricot communicate psychological safety and encouragement rather than intimidation.
3. **Nordic "Calm Tech" Wellness Vibe:** Blends rigorous neuro-psychometrics with a modern, humane aesthetic (reminiscent of Headspace, Linear light mode, and Scandinavian clinical wellness spaces).

### 14.2 Pastel Design System Tokens
- **Canvas Base Background:** `#f8fafc` (Warm Alabaster / Chalk, subtle warm tint `#fcfbf9`)
- **Card Surfaces (Frosted Porcelain Glass):** `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(16px)`
- **Card Borders:** `1px solid rgba(226, 232, 240, 0.8)` or subtle tinted accent border `rgba(148, 163, 184, 0.2)`
- **Card Elevation (Organic Diffuse Shadows):** `box-shadow: 0 10px 30px -4px rgba(100, 116, 139, 0.08), 0 4px 12px -2px rgba(100, 116, 139, 0.04)`
- **Typography & Accessibility (WCAG AAA Compliant):**
  - **Primary Headings & Key Metrics:** Deep Charcoal Slate `#0f172a` (Ultra-crisp 15:1 contrast against `#f8fafc`)
  - **Body Text:** Muted Slate `#334155` / `#475569`
  - **Telemetry Labels:** Slate `#64748b`
  - **Monospace Telemetry Value Pills:** Deep Slate `#0f172a` on subtle tinted chips `#f1f5f9`
- **Pastel Accent Matrix:**
  - **Mindful Sage Green (Optimal / Calibrated / Verification):**
    - Surface Tint: `#ecfdf5` (Mint cream)
    - Border / Ring: `#a7f3d0` (Soft seafoam)
    - Graphic Accent: `#10b981` (Vibrant sage)
    - High-Contrast Text: `#065f46` (Deep pine)
  - **Soft Periwinkle / Cornflower (Cognitive Telemetry / Speed / Reflex):**
    - Surface Tint: `#eff6ff` (Ice blue)
    - Border / Ring: `#bfdbfe` (Soft periwinkle)
    - Graphic Accent: `#3b82f6` (Gentle periwinkle blue)
    - High-Contrast Text: `#1e40af` (Deep slate blue)
  - **Calming Lilac / Lavender (AuDHD Behavioral Screening / Memory / Pediatric):**
    - Surface Tint: `#f5f3ff` (Lavender mist)
    - Border / Ring: `#ddd6fe` (Soft lilac)
    - Graphic Accent: `#8b5cf6` (Pastel violet)
    - High-Contrast Text: `#4c1d95` (Deep royal amethyst)
  - **Warm Apricot / Honey Peach (Attention Cues / Reaction Ready / Caution):**
    - Surface Tint: `#fffbeb` (Honey cream)
    - Border / Ring: `#fde68a` (Soft peach)
    - Graphic Accent: `#f59e0b` (Muted apricot)
    - High-Contrast Text: `#92400e` (Deep warm amber)
  - **Dusty Rose / Terracotta (Inhibitory Conflict / Latency Drag / Misses):**
    - Surface Tint: `#fff1f2` (Rosewater)
    - Border / Ring: `#fecdd3` (Soft blush)
    - Graphic Accent: `#f43f5e` (Dusty rose)
    - High-Contrast Text: `#9f1239` (Deep cranberry)

---

## 15. Ready-To-Use Stitch Prompt Template (Option B: Sensory-Friendly Pastel Theme)

```markdown
Generate a modern, sensory-friendly, clinical-grade web application UI called "NeuroNova — Cognitive Neuro-Analytics & Dual-Track AuDHD Screening".

Aesthetics & Mood:
- Calm, organic Scandinavian health-tech & wellness aesthetic (sensory-friendly, neurodiversity-affirming, non-punitive, anti-anxiety).
- Background: Warm Alabaster / Soft Chalk (#f8fafc) with subtle organic radial ambient gradients in soft mint and pastel lavender.
- Surfaces: Frosted porcelain glass cards (rgba(255, 255, 255, 0.88), backdrop-filter: blur(16px), 1px solid rgba(226, 232, 240, 0.8), soft organic diffuse shadow 0 12px 32px -4px rgba(100, 116, 139, 0.08)).
- Palette Accents:
  * Mindful Sage Green (#10b981 on #ecfdf5 tint) for optimal norms and calibration.
  * Soft Periwinkle Blue (#3b82f6 on #eff6ff tint) for cognitive telemetry and speed.
  * Calming Lavender (#8b5cf6 on #f5f3ff tint) for memory and AuDHD screening.
  * Warm Apricot Peach (#f59e0b on #fffbeb tint) for attention cues and timer warnings.
  * Dusty Rose (#f43f5e on #fff1f2 tint) for inhibitory conflict and latency drag.
- Typography: Deep Charcoal Slate (#0f172a) for headings (WCAG AAA readability), Slate (#334155) for body, Monospace (JetBrains Mono) for millisecond scores and telemetry chips.

Screens to design:
1. Navigation Header:
   - Brand logo: Smooth gradient brain icon (Sage green to Lavender) with title "NeuroNova" in bold slate.
   - Status pills: Privacy Guard (Sage pill: "Local WASM Verified"), Gaze Tracker (Periwinkle pill: "Oculomotor Active"), Mic (Lavender pill: "Audio Calibrated"), Reset button.
2. Preflight Selector:
   - Dual frosted cards: "Adult Comprehensive Battery" (Periwinkle badge) and "Toddler M-CHAT-R/F Screener" (Lavender badge).
   - Camera & Microphone live preview cards with soft waveform animation.
   - Consent agreement checkbox card and a large pill "Begin Diagnostic Evaluation" button in deep indigo-slate.
3. PVT Reaction Arena:
   - Soft, low-strain testing arena: Calm periwinkle waiting state ("Wait for stimulus..."), flashing to a soft Mint Green target ring with bold text ("CLICK NOW!").
   - Millisecond digital stopwatch readout, streak badges, and round history pills.
4. Stroop Inhibition Task:
   - Large frosted white card displaying the target word with styled colored text.
   - 4 large velvety pill buttons: [D] Red (Rose tint), [F] Green (Sage tint), [J] Blue (Sky tint), [K] Yellow (Apricot tint).
   - Smooth progress pill bar and quick feedback badges ("Congruent / Accurate").
5. Working Memory Digit Span:
   - Sequential floating digit card with smooth scale-up animation in soft lavender.
   - Clean numeric phone-style keypad with tactile pastel pill buttons for digit recall.
   - Strike indicator dots (green circles for passed, soft red for strikes).
6. Verbal Fluency (Animal Naming):
   - 25s circular SVG countdown ring in periwinkle.
   - Organic pastel audio waveform that pulses gently to spoken voice.
   - Live transcription card displaying detected animal words as interactive mint green tags.
7. Standardized Questionnaire:
   - Clean questionnaire card with question progress tracker, question category badge (e.g. "Sensory Sensitivity", "Social Attention").
   - 5-point Likert scale rendered as smooth horizontal pill radio buttons that highlight in pastel lavender upon selection.
8. Clinical & Diagnostic Dashboard:
   - Hero CPI Score Card: Large 84/100 score with a pastel gradient circular progress ring, percentile chip, and confidence interval.
   - Radar Spider Chart featuring 6 cognitive-behavioral domains plotted with soft pastel filled polygons.
   - 4 Cognitive Sub-Score Cards (Speed, Inhibition, Memory, Fluency) with mini sparklines and norm percentile badges.
   - Vision & Oculomotor Telemetry Card: Gaze fixation heat map indicator, blink rate gauge, and pupil dispersion graph.
   - AuDHD Clinical Likelihood Cards: AQ-10, CAT-Q (Camouflaging), and M-CHAT-R/F results with score progress bars.
   - SHAP Explainable AI Waterfall: Feature importance bars with Sage Green for score boosters (+) and Dusty Rose for friction (-).
   - Executive Narrative & Actionable Plan: 2-column card with "Cognitive Strengths" and "Evidence-Based Accommodations" (20-20-20 rule, sensory breaks, working memory checklists).
   - Non-Diagnostic Medical Disclaimer card with warm peach accent.
```

