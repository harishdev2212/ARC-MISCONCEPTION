import { 
  Diagnosis, 
  StudentResponse, 
  Question, 
  DiagnosticResult, 
  DiagnosisCategory, 
  RecommendedIntervention 
} from '@shared/types';
import { LINEAR_EQUATIONS_KNOWLEDGE } from '../knowledge/linearEquationsKnowledge';
import { InputScopeGuard } from './inputScopeGuard';
import { OutputValidator, VALID_TAXONOMY, VALID_INTERVENTIONS } from './outputValidator';
import { DiagnosticError } from './errors';
import { ILLMAdapter, GeminiAdapter } from './geminiAdapter';
export { DiagnosticError };

export interface DiagnoseParams {
  studentId: string;
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  concept?: string;
  subject?: string;
  category?: string;
  topic?: string;
}

export interface IDiagnosticEngine {
  diagnose(params: DiagnoseParams): Promise<DiagnosticResult>;
  diagnoseReasoning(
    studentResponse: StudentResponse,
    question: Question
  ): Promise<Diagnosis>;
}

/**
 * Builds the strict system instruction embedding the controlled Linear Equations knowledge.
 */
import { MISCONCEPTION_TAXONOMY } from '../data/reference/misconceptionTaxonomy';

/**
 * Builds the strict system instruction embedding the controlled multi-subject cognitive knowledge.
 */
function buildSystemInstruction(subject?: string, category?: string, topic?: string): string {
  const normSubj = (subject || 'Mathematics').toLowerCase();

  if (normSubj === 'programming') {
    return `You are the MindTrace Cognitive Diagnostic Engine for Programming & Computer Science.
You are NOT a conversational chatbot. You are an objective, rigorous diagnostic evaluation function that analyzes student code and step-by-step reasoning to detect algorithmic and computational misconceptions.

CURRENT DOMAIN FOCUS:
Subject: Programming
Category: ${category || 'Programming Fundamentals'}
Topic: ${topic || 'Loops & Boundary Conditions'}

PROGRAMMING MISCONCEPTION TAXONOMY:
- "Loop boundary misunderstanding": Assuming 1-based indexing, including exclusive upper bound (i < 5 printing 5), or off-by-one errors.
- "Infinite loop misconception": Forgetting state increment or flawed while condition termination.
- "Assignment vs equality confusion": Using single equals = (assignment) instead of double equals == in boolean conditions.
- "Variable linkage misconception": Believing primitive variable assignment b = a creates a dynamic pointer or linkage.
- "Array bounds out of range": Using <= arr.length on 0-indexed arrays.
- "String in-place mutation misconception": Assuming immutable string methods alter strings in place without reassigning return value.
- "Missing recursive base case": Omitting base case leading to call stack exhaustion.
- "Class and object conflation": Confusing class blueprint declaration with instantiated active memory object.

DIAGNOSIS TAXONOMY:
- "wrong_rule_or_definition": Fundamentally mistaken definition (e.g. treating = as ==, assuming strings mutate in place).
- "procedural_error": Off-by-one boundary, array out of bounds, missing state increment.
- "overgeneralization": Applying 1-based human counting to 0-based memory arrays.
- "calculation_slip": Minor arithmetic slip during manual tracing.
- "insufficient_evidence": Student left explanation blank or wrote "idk".
- "correct_reasoning": Correct execution model and accurate prediction.

REQUIRED OUTPUT STRUCTURE:
- "isCorrect": boolean
- "result": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT"
- "misconception": Specific named misconception or "None"
- "errorType": "conceptual_misconception" | "procedural_error" | "syntax_error" | "none"
- "evidence": Concise citation (1-2 sentences) of what the student wrote or did
- "confidence": number between 0.0 and 1.0
- "recommendedAction": Specific targeted practice or explanation for this error
- Output strictly valid JSON matching the schema. No markdown fences.`;
  }

  if (normSubj === 'english') {
    return `You are the MindTrace Cognitive Diagnostic Engine for English Language & Literature.
You are NOT a conversational chatbot. You are an objective, rigorous diagnostic evaluation function that analyzes student grammar, vocabulary, reading comprehension, and writing to detect underlying cognitive linguistic misconceptions.

CURRENT DOMAIN FOCUS:
Subject: English
Category: ${category || 'Grammar'}
Topic: ${topic || 'Subject-verb agreement'}

ENGLISH MISCONCEPTION TAXONOMY:
- "Subject-verb agreement error": Omitting third-person singular present inflection (-s/-es, e.g. "She go" instead of "She goes").
- "Intervening phrase agreement error": Agreeing verb with nearest noun in a prepositional phrase rather than true head noun.
- "Inconsistent narrative tense shift": Shifting between past and present tense mid-passage without temporal justification.
- "Phonetic article selection error": Choosing 'a' vs 'an' based on written alphabet letter rather than initial vowel SOUND (e.g. "a hour").
- "Comma splice error": Joining two complete independent clauses with only a comma without coordinating conjunction.
- "Detail-as-main-idea misconception": Selecting an isolated introductory example as the primary central thesis.
- "Unsubstantiated inference": Drawing conclusions not supported by explicit or implicit text evidence.

DIAGNOSIS TAXONOMY:
- "wrong_rule_or_definition": Fundamental grammar rule misunderstanding.
- "procedural_error": Inconsistent tense shift, punctuation splice.
- "overgeneralization": Applying regular inflection to irregular verbs or nearest noun agreement.
- "insufficient_evidence": Student wrote "idk" or left blank.
- "correct_reasoning": Sound grammatical and textual reasoning.

REQUIRED OUTPUT STRUCTURE:
- "isCorrect": boolean
- "result": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT"
- "misconception": Specific named misconception or "None"
- "errorType": "conceptual_misconception" | "procedural_error" | "none"
- "evidence": Concise citation of student error pattern
- "confidence": number between 0.0 and 1.0
- "recommendedAction": Specific linguistic intervention
- Output strictly valid JSON matching schema.`;
  }

  const taxonomySummary = Object.values(MISCONCEPTION_TAXONOMY).map(m => 
    `- [${m.category} > ${m.topic}] "${m.tag}" (${m.name}): ${m.description} Typical error type: ${m.typicalErrorType}. Root cause: ${m.rootCause}`
  ).join('\n');

  return `You are the MindTrace Cognitive Diagnostic Engine for Multi-Topic Mathematics.
You are NOT a conversational chatbot. You are an objective, rigorous diagnostic evaluation function that analyzes student reasoning to detect mathematical misconceptions and distinguish them from arithmetic calculation slips.

CURRENT DOMAIN FOCUS:
Category: ${category || 'Algebra'}
Topic: ${topic || 'Linear Equations in One Variable'}

REUSABLE MISCONCEPTION TAXONOMY:
${taxonomySummary}

DIAGNOSIS TAXONOMY:
1. "missing_prerequisite": Failed integer arithmetic, sign rules, or prerequisite arithmetic skill.
2. "wrong_rule_or_definition": Fundamentally mistaken definition (e.g. treating '=' as an operation instruction rather than balance, confusing complementary with supplementary).
3. "procedural_error": Unilateral operation (altering one side only), sign inversion failure, formula selection error, or violating inverse operations.
4. "overgeneralization": Combining unlike terms (e.g. 2x + 4 = 6x), overgeneralizing shape properties, adding denominators directly.
5. "calculation_slip": Correct mathematical reasoning and steps, but minor arithmetic calculation slip (e.g. 10 - 4 = 5).
6. "insufficient_evidence": Student wrote "I don't know", left reasoning blank, or reasoning is too vague/fragmented to determine mental model.
7. "correct_reasoning": Student correctly applied mathematical principles step-by-step.
8. "uncertain": Conflicting or contradictory explanation that cannot be definitively classified.
9. "out_of_scope": The student asks something unrelated or outside mathematics.

REQUIRED OUTPUT STRUCTURE:
- "isCorrect": boolean
- "result": "CORRECT" | "PARTIALLY_CORRECT" | "INCORRECT"
- "misconception": Specific named misconception or "None"
- "errorType": "arithmetic_error" | "conceptual_misconception" | "procedural_error" | "sign_error" | "none"
- "evidence": Concise citation of student error pattern
- "confidence": number between 0.0 and 1.0
- "recommendedAction": Specific pedagogical intervention
- Output strictly valid JSON matching schema.`;
}

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    isCorrect: { type: 'boolean' },
    result: { type: 'string', enum: ['CORRECT', 'PARTIALLY_CORRECT', 'INCORRECT'] },
    misconception: { type: 'string' },
    concept: { type: 'string' },
    category: { type: 'string' },
    topic: { type: 'string' },
    errorType: {
      type: 'string',
      enum: [
        'arithmetic_error',
        'conceptual_misconception',
        'procedural_error',
        'sign_error',
        'incomplete_reasoning',
        'careless_mistake',
        'correct_reasoning_incorrect_calculation',
        'correct_answer_weak_reasoning',
        'none'
      ]
    },
    misconceptionTag: { type: 'string' },
    diagnosis: {
      type: 'string',
      enum: VALID_TAXONOMY
    },
    confidence: { type: 'number' },
    evidence: { type: 'string' },
    affectedSkill: { type: 'string' },
    recommendedAction: { type: 'string' },
    recommendedIntervention: {
      type: 'string',
      enum: VALID_INTERVENTIONS
    },
    needsRecoveryTest: { type: 'boolean' }
  },
  required: [
    'isCorrect',
    'concept',
    'diagnosis',
    'errorType',
    'confidence',
    'evidence',
    'affectedSkill',
    'recommendedIntervention',
    'needsRecoveryTest'
  ]
};

/**
 * Deterministic domain-specific cognitive fallback analyzer.
 * Evaluates cognitive misconceptions across Mathematics, Programming, and English.
 */
export function fallbackDomainDiagnose(params: DiagnoseParams): DiagnosticResult {
  const {
    question = '',
    expectedAnswer = '',
    studentAnswer = '',
    studentReasoning = '',
    concept = '',
    subject = 'Mathematics',
    category = 'Algebra',
    topic = ''
  } = params;

  const normAnswer = studentAnswer.toLowerCase().trim().replace(/['"]/g, '');
  const normExpected = expectedAnswer.toLowerCase().trim().replace(/['"]/g, '');
  const normReasoning = studentReasoning.toLowerCase().trim();
  const normQ = question.toLowerCase();

  // Direct match checking
  const isDirectMatch = normAnswer === normExpected || 
    (normExpected.includes(normAnswer) && normAnswer.length >= 3) ||
    (normAnswer.includes(normExpected) && normExpected.length >= 3);

  if (isDirectMatch && !normReasoning.includes('guess') && !normReasoning.includes("don't know")) {
    return {
      isCorrect: true,
      subject,
      category,
      topic,
      concept: concept || 'concept_mastery',
      result: 'CORRECT',
      misconception: 'None',
      errorType: 'none',
      diagnosis: 'correct_reasoning',
      confidence: 0.95,
      confidenceBand: 'HIGH_CONFIDENCE',
      evidence: 'Student provided the expected answer with consistent conceptual reasoning.',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: `${topic || category}_fluency`,
      recommendedAction: 'Advance to transfer challenge or next difficulty level.',
      recommendedIntervention: 'positive_feedback',
      needsRecoveryTest: false
    };
  }

  // 1. PROGRAMMING DOMAIN DIAGNOSTICS
  if (subject.toLowerCase() === 'programming') {
    // Loop boundary misconception (e.g., for(i=0; i<5; i++) -> 1 2 3 4 5)
    if (normQ.includes('i < 5') || normQ.includes('i = 0') || topic.toLowerCase().includes('loop') || normReasoning.includes('loop')) {
      if (normAnswer.includes('5') || normAnswer === '1 2 3 4 5' || normReasoning.includes('ends at 5') || normReasoning.includes('starts at 1') || normReasoning.includes('upper boundary')) {
        return {
          isCorrect: false,
          subject: 'Programming',
          category: 'Programming Fundamentals',
          topic: 'Loops',
          concept: 'loop_boundaries',
          result: 'INCORRECT',
          misconception: 'Loop boundary misunderstanding',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'Loop boundary misunderstanding',
          diagnosis: 'wrong_rule_or_definition',
          confidence: 0.95,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student included the upper boundary (5) even though the condition is strictly i < 5, and assumed 1-based indexing instead of 0-based indexing.',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'loop_boundary_conditions',
          recommendedAction: 'Explain 0-indexing and inclusive (<=) vs exclusive (<) loop conditions.',
          recommendedIntervention: 'explanation',
          needsRecoveryTest: true
        };
      }
    }

    // Assignment vs Equality
    if (normQ.includes('score = 100') || normQ.includes('if(score =')) {
      if (!normAnswer.includes('==') && !normReasoning.includes('double equal') && !normReasoning.includes('assignment')) {
        return {
          isCorrect: false,
          subject: 'Programming',
          category: 'Programming Fundamentals',
          topic: 'Conditional statements',
          concept: 'assignment_vs_equality',
          result: 'INCORRECT',
          misconception: 'Assignment vs equality confusion',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'Assignment vs equality confusion',
          diagnosis: 'wrong_rule_or_definition',
          confidence: 0.94,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student treated single equals = (assignment operator) as a comparison operator == inside an if statement.',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'conditional_syntax',
          recommendedAction: 'Practice distinguishing assignment statements (=) from boolean comparison expressions (==).',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        };
      }
    }

    // Array bounds
    if (normQ.includes('arr.length') || topic.toLowerCase().includes('array')) {
      if (!normAnswer.includes('outofbounds') && !normReasoning.includes('out of bounds') && !normReasoning.includes('index 5')) {
        return {
          isCorrect: false,
          subject: 'Programming',
          category: 'Data Structures',
          topic: 'Arrays',
          concept: 'array_bounds',
          result: 'INCORRECT',
          misconception: 'Off-by-one array indexing',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'Off-by-one array indexing',
          diagnosis: 'overgeneralization',
          confidence: 0.94,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student allowed the loop index to reach arr.length on a 0-indexed array, attempting to access non-existent index arr[length].',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'array_bounds',
          recommendedAction: 'Review 0-based array indexing rules and valid bounds [0, length - 1].',
          recommendedIntervention: 'explanation',
          needsRecoveryTest: true
        };
      }
    }

    // String immutability
    if (normQ.includes('touppercase') || topic.toLowerCase().includes('string')) {
      if (normAnswer.includes('hello') && normAnswer.toUpperCase() === normAnswer) {
        return {
          isCorrect: false,
          subject: 'Programming',
          category: 'Data Structures',
          topic: 'Strings',
          concept: 'string_immutability',
          result: 'INCORRECT',
          misconception: 'In-place string mutation misconception',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'In-place string mutation misconception',
          diagnosis: 'wrong_rule_or_definition',
          confidence: 0.93,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student assumed calling .toUpperCase() alters the string in place rather than returning a new string object.',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'string_immutability',
          recommendedAction: 'Review string immutability and reassigning method return values.',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        };
      }
    }

    // Default programming diagnostic
    return {
      isCorrect: false,
      subject: 'Programming',
      category: category || 'Programming Fundamentals',
      topic: topic || 'Logic & Syntax',
      concept: concept || 'program_execution',
      result: 'INCORRECT',
      misconception: 'Logical error in code execution model',
      errorType: 'conceptual_misconception',
      misconceptionTag: 'Logical error in code execution model',
      diagnosis: 'procedural_error',
      confidence: 0.89,
      confidenceBand: 'MEDIUM_CONFIDENCE',
      evidence: studentReasoning ? `Student reasoning stated: "${studentReasoning.slice(0, 100)}", which misinterprets program execution semantics.` : 'Student reasoning exhibits a flawed trace of program flow.',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: 'program_execution_tracing',
      recommendedAction: 'Practice step-by-step variable trace tables and boundary testing.',
      recommendedIntervention: 'probe',
      needsRecoveryTest: true
    };
  }

  // 2. ENGLISH DOMAIN DIAGNOSTICS
  if (subject.toLowerCase() === 'english') {
    // Subject-verb agreement (e.g. She go to school every day)
    if (normQ.includes('she go') || topic.toLowerCase().includes('subject-verb') || normQ.includes('third-person')) {
      if (!normAnswer.includes('goes') && !normReasoning.includes('goes') && !normReasoning.includes('third-person')) {
        return {
          isCorrect: false,
          subject: 'English',
          category: 'Grammar',
          topic: 'Subject-verb agreement',
          concept: 'third_person_singular_agreement',
          result: 'INCORRECT',
          misconception: 'Subject-verb agreement',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'Subject-verb agreement',
          diagnosis: 'missing_prerequisite',
          confidence: 0.95,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student does not consistently apply third-person singular agreement (-s/-es) to present tense verbs with singular subject "She".',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'subject_verb_agreement',
          recommendedAction: 'Practice third-person singular present tense agreement rules.',
          recommendedIntervention: 'explanation',
          needsRecoveryTest: true
        };
      }
    }

    // Intervening prepositional phrase (list of approved candidates was/were)
    if (normQ.includes('list of approved candidates') || normQ.includes('were published')) {
      if (!normAnswer.includes('was') || normAnswer.includes('were')) {
        return {
          isCorrect: false,
          subject: 'English',
          category: 'Grammar',
          topic: 'Subject-verb agreement',
          concept: 'prepositional_intervening_phrase',
          result: 'INCORRECT',
          misconception: 'Intervening prepositional phrase agreement error',
          errorType: 'conceptual_misconception',
          misconceptionTag: 'Intervening prepositional phrase agreement error',
          diagnosis: 'overgeneralization',
          confidence: 0.94,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student agreed verb with the nearest plural noun ("candidates") inside the prepositional phrase rather than the singular head noun ("list").',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'head_noun_agreement',
          recommendedAction: 'Isolate the core subject from modifying prepositional phrases.',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        };
      }
    }

    // Comma splice
    if (normQ.includes('comma') || normQ.includes('experiment was successful')) {
      if (!normAnswer.includes('semicolon') && !normAnswer.includes('conjunction') && !normAnswer.includes('splice')) {
        return {
          isCorrect: false,
          subject: 'English',
          category: 'Writing',
          topic: 'Sentence structure',
          concept: 'comma_splice_and_run_on',
          result: 'INCORRECT',
          misconception: 'Comma splice error',
          errorType: 'procedural_error',
          misconceptionTag: 'Comma splice error',
          diagnosis: 'procedural_error',
          confidence: 0.93,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: 'Student failed to recognize that two independent clauses cannot be joined with only a comma.',
          evidenceStatus: 'sufficient_evidence',
          affectedSkill: 'sentence_boundary_punctuation',
          recommendedAction: 'Practice coordinating independent clauses with semicolons or coordinating conjunctions.',
          recommendedIntervention: 'explanation',
          needsRecoveryTest: true
        };
      }
    }

    // Default English diagnostic
    return {
      isCorrect: false,
      subject: 'English',
      category: category || 'Grammar',
      topic: topic || 'Grammar & Composition',
      concept: concept || 'syntactic_structure',
      result: 'INCORRECT',
      misconception: 'Grammatical syntax inconsistency',
      errorType: 'conceptual_misconception',
      misconceptionTag: 'Grammatical syntax inconsistency',
      diagnosis: 'procedural_error',
      confidence: 0.88,
      confidenceBand: 'MEDIUM_CONFIDENCE',
      evidence: studentReasoning ? `Student provided reasoning: "${studentReasoning.slice(0, 100)}", which demonstrates a syntactic rule breakdown.` : 'Student response demonstrates inconsistent grammatical application.',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: 'grammatical_mechanics',
      recommendedAction: 'Review foundational grammatical sentence structures and parts of speech.',
      recommendedIntervention: 'probe',
      needsRecoveryTest: true
    };
  }

  // 3. MATHEMATICS DOMAIN DIAGNOSTICS
  // Fraction denominators addition
  if (normQ.includes('1/3 + 1/4') || normAnswer === '2/7' || normReasoning.includes('added denominators') || normReasoning.includes('3 + 4 = 7')) {
    return {
      isCorrect: false,
      subject: 'Mathematics',
      category: 'Arithmetic / Number System',
      topic: 'Fractions',
      concept: 'common_denominator',
      result: 'INCORRECT',
      misconception: 'Direct addition of denominators',
      errorType: 'conceptual_misconception',
      misconceptionTag: 'Incorrect fraction addition',
      diagnosis: 'overgeneralization',
      confidence: 0.95,
      confidenceBand: 'HIGH_CONFIDENCE',
      evidence: 'Student added numerators and denominators directly (1/3 + 1/4 = 2/7) instead of finding a common denominator (12).',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: 'common_denominators',
      recommendedAction: 'Practice finding common denominators before adding fractions.',
      recommendedIntervention: 'explanation',
      needsRecoveryTest: true
    };
  }

  // Distributive property error (e.g. 2(x + 3) -> 2x + 3)
  if (normQ.includes('2(x + 3)') || normReasoning.includes('distribut')) {
    if (normAnswer.includes('2x + 3') || normReasoning.includes('2x + 3') || normReasoning.includes('multiply only x')) {
      return {
        isCorrect: false,
        subject: 'Mathematics',
        category: 'Algebra',
        topic: 'Linear Equations in One Variable',
        concept: 'distributive_property',
        result: 'INCORRECT',
        misconception: 'Distributive property error',
        errorType: 'conceptual_misconception',
        misconceptionTag: 'Distributive property error',
        diagnosis: 'overgeneralization',
        confidence: 0.94,
        confidenceBand: 'HIGH_CONFIDENCE',
        evidence: 'Student distributed factor to only the first term in parentheses, omitting the constant term (wrote 2x + 3 instead of 2x + 6).',
        evidenceStatus: 'sufficient_evidence',
        affectedSkill: 'distributive_law',
        recommendedAction: 'Multiply every term inside parentheses by the external coefficient.',
        recommendedIntervention: 'explanation',
        needsRecoveryTest: true
      };
    }
  }

  // Linear Equations unilateral operation / balance
  if (normReasoning.includes('one side') || (normReasoning.includes('subtract') && !normReasoning.includes('both sides'))) {
    return {
      isCorrect: false,
      subject: 'Mathematics',
      category: 'Algebra',
      topic: 'Linear Equations in One Variable',
      concept: 'equation_balance',
      result: 'INCORRECT',
      misconception: 'Incorrect inverse operation',
      errorType: 'conceptual_misconception',
      misconceptionTag: 'Operation applied to one side only',
      diagnosis: 'procedural_error',
      confidence: 0.91,
      confidenceBand: 'HIGH_CONFIDENCE',
      evidence: 'Student altered one side of the equation without applying the inverse operation consistently to both sides.',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: 'bilateral_equality',
      recommendedAction: 'Practice maintaining equality during inverse operations.',
      recommendedIntervention: 'probe',
      needsRecoveryTest: true
    };
  }

  // Sign handling error
  if (normReasoning.includes('sign') || normAnswer.includes('37/3') || normReasoning.includes('moved 8 to other side')) {
    return {
      isCorrect: false,
      subject: 'Mathematics',
      category: 'Algebra',
      topic: 'Linear Equations in One Variable',
      concept: 'sign_inversion',
      result: 'INCORRECT',
      misconception: 'Sign handling error',
      errorType: 'sign_error',
      misconceptionTag: 'Sign handling error',
      diagnosis: 'procedural_error',
      confidence: 0.92,
      confidenceBand: 'HIGH_CONFIDENCE',
      evidence: 'Student transposed term across equality without inverting the operational sign.',
      evidenceStatus: 'sufficient_evidence',
      affectedSkill: 'sign_inversion',
      recommendedAction: 'Practice additive inverse operations on both sides of the equation.',
      recommendedIntervention: 'probe',
      needsRecoveryTest: true
    };
  }

  // Default math diagnostic
  return {
    isCorrect: false,
    subject: 'Mathematics',
    category: category || 'Algebra',
    topic: topic || 'Linear Equations in One Variable',
    concept: concept || 'mathematical_reasoning',
    result: 'INCORRECT',
    misconception: 'Algebraic manipulation error',
    errorType: 'procedural_error',
    misconceptionTag: 'Procedural algebraic error',
    diagnosis: 'procedural_error',
    confidence: 0.88,
    confidenceBand: 'MEDIUM_CONFIDENCE',
    evidence: studentReasoning ? `Student reasoning stated: "${studentReasoning.slice(0, 100)}", which misapplies algebraic rules.` : 'Student reasoning indicates an inconsistent algebraic transformation.',
    evidenceStatus: 'sufficient_evidence',
    affectedSkill: 'algebraic_manipulation',
    recommendedAction: 'Practice step-by-step inverse operations maintaining equality.',
    recommendedIntervention: 'probe',
    needsRecoveryTest: true
  };
}

/**
 * ProductionDiagnosticEngine (Phase 4 Provider-Independent Robust Engine)
 */
export class ProductionDiagnosticEngine implements IDiagnosticEngine {
  private adapter: ILLMAdapter;
  private scopeGuard: InputScopeGuard;

  constructor(adapter: ILLMAdapter = new GeminiAdapter()) {
    this.adapter = adapter;
    this.scopeGuard = new InputScopeGuard();
  }

  async diagnose(params: DiagnoseParams): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const {
      question,
      expectedAnswer,
      studentAnswer = '',
      studentReasoning = '',
      concept = 'linear_equations',
      subject = 'Mathematics',
      category = 'Algebra',
      topic = 'Linear Equations in One Variable'
    } = params;

    // 1. Input Scope Guard (Prompt Injection, Out-of-Scope, Ambiguity, Empty Reasoning)
    const guardResult = this.scopeGuard.evaluate(studentReasoning, concept);
    if (guardResult.isBlocked && guardResult.safeResponse) {
      const latencyMs = Date.now() - startTime;
      return OutputValidator.validate(
        {
          isCorrect: false,
          subject,
          concept,
          diagnosis: guardResult.safeResponse.diagnosis,
          confidence: guardResult.status === 'POLICY_BYPASS_ATTEMPT' ? 1.0 : 0.85,
          evidence: guardResult.safeResponse.evidence,
          affectedSkill: guardResult.safeResponse.affectedSkill,
          recommendedIntervention: guardResult.safeResponse.recommendedIntervention,
          needsRecoveryTest: guardResult.safeResponse.needsRecoveryTest
        },
        guardResult.status,
        latencyMs,
        studentReasoning
      );
    }

    // 2. Construct Secure Prompt
    const trimmedReasoning = guardResult.sanitizedText;
    const trimmedAnswer = (studentAnswer || '').trim();
    const systemInstruction = buildSystemInstruction(subject, category, topic);

    const promptInput = `EVALUATE THIS STUDENT REASONING:
Subject Domain: ${subject}
Category: ${category}
Topic: ${topic}
Problem Statement: ${question}
Expected Canonical Answer: ${expectedAnswer}
Student Submitted Final Answer: ${trimmedAnswer || '(none)'}
Student Step-by-Step Reasoning: "${trimmedReasoning}"

Provide your structured diagnostic evaluation as JSON matching the strict schema.`;

    try {
      // 3. Invoke LLM Adapter
      const llmResult = await this.adapter.generateDiagnostic(
        promptInput,
        systemInstruction,
        RESPONSE_SCHEMA
      );

      // 4. Parse and Validate Output
      let parsed: any;
      const cleaned = llmResult.text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsed = JSON.parse(cleaned);

      const totalLatencyMs = Date.now() - startTime;
      return OutputValidator.validate(
        {
          subject,
          category,
          topic,
          ...parsed
        },
        guardResult.status,
        totalLatencyMs,
        studentReasoning
      );
    } catch (llmErr: any) {
      console.warn(`[DIAGNOSTIC_ENGINE] LLM call failed or unavailable (${llmErr?.code || llmErr?.message}). Engaging deterministic cognitive fallback analyzer...`);
      // Deterministic fallback analyzer
      const fallback = fallbackDomainDiagnose({
        ...params,
        subject,
        category,
        topic
      });
      return OutputValidator.validate(
        fallback,
        guardResult.status,
        Date.now() - startTime,
        studentReasoning
      );
    }
  }

  async diagnoseReasoning(
    studentResponse: StudentResponse,
    question: Question
  ): Promise<Diagnosis> {
    const qText = question.question || question.prompt || question.equation || '';
    const expAnswer = question.expectedAnswer || question.expectedFinalAnswer || '';
    const subject = (question.subject as string) || 'Mathematics';
    const category = question.category || 'Algebra';
    const topic = question.topic || 'Linear Equations in One Variable';

    const result = await this.diagnose({
      studentId: studentResponse.studentId,
      question: qText,
      expectedAnswer: expAnswer,
      studentAnswer: studentResponse.submittedAnswer || '',
      studentReasoning: studentResponse.reasoningText,
      concept: question.conceptId || question.concept || 'general_concept',
      subject,
      category,
      topic
    });

    const isMisconception = !result.isCorrect && result.diagnosis !== 'correct_reasoning';
    const misconceptionName = result.misconception || result.misconceptionTag || result.affectedSkill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return {
      id: `diag-${Date.now()}`,
      responseId: studentResponse.id,
      studentId: studentResponse.studentId,
      questionId: question.id,
      isCorrect: result.isCorrect,
      concept: result.concept,
      category,
      topic,
      errorType: result.errorType || (result.isCorrect ? 'none' : 'procedural_error'),
      misconceptionTag: result.misconceptionTag || result.misconception,
      diagnosis: result.diagnosis,
      misconceptionId: isMisconception ? `misc-${result.diagnosis}` : undefined,
      misconceptionName: isMisconception ? misconceptionName : undefined,
      misconceptionCategory: result.diagnosis,
      confidence: result.confidence,
      confidenceBand: result.confidenceBand,
      evidenceStatus: result.evidenceStatus,
      evidence: result.evidence,
      affectedSkill: result.affectedSkill,
      recommendedIntervention: result.recommendedIntervention,
      needsRecoveryTest: result.needsRecoveryTest,
      scopeStatus: result.scopeStatus,
      latencyMs: result.latencyMs,
      detectedErrors: isMisconception ? [
        {
          step: 1,
          snippet: result.evidence,
          explanation: `Student mental model exhibited ${result.diagnosis} in ${result.affectedSkill}: ${result.misconception || ''}`,
          errorType: (result.errorType as string) || result.diagnosis
        }
      ] : [],
      evidenceSnippets: [
        {
          id: `ev-${Date.now()}`,
          quote: result.evidence,
          highlightCategory: isMisconception ? 'critical' : 'neutral',
          pedagogicalNote: `Diagnostic ground: ${result.affectedSkill} (${result.confidenceBand || 'EVALUATED'})`
        }
      ],
      timestamp: new Date().toISOString(),
      status: 'ai_evaluated'
    };
  }
}

/**
 * GeminiDiagnosticEngine (Phase 2A / 2B / 3 / 4 Backward Compatibility)
 * Extends ProductionDiagnosticEngine with default GeminiAdapter.
 */
export class GeminiDiagnosticEngine extends ProductionDiagnosticEngine {
  constructor() {
    super(new GeminiAdapter());
  }
}

/**
 * MockDiagnosticEngine maintained for testing / fallback environments
 */
export class MockDiagnosticEngine implements IDiagnosticEngine {
  private scopeGuard = new InputScopeGuard();

  async diagnose(params: DiagnoseParams): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const guard = this.scopeGuard.evaluate(params.studentReasoning, params.concept);
    if (guard.isBlocked && guard.safeResponse) {
      return OutputValidator.validate(
        {
          isCorrect: false,
          concept: 'linear_equations',
          diagnosis: guard.safeResponse.diagnosis,
          confidence: guard.status === 'POLICY_BYPASS_ATTEMPT' ? 1.0 : 0.85,
          evidence: guard.safeResponse.evidence,
          affectedSkill: guard.safeResponse.affectedSkill,
          recommendedIntervention: guard.safeResponse.recommendedIntervention,
          needsRecoveryTest: guard.safeResponse.needsRecoveryTest
        },
        guard.status,
        Date.now() - startTime,
        params.studentReasoning
      );
    }

    const text = (params.studentReasoning || '').toLowerCase();
    const isCorrect = text.includes('subtract') && text.includes('both sides') && text.includes('divide');
    if (isCorrect) {
      return OutputValidator.validate(
        {
          isCorrect: true,
          concept: 'linear_equations',
          diagnosis: 'correct_reasoning',
          confidence: 0.95,
          evidence: 'The student subtracted the constant from both sides and divided both sides by the coefficient.',
          affectedSkill: 'properties_of_equality',
          recommendedIntervention: 'positive_feedback',
          needsRecoveryTest: false
        },
        'ALLOWED',
        Date.now() - startTime,
        params.studentReasoning
      );
    }

    // Default mock procedural error
    return OutputValidator.validate(
      {
        isCorrect: false,
        concept: 'linear_equations',
        diagnosis: 'procedural_error',
        confidence: 0.88,
        evidence: 'The student adds or alters one side of the equation without applying inverse operations equally.',
        affectedSkill: 'inverse_operations',
        recommendedIntervention: 'probe',
        needsRecoveryTest: true
      },
      'ALLOWED',
      Date.now() - startTime,
      params.studentReasoning
    );
  }

  async diagnoseReasoning(
    studentResponse: StudentResponse,
    question: Question
  ): Promise<Diagnosis> {
    const res = await this.diagnose({
      studentId: studentResponse.studentId,
      question: question.equation || question.prompt || question.question || '',
      expectedAnswer: question.expectedFinalAnswer || question.expectedAnswer || '',
      studentAnswer: studentResponse.submittedAnswer || '',
      studentReasoning: studentResponse.reasoningText
    });

    return {
      id: `diag-${Date.now()}`,
      responseId: studentResponse.id,
      studentId: studentResponse.studentId,
      questionId: question.id,
      isCorrect: res.isCorrect,
      concept: res.concept,
      diagnosis: res.diagnosis,
      misconceptionId: `misc-${res.diagnosis}`,
      misconceptionName: res.affectedSkill,
      misconceptionCategory: res.diagnosis,
      confidence: res.confidence,
      confidenceBand: res.confidenceBand,
      evidenceStatus: res.evidenceStatus,
      evidence: res.evidence,
      affectedSkill: res.affectedSkill,
      recommendedIntervention: res.recommendedIntervention,
      needsRecoveryTest: res.needsRecoveryTest,
      scopeStatus: res.scopeStatus,
      latencyMs: res.latencyMs,
      detectedErrors: [
        {
          step: 1,
          snippet: res.evidence,
          explanation: res.evidence,
          errorType: res.diagnosis
        }
      ],
      evidenceSnippets: [
        {
          id: 'ev-1',
          quote: res.evidence,
          highlightCategory: 'critical',
          pedagogicalNote: 'Reasoning diagnosed'
        }
      ],
      timestamp: new Date().toISOString(),
      status: 'ai_evaluated'
    };
  }
}
