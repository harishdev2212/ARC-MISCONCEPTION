/**
 * Controlled Knowledge Configuration for Mathematics → Algebra → Linear Equations
 * 
 * Used by the MindTrace Diagnostic Engine to ground AI diagnostic evaluations
 * against canonical pedagogical definitions, prerequisite structures, and known misconception ontologies.
 */

export interface LinearEquationsKnowledge {
  conceptName: string;
  domain: string;
  subdomain: string;
  definition: string;
  prerequisites: {
    skill: string;
    description: string;
  }[];
  correctSolvingProcedure: {
    step: number;
    action: string;
    description: string;
  }[];
  misconceptionOntology: {
    category: string;
    name: string;
    description: string;
    affectedSkill: string;
    typicalStudentPattern: string;
  }[];
  canonicalExampleProblems: {
    equation: string;
    expectedAnswer: string;
    referenceSteps: string[];
  }[];
}

export const LINEAR_EQUATIONS_KNOWLEDGE: LinearEquationsKnowledge = {
  conceptName: 'linear_equations',
  domain: 'Mathematics',
  subdomain: 'Algebra I',
  definition: 'An algebraic equation of degree 1 (such as ax + b = c or ax + b = cx + d) where equivalence between both sides is preserved under inverse operations to isolate the unknown variable.',
  prerequisites: [
    {
      skill: 'integer_arithmetic',
      description: 'Correct execution of signed addition, subtraction, multiplication, and division with positive and negative numbers.'
    },
    {
      skill: 'inverse_operations',
      description: 'Understanding that addition and subtraction are inverse operations, and multiplication and division are inverse operations.'
    },
    {
      skill: 'properties_of_equality',
      description: 'The fundamental relational principle that applying an operation to one side of an equals sign requires the identical operation on the opposing side to maintain equivalence.'
    },
    {
      skill: 'distributive_property',
      description: 'Expanding multiplication across terms within parentheses: a(bx + c) = abx + ac.'
    },
    {
      skill: 'combining_like_terms',
      description: 'Distinguishing between unknown variable terms and constant numbers, adding or subtracting coefficients of identical terms only.'
    }
  ],
  correctSolvingProcedure: [
    {
      step: 1,
      action: 'Simplify each side',
      description: 'Clear parentheses using the distributive property and combine like terms on each individual side of the equals sign.'
    },
    {
      step: 2,
      action: 'Collect variable terms on one side',
      description: 'Use the addition or subtraction property of equality to move variable terms to one side of the equation.'
    },
    {
      step: 3,
      action: 'Collect constant terms on the opposite side',
      description: 'Use inverse addition or subtraction on both sides to isolate the variable term.'
    },
    {
      step: 4,
      action: 'Isolate the variable (coefficient of 1)',
      description: 'Use the division or multiplication property of equality on both sides to solve for the variable.'
    },
    {
      step: 5,
      action: 'Verification check',
      description: 'Substitute the calculated value back into the original equation to ensure both sides evaluate to identical quantities.'
    }
  ],
  misconceptionOntology: [
    {
      category: 'procedural_error',
      name: 'Unilateral Operation (Balance Violation)',
      description: 'Performing an operation (subtracting, adding, dividing) on one side of the equals sign without applying it to the other.',
      affectedSkill: 'properties_of_equality',
      typicalStudentPattern: 'In 2x + 4 = 10, subtracting 4 from left side only so 2x = 10, or adding 4 to right side instead of subtracting 4 from both.'
    },
    {
      category: 'procedural_error',
      name: 'Incomplete Distribution',
      description: 'Multiplying the exterior coefficient by the variable term only, while failing to distribute it across constants or other terms inside the parentheses.',
      affectedSkill: 'distributive_property',
      typicalStudentPattern: 'In 3(x + 4) = 21, multiplying 3 by x to get 3x + 4 = 21 instead of 3x + 12 = 21.'
    },
    {
      category: 'procedural_error',
      name: 'Sign Inversion Failure ("Teleportation")',
      description: 'Transposing a term across the equals sign without inverting its sign (e.g. moving +4 over as +4 instead of -4).',
      affectedSkill: 'inverse_operations',
      typicalStudentPattern: 'In 2x + 4 = 10, wrote 2x = 10 + 4 = 14.'
    },
    {
      category: 'overgeneralization',
      name: 'Invalid Variable & Constant Combination',
      description: 'Combining unlike terms together into a composite term.',
      affectedSkill: 'combining_like_terms',
      typicalStudentPattern: 'In 2x + 4 = 10, combining 2x and 4 into 6x, yielding 6x = 10.'
    },
    {
      category: 'wrong_rule_or_definition',
      name: 'Equals Sign as Operational Direction',
      description: 'Treating the equals sign as a one-way instruction to perform calculation rather than a relational balance.',
      affectedSkill: 'properties_of_equality',
      typicalStudentPattern: 'Attempting to calculate 2x + 4 before reading the right side, or believing operations cannot cross the equals sign.'
    },
    {
      category: 'missing_prerequisite',
      name: 'Signed Number Arithmetic Error',
      description: 'Algebraic logic is correct, but execution fails due to negative sign rules or fraction division.',
      affectedSkill: 'integer_arithmetic',
      typicalStudentPattern: 'In -3x = 12, calculating x = 4 instead of x = -4.'
    },
    {
      category: 'calculation_slip',
      name: 'Minor Arithmetic Slip',
      description: 'The student correctly identifies and applies the required algebraic steps, but makes an isolated arithmetic error (e.g. 10 - 4 = 5).',
      affectedSkill: 'integer_arithmetic',
      typicalStudentPattern: 'Wrote 10 - 4 = 5, then x = 2.5, even though inverse subtraction on both sides was correctly applied.'
    },
    {
      category: 'insufficient_evidence',
      name: 'Reasoning Too Fragmented or "I don\'t know"',
      description: 'Student states "I don\'t know", leaves reasoning empty, or writes fragmented text insufficient to diagnose mental model.',
      affectedSkill: 'diagnostic_clarity',
      typicalStudentPattern: 'Only wrote "7", "I don\'t know", or gave no explanation.'
    },
    {
      category: 'correct_reasoning',
      name: 'Valid Equivalence Preservation',
      description: 'Step-by-step reasoning demonstrates correct understanding and application of algebraic equivalence and inverse operations.',
      affectedSkill: 'mastery',
      typicalStudentPattern: 'Subtracted 4 from both sides to get 2x = 6, then divided both sides by 2 to get x = 3.'
    },
    {
      category: 'uncertain',
      name: 'Ambiguous Reasoning',
      description: 'The student explanation is contradictory or contains conflicting evidence that cannot be definitively classified.',
      affectedSkill: 'diagnostic_clarity',
      typicalStudentPattern: 'Explanation mentions conflicting operations that contradict the final answer.'
    }
  ],
  canonicalExampleProblems: [
    {
      equation: '2x + 4 = 10',
      expectedAnswer: 'x = 3',
      referenceSteps: [
        'Subtract 4 from both sides: 2x + 4 - 4 = 10 - 4 -> 2x = 6',
        'Divide both sides by 2: 2x / 2 = 6 / 2 -> x = 3'
      ]
    },
    {
      equation: '3x + 8 = 29',
      expectedAnswer: 'x = 7',
      referenceSteps: [
        'Subtract 8 from both sides: 3x + 8 - 8 = 29 - 8 -> 3x = 21',
        'Divide both sides by 3: 3x / 3 = 21 / 3 -> x = 7'
      ]
    },
    {
      equation: '5x - 14 = 2x + 13',
      expectedAnswer: 'x = 9',
      referenceSteps: [
        'Subtract 2x from both sides: 3x - 14 = 13',
        'Add 14 to both sides: 3x = 27',
        'Divide both sides by 3: x = 9'
      ]
    }
  ]
};
