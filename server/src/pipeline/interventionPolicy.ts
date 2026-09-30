import { 
  Intervention, 
  InterventionLevel, 
  DiagnosisCategory, 
  RecommendedIntervention, 
  DiagnosticResult,
  Diagnosis
} from '@shared/types';
import { selectSocraticQuestion, SocraticQuestionType } from '../data/reference/socraticQuestionBank';

/**
 * InterventionPolicy (Phase 2A Adaptive Pedagogical Engine)
 * 
 * Separate module responsible for selecting appropriate pedagogical interventions:
 * - FIRST identifiable misconception -> probe (Level 1)
 * - Repeated same misconception -> hint (Level 2)
 * - Persistent/repeated misconception -> explanation (Level 3)
 * - Correct reasoning -> positive_feedback
 * - Insufficient evidence -> probe
 * - Uncertain -> probe
 * 
 * Socratic principle: NEVER reveals direct answers. Prompts self-reflection.
 */
export interface IInterventionPolicy {
  selectInterventionType(
    studentId: string,
    diagnosisCategory: DiagnosisCategory,
    affectedSkill: string
  ): RecommendedIntervention;

  generateIntervention(
    studentId: string,
    diagnosticResult: DiagnosticResult,
    diagnosisId: string,
    usedQuestionIds?: string[]
  ): Intervention;
}

export class AdaptiveInterventionPolicy implements IInterventionPolicy {
  // In-memory student diagnosis history: studentId -> array of past diagnoses
  private studentHistory: Map<string, { category: DiagnosisCategory; affectedSkill: string; timestamp: string }[]> = new Map();

  recordAttempt(studentId: string, category: DiagnosisCategory, affectedSkill: string) {
    if (!this.studentHistory.has(studentId)) {
      this.studentHistory.set(studentId, []);
    }
    this.studentHistory.get(studentId)!.push({
      category,
      affectedSkill,
      timestamp: new Date().toISOString()
    });
  }

  selectInterventionType(
    studentId: string,
    diagnosisCategory: DiagnosisCategory,
    affectedSkill: string
  ): RecommendedIntervention {
    if (diagnosisCategory === 'correct_reasoning') {
      return 'positive_feedback';
    }

    if (diagnosisCategory === 'insufficient_evidence' || diagnosisCategory === 'uncertain' || diagnosisCategory === 'out_of_scope') {
      return 'probe';
    }

    // Check learner history for this student and category/skill
    const history = this.studentHistory.get(studentId) || [];
    const occurrences = history.filter(
      h => h.category === diagnosisCategory || h.affectedSkill === affectedSkill
    ).length;

    if (occurrences === 0) {
      return 'probe';
    } else if (occurrences === 1) {
      return 'hint';
    } else {
      return 'explanation';
    }
  }

  generateIntervention(
    studentId: string,
    diagnosticResult: DiagnosticResult,
    diagnosisId: string,
    usedQuestionIds: string[] = []
  ): Intervention {
    const interventionType = diagnosticResult.recommendedIntervention || this.selectInterventionType(
      studentId,
      diagnosticResult.diagnosis,
      diagnosticResult.affectedSkill
    );

    // Record attempt for historical tracking
    this.recordAttempt(studentId, diagnosticResult.diagnosis, diagnosticResult.affectedSkill);

    let level: InterventionLevel = 'level_1_socratic_question';
    let levelNumber: 1 | 2 | 3 = 1;
    let tutorMessage = '';
    let socraticQuestion = '';
    let hintPrompt = '';
    let questionBankId: string | undefined;

    switch (interventionType) {
      case 'positive_feedback': {
        level = 'level_1_socratic_question';
        levelNumber = 1;
        tutorMessage = 'Excellent mathematical thinking! Your reasoning preserves bilateral balance at every step.';
        const bankQ = selectSocraticQuestion({
          skill: diagnosticResult.affectedSkill,
          level: 1,
          usedQuestionIds,
          preferredType: 'TYPE_D_VERIFICATION'
        });
        socraticQuestion = bankQ.text || 'How can you verify that your solution is mathematically guaranteed to be correct?';
        hintPrompt = bankQ.hintPrompt || 'You can always check your work by substituting your result back into the original equation.';
        questionBankId = bankQ.id;
        break;
      }

      case 'hint': {
        level = 'level_2_counter_example';
        levelNumber = 2;
        tutorMessage = 'Let us examine the balance between the two sides of the equation.';
        const bankQ = selectSocraticQuestion({
          skill: diagnosticResult.affectedSkill,
          level: 2,
          usedQuestionIds,
          context: { evidence: diagnosticResult.evidence }
        });
        socraticQuestion = bankQ.text;
        hintPrompt = bankQ.hintPrompt;
        questionBankId = bankQ.id;
        break;
      }

      case 'explanation': {
        level = 'level_3_scaffolded_steps';
        levelNumber = 3;
        tutorMessage = 'Let us look at how the principle applies to preserving equality.';
        const bankQ = selectSocraticQuestion({
          skill: diagnosticResult.affectedSkill,
          level: 3,
          usedQuestionIds,
          context: { evidence: diagnosticResult.evidence }
        });
        socraticQuestion = bankQ.text;
        hintPrompt = bankQ.hintPrompt;
        questionBankId = bankQ.id;
        break;
      }

      case 'probe':
      default: {
        level = 'level_1_socratic_question';
        levelNumber = 1;
        if (diagnosticResult.diagnosis === 'insufficient_evidence') {
          tutorMessage = 'Let us explore your thought process together.';
          socraticQuestion = 'Can you describe the very first step you took or what you feel unsure about? Which part of the equation would you like to isolate first?';
          hintPrompt = 'Start by looking at the side with the variable. What number is added or multiplied there?';
        } else if (diagnosticResult.diagnosis === 'out_of_scope') {
          tutorMessage = 'I am your dedicated Linear Equations Socratic Tutor.';
          socraticQuestion = 'Your question appears to be outside our current focus on Linear Equations. Shall we solve an algebraic equation together?';
          hintPrompt = 'We focus on isolating variables in linear equations using inverse operations.';
        } else {
          tutorMessage = 'Let us pause and examine your step-by-step operation on the equation.';
          const bankQ = selectSocraticQuestion({
            skill: diagnosticResult.affectedSkill,
            level: 1,
            usedQuestionIds,
            context: { evidence: diagnosticResult.evidence }
          });
          socraticQuestion = bankQ.text;
          hintPrompt = bankQ.hintPrompt;
          questionBankId = bankQ.id;
        }
        break;
      }
    }

    return {
      id: `intv-${Date.now()}`,
      diagnosisId,
      studentId,
      level,
      levelNumber,
      tutorMessage,
      socraticQuestion,
      hintPrompt,
      requiresStudentResponse: interventionType !== 'positive_feedback',
      timestamp: new Date().toISOString(),
      status: 'ai_generated',
      questionBankId
    };
  }
}
