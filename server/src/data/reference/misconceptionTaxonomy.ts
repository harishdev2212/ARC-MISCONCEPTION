import { ErrorType } from '@shared/types';

export interface MisconceptionItem {
  id: string;
  tag: string;
  name: string;
  category: string;
  topic: string;
  typicalErrorType: ErrorType;
  description: string;
  rootCause: string;
  exampleSnippet: string;
  socraticProbe: string;
  targetedHint: string;
  conceptualExplanation: string;
}

export const MISCONCEPTION_TAXONOMY: Record<string, MisconceptionItem> = {
  // ==========================================
  // ALGEBRA
  // ==========================================
  'operation applied to one side only': {
    id: 'misc-alg-unilateral',
    tag: 'operation applied to one side only',
    name: 'Applying Operation to Only One Side',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    typicalErrorType: 'conceptual_misconception',
    description: 'Operating on only one side of the equals sign without applying the balancing operation to the other side.',
    rootCause: 'Views the equals sign as an operator that announces an answer rather than a relational balance preserving equivalence.',
    exampleSnippet: 'Subtracted 8 from the left side to get 3x = 29 without subtracting 8 from 29.',
    socraticProbe: 'What happens to the balance of an equation if you perform an operation on one side without doing the exact same thing to the other side?',
    targetedHint: 'An equation is like a balanced scale. Whatever you subtract from the left side, you must also subtract from the right side.',
    conceptualExplanation: 'Equality means both sides hold identical mathematical value. Performing an operation on only one side breaks equivalence.'
  },
  'incorrect inverse operation': {
    id: 'misc-alg-inverse',
    tag: 'incorrect inverse operation',
    name: 'Incorrect Inverse Operation',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    typicalErrorType: 'procedural_error',
    description: 'Using the wrong inverse operation to isolate a term or variable (e.g., dividing instead of subtracting or vice versa).',
    rootCause: 'Lacks clarity on how operations bind to terms and how inverse operations undo forward operations.',
    exampleSnippet: 'Added 5 to both sides when the term was already +5.',
    socraticProbe: 'What operation is currently joining this term to the variable, and what exact operation is needed to undo it?',
    targetedHint: 'Addition is undone by subtraction, and multiplication is undone by division.',
    conceptualExplanation: 'To isolate a variable, apply inverse operations in reverse order of operations.'
  },
  'distributive property error': {
    id: 'misc-alg-distrib',
    tag: 'distributive property error',
    name: 'Distributive Property Error',
    category: 'Algebra',
    topic: 'Algebraic Expressions',
    typicalErrorType: 'conceptual_misconception',
    description: 'Multiplying an external coefficient by only the first term inside parentheses, or mismanaging signs during expansion.',
    rootCause: 'Treats parentheses as mere visual grouping rather than indicating multiplication over every term within the expression.',
    exampleSnippet: 'Solved 2(x + 3) as 2x + 3.',
    socraticProbe: 'When you multiply 2 by (x + 3), which terms inside the parentheses must be multiplied by 2?',
    targetedHint: 'The multiplier outside the brackets must be distributed to every single term inside: a(b + c) = ab + ac.',
    conceptualExplanation: 'The distributive property asserts that multiplying a sum by a number gives the same result as multiplying each addend separately by the number and adding the products.'
  },
  'combining unlike terms': {
    id: 'misc-alg-unlike-terms',
    tag: 'combining unlike terms',
    name: 'Combining Unlike Terms',
    category: 'Algebra',
    topic: 'Algebraic Expressions',
    typicalErrorType: 'conceptual_misconception',
    description: 'Adding or subtracting variable terms with constant scalar terms (e.g., 3x + 5 = 8x).',
    rootCause: 'Fails to differentiate between algebraic quantities representing unknown multiples and fixed constant scalars.',
    exampleSnippet: 'Combined 3x and 8 into 11x.',
    socraticProbe: 'Can a variable quantity like 3x (3 groups of x) be combined directly with a fixed number like 8 without knowing what x is?',
    targetedHint: 'Only like terms that share the exact same variable parts with the same exponents can be combined together.',
    conceptualExplanation: '3x represents three unknown quantities. 8 is eight single units. They cannot be summed into 11x because units must be identical.'
  },
  'sign handling error': {
    id: 'misc-alg-sign',
    tag: 'sign handling error',
    name: 'Sign Handling Error',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    typicalErrorType: 'sign_error',
    description: 'Failing to invert operational signs when moving terms across the equality or misapplying negative multiplication rules.',
    rootCause: 'Mechanical transposition ("just move it over") without understanding additive inverses.',
    exampleSnippet: 'Moved -7 across the equals sign and kept it as -7.',
    socraticProbe: 'If a term is subtracted on the left side, what inverse operation is needed to eliminate it from that side?',
    targetedHint: 'To eliminate a negative term, you must add its positive opposite to both sides.',
    conceptualExplanation: 'Transposition is shorthand for adding or subtracting opposites. -7 + 7 = 0, so +7 must appear on the opposite side.'
  },
  'incorrect factorisation': {
    id: 'misc-alg-factorisation',
    tag: 'incorrect factorisation',
    name: 'Incorrect Factorisation',
    category: 'Algebra',
    topic: 'Factorisation',
    typicalErrorType: 'conceptual_misconception',
    description: 'Factoring quadratic or polynomial expressions into binomials with product/sum errors in constants.',
    rootCause: 'Does not verify that the sum of inner/outer products reconstitutes the middle linear term.',
    exampleSnippet: 'Factored x² - 5x + 6 as (x - 6)(x + 1).',
    socraticProbe: 'When you multiply your two factors back together, do you obtain the exact middle term -5x and the constant +6?',
    targetedHint: 'For x² + bx + c, find two numbers whose product equals c and whose sum equals b.',
    conceptualExplanation: 'Expanding (x + p)(x + q) yields x² + (p + q)x + pq. Both the sum and product conditions must be simultaneously satisfied.'
  },
  'variable isolation error': {
    id: 'misc-alg-variable-isolation',
    tag: 'variable isolation error',
    name: 'Variable Isolation Error',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    typicalErrorType: 'procedural_error',
    description: 'Applying division before undoing addition or leaving coefficient attached to the target variable.',
    rootCause: 'Lack of systematic order in undoing operations (reverse PEMDAS/BODMAS).',
    exampleSnippet: 'Divided 3x + 8 = 29 by 3 to get x + 8 = 29/3.',
    socraticProbe: 'When isolating a variable, in what order should you undo addition/subtraction versus multiplication/division?',
    targetedHint: 'First undo terms added or subtracted to isolate the variable term; then divide by the coefficient.',
    conceptualExplanation: 'Reverse order of operations ensures you isolate variable terms cleanly before removing coefficients.'
  },

  // ==========================================
  // ARITHMETIC / NUMBER SYSTEM / FRACTIONS
  // ==========================================
  'incorrect common denominator': {
    id: 'misc-num-common-denom',
    tag: 'incorrect common denominator',
    name: 'Incorrect Common Denominator',
    category: 'Arithmetic / Number System',
    topic: 'Fractions',
    typicalErrorType: 'conceptual_misconception',
    description: 'Adding or subtracting fractions by adding denominators directly or choosing an invalid multiple.',
    rootCause: 'Applies whole-number additive rules to fractional parts without recognizing that denominators define partition size.',
    exampleSnippet: 'Added 1/3 + 1/4 as 2/7.',
    socraticProbe: 'What does the denominator represent in a fraction, and why must denominators match before you can add the parts?',
    targetedHint: 'The denominator names the size of each piece. You cannot add thirds and fourths directly without renaming them to a common size like twelfths.',
    conceptualExplanation: 'Fractions represent equal partitions of a whole. Adding numerators across differing denominators equates unequal partition sizes.'
  },
  'numerator/denominator confusion': {
    id: 'misc-num-num-denom',
    tag: 'numerator/denominator confusion',
    name: 'Numerator/Denominator Confusion',
    category: 'Arithmetic / Number System',
    topic: 'Fractions',
    typicalErrorType: 'conceptual_misconception',
    description: 'Inverting the role of parts taken versus total partitions, or dividing denominator by numerator.',
    rootCause: 'Lacks spatial or part-to-whole visualization of what each fraction component represents.',
    exampleSnippet: 'Interpreted 3/4 of 20 by dividing 20 by 3 and multiplying by 4.',
    socraticProbe: 'In the fraction 3/4, which number tells you how many equal parts the whole is divided into, and which tells you how many parts you have?',
    targetedHint: 'Denominator (bottom) tells how many equal parts divide the whole; numerator (top) counts how many of those parts you are considering.',
    conceptualExplanation: 'a/b means take a parts out of b total equal partitions.'
  },
  'fraction inversion error': {
    id: 'misc-num-fraction-inversion',
    tag: 'fraction inversion error',
    name: 'Fraction Inversion Error',
    category: 'Arithmetic / Number System',
    topic: 'Fractions',
    typicalErrorType: 'procedural_error',
    description: 'Failing to invert the divisor when dividing fractions, or inverting the dividend instead.',
    rootCause: 'Memorizing "keep-change-flip" without understanding why dividing by a fraction is equivalent to multiplying by its reciprocal.',
    exampleSnippet: 'Computed (2/3) ÷ (4/5) as (3/2) * (4/5).',
    socraticProbe: 'When dividing by a fraction, which fraction should be replaced by its reciprocal, and why?',
    targetedHint: 'Dividing by a fraction is equivalent to multiplying by its reciprocal: (a/b) ÷ (c/d) = (a/b) * (d/c).',
    conceptualExplanation: 'Dividing by c/d asks how many groups of c/d fit into the whole. Multiplying by d/c scales up by d and partitions by c.'
  },
  'percentage vs percentage-point confusion': {
    id: 'misc-num-pct-points',
    tag: 'percentage vs percentage-point confusion',
    name: 'Percentage vs Percentage-Point Confusion',
    category: 'Arithmetic / Number System',
    topic: 'Percentages',
    typicalErrorType: 'conceptual_misconception',
    description: 'Treating a change in percentage points as a proportional percent change of the original value.',
    rootCause: 'Confuses absolute difference between two rates with the relative percentage change.',
    exampleSnippet: 'Stated that an increase from 10% to 15% is a 5% increase instead of 50%.',
    socraticProbe: 'Is the 5% increase an absolute increase in percentage points, or a proportional increase relative to the starting 10%?',
    targetedHint: 'Going from 10% to 15% is an increase of 5 percentage points, but proportionally it is an increase of 5/10 = 50%.',
    conceptualExplanation: 'Percentage points measure arithmetic difference between two rates. Percent change measures change relative to the initial baseline.'
  },
  'incorrect base value': {
    id: 'misc-num-base-value',
    tag: 'incorrect base value',
    name: 'Incorrect Base Value',
    category: 'Arithmetic / Number System',
    topic: 'Percentages',
    typicalErrorType: 'conceptual_misconception',
    description: 'Calculating a percentage increase or decrease relative to the final value instead of the original base value.',
    rootCause: 'Fails to anchor the denominator of percentage calculation to the original starting quantity.',
    exampleSnippet: 'Calculated 20% discount on $80 after price dropped from $100.',
    socraticProbe: 'Which value was the original starting price before the change occurred?',
    targetedHint: 'Percent change is always calculated as (Change / Original Base Value) * 100.',
    conceptualExplanation: 'The base value is always the initial state before any percentage adjustment is applied.'
  },
  'sequential percentage error': {
    id: 'misc-num-sequential-pct',
    tag: 'sequential percentage error',
    name: 'Sequential Percentage Error',
    category: 'Arithmetic / Number System',
    topic: 'Percentages',
    typicalErrorType: 'conceptual_misconception',
    description: 'Adding consecutive percentage changes directly (e.g., 20% increase followed by 20% decrease equals 0% change).',
    rootCause: 'Assumes successive percentage changes apply to the initial constant base rather than the compounded intermediate value.',
    exampleSnippet: 'Argued that a price increased by 10% then decreased by 10% returns to the original price.',
    socraticProbe: 'When the price decreases by 10%, is that 10% taken from the original price or from the new increased price?',
    targetedHint: 'Each consecutive percentage applies to the updated intermediate amount, not the original starting amount.',
    conceptualExplanation: 'P * (1.10) * (0.90) = 0.99P, which represents a net 1% decrease, not 0%.'
  },

  // ==========================================
  // GEOMETRY
  // ==========================================
  'angle relationship error': {
    id: 'misc-geo-angle-rel',
    tag: 'angle relationship error',
    name: 'Angle Relationship Error',
    category: 'Geometry',
    topic: 'Lines and Angles',
    typicalErrorType: 'conceptual_misconception',
    description: 'Confusing complementary (sum 90°) with supplementary (sum 180°), or misapplying alternate interior angle equality.',
    rootCause: 'Conflating geometric vocabulary and angle theorems without geometric diagram validation.',
    exampleSnippet: 'Set two complementary angles to sum to 180° instead of 90°.',
    socraticProbe: 'What is the defined sum for two angles that are complementary versus two angles that are supplementary?',
    targetedHint: 'Complementary angles sum to 90° (a right corner). Supplementary angles sum to 180° (a straight line).',
    conceptualExplanation: 'Complementary = 90 degrees; Supplementary = 180 degrees. Parallel transversal alternate interior angles are equal only when lines are parallel.'
  },
  'shape property misconception': {
    id: 'misc-geo-shape-prop',
    tag: 'shape property misconception',
    name: 'Shape Property Misconception',
    category: 'Geometry',
    topic: 'Triangles',
    typicalErrorType: 'conceptual_misconception',
    description: 'Assuming all triangles or quadrilaterals share properties of equilateral or regular figures (e.g., assuming opposite angles equal in any trapezoid).',
    rootCause: 'Overgeneralizing properties of special symmetric shapes to general polygons.',
    exampleSnippet: 'Assumed all angles in a scalene triangle are equal to 60°.',
    socraticProbe: 'Does this theorem apply to all general triangles, or only to equilateral triangles where all three sides are equal?',
    targetedHint: 'Check whether the problem specifies an equilateral, isosceles, right, or general scalene triangle.',
    conceptualExplanation: 'Properties like 60° interior angles only apply when all side lengths are congruent.'
  },
  'formula selection error': {
    id: 'misc-geo-formula-select',
    tag: 'formula selection error',
    name: 'Formula Selection Error',
    category: 'Geometry',
    topic: 'Perimeter and Area',
    typicalErrorType: 'procedural_error',
    description: 'Using perimeter formula when area is requested, or using rectangle area (l * w) for a triangle without dividing by 2.',
    rootCause: 'Recalling mathematical formulas as detached symbols without connecting them to physical dimension and coverage.',
    exampleSnippet: 'Calculated area of a triangle with base 6 and height 4 as 6 * 4 = 24.',
    socraticProbe: 'What is the formula for the area of a triangle, and why is it half of the corresponding parallelogram?',
    targetedHint: 'The area of a triangle is (1/2) * base * height because two congruent triangles form a parallelogram.',
    conceptualExplanation: 'Area measures two-dimensional surface coverage; for triangles, that is half the product of perpendicular base and height.'
  },
  'unit confusion': {
    id: 'misc-geo-unit-confusion',
    tag: 'unit confusion',
    name: 'Unit Confusion',
    category: 'Geometry',
    topic: 'Perimeter and Area',
    typicalErrorType: 'careless_mistake',
    description: 'Mixing linear units (cm) with square units (cm²) or forgetting to convert meters to centimeters before calculating.',
    rootCause: 'Ignoring dimensional consistency across measurements.',
    exampleSnippet: 'Added 2 meters and 50 cm to get 52 meters.',
    socraticProbe: 'Are both measurements in the exact same unit, and what unit should the final area or perimeter have?',
    targetedHint: 'Convert all dimensions into the same unit (e.g., convert meters to centimeters) before performing calculations.',
    conceptualExplanation: 'Dimensions must share matching units to combine arithmetically. Area requires square units; perimeter requires linear units.'
  },

  // ==========================================
  // STATISTICS
  // ==========================================
  'mean calculation error': {
    id: 'misc-stat-mean-error',
    tag: 'mean calculation error',
    name: 'Mean Calculation Error',
    category: 'Statistics',
    topic: 'Mean',
    typicalErrorType: 'procedural_error',
    description: 'Dividing by the wrong total count, omitting zero values from the count, or computing an unweighted mean of averages.',
    rootCause: 'Views mean as an isolated formula rather than the uniform leveling distribution of total sum over total frequency.',
    exampleSnippet: 'Averaged 80% on 3 tests and 90% on 1 test by calculating (80 + 90) / 2.',
    socraticProbe: 'When calculating the mean of groups with different numbers of items, can you simply average the averages?',
    targetedHint: 'To find the mean, divide the sum of ALL individual scores by the TOTAL count of all scores.',
    conceptualExplanation: 'Weighted mean accounts for differing group sizes. Sum of all values divided by total count n.'
  },
  'median ordering error': {
    id: 'misc-stat-median-order',
    tag: 'median ordering error',
    name: 'Median Ordering Error',
    category: 'Statistics',
    topic: 'Median',
    typicalErrorType: 'procedural_error',
    description: 'Selecting the middle value of an unordered dataset without sorting values in ascending or descending sequence first.',
    rootCause: 'Equates "middle of the written list" with the 50th percentile rank value.',
    exampleSnippet: 'Found median of [9, 2, 7, 1, 5] as 7 because it is in the middle of the written array.',
    socraticProbe: 'Before finding the middle value of a data set to determine the median, what must you do to the numbers first?',
    targetedHint: 'Always arrange the numbers in numerical order from least to greatest before locating the center value.',
    conceptualExplanation: 'The median represents the 50th percentile point of an ordered distribution.'
  },
  'mode interpretation error': {
    id: 'misc-stat-mode-error',
    tag: 'mode interpretation error',
    name: 'Mode Interpretation Error',
    category: 'Statistics',
    topic: 'Mode',
    typicalErrorType: 'conceptual_misconception',
    description: 'Reporting the highest frequency count instead of the data value that appears with that frequency, or assuming a mode must always exist.',
    rootCause: 'Confuses the frequency of occurrence with the data value itself.',
    exampleSnippet: 'In the set [3, 3, 5, 8], reported mode as 2 because 3 appears 2 times.',
    socraticProbe: 'Is the mode the number of times a value repeats, or is it the actual data value that repeats most often?',
    targetedHint: 'The mode is the actual data value that appears most frequently, not its count.',
    conceptualExplanation: 'In [3, 3, 5, 8], the frequency of 3 is 2, but the mode itself is 3.'
  },
  'graph interpretation error': {
    id: 'misc-stat-graph-error',
    tag: 'graph interpretation error',
    name: 'Graph Interpretation Error',
    category: 'Statistics',
    topic: 'Data Interpretation',
    typicalErrorType: 'conceptual_misconception',
    description: 'Misreading axis labels, ignoring non-zero baseline scales, or confusing frequency with interval width on histograms.',
    rootCause: 'Superficial visual scanning without checking axis scales and units.',
    exampleSnippet: 'Looked at bar heights without noticing the vertical axis began at 50 instead of 0.',
    socraticProbe: 'What do the horizontal and vertical axes measure, and does the vertical axis begin at 0?',
    targetedHint: 'Carefully verify the axis scale, starting value, and unit intervals before reading values from the graph.',
    conceptualExplanation: 'Truncated graph axes distort visual proportions; quantitative conclusions require reading exact coordinate values.'
  },

  // ==========================================
  // PROBABILITY
  // ==========================================
  'favorable/total outcomes confusion': {
    id: 'misc-prob-fav-total',
    tag: 'favorable/total outcomes confusion',
    name: 'Favorable/Total Outcomes Confusion',
    category: 'Probability',
    topic: 'Basic Probability',
    typicalErrorType: 'conceptual_misconception',
    description: 'Writing probability as favorable over unfavorable outcomes (odds) instead of favorable over total possible outcomes.',
    rootCause: 'Conflating mathematical probability P(E) with odds ratio (favorable : unfavorable).',
    exampleSnippet: 'Stated probability of rolling a 6 on a fair die is 1/5 because there are 5 other numbers.',
    socraticProbe: 'In this probability experiment, how many total possible outcomes exist in the entire sample space?',
    targetedHint: 'Probability is defined as: Number of Favorable Outcomes / Total Possible Outcomes.',
    conceptualExplanation: 'A standard die has 6 total outcomes. Rolling a 6 is 1 favorable outcome out of 6 total, giving P = 1/6.'
  },
  'independent/dependent event confusion': {
    id: 'misc-prob-dep-indep',
    tag: 'independent/dependent event confusion',
    name: 'Independent/Dependent Event Confusion',
    category: 'Probability',
    topic: 'Probability of Events',
    typicalErrorType: 'conceptual_misconception',
    description: 'Failing to reduce total sample space during sampling without replacement, or assuming past coin flips influence future flips (gambler fallacy).',
    rootCause: 'Misunderstanding conditional probability and the independence of sequential random trials.',
    exampleSnippet: 'Drew a marble from a bag without replacement and kept the denominator the same on the second draw.',
    socraticProbe: 'When a card or marble is removed and NOT replaced, how does that change the total number of items remaining?',
    targetedHint: 'Without replacement, the total count in the denominator decreases by 1 for the subsequent draw.',
    conceptualExplanation: 'Dependent events modify the sample space of subsequent trials. Independent events (like coin tosses) reset with identical probabilities.'
  },
  'complement probability error': {
    id: 'misc-prob-complement',
    tag: 'complement probability error',
    name: 'Complement Probability Error',
    category: 'Probability',
    topic: 'Probability of Events',
    typicalErrorType: 'procedural_error',
    description: 'Calculating the probability of an event NOT happening by subtracting from 100 instead of 1, or confusing P(A) with 1 - P(A).',
    rootCause: 'Mixing decimal/fraction probability scale [0, 1] with percentage scale [0, 100].',
    exampleSnippet: 'Subtracted 0.35 from 100 instead of 1.',
    socraticProbe: 'If probability is expressed as a decimal or fraction, what is the maximum total probability of all possibilities combined?',
    targetedHint: 'The sum of all probabilities in a sample space equals 1. Therefore, P(Not A) = 1 - P(A).',
    conceptualExplanation: 'The complement rule states P(A\') = 1 - P(A) in fractional/decimal representation.'
  },

  // ==========================================
  // TRIGONOMETRY
  // ==========================================
  'wrong trigonometric ratio': {
    id: 'misc-trig-wrong-ratio',
    tag: 'wrong trigonometric ratio',
    name: 'Wrong Trigonometric Ratio',
    category: 'Trigonometry',
    topic: 'Trigonometric Ratios',
    typicalErrorType: 'conceptual_misconception',
    description: 'Confusing sine, cosine, and tangent ratios (e.g., setting sin = adjacent/hypotenuse or tan = adjacent/opposite).',
    rootCause: 'Imprecise recall of right-triangle definitions relative to the reference angle.',
    exampleSnippet: 'Used sin(θ) = adjacent / hypotenuse to solve for opposite side.',
    socraticProbe: 'Relative to angle θ, what is the exact definition of sine, cosine, and tangent in terms of opposite, adjacent, and hypotenuse?',
    targetedHint: 'Remember SOH CAH TOA: Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent.',
    conceptualExplanation: 'Trigonometric ratios are defined by the specific side relationships to the acute angle of interest.'
  },
  'opposite/adjacent confusion': {
    id: 'misc-trig-opp-adj',
    tag: 'opposite/adjacent confusion',
    name: 'Opposite/Adjacent Confusion',
    category: 'Trigonometry',
    topic: 'Right Triangle Problems',
    typicalErrorType: 'conceptual_misconception',
    description: 'Identifying sides as fixed "horizontal" or "vertical" rather than orienting relative to the specific acute angle chosen.',
    rootCause: 'Static visual orientation rather than angle-relative relational thinking.',
    exampleSnippet: 'Called the base adjacent when solving for the top acute angle.',
    socraticProbe: 'If you look directly across the triangle from the angle you are evaluating, which side is opposite to it?',
    targetedHint: 'The opposite side is across from your angle. The adjacent side forms the angle along with the hypotenuse.',
    conceptualExplanation: 'Opposite and adjacent are relative descriptors that invert depending on which acute angle you reference.'
  },
  'degree/radian confusion': {
    id: 'misc-trig-deg-rad',
    tag: 'degree/radian confusion',
    name: 'Degree/Radian Confusion',
    category: 'Trigonometry',
    topic: 'Trigonometric Identities',
    typicalErrorType: 'careless_mistake',
    description: 'Evaluating trigonometric functions in radian mode when degrees were given, or using 180 instead of π radians.',
    rootCause: 'Calculator mode oversight or failure to convert angular units.',
    exampleSnippet: 'Computed sin(30) in radian mode getting -0.988 instead of 0.5.',
    socraticProbe: 'Is the given angle measurement in degrees or radians, and is your calculation tool set to matching angular units?',
    targetedHint: 'Ensure angle units match: 180° = π radians. sin(30°) = 0.5, whereas sin(30 radians) is completely different.',
    conceptualExplanation: 'Degrees partition a full rotation into 360 units; radians measure arc length on a unit circle.'
  },

  // ==========================================
  // ARITHMETIC / CALCULATION ERRORS (Separation from Conceptual Misconception)
  // ==========================================
  'arithmetic error': {
    id: 'err-arithmetic-slip',
    tag: 'arithmetic error',
    name: 'Arithmetic Calculation Slip',
    category: 'General',
    topic: 'Calculation',
    typicalErrorType: 'arithmetic_error',
    description: 'A minor computational slip in basic addition, subtraction, multiplication, or division while the algebraic reasoning and steps were completely valid.',
    rootCause: 'Cognitive load or computational haste, distinct from conceptual confusion.',
    exampleSnippet: 'Reasoned 3x = 29 - 8, wrote 3x = 20 instead of 21.',
    socraticProbe: 'Your algebraic steps and logic are correct! Can you double-check your arithmetic in the calculation step?',
    targetedHint: 'Check the arithmetic: what is the exact numerical result of your calculation?',
    conceptualExplanation: 'Your conceptual reasoning was sound; this was simply a minor calculation slip.'
  }
};
