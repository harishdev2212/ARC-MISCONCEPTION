import { MathImageExtractionResult, Question } from '@shared/types';
import { GeminiAdapter } from './geminiAdapter';
import { LINEAR_EQUATIONS_CONCEPT } from '../data/reference/curriculum';

export class VisionMathExtractor {
  private adapter: GeminiAdapter;

  constructor(adapter?: GeminiAdapter) {
    this.adapter = adapter || new GeminiAdapter();
  }

  /**
   * Extracts mathematical content from a base64 image (handwritten or printed).
   */
  async extractFromImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<MathImageExtractionResult> {
    try {
      console.log(`[VISION_EXTRACTOR] Processing math image input (mime: ${mimeType}, length: ${imageBase64.length})...`);
      
      const result = await this.adapter.extractMathematicalContentFromImage(imageBase64, mimeType);

      return {
        success: true,
        equation: result.equation,
        problemStatement: result.problemStatement || `Solve: ${result.equation}`,
        expectedAnswer: result.expectedAnswer,
        category: (result as any).category || 'Algebra',
        topic: (result as any).topic || 'Linear Equations in One Variable',
        concept: (result as any).concept || 'inverse_operations',
        difficulty: (result as any).difficulty || 'medium',
        confidence: result.confidence,
        isHandwritten: result.isHandwritten,
        needsConfirmation: result.needsConfirmation,
        notes: result.notes
      };
    } catch (err: any) {
      console.error('[VISION_EXTRACTOR] Vision extraction failure:', err?.code || 'UNKNOWN', err?.message || err);

      // Student-friendly message without internal/developer jargon
      return {
        success: false,
        equation: '',
        confidence: 0,
        isHandwritten: false,
        needsConfirmation: true,
        error: {
          code: 'VISION_UNAVAILABLE',
          message: "I couldn't read part of the equation clearly. Please retake the photo."
        }
      };
    }
  }

  /**
   * Converts a confirmed extracted equation into a complete Question object ready for practice.
   */
  createQuestionFromConfirmedEquation(
    equation: string,
    problemStatement?: string,
    expectedAnswer?: string,
    category: string = 'Algebra',
    topic: string = 'Linear Equations in One Variable',
    concept: string = 'linear_equations',
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Question {
    const cleanEquation = equation.trim();
    const prompt = problemStatement || `Solve: ${cleanEquation}`;
    const expAnswer = expectedAnswer || 'x';

    return {
      id: `q-vision-${Date.now()}`,
      subject: 'Mathematics',
      category,
      topic,
      subtopic: 'Uploaded Problem',
      difficulty,
      concept,
      concepts: [concept, 'mathematical_reasoning'],
      misconceptionTags: ['conceptual_misconception', 'procedural_error'],
      conceptId: LINEAR_EQUATIONS_CONCEPT.id,
      question: prompt,
      equation: cleanEquation,
      prompt: `${prompt}. Articulate your complete mathematical reasoning step-by-step.`,
      instructions: 'Show your steps clearly and explain your mathematical thinking.',
      expectedAnswer: expAnswer,
      expectedFinalAnswer: expAnswer,
      referenceSolutionSteps: [
        'Identify given values, variables, and relevant formulas.',
        'Apply mathematical principles and equivalence transformations.',
        'Solve step-by-step and verify the final result.'
      ],
      isTransferQuestion: false
    };
  }
}

export const visionExtractor = new VisionMathExtractor();
