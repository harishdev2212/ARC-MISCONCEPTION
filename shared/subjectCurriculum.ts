export type { SubjectType } from './types';
import { SubjectType } from './types';

export interface TopicDefinition {
  id: string;
  name: string;
  description: string;
  difficultyLevels: ('easy' | 'medium' | 'hard')[];
}

export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  topics: TopicDefinition[];
}

export interface SubjectDefinition {
  id: SubjectType;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  categories: CategoryDefinition[];
}

export const SUBJECT_CURRICULUM: SubjectDefinition[] = [
  // =========================================================================
  // 1. MATHEMATICS
  // =========================================================================
  {
    id: 'Mathematics',
    name: 'Mathematics',
    tagline: 'Cognitive analysis of algebraic, numerical, and geometric reasoning',
    description: 'Diagnoses mental models across algebra, arithmetic, geometry, coordinate geometry, and data interpretation.',
    icon: 'Calculator',
    color: '#2563EB',
    categories: [
      {
        id: 'Algebra',
        name: 'Algebra',
        description: 'Equations, expressions, inequalities, and variable manipulations.',
        topics: [
          { id: 'linear-equations-1', name: 'Linear Equations in One Variable', description: 'Single-variable linear equality, inverse operations, bilateral balancing', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'linear-equations-2', name: 'Linear Equations in Two Variables', description: 'Two-variable linear relations, coordinate solutions, graphing lines', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'simultaneous-equations', name: 'Simultaneous Equations', description: 'Systems of equations solved via substitution or elimination', difficultyLevels: ['medium', 'hard'] },
          { id: 'quadratic-equations', name: 'Quadratic Equations', description: 'Factoring, quadratic formula, zero product property, and parabolas', difficultyLevels: ['medium', 'hard'] },
          { id: 'polynomials', name: 'Polynomials', description: 'Degree, term classification, polynomial operations, and remainder theorem', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'factorisation', name: 'Factorisation', description: 'Common factors, difference of squares, grouping, and trinomials', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'algebraic-expressions', name: 'Algebraic Expressions', description: 'Combining like terms, distributive law, and substitution', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'exponents-powers', name: 'Exponents and Powers', description: 'Product, quotient, power-of-power rules, and negative exponents', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'inequalities', name: 'Inequalities', description: 'Linear inequalities, sign inversion on negative multiplication/division', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Arithmetic',
        name: 'Arithmetic',
        description: 'Numerical reasoning, proportional relationships, and financial computations.',
        topics: [
          { id: 'fractions', name: 'Fractions', description: 'Fraction equivalence, common denominators, and reciprocal operations', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'percentages', name: 'Percentages', description: 'Base value representation, sequential percentages, discounts, and markups', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'ratio-proportion', name: 'Ratio and Proportion', description: 'Direct and inverse proportions, unit rates, and scaling factors', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'profit-loss', name: 'Profit and Loss', description: 'Cost price, selling price, profit percentage, and margin calculations', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'averages', name: 'Averages', description: 'Central tendency, weighted averages, and sum conservation', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'simple-interest', name: 'Simple Interest', description: 'Principal, rate, time, and linear interest accumulation', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'compound-interest', name: 'Compound Interest', description: 'Compounding frequency, exponential growth, and effective rate', difficultyLevels: ['medium', 'hard'] }
        ]
      },
      {
        id: 'Geometry',
        name: 'Geometry',
        description: 'Angles, geometric figures, planar properties, and boundary metrics.',
        topics: [
          { id: 'angles', name: 'Angles', description: 'Complementary, supplementary, vertically opposite, and transversal angles', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'triangles', name: 'Triangles', description: 'Interior angle sum, exterior angle theorem, congruence, and similarity', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'quadrilaterals', name: 'Quadrilaterals', description: 'Parallelograms, rectangles, rhombuses, trapezoids, and angle properties', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'circles', name: 'Circles', description: 'Radius, diameter, circumference, tangent properties, and chord theorems', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'area-perimeter', name: 'Area and Perimeter', description: '2D plane coverage, perimeter conservation, and dimension formulas', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Coordinate Geometry',
        name: 'Coordinate Geometry',
        description: 'Cartesian coordinate systems, distance, slope, and linear equations in coordinate planes.',
        topics: [
          { id: 'coordinates', name: 'Coordinates', description: 'Cartesian quadrants, coordinate plotting, and reflections', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'slope', name: 'Slope', description: 'Gradient definition (rise over run), positive/negative/undefined slopes', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'distance-points', name: 'Distance between points', description: 'Pythagorean coordinate distance and midpoint calculations', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'straight-line-equations', name: 'Straight-line equations', description: 'Slope-intercept form (y = mx + c), point-slope form, and intercepts', difficultyLevels: ['medium', 'hard'] }
        ]
      },
      {
        id: 'Statistics',
        name: 'Statistics',
        description: 'Data distributions, measures of central tendency, and probabilistic prediction.',
        topics: [
          { id: 'mean', name: 'Mean', description: 'Arithmetic mean, outlier sensitivity, and sum decomposition', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'median', name: 'Median', description: 'Ordered dataset median, even/odd lengths, and ordinal ranking', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'mode', name: 'Mode', description: 'Highest frequency occurrences, bimodal distributions, and categorical modes', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'data-interpretation', name: 'Data interpretation', description: 'Reading charts, bar graphs, histograms, and trend analysis', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'basic-probability', name: 'Basic probability', description: 'Sample spaces, favorable outcomes, and complementary events', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      }
    ]
  },

  // =========================================================================
  // 2. PROGRAMMING
  // =========================================================================
  {
    id: 'Programming',
    name: 'Programming',
    tagline: 'Algorithmic diagnostics, code execution models, and debugging analysis',
    description: 'Diagnoses mental models across coding logic, boundary conditions, data structures, and object orientation.',
    icon: 'Code',
    color: '#0D9488',
    categories: [
      {
        id: 'Programming Fundamentals',
        name: 'Programming Fundamentals',
        description: 'Core programming constructs, evaluation flow, and structural basics.',
        topics: [
          { id: 'variables', name: 'Variables', description: 'Variable declaration, scoping, reassignment, and naming conventions', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'data-types', name: 'Data types', description: 'Primitives, type coercion, string vs integer semantics, and booleans', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'operators', name: 'Operators', description: 'Arithmetic, logical (AND/OR/NOT), comparison, and operator precedence', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'input-output', name: 'Input/Output', description: 'Standard input parsing, formatted output, and newline handling', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'conditionals', name: 'Conditional statements', description: 'if/else branching, nested conditionals, switch cases, and boolean truthiness', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'loops', name: 'Loops', description: 'for loops, while loops, loop boundaries, iteration variables, and termination', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'functions', name: 'Functions', description: 'Parameters, arguments, return values, call stack, and side effects', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Data Structures',
        name: 'Data Structures',
        description: 'Linear and hierarchical organization of information in memory.',
        topics: [
          { id: 'arrays', name: 'Arrays', description: '0-based indexing, bounds checks, traversal, and contiguous allocation', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'strings', name: 'Strings', description: 'Immutability, substring operations, concatenation, and character encoding', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'linked-lists', name: 'Linked Lists', description: 'Pointers/references, node insertion, traversal, and null termination', difficultyLevels: ['medium', 'hard'] },
          { id: 'stacks', name: 'Stacks', description: 'LIFO principle, push/pop semantics, overflow, and call stack analogy', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'queues', name: 'Queues', description: 'FIFO principle, enqueue/dequeue semantics, and buffer behavior', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'trees', name: 'Trees', description: 'Binary trees, root/leaf nodes, tree traversal (pre/in/post), and depth', difficultyLevels: ['medium', 'hard'] },
          { id: 'hashing', name: 'Hashing', description: 'Hash maps, key-value association, collisions, and lookup complexity', difficultyLevels: ['medium', 'hard'] }
        ]
      },
      {
        id: 'Algorithms',
        name: 'Algorithms',
        description: 'Systematic computational procedures, time analysis, and problem-solving strategies.',
        topics: [
          { id: 'searching', name: 'Searching', description: 'Linear search, binary search preconditions, and target location', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'sorting', name: 'Sorting', description: 'Bubble, insertion, selection, and divide-and-conquer sorting mechanics', difficultyLevels: ['medium', 'hard'] },
          { id: 'recursion', name: 'Recursion', description: 'Base cases, recursive steps, stack overflow, and divide-and-conquer', difficultyLevels: ['medium', 'hard'] },
          { id: 'time-complexity', name: 'Time complexity', description: 'Big-O notation, nested loops, logarithmic operations, and scalability', difficultyLevels: ['medium', 'hard'] },
          { id: 'basic-problem-solving', name: 'Basic problem solving', description: 'Decomposing prompts into algorithms, edge cases, and invariants', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Object Oriented Programming',
        name: 'Object Oriented Programming',
        description: 'Classes, instance lifecycles, encapsulation, and modular design.',
        topics: [
          { id: 'classes', name: 'Classes', description: 'Class blueprints, constructors, and method signatures', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'objects', name: 'Objects', description: 'Instance instantiation, memory references, and state mutation', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'inheritance', name: 'Inheritance', description: 'Super/subclass relationships, method overriding, and super keyword', difficultyLevels: ['medium', 'hard'] },
          { id: 'polymorphism', name: 'Polymorphism', description: 'Dynamic dispatch, interface contracts, and method overloading', difficultyLevels: ['medium', 'hard'] },
          { id: 'encapsulation', name: 'Encapsulation', description: 'Access modifiers (private, protected, public) and data hiding', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'abstraction', name: 'Abstraction', description: 'Abstract classes, interfaces, and decoupling implementation details', difficultyLevels: ['medium', 'hard'] }
        ]
      },
      {
        id: 'Debugging',
        name: 'Debugging',
        description: 'Isolating root causes, boundary anomalies, and syntax breakdowns.',
        topics: [
          { id: 'syntax-errors', name: 'Syntax errors', description: 'Mismatched brackets, missing semicolons, and invalid keywords', difficultyLevels: ['easy', 'medium'] },
          { id: 'logical-errors', name: 'Logical errors', description: 'Flawed algorithm flow where code compiles but produces incorrect output', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'runtime-errors', name: 'Runtime errors', description: 'Null pointer exceptions, division by zero, and array out of bounds', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'off-by-one-errors', name: 'Off-by-one errors', description: '< vs <= boundary checks, loop termination, and index offsetting', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'incorrect-conditions', name: 'Incorrect conditions', description: 'Confusing == with =, inverted boolean logic, and flawed compound checks', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'incorrect-loop-logic', name: 'Incorrect loop logic', description: 'Infinite loops, missing increment, and modifying collection while iterating', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'variable-misuse', name: 'Variable misuse', description: 'Variable shadowing, uninitialized variables, and premature reuse', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'incorrect-algorithm-selection', name: 'Incorrect algorithm selection', description: 'Applying O(N^2) instead of linear scan or inappropriate data structures', difficultyLevels: ['medium', 'hard'] }
        ]
      }
    ]
  },

  // =========================================================================
  // 3. ENGLISH
  // =========================================================================
  {
    id: 'English',
    name: 'English',
    tagline: 'Linguistic diagnostics, grammatical analysis, and reading comprehension',
    description: 'Diagnoses mental models across grammar, subject-verb agreement, semantic vocabulary, and text comprehension.',
    icon: 'BookOpen',
    color: '#7C3AED',
    categories: [
      {
        id: 'Grammar',
        name: 'Grammar',
        description: 'Syntactic rules, sentence mechanics, and structural consistency.',
        topics: [
          { id: 'subject-verb-agreement', name: 'Subject-verb agreement', description: 'Third-person singular agreement, compound subjects, and collective nouns', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'tenses', name: 'Tenses', description: 'Past, present, future, perfect aspects, and tense consistency within text', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'articles', name: 'Articles', description: 'Definite (the) vs indefinite (a, an), vowel sound rule, and zero article usage', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'prepositions', name: 'Prepositions', description: 'Temporal (at, in, on), spatial prepositions, and prepositional collocations', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'pronouns', name: 'Pronouns', description: 'Subject vs object pronouns, possessives, and pronoun-antecedent agreement', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'conjunctions', name: 'Conjunctions', description: 'Coordinating (FANBOYS), subordinating conjunctions, and correlative pairs', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'active-passive-voice', name: 'Active/passive voice', description: 'Agent placement, past participle usage, and appropriate voice selection', difficultyLevels: ['medium', 'hard'] },
          { id: 'direct-indirect-speech', name: 'Direct/indirect speech', description: 'Reported speech, backshifting tenses, and pronoun adjustments', difficultyLevels: ['medium', 'hard'] },
          { id: 'sentence-structure', name: 'Sentence structure', description: 'Clauses, fragments, run-on sentences, comma splices, and parallel structure', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Vocabulary',
        name: 'Vocabulary',
        description: 'Lexical precision, semantic nuance, and contextual word understanding.',
        topics: [
          { id: 'word-meaning', name: 'Word meaning', description: 'Denotation, connotation, and dictionary precision in varied domains', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'synonyms', name: 'Synonyms', description: 'Semantic proximity, register (formal vs informal), and shade of meaning', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'antonyms', name: 'Antonyms', description: 'Direct opposites, complementary antonyms, and gradable pairs', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'contextual-vocabulary', name: 'Contextual vocabulary', description: 'Deducing unfamiliar words using surrounding text clues and morphology', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Reading Comprehension',
        name: 'Reading Comprehension',
        description: 'Textual analysis, inferential reasoning, and structural authorial intent.',
        topics: [
          { id: 'main-idea', name: 'Main idea', description: 'Distinguishing central theme from supporting examples and details', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'inference', name: 'Inference', description: 'Drawing valid textual conclusions without explicit direct stating', difficultyLevels: ['medium', 'hard'] },
          { id: 'supporting-evidence', name: 'Supporting evidence', description: 'Citing textual evidence directly supporting specific assertions', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'context-interpretation', name: 'Context interpretation', description: 'Interpreting figurative language, tone, and contextual nuance', difficultyLevels: ['medium', 'hard'] },
          { id: 'authors-purpose', name: 'Author’s purpose', description: 'Persuade, inform, entertain, criticize, or describe', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      },
      {
        id: 'Writing',
        name: 'Writing',
        description: 'Expository organization, logical coherence, and rhetorical clarity.',
        topics: [
          { id: 'sentence-construction', name: 'Sentence construction', description: 'Avoiding misplaced modifiers, maintaining clarity and parallelism', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'paragraph-structure', name: 'Paragraph structure', description: 'Topic sentences, supporting sentences, and concluding transitions', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'clarity', name: 'Clarity', description: 'Eliminating wordiness, ambiguity, and redundant phrasing', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'coherence', name: 'Coherence', description: 'Logical flow, transitional phrases, and unified paragraph ideas', difficultyLevels: ['easy', 'medium', 'hard'] },
          { id: 'punctuation', name: 'Punctuation', description: 'Commas, semicolons, colons, apostrophes, and quotation marks', difficultyLevels: ['easy', 'medium', 'hard'] }
        ]
      }
    ]
  }
];

export function getSubjects(): SubjectDefinition[] {
  return SUBJECT_CURRICULUM;
}

export function getSubjectById(subjectId: string): SubjectDefinition | undefined {
  return SUBJECT_CURRICULUM.find(s => s.id.toLowerCase() === subjectId.toLowerCase());
}

export function getCategoriesBySubject(subjectId: string): CategoryDefinition[] {
  const subj = getSubjectById(subjectId);
  return subj ? subj.categories : [];
}

export function getTopicsByCategory(subjectId: string, categoryId: string): TopicDefinition[] {
  const categories = getCategoriesBySubject(subjectId);
  const found = categories.find(c => c.name.toLowerCase() === categoryId.toLowerCase() || c.id.toLowerCase() === categoryId.toLowerCase());
  return found ? found.topics : [];
}
