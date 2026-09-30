import React from 'react';
import { AlertOctagon, ChevronRight, HelpCircle, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ErrorHistoryItem } from './studentProgressBuilder';

interface ErrorHistoryProps {
  errors: ErrorHistoryItem[];
  onSelectError: (errorItem: ErrorHistoryItem) => void;
}

export const ErrorHistory: React.FC<ErrorHistoryProps> = ({ errors, onSelectError }) => {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '26px 28px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      marginBottom: '28px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '7px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertOctagon size={16} />
          </div>
          <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Where Your Reasoning Went Wrong
          </h3>
        </div>

        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
          {errors.length} recorded mistake{errors.length === 1 ? '' : 's'}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
        Click any historical attempt to inspect your reasoning, what happened, and how the Socratic guidance intervened.
      </p>

      {errors && errors.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {errors.map((item) => {
            const isRecovered = item.outcome === 'Recovered';
            const isPending = item.outcome === 'In Progress';

            return (
              <div
                key={item.id}
                onClick={() => onSelectError(item)}
                style={{
                  padding: '16px 20px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Left: Problem & Reasoning summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '260px', flex: 1 }}>
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0F172A',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.problem}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                      {item.whatHappened}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      <span style={{ fontWeight: 500, color: '#475569' }}>You said:</span> "{item.whatYouSaid.length > 55 ? item.whatYouSaid.substring(0, 55) + '...' : item.whatYouSaid}"
                    </div>
                  </div>
                </div>

                {/* Middle: Detected Issue & Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#475569',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {item.detectedIssue}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
                      {item.timestamp}
                    </div>
                  </div>

                  {/* Right: Outcome badge & arrow */}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isRecovered ? '#16A34A' : isPending ? '#2563EB' : '#D97706',
                    backgroundColor: isRecovered ? '#DCFCE7' : isPending ? '#EFF6FF' : '#FEF3C7',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.outcome}
                  </span>

                  <ChevronRight size={16} color="#94A3B8" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '32px 20px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px dashed #E2E8F0'
        }}>
          <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 10px auto' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
            No reasoning errors on record!
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            As you solve multi-step equations in learning sessions, any flagged misconceptions will appear here with targeted Socratic insights.
          </p>
        </div>
      )}
    </div>
  );
};
