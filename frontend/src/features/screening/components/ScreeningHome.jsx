import React, { useState } from 'react';
import { SCREENING_FLOWS, SCREENER_REGISTRY } from '../tests/index';
import { scoreTest } from '../engine/scorer';
import AgeGateModal from './AgeGateModal';
import QuestionRenderer from './QuestionRenderer';
import InterpretationCard from '../results/InterpretationCard';
import ClinicalSummaryExport from '../results/ClinicalSummaryExport';
import ScreeningDisclaimer from './ScreeningDisclaimer';
import { SUPPORT_RESOURCES } from '../results/supportResources';

import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  HeartHandshake,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';

export default function ScreeningHome() {
  // view: 'home', 'questionnaire', 'results', 'export'
  const [view, setView] = useState('home');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  // Questionnaire runner state
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentResponses, setCurrentResponses] = useState({}); // { [itemId]: value }
  const [completedResults, setCompletedResults] = useState([]); // array of scoreTest outputs

  // Flow Selection & Age Verification
  const handleSelectFlow = (flow) => {
    setSelectedFlow(flow);
    setIsAgeModalOpen(true);
  };

  const handleConfirmAge = () => {
    setIsAgeModalOpen(false);
    setCurrentTestIndex(0);
    setCurrentQuestionIndex(0);
    setCurrentResponses({});
    setCompletedResults([]);
    setView('questionnaire');
  };

  // Questionnaire navigation logic
  const activeTestId = selectedFlow?.testIds[currentTestIndex];
  const activeTestConfig = SCREENER_REGISTRY[activeTestId];
  const activeItem = activeTestConfig?.items[currentQuestionIndex];

  const handleSelectOption = (value) => {
    setCurrentResponses((prev) => ({
      ...prev,
      [activeItem.id]: value,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeTestConfig.items.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Completed current test in the flow
      const result = scoreTest(activeTestConfig, currentResponses);
      const nextResults = [...completedResults, result];
      setCompletedResults(nextResults);

      if (currentTestIndex + 1 < selectedFlow.testIds.length) {
        // Move to next test in flow (e.g. from ASRS-6 to AQ-10)
        setCurrentTestIndex((prev) => prev + 1);
        setCurrentQuestionIndex(0);
        setCurrentResponses({});
      } else {
        // All tests in flow finished!
        setView('results');
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setView('home');
    setSelectedFlow(null);
    setCurrentTestIndex(0);
    setCurrentQuestionIndex(0);
    setCurrentResponses({});
    setCompletedResults([]);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Age Gate Modal */}
      <AgeGateModal
        isOpen={isAgeModalOpen}
        testName={selectedFlow?.title || 'NeuroNova Screen'}
        onConfirm={handleConfirmAge}
        onCancel={() => setIsAgeModalOpen(false)}
      />

      {/* VIEW 1: Screening Selection Home */}
      {view === 'home' && (
        <>
          <div className="glass-panel" style={{ padding: '36px 32px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge-pill badge-violet">Evidence-Based Questionnaires</span>
              <span className="badge-pill badge-cyan">Privacy Protected • Client-Side</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Adult ADHD & Autism Self-Screening Suite
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              A confidential, clinical-grade self-screening space for adults (18+). Complete standardized questionnaires, receive plain-language interpretations, and export a printable summary for your physician or psychologist.
            </p>

            <ScreeningDisclaimer />
          </div>

          {/* Flow Cards */}
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', color: '#ffffff' }}>
              Select a Screening Pathway
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {SCREENING_FLOWS.map((flow) => (
                <div
                  key={flow.id}
                  onClick={() => handleSelectFlow(flow)}
                  className="glass-panel"
                  style={{
                    padding: '24px 28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    gap: '20px',
                    border: flow.id === 'quick_audhd' ? '1px solid var(--violet-glow)' : '1px solid var(--border-subtle)',
                    boxShadow: flow.id === 'quick_audhd' ? '0 0 25px rgba(139, 92, 246, 0.15)' : 'none',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="badge-pill badge-violet">{flow.badge}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} /> {flow.duration}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                      {flow.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                      {flow.description}
                    </p>
                  </div>

                  <button className="btn-primary" style={{ flexShrink: 0, padding: '10px 20px', fontSize: '0.9rem' }}>
                    <span>Start</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Coming Soon Stubs */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Additional Instruments (Coming Soon)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              {['raads_r', 'aq50', 'rbq2a'].map((stubId) => {
                const stub = SCREENER_REGISTRY[stubId];
                return (
                  <div key={stubId} style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-muted)' }}>{stub.name}</div>
                    <span className="badge-pill badge-amber" style={{ fontSize: '0.72rem', marginTop: '8px', display: 'inline-block' }}>
                      Pending Licensing
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Support Resources Section */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <HeartHandshake size={20} color="var(--cyan-glow)" />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recommended Support & Clinical Resources</h4>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Self-screening is an empowering first step toward self-understanding. If you are seeking official evaluations or community support, explore these reputable resources:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {SUPPORT_RESOURCES.map((group, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cyan-glow)', marginBottom: '8px' }}>
                    {group.region}
                  </div>
                  {group.organizations.map((org, oIdx) => (
                    <div key={oIdx} style={{ marginBottom: '10px' }}>
                      <a
                        href={org.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <span>{org.name}</span>
                        <ExternalLink size={12} color="var(--text-dim)" />
                      </a>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '2px 0 0 0' }}>{org.description}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: Questionnaire Runner */}
      {view === 'questionnaire' && activeTestConfig && activeItem && (
        <QuestionRenderer
          testConfig={activeTestConfig}
          currentIndex={currentQuestionIndex}
          totalItems={activeTestConfig.items.length}
          item={activeItem}
          currentValue={currentResponses[activeItem.id]}
          onSelectOption={handleSelectOption}
          onPrev={handlePrevQuestion}
          onNext={handleNextQuestion}
          isLastQuestion={currentQuestionIndex + 1 === activeTestConfig.items.length && currentTestIndex + 1 === selectedFlow.testIds.length}
          onCancel={handleReset}
        />
      )}

      {/* VIEW 3: Results Dashboard */}
      {view === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span className="badge-pill badge-emerald" style={{ marginBottom: '6px', display: 'inline-block' }}>
                Questionnaire Protocol Completed
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                Your Neurodiversity Screening Results
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setView('export')} className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
                <FileText size={16} />
                <span>Clinician Printable Summary</span>
              </button>
              <button onClick={handleReset} className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.88rem' }}>
                <RotateCcw size={16} />
                <span>Take Another Screener</span>
              </button>
            </div>
          </div>

          <ScreeningDisclaimer />

          {/* Results Cards for all finished questionnaires */}
          <div>
            {completedResults.map((result, idx) => (
              <InterpretationCard key={idx} result={result} />
            ))}
          </div>

          {/* Next Steps Card */}
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '10px', color: '#ffffff' }}>
              Recommended Next Steps
            </h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Print or Save Your Summary:</strong> Click the <em>Clinician Printable Summary</em> button above to generate a clean PDF containing your completed scores and instrument references.
              </li>
              <li>
                <strong>Schedule an Adult Intake:</strong> Present the summary to a general practitioner (GP), adult ADHD psychiatrist, or neurodiversity-affirming psychologist.
              </li>
              <li>
                <strong>Reflect on Environmental Support:</strong> Regardless of diagnosis, recognizing your sensory, working memory, and executive patterns can help you introduce accommodations (e.g., visual timers, noise-canceling headphones, structured task batching).
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* VIEW 4: Printable Clinician Summary */}
      {view === 'export' && (
        <ClinicalSummaryExport results={completedResults} onBack={() => setView('results')} />
      )}
    </div>
  );
}
