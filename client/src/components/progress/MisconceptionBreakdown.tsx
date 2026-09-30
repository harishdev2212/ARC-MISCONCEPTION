import React from 'react';
import { BarChart3, Info } from 'lucide-react';
import { MisconceptionPattern } from './studentProgressBuilder';

interface MisconceptionBreakdownProps {
  misconceptions: MisconceptionPattern[];
}

export const MisconceptionBreakdown: React.FC<MisconceptionBreakdownProps> = ({ misconceptions }) => {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '16px',
      padding: '26px 28px',
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
          backgroundColor: '#EEF2FF',
          color: '#6366F1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BarChart3 size={16} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Common Error Patterns
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
        Distribution of error patterns observed across your reasoning submissions.
      </p>

      {misconceptions && misconceptions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {misconceptions.map((item) => (
            <div key={item.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB' }}>
                  {item.count} attempt{item.count === 1 ? '' : 's'} ({item.percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#F1F5F9',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '6px'
              }}>
                <div style={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  backgroundColor: item.name.includes('Balance') ? '#2563EB' : item.name.includes('Inverse') ? '#8B5CF6' : '#F59E0B',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                {item.description}
              </div>
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
          <Info size={24} color="#64748B" style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
            No recurring misconceptions yet.
          </div>
          <p style={{ fontSize: '12px', color: '#64748B', margin: 0, maxWidth: '260px' }}>
            Keep solving equations! Any recurring error patterns will appear here as you practice.
          </p>
        </div>
      )}
    </div>
  );
};
