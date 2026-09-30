/**
 * MindTrace Domain Data Models
 * Core types shared across Frontend, Backend API, and Future AI Engines.
 * 
 * Clean separation:
 * - Reference Material (Curriculum, Concepts, Canonical Questions)
 * - Student Responses (Reasoning, Raw input, timestamps)
 * - AI-Generated Output (Diagnosis, Misconceptions, Socratic Interventions)
 * - Learner State (Mastery, History, Recovery tracking)
 * - Teacher Decisions (Audits, Overrides, Pedagogical adjustments)
 */

export type UserRole = 'student' | 'teacher';

// ==========================================
// 1. Core Actors
// ==========================================

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: string;
  avatarUrl?: string;
  currentTopicId: string;
  enrolledAt: string;
  lastActiveAt: string;
  isDemo?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  school: string;
  department: string;
  assignedClasses: string[];
  isDemo?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gradeLevel?: string;
  subject?: string;
  department?: string;
  school?: string;
  currentTopicId?: string;
  createdAt: string;
  lastActiveAt?: string;
  isDemo?: boolean;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  gradeLevel?: string;
  subject?: string;
  department?: string;
  school?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

// ==========================================
// 2. Curriculum & Reference Material
// ==========================================

export interface Concept {
  id: string;
  title: string;
  domain: string; // e.g., "Mathematics"
  subdomain: string; // e.g., "Algebra"
  topic: string; // e.g., "Linear Equations"
  description: string;
  prerequisites: string[]; // Concept IDs
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  commonMisconceptions: MisconceptionDefinition[];
}

export interface MisconceptionDefinition {
  id: string;
  code: string; // e.g., "EQ-SIGN-UNILATERAL"
  name: string;
  description: string;
  category: 'operational_balance' | 'variable_isolation' | 'sign_inversion' | 'arithmetic_grouping';
  exampleIncorrectReasoning: string;
  underlyingRootCause: string;
}

export type SubjectType = 'Mathematics' | 'Programming' | 'English';

export type MathCategory = 
  | 'Algebra'
  | 'Arithmetic / Number System'
  | 'Geometry'
  | 'Coordinate Geometry'
  | 'Mensuration'
  | 'Statistics'
  | 'Probability'
  | 'Trigonometry'
  | 'Functions'
  | 'Calculus';

export type ProgrammingCategory =
  | 'Programming Fundamentals'
  | 'Data Structures'
  | 'Algorithms'
  | 'Object Oriented Programming'
  | 'Debugging';

export type EnglishCategory =
  | 'Grammar'
  | 'Vocabulary'
  | 'Reading Comprehension'
  | 'Writing';

export type QuestionFormatType = 
  | 'free_response'
  | 'multiple_choice'
  | 'predict_output'
  | 'find_the_bug'
  | 'complete_code'
  | 'write_code'
  | 'explain_code'
  | 'debug_code';

export type ErrorType = 
  | 'arithmetic_error'
  | 'conceptual_misconception'
  | 'procedural_error'
  | 'sign_error'
  | 'incomplete_reasoning'
  | 'careless_mistake'
  | 'correct_reasoning_incorrect_calculation'
  | 'correct_answer_weak_reasoning'
  | 'none';

export interface Question {
  id: string;
  subject?: SubjectType | string;
  category?: string; // e.g. "Algebra", "Programming Fundamentals", "Grammar"
  topic?: string;    // e.g. "Linear Equations in One Variable", "Loops", "Subject-verb agreement"
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  format?: QuestionFormatType;
  options?: string[]; // for multiple choice
  codeSnippet?: string; // for programming questions
  passage?: string; // for reading comprehension
  question?: string;
  expectedAnswer?: string;
  concept?: string;
  concepts?: string[];
  misconceptionTags?: string[];
  commonMisconceptions?: string[];
  diagnosticQuestions?: string[];
  recoveryQuestions?: string[];

  // Backward compatibility fields
  conceptId?: string;
  equation?: string; // e.g., "3x + 7 = 22" or "4(2x - 3) = 2x + 18"
  prompt: string;
  instructions?: string;
  expectedFinalAnswer?: string;
  referenceSolutionSteps?: string[];
  isTransferQuestion?: boolean;
  parentQuestionId?: string; // If this is a transfer/recovery question for a canonical question

  // Dynamic / variation metadata
  templateId?: string;
  isGenerated?: boolean;
}

export interface MathImageExtractionRequest {
  imageBase64: string;
  mimeType: string;
}

export interface MathImageExtractionResult {
  success: boolean;
  equation: string;
  problemStatement?: string;
  expectedAnswer?: string;
  confidence: number;
  isHandwritten: boolean;
  needsConfirmation: boolean;
  notes?: string;
  // Multi-topic dynamic classification
  category?: string;
  topic?: string;
  concept?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  error?: {
    code: string;
    message: string;
  };
}

// ==========================================
// 3. Student Responses & Session Artifacts
// ==========================================

export interface StudentResponse {
  id: string;
  sessionId: string;
  studentId: string;
  questionId: string;
  reasoningText: string; // Large free-form reasoning text
  submittedAnswer?: string;
  timestamp: string;
  timeSpentSeconds: number;
}

// ==========================================
// 4. AI Diagnostic Output (Phase 2A Real AI Pipeline)
// ==========================================

export type DiagnosisCategory =
  | 'missing_prerequisite'
  | 'wrong_rule_or_definition'
  | 'procedural_error'
  | 'overgeneralization'
  | 'calculation_slip'
  | 'insufficient_evidence'
  | 'correct_reasoning'
  | 'uncertain'
  | 'out_of_scope';

export type RecommendedIntervention =
  | 'probe'
  | 'hint'
  | 'explanation'
  | 'positive_feedback';

export type InputScopeStatus = 
  | 'ALLOWED'
  | 'OUT_OF_SCOPE'
  | 'POLICY_BYPASS_ATTEMPT'
  | 'AMBIGUOUS';

export type ConfidenceBand = 
  | 'HIGH_CONFIDENCE'
  | 'MEDIUM_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'INSUFFICIENT_EVIDENCE';

export interface DiagnosticResult {
  isCorrect: boolean;
  subject?: SubjectType | string;
  concept: string; // e.g. "linear_equations", "fractions", "geometry_triangles", "loop_boundaries"
  category?: string; // e.g. "Algebra", "Programming Fundamentals", "Grammar"
  topic?: string;    // e.g. "Linear Equations in One Variable", "Loops", "Subject-verb agreement"
  result?: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  misconception?: string;
  errorType?: ErrorType | string; // Separation of arithmetic slip, procedural error, conceptual misconception, etc.
  misconceptionTag?: string; // Descriptive tag from the misconception taxonomy
  diagnosis: DiagnosisCategory;
  confidence: number; // 0.0 to 1.0
  confidenceBand?: ConfidenceBand;
  evidence: string; // Grounded evidence statement
  evidenceStatus?: 'sufficient_evidence' | 'insufficient_evidence' | 'ambiguous';
  affectedSkill: string; // e.g. "inverse_operations", "loop_conditions", "subject_verb_agreement"
  recommendedAction?: string;
  recommendedIntervention: RecommendedIntervention;
  needsRecoveryTest: boolean;
  safetyFlag?: 'safe' | 'prompt_injection_attempt' | 'out_of_scope';
  scopeStatus?: InputScopeStatus;
  latencyMs?: number;
  rawStudentInput?: string;
}

export interface DiagnoseRequest {
  studentId: string;
  question: string;
  expectedAnswer: string;
  studentAnswer: string;
  studentReasoning: string;
  concept?: string;
}

export interface DiagnoseResponse {
  success: boolean;
  diagnosis?: DiagnosticResult;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface Diagnosis {
  id: string;
  responseId: string;
  studentId: string;
  questionId: string;
  isCorrect: boolean;
  category?: string;
  topic?: string;
  concept?: string;
  errorType?: ErrorType | string;
  misconceptionTag?: string;
  diagnosis?: DiagnosisCategory;
  misconceptionId?: string;
  misconceptionName?: string;
  misconceptionCategory?: string;
  confidence: number; // 0.0 to 1.0
  confidenceBand?: ConfidenceBand;
  evidenceStatus?: 'sufficient_evidence' | 'insufficient_evidence' | 'ambiguous';
  evidence?: string;
  affectedSkill?: string;
  subject?: SubjectType | string;
  misconception?: string;
  recommendedAction?: string;
  pedagogicalInterpretation?: string;
  recommendedIntervention?: RecommendedIntervention;
  needsRecoveryTest?: boolean;
  detectedErrors: DetectedError[];
  evidenceSnippets: EvidenceSnippet[];
  timestamp: string;
  status: 'mock_placeholder' | 'ai_evaluated';
  scopeStatus?: InputScopeStatus;
  latencyMs?: number;
  teacherReviewed?: boolean;
  reclassifiedFrom?: string;
  teacherNotes?: TeacherNote[];
}

export interface DetectedError {
  step: number;
  snippet: string;
  explanation: string;
  errorType: string;
}

export interface EvidenceSnippet {
  id: string;
  quote: string;
  lineOrStepNumber?: number;
  highlightCategory: 'warning' | 'critical' | 'neutral';
  pedagogicalNote: string;
}

// ==========================================
// 5. Socratic Intervention (Phase 1 Placeholder / Phase 2 Policy)
// ==========================================

export type InterventionLevel = 
  | 'level_1_socratic_question'    // Gentle guiding question to provoke reflection
  | 'level_2_counter_example'      // Contradiction or simpler balance scale counter-example
  | 'level_3_scaffolded_steps';     // Step-by-step breakdown of the operation

export type SocraticEvaluationClassification = 'CORRECT' | 'PARTIAL' | 'INCORRECT';

export type ReflectUIState = 
  | 'REFLECT_QUESTION'
  | 'REFLECT_EVALUATING'
  | 'REFLECT_CORRECT'
  | 'REFLECT_PARTIAL'
  | 'REFLECT_INCORRECT'
  | 'REFLECT_COMPLETE';

export type InterventionType = 
  | 'SOCRATIC_PROBE'
  | 'TARGETED_HINT'
  | 'CONCEPTUAL_EXPLANATION'
  | 'POSITIVE_FEEDBACK'
  | 'RECOVERY_TEST';

export interface DialogueTurn {
  id: string;
  attempt: number;
  studentResponse: string;
  diagnosis: DiagnosisCategory;
  misconceptionCode?: string;
  confidence: number;
  evidence: string;
  affectedSkill?: string;
  interventionLevel: 1 | 2 | 3;
  interventionType: InterventionType;
  interventionText: string;
  hintPrompt?: string;
  persists: boolean;
  understandingDetected: boolean;
  timestamp: string;
  isFallback?: boolean;
  evaluationClassification?: SocraticEvaluationClassification;
  understandingMessage?: string;
  missingAspect?: string;
  nextQuestion?: string;
}

export interface RespondRequest {
  sessionId: string;
  studentResponse: string;
}

export interface StructuredRespondResponse {
  success: boolean;
  diagnosis: {
    misconceptionCode?: string;
    label?: string;
    confidence: number;
    evidence: string;
    persists: boolean;
    understandingDetected: boolean;
    evaluationClassification?: SocraticEvaluationClassification;
    understandingMessage?: string;
    missingAspect?: string;
    nextQuestion?: string;
    reflectUIState?: ReflectUIState;
  };
  intervention: {
    level: 1 | 2 | 3;
    type: InterventionType;
    text: string;
    hintPrompt?: string;
    isFallback?: boolean;
    questionBankId?: string;
  };
  session: {
    sessionId: string;
    attemptCount: number;
    interventionLevel: 1 | 2 | 3;
    nextAction: 'WAIT_FOR_STUDENT' | 'TRANSFER_CHECK';
    dialogueHistory: DialogueTurn[];
    usedQuestionIds?: string[];
    reflectUIState?: ReflectUIState;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface Intervention {
  id: string;
  diagnosisId: string;
  studentId: string;
  level: InterventionLevel;
  levelNumber: 1 | 2 | 3;
  type?: InterventionType;
  tutorMessage: string;
  socraticQuestion: string;
  hintPrompt?: string;
  requiresStudentResponse: boolean;
  studentReply?: string;
  timestamp: string;
  status: 'mock_placeholder' | 'ai_generated';
  isFallback?: boolean;
  questionBankId?: string;
}

// ==========================================
// 6. Transfer & Recovery Engine
// ==========================================

export type RecoveryStatus = 
  | 'not_tested' 
  | 'in_progress' 
  | 'recovered' 
  | 'unrecovered_needs_escalation';

export interface RecoveryAttempt {
  id: string;
  studentId: string;
  initialQuestionId: string;
  transferQuestionId: string;
  misconceptionId: string;
  studentReasoning: string;
  status: RecoveryStatus;
  recoveryConfidence?: number;
  feedbackNotes?: string;
  timestamp: string;
}

// ==========================================
// 7. Learner Concept State (Learner Model)
// ==========================================

export interface LearnerConceptState {
  id: string;
  studentId: string;
  conceptId: string;
  mastery: number; // 0.0 to 1.0 (e.g. 0.72)
  confidence: number; // 0.0 to 1.0
  activeMisconception?: {
    id: string;
    code: string;
    name: string;
    detectedAt: string;
    evidenceSnippet: string;
  };
  misconceptionHistory: MisconceptionHistoryItem[];
  attempts: number;
  hintsUsed: number;
  interventionsReceived: number;
  recoveryStatus: RecoveryStatus;
  lastAssessedAt: string;
}

export interface MisconceptionHistoryItem {
  id: string;
  misconceptionId: string;
  misconceptionName: string;
  questionId: string;
  detectedAt: string;
  evidence: string;
  interventionLevelUsed: InterventionLevel;
  recovered: boolean;
  recoveryTimestamp?: string;
}

// ==========================================
// 8. Learning Session Aggregate
// ==========================================

export type SessionPhase = 
  | 'question'
  | 'reasoning_submitted'
  | 'diagnosis_intervention'
  | 'intervention_replied'
  | 'transfer_question'
  | 'recovery_result';

export interface LearningSession {
  id: string;
  studentId: string;
  conceptId: string;
  currentQuestion: Question;
  currentPhase: SessionPhase;
  studentResponse?: StudentResponse;
  currentDiagnosis?: Diagnosis;
  currentIntervention?: Intervention;
  transferQuestion?: Question;
  recoveryAttempt?: RecoveryAttempt;
  isComplete: boolean;
  startedAt: string;
  updatedAt: string;
  
  // Phase 2B Conversation & Dialogue State
  initialDiagnosis?: Diagnosis;
  misconceptionCode?: string;
  confidence?: number;
  interventionLevel?: 1 | 2 | 3;
  interventionHistory?: DialogueTurn[];
  dialogueHistory?: DialogueTurn[];
  studentResponses?: string[];
  diagnosticHistory?: Diagnosis[];
  attemptCount?: number;
  misconceptionPersisting?: boolean;
  understandingDetected?: boolean;
  recoveryTestRequired?: boolean;
  nextAction?: 'WAIT_FOR_STUDENT' | 'TRANSFER_CHECK';
  usedQuestionIds?: string[];
  reflectUIState?: ReflectUIState;
}

// ==========================================
// 9. Teacher Analytics Aggregates (Phase 3 Intelligence)
// ==========================================

export interface MisconceptionCluster {
  id: string;
  name: string;
  code: string;
  category: string;
  affectedStudentCount: number;
  affectedStudentIds: string[];
  affectedStudentNames: string[];
  averageMastery: number; // e.g. 54%
  persistenceAttempts: number; // total or average attempts
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface TeacherPriorityAction {
  id: string;
  studentId: string;
  studentName: string;
  conceptId: string;
  conceptTitle: string;
  urgency: 'URGENT' | 'HIGH' | 'MODERATE';
  reasonType: 
    | 'repeated_misconception' 
    | 'low_mastery' 
    | 'failed_interventions' 
    | 'failed_transfer' 
    | 'persistent_misconception';
  description: string;
  evidenceSnippet: string;
  suggestedAction: string;
  timestamp: string;
}

export interface TeacherNote {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  noteText: string;
  timestamp: string;
  category?: 'observation' | 'remediation_plan' | 'audit_override';
}

export interface TeacherRemediationAssignment {
  id: string;
  studentId: string;
  conceptId: string;
  misconceptionCode?: string;
  strategy: string; // e.g. "concrete_manipulative", "worked_example", "balance_scale"
  customInstructions?: string;
  assignedAt: string;
  status: 'assigned' | 'in_progress' | 'completed';
}

export interface CognitiveTraceStep {
  id: string;
  studentId: string;
  questionId: string;
  equation: string;
  studentReasoning: string;
  studentAnswer?: string;
  diagnosis: DiagnosisCategory;
  misconceptionCode?: string;
  misconceptionName?: string;
  confidence: number;
  confidenceBand: ConfidenceBand;
  evidence: string;
  affectedSkill: string;
  pedagogicalInterpretation: string;
  interventionLevel?: 1 | 2 | 3;
  interventionText?: string;
  subsequentStudentResponse?: string;
  recoveryStatus: RecoveryStatus;
  timestamp: string;
  teacherReviewed?: boolean;
  reclassifiedFrom?: string;
  notes?: TeacherNote[];
}

export interface TopicMastery {
  category: string;
  topic?: string;
  displayName: string;
  masteryPercent: number; // 0 - 100
  mastery?: number;
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  errorTypes: Record<string, number>;
  misconceptions: string[];
  lastAttemptedAt?: string;
  lastAttempted?: string;
}

export interface ConceptMasteryRecord {
  concept: string;
  topic: string;
  category: string;
  masteryPercent: number; // 0 - 100
  attempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  errorTypes: string[];
  misconceptions: string[];
  confidence: number;
  lastAttemptedAt: string;
}

export interface SubjectMasteryInfo {
  subject: SubjectType;
  displayName: string;
  masteryPercent: number; // 0 - 100
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  topicsPracticed: number;
  activeMisconceptions: string[];
}

export interface MultiTopicStudentProgress {
  studentId: string;
  studentName?: string;
  overallMastery: number; // 0 - 100
  totalAttempts: number;
  correctAttempts: number;
  subjectBreakdown?: Record<SubjectType, SubjectMasteryInfo>;
  topics: Record<string, TopicMastery>;
  topicPerformance: {
    category: string;
    topic?: string;
    displayName: string;
    masteryPercent: number;
    attempts: number;
    status: 'strong' | 'developing' | 'needs_attention';
  }[];
  strengths: any[];
  needsAttention: any[];
  weaknesses?: any[];
  misconceptionsDetected: {
    id?: string;
    name: string;
    subject?: SubjectType | string;
    category: string;
    topic?: string;
    count?: number;
    occurrences?: number;
    lastDetected?: string;
    evidenceSnippet?: string;
    recentEvidence?: string;
    sampleQuestion?: string;
    sampleAnswer?: string;
    expectedAnswer?: string;
    whatWentWrong?: string;
    recommendedPractice?: string;
  }[];
  errorTypeBreakdown: Record<string, number>;
  recentAttempts: any[];
  recentErrors?: {
    errorType: string;
    question: string;
    timestamp: string;
  }[];
}

export interface TeacherMisconceptionAnalyticsItem {
  name: string;
  misconception?: string;
  code?: string;
  category: string;
  topicsAffected: string[];
  affectedStudentCount: number;
  studentsAffected?: number;
  totalOccurrences: number;
  exampleQuestions: string[];
  recentOccurrences: any[];
  recommendedIntervention?: string;
}

export interface TeacherCohortAnalytics {
  totalStudents: number;
  activeLearnersToday?: number;
  activeStudents?: number;
  overallClassMastery?: number; // 0 - 100%
  averageMastery?: number;
  conceptsNeedingAttentionCount?: number;
  activeMisconceptionsCount?: number;
  recoveryRatePercent?: number; // e.g. 78%
  misconceptionClusters?: MisconceptionCluster[];
  priorityActions?: TeacherPriorityAction[];
  topicPerformance: {
    topic: string;
    category?: string;
    mastery: number;
    accuracy: number;
    attempts?: number;
    flaggedStudentsCount?: number;
  }[];
  misconceptionDistribution?: {
    misconceptionCode: string;
    name: string;
    studentCount: number;
    severity: 'high' | 'medium' | 'low';
  }[];
  misconceptionAnalytics?: TeacherMisconceptionAnalyticsItem[];
  conceptsNeedingAttention?: {
    conceptId: string;
    title: string;
    averageMastery: number;
    flaggedStudentsCount: number;
    urgency: 'High' | 'Moderate' | 'Low';
  }[];
  students?: any[];
  studentsNeedingAttention?: any;
  mostCommonMisconception?: string;
}

// ==========================================
// 10. Phase 4 Grounding, Robustness & Evaluation
// ==========================================

export interface EvalTestCase {
  id: string;
  title: string;
  description: string;
  testType: 
    | 'normal_misconception' 
    | 'similar_wrong_answer_diff_misconception' 
    | 'correct_reasoning' 
    | 'out_of_scope' 
    | 'prompt_injection';
  input: {
    question: string;
    expectedAnswer: string;
    studentAnswer: string;
    studentReasoning: string;
    concept?: string;
  };
  expected: {
    diagnosis?: DiagnosisCategory;
    scopeStatus?: InputScopeStatus;
    isCorrect?: boolean;
    expectedMisconceptionCode?: string;
    expectedBehaviorSummary: string;
  };
}

export interface EvalTestRunResult {
  testCaseId: string;
  title: string;
  passed: boolean;
  latencyMs: number;
  input: {
    question: string;
    studentReasoning: string;
    studentAnswer: string;
  };
  expectedBehavior: string;
  actualBehavior: string;
  actualDiagnosis: DiagnosticResult;
  confidence: number;
  confidenceBand: ConfidenceBand;
  scopeStatus: InputScopeStatus;
  notes?: string;
}
export interface DiagnosticRecord {
  id: string;
  studentId: string;
  subject?: SubjectType | string;
  category?: string;
  topic?: string;
  concept?: string;
  questionId?: string;
  question: string;
  studentAnswer: string;
  correctAnswer?: string;
  studentReasoning?: string;
  result?: 'CORRECT' | 'PARTIALLY_CORRECT' | 'INCORRECT';
  misconception?: string;
  errorType?: ErrorType | string;
  misconceptionTag?: string;
  diagnosis: DiagnosisCategory;
  confidence: number;
  evidence: string;
  recommendedAction?: string;
  recommendedIntervention: RecommendedIntervention;
  timestamp: string;
  responseId?: string;
  diagnosisId?: string;
  interventionId?: string;
  teacherReviewed?: boolean;
}

// ==========================================
// 8. Notifications Domain Models
// ==========================================

export type NotificationType =
  | 'misconception_detected'
  | 'practice_recommendation'
  | 'progress_improved'
  | 'mastery_increased'
  | 'practice_reminder'
  | 'new_topic_available'
  | 'weakness_identified'
  | 'recommended_revision'
  | 'learning_milestone'
  | 'student_misconception_detected'
  | 'student_performance_changed'
  | 'student_struggling'
  | 'student_improved'
  | 'student_repeated_error'
  | 'class_performance_update'
  | 'student_alert'
  | 'system_update';

export type NotificationCategory = 'ai' | 'progress' | 'success' | 'attention' | 'important';

export interface AppNotification {
  id: string;
  userId: string;
  role: 'student' | 'teacher';
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedStudentId?: string;
  relatedTopic?: string;
  actionUrl?: string;
  category?: NotificationCategory;
}

export interface NotificationResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
