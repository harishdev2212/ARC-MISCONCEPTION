import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { 
  BookOpen, 
  Target, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles,
  Lightbulb,
  Check,
  ChevronRight,
  Layers,
  Code2,
  BookMarked,
  Terminal,
  Cpu,
  Zap,
  HelpCircle
} from 'lucide-react';
import { SubjectType } from '@shared/subjectCurriculum';

export const LearnPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentStudent } = useAuth();
  const { session, startSession } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [startingPractice, setStartingPractice] = useState(false);
  const [activeSubject, setActiveSubject] = useState<SubjectType>('Mathematics');

  const handleStartPractice = async (subjectOverride?: SubjectType, topicOverride?: string) => {
    try {
      setStartingPractice(true);
      if (currentStudent) {
        await startSession(currentStudent.id, {
          subject: subjectOverride || activeSubject,
          topic: topicOverride || (activeSubject === 'Mathematics' ? 'Linear Equations in One Variable' : activeSubject === 'Programming' ? 'Variables and Data Types' : 'Subject-Verb Agreement')
        });
      }
      navigate('/practice');
    } catch (err) {
      console.error('Error initiating practice session', err);
      navigate('/practice');
    } finally {
      setStartingPractice(false);
    }
  };

  const getSubjectColor = () => {
    if (activeSubject === 'Programming') return '#7C3AED';
    if (activeSubject === 'English') return '#0891B2';
    return '#2563EB';
  };

  const subjectColor = getSubjectColor();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Shared Student Sidebar */}
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '36px 40px 80px',
        maxWidth: '1160px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Breadcrumb Hierarchy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#64748B',
          marginBottom: '16px'
        }}>
          <span>MINDTRACE AI</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ textTransform: 'uppercase' }}>{activeSubject}</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: subjectColor }}>CONCEPT LEARNING GUIDE</span>
        </div>

        {/* Multi-Subject Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveSubject('Mathematics')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSubject === 'Mathematics' ? '2px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: activeSubject === 'Mathematics' ? '#EFF6FF' : '#FFFFFF',
              color: activeSubject === 'Mathematics' ? '#2563EB' : '#475569',
              boxShadow: activeSubject === 'Mathematics' ? '0 2px 8px rgba(37, 99, 235, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Scale size={18} color={activeSubject === 'Mathematics' ? '#2563EB' : '#64748B'} />
            <span>Mathematics · Linear Equations</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubject('Programming')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSubject === 'Programming' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              backgroundColor: activeSubject === 'Programming' ? '#F5F3FF' : '#FFFFFF',
              color: activeSubject === 'Programming' ? '#7C3AED' : '#475569',
              boxShadow: activeSubject === 'Programming' ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Code2 size={18} color={activeSubject === 'Programming' ? '#7C3AED' : '#64748B'} />
            <span>Programming · Python Logic</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubject('English')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSubject === 'English' ? '2px solid #0891B2' : '1px solid #E2E8F0',
              backgroundColor: activeSubject === 'English' ? '#ECFEFF' : '#FFFFFF',
              color: activeSubject === 'English' ? '#0891B2' : '#475569',
              boxShadow: activeSubject === 'English' ? '0 2px 8px rgba(8, 145, 178, 0.15)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BookMarked size={18} color={activeSubject === 'English' ? '#0891B2' : '#64748B'} />
            <span>English · Grammar & Syntax</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* MATHEMATICS VIEW                                               */}
        {/* ============================================================== */}
        {activeSubject === 'Mathematics' && (
          <>
            {/* Hero Concept Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '34px 36px',
              border: '1px solid #DBEAFE',
              boxShadow: '0 4px 16px -2px rgba(37, 99, 235, 0.06)',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ maxWidth: '680px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                    <BookOpen size={14} />
                    <span>Current Focus: Algebra Foundations</span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                    Linear Equations & Properties of Equality
                  </h1>
                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Learn how to isolate variables and preserve mathematical truth using the balance scale principle. Understand why operations must always be applied equally to both sides of the equals sign.
                  </p>
                </div>

                <button
                  onClick={() => handleStartPractice('Mathematics', 'Linear Equations in One Variable')}
                  disabled={startingPractice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 24px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <Target size={18} />
                  <span>{startingPractice ? 'Preparing Session...' : 'Start Practice'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Concept Explanation & Balance Scale Principle */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB'
                  }}>
                    <Scale size={20} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    The Balance Model of Equality
                  </h2>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
                  An equation represents a <strong>balanced two-pan scale</strong>. The equals sign (<code style={{ backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>=</code>) guarantees that the quantity on the left is exactly equal to the quantity on the right.
                </p>
                <div style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '16px',
                  borderLeft: '4px solid #2563EB',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.5
                }}>
                  <strong>Golden Rule of Equations:</strong> Whatever operation you apply to one side of the equals sign, you <em>must</em> apply identical operation to the other side. Changing only one side creates an operational asymmetry and destroys the equality!
                </div>
              </div>

              <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Learning Objectives
                  </h2>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#475569', lineHeight: 1.8 }}>
                  <li>Identify variable terms, coefficients, and constants.</li>
                  <li>Apply inverse operations (addition/subtraction, multiplication/division) bilaterally.</li>
                  <li>Isolate the unknown variable step-by-step.</li>
                  <li>Expand grouped expressions using the distributive property.</li>
                  <li>Verify the final solution by substitution into the original equation.</li>
                </ul>
              </div>
            </div>

            {/* Step-by-Step Worked Example */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB'
                }}>
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Step-by-Step Worked Example
                  </h2>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>How to solve a two-step linear equation</span>
                </div>
              </div>

              <div style={{
                display: 'inline-block',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #DBEAFE',
                borderRadius: '10px',
                padding: '12px 20px',
                fontSize: '20px',
                fontWeight: 700,
                color: '#1E40AF',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: '24px'
              }}>
                3x + 8 = 29
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Step 1 */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    1
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>
                      Undo the constant term (+8) using subtraction on both sides:
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#1E40AF', marginBottom: '4px' }}>
                      3x + 8 - 8 = 29 - 8
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Simplifies to: <strong style={{ color: '#0F172A' }}>3x = 21</strong> (Both sides stay in balance!)
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    2
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '14px', marginBottom: '4px' }}>
                      Undo multiplication by the coefficient (3) by dividing both sides by 3:
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#1E40AF', marginBottom: '4px' }}>
                      (3x) / 3 = 21 / 3
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B' }}>
                      Simplifies to: <strong style={{ color: '#0F172A' }}>x = 7</strong>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '18px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    ✓
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '14px', marginBottom: '4px' }}>
                      Verify by substitution into original equation:
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#15803D' }}>
                      3(7) + 8 = 21 + 8 = 29 ✓ (Equivalence holds true)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* PROGRAMMING VIEW                                               */}
        {/* ============================================================== */}
        {activeSubject === 'Programming' && (
          <>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '34px 36px',
              border: '1px solid #DDD6FE',
              boxShadow: '0 4px 16px -2px rgba(124, 58, 237, 0.06)',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%)'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ maxWidth: '680px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#F5F3FF', color: '#7C3AED', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                    <Code2 size={14} />
                    <span>Computer Science: Python Fundamentals</span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                    Control Flow Invariants & Loop Boundary Proofs
                  </h1>
                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Master loop termination conditions, guard statements, and trace state transitions step-by-step. Discover why off-by-one errors happen and how to prove loop bounds.
                  </p>
                </div>

                <button
                  onClick={() => handleStartPractice('Programming', 'Control Flow and Conditionals')}
                  disabled={startingPractice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 24px',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.28)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6D28D9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7C3AED'}
                >
                  <Target size={18} />
                  <span>{startingPractice ? 'Preparing Session...' : 'Start Practice'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Step-by-Step Programming Example */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#F5F3FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7C3AED'
                }}>
                  <Terminal size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Worked Example: Avoiding Off-by-One Loop Errors
                  </h2>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>State tracing across iterations</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '12px',
                padding: '16px 20px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '14px',
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                <div><span style={{ color: '#94A3B8' }}># Calculate sum of numbers 1 to 5</span></div>
                <div><span style={{ color: '#F472B6' }}>total</span> = 0</div>
                <div><span style={{ color: '#60A5FA' }}>for</span> i <span style={{ color: '#60A5FA' }}>in</span> <span style={{ color: '#FCD34D' }}>range</span>(1, 6):  <span style={{ color: '#94A3B8' }}># Upper bound is exclusive!</span></div>
                <div>    <span style={{ color: '#F472B6' }}>total</span> += i</div>
                <div><span style={{ color: '#FCD34D' }}>print</span>(total)  <span style={{ color: '#4ADE80' }}># Output: 15</span></div>
              </div>

              <div style={{
                backgroundColor: '#F5F3FF',
                border: '1px solid #DDD6FE',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '13px',
                color: '#5B21B6',
                lineHeight: 1.5
              }}>
                <strong>Common Pitfall:</strong> <code style={{ backgroundColor: '#EDE9FE', padding: '2px 6px', borderRadius: '4px' }}>range(1, 5)</code> stops at 4, causing an off-by-one shortfall. In Python, the stop argument is always non-inclusive.
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* ENGLISH VIEW                                                   */}
        {/* ============================================================== */}
        {activeSubject === 'English' && (
          <>
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '34px 36px',
              border: '1px solid #A5F3FC',
              boxShadow: '0 4px 16px -2px rgba(8, 145, 178, 0.06)',
              marginBottom: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #0891B2 0%, #06B6D4 100%)'
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ maxWidth: '680px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#ECFEFF', color: '#0891B2', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
                    <BookMarked size={14} />
                    <span>Language Arts: Grammar & Syntax</span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                    Subject-Verb Agreement with Intervening Phrases
                  </h1>
                  <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    Learn how to identify the true head noun of a subject despite intervening prepositional phrases, parenthetical clauses, or inverted word order.
                  </p>
                </div>

                <button
                  onClick={() => handleStartPractice('English', 'Subject-Verb Agreement')}
                  disabled={startingPractice}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 24px',
                    backgroundColor: '#0891B2',
                    color: '#FFFFFF',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(8, 145, 178, 0.28)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0E7490'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0891B2'}
                >
                  <Target size={18} />
                  <span>{startingPractice ? 'Preparing Session...' : 'Start Practice'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Worked Example English */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.03)',
              marginBottom: '32px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFEFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0891B2'
                }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Worked Example: Isolating the True Subject
                  </h2>
                  <span style={{ fontSize: '13px', color: '#64748B' }}>Ignoring intervening prepositional words</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#F8FAFC',
                border: '1.5px solid #A5F3FC',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '16px',
                color: '#0F172A',
                lineHeight: 1.6,
                marginBottom: '20px'
              }}>
                "The <strong>collection</strong> <span style={{ color: '#64748B', textDecoration: 'line-through' }}>of rare manuscripts</span> <strong>is</strong> housed in the vault."
              </div>

              <div style={{
                backgroundColor: '#ECFEFF',
                border: '1px solid #A5F3FC',
                borderRadius: '12px',
                padding: '16px 20px',
                fontSize: '13px',
                color: '#155E75',
                lineHeight: 1.5
              }}>
                <strong>Key Rule:</strong> The head noun is <em>collection</em> (singular), not <em>manuscripts</em> (plural object of the preposition). Therefore, the singular verb <em>is</em> is mandatory.
              </div>
            </div>
          </>
        )}

        {/* Ready to Practice Call to Action */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #BFDBFE',
          borderRadius: '20px',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E3A8A', margin: '0 0 6px' }}>
              Ready to test your reasoning?
            </h3>
            <p style={{ fontSize: '14px', color: '#1E40AF', margin: 0 }}>
              Solve problems, explain your thinking, and let our Socratic tutor diagnose your mental models.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/topics')}
              style={{
                padding: '12px 20px',
                backgroundColor: '#FFFFFF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Browse All Topics
            </button>

            <button
              onClick={() => handleStartPractice()}
              disabled={startingPractice}
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
              <span>{startingPractice ? 'Starting...' : 'Start Practice'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
