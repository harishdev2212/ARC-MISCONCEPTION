import React from 'react';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { StrengthItem } from './studentProgressBuilder';

interface StrengthsCardProps {
  strengths: StrengthItem[];
  onStartPractice?: () => void;
}

export const StrengthsCard: React.FC<StrengthsCardProps> = ({ strengths, onStartPractice }) => {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '24px 26px',
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          backgroundColor: '#DCFCE7',
          color: '#16A34A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShieldCheck size={16} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Your Strengths
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 0' }}>
        Concepts you are consistently handling well.
      </p>

      {strengths && strengths.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {strengths.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #F1F5F9',
                borderLeft: '4px solid #16A34A',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {item.concept}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#16A34A',
                  backgroundColor: '#DCFCE7',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {item.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.45 }}>
                {item.explanation}
              </p>
              {item.evidence && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16A34A', fontWeight: 500 }}>
                  <CheckCircle2 size={12} />
                  <span>{item.evidence}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '24px 16px',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px dashed #E2E8F0'
        }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 12px 0', maxWidth: '280px', lineHeight: 1.5 }}>
            Complete practice sessions with verified reasoning to unlock your confirmed strengths profile.
          </p>
          {onStartPractice && (
            <button
              type="button"
              onClick={onStartPractice}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <span>Practice Now</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
