import React, { useEffect, useState } from 'react';
import { Target, Sparkles, BookOpen, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { ProgressSummaryData } from './studentProgressBuilder';

interface ProgressSummaryProps {
  summary: ProgressSummaryData;
}

export const ProgressSummary: React.FC<ProgressSummaryProps> = ({ summary }) => {
  // Animated count up hook
  const parseNum = (val: string | number) => {
    if (typeof val === 'number') return val;
    return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
  };

  const masteryTarget = parseNum(summary.currentMastery);
  const attemptsTarget = parseNum(summary.reasoningAttempts);
  const conceptsTarget = parseNum(summary.conceptsPracticed);
  const miscTarget = parseNum(summary.misconceptionsFound);

  const [masteryCount, setMasteryCount] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [conceptsCount, setConceptsCount] = useState(0);
  const [miscCount, setMiscCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1000;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setMasteryCount(Math.round(ease * masteryTarget));
      setAttemptsCount(Math.round(ease * attemptsTarget));
      setConceptsCount(Math.round(ease * conceptsTarget));
      setMiscCount(Math.round(ease * miscTarget));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [masteryTarget, attemptsTarget, conceptsTarget, miscTarget]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '18px',
      marginBottom: '28px'
    }}>
      {/* 1. Current Mastery */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(37, 99, 235, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            CURRENT MASTERY
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={18} />
          </div>
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, color: '#2563EB', lineHeight: 1.1 }}>
          {masteryCount}%
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#16A34A', marginTop: '8px', fontWeight: 600 }}>
          <ArrowUpRight size={14} />
          <span>Cumulative concept mastery</span>
        </div>
      </div>

      {/* 2. Reasoning Attempts */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(99, 102, 241, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            REASONING ATTEMPTS
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#F5F3FF',
            color: '#7C3AED',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
          {attemptsCount}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
          Free-form explanation submissions
        </div>
      </div>

      {/* 3. Concepts Practiced */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(16, 185, 129, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            CONCEPTS PRACTICED
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#ECFDF5',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={18} />
          </div>
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
          {conceptsCount}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
          Active curriculum skills
        </div>
      </div>

      {/* 4. Misconceptions Found */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '22px 24px',
        boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(217, 119, 6, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.03)';
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            MISCONCEPTIONS FOUND
          </span>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: '#FFFBEB',
            color: '#D97706',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div style={{ fontSize: '34px', fontWeight: 800, color: '#D97706', lineHeight: 1.1 }}>
          {miscCount}
        </div>
        <div style={{ fontSize: '12px', color: '#B45309', marginTop: '8px', fontWeight: 600 }}>
          Targeted for Socratic dialogue
        </div>
      </div>
    </div>
  );
};
