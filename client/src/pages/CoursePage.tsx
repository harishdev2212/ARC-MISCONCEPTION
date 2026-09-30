import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Target, 
  Sparkles,
  ChevronRight,
  Award,
  Code2,
  BookMarked,
  Check
} from 'lucide-react';

export const CoursePage: React.FC = () => {
  const { navigate } = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTrack, setActiveTrack] = useState<'math' | 'prog' | 'eng'>('math');

  const mathModules = [
    {
      id: 'mod-1',
      title: 'Module 1: Properties of Equality & Balance Scale',
      topic: 'Linear Equations in One Variable',
      status: 'In Progress',
      progress: 75,
      lessons: '4 Lessons • 24 Practice Problems',
      description: 'Master the foundational balance scale model, one-step and two-step inverse operations without operational asymmetry.'
    },
    {
      id: 'mod-2',
      title: 'Module 2: Multi-Step Equations & Brackets',
      topic: 'Distributive Property & Grouping',
      status: 'Ready',
      progress: 30,
      lessons: '5 Lessons • 30 Practice Problems',
      description: 'Expand expressions with grouping parentheses, combine like terms accurately, and isolate variables.'
    },
    {
      id: 'mod-3',
      title: 'Module 3: Variables on Both Sides & Fractions',
      topic: 'Algebraic Manipulation',
      status: 'Upcoming',
      progress: 0,
      lessons: '6 Lessons • 36 Practice Problems',
      description: 'Eliminate denominators using least common multiples and balance variables across the equals sign.'
    },
    {
      id: 'mod-4',
      title: 'Module 4: Word Problems & Equivalence Proofs',
      topic: 'Applied Algebra',
      status: 'Upcoming',
      progress: 0,
      lessons: '4 Lessons • 20 Practice Problems',
      description: 'Translate real-world scenarios into balanced algebraic equations and verify cognitive transfer.'
    }
  ];

  const progModules = [
    {
      id: 'prog-mod-1',
      title: 'Module 1: Variables, Scope & Data Types',
      topic: 'Python Foundations',
      status: 'In Progress',
      progress: 50,
      lessons: '4 Lessons • 16 Code Problems',
      description: 'Primitive and mutable types, variable naming, memory addresses, and type conversions in Python.'
    },
    {
      id: 'prog-mod-2',
      title: 'Module 2: Conditionals & Boolean Branching',
      topic: 'Control Flow',
      status: 'Ready',
      progress: 25,
      lessons: '5 Lessons • 20 Code Problems',
      description: 'Compound boolean expressions, short-circuit evaluation, nested conditions, and edge-case testing.'
    },
    {
      id: 'prog-mod-3',
      title: 'Module 3: Iteration & Loop Invariants',
      topic: 'Loops & Bounds',
      status: 'Upcoming',
      progress: 0,
      lessons: '6 Lessons • 24 Code Problems',
      description: 'For and while loops, sequence traversals, accumulator patterns, and eliminating off-by-one errors.'
    }
  ];

  const engModules = [
    {
      id: 'eng-mod-1',
      title: 'Module 1: Subject-Verb Agreement & Prepositional Separation',
      topic: 'Grammar Foundations',
      status: 'In Progress',
      progress: 60,
      lessons: '4 Lessons • 18 Language Exercises',
      description: 'Identify true head nouns separated by prepositional phrases, collective nouns, and compound subjects.'
    },
    {
      id: 'eng-mod-2',
      title: 'Module 2: Tense Consistency & Aspect',
      topic: 'Syntax & Form',
      status: 'Ready',
      progress: 20,
      lessons: '4 Lessons • 16 Language Exercises',
      description: 'Maintain narrative and analytical tense harmony across complex sentences and subordinate clauses.'
    }
  ];

  const currentModules = activeTrack === 'math' ? mathModules : activeTrack === 'prog' ? progModules : engModules;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{
        flex: 1,
        padding: '36px 40px 80px',
        maxWidth: '1160px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Breadcrumb */}
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
          <span>CURRICULUM COURSES</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: '#2563EB' }}>ACTIVE COURSE ROADMAP</span>
        </div>

        {/* Track Selector Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTrack('math')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTrack === 'math' ? '2px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: activeTrack === 'math' ? '#EFF6FF' : '#FFFFFF',
              color: activeTrack === 'math' ? '#2563EB' : '#475569'
            }}
          >
            <span>📐 Mathematics · Algebra Track</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('prog')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTrack === 'prog' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              backgroundColor: activeTrack === 'prog' ? '#F5F3FF' : '#FFFFFF',
              color: activeTrack === 'prog' ? '#7C3AED' : '#475569'
            }}
          >
            <span>💻 Programming · Python Track</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTrack('eng')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTrack === 'eng' ? '2px solid #0891B2' : '1px solid #E2E8F0',
              backgroundColor: activeTrack === 'eng' ? '#ECFEFF' : '#FFFFFF',
              color: activeTrack === 'eng' ? '#0891B2' : '#475569'
            }}
          >
            <span>📖 English · Language Arts Track</span>
          </button>
        </div>

        {/* Course Header Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '32px 36px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
              <Award size={14} />
              <span>Cognitive Mastery Curriculum Standard</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              {activeTrack === 'math' ? 'Algebra Foundations: Equations & Equivalence' : activeTrack === 'prog' ? 'Python Software Engineering & Computational Logic' : 'English Syntax, Semantics & Critical Reading'}
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
              A structured cognitive progression from core principles to multi-step reasoning. Designed to expose mental model errors and guide you toward permanent conceptual clarity.
            </p>
          </div>

          <button
            onClick={() => navigate('/learn')}
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
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)'
            }}
          >
            <BookOpen size={18} />
            <span>Open Learning Guide</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Course Modules List */}
        <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginBottom: '18px' }}>
          Course Curriculum Milestones & Progression
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentModules.map((mod) => (
            <div key={mod.id} style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.02)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '18px'
            }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {mod.title}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: mod.status === 'In Progress' ? '#EFF6FF' : mod.status === 'Ready' ? '#ECFDF5' : '#F1F5F9',
                    color: mod.status === 'In Progress' ? '#2563EB' : mod.status === 'Ready' ? '#059669' : '#64748B'
                  }}>
                    {mod.status}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {mod.description}
                </p>
                <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{mod.lessons}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {mod.progress > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{mod.progress}%</span>
                    <div style={{ width: '80px', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${mod.progress}%`, height: '100%', backgroundColor: '#2563EB' }} />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => navigate(mod.progress > 0 ? '/practice' : '/learn')}
                  style={{
                    padding: '10px 18px',
                    backgroundColor: mod.status === 'Upcoming' ? '#F8FAFC' : '#EFF6FF',
                    color: mod.status === 'Upcoming' ? '#94A3B8' : '#2563EB',
                    border: `1px solid ${mod.status === 'Upcoming' ? '#E2E8F0' : '#BFDBFE'}`,
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: mod.status === 'Upcoming' ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  disabled={mod.status === 'Upcoming'}
                >
                  {mod.progress > 0 ? 'Practice Module' : mod.status === 'Ready' ? 'Start Module' : 'Locked'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
