import { RecoveryAttempt, Question, RecoveryStatus } from '@shared/types';
import { ALL_QUESTIONS } from '../data/reference/curriculum';
import { QUESTION_BANK } from '../data/reference/questionBank';
import { generateRandomizedQuestion } from './questionRandomizer';

/**
 * RecoveryEngine (Phase 2 & 5 Adaptive Recovery & Isomorphic Transfer Evaluation)
 * 
 * Selects or generates an isomorphic recovery question targeting the same
 * mathematical concept with different numbers, testing whether the diagnosed
 * misconception was truly resolved.
 */
export interface IRecoveryEngine {
  getTransferQuestion(parentQuestionId: string, parentQuestion?: Question, misconceptionCode?: string): Question;
  evaluateRecovery(
    studentId: string,
    initialQuestionId: string,
    transferQuestionId: string,
    misconceptionId: string,
    studentReasoning: string,
    expectedAnswer?: string
  ): Promise<RecoveryAttempt>;
}

export class MockRecoveryEngine implements IRecoveryEngine {
  getTransferQuestion(
    parentQuestionId: string, 
    parentQuestion?: Question, 
    misconceptionCode?: string
  ): Question {
    const parent = parentQuestion || ALL_QUESTIONS.find(q => q.id === parentQuestionId);

    // 1. Check if the parent question specifies recoveryQuestions
    if (parent?.recoveryQuestions && parent.recoveryQuestions.length > 0) {
      for (const recId of parent.recoveryQuestions) {
        const found = QUESTION_BANK.find(q => q.id === recId);
        if (found && found.equation !== parent.equation) {
          return {
            ...found,
            id: `q-recov-${Date.now()}`,
            isTransferQuestion: true,
            parentQuestionId: parent.id,
            prompt: `Recovery Check: ${found.prompt || `Solve for x: ${found.equation}`}`
          };
        }
      }
    }

    // 2. Check for explicit legacy transfer questions mapped to parent
    const explicitTransfer = ALL_QUESTIONS.find(
      q => q.isTransferQuestion && q.parentQuestionId === parentQuestionId
    );
    if (explicitTransfer && (!parent || explicitTransfer.equation !== parent.equation)) {
      return explicitTransfer;
    }

    // 3. Find another question in the same category with different numbers
    if (parent?.category) {
      const sameCategory = QUESTION_BANK.filter(
        q => q.category === parent.category && q.equation !== parent.equation && q.id !== parent.id
      );
      if (sameCategory.length > 0) {
        const pick = sameCategory[Math.floor(Math.random() * sameCategory.length)];
        return {
          ...pick,
          id: `q-recov-${Date.now()}`,
          isTransferQuestion: true,
          parentQuestionId: parent.id,
          prompt: `Recovery Check: ${pick.prompt || `Solve for x: ${pick.equation}`}`
        };
      }
    }

    // 4. Generate a fresh randomized variation with verified integer solution
    try {
      const generated = generateRandomizedQuestion(undefined, parent?.difficulty || 'medium');
      if (!parent || generated.equation !== parent.equation) {
        return {
          ...generated,
          id: `q-recov-${Date.now()}`,
          isTransferQuestion: true,
          parentQuestionId: parent?.id || parentQuestionId,
          prompt: `Recovery Check: ${generated.prompt}`
        };
      }
    } catch {
      // Fallback
    }

    // 5. Fallback transfer question
    const defaultTransfer = ALL_QUESTIONS.find(
      q => q.isTransferQuestion && (!parent || q.equation !== parent.equation)
    ) || {
      id: `q-recov-default-${Date.now()}`,
      conceptId: parent?.conceptId || 'concept-linear-eq-multistep',
      equation: '5x - 7 = 28',
      prompt: 'Recovery Check: Solve for x with full mathematical justification: 5x - 7 = 28.',
      instructions: 'Show how both sides stay balanced.',
      expectedFinalAnswer: 'x = 7',
      expectedAnswer: 'x = 7',
      referenceSolutionSteps: [
        'Add 7 to both sides: 5x = 35.',
        'Divide both sides by 5: x = 7.',
        'Check: 5(7) - 7 = 28.'
      ],
      isTransferQuestion: true,
      parentQuestionId: parent?.id || parentQuestionId,
      difficulty: 'medium' as const
    };

    return defaultTransfer;
  }

  async evaluateRecovery(
    studentId: string,
    initialQuestionId: string,
    transferQuestionId: string,
    misconceptionId: string,
    studentReasoning: string,
    expectedAnswer?: string
  ): Promise<RecoveryAttempt> {
    const text = studentReasoning.toLowerCase();

    // Check if student demonstrated balanced operations on BOTH sides and correct inverse
    const appliedBothSides = 
      (text.includes('both') && (text.includes('subtract') || text.includes('add') || text.includes('divide') || text.includes('multiply'))) || 
      text.includes('from both') || 
      text.includes('to both') || 
      text.includes('on both sides') || 
      text.includes('balance') || 
      text.includes('equality');

    // Also check for signs of correct algebraic isolation
    const hasAlgebraicStep = 
      text.includes('=') || 
      text.includes('isolated') || 
      text.includes('distribute') || 
      text.includes('divided by') || 
      text.includes('inverse');

    const recovered = appliedBothSides || hasAlgebraicStep;
    const status: RecoveryStatus = recovered ? 'recovered' : 'in_progress';

    return {
      id: `recov-${Date.now()}`,
      studentId,
      initialQuestionId,
      transferQuestionId,
      misconceptionId,
      studentReasoning,
      status,
      recoveryConfidence: recovered ? 0.94 : 0.60,
      feedbackNotes: recovered
        ? 'Verified: Student demonstrated balanced operations and correct inverse isolation on the transfer problem. Misconception successfully resolved.'
        : 'Pending: Student attempted the recovery question, but explanation of balanced operations remains tentative. Continue monitoring.',
      timestamp: new Date().toISOString()
    };
  }
}
