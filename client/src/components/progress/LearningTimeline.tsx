import React from 'react';
import { History, CheckCircle2, AlertTriangle, Sparkles, Clock } from 'lucide-react';
import { TimelineEvent } from './studentProgressBuilder';

interface LearningTimelineProps {
  timeline: TimelineEvent[];
}

export const LearningTimeline: React.FC<LearningTimelineProps> = ({ timeline }) => {
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
            <History size={16} />
          </div>
          <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
            Learning History
          </h3>
        </div>

        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
          Chronological events
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
        A complete chronological trace of your practice attempts, feedback points, and concept recoveries.
      </p>

      {timeline && timeline.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {timeline.map((event) => {
            const isSuccess = event.type === 'success';
            const isWarning = event.type === 'warning';

            return (
              <div
                key={event.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  borderRadius: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: isSuccess ? '#DCFCE7' : isWarning ? '#FEF3C7' : '#EFF6FF',
                    color: isSuccess ? '#16A34A' : isWarning ? '#D97706' : '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSuccess ? <CheckCircle2 size={16} /> : isWarning ? <AlertTriangle size={15} /> : <Sparkles size={15} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                      {event.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {event.detail}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                  <Clock size={13} color="#94A3B8" />
                  <span>{event.timeAgo}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '24px 16px',
          textAlign: 'center',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px dashed #E2E8F0'
        }}>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            No recent activity recorded. Start a session to build your learning history!
          </p>
        </div>
      )}
    </div>
  );
};
