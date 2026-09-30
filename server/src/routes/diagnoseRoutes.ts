import { Router, Request, Response } from 'express';
import { 
  DiagnoseRequest, 
  DiagnoseResponse, 
  StudentResponse, 
  Diagnosis 
} from '@shared/types';
import { GeminiDiagnosticEngine, DiagnosticError } from '../pipeline/diagnosticEngine';
import { AdaptiveInterventionPolicy } from '../pipeline/interventionPolicy';
import { sharedLearnerStateManager } from './sessionRoutes';

export const diagnoseRoutes = Router();

const diagnosticEngine = new GeminiDiagnosticEngine();
const interventionPolicy = new AdaptiveInterventionPolicy();

/**
 * POST /api/diagnose
 * 
 * Core Phase 2A AI Diagnostic Endpoint:
 * - Analyzes student reasoning using Gemini AI Diagnostic Pipeline
 * - Enforces 8-category taxonomy
 * - Generates adaptive pedagogical intervention (separate concern)
 * - Persists StudentResponse, Diagnosis, Intervention, and DiagnosticRecord
 */
diagnoseRoutes.post('/', async (req: Request, res: Response) => {
  const body: Partial<DiagnoseRequest> = req.body;

  // Validate required fields
  if (!body.studentId || typeof body.studentId !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: "Missing or invalid 'studentId' in request body."
      }
    });
  }

  if (!body.question || typeof body.question !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: "Missing or invalid 'question' in request body."
      }
    });
  }

  const studentReasoning = typeof body.studentReasoning === 'string' ? body.studentReasoning : '';
  const studentAnswer = typeof body.studentAnswer === 'string' ? body.studentAnswer : '';
  const expectedAnswer = typeof body.expectedAnswer === 'string' ? body.expectedAnswer : '';
  const concept = body.concept || 'linear_equations';

  try {
    // 1. Run Real AI Diagnostic Analysis
    const diagnosticResult = await diagnosticEngine.diagnose({
      studentId: body.studentId,
      question: body.question,
      expectedAnswer,
      studentAnswer,
      studentReasoning,
      concept
    });

    const timestamp = new Date().toISOString();
    const diagnosisId = `diag-${Date.now()}`;
    const responseId = `resp-${Date.now()}`;

    // 2. Run Adaptive Intervention Policy
    const intervention = interventionPolicy.generateIntervention(
      body.studentId,
      diagnosticResult,
      diagnosisId
    );

    // 3. Construct domain models for persistence
    const isMisconception = !diagnosticResult.isCorrect && diagnosticResult.diagnosis !== 'correct_reasoning';

    const persistedResponse: StudentResponse = {
      id: responseId,
      sessionId: `sess-${body.studentId}`,
      studentId: body.studentId,
      questionId: body.question,
      reasoningText: studentReasoning,
      submittedAnswer: studentAnswer,
      timestamp,
      timeSpentSeconds: 30
    };

    const persistedDiagnosis: Diagnosis = {
      id: diagnosisId,
      responseId,
      studentId: body.studentId,
      questionId: body.question,
      isCorrect: diagnosticResult.isCorrect,
      concept: diagnosticResult.concept,
      diagnosis: diagnosticResult.diagnosis,
      misconceptionId: isMisconception ? `misc-${diagnosticResult.diagnosis}` : undefined,
      misconceptionName: diagnosticResult.affectedSkill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      misconceptionCategory: diagnosticResult.diagnosis,
      confidence: diagnosticResult.confidence,
      evidence: diagnosticResult.evidence,
      affectedSkill: diagnosticResult.affectedSkill,
      recommendedIntervention: diagnosticResult.recommendedIntervention,
      needsRecoveryTest: diagnosticResult.needsRecoveryTest,
      detectedErrors: isMisconception ? [
        {
          step: 1,
          snippet: diagnosticResult.evidence,
          explanation: `Student exhibited ${diagnosticResult.diagnosis} in ${diagnosticResult.affectedSkill}.`,
          errorType: diagnosticResult.diagnosis
        }
      ] : [],
      evidenceSnippets: [
        {
          id: `ev-${Date.now()}`,
          quote: diagnosticResult.evidence,
          highlightCategory: isMisconception ? 'critical' : 'neutral',
          pedagogicalNote: `Diagnostic ground: ${diagnosticResult.affectedSkill}`
        }
      ],
      timestamp,
      status: 'ai_evaluated'
    };

    // 4. Persist in existing LearnerStateManager (NO chain of thought stored)
    sharedLearnerStateManager.recordDiagnosticEvent(
      {
        id: `rec-${Date.now()}`,
        studentId: body.studentId,
        question: body.question,
        studentAnswer,
        studentReasoning,
        concept: diagnosticResult.concept,
        diagnosis: diagnosticResult.diagnosis,
        confidence: diagnosticResult.confidence,
        evidence: diagnosticResult.evidence,
        recommendedIntervention: diagnosticResult.recommendedIntervention,
        timestamp,
        responseId,
        diagnosisId,
        interventionId: intervention.id
      },
      persistedResponse,
      persistedDiagnosis,
      intervention
    );

    // 5. Return structured diagnosis
    return res.status(200).json({
      success: true,
      diagnosis: diagnosticResult,
      intervention
    });
  } catch (err: any) {
    if (err instanceof DiagnosticError) {
      let statusCode = 500;
      if (err.code === 'MISSING_API_KEY' || err.code === 'INVALID_API_KEY') statusCode = 503;
      else if (err.code === 'QUOTA_EXCEEDED') statusCode = 429;
      else if (err.code === 'MODEL_UNAVAILABLE') statusCode = 503;
      else if (err.code === 'TIMEOUT') statusCode = 504;
      else if (err.code === 'MALFORMED_JSON' || err.code === 'MALFORMED_OUTPUT') statusCode = 502;
      else if (err.code === 'UNSUPPORTED_CONCEPT' || err.code === 'MALFORMED_REQUEST') statusCode = 400;

      console.error(`[DIAGNOSE_ROUTE] Diagnostic failure [${err.code}]:`, err.message, err.details || '');

      return res.status(statusCode).json({
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details
        }
      });
    }

    console.error('[DIAGNOSE_ROUTE] Unexpected diagnosis exception:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal error occurred during reasoning diagnosis.',
        details: err?.message
      }
    });
  }
});

/**
 * GET /api/diagnose/records
 * Audit & Teacher inspection endpoint for persisted diagnostic records
 */
diagnoseRoutes.get('/records', (req: Request, res: Response) => {
  const studentId = req.query.studentId as string | undefined;
  const records = sharedLearnerStateManager.getDiagnosticRecords(studentId);
  res.json({ records });
});
