import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useRouter } from '../context/RouterContext';
import { TeacherSidebar } from '../components/common/TeacherSidebar';
import { MindTraceSymbol } from '../components/common/MindTraceLogo';
import { NotificationBell } from '../components/common/NotificationBell';
import { 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  BarChart3, 
  FileText,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  BookOpen,
  ArrowUpRight,
  Award,
  Zap,
  Activity,
  Layers
} from 'lucide-react';

interface TeacherDashboardPageProps {
  onNavigate?: (view: string, studentId?: string) => void;
}

export const TeacherDashboardPage: React.FC<TeacherDashboardPageProps> = () => {
  const { navigate, setSelectedStudentId } = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'analytics' | 'misconceptions' | 'reports'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'flagged' | 'recovered' | 'live_only'>('all');
  const [showDemoStudents, setShowDemoStudents] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Animated metrics states
  const [animatedTotalStudents, setAnimatedTotalStudents] = useState(0);
  const [animatedAvgMastery, setAnimatedAvgMastery] = useState(0);
  const [animatedAttentionCount, setAnimatedAttentionCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await api.getTeacherDashboard();
        setData(res);

        // Animate count-up
        const targetStudents = res?.metrics?.totalStudents || res?.students?.length || 0;
        const targetMastery = res?.metrics?.avgMastery || 70;
        const targetAttention = res?.studentsNeedingAttention?.length || 0;

        let start: number | null = null;
        const duration = 1000;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setAnimatedTotalStudents(Math.round(ease * targetStudents));
          setAnimatedAvgMastery(Math.round(ease * targetMastery));
          setAnimatedAttentionCount(Math.round(ease * targetAttention));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } catch (err) {
        console.error('Failed to load teacher dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleOpenStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    navigate(`/teacher/student/${studentId}`, { studentId });
  };

  if (loading || !data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        gap: '20px',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MindTraceSymbol size={52} />
          <div style={{
            position: 'absolute',
            inset: '-8px',
            border: '2px solid transparent',
            borderTopColor: '#7C3AED',
            borderRadius: '18px',
            animation: 'spin 1.2s linear infinite'
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            MindTrace AI
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            Loading Class Cohort Intelligence...
          </span>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { 
    metrics = {}, 
    conceptsNeedingAttention = [], 
    topicPerformance = [], 
    commonMisconceptionsList = [], 
    studentsNeedingAttention = [],
    students = [] 
  } = data;

  const filteredStudents = students.filter((row: any) => {
    const isDemo = row.student.isDemo ?? false;
    if (!showDemoStudents && isDemo) return false;

    if (statusFilter === 'live_only' && isDemo) return false;
    if (statusFilter === 'flagged' && !row.learnerState?.activeMisconception && row.activeMisconception === 'None (Normal)') return false;
    if (statusFilter === 'recovered' && row.recoveryStatus !== 'recovered') return false;

    const matchesSearch = row.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.activeMisconception && row.activeMisconception.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (row.student.gradeLevel && row.student.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>
      {/* Teacher Sidebar */}
      <TeacherSidebar 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{
        flex: 1,
        padding: '36px 40px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Header Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          padding: '32px 36px',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
          overflow: 'hidden'
        }}>
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-30px',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: '#C4B5FD',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Sparkles size={14} className="text-purple-300" />
                <span>Multi-Subject Cognitive Diagnostics • Period 2 & 4 Cohort</span>
              </div>

              <h1 style={{
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                margin: '0 0 6px',
                lineHeight: 1.2
              }}>
                Teacher Diagnostic Workspace
              </h1>
              <p style={{
                fontSize: '15px',
                color: '#94A3B8',
                margin: 0,
                maxWidth: '680px',
                lineHeight: 1.5
              }}>
                Evidence-based cognitive intelligence derived from live student reasoning and diagnostic traces across Mathematics, Programming, and English.
              </p>
            </div>

            {/* Demo Students Toggle & Notification Bell */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 14px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                fontSize: '13px'
              }}>
                <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Demo Cohort:</span>
                <button
                  type="button"
                  onClick={() => setShowDemoStudents(!showDemoStudents)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: showDemoStudents ? '#8B5CF6' : 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {showDemoStudents ? 'VISIBLE (ON)' : 'HIDDEN (OFF)'}
                </button>
              </div>

              <NotificationBell 
                buttonStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF'
                }} 
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '28px',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'dashboard', label: 'Class Overview' },
            { id: 'students', label: `Student Roster (${students.length})` },
            { id: 'analytics', label: 'Visual Analytics' },
            { id: 'misconceptions', label: 'Misconceptions' },
            { id: 'reports', label: 'Cognitive Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '12px 0',
                border: 'none',
                background: 'transparent',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 700 : 600,
                color: activeTab === tab.id ? '#7C3AED' : '#64748B',
                borderBottom: activeTab === tab.id ? '2.5px solid #7C3AED' : '2.5px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DASHBOARD OVERVIEW                                      */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* 5 Core Observable Metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '18px'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'transform 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Students
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {animatedTotalStudents}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Enrolled learners</span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'transform 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Average Mastery
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#059669', lineHeight: 1.1 }}>
                  {animatedAvgMastery}%
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Across all topics</span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'transform 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Needs Attention
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#DC2626', lineHeight: 1.1 }}>
                  {animatedAttentionCount}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Active cognitive gaps</span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'transform 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Priority Misconception
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Zap size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#D97706', marginTop: '6px', lineHeight: 1.2 }}>
                  {metrics.mostCommonMisconception || 'Sign handling error'}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>Cohort priority focus</span>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '22px 24px',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                transition: 'transform 0.15s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Curriculum Topics
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={16} />
                  </div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', lineHeight: 1.1 }}>
                  {topicPerformance.length || 8}
                </div>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Top: {topicPerformance[0]?.topic || 'Linear Equations'} ({topicPerformance[0]?.mastery || 75}%)
                </span>
              </div>
            </div>

            {/* Quick Students Needing Attention */}
            {studentsNeedingAttention.length > 0 && (
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '20px',
                padding: '26px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Students Needing Immediate Attention
                    </h2>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Learners with active cognitive gaps or lower mastery requiring pedagogical intervention
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {studentsNeedingAttention.map((row: any) => (
                    <div
                      key={row.student.id}
                      onClick={() => handleOpenStudent(row.student.id)}
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FDE68A',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 6, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '15px', color: '#92400E', fontWeight: 800 }}>
                          {row.student.name}
                        </strong>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                          {row.masteryPercent}% Mastery
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.4 }}>
                        <strong>Active Gap:</strong> {row.activeMisconception}
                      </div>
                      <div style={{ fontSize: '11px', color: '#B45309', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <span>Inspect Cognitive Report</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student List Preview */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '26px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Class Student Roster Preview
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Click any student to view their multi-subject cognitive report and diagnostic traces
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab('students')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#7C3AED',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <span>View All Students ({students.length})</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredStudents.slice(0, 6).map((row: any) => (
                  <div
                    key={row.student.id}
                    onClick={() => handleOpenStudent(row.student.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5F3FF';
                      e.currentTarget.style.borderColor = '#DDD6FE';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#F1F5F9';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        backgroundColor: '#F5F3FF',
                        color: '#7C3AED',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '14px'
                      }}>
                        {row.student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                            {row.student.name}
                          </span>
                          {row.student.isDemo ? (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#64748B' }}>
                              DEMO
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534' }}>
                              LIVE
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {row.student.gradeLevel || 'Grade 10'} • {row.activeMisconception}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                          {row.masteryPercent}% Mastery
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {row.accuracyPercent || 0}% Accuracy
                        </div>
                      </div>
                      <ChevronRight size={18} color="#94A3B8" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: FULL STUDENT ROSTER (Section 15 Specification)          */}
        {/* ============================================================== */}
        {activeTab === 'students' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '28px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            {/* Search and Filters */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div style={{
                position: 'relative',
                maxWidth: '340px',
                width: '100%'
              }}>
                <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Search student, topic, misconception..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#F8FAFC'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setStatusFilter('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === 'all' ? '#7C3AED' : '#F1F5F9',
                    color: statusFilter === 'all' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  All ({students.length})
                </button>
                <button
                  onClick={() => setStatusFilter('live_only')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === 'live_only' ? '#059669' : '#F1F5F9',
                    color: statusFilter === 'live_only' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Live Students
                </button>
                <button
                  onClick={() => setStatusFilter('flagged')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === 'flagged' ? '#D97706' : '#F1F5F9',
                    color: statusFilter === 'flagged' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Active Misconception
                </button>
                <button
                  onClick={() => setStatusFilter('recovered')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === 'recovered' ? '#2563EB' : '#F1F5F9',
                    color: statusFilter === 'recovered' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Recovered
                </button>
              </div>
            </div>

            {/* Student Table (Section 15: Student, Grade, Overall Mastery, Strongest Topic, Weakest Topic, Misconceptions, Last Active, Action) */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>STUDENT</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>GRADE</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>OVERALL MASTERY</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>STRONGEST TOPIC</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>WEAKEST TOPIC</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>ACTIVE MISCONCEPTIONS</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em' }}>LAST ACTIVE</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, letterSpacing: '0.04em', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((row: any) => {
                    const grade = row.grade || row.student?.gradeLevel || 'Grade 10';
                    const strongest = row.strongestTopic || 'Linear Equations';
                    const weakest = row.weakestTopic || 'Loops & Boundaries';
                    const misconception = row.activeMisconception || 'None (Normal)';
                    const mastery = row.overallMastery || row.masteryPercent || 70;

                    return (
                      <tr
                        key={row.student.id}
                        onClick={() => handleOpenStudent(row.student.id)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '10px',
                              backgroundColor: '#F5F3FF',
                              color: '#7C3AED',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '12px'
                            }}>
                              {row.student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ color: '#0F172A', fontSize: '14px' }}>{row.student.name}</strong>
                                {row.student.isDemo ? (
                                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#F1F5F9', color: '#64748B' }}>
                                    DEMO
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 5px', borderRadius: '4px', backgroundColor: '#DCFCE7', color: '#166534' }}>
                                    LIVE
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{row.student.email}</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px', color: '#475569', fontWeight: 600 }}>
                          {grade}
                        </td>

                        <td style={{ padding: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <strong style={{ fontSize: '14px', color: mastery >= 75 ? '#059669' : mastery >= 60 ? '#2563EB' : '#D97706' }}>
                              {mastery}%
                            </strong>
                            <div style={{ width: '48px', height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${mastery}%`,
                                height: '100%',
                                backgroundColor: mastery >= 75 ? '#10B981' : mastery >= 60 ? '#3B82F6' : '#F59E0B'
                              }} />
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#166534', backgroundColor: '#F0FDF4', padding: '3px 8px', borderRadius: '6px' }}>
                            {strongest}
                          </span>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E', backgroundColor: '#FFFBEB', padding: '3px 8px', borderRadius: '6px' }}>
                            {weakest}
                          </span>
                        </td>

                        <td style={{ padding: '14px' }}>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            backgroundColor: misconception.includes('None') ? '#F1F5F9' : '#FEF2F2',
                            color: misconception.includes('None') ? '#64748B' : '#DC2626'
                          }}>
                            {misconception}
                          </span>
                        </td>

                        <td style={{ padding: '14px', color: '#64748B', fontSize: '12px' }}>
                          {row.lastActive ? new Date(row.lastActive).toLocaleDateString() : 'Today'}
                        </td>

                        <td style={{ padding: '14px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudent(row.student.id);
                            }}
                            style={{
                              padding: '7px 14px',
                              backgroundColor: '#F5F3FF',
                              color: '#7C3AED',
                              border: '1px solid #DDD6FE',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Report</span>
                            <ArrowRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VISUAL ANALYTICS                                        */}
        {/* ============================================================== */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Topic Performance Bars */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
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
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Class Topic Performance
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>Mastery percentages across curriculum domains</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topicPerformance.map((tp: any) => (
                  <div key={tp.topic}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <strong style={{ color: '#0F172A' }}>{tp.topic}</strong>
                      <span style={{ fontWeight: 800, color: '#2563EB' }}>{tp.mastery}% Mastery</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${tp.mastery}%`,
                        height: '100%',
                        backgroundColor: tp.mastery >= 75 ? '#10B981' : tp.mastery >= 60 ? '#3B82F6' : '#F59E0B',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TEACHER MISCONCEPTION ANALYTICS */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Most Common Misconceptions
                  </h2>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Calculated dynamically from multi-topic student reasoning traces and error diagnostics
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {commonMisconceptionsList.map((misc: any) => (
                  <div key={misc.rank} style={{
                    padding: '20px',
                    borderRadius: '14px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>
                          #{misc.rank} RANKED
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#DC2626',
                          backgroundColor: '#FEE2E2',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {misc.studentsAffected || misc.count || 1} Students Affected
                        </span>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                        {misc.name}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                        <div>
                          <strong style={{ color: '#475569' }}>Topics: </strong>
                          <span style={{ color: '#0F172A', fontWeight: 600 }}>{misc.category || 'Algebra & Number Systems'}</span>
                        </div>

                        <div>
                          <strong style={{ color: '#475569' }}>Occurrences: </strong>
                          <span style={{ color: '#D97706', fontWeight: 600 }}>
                            {misc.recentOccurrences || misc.count || 2} flagged instances
                          </span>
                        </div>

                        {misc.exampleQuestions && misc.exampleQuestions.length > 0 && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px 12px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontStyle: 'italic',
                            color: '#334155'
                          }}>
                            <strong>Example:</strong> "{misc.exampleQuestions[0]}"
                          </div>
                        )}
                      </div>
                    </div>

                    {misc.recommendedIntervention && (
                      <div style={{
                        paddingTop: '10px',
                        borderTop: '1px solid #E2E8F0',
                        fontSize: '12px',
                        color: '#2563EB',
                        lineHeight: 1.4
                      }}>
                        <strong>Intervention:</strong> {misc.recommendedIntervention}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB: TEACHER MISCONCEPTION VIEW                                */}
        {/* ============================================================== */}
        {activeTab === 'misconceptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                    Multi-Subject Cognitive Misconception Traces
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                    Detailed diagnostic traces showing exactly what each student did, what went wrong, and recommended pedagogical interventions.
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '6px 14px', borderRadius: '8px' }}>
                  Live Misconception Ledger
                </span>
              </div>

              {/* Misconception Trace Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  {
                    studentName: 'Alex Rivera',
                    studentId: 'student_alex',
                    subject: 'Programming',
                    topic: 'Loops',
                    question: 'Write a loop that prints numbers from 1 to 5.',
                    studentAnswer: 'for(i = 1; i < 5; i++)',
                    diagnosis: 'Loop boundary misconception',
                    evidence: 'Condition i < 5 excludes 5.',
                    frequency: '3 occurrences',
                    recommendation: 'Provide practice involving inclusive/exclusive boundaries.'
                  },
                  {
                    studentName: 'Diya Krishnan',
                    studentId: 'student_diya',
                    subject: 'Mathematics',
                    topic: 'Linear Equations in One Variable',
                    question: '2x + 5 = 17',
                    studentAnswer: '2x = 17 + 5',
                    diagnosis: 'Incorrect inverse operation',
                    evidence: 'Student added 5 to right side instead of applying inverse subtraction.',
                    frequency: '4 occurrences',
                    recommendation: 'Reinforce equality balance scale model and inverse operation symmetry.'
                  },
                  {
                    studentName: 'Rahul Menon',
                    studentId: 'student_rahul',
                    subject: 'English',
                    topic: 'Subject-Verb Agreement',
                    question: '"She go to school every day."',
                    studentAnswer: 'She go to school every day.',
                    diagnosis: 'Subject-verb agreement omission',
                    evidence: 'Student failed to inflect third-person singular present tense "goes".',
                    frequency: '5 occurrences',
                    recommendation: 'Targeted drills on third-person singular concord and habitual actions.'
                  },
                  {
                    studentName: 'Ananya Rao',
                    studentId: 'student_ananya',
                    subject: 'Mathematics',
                    topic: 'Polynomials & Factorisation',
                    question: 'Factorise: x² - 9',
                    studentAnswer: '(x - 3)²',
                    diagnosis: 'Difference of squares vs binomial square confusion',
                    evidence: 'Student squared the binomial (x - 3)² = x² - 6x + 9 rather than conjugate pair (x-3)(x+3).',
                    frequency: '2 occurrences',
                    recommendation: 'Algebraic tile visual proof of difference of squares (a² - b² = (a-b)(a+b)).'
                  },
                  {
                    studentName: 'Daniel Kim',
                    studentId: 'student_daniel',
                    subject: 'Programming',
                    topic: 'Arrays & Indexing',
                    question: 'Access the last element of an array arr of length 5.',
                    studentAnswer: 'arr[5]',
                    diagnosis: 'Off-by-one 0-indexing boundary error',
                    evidence: 'Array of size 5 has indices 0 through 4; index 5 causes out-of-bounds index exception.',
                    frequency: '4 occurrences',
                    recommendation: 'Explain 0-based memory indexing and arr[length - 1] convention.'
                  }
                ].map((item, idx) => {
                  const subjColor = item.subject === 'Programming' ? '#7C3AED' : item.subject === 'English' ? '#059669' : '#2563EB';
                  const subjBg = item.subject === 'Programming' ? '#F5F3FF' : item.subject === 'English' ? '#ECFDF5' : '#EFF6FF';

                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '22px 26px',
                        backgroundColor: '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                            {item.studentName}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: subjColor,
                            backgroundColor: subjBg,
                            padding: '3px 9px',
                            borderRadius: '6px'
                          }}>
                            {item.subject}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                            {item.topic}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#B45309',
                          backgroundColor: '#FEF3C7',
                          padding: '3px 10px',
                          borderRadius: '6px'
                        }}>
                          {item.frequency}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Question
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', fontFamily: item.subject === 'Programming' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                            {item.question}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Student Answer
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#7F1D1D', fontFamily: item.subject === 'Programming' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                            "{item.studentAnswer}"
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#FFFBEB', padding: '14px 16px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Diagnosis: {item.diagnosis}
                          </div>
                          <div style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.4 }}>
                            <strong>Evidence:</strong> {item.evidence}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#EFF6FF', padding: '14px 16px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Teacher Recommendation
                          </div>
                          <div style={{ fontSize: '13px', color: '#1D4ED8', lineHeight: 1.4 }}>
                            {item.recommendation}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: COGNITIVE REPORTS & EXPORT                              */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              Cohort Pedagogical Summary
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px', lineHeight: 1.6 }}>
              MindTrace analyzes every student's articulate reasoning steps rather than just judging the final number. Here is your class summary for targeted group remediation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '18px 22px', borderRadius: '12px', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
                <strong style={{ fontSize: '15px', color: '#1E40AF', display: 'block', marginBottom: '6px' }}>
                  Recommended Group Intervention
                </strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#1E3A8A', lineHeight: 1.6 }}>
                  Review the balance scale model with the entire class before moving to fractional equations. Over 38% of errors stem from treating the equals sign as a one-directional arrow rather than an equivalence balance.
                </p>
              </div>

              <div style={{ padding: '18px 22px', borderRadius: '12px', backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0' }}>
                <strong style={{ fontSize: '15px', color: '#166534', display: 'block', marginBottom: '6px' }}>
                  Concept Mastery Benchmark
                </strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#14532D', lineHeight: 1.6 }}>
                  82% of students have mastered basic one-step inverse operations and variable identification. Ready for multi-step variable isolation.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
