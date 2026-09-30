import { Concept, Question, MisconceptionDefinition } from '@shared/types';
import { QUESTION_BANK } from './questionBank';

export { QUESTION_BANK };

export const MISCONCEPTION_DEFINITIONS: MisconceptionDefinition[] = [
  {
    id: 'misc-unilateral-op',
    code: 'EQ-UNILATERAL-OP',
    name: 'Unilateral Operation',
    category: 'operational_balance',
    description: 'Operating on only one side of the equals sign without applying the balancing operation to the opposite side.',
    exampleIncorrectReasoning: '3x + 8 = 29 -> I subtracted 8 to isolate 3x, so 3x = 29. Then x = 29/3.',
    underlyingRootCause: 'Conceptualizes the equals sign as an action/result prompt rather than a relational balance between two algebraic quantities.'
  },
  {
    id: 'misc-sign-invert',
    code: 'EQ-SIGN-INVERT',
    name: 'Sign Inversion Failure',
    category: 'sign_inversion',
    description: 'Transposing a term across the equals sign without reversing its operational sign.',
    exampleIncorrectReasoning: '5x - 14 = 2x + 13 -> Moved -14 over: 5x = 2x + 13 - 14.',
    underlyingRootCause: 'Mechanical rule memorization ("move it over") without understanding inverse operations.'
  },
  {
    id: 'misc-distrib-partial',
    code: 'EQ-DISTRIB-PARTIAL',
    name: 'Incomplete Distribution',
    category: 'operational_balance',
    description: 'Multiplying the exterior coefficient by only the leading term inside parentheses.',
    exampleIncorrectReasoning: '3(2x - 4) = 18 -> 6x - 4 = 18.',
    underlyingRootCause: 'Weak mental model of grouping and distributive multiplication over addition/subtraction.'
  },
  {
    id: 'misc-unlike-terms',
    code: 'EQ-UNLIKE-TERMS',
    name: 'Invalid Variable Combination',
    category: 'variable_isolation',
    description: 'Combining variable coefficients with independent constants into a single composite term.',
    exampleIncorrectReasoning: '3x + 8 = 29 -> 3x and 8 make 11x. So 11x = 29.',
    underlyingRootCause: 'Lacks distinction between variable terms (representing unknowns) and scalar constants.'
  }
];

export const LINEAR_EQUATIONS_CONCEPT: Concept = {
  id: 'concept-linear-eq-multistep',
  title: 'Multi-Step Linear Equations & Equivalence Balance',
  domain: 'Mathematics',
  subdomain: 'Algebra I',
  topic: 'Linear Equations',
  description: 'Mastery of solving multi-step linear equations through algebraic equivalence, inverse operations, and balanced transformations on both sides.',
  prerequisites: ['One-Step Equations', 'Order of Operations', 'Integer Operations'],
  difficultyLevel: 'intermediate',
  commonMisconceptions: MISCONCEPTION_DEFINITIONS
};

export const ALL_QUESTIONS: Question[] = [
  {
    id: 'q-canon-01',
    conceptId: 'concept-linear-eq-multistep',
    equation: '3x + 8 = 29',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'State each operation you apply and explain why keeping both sides balanced preserves equality.',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Identify that 8 is added to 3x.',
      'Subtract 8 from BOTH sides to maintain equality: 3x + 8 - 8 = 29 - 8.',
      'Simplify: 3x = 21.',
      'Divide BOTH sides by 3: x = 7.',
      'Verification check: 3(7) + 8 = 21 + 8 = 29.'
    ],
    isTransferQuestion: false,
    difficulty: 'easy'
  },
  {
    id: 'q-canon-02',
    conceptId: 'concept-linear-eq-multistep',
    equation: '5x - 14 = 2x + 13',
    prompt: 'Solve for x with variables on both sides.',
    instructions: 'Show each algebraic transformation and justify how both sides remain equal.',
    expectedFinalAnswer: 'x = 9',
    referenceSolutionSteps: [
      'Subtract 2x from both sides: 3x - 14 = 13.',
      'Add 14 to both sides: 3x = 27.',
      'Divide both sides by 3: x = 9.',
      'Verification check: 5(9) - 14 = 31 and 2(9) + 13 = 31.'
    ],
    isTransferQuestion: false,
    difficulty: 'medium'
  },
  {
    id: 'q-transfer-01',
    conceptId: 'concept-linear-eq-multistep',
    equation: '4y + 11 = 39',
    prompt: 'Recovery Transfer Check: Solve for y with full mathematical justification.',
    instructions: 'Test your understanding on this new transfer problem. Show how both sides stay balanced.',
    expectedFinalAnswer: 'y = 7',
    referenceSolutionSteps: [
      'Subtract 11 from both sides: 4y = 28.',
      'Divide both sides by 4: y = 7.',
      'Check: 4(7) + 11 = 39.'
    ],
    isTransferQuestion: true,
    parentQuestionId: 'q-canon-01',
    difficulty: 'easy'
  },
  {
    id: 'q-transfer-02',
    conceptId: 'concept-linear-eq-multistep',
    equation: '6m - 17 = 2m + 15',
    prompt: 'Recovery Transfer Check: Solve for m with variables on both sides.',
    instructions: 'Demonstrate balance across terms and isolate variable m.',
    expectedFinalAnswer: 'm = 8',
    referenceSolutionSteps: [
      'Subtract 2m from both sides: 4m - 17 = 15.',
      'Add 17 to both sides: 4m = 32.',
      'Divide both sides by 4: m = 8.'
    ],
    isTransferQuestion: true,
    parentQuestionId: 'q-canon-02',
    difficulty: 'medium'
  },
  ...QUESTION_BANK
];

