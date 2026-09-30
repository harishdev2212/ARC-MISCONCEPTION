import React, { useEffect, useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { StudentSidebar } from '../components/common/StudentSidebar';
import { api } from '../services/api';
import { 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  BookOpen,
  PieChart,
  Shapes,
  Percent,
  TrendingUp,
  Compass,
  Boxes,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  Code2,
  BookMarked,
  Terminal,
  Cpu,
  FileCode,
  Clock,
  Zap,
  Filter
} from 'lucide-react';
import { SubjectType } from '@shared/subjectCurriculum';

interface CategoryCard {
  id: string;
  subject: SubjectType;
  name: string;
  category: string;
  icon: React.ReactNode;
  description: string;
  questionCount: number;
  estTime: string;
  difficulty: 'Foundations' | 'Intermediate' | 'Advanced';
  subtopics: string[];
  sampleQuestion: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export const TopicsPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentStudent } = useAuth();
  const { startSession } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studentProgress, setStudentProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgress() {
      if (!currentStudent) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getStudentProgress(currentStudent.id);
        setStudentProgress(data.multiTopicProgress || null);
      } catch (err) {
        console.error('Failed to load topic progress', err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [currentStudent]);

  const allCategories: CategoryCard[] = [
    // MATHEMATICS
    {
      id: 'algebra',
      subject: 'Mathematics',
      name: 'Algebra Foundations',
      category: 'Algebra',
      icon: <Layers size={22} color="#2563EB" />,
      description: 'Equations, inequalities, factorisation, expressions, and balance principles.',
      questionCount: 24,
      estTime: '15-20 min',
      difficulty: 'Foundations',
      subtopics: [
        'Linear Equations in One Variable',
        'Linear Inequalities',
        'Systems of Linear Equations',
        'Quadratic Equations',
        'Polynomials',
        'Algebraic Expressions',
        'Factorisation',
        'Exponents and Powers'
      ],
      sampleQuestion: 'Solve 3x + 8 = 29',
      color: '#2563EB',
      bgLight: '#EFF6FF',
      borderColor: '#BFDBFE'
    },
    {
      id: 'arithmetic',
      subject: 'Mathematics',
      name: 'Arithmetic / Number System',
      category: 'Arithmetic / Number System',
      icon: <Percent size={22} color="#059669" />,
      description: 'Integers, fractions, percentages, ratios, decimals, and financial math.',
      questionCount: 20,
      estTime: '12-15 min',
      difficulty: 'Foundations',
      subtopics: [
        'Integers',
        'Fractions',
        'Decimals',
        'Percentages',
        'Ratio and Proportion',
        'Profit and Loss',
        'Simple Interest',
        'Compound Interest',
        'Number Systems'
      ],
      sampleQuestion: 'Calculate 1/3 + 1/4 using a common denominator',
      color: '#059669',
      bgLight: '#ECFDF5',
      borderColor: '#A7F3D0'
    },
    {
      id: 'geometry',
      subject: 'Mathematics',
      name: 'Geometry & Theorems',
      category: 'Geometry',
      icon: <Compass size={22} color="#4F46E5" />,
      description: 'Lines, angles, triangles, quadrilaterals, circles, and coordinate geometry.',
      questionCount: 18,
      estTime: '20-25 min',
      difficulty: 'Intermediate',
      subtopics: [
        'Lines and Angles',
        'Triangles',
        'Quadrilaterals',
        'Circles',
        'Coordinate Geometry',
        'Perimeter and Area'
      ],
      sampleQuestion: 'Two angles in a triangle are 50° and 60°. Find the third.',
      color: '#4F46E5',
      bgLight: '#EEF2FF',
      borderColor: '#C7D2FE'
    },
    {
      id: 'mensuration',
      subject: 'Mathematics',
      name: 'Mensuration & Solids',
      category: 'Mensuration',
      icon: <Shapes size={22} color="#EA580C" />,
      description: '2D plane shapes, 3D solids, surface area, and volume calculations.',
      questionCount: 16,
      estTime: '15-20 min',
      difficulty: 'Intermediate',
      subtopics: [
        '2D Shapes',
        '3D Shapes',
        'Surface Area',
        'Volume',
        'Cylinders & Spheres'
      ],
      sampleQuestion: 'Find volume of a rectangular prism 4 cm × 5 cm × 6 cm',
      color: '#EA580C',
      bgLight: '#FFF7ED',
      borderColor: '#FED7AA'
    },
    {
      id: 'statistics',
      subject: 'Mathematics',
      name: 'Statistics & Data',
      category: 'Statistics',
      icon: <TrendingUp size={22} color="#0284C7" />,
      description: 'Mean, median, mode, range, and interpretation of frequency charts.',
      questionCount: 15,
      estTime: '10-15 min',
      difficulty: 'Foundations',
      subtopics: [
        'Mean',
        'Median',
        'Mode',
        'Range',
        'Data Interpretation',
        'Graphs & Frequency'
      ],
      sampleQuestion: 'Find the median of [3, 7, 8, 12, 14]',
      color: '#0284C7',
      bgLight: '#F0F9FF',
      borderColor: '#BAE6FD'
    },
    {
      id: 'probability',
      subject: 'Mathematics',
      name: 'Probability & Chance',
      category: 'Probability',
      icon: <PieChart size={22} color="#D97706" />,
      description: 'Theoretical & experimental chance, sample spaces, and compound events.',
      questionCount: 14,
      estTime: '12-15 min',
      difficulty: 'Intermediate',
      subtopics: [
        'Basic Probability',
        'Experimental Probability',
        'Probability of Events',
        'Independent & Dependent Events'
      ],
      sampleQuestion: 'A bag has 3 red and 5 blue marbles. Find P(red).',
      color: '#D97706',
      bgLight: '#FFFBEB',
      borderColor: '#FDE68A'
    },
    {
      id: 'trigonometry',
      subject: 'Mathematics',
      name: 'Trigonometry Ratios',
      category: 'Trigonometry',
      icon: <Activity size={22} color="#DB2777" />,
      description: 'Trigonometric ratios, right triangle problem-solving, and identities.',
      questionCount: 12,
      estTime: '20-25 min',
      difficulty: 'Advanced',
      subtopics: [
        'Trigonometric Ratios',
        'Right Triangle Problems',
        'Trigonometric Identities',
        'Heights and Distances'
      ],
      sampleQuestion: 'In a right triangle with opp=3, adj=4, find tan(θ)',
      color: '#DB2777',
      bgLight: '#FDF2F8',
      borderColor: '#FBCFE8'
    },
    {
      id: 'functions',
      subject: 'Mathematics',
      name: 'Functions & Graphs',
      category: 'Functions',
      icon: <Boxes size={22} color="#7C3AED" />,
      description: 'Domain, range, function mapping, linear and quadratic curves.',
      questionCount: 12,
      estTime: '15-20 min',
      difficulty: 'Advanced',
      subtopics: [
        'Functions',
        'Domain and Range',
        'Linear Functions',
        'Quadratic Functions',
        'Graph Interpretation'
      ],
      sampleQuestion: 'Find the domain of f(x) = 1/(x - 3)',
      color: '#7C3AED',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE'
    },

    // PROGRAMMING
    {
      id: 'prog-syntax',
      subject: 'Programming',
      name: 'Variables & Data Types',
      category: 'Variables and Data Types',
      icon: <Code2 size={22} color="#7C3AED" />,
      description: 'Variables, primitive vs reference types, immutable strings, and assignments.',
      questionCount: 16,
      estTime: '10-15 min',
      difficulty: 'Foundations',
      subtopics: [
        'Variable Naming & Assignment',
        'Integers and Floats',
        'Strings and Character Slicing',
        'Booleans and Type Casting'
      ],
      sampleQuestion: 'What is the output of x = "5" + "5" in Python?',
      color: '#7C3AED',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE'
    },
    {
      id: 'prog-control',
      subject: 'Programming',
      name: 'Conditionals & Boolean Logic',
      category: 'Control Flow and Conditionals',
      icon: <Terminal size={22} color="#8B5CF6" />,
      description: 'Branching decisions, boolean operator precedence, short-circuit evaluation.',
      questionCount: 18,
      estTime: '15-20 min',
      difficulty: 'Foundations',
      subtopics: [
        'If, Elif, Else Blocks',
        'Logical AND, OR, NOT',
        'Comparison Operators',
        'Nested Conditionals'
      ],
      sampleQuestion: 'Identify the branch taken when x = 12 and y = 4',
      color: '#8B5CF6',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE'
    },
    {
      id: 'prog-loops',
      subject: 'Programming',
      name: 'Loops & Iteration',
      category: 'Loops and Iteration',
      icon: <Cpu size={22} color="#6D28D9" />,
      description: 'While loops, for-in iterators, loop termination invariants, and off-by-one errors.',
      questionCount: 20,
      estTime: '20-25 min',
      difficulty: 'Intermediate',
      subtopics: [
        'For Loops & Range',
        'While Loops & Guards',
        'Break and Continue',
        'Off-by-One Boundary Errors'
      ],
      sampleQuestion: 'How many iterations does for i in range(1, 10, 2) run?',
      color: '#6D28D9',
      bgLight: '#F5F3FF',
      borderColor: '#DDD6FE'
    },
    {
      id: 'prog-functions',
      subject: 'Programming',
      name: 'Functions & Scope',
      category: 'Functions and Modularity',
      icon: <FileCode size={22} color="#4F46E5" />,
      description: 'Parameter passing, return statements, local vs global scope, and recursion.',
      questionCount: 15,
      estTime: '15-20 min',
      difficulty: 'Intermediate',
      subtopics: [
        'Function Signatures',
        'Return Value vs Print',
        'Variable Scope (LEGB)',
        'Default Parameters'
      ],
      sampleQuestion: 'Explain why modifying a global variable inside a function fails without global keyword',
      color: '#4F46E5',
      bgLight: '#EEF2FF',
      borderColor: '#C7D2FE'
    },

    // ENGLISH
    {
      id: 'eng-grammar',
      subject: 'English',
      name: 'Subject-Verb Agreement',
      category: 'Grammar and Syntax',
      icon: <BookMarked size={22} color="#0891B2" />,
      description: 'Singular/plural agreement, collective nouns, compound subjects, and intervening phrases.',
      questionCount: 18,
      estTime: '10-15 min',
      difficulty: 'Foundations',
      subtopics: [
        'Basic Number Agreement',
        'Intervening Prepositional Phrases',
        'Compound Subjects with Or/Nor',
        'Indefinite Pronouns'
      ],
      sampleQuestion: 'Choose: "The committee of scholars (has/have) finalized the report."',
      color: '#0891B2',
      bgLight: '#ECFEFF',
      borderColor: '#A5F3FC'
    },
    {
      id: 'eng-reading',
      subject: 'English',
      name: 'Reading Comprehension',
      category: 'Reading Comprehension',
      icon: <BookOpen size={22} color="#0D9488" />,
      description: 'Main ideas, author tone, explicit evidence, and subtle inferences from literature.',
      questionCount: 16,
      estTime: '15-20 min',
      difficulty: 'Intermediate',
      subtopics: [
        'Main Idea Identification',
        'Direct Factual Evidence',
        'Author Tone & Purpose',
        'Inference & Deduction'
      ],
      sampleQuestion: 'What conclusion can be drawn from paragraph 2 regarding the character\'s motive?',
      color: '#0D9488',
      bgLight: '#F0FDFA',
      borderColor: '#99F6E4'
    },
    {
      id: 'eng-vocabulary',
      subject: 'English',
      name: 'Vocabulary & Context Clues',
      category: 'Vocabulary and Etymology',
      icon: <Sparkles size={22} color="#D97706" />,
      description: 'Prefixes, roots, suffixes, context clues, and words with multiple semantic nuances.',
      questionCount: 14,
      estTime: '10-15 min',
      difficulty: 'Foundations',
      subtopics: [
        'Greek and Latin Roots',
        'Prefixes & Suffixes',
        'Contextual Deciphering',
        'Connotation vs Denotation'
      ],
      sampleQuestion: 'Determine the meaning of "ephemeral" based on the passage sentence.',
      color: '#D97706',
      bgLight: '#FFFBEB',
      borderColor: '#FDE68A'
    }
  ];

  const handlePracticeCategory = async (subject: SubjectType, categoryName: string, topicName?: string) => {
    try {
      if (currentStudent) {
        await startSession(currentStudent.id, { 
          subject,
          category: categoryName,
          topic: topicName || categoryName
        });
      }
      navigate('/practice');
    } catch (err) {
      console.error('Error starting category practice', err);
      navigate('/practice');
    }
  };

  const getTopicMastery = (catName: string) => {
    if (!studentProgress?.topics) return { mastery: 0, attempts: 0 };
    const topic = studentProgress.topics[catName];
    if (!topic) return { mastery: 0, attempts: 0 };
    return {
      mastery: topic.masteryPercent ?? topic.mastery ?? 0,
      attempts: topic.attempts ?? 0
    };
  };

  const filteredCategories = selectedSubject === 'ALL'
    ? allCategories
    : allCategories.filter(c => c.subject === selectedSubject);

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
        maxWidth: '1240px',
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
          <span>CURRICULUM TOPICS</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: '#2563EB' }}>ALL SUBJECTS</span>
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
              <BookOpen size={14} />
              <span>Multi-Subject Cognitive Diagnostic Library</span>
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              Curriculum Topics & Knowledge Library
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', margin: 0, maxWidth: '680px', lineHeight: 1.5 }}>
              MindTrace diagnoses your thinking across Mathematics, Programming, and English. Practice any topic to expose misconceptions, test your mental models, and receive Socratic tutor interventions.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Overall Mastery</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#2563EB' }}>
                {studentProgress?.overallMastery ?? 39}%
              </div>
            </div>
            <div style={{ width: '1px', height: '36px', backgroundColor: '#E2E8F0' }} />
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total Attempts</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A' }}>
                {studentProgress?.totalAttempts ?? 1}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Subject Filter Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setSelectedSubject('ALL')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedSubject === 'ALL' ? '2px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: selectedSubject === 'ALL' ? '#EFF6FF' : '#FFFFFF',
              color: selectedSubject === 'ALL' ? '#2563EB' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All Subjects ({allCategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubject('Mathematics')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedSubject === 'Mathematics' ? '2px solid #2563EB' : '1px solid #E2E8F0',
              backgroundColor: selectedSubject === 'Mathematics' ? '#EFF6FF' : '#FFFFFF',
              color: selectedSubject === 'Mathematics' ? '#2563EB' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📐 Mathematics (8)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubject('Programming')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedSubject === 'Programming' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
              backgroundColor: selectedSubject === 'Programming' ? '#F5F3FF' : '#FFFFFF',
              color: selectedSubject === 'Programming' ? '#7C3AED' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>💻 Programming (4)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSubject('English')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedSubject === 'English' ? '2px solid #0891B2' : '1px solid #E2E8F0',
              backgroundColor: selectedSubject === 'English' ? '#ECFEFF' : '#FFFFFF',
              color: selectedSubject === 'English' ? '#0891B2' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📖 English (3)</span>
          </button>
        </div>

        {/* Category Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredCategories.map((cat) => {
            const { mastery, attempts } = getTopicMastery(cat.category);
            const isSelected = selectedCategory === cat.id;

            return (
              <div 
                key={cat.id} 
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '18px',
                  padding: '26px',
                  border: isSelected ? `2px solid ${cat.color}` : '1px solid #E2E8F0',
                  boxShadow: isSelected ? `0 8px 24px rgba(0,0,0,0.06)` : '0 2px 8px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar with Icon & Question Count & Est Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: cat.bgLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${cat.borderColor}`
                    }}>
                      {cat.icon}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#64748B',
                        backgroundColor: '#F1F5F9',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        <Clock size={11} />
                        <span>{cat.estTime}</span>
                      </span>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: cat.color,
                        backgroundColor: cat.bgLight,
                        border: `1px solid ${cat.borderColor}`,
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {cat.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title & Subject Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: cat.color }}>
                      {cat.subject}
                    </span>
                    <span style={{ color: '#CBD5E1' }}>•</span>
                    <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      {cat.questionCount} Questions
                    </span>
                  </div>

                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                    {cat.name}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px', lineHeight: 1.5 }}>
                    {cat.description}
                  </p>

                  {/* Mastery Progress Bar */}
                  <div style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '16px',
                    border: '1px solid #F1F5F9'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                        Mastery: <strong style={{ color: cat.color }}>{mastery}%</strong>
                      </span>
                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                        {attempts} attempted
                      </span>
                    </div>

                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: '#E2E8F0',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${mastery}%`,
                        height: '100%',
                        backgroundColor: cat.color,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  </div>

                  {/* Sample problem pill */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px dashed #CBD5E1',
                    marginBottom: '16px',
                    fontSize: '12px',
                    color: '#475569'
                  }}>
                    <span style={{ fontWeight: 600, color: '#0F172A' }}>Sample: </span>
                    <span style={{ fontFamily: cat.subject === 'Programming' || cat.sampleQuestion.includes('x') ? "'JetBrains Mono', monospace" : 'inherit' }}>
                      {cat.sampleQuestion}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handlePracticeCategory(cat.subject, cat.category, cat.subtopics[0])}
                    style={{
                      flex: 1,
                      padding: '11px 16px',
                      backgroundColor: cat.color,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: `0 2px 6px ${cat.color}33`,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span>Start Practice</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
