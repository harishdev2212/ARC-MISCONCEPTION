import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { 
  LearnerConceptState, 
  StudentResponse, 
  Diagnosis, 
  Intervention, 
  RecoveryAttempt,
  TeacherNote,
  TeacherRemediationAssignment,
  DiagnosisCategory,
  RecommendedIntervention,
  ErrorType,
  MultiTopicStudentProgress,
  TeacherCohortAnalytics,
  TeacherMisconceptionAnalyticsItem,
  MathCategory,
  TopicMastery,
  SubjectType,
  SubjectMasteryInfo,
  AppNotification,
  NotificationType,
  NotificationCategory
} from '@shared/types';
import { LINEAR_EQUATIONS_CONCEPT } from '../reference/curriculum';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'teacher';
  gradeLevel?: string;
  subject?: string;
  department?: string;
  school?: string;
  isDemo?: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface ActivityRecord {
  id: string;
  type: string;
  title: string;
  equation?: string;
  timestamp: string;
  outcome: string;
  status: 'info' | 'warning' | 'success' | 'pending';
}

export interface DiagnosticRecord {
  id: string;
  studentId: string;
  question: string;
  studentAnswer: string;
  studentReasoning?: string;
  correctAnswer?: string;
  isCorrect?: boolean;
  result?: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  misconception?: string;
  recommendedAction?: string;
  subject?: SubjectType | string;
  concept?: string;
  category?: string;
  topic?: string;
  errorType?: ErrorType | string;
  misconceptionTag?: string;
  diagnosis: DiagnosisCategory;
  confidence: number;
  evidence: string;
  recommendedIntervention: RecommendedIntervention;
  timestamp: string;
  responseId?: string;
  diagnosisId?: string;
  interventionId?: string;
  teacherReviewed?: boolean;
}

export interface DatabaseSchema {
  users: UserRecord[];
  learnerStates: Record<string, LearnerConceptState>;
  recentActivities: Record<string, ActivityRecord[]>;
  diagnosticRecords: DiagnosticRecord[];
  studentResponses: Record<string, StudentResponse>;
  diagnoses: Record<string, Diagnosis>;
  interventions: Record<string, Intervention>;
  recoveryAttempts: Record<string, RecoveryAttempt[]>;
  teacherNotes: Record<string, TeacherNote[]>;
  remediationAssignments: Record<string, TeacherRemediationAssignment[]>;
  notifications: AppNotification[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.join(__dirname, 'mindtrace.json');

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    this.ensureDemoData();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          users: parsed.users || [],
          learnerStates: parsed.learnerStates || {},
          recentActivities: parsed.recentActivities || {},
          diagnosticRecords: parsed.diagnosticRecords || [],
          studentResponses: parsed.studentResponses || {},
          diagnoses: parsed.diagnoses || {},
          interventions: parsed.interventions || {},
          recoveryAttempts: parsed.recoveryAttempts || {},
          teacherNotes: parsed.teacherNotes || {},
          remediationAssignments: parsed.remediationAssignments || {},
          notifications: parsed.notifications || []
        };
      }
    } catch (err) {
      console.error('[DB] Failed to read database file, initializing clean database:', err);
    }

    const defaultData: DatabaseSchema = {
      users: [],
      learnerStates: {},
      recentActivities: {},
      diagnosticRecords: [],
      studentResponses: {},
      diagnoses: {},
      interventions: {},
      recoveryAttempts: {},
      teacherNotes: {},
      remediationAssignments: {},
      notifications: []
    };

    this.saveToFile(defaultData);
    return defaultData;
  }

  private save(): void {
    this.saveToFile(this.data);
  }

  private saveToFile(data: DatabaseSchema): void {
    try {
      if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname, { recursive: true });
      }
      const tmpPath = `${DB_FILE_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_FILE_PATH);
    } catch (err) {
      console.error('[DB] Failed to persist database to disk:', err);
    }
  }

  // ==========================================
  // Demo Data Seeding (Multi-Subject Diagnostic Data)
  // ==========================================
  private ensureDemoData(): void {
    let modified = false;

    // 1. Seed Demo Teacher
    const demoTeacherEmail = 'teacher@mindtrace.ai';
    if (!this.findUserByEmail(demoTeacherEmail)) {
      const demoTeacher: UserRecord = {
        id: 'demo_teacher',
        name: 'Dr. Evelyn Reed',
        email: demoTeacherEmail,
        passwordHash: bcrypt.hashSync('teacher123', 10),
        role: 'teacher',
        subject: 'Multi-Subject Cognitive Diagnostics',
        department: 'Cognitive Science & Education',
        school: 'MindTrace Learning Academy',
        isDemo: true,
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      this.data.users.push(demoTeacher);
      modified = true;
    }

    // 2. Define the 6 Realistic Demo Students with Diverse Multi-Subject Profiles (Section 18)
    const demoStudentConfigs = [
      {
        id: 'demo_student',
        name: 'Alex Rivera',
        email: 'student@mindtrace.ai',
        gradeLevel: 'Grade 11',
        records: [
          // Mathematics (Strong: ~85%)
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'inverse_operations', question: 'Solve: 3x + 7 = 22', answer: 'x = 5', reasoning: 'Subtract 7 from both sides to get 3x = 15, then divide both sides by 3 to get x = 5.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 5' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'parentheses_distribution', question: 'Solve: 4(2x - 3) = 2x + 18', answer: 'x = 5', reasoning: 'Distribute 4: 8x - 12 = 2x + 18. Subtract 2x: 6x - 12 = 18. Add 12: 6x = 30. Divide by 6: x = 5.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 5' },
          { subject: 'Mathematics' as SubjectType, category: 'Geometry', topic: 'Triangles', concept: 'triangle_angle_sum', question: 'Two angles of a triangle are 65° and 45°. Find the third angle.', answer: '70°', reasoning: '180 - (65 + 45) = 180 - 110 = 70°.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '70°' },
          { subject: 'Mathematics' as SubjectType, category: 'Arithmetic', topic: 'Percentages', concept: 'percentage_calculation', question: 'Find 15% of 80.', answer: '12', reasoning: '0.15 * 80 = 12.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '12' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'arithmetic_calculation', question: 'Solve: 2x + 8 = 20', answer: 'x = 5', reasoning: '20 - 8 = 10, then 10 / 2 = 5.', isCorrect: false, errorType: 'arithmetic_error' as ErrorType, evidence: 'Student made calculation slip 20 - 8 = 10 instead of 12, but algebraic method was correct.', expectedAnswer: 'x = 6' },
          
          // Programming (Weak: ~40% - Loop boundary misunderstanding)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_boundary_condition', question: 'What will this loop print?\nfor(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}', answer: '1 2 3 4 5', reasoning: 'The loop starts at 1 and counts up to 5.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Loop boundary misunderstanding', evidence: 'Student included upper boundary 5 even though condition is i < 5, and missed index 0.', expectedAnswer: '0 1 2 3 4', recommendedAction: 'Explain inclusive vs exclusive loop conditions and 0-indexing.' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_termination', question: 'How many times will this loop execute?\nfor(int i = 0; i <= 10; i += 2)', answer: '5 times', reasoning: '10 divided by 2 is 5, so it runs 5 times.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Off-by-one loop execution count', evidence: 'Failed to count initial i = 0 iteration (executes for 0, 2, 4, 6, 8, 10 = 6 times).', expectedAnswer: '6 times', recommendedAction: 'Trace loop variable states in a table starting from i = 0.' },
          { subject: 'Programming' as SubjectType, category: 'Data Structures', topic: 'Arrays', concept: 'array_bounds', question: 'What happens when executing:\nint[] arr = new int[5];\narr[5] = 10;', answer: 'Assigns 10 to the last slot', reasoning: 'The array has size 5 so index 5 is the last element.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Array index out-of-bounds misconception', evidence: 'Confused array length (5) with valid index range (0 to 4), throwing ArrayIndexOutOfBoundsException.', expectedAnswer: 'ArrayIndexOutOfBoundsException (Index 5 out of bounds for length 5)', recommendedAction: 'Emphasize that 0-indexed arrays of size N have indices 0 to N-1.' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Variables', concept: 'variable_assignment', question: 'What is the value of y?\nint x = 10;\nint y = x + 5;', answer: '15', reasoning: '10 + 5 = 15.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '15' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Conditional statements', concept: 'conditional_branching', question: 'What does this print?\nint x = 8;\nif (x > 5) { print("A"); } else { print("B"); }', answer: 'A', reasoning: '8 is greater than 5 so condition is true.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'A' },

          // English (Moderate: ~75%)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'third_person_singular', question: 'Identify the error in: "She go to school every day."', answer: 'She go to school every day.', reasoning: 'The sentence is correct as written.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Subject-verb agreement omission', evidence: 'Student does not consistently apply third-person singular inflection (-s) for singular subject "She".', expectedAnswer: 'She goes to school every day.', recommendedAction: 'Practice third-person singular present tense rules with he/she/it.' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Articles', concept: 'indefinite_articles_phonetics', question: 'Choose the correct article: "We waited for ___ hour at the station."', answer: 'an', reasoning: '"Hour" begins with a silent h and vowel sound /aʊ/, so "an" is required.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'an' },
          { subject: 'English' as SubjectType, category: 'Reading Comprehension', topic: 'Main Idea', concept: 'central_argument', question: 'In a passage about renewable energy adoption, what is the central claim?', answer: 'Transitioning to renewable energy requires grid infrastructure investment.', reasoning: 'The text repeatedly emphasizes storage and grid capacity as prerequisites.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Transitioning to renewable energy requires grid infrastructure investment.' },
          { subject: 'English' as SubjectType, category: 'Vocabulary', topic: 'Antonyms', concept: 'word_contrasts', question: 'What is the antonym of "scarce"?', answer: 'Abundant', reasoning: '"Scarce" means rare or limited; "abundant" means plentiful.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Abundant' }
        ]
      },
      {
        id: 'demo_diya',
        name: 'Diya Krishnan',
        email: 'diya@demo.mindtrace.ai',
        gradeLevel: 'Grade 10',
        records: [
          // English (Strong: ~88%)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'prepositional_phrase_intervening', question: 'Choose the correct verb: "The box of old photographs (is/are) on the shelf."', answer: 'is', reasoning: 'Subject is singular "box", "of old photographs" is an intervening prepositional phrase.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'is' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Tenses', concept: 'past_perfect', question: 'Choose the correct tense: "By the time we arrived, the train ___ (leave)."', answer: 'had left', reasoning: 'Action completed prior to another past action requires past perfect tense.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'had left' },
          { subject: 'English' as SubjectType, category: 'Reading Comprehension', topic: 'Inference', concept: 'implicit_meaning', question: 'What can be inferred about the narrator from their reluctance to open the letter?', answer: 'They anticipated bad news or distressing information.', reasoning: 'Hesitation indicates apprehension regarding the contents.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'They anticipated bad news.' },
          { subject: 'English' as SubjectType, category: 'Vocabulary', topic: 'Contextual Vocabulary', concept: 'connotative_meaning', question: 'What does "tenacious" mean in context: "Her tenacious defense of the policy won over critics"?', answer: 'Persistent and determined', reasoning: 'Context shows she refused to give up until winning support.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Persistent and determined' },
          
          // Mathematics (Weak: ~46% - Sign handling and unilateral operations)
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'sign_inversion', question: 'Solve: 3x + 8 = 29', answer: 'x = 37/3', reasoning: 'Moved 8 to the other side as +8, so 3x = 37.', isCorrect: false, errorType: 'sign_error' as ErrorType, misconceptionTag: 'Sign handling error', evidence: 'Transposed +8 across equal sign without inverting sign to -8.', expectedAnswer: 'x = 7', recommendedAction: 'Practice applying subtraction to both sides rather than moving terms.' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'bilateral_balance', question: 'Solve: 2x + 5 = 17', answer: 'x = 12', reasoning: 'Subtracted 5 from 17 to get 12, then left x as 12.', isCorrect: false, errorType: 'procedural_error' as ErrorType, misconceptionTag: 'Operation applied to one side only', evidence: 'Subtracted 5 from RHS without balancing LHS, and neglected coefficient 2.', expectedAnswer: 'x = 6', recommendedAction: 'Use the balance scale metaphor: every operation must be identical on both sides.' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'sign_handling_negative_coefficient', question: 'Solve: 4x - 7 = 17', answer: 'x = 2.5', reasoning: '4x = 17 - 7 = 10, so x = 2.5.', isCorrect: false, errorType: 'sign_error' as ErrorType, misconceptionTag: 'Sign handling error', evidence: 'Subtracted 7 from RHS instead of adding 7 to invert -7.', expectedAnswer: 'x = 6', recommendedAction: 'Reinforce that adding 7 is the inverse operation for -7.' },
          { subject: 'Mathematics' as SubjectType, category: 'Geometry', topic: 'Area and Perimeter', concept: 'rectangle_area', question: 'Find area of rectangle with length 8 cm and width 5 cm.', answer: '40 cm²', reasoning: '8 * 5 = 40 cm².', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '40 cm²' },
          { subject: 'Mathematics' as SubjectType, category: 'Arithmetic', topic: 'Fractions', concept: 'fraction_addition', question: 'Calculate: 1/4 + 2/4', answer: '3/4', reasoning: 'Same denominator, so add numerators 1 + 2 = 3.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '3/4' },

          // Programming (Moderate: ~70%)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Variables', concept: 'data_types', question: 'Which data type stores text?', answer: 'String', reasoning: 'String stores sequences of characters.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'String' },
          { subject: 'Programming' as SubjectType, category: 'Data Structures', topic: 'Strings', concept: 'string_length', question: 'What does "Hello".length() return?', answer: '5', reasoning: 'There are 5 characters in Hello.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '5' },
          { subject: 'Programming' as SubjectType, category: 'Algorithms', topic: 'Searching', concept: 'linear_search', question: 'What is the worst-case time complexity of linear search?', answer: 'O(n)', reasoning: 'In the worst case, every element must be checked.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'O(n)' }
        ]
      },
      {
        id: 'demo_rahul',
        name: 'Rahul Menon',
        email: 'rahul@demo.mindtrace.ai',
        gradeLevel: 'Grade 12',
        records: [
          // Programming (Strong: ~86%)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_trace', question: 'What will this loop print?\nfor(int i = 0; i < 5; i++) {\n    System.out.println(i);\n}', answer: '0 1 2 3 4', reasoning: 'Starts at 0, terminates before 5, prints 0, 1, 2, 3, 4.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '0 1 2 3 4' },
          { subject: 'Programming' as SubjectType, category: 'Data Structures', topic: 'Stacks', concept: 'lifo_property', question: 'Which data structure follows Last-In, First-Out (LIFO)?', answer: 'Stack', reasoning: 'Stacks push and pop from the top in LIFO order.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Stack' },
          { subject: 'Programming' as SubjectType, category: 'Algorithms', topic: 'Sorting', concept: 'binary_search_prerequisite', question: 'What is required before performing binary search?', answer: 'The array must be sorted.', reasoning: 'Binary search divides sorted halves based on comparison.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'The array must be sorted.' },
          { subject: 'Programming' as SubjectType, category: 'Object Oriented Programming', topic: 'Inheritance', concept: 'polymorphism', question: 'What OOP mechanism allows a subclass to provide a specific implementation of a method?', answer: 'Method Overriding', reasoning: 'Overriding replaces the superclass implementation at runtime.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Method Overriding' },
          { subject: 'Programming' as SubjectType, category: 'Debugging', topic: 'Syntax errors', concept: 'equality_vs_assignment', question: 'Find the bug in:\nif (x = 5) { print("Equal"); }', answer: 'Using assignment = instead of comparison ==', reasoning: '= assigns 5 to x; comparison requires ==.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Assignment operator = used instead of equality ==' },

          // English (Weak: ~44% - Grammar & Subject-Verb Agreement)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'third_person_singular', question: 'Identify the error in: "She go to school every day."', answer: 'She go to school every day.', reasoning: 'It sounds natural to me.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Subject-verb agreement omission', evidence: 'Student does not consistently apply third-person singular inflection (-s) for singular subject "She".', expectedAnswer: 'She goes to school every day.', recommendedAction: 'Reinforce singular vs plural verb endings in the simple present tense.' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'compound_subject_or', question: 'Choose the correct verb: "Neither the captain nor the players (was/were) ready."', answer: 'was', reasoning: 'The verb matches the first subject "captain".', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Proximity rule confusion in compound subjects', evidence: 'Student matched the verb with the remote subject instead of the closest subject ("players").', expectedAnswer: 'were', recommendedAction: 'Teach the proximity rule: with neither/nor, the verb agrees with the closer subject.' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Tenses', concept: 'narrative_tense_consistency', question: 'Identify the error: "He opened the door and walks into the dark room."', answer: 'walks should be walked', reasoning: 'Past narrative tense requires consistent past tense.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'walks should be walked' },
          { subject: 'English' as SubjectType, category: 'Writing', topic: 'Sentence structure', concept: 'comma_splice', question: 'Fix the sentence: "The bell rang, the students left."', answer: 'The bell rang and the students left.', reasoning: 'Two independent clauses joined by only a comma form a comma splice.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'The bell rang, and the students left.' },

          // Mathematics (Moderate: ~72%)
          { subject: 'Mathematics' as SubjectType, category: 'Statistics', topic: 'Mean', concept: 'mean_calculation', question: 'Find the mean of: 10, 15, 20, 25, 30.', answer: '20', reasoning: '(10+15+20+25+30)/5 = 100/5 = 20.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '20' },
          { subject: 'Mathematics' as SubjectType, category: 'Coordinate Geometry', topic: 'Slope', concept: 'slope_formula', question: 'Find slope of line through (1, 2) and (3, 6).', answer: '2', reasoning: '(6 - 2) / (3 - 1) = 4 / 2 = 2.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '2' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'inverse_operations', question: 'Solve: 5x = 35', answer: 'x = 7', reasoning: 'Divide both sides by 5.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 7' }
        ]
      },
      {
        id: 'demo_ananya',
        name: 'Ananya Rao',
        email: 'ananya@demo.mindtrace.ai',
        gradeLevel: 'Grade 11',
        records: [
          // Mathematics (Balanced: ~80%)
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'inverse_operations', question: 'Solve: 4x - 7 = 25', answer: 'x = 8', reasoning: 'Add 7: 4x = 32. Divide by 4: x = 8.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 8' },
          { subject: 'Mathematics' as SubjectType, category: 'Geometry', topic: 'Circles', concept: 'circle_area', question: 'Find area of circle with radius 7 (use π=22/7).', answer: '154', reasoning: 'πr² = 22/7 * 49 = 154.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '154' },
          { subject: 'Mathematics' as SubjectType, category: 'Arithmetic', topic: 'Ratio and Proportion', concept: 'ratio_simplification', question: 'Simplify the ratio 18:24.', answer: '3:4', reasoning: 'Divided both by 6.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '3:4' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Quadratic Equations', concept: 'factoring_quadratics', question: 'Solve: x² - 5x + 6 = 0', answer: 'x = 1, x = 6', reasoning: 'Factors are -1 and -6.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Quadratic factoring sign error', evidence: 'Student factored x² - 5x + 6 as (x-1)(x-6) which produces -7x + 6 instead of -5x.', expectedAnswer: 'x = 2, x = 3', recommendedAction: 'Verify that middle term equals the sum of factors (-2 + -3 = -5).' },

          // Programming (Balanced: ~80%)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'while_loop', question: 'What does this print?\nint c = 0;\nwhile(c < 3) { c++; }\nprint(c);', answer: '3', reasoning: 'Loop stops when c reaches 3.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '3' },
          { subject: 'Programming' as SubjectType, category: 'Data Structures', topic: 'Arrays', concept: 'array_access', question: 'int[] a = {10, 20, 30};\nWhat is a[1]?', answer: '20', reasoning: '0-indexed so a[1] is 20.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '20' },
          { subject: 'Programming' as SubjectType, category: 'Algorithms', topic: 'Recursion', concept: 'base_case', question: 'What happens if a recursive function has no base case?', answer: 'Stack Overflow / infinite recursion', reasoning: 'Calls itself indefinitely until call stack memory exhausts.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'StackOverflowError' },
          { subject: 'Programming' as SubjectType, category: 'Object Oriented Programming', topic: 'Classes', concept: 'constructor', question: 'What is the purpose of a constructor?', answer: 'Initialize instance state when an object is created', reasoning: 'Constructors set up initial fields of a new instance.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Initialize object state' },

          // English (Balanced: ~82%)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'third_person_singular', question: 'Choose correct verb: "He (play/plays) tennis every Sunday."', answer: 'plays', reasoning: 'Third person singular takes -s.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'plays' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Prepositions', concept: 'temporal_prepositions', question: 'Choose preposition: "The conference starts ___ Monday."', answer: 'on', reasoning: 'Days of the week take "on".', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'on' },
          { subject: 'English' as SubjectType, category: 'Reading Comprehension', topic: 'Author\'s Purpose', concept: 'persuasive_intent', question: 'What is the author\'s main purpose in an editorial advocating public transit?', answer: 'To persuade readers and policymakers to fund expansion.', reasoning: 'Arguments are designed to influence public action.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'To persuade readers to support public transit expansion.' },
          { subject: 'English' as SubjectType, category: 'Vocabulary', topic: 'Synonyms', concept: 'precise_vocabulary', question: 'What is a synonym for "lucid"?', answer: 'Clear and easily understood', reasoning: 'Lucid means transparent or easily comprehensible.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Clear' }
        ]
      },
      {
        id: 'demo_daniel',
        name: 'Daniel Kim',
        email: 'daniel@demo.mindtrace.ai',
        gradeLevel: 'Grade 12',
        records: [
          // Mathematics (Weak: ~46% - Repeated sign errors across multiple sessions)
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'sign_handling', question: 'Solve: 3x + 8 = 29', answer: 'x = 37/3', reasoning: 'Moved 8 to other side as +8, so 3x = 37.', isCorrect: false, errorType: 'sign_error' as ErrorType, misconceptionTag: 'Sign handling error', evidence: 'Transposed +8 across equal sign without inverting sign to -8.', expectedAnswer: 'x = 7', recommendedAction: 'Reinforce inverse operations on both sides.' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'bilateral_balance', question: 'Solve: 2x + 5 = 15', answer: 'x = 10', reasoning: 'Subtracted 5 from 15 to get 10, then x is 10.', isCorrect: false, errorType: 'procedural_error' as ErrorType, misconceptionTag: 'Operation applied to one side only', evidence: 'Subtracted constant from RHS without balancing LHS operation.', expectedAnswer: 'x = 5', recommendedAction: 'Use balance equations model.' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'sign_inversion', question: 'Solve: 4x - 7 = 17', answer: 'x = 2.5', reasoning: '4x = 17 - 7 = 10, so x = 2.5.', isCorrect: false, errorType: 'sign_error' as ErrorType, misconceptionTag: 'Sign handling error', evidence: 'Subtracted 7 from RHS instead of adding 7 to invert -7.', expectedAnswer: 'x = 6', recommendedAction: 'Reinforce that inverse of subtraction is addition.' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'one_step_division', question: 'Solve: 5x = 35', answer: 'x = 7', reasoning: '35 / 5 = 7.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 7' },
          { subject: 'Mathematics' as SubjectType, category: 'Geometry', topic: 'Area and Perimeter', concept: 'rectangle_area', question: 'Find area of rectangle with length 8 cm, width 5 cm.', answer: '40 cm²', reasoning: '8 * 5 = 40.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '40 cm²' },

          // Programming (Weak: ~45% - Repeated loop boundary and conditional logic misconceptions)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_boundary_condition', question: 'Write a loop that prints numbers from 1 to 5.\nfor(i = 1; i < 5; i++)', answer: 'for(i = 1; i < 5; i++)', reasoning: 'Condition i < 5 stops at 5.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Loop boundary misconception', evidence: 'Condition i < 5 excludes 5. Requires i <= 5 or i < 6 to include 5.', expectedAnswer: 'for(int i = 1; i <= 5; i++)', recommendedAction: 'Provide practice involving inclusive/exclusive boundaries.' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_termination', question: 'How many iterations does this loop run?\nfor(int i = 0; i < 4; i++)', answer: '5 iterations', reasoning: 'Counts 0, 1, 2, 3, 4 which is 5 numbers.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Loop boundary misconception', evidence: 'Included boundary value 4 when strict inequality i < 4 terminates upon reaching 4.', expectedAnswer: '4 iterations', recommendedAction: 'Practice boundary value stepping.' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Conditional statements', concept: 'boolean_conditions', question: 'What does this print?\nint x = 5;\nif (x == 5) { print("Yes"); } else { print("No"); }', answer: 'Yes', reasoning: '5 equals 5 so condition is true.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Yes' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Variables', concept: 'variable_declaration', question: 'Declare an integer variable named age with value 16.', answer: 'int age = 16;', reasoning: 'Type is int, name is age, assigned 16.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'int age = 16;' },

          // English (Moderate: ~55%)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'third_person_singular', question: 'She go to school every day.', answer: 'She go to school every day.', reasoning: 'No correction needed.', isCorrect: false, errorType: 'conceptual_misconception' as ErrorType, misconceptionTag: 'Subject-verb agreement omission', evidence: 'Omitted third-person singular inflection -s.', expectedAnswer: 'She goes to school every day.', recommendedAction: 'Focus on subject-verb inflection rules.' },
          { subject: 'English' as SubjectType, category: 'Vocabulary', topic: 'Synonyms', concept: 'context_synonyms', question: 'What is a synonym for "commence"?', answer: 'Begin', reasoning: '"Commence" means to start or begin.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'Begin' }
        ]
      },
      {
        id: 'demo_maya',
        name: 'Maya Lin',
        email: 'maya@demo.mindtrace.ai',
        gradeLevel: 'Grade 10',
        records: [
          // Mathematics (Improving: Earlier errors recovered to strong accuracy ~82%)
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'inverse_operations', question: 'Solve: 2x + 7 = 19', answer: 'x = 6', reasoning: 'Subtracted 7 from both sides to get 2x = 12, then divided both sides by 2 to get x = 6.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 6' },
          { subject: 'Mathematics' as SubjectType, category: 'Algebra', topic: 'Linear Equations in One Variable', concept: 'bilateral_balance', question: 'Solve: 3x - 5 = 16', answer: 'x = 7', reasoning: 'Added 5 to both sides to get 3x = 21, then divided by 3.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'x = 7' },
          { subject: 'Mathematics' as SubjectType, category: 'Geometry', topic: 'Triangles', concept: 'pythagorean_theorem', question: 'Find hypotenuse with legs 6 and 8.', answer: '10', reasoning: '√(6² + 8²) = √(36 + 64) = √100 = 10.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '10' },
          { subject: 'Mathematics' as SubjectType, category: 'Arithmetic', topic: 'Fractions', concept: 'fraction_multiplication', question: 'Multiply 2/3 * 3/4.', answer: '1/2', reasoning: '6/12 simplifies to 1/2.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '1/2' },

          // Programming (Improving: Rapid recovery ~80%)
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Loops', concept: 'loop_boundary_condition', question: 'What does this loop print?\nfor(int i = 0; i < 3; i++)', answer: '0 1 2', reasoning: 'Loop starts at 0 and terminates when i reaches 3 (strictly less than 3).', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '0 1 2' },
          { subject: 'Programming' as SubjectType, category: 'Data Structures', topic: 'Arrays', concept: 'array_length', question: 'What property returns array size in Java?', answer: '.length', reasoning: 'Arrays have a public .length field.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '.length' },
          { subject: 'Programming' as SubjectType, category: 'Programming Fundamentals', topic: 'Functions', concept: 'return_types', question: 'What return type signifies a function returns nothing?', answer: 'void', reasoning: 'void specifies no return value.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'void' },

          // English (Strong: ~85%)
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Subject-Verb Agreement', concept: 'third_person_singular', question: 'Choose verb: "The sun (rise/rises) in the east."', answer: 'rises', reasoning: 'Singular third-person subject "sun" takes "rises".', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'rises' },
          { subject: 'English' as SubjectType, category: 'Grammar', topic: 'Articles', concept: 'definite_article', question: 'Choose article: "Paris is ___ capital of France."', answer: 'the', reasoning: 'Specific unique entity requires definite article "the".', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: 'the' },
          { subject: 'English' as SubjectType, category: 'Reading Comprehension', topic: 'Supporting Evidence', concept: 'textual_evidence', question: 'Which quote best supports the claim that the expedition faced harsh weather?', answer: '"Sub-zero blizzards battered their camp for three continuous days."', reasoning: 'Direct textual proof of severe environmental conditions.', isCorrect: true, errorType: 'none' as ErrorType, expectedAnswer: '"Sub-zero blizzards battered their camp for three continuous days."' }
        ]
      }
    ];

    for (const ds of demoStudentConfigs) {
      let existingUser = this.findUserById(ds.id);
      if (!existingUser) {
        existingUser = this.findUserByEmail(ds.email);
      }

      if (!existingUser) {
        const studentUser: UserRecord = {
          id: ds.id,
          name: ds.name,
          email: ds.email,
          passwordHash: bcrypt.hashSync('student123', 10),
          role: 'student',
          gradeLevel: ds.gradeLevel,
          school: 'MindTrace Learning Academy',
          isDemo: true,
          createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
          lastActiveAt: new Date(Date.now() - 1800000).toISOString()
        };
        this.data.users.push(studentUser);
        modified = true;
      }

      // Check if diagnostic records for this student exist; if not or if minimal, seed them
      const existingRecords = this.data.diagnosticRecords.filter(r => r.studentId === ds.id);
      if (existingRecords.length < ds.records.length) {
        let idx = existingRecords.length + 1;
        for (const rec of ds.records) {
          // Avoid duplicate question insertion
          const isDuplicate = existingRecords.some(r => r.question === rec.question);
          if (isDuplicate) continue;

          const recTimestamp = new Date(Date.now() - (ds.records.length - idx) * 3600000 * 4).toISOString();
          this.data.diagnosticRecords.push({
            id: `rec_${ds.id}_${idx++}`,
            studentId: ds.id,
            question: rec.question,
            studentAnswer: rec.answer,
            studentReasoning: rec.reasoning,
            correctAnswer: rec.expectedAnswer,
            result: rec.isCorrect ? 'CORRECT' : 'INCORRECT',
            misconception: rec.misconceptionTag,
            recommendedAction: rec.recommendedAction,
            subject: rec.subject,
            concept: rec.concept,
            category: rec.category,
            topic: rec.topic,
            diagnosis: rec.isCorrect ? 'correct_reasoning' : 'procedural_error',
            errorType: rec.errorType,
            misconceptionTag: rec.misconceptionTag,
            confidence: 0.92,
            evidence: rec.evidence || 'Demonstrated sound cognitive reasoning with verifiable evidence.',
            recommendedIntervention: rec.isCorrect ? 'positive_feedback' : 'probe',
            timestamp: recTimestamp
          });
        }
        modified = true;
      }

      // Seed learner states and initial activities
      const stateKey = `${ds.id}::${LINEAR_EQUATIONS_CONCEPT.id}`;
      if (!this.data.learnerStates[stateKey]) {
        const studentRecs = this.data.diagnosticRecords.filter(r => r.studentId === ds.id);
        const correctCount = studentRecs.filter(r => r.diagnosis === 'correct_reasoning' || r.errorType === 'none').length;
        const mastery = studentRecs.length > 0 ? +(correctCount / studentRecs.length).toFixed(2) : 0.70;
        
        this.data.learnerStates[stateKey] = {
          id: `lcs_${ds.id}`,
          studentId: ds.id,
          conceptId: LINEAR_EQUATIONS_CONCEPT.id,
          mastery,
          confidence: +(mastery + 0.05).toFixed(2),
          attempts: studentRecs.length,
          hintsUsed: 2,
          interventionsReceived: studentRecs.filter(r => r.diagnosis !== 'correct_reasoning' && r.result !== 'CORRECT').length,
          recoveryStatus: mastery >= 0.75 ? 'recovered' : 'in_progress',
          misconceptionHistory: [],
          lastAssessedAt: new Date(Date.now() - 3600000).toISOString()
        };
        modified = true;
      }

      if (!this.data.recentActivities[ds.id] || this.data.recentActivities[ds.id].length === 0) {
        this.data.recentActivities[ds.id] = [
          {
            id: `act_${ds.id}_1`,
            type: 'reasoning_submission',
            title: 'Multi-Subject Practice Completed',
            outcome: 'Diagnostic Results Stored in Profile',
            status: 'info',
            timestamp: '1 hour ago'
          }
        ];
        modified = true;
      }
    }

    // 3. Seed Realistic Demo Notifications if missing
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const studentNotifs = this.data.notifications.filter(n => n.userId === 'demo_student');
    if (studentNotifs.length === 0) {
      const now = Date.now();
      const demoStudentNotifications: AppNotification[] = [
        {
          id: 'notif_demo_s1',
          userId: 'demo_student',
          role: 'student',
          type: 'misconception_detected',
          category: 'ai',
          title: 'Recurring Misconception Detected',
          message: 'MindTrace detected a recurring loop boundary misunderstanding in Loops. Review inclusive vs exclusive bounds before your next practice session.',
          timestamp: new Date(now - 15 * 60000).toISOString(),
          read: false,
          relatedTopic: 'Loops',
          actionUrl: '/insights'
        },
        {
          id: 'notif_demo_s2',
          userId: 'demo_student',
          role: 'student',
          type: 'mastery_increased',
          category: 'progress',
          title: 'Topic Mastery Increased',
          message: 'You improved your Algebra mastery from 72% to 85% with 4 consecutive verified reasoning steps.',
          timestamp: new Date(now - 2 * 3600000).toISOString(),
          read: false,
          relatedTopic: 'Linear Equations in One Variable',
          actionUrl: '/progress'
        },
        {
          id: 'notif_demo_s3',
          userId: 'demo_student',
          role: 'student',
          type: 'practice_recommendation',
          category: 'attention',
          title: 'New Practice Recommendation',
          message: '3 new targeted practice questions are available for your weakest topic (Loops & Arrays).',
          timestamp: new Date(now - 5 * 3600000).toISOString(),
          read: false,
          relatedTopic: 'Programming Fundamentals',
          actionUrl: '/practice'
        },
        {
          id: 'notif_demo_s4',
          userId: 'demo_student',
          role: 'student',
          type: 'weakness_identified',
          category: 'attention',
          title: 'Weakness Identified in Grammar',
          message: 'Third-person singular subject-verb agreement may need more practice.',
          timestamp: new Date(now - 24 * 3600000).toISOString(),
          read: true,
          relatedTopic: 'Subject-Verb Agreement',
          actionUrl: '/practice'
        },
        {
          id: 'notif_demo_s5',
          userId: 'demo_student',
          role: 'student',
          type: 'learning_milestone',
          category: 'success',
          title: 'Learning Milestone Completed',
          message: 'You completed a learning milestone: Linear Equations foundation verified with 100% accuracy.',
          timestamp: new Date(now - 48 * 3600000).toISOString(),
          read: true,
          relatedTopic: 'Linear Equations in One Variable',
          actionUrl: '/progress'
        }
      ];
      this.data.notifications.push(...demoStudentNotifications);
      modified = true;
    }

    const teacherNotifs = this.data.notifications.filter(n => n.userId === 'demo_teacher' || (n.role === 'teacher' && n.userId === 'demo_teacher'));
    if (teacherNotifs.length === 0) {
      const now = Date.now();
      const demoTeacherNotifications: AppNotification[] = [
        {
          id: 'notif_demo_t1',
          userId: 'demo_teacher',
          role: 'teacher',
          type: 'student_repeated_error',
          category: 'important',
          title: 'Student Repeated Error',
          message: 'Arjun Mehta has repeated a sign-handling misconception 4 times in Linear Equations.',
          timestamp: new Date(now - 10 * 60000).toISOString(),
          read: false,
          relatedStudentId: 'demo_arjun',
          relatedTopic: 'Linear Equations in One Variable',
          actionUrl: '/teacher/student/demo_arjun'
        },
        {
          id: 'notif_demo_t2',
          userId: 'demo_teacher',
          role: 'teacher',
          type: 'student_improved',
          category: 'success',
          title: 'Student Mastery Improved',
          message: "Priya Nair's Mathematics mastery increased by 8% following cognitive intervention.",
          timestamp: new Date(now - 65 * 60000).toISOString(),
          read: false,
          relatedStudentId: 'demo_priya',
          relatedTopic: 'Mathematics',
          actionUrl: '/teacher/student/demo_priya'
        },
        {
          id: 'notif_demo_t3',
          userId: 'demo_teacher',
          role: 'teacher',
          type: 'class_performance_update',
          category: 'attention',
          title: 'Cohort Attention Alert',
          message: '3 students in Period 2 need attention in Sign Inversion & Variable Isolation.',
          timestamp: new Date(now - 3 * 3600000).toISOString(),
          read: false,
          relatedTopic: 'Linear Equations in One Variable',
          actionUrl: '/teacher'
        },
        {
          id: 'notif_demo_t4',
          userId: 'demo_teacher',
          role: 'teacher',
          type: 'student_misconception_detected',
          category: 'ai',
          title: 'Misconception Detected',
          message: 'Alex Rivera encountered an Array Index Out-of-Bounds misconception in Programming.',
          timestamp: new Date(now - 22 * 3600000).toISOString(),
          read: true,
          relatedStudentId: 'demo_student',
          relatedTopic: 'Programming Fundamentals',
          actionUrl: '/teacher/student/demo_student'
        },
        {
          id: 'notif_demo_t5',
          userId: 'demo_teacher',
          role: 'teacher',
          type: 'student_improved',
          category: 'success',
          title: 'Transfer Recovery Verified',
          message: 'Diya Sharma successfully completed transfer recovery for Variable Isolation.',
          timestamp: new Date(now - 46 * 3600000).toISOString(),
          read: true,
          relatedStudentId: 'demo_diya',
          relatedTopic: 'Linear Equations in One Variable',
          actionUrl: '/teacher/student/demo_diya'
        }
      ];
      this.data.notifications.push(...demoTeacherNotifications);
      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  // ==========================================
  // User Authentication & Management
  // ==========================================

  createUser(userData: Omit<UserRecord, 'id' | 'createdAt' | 'lastActiveAt'>): UserRecord {
    const newUser: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      ...userData,
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      isDemo: userData.isDemo ?? false,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    this.data.users.push(newUser);

    // If new student, initialize clean learner state
    if (newUser.role === 'student') {
      const stateKey = `${newUser.id}::${LINEAR_EQUATIONS_CONCEPT.id}`;
      this.data.learnerStates[stateKey] = {
        id: `lcs_${newUser.id}`,
        studentId: newUser.id,
        conceptId: LINEAR_EQUATIONS_CONCEPT.id,
        mastery: 0.0,
        confidence: 0.0,
        attempts: 0,
        hintsUsed: 0,
        interventionsReceived: 0,
        recoveryStatus: 'not_tested',
        misconceptionHistory: [],
        lastAssessedAt: new Date().toISOString()
      };

      this.data.recentActivities[newUser.id] = [];
    }

    this.save();
    return newUser;
  }

  findUserByEmail(email: string): UserRecord | null {
    const normalized = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === normalized) || null;
  }

  findUserByEmailOrUsername(identifier: string): UserRecord | null {
    if (!identifier) return null;
    const normalized = identifier.toLowerCase().trim();

    // 1. Direct email match
    const byEmail = this.data.users.find(u => u.email.toLowerCase() === normalized);
    if (byEmail) return byEmail;

    // 2. Direct ID match
    const byId = this.data.users.find(u => u.id.toLowerCase() === normalized);
    if (byId) return byId;

    // 3. Username match (prefix before @ in email)
    const byPrefix = this.data.users.find(u => {
      const prefix = u.email.split('@')[0].toLowerCase();
      return prefix === normalized;
    });
    if (byPrefix) return byPrefix;

    // 4. Case-insensitive Full Name match
    const byName = this.data.users.find(u => u.name.toLowerCase() === normalized);
    if (byName) return byName;

    return null;
  }

  findUserById(id: string): UserRecord | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  getStudent(id: string): UserRecord | null {
    const user = this.findUserById(id);
    return user && user.role === 'student' ? user : user;
  }

  getAllStudents(): UserRecord[] {
    return this.data.users.filter(u => u.role === 'student');
  }

  getAllTeachers(): UserRecord[] {
    return this.data.users.filter(u => u.role === 'teacher');
  }

  touchUserActive(id: string): void {
    const user = this.findUserById(id);
    if (user) {
      user.lastActiveAt = new Date().toISOString();
      this.save();
    }
  }

  // ==========================================
  // Learner Concept State
  // ==========================================

  getLearnerState(studentId: string, conceptId: string = LINEAR_EQUATIONS_CONCEPT.id): LearnerConceptState {
    const key = `${studentId}::${conceptId}`;
    if (!this.data.learnerStates[key]) {
      this.data.learnerStates[key] = {
        id: `lcs_${studentId}`,
        studentId,
        conceptId,
        mastery: 0.0,
        confidence: 0.0,
        attempts: 0,
        hintsUsed: 0,
        interventionsReceived: 0,
        recoveryStatus: 'not_tested',
        misconceptionHistory: [],
        lastAssessedAt: new Date().toISOString()
      };
      this.save();
    }
    return this.data.learnerStates[key];
  }

  saveLearnerState(state: LearnerConceptState): void {
    const key = `${state.studentId}::${state.conceptId}`;
    this.data.learnerStates[key] = state;
    this.save();
  }

  getAllLearnerStates(): LearnerConceptState[] {
    return Object.values(this.data.learnerStates);
  }

  // ==========================================
  // Recent Activities
  // ==========================================
  getRecentActivities(studentId: string): ActivityRecord[] {
    return this.data.recentActivities[studentId] || [];
  }

  addActivity(studentId: string, activity: Omit<ActivityRecord, 'id' | 'timestamp'>): ActivityRecord {
    if (!this.data.recentActivities[studentId]) {
      this.data.recentActivities[studentId] = [];
    }

    const newActivity: ActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...activity,
      timestamp: 'Just now'
    };

    this.data.recentActivities[studentId] = [newActivity, ...this.data.recentActivities[studentId]].slice(0, 20);
    this.save();
    return newActivity;
  }

  // ==========================================
  // Diagnostic Records & Artifacts
  // ==========================================
  recordDiagnosticEvent(
    record: DiagnosticRecord,
    response?: StudentResponse,
    diagnosis?: Diagnosis,
    intervention?: Intervention
  ): DiagnosticRecord {
    this.data.diagnosticRecords.push(record);

    if (response) {
      this.data.studentResponses[response.id] = response;
    }
    if (diagnosis) {
      this.data.diagnoses[diagnosis.id] = diagnosis;
    }
    if (intervention) {
      this.data.interventions[intervention.id] = intervention;
    }

    this.save();
    return record;
  }

  getStudentResponses(studentId: string): StudentResponse[] {
    return Object.values(this.data.studentResponses).filter(r => r.studentId === studentId);
  }

  getStudentResponseById(responseId: string): StudentResponse | undefined {
    return this.data.studentResponses[responseId];
  }

  getDiagnosis(diagnosisId: string): Diagnosis | undefined {
    return this.data.diagnoses[diagnosisId];
  }

  getIntervention(interventionId: string): Intervention | undefined {
    return this.data.interventions[interventionId];
  }

  getDiagnoses(studentId?: string): Diagnosis[] {
    const records = this.getDiagnosticRecords(studentId);
    const diags: Diagnosis[] = [];
    for (const r of records) {
      if (r.diagnosisId && this.data.diagnoses[r.diagnosisId]) {
        diags.push(this.data.diagnoses[r.diagnosisId]);
      }
    }
    return diags;
  }

  getDiagnosticRecords(studentId?: string): DiagnosticRecord[] {
    if (!studentId) return this.data.diagnosticRecords;
    return this.data.diagnosticRecords.filter(r => r.studentId === studentId);
  }

  // ==========================================
  // Teacher Notes & Assignments
  // ==========================================
  getTeacherNotes(studentId: string): TeacherNote[] {
    return this.data.teacherNotes[studentId] || [];
  }

  addTeacherNote(studentId: string, note: TeacherNote): void {
    if (!this.data.teacherNotes[studentId]) {
      this.data.teacherNotes[studentId] = [];
    }
    this.data.teacherNotes[studentId].push(note);
    this.save();
  }

  getRemediationAssignments(studentId: string): TeacherRemediationAssignment[] {
    return this.data.remediationAssignments[studentId] || [];
  }

  addRemediationAssignment(studentId: string, assignment: TeacherRemediationAssignment): void {
    if (!this.data.remediationAssignments[studentId]) {
      this.data.remediationAssignments[studentId] = [];
    }
    this.data.remediationAssignments[studentId].push(assignment);
    this.save();
  }

  // ==========================================
  // Recovery Attempts Persistence
  // ==========================================
  addRecoveryAttempt(studentId: string, attempt: RecoveryAttempt): void {
    if (!this.data.recoveryAttempts[studentId]) {
      this.data.recoveryAttempts[studentId] = [];
    }
    this.data.recoveryAttempts[studentId].push(attempt);
    this.save();
  }

  getRecoveryAttempts(studentId: string): RecoveryAttempt[] {
    return this.data.recoveryAttempts[studentId] || [];
  }

  // ==========================================
  // Multi-Topic Student Progress Engine (Data-Driven Across Subjects)
  // ==========================================
  getMultiTopicStudentProgress(studentId: string): MultiTopicStudentProgress {
    const student = this.findUserById(studentId);
    const records = this.getDiagnosticRecords(studentId);

    // Subject breakdown container
    const subjectList: SubjectType[] = ['Mathematics', 'Programming', 'English'];
    const subjectBreakdown: Record<SubjectType, SubjectMasteryInfo> = {
      Mathematics: {
        subject: 'Mathematics',
        displayName: 'Mathematics',
        masteryPercent: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        topicsPracticed: 0,
        activeMisconceptions: []
      },
      Programming: {
        subject: 'Programming',
        displayName: 'Programming',
        masteryPercent: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        topicsPracticed: 0,
        activeMisconceptions: []
      },
      English: {
        subject: 'English',
        displayName: 'English',
        masteryPercent: 0,
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        topicsPracticed: 0,
        activeMisconceptions: []
      }
    };

    const mathCategories: MathCategory[] = [
      'Algebra',
      'Arithmetic / Number System',
      'Geometry',
      'Coordinate Geometry',
      'Mensuration',
      'Statistics',
      'Probability',
      'Trigonometry',
      'Functions',
      'Calculus'
    ];

    const displayNames: Record<string, string> = {
      'Algebra': 'Algebra',
      'Arithmetic': 'Arithmetic',
      'Arithmetic / Number System': 'Arithmetic & Number System',
      'Geometry': 'Geometry',
      'Coordinate Geometry': 'Coordinate Geometry',
      'Mensuration': 'Mensuration',
      'Statistics': 'Statistics',
      'Probability': 'Probability',
      'Trigonometry': 'Trigonometry',
      'Functions': 'Functions & Graphs',
      'Calculus': 'Calculus',
      'Programming Fundamentals': 'Programming Fundamentals',
      'Data Structures': 'Data Structures',
      'Algorithms': 'Algorithms',
      'Object Oriented Programming': 'OOP',
      'Debugging': 'Debugging',
      'Grammar': 'Grammar',
      'Vocabulary': 'Vocabulary',
      'Reading Comprehension': 'Reading Comprehension',
      'Writing': 'Writing'
    };

    const topics: Record<string, TopicMastery> = {};
    const strengths: string[] = [];
    const needsAttention: string[] = [];
    const misconceptionMap: Record<string, {
      id: string;
      name: string;
      subject: SubjectType;
      category: string;
      topic: string;
      count: number;
      occurrences: number;
      lastDetected: string;
      evidenceSnippet: string;
      recentEvidence: string;
      sampleQuestion: string;
      sampleAnswer: string;
      expectedAnswer: string;
      whatWentWrong: string;
      recommendedPractice: string;
    }> = {};

    const recentErrors: { errorType: string; question: string; timestamp: string }[] = [];

    // Helper to resolve record subject
    const inferSubject = (r: DiagnosticRecord): SubjectType => {
      if (r.subject === 'Programming' || r.subject === 'English' || r.subject === 'Mathematics') {
        return r.subject as SubjectType;
      }
      const cat = (r.category || '').toLowerCase();
      const top = (r.topic || '').toLowerCase();
      if (cat.includes('programming') || cat.includes('data structure') || cat.includes('algorithm') || cat.includes('oop') || cat.includes('debug') || top.includes('loop') || top.includes('array') || top.includes('variable')) {
        return 'Programming';
      }
      if (cat.includes('grammar') || cat.includes('vocabulary') || cat.includes('reading') || cat.includes('writing') || top.includes('subject-verb') || top.includes('tense') || top.includes('article')) {
        return 'English';
      }
      return 'Mathematics';
    };

    const topicsBySubject: Record<SubjectType, Set<string>> = {
      Mathematics: new Set(),
      Programming: new Set(),
      English: new Set()
    };

    // Process every record
    for (const r of records) {
      const subj = inferSubject(r);
      const isCorrect = r.diagnosis === 'correct_reasoning' || r.errorType === 'none' || r.result === 'CORRECT';
      const cat = r.category || (subj === 'Mathematics' ? 'Algebra' : (subj === 'Programming' ? 'Programming Fundamentals' : 'Grammar'));
      const top = r.topic || cat;

      // Subject tallies
      subjectBreakdown[subj].totalAttempts += 1;
      if (isCorrect) {
        subjectBreakdown[subj].correctAttempts += 1;
      } else {
        subjectBreakdown[subj].incorrectAttempts += 1;
      }
      topicsBySubject[subj].add(top);

      // Track misconception
      const tag = r.misconceptionTag || r.misconception;
      if (tag && !isCorrect) {
        if (!subjectBreakdown[subj].activeMisconceptions.includes(tag)) {
          subjectBreakdown[subj].activeMisconceptions.push(tag);
        }

        if (!misconceptionMap[tag]) {
          misconceptionMap[tag] = {
            id: `misc_${tag.replace(/\s+/g, '_').toLowerCase()}`,
            name: tag,
            subject: subj,
            category: cat,
            topic: top,
            count: 0,
            occurrences: 0,
            lastDetected: r.timestamp,
            evidenceSnippet: r.evidence || 'Identified pattern of cognitive deviation',
            recentEvidence: r.evidence || 'Identified pattern of cognitive deviation',
            sampleQuestion: r.question,
            sampleAnswer: r.studentAnswer,
            expectedAnswer: r.correctAnswer || 'See reference solution',
            whatWentWrong: r.evidence || 'Student reasoning deviated from established principles',
            recommendedPractice: r.recommendedAction || 'Practice targeted exercises on core properties'
          };
        }
        misconceptionMap[tag].count += 1;
        misconceptionMap[tag].occurrences += 1;
        if (new Date(r.timestamp) > new Date(misconceptionMap[tag].lastDetected)) {
          misconceptionMap[tag].lastDetected = r.timestamp;
          misconceptionMap[tag].recentEvidence = r.evidence;
        }
      }

      // Track recent errors
      if (!isCorrect) {
        recentErrors.push({
          errorType: r.errorType || r.diagnosis || 'cognitive_gap',
          question: r.question,
          timestamp: r.timestamp
        });
      }

      // Topic mastery tallies
      if (!topics[cat]) {
        topics[cat] = {
          category: cat,
          displayName: displayNames[cat] || cat,
          mastery: 0,
          masteryPercent: 0,
          attempts: 0,
          correctAttempts: 0,
          incorrectAttempts: 0,
          errorTypes: {},
          misconceptions: []
        };
      }
      topics[cat].attempts += 1;
      if (isCorrect) {
        topics[cat].correctAttempts += 1;
      } else {
        topics[cat].incorrectAttempts += 1;
      }
      if (r.errorType && r.errorType !== 'none') {
        topics[cat].errorTypes[r.errorType] = (topics[cat].errorTypes[r.errorType] || 0) + 1;
      }
      if (tag && !topics[cat].misconceptions.includes(tag)) {
        topics[cat].misconceptions.push(tag);
      }
    }

    // Finalize subject breakdown metrics
    for (const subj of subjectList) {
      const s = subjectBreakdown[subj];
      s.topicsPracticed = topicsBySubject[subj].size;
      s.masteryPercent = s.totalAttempts > 0 
        ? Math.round((s.correctAttempts / s.totalAttempts) * 100) 
        : 0;
    }

    // Finalize topic masteries
    for (const cat of Object.keys(topics)) {
      const t = topics[cat];
      t.mastery = t.attempts > 0 ? Math.round((t.correctAttempts / t.attempts) * 100) : 0;
      t.masteryPercent = t.mastery;

      if (t.attempts >= 2) {
        if (t.mastery >= 70) {
          strengths.push(`${t.displayName} (${t.mastery}% mastery)`);
        } else if (t.mastery < 65 || t.misconceptions.length > 0) {
          needsAttention.push(`${t.displayName} (${t.mastery}% mastery)`);
        }
      }
    }

    // Overall mastery from all real attempts
    const totalCorrect = records.filter(r => r.diagnosis === 'correct_reasoning' || r.errorType === 'none' || r.result === 'CORRECT').length;
    const overallMastery = records.length > 0
      ? Math.round((totalCorrect / records.length) * 100)
      : (student?.isDemo ? 72 : 0);

    const topicPerformance = Object.values(topics).map(t => ({
      category: t.category,
      displayName: t.displayName,
      masteryPercent: t.masteryPercent,
      attempts: t.attempts,
      status: (t.masteryPercent >= 70 ? 'strong' : (t.masteryPercent < 60 && t.attempts > 0 ? 'needs_attention' : 'developing')) as 'strong' | 'developing' | 'needs_attention'
    }));

    const errorTypeBreakdown: Record<string, number> = {};
    for (const t of Object.values(topics)) {
      for (const [k, v] of Object.entries(t.errorTypes)) {
        errorTypeBreakdown[k] = (errorTypeBreakdown[k] || 0) + v;
      }
    }

    // If strengths/needsAttention are empty, populate meaningful observations from records
    if (strengths.length === 0) {
      if (subjectBreakdown.Mathematics.masteryPercent >= 70) strengths.push('Mathematical Equivalence & Step Verification');
      if (subjectBreakdown.Programming.masteryPercent >= 70) strengths.push('Programming Fundamentals & Syntax');
      if (subjectBreakdown.English.masteryPercent >= 70) strengths.push('Reading Comprehension & Vocabulary');
      if (strengths.length === 0 && records.length > 0) strengths.push('Basic Step Formulation');
      else if (strengths.length === 0) strengths.push('Diagnostic Assessment in Progress');
    }

    if (needsAttention.length === 0) {
      if (subjectBreakdown.Programming.activeMisconceptions.length > 0) {
        needsAttention.push(`Programming: ${subjectBreakdown.Programming.activeMisconceptions[0]}`);
      }
      if (subjectBreakdown.English.activeMisconceptions.length > 0) {
        needsAttention.push(`English: ${subjectBreakdown.English.activeMisconceptions[0]}`);
      }
      if (subjectBreakdown.Mathematics.activeMisconceptions.length > 0) {
        needsAttention.push(`Mathematics: ${subjectBreakdown.Mathematics.activeMisconceptions[0]}`);
      }
      if (needsAttention.length === 0) needsAttention.push('No Critical Gaps Detected');
    }

    return {
      studentId,
      studentName: student?.name || 'Student',
      overallMastery,
      totalAttempts: records.length,
      correctAttempts: totalCorrect,
      subjectBreakdown,
      topics,
      topicPerformance,
      strengths,
      needsAttention,
      weaknesses: needsAttention,
      misconceptionsDetected: Object.values(misconceptionMap).sort((a, b) => b.count - a.count),
      errorTypeBreakdown,
      recentAttempts: records.slice(-10).reverse(),
      recentErrors: recentErrors.slice(-10).reverse()
    };
  }

  // ==========================================
  // Multi-Topic Teacher Cohort Analytics
  // ==========================================
  getTeacherCohortAnalytics(): TeacherCohortAnalytics {
    const students = this.getAllStudents();

    const studentRoster = students.map(student => {
      const progress = this.getMultiTopicStudentProgress(student.id);
      const mathMastery = progress.subjectBreakdown?.Mathematics?.masteryPercent ?? 0;
      const progMastery = progress.subjectBreakdown?.Programming?.masteryPercent ?? 0;
      const engMastery = progress.subjectBreakdown?.English?.masteryPercent ?? 0;

      const activeMisconceptionNames = progress.misconceptionsDetected.map(m => m.name);

      let status = 'Active';
      if (progress.overallMastery >= 75) {
        status = 'Excelling';
      } else if (progress.overallMastery < 60 || activeMisconceptionNames.length >= 2) {
        status = 'Needs Attention';
      }

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.gradeLevel || 'Grade 10',
        gradeLevel: student.gradeLevel || 'Grade 10',
        isDemo: student.isDemo ?? false,
        overallMastery: progress.overallMastery,
        mathematics: mathMastery,
        programming: progMastery,
        english: engMastery,
        strongestTopic: progress.strengths[0] || 'Pending Practice',
        weakestTopic: progress.needsAttention[0] || 'Pending Practice',
        activeMisconceptions: activeMisconceptionNames,
        totalAttempts: progress.totalAttempts,
        lastActive: student.lastActiveAt,
        status
      };
    });

    const activeRoster = studentRoster.filter(s => s.totalAttempts > 0);
    const avgMastery = activeRoster.length > 0
      ? Math.round(activeRoster.reduce((sum, s) => sum + s.overallMastery, 0) / activeRoster.length)
      : 72;

    const studentsNeedingAttention = studentRoster.filter(
      s => s.overallMastery < 65 || s.activeMisconceptions.length > 0
    );

    const misconceptionAnalytics = this.getTeacherMisconceptionAnalytics();
    const mostCommonMisconception = misconceptionAnalytics.length > 0
      ? misconceptionAnalytics[0].misconception
      : 'Loop boundary misconception';

    const categories: MathCategory[] = [
      'Algebra',
      'Arithmetic / Number System',
      'Geometry',
      'Statistics',
      'Probability'
    ];

    const topicPerformance = categories.map(cat => {
      let totalMastery = 0;
      let count = 0;
      for (const s of students) {
        const p = this.getMultiTopicStudentProgress(s.id);
        if (p.topics[cat] && p.topics[cat].attempts > 0) {
          totalMastery += p.topics[cat].mastery ?? 0;
          count++;
        }
      }
      return {
        topic: cat,
        mastery: count > 0 ? Math.round(totalMastery / count) : 68,
        accuracy: count > 0 ? Math.min(100, Math.round(totalMastery / count) + 4) : 72
      };
    });

    return {
      totalStudents: students.length,
      averageMastery: avgMastery,
      studentsNeedingAttention: studentsNeedingAttention.length,
      mostCommonMisconception,
      topicPerformance,
      students: studentRoster,
      misconceptionAnalytics
    };
  }

  // ==========================================
  // Teacher Misconception Analytics (Section 13)
  // ==========================================
  getTeacherMisconceptionAnalytics(): TeacherMisconceptionAnalyticsItem[] {
    const records = this.data.diagnosticRecords;
    const misconceptionMap: Record<string, {
      misconception: string;
      category: string;
      studentIds: Set<string>;
      totalOccurrences: number;
      exampleQuestions: Set<string>;
      recentOccurrences: string[];
      recommendedIntervention: string;
    }> = {};

    for (const r of records) {
      const tag = r.misconceptionTag || r.misconception;
      if (tag) {
        if (!misconceptionMap[tag]) {
          misconceptionMap[tag] = {
            misconception: tag,
            category: r.category || (r.subject as string) || 'General',
            studentIds: new Set(),
            totalOccurrences: 0,
            exampleQuestions: new Set(),
            recentOccurrences: [],
            recommendedIntervention: r.recommendedAction || 'Targeted cognitive scaffolding with concrete counter-examples'
          };
        }
        misconceptionMap[tag].studentIds.add(r.studentId);
        misconceptionMap[tag].totalOccurrences += 1;
        if (r.question) misconceptionMap[tag].exampleQuestions.add(r.question);
        misconceptionMap[tag].recentOccurrences.push(r.timestamp);
      }
    }

    return Object.values(misconceptionMap)
      .map(item => ({
        name: item.misconception,
        misconception: item.misconception,
        category: item.category,
        topicsAffected: [item.category],
        affectedStudentCount: item.studentIds.size,
        studentsAffected: item.studentIds.size,
        totalOccurrences: item.totalOccurrences,
        exampleQuestions: Array.from(item.exampleQuestions).slice(0, 3),
        recentOccurrences: item.recentOccurrences.slice(-3),
        recommendedIntervention: item.recommendedIntervention
      }))
      .sort((a, b) => b.affectedStudentCount - a.affectedStudentCount || b.totalOccurrences - a.totalOccurrences);
  }

  // ==========================================
  // Student Diagnostic Report (Section 12 & 13)
  // ==========================================
  getStudentReport(studentId: string) {
    const student = this.findUserById(studentId);
    if (!student) return null;
    const progress = this.getMultiTopicStudentProgress(studentId);
    const records = this.getDiagnosticRecords(studentId);

    const topicPerformance = Object.values(progress.topics).map(t => ({
      topic: t.displayName,
      category: t.category,
      mastery: t.mastery ?? 0,
      attempts: t.attempts,
      correctAttempts: t.correctAttempts,
      status: (t.mastery ?? 0) >= 70 ? 'Strong' : ((t.mastery ?? 0) < 60 && t.attempts > 0 ? 'Needs Attention' : 'Developing')
    }));

    return {
      overview: {
        id: student.id,
        name: student.name,
        studentName: student.name,
        email: student.email,
        gradeLevel: student.gradeLevel || 'Grade 10',
        overallMastery: progress.overallMastery,
        totalAttempts: progress.totalAttempts,
        accuracyRate: progress.totalAttempts > 0 ? Math.round((progress.correctAttempts / progress.totalAttempts) * 100) : 0,
        recoveryStatus: progress.overallMastery >= 75 ? 'recovered' : (progress.overallMastery < 55 ? 'needs_intervention' : 'in_progress'),
        lastActive: student.lastActiveAt
      },
      subjectMastery: progress.subjectBreakdown,
      topicPerformance,
      strengths: progress.strengths,
      weaknesses: progress.needsAttention,
      misconceptions: progress.misconceptionsDetected,
      errorHistory: Object.entries(progress.errorTypeBreakdown).map(([type, count]) => ({
        errorType: type,
        count,
        description: type === 'sign_error' ? 'Sign inversion errors across operations' :
                     type === 'procedural_error' ? 'Procedural steps out of sequence' :
                     type === 'conceptual_misconception' ? 'Underlying conceptual misunderstanding' :
                     'Arithmetic and calculation slips'
      })),
      recentAttempts: records.slice(-10).reverse().map(r => ({
        question: r.question,
        equation: r.question,
        topic: r.topic || r.category || 'General',
        category: r.category || 'General',
        studentAnswer: r.studentAnswer,
        studentReasoning: r.studentReasoning,
        expectedAnswer: r.correctAnswer || 'See solution steps',
        isCorrect: r.diagnosis === 'correct_reasoning' || r.errorType === 'none' || r.result === 'CORRECT',
        diagnosis: r.diagnosis,
        errorType: r.errorType || 'none',
        misconceptionTag: r.misconceptionTag || r.misconception,
        evidence: r.evidence,
        timestamp: r.timestamp
      })),
      recommendedIntervention: progress.misconceptionsDetected.length > 0
        ? `Focus practice on ${progress.misconceptionsDetected[0]?.topic || progress.needsAttention[0] || 'core concepts'} specifically addressing '${progress.misconceptionsDetected[0]?.name}'. ${progress.misconceptionsDetected[0]?.recommendedPractice || ''}`
        : 'Continue reinforcing cross-topic synthesis and advanced multi-step problem solving.'
    };
  }

  // ==========================================
  // Notifications Management
  // ==========================================

  getNotifications(userId: string, role?: string): AppNotification[] {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    let userNotifs: AppNotification[] = [];

    if (role === 'teacher') {
      // Teachers see notifications sent directly to their user ID or broadcast to teachers
      userNotifs = this.data.notifications.filter(n => n.userId === userId || n.role === 'teacher');
    } else {
      // Students only see their own notifications (strict privacy)
      userNotifs = this.data.notifications.filter(n => n.userId === userId && n.role === 'student');
    }

    // Sort by timestamp descending (newest first)
    return userNotifs.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addNotification(data: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { timestamp?: string; read?: boolean }): AppNotification {
    if (!this.data.notifications) {
      this.data.notifications = [];
    }

    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: data.timestamp || new Date().toISOString(),
      read: data.read ?? false,
      userId: data.userId,
      role: data.role,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedStudentId: data.relatedStudentId,
      relatedTopic: data.relatedTopic,
      actionUrl: data.actionUrl,
      category: data.category || 'ai'
    };

    this.data.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id: string, userId?: string): boolean {
    if (!this.data.notifications) return false;
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;

    // Privacy guard: student cannot mark another student's notifications
    if (userId && notif.role === 'student' && notif.userId !== userId) {
      return false;
    }

    notif.read = true;
    this.save();
    return true;
  }

  markAllNotificationsRead(userId: string, role?: string): number {
    if (!this.data.notifications) return 0;
    let count = 0;
    for (const n of this.data.notifications) {
      const isTarget = role === 'teacher'
        ? (n.userId === userId || n.role === 'teacher')
        : (n.userId === userId && n.role === 'student');
      if (isTarget && !n.read) {
        n.read = true;
        count++;
      }
    }
    if (count > 0) {
      this.save();
    }
    return count;
  }
}

export const db = new DatabaseService();
