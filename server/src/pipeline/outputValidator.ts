import { 
  DiagnosticResult, 
  DiagnosisCategory, 
  RecommendedIntervention, 
  ConfidenceBand, 
  InputScopeStatus 
} from '@shared/types';
import { DiagnosticError } from './errors';

export const VALID_TAXONOMY: DiagnosisCategory[] = [
  'missing_prerequisite',
  'wrong_rule_or_definition',
  'procedural_error',
  'overgeneralization',
  'calculation_slip',
  'insufficient_evidence',
  'correct_reasoning',
  'uncertain',
  'out_of_scope'
];

export const VALID_INTERVENTIONS: RecommendedIntervention[] = [
  'probe',
  'hint',
  'explanation',
  'positive_feedback'
];

/**
 * OutputValidator (Phase 4 Structured Output Validation & Uncertainty Handling)
 * 
 * Validates, normalizes, and assigns confidence bands to raw diagnostic outputs.
 * Guarantees that no raw, unverified or malformed AI output can enter learner state.
 */
export class OutputValidator {
  /**
   * Derive categorical confidence band according to specification.
   */
  public static calculateConfidenceBand(confidence: number, diagnosis: DiagnosisCategory): ConfidenceBand {
    if (diagnosis === 'insufficient_evidence' || confidence < 0.40) {
      return 'INSUFFICIENT_EVIDENCE';
    }
    if (confidence >= 0.85) {
      return 'HIGH_CONFIDENCE';
    }
    if (confidence >= 0.60) {
      return 'MEDIUM_CONFIDENCE';
    }
    return 'LOW_CONFIDENCE';
  }

  /**
   * Validates raw JSON object from Gemini adapter or fallback.
   * Throws DiagnosticError if structure is invalid and cannot be safely reconciled.
   */
  public static validate(
    raw: any, 
    scopeStatus: InputScopeStatus = 'ALLOWED',
    latencyMs: number = 0,
    rawStudentInput: string = ''
  ): DiagnosticResult {
    if (!raw || typeof raw !== 'object') {
      throw new DiagnosticError(
        'SCHEMA_VALIDATION_FAILURE',
        'Model response is not a valid JSON object.',
        JSON.stringify(raw)
      );
    }

    const isCorrect = Boolean(raw.isCorrect);
    const concept = typeof raw.concept === 'string' && raw.concept.trim().length > 0 
      ? raw.concept.trim() 
      : 'linear_equations';

    // 1. Validate & clamp confidence
    let confidence = 0.50;
    if (typeof raw.confidence === 'number' && !isNaN(raw.confidence)) {
      confidence = Math.min(1.0, Math.max(0.0, raw.confidence));
      confidence = Math.round(confidence * 100) / 100;
    }

    // 2. Validate diagnosis against controlled taxonomy
    let diagnosis: DiagnosisCategory = 'uncertain';
    if (VALID_TAXONOMY.includes(raw.diagnosis)) {
      diagnosis = raw.diagnosis;
    } else {
      diagnosis = isCorrect ? 'correct_reasoning' : 'uncertain';
    }

    // 3. Robustness Rule: If confidence is low (< 0.50) and not correct reasoning,
    // do NOT force a misconception label; mark as 'uncertain'
    let evidenceStatus: 'sufficient_evidence' | 'insufficient_evidence' | 'ambiguous' = 'sufficient_evidence';
    if (diagnosis === 'insufficient_evidence' || confidence < 0.50) {
      evidenceStatus = 'insufficient_evidence';
      if (!isCorrect && diagnosis !== 'out_of_scope' && diagnosis !== 'insufficient_evidence') {
        diagnosis = 'uncertain';
      }
    } else if (scopeStatus === 'AMBIGUOUS') {
      evidenceStatus = 'ambiguous';
      diagnosis = 'uncertain';
    }

    const confidenceBand = this.calculateConfidenceBand(confidence, diagnosis);

    // 4. Validate evidence string (grounded citation, strip markdown / CoT)
    let evidence = '';
    if (typeof raw.evidence === 'string' && raw.evidence.trim().length > 0) {
      evidence = raw.evidence
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Strip reasoning tags if present
        .replace(/\*\*Reasoning:\*\*[\s\S]*/i, '')
        .trim();
    }
    if (!evidence) {
      evidence = isCorrect 
        ? 'Student reasoning correctly preserved equation balance.'
        : 'Reasoning indicates an uncertainty or incomplete application of inverse operations.';
    }

    // 5. Validate affectedSkill
    let affectedSkill = 'linear_equations_balance';
    if (typeof raw.affectedSkill === 'string' && raw.affectedSkill.trim().length > 0) {
      affectedSkill = raw.affectedSkill.trim();
    }

    // 6. Validate recommendedIntervention
    let recommendedIntervention: RecommendedIntervention = 'probe';
    if (VALID_INTERVENTIONS.includes(raw.recommendedIntervention)) {
      recommendedIntervention = raw.recommendedIntervention;
    } else {
      recommendedIntervention = isCorrect ? 'positive_feedback' : 'probe';
    }

    // 7. Needs recovery test
    const needsRecoveryTest = typeof raw.needsRecoveryTest === 'boolean'
      ? raw.needsRecoveryTest
      : !isCorrect;

    // 8. Error Type Separation (Specification 5: Do not confuse wrong answers with misconceptions)
    const validErrorTypes = [
      'arithmetic_error',
      'conceptual_misconception',
      'procedural_error',
      'sign_error',
      'incomplete_reasoning',
      'careless_mistake',
      'correct_reasoning_incorrect_calculation',
      'correct_answer_weak_reasoning',
      'none'
    ];
    let errorType = isCorrect ? 'none' : 'procedural_error';
    if (typeof raw.errorType === 'string' && validErrorTypes.includes(raw.errorType)) {
      errorType = raw.errorType;
    } else if (diagnosis === 'calculation_slip') {
      errorType = 'arithmetic_error';
    } else if (diagnosis === 'missing_prerequisite' || diagnosis === 'wrong_rule_or_definition' || diagnosis === 'overgeneralization') {
      errorType = 'conceptual_misconception';
    } else if (diagnosis === 'insufficient_evidence') {
      errorType = 'incomplete_reasoning';
    } else if (isCorrect) {
      errorType = 'none';
    }

    const misconceptionTag = typeof raw.misconceptionTag === 'string' && raw.misconceptionTag.trim().length > 0
      ? raw.misconceptionTag.trim()
      : undefined;

    const category = typeof raw.category === 'string' && raw.category.trim().length > 0
      ? raw.category.trim()
      : undefined;

    const topic = typeof raw.topic === 'string' && raw.topic.trim().length > 0
      ? raw.topic.trim()
      : undefined;

    const subject = typeof raw.subject === 'string' && raw.subject.trim().length > 0
      ? raw.subject.trim()
      : undefined;

    const result = (raw.result === 'CORRECT' || raw.result === 'PARTIALLY_CORRECT' || raw.result === 'INCORRECT')
      ? raw.result
      : (isCorrect ? 'CORRECT' : 'INCORRECT');

    const misconception = typeof raw.misconception === 'string' && raw.misconception.trim().length > 0
      ? raw.misconception.trim()
      : (misconceptionTag || (isCorrect ? 'None' : undefined));

    const recommendedAction = typeof raw.recommendedAction === 'string' && raw.recommendedAction.trim().length > 0
      ? raw.recommendedAction.trim()
      : undefined;

    return {
      isCorrect,
      subject,
      result,
      misconception,
      recommendedAction,
      concept,
      category,
      topic,
      errorType: errorType as any,
      misconceptionTag,
      diagnosis,
      confidence,
      confidenceBand,
      evidence,
      evidenceStatus,
      affectedSkill,
      recommendedIntervention,
      needsRecoveryTest,
      scopeStatus,
      latencyMs,
      rawStudentInput
    };
  }
}
