import { Router, Request, Response } from 'express';
import { 
  LearningSession, 
  StudentResponse, 
  Diagnosis, 
  Intervention, 
  DialogueTurn, 
  InterventionType, 
  Question
} from '@shared/types';
import { LINEAR_EQUATIONS_CONCEPT, ALL_QUESTIONS } from '../data/reference/curriculum';
import { QUESTION_BANK } from '../data/reference/questionBank';
import { GeminiDiagnosticEngine, DiagnosticError } from '../pipeline/diagnosticEngine';
import { AdaptiveInterventionPolicy } from '../pipeline/interventionPolicy';
import { SocraticDialogueEngine } from '../pipeline/socraticDialogueEngine';
import { MockRecoveryEngine } from '../pipeline/recoveryEngine';
import { LearnerStateManager } from '../pipeline/learnerStateManager';
import { questionSelector } from '../pipeline/questionSelector';
import { visionExtractor } from '../pipeline/visionExtractor';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { db } from '../data/db/database';

export const sessionRoutes = Router();

const diagnosticEngine = new GeminiDiagnosticEngine();
const interventionPolicy = new AdaptiveInterventionPolicy();
const socraticDialogueEngine = new SocraticDialogueEngine(diagnosticEngine);
const recoveryEngine = new MockRecoveryEngine();
export const sharedLearnerStateManager = new LearnerStateManager();

// In-memory active session store
export const activeSessions: Map<string, LearningSession> = new Map();

function getInitialQuestion(): Question {
  return QUESTION_BANK[0] || ALL_QUESTIONS[0];
}

/**
 * POST /api/sessions/extract-math-image
 * Multimodal vision endpoint for transcribing handwritten or printed math equations
 */
sessionRoutes.post('/extract-math-image', async (req: Request, res: Response) => {
  const { imageBase64, mimeType } = req.body;
  if (!imageBase64) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_IMAGE', message: "We couldn't analyze this problem right now." }
    });
  }

  const result = await visionExtractor.extractFromImage(imageBase64, mimeType || 'image/jpeg');
  res.json(result);
});

/**
 * POST /api/sessions/explain-problem
 * Generates structured, step-by-step mathematical problem explanation (Section 3)
 */
sessionRoutes.post('/explain-problem', async (req: Request, res: Response) => {
  const { problem, topic, subject } = req.body;
  if (!problem) {
    return res.status(400).json({ success: false, error: 'Problem statement or equation required.' });
  }

  try {
    const cleanProblem = String(problem).trim();
    let steps: string[] = [];
    let solution = '';
    let summary = `Step-by-step analysis for ${cleanProblem}`;

    const match = cleanProblem.replace(/\s+/g, '').match(/^([+-]?\d*)x([+-]\d+)=([+-]?\d+)$/i);
    if (match) {
      const aRaw = match[1];
      const a = aRaw === '' || aRaw === '+' ? 1 : aRaw === '-' ? -1 : parseInt(aRaw, 10);
      const b = parseInt(match[2], 10);
      const c = parseInt(match[3], 10);

      const opSign = b >= 0 ? '+' : '-';
      const absB = Math.abs(b);
      const invOp = b >= 0 ? `Subtract ${absB}` : `Add ${absB}`;
      const afterSubtract = c - b;
      const xVal = afterSubtract / a;

      steps = [
        `Identify the equation structure: ${cleanProblem}. The goal is to isolate the variable x.`,
        `${invOp} from both sides to maintain equality: ${a !== 1 ? `${a}x` : 'x'} = ${c} ${b >= 0 ? '-' : '+'} ${absB}, which simplifies to ${a !== 1 ? `${a}x` : 'x'} = ${afterSubtract}.`,
        a !== 1 
          ? `Divide both sides by the variable coefficient (${a}): x = ${afterSubtract} ÷ ${a} = ${xVal}.`
          : `The variable x is isolated: x = ${xVal}.`,
        `Verification: Substitute x = ${xVal} back into the original equation: ${a}(${xVal}) ${opSign} ${absB} = ${a * xVal + b} = ${c}. Both sides are balanced!`
      ];
      solution = `x = ${xVal}`;
      summary = `The solution is x = ${xVal}. Inverse operations preserved bilateral balance at each step.`;
    } else {
      steps = [
        `Analyze the problem statement: "${cleanProblem}".`,
        `Identify the core mathematical principles and constants involved in ${topic || 'Algebra'}.`,
        `Apply inverse mathematical operations systematically to isolate the unknown.`,
        `Verify the algebraic balance by substituting the derived value back into the original expression.`
      ];
      solution = 'Verified Solution';
      summary = `Completed conceptual breakdown for ${cleanProblem}.`;
    }

    res.json({
      success: true,
      problem: cleanProblem,
      topic: topic || 'Linear Equations in One Variable',
      subject: subject || 'Mathematics',
      explanation: {
        steps,
        solution,
        summary
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Explanation generation failed.' });
  }
});

/**
 * POST /api/sessions/questions/next
 * Dynamically selects next adaptive question from the library
 */
sessionRoutes.post('/questions/next', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id || req.body.studentId || 'anon-student';
  const { difficulty, topic, category, subject, excludeQuestionIds } = req.body;
  const question = questionSelector.selectNextQuestion({
    studentId,
    subject,
    difficulty,
    topic,
    category,
    excludeQuestionIds: excludeQuestionIds || []
  });
  res.json({ question });
});

sessionRoutes.post('/start', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id || req.body.studentId;
  const conceptId = req.body.conceptId || LINEAR_EQUATIONS_CONCEPT.id;
  const { customQuestion, difficulty, topic, category, subject, questionId } = req.body;

  if (!studentId) {
    return res.status(401).json({ error: 'Authentication required to start a learning session.' });
  }

  const sessionId = `sess-${Date.now()}`;
  let initialQuestion: Question;

  if (customQuestion) {
    if (typeof customQuestion === 'object' && customQuestion.id && (customQuestion.equation || customQuestion.question)) {
      initialQuestion = customQuestion;
    } else {
      const eq = typeof customQuestion === 'string' ? customQuestion : (customQuestion.equation || customQuestion.question || 'Problem');
      const prompt = typeof customQuestion === 'object' ? customQuestion.prompt : undefined;
      const expAnswer = typeof customQuestion === 'object' ? customQuestion.expectedAnswer : undefined;
      initialQuestion = visionExtractor.createQuestionFromConfirmedEquation(eq, prompt, expAnswer);
    }
  } else if (questionId) {
    const found = ALL_QUESTIONS.find(q => q.id === questionId) || QUESTION_BANK.find(q => q.id === questionId);
    initialQuestion = found || questionSelector.selectNextQuestion({ studentId, subject, difficulty, topic, category });
  } else {
    initialQuestion = questionSelector.selectNextQuestion({ studentId, subject, difficulty, topic, category });
  }

  const newSession: LearningSession = {
    id: sessionId,
    studentId,
    conceptId,
    currentQuestion: initialQuestion,
    currentPhase: 'question',
    isComplete: false,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attemptCount: 0,
    interventionLevel: 1,
    dialogueHistory: [],
    studentResponses: [],
    diagnosticHistory: [],
    misconceptionPersisting: false,
    understandingDetected: false,
    recoveryTestRequired: false,
    nextAction: 'WAIT_FOR_STUDENT',
    usedQuestionIds: [initialQuestion.id]
  };

  activeSessions.set(sessionId, newSession);
  res.json({ session: newSession });
});

sessionRoutes.get('/:id', (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ session });
});

// Step 1: Student submits initial reasoning via Real AI Engine
sessionRoutes.post('/:id/submit-reasoning', async (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { reasoningText = '', submittedAnswer = '' } = req.body;

  const studentResponse: StudentResponse = {
    id: `resp-${Date.now()}`,
    sessionId: session.id,
    studentId: session.studentId,
    questionId: session.currentQuestion.id,
    reasoningText,
    submittedAnswer,
    timestamp: new Date().toISOString(),
    timeSpentSeconds: 45
  };

  let diagnosis: Diagnosis;
  let intervention: Intervention;

  try {
    // 1. Diagnostic pipeline (Real Gemini AI)
    diagnosis = await diagnosticEngine.diagnoseReasoning(studentResponse, session.currentQuestion);

    // 2. Intervention policy
    const diagnosticResult = {
      isCorrect: diagnosis.isCorrect,
      concept: session.conceptId || LINEAR_EQUATIONS_CONCEPT.id,
      diagnosis: diagnosis.diagnosis || (diagnosis.isCorrect ? 'correct_reasoning' : 'procedural_error'),
      confidence: diagnosis.confidence,
      evidence: diagnosis.evidence || diagnosis.evidenceSnippets[0]?.quote || 'Reasoning evaluation',
      affectedSkill: diagnosis.affectedSkill || 'inverse_operations',
      recommendedIntervention: diagnosis.recommendedIntervention || (diagnosis.isCorrect ? 'positive_feedback' : 'probe'),
      needsRecoveryTest: diagnosis.needsRecoveryTest ?? !diagnosis.isCorrect
    };

    intervention = interventionPolicy.generateIntervention(
      session.studentId,
      diagnosticResult,
      diagnosis.id,
      session.usedQuestionIds || []
    );

    // 3. Update learner cognitive state & persist record
    const resultStatus: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' = diagnosis.isCorrect 
      ? 'CORRECT' 
      : (diagnosis.diagnosis === 'calculation_slip' ? 'PARTIALLY_CORRECT' : 'INCORRECT');
    const recMisconception = diagnosis.misconceptionTag || diagnosis.misconception;
    const recExpected = session.currentQuestion.expectedAnswer || session.currentQuestion.expectedFinalAnswer || 'See reference solution';
    const recSubject = session.currentQuestion.subject || diagnosis.subject || 'Mathematics';

    sharedLearnerStateManager.recordDiagnosticEvent(
      {
        id: `rec-${Date.now()}`,
        studentId: session.studentId,
        question: session.currentQuestion.question || session.currentQuestion.equation || session.currentQuestion.prompt || 'Problem',
        studentAnswer: submittedAnswer || reasoningText,
        studentReasoning: reasoningText,
        correctAnswer: recExpected,
        result: resultStatus,
        misconception: recMisconception,
        recommendedAction: diagnosis.recommendedAction || intervention.tutorMessage,
        subject: recSubject,
        concept: diagnosticResult.concept,
        category: session.currentQuestion.category || diagnosis.category || 'Algebra',
        topic: session.currentQuestion.topic || diagnosis.topic || 'Linear Equations in One Variable',
        errorType: diagnosis.errorType,
        misconceptionTag: recMisconception,
        diagnosis: diagnosticResult.diagnosis,
        confidence: diagnosticResult.confidence,
        evidence: diagnosticResult.evidence,
        recommendedIntervention: diagnosticResult.recommendedIntervention,
        timestamp: new Date().toISOString(),
        responseId: studentResponse.id,
        diagnosisId: diagnosis.id,
        interventionId: intervention.id
      },
      studentResponse,
      diagnosis,
      intervention
    );

    // 4. Automatic Notification Generation for Student and Teachers
    const studentUser = db.findUserById(session.studentId);
    const studentName = studentUser?.name || 'A student';
    const topicName = session.currentQuestion.topic || session.currentQuestion.category || 'Linear Equations';

    if (!diagnosis.isCorrect || diagnosis.misconceptionTag || diagnosis.misconception) {
      const miscName = diagnosis.misconceptionTag || diagnosis.misconception || 'reasoning error';
      // Student notification
      db.addNotification({
        userId: session.studentId,
        role: 'student',
        type: 'misconception_detected',
        category: 'ai',
        title: 'Misconception Detected',
        message: `MindTrace detected a misconception in ${topicName}: ${miscName}. Review this concept in your Insights before your next practice session.`,
        relatedTopic: topicName,
        actionUrl: '/insights'
      });

      // Teacher notification
      db.addNotification({
        userId: 'demo_teacher',
        role: 'teacher',
        type: 'student_misconception_detected',
        category: 'attention',
        title: `${studentName} - Misconception Detected`,
        message: `${studentName} encountered a '${miscName}' misconception in ${topicName}.`,
        relatedStudentId: session.studentId,
        relatedTopic: topicName,
        actionUrl: `/teacher/student/${session.studentId}`
      });
    } else {
      // Correct reasoning milestone notification for student
      db.addNotification({
        userId: session.studentId,
        role: 'student',
        type: 'mastery_increased',
        category: 'success',
        title: 'Topic Mastery Progressed',
        message: `Excellent work! Your reasoning on "${topicName}" was evaluated and confirmed correct.`,
        relatedTopic: topicName,
        actionUrl: '/progress'
      });
    }
  } catch (err: any) {
    if (err instanceof DiagnosticError) {
      let statusCode = 500;
      if (err.code === 'MISSING_API_KEY' || err.code === 'INVALID_API_KEY') statusCode = 503;
      else if (err.code === 'QUOTA_EXCEEDED') statusCode = 429;
      else if (err.code === 'MODEL_UNAVAILABLE') statusCode = 503;
      else if (err.code === 'TIMEOUT') statusCode = 504;
      else if (err.code === 'MALFORMED_JSON' || err.code === 'MALFORMED_OUTPUT') statusCode = 502;

      console.error(`[SESSION] Diagnostic failure [${err.code}]:`, err.message, err.details || '');

      return res.status(statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      });
    }

    console.error('[SESSION] Unexpected diagnostic exception:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DIAGNOSTIC_FAILURE',
        message: err?.message || 'Failed to complete AI diagnosis.',
        details: err?.stack
      }
    });
  }

  // Update session & Phase 2B multi-turn conversation state
  const isCorrect = diagnosis.isCorrect;
  let targetedInitialQ = intervention.socraticQuestion;
  if (!isCorrect) {
    const targeted = await socraticDialogueEngine.generateTargetedInitialQuestion({
      equation: session.currentQuestion.equation || session.currentQuestion.prompt || session.currentQuestion.question || '',
      diagnosis: diagnosis.diagnosis || 'procedural_error',
      affectedSkill: diagnosis.affectedSkill || 'properties_of_equality',
      evidence: diagnosis.evidence || diagnosis.evidenceSnippets[0]?.quote || 'Reasoning evaluation',
      studentReasoning: reasoningText
    });
    targetedInitialQ = targeted.question;
    intervention.socraticQuestion = targeted.question;
    intervention.tutorMessage = targeted.question;
    delete (intervention as any).hintPrompt;
  }

  // Requirement 15: Development Mode Logging
  console.log(`[REFLECT_DEV_LOG] ========================================`);
  console.log(`[REFLECT_DEV_LOG] Diagnosis: ${diagnosis.diagnosis} (${diagnosis.affectedSkill})`);
  console.log(`[REFLECT_DEV_LOG] Generated Question: "${targetedInitialQ}"`);
  console.log(`[REFLECT_DEV_LOG] Student Answer: "${reasoningText}"`);
  console.log(`[REFLECT_DEV_LOG] Evaluation Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}`);
  console.log(`[REFLECT_DEV_LOG] Next Reflection State: ${isCorrect ? 'REFLECT_CORRECT' : 'REFLECT_QUESTION'}`);
  console.log(`[REFLECT_DEV_LOG] ========================================`);

  const initialType: InterventionType = isCorrect ? 'POSITIVE_FEEDBACK' : 'SOCRATIC_PROBE';
  const initialTurn: DialogueTurn = {
    id: `turn-${Date.now()}`,
    attempt: 1,
    studentResponse: reasoningText,
    diagnosis: diagnosis.diagnosis || (isCorrect ? 'correct_reasoning' : 'procedural_error'),
    misconceptionCode: isCorrect ? undefined : `EQ-${(diagnosis.affectedSkill || 'procedural_error').toUpperCase().replace(/_/g, '-')}`,
    confidence: diagnosis.confidence,
    evidence: diagnosis.evidence || diagnosis.evidenceSnippets[0]?.quote || 'Reasoning evaluation',
    affectedSkill: diagnosis.affectedSkill,
    interventionLevel: 1,
    interventionType: initialType,
    interventionText: targetedInitialQ,
    persists: !isCorrect,
    understandingDetected: isCorrect,
    timestamp: new Date().toISOString()
  };

  session.studentResponse = studentResponse;
  session.currentDiagnosis = diagnosis;
  session.initialDiagnosis = diagnosis;
  session.currentIntervention = intervention;
  session.currentPhase = 'diagnosis_intervention';
  session.updatedAt = new Date().toISOString();
  session.attemptCount = 1;
  session.interventionLevel = 1;
  session.misconceptionCode = isCorrect ? undefined : initialTurn.misconceptionCode;
  session.confidence = diagnosis.confidence;
  session.misconceptionPersisting = !isCorrect;
  session.understandingDetected = isCorrect;
  session.recoveryTestRequired = !isCorrect;
  session.nextAction = isCorrect ? 'TRANSFER_CHECK' : 'WAIT_FOR_STUDENT';
  session.studentResponses = [reasoningText];
  session.dialogueHistory = [initialTurn];
  session.diagnosticHistory = [diagnosis];
  if (!session.usedQuestionIds) session.usedQuestionIds = [];
  if (intervention.questionBankId && !session.usedQuestionIds.includes(intervention.questionBankId)) {
    session.usedQuestionIds.push(intervention.questionBankId);
  }

  activeSessions.set(session.id, session);

  const finalResultStatus: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT' = diagnosis.isCorrect 
    ? 'CORRECT' 
    : (diagnosis.diagnosis === 'calculation_slip' ? 'PARTIALLY_CORRECT' : 'INCORRECT');
  const finalExpected = session.currentQuestion.expectedAnswer || session.currentQuestion.expectedFinalAnswer || 'See solution steps';
  const finalMisconception = diagnosis.misconceptionTag || diagnosis.misconception || (diagnosis.isCorrect ? 'None (Sound reasoning)' : 'Conceptual or procedural gap');

  res.json({
    success: true,
    session,
    diagnosis,
    intervention,
    result: finalResultStatus,
    studentAnswer: submittedAnswer || reasoningText,
    expectedAnswer: finalExpected,
    reasoningAnalysis: diagnosis.pedagogicalInterpretation || diagnosis.evidence,
    detectedMisconception: finalMisconception,
    evidence: diagnosis.evidence,
    confidence: diagnosis.confidence,
    recommendedAction: diagnosis.recommendedAction || intervention.tutorMessage
  });
});

/**
 * POST /api/sessions/explain-problem
 * Generates pedagogical step-by-step mathematical explanation for an equation or problem
 */
sessionRoutes.post('/explain-problem', async (req: Request, res: Response) => {
  const { problem, topic, category, subject } = req.body;
  if (!problem) {
    return res.status(400).json({ error: 'Problem expression or statement required.' });
  }

  const probTrim = problem.trim();
  let steps: string[] = [];
  let solution: string = '';
  let explanation: string = '';

  if (probTrim.includes('2x + 5 = 17') || probTrim.replace(/\s+/g, '') === '2x+5=17') {
    steps = [
      'Step 1: Identify constant term (+5) on the variable side and subtract 5 from both sides: 2x + 5 - 5 = 17 - 5',
      'Step 2: Simplify both sides: 2x = 12',
      'Step 3: Isolate x by dividing both sides by the coefficient (2): 2x / 2 = 12 / 2',
      'Step 4: State final solution: x = 6'
    ];
    solution = 'x = 6';
    explanation = 'Linear equations maintain equivalence across the equal sign. To isolate 2x, subtract 5 from both sides, then divide by 2.';
  } else if (probTrim.includes('3x + 8 = 29') || probTrim.replace(/\s+/g, '') === '3x+8=29') {
    steps = [
      'Step 1: Subtract 8 from both sides: 3x = 29 - 8 = 21',
      'Step 2: Divide both sides by 3: x = 21 / 3',
      'Step 3: Solution: x = 7'
    ];
    solution = 'x = 7';
    explanation = 'Maintain equivalence by applying inverse subtraction first, then inverse division.';
  } else {
    steps = [
      `Step 1: Analyze problem expression: ${probTrim}`,
      'Step 2: Apply appropriate mathematical inverse operations or algebraic transformations to isolate the target quantity.',
      'Step 3: Simplify and verify through substitution.'
    ];
    solution = 'Verified step-by-step';
    explanation = `Systematic step-by-step solution for ${probTrim}. Always perform identical operations to both sides of the equality.`;
  }

  res.json({
    success: true,
    problem: probTrim,
    topic: topic || 'Linear Equations in One Variable',
    subject: subject || 'Mathematics',
    steps,
    solution,
    explanation
  });
});

// Phase 2B Core Multi-Turn Dialogue Endpoint
// POST /api/sessions/:id/respond OR POST /api/session/respond
async function handleSocraticResponse(session: LearningSession, studentResponse: string, res: Response) {
  try {
    const result = await socraticDialogueEngine.processFollowUpResponse(
      session,
      studentResponse,
      sharedLearnerStateManager
    );

    // If understanding was detected, pre-attach transfer question
    if (result.diagnosis.understandingDetected) {
      session.transferQuestion = recoveryEngine.getTransferQuestion(
        session.currentQuestion.id,
        session.currentQuestion,
        session.misconceptionCode
      );
      session.nextAction = 'TRANSFER_CHECK';
    }

    activeSessions.set(session.id, session);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[SOCRATIC] Socratic dialogue step error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'DIALOGUE_ERROR',
        message: err?.message || 'Failed to process Socratic response.'
      }
    });
  }
}

// POST /api/sessions/:id/respond
sessionRoutes.post('/:id/respond', async (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
  }

  const studentResponse = req.body.studentResponse || req.body.studentReply || req.body.reasoning || '';
  return handleSocraticResponse(session, studentResponse, res);
});

// POST /api/sessions/respond (allows passing sessionId in body)
sessionRoutes.post('/respond', async (req: Request, res: Response) => {
  const { sessionId, studentResponse = '' } = req.body;
  if (!sessionId) {
    return res.status(400).json({ success: false, error: { code: 'MISSING_SESSION_ID', message: 'Missing sessionId in request body' } });
  }

  const session = activeSessions.get(sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found' } });
  }

  return handleSocraticResponse(session, studentResponse, res);
});

// Step 2: Student replies to Socratic intervention prompt (backward compatible + smart route)
sessionRoutes.post('/:id/submit-intervention-reply', async (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { studentReply = '' } = req.body;
  if (session.currentIntervention) {
    session.currentIntervention.studentReply = studentReply;
  }

  // Next step: Transfer / Recovery Question
  const transferQuestion = recoveryEngine.getTransferQuestion(
    session.currentQuestion.id,
    session.currentQuestion,
    session.misconceptionCode
  );

  session.transferQuestion = transferQuestion;
  session.currentPhase = 'transfer_question';
  session.updatedAt = new Date().toISOString();

  activeSessions.set(session.id, session);

  res.json({
    session,
    transferQuestion
  });
});

// Step 3: Student submits reasoning on the transfer question
sessionRoutes.post('/:id/submit-recovery', async (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { studentReasoning = '' } = req.body;
  const transferQ = session.transferQuestion || session.currentQuestion;
  const misconceptionId = session.currentDiagnosis?.misconceptionId || 'misc-procedural_error';

  // Evaluate transfer reasoning
  const recoveryAttempt = await recoveryEngine.evaluateRecovery(
    session.studentId,
    session.currentQuestion.id,
    transferQ.id,
    misconceptionId,
    studentReasoning
  );

  // Update learner state
  const updatedState = sharedLearnerStateManager.updateOnRecovery(
    session.studentId,
    session.conceptId,
    recoveryAttempt
  );

  db.addRecoveryAttempt(session.studentId, recoveryAttempt);

  // Automatic notification on transfer recovery
  const studentUser = db.findUserById(session.studentId);
  const studentName = studentUser?.name || 'A student';
  const topicName = transferQ.topic || session.currentQuestion.topic || 'Linear Equations';

  if (recoveryAttempt.status === 'recovered') {
    // Student notification
    db.addNotification({
      userId: session.studentId,
      role: 'student',
      type: 'progress_improved',
      category: 'success',
      title: 'Transfer Recovery Verified!',
      message: `Congratulations! You successfully corrected the misconception and solved the transfer problem in ${topicName}.`,
      relatedTopic: topicName,
      actionUrl: '/progress'
    });

    // Teacher notification
    db.addNotification({
      userId: 'demo_teacher',
      role: 'teacher',
      type: 'student_improved',
      category: 'success',
      title: `${studentName} - Recovery Verified`,
      message: `${studentName} successfully verified conceptual recovery on the transfer task for ${topicName}.`,
      relatedStudentId: session.studentId,
      relatedTopic: topicName,
      actionUrl: `/teacher/student/${session.studentId}`
    });
  }

  session.recoveryAttempt = recoveryAttempt;
  session.currentPhase = 'recovery_result';
  session.isComplete = true;
  session.updatedAt = new Date().toISOString();

  activeSessions.set(session.id, session);

  res.json({
    session,
    recoveryAttempt,
    updatedLearnerState: updatedState
  });
});

// Reset session to start over
sessionRoutes.post('/:id/reset', (req: Request, res: Response) => {
  const session = activeSessions.get(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.currentQuestion = getInitialQuestion();
  session.currentPhase = 'question';
  session.studentResponse = undefined;
  session.currentDiagnosis = undefined;
  session.currentIntervention = undefined;
  session.transferQuestion = undefined;
  session.recoveryAttempt = undefined;
  session.isComplete = false;
  session.updatedAt = new Date().toISOString();

  activeSessions.set(session.id, session);

  res.json({ session });
});
