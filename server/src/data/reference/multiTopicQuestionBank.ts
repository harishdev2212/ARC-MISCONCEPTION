import { Question } from '@shared/types';

export const LINEAR_EQUATIONS_CONCEPT_ID = 'concept-linear-eq-multistep';

/**
 * Multi-Topic Mathematics Question Bank
 * Structured according to the MindTrace Question Schema:
 * {
 *   id, subject, category, topic, difficulty, question, expectedAnswer,
 *   concepts: string[], misconceptionTags: string[], ...
 * }
 */
export const MULTI_TOPIC_QUESTIONS: Question[] = [
  // =========================================================================
  // 1. ALGEBRA
  // =========================================================================
  {
    id: 'ALG-LIN-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    difficulty: 'medium',
    question: 'Solve 3x + 8 = 29',
    equation: '3x + 8 = 29',
    expectedAnswer: '7',
    expectedFinalAnswer: 'x = 7',
    concepts: ['inverse operations', 'bilateral operations', 'equation balance'],
    misconceptionTags: ['operation applied to one side only', 'incorrect inverse operation', 'arithmetic error'],
    prompt: 'Solve 3x + 8 = 29. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'State each algebraic operation and justify why applying it to both sides keeps the equation balanced.',
    referenceSolutionSteps: [
      'Subtract 8 from both sides: 3x + 8 - 8 = 29 - 8.',
      'Simplify: 3x = 21.',
      'Divide both sides by 3: x = 7.',
      'Check: 3(7) + 8 = 29.'
    ],
    commonMisconceptions: ['EQ-UNILATERAL-OP', 'EQ-INVERSE-OP-ERR'],
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    isTransferQuestion: false
  },
  {
    id: 'ALG-LIN-002',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    difficulty: 'medium',
    question: 'A student solved 2(x + 3) = 14 as 2x + 3 = 14, then 2x = 11, x = 5.5. What went wrong in their reasoning?',
    equation: '2(x + 3) = 14',
    expectedAnswer: 'They forgot to distribute the 2 to the 3 inside the parentheses; it should be 2x + 6 = 14.',
    expectedFinalAnswer: 'x = 4',
    concepts: ['distributive property', 'grouping', 'order of operations'],
    misconceptionTags: ['distributive property error', 'incomplete distribution'],
    prompt: 'Analyze the student work on 2(x + 3) = 14. What went wrong in their reasoning, and what is the correct solution?',
    instructions: 'Identify the exact misconception and provide the mathematically sound correction.',
    referenceSolutionSteps: [
      'Identify that 2 multiplies the entire grouping (x + 3).',
      'Apply distributive property: 2(x) + 2(3) = 2x + 6 = 14.',
      'Subtract 6 from both sides: 2x = 8.',
      'Divide by 2: x = 4.'
    ],
    commonMisconceptions: ['EQ-INCOMPLETE-DISTRIB'],
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    isTransferQuestion: false
  },
  {
    id: 'ALG-LIN-003',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Linear Equations in One Variable',
    difficulty: 'hard',
    question: 'Solve 5x - 14 = 2x + 13',
    equation: '5x - 14 = 2x + 13',
    expectedAnswer: '9',
    expectedFinalAnswer: 'x = 9',
    concepts: ['variables on both sides', 'additive inverse', 'variable isolation'],
    misconceptionTags: ['sign handling error', 'operation applied to one side only', 'combining unlike terms'],
    prompt: 'Solve 5x - 14 = 2x + 13. Articulate your complete mathematical reasoning step-by-step.',
    instructions: 'Gather variable terms on one side and constants on the other while maintaining equivalence.',
    referenceSolutionSteps: [
      'Subtract 2x from both sides: 3x - 14 = 13.',
      'Add 14 to both sides: 3x = 27.',
      'Divide both sides by 3: x = 9.',
      'Verify: 5(9) - 14 = 31 and 2(9) + 13 = 31.'
    ],
    commonMisconceptions: ['EQ-SIGN-INVERT', 'EQ-UNILATERAL-OP'],
    conceptId: LINEAR_EQUATIONS_CONCEPT_ID,
    isTransferQuestion: false
  },
  {
    id: 'ALG-QUAD-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Quadratic Equations',
    difficulty: 'medium',
    question: 'Solve x² - 5x + 6 = 0 by factorisation.',
    equation: 'x^2 - 5x + 6 = 0',
    expectedAnswer: 'x = 2 or x = 3',
    expectedFinalAnswer: 'x = 2, 3',
    concepts: ['factorisation', 'zero product property', 'quadratic roots'],
    misconceptionTags: ['incorrect factorisation', 'sign handling error'],
    prompt: 'Solve x² - 5x + 6 = 0 by factorisation. Explain how you find the factors and apply the zero product property.',
    instructions: 'Show the binomial factors and how setting each factor to zero determines the solutions.',
    referenceSolutionSteps: [
      'Find two numbers whose product is +6 and whose sum is -5: these are -2 and -3.',
      'Write in factored form: (x - 2)(x - 3) = 0.',
      'Apply zero product property: x - 2 = 0 or x - 3 = 0.',
      'Solve for x: x = 2 or x = 3.'
    ],
    commonMisconceptions: ['QUAD-FACTOR-SIGN'],
    conceptId: 'concept-algebra-quadratics',
    isTransferQuestion: false
  },
  {
    id: 'ALG-EXP-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Exponents and Powers',
    difficulty: 'easy',
    question: 'Simplify (2x³)(4x⁵). A student wrote 8x¹⁵. Explain why this is incorrect and give the correct answer.',
    equation: '(2x^3)(4x^5)',
    expectedAnswer: '8x^8. Powers with the same base add exponents (3 + 5 = 8), not multiply.',
    expectedFinalAnswer: '8x^8',
    concepts: ['product of powers rule', 'exponential laws', 'base and exponent'],
    misconceptionTags: ['multiplying exponents instead of adding', 'exponent rule confusion'],
    prompt: 'Simplify (2x³)(4x⁵). Explain the rule for multiplying powers with the same base.',
    instructions: 'Multiply the coefficients and apply the correct exponent rule for like bases.',
    referenceSolutionSteps: [
      'Multiply numerical coefficients: 2 * 4 = 8.',
      'Apply product rule for powers with the same base x: x³ * x⁵ = x^(3 + 5) = x⁸.',
      'Result: 8x⁸.'
    ],
    commonMisconceptions: ['EXP-MULT-POWERS'],
    conceptId: 'concept-algebra-exponents',
    isTransferQuestion: false
  },

  // =========================================================================
  // 2. ARITHMETIC / NUMBER SYSTEM
  // =========================================================================
  {
    id: 'NUM-FRAC-001',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Fractions',
    difficulty: 'easy',
    question: 'A student added 1/3 + 1/4 and wrote 2/7. Explain what went wrong with their reasoning and calculate the correct sum.',
    equation: '1/3 + 1/4',
    expectedAnswer: '7/12. They added numerators and denominators directly instead of finding a common denominator (12).',
    expectedFinalAnswer: '7/12',
    concepts: ['common denominator', 'fraction addition', 'part-to-whole equivalence'],
    misconceptionTags: ['incorrect common denominator', 'incorrect fraction addition', 'numerator/denominator confusion'],
    prompt: 'Evaluate the sum 1/3 + 1/4. Explain why denominators cannot simply be added together.',
    instructions: 'Identify a common denominator, convert both fractions, and explain the conceptual reasoning.',
    referenceSolutionSteps: [
      'Explain that 1/3 and 1/4 represent different partition sizes, so they cannot be combined directly.',
      'Find the least common multiple of 3 and 4, which is 12.',
      'Convert 1/3 to 4/12 and 1/4 to 3/12.',
      'Add numerators: 4/12 + 3/12 = 7/12.'
    ],
    commonMisconceptions: ['FRAC-DIRECT-ADD-DENOM'],
    conceptId: 'concept-arithmetic-fractions',
    isTransferQuestion: false
  },
  {
    id: 'NUM-FRAC-002',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Fractions',
    difficulty: 'medium',
    question: 'Calculate (3/4) ÷ (2/5). Articulate why dividing by a fraction involves multiplying by its reciprocal.',
    equation: '(3/4) / (2/5)',
    expectedAnswer: '15/8 or 1 7/8',
    expectedFinalAnswer: '15/8',
    concepts: ['fraction division', 'reciprocal', 'multiplicative inverse'],
    misconceptionTags: ['fraction inversion error', 'numerator/denominator confusion'],
    prompt: 'Compute (3/4) ÷ (2/5). Explain step-by-step why multiplying by the reciprocal yields the correct quotient.',
    instructions: 'Show the conversion to multiplication by the reciprocal and compute the final simplified fraction.',
    referenceSolutionSteps: [
      'Recognize that dividing by 2/5 is equivalent to multiplying by its reciprocal 5/2.',
      'Multiply numerators: 3 * 5 = 15.',
      'Multiply denominators: 4 * 2 = 8.',
      'Result: 15/8 or 1 7/8.'
    ],
    commonMisconceptions: ['FRAC-INVERSION-WRONG-TERM'],
    conceptId: 'concept-arithmetic-fractions',
    isTransferQuestion: false
  },
  {
    id: 'NUM-PCT-001',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Percentages',
    difficulty: 'medium',
    question: 'A jacket originally priced at $100 is marked down by 20%. The following week, the discounted price is increased by 20%. A customer claims the jacket is back to $100. Are they correct? Explain why or why not.',
    equation: '100 * (1 - 0.20) * (1 + 0.20)',
    expectedAnswer: 'No, the jacket is now $96. The 20% increase applies to the new base price of $80, which is only an increase of $16, not $20.',
    expectedFinalAnswer: '$96',
    concepts: ['base value', 'sequential percentages', 'proportional change'],
    misconceptionTags: ['sequential percentage error', 'incorrect base value'],
    prompt: 'Determine the final price of the jacket and evaluate the customer’s reasoning.',
    instructions: 'Calculate the intermediate discounted price, then apply the percentage increase to the new base.',
    referenceSolutionSteps: [
      'Calculate 20% discount on $100: $100 - $20 = $80.',
      'Calculate 20% increase on the new base of $80: 0.20 * $80 = $16.',
      'Final price: $80 + $16 = $96.',
      'Explain that sequential percentages apply to updated intermediate values, not the original starting price.'
    ],
    commonMisconceptions: ['PCT-SEQUENTIAL-ADD'],
    conceptId: 'concept-arithmetic-percentages',
    isTransferQuestion: false
  },
  {
    id: 'NUM-RAT-001',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Ratio and Proportion',
    difficulty: 'easy',
    question: 'A recipe uses a ratio of 2 cups of sugar for every 5 cups of flour. If a baker uses 15 cups of flour, how many cups of sugar are needed? Explain the proportional relationship.',
    equation: '2 / 5 = x / 15',
    expectedAnswer: '6 cups of sugar',
    expectedFinalAnswer: '6',
    concepts: ['equivalent ratios', 'scaling factor', 'unit rate'],
    misconceptionTags: ['arithmetic error', 'incorrect cross multiplication'],
    prompt: 'Find the required cups of sugar and explain how you established the constant ratio.',
    instructions: 'Set up a proportion or identify the scaling multiplier from 5 to 15.',
    referenceSolutionSteps: [
      'Identify the ratio of sugar to flour: 2 : 5.',
      'Determine the scale factor: 15 / 5 = 3.',
      'Multiply the sugar by the scale factor: 2 * 3 = 6 cups of sugar.',
      'Check proportion: 2/5 = 6/15.'
    ],
    commonMisconceptions: ['RATIO-ADDITIVE-MISCONCEPTION'],
    conceptId: 'concept-arithmetic-ratio',
    isTransferQuestion: false
  },

  // =========================================================================
  // 3. GEOMETRY
  // =========================================================================
  {
    id: 'GEO-ANG-001',
    subject: 'Mathematics',
    category: 'Geometry',
    topic: 'Lines and Angles',
    difficulty: 'easy',
    question: 'Two angles are complementary. One angle measures 35°. A student calculates the other angle as 180° - 35° = 145°. Identify the student’s misconception and provide the correct angle.',
    equation: 'x + 35 = 90',
    expectedAnswer: '55°. The student confused complementary angles (sum to 90°) with supplementary angles (sum to 180°).',
    expectedFinalAnswer: '55°',
    concepts: ['complementary angles', 'supplementary angles', 'angle definitions'],
    misconceptionTags: ['angle relationship error', 'formula selection error'],
    prompt: 'Identify the error in the student’s angle calculation and find the correct measurement.',
    instructions: 'Clarify the difference between complementary and supplementary angle relationships.',
    referenceSolutionSteps: [
      'Define complementary angles: two angles whose measures sum to 90 degrees.',
      'Identify student error: used 180 degrees, which is the definition for supplementary angles.',
      'Calculate correct measure: 90° - 35° = 55°.'
    ],
    commonMisconceptions: ['GEO-COMP-SUPP-CONFUSION'],
    conceptId: 'concept-geometry-angles',
    isTransferQuestion: false
  },
  {
    id: 'GEO-TRI-001',
    subject: 'Mathematics',
    category: 'Geometry',
    topic: 'Triangles',
    difficulty: 'medium',
    question: 'In a triangle, the interior angles are 40° and 75°. What is the measure of the exterior angle adjacent to the third angle? Explain using the Exterior Angle Theorem.',
    equation: 'exterior_angle = 40 + 75',
    expectedAnswer: '115°. By the Exterior Angle Theorem, an exterior angle equals the sum of the two opposite remote interior angles (40° + 75° = 115°).',
    expectedFinalAnswer: '115°',
    concepts: ['exterior angle theorem', 'triangle angle sum', 'supplementary exterior pair'],
    misconceptionTags: ['angle relationship error', 'shape property misconception'],
    prompt: 'Find the exterior angle and articulate why it equals the sum of the remote interior angles.',
    instructions: 'Use the Exterior Angle Theorem or find the third interior angle and its linear supplement.',
    referenceSolutionSteps: [
      'Method 1: By the Exterior Angle Theorem, exterior angle = 40° + 75° = 115°.',
      'Method 2: Third interior angle = 180° - (40° + 75°) = 65°. Exterior angle is supplementary: 180° - 65° = 115°.'
    ],
    commonMisconceptions: ['TRI-EXTERIOR-THEOREM-CONFUSION'],
    conceptId: 'concept-geometry-triangles',
    isTransferQuestion: false
  },
  {
    id: 'GEO-AREA-001',
    subject: 'Mathematics',
    category: 'Geometry',
    topic: 'Perimeter and Area',
    difficulty: 'easy',
    question: 'A right-angled triangle has a base of 6 cm, a perpendicular height of 8 cm, and a hypotenuse of 10 cm. A student calculates the area as 6 * 8 = 48 cm². What did the student forget?',
    equation: 'Area = (1/2) * 6 * 8',
    expectedAnswer: '24 cm². The student used the rectangle area formula and forgot to divide by 2 for the triangle.',
    expectedFinalAnswer: '24 cm²',
    concepts: ['triangle area', 'base and height', 'two-dimensional coverage'],
    misconceptionTags: ['formula selection error', 'shape property misconception'],
    prompt: 'Identify the missing step in the student’s area calculation and provide the correct area.',
    instructions: 'State the correct area formula for a triangle and explain why it is half of a rectangle.',
    referenceSolutionSteps: [
      'Recall area formula for a triangle: Area = (1/2) * base * height.',
      'Substitute values: (1/2) * 6 cm * 8 cm = 24 cm².',
      'Explain that multiplying base by height gives the area of the entire enclosing rectangle; the triangle occupies exactly half that area.'
    ],
    commonMisconceptions: ['GEO-TRI-AREA-NO-HALF'],
    conceptId: 'concept-geometry-area',
    isTransferQuestion: false
  },

  // =========================================================================
  // 4. MENSURATION
  // =========================================================================
  {
    id: 'MEN-VOL-001',
    subject: 'Mathematics',
    category: 'Mensuration',
    topic: 'Volume',
    difficulty: 'medium',
    question: 'A cylindrical water tank has radius r = 7 m and height h = 10 m. Using π ≈ 22/7, calculate the volume of water the tank can hold.',
    equation: 'V = pi * r^2 * h',
    expectedAnswer: '1540 m³',
    expectedFinalAnswer: '1540 m³',
    concepts: ['cylinder volume', 'cross-sectional area', 'three-dimensional capacity'],
    misconceptionTags: ['formula selection error', 'unit confusion', 'arithmetic error'],
    prompt: 'Calculate the volume of the cylinder and explain the relationship between base area and height.',
    instructions: 'Calculate the circular base area first, then multiply by the vertical height.',
    referenceSolutionSteps: [
      'Base area = π * r² = (22/7) * 7² = (22/7) * 49 = 154 m².',
      'Volume = Base Area * Height = 154 m² * 10 m = 1540 m³.',
      'Include correct cubic units (m³).'
    ],
    commonMisconceptions: ['MEN-SURFACE-AREA-CONFUSION'],
    conceptId: 'concept-mensuration-volume',
    isTransferQuestion: false
  },

  // =========================================================================
  // 5. STATISTICS
  // =========================================================================
  {
    id: 'STAT-MED-001',
    subject: 'Mathematics',
    category: 'Statistics',
    topic: 'Median',
    difficulty: 'easy',
    question: 'Given the dataset: 9, 2, 7, 1, 5. A student states that the median is 7 because 7 is the number written in the center of the list. What was their error, and what is the true median?',
    equation: 'ordered: 1, 2, 5, 7, 9',
    expectedAnswer: '5. The student forgot to sort the dataset in numerical order before finding the middle value.',
    expectedFinalAnswer: '5',
    concepts: ['median', 'ordered array', 'percentile rank'],
    misconceptionTags: ['median ordering error', 'procedural error'],
    prompt: 'Explain the procedural requirement for calculating the median and determine the correct value.',
    instructions: 'Sort the dataset in ascending order and select the middle value.',
    referenceSolutionSteps: [
      'Explain that median is the middle value of an ORDERED dataset.',
      'Sort the values from least to greatest: 1, 2, 5, 7, 9.',
      'Locate the middle value at position (5 + 1)/2 = 3rd element: 5.',
      'True median is 5.'
    ],
    commonMisconceptions: ['STAT-MEDIAN-UNSORTED'],
    conceptId: 'concept-statistics-median',
    isTransferQuestion: false
  },
  {
    id: 'STAT-MEAN-001',
    subject: 'Mathematics',
    category: 'Statistics',
    topic: 'Mean',
    difficulty: 'medium',
    question: 'A student scored 80 on each of their first 3 math quizzes, and 100 on their 4th quiz. A classmate calculated their average as (80 + 100) / 2 = 90. Is this calculation correct? Explain why or why not.',
    equation: 'mean = (80 * 3 + 100) / 4',
    expectedAnswer: 'No, the correct average is 85. They averaged the two distinct scores instead of dividing the total sum of all 4 quizzes (340) by 4.',
    expectedFinalAnswer: '85',
    concepts: ['weighted mean', 'total sum divided by total count', 'data frequency'],
    misconceptionTags: ['mean calculation error', 'incorrect base value'],
    prompt: 'Evaluate the classmate’s average calculation and provide the mathematically valid mean score.',
    instructions: 'Sum all four individual scores and divide by the total count of quizzes.',
    referenceSolutionSteps: [
      'Calculate the sum of all quiz scores: 80 + 80 + 80 + 100 = 340.',
      'Divide by the total number of quizzes: 340 / 4 = 85.',
      'Explain that simply averaging 80 and 100 ignores the fact that 80 occurred 3 times as often as 100.'
    ],
    commonMisconceptions: ['STAT-AVERAGE-OF-AVERAGES'],
    conceptId: 'concept-statistics-mean',
    isTransferQuestion: false
  },

  // =========================================================================
  // 6. PROBABILITY
  // =========================================================================
  {
    id: 'PROB-BASIC-001',
    subject: 'Mathematics',
    category: 'Probability',
    topic: 'Basic Probability',
    difficulty: 'easy',
    question: 'A fair 6-sided die is rolled. A student says: "The probability of rolling a 4 is 1/5 because there is 1 four and 5 other numbers." Explain why this reasoning is flawed and state the true probability.',
    equation: 'P(4) = 1 / 6',
    expectedAnswer: '1/6. The student wrote the odds ratio (favorable over unfavorable) instead of favorable outcomes over TOTAL possible outcomes (6).',
    expectedFinalAnswer: '1/6',
    concepts: ['sample space', 'favorable outcomes', 'probability definition'],
    misconceptionTags: ['favorable/total outcomes confusion', 'odds vs probability confusion'],
    prompt: 'Identify the flaw in the student’s definition of probability and state the correct fraction.',
    instructions: 'Specify the total sample space of outcomes and the ratio of favorable to total outcomes.',
    referenceSolutionSteps: [
      'Define probability: P(Event) = (Number of favorable outcomes) / (Total possible outcomes in sample space).',
      'The sample space S = {1, 2, 3, 4, 5, 6}, which contains 6 total equally likely outcomes.',
      'Rolling a 4 is 1 favorable outcome out of 6 total.',
      'P(4) = 1/6.'
    ],
    commonMisconceptions: ['PROB-FAVORABLE-VS-UNFAVORABLE'],
    conceptId: 'concept-probability-basic',
    isTransferQuestion: false
  },
  {
    id: 'PROB-EVENT-001',
    subject: 'Mathematics',
    category: 'Probability',
    topic: 'Probability of Events',
    difficulty: 'medium',
    question: 'A bag contains 4 red marbles and 6 blue marbles. Two marbles are drawn one after another WITHOUT replacement. What is the probability that both marbles are red?',
    equation: 'P(Red and Red) = (4/10) * (3/9)',
    expectedAnswer: '12/90 = 2/15',
    expectedFinalAnswer: '2/15',
    concepts: ['dependent events', 'sampling without replacement', 'compound probability'],
    misconceptionTags: ['independent/dependent event confusion', 'favorable/total outcomes confusion'],
    prompt: 'Compute the probability of drawing two red marbles without replacement. Explain how the second draw is affected.',
    instructions: 'Calculate the probability for the first draw, update the remaining counts, and multiply.',
    referenceSolutionSteps: [
      'First draw: 4 red out of 10 total marbles -> P(Red 1) = 4/10.',
      'Since the marble is NOT replaced, there are now 3 red marbles out of 9 total marbles remaining.',
      'Second draw: P(Red 2 | Red 1) = 3/9 = 1/3.',
      'Multiply sequential probabilities: (4/10) * (3/9) = 12/90 = 2/15.'
    ],
    commonMisconceptions: ['PROB-DEPENDENT-NOT-UPDATING-TOTAL'],
    conceptId: 'concept-probability-events',
    isTransferQuestion: false
  },

  // =========================================================================
  // 7. TRIGONOMETRY
  // =========================================================================
  {
    id: 'TRIG-RAT-001',
    subject: 'Mathematics',
    category: 'Trigonometry',
    topic: 'Trigonometric Ratios',
    difficulty: 'easy',
    question: 'In a right triangle with acute angle θ, the side opposite θ has length 3 and the hypotenuse has length 5. A student writes cos(θ) = 3/5. What mistake did they make, and what is the correct value of sin(θ)?',
    equation: 'sin(theta) = 3/5, cos(theta) = 4/5',
    expectedAnswer: 'They used cosine instead of sine. Opposite over hypotenuse is sin(θ) = 3/5.',
    expectedFinalAnswer: 'sin(theta) = 3/5',
    concepts: ['sine ratio', 'cosine ratio', 'right triangle trigonometry'],
    misconceptionTags: ['wrong trigonometric ratio', 'opposite/adjacent confusion'],
    prompt: 'Identify the trigonometric ratio error and state the correct definition for sin(θ).',
    instructions: 'Clarify the distinction between sine (opposite/hypotenuse) and cosine (adjacent/hypotenuse).',
    referenceSolutionSteps: [
      'Recall definitions: sin(θ) = Opposite / Hypotenuse, cos(θ) = Adjacent / Hypotenuse.',
      'Given that 3 is the OPPOSITE side and 5 is the hypotenuse, the ratio 3/5 represents sin(θ), not cos(θ).',
      'The adjacent side by Pythagorean theorem is √(5² - 3²) = 4, so cos(θ) = 4/5.'
    ],
    commonMisconceptions: ['TRIG-SIN-COS-INVERSION'],
    conceptId: 'concept-trigonometry-ratios',
    isTransferQuestion: false
  },
  {
    id: 'TRIG-RIGHT-001',
    subject: 'Mathematics',
    category: 'Trigonometry',
    topic: 'Right Triangle Problems',
    difficulty: 'hard',
    question: 'A 10-meter ladder leans against a vertical wall, making an angle of 60° with the level ground. How high up the wall does the ladder reach? (Use sin(60°) = √3 / 2 ≈ 0.866).',
    equation: 'h = 10 * sin(60 deg)',
    expectedAnswer: '5√3 meters ≈ 8.66 meters',
    expectedFinalAnswer: '8.66 m',
    concepts: ['trigonometric application', 'angle of elevation', 'right triangle modeling'],
    misconceptionTags: ['wrong trigonometric ratio', 'opposite/adjacent confusion', 'formula selection error'],
    prompt: 'Determine the height reached by the ladder using the appropriate trigonometric ratio.',
    instructions: 'Set up the right triangle where the ladder is the hypotenuse and the wall is the opposite side.',
    referenceSolutionSteps: [
      'Identify the components: ladder length = Hypotenuse = 10 m.',
      'Height on wall = Opposite side to 60° ground angle.',
      'Select trigonometric ratio: sin(60°) = Opposite / Hypotenuse = h / 10.',
      'Solve for h: h = 10 * sin(60°) = 10 * (√3 / 2) = 5√3 ≈ 8.66 m.'
    ],
    commonMisconceptions: ['TRIG-COS-FOR-HEIGHT'],
    conceptId: 'concept-trigonometry-right-triangles',
    isTransferQuestion: false
  },

  // =========================================================================
  // 8. FUNCTIONS
  // =========================================================================
  {
    id: 'FUNC-DOM-001',
    subject: 'Mathematics',
    category: 'Functions',
    topic: 'Domain and Range',
    difficulty: 'medium',
    question: 'Find the domain of the function f(x) = 1 / (x - 4). A student claims the domain is all real numbers. Explain why they are incorrect.',
    equation: 'x != 4',
    expectedAnswer: 'All real numbers except x = 4. When x = 4, the denominator becomes 0, which is undefined.',
    expectedFinalAnswer: 'All real numbers except 4',
    concepts: ['domain', 'undefined division by zero', 'rational functions'],
    misconceptionTags: ['conceptual_misconception', 'incomplete_reasoning'],
    prompt: 'Determine the restrictions on the domain of f(x) = 1 / (x - 4) and explain why division by zero is undefined.',
    instructions: 'Identify any input values of x that result in an undefined mathematical expression.',
    referenceSolutionSteps: [
      'Examine the denominator: x - 4.',
      'Division by zero is mathematically undefined, so x - 4 ≠ 0.',
      'Solve restriction: x ≠ 4.',
      'The domain consists of all real numbers except x = 4.'
    ],
    commonMisconceptions: ['FUNC-DOMAIN-DIV-ZERO-IGNORE'],
    conceptId: 'concept-functions-domain',
    isTransferQuestion: false
  },

  // =========================================================================
  // ADDITIONAL ALGEBRA TOPICS
  // =========================================================================
  {
    id: 'ALG-SIM-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Simultaneous Equations',
    difficulty: 'medium',
    question: 'Solve the system of equations:\n2x + y = 10\nx - y = 2',
    equation: '2x + y = 10 and x - y = 2',
    expectedAnswer: 'x = 4, y = 2',
    expectedFinalAnswer: 'x = 4, y = 2',
    concepts: ['simultaneous equations', 'elimination method', 'systems of linear equations'],
    misconceptionTags: ['Elimination sign error', 'Incomplete system resolution'],
    prompt: 'Solve the system of equations using elimination or substitution. Show both variable values.',
    instructions: 'Add or subtract equations to eliminate one variable, then solve for the other.',
    referenceSolutionSteps: [
      'Add the two equations: (2x + y) + (x - y) = 10 + 2 -> 3x = 12.',
      'Divide by 3: x = 4.',
      'Substitute x = 4 into second equation: 4 - y = 2 -> y = 2.',
      'Check: 2(4) + 2 = 10 (valid) and 4 - 2 = 2 (valid).'
    ],
    commonMisconceptions: ['SIM-EQ-SIGN-ADD-SUBTRACT'],
    conceptId: 'concept-algebra-simultaneous',
    isTransferQuestion: false
  },
  {
    id: 'ALG-FACT-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Factorisation',
    difficulty: 'easy',
    question: 'Factorise completely: x² - 9',
    equation: 'x^2 - 9',
    expectedAnswer: '(x - 3)(x + 3)',
    expectedFinalAnswer: '(x - 3)(x + 3)',
    concepts: ['difference of two squares', 'algebraic identities', 'binomial factors'],
    misconceptionTags: ['Difference of squares sign error', 'Treating (x - 3)^2 as x^2 - 9'],
    prompt: 'Factorise the binomial expression using the difference of two squares identity.',
    instructions: 'Recall a² - b² = (a - b)(a + b).',
    referenceSolutionSteps: [
      'Recognize x² is a perfect square and 9 = 3².',
      'Apply difference of squares formula: a² - b² = (a - b)(a + b).',
      'Factored form is (x - 3)(x + 3).'
    ],
    commonMisconceptions: ['DIFF-SQUARES-SQUARED-BINOMIAL'],
    conceptId: 'concept-algebra-factorisation',
    isTransferQuestion: false
  },
  {
    id: 'ALG-INEQ-001',
    subject: 'Mathematics',
    category: 'Algebra',
    topic: 'Inequalities',
    difficulty: 'medium',
    question: 'Solve the inequality: -3x < 12. A student wrote x < -4. What rule did they forget?',
    equation: '-3x < 12',
    expectedAnswer: 'x > -4. When dividing or multiplying an inequality by a negative number (-3), the inequality sign must be reversed.',
    expectedFinalAnswer: 'x > -4',
    concepts: ['inequality direction reversal', 'negative multiplier', 'order preservation'],
    misconceptionTags: ['Inequality sign flip omission on negative division', 'Procedural inequality error'],
    prompt: 'Solve -3x < 12 and explain why dividing by a negative number inverts the inequality relation.',
    instructions: 'Show the operation applied to both sides and state the sign reversal rule.',
    referenceSolutionSteps: [
      'Divide both sides by -3.',
      'Recall: Multiplying or dividing an inequality by a negative number inverts the order relation.',
      '-3x / -3 > 12 / -3.',
      'Result: x > -4.'
    ],
    commonMisconceptions: ['INEQ-NEGATIVE-SIGN-FLIP'],
    conceptId: 'concept-algebra-inequalities',
    isTransferQuestion: false
  },

  // =========================================================================
  // ADDITIONAL ARITHMETIC TOPICS
  // =========================================================================
  {
    id: 'NUM-PROFIT-001',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Profit and Loss',
    difficulty: 'medium',
    question: 'A merchant buys an item for $80 and sells it for $100. A student calculates the profit percentage as (20 / 100) * 100 = 20%. Explain their misconception and calculate the true profit percentage.',
    equation: 'Profit % = (20 / 80) * 100',
    expectedAnswer: '25%. Profit percentage must always be calculated over the Cost Price ($80), not the Selling Price ($100). (20 / 80) * 100 = 25%.',
    expectedFinalAnswer: '25%',
    concepts: ['cost price base', 'profit percentage formula', 'base value representation'],
    misconceptionTags: ['Profit percentage over selling price instead of cost price', 'Base value error'],
    prompt: 'Determine the true profit percentage and clarify which base value must be used.',
    instructions: 'Compute Profit = SP - CP, then divide by CP.',
    referenceSolutionSteps: [
      'Cost Price (CP) = $80, Selling Price (SP) = $100.',
      'Profit = $100 - $80 = $20.',
      'Profit percentage = (Profit / Cost Price) * 100% = (20 / 80) * 100% = 25%.',
      'Using Selling Price as denominator is a conceptual base error.'
    ],
    commonMisconceptions: ['PROFIT-PERCENT-ON-SELLING-PRICE'],
    conceptId: 'concept-arithmetic-profit-loss',
    isTransferQuestion: false
  },
  {
    id: 'NUM-SI-001',
    subject: 'Mathematics',
    category: 'Arithmetic / Number System',
    topic: 'Simple Interest',
    difficulty: 'easy',
    question: 'Calculate the Simple Interest on a principal of $1000 invested at an annual interest rate of 5% for 3 years.',
    equation: 'SI = (P * R * T) / 100',
    expectedAnswer: '$150',
    expectedFinalAnswer: '$150',
    concepts: ['simple interest formula', 'principal rate time', 'linear accumulation'],
    misconceptionTags: ['Arithmetic error', 'Interest formula confusion'],
    prompt: 'Calculate the simple interest accumulated using the formula I = (P * R * T) / 100.',
    instructions: 'Multiply principal by annual rate and total years.',
    referenceSolutionSteps: [
      'Identify values: P = 1000, R = 5, T = 3.',
      'SI = (1000 * 5 * 3) / 100 = 15000 / 100 = $150.',
      'Total accumulated interest is $150.'
    ],
    commonMisconceptions: ['SI-FORMULA-CALCULATION-ERROR'],
    conceptId: 'concept-arithmetic-interest',
    isTransferQuestion: false
  },

  // =========================================================================
  // ADDITIONAL GEOMETRY TOPICS
  // =========================================================================
  {
    id: 'GEO-QUAD-001',
    subject: 'Mathematics',
    category: 'Geometry',
    topic: 'Quadrilaterals',
    difficulty: 'easy',
    question: 'What is the sum of the interior angles of any quadrilateral? Explain how dividing a quadrilateral with a diagonal demonstrates this.',
    equation: 'Sum = (4 - 2) * 180 = 360',
    expectedAnswer: '360°. A single diagonal divides any quadrilateral into two non-overlapping triangles, each having an interior angle sum of 180° (2 * 180° = 360°).',
    expectedFinalAnswer: '360°',
    concepts: ['quadrilateral interior angle sum', 'polygon triangulation', 'geometric proof'],
    misconceptionTags: ['Angle sum confusion', 'Confusing triangle sum with quadrilateral sum'],
    prompt: 'State the interior angle sum of a quadrilateral and justify it using triangle decomposition.',
    instructions: 'Draw a diagonal from one vertex and sum the angles of the resulting triangles.',
    referenceSolutionSteps: [
      'Draw one diagonal connecting opposite vertices of the quadrilateral.',
      'This partitions the quadrilateral into 2 distinct triangles.',
      'Each triangle possesses interior angles summing to 180°.',
      'Total angle sum = 2 * 180° = 360°.'
    ],
    commonMisconceptions: ['QUAD-ANGLE-SUM-CONFUSION'],
    conceptId: 'concept-geometry-quadrilaterals',
    isTransferQuestion: false
  },
  {
    id: 'GEO-CIRC-001',
    subject: 'Mathematics',
    category: 'Geometry',
    topic: 'Circles',
    difficulty: 'easy',
    question: 'A circle has diameter d = 14 cm. A student calculates the circumference as C = 2 * π * 14 = 28π cm. What was their mistake?',
    equation: 'C = pi * d = 2 * pi * r',
    expectedAnswer: 'They used the diameter in place of the radius in the formula 2πr. The circumference is π * d = 14π cm (or 2 * π * 7 = 14π ≈ 44 cm).',
    expectedFinalAnswer: '14π cm ≈ 44 cm',
    concepts: ['radius vs diameter', 'circumference formula', 'circle perimeter'],
    misconceptionTags: ['Confusing radius with diameter in circumference formula', 'Formula parameter confusion'],
    prompt: 'Point out the radius vs diameter confusion in the student’s calculation and state the correct circumference.',
    instructions: 'Recall that radius r is half of diameter d (r = d / 2).',
    referenceSolutionSteps: [
      'Circumference formula is C = 2πr or C = πd.',
      'The student used C = 2πd, which doubles the true circumference.',
      'Given d = 14 cm, r = 7 cm. True C = 2 * π * 7 = 14π cm (≈ 44 cm with π = 22/7).'
    ],
    commonMisconceptions: ['CIRC-RADIUS-DIAMETER-CONFUSION'],
    conceptId: 'concept-geometry-circles',
    isTransferQuestion: false
  },

  // =========================================================================
  // COORDINATE GEOMETRY
  // =========================================================================
  {
    id: 'COORD-SLOPE-001',
    subject: 'Mathematics',
    category: 'Coordinate Geometry',
    topic: 'Slope',
    difficulty: 'medium',
    question: 'Find the slope of the line passing through points (2, 3) and (6, 11). A student calculated m = (6 - 2) / (11 - 3) = 4/8 = 1/2. What error did they make?',
    equation: 'm = (11 - 3) / (6 - 2) = 8 / 4 = 2',
    expectedAnswer: 'm = 2. The student calculated run over rise (Δx / Δy) instead of rise over run (Δy / Δx). Slope is m = (y₂ - y₁) / (x₂ - x₁) = (11 - 3) / (6 - 2) = 8 / 4 = 2.',
    expectedFinalAnswer: 'm = 2',
    concepts: ['slope formula', 'rise over run', 'rate of change in coordinate plane'],
    misconceptionTags: ['Inverting slope formula (delta x / delta y)', 'Slope calculation error'],
    prompt: 'Identify the coordinate inversion in the student’s slope calculation and determine the correct slope.',
    instructions: 'Use the standard slope definition m = (y₂ - y₁) / (x₂ - x₁).',
    referenceSolutionSteps: [
      'Slope definition: m = (Change in y) / (Change in x) = (y₂ - y₁) / (x₂ - x₁).',
      'The student placed Δx in the numerator and Δy in the denominator.',
      'Correct calculation: (11 - 3) / (6 - 2) = 8 / 4 = 2.'
    ],
    commonMisconceptions: ['COORD-SLOPE-INVERSION'],
    conceptId: 'concept-coord-slope',
    isTransferQuestion: false
  },
  {
    id: 'COORD-DIST-001',
    subject: 'Mathematics',
    category: 'Coordinate Geometry',
    topic: 'Distance between points',
    difficulty: 'easy',
    question: 'Calculate the distance between points (1, 2) and (4, 6) in the Cartesian plane.',
    equation: 'd = sqrt((4 - 1)^2 + (6 - 2)^2) = sqrt(3^2 + 4^2) = sqrt(25) = 5',
    expectedAnswer: '5',
    expectedFinalAnswer: '5',
    concepts: ['distance formula', 'pythagorean theorem in coordinates', 'euclidean distance'],
    misconceptionTags: ['Coordinate subtraction error', 'Square root arithmetic slip'],
    prompt: 'Find the distance between the two points using the Pythagorean coordinate distance formula.',
    instructions: 'Compute horizontal and vertical differences, square them, sum, and take the square root.',
    referenceSolutionSteps: [
      'Distance d = √((x₂ - x₁)² + (y₂ - y₁)²).',
      'Horizontal change: 4 - 1 = 3.',
      'Vertical change: 6 - 2 = 4.',
      'd = √(3² + 4²) = √(9 + 16) = √25 = 5.'
    ],
    commonMisconceptions: ['COORD-DISTANCE-ARITHMETIC'],
    conceptId: 'concept-coord-distance',
    isTransferQuestion: false
  },

  // =========================================================================
  // ADDITIONAL STATISTICS TOPICS
  // =========================================================================
  {
    id: 'STAT-MODE-001',
    subject: 'Mathematics',
    category: 'Statistics',
    topic: 'Mode',
    difficulty: 'easy',
    question: 'Find the mode of the dataset: 3, 7, 3, 9, 2, 3, 7, 5. Explain what the mode represents.',
    equation: 'Frequency: 3 appears 3 times, 7 appears 2 times',
    expectedAnswer: '3. The mode is the value that appears most frequently in a dataset; 3 occurs three times, which is more than any other value.',
    expectedFinalAnswer: '3',
    concepts: ['mode definition', 'frequency distribution', 'unimodal data'],
    misconceptionTags: ['Confusing mode with median or mean', 'Frequency counting error'],
    prompt: 'Determine the mode of the dataset and define how mode differs from mean and median.',
    instructions: 'Count the frequency of each distinct number in the dataset.',
    referenceSolutionSteps: [
      'Count occurrences of each number: 2: 1 time, 3: 3 times, 5: 1 time, 7: 2 times, 9: 1 time.',
      'The number with the greatest frequency is 3 (appears 3 times).',
      'Mode = 3.'
    ],
    commonMisconceptions: ['STAT-CONFUSING-MODE-MEDIAN'],
    conceptId: 'concept-stat-mode',
    isTransferQuestion: false
  }
];

/**
 * Returns all available questions, combining multi-topic questions with canonical linear equations questions.
 */
export function getAllCurriculumQuestions(): Question[] {
  return MULTI_TOPIC_QUESTIONS;
}

