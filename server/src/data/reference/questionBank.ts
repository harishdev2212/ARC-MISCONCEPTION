import { Question } from '@shared/types';
export const LINEAR_EQUATIONS_CONCEPT_ID = 'concept-linear-eq-multistep';

/**
 * MindTrace Comprehensive Linear Equations Question Bank
 * 
 * Structured according to the MindTrace Question Schema:
 * {
 *   id,
 *   subject,
 *   topic,
 *   subtopic,
 *   difficulty,
 *   question,
 *   expectedAnswer,
 *   concept,
 *   commonMisconceptions,
 *   diagnosticQuestions,
 *   recoveryQuestions,
 *   // Backward compatibility fields:
 *   conceptId, equation, prompt, instructions, expectedFinalAnswer, referenceSolutionSteps, isTransferQuestion
 * }
 * 
 * Categories:
 * A. One-Step Equations
 * B. Two-Step Equations
 * C. Multi-Step Equations
 * D. Distributive Property
 * E. Variables on Both Sides
 * F. Negative Numbers
 * G. Fractions
 * H. Decimals
 * I. Word Problems
 * J. Misconception-Focused Questions
 */

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // Category A: ONE-STEP EQUATIONS
  // ==========================================
  {
    id: 'q-one-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'One-Step Addition',
    difficulty: 'easy',
    category: 'ONE_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x + 5 = 12',
    equation: 'x + 5 = 12',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Show the operation applied to both sides to isolate the variable.',
    expectedAnswer: 'x = 7',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Subtract 5 from both sides: x + 5 - 5 = 12 - 5.',
      'Simplify: x = 7.',
      'Check: 7 + 5 = 12.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-INVERSE-OP-ERR'],
    diagnosticQuestions: ['What operation is currently being applied to x?', 'What is the inverse operation of adding 5?'],
    recoveryQuestions: ['q-one-02', 'q-one-rec-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-one-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'One-Step Subtraction',
    difficulty: 'easy',
    category: 'ONE_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x - 8 = 14',
    equation: 'x - 8 = 14',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Explain why adding 8 to both sides maintains balance.',
    expectedAnswer: 'x = 22',
    expectedFinalAnswer: 'x = 22',
    referenceSolutionSteps: [
      'Add 8 to both sides: x - 8 + 8 = 14 + 8.',
      'Simplify: x = 22.',
      'Check: 22 - 8 = 14.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['How do you undo subtracting 8?', 'Did you apply the addition to both sides?'],
    recoveryQuestions: ['q-one-01', 'q-one-rec-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-one-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'One-Step Multiplication',
    difficulty: 'easy',
    category: 'ONE_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 3x = 21',
    equation: '3x = 21',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Identify the coefficient and apply the inverse operation.',
    expectedAnswer: 'x = 7',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Identify coefficient of x is 3.',
      'Divide both sides by 3: 3x / 3 = 21 / 3.',
      'Simplify: x = 7.',
      'Check: 3(7) = 21.'
    ],
    commonMisconceptions: ['EQ-INVERSE-OP-ERR', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What operation binds 3 to x?', 'How do you undo multiplication?'],
    recoveryQuestions: ['q-one-rec-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-one-04',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'One-Step Division',
    difficulty: 'easy',
    category: 'ONE_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x / 4 = 6',
    equation: 'x / 4 = 6',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Explain how multiplication undoes division while keeping the equation balanced.',
    expectedAnswer: 'x = 24',
    expectedFinalAnswer: 'x = 24',
    referenceSolutionSteps: [
      'Multiply both sides by 4: (x / 4) * 4 = 6 * 4.',
      'Simplify: x = 24.',
      'Check: 24 / 4 = 6.'
    ],
    commonMisconceptions: ['EQ-INVERSE-OP-ERR', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['If x is divided by 4, what operation isolates x?'],
    recoveryQuestions: ['q-one-rec-04'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category B: TWO-STEP EQUATIONS
  // ==========================================
  {
    id: 'q-two-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Two-Step Standard',
    difficulty: 'medium',
    category: 'TWO_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 3x + 8 = 29',
    equation: '3x + 8 = 29',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'State each operation you apply and explain why keeping both sides balanced preserves equality.',
    expectedAnswer: 'x = 7',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Subtract 8 from both sides: 3x + 8 - 8 = 29 - 8.',
      'Simplify: 3x = 21.',
      'Divide both sides by 3: x = 7.',
      'Verification check: 3(7) + 8 = 21 + 8 = 29.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-SIGN-INVERT', 'EQ-UNLIKE-TERMS'],
    diagnosticQuestions: ['Which term should be eliminated first, the constant or the coefficient?', 'Did you subtract 8 from both sides or just one?'],
    recoveryQuestions: ['q-two-02', 'q-transfer-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-two-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Two-Step Subtraction Constant',
    difficulty: 'medium',
    category: 'TWO_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 5x - 7 = 28',
    equation: '5x - 7 = 28',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Show step 1 (constant elimination) and step 2 (coefficient division).',
    expectedAnswer: 'x = 7',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Add 7 to both sides: 5x - 7 + 7 = 28 + 7.',
      'Simplify: 5x = 35.',
      'Divide both sides by 5: x = 7.',
      'Check: 5(7) - 7 = 35 - 7 = 28.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What is the inverse of subtracting 7?', 'Did you add 7 to both 5x-7 and 28?'],
    recoveryQuestions: ['q-two-03', 'q-transfer-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-two-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Two-Step Standard',
    difficulty: 'medium',
    category: 'TWO_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 4x + 9 = 25',
    equation: '4x + 9 = 25',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Explain each step as you balance the equation.',
    expectedAnswer: 'x = 4',
    expectedFinalAnswer: 'x = 4',
    referenceSolutionSteps: [
      'Subtract 9 from both sides: 4x = 16.',
      'Divide both sides by 4: x = 4.',
      'Check: 4(4) + 9 = 16 + 9 = 25.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-UNLIKE-TERMS'],
    diagnosticQuestions: ['Why can we not combine 4x and 9 directly?'],
    recoveryQuestions: ['q-two-04'],
    isTransferQuestion: false
  },
  {
    id: 'q-two-04',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Two-Step Subtraction Constant',
    difficulty: 'medium',
    category: 'TWO_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 7x - 3 = 32',
    equation: '7x - 3 = 32',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Isolate 7x first by applying the appropriate inverse operation.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Add 3 to both sides: 7x = 35.',
      'Divide both sides by 7: x = 5.',
      'Check: 7(5) - 3 = 35 - 3 = 32.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What sign does the 3 have, and how do we invert it on both sides?'],
    recoveryQuestions: ['q-two-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category C: MULTI-STEP EQUATIONS
  // ==========================================
  {
    id: 'q-multi-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Combining Like Terms',
    difficulty: 'medium',
    category: 'MULTI_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 3x + 4 - 2x = 15',
    equation: '3x + 4 - 2x = 15',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Group like variable terms on the left side before performing balancing operations.',
    expectedAnswer: 'x = 11',
    expectedFinalAnswer: 'x = 11',
    referenceSolutionSteps: [
      'Combine like terms on left side: (3x - 2x) + 4 = x + 4.',
      'The equation becomes: x + 4 = 15.',
      'Subtract 4 from both sides: x = 11.',
      'Check: 3(11) + 4 - 2(11) = 33 + 4 - 22 = 15.'
    ],
    commonMisconceptions: ['EQ-UNLIKE-TERMS', 'EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['Which terms can be combined on the left side?', 'Does combining terms on one side change the other side?'],
    recoveryQuestions: ['q-multi-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-multi-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Combining Like Terms',
    difficulty: 'medium',
    category: 'MULTI_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 5x - 3 + 2x = 25',
    equation: '5x - 3 + 2x = 25',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Combine the x terms first and explain your steps.',
    expectedAnswer: 'x = 4',
    expectedFinalAnswer: 'x = 4',
    referenceSolutionSteps: [
      'Combine 5x and 2x to get 7x: 7x - 3 = 25.',
      'Add 3 to both sides: 7x = 28.',
      'Divide both sides by 7: x = 4.',
      'Check: 5(4) - 3 + 2(4) = 20 - 3 + 8 = 25.'
    ],
    commonMisconceptions: ['EQ-UNLIKE-TERMS', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What is 5x + 2x?', 'Did you add 3 to both sides?'],
    recoveryQuestions: ['q-multi-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-multi-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distribution with Constants',
    difficulty: 'hard',
    category: 'MULTI_STEP',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 2(x + 4) - 3 = 15',
    equation: '2(x + 4) - 3 = 15',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Apply the distributive property first, combine constants, then isolate x.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Distribute 2 across (x + 4): 2x + 8 - 3 = 15.',
      'Combine constants on left: 2x + 5 = 15.',
      'Subtract 5 from both sides: 2x = 10.',
      'Divide both sides by 2: x = 5.',
      'Check: 2(5 + 4) - 3 = 2(9) - 3 = 18 - 3 = 15.'
    ],
    commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-UNILATERAL-OP', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['Did you multiply both x and 4 by 2?', 'What does 8 - 3 equal on the left side?'],
    recoveryQuestions: ['q-distrib-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category D: DISTRIBUTIVE PROPERTY
  // ==========================================
  {
    id: 'q-distrib-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distributive Property',
    difficulty: 'medium',
    category: 'DISTRIBUTIVE_PROPERTY',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 3(x + 4) = 27',
    equation: '3(x + 4) = 27',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Carefully expand the left side using the distributive property.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Distribute 3 to both terms inside parentheses: 3*x + 3*4 = 27.',
      'Simplify: 3x + 12 = 27.',
      'Subtract 12 from both sides: 3x = 15.',
      'Divide both sides by 3: x = 5.',
      'Check: 3(5 + 4) = 3(9) = 27.'
    ],
    commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What must 3 multiply in the expression 3(x + 4)?', 'Did you multiply 3 by 4 as well as x?'],
    recoveryQuestions: ['q-distrib-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-distrib-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distributive Property with Subtraction',
    difficulty: 'medium',
    category: 'DISTRIBUTIVE_PROPERTY',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 5(x - 2) = 30',
    equation: '5(x - 2) = 30',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Remember to multiply 5 by -2 when expanding the parentheses.',
    expectedAnswer: 'x = 8',
    expectedFinalAnswer: 'x = 8',
    referenceSolutionSteps: [
      'Distribute 5 across (x - 2): 5x - 10 = 30.',
      'Add 10 to both sides: 5x = 40.',
      'Divide both sides by 5: x = 8.',
      'Check: 5(8 - 2) = 5(6) = 30.'
    ],
    commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What is 5 times -2?', 'Did you add 10 to both sides?'],
    recoveryQuestions: ['q-distrib-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-distrib-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distributive with Variable Coefficient',
    difficulty: 'hard',
    category: 'DISTRIBUTIVE_PROPERTY',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 2(3x + 4) = 20',
    equation: '2(3x + 4) = 20',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Distribute 2 across both 3x and 4.',
    expectedAnswer: 'x = 2',
    expectedFinalAnswer: 'x = 2',
    referenceSolutionSteps: [
      'Distribute 2: 2*(3x) + 2*(4) = 20 -> 6x + 8 = 20.',
      'Subtract 8 from both sides: 6x = 12.',
      'Divide both sides by 6: x = 2.',
      'Check: 2(3(2) + 4) = 2(6 + 4) = 2(10) = 20.'
    ],
    commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-UNLIKE-TERMS'],
    diagnosticQuestions: ['What is 2 multiplied by 3x?', 'Did you also distribute to the constant 4?'],
    recoveryQuestions: ['q-distrib-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category E: VARIABLES ON BOTH SIDES
  // ==========================================
  {
    id: 'q-both-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Variables on Both Sides',
    difficulty: 'medium',
    category: 'VARIABLES_BOTH_SIDES',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 5x + 3 = 2x + 18',
    equation: '5x + 3 = 2x + 18',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Collect variable terms on one side and constant terms on the other side.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Subtract 2x from both sides: 3x + 3 = 18.',
      'Subtract 3 from both sides: 3x = 15.',
      'Divide both sides by 3: x = 5.',
      'Check: 5(5) + 3 = 28 and 2(5) + 18 = 28.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP', 'EQ-UNLIKE-TERMS'],
    diagnosticQuestions: ['How can we remove 2x from the right side?', 'Did you subtract 2x from 5x on the left side?'],
    recoveryQuestions: ['q-both-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-both-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Variables on Both Sides with Subtraction',
    difficulty: 'medium',
    category: 'VARIABLES_BOTH_SIDES',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 7x - 4 = 3x + 16',
    equation: '7x - 4 = 3x + 16',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Isolate variables on the left and constants on the right.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Subtract 3x from both sides: 4x - 4 = 16.',
      'Add 4 to both sides: 4x = 20.',
      'Divide both sides by 4: x = 5.',
      'Check: 7(5) - 4 = 31 and 3(5) + 16 = 31.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What happens to -4 when we add 4 to both sides?'],
    recoveryQuestions: ['q-both-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-both-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Variables on Both Sides',
    difficulty: 'hard',
    category: 'VARIABLES_BOTH_SIDES',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 4x + 9 = 2x + 21',
    equation: '4x + 9 = 2x + 21',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Show balance transformations on both sides.',
    expectedAnswer: 'x = 6',
    expectedFinalAnswer: 'x = 6',
    referenceSolutionSteps: [
      'Subtract 2x from both sides: 2x + 9 = 21.',
      'Subtract 9 from both sides: 2x = 12.',
      'Divide both sides by 2: x = 6.',
      'Check: 4(6) + 9 = 33 and 2(6) + 21 = 33.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['Did you apply the 2x subtraction to both sides?'],
    recoveryQuestions: ['q-both-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category F: NEGATIVE NUMBERS
  // ==========================================
  {
    id: 'q-neg-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Negative Coefficient',
    difficulty: 'medium',
    category: 'NEGATIVE_NUMBERS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: -3x + 9 = 18',
    equation: '-3x + 9 = 18',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Take care with negative signs when dividing by the coefficient.',
    expectedAnswer: 'x = -3',
    expectedFinalAnswer: 'x = -3',
    referenceSolutionSteps: [
      'Subtract 9 from both sides: -3x = 9.',
      'Divide both sides by -3: x = 9 / (-3) = -3.',
      'Check: -3(-3) + 9 = 9 + 9 = 18.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-WRONG-COEFF-DIV'],
    diagnosticQuestions: ['What is the sign of the coefficient of x?', 'What is a positive number divided by a negative number?'],
    recoveryQuestions: ['q-neg-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-neg-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Negative Result',
    difficulty: 'medium',
    category: 'NEGATIVE_NUMBERS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 4x - 12 = -20',
    equation: '4x - 12 = -20',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Observe sign rules carefully when adding 12 to -20.',
    expectedAnswer: 'x = -2',
    expectedFinalAnswer: 'x = -2',
    referenceSolutionSteps: [
      'Add 12 to both sides: 4x = -20 + 12 = -8.',
      'Divide both sides by 4: x = -8 / 4 = -2.',
      'Check: 4(-2) - 12 = -8 - 12 = -20.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-ARITHMETIC-MISTAKE'],
    diagnosticQuestions: ['What is -20 + 12?', 'Is the result positive or negative?'],
    recoveryQuestions: ['q-neg-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-neg-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Negative Coefficient and Constant',
    difficulty: 'hard',
    category: 'NEGATIVE_NUMBERS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: -5x - 3 = 17',
    equation: '-5x - 3 = 17',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Isolate -5x by adding 3, then divide by -5.',
    expectedAnswer: 'x = -4',
    expectedFinalAnswer: 'x = -4',
    referenceSolutionSteps: [
      'Add 3 to both sides: -5x = 20.',
      'Divide both sides by -5: x = 20 / (-5) = -4.',
      'Check: -5(-4) - 3 = 20 - 3 = 17.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-WRONG-COEFF-DIV'],
    diagnosticQuestions: ['Did you divide by 5 or by -5?'],
    recoveryQuestions: ['q-neg-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category G: FRACTIONS
  // ==========================================
  {
    id: 'q-frac-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Fraction Terms',
    difficulty: 'medium',
    category: 'FRACTIONS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x/3 + 4 = 10',
    equation: 'x/3 + 4 = 10',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Subtract the constant 4 first, then clear the fraction by multiplying by 3.',
    expectedAnswer: 'x = 18',
    expectedFinalAnswer: 'x = 18',
    referenceSolutionSteps: [
      'Subtract 4 from both sides: x/3 = 6.',
      'Multiply both sides by 3: x = 6 * 3 = 18.',
      'Check: 18/3 + 4 = 6 + 4 = 10.'
    ],
    commonMisconceptions: ['EQ-INCORRECT-FRACTION-OP', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['What is the denominator of x/3?', 'How do you cancel a division by 3?'],
    recoveryQuestions: ['q-frac-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-frac-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Fraction Coefficient',
    difficulty: 'medium',
    category: 'FRACTIONS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: (2x/5) = 8',
    equation: '(2x/5) = 8',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Multiply both sides by 5 or multiply by the reciprocal (5/2).',
    expectedAnswer: 'x = 20',
    expectedFinalAnswer: 'x = 20',
    referenceSolutionSteps: [
      'Multiply both sides by 5: 2x = 40.',
      'Divide both sides by 2: x = 20.',
      'Check: (2*20)/5 = 40/5 = 8.'
    ],
    commonMisconceptions: ['EQ-INCORRECT-FRACTION-OP', 'EQ-WRONG-COEFF-DIV'],
    diagnosticQuestions: ['Did you multiply 8 by 5 first?', 'What is 40 divided by 2?'],
    recoveryQuestions: ['q-frac-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-frac-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Fraction with Subtraction',
    difficulty: 'medium',
    category: 'FRACTIONS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x/4 - 3 = 5',
    equation: 'x/4 - 3 = 5',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Add 3 to both sides before multiplying by 4.',
    expectedAnswer: 'x = 32',
    expectedFinalAnswer: 'x = 32',
    referenceSolutionSteps: [
      'Add 3 to both sides: x/4 = 8.',
      'Multiply both sides by 4: x = 32.',
      'Check: 32/4 - 3 = 8 - 3 = 5.'
    ],
    commonMisconceptions: ['EQ-INCORRECT-FRACTION-OP', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What is 5 + 3?', 'How does multiplying by 4 isolate x?'],
    recoveryQuestions: ['q-frac-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category H: DECIMALS
  // ==========================================
  {
    id: 'q-dec-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Decimal Coefficients',
    difficulty: 'medium',
    category: 'DECIMALS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 2.5x + 5 = 15',
    equation: '2.5x + 5 = 15',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Subtract 5 first, then divide by the decimal coefficient 2.5.',
    expectedAnswer: 'x = 4',
    expectedFinalAnswer: 'x = 4',
    referenceSolutionSteps: [
      'Subtract 5 from both sides: 2.5x = 10.',
      'Divide both sides by 2.5: x = 10 / 2.5 = 4.',
      'Check: 2.5(4) + 5 = 10 + 5 = 15.'
    ],
    commonMisconceptions: ['EQ-ARITHMETIC-MISTAKE', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['How many times does 2.5 go into 10?'],
    recoveryQuestions: ['q-dec-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-dec-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Decimal Multiplication',
    difficulty: 'medium',
    category: 'DECIMALS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 0.5x + 3 = 8',
    equation: '0.5x + 3 = 8',
    prompt: 'Solve for x. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Isolate 0.5x, then divide by 0.5 (or multiply by 2).',
    expectedAnswer: 'x = 10',
    expectedFinalAnswer: 'x = 10',
    referenceSolutionSteps: [
      'Subtract 3 from both sides: 0.5x = 5.',
      'Divide both sides by 0.5 (or multiply by 2): x = 10.',
      'Check: 0.5(10) + 3 = 5 + 3 = 8.'
    ],
    commonMisconceptions: ['EQ-ARITHMETIC-MISTAKE', 'EQ-WRONG-COEFF-DIV'],
    diagnosticQuestions: ['Remember that dividing by 0.5 is equivalent to multiplying by 2.'],
    recoveryQuestions: ['q-dec-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category I: WORD PROBLEMS
  // ==========================================
  {
    id: 'q-word-01',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Age Word Problem',
    difficulty: 'medium',
    category: 'WORD_PROBLEMS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Maya is 5 years older than twice Leo\'s age. If Maya is 21 years old, write and solve an equation to find Leo\'s age x: 2x + 5 = 21',
    equation: '2x + 5 = 21',
    prompt: 'Maya is 5 years older than twice Leo\'s age. If Maya is 21, solve 2x + 5 = 21 for Leo\'s age x.',
    instructions: 'Explain each step in solving the equation and verify your answer makes sense in context.',
    expectedAnswer: 'x = 8',
    expectedFinalAnswer: 'x = 8',
    referenceSolutionSteps: [
      'Set up equation from word problem: 2x + 5 = 21.',
      'Subtract 5 from both sides: 2x = 16.',
      'Divide both sides by 2: x = 8.',
      'Leo is 8 years old. Check: 2(8) + 5 = 16 + 5 = 21.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What represents Leo\'s age in the equation?', 'What is 21 minus 5?'],
    recoveryQuestions: ['q-word-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-word-02',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Money Word Problem',
    difficulty: 'medium',
    category: 'WORD_PROBLEMS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Movie tickets cost $8 each plus a $6 booking fee for the group. The total paid was $38. Solve 8x + 6 = 38 for the number of tickets x.',
    equation: '8x + 6 = 38',
    prompt: 'Tickets cost $8 each plus a $6 flat fee. Total is $38. Solve 8x + 6 = 38.',
    instructions: 'Isolate x and explain how both sides stay balanced.',
    expectedAnswer: 'x = 4',
    expectedFinalAnswer: 'x = 4',
    referenceSolutionSteps: [
      'Subtract booking fee ($6) from both sides: 8x = 32.',
      'Divide by ticket price ($8): x = 4.',
      'Check: 8(4) + 6 = 32 + 6 = 38.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-ARITHMETIC-MISTAKE'],
    diagnosticQuestions: ['Why do we subtract 6 before dividing by 8?'],
    recoveryQuestions: ['q-word-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-word-03',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distance Word Problem',
    difficulty: 'hard',
    category: 'WORD_PROBLEMS',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'A cyclist had a 12-mile head start and travels at 15 miles per hour. If they traveled a total of 72 miles, solve 15h + 12 = 72 for hours h.',
    equation: '15h + 12 = 72',
    prompt: 'A cyclist with a 12-mile head start rides at 15 mph to cover 72 miles. Solve 15h + 12 = 72 for h.',
    instructions: 'Show your mathematical steps and explain why equality is preserved.',
    expectedAnswer: 'h = 4',
    expectedFinalAnswer: 'h = 4',
    referenceSolutionSteps: [
      'Subtract head start (12) from both sides: 15h = 60.',
      'Divide by speed (15): h = 4 hours.',
      'Check: 15(4) + 12 = 60 + 12 = 72.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-WRONG-COEFF-DIV'],
    diagnosticQuestions: ['What is 72 minus 12?', 'How many hours does 15 into 60 represent?'],
    recoveryQuestions: ['q-word-01'],
    isTransferQuestion: false
  },

  // ==========================================
  // Category J: MISCONCEPTION-FOCUSED QUESTIONS
  // ==========================================
  {
    id: 'q-misc-one-sided',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'One-Sided Operation Diagnostic',
    difficulty: 'medium',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 4x + 12 = 36',
    equation: '4x + 12 = 36',
    prompt: 'Solve for x: 4x + 12 = 36. Explain how you maintain equivalence on both sides.',
    instructions: 'Specifically state what operation you apply to BOTH sides and why.',
    expectedAnswer: 'x = 6',
    expectedFinalAnswer: 'x = 6',
    referenceSolutionSteps: [
      'Subtract 12 from BOTH sides: 4x + 12 - 12 = 36 - 12.',
      'Simplify: 4x = 24.',
      'Divide BOTH sides by 4: x = 6.',
      'Check: 4(6) + 12 = 24 + 12 = 36.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['Did you subtract 12 from 36, from 4x+12, or from BOTH sides?'],
    recoveryQuestions: ['q-two-01', 'q-transfer-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-inverse-op',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Inverse Operations Diagnostic',
    difficulty: 'easy',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 5x = 35',
    equation: '5x = 35',
    prompt: 'Solve for x: 5x = 35. Explain which inverse operation isolates x.',
    instructions: 'State clearly why multiplication must be undone by division, not subtraction.',
    expectedAnswer: 'x = 7',
    expectedFinalAnswer: 'x = 7',
    referenceSolutionSteps: [
      'Recognize that 5x means 5 multiplied by x.',
      'Apply inverse operation (divide by 5): 5x / 5 = 35 / 5.',
      'x = 7.',
      'Check: 5(7) = 35.'
    ],
    commonMisconceptions: ['EQ-INVERSE-OP-ERR'],
    diagnosticQuestions: ['What operation is 5 performing on x? How do we invert multiplication?'],
    recoveryQuestions: ['q-one-03'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-sign-error',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Sign Error Diagnostic',
    difficulty: 'medium',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 6x - 15 = 21',
    equation: '6x - 15 = 21',
    prompt: 'Solve for x: 6x - 15 = 21. Justify the sign of the constant when isolating the variable.',
    instructions: 'Explain why we add 15 to both sides instead of subtracting.',
    expectedAnswer: 'x = 6',
    expectedFinalAnswer: 'x = 6',
    referenceSolutionSteps: [
      'Inverse of -15 is +15. Add 15 to both sides: 6x = 21 + 15 = 36.',
      'Divide both sides by 6: x = 6.',
      'Check: 6(6) - 15 = 36 - 15 = 21.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT'],
    diagnosticQuestions: ['Since 15 is subtracted on the left, what operation inverts it on both sides?'],
    recoveryQuestions: ['q-two-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-distrib-error',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Distributive Error Diagnostic',
    difficulty: 'hard',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 4(2x - 3) = 28',
    equation: '4(2x - 3) = 28',
    prompt: 'Solve for x: 4(2x - 3) = 28. Fully expand the parentheses before isolating x.',
    instructions: 'Make sure 4 multiplies BOTH 2x and -3.',
    expectedAnswer: 'x = 5',
    expectedFinalAnswer: 'x = 5',
    referenceSolutionSteps: [
      'Distribute 4: 4*(2x) - 4*(3) = 28 -> 8x - 12 = 28.',
      'Add 12 to both sides: 8x = 40.',
      'Divide both sides by 8: x = 5.',
      'Check: 4(2(5) - 3) = 4(10 - 3) = 4(7) = 28.'
    ],
    commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What is 4 multiplied by -3?', 'Did both terms inside receive the factor 4?'],
    recoveryQuestions: ['q-distrib-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-unlike-terms',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Combining Unlike Terms Diagnostic',
    difficulty: 'easy',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 2x + 7 = 23',
    equation: '2x + 7 = 23',
    prompt: 'Solve for x: 2x + 7 = 23. Explain why 2x and 7 cannot be combined into 9x.',
    instructions: 'State each transformation step-by-step.',
    expectedAnswer: 'x = 8',
    expectedFinalAnswer: 'x = 8',
    referenceSolutionSteps: [
      'Subtract 7 from both sides: 2x = 16.',
      'Divide both sides by 2: x = 8.',
      'Check: 2(8) + 7 = 16 + 7 = 23.'
    ],
    commonMisconceptions: ['EQ-UNLIKE-TERMS', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['Can variable terms and constant numbers be added together directly?'],
    recoveryQuestions: ['q-two-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-wrong-coeff',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Wrong Coefficient Division Diagnostic',
    difficulty: 'medium',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: -4x = 24',
    equation: '-4x = 24',
    prompt: 'Solve for x: -4x = 24. Explain which coefficient is divided on both sides.',
    instructions: 'Preserve the negative sign when dividing.',
    expectedAnswer: 'x = -6',
    expectedFinalAnswer: 'x = -6',
    referenceSolutionSteps: [
      'Divide both sides by -4: x = 24 / (-4).',
      'Simplify: x = -6.',
      'Check: -4(-6) = 24.'
    ],
    commonMisconceptions: ['EQ-WRONG-COEFF-DIV', 'EQ-SIGN-INVERT'],
    diagnosticQuestions: ['What is the exact coefficient of x including its sign?'],
    recoveryQuestions: ['q-neg-01'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-moving-terms',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Moving Terms Reason Diagnostic',
    difficulty: 'hard',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: 3x + 14 = 8x - 6',
    equation: '3x + 14 = 8x - 6',
    prompt: 'Solve for x: 3x + 14 = 8x - 6. Justify each transposition using inverse operations.',
    instructions: 'Explain why simply "moving a term" without changing sign violates balance.',
    expectedAnswer: 'x = 4',
    expectedFinalAnswer: 'x = 4',
    referenceSolutionSteps: [
      'Subtract 3x from both sides: 14 = 5x - 6.',
      'Add 6 to both sides: 20 = 5x.',
      'Divide both sides by 5: x = 4.',
      'Check: 3(4) + 14 = 26 and 8(4) - 6 = 26.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['Why does moving -6 across the equal sign make it +6 on the other side?'],
    recoveryQuestions: ['q-both-02'],
    isTransferQuestion: false
  },
  {
    id: 'q-misc-fraction-op',
    subject: 'Mathematics',
    topic: 'Linear Equations',
    subtopic: 'Fraction Operations Diagnostic',
    difficulty: 'medium',
    category: 'MISCONCEPTION_FOCUSED',
    concept: 'linear_equations',
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    question: 'Solve for x: x/3 + 5 = 11',
    equation: 'x/3 + 5 = 11',
    prompt: 'Solve for x: x/3 + 5 = 11. Explain what order of operations undoes the fraction.',
    instructions: 'Subtract 5 first, then multiply by 3.',
    expectedAnswer: 'x = 18',
    expectedFinalAnswer: 'x = 18',
    referenceSolutionSteps: [
      'Subtract 5 from both sides: x/3 = 6.',
      'Multiply both sides by 3: x = 18.',
      'Check: 18/3 + 5 = 6 + 5 = 11.'
    ],
    commonMisconceptions: ['EQ-INCORRECT-FRACTION-OP', 'EQ-UNILATERAL-OP'],
    diagnosticQuestions: ['If you multiply by 3 first, what must you multiply? (Every term!)'],
    recoveryQuestions: ['q-frac-01'],
    isTransferQuestion: false
  }
];

import { MULTI_TOPIC_QUESTIONS } from './multiTopicQuestionBank';
import { PROGRAMMING_QUESTIONS } from './programmingQuestionBank';
import { ENGLISH_QUESTIONS } from './englishQuestionBank';

// Combine linear equations questions, multi-topic math, programming, and English questions
export const ALL_COMBINED_QUESTIONS: Question[] = [
  ...QUESTION_BANK.map(q => ({
    ...q,
    subject: 'Mathematics',
    category: q.category === 'MISCONCEPTION_FOCUSED' || q.category === 'ONE_STEP' || q.category === 'TWO_STEP' || q.category === 'MULTI_STEP' || q.category === 'DISTRIBUTIVE' || q.category === 'VARIABLES_BOTH_SIDES' || q.category === 'NEGATIVES' || q.category === 'FRACTIONS' || q.category === 'DECIMALS' || q.category === 'WORD_PROBLEMS' ? 'Algebra' : (q.category || 'Algebra'),
    topic: q.topic || 'Linear Equations in One Variable',
    concepts: q.concepts || [q.concept || 'linear_equations', 'inverse_operations', 'equality_balance'],
    misconceptionTags: q.misconceptionTags || q.commonMisconceptions || ['operation applied to one side only']
  })),
  ...MULTI_TOPIC_QUESTIONS.map(q => ({
    ...q,
    subject: q.subject || 'Mathematics'
  })),
  ...PROGRAMMING_QUESTIONS,
  ...ENGLISH_QUESTIONS
];

export function getQuestionsBySubject(
  subject?: string,
  category?: string,
  topic?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question[] {
  let pool = ALL_COMBINED_QUESTIONS;

  if (subject) {
    const normSubj = subject.toLowerCase().trim();
    pool = pool.filter(q => (q.subject || 'Mathematics').toLowerCase().trim() === normSubj);
  }

  if (category) {
    const normCat = category.toLowerCase().trim();
    pool = pool.filter(q => (q.category || '').toLowerCase().trim().includes(normCat) || normCat.includes((q.category || '').toLowerCase().trim()));
  }

  if (topic) {
    const normTopic = topic.toLowerCase().trim();
    pool = pool.filter(q => 
      (q.topic || '').toLowerCase().trim().includes(normTopic) || 
      normTopic.includes((q.topic || '').toLowerCase().trim())
    );
  }

  if (difficulty) {
    pool = pool.filter(q => q.difficulty === difficulty);
  }

  return pool;
}

export function getQuestionsByCategory(category: string): Question[] {
  const norm = category.toLowerCase().trim();
  return ALL_COMBINED_QUESTIONS.filter(q => {
    const qCat = (q.category || '').toLowerCase().trim();
    if (qCat === norm) return true;
    if (norm === 'algebra' && (qCat.includes('algebra') || qCat === 'linear equations')) return true;
    if (norm.includes('arithmetic') || norm.includes('number')) {
      return qCat.includes('arithmetic') || qCat.includes('number') || qCat.includes('fraction') || qCat.includes('percentage');
    }
    if (norm === 'geometry' && qCat.includes('geometry')) return true;
    if (norm === 'statistics' && qCat.includes('stat')) return true;
    if (norm === 'probability' && qCat.includes('prob')) return true;
    if (norm === 'trigonometry' && qCat.includes('trig')) return true;
    if (norm === 'functions' && qCat.includes('func')) return true;
    if (norm === 'mensuration' && qCat.includes('mensuration')) return true;
    if (norm.includes('programming') || norm.includes('data structure') || norm.includes('algorithm') || norm.includes('debugging')) {
      return (q.subject || '') === 'Programming';
    }
    if (norm.includes('grammar') || norm.includes('vocabulary') || norm.includes('reading') || norm.includes('writing')) {
      return (q.subject || '') === 'English';
    }
    return false;
  });
}


