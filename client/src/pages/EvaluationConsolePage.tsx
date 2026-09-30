import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  ArrowLeft,
  Terminal,
  Activity,
  Zap
} from 'lucide-react';
import { EvalTestCase, EvalTestRunResult } from '@shared/types';

interface EvaluationConsolePageProps {
  onNavigate: (view: string) => void;
}

export const EvaluationConsolePage: React.FC<EvaluationConsolePageProps> = ({ onNavigate }) => {
  const [cases, setCases] = useState<EvalTestCase[]>([]);
  const [results, setResults] = useState<Record<string, EvalTestRunResult>>({});
  const [loading, setLoading] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [runningCaseId, setRunningCaseId] = useState<string | null>(null);

  useEffect(() => {
    async function loadTestCases() {
      try {
        setLoading(true);
        const res = await api.getEvalCases();
        if (res.testCases) {
          setCases(res.testCases);
        }
      } catch (err) {
        console.error('Failed to load eval test cases', err);
      } finally {
        setLoading(false);
      }
    }
    loadTestCases();
  }, []);

  const handleRunAll = async () => {
    try {
      setRunningAll(true);
      const res = await api.runEvaluation();
      if (res.results) {
        const resultMap: Record<string, EvalTestRunResult> = {};
        for (const r of res.results) {
          resultMap[r.testCaseId] = r;
        }
        setResults(resultMap);
      }
    } catch (err) {
      console.error('Evaluation run failed', err);
    } finally {
      setRunningAll(false);
    }
  };

  const handleRunSingle = async (caseId: string) => {
    try {
      setRunningCaseId(caseId);
      const res = await api.runEvaluation(caseId);
      if (res.results && res.results[0]) {
        setResults(prev => ({
          ...prev,
          [caseId]: res.results[0]
        }));
      }
    } catch (err) {
      console.error(`Evaluation for ${caseId} failed`, err);
    } finally {
      setRunningCaseId(null);
    }
  };

  const completedCount = Object.keys(results).length;
  const passedCount = Object.values(results).filter(r => r.passed).length;
  const failedCount = completedCount - passedCount;
  const avgLatency = completedCount > 0 
    ? Math.round(Object.values(results).reduce((acc, r) => acc + (r.latencyMs || 0), 0) / completedCount)
    : 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading evaluation test harness...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '18px'
      }}>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('teacher-dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={15} />
          <span>Back to Teacher Workspace</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleRunAll}
            disabled={runningAll || runningCaseId !== null}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {runningAll ? <RotateCcw size={16} className="animate-spin" /> : <Play size={16} />}
            <span>{runningAll ? 'Executing Diagnostic Pipeline...' : 'Run Full Evaluation Suite (5 Tests)'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cpu size={24} color="#c084fc" />
              <h1 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>
                Diagnostic Robustness & Evaluation Console
              </h1>
              <span className="badge badge-purple">Phase 4 Certified</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '6px 0 0 0', maxWidth: '780px' }}>
              Verifies the live, un-mocked diagnostic pipeline against prompt injection, out-of-scope domain drift, 
              fine-grained misconception differentiation, and uncertainty handling. Strict policy: No mock outputs.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Tests</div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>{cases.length}</div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '80px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '10px', color: '#6ee7b7', textTransform: 'uppercase' }}>Passed</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>{passedCount}</div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '80px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '10px', color: '#fca5a5', textTransform: 'uppercase' }}>Failed</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>{failedCount}</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '8px', textAlign: 'center', minWidth: '90px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Latency</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#93c5fd' }}>{avgLatency}ms</div>
            </div>
          </div>
        </div>

        {/* Pipeline Architecture Indicator */}
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '6px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto'
        }}>
          <strong style={{ color: '#c084fc' }}>Live Pipeline Architecture:</strong>
          <span>Student Input</span>
          <span>→</span>
          <span style={{ color: '#93c5fd' }}>Input Scope Guard</span>
          <span>→</span>
          <span style={{ color: '#c7d2fe' }}>IDiagnosticEngine</span>
          <span>→</span>
          <span style={{ color: '#fcd34d' }}>Gemini Adapter</span>
          <span>→</span>
          <span style={{ color: '#6ee7b7' }}>Structured Output Validator</span>
          <span>→</span>
          <span style={{ color: '#f472b6' }}>Learner State</span>
        </div>
      </div>

      {/* 5 Test Cases Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {cases.map((testCase: EvalTestCase, index: number) => {
          const result = results[testCase.id];
          const isRunning = runningCaseId === testCase.id || runningAll;

          return (
            <div 
              key={testCase.id}
              className="card"
              style={{
                border: result 
                  ? result.passed 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : '1px solid rgba(239, 68, 68, 0.4)'
                  : '1px solid var(--border-subtle)',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '18px'
              }}
            >
              {/* Test Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="badge badge-purple" style={{ fontSize: '11px' }}>
                    Test #{index + 1}
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                    {testCase.title}
                  </h3>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>
                    {testCase.testType}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {result && (
                    <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '12px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {result.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                      {result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  )}
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => handleRunSingle(testCase.id)}
                    disabled={isRunning}
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    {runningCaseId === testCase.id ? 'Running...' : 'Run Test'}
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
                {testCase.description}
              </p>

              {/* Input vs Expected vs Actual Columns */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '14px'
              }}>
                {/* 1. Input Section */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                    Untrusted Student Input
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Problem: </span>
                    <strong className="math-inline" style={{ fontSize: '11px' }}>{testCase.input.question}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Expected Answer: </span>
                    <strong style={{ color: '#10b981' }}>{testCase.input.expectedAnswer}</strong>
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Student Answer: </span>
                    <strong style={{ color: '#f59e0b' }}>{testCase.input.studentAnswer}</strong>
                  </div>
                  <div className="evidence-callout" style={{ fontSize: '12px', margin: 0, padding: '8px 10px' }}>
                    "{testCase.input.studentReasoning}"
                  </div>
                </div>

                {/* 2. Expected Behavior */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '11px', color: '#c084fc', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>
                    Expected Production Behavior
                  </div>
                  <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.5 }}>
                    {testCase.expected.expectedBehaviorSummary}
                  </div>
                  <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    {testCase.expected.diagnosis && (
                      <div>Target Diagnosis: <strong style={{ color: '#cbd5e1' }}>{testCase.expected.diagnosis}</strong></div>
                    )}
                    {testCase.expected.scopeStatus && (
                      <div>Target Scope: <strong style={{ color: '#cbd5e1' }}>{testCase.expected.scopeStatus}</strong></div>
                    )}
                  </div>
                </div>

                {/* 3. Actual Pipeline Execution */}
                <div style={{
                  background: result 
                    ? result.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                    : 'rgba(255, 255, 255, 0.02)',
                  border: result 
                    ? result.passed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px dashed var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#93c5fd', textTransform: 'uppercase', fontWeight: 600 }}>
                      Actual Pipeline Output
                    </span>
                    {result && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        ⏱ {result.latencyMs}ms
                      </span>
                    )}
                  </div>

                  {!result ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                      {isRunning ? 'Executing test on production pipeline...' : 'Test pending execution. Click "Run Test" or run the full suite.'}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '12px', color: '#f8fafc', marginBottom: '6px', lineHeight: 1.4 }}>
                        <strong>Output:</strong> {result.actualBehavior}
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                          Confidence: {Math.round(result.confidence * 100)}%
                        </span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>
                          Band: {result.confidenceBand}
                        </span>
                        <span className="badge badge-warning" style={{ fontSize: '10px' }}>
                          Scope: {result.scopeStatus}
                        </span>
                      </div>

                      {result.notes && (
                        <div style={{ fontSize: '11px', color: result.passed ? '#6ee7b7' : '#fca5a5', marginTop: '8px' }}>
                          ✓ {result.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
