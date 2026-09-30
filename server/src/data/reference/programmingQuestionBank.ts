import { Question } from '@shared/types';

export const PROGRAMMING_QUESTIONS: Question[] = [
  // =========================================================================
  // 1. PROGRAMMING FUNDAMENTALS - LOOPS & BOUNDARIES
  // =========================================================================
  {
    id: 'PROG-LOOP-001',
    subject: 'Programming',
    category: 'Programming Fundamentals',
    topic: 'Loops',
    difficulty: 'easy',
    format: 'predict_output',
    codeSnippet: `for(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}`,
    question: `What will this code print?\n\nfor(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}`,
    expectedAnswer: '0 1 2 3 4',
    concept: 'loop_boundaries',
    concepts: ['loop_initialization', 'exclusive_boundary', 'zero_indexing'],
    misconceptionTags: ['Loop boundary misunderstanding', 'One-based indexing assumption', 'Off-by-one error'],
    prompt: 'Predict the exact sequence printed by the loop. Explain how the initial value and condition i < 5 govern the output.',
    instructions: 'Trace the value of i from its initialization until the termination condition is met.',
    referenceSolutionSteps: [
      'i starts at 0, condition 0 < 5 is true -> prints 0, increments to 1.',
      'Prints 1, 2, 3, 4 sequentially.',
      'When i reaches 5, 5 < 5 is false -> loop terminates without printing 5.',
      'Output is: 0, 1, 2, 3, 4.'
    ],
    commonMisconceptions: ['PROG-LOOP-INCLUSIVE-EXCLUSIVE', 'PROG-ZERO-INDEX-SKIP'],
    conceptId: 'concept-prog-loops',
    isTransferQuestion: false
  },
  {
    id: 'PROG-LOOP-002',
    subject: 'Programming',
    category: 'Programming Fundamentals',
    topic: 'Loops',
    difficulty: 'medium',
    format: 'find_the_bug',
    codeSnippet: `int count = 1;\nwhile(count <= 10) {\n    System.out.println(count);\n    // Missing count++\n}`,
    question: 'A programmer intended to print numbers 1 to 10 using this while loop. What bug exists in this code and what will happen when executed?',
    expectedAnswer: 'The loop variable count is never incremented, resulting in an infinite loop printing 1 forever.',
    concept: 'infinite_loop',
    concepts: ['loop_termination', 'state_update', 'while_condition'],
    misconceptionTags: ['Missing state mutation', 'Infinite loop misconception'],
    prompt: 'Identify why the loop does not terminate and explain the required fix.',
    instructions: 'Check the update condition of the loop control variable.',
    referenceSolutionSteps: [
      'Notice count is initialized to 1.',
      'Inside the loop body, count is printed but never updated.',
      'count <= 10 remains true indefinitely, producing an infinite loop.',
      'Fix: Add count++; inside the while block.'
    ],
    commonMisconceptions: ['PROG-MISSING-INCREMENT'],
    conceptId: 'concept-prog-loops',
    isTransferQuestion: false
  },
  {
    id: 'PROG-COND-001',
    subject: 'Programming',
    category: 'Programming Fundamentals',
    topic: 'Conditional statements',
    difficulty: 'easy',
    format: 'find_the_bug',
    codeSnippet: `int score = 85;\nif(score = 100) {\n    System.out.println("Perfect score!");\n}`,
    question: 'Explain what is wrong with the condition if(score = 100). How should it be written in Java/C++/C#?',
    expectedAnswer: 'Single equals (=) is an assignment operator, not a comparison operator. It must be double equals (==): if(score == 100).',
    concept: 'assignment_vs_equality',
    concepts: ['equality_operator', 'assignment_operator', 'syntax_distinction'],
    misconceptionTags: ['Assignment vs equality confusion', 'Syntax operator confusion'],
    prompt: 'Distinguish between the assignment operator and equality comparison operator.',
    instructions: 'Explain the error and provide the syntactically correct conditional statement.',
    referenceSolutionSteps: [
      'In languages like Java, C, C++, = assigns a value, while == tests for equality.',
      'if(score = 100) attempts to assign 100 to score instead of comparing.',
      'Correct syntax is if(score == 100).'
    ],
    commonMisconceptions: ['PROG-ASSIGN-VS-EQUALITY'],
    conceptId: 'concept-prog-conditionals',
    isTransferQuestion: false
  },
  {
    id: 'PROG-VAR-001',
    subject: 'Programming',
    category: 'Programming Fundamentals',
    topic: 'Variables',
    difficulty: 'easy',
    format: 'predict_output',
    codeSnippet: `int a = 10;\nint b = a;\na = 20;\nSystem.out.println(b);`,
    question: 'What is the output of this code snippet? Explain why b is or is not affected when a changes.',
    expectedAnswer: '10. Primitive types are assigned by value (copied), so reassigning a to 20 does not affect b.',
    concept: 'pass_by_value_primitives',
    concepts: ['variable_copy', 'primitive_assignment', 'memory_independence'],
    misconceptionTags: ['Reference vs value confusion', 'Variable linkage misconception'],
    prompt: 'Determine the value printed for b. Explain whether b maintains a dynamic link to a.',
    instructions: 'Analyze the value stored in memory for primitive integer variables.',
    referenceSolutionSteps: [
      'a is assigned the primitive value 10.',
      'b is assigned a copy of the current value of a (10).',
      'a is reassigned to 20; b remains 10.',
      'Prints 10.'
    ],
    commonMisconceptions: ['PROG-PRIMITIVE-LINKAGE'],
    conceptId: 'concept-prog-variables',
    isTransferQuestion: false
  },

  // =========================================================================
  // 2. DATA STRUCTURES - ARRAYS, STRINGS, STACKS
  // =========================================================================
  {
    id: 'PROG-ARR-001',
    subject: 'Programming',
    category: 'Data Structures',
    topic: 'Arrays',
    difficulty: 'medium',
    format: 'find_the_bug',
    codeSnippet: `int[] arr = {10, 20, 30, 40, 50};\nfor(int i = 0; i <= arr.length; i++) {\n    System.out.println(arr[i]);\n}`,
    question: 'What error will occur when running this array traversal loop? Why does it occur?',
    expectedAnswer: 'ArrayIndexOutOfBoundsException (or runtime error). Arrays are 0-indexed, so valid indices are 0 to arr.length - 1. When i == arr.length (5), arr[5] does not exist.',
    concept: 'array_bounds',
    concepts: ['zero_indexing', 'array_length', 'out_of_bounds'],
    misconceptionTags: ['Off-by-one array indexing', 'Inclusive length bound misconception'],
    prompt: 'Identify the exact index error in the loop condition i <= arr.length.',
    instructions: 'Relate the size of the array to its valid highest index.',
    referenceSolutionSteps: [
      'The array has length 5 with valid indices 0, 1, 2, 3, 4.',
      'The loop condition i <= arr.length permits i to reach 5.',
      'Accessing arr[5] throws an ArrayIndexOutOfBoundsException.',
      'Correct condition: i < arr.length.'
    ],
    commonMisconceptions: ['PROG-ARRAY-INCLUSIVE-LENGTH'],
    conceptId: 'concept-prog-arrays',
    isTransferQuestion: false
  },
  {
    id: 'PROG-STR-001',
    subject: 'Programming',
    category: 'Data Structures',
    topic: 'Strings',
    difficulty: 'easy',
    format: 'predict_output',
    codeSnippet: `String s = "hello";\ns.toUpperCase();\nSystem.out.println(s);`,
    question: 'What will this code print? Explain why s is not printed in uppercase.',
    expectedAnswer: '"hello". Strings are immutable. toUpperCase() returns a new string and does not modify s in place.',
    concept: 'string_immutability',
    concepts: ['immutability', 'return_value_discarding', 'string_methods'],
    misconceptionTags: ['In-place string mutation misconception', 'Ignoring return value'],
    prompt: 'Explain the concept of string immutability in relation to method return values.',
    instructions: 'Evaluate whether string methods modify the calling object or return a new instance.',
    referenceSolutionSteps: [
      'Strings in Java/Python/C# are immutable.',
      's.toUpperCase() generates and returns a new String object "HELLO", but does not reassign s.',
      's still references "hello", so System.out.println(s) prints "hello".',
      'To update: s = s.toUpperCase();'
    ],
    commonMisconceptions: ['PROG-STRING-INPLACE-MUTATION'],
    conceptId: 'concept-prog-strings',
    isTransferQuestion: false
  },
  {
    id: 'PROG-STACK-001',
    subject: 'Programming',
    category: 'Data Structures',
    topic: 'Stacks',
    difficulty: 'easy',
    format: 'multiple_choice',
    options: [
      'A) First In, First Out (FIFO)',
      'B) Last In, First Out (LIFO)',
      'C) Random Access',
      'D) First In, Never Out'
    ],
    question: 'What fundamental ordering principle governs a Stack data structure?',
    expectedAnswer: 'B) Last In, First Out (LIFO)',
    concept: 'lifo_principle',
    concepts: ['stack_order', 'lifo', 'push_pop'],
    misconceptionTags: ['Stack vs Queue FIFO/LIFO confusion'],
    prompt: 'Identify the ordering model of a stack and compare it to a cafeteria tray dispenser.',
    instructions: 'Select the principle where the most recently added item is the first removed.',
    referenceSolutionSteps: [
      'A stack operates on Last-In, First-Out (LIFO).',
      'The last element pushed onto the stack is the first element popped off.',
      'Queues use First-In, First-Out (FIFO).'
    ],
    commonMisconceptions: ['PROG-STACK-QUEUE-CONFUSION'],
    conceptId: 'concept-prog-stacks',
    isTransferQuestion: false
  },

  // =========================================================================
  // 3. ALGORITHMS - SEARCHING, SORTING, RECURSION, COMPLEXITY
  // =========================================================================
  {
    id: 'PROG-ALG-001',
    subject: 'Programming',
    category: 'Algorithms',
    topic: 'Searching',
    difficulty: 'medium',
    format: 'explain_code',
    question: 'Can binary search be performed on an unsorted array? Explain why or why not, detailing the fundamental prerequisite for binary search.',
    expectedAnswer: 'No. Binary search requires the array to be sorted. It eliminates half the remaining elements by comparing the target with the middle element. Without sorted order, this elimination property fails.',
    concept: 'binary_search_precondition',
    concepts: ['sorted_array_requirement', 'divide_and_conquer', 'halving_search_space'],
    misconceptionTags: ['Binary search on unsorted data misconception', 'Algorithmic prerequisite violation'],
    prompt: 'Explain the essential prerequisite of binary search and why unsorted data invalidates the algorithm.',
    instructions: 'Describe the middle comparison decision and how sorted order guarantees the target direction.',
    referenceSolutionSteps: [
      'Binary search calculates middle index mid and checks if target < arr[mid] or target > arr[mid].',
      'In a sorted array, if target < arr[mid], the target CANNOT be in the right half.',
      'If the array is unsorted, elements smaller than arr[mid] could reside anywhere, invalidating the halving property.'
    ],
    commonMisconceptions: ['PROG-BINARY-SEARCH-UNSORTED'],
    conceptId: 'concept-prog-search',
    isTransferQuestion: false
  },
  {
    id: 'PROG-REC-001',
    subject: 'Programming',
    category: 'Algorithms',
    topic: 'Recursion',
    difficulty: 'hard',
    format: 'find_the_bug',
    codeSnippet: `int factorial(int n) {\n    return n * factorial(n - 1);\n}`,
    question: 'What happens when calling factorial(5) with this function definition? What critical component of recursion is missing?',
    expectedAnswer: 'StackOverflowError (infinite recursion). The base case (if n <= 1 return 1;) is missing, so the function recurses indefinitely into negative values of n.',
    concept: 'recursive_base_case',
    concepts: ['base_case', 'call_stack_overflow', 'recursive_termination'],
    misconceptionTags: ['Missing base case misconception', 'Infinite recursion'],
    prompt: 'Identify the missing base condition and explain why infinite recursion overflows the call stack.',
    instructions: 'Point out what condition should halt the recursive calls.',
    referenceSolutionSteps: [
      'Every recursive function requires a base case to terminate execution.',
      'Without a base case, factorial(5) calls factorial(4), ..., factorial(0), factorial(-1) indefinitely.',
      'Each call places a frame on the call stack until memory is exhausted (StackOverflowError).',
      'Fix: Add if (n <= 1) return 1; at the beginning of the function.'
    ],
    commonMisconceptions: ['PROG-RECURSION-NO-BASE-CASE'],
    conceptId: 'concept-prog-recursion',
    isTransferQuestion: false
  },
  {
    id: 'PROG-COMP-001',
    subject: 'Programming',
    category: 'Algorithms',
    topic: 'Time complexity',
    difficulty: 'medium',
    format: 'predict_output',
    codeSnippet: `for(int i = 0; i < n; i++) {\n    for(int j = 0; j < n; j++) {\n        System.out.println(i + ", " + j);\n    }\n}`,
    question: 'What is the Big-O time complexity of these nested loops in terms of n? Explain your reasoning.',
    expectedAnswer: 'O(n²). The outer loop runs n times, and for each iteration, the inner loop runs n times, giving n * n = n² operations.',
    concept: 'nested_loop_complexity',
    concepts: ['big_o_notation', 'nested_loops', 'quadratic_complexity'],
    misconceptionTags: ['Adding nested loop complexity (O(2n)) instead of multiplying (O(n²))', 'Complexity calculation error'],
    prompt: 'Determine the time complexity of the nested loops and explain whether iterations add or multiply.',
    instructions: 'Calculate the total count of print executions as a function of n.',
    referenceSolutionSteps: [
      'Outer loop executes n times.',
      'For each single step of the outer loop, inner loop executes n times.',
      'Total operations = n * n = n².',
      'Time complexity is O(n²).'
    ],
    commonMisconceptions: ['PROG-NESTED-LOOP-ADDITION'],
    conceptId: 'concept-prog-complexity',
    isTransferQuestion: false
  },

  // =========================================================================
  // 4. OBJECT ORIENTED PROGRAMMING - CLASSES, OBJECTS, INHERITANCE
  // =========================================================================
  {
    id: 'PROG-OOP-001',
    subject: 'Programming',
    category: 'Object Oriented Programming',
    topic: 'Classes and Objects',
    difficulty: 'easy',
    format: 'explain_code',
    question: 'Explain the fundamental difference between a Class and an Object in object-oriented programming.',
    expectedAnswer: 'A Class is a blueprint or template defining attributes and methods. An Object is a concrete instance of that class created in memory with specific state values.',
    concept: 'class_vs_object',
    concepts: ['blueprint_vs_instance', 'instantiation', 'memory_allocation'],
    misconceptionTags: ['Class and object equivalence misconception', 'Abstract concept confusion'],
    prompt: 'Articulate the relationship between a class blueprint and an instantiated object.',
    instructions: 'Use an analogy (such as architectural blueprint vs built house) to clarify.',
    referenceSolutionSteps: [
      'A class defines the structure: variables and methods that any instance will possess.',
      'An object is instantiated using the new keyword and occupies active memory.',
      'Multiple independent objects can be created from a single class blueprint.'
    ],
    commonMisconceptions: ['PROG-CLASS-OBJECT-CONFLATION'],
    conceptId: 'concept-prog-oop',
    isTransferQuestion: false
  },
  {
    id: 'PROG-OOP-002',
    subject: 'Programming',
    category: 'Object Oriented Programming',
    topic: 'Inheritance',
    difficulty: 'medium',
    format: 'find_the_bug',
    codeSnippet: `class Animal {\n    private String name;\n}\nclass Dog extends Animal {\n    void bark() {\n        System.out.println(name + " barks!"); // Compile error\n    }\n}`,
    question: 'Why does the subclass Dog fail to compile when accessing name? How can the access modifier in Animal be modified to allow subclass access without making it public to everyone?',
    expectedAnswer: 'name is declared private in Animal, which restricts access solely to Animal. Change private to protected (or provide a public getter) to allow subclasses to access it.',
    concept: 'access_modifiers_inheritance',
    concepts: ['private_modifier', 'protected_modifier', 'subclass_encapsulation'],
    misconceptionTags: ['Private member inheritance misconception', 'Access modifier confusion'],
    prompt: 'Explain why private members are not accessible in derived classes and specify the appropriate modifier.',
    instructions: 'Clarify the visibility boundaries of private, protected, and public.',
    referenceSolutionSteps: [
      'private fields are encapsulated within the declaring class and cannot be directly referenced by subclasses.',
      'protected visibility permits access within the class, its subclasses, and package members.',
      'Changing private String name; to protected String name; resolves the compilation error.'
    ],
    commonMisconceptions: ['PROG-PRIVATE-ACCESSIBLE-IN-SUBCLASS'],
    conceptId: 'concept-prog-oop',
    isTransferQuestion: false
  },

  // =========================================================================
  // 5. DEBUGGING - OFF-BY-ONE, LOGICAL, RUNTIME ERRORS
  // =========================================================================
  {
    id: 'PROG-DEBUG-001',
    subject: 'Programming',
    category: 'Debugging',
    topic: 'Off-by-one errors',
    difficulty: 'medium',
    format: 'debug_code',
    codeSnippet: `// Intended to return the sum of numbers 1 to N inclusive\nint sumToN(int n) {\n    int sum = 0;\n    for(int i = 1; i < n; i++) {\n        sum += i;\n    }\n    return sum;\n}`,
    question: 'A student wrote sumToN(5) expecting 1 + 2 + 3 + 4 + 5 = 15, but the function returned 10. Identify the off-by-one bug and write the corrected loop statement.',
    expectedAnswer: 'The loop condition is i < n, which stops before adding n (5). It should be i <= n: for(int i = 1; i <= n; i++).',
    concept: 'off_by_one_boundary',
    concepts: ['inclusive_loop_bound', 'loop_termination', 'off_by_one'],
    misconceptionTags: ['Exclusive upper bound on inclusive calculation', 'Off-by-one error'],
    prompt: 'Explain why sumToN(5) excluded 5 and provide the corrected loop header.',
    instructions: 'Compare the termination condition i < n against the requirement "1 to N inclusive".',
    referenceSolutionSteps: [
      'The loop condition i < n terminates as soon as i reaches n.',
      'For n = 5, values of i added are 1, 2, 3, 4 (sum = 10), omitting 5.',
      'Change condition to i <= n to include 5, giving sum = 15.'
    ],
    commonMisconceptions: ['PROG-OFF-BY-ONE-INCLUSIVE'],
    conceptId: 'concept-prog-debugging',
    isTransferQuestion: false
  },
  {
    id: 'PROG-DEBUG-002',
    subject: 'Programming',
    category: 'Debugging',
    topic: 'Runtime errors',
    difficulty: 'easy',
    format: 'find_the_bug',
    codeSnippet: `String name = null;\nSystem.out.println(name.length());`,
    question: 'What runtime exception will be thrown by this code, and why?',
    expectedAnswer: 'NullPointerException. Attempting to invoke a method (.length()) on a reference variable that points to null throws a NullPointerException.',
    concept: 'null_pointer_exception',
    concepts: ['null_reference', 'method_invocation_on_null', 'runtime_safety'],
    misconceptionTags: ['Null reference method dereferencing misconception', 'Runtime error'],
    prompt: 'Explain what happens when invoking methods on an uninstantiated null reference.',
    instructions: 'Identify the specific exception and describe how null references operate in memory.',
    referenceSolutionSteps: [
      'name points to null, meaning it references no object in heap memory.',
      'Invoking .length() attempts to dereference null.',
      'The runtime throws a NullPointerException.'
    ],
    commonMisconceptions: ['PROG-NULL-DEREFERENCE'],
    conceptId: 'concept-prog-debugging',
    isTransferQuestion: false
  }
];
