import React, { useEffect, useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { api } from '../services/api';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { 
  History, 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ChevronRight,
  Filter,
  Sparkles,
  BookOpen,
  Code,
  Languages
} from 'lucide-react';

export const PracticeHistoryPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentStudent } = useAuth();
  const { startSession, session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'verified' | 'flagged'>('all');

  useEffect(() => {
    async function loadHistory() {
      if (!currentStudent) return;
      try {
        setLoading(true);
        const data = await api.getStudentProgress(currentStudent.id);
        setActivities(data.recentActivities || []);
        setRecords(data.diagnosticRecords || []);
      } catch (err) {
        console.error('Failed to load practice history', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [currentStudent]);

  const handleStartPractice = async (subjectToPractice?: string) => {
    try {
      if (!session && currentStudent) {
        await startSession(currentStudent.id, { category: subjectToPractice || 'Mathematics' });
      }
      navigate('/practice');
    } catch (err) {
      console.error(err);
      navigate('/practice');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'verified') return r.diagnosis === 'correct_reasoning' || r.errorType === 'none' || r.result === 'CORRECT';
    if (filter === 'flagged') return r.diagnosis !== 'correct_reasoning' && r.diagnosis !== 'insufficient_evidence' && r.errorType !== 'none';
    return true;
  });

  const getSubjectBadge = (subj?: string) => {
    if (subj?.toLowerCase().includes('prog')) {
      return { bg: '#F5F3FF', text: '#7C3AED', border: '#DDD6FE', label: 'Programming', icon: Code };
    }
    if (subj?.toLowerCase().includes('eng')) {
      return { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA', label: 'English', icon: Languages };
    }
    return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE', label: 'Mathematics', icon: BookOpen };
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{
        flex: 1,
        padding: '36px 40px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Breadcrumb */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: 700,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '16px'
        }}>
          <span>COGNITIVE LOG</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: '#2563EB' }}>PRACTICE SESSION HISTORY</span>
        </div>

        {/* Header & Filter Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '18px',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 6px' }}>
              Practice Session History
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0 }}>
              Chronological audit log of your multi-subject reasoning, cognitive diagnoses, and interventions.
            </p>
          </div>

          <div style={{
            display: 'flex',
            backgroundColor: '#FFFFFF',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            gap: '4px'
          }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === 'all' ? '#2563EB' : 'transparent',
                color: filter === 'all' ? '#FFFFFF' : '#64748B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All Attempts ({records.length})
            </button>
            <button
              onClick={() => setFilter('verified')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === 'verified' ? '#059669' : 'transparent',
                color: filter === 'verified' ? '#FFFFFF' : '#64748B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Verified Correct
            </button>
            <button
              onClick={() => setFilter('flagged')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === 'flagged' ? '#D97706' : 'transparent',
                color: filter === 'flagged' ? '#FFFFFF' : '#64748B',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Misconceptions Flagged
            </button>
          </div>
        </div>

        {/* History Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', gap: '14px' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 600 }}>Loading practice history...</div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '56px 32px',
            textAlign: 'center',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <History size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              No Practice Records Found
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 auto 24px', maxWidth: '440px', lineHeight: 1.5 }}>
              Complete problem-solving sessions across Mathematics, Programming, or English to build your cognitive audit history.
            </p>
            <button
              onClick={() => handleStartPractice()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Target size={16} />
              <span>Start Practice Session</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredRecords.map((r, index) => {
              const isCorrect = r.diagnosis === 'correct_reasoning' || r.errorType === 'none' || r.result === 'CORRECT';
              const subjMeta = getSubjectBadge(r.subject || r.category);
              const SubjIcon = subjMeta.icon;

              return (
                <div key={r.id || index} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '22px 26px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '20px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.02)';
                }}>
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: subjMeta.bg,
                        color: subjMeta.text,
                        border: `1px solid ${subjMeta.border}`,
                        padding: '3px 9px',
                        borderRadius: '6px'
                      }}>
                        <SubjIcon size={12} />
                        <span>{r.subject || subjMeta.label}</span>
                      </span>

                      {r.topic && (
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                          • {r.topic}
                        </span>
                      )}

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        backgroundColor: isCorrect ? '#DCFCE7' : '#FEF3C7',
                        color: isCorrect ? '#166534' : '#92400E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {isCorrect ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                        <span>{isCorrect ? 'Verified Correct' : (r.misconceptionTag || 'Misconception Flagged')}</span>
                      </span>
                    </div>

                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#0F172A',
                      backgroundColor: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      marginBottom: '10px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {r.question || 'Problem statement'}
                    </div>

                    <div style={{ fontSize: '13px', color: '#334155', marginBottom: '6px', lineHeight: 1.5 }}>
                      <strong style={{ color: '#0F172A' }}>Student reasoning:</strong> <em>"{r.studentReasoning || r.reasoning || r.answer || 'Direct answer.'}"</em>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                      <strong style={{ color: '#475569' }}>Diagnostic analysis:</strong> {r.evidence || r.diagnosis || 'Step-by-step reasoning verified.'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>
                      <Clock size={13} />
                      <span>{r.timestamp ? new Date(r.timestamp).toLocaleDateString() : 'Recent session'}</span>
                    </span>

                    <button
                      onClick={() => handleStartPractice(r.subject || 'Mathematics')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#F8FAFC',
                        color: '#2563EB',
                        border: '1px solid #BFDBFE',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#EFF6FF';
                        e.currentTarget.style.borderColor = '#2563EB';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#BFDBFE';
                      }}
                    >
                      <span>Practice Topic</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
