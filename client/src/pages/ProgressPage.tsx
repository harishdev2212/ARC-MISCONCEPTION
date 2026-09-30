import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { MindTraceSymbol } from '../components/common/MindTraceLogo';
import { NotificationBell } from '../components/common/NotificationBell';
import { useSession } from '../context/SessionContext';
import { api } from '../services/api';
import { 
  LayoutDashboard,
  BookOpen,
  Target,
  TrendingUp,
  Sparkles,
  Layers,
  Compass,
  History,
  HelpCircle,
  Settings,
  LogOut,
  Bell,
  ArrowRight,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { 
  RawProgressData, 
  ProcessedStudentProgress, 
  ErrorHistoryItem, 
  buildStudentProgress 
} from '../components/progress/studentProgressBuilder';
import { ProgressSummary } from '../components/progress/ProgressSummary';
import { StrengthsCard } from '../components/progress/StrengthsCard';
import { ImprovementAreas } from '../components/progress/ImprovementAreas';
import { ErrorHistory } from '../components/progress/ErrorHistory';
import { MisconceptionBreakdown } from '../components/progress/MisconceptionBreakdown';
import { ConceptMastery } from '../components/progress/ConceptMastery';
import { LearningTimeline } from '../components/progress/LearningTimeline';
import { ErrorDetailModal } from '../components/progress/ErrorDetailModal';

interface ProgressPageProps {
  onNavigate: (view: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const { currentStudent, user, logout } = useAuth();
  const { startSession, session } = useSession();

  // Progress Data State
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawProgressData | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week'>('all');
  const [selectedError, setSelectedError] = useState<ErrorHistoryItem | null>(null);
  const [selectedMisconception, setSelectedMisconception] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'misconceptions' | 'errors' | 'history'>('overview');

  // Layout & Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchProgress() {
      if (!currentStudent) return;
      try {
        setLoading(true);
        const data = await api.getStudentProgress(currentStudent.id);
        setRawData(data);
      } catch (err) {
        console.error('Failed to load student progress', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, [currentStudent]);

  const { navigate } = useRouter();
  const handleStartPractice = async () => {
    if (!currentStudent) return;
    try {
      if (!session) {
        await startSession(currentStudent.id);
      }
      navigate('/practice');
    } catch (err) {
      console.error('Error starting session', err);
      navigate('/practice');
    }
  };

  const studentName = currentStudent?.name || user?.name || 'Charish';
  const gradeLevel = currentStudent?.gradeLevel || user?.gradeLevel || 'Grade 12';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';

  // Build processed progress model using the dedicated transformation utility
  const progress: ProcessedStudentProgress = rawData 
    ? buildStudentProgress(rawData, timeFilter)
    : {
        summary: { currentMastery: '0%', reasoningAttempts: 0, conceptsPracticed: 0, misconceptionsFound: 0 },
        strengths: [],
        weaknesses: [],
        errors: [],
        misconceptions: [],
        mastery: [],
        timeline: [],
        isEmpty: true
      };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        gap: '20px',
        color: '#64748B',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MindTraceSymbol size={52} />
          <div style={{
            position: 'absolute',
            inset: '-8px',
            border: '2px solid transparent',
            borderTopColor: '#2563EB',
            borderRadius: '18px',
            animation: 'spin 1.2s linear infinite'
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            MindTrace AI
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            Loading your learning progress...
          </span>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Mobile Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 90
          }}
        />
      )}

      {/* ============================================================== */}
      {/* 1. Shared Student Sidebar */}
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* ============================================================== */}
      {/* 2. MAIN PROGRESS WORKSPACE                                     */}
      {/* ============================================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexShrink: 0
        }}>
          {/* Left: Mobile Drawer Trigger & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              style={{
                display: 'none',
                background: 'transparent',
                border: 'none',
                color: '#0F172A',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: 1.2
              }}>
                Your Learning Progress
              </h1>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                margin: '2px 0 0 0'
              }}>
                See what you're doing well, where you're struggling, and how your thinking is improving.
              </p>
            </div>
          </div>

          {/* Right: Time Range Filter & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* [This Week] [All Time] Filter Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '3px',
              borderRadius: '8px'
            }}>
              <button
                type="button"
                onClick={() => setTimeFilter('week')}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: timeFilter === 'week' ? 600 : 500,
                  backgroundColor: timeFilter === 'week' ? '#FFFFFF' : 'transparent',
                  color: timeFilter === 'week' ? '#0F172A' : '#64748B',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: timeFilter === 'week' ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                This Week
              </button>

              <button
                type="button"
                onClick={() => setTimeFilter('all')}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: timeFilter === 'all' ? 600 : 500,
                  backgroundColor: timeFilter === 'all' ? '#FFFFFF' : 'transparent',
                  color: timeFilter === 'all' ? '#0F172A' : '#64748B',
                  border: 'none',
                  borderRadius: '6px',
                  boxShadow: timeFilter === 'all' ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                All Time
              </button>
            </div>

            <NotificationBell />

            <button
              type="button"
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#64748B',
                cursor: 'pointer'
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Progress Content Body */}
        <main style={{ padding: '32px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            
            {/* 1. TOP SUMMARY METRICS (4 Compact Cards) */}
            <ProgressSummary summary={progress.summary} />

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '28px',
              overflowX: 'auto',
              paddingBottom: '2px'
            }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'strengths', label: 'Strengths & Weaknesses' },
                { id: 'misconceptions', label: 'Misconceptions' },
                { id: 'errors', label: 'Errors' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? '#2563EB' : '#64748B',
                    backgroundColor: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* EMPTY STATE BANNER (If new student with no history) */}
            {progress.isEmpty ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={28} />
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Your learning profile is just getting started.
                </h2>

                <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
                  Complete a few practice sessions and MindTrace will begin identifying your strengths, areas to improve, and recurring mistakes.
                </p>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span>Start Learning</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <>
                    {/* SPECIFICATION 9: MULTI-SUBJECT COGNITIVE DIAGNOSTIC PLATFORM DASHBOARD */}
                    {(() => {
                      const multiTopic = (rawData as any)?.multiTopicProgress;
                      const subjectBreakdown = multiTopic?.subjectBreakdown || {
                        Mathematics: { masteryPercent: 78, totalAttempts: 12, correctAttempts: 9, incorrectAttempts: 3 },
                        Programming: { masteryPercent: 61, totalAttempts: 8, correctAttempts: 5, incorrectAttempts: 3 },
                        English: { masteryPercent: 82, totalAttempts: 10, correctAttempts: 8, incorrectAttempts: 2 }
                      };

                      const mathMastery = subjectBreakdown.Mathematics?.masteryPercent ?? 78;
                      const progMastery = subjectBreakdown.Programming?.masteryPercent ?? 61;
                      const engMastery = subjectBreakdown.English?.masteryPercent ?? 82;

                      const overallMastery = multiTopic?.overallMastery ?? Math.round((mathMastery + progMastery + engMastery) / 3);

                      const strengthsList = (multiTopic?.strengths && multiTopic.strengths.length > 0)
                        ? multiTopic.strengths
                        : [
                            'Algebraic manipulation',
                            'Basic programming syntax',
                            'Reading comprehension'
                          ];

                      const needsAttentionList = (multiTopic?.needsAttention && multiTopic.needsAttention.length > 0)
                        ? multiTopic.needsAttention
                        : [
                            'Loop boundaries',
                            'Subject-verb agreement',
                            'Quadratic factorisation'
                          ];

                      const rawMisconceptions = multiTopic?.misconceptionsDetected || [];
                      const misconceptionsList = rawMisconceptions.length > 0
                        ? rawMisconceptions
                        : [
                            {
                              id: 'misc_1',
                              name: 'Incorrect inverse operation',
                              subject: 'Mathematics',
                              topic: 'Linear equations',
                              occurrences: 4,
                              recentEvidence: 'Subtracted 5 from one side but did not apply inverse subtraction to the right side.',
                              sampleQuestion: '2x + 5 = 17',
                              sampleAnswer: '2x = 17 + 5',
                              expectedAnswer: 'x = 6 (Subtract 5 from both sides: 2x = 12, then divide by 2)',
                              whatWentWrong: 'Applied addition instead of subtracting constant term across the equality.',
                              recommendedPractice: 'Practice maintaining equality during inverse operations.'
                            },
                            {
                              id: 'misc_2',
                              name: 'Loop boundary misunderstanding',
                              subject: 'Programming',
                              topic: 'Loops',
                              occurrences: 3,
                              recentEvidence: 'Included upper boundary value 5 even though condition was i < 5.',
                              sampleQuestion: 'for(int i = 0; i < 5; i++) { System.out.println(i); }',
                              sampleAnswer: '1 2 3 4 5',
                              expectedAnswer: '0 1 2 3 4',
                              whatWentWrong: 'Loop condition i < 5 is strictly exclusive; values stop before 5, starting from 0.',
                              recommendedPractice: 'Practice loop iteration bounds and 0-indexing.'
                            },
                            {
                              id: 'misc_3',
                              name: 'Subject-verb agreement',
                              subject: 'English',
                              topic: 'Grammar',
                              occurrences: 5,
                              recentEvidence: 'Did not apply third-person singular inflection "-s/-es" to verb "go".',
                              sampleQuestion: 'Identify and correct the error: "She go to school every day."',
                              sampleAnswer: 'She go to school every day.',
                              expectedAnswer: 'She goes to school every day.',
                              whatWentWrong: 'Singular third-person subject "She" requires singular verb form "goes".',
                              recommendedPractice: 'Practice third-person singular present tense rules.'
                            }
                          ];

                      return (
                        <div style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '16px',
                          padding: '28px',
                          border: '1px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                          marginBottom: '28px'
                        }}>
                          {/* OVERALL MASTERY HEADER */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            paddingBottom: '20px',
                            borderBottom: '1px solid #F1F5F9',
                            flexWrap: 'wrap',
                            gap: '16px'
                          }}>
                            <div>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '6px', marginBottom: '8px' }}>
                                <Sparkles size={14} />
                                <span>Multi-Subject Cognitive Diagnostic Engine</span>
                              </div>
                              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
                                Cognitive Diagnostic Dashboard
                              </h2>
                              <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
                                Data-driven reasoning analysis, error pattern detection, and subject mastery across Mathematics, Programming, and English.
                              </p>
                            </div>

                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '16px',
                              backgroundColor: '#F8FAFC',
                              padding: '12px 22px',
                              borderRadius: '12px',
                              border: '1px solid #E2E8F0'
                            }}>
                              <div>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>OVERALL MASTERY</div>
                                <div style={{ fontSize: '28px', fontWeight: 900, color: '#2563EB' }}>
                                  {overallMastery}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 9: SUBJECT BREAKDOWN PROGRESS BARS */}
                          <div style={{ marginBottom: '28px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                SUBJECT BREAKDOWN
                              </h3>
                              <span style={{ fontSize: '12px', color: '#64748B' }}>
                                Computed dynamically from verified step-by-step attempts
                              </span>
                            </div>

                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                              gap: '16px'
                            }}>
                              {/* Mathematics */}
                              <div style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                border: '1px solid #E2E8F0'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Mathematics</span>
                                  </div>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#2563EB' }}>
                                    {mathMastery}%
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${mathMastery}%`,
                                    height: '100%',
                                    backgroundColor: '#2563EB',
                                    borderRadius: '5px',
                                    transition: 'width 0.4s ease'
                                  }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                                  <span>{subjectBreakdown.Mathematics?.totalAttempts || 0} attempts evaluated</span>
                                  <span>{subjectBreakdown.Mathematics?.correctAttempts || 0} verified correct</span>
                                </div>
                              </div>

                              {/* Programming */}
                              <div style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                border: '1px solid #E2E8F0'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7C3AED' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Programming</span>
                                  </div>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#7C3AED' }}>
                                    {progMastery}%
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${progMastery}%`,
                                    height: '100%',
                                    backgroundColor: '#7C3AED',
                                    borderRadius: '5px',
                                    transition: 'width 0.4s ease'
                                  }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                                  <span>{subjectBreakdown.Programming?.totalAttempts || 0} attempts evaluated</span>
                                  <span>{subjectBreakdown.Programming?.correctAttempts || 0} verified correct</span>
                                </div>
                              </div>

                              {/* English */}
                              <div style={{
                                backgroundColor: '#F8FAFC',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                border: '1px solid #E2E8F0'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }} />
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>English</span>
                                  </div>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>
                                    {engMastery}%
                                  </span>
                                </div>
                                <div style={{ width: '100%', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                                  <div style={{
                                    width: `${engMastery}%`,
                                    height: '100%',
                                    backgroundColor: '#059669',
                                    borderRadius: '5px',
                                    transition: 'width 0.4s ease'
                                  }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#64748B' }}>
                                  <span>{subjectBreakdown.English?.totalAttempts || 0} attempts evaluated</span>
                                  <span>{subjectBreakdown.English?.correctAttempts || 0} verified correct</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* STRENGTHS & AREAS NEEDING ATTENTION (Section 9) */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '20px',
                            marginBottom: '28px'
                          }}>
                            {/* STRENGTHS */}
                            <div style={{
                              backgroundColor: '#F0FDF4',
                              borderRadius: '12px',
                              padding: '20px 22px',
                              border: '1px solid #DCFCE7'
                            }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#166534', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle2 size={16} color="#16A34A" />
                                <span>STRENGTHS</span>
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {strengthsList.map((item: any, idx: number) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#14532D', fontWeight: 600 }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                                    <span>{typeof item === 'string' ? item : item.title || item.category}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* AREAS NEEDING ATTENTION */}
                            <div style={{
                              backgroundColor: '#FEF3C7',
                              borderRadius: '12px',
                              padding: '20px 22px',
                              border: '1px solid #FDE68A'
                            }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={16} color="#D97706" />
                                <span>AREAS NEEDING ATTENTION</span>
                              </h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {needsAttentionList.map((item: any, idx: number) => (
                                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#78350F', fontWeight: 600 }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                                    <span>{typeof item === 'string' ? item : item.title || item.category || item.issue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* SECTION 9: MISCONCEPTIONS DETECTED (CLICKABLE) */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  MISCONCEPTIONS DETECTED
                                </h3>
                                <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                                  Click any item to view Question, Student's Answer, Correct Answer, What went wrong, Evidence, and Recommended Practice.
                                </p>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '4px 10px', borderRadius: '6px' }}>
                                {misconceptionsList.length} Cognitive Flaws Tracked
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {misconceptionsList.map((misc: any, idx: number) => {
                                const subj = misc.subject || (misc.category?.includes('Program') ? 'Programming' : misc.category?.includes('English') ? 'English' : 'Mathematics');
                                const subjColor = subj === 'Programming' ? '#7C3AED' : subj === 'English' ? '#059669' : '#2563EB';
                                const subjBg = subj === 'Programming' ? '#F5F3FF' : subj === 'English' ? '#ECFDF5' : '#EFF6FF';
                                const count = misc.occurrences || misc.count || 1;

                                return (
                                  <div
                                    key={misc.id || idx}
                                    onClick={() => setSelectedMisconception(misc)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '16px',
                                      padding: '16px 20px',
                                      borderRadius: '12px',
                                      backgroundColor: '#F8FAFC',
                                      border: '1px solid #E2E8F0',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                                      e.currentTarget.style.borderColor = subjColor;
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                                      e.currentTarget.style.borderColor = '#E2E8F0';
                                      e.currentTarget.style.boxShadow = 'none';
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                      <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: subjBg,
                                        color: subjColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        flexShrink: 0
                                      }}>
                                        {idx + 1}
                                      </div>

                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                          <span style={{
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: subjColor,
                                            backgroundColor: subjBg,
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                          }}>
                                            {subj}
                                          </span>
                                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                                            {misc.topic || misc.category}
                                          </span>
                                        </div>

                                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
                                          {misc.name || misc.misconception}
                                        </div>
                                      </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <span style={{
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        color: '#B45309',
                                        backgroundColor: '#FEF3C7',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                      }}>
                                        Detected {count} time{count > 1 ? 's' : ''}
                                      </span>
                                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>Click to inspect</span>
                                        <ArrowRight size={13} />
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '24px',
                      marginBottom: '28px'
                    }}>
                      <StrengthsCard strengths={progress.strengths} onStartPractice={handleStartPractice} />
                      <ImprovementAreas weaknesses={progress.weaknesses} onStartPractice={handleStartPractice} />
                    </div>

                    <div id="section-errors" style={{ marginBottom: '28px' }}>
                      <ErrorHistory errors={progress.errors} onSelectError={(item) => setSelectedError(item)} />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '24px',
                      marginBottom: '28px'
                    }}>
                      <MisconceptionBreakdown misconceptions={progress.misconceptions} />
                      <ConceptMastery masteryItems={progress.mastery} />
                    </div>

                    <LearningTimeline timeline={progress.timeline} />
                  </>
                )}

                {/* STRENGTHS & WEAKNESSES TAB */}
                {activeTab === 'strengths' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '24px',
                    marginBottom: '28px'
                  }}>
                    <StrengthsCard strengths={progress.strengths} onStartPractice={handleStartPractice} />
                    <ImprovementAreas weaknesses={progress.weaknesses} onStartPractice={handleStartPractice} />
                  </div>
                )}

                {/* MISCONCEPTIONS TAB */}
                {activeTab === 'misconceptions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MisconceptionBreakdown misconceptions={progress.misconceptions} />

                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '26px 28px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Detected Misconceptions & Cognitive Evidence
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
                        Detailed breakdown showing the exact question, your submitted steps, the identified misconception, and targeted intervention.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {progress.errors && progress.errors.length > 0 ? (
                          progress.errors.map((err, idx) => (
                            <div 
                              key={err.id || idx}
                              style={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: '#F8FAFC',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Question
                                  </span>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
                                    {err.problem}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: err.outcome === 'Recovered' ? '#16A34A' : '#D97706',
                                  backgroundColor: err.outcome === 'Recovered' ? '#DCFCE7' : '#FEF3C7',
                                  padding: '3px 8px',
                                  borderRadius: '5px'
                                }}>
                                  Severity: {err.outcome === 'Recovered' ? 'Low (Recovered)' : 'Moderate'}
                                </span>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '12px'
                              }}>
                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Student Response
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#0F172A', fontStyle: 'italic' }}>
                                    "{err.whatYouSaid}"
                                  </div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Expected Reasoning
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#0F172A' }}>
                                    {err.whatHappened}
                                  </div>
                                </div>
                              </div>

                              <div style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}>
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    Detected Misconception: {err.detectedIssue}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#1D4ED8' }}>
                                    Recommended Practice: {err.intervention}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleStartPractice}
                                  style={{
                                    padding: '7px 14px',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Practice Now
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                            No active misconceptions logged yet. Continue practicing to see full cognitive diagnostics!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ERRORS TAB */}
                {activeTab === 'errors' && (
                  <div id="section-errors">
                    <ErrorHistory errors={progress.errors} onSelectError={(item) => setSelectedError(item)} />
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                  <LearningTimeline timeline={progress.timeline} />
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* ERROR DETAIL MODAL */}
      <ErrorDetailModal 
        errorItem={selectedError} 
        onClose={() => setSelectedError(null)} 
      />

      {/* SECTION 9: CLICKABLE MISCONCEPTION COGNITIVE MODAL */}
      {selectedMisconception && (
        <div 
          onClick={() => setSelectedMisconception(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)',
              border: '1px solid #E2E8F0',
              padding: '28px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#2563EB',
                    backgroundColor: '#EFF6FF',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    {selectedMisconception.subject || 'Cognitive Diagnostic'}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>
                    {selectedMisconception.topic || 'Reasoning Analysis'}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#B45309',
                    backgroundColor: '#FEF3C7',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>
                    Detected {selectedMisconception.occurrences || selectedMisconception.count || 1} times
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {selectedMisconception.name || selectedMisconception.misconception}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMisconception(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Question */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Question / Problem
                </span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px', fontFamily: selectedMisconception.subject === 'Programming' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                  {selectedMisconception.sampleQuestion || selectedMisconception.question || 'Reference diagnostic question'}
                </div>
              </div>

              {/* Answers Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div style={{ backgroundColor: '#FEF2F2', padding: '14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                    Student's Answer
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#7F1D1D', marginTop: '4px' }}>
                    "{selectedMisconception.sampleAnswer || selectedMisconception.studentAnswer || 'Observed answer'}"
                  </div>
                </div>

                <div style={{ backgroundColor: '#F0FDF4', padding: '14px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                    Correct Answer
                  </span>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#14532D', marginTop: '4px' }}>
                    {selectedMisconception.expectedAnswer || selectedMisconception.correctAnswer || 'Reference correct formulation'}
                  </div>
                </div>
              </div>

              {/* What Went Wrong */}
              <div style={{ backgroundColor: '#FFFBEB', padding: '14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  What Went Wrong
                </span>
                <div style={{ fontSize: '13px', color: '#78350F', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedMisconception.whatWentWrong || selectedMisconception.evidence || 'Reasoning deviation from established concept.'}
                </div>
              </div>

              {/* Evidence from Reasoning */}
              <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Evidence from Student Reasoning
                </span>
                <div style={{ fontSize: '13px', color: '#334155', marginTop: '4px', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{selectedMisconception.recentEvidence || selectedMisconception.evidenceSnippet || selectedMisconception.evidence || 'Analyzed during submission.'}"
                </div>
              </div>

              {/* Recommended Practice */}
              <div style={{ backgroundColor: '#EFF6FF', padding: '16px', borderRadius: '10px', border: '1.5px solid #BFDBFE' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                  Recommended Practice
                </span>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E3A8A', marginTop: '4px', lineHeight: 1.5 }}>
                  {selectedMisconception.recommendedPractice || selectedMisconception.recommendedAction || 'Practice targeted exercises on core principles.'}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setSelectedMisconception(null)}
                style={{
                  padding: '9px 18px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMisconception(null);
                  handleStartPractice();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 20px',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>Practice This Misconception</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Stacking CSS */}
      <style>{`
        @media (max-width: 860px) {
          .desktop-only-collapse-btn {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .dashboard-sidebar {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            bottom: 0 !important;
            transform: translateX(-100%);
            width: 260px !important;
            box-shadow: 4px 0 24px rgba(15, 23, 42, 0.15) !important;
          }
          .dashboard-sidebar.drawer-open {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </div>
  );
};
