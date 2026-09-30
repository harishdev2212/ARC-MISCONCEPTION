import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  RotateCcw,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { TRANSFER_QUESTIONS } from '@shared/constants';

interface TransferRecoveryPageProps {
  onNavigate: (view: string) => void;
}

export const TransferRecoveryPage: React.FC<TransferRecoveryPageProps> = ({ onNavigate }) => {
  const { 
    session, 
    transferQuestion, 
    recoveryAttempt, 
    updatedLearnerState, 
    submitRecovery, 
    isSubmitting,
    resetSession 
  } = useSession();

  const [transferReasoning, setTransferReasoning] = useState('');
  const [hasEvaluated, setHasEvaluated] = useState(!!recoveryAttempt);

  const transferQ = transferQuestion || session?.transferQuestion || TRANSFER_QUESTIONS[0];

  const handleSubmitRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferReasoning.trim() || isSubmitting) return;
    await submitRecovery(transferReasoning);
    setHasEvaluated(true);
  };

  const isRecovered = recoveryAttempt?.status === 'recovered';

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '780px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* 3-Step Progress Indicator: Solve (done) -> Reflect (done) -> Apply (active) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
      }}>
        {/* Step 1: Solve (Done) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            ✓
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
            Solve
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

        {/* Step 2: Reflect (Done) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            ✓
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
            Reflect
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

        {/* Step 3: Apply (Active) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            3
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            Apply
          </span>
        </div>
      </div>

      {/* Main Card: Try a New Problem / Apply What You Learned */}
      <section style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#2563eb',
          marginBottom: '8px'
        }}>
          Apply What You Learned
        </div>

        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#0f172a',
          margin: '0 0 6px 0',
          letterSpacing: '-0.015em'
        }}>
          Try a New Problem
        </h2>

        <p style={{
          fontSize: '15px',
          color: '#475569',
          margin: '0 0 24px 0',
          lineHeight: 1.5
        }}>
          Let's see if you can use the same idea on a different problem.
        </p>

        {/* New Equation Display */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '20px',
          textAlign: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '26px',
          fontWeight: 600,
          color: '#0f172a',
          letterSpacing: '0.04em',
          marginBottom: '20px'
        }}>
          {transferQ.equation}
        </div>

        <p style={{
          fontSize: '14px',
          color: '#64748b',
          margin: 0
        }}>
          {transferQ.prompt || 'Solve the equation and describe each step to keep both sides balanced.'}
        </p>
      </section>

      {/* Form or Result */}
      {!hasEvaluated ? (
        <form onSubmit={handleSubmitRecovery} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Your Reasoning for {transferQ.equation}
            </label>
            <textarea
              className="form-textarea"
              placeholder="Explain how you solve this new equation..."
              value={transferReasoning}
              onChange={(e) => setTransferReasoning(e.target.value)}
              rows={5}
              required
              autoFocus
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={() => onNavigate('diagnosis-intervention')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0'
              }}
            >
              ← Back to Reflection
            </button>

            <button
              type="submit"
              disabled={!transferReasoning.trim() || isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting || !transferReasoning.trim() ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && transferReasoning.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && transferReasoning.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Check Understanding</span>
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Evaluation Outcome Card */
        <section style={{
          backgroundColor: '#ffffff',
          border: isRecovered ? '1px solid #bbf7d0' : '1px solid #fde68a',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: isRecovered ? '#f0fdf4' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isRecovered ? '#16a34a' : '#d97706',
              flexShrink: 0
            }}>
              {isRecovered ? <CheckCircle2 size={24} /> : <RotateCcw size={22} />}
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                {isRecovered 
                  ? 'Great — you applied the same idea to a new problem.'
                  : "Let's practice this idea once more."}
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                {isRecovered
                  ? 'You maintained balance on both sides of the equation and solved it correctly.'
                  : 'You are making steady progress. With a bit more practice, keeping both sides balanced will become second nature.'}
              </p>
            </div>
          </div>

          {/* Feedback notes */}
          {recoveryAttempt?.feedbackNotes && (
            <div style={{
              backgroundColor: '#f8fafc',
              borderLeft: '3px solid #cbd5e1',
              borderRadius: '0 8px 8px 0',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#334155',
              lineHeight: 1.5
            }}>
              {recoveryAttempt.feedbackNotes}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              type="button"
              onClick={async () => {
                await resetSession();
                setHasEvaluated(false);
                setTransferReasoning('');
                onNavigate('learning-session');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#334155',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} />
              <span>Practice Another Problem</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('student-dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 22px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
              }}
            >
              <LayoutDashboard size={16} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </section>
      )}

    </div>
  );
};
