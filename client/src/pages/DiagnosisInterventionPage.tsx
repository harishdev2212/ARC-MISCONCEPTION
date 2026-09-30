import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Send, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Sparkles,
  BookOpen,
  Code,
  BrainCircuit
} from 'lucide-react';
import { DialogueTurn, ReflectUIState } from '@shared/types';

interface DiagnosisInterventionPageProps {
  onNavigate: (view: string) => void;
}

export const DiagnosisInterventionPage: React.FC<DiagnosisInterventionPageProps> = ({ onNavigate }) => {
  const { currentStudent } = useAuth();
  const { 
    session, 
    diagnosis, 
    intervention, 
    dialogueHistory, 
    respondToDialogue, 
    startSession,
    isSubmitting 
  } = useSession();

  const currentDiag = diagnosis || session?.currentDiagnosis;
  const currentIntv = intervention || session?.currentIntervention;

  const turns: DialogueTurn[] = (dialogueHistory && dialogueHistory.length > 0)
    ? dialogueHistory
    : (session?.dialogueHistory && session.dialogueHistory.length > 0)
    ? session.dialogueHistory
    : [
        {
          id: 'initial-turn',
          attempt: 1,
          studentResponse: session?.studentResponse?.reasoningText || 'I subtracted 8 from the left side only, so 3x = 29.',
          diagnosis: currentDiag?.diagnosis || 'procedural_error',
          confidence: currentDiag?.confidence || 0.95,
          evidence: currentDiag?.evidence || 'Initial reasoning evaluation',
          affectedSkill: currentDiag?.affectedSkill || 'properties_of_equality',
          interventionLevel: currentIntv?.levelNumber || 1,
          interventionType: currentIntv?.type || (currentDiag?.isCorrect ? 'POSITIVE_FEEDBACK' : 'SOCRATIC_PROBE'),
          interventionText: currentIntv?.socraticQuestion || currentIntv?.tutorMessage || 'If you subtract 8 from the left side, what must you do to the right side to keep the equation balanced?',
          persists: !currentDiag?.isCorrect,
          understandingDetected: Boolean(currentDiag?.isCorrect),
          timestamp: new Date().toISOString()
        }
      ];

  const latestTurn = turns[turns.length - 1];

  // Initialize explicit Reflect UI State (Requirement 13 & 14)
  const [reflectUIState, setReflectUIState] = useState<ReflectUIState>(() => {
    if (session?.reflectUIState) return session.reflectUIState;
    if (latestTurn?.evaluationClassification === 'CORRECT') return 'REFLECT_CORRECT';
    if (currentDiag?.isCorrect || session?.understandingDetected) return 'REFLECT_CORRECT';
    return 'REFLECT_QUESTION';
  });

  const [activeQuestion, setActiveQuestion] = useState<string>(() => {
    return latestTurn?.nextQuestion || 
      latestTurn?.interventionText || 
      currentIntv?.socraticQuestion || 
      'If you subtract 8 from the left side, what must you do to the right side to keep the equation balanced?';
  });

  const [understandingMessage, setUnderstandingMessage] = useState<string>(() => {
    if (latestTurn?.understandingMessage) return latestTurn.understandingMessage;
    if (currentDiag?.isCorrect) return 'You correctly identified that both sides of an equation must remain balanced.';
    return '';
  });

  const [studentReply, setStudentReply] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const isUnderstandingReady = Boolean(
    reflectUIState === 'REFLECT_CORRECT' || 
    reflectUIState === 'REFLECT_COMPLETE' || 
    session?.understandingDetected || 
    currentDiag?.isCorrect
  );

  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentReply.trim() || isSubmitting || reflectUIState === 'REFLECT_EVALUATING') return;

    const responseText = studentReply.trim();
    const currentQText = activeQuestion;
    const diagSkill = currentDiag?.affectedSkill || currentDiag?.diagnosis || 'properties_of_equality';

    // Transition to REFLECT_EVALUATING
    setReflectUIState('REFLECT_EVALUATING');

    // Requirement 15: Log in development mode
    console.log(`[REFLECT_DEV_LOG UI] ========================================`);
    console.log(`[REFLECT_DEV_LOG UI] Diagnosis:`, diagSkill);
    console.log(`[REFLECT_DEV_LOG UI] Generated Question:`, currentQText);
    console.log(`[REFLECT_DEV_LOG UI] Student Answer:`, responseText);
    console.log(`[REFLECT_DEV_LOG UI] State: REFLECT_EVALUATING`);

    const res = await respondToDialogue(responseText);

    if (res && res.success) {
      const classification = res.diagnosis.evaluationClassification || (res.diagnosis.understandingDetected ? 'CORRECT' : 'INCORRECT');
      const nextState = res.diagnosis.reflectUIState || (classification === 'CORRECT' ? 'REFLECT_CORRECT' : 'REFLECT_QUESTION');

      console.log(`[REFLECT_DEV_LOG UI] Evaluation Result:`, classification);
      console.log(`[REFLECT_DEV_LOG UI] Next Reflection State:`, nextState);
      console.log(`[REFLECT_DEV_LOG UI] ========================================`);

      setReflectUIState(nextState);

      if (classification === 'CORRECT' || nextState === 'REFLECT_CORRECT') {
        setUnderstandingMessage(res.diagnosis.understandingMessage || 'You correctly identified that both sides of an equation must remain balanced.');
        setStudentReply('');
      } else if (nextState === 'REFLECT_COMPLETE') {
        setUnderstandingMessage(res.diagnosis.understandingMessage || 'To keep an equation balanced, any operation applied to one side must be applied equally to the other side.');
        setStudentReply('');
      } else if (classification === 'PARTIAL') {
        if (res.diagnosis.nextQuestion) {
          setActiveQuestion(res.diagnosis.nextQuestion);
        }
        setStudentReply('');
      } else {
        // INCORRECT
        if (res.diagnosis.nextQuestion) {
          setActiveQuestion(res.diagnosis.nextQuestion);
        }
        setStudentReply('');
      }
    } else {
      setReflectUIState('REFLECT_QUESTION');
    }
  };

  // Student-friendly diagnostic explanation mapper (Part 6)
  const getFriendlyDiagnosticText = () => {
    if (currentDiag?.isCorrect) {
      return 'Your reasoning is mathematically sound! You kept both sides of the equation balanced at each step.';
    }

    const diagCategory = currentDiag?.diagnosis || latestTurn?.diagnosis || 'procedural_error';

    switch (diagCategory) {
      case 'calculation_slip':
        return 'Your mistake seems to come from the way you handled the numbers.';
      case 'procedural_error':
        return 'You changed one side of the equation without making the same change to the other side.';
      case 'wrong_rule_or_definition':
        return "The rule applied here doesn't preserve the equality in this equation.";
      case 'overgeneralization':
        return 'That pattern works in other problems, but not in this equation structure.';
      case 'missing_prerequisite':
        return "Let's review the fundamental balance rules before moving forward.";
      case 'insufficient_evidence':
        return "We'd like to understand more about your thinking. Tell us how you approached the equation.";
      default:
        return 'You changed one side of the equation without making the same change to the other side.';
    }
  };

  const studentReasoningQuote = session?.studentResponse?.reasoningText || latestTurn?.studentResponse || '';

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '780px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      color: '#0f172a',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* 3-Step Progress Indicator: Solve (done) -> Reflect (active) -> Apply */}
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
        {/* Step 1: Solve (Completed) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            ✓
          </div>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
            Solve
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

        {/* Step 2: Reflect (Active) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: isUnderstandingReady ? '#16a34a' : '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 700
          }}>
            {isUnderstandingReady ? '✓' : '2'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            Reflect
          </span>
        </div>

        <div style={{ height: '1px', flex: 1, margin: '0 16px', backgroundColor: '#e2e8f0' }} />

        {/* Step 3: Apply */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: isUnderstandingReady ? 1 : 0.45 }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: isUnderstandingReady ? '#2563eb' : '#f1f5f9',
            color: isUnderstandingReady ? '#ffffff' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 600
          }}>
            3
          </div>
          <span style={{ fontSize: '14px', fontWeight: isUnderstandingReady ? 600 : 500, color: isUnderstandingReady ? '#0f172a' : '#64748b' }}>
            Apply
          </span>
        </div>
      </div>

      {/* Problem Reference Card */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '14px', color: '#475569' }}>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Problem:</span>{' '}
          {session?.currentQuestion?.prompt || 'Solve for x'}
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '17px',
          fontWeight: 600,
          color: '#0f172a',
          backgroundColor: '#f8fafc',
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          {session?.currentQuestion?.equation || '3x + 8 = 29'}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PART 6: STANDARDIZED COGNITIVE DIAGNOSTIC RESULT (Section 6 & 10) */}
      {/* ============================================================== */}
      <section style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '28px 32px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Header & Result Classification */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '16px'
        }}>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              marginBottom: '4px'
            }}>
              Cognitive Diagnostic Evaluation • {session?.currentQuestion?.subject || 'Mathematics'}
            </div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.015em'
            }}>
              Diagnostic Assessment
            </h2>
          </div>

          <div>
            {currentDiag?.isCorrect ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                <CheckCircle2 size={16} />
                <span>CORRECT</span>
              </span>
            ) : (currentDiag?.confidence && currentDiag.confidence < 0.70) ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                <AlertCircle size={16} />
                <span>PARTIALLY CORRECT</span>
              </span>
            ) : (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                fontSize: '13px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                <XCircle size={16} />
                <span>INCORRECT</span>
              </span>
            )}
          </div>
        </div>

        {/* Section 10: Your Answer vs Expected Answer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Your Answer */}
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Your Answer
            </span>
            <div style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#0f172a',
              fontFamily: (session?.currentQuestion?.subject === 'Programming' || session?.currentQuestion?.equation) ? "'JetBrains Mono', monospace" : 'inherit'
            }}>
              {session?.studentResponse?.submittedAnswer || studentReasoningQuote || 'Response submitted'}
            </div>
          </div>

          {/* Expected Answer */}
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '16px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Expected Answer
            </span>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#15803d',
              fontFamily: (session?.currentQuestion?.subject === 'Programming' || session?.currentQuestion?.equation) ? "'JetBrains Mono', monospace" : 'inherit'
            }}>
              {session?.currentQuestion?.expectedAnswer || 'x'}
            </div>
          </div>
        </div>

        {/* Section 10: Reasoning Analysis */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
            Reasoning Analysis
          </span>
          <p style={{
            fontSize: '15px',
            color: '#1e293b',
            lineHeight: 1.6,
            margin: 0,
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '8px',
            padding: '14px 16px'
          }}>
            {getFriendlyDiagnosticText()}
          </p>
        </div>

        {/* Section 10: Detected Misconception & Evidence */}
        {!currentDiag?.isCorrect && (
          <div style={{
            backgroundColor: '#fffbeb',
            border: '1.5px solid #fde68a',
            borderRadius: '10px',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', display: 'block' }}>
                  Detected Misconception
                </span>
                <strong style={{ fontSize: '16px', color: '#92400e' }}>
                  {currentDiag?.diagnosis || 'Conceptual Reasoning Error'}
                </strong>
              </div>

              {currentDiag?.confidence && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  Diagnosis Confidence: {Math.round(currentDiag.confidence * 100)}%
                </span>
              )}
            </div>

            {/* Why (Evidence from student answer) */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '4px' }}>
                Why (Evidence from reasoning):
              </span>
              <div style={{
                fontSize: '13px',
                color: '#78350f',
                lineHeight: 1.5,
                fontStyle: 'italic',
                backgroundColor: 'rgba(254, 243, 199, 0.6)',
                padding: '10px 14px',
                borderRadius: '6px',
                borderLeft: '3px solid #d97706'
              }}>
                "{currentDiag?.evidence || studentReasoningQuote || 'Identified through pattern mismatch during execution.'}"
              </div>
            </div>

            {/* Recommended Action */}
            {((currentDiag as any)?.recommendedAction) && (
              <div style={{ fontSize: '13px', color: '#854d0e', marginTop: '2px' }}>
                <strong>Recommended Practice:</strong> {(currentDiag as any).recommendedAction}
              </div>
            )}
          </div>
        )}

        {/* SIGNATURE ELEMENT: REASONING TRACE (5-node interactive connected timeline) */}
        <div className="reasoning-trace-container" style={{ margin: '8px 0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BrainCircuit size={19} color="#7C3AED" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
                Cognitive Reasoning Trace
              </span>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', border: '1px solid #DDD6FE', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Diagnostic Reconstruction
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', position: 'relative' }}>
            {/* Node 1: Question Given */}
            <div className="reasoning-trace-node">
              <div className="reasoning-trace-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>1</div>
              <div style={{ flex: 1 }}>
                <div className="reasoning-trace-title">Question Given</div>
                <div className="reasoning-trace-body" style={{ fontFamily: (session?.currentQuestion?.subject === 'Programming' || session?.currentQuestion?.equation) ? "'JetBrains Mono', monospace" : 'inherit' }}>
                  {session?.currentQuestion?.equation || session?.currentQuestion?.prompt || 'Linear equation'}
                </div>
              </div>
            </div>
            <div className="reasoning-trace-connector" />

            {/* Node 2: Student Response */}
            <div className="reasoning-trace-node">
              <div className="reasoning-trace-badge" style={{ backgroundColor: '#F8FAFC', color: '#64748B', borderColor: '#E2E8F0' }}>2</div>
              <div style={{ flex: 1 }}>
                <div className="reasoning-trace-title">Student Reasoning Input</div>
                <div className="reasoning-trace-body">
                  "{studentReasoningQuote || session?.studentResponse?.submittedAnswer || 'Response entered'}"
                </div>
              </div>
            </div>
            <div className="reasoning-trace-connector" />

            {/* Node 3: Detected Reasoning Pattern */}
            <div className="reasoning-trace-node">
              <div className="reasoning-trace-badge" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', borderColor: '#DDD6FE' }}>3</div>
              <div style={{ flex: 1 }}>
                <div className="reasoning-trace-title">Detected Reasoning Pattern</div>
                <div className="reasoning-trace-body">
                  {currentDiag?.evidence || 'Operational asymmetry detected during variable isolation step.'}
                </div>
                <div className="reasoning-trace-tag" style={{ backgroundColor: '#F5F3FF', color: '#7C3AED', marginTop: '4px' }}>
                  Skill: {currentDiag?.affectedSkill || 'Properties of Equality'}
                </div>
              </div>
            </div>
            <div className="reasoning-trace-connector" />

            {/* Node 4: Identified Misconception */}
            <div className="reasoning-trace-node">
              <div className="reasoning-trace-badge" style={{ backgroundColor: currentDiag?.isCorrect ? '#ECFDF5' : '#FFFBEB', color: currentDiag?.isCorrect ? '#16A34A' : '#D97706', borderColor: currentDiag?.isCorrect ? '#BBF7D0' : '#FDE68A' }}>
                {currentDiag?.isCorrect ? '✓' : '4'}
              </div>
              <div style={{ flex: 1 }}>
                <div className="reasoning-trace-title" style={{ color: currentDiag?.isCorrect ? '#15803D' : '#B45309' }}>
                  {currentDiag?.isCorrect ? 'Sound Mathematical Reasoning' : 'Identified Cognitive Misconception'}
                </div>
                <div className="reasoning-trace-body" style={{ fontWeight: 600, color: currentDiag?.isCorrect ? '#166534' : '#92400E' }}>
                  {currentDiag?.isCorrect ? 'Both sides kept balanced throughout isolation' : (currentDiag?.diagnosis || 'Unilateral operation error')}
                </div>
              </div>
            </div>
            <div className="reasoning-trace-connector" />

            {/* Node 5: Recommended Socratic Intervention */}
            <div className="reasoning-trace-node">
              <div className="reasoning-trace-badge" style={{ backgroundColor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' }}>5</div>
              <div style={{ flex: 1 }}>
                <div className="reasoning-trace-title" style={{ color: '#1E40AF' }}>Recommended Socratic Intervention</div>
                <div className="reasoning-trace-body" style={{ color: '#1D4ED8', fontStyle: 'italic' }}>
                  "{activeQuestion || 'If you subtract 8 from the left side, what must you do to the right side to keep the balance scale equal?'}"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 10 Action Buttons: [ Try Similar Question ] [ Continue ] */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            onClick={async () => {
              if (!currentStudent || !session?.currentQuestion) return;
              const q = session.currentQuestion;
              await startSession(currentStudent.id, {
                subject: q.subject || 'Mathematics',
                category: q.category,
                topic: q.topic,
                difficulty: q.difficulty
              });
              onNavigate('learning-session');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>Try Similar Question</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (isUnderstandingReady) {
                onNavigate('progress');
              } else {
                const elem = document.getElementById('socratic-reflection-card');
                if (elem) {
                  elem.scrollIntoView({ behavior: 'smooth' });
                }
              }
            }}
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
            <span>{isUnderstandingReady ? 'View Progress' : 'Continue'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <div id="socratic-reflection-card" />

      {/* ============================================================== */}
      {/* PART 7: SOCRATIC REFLECTION FOCAL POINT                        */}
      {/* States: REFLECT_CORRECT | REFLECT_COMPLETE | REFLECT_QUESTION  */}
      {/* ============================================================== */}

      {reflectUIState === 'REFLECT_CORRECT' ? (
        /* Requirement 6 & 14: Understanding confirmed -> stop questions, input disappears */
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
              flexShrink: 0
            }}>
              <CheckCircle2 size={24} />
            </div>

            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>
                ✓ Understanding confirmed
              </div>
              <p style={{ fontSize: '15px', color: '#1e293b', margin: 0, lineHeight: 1.5 }}>
                {understandingMessage || 'You correctly identified that both sides of an equation must remain balanced.'}
              </p>
            </div>
          </div>

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
              onClick={() => onNavigate('learning-session')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0'
              }}
            >
              Review Original Problem
            </button>

            <button
              type="button"
              onClick={() => onNavigate('transfer-recovery')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              <span>Continue to Apply</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : reflectUIState === 'REFLECT_COMPLETE' ? (
        /* Requirement 9: Max attempts completed -> core concept summary, input disappears */
        <section style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>
              Key Concept
            </div>
            <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Preserving Equation Balance
            </h3>
            <p style={{ fontSize: '15px', color: '#334155', margin: 0, lineHeight: 1.6 }}>
              {understandingMessage || 'To keep an equation balanced, any operation applied to one side must be applied equally to the other side.'}
            </p>
          </div>

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
              onClick={() => onNavigate('learning-session')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0'
              }}
            >
              Review Original Problem
            </button>

            <button
              type="button"
              onClick={() => onNavigate('transfer-recovery')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                backgroundColor: '#2563eb',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
            >
              <span>Continue to Apply</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        /* Requirement 2, 7, 8, 13: Socratic Dialogue Focal Card */
        <section style={{
          backgroundColor: '#ffffff',
          border: '2px solid #bfdbfe',
          borderRadius: '14px',
          padding: '32px',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Header & Subtitle */}
          <div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f172a',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}>
              Let's think about it
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              margin: 0
            }}>
              I'll ask you a question to help you find the answer yourself.
            </p>
          </div>

          {/* Contextual Guidance Badge for Partial / Incorrect state */}
          {reflectUIState === 'REFLECT_PARTIAL' && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#92400e'
            }}>
              You're on the right track — let's look closer at one detail.
            </div>
          )}

          {reflectUIState === 'REFLECT_INCORRECT' && (
            <div style={{
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569'
            }}>
              Let's look at this from a simpler angle.
            </div>
          )}

          {/* ONE Targeted Question Display at a time */}
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '10px',
            padding: '20px 24px'
          }}>
            <p style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#1e3a8a',
              lineHeight: 1.5,
              margin: 0
            }}>
              "{activeQuestion}"
            </p>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmitFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Your Answer
              </label>
              <textarea
                className="form-textarea"
                placeholder="Your answer..."
                value={studentReply}
                onChange={(e) => setStudentReply(e.target.value)}
                rows={4}
                required
                disabled={reflectUIState === 'REFLECT_EVALUATING' || isSubmitting}
                autoFocus
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <button 
                type="button" 
                onClick={() => onNavigate('learning-session')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '6px 0'
                }}
              >
                Review Original Problem
              </button>

              <button
                type="submit"
                disabled={!studentReply.trim() || isSubmitting || reflectUIState === 'REFLECT_EVALUATING'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: (isSubmitting || reflectUIState === 'REFLECT_EVALUATING') ? '#93c5fd' : '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: (isSubmitting || reflectUIState === 'REFLECT_EVALUATING' || !studentReply.trim()) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting && reflectUIState !== 'REFLECT_EVALUATING' && studentReply.trim()) e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting && reflectUIState !== 'REFLECT_EVALUATING' && studentReply.trim()) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                {reflectUIState === 'REFLECT_EVALUATING' || isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Evaluating your reasoning...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Past Turns Drawer (Clean and Collapsible) */}
          {turns.length > 1 && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <MessageSquare size={14} />
                <span>{showHistory ? 'Hide earlier conversation' : `View earlier conversation (${turns.length - 1})`}</span>
                {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showHistory && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                  {turns.slice(0, turns.length - 1).map((turn, i) => (
                    <div 
                      key={turn.id || i}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        fontSize: '13px',
                        lineHeight: 1.5
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Attempt {turn.attempt}:
                      </div>
                      <div style={{ color: '#475569', fontStyle: 'italic', marginBottom: '8px' }}>
                        "{turn.studentResponse}"
                      </div>
                      <div style={{ fontWeight: 600, color: '#2563eb', marginBottom: '2px' }}>
                        Question asked:
                      </div>
                      <div style={{ color: '#0f172a' }}>
                        {turn.interventionText}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
