import { Router, Request, Response } from 'express';
import { EVAL_TEST_CASES, runEvaluationSuite } from '../pipeline/evaluationRunner';
import { GeminiDiagnosticEngine } from '../pipeline/diagnosticEngine';

export const evalRoutes = Router();
const evalDiagnosticEngine = new GeminiDiagnosticEngine();

/**
 * GET /api/eval/cases
 * Returns all configured evaluation test cases.
 */
evalRoutes.get('/cases', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: EVAL_TEST_CASES.length,
    testCases: EVAL_TEST_CASES
  });
});

/**
 * POST /api/eval/run
 * Runs the evaluation suite against the real production pipeline.
 * Does not cheat or fake outputs.
 */
evalRoutes.post('/run', async (req: Request, res: Response) => {
  const { testCaseId } = req.body;
  try {
    const results = await runEvaluationSuite(evalDiagnosticEngine, testCaseId);
    const passCount = results.filter(r => r.passed).length;
    res.json({
      success: true,
      total: results.length,
      passed: passCount,
      failed: results.length - passCount,
      results
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'EVAL_RUN_FAILED',
        message: err.message || 'Evaluation suite encountered an error.'
      }
    });
  }
});
