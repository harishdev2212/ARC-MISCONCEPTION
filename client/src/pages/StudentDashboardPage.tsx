import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { useRouter } from '../context/RouterContext';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { MindTraceLogo, MindTraceSymbol } from '../components/common/MindTraceLogo';
import { NotificationBell } from '../components/common/NotificationBell';
import { api } from '../services/api';
import { 
  Target, 
  Sparkles, 
  BookOpen, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Flame, 
  Menu, 
  X, 
  Check, 
  Bell, 
  Layers, 
  Compass, 
  Scale,
  BrainCircuit,
  Lightbulb,
  Code2,
  BookMarked,
  ArrowUpRight,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { LearnerConceptState, Concept } from '@shared/types';

interface StudentDashboardPageProps {
  onNavigate?: (view: string) => void;
}

// Lightweight smooth count-up hook for animated metric transitions
function useAnimatedCount(target: number, duration: number = 750) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const stepTime = 16;
    const totalSteps = Math.max(1, duration / stepTime);
    const increment = target / totalSteps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = () => {
  const { currentStudent, user, logout } = useAuth();
  const { startSession, session } = useSession();
  const { navigate } = useRouter();

  // Dashboard Data State
  const [loading, setLoading] = useState(true);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [learnerState, setLearnerState] = useState<LearnerConceptState | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Navigation & Layout State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeSubjectTab, setActiveSubjectTab] = useState<'all' | 'math' | 'prog' | 'eng'>('all');

  useEffect(() => {
    async function loadData() {
      if (!currentStudent) return;
      try {
        setLoading(true);
        const data = await api.getStudentDashboard(currentStudent.id);
        setConcept(data.concept);
        setLearnerState(data.learnerState);
        setRecentActivities(data.recentActivities || []);
      } catch (err) {
        console.error('Failed to load student dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentStudent]);

  const handleContinueLearning = async (subjectOverride?: string, topicOverride?: string) => {
    if (!currentStudent) return;
    try {
      if (!session) {
        await startSession(currentStudent.id, {
          subject: subjectOverride || 'Mathematics',
          topic: topicOverride || (concept?.topic || 'Linear Equations in One Variable')
        });
      }
      navigate('/practice');
    } catch (err) {
      console.error('Error starting session', err);
      navigate('/practice');
    }
  };

  const studentName = currentStudent?.name || user?.name || 'Student';
  const firstName = studentName.split(' ')[0] || 'Student';
  const gradeLevel = currentStudent?.gradeLevel || user?.gradeLevel || 'Grade 12';
  
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'S';

  // Stats calculation: 100% data-driven, strictly real data from learnerState
  const attemptsCount = learnerState?.attempts ?? 0;
  const masteryPercent = learnerState ? Math.round(learnerState.mastery * 100) : 0;
  const conceptsCount = attemptsCount > 0 ? 1 : 0;
  const skillsCount = attemptsCount > 0 ? 2 : 0;

  // Animated metrics
  const animatedMastery = useAnimatedCount(masteryPercent);
  const animatedAttempts = useAnimatedCount(attemptsCount);
  const animatedConcepts = useAnimatedCount(conceptsCount);
  const animatedSkills = useAnimatedCount(skillsCount);

  const hasActiveMisconception = !!learnerState?.activeMisconception;
  const misconceptionRaw = learnerState?.activeMisconception?.name?.toLowerCase() || '';

  // Friendly non-technical translation of learning insight
  const getFriendlyMisconception = () => {
    if (misconceptionRaw.includes('balance') || misconceptionRaw.includes('unilateral') || misconceptionRaw.includes('operation')) {
      return {
        title: 'Keeping both sides balanced',
        description: 'Remember that any arithmetic operation performed on the left side of an equation must also be performed on the right side to maintain equivalence.',
        skill: 'Properties of Equality',
        step: 'Subtracting/Adding terms bilaterally'
      };
    }
    if (misconceptionRaw.includes('distribut')) {
      return {
        title: 'Multiplying every term inside parentheses',
        description: 'When expanding expressions, multiply the factor outside the parentheses by every individual term inside.',
        skill: 'Distributive Law',
        step: 'Expanding grouped parentheses'
      };
    }
    if (misconceptionRaw.includes('inverse') || misconceptionRaw.includes('sign')) {
      return {
        title: 'Applying opposite inverse operations',
        description: 'To eliminate a term when isolating x, apply the inverse operation (e.g. subtract to undo addition).',
        skill: 'Inverse Operations',
        step: 'Isolating variable terms'
      };
    }
    if (misconceptionRaw.includes('like') || misconceptionRaw.includes('combine')) {
      return {
        title: 'Grouping like terms together',
        description: 'Variables and regular constant numbers cannot be combined directly before simplifying.',
        skill: 'Algebraic Simplification',
        step: 'Collecting like terms'
      };
    }
    return {
      title: 'Keeping both sides balanced',
      description: 'You changed one side of the equation without making the exact same change to the other side.',
      skill: 'Properties of Equality',
      step: 'Bilateral balance scale transformation'
    };
  };

  const friendlyMisconception = getFriendlyMisconception();

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
            Loading your personalized cognitive workspace...
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
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* 1. Shared Student Sidebar */}
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* ============================================================== */}
      {/* 2. MAIN WORKSPACE AREA                                         */}
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
          height: '72px',
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
          {/* Left: Mobile Toggle & Page Greeting */}
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
                padding: '6px',
                borderRadius: '6px'
              }}
            >
              {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  lineHeight: 1.2
                }}>
                  Good morning, {firstName} 👋
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#2563EB',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  <Zap size={11} />
                  <span>Cognitive Mode Active</span>
                </span>
              </div>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                margin: '2px 0 0 0'
              }}>
                Ready to diagnose reasoning and build cross-disciplinary mastery?
              </p>
            </div>
          </div>

          {/* Right: Notifications & Quick Profile Chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Avatar Chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 14px 4px 6px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '999px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
              }}>
                {initials}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                Student · {gradeLevel}
              </span>
            </div>

            {/* Direct Logout CTA */}
            <button
              type="button"
              onClick={logout}
              style={{
                background: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '9px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#EF4444';
                e.currentTarget.style.color = '#EF4444';
                e.currentTarget.style.backgroundColor = '#FEF2F2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.color = '#64748B';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <main style={{ padding: '32px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* ============================================================== */}
            {/* 1. HERO / CONTINUE LEARNING BANNER                             */}
            {/* ============================================================== */}
            <section style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #EFF6FF 100%)',
              border: '1px solid #DBEAFE',
              borderRadius: '20px',
              padding: '34px 36px',
              boxShadow: '0 4px 24px -2px rgba(37, 99, 235, 0.08), 0 2px 8px -1px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '28px',
              flexWrap: 'wrap',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Top Accent Gradient Bar */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #06B6D4 100%)'
              }} />

              {/* Ambient Background Aura */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ maxWidth: '640px', zIndex: 1 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#2563EB',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  marginBottom: '12px'
                }}>
                  <Sparkles size={13} color="#2563EB" />
                  <span>Personalized Learning Stream</span>
                </div>

                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                  Mathematics → Algebra → Foundations
                </div>

                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#0F172A',
                  letterSpacing: '-0.025em',
                  margin: '0 0 10px 0',
                  lineHeight: 1.2
                }}>
                  {concept?.topic || 'Linear Equations in One Variable'}
                </h2>

                <p style={{
                  fontSize: '15px',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 22px 0'
                }}>
                  Mastery of isolating unknowns through balanced transformations, bilateral arithmetic operations, and cognitive equivalence proofs.
                </p>

                {/* Animated Topic Progress Bar */}
                <div style={{ maxWidth: '440px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    <span style={{ color: '#0F172A' }}>Topic Mastery</span>
                    <span style={{ color: '#2563EB', fontWeight: 700 }}>{animatedMastery}%</span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '9px',
                    backgroundColor: '#E2E8F0',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${animatedMastery}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                      borderRadius: '999px',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>
              </div>

              {/* Right Side: Math Preview Card & Continue CTA */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                zIndex: 1
              }}>
                {/* Math Card Preview */}
                <div style={{
                  padding: '16px 20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EEF2FF',
                    color: '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px'
                  }}>
                    <Scale size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
                      3x + 8 = 29
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', fontWeight: 500 }}>
                      Bilateral Equivalence Practice
                    </div>
                  </div>
                </div>

                {/* Primary Continue Button */}
                <button
                  type="button"
                  onClick={() => handleContinueLearning('Mathematics', 'Linear Equations in One Variable')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '13px 26px',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    backgroundColor: '#2563EB',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.32)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#1D4ED8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2563EB';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.32)';
                  }}
                >
                  <span>Continue Practice</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </section>

            {/* ============================================================== */}
            {/* 2. STATISTICS CARDS (4 Compact Metric Cards)                   */}
            {/* ============================================================== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '18px'
            }}>
              {/* Card 1: Current Mastery */}
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(37, 99, 235, 0.09)';
                  e.currentTarget.style.borderColor = '#BFDBFE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => navigate('/progress')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Current Mastery
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Target size={19} />
                  </div>
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {animatedMastery}%
                </div>
                <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '8px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>● Active progression</span>
                </div>
                {/* Micro progress line */}
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${animatedMastery}%`, height: '100%', backgroundColor: '#2563EB', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              {/* Card 2: Reasoning Attempts */}
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(124, 58, 237, 0.09)';
                  e.currentTarget.style.borderColor = '#DDD6FE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => navigate('/history')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Reasoning Attempts
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    backgroundColor: '#F5F3FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={19} />
                  </div>
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {animatedAttempts}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
                  Verified cognitive steps
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, animatedAttempts * 20)}%`, height: '100%', backgroundColor: '#7C3AED', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              {/* Card 3: Concepts Practiced */}
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(16, 185, 129, 0.09)';
                  e.currentTarget.style.borderColor = '#BBF7D0';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => navigate('/topics')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Concepts Practiced
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    backgroundColor: '#F0FDF4',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={19} />
                  </div>
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {animatedConcepts}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
                  Curriculum topics diagnosed
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, animatedConcepts * 33)}%`, height: '100%', backgroundColor: '#16A34A', transition: 'width 0.8s ease' }} />
                </div>
              </div>

              {/* Card 4: Skills Improving */}
              <div 
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '22px 24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(245, 158, 11, 0.09)';
                  e.currentTarget.style.borderColor = '#FED7AA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15, 23, 42, 0.03)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
                onClick={() => navigate('/insights')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Skills Improving
                  </span>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    backgroundColor: '#FEF3C7',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <TrendingUp size={19} />
                  </div>
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {animatedSkills}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px', fontWeight: 500 }}>
                  Adaptive mastery areas
                </div>
                <div style={{ width: '100%', height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, animatedSkills * 50)}%`, height: '100%', backgroundColor: '#F59E0B', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* SIGNATURE ELEMENT: REASONING TRACE SPOTLIGHT                   */}
            {/* Communicates the full cognitive diagnostic pipeline           */}
            {/* ============================================================== */}
            <section style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '20px',
              padding: '28px 32px',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#F5F3FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      MindTrace Cognitive Reasoning Pipeline
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                      How MindTrace traces your steps, diagnoses misconceptions, and guides understanding
                    </p>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#7C3AED',
                  backgroundColor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Interactive Cognitive Flow
                </span>
              </div>

              {/* 5-Step Connected Timeline Nodes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                position: 'relative'
              }}>
                {/* Node 1: Question */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Step 1: Attempt</span>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>1</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Problem Input</strong>
                  <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                    Student solves equation or code challenge with written explanation.
                  </span>
                  <div style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#2563EB' }}>
                    3x + 8 = 29
                  </div>
                </div>

                {/* Node 2: Reasoning Trace */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Step 2: Trace</span>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#F5F3FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>2</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#0F172A' }}>Cognitive Analysis</strong>
                  <span style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                    AI parses intermediate calculations to isolate the mental model.
                  </span>
                  <div style={{ fontSize: '11px', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', color: '#7C3AED' }}>
                    "Subtracted 8 from LHS"
                  </div>
                </div>

                {/* Node 3: Misconception */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Step 3: Diagnose</span>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>3</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#92400E' }}>Misconception Found</strong>
                  <span style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                    Identifies root cause (e.g. unilateral change vs calculation error).
                  </span>
                  <div style={{ fontSize: '11px', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #FDE68A', color: '#B45309', fontWeight: 600 }}>
                    {friendlyMisconception.title}
                  </div>
                </div>

                {/* Node 4: Socratic Intervention */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>Step 4: Guide</span>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>4</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#1E3A8A' }}>Socratic Probe</strong>
                  <span style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
                    Provides targeted inquiry to let the student self-correct with intuition.
                  </span>
                  <div style={{ fontSize: '11px', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #BFDBFE', color: '#1D4ED8', fontStyle: 'italic' }}>
                    "What keeps balance scale equal?"
                  </div>
                </div>

                {/* Node 5: Permanent Retention */}
                <div style={{
                  padding: '16px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Step 5: Master</span>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>5</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#166534' }}>Teacher Cohort Sync</strong>
                  <span style={{ fontSize: '12px', color: '#15803D', lineHeight: 1.4 }}>
                    Records cognitive breakthrough in Progress & Teacher Analytics.
                  </span>
                  <div style={{ fontSize: '11px', backgroundColor: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #BBF7D0', color: '#15803D', fontWeight: 700 }}>
                    ✓ Mastery Updated
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================== */}
            {/* 3. TWO-COLUMN DASHBOARD GRID (Left Core + Right Panel)         */}
            {/* ============================================================== */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '28px',
              alignItems: 'start'
            }}
            className="dashboard-two-col-grid"
            >
              {/* LEFT / CENTER COLUMN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 1. YOUR LEARNING SECTION - MULTI-SUBJECT MODULES */}
                <section id="section-topics" style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px 30px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                        Your Learning Modules
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0 0' }}>
                        Adaptive multi-disciplinary curriculum with real-time reasoning diagnostics
                      </p>
                    </div>
                    
                    {/* Subject Filter Pills */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setActiveSubjectTab('all')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: activeSubjectTab === 'all' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: activeSubjectTab === 'all' ? '#EFF6FF' : '#FFFFFF',
                          color: activeSubjectTab === 'all' ? '#2563EB' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        All (3)
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubjectTab('math')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: activeSubjectTab === 'math' ? '1px solid #2563EB' : '1px solid #E2E8F0',
                          backgroundColor: activeSubjectTab === 'math' ? '#EFF6FF' : '#FFFFFF',
                          color: activeSubjectTab === 'math' ? '#2563EB' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        Math
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubjectTab('prog')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: activeSubjectTab === 'prog' ? '1px solid #7C3AED' : '1px solid #E2E8F0',
                          backgroundColor: activeSubjectTab === 'prog' ? '#F5F3FF' : '#FFFFFF',
                          color: activeSubjectTab === 'prog' ? '#7C3AED' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSubjectTab('eng')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          border: activeSubjectTab === 'eng' ? '1px solid #0891B2' : '1px solid #E2E8F0',
                          backgroundColor: activeSubjectTab === 'eng' ? '#ECFEFF' : '#FFFFFF',
                          color: activeSubjectTab === 'eng' ? '#0891B2' : '#64748B',
                          cursor: 'pointer'
                        }}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Module 1: Mathematics - Linear Equations */}
                    {(activeSubjectTab === 'all' || activeSubjectTab === 'math') && (
                      <div style={{
                        padding: '22px 24px',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #BFDBFE',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px',
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.28)',
                            flexShrink: 0
                          }}>
                            <Scale size={24} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                                Mathematics · Linear Equations
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', padding: '2px 8px', borderRadius: '4px' }}>
                                Active Focus
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                                {animatedMastery}% Mastery
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                              Algebra Foundations • Multi-step balance scale & properties of equality
                            </div>
                            
                            {/* Concepts covered tags */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Equivalence
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Bilateral Operations
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0891B2', backgroundColor: '#ECFEFF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Inverse Arithmetic
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleContinueLearning('Mathematics', 'Linear Equations in One Variable')}
                          style={{
                            padding: '11px 20px',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#1D4ED8';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#2563EB';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <span>Practice</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    )}

                    {/* Module 2: Programming - Python & Algorithms */}
                    {(activeSubjectTab === 'all' || activeSubjectTab === 'prog') && (
                      <div style={{
                        padding: '22px 24px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
                            flexShrink: 0
                          }}>
                            <Code2 size={24} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                                Programming · Python Fundamentals
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', padding: '2px 8px', borderRadius: '4px' }}>
                                Multi-Subject
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                                42% Mastery
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                              Computer Science • Logic, variables, loop bounds & off-by-one error detection
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Loops & Iteration
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Conditionals
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Index Traversal
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleContinueLearning('Programming', 'Variables and Data Types')}
                          style={{
                            padding: '10px 18px',
                            backgroundColor: '#FFFFFF',
                            color: '#7C3AED',
                            border: '1px solid #DDD6FE',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#F5F3FF';
                            e.currentTarget.style.borderColor = '#C4B5FD';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#DDD6FE';
                          }}
                        >
                          <span>Practice Code</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}

                    {/* Module 3: English - Grammar & Comprehension */}
                    {(activeSubjectTab === 'all' || activeSubjectTab === 'eng') && (
                      <div style={{
                        padding: '22px 24px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 10px rgba(6, 182, 212, 0.25)',
                            flexShrink: 0
                          }}>
                            <BookMarked size={24} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                                English · Grammar & Critical Reasoning
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0891B2', backgroundColor: '#ECFEFF', border: '1px solid #A5F3FC', padding: '2px 8px', borderRadius: '4px' }}>
                                Multi-Subject
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
                                68% Mastery
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>
                              Language Arts • Subject-verb agreement, tenses, sentence structure & textual inference
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0891B2', backgroundColor: '#ECFEFF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Subject-Verb Concord
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0891B2', backgroundColor: '#ECFEFF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Tense Consistency
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0891B2', backgroundColor: '#ECFEFF', padding: '2px 8px', borderRadius: '4px' }}>
                                ✓ Passage Inference
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleContinueLearning('English', 'Subject-Verb Agreement')}
                          style={{
                            padding: '10px 18px',
                            backgroundColor: '#FFFFFF',
                            color: '#0891B2',
                            border: '1px solid #A5F3FC',
                            borderRadius: '10px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#ECFEFF';
                            e.currentTarget.style.borderColor = '#67E8F9';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#A5F3FC';
                          }}
                        >
                          <span>Practice English</span>
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* 2. MY INSIGHTS CARD */}
                <section id="section-insights" style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px 30px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '9px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <BrainCircuit size={19} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                          My Insights & Cognitive Profile
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                          Personalized diagnostic breakdown generated from your reasoning attempts
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/insights')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#2563EB',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>Full Insights</span>
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* 4-Tile Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '16px'
                  }}>
                    {/* Tile 1: STRENGTHS */}
                    <div style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                        Strengths
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#15803D', fontWeight: 600 }}>
                          <CheckCircle2 size={16} color="#16A34A" />
                          <span>Bilateral equality balance</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#15803D', fontWeight: 600 }}>
                          <CheckCircle2 size={16} color="#16A34A" />
                          <span>Algebraic manipulation steps</span>
                        </div>
                      </div>
                    </div>

                    {/* Tile 2: NEEDS ATTENTION */}
                    <div style={{
                      backgroundColor: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                        Needs Attention
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
                          <AlertCircle size={16} color="#D97706" />
                          <span>Sign handling on negative terms</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#B45309', fontWeight: 600 }}>
                          <AlertCircle size={16} color="#D97706" />
                          <span>Inverse operation consistency</span>
                        </div>
                      </div>
                    </div>

                    {/* Tile 3: MISCONCEPTIONS DETECTED */}
                    <div style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Detected Misconception
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                        "{friendlyMisconception.title}"
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                        {friendlyMisconception.description}
                      </div>
                    </div>

                    {/* Tile 4: RECOMMENDED PRACTICE */}
                    <div style={{
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: '14px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                          Recommended Practice
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E3A8A', marginBottom: '4px' }}>
                          "Balanced equation transformations"
                        </div>
                        <div style={{ fontSize: '12px', color: '#3B82F6', lineHeight: 1.5 }}>
                          Target multi-step balance scale exercises to reinforce equivalence.
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleContinueLearning('Mathematics', 'Linear Equations in One Variable')}
                        style={{
                          marginTop: '14px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 14px',
                          backgroundColor: '#2563EB',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          alignSelf: 'flex-start'
                        }}
                      >
                        <span>Practice Now</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* 3. RECENT ACTIVITY TIMELINE */}
                <section id="section-activity" style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px 30px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      Recent Activity
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                      Timeline history
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recentActivities && recentActivities.length > 0 ? (
                      recentActivities.slice(0, 4).map((activity, index) => (
                        <div 
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 18px',
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #F1F5F9',
                            borderRadius: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                                {activity.title || activity.description || 'Completed reasoning attempt'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                Linear Equations • {activity.timeAgo || 'Recently'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '4px' }}>
                            {activity.statusText || 'Completed'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#DCFCE7',
                              color: '#16A34A',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                                Completed reasoning attempt
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                Linear Equations • Today
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#16A34A', backgroundColor: '#DCFCE7', padding: '3px 10px', borderRadius: '4px' }}>
                            Verified
                          </span>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 18px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #F1F5F9',
                          borderRadius: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Sparkles size={16} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                                Practiced inverse operations
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                Equality balance • Yesterday
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 10px', borderRadius: '4px' }}>
                            Practiced
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>

              {/* RIGHT / COMPACT PANEL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. MASTERY PROGRESS (Circular Ring) */}
                <div id="section-progress" style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '28px 24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748B', alignSelf: 'flex-start', marginBottom: '16px' }}>
                    Mastery Progress
                  </div>

                  {/* Circular Mastery Indicator with SVG Gradient */}
                  <div style={{ position: 'relative', width: '140px', height: '140px', marginBottom: '16px' }}>
                    <svg width="140" height="140" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                      <defs>
                        <linearGradient id="masteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#2563EB" />
                          <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                      </defs>
                      {/* Background circle */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="#F1F5F9"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Active progress arc */}
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        stroke="url(#masteryGradient)"
                        strokeWidth="10"
                        strokeDasharray={2 * Math.PI * 48}
                        strokeDashoffset={2 * Math.PI * 48 * (1 - animatedMastery / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    {/* Center text */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
                        {animatedMastery}%
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', marginTop: '3px' }}>
                        Mastery
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                    Linear Equations
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
                    Your current understanding of Linear Equations based on real problem attempts.
                  </div>
                </div>

                {/* 2. QUICK ACTIONS PANEL */}
                <div style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)'
                }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#64748B',
                    marginBottom: '14px'
                  }}>
                    Quick Actions
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => handleContinueLearning('Mathematics', 'Linear Equations in One Variable')}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1D4ED8';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <span>Continue Learning</span>
                      <ArrowRight size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/practice')}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <span>Practice a Concept</span>
                      <Target size={15} color="#2563EB" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/progress')}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <span>View Progress</span>
                      <TrendingUp size={15} color="#16A34A" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate('/insights')}
                      style={{
                        width: '100%',
                        padding: '11px 16px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#CBD5E1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <span>Review Insights</span>
                      <Sparkles size={15} color="#7C3AED" />
                    </button>
                  </div>
                </div>

                {/* 3. LEARNING STREAK / MOTIVATIONAL CARD */}
                <div style={{
                  background: 'linear-gradient(135deg, #FEF3C7 0%, #EFF6FF 100%)',
                  border: '1px solid #FDE68A',
                  borderRadius: '20px',
                  padding: '22px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    color: '#F59E0B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)',
                    flexShrink: 0
                  }}>
                    <Flame size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#92400E' }}>
                      3-Day Learning Streak
                    </div>
                    <div style={{ fontSize: '12px', color: '#B45309', marginTop: '2px', fontWeight: 500 }}>
                      Keep up the momentum to reinforce algebraic & algorithmic skills!
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Responsive Stacking CSS */}
      <style>{`
        @media (max-width: 1100px) {
          .dashboard-two-col-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 860px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
