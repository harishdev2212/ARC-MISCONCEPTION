import React from 'react';
import { Layers } from 'lucide-react';
import { ConceptMasteryItem } from './studentProgressBuilder';

interface ConceptMasteryProps {
  masteryItems: ConceptMasteryItem[];
}

export const ConceptMastery: React.FC<ConceptMasteryProps> = ({ masteryItems }) => {
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
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Layers size={16} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
          Concept Mastery
        </h3>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
        Calculated from verified reasoning and transfer recovery checks.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1 }}>
        {masteryItems.map((item) => (
          <div key={item.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '8px' }}>
                  {item.category}
                </span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                {item.masteryPercent}%
              </span>
            </div>

            {/* Mastery Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: '#F1F5F9',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '6px'
            }}>
              <div style={{
                width: `${item.masteryPercent}%`,
                height: '100%',
                backgroundColor: item.masteryPercent >= 75 ? '#10B981' : item.masteryPercent >= 40 ? '#2563EB' : '#6366F1',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8' }}>
              <span>{item.statusText}</span>
              <span>Based on cognitive assessments</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
