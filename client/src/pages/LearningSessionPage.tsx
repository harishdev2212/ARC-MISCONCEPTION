import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { api } from '../services/api';
import { 
  ArrowRight, 
  Send, 
  Lightbulb, 
  RefreshCw,
  AlertCircle,
  X,
  Camera,
  Upload,
  Check,
  Edit2,
  FileText,
  Sparkles,
  HelpCircle,
  Code,
  BookOpen,
  Brain,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { 
  SUBJECT_CURRICULUM, 
  SubjectType, 
  getSubjects, 
  getCategoriesBySubject, 
  getTopicsByCategory 
} from '@shared/subjectCurriculum';

interface LearningSessionPageProps {
  onNavigate: (view: string) => void;
}

type PracticeViewMode = 
  | 'entry_choice' 
  | 'vision_reading' 
  | 'vision_review' 
  | 'vision_error' 
  | 'manual_entry' 
  | 'solving';

export const LearningSessionPage: React.FC<LearningSessionPageProps> = ({ onNavigate }) => {
  const { currentStudent } = useAuth();
  const { 
    session, 
    startSession, 
    submitReasoning, 
    isSubmitting, 
    lastError, 
    clearError 
  } = useSession();

  // Subject and curriculum selection state
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('Mathematics');
  const [selectedCategory, setSelectedCategory] = useState<string>('Algebra');
  const [selectedTopic, setSelectedTopic] = useState<string>('Linear Equations in One Variable');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Primary solving state
  const [viewMode, setViewMode] = useState<PracticeViewMode>('solving');
  const [reasoningText, setReasoningText] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');

  // Vision pipeline state
  const [extractedEquation, setExtractedEquation] = useState('');
  const [extractedProblemStatement, setExtractedProblemStatement] = useState('');
  const [extractedExpectedAnswer, setExtractedExpectedAnswer] = useState('');
  const [extractedCategory, setExtractedCategory] = useState<string>('Algebra');
  const [extractedTopic, setExtractedTopic] = useState<string>('Linear Equations in One Variable');
  const [extractedConcept, setExtractedConcept] = useState<string>('inverse_operations');
  const [extractedDifficulty, setExtractedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [visionConfidence, setVisionConfidence] = useState<number>(1.0);
  const [visionNeedsConfirmation, setVisionNeedsConfirmation] = useState(false);
  const [isEditingExtracted, setIsEditingExtracted] = useState(false);
  const [manualInputEquation, setManualInputEquation] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Vision Problem Explanation state
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [stepByStepExplanation, setStepByStepExplanation] = useState<{ steps: string[]; solution: string; summary: string } | null>(null);

  // Drag and Drop & Progressive Scanner State
  const [isDragging, setIsDragging] = useState(false);
  const [scanningStep, setScanningStep] = useState(1);

  // File input refs
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Sync selectedSubject with session's question if session exists
  useEffect(() => {
    if (session?.currentQuestion?.subject) {
      setSelectedSubject(session.currentQuestion.subject as SubjectType);
    }
    if (session?.currentQuestion?.topic) {
      setSelectedTopic(session.currentQuestion.topic);
    }
  }, [session]);

  // Initialize session on mount if student is present and no session exists
  useEffect(() => {
    if (!session && currentStudent) {
      setViewMode('entry_choice');
    } else if (session) {
      setViewMode('solving');
    }
  }, [session, currentStudent]);

  // Handle subject change
  const handleSubjectChange = (subject: SubjectType) => {
    setSelectedSubject(subject);
    const categories = getCategoriesBySubject(subject);
    const firstCat = categories[0]?.name || '';
    setSelectedCategory(firstCat);
    const topics = getTopicsByCategory(subject, firstCat);
    setSelectedTopic(topics[0]?.name || '');
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const topics = getTopicsByCategory(selectedSubject, category);
    setSelectedTopic(topics[0]?.name || '');
  };

  // Start practice with selected subject, category, topic, difficulty
  const handleStartPracticeProblem = async (overrideTopic?: string) => {
    if (!currentStudent) return;
    setViewMode('solving');
    setReasoningText('');
    setStudentAnswer('');
    await startSession(currentStudent.id, {
      subject: selectedSubject,
      category: selectedCategory,
      topic: overrideTopic || selectedTopic,
      difficulty: selectedDifficulty
    });
  };

  // Trigger file upload dialog
  const handleTriggerUpload = () => {
    if (fileUploadInputRef.current) {
      fileUploadInputRef.current.value = '';
      fileUploadInputRef.current.click();
    }
  };

  // Trigger camera capture dialog
  const handleTriggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
      cameraInputRef.current.click();
    }
  };

  // Process file (for both drag & drop and file input)
  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      alert('Please upload an image in JPG, PNG, or WebP format.');
      return;
    }

    setViewMode('vision_reading');
    setImagePreviewUrl(URL.createObjectURL(file));
    setStepByStepExplanation(null);
    setScanningStep(1);

    const stepTimer = setInterval(() => {
      setScanningStep((s) => (s < 4 ? s + 1 : s));
    }, 700);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      try {
        const result = await api.extractMathImage(base64Data, file.type);
        clearInterval(stepTimer);
        if (result.success && result.equation) {
          setExtractedEquation(result.equation);
          setExtractedProblemStatement(result.problemStatement || `Solve: ${result.equation}`);
          setExtractedExpectedAnswer(result.expectedAnswer || 'x');
          setExtractedCategory((result as any).category || 'Algebra');
          setExtractedTopic((result as any).topic || 'Linear Equations in One Variable');
          setExtractedConcept((result as any).concept || 'inverse_operations');
          setExtractedDifficulty((result as any).difficulty || 'medium');
          setVisionConfidence(result.confidence);
          setVisionNeedsConfirmation(result.needsConfirmation || result.confidence < 0.80);
          setIsEditingExtracted(false);
          setViewMode('vision_review');
        } else {
          setViewMode('vision_error');
        }
      } catch (err) {
        clearInterval(stepTimer);
        console.error('Vision extraction error:', err);
        setViewMode('vision_error');
      }
    };

    reader.onerror = () => {
      clearInterval(stepTimer);
      setViewMode('vision_error');
    };

    reader.readAsDataURL(file);
  };

  // Handle image selection (file upload or camera capture)
  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Confirm extracted equation and start solving
  const handleConfirmExtracted = async () => {
    if (!currentStudent || !extractedEquation.trim()) return;
    setViewMode('solving');
    setReasoningText('');
    setStudentAnswer('');
    await startSession(currentStudent.id, {
      subject: 'Mathematics',
      category: extractedCategory,
      topic: extractedTopic,
      customQuestion: {
        subject: 'Mathematics',
        equation: extractedEquation.trim(),
        prompt: extractedProblemStatement.trim() || `Solve: ${extractedEquation.trim()}`,
        expectedAnswer: extractedExpectedAnswer.trim(),
        category: extractedCategory,
        topic: extractedTopic,
        concept: extractedConcept,
        difficulty: extractedDifficulty
      }
    });
  };

  // Explain problem using step-by-step AI mathematics solver
  const handleExplainProblem = async () => {
    if (!extractedEquation.trim()) return;
    setExplanationLoading(true);
    try {
      const res = await api.explainProblem(extractedEquation.trim(), extractedTopic);
      if (res.success && res.explanation) {
        setStepByStepExplanation(res.explanation);
      }
    } catch (err) {
      console.error('Failed to get problem explanation:', err);
    } finally {
      setExplanationLoading(false);
    }
  };

  // Practice similar problem from extracted topic
  const handlePracticeSimilar = async () => {
    if (!currentStudent) return;
    setViewMode('solving');
    setReasoningText('');
    setStudentAnswer('');
    await startSession(currentStudent.id, {
      subject: 'Mathematics',
      category: extractedCategory || 'Algebra',
      topic: extractedTopic || 'Linear Equations in One Variable',
      difficulty: extractedDifficulty
    });
  };

  // Confirm manual equation entry
  const handleConfirmManualEquation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent || !manualInputEquation.trim()) return;
    setViewMode('solving');
    setReasoningText('');
    setStudentAnswer('');
    await startSession(currentStudent.id, {
      subject: 'Mathematics',
      customQuestion: {
        subject: 'Mathematics',
        equation: manualInputEquation.trim(),
        prompt: `Solve for x: ${manualInputEquation.trim()}`
      }
    });
  };

  // Submit student reasoning
  const handleSubmitReasoning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasoningText.trim()) return;

    const success = await submitReasoning(reasoningText, studentAnswer);
    if (success) {
      onNavigate('diagnosis-intervention');
    }
  };

  const currentQ = session?.currentQuestion;
  const categoriesForSelectedSubject = getCategoriesBySubject(selectedSubject);
  const topicsForSelectedCategory = getTopicsByCategory(selectedSubject, selectedCategory);

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '820px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Hidden file and camera inputs */}
      <input 
        type="file" 
        ref={fileUploadInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg, image/jpg, image/webp" 
        onChange={handleImageSelected} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        capture="environment" 
        onChange={handleImageSelected} 
      />

      {/* ========================================================================= */}
      {/* VIEW 1: ENTRY CHOICE & SUBJECT SELECTION                                  */}
      {/* ========================================================================= */}
      {viewMode === 'entry_choice' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              marginBottom: '14px'
            }}>
              <Brain size={24} />
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.02em'
            }}>
              Choose Your Practice Experience
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0 auto',
              maxWidth: '520px',
              lineHeight: 1.5
            }}>
              MindTrace analyzes your reasoning, predicts bugs, and diagnoses underlying cognitive misconceptions across multiple subjects.
            </p>
          </div>

          {/* Section 1: Subject Selector Bar */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Select Subject:
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px'
            }}>
              {(['Mathematics', 'Programming', 'English'] as SubjectType[]).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => handleSubjectChange(subj)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px 12px',
                    borderRadius: '12px',
                    border: selectedSubject === subj ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: selectedSubject === subj ? '#eff6ff' : '#f8fafc',
                    color: selectedSubject === subj ? '#1d4ed8' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {subj === 'Mathematics' ? '📐' : subj === 'Programming' ? '💻' : '📖'}
                  </span>
                  <strong style={{ fontSize: '15px', fontWeight: 700 }}>{subj}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    {subj === 'Mathematics' ? 'Algebra, Geometry, Stats' : subj === 'Programming' ? 'Loops, DS, Debugging' : 'Grammar, Reading, Writing'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Category & Topic Filter */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '28px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {categoriesForSelectedSubject.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Topic
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {topicsForSelectedCategory.map((top) => (
                  <option key={top.id} value={top.name}>{top.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Difficulty
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: selectedDifficulty === diff ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      backgroundColor: selectedDifficulty === diff ? '#2563eb' : '#ffffff',
                      color: selectedDifficulty === diff ? '#ffffff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {diff === 'easy' ? 'Beginner' : diff === 'medium' ? 'Interm.' : 'Advanced'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: selectedSubject === 'Mathematics' ? 'repeat(auto-fit, minmax(220px, 1fr))' : '1fr',
            gap: '16px'
          }}>
            {/* Start Practice Option */}
            <button
              type="button"
              onClick={() => handleStartPracticeProblem()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '24px 20px',
                backgroundColor: '#ffffff',
                border: '2px solid #2563eb',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <FileText size={22} />
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Practice {selectedTopic}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Cognitive diagnosis on step-by-step reasoning
              </span>
            </button>

            {/* Mathematics Only: Snap or Upload a Question with Drag & Drop */}
            {selectedSubject === 'Mathematics' && (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) processFile(f);
                }}
                style={{
                  gridColumn: '1 / -1',
                  border: isDragging ? '2px dashed #2563EB' : '2px dashed #CBD5E1',
                  backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
                  borderRadius: '16px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)'
                }}>
                  <Camera size={24} />
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                    Snap or Upload a Question
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, maxWidth: '440px' }}>
                    Drag and drop a photo of a textbook or handwritten equation, or browse from your device.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleTriggerCamera}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: '#FFFFFF',
                      color: '#0F172A',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Camera size={14} />
                    <span>Take Photo</span>
                  </button>
                </div>

                <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Supported formats: JPG, PNG, WebP • Powered by Multimodal AI
                </span>
              </div>
            )}
          </div>

          {selectedSubject === 'Mathematics' && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setViewMode('manual_entry')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Or enter an equation manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: READING PROBLEM (Vision Reading Screen with 4-phase scanning)     */}
      {/* ========================================================================= */}
      {viewMode === 'vision_reading' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '48px 32px',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            marginBottom: '20px',
            boxShadow: '0 0 0 8px rgba(37, 99, 235, 0.1)'
          }}>
            <RefreshCw size={28} className="animate-spin" />
          </div>

          <h3 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            Reading your mathematical problem...
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: 0
          }}>
            Our vision engine is analyzing handwritten notes, symbols, and algebraic structures.
          </p>

          {/* 4-Phase Scanning Progression */}
          <div style={{ maxWidth: '420px', margin: '28px auto 0', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: scanningStep >= 1 ? '#2563EB' : '#94A3B8', fontWeight: scanningStep >= 1 ? 700 : 500 }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: scanningStep >= 1 ? '#EFF6FF' : '#F1F5F9', border: `1px solid ${scanningStep >= 1 ? '#BFDBFE' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {scanningStep > 1 ? '✓' : '1'}
              </span>
              <span>1. Reading handwritten & printed symbols</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: scanningStep >= 2 ? '#2563EB' : '#94A3B8', fontWeight: scanningStep >= 2 ? 700 : 500 }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: scanningStep >= 2 ? '#EFF6FF' : '#F1F5F9', border: `1px solid ${scanningStep >= 2 ? '#BFDBFE' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {scanningStep > 2 ? '✓' : '2'}
              </span>
              <span>2. Understanding algebraic structure & equality balance</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: scanningStep >= 3 ? '#2563EB' : '#94A3B8', fontWeight: scanningStep >= 3 ? 700 : 500 }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: scanningStep >= 3 ? '#EFF6FF' : '#F1F5F9', border: `1px solid ${scanningStep >= 3 ? '#BFDBFE' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {scanningStep > 3 ? '✓' : '3'}
              </span>
              <span>3. Verifying equation properties with Gemini Vision</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: scanningStep >= 4 ? '#16A34A' : '#94A3B8', fontWeight: scanningStep >= 4 ? 700 : 500 }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: scanningStep >= 4 ? '#ECFDF5' : '#F1F5F9', border: `1px solid ${scanningStep >= 4 ? '#BBF7D0' : '#E2E8F0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                {scanningStep >= 4 ? '✓' : '4'}
              </span>
              <span>4. Preparing Socratic diagnosis & practice</span>
            </div>
          </div>

          {imagePreviewUrl && (
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
              <img 
                src={imagePreviewUrl} 
                alt="Uploaded Problem Preview" 
                style={{
                  maxHeight: '140px',
                  maxWidth: '280px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  objectFit: 'contain'
                }} 
              />
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: VISION REVIEW & ACTIONS (Section 3: Solve, Explain, Practice)    */}
      {/* ========================================================================= */}
      {viewMode === 'vision_review' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '3px 8px',
              borderRadius: '4px'
            }}>
              IMAGE DETECTED
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              • Multimodal Mathematical Recognition
            </span>
          </div>

          <h3 style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 12px 0'
          }}>
            Detected Problem
          </h3>

          {visionNeedsConfirmation && (
            <div style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fef3c7',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              color: '#92400e',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} color="#d97706" style={{ flexShrink: 0 }} />
              <span>
                Please check the extracted problem below and edit if needed.
              </span>
            </div>
          )}

          {/* Equation Box */}
          {!isEditingExtracted ? (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '28px',
              fontWeight: 600,
              color: '#0f172a',
              letterSpacing: '0.04em',
              marginBottom: '16px'
            }}>
              {extractedEquation}
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Edit Equation / Problem:
              </label>
              <input
                type="text"
                value={extractedEquation}
                onChange={(e) => setExtractedEquation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '22px',
                  fontWeight: 600,
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  outline: 'none',
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
                autoFocus
              />
            </div>
          )}

          {/* Topic Classification (Section 3) */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                  Topic Detected
                </span>
                <strong style={{ color: '#0f172a', fontSize: '16px' }}>{extractedTopic}</strong>
                <span style={{ fontSize: '12px', color: '#2563eb', marginLeft: '8px' }}>({extractedCategory})</span>
              </div>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb'
                }}>
                  Confidence: {Math.round(visionConfidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Step-by-Step Explanation Card if requested */}
          {explanationLoading && (
            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              <RefreshCw size={22} className="animate-spin" color="#2563eb" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af' }}>
                Analyzing problem and generating step-by-step mathematical explanation...
              </div>
            </div>
          )}

          {stepByStepExplanation && !explanationLoading && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Lightbulb size={20} color="#2563eb" />
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Step-by-Step Mathematical Explanation
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {stepByStepExplanation.steps.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: '14px', color: '#1e293b', lineHeight: 1.5 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: 600 }}>Final Solution:</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#15803d', fontFamily: 'monospace' }}>
                  {stepByStepExplanation.solution}
                </span>
              </div>
            </div>
          )}

          {/* Section 3 Required Action Buttons: [ Solve ] [ Explain ] [ Practice Similar ] */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('entry_choice')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '8px 0'
              }}
            >
              ← Choose another problem
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {!isEditingExtracted ? (
                <button
                  type="button"
                  onClick={() => setIsEditingExtracted(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={15} />
                  <span>Edit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingExtracted(false)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#334155',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Check size={15} />
                  <span>Done</span>
                </button>
              )}

              {/* [ Explain ] */}
              <button
                type="button"
                onClick={handleExplainProblem}
                disabled={explanationLoading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#7c3aed',
                  backgroundColor: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Lightbulb size={16} />
                <span>Explain</span>
              </button>

              {/* [ Practice Similar ] */}
              <button
                type="button"
                onClick={handlePracticeSimilar}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0284c7',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} />
                <span>Practice Similar</span>
              </button>

              {/* [ Solve ] */}
              <button
                type="button"
                onClick={handleConfirmExtracted}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)'
                }}
              >
                <Check size={16} />
                <span>Solve This</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: VISION ERROR SCREEN                                               */}
      {/* ========================================================================= */}
      {viewMode === 'vision_error' && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            marginBottom: '16px'
          }}>
            <AlertCircle size={24} />
          </div>

          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 8px 0'
          }}>
            I couldn't read part of the equation clearly.
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 auto 28px auto',
            maxWidth: '440px',
            lineHeight: 1.5
          }}>
            Please retake the photo with better lighting or enter the problem manually.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <button
              type="button"
              onClick={handleTriggerUpload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('manual_entry')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <Edit2 size={16} />
              <span>Enter Problem Manually</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: MANUAL EQUATION ENTRY                                             */}
      {/* ========================================================================= */}
      {viewMode === 'manual_entry' && (
        <form onSubmit={handleConfirmManualEquation} style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '36px 32px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0'
          }}>
            Enter Problem Manually
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 20px 0'
          }}>
            Type any mathematical equation you'd like to practice solving.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="e.g. 3x + 8 = 29 or 2x - 7 = 15"
              value={manualInputEquation}
              onChange={(e) => setManualInputEquation(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '20px',
                fontWeight: 600,
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                color: '#0f172a',
                boxSizing: 'border-box'
              }}
              autoFocus
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('entry_choice')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={!manualInputEquation.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: manualInputEquation.trim() ? 'pointer' : 'not-allowed',
                opacity: manualInputEquation.trim() ? 1 : 0.6
              }}
            >
              <span>Start Practice</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: STANDARD MULTI-SUBJECT SOLVING & REASONING INTERFACE              */}
      {/* ========================================================================= */}
      {viewMode === 'solving' && (
        <>
          {/* Top Multi-Subject Switcher (Section 1) */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Subject:
              </span>
              {(['Mathematics', 'Programming', 'English'] as SubjectType[]).map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    handleSubjectChange(subj);
                    // Start new question in that subject
                    if (currentStudent) {
                      const firstCat = getCategoriesBySubject(subj)[0]?.name || '';
                      const firstTopic = getTopicsByCategory(subj, firstCat)[0]?.name || '';
                      startSession(currentStudent.id, {
                        subject: subj,
                        category: firstCat,
                        topic: firstTopic,
                        difficulty: selectedDifficulty
                      });
                    }
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: (currentQ?.subject || selectedSubject) === subj ? 700 : 500,
                    backgroundColor: (currentQ?.subject || selectedSubject) === subj ? '#2563eb' : '#f8fafc',
                    color: (currentQ?.subject || selectedSubject) === subj ? '#ffffff' : '#475569',
                    border: (currentQ?.subject || selectedSubject) === subj ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {subj === 'Mathematics' ? '📐 Math' : subj === 'Programming' ? '💻 Coding' : '📖 English'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setViewMode('entry_choice')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Sliders size={13} />
              <span>Change Topic / Level</span>
            </button>
          </div>

          {/* 3-Step Progress Indicator: Solve -> Reflect -> Apply */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
          }}>
            {/* Step 1: Solve (Active) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700
              }}>
                1
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Solve & Reason
              </span>
            </div>

            <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

            {/* Step 2: Reflect */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.45 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600
              }}>
                2
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                Cognitive Diagnosis
              </span>
            </div>

            <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

            {/* Step 3: Apply */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: 0.45 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 600
              }}>
                3
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                Adaptive Mastery
              </span>
            </div>
          </div>

          {/* Gentle Notice Banner if error occurs */}
          {lastError && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#991b1b',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={18} color="#dc2626" />
                <span>{lastError.message || 'We could not submit your response. Please try again.'}</span>
              </div>
              <button 
                type="button" 
                onClick={clearError} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#991b1b', padding: '2px' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Question Card */}
          <section style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}>
            {/* Top Toolbar: Topic Badges & Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#2563eb',
                  backgroundColor: '#eff6ff',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {currentQ?.subject || selectedSubject}
                </span>

                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569'
                }}>
                  {currentQ?.topic || selectedTopic}
                </span>

                {currentQ?.difficulty && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: currentQ.difficulty === 'easy' ? '#dcfce7' : currentQ.difficulty === 'hard' ? '#fee2e2' : '#fef3c7',
                    color: currentQ.difficulty === 'easy' ? '#166534' : currentQ.difficulty === 'hard' ? '#991b1b' : '#92400e'
                  }}>
                    {currentQ.difficulty}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedSubject === 'Mathematics' && (
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #dbeafe',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="Upload handwritten or printed problem"
                  >
                    <Camera size={14} />
                    <span>📷 Upload Photo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStartPracticeProblem()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={12} />
                  <span>Next Question</span>
                </button>
              </div>
            </div>

            {/* Prompt Statement */}
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.015em'
            }}>
              {currentQ?.prompt || 'Solve the problem and explain your reasoning.'}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: '0 0 20px 0'
            }}>
              {currentQ?.instructions || 'Show your steps and explain why your approach works.'}
            </p>

            {/* Subject-Specific Component Display */}

            {/* 1. Mathematics Equation Box */}
            {currentQ?.equation && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '26px',
                fontWeight: 600,
                color: '#0f172a',
                letterSpacing: '0.04em',
                marginBottom: '20px'
              }}>
                {currentQ.equation}
              </div>
            )}

            {/* 2. Programming Code Snippet Box (Section 4) */}
            {currentQ?.codeSnippet && (
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '18px 20px',
                marginBottom: '20px',
                overflowX: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Code size={14} color="#38bdf8" />
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                    Code Snippet
                  </span>
                </div>
                <pre style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '14px',
                  color: '#f8fafc',
                  lineHeight: 1.6,
                  margin: 0,
                  whiteSpace: 'pre-wrap'
                }}>
                  {currentQ.codeSnippet}
                </pre>
              </div>
            )}

            {/* 3. English Reading Passage Box (Section 5) */}
            {currentQ?.passage && (
              <div style={{
                backgroundColor: '#fdfbf7',
                border: '1px solid #e7dfd5',
                borderRadius: '8px',
                padding: '20px 24px',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <BookOpen size={14} color="#854d0e" />
                  <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 700, textTransform: 'uppercase' }}>
                    Reading Passage
                  </span>
                </div>
                <p style={{
                  fontSize: '15px',
                  lineHeight: 1.7,
                  color: '#292524',
                  margin: 0,
                  fontFamily: "Georgia, serif"
                }}>
                  {currentQ.passage}
                </p>
              </div>
            )}

            {/* 4. Multiple Choice Options (if present) */}
            {currentQ?.options && currentQ.options.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Select an Option:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentQ.options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStudentAnswer(opt)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: studentAnswer === opt ? '2px solid #2563eb' : '1px solid #e2e8f0',
                        backgroundColor: studentAnswer === opt ? '#eff6ff' : '#ffffff',
                        color: studentAnswer === opt ? '#1d4ed8' : '#334155',
                        textAlign: 'left',
                        fontSize: '14px',
                        fontWeight: studentAnswer === opt ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#1e40af'
            }}>
              <Lightbulb size={16} color="#2563eb" style={{ flexShrink: 0 }} />
              <span>
                MindTrace analyzes <em>why</em> you chose your answer to diagnose your underlying cognitive understanding and error patterns.
              </span>
            </div>
          </section>

          {/* Reasoning Input Form */}
          <form onSubmit={handleSubmitReasoning} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Final Answer Input */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Your Answer / Predicted Output
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={
                  (currentQ?.subject || selectedSubject) === 'Programming' 
                    ? 'e.g. 0 1 2 3 4 or None' 
                    : (currentQ?.subject || selectedSubject) === 'English' 
                    ? 'e.g. goes or option B' 
                    : 'e.g. x = 7'
                }
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                style={{ maxWidth: '340px' }}
              />
            </div>

            {/* Free-form Reasoning */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                  Your Step-by-Step Reasoning / Thought Process
                </label>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {reasoningText.length} characters
                </span>
              </div>

              <textarea
                className="form-textarea"
                placeholder={
                  (currentQ?.subject || selectedSubject) === 'Programming'
                    ? 'Explain how the code executes step-by-step, including loop conditions, variable updates, or why you spotted a bug...'
                    : (currentQ?.subject || selectedSubject) === 'English'
                    ? 'Explain the grammatical rule, subject-verb relationship, or evidence from the text supporting your answer...'
                    : 'Describe what you did first and how you kept both sides of the equation balanced...'
                }
                value={reasoningText}
                onChange={(e) => setReasoningText(e.target.value)}
                rows={6}
                required
                autoFocus
              />
            </div>

            {/* Submit Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '20px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <button 
                type="button" 
                onClick={() => onNavigate('student-dashboard')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '6px 0'
                }}
              >
                ← Back to Dashboard
              </button>

              <button
                type="submit"
                disabled={!reasoningText.trim() || isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isSubmitting || !reasoningText.trim() ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Diagnosing cognitive reasoning...</span>
                  </>
                ) : (
                  <>
                    <span>Submit & Analyze Reasoning</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};
