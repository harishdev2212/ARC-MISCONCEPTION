import { GoogleGenAI } from '@google/genai';
import { 
  DialogueTurn, 
  InterventionType, 
  InterventionLevel, 
  DiagnosisCategory, 
  DiagnosticResult, 
  Diagnosis, 
  Intervention, 
  LearningSession, 
  StructuredRespondResponse,
  SocraticEvaluationClassification,
  ReflectUIState
} from '@shared/types';
import { GeminiDiagnosticEngine, DiagnosticError } from './diagnosticEngine';
import { LearnerStateManager } from './learnerStateManager';

import { selectSocraticQuestion } from '../data/reference/socraticQuestionBank';
import { MISCONCEPTION_TAXONOMY } from '../data/reference/misconceptionTaxonomy';

export interface SocraticEvaluationResult {
  persists: boolean;
  understandingDetected: boolean;
  diagnosis: DiagnosisCategory;
  confidence: number;
  evidence: string;
  affectedSkill: string;
  classification: SocraticEvaluationClassification;
  understandingMessage?: string;
  missingAspect?: string;
  nextQuestion?: string;
  reflectUIState: ReflectUIState;
}

export interface GeneratedInterventionWording {
  text: string;
  hintPrompt?: string;
  isFallback: boolean;
  questionBankId?: string;
}

// ============================================================================
// Deterministic Fallback Ontology
// Ensures the dialogue engine never breaks if the LLM is unreachable or throttled.
// ============================================================================
interface FallbackContent {
  level1Probe: { text: string; hintPrompt: string };
  level2Hint: { text: string; hintPrompt: string };
  level3Explanation: { text: string; hintPrompt: string };
}

const FALLBACK_ONTOLOGY: Record<string, FallbackContent> = {
  // 1. Unilateral Operation / Equation Balance
  properties_of_equality: {
    level1Probe: {
      text: "Good — let's examine that step. If you change one side of an equation, what must happen to the other side to keep it balanced?",
      hintPrompt: "An equals sign represents a balanced scale. Any change to one side affects the whole balance."
    },
    level2Hint: {
      text: "Think of the equation as a balance scale. If the same amount is removed from one side, what should happen on the other side?",
      hintPrompt: "Both pans must undergo identical operations so neither side becomes heavier or lighter."
    },
    level3Explanation: {
      text: "An equation represents two equal quantities. When you subtract a value from one side, you must subtract that exact same value from the other side as well; otherwise, the equality changes.",
      hintPrompt: "Principle: If A = B, then A - c = B - c. Applying operations unilaterally breaks equality."
    }
  },

  // 2. Incomplete Distribution
  distributive_property: {
    level1Probe: {
      text: "Take a close look at the factor outside the parentheses. Does the multiplier apply only to the variable, or to every term inside the group?",
      hintPrompt: "Consider what grouping parentheses mean when preceded by a coefficient."
    },
    level2Hint: {
      text: "Remember that multiplying a group like 3(x + 4) means multiplying both the x and the 4 by 3. What do you get when 3 multiplies the 4?",
      hintPrompt: "Think of 3(x + 4) as (x + 4) + (x + 4) + (x + 4). What do the constant terms sum to?"
    },
    level3Explanation: {
      text: "The distributive property states that a(b + c) = ab + ac. Every term inside the parentheses must be multiplied by the outside factor. In 3(x + 4), 3 multiplies both x and 4, giving 3x + 12.",
      hintPrompt: "Always multiply each term inside the parentheses by the coefficient before combining terms."
    }
  },

  // 3. Sign Inversion Failure
  inverse_operations: {
    level1Probe: {
      text: "When moving a term across the equals sign, what inverse operation cancels it on the original side?",
      hintPrompt: "Ask yourself what operation undos addition, and what undos multiplication."
    },
    level2Hint: {
      text: "To undo addition, you use subtraction; to undo multiplication, you use division. What is the opposite of the operation currently applied?",
      hintPrompt: "Inverse operations reverse the original transformation to leave the variable isolated."
    },
    level3Explanation: {
      text: "Terms cannot simply change sides. We apply the inverse operation equally to both sides to cancel terms on one side and preserve equality.",
      hintPrompt: "If a term is +8, we subtract 8 from both sides. It does not stay +8 when relocated."
    }
  },

  // 4. Combining Unlike Terms
  combining_like_terms: {
    level1Probe: {
      text: "Can a term with an unknown variable like 2x be directly combined with a constant number like 4?",
      hintPrompt: "Look at the unit: 2x represents two unknown variables, while 4 represents four constant units."
    },
    level2Hint: {
      text: "Think of 2x as two unknown quantities and 4 as four single units. We can only combine like terms with like terms.",
      hintPrompt: "Only terms with identical variable parts can have their coefficients added together."
    },
    level3Explanation: {
      text: "Variable terms and constant numbers represent fundamentally different quantities. They cannot be combined into a single term without knowing the value of the variable.",
      hintPrompt: "Keep variable terms and constants separate until isolated on opposite sides."
    }
  },

  // Default / General
  general: {
    level1Probe: {
      text: "Take a step back and examine your reasoning. What was the exact mathematical rule or balance you intended to apply in this step?",
      hintPrompt: "Verify how each operation preserves the truth of the original equation."
    },
    level2Hint: {
      text: "Consider the inverse operation needed to isolate the unknown variable. Does your operation leave both sides equivalent?",
      hintPrompt: "Focus on isolating the variable step by step using inverse operations on both sides."
    },
    level3Explanation: {
      text: "To solve any linear equation, isolate the variable by performing identical inverse operations on both sides of the equals sign until the variable is isolated with a coefficient of 1.",
      hintPrompt: "Always maintain bilateral equivalence at every transformation step."
    }
  }
};

/**
 * Phase 2B Adaptive Socratic Dialogue Engine
 * 
 * Cleanly separates:
 * 1. DIAGNOSIS (evaluating reasoning and re-diagnosing follow-up responses)
 * 2. PEDAGOGICAL POLICY (deterministic level escalation based on evidence: Probe -> Hint -> Explanation)
 * 3. NATURAL-LANGUAGE GENERATION (Gemini-generated Socratic dialogue with deterministic fallback)
 */
export class SocraticDialogueEngine {
  private diagnosticEngine: GeminiDiagnosticEngine;
  private client: GoogleGenAI | null = null;
  private modelName: string;
  private forceFallback: boolean = false;

  constructor(diagnosticEngine?: GeminiDiagnosticEngine, forceFallback: boolean = false) {
    this.diagnosticEngine = diagnosticEngine || new GeminiDiagnosticEngine();
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
    this.forceFallback = forceFallback;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!forceFallback && apiKey && apiKey.trim().length > 0) {
      this.client = new GoogleGenAI({ apiKey });
    }
  }

  private getClient(): GoogleGenAI | null {
    if (this.forceFallback) return null;
    if (!this.client) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey.trim().length > 0) {
        this.client = new GoogleGenAI({ apiKey });
      }
    }
    return this.client;
  }

  /**
   * Generates EXACTLY ONE targeted initial Socratic question grounded in the student's specific mistake.
   * NO generic tips or advice.
   */
  async generateTargetedInitialQuestion(params: {
    equation: string;
    diagnosis: DiagnosisCategory;
    affectedSkill: string;
    evidence: string;
    studentReasoning: string;
  }): Promise<{ question: string; isFallback: boolean }> {
    const { equation, diagnosis, affectedSkill, evidence, studentReasoning } = params;

    const client = this.getClient();
    if (client) {
      try {
        const prompt = `You are the MindTrace Socratic Tutor for Multi-Topic Mathematics.
PROBLEM / EQUATION: ${equation}
STUDENT REASONING: "${studentReasoning}"
DIAGNOSED MISCONCEPTION: ${affectedSkill} (${diagnosis})
EVIDENCE OF MISTAKE: "${evidence}"

TASK: Generate EXACTLY ONE targeted Socratic question that makes the student reason about their specific mistake.

CRITICAL CONSTRAINTS:
1. Directly reference the specific problem, numbers, and the student's reasoning (e.g. if the student forgot to distribute in 2(x + 3), ask: "When you multiply 2 by (x + 3), which terms should the 2 multiply?").
2. If the student confused numerator and denominator, ask: "What does the denominator represent in this fraction?"
3. If the student applied an operation to only one side, ask: "What happens to the equality if the same operation isn't applied to both sides?"
4. If the student confused favorable vs total outcomes, ask: "In this event, how many total possible outcomes are there versus favorable outcomes?"
5. DO NOT provide any generic tips, hints, answers, or general advice (NEVER say "Can you check your work?", "Think about it again", "Here's a tip").
6. Ask ONLY ONE focused question.

Return strictly valid JSON:
{
  "question": "The single targeted Socratic question"
}`;

        const candidateList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        const modelsToTry = [this.modelName, ...candidateList.filter(m => m !== this.modelName)];
        for (const currentModel of modelsToTry) {
          try {
            const resp = await client.models.generateContent({
              model: currentModel,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
            const text = resp.text;
            if (text && text.trim().length > 0) {
              const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.question && parsed.question.trim().length > 0) {
                return { question: parsed.question.trim(), isFallback: false };
              }
            }
          } catch (modelErr: any) {
            if (modelErr?.status === 429 || modelErr?.message?.includes('quota')) continue;
            throw modelErr;
          }
        }
      } catch (err: any) {
        console.warn('[REFLECT] Gemini initial question generation fell back:', err?.message);
      }
    }

    return {
      question: this.getDeterministicTargetedQuestion(equation, affectedSkill, studentReasoning, evidence),
      isFallback: true
    };
  }

  getDeterministicTargetedQuestion(
    equation: string,
    affectedSkill: string,
    studentReasoning: string,
    evidence: string
  ): string {
    const combined = `${studentReasoning} ${evidence} ${affectedSkill}`.toLowerCase();

    // Check against taxonomy tags first
    for (const [tag, item] of Object.entries(MISCONCEPTION_TAXONOMY)) {
      if (combined.includes(tag.toLowerCase()) || combined.includes(item.name.toLowerCase())) {
        return item.socraticProbe;
      }
    }

    if (combined.includes('distrib') || affectedSkill === 'distributive_property') {
      const match = equation.match(/(\d+)\s*\(\s*([a-zA-Z])\s*([+-])\s*(\d+)\s*\)/);
      if (match) {
        return `When you multiply ${match[1]} by (${match[2]} ${match[3]} ${match[4]}), which terms should the ${match[1]} multiply?`;
      }
      return 'When multiplying across parentheses, which terms inside must be multiplied by the outside factor?';
    }

    if (combined.includes('denominator') || combined.includes('fraction')) {
      if (combined.includes('add') || combined.includes('common')) {
        return 'What does the denominator represent in a fraction, and why must denominators match before you can add the parts?';
      }
      return 'What does the denominator represent in this fraction?';
    }

    if (combined.includes('outcome') || combined.includes('probability')) {
      return 'In this event, how many total possible outcomes are there versus favorable outcomes?';
    }

    if (combined.includes('angle') || combined.includes('triangle')) {
      if (combined.includes('complement') || combined.includes('supplement')) {
        return 'What is the defined sum for two angles that are complementary versus two angles that are supplementary?';
      }
      return 'What theorem relates the interior and exterior angle relationships in this figure?';
    }

    if (combined.includes('mean') || combined.includes('average')) {
      return 'When calculating the mean of groups with different numbers of items, can you simply average the averages?';
    }

    if (combined.includes('median')) {
      return 'Before finding the middle value of a data set to determine the median, what must you do to the numbers first?';
    }

    if (combined.includes('sine') || combined.includes('cosine') || combined.includes('trig')) {
      return 'Relative to angle θ, what is the exact definition of sine, cosine, and tangent in terms of opposite, adjacent, and hypotenuse?';
    }

    if (combined.includes('balance') || combined.includes('equality') || affectedSkill === 'properties_of_equality' || combined.includes('unilateral')) {
      const subMatch = combined.match(/(?:subtract(?:ed)?|minus|-)\s*(\d+)/i) || equation.match(/[+-]\s*(\d+)/);
      const num = subMatch ? subMatch[1] : '8';
      return `What happens to the equality if the same operation isn't applied to both sides? If you subtract ${num} from one side, what must you do to the other?`;
    }

    if (affectedSkill === 'inverse_operations' || combined.includes('inverse')) {
      const addMatch = combined.match(/(?:add(?:ed)?|plus|\+)\s*(\d+)/i) || equation.match(/\+\s*(\d+)/);
      if (addMatch) {
        return `To undo adding ${addMatch[1]} on the left side, what inverse operation must you apply to both sides?`;
      }
      return 'What inverse operation is needed to cancel that term on both sides of the equation?';
    }

    if (affectedSkill === 'combining_like_terms' || combined.includes('unlike')) {
      return 'Can a variable term like 2x be directly combined with a constant number like 4? Why or why not?';
    }

    return 'What happens to the equality if the same operation isn\'t applied to both sides?';
  }

  /**
   * Re-evaluates student reflection answer in Socratic dialogue.
   * Classifies as CORRECT, PARTIAL, or INCORRECT.
   * Generates ONE targeted follow-up for PARTIAL or ONE simpler question for INCORRECT.
   * Enforces max 1 follow-up / 1 simpler question.
   */
  async evaluateReflectionAnswer(params: {
    question: string;
    expectedAnswer: string;
    previousDiagnosis: Diagnosis | DiagnosticResult;
    previousInterventionText: string;
    studentResponse: string;
    concept?: string;
    attemptNumber?: number;
  }): Promise<SocraticEvaluationResult> {
    const {
      question,
      expectedAnswer,
      previousDiagnosis,
      previousInterventionText,
      studentResponse,
      concept = 'linear_equations',
      attemptNumber = 1
    } = params;

    const trimmedResponse = studentResponse.trim();
    const lower = trimmedResponse.toLowerCase();
    const prevSkill = previousDiagnosis.affectedSkill || 'properties_of_equality';
    const diagCategory = (previousDiagnosis as any).diagnosis || 'procedural_error';
    const prevEvidence = previousDiagnosis.evidence || 'Initial reasoning error';

    // 1. Fast-path & heuristic analysis
    // Heuristic 1: Explicit demonstration of balance / correct reasoning
    const bilateralSignals = [
      'both sides',
      'both side',
      'to both',
      'from both',
      'subtract 8 from both',
      'subtract 8 from 29',
      'subtract from both sides',
      'balance both sides',
      'keep both sides balanced',
      'same thing to both',
      'same to both sides',
      'same to the other side',
      'subtract from 29',
      'subtract 8 on the right',
      'subtract 8 from right',
      '29 - 8',
      '21',
      '3x = 21',
      'multiply 4 too',
      'multiply both',
      '3 times 4',
      '3x + 12',
      'distribute to both',
      'add 5 to both sides',
      'same operation to both'
    ];

    const hasBilateral = bilateralSignals.some(s => lower.includes(s));

    // Heuristic 2: Partial understanding (mentions modifying other side/29/right, but not full operation)
    const partialSignals = [
      'other side',
      'the other side',
      'right side',
      'the right side',
      'change 29',
      'change the 29',
      'to 29',
      'from 29',
      'do something to 29',
      'do something to the right',
      'affects 29',
      'change both',
      'change the right',
      'modify the other side'
    ];
    const hasPartial = partialSignals.some(s => lower.includes(s));

    // Heuristic 3: Defending unilateral change or "I don't know"
    const unilateralSignals = [
      'only left',
      'only the left',
      'only change the',
      'only change 8',
      'only side with 8',
      'only the side with the 8',
      'only the side with x',
      'dont touch 29',
      "don't touch 29",
      'leave 29',
      'leave the 29',
      'keep 29',
      'leave 4',
      'nothing',
      'leave it alone',
      'dont do anything',
      'idk',
      "i don't know",
      'i dont know',
      'not sure',
      'no idea'
    ];
    const hasUnilateral = unilateralSignals.some(s => lower.includes(s));

    let finalResult: SocraticEvaluationResult | null = null;

    // 2. Try Gemini AI Evaluation
    const client = this.getClient();
    if (client) {
      try {
        const prompt = `You are the MindTrace Socratic Evaluator for Mathematics (Algebra > Linear Equations).
PROBLEM EQUATION: ${question}
DIAGNOSED MISCONCEPTION: ${prevSkill} (${diagCategory})
EVIDENCE OF INITIAL MISTAKE: "${prevEvidence}"
SOCRATIC QUESTION ASKED: "${previousInterventionText}"
STUDENT'S REFLECTION ANSWER: "${trimmedResponse}"
ATTEMPT: ${attemptNumber} (Maximum allowed: 2)

EVALUATION TASK:
Classify the student's reflection answer into EXACTLY ONE category:
1. "CORRECT" — The student clearly understands and explains the required principle (e.g. explicitly recognizes that whatever is done to one side must be done to the other side to keep the equation balanced, or states the exact balanced operation like subtracting 8 from both sides / from 29).
2. "PARTIAL" — The student shows some correct intuition or awareness (e.g. mentions the right side or 29 or changing both), but does NOT state the specific operation or leaves out what operation to perform.
3. "INCORRECT" — The student defends their error, repeats the mistake, gives an erroneous operation, says "nothing", says they don't know, or shows no understanding of balance.

GENERATION REQUIREMENTS:
- If "CORRECT":
  "understandingMessage": "You correctly identified that both sides of an equation must remain balanced."
  "nextQuestion": null
- If "PARTIAL":
  "missingAspect": What specific part is missing from their reasoning.
  "nextQuestion": EXACTLY ONE targeted follow-up question addressing ONLY the missing aspect. Ground it in the numbers/equation (e.g. "If you subtracted 8 from the left side, what exact operation must you do to 29 on the right side?"). DO NOT give hints or answers.
- If "INCORRECT":
  "nextQuestion": EXACTLY ONE simpler guiding question (e.g. an intuitive balance scale metaphor or intuitive comparison) without revealing the answer. DO NOT give generic tips like "Can you check your work?".

Return strictly valid JSON matching schema:
{
  "classification": "CORRECT" | "PARTIAL" | "INCORRECT",
  "confidence": number,
  "evidence": string,
  "understandingMessage": string | null,
  "missingAspect": string | null,
  "nextQuestion": string | null
}`;

        const candidateList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        const modelsToTry = [this.modelName, ...candidateList.filter(m => m !== this.modelName)];
        for (const currentModel of modelsToTry) {
          try {
            const resp = await client.models.generateContent({
              model: currentModel,
              contents: prompt,
              config: { responseMimeType: 'application/json' }
            });
            const text = resp.text;
            if (text && text.trim().length > 0) {
              const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
              const parsed = JSON.parse(cleaned);
              const classification: SocraticEvaluationClassification = 
                parsed.classification === 'CORRECT' ? 'CORRECT' :
                parsed.classification === 'PARTIAL' ? 'PARTIAL' : 'INCORRECT';

              const isCorrect = classification === 'CORRECT';
              const isMaxAttempt = attemptNumber >= 2;

              let reflectUIState: ReflectUIState = 'REFLECT_QUESTION';
              if (isCorrect) {
                reflectUIState = 'REFLECT_CORRECT';
              } else if (isMaxAttempt) {
                reflectUIState = 'REFLECT_COMPLETE';
              } else if (classification === 'PARTIAL') {
                reflectUIState = 'REFLECT_PARTIAL';
              } else {
                reflectUIState = 'REFLECT_INCORRECT';
              }

              finalResult = {
                classification,
                understandingDetected: isCorrect,
                persists: !isCorrect,
                diagnosis: isCorrect ? 'correct_reasoning' : diagCategory,
                confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.95,
                evidence: parsed.evidence || `Evaluated reflection: "${trimmedResponse}"`,
                affectedSkill: prevSkill,
                understandingMessage: isCorrect 
                  ? (parsed.understandingMessage || "You correctly identified that both sides of an equation must remain balanced.") 
                  : (isMaxAttempt ? (parsed.understandingMessage || "To keep an equation balanced, any operation applied to one side must be applied equally to the other side.") : undefined),
                missingAspect: parsed.missingAspect || undefined,
                nextQuestion: isCorrect || isMaxAttempt ? undefined : (parsed.nextQuestion || (classification === 'PARTIAL' ? "If you subtracted 8 from the left side, what exact operation must you do to 29 on the right side?" : "Think of an equation as a balance scale with equal weights on both sides. If you remove 8 from only the left side, what happens to the balance of the scale?")),
                reflectUIState
              };
              break;
            }
          } catch (modelErr: any) {
            if (modelErr?.status === 429 || modelErr?.message?.includes('quota')) continue;
            throw modelErr;
          }
        }
      } catch (aiErr: any) {
        console.warn('[REFLECT] AI evaluation fell back to deterministic heuristic:', aiErr?.message);
      }
    }

    // 3. Deterministic Heuristic Fallback
    if (!finalResult) {
      if (hasBilateral) {
        finalResult = {
          classification: 'CORRECT',
          understandingDetected: true,
          persists: false,
          diagnosis: 'correct_reasoning',
          confidence: 0.98,
          evidence: `The student recognized the balanced principle: "${trimmedResponse}".`,
          affectedSkill: prevSkill,
          understandingMessage: "You correctly identified that both sides of an equation must remain balanced.",
          reflectUIState: 'REFLECT_CORRECT'
        };
      } else if (hasPartial && !hasUnilateral) {
        const isMaxAttempt = attemptNumber >= 2;
        finalResult = {
          classification: 'PARTIAL',
          understandingDetected: false,
          persists: true,
          diagnosis: diagCategory,
          confidence: 0.92,
          evidence: `Student showed partial understanding of balance: "${trimmedResponse}".`,
          affectedSkill: prevSkill,
          missingAspect: "Recognized the other side must be modified, but did not specify the exact operation.",
          nextQuestion: isMaxAttempt ? undefined : "If you subtracted 8 from the left side, what exact operation must you do to 29 on the right side?",
          understandingMessage: isMaxAttempt ? "Remember: In an equation, whatever operation is applied to one side must be applied equally to the other side." : undefined,
          reflectUIState: isMaxAttempt ? 'REFLECT_COMPLETE' : 'REFLECT_PARTIAL'
        };
      } else {
        const isMaxAttempt = attemptNumber >= 2;
        finalResult = {
          classification: 'INCORRECT',
          understandingDetected: false,
          persists: true,
          diagnosis: diagCategory,
          confidence: 0.95,
          evidence: `Student reasoning continues demonstrating unilateral error or hesitation: "${trimmedResponse}".`,
          affectedSkill: prevSkill,
          nextQuestion: isMaxAttempt ? undefined : "Think of an equation as a balance scale with equal weights on both sides. If you remove 8 from only the left side, what happens to the balance of the scale?",
          understandingMessage: isMaxAttempt ? "Remember: In an equation, whatever operation is applied to one side must be applied equally to the other side." : undefined,
          reflectUIState: isMaxAttempt ? 'REFLECT_COMPLETE' : 'REFLECT_INCORRECT'
        };
      }
    }

    // Requirement 15: Development Mode Logging
    console.log(`[REFLECT_DEV_LOG] ========================================`);
    console.log(`[REFLECT_DEV_LOG] Diagnosis: ${finalResult.diagnosis} (${finalResult.affectedSkill})`);
    console.log(`[REFLECT_DEV_LOG] Generated Question: "${finalResult.nextQuestion || previousInterventionText}"`);
    console.log(`[REFLECT_DEV_LOG] Student Answer: "${trimmedResponse}"`);
    console.log(`[REFLECT_DEV_LOG] Evaluation Result: ${finalResult.classification}`);
    console.log(`[REFLECT_DEV_LOG] Next Reflection State: ${finalResult.reflectUIState}`);
    console.log(`[REFLECT_DEV_LOG] ========================================`);

    return finalResult;
  }

  /**
   * Backward-compatible alias for existing callers
   */
  async reDiagnoseStudentResponse(params: {
    question: string;
    expectedAnswer: string;
    previousDiagnosis: Diagnosis | DiagnosticResult;
    previousInterventionText: string;
    studentResponse: string;
    concept?: string;
  }): Promise<SocraticEvaluationResult> {
    return this.evaluateReflectionAnswer(params);
  }

  /**
   * Generates natural language Socratic intervention text based on the pedagogical policy.
   * Uses dynamic question bank with Gemini variety and strict deterministic fallback.
   */
  async generateSocraticIntervention(params: {
    concept: string;
    affectedSkill: string;
    interventionLevel: 1 | 2 | 3;
    interventionType: InterventionType;
    studentReasoning: string;
    previousInterventions?: string[];
    usedQuestionIds?: string[];
    equation?: string;
  }): Promise<GeneratedInterventionWording> {
    const {
      concept,
      affectedSkill,
      interventionLevel,
      interventionType,
      studentReasoning,
      previousInterventions = [],
      usedQuestionIds = [],
      equation = ''
    } = params;

    // 1. Select dynamic question from question bank
    const bankQ = selectSocraticQuestion({
      skill: affectedSkill,
      level: interventionLevel,
      usedQuestionIds,
      context: { equation, evidence: studentReasoning }
    });

    if (interventionType === 'RECOVERY_TEST') {
      return {
        text: "Exactly. You've recognized that both sides of an equation must be transformed equally to preserve balance. Let's test whether that idea transfers to a new problem.",
        hintPrompt: "Apply the identical balanced operation to both sides of the transfer question.",
        isFallback: false,
        questionBankId: 'recovery-trans'
      };
    }

    if (interventionType === 'POSITIVE_FEEDBACK') {
      return {
        text: "Excellent mathematical reasoning! Your steps preserve bilateral equality throughout. How can you verify that your solution is mathematically guaranteed?",
        hintPrompt: "Substitute your final answer back into the original equation to check equality.",
        isFallback: false,
        questionBankId: 'pos-feedback'
      };
    }

    // Attempt Gemini Generation
    const client = this.getClient();
    if (client) {
      try {
        const levelDirectives = {
          1: 'LEVEL 1 — SOCRATIC PROBE: Ask a focused, reflective question that prompts the student to inspect their own step. DO NOT give the answer.',
          2: 'LEVEL 2 — TARGETED HINT: Use an intuitive metaphor like a balance scale or counter-example. DO NOT directly solve the problem.',
          3: 'LEVEL 3 — CONCEPTUAL EXPLANATION: Explain the underlying algebraic principle clearly and step-by-step. Teach the concept, do not merely provide the final numerical value.'
        };

        const prompt = `You are the MindTrace Socratic Tutor for Mathematics (Algebra > Linear Equations).
PEDAGOGICAL TASK: Generate a pedagogical intervention for the student.

CONTEXT:
Concept: ${concept}
Diagnosed Skill Gap: ${affectedSkill}
Assigned Intervention Level: Level ${interventionLevel} (${interventionType})
Directive: ${levelDirectives[interventionLevel]}
Assigned Question Variety Goal: ${bankQ.type}
Example reference question style: "${bankQ.text}"
Student's Latest Words: "${studentReasoning}"
Previous Tutor Prompts (DO NOT REPEAT WORDS FROM THESE):
${previousInterventions.map(p => `- "${p}"`).join('\n') || '(None yet)'}

CONSTRAINTS:
1. Address the student's actual reasoning.
2. Tone: Encouraging, rigorous, Socratic, pedagogical.
3. NEVER reveal the final answer.
4. Output strictly valid JSON matching schema:
{
  "tutorMessage": "1-2 sentences of pedagogical reflection or explanation",
  "hintPrompt": "A 1-sentence memorable guiding principle"
}`;

        const candidateList = ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];
        const modelsToTry = [this.modelName, ...candidateList.filter(m => m !== this.modelName)];
        for (const currentModel of modelsToTry) {
          try {
            const resp = await client.models.generateContent({
              model: currentModel,
              contents: prompt,
              config: {
                responseMimeType: 'application/json'
              }
            });

            const text = resp.text;
            if (text && text.trim().length > 0) {
              const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
              const parsed = JSON.parse(cleaned);
              if (parsed.tutorMessage && parsed.tutorMessage.trim().length > 0) {
                return {
                  text: parsed.tutorMessage.trim(),
                  hintPrompt: parsed.hintPrompt?.trim() || bankQ.hintPrompt,
                  isFallback: false,
                  questionBankId: bankQ.id
                };
              }
            }
          } catch (modelErr: any) {
            if (modelErr?.status === 429 || modelErr?.message?.includes('quota')) {
              continue;
            }
            throw modelErr;
          }
        }
      } catch (genErr) {
        console.warn('[SOCRATIC] LLM generation failed or timed out. Using deterministic fallback:', (genErr as any)?.message);
      }
    }

    // Dynamic bank fallback
    return {
      text: bankQ.text,
      hintPrompt: bankQ.hintPrompt,
      isFallback: true,
      questionBankId: bankQ.id
    };
  }

  /**
   * Main multi-turn handler: processes a student's follow-up response in an active session.
   */
  async processFollowUpResponse(
    session: LearningSession,
    studentResponse: string,
    learnerStateManager: LearnerStateManager
  ): Promise<StructuredRespondResponse> {
    const trimmed = studentResponse.trim();
    const sessionId = session.id;
    const currentAttempt = (session.attemptCount || 1) + 1;

    // Previous state
    const previousDiag = session.currentDiagnosis || {
      id: `diag-${Date.now()}`,
      responseId: 'init',
      studentId: session.studentId,
      questionId: session.currentQuestion.id,
      isCorrect: false,
      diagnosis: 'procedural_error',
      confidence: 0.90,
      evidence: 'Initial reasoning error',
      affectedSkill: 'properties_of_equality',
      detectedErrors: [],
      evidenceSnippets: [],
      timestamp: new Date().toISOString(),
      status: 'ai_evaluated'
    };

    const previousInterventionText = session.currentIntervention?.socraticQuestion ||
      session.currentIntervention?.tutorMessage ||
      'How does your step affect both sides of the equation?';

    // 1. Evaluate reflection answer (CORRECT, PARTIAL, INCORRECT)
    // reflectionTurn is 1 on first reflection reply (initialTurn in history), 2 on follow-up reply
    const reflectionTurn = session.dialogueHistory ? session.dialogueHistory.length : 1;
    const evalResult = await this.evaluateReflectionAnswer({
      question: session.currentQuestion.equation || session.currentQuestion.prompt || session.currentQuestion.question || '',
      expectedAnswer: session.currentQuestion.expectedFinalAnswer || session.currentQuestion.expectedAnswer || '',
      previousDiagnosis: previousDiag,
      previousInterventionText,
      studentResponse: trimmed,
      concept: session.conceptId,
      attemptNumber: reflectionTurn
    });

    // 2. Determine next level and action based on classification & maximum attempts
    let nextLevel: 1 | 2 | 3 = session.interventionLevel || 1;
    let nextType: InterventionType = 'SOCRATIC_PROBE';
    let nextAction: 'WAIT_FOR_STUDENT' | 'TRANSFER_CHECK' = 'WAIT_FOR_STUDENT';
    let nextInterventionText = '';

    if (evalResult.classification === 'CORRECT' || evalResult.reflectUIState === 'REFLECT_CORRECT') {
      nextType = 'RECOVERY_TEST';
      nextAction = 'TRANSFER_CHECK';
      session.understandingDetected = true;
      session.misconceptionPersisting = false;
      session.recoveryTestRequired = true;
      nextInterventionText = evalResult.understandingMessage || 'You correctly identified that both sides of an equation must remain balanced.';
    } else if (evalResult.reflectUIState === 'REFLECT_COMPLETE') {
      // Reached maximum allowed attempts (1 initial + 1 follow-up/simpler)
      nextType = 'RECOVERY_TEST';
      nextAction = 'TRANSFER_CHECK';
      session.understandingDetected = true;
      session.misconceptionPersisting = false;
      session.recoveryTestRequired = true;
      nextInterventionText = evalResult.understandingMessage || 'To keep an equation balanced, any operation applied to one side must be applied equally to the other side. Let\'s practice this idea on a new problem.';
    } else if (evalResult.classification === 'PARTIAL') {
      nextLevel = 2;
      nextType = 'TARGETED_HINT';
      nextAction = 'WAIT_FOR_STUDENT';
      session.understandingDetected = false;
      session.misconceptionPersisting = true;
      nextInterventionText = evalResult.nextQuestion || 'If you change one side of an equation, what must you do to the other side to keep it balanced?';
    } else {
      // INCORRECT
      nextLevel = 2;
      nextType = 'TARGETED_HINT';
      nextAction = 'WAIT_FOR_STUDENT';
      session.understandingDetected = false;
      session.misconceptionPersisting = true;
      nextInterventionText = evalResult.nextQuestion || 'Think of an equation as a balance scale with equal weights on both sides. If you remove 8 from only the left side, what happens to the balance of the scale?';
    }

    // 3. Construct Dialogue Turn
    const turnId = `turn-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const turn: DialogueTurn = {
      id: turnId,
      attempt: currentAttempt,
      studentResponse: trimmed,
      diagnosis: evalResult.diagnosis,
      misconceptionCode: `EQ-${(evalResult.affectedSkill || 'procedural_error').toUpperCase().replace(/_/g, '-')}`,
      confidence: evalResult.confidence,
      evidence: evalResult.evidence,
      affectedSkill: evalResult.affectedSkill,
      interventionLevel: nextLevel,
      interventionType: nextType,
      interventionText: nextInterventionText,
      persists: evalResult.persists,
      understandingDetected: evalResult.understandingDetected,
      timestamp,
      isFallback: false,
      evaluationClassification: evalResult.classification,
      understandingMessage: evalResult.understandingMessage,
      missingAspect: evalResult.missingAspect,
      nextQuestion: evalResult.nextQuestion
    };

    // 4. Update session state
    if (!session.dialogueHistory) session.dialogueHistory = [];
    if (!session.studentResponses) session.studentResponses = [];
    if (!session.diagnosticHistory) session.diagnosticHistory = [];

    session.dialogueHistory.push(turn);
    session.studentResponses.push(trimmed);
    session.attemptCount = currentAttempt;
    session.interventionLevel = nextLevel;
    session.nextAction = nextAction;
    session.updatedAt = timestamp;
    session.understandingDetected = evalResult.understandingDetected;
    session.misconceptionPersisting = evalResult.persists;

    const levelMap: Record<1 | 2 | 3, InterventionLevel> = {
      1: 'level_1_socratic_question',
      2: 'level_2_counter_example',
      3: 'level_3_scaffolded_steps'
    };

    const newIntervention: Intervention = {
      id: `intv-${Date.now()}`,
      diagnosisId: previousDiag.id,
      studentId: session.studentId,
      level: levelMap[nextLevel],
      levelNumber: nextLevel,
      type: nextType,
      tutorMessage: nextInterventionText,
      socraticQuestion: nextInterventionText,
      requiresStudentResponse: nextAction === 'WAIT_FOR_STUDENT',
      timestamp,
      status: 'ai_generated'
    };
    session.currentIntervention = newIntervention;

    // 5. Persist to learner state manager
    learnerStateManager.recordDiagnosticEvent({
      id: `rec-${Date.now()}`,
      studentId: session.studentId,
      question: session.currentQuestion.equation || session.currentQuestion.prompt || session.currentQuestion.question || '',
      studentAnswer: '',
      studentReasoning: trimmed,
      concept: session.conceptId,
      diagnosis: evalResult.diagnosis,
      confidence: evalResult.confidence,
      evidence: evalResult.evidence,
      recommendedIntervention: nextLevel === 1 ? 'probe' : nextLevel === 2 ? 'hint' : 'explanation',
      timestamp,
      responseId: turnId,
      diagnosisId: previousDiag.id,
      interventionId: newIntervention.id
    });

    // 6. Return structured response matching requirements
    const misconceptionLabel = (evalResult.affectedSkill || 'Procedural Error')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return {
      success: true,
      diagnosis: {
        misconceptionCode: `EQ-${(evalResult.affectedSkill || 'MISCONCEPTION').toUpperCase().replace(/_/g, '-')}`,
        label: misconceptionLabel,
        confidence: evalResult.confidence,
        evidence: evalResult.evidence,
        persists: evalResult.persists,
        understandingDetected: evalResult.understandingDetected,
        evaluationClassification: evalResult.classification,
        understandingMessage: evalResult.understandingMessage,
        missingAspect: evalResult.missingAspect,
        nextQuestion: evalResult.nextQuestion,
        reflectUIState: evalResult.reflectUIState
      },
      intervention: {
        level: nextLevel,
        type: nextType,
        text: nextInterventionText,
        isFallback: false
      },
      session: {
        sessionId,
        attemptCount: currentAttempt,
        interventionLevel: nextLevel,
        nextAction,
        dialogueHistory: session.dialogueHistory,
        usedQuestionIds: session.usedQuestionIds || [],
        reflectUIState: evalResult.reflectUIState
      }
    };
  }
}
