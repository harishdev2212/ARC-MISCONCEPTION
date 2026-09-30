import React from 'react';
import { AlertCircle, Target, ArrowRight } from 'lucide-react';
import { ImprovementItem } from './studentProgressBuilder';

interface ImprovementAreasProps {
  weaknesses: ImprovementItem[];
  onStartPractice?: () => void;
}

export const ImprovementAreas: React.FC<ImprovementAreasProps> = ({ weaknesses, onStartPractice }) => {
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
          backgroundColor: '#FEF3C7',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertCircle size={16} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Areas to Improve
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 0' }}>
        Skills that need a little more practice.
      </p>

      {weaknesses && weaknesses.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          {weaknesses.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                backgroundColor: '#FFFBEB',
                border: '1px solid #FEF3C7',
                borderLeft: '4px solid #D97706',
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
                  color: '#B45309',
                  backgroundColor: '#FEF3C7',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {item.status}
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#78350F', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                {item.explanation}
              </p>
              {item.attemptCount > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#92400E', fontWeight: 500 }}>
                  <Target size={12} />
                  <span>Noticed in {item.attemptCount} reasoning attempt{item.attemptCount > 1 ? 's' : ''}</span>
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
          backgroundColor: '#F0FDF4',
          borderRadius: '10px',
          border: '1px dashed #BBF7D0'
        }}>
          <p style={{ fontSize: '13px', color: '#166534', margin: '0 0 10px 0', fontWeight: 600 }}>
            No active cognitive difficulties detected!
          </p>
          <p style={{ fontSize: '12px', color: '#15803D', margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
            Your algebraic balance and reasoning have remained consistent. Keep practicing to maintain equality mastery.
          </p>
        </div>
      )}
    </div>
  );
};
