import React, { useEffect } from 'react';
import { X, AlertCircle, HelpCircle, CheckCircle2, CornerDownRight, MessageSquareQuote } from 'lucide-react';
import { ErrorHistoryItem } from './studentProgressBuilder';

interface ErrorDetailModalProps {
  errorItem: ErrorHistoryItem | null;
  onClose: () => void;
}

export const ErrorDetailModal: React.FC<ErrorDetailModalProps> = ({ errorItem, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!errorItem) return null;

  const isRecovered = errorItem.outcome === 'Recovered';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeInUp 0.15s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F8FAFC'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                Reasoning Deep-Dive
              </span>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isRecovered ? '#16A34A' : '#D97706',
                backgroundColor: isRecovered ? '#DCFCE7' : '#FEF3C7',
                padding: '2px 8px',
                borderRadius: '999px'
              }}>
                {errorItem.outcome}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              {errorItem.detectedIssue} • {errorItem.timestamp}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E2E8F0')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. Problem */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Problem Equation
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '16px',
              fontWeight: 700,
              color: '#0F172A'
            }}>
              {errorItem.problem}
            </div>
          </div>

          {/* 2. Your Reasoning */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Your Reasoning
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#1E3A8A',
              fontStyle: 'italic',
              lineHeight: 1.5
            }}>
              "{errorItem.whatYouSaid}"
            </div>
          </div>

          {/* 3. What Went Wrong */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              What Went Wrong
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FEF3C7',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#92400E',
              lineHeight: 1.5
            }}>
              {errorItem.whatHappened}
            </div>
          </div>

          {/* 4. What MindTrace Noticed */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              What MindTrace Noticed
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#334155',
              lineHeight: 1.5
            }}>
              {errorItem.evidenceNotice}
            </div>
          </div>

          {/* 5. Question You Were Asked */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Socratic Question You Were Asked
            </div>
            <div style={{
              padding: '14px 16px',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#0369A1',
              fontWeight: 500,
              lineHeight: 1.5,
              display: 'flex',
              gap: '10px'
            }}>
              <MessageSquareQuote size={18} color="#0284C7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorItem.intervention}</span>
            </div>
          </div>

          {/* 6. Your Response (if available) */}
          {errorItem.studentReply && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Your Reflection Response
              </div>
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#334155',
                fontStyle: 'italic'
              }}>
                "{errorItem.studentReply}"
              </div>
            </div>
          )}

          {/* 7. Result */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              Outcome Result
            </div>
            <div style={{
              padding: '12px 16px',
              backgroundColor: isRecovered ? '#F0FDF4' : '#FFFBEB',
              border: `1px solid ${isRecovered ? '#BBF7D0' : '#FDE68A'}`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {isRecovered ? <CheckCircle2 size={18} color="#16A34A" /> : <AlertCircle size={18} color="#D97706" />}
              <span style={{ fontSize: '13px', fontWeight: 600, color: isRecovered ? '#166534' : '#92400E' }}>
                {isRecovered
                  ? 'Successfully recovered: Demonstrated balanced operations on follow-up reasoning.'
                  : 'Needs Practice: Continue practicing balanced two-sided operations.'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
