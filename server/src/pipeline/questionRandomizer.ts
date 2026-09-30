import { Question } from '@shared/types';
import { LINEAR_EQUATIONS_CONCEPT } from '../data/reference/curriculum';

/**
 * Question Randomizer & Mathematical Template Engine
 * 
 * Generates verified algebraic variations ensuring:
 * 1. Integer solutions and non-degenerate parameters
 * 2. Mathematical validity verified before return
 * 3. Complete reference steps and prompt metadata
 */

export interface MathTemplate {
  id: string;
  name: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  generate: () => Question;
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const QUESTION_TEMPLATES: MathTemplate[] = [
  // 1. ax + b = c (Two-step standard)
  {
    id: 'tpl-two-step-add',
    name: 'Two-Step Addition (ax + b = c)',
    category: 'TWO_STEP',
    difficulty: 'medium',
    generate: () => {
      const a = getRandomInt(2, 8);
      const x = getRandomInt(2, 11);
      const b = getRandomInt(2, 14);
      const c = a * x + b;

      // Mathematical verification
      if ((c - b) / a !== x) {
        throw new Error('Randomizer math check failed');
      }

      const equation = `${a}x + ${b} = ${c}`;
      return {
        id: `gen-two-${Date.now()}-${getRandomInt(100, 999)}`,
        subject: 'Mathematics',
        topic: 'Linear Equations',
        subtopic: 'Two-Step Equations',
        difficulty: 'medium',
        category: 'TWO_STEP',
        concept: 'linear_equations',
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        question: `Solve for x: ${equation}`,
        equation,
        prompt: `Solve for x: ${equation}. Articulate your complete mathematical reasoning step-by-step.`,
        instructions: 'State each operation applied to both sides to maintain equality.',
        expectedAnswer: `x = ${x}`,
        expectedFinalAnswer: `x = ${x}`,
        referenceSolutionSteps: [
          `Subtract ${b} from both sides: ${a}x = ${c - b}.`,
          `Divide both sides by ${a}: x = ${x}.`,
          `Check: ${a}(${x}) + ${b} = ${a * x} + ${b} = ${c}.`
        ],
        commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-SIGN-INVERT'],
        diagnosticQuestions: [`What operation is the inverse of adding ${b}?`, `Did you apply the subtraction to both sides?`],
        recoveryQuestions: ['q-two-01'],
        isTransferQuestion: false,
        isGenerated: true,
        templateId: 'tpl-two-step-add'
      };
    }
  },

  // 2. ax - b = c (Two-step subtraction)
  {
    id: 'tpl-two-step-sub',
    name: 'Two-Step Subtraction (ax - b = c)',
    category: 'TWO_STEP',
    difficulty: 'medium',
    generate: () => {
      const a = getRandomInt(2, 8);
      const x = getRandomInt(2, 11);
      const b = getRandomInt(2, 14);
      const c = a * x - b;

      if ((c + b) / a !== x) {
        throw new Error('Randomizer math check failed');
      }

      const equation = `${a}x - ${b} = ${c}`;
      return {
        id: `gen-two-sub-${Date.now()}-${getRandomInt(100, 999)}`,
        subject: 'Mathematics',
        topic: 'Linear Equations',
        subtopic: 'Two-Step Subtraction',
        difficulty: 'medium',
        category: 'TWO_STEP',
        concept: 'linear_equations',
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        question: `Solve for x: ${equation}`,
        equation,
        prompt: `Solve for x: ${equation}. Articulate your complete mathematical reasoning step-by-step.`,
        instructions: 'Remember to add the constant to both sides before dividing by the coefficient.',
        expectedAnswer: `x = ${x}`,
        expectedFinalAnswer: `x = ${x}`,
        referenceSolutionSteps: [
          `Add ${b} to both sides: ${a}x = ${c + b}.`,
          `Divide both sides by ${a}: x = ${x}.`,
          `Check: ${a}(${x}) - ${b} = ${a * x} - ${b} = ${c}.`
        ],
        commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
        diagnosticQuestions: [`What is the inverse operation of subtracting ${b}?`],
        recoveryQuestions: ['q-two-02'],
        isTransferQuestion: false,
        isGenerated: true,
        templateId: 'tpl-two-step-sub'
      };
    }
  },

  // 3. a(x + b) = c (Distributive Property)
  {
    id: 'tpl-distrib',
    name: 'Distributive Property (a(x + b) = c)',
    category: 'DISTRIBUTIVE_PROPERTY',
    difficulty: 'hard',
    generate: () => {
      const a = getRandomInt(2, 5);
      const x = getRandomInt(2, 9);
      const b = getRandomInt(2, 7);
      const c = a * (x + b);

      if (c / a - b !== x) {
        throw new Error('Randomizer math check failed');
      }

      const equation = `${a}(x + ${b}) = ${c}`;
      return {
        id: `gen-distrib-${Date.now()}-${getRandomInt(100, 999)}`,
        subject: 'Mathematics',
        topic: 'Linear Equations',
        subtopic: 'Distributive Property',
        difficulty: 'hard',
        category: 'DISTRIBUTIVE_PROPERTY',
        concept: 'linear_equations',
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        question: `Solve for x: ${equation}`,
        equation,
        prompt: `Solve for x: ${equation}. Carefully articulate your distributive steps.`,
        instructions: 'Distribute the factor to all terms inside the parentheses first.',
        expectedAnswer: `x = ${x}`,
        expectedFinalAnswer: `x = ${x}`,
        referenceSolutionSteps: [
          `Distribute ${a} across (x + ${b}): ${a}x + ${a * b} = ${c}.`,
          `Subtract ${a * b} from both sides: ${a}x = ${c - a * b}.`,
          `Divide both sides by ${a}: x = ${x}.`,
          `Check: ${a}(${x} + ${b}) = ${a}(${x + b}) = ${c}.`
        ],
        commonMisconceptions: ['EQ-DISTRIB-PARTIAL', 'EQ-UNILATERAL-OP'],
        diagnosticQuestions: [`Did you multiply both x and ${b} by ${a}?`],
        recoveryQuestions: ['q-distrib-01'],
        isTransferQuestion: false,
        isGenerated: true,
        templateId: 'tpl-distrib'
      };
    }
  },

  // 4. ax + b = cx + d (Variables on Both Sides)
  {
    id: 'tpl-both-sides',
    name: 'Variables on Both Sides (ax + b = cx + d)',
    category: 'VARIABLES_BOTH_SIDES',
    difficulty: 'hard',
    generate: () => {
      const c = getRandomInt(2, 5);
      const diff = getRandomInt(2, 4);
      const a = c + diff; // Ensures a > c so diff > 0
      const x = getRandomInt(2, 8);
      const b = getRandomInt(2, 10);
      const d = diff * x + b;

      // Verification check: a*x + b === c*x + d
      if (a * x + b !== c * x + d) {
        throw new Error('Randomizer math check failed');
      }

      const equation = `${a}x + ${b} = ${c}x + ${d}`;
      return {
        id: `gen-both-${Date.now()}-${getRandomInt(100, 999)}`,
        subject: 'Mathematics',
        topic: 'Linear Equations',
        subtopic: 'Variables on Both Sides',
        difficulty: 'hard',
        category: 'VARIABLES_BOTH_SIDES',
        concept: 'linear_equations',
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        question: `Solve for x: ${equation}`,
        equation,
        prompt: `Solve for x: ${equation}. Group variables and constants symmetrically.`,
        instructions: 'Subtract variable terms from one side and constants from the other.',
        expectedAnswer: `x = ${x}`,
        expectedFinalAnswer: `x = ${x}`,
        referenceSolutionSteps: [
          `Subtract ${c}x from both sides: ${diff}x + ${b} = ${d}.`,
          `Subtract ${b} from both sides: ${diff}x = ${d - b}.`,
          `Divide both sides by ${diff}: x = ${x}.`,
          `Check: ${a}(${x}) + ${b} = ${a * x + b} and ${c}(${x}) + ${d} = ${c * x + d}.`
        ],
        commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
        diagnosticQuestions: [`How do you eliminate ${c}x from the right side?`],
        recoveryQuestions: ['q-both-01'],
        isTransferQuestion: false,
        isGenerated: true,
        templateId: 'tpl-both-sides'
      };
    }
  },

  // 5. One-Step ax = c
  {
    id: 'tpl-one-step-mul',
    name: 'One-Step Multiplication (ax = c)',
    category: 'ONE_STEP',
    difficulty: 'easy',
    generate: () => {
      const a = getRandomInt(3, 9);
      const x = getRandomInt(3, 12);
      const c = a * x;

      const equation = `${a}x = ${c}`;
      return {
        id: `gen-one-${Date.now()}-${getRandomInt(100, 999)}`,
        subject: 'Mathematics',
        topic: 'Linear Equations',
        subtopic: 'One-Step Equations',
        difficulty: 'easy',
        category: 'ONE_STEP',
        concept: 'linear_equations',
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        question: `Solve for x: ${equation}`,
        equation,
        prompt: `Solve for x: ${equation}. Articulate your complete mathematical reasoning step-by-step.`,
        instructions: 'State the inverse operation applied to isolate the variable.',
        expectedAnswer: `x = ${x}`,
        expectedFinalAnswer: `x = ${x}`,
        referenceSolutionSteps: [
          `Divide both sides by ${a}: x = ${c} / ${a}.`,
          `Simplify: x = ${x}.`,
          `Check: ${a}(${x}) = ${c}.`
        ],
        commonMisconceptions: ['EQ-INVERSE-OP-ERR', 'EQ-UNILATERAL-OP'],
        diagnosticQuestions: [`How do you invert multiplication by ${a}?`],
        recoveryQuestions: ['q-one-03'],
        isTransferQuestion: false,
        isGenerated: true,
        templateId: 'tpl-one-step-mul'
      };
    }
  }
];

export function generateRandomizedQuestion(
  templateId?: string,
  difficulty?: 'easy' | 'medium' | 'hard'
): Question {
  let candidates = QUESTION_TEMPLATES;
  if (templateId) {
    candidates = candidates.filter(t => t.id === templateId);
  } else if (difficulty) {
    candidates = candidates.filter(t => t.difficulty === difficulty);
  }

  if (candidates.length === 0) {
    candidates = QUESTION_TEMPLATES;
  }

  const selectedTemplate = candidates[Math.floor(Math.random() * candidates.length)];
  return selectedTemplate.generate();
}
