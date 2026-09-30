/**
 * Socratic Question Bank
 * Provides rich pedagogical variety across Types A-H for detected misconceptions.
 * 
 * TYPE A — WHY: Why do you think that operation should be applied to only that side?
 * TYPE B — BALANCE: If you change one side of the equation, what should happen to the other side?
 * TYPE C — COUNTER-EXAMPLE: Would your method still work if the equation were 2x + 5 = 17? Why?
 * TYPE D — VERIFICATION: How could you check whether your step preserved the equality?
 * TYPE E — PREDICTION: Before making the next step, what do you expect the equation to look like?
 * TYPE F — ERROR REFLECTION: Look at your previous step. What changed on the left side, and what changed on the right side?
 * TYPE G — CONCEPTUAL: What does the equals sign mean in this equation?
 * TYPE H — TRANSFER: Can you apply the same idea to a different equation?
 * 
 * Adaptive Level Mapping:
 * Level 1 (Guiding): ERROR_REFLECTION (F), WHY (A), PREDICTION (E)
 * Level 2 (Conceptual / Counter-Example): BALANCE (B), COUNTER_EXAMPLE (C), CONCEPTUAL (G)
 * Level 3 (Transfer / Independent Reasoning): VERIFICATION (D), TRANSFER (H)
 */

export type SocraticQuestionType =
  | 'TYPE_A_WHY'
  | 'TYPE_B_BALANCE'
  | 'TYPE_C_COUNTER_EXAMPLE'
  | 'TYPE_D_VERIFICATION'
  | 'TYPE_E_PREDICTION'
  | 'TYPE_F_ERROR_REFLECTION'
  | 'TYPE_G_CONCEPTUAL'
  | 'TYPE_H_TRANSFER';

export interface SocraticBankQuestion {
  id: string;
  type: SocraticQuestionType;
  level: 1 | 2 | 3;
  skill: string; // e.g. "properties_of_equality", "distributive_property", "inverse_operations", "combining_like_terms", "general"
  textTemplate: string; // May include placeholders like {equation}, {evidence}, {leftSide}, {rightSide}
  hintPrompt: string;
}

export const SOCRATIC_QUESTION_BANK: SocraticBankQuestion[] = [
  // =========================================================================
  // 1. EQUIVALENCE BALANCE & UNILATERAL OPERATIONS (properties_of_equality)
  // =========================================================================
  // Level 1: Guiding / Reflection
  {
    id: 'eq-bal-f1',
    type: 'TYPE_F_ERROR_REFLECTION',
    level: 1,
    skill: 'properties_of_equality',
    textTemplate: 'Look at your previous step. What changed on the left side, and what changed on the right side?',
    hintPrompt: 'Compare both sides of the equals sign before and after your step.'
  },
  {
    id: 'eq-bal-a1',
    type: 'TYPE_A_WHY',
    level: 1,
    skill: 'properties_of_equality',
    textTemplate: 'Why do you think that operation should be applied to only that side of the equation?',
    hintPrompt: 'Consider what the equals sign means for both expressions.'
  },
  {
    id: 'eq-bal-e1',
    type: 'TYPE_E_PREDICTION',
    level: 1,
    skill: 'properties_of_equality',
    textTemplate: 'Before making the next step, what do you expect the equation to look like if both sides stay balanced?',
    hintPrompt: 'A balanced step keeps the two sides equal in value.'
  },
  // Level 2: Conceptual / Counter-Example
  {
    id: 'eq-bal-b1',
    type: 'TYPE_B_BALANCE',
    level: 2,
    skill: 'properties_of_equality',
    textTemplate: 'If you change one side of the equation, what should happen to the other side to keep it balanced?',
    hintPrompt: 'Think of a balance scale: changing one pan requires changing the other identically.'
  },
  {
    id: 'eq-bal-c1',
    type: 'TYPE_C_COUNTER_EXAMPLE',
    level: 2,
    skill: 'properties_of_equality',
    textTemplate: 'Would your method still work if the equation were 2x + 5 = 17? Why or why not?',
    hintPrompt: 'Try testing whether changing only one side keeps 2(6) + 5 equal to 17.'
  },
  {
    id: 'eq-bal-g1',
    type: 'TYPE_G_CONCEPTUAL',
    level: 2,
    skill: 'properties_of_equality',
    textTemplate: 'What does the equals sign really mean in this equation?',
    hintPrompt: 'The equals sign states that the total value on the left equals the total value on the right.'
  },
  // Level 3: Transfer / Independent Reasoning
  {
    id: 'eq-bal-d1',
    type: 'TYPE_D_VERIFICATION',
    level: 3,
    skill: 'properties_of_equality',
    textTemplate: 'How could you check whether your step preserved the equality of both sides?',
    hintPrompt: 'Substitute a number or inspect whether both sides were modified identically.'
  },
  {
    id: 'eq-bal-h1',
    type: 'TYPE_H_TRANSFER',
    level: 3,
    skill: 'properties_of_equality',
    textTemplate: 'Can you apply this same idea of keeping both sides balanced to a new equation?',
    hintPrompt: 'Always perform identical inverse operations on both sides.'
  },

  // =========================================================================
  // 2. INVERSE OPERATIONS & SIGN INVERSION (inverse_operations)
  // =========================================================================
  // Level 1: Guiding / Reflection
  {
    id: 'inv-op-f1',
    type: 'TYPE_F_ERROR_REFLECTION',
    level: 1,
    skill: 'inverse_operations',
    textTemplate: 'Look at the operation attached to the variable. What operation is currently holding that term in place?',
    hintPrompt: 'Identify whether the term is added, subtracted, multiplied, or divided.'
  },
  {
    id: 'inv-op-a1',
    type: 'TYPE_A_WHY',
    level: 1,
    skill: 'inverse_operations',
    textTemplate: 'Why did you choose that specific operation to undo the term attached to x?',
    hintPrompt: 'An inverse operation must completely cancel the original operation.'
  },
  {
    id: 'inv-op-e1',
    type: 'TYPE_E_PREDICTION',
    level: 1,
    skill: 'inverse_operations',
    textTemplate: 'If you apply the opposite operation to both sides, what will cancel out on the side with x?',
    hintPrompt: 'Addition cancels subtraction, and multiplication cancels division.'
  },
  // Level 2: Conceptual / Counter-Example
  {
    id: 'inv-op-b1',
    type: 'TYPE_B_BALANCE',
    level: 2,
    skill: 'inverse_operations',
    textTemplate: 'When undoing an operation on the left, how does applying the inverse to the right maintain the equality?',
    hintPrompt: 'Performing the same inverse on both sides keeps the relationship true.'
  },
  {
    id: 'inv-op-c1',
    type: 'TYPE_C_COUNTER_EXAMPLE',
    level: 2,
    skill: 'inverse_operations',
    textTemplate: 'If a term is added (+8), does adding 8 again undo it, or does it make it larger (+16)? What undoes addition?',
    hintPrompt: 'To bring a positive quantity to zero, we subtract that quantity.'
  },
  {
    id: 'inv-op-g1',
    type: 'TYPE_G_CONCEPTUAL',
    level: 2,
    skill: 'inverse_operations',
    textTemplate: 'What is the goal of using an inverse operation when solving for an unknown variable?',
    hintPrompt: 'Our goal is to isolate the variable completely by systematically undoing each attached operation.'
  },
  // Level 3: Transfer / Independent Reasoning
  {
    id: 'inv-op-d1',
    type: 'TYPE_D_VERIFICATION',
    level: 3,
    skill: 'inverse_operations',
    textTemplate: 'How can you verify that your chosen inverse operation leaves the variable with a coefficient of 1?',
    hintPrompt: 'Check that the term attached to x simplifies cleanly.'
  },
  {
    id: 'inv-op-h1',
    type: 'TYPE_H_TRANSFER',
    level: 3,
    skill: 'inverse_operations',
    textTemplate: 'Can you use this same inverse operation strategy if the terms were multiplied instead of added?',
    hintPrompt: 'The same inverse principle applies across all operations.'
  },

  // =========================================================================
  // 3. DISTRIBUTIVE PROPERTY (distributive_property)
  // =========================================================================
  // Level 1: Guiding / Reflection
  {
    id: 'dist-f1',
    type: 'TYPE_F_ERROR_REFLECTION',
    level: 1,
    skill: 'distributive_property',
    textTemplate: 'Look at the factor outside the parentheses. Did it multiply every term inside the group, or just the first term?',
    hintPrompt: 'Parentheses group multiple terms together under the same multiplier.'
  },
  {
    id: 'dist-a1',
    type: 'TYPE_A_WHY',
    level: 1,
    skill: 'distributive_property',
    textTemplate: 'Why does the multiplier outside the parentheses need to be distributed to every term inside?',
    hintPrompt: 'Each item inside the grouping is multiplied by that factor.'
  },
  {
    id: 'dist-e1',
    type: 'TYPE_E_PREDICTION',
    level: 1,
    skill: 'distributive_property',
    textTemplate: 'What do you expect the expanded expression to look like once the parentheses are completely cleared?',
    hintPrompt: 'a(b + c) expands into two separate products: a*b + a*c.'
  },
  // Level 2: Conceptual / Counter-Example
  {
    id: 'dist-b1',
    type: 'TYPE_B_BALANCE',
    level: 2,
    skill: 'distributive_property',
    textTemplate: 'If you have 3 bags with (x + 4) items each, how many x\'s and how many numbers do you have in total?',
    hintPrompt: 'Think of 3 groups of (x + 4): that is (x + 4) + (x + 4) + (x + 4).'
  },
  {
    id: 'dist-c1',
    type: 'TYPE_C_COUNTER_EXAMPLE',
    level: 2,
    skill: 'distributive_property',
    textTemplate: 'If x = 2, does 3(2 + 4) equal 3(2) + 4, or does it equal 3(2) + 3(4)? Why?',
    hintPrompt: 'Test the arithmetic: 3(6) = 18. Does 6 + 4 = 18, or does 6 + 12 = 18?'
  },
  {
    id: 'dist-g1',
    type: 'TYPE_G_CONCEPTUAL',
    level: 2,
    skill: 'distributive_property',
    textTemplate: 'What is the purpose of the distributive property in simplifying multi-step equations?',
    hintPrompt: 'It breaks grouped expressions into standard polynomial terms so like terms can be combined.'
  },
  // Level 3: Transfer / Independent Reasoning
  {
    id: 'dist-d1',
    type: 'TYPE_D_VERIFICATION',
    level: 3,
    skill: 'distributive_property',
    textTemplate: 'How can you verify that you haven\'t missed distributing the factor to any negative or constant terms?',
    hintPrompt: 'Check each term inside against the outside factor and verify the signs.'
  },
  {
    id: 'dist-h1',
    type: 'TYPE_H_TRANSFER',
    level: 3,
    skill: 'distributive_property',
    textTemplate: 'Can you apply this same distribution idea if there is a negative multiplier outside the group?',
    hintPrompt: 'Distribute the negative sign along with the factor to every term.'
  },

  // =========================================================================
  // 4. COMBINING LIKE TERMS (combining_like_terms)
  // =========================================================================
  // Level 1: Guiding / Reflection
  {
    id: 'comb-f1',
    type: 'TYPE_F_ERROR_REFLECTION',
    level: 1,
    skill: 'combining_like_terms',
    textTemplate: 'Look at the terms you combined. Do they have the same variable part, or is one a variable and one a number?',
    hintPrompt: 'Terms must have identical variable components to be combined directly.'
  },
  {
    id: 'comb-a1',
    type: 'TYPE_A_WHY',
    level: 1,
    skill: 'combining_like_terms',
    textTemplate: 'Why can terms with an x not be directly added to plain numbers like 4?',
    hintPrompt: 'An unknown variable quantity represents a different unit than a fixed number.'
  },
  {
    id: 'comb-e1',
    type: 'TYPE_E_PREDICTION',
    level: 1,
    skill: 'combining_like_terms',
    textTemplate: 'If you group all variable terms together and all constant terms together, what will the side look like?',
    hintPrompt: 'Keep variable terms together and constant terms together.'
  },
  // Level 2: Conceptual / Counter-Example
  {
    id: 'comb-b1',
    type: 'TYPE_B_BALANCE',
    level: 2,
    skill: 'combining_like_terms',
    textTemplate: 'If you have 2 apples and 4 dollars, can you say you have 6 apple-dollars? How does that relate to 2x + 4?',
    hintPrompt: 'Different units cannot be added together into a single quantity.'
  },
  {
    id: 'comb-c1',
    type: 'TYPE_C_COUNTER_EXAMPLE',
    level: 2,
    skill: 'combining_like_terms',
    textTemplate: 'If x = 10, does 2x + 4 equal 6x? Check: does 2(10) + 4 equal 6(10)?',
    hintPrompt: '24 does not equal 60, so 2x + 4 cannot be simplified into 6x.'
  },
  {
    id: 'comb-g1',
    type: 'TYPE_G_CONCEPTUAL',
    level: 2,
    skill: 'combining_like_terms',
    textTemplate: 'What makes two algebraic terms "like terms"?',
    hintPrompt: 'Like terms have identical variables raised to identical powers.'
  },
  // Level 3: Transfer / Independent Reasoning
  {
    id: 'comb-d1',
    type: 'TYPE_D_VERIFICATION',
    level: 3,
    skill: 'combining_like_terms',
    textTemplate: 'How can you verify that only like terms have been combined on each side of the equation?',
    hintPrompt: 'Count variable terms and constant numbers separately.'
  },
  {
    id: 'comb-h1',
    type: 'TYPE_H_TRANSFER',
    level: 3,
    skill: 'combining_like_terms',
    textTemplate: 'Can you apply this rule if an equation has variables on both sides?',
    hintPrompt: 'Collect all variable terms onto one side and all constant terms onto the other.'
  },

  // =========================================================================
  // 5. GENERAL / CALCULATION / REASONING (general)
  // =========================================================================
  // Level 1: Guiding / Reflection
  {
    id: 'gen-f1',
    type: 'TYPE_F_ERROR_REFLECTION',
    level: 1,
    skill: 'general',
    textTemplate: 'Look back at your calculation step. What mathematical operation did you perform on the numbers?',
    hintPrompt: 'Double check the arithmetic step by step.'
  },
  {
    id: 'gen-a1',
    type: 'TYPE_A_WHY',
    level: 1,
    skill: 'general',
    textTemplate: 'Why did you choose that mathematical step to get closer to finding x?',
    hintPrompt: 'Think about whether each step moves x closer to being by itself.'
  },
  {
    id: 'gen-e1',
    type: 'TYPE_E_PREDICTION',
    level: 1,
    skill: 'general',
    textTemplate: 'Before you calculate the next line, what simplified equation do you expect to see?',
    hintPrompt: 'Check your numbers before writing the next step.'
  },
  // Level 2: Conceptual / Counter-Example
  {
    id: 'gen-b1',
    type: 'TYPE_B_BALANCE',
    level: 2,
    skill: 'general',
    textTemplate: 'If you perform an operation on one side, what ensures both sides remain equal in value?',
    hintPrompt: 'Maintaining equality requires keeping both sides in sync.'
  },
  {
    id: 'gen-c1',
    type: 'TYPE_C_COUNTER_EXAMPLE',
    level: 2,
    skill: 'general',
    textTemplate: 'If you substitute your answer back into the original equation, does it make the equation true?',
    hintPrompt: 'Check if both sides calculate to the same value.'
  },
  {
    id: 'gen-g1',
    type: 'TYPE_G_CONCEPTUAL',
    level: 2,
    skill: 'general',
    textTemplate: 'What does it mean to "solve" an equation for an unknown variable?',
    hintPrompt: 'Solving means finding the exact value that makes the statement true.'
  },
  // Level 3: Transfer / Independent Reasoning
  {
    id: 'gen-d1',
    type: 'TYPE_D_VERIFICATION',
    level: 3,
    skill: 'general',
    textTemplate: 'How can you verify that your solution works for the original equation?',
    hintPrompt: 'Plug your solution back into the original equation to test it.'
  },
  {
    id: 'gen-h1',
    type: 'TYPE_H_TRANSFER',
    level: 3,
    skill: 'general',
    textTemplate: 'Can you apply this same problem-solving method to an equation with different numbers?',
    hintPrompt: 'The same core algebraic rules work on any linear equation.'
  }
];

/**
 * Maps skill aliases/variants to canonical skills in the bank.
 */
function normalizeSkillKey(skill?: string): string {
  if (!skill) return 'general';
  const s = skill.toLowerCase();
  if (s.includes('balance') || s.includes('equality') || s.includes('unilateral') || s.includes('procedural')) {
    return 'properties_of_equality';
  }
  if (s.includes('inverse') || s.includes('sign') || s.includes('isolate') || s.includes('isolation')) {
    return 'inverse_operations';
  }
  if (s.includes('distribut')) {
    return 'distributive_property';
  }
  if (s.includes('like') || s.includes('combining') || s.includes('term')) {
    return 'combining_like_terms';
  }
  return 'general';
}

/**
 * Selects an unused question from the bank matching the skill and level.
 * Avoids questions in `usedQuestionIds`.
 */
export function selectSocraticQuestion(params: {
  skill?: string;
  level: 1 | 2 | 3;
  usedQuestionIds?: string[];
  preferredType?: SocraticQuestionType;
  context?: {
    equation?: string;
    evidence?: string;
  };
}): { id: string; type: SocraticQuestionType; text: string; hintPrompt: string } {
  const { skill, level, usedQuestionIds = [], preferredType, context } = params;
  const canonicalSkill = normalizeSkillKey(skill);

  // Filter bank by skill (or fallback to 'general') and level
  let candidates = SOCRATIC_QUESTION_BANK.filter(
    q => (q.skill === canonicalSkill || q.skill === 'general') && q.level === level
  );

  // Prioritize candidates matching the specific skill
  const skillSpecific = candidates.filter(q => q.skill === canonicalSkill);
  if (skillSpecific.length > 0) {
    candidates = skillSpecific;
  }

  // Filter out questions already used in this session
  const unusedCandidates = candidates.filter(q => !usedQuestionIds.includes(q.id));
  const pool = unusedCandidates.length > 0 ? unusedCandidates : candidates;

  // If a preferred question type was requested, check for it
  let selected = preferredType ? pool.find(q => q.type === preferredType) : undefined;

  // Otherwise, select the first unused candidate
  if (!selected && pool.length > 0) {
    selected = pool[0];
  }

  // Fallback if pool is empty
  if (!selected) {
    selected = SOCRATIC_QUESTION_BANK.find(q => q.level === level) || SOCRATIC_QUESTION_BANK[0];
  }

  // Personalize placeholders if context provided
  let text = selected.textTemplate;
  if (context?.equation) {
    text = text.replace(/\{equation\}/g, context.equation);
  }
  if (context?.evidence) {
    text = text.replace(/\{evidence\}/g, context.evidence);
  }

  return {
    id: selected.id,
    type: selected.type,
    text,
    hintPrompt: selected.hintPrompt
  };
}
