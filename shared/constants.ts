import { Concept, Question } from './types';

export const MISCONCEPTION_CATALOG = [
  {
    id: 'misc-unilateral-op',
    code: 'EQ-UNILATERAL-OP',
    name: 'Unilateral Operation',
    category: 'operational_balance' as const,
    description: 'Performing an operation (e.g., subtracting or dividing) on only one side of the equals sign without balancing the other.',
    exampleIncorrectReasoning: 'In 3x + 7 = 22, I subtracted 7 from the left to get 3x, but kept 22 as 22. So 3x = 22, then x = 7.33.',
    underlyingRootCause: 'Viewing the equals sign as an action/result symbol rather than a statement of equivalence between two balanced expressions.'
  },
  {
    id: 'misc-sign-inversion',
    code: 'EQ-SIGN-INVERT',
    name: 'Sign Inversion Failure',
    category: 'sign_inversion' as const,
    description: 'Moving a constant or term across the equals sign without inverting its sign (additive inverse).',
    exampleIncorrectReasoning: 'For 5x - 8 = 17, I moved 8 over to the other side: 5x = 17 - 8 = 9, so x = 9/5.',
    underlyingRootCause: 'Procedural "teleportation" heuristic rather than applying inverse operations (+8 to both sides).'
  },
  {
    id: 'misc-distrib-partial',
    code: 'EQ-DISTRIB-PARTIAL',
    name: 'Incomplete Distribution',
    category: 'operational_balance' as const,
    description: 'Multiplying only the first term inside parentheses and ignoring subsequent terms.',
    exampleIncorrectReasoning: 'For 4(2x - 3) = 20, I did 4 * 2x - 3 = 8x - 3 = 20. Then 8x = 23, x = 23/8.',
    underlyingRootCause: 'Failing to conceptualize multiplication across all terms enclosed in grouping parentheses.'
  },
  {
    id: 'misc-unlike-terms',
    code: 'EQ-UNLIKE-TERMS',
    name: 'Invalid Variable Combination',
    category: 'variable_isolation' as const,
    description: 'Combining variable terms with constant terms into a single term.',
    exampleIncorrectReasoning: 'In 2x + 5 = 19, 2x + 5 makes 7x. So 7x = 19, x = 19/7.',
    underlyingRootCause: 'Over-generalizing basic arithmetic addition to algebraic expressions containing variables.'
  }
];

export const REFERENCE_LINEAR_EQUATION_CONCEPT: Concept = {
  id: 'concept-linear-eq-multistep',
  title: 'Multi-Step Linear Equations & Balance',
  domain: 'Mathematics',
  subdomain: 'Algebra I',
  topic: 'Linear Equations',
  description: 'Solving linear equations with variables on one or both sides using balanced inverse operations, distribution, and isolating the variable.',
  prerequisites: ['concept-one-step-equations', 'concept-order-of-operations', 'concept-negative-numbers'],
  difficultyLevel: 'intermediate',
  commonMisconceptions: MISCONCEPTION_CATALOG
};

export const CANONICAL_QUESTIONS: Question[] = [
  {
    id: 'q-canon-01',
    conceptId: 'concept-linear-eq-multistep',
    equation: '3x + 8 = 29',
    prompt: 'Solve for x. Explain your full reasoning step-by-step.',
    instructions: 'Write out every step you take, explaining why you perform each operation on the equation.',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Step 1: Identify that +8 is added to the term 3x.',
      'Step 2: Apply the subtraction property of equality: subtract 8 from BOTH sides (3x + 8 - 8 = 29 - 8).',
      'Step 3: Simplify both sides: 3x = 21.',
      'Step 4: Apply the division property of equality: divide BOTH sides by 3 (3x / 3 = 21 / 3).',
      'Step 5: Conclude x = 7. Verify: 3(7) + 8 = 21 + 8 = 29 (True).'
    ],
    isTransferQuestion: false,
    difficulty: 'easy'
  },
  {
    id: 'q-canon-02',
    conceptId: 'concept-linear-eq-multistep',
    equation: '5x - 14 = 2x + 13',
    prompt: 'Solve for x when variables appear on both sides.',
    instructions: 'Detail how you collect like terms and keep the equation balanced at each stage.',
    expectedFinalAnswer: 'x = 9',
    referenceSolutionSteps: [
      'Step 1: Subtract 2x from both sides: 5x - 2x - 14 = 2x - 2x + 13 -> 3x - 14 = 13.',
      'Step 2: Add 14 to both sides: 3x - 14 + 14 = 13 + 14 -> 3x = 27.',
      'Step 3: Divide both sides by 3: 3x / 3 = 27 / 3 -> x = 9.',
      'Step 4: Check: 5(9) - 14 = 45 - 14 = 31. 2(9) + 13 = 18 + 13 = 31. Balanced.'
    ],
    isTransferQuestion: false,
    difficulty: 'medium'
  }
];

export const TRANSFER_QUESTIONS: Question[] = [
  {
    id: 'q-transfer-01',
    conceptId: 'concept-linear-eq-multistep',
    equation: '4y + 11 = 39',
    prompt: 'Recovery Transfer Check: Solve for y with full mathematical justification.',
    instructions: 'Show your work clearly. Explain how maintaining the balance of the equation guides your operations.',
    expectedFinalAnswer: 'y = 7',
    referenceSolutionSteps: [
      'Step 1: Subtract 11 from BOTH sides: 4y + 11 - 11 = 39 - 11.',
      'Step 2: Simplify: 4y = 28.',
      'Step 3: Divide BOTH sides by 4: y = 7.',
      'Step 4: Verify: 4(7) + 11 = 28 + 11 = 39.'
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
    instructions: 'Show how both sides remain equivalent as you collect terms.',
    expectedFinalAnswer: 'm = 8',
    referenceSolutionSteps: [
      'Step 1: Subtract 2m from both sides: 4m - 17 = 15.',
      'Step 2: Add 17 to both sides: 4m = 32.',
      'Step 3: Divide both sides by 4: m = 8.'
    ],
    isTransferQuestion: true,
    parentQuestionId: 'q-canon-02',
    difficulty: 'medium'
  }
];
