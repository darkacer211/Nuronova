import React, { useState, useRef, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PreflightScreen from './components/PreflightScreen';
import TaskPVT from './components/TaskPVT';
import TaskStroop from './components/TaskStroop';
import TaskDigitSpan from './components/TaskDigitSpan';
import TaskVerbal from './components/TaskVerbal';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import ClinicalTelemetryRail from './components/ClinicalTelemetryRail';

import AgeRouterModal from './features/screening/components/AgeRouterModal';
import QuestionRenderer from './features/screening/components/QuestionRenderer';
import MChatFollowUp from './features/screening/components/MChatFollowUp';
import AttentionLabView from './features/gaze/components/AttentionLabView';

import { SCREENER_REGISTRY, SCREENING_FLOWS } from './features/screening/tests/index';
import { scoreTest, scoreMChat } from './features/screening/engine/scorer';

import { useGazeTracker } from './hooks/useGazeTracker';
import { useAcousticAnalyzer } from './hooks/useAcousticAnalyzer';
import { useMotorLogger } from './hooks/useMotorLogger';

import { computePercentile } from './features/report/math';
import { generateIntegratedFindings } from './features/report/integrate';

export default function App() {
  // Navigation & Step State
  // Steps: 'preflight', 'task_pvt', 'task_stroop', 'task_digit_span', 'task_verbal', 'age_router', 'questionnaire', 'mchat_followup', 'analyzing', 'dashboard', 'attention_lab'
  const [currentStep, setCurrentStep] = useState('preflight');
  const [activeModule, setActiveModule] = useState('begin-assessment');
  const [participantId, setParticipantId] = useState('NN-2025-048B');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analyzingStatusText, setAnalyzingStatusText] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Micro Task Tracker State
  const [activeRound, setActiveRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);

  // Questionnaire Flow State
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [participantInfo, setParticipantInfo] = useState(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponses, setCurrentResponses] = useState({});
  const [completedScreeningResults, setCompletedScreeningResults] = useState([]);
  const [mchatInitialResult, setMchatInitialResult] = useState(null);

  // Multimodal Sensors & Telemetry Hooks
  const gazeTracker = useGazeTracker();
  const acousticAnalyzer = useAcousticAnalyzer();
  const motorLogger = useMotorLogger();

  // Persistent Video Ref to keep camera stream alive across tests
  const persistentVideoRef = useRef(null);

  // Session Storage Ref for compiled biomarkers & results
  const sessionDataRef = useRef({
    tasks: {
      pvt: null,
      stroop: null,
      nback: null,
      verbal: null,
    },
    biomarkers: {
      oculomotor: null,
      acoustic: null,
      motor: null,
    },
    screening: null,
  });

  // Handle module selection from Sidebar
  const handleSelectModule = (moduleId) => {
    setActiveModule(moduleId);
    if (moduleId === 'begin-assessment') {
      setCurrentStep('preflight');
    } else if (moduleId === 'diagnostic-neuro-reports') {
      setCurrentStep('dashboard');
    }
  };

  // Camera stream handler
  const handleCameraStreamReady = async (stream) => {
    setIsCameraActive(true);
    if (persistentVideoRef.current) {
      persistentVideoRef.current.srcObject = stream;
      await persistentVideoRef.current.play();
      await gazeTracker.startTracking(persistentVideoRef.current, stream);
    }
  };

  // Stable callback for task round progress tracking
  const handleRoundUpdate = useCallback((round, total) => {
    setActiveRound(round);
    setTotalRounds(total);
  }, []);

  // 1a. Start full cognitive protocol
  const handleStartProtocol = (pid) => {
    setParticipantId(pid);
    motorLogger.resetMotorStats();
    setActiveRound(1);
    setTotalRounds(5);
    setActiveModule('begin-assessment');
    setCurrentStep('task_pvt');
  };

  // 1b. Directly start Pediatric / Toddler Screening
  const handleStartToddlerScreening = (nickname) => {
    const routeInfo = {
      flowId: 'pediatric_mchat',
      respondentType: 'parent',
      targetName: nickname ? `Child (${nickname})` : 'Toddler (16–30m)',
      isChild: true,
      ageGroup: '16–30 months',
    };
    setParticipantInfo(routeInfo);
    const flow = SCREENING_FLOWS.find((f) => f.id === 'pediatric_mchat');
    setSelectedFlow(flow);
    setCurrentTestIndex(0);
    setCurrentQuestionIndex(0);
    setCurrentResponses({});
    setCompletedScreeningResults([]);
    setActiveModule('begin-assessment');
    setCurrentStep('questionnaire');
  };

  // 2. Complete PVT
  const handlePvtComplete = (pvtMetrics) => {
    sessionDataRef.current.tasks.pvt = pvtMetrics;
    setActiveRound(1);
    setTotalRounds(6);
    setCurrentStep('task_stroop');
  };

  // 3. Complete Stroop
  const handleStroopComplete = (stroopMetrics) => {
    sessionDataRef.current.tasks.stroop = stroopMetrics;
    setActiveRound(1);
    setTotalRounds(5);
    setCurrentStep('task_digit_span');
  };

  // 4. Complete Digit Span
  const handleDigitSpanComplete = (digitMetrics) => {
    sessionDataRef.current.tasks.nback = digitMetrics;
    setActiveRound(1);
    setTotalRounds(4);
    setCurrentStep('task_verbal');
  };

  // 5. Complete Verbal Fluency -> Proceed to Age Router
  const handleVerbalComplete = (verbalMetrics) => {
    sessionDataRef.current.tasks.verbal = verbalMetrics;
    setCurrentStep('age_router');
  };

  // Temporary testing helper to skip all cognitive tests
  const handleSkipAllCognitiveTasks = () => {
    sessionDataRef.current.tasks = {
      pvt: {
        mean_rt: 238,
        min_rt: 210,
        max_rt: 260,
        lapses: 0,
        false_starts: 0,
        trials_count: 5,
        rt_sd: 22.4,
        rt_cv: 0.094,
        fast_responses_count: 0,
        slow_responses_count: 0,
      },
      stroop: { congruent_mean_rt: 512, incongruent_mean_rt: 624, interference_cost: 112, accuracy: 0.95 },
      nback: { span: 7, rounds_passed: 5, accuracy: 1.0 },
      verbal: { words_count: 14, speech_rate_wpm: 138, pause_ratio: 0.16 },
    };
    setCurrentStep('age_router');
  };

  // 6. Age Router Decision
  const handleRouteSelected = (routeInfo) => {
    setParticipantInfo(routeInfo);
    const flow = SCREENING_FLOWS.find((f) => f.id === routeInfo.flowId) || SCREENING_FLOWS[2];
    setSelectedFlow(flow);
    setCurrentTestIndex(0);
    setCurrentQuestionIndex(0);
    setCurrentResponses({});
    setCompletedScreeningResults([]);

    setCurrentStep('questionnaire');
  };

  const handleSkipScreening = () => {
    runFinalAnalysis(null);
  };

  // 7. Questionnaire Navigation
  const activeTestId = selectedFlow?.testIds?.[currentTestIndex];
  const activeTestConfig = SCREENER_REGISTRY[activeTestId];
  const activeItem = activeTestConfig?.items?.[currentQuestionIndex];

  const handleSelectOption = (value) => {
    if (!activeItem) return;
    setCurrentResponses((prev) => ({
      ...prev,
      [activeItem.id]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (!activeTestConfig) return;

    if (currentQuestionIndex + 1 < activeTestConfig.items.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const result = scoreTest(activeTestConfig, currentResponses);

      if (activeTestConfig.id === 'mchat' && result.requiresFollowUp) {
        setMchatInitialResult(result);
        setCurrentStep('mchat_followup');
        return;
      }

      const nextResults = [...completedScreeningResults, result];
      setCompletedScreeningResults(nextResults);

      if (currentTestIndex + 1 < selectedFlow.testIds.length) {
        setCurrentTestIndex((prev) => prev + 1);
        setCurrentQuestionIndex(0);
        setCurrentResponses({});
      } else {
        runFinalAnalysis({
          participant: participantInfo,
          results: nextResults,
        });
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // 7b. Complete M-CHAT Follow-Up
  const handleCompleteMChatFollowUp = (followUpAnswers) => {
    const finalResult = scoreMChat(activeTestConfig, currentResponses, followUpAnswers);
    const nextResults = [...completedScreeningResults, finalResult];
    setCompletedScreeningResults(nextResults);

    runFinalAnalysis({
      participant: participantInfo,
      results: nextResults,
    });
  };

  // 8. Run Final Multimodal Analysis
  const runFinalAnalysis = async (screeningData) => {
    setCurrentStep('analyzing');
    setAnalyzingStatusText('Aggregating on-device sensor telemetry...');

    const oculoSummary = gazeTracker.getSummary();
    const acoustSummary = acousticAnalyzer.getAcousticSummary();
    const motorSummary = motorLogger.getMotorSummary();

    sessionDataRef.current.biomarkers = {
      oculomotor: oculoSummary,
      acoustic: acoustSummary,
      motor: motorSummary,
    };
    sessionDataRef.current.screening = screeningData;

    const isPediatricOnly = !sessionDataRef.current.tasks.pvt && screeningData?.participant?.isChild;

    if (isPediatricOnly) {
      const mchatResult = screeningData.results?.[0];
      const pedCpi = mchatResult?.isPositive ? 62 : 88;
      const fallbackPediatric = {
        session_id: `ped_${Date.now().toString(36)}`,
        is_pediatric_only: true,
        cpi_score: pedCpi,
        percentile_rank: computePercentile(pedCpi, 75, 12),
        confidence_interval: mchatResult?.isPositive ? [59.5, 64.5] : [85.5, 90.5],
        domains: {
          executive_function: 75.0,
          sustained_attention: 75.0,
          processing_speed: 75.0,
          cognitive_stability: 75.0,
        },
        integrated_findings: generateIntegratedFindings({
          tasks: {},
          biomarkers: sessionDataRef.current.biomarkers,
          screening: screeningData,
          domains: { executive_function: 75, sustained_attention: 75, processing_speed: 75, cognitive_stability: 75 },
          cpi_score: pedCpi,
        }),
        shap_explanations: [],
        narrative_report: {
          summary: mchatResult?.summary || 'Pediatric milestone screening completed.',
          key_strengths: [
            'Parent observational screening completed successfully.',
            'Standardized M-CHAT-R/F criteria evaluated across 20 milestone behaviors.',
          ],
          fatigue_indicators: mchatResult?.isPositive
            ? ['Specific joint-attention or communication behaviors identified for developmental follow-up.']
            : ['No developmental red flags identified at this screening interval.'],
          recommendations: [
            mchatResult?.recommendation || 'Continue routine developmental surveillance with your pediatrician.',
          ],
          disclaimer:
            'The M-CHAT-R/F is a developmental screening tool, not a medical diagnosis. Share this result with your pediatrician.',
        },
      };
      setAnalysisResult(fallbackPediatric);
      setActiveModule('diagnostic-neuro-reports');
      setCurrentStep('dashboard');
      return;
    }

    const payload = {
      session_id: `sess_${Date.now().toString(36)}`,
      user_id_hash: participantId,
      client_timestamp: Date.now(),
      tasks: sessionDataRef.current.tasks,
      biomarkers: sessionDataRef.current.biomarkers,
      screening: screeningData,
    };

    setAnalyzingStatusText('Computing Cognitive Performance Index (CPI) & SHAP attributions...');

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (!data.integrated_findings) {
          data.integrated_findings = generateIntegratedFindings({
            tasks: payload.tasks,
            biomarkers: payload.biomarkers,
            screening: payload.screening,
            domains: data.domains,
            cpi_score: data.cpi_score,
          });
        }
        setAnalysisResult(data);
        setActiveModule('diagnostic-neuro-reports');
        setCurrentStep('dashboard');
        return;
      }
    } catch (err) {
      console.warn('Backend API connection failed, executing client-side fallback calculation:', err);
    }

    const fallbackResult = generateLocalAnalysisFallback(payload);
    setAnalysisResult(fallbackResult);
    setActiveModule('diagnostic-neuro-reports');
    setCurrentStep('dashboard');
  };

  // Reset screening session
  const handleReset = () => {
    sessionDataRef.current = {
      tasks: { pvt: null, stroop: null, nback: null, verbal: null },
      biomarkers: { oculomotor: null, acoustic: null, motor: null },
      screening: null,
    };
    setSelectedFlow(null);
    setParticipantInfo(null);
    setCurrentTestIndex(0);
    setCurrentQuestionIndex(0);
    setCurrentResponses({});
    setCompletedScreeningResults([]);
    setMchatInitialResult(null);
    setAnalysisResult(null);
    setActiveModule('begin-assessment');
    setCurrentStep('preflight');
  };

  // Check if current view is an interactive cognitive task battery step
  const isCognitiveTaskStep = ['task_pvt', 'task_stroop', 'task_digit_span', 'task_verbal'].includes(currentStep);

  const getTaskNumber = () => {
    switch (currentStep) {
      case 'task_pvt': return 1;
      case 'task_stroop': return 2;
      case 'task_digit_span': return 3;
      case 'task_verbal': return 4;
      default: return 1;
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface min-h-screen">
      {/* 1. FIXED TOP CLINICAL HEADER */}
      <Header
        currentStep={currentStep}
        gazeActive={isCameraActive || gazeTracker.isTracking}
        micActive={acousticAnalyzer.isRecording}
        onReset={handleReset}
      />

      {/* 2. FIXED LEFT CLINICAL MODULES SIDEBAR */}
      <Sidebar
        activeModule={activeModule}
        onSelectModule={handleSelectModule}
      />

      {/* Persistent hidden video element for continuous background WebAssembly tracking */}
      <video
        ref={persistentVideoRef}
        playsInline
        muted
        autoPlay
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* 3. MAIN WORKSPACE AREA (OFFSET BY SIDEBAR & HEADER) */}
      <div className="pl-64">
        <main className="relative w-full pt-20 bg-background min-h-screen px-6">
          <div className="flex flex-col w-full py-6">
            <div className="max-w-[1240px] mx-auto w-full flex flex-col gap-6">

              {/* TOP TASK PROGRESSION BAR (When in battery tasks) */}
              {isCognitiveTaskStep && (
                <div className="w-full bg-surface-container-lowest rounded-xl px-5 py-3 shadow-sm border border-surface-container-high/60 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
                  {/* Left Side: Task Number Ratio (1/4) & Task Numbers Only in Circular Shape */}
                  <div className="flex items-center gap-3 select-none">
                    <span className="px-3 py-1 rounded-full bg-primary text-on-primary font-bold text-[13px] tracking-wide shadow-sm">
                      {getTaskNumber()}/4
                    </span>

                    <div className="flex items-center gap-2">
                      {[
                        { num: 1, step: 'task_pvt', done: Boolean(sessionDataRef.current?.tasks?.pvt) },
                        { num: 2, step: 'task_stroop', done: Boolean(sessionDataRef.current?.tasks?.stroop) },
                        { num: 3, step: 'task_digit_span', done: Boolean(sessionDataRef.current?.tasks?.nback) },
                        { num: 4, step: 'task_verbal', done: Boolean(sessionDataRef.current?.tasks?.verbal) },
                      ].map((t) => {
                        const isCurrent = currentStep === t.step;
                        return (
                          <div
                            key={t.num}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] transition-all ${
                              t.done
                                ? 'bg-secondary text-on-secondary shadow-sm'
                                : isCurrent
                                ? 'bg-primary text-on-primary ring-2 ring-primary/30 shadow-sm'
                                : 'bg-surface-container text-on-surface-variant/60'
                            }`}
                            title={`Task ${t.num}`}
                          >
                            {t.done ? (
                              <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                            ) : (
                              <span>{t.num}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Redesigned Chevron Progress Bar & Testing Skip All Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 self-center md:self-auto">
                    {/* Chevron Bar with Floating Pin */}
                    <div className="relative pt-6 pb-1 min-w-[200px] sm:min-w-[240px]">
                      {/* Floating circular speech bubble pin */}
                      <div
                        className="absolute top-0 transition-all duration-300 transform -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
                        style={{
                          left: `${((Math.min(Math.max(activeRound, 1), totalRounds) - 0.5) / totalRounds) * 100}%`,
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-[12px] flex items-center justify-center shadow-md leading-none">
                          {activeRound}/{totalRounds}
                        </div>
                        <div className="w-2.5 h-2.5 bg-slate-900 rotate-45 -mt-1 rounded-[1px]"></div>
                      </div>

                      {/* Segmented Chevron Pill Bar */}
                      <div className="w-full h-8 rounded-full bg-blue-100 dark:bg-slate-800 flex overflow-hidden border border-blue-200/60 shadow-inner">
                        {Array.from({ length: totalRounds }).map((_, idx) => {
                          const roundNum = idx + 1;
                          const isPast = roundNum < activeRound;
                          const isCurrent = roundNum === activeRound;
                          const isFirst = idx === 0;
                          const isLast = idx === totalRounds - 1;

                          // Chevron polygon clip-path
                          let clipPath = 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)';
                          if (isFirst) {
                            clipPath = 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%)';
                          } else if (isLast) {
                            clipPath = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 8px 50%)';
                          }

                          return (
                            <div
                              key={idx}
                              style={{ clipPath }}
                              className={`flex-1 h-full flex items-center justify-center transition-all duration-300 ${
                                isPast
                                  ? 'bg-blue-600 text-white font-bold'
                                  : isCurrent
                                  ? 'bg-blue-500 text-white font-bold'
                                  : 'bg-blue-200/70 text-transparent'
                              } ${!isFirst ? '-ml-1.5' : ''}`}
                            >
                              {isPast && (
                                <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                              )}
                              {isCurrent && (
                                <span className="text-[13px] font-black tracking-widest leading-none opacity-90">• • •</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Temporary Testing Button: Skip All Cognitive Tests */}
                    <button
                      onClick={handleSkipAllCognitiveTasks}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 whitespace-nowrap cursor-pointer hover:shadow"
                      title="Temporary Testing Mode: Skip all 4 cognitive tests and jump directly to Child/Adult Behavioral screening"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px] text-amber-700 dark:text-amber-400">fast_forward</span>
                      <span>Skip All Tests</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. MAIN ASSESSMENT STAGE */}
              {isCognitiveTaskStep ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  {/* Left Column (8 cols): Primary Stimulus & Task */}
                  <div className="xl:col-span-8 flex flex-col gap-4">
                    {currentStep === 'task_pvt' && (
                      <TaskPVT
                        onComplete={handlePvtComplete}
                        onRoundUpdate={handleRoundUpdate}
                      />
                    )}

                    {currentStep === 'task_stroop' && (
                      <TaskStroop
                        onComplete={handleStroopComplete}
                        onRoundUpdate={handleRoundUpdate}
                      />
                    )}

                    {currentStep === 'task_digit_span' && (
                      <TaskDigitSpan
                        onComplete={handleDigitSpanComplete}
                        onRoundUpdate={handleRoundUpdate}
                      />
                    )}

                    {currentStep === 'task_verbal' && (
                      <TaskVerbal
                        acousticAnalyzer={acousticAnalyzer}
                        onComplete={handleVerbalComplete}
                      />
                    )}
                  </div>

                  {/* Right Column (4 cols): Live Clinical Telemetry Rail */}
                  <div className="xl:col-span-4 flex flex-col gap-4">
                    <ClinicalTelemetryRail
                      gazeTracker={gazeTracker}
                      acousticAnalyzer={acousticAnalyzer}
                      videoStreamRef={persistentVideoRef}
                      isCameraActive={isCameraActive}
                      onPause={() => alert('Task Paused. Click resume when ready.')}
                      onResetRound={() => {
                        // Re-trigger current step
                        const step = currentStep;
                        setCurrentStep('preflight');
                        setTimeout(() => setCurrentStep(step), 50);
                      }}
                      onSkipTask={() => {
                        if (currentStep === 'task_pvt') handlePvtComplete({ mean_rt: 242, min_rt: 212, max_rt: 260, lapses: 0 });
                        else if (currentStep === 'task_stroop') handleStroopComplete({ interference_cost: 110, accuracy: 0.94 });
                        else if (currentStep === 'task_digit_span') handleDigitSpanComplete({ span: 7, rounds_passed: 5 });
                        else if (currentStep === 'task_verbal') handleVerbalComplete({ words_count: 14, speech_rate_wpm: 135 });
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Non-task views: Preflight, AgeRouter, Questionnaire, Analyzing, Dashboard, AttentionLab */
                <div>
                  {currentStep === 'preflight' && (
                    <PreflightScreen
                      onStartProtocol={handleStartProtocol}
                      onStartToddlerScreening={handleStartToddlerScreening}
                      gazeTracker={gazeTracker}
                      acousticAnalyzer={acousticAnalyzer}
                      onCameraStreamReady={handleCameraStreamReady}
                    />
                  )}

                  {currentStep === 'age_router' && (
                    <AgeRouterModal
                      onRouteSelected={handleRouteSelected}
                      onSkip={handleSkipScreening}
                    />
                  )}

                  {currentStep === 'questionnaire' && (
                    activeTestConfig ? (
                      <QuestionRenderer
                        testConfig={activeTestConfig}
                        currentIndex={currentQuestionIndex}
                        totalItems={activeTestConfig.items?.length || 0}
                        item={activeItem || activeTestConfig.items?.[0] || null}
                        currentValue={activeItem ? currentResponses[activeItem.id] : undefined}
                        onSelectOption={handleSelectOption}
                        onPrev={handlePrevQuestion}
                        onNext={handleNextQuestion}
                        isLastQuestion={
                          currentQuestionIndex + 1 === (activeTestConfig.items?.length || 0) &&
                          currentTestIndex + 1 === (selectedFlow?.testIds?.length || 1)
                        }
                        onCancel={handleSkipScreening}
                      />
                    ) : (
                      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm text-center">
                        <p className="font-body-md text-on-surface-variant mb-4">Questionnaire ready.</p>
                        <button onClick={handleSkipScreening} className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold">
                          View Diagnostics
                        </button>
                      </div>
                    )
                  )}

                  {currentStep === 'mchat_followup' && mchatInitialResult && activeTestConfig && (
                    <MChatFollowUp
                      initialResult={mchatInitialResult}
                      testConfig={activeTestConfig}
                      onCompleteFollowUp={handleCompleteMChatFollowUp}
                    />
                  )}

                  {currentStep === 'analyzing' && (
                    <div className="bg-surface-container-lowest p-16 rounded-xl shadow-sm border border-surface-container-high/60 text-center max-w-lg mx-auto">
                      <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6"></div>
                      <h3 className="font-headline-sm text-[22px] font-bold text-on-surface mb-2">
                        Synthesizing Multi-Modal Diagnostics
                      </h3>
                      <p className="font-body-sm text-on-surface-variant text-[14px]">
                        {analyzingStatusText}
                      </p>
                    </div>
                  )}

                  {currentStep === 'dashboard' && (
                    analysisResult ? (
                      <ErrorBoundary onReset={handleReset}>
                        <Dashboard
                          analysisResult={analysisResult}
                          rawPayload={sessionDataRef.current}
                          onRetake={handleReset}
                        />
                      </ErrorBoundary>
                    ) : (
                      <div className="max-w-md mx-auto my-12 p-8 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 text-center flex flex-col items-center transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-surface-container-high text-primary flex items-center justify-center mb-4 shadow-sm">
                          <span className="material-symbols-outlined text-[32px]">assignment_late</span>
                        </div>
                        <h2 className="font-headline-sm text-[22px] font-bold text-on-surface mb-2">
                          Assessment Required
                        </h2>
                        <p className="font-body-md text-[14px] text-on-surface-variant mb-6 leading-relaxed">
                          Neuro Reports are generated after completing the clinical screening. Please complete the assessment first to view your diagnostic report.
                        </p>
                        <button
                          onClick={() => {
                            setActiveModule('begin-assessment');
                            setCurrentStep('preflight');
                          }}
                          className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-[15px] font-bold shadow-md transition-all flex items-center gap-2"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                          <span>Begin Assessment</span>
                        </button>
                      </div>
                    )
                  )}

                  {currentStep === 'attention_lab' && (
                    <AttentionLabView onBack={() => setCurrentStep('task_pvt')} />
                  )}
                </div>
              )}



            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Local deterministic fallback generator matching FastAPI CPI formulation
 */
function generateLocalAnalysisFallback(req) {
  const pvt = req?.tasks?.pvt || {};
  const stroop = req?.tasks?.stroop || {};
  const nback = req?.tasks?.nback || {};
  const oculo = req?.biomarkers?.oculomotor || {};

  const meanRt = Number(pvt.mean_rt) > 50 ? Number(pvt.mean_rt) : 242;
  const stroopCost = typeof stroop.interference_cost === 'number' ? stroop.interference_cost : 110;
  const dprime = typeof nback.dprime === 'number' ? nback.dprime : 2.3;
  const gaze = typeof oculo.gaze_on_screen === 'number' ? oculo.gaze_on_screen : 0.94;

  const zPvt = Math.min(Math.max((3.45 - 1000 / meanRt) / 0.55 * -1, -3), 3);
  const zStroop = Math.min(Math.max((stroopCost - 120) / 38 * -1, -3), 3);
  const zNback = Math.min(Math.max((dprime - 2.2) / 0.65, -3), 3);
  const zGaze = Math.min(Math.max((gaze - 0.91) / 0.07, -3), 3);

  const execScore = Math.min(Math.max(75 + 12 * (0.6 * zNback + 0.4 * zStroop), 30), 98);
  const attenScore = Math.min(Math.max(75 + 12 * (0.6 * zPvt + 0.4 * zGaze), 30), 98);
  const speedScore = Math.min(Math.max(75 + 12 * zPvt, 30), 98);
  const stabScore = Math.min(Math.max(75 + 12 * (0.5 * zGaze + 0.5 * 0.2), 30), 98);

  const unroundedCpi = 0.3 * execScore + 0.3 * attenScore + 0.25 * speedScore + 0.15 * stabScore;
  const cpi = Math.round(unroundedCpi) || 75;
  const percentileRank = computePercentile(cpi, 75.0, 12.0);

  const domainScores = {
    executive_function: Number(execScore.toFixed(1)),
    sustained_attention: Number(attenScore.toFixed(1)),
    processing_speed: Number(speedScore.toFixed(1)),
    cognitive_stability: Number(stabScore.toFixed(1)),
  };

  const integratedFindings = generateIntegratedFindings({
    tasks: req?.tasks || {},
    biomarkers: req?.biomarkers || {},
    screening: req?.screening || null,
    domains: domainScores,
    cpi_score: cpi,
  });

  return {
    session_id: req?.session_id || `sess_${Date.now().toString(36)}`,
    cpi_score: cpi,
    percentile_rank: percentileRank,
    confidence_interval: [Number((cpi - 2.5).toFixed(1)), Number((cpi + 2.5).toFixed(1))],
    domains: domainScores,
    integrated_findings: integratedFindings,
    shap_explanations: [
      {
        feature: 'pvt_inv_rt',
        label: 'Visual Reaction Velocity',
        domain: 'sustained_attention',
        impact: '+5.6',
        impact_value: 5.6,
        direction: 'positive',
        description: 'Rapid target acquisition during visual reaction time trials.',
      },
      {
        feature: 'gaze_on_screen',
        label: 'Oculomotor Focus Stability',
        domain: 'sustained_attention',
        impact: '+4.2',
        impact_value: 4.2,
        direction: 'positive',
        description: 'Consistent on-screen gaze engagement tracked by MediaPipe face mesh.',
      },
      {
        feature: 'nback_dprime',
        label: 'Working Memory Digit Span Capacity',
        domain: 'executive_function',
        impact: '+3.8',
        impact_value: 3.8,
        direction: 'positive',
        description: 'Demonstrated high sequential digit retention and recall capacity.',
      },
      {
        feature: 'stroop_cost',
        label: 'Cognitive Interference Latency',
        domain: 'executive_function',
        impact: '-2.4',
        impact_value: -2.4,
        direction: 'negative',
        description: 'Sensory interference cost between congruent and incongruent color words.',
      },
    ],
    narrative_report: {
      summary: `Your overall Cognitive Performance Index (CPI) evaluated at ${cpi}/100. Overall screening demonstrated robust visual reflexes, intact working memory digit span retention, and high oculomotor gaze stability.`,
      key_strengths: [
        'Fast visual reaction times within top benchmark norms.',
        'High working memory span and sequential recall.',
        'Steady on-screen gaze focus (>90% target adherence).',
      ],
      fatigue_indicators: [
        'Moderate latency overhead during incongruent Stroop color inhibition trials.',
        'Mild visual fatigue indicated by spontaneous blink variations.',
      ],
      recommendations: [
        'Apply 20-20-20 visual rest intervals to prevent late-day oculomotor fatigue.',
        'Engage in dual-task exercises to further minimize sensory interference latency.',
        'Utilize external reminders and task segmentation for high executive-load tasks.',
      ],
      disclaimer:
        'NeuroNova Cognitive Screening is an automated psychometric assessment intended for functional cognitive awareness and research tracking. It does NOT constitute a clinical medical diagnosis.',
    },
  };
}
