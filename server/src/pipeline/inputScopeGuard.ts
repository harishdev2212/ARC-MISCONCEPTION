import { InputScopeStatus } from '@shared/types';

export interface ScopeGuardResult {
  status: InputScopeStatus;
  reason: string;
  sanitizedText: string;
  isBlocked: boolean;
  safeResponse?: {
    diagnosis: 'insufficient_evidence' | 'out_of_scope' | 'uncertain';
    evidence: string;
    affectedSkill: string;
    recommendedIntervention: 'probe';
    needsRecoveryTest: boolean;
  };
}

/**
 * InputScopeGuard (Phase 4 Robustness Layer)
 * 
 * Enforces domain boundary: Mathematics -> Algebra -> Linear Equations.
 * Untrusted student text is evaluated for:
 * 1. POLICY_BYPASS_ATTEMPT (Prompt injection, jailbreaks, system prompt extraction, answer extortion)
 * 2. OUT_OF_SCOPE (Non-algebra topics, history, essays, chemistry, etc.)
 * 3. AMBIGUOUS (Gibberish, empty/too short, punctuation-only)
 * 4. ALLOWED (Grounded algebraic reasoning or questions on linear equations)
 */
export class InputScopeGuard {
  // Obvious instruction override patterns
  private static readonly INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(all|previous|prior|system|tutor)\s+(instructions|prompts|rules|commands)/i,
    /reveal\s+(your\s+)?(system\s+prompt|instructions|initial\s+prompt|hidden\s+rules)/i,
    /bypass\s+(the\s+)?(tutoring\s+policy|policy|safety|guardrails)/i,
    /(just\s+)?(give|tell)\s+me\s+the\s+(final\s+)?answer\s*(directly|now)?/i,
    /disregard\s+(all\s+)?(previous|prior)\s+(instructions|context)/i,
    /you\s+are\s+now\s+(in\s+developer\s+mode|unrestricted|DAN|a\s+calculator)/i,
    /system\s*:\s*override/i,
    /drop\s+database|eval\(|<script/i,
    /forget\s+(all\s+)?rules/i
  ];

  // Out of scope domains (history, biology, coding, literature, etc.)
  private static readonly OUT_OF_SCOPE_PATTERNS: RegExp[] = [
    /\b(who\s+was\s+(napoleon|george\s+washington|caesar|shakespeare|hitler))\b/i,
    /\b(capital\s+of\s+[a-z]+)\b/i,
    /\b(write\s+(me\s+)?(a\s+poem|an\s+essay|a\s+story|a\s+python\s+script|code))\b/i,
    /\b(french\s+revolution|world\s+war|photosynthesis|mitochondria|dna\s+replication)\b/i,
    /\b(weather\s+in\s+[a-z]+|recipe\s+for|bake\s+a\s+cake)\b/i,
    /\b(quantum\s+mechanics|schrodinger|general\s+relativity)\b/i
  ];

  // Allowed mathematical keywords and reasoning indicators across all topics
  private static readonly MATH_INDICATORS: RegExp[] = [
    /[x-z0-9]=/i,
    /=\s*[x-z0-9]/i,
    /\b(subtract|add|multiply|divide|both\s+sides|isolate|variable|coefficient|constant|balance|inverse|cancel|distribute|distributive|combine\s+terms|factor|quadratic)\b/i,
    /\b(fraction|numerator|denominator|reciprocal|common\s+denominator|percent|percentage|ratio|proportion|decimal|interest)\b/i,
    /\b(angle|angles|triangle|triangles|hypotenuse|adjacent|opposite|complementary|supplementary|circle|area|perimeter|volume|radius|diameter)\b/i,
    /\b(mean|median|mode|range|average|probability|favorable|sample\s+space|outcomes|events|die|marbles|graph|frequency)\b/i,
    /\b(sin|cos|tan|trigonometric|function|domain|range|derivative|integral|limit)\b/i,
    /\b(equation|equal|equals|left\s+hand|right\s+hand|step|subtracted|added|divided|multiplied|because|since|first|then)\b/i,
    /[0-9x\+\-\*\/\(\)\=\%\^]+/
  ];

  /**
   * Evaluates untrusted learner text before sending to AI or diagnostic pipelines.
   */
  public evaluate(rawInput: string, domainTopic: string = 'linear_equations'): ScopeGuardResult {
    const trimmed = (rawInput || '').trim();

    // 1. Check for empty or near-empty
    if (trimmed.length === 0) {
      return {
        status: 'AMBIGUOUS',
        reason: 'Reasoning is empty.',
        sanitizedText: '',
        isBlocked: true,
        safeResponse: {
          diagnosis: 'insufficient_evidence',
          evidence: 'No step-by-step reasoning was provided.',
          affectedSkill: 'diagnostic_clarity',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        }
      };
    }

    // 2. Check for Policy Bypass / Prompt Injection
    for (const pattern of InputScopeGuard.INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          status: 'POLICY_BYPASS_ATTEMPT',
          reason: `Input matched prompt injection defense pattern: ${pattern.source}`,
          sanitizedText: trimmed.slice(0, 300),
          isBlocked: true,
          safeResponse: {
            diagnosis: 'insufficient_evidence',
            evidence: 'The learner submitted an instruction-override attempt rather than mathematical reasoning. System prompt and pedagogical policies remain protected.',
            affectedSkill: 'adversarial_prompt_handling',
            recommendedIntervention: 'probe',
            needsRecoveryTest: true
          }
        };
      }
    }

    // 3. Check for Out of Scope
    for (const pattern of InputScopeGuard.OUT_OF_SCOPE_PATTERNS) {
      if (pattern.test(trimmed)) {
        return {
          status: 'OUT_OF_SCOPE',
          reason: `Input matched out-of-scope domain pattern: ${pattern.source}`,
          sanitizedText: trimmed.slice(0, 300),
          isBlocked: true,
          safeResponse: {
            diagnosis: 'out_of_scope',
            evidence: `The student inquiry is outside the domain of Mathematics > Algebra > Linear Equations.`,
            affectedSkill: 'out_of_scope_guard',
            recommendedIntervention: 'probe',
            needsRecoveryTest: true
          }
        };
      }
    }

    // 4. Check for pure gibberish / punctuation / repeated symbols
    const nonAlphaNumeric = trimmed.replace(/[a-zA-Z0-9\s\+\-\*\/\=\(\)\.]/g, '');
    if (trimmed.length > 5 && nonAlphaNumeric.length > trimmed.length * 0.6) {
      return {
        status: 'AMBIGUOUS',
        reason: 'Input contains excessive non-mathematical symbol noise.',
        sanitizedText: trimmed.slice(0, 200),
        isBlocked: true,
        safeResponse: {
          diagnosis: 'uncertain',
          evidence: 'Reasoning was obscured by unstructured characters or noise.',
          affectedSkill: 'mathematical_expression',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        }
      };
    }

    // 5. Genuine "I don't know" variations
    const lower = trimmed.toLowerCase();
    const idkWays = [
      "i don't know",
      "i dont know",
      "idk",
      "i do not know",
      "no idea",
      "not sure",
      "dont know",
      "haven't learned this"
    ];
    if (idkWays.some(w => lower === w || lower === `${w}.` || lower === `${w}!` || lower.startsWith(`${w} `))) {
      return {
        status: 'ALLOWED',
        reason: 'Learner explicitly stated lack of prerequisite or procedural knowledge.',
        sanitizedText: trimmed,
        isBlocked: true, // short-circuit without calling Gemini LLM
        safeResponse: {
          diagnosis: 'insufficient_evidence',
          evidence: 'The student stated they do not know how to approach this linear equation.',
          affectedSkill: 'diagnostic_clarity',
          recommendedIntervention: 'probe',
          needsRecoveryTest: true
        }
      };
    }

    // 6. Normal algebraic reasoning allowed
    return {
      status: 'ALLOWED',
      reason: 'Input is within Linear Equations mathematical scope.',
      sanitizedText: trimmed,
      isBlocked: false
    };
  }
}
