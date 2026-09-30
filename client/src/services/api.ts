import { 
  Student, 
  Teacher, 
  LearningSession, 
  Diagnosis, 
  Intervention, 
  RecoveryAttempt, 
  LearnerConceptState,
  TeacherCohortAnalytics,
  StructuredRespondResponse,
  UserProfile,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  MathImageExtractionResult,
  Question,
  AppNotification,
  NotificationResponse
} from '@shared/types';
import { 
  REFERENCE_LINEAR_EQUATION_CONCEPT, 
  CANONICAL_QUESTIONS, 
  TRANSFER_QUESTIONS 
} from '@shared/constants';

const API_BASE = '/api';
const TOKEN_KEY = 'mindtrace_auth_token';
const USER_KEY = 'mindtrace_auth_user';

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore localStorage access issues
  }
};

export const getStoredUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: UserProfile | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  } catch {
    // Ignore localStorage access issues
  }
};

const getHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {})
  };
  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // 1. Real Persistent Authentication
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = { error: 'Failed to process server response.' };
      }
      if (!res.ok) {
        throw new Error(result.error || 'Registration failed.');
      }
      setStoredToken(result.token);
      setStoredUser(result.user);
      return result;
    } catch (err: any) {
      if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')))) {
        throw new Error('Backend service is currently unavailable. Please verify the server is running on port 5000.');
      }
      throw err;
    }
  },

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      let result: any = {};
      try {
        result = await res.json();
      } catch {
        result = { error: 'Failed to process server response.' };
      }
      if (!res.ok) {
        throw new Error(result.error || 'Invalid email or password.');
      }
      setStoredToken(result.token);
      setStoredUser(result.user);
      return result;
    } catch (err: any) {
      if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')))) {
        throw new Error('Backend service is currently unavailable. Please verify the server is running on port 5000.');
      }
      throw err;
    }
  },

  async getMe(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        setStoredToken(null);
        setStoredUser(null);
        throw new Error('Session expired or not authenticated');
      }
      const data = await res.json();
      setStoredUser(data.user);
      return data.user;
    } catch (err: any) {
      if (err.name === 'TypeError' || (err.message && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch')))) {
        // Network failure during session restore: do not wipe token immediately so offline state is preserved
        const cached = getStoredUser();
        if (cached) return cached;
        throw new Error('Backend service unavailable during session restore.');
      }
      throw err;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setStoredToken(null);
      setStoredUser(null);
    }
  },

  // Backward compatibility profile endpoint if needed
  async getProfiles(): Promise<{ students: Student[]; teachers: Teacher[] }> {
    try {
      const res = await fetch(`${API_BASE}/auth/profiles`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('API failed');
      return await res.json();
    } catch {
      return { students: [], teachers: [] };
    }
  },

  // 2. Student Dashboard & Progress
  async getStudentDashboard(studentId: string) {
    const res = await fetch(`${API_BASE}/students/${studentId}/dashboard`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch student dashboard');
    }
    return await res.json();
  },

  async getStudentProgress(studentId: string) {
    const res = await fetch(`${API_BASE}/students/${studentId}/progress`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch student progress data');
    }
    return await res.json();
  },

  // 3. Learning Sessions
  async startSession(
    studentId: string, 
    options?: {
      conceptId?: string;
      customQuestion?: any;
      difficulty?: 'easy' | 'medium' | 'hard';
      questionId?: string;
      topic?: string;
      category?: string;
    } | string
  ): Promise<{ session: LearningSession }> {
    const conceptId = typeof options === 'string' ? options : options?.conceptId || REFERENCE_LINEAR_EQUATION_CONCEPT.id;
    const customQuestion = typeof options === 'object' ? options.customQuestion : undefined;
    const difficulty = typeof options === 'object' ? options.difficulty : undefined;
    const questionId = typeof options === 'object' ? options.questionId : undefined;
    const topic = typeof options === 'object' ? options.topic : undefined;
    const category = typeof options === 'object' ? options.category : undefined;

    const res = await fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        studentId, 
        conceptId, 
        customQuestion, 
        difficulty, 
        questionId,
        topic,
        category
      })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to start learning session');
    }
    return await res.json();
  },

  async extractMathImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<MathImageExtractionResult> {
    const res = await fetch(`${API_BASE}/sessions/extract-math-image`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ imageBase64, mimeType })
    });
    const data = await res.json();
    return data;
  },

  async getNextQuestion(options?: {
    studentId?: string;
    subject?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    topic?: string;
    category?: string;
    excludeQuestionIds?: string[];
  }): Promise<{ question: Question }> {
    const res = await fetch(`${API_BASE}/sessions/questions/next`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(options || {})
    });
    if (!res.ok) {
      throw new Error('Failed to retrieve next question');
    }
    return await res.json();
  },

  async explainProblem(problem: string, topic?: string, subject: string = 'Mathematics'): Promise<{
    success: boolean;
    problem?: string;
    topic?: string;
    subject?: string;
    explanation?: {
      steps: string[];
      solution: string;
      summary: string;
    };
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/sessions/explain-problem`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ problem, subject, topic })
    });
    if (!res.ok) {
      throw new Error('Failed to explain problem');
    }
    return await res.json();
  },

  async getStudentReport(studentId: string) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/report`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error('Failed to fetch student report');
    }
    return await res.json();
  },

  async diagnose(data: {
    studentId: string;
    question: string;
    expectedAnswer?: string;
    studentAnswer?: string;
    studentReasoning: string;
    concept?: string;
  }): Promise<{
    success: boolean;
    diagnosis?: any;
    intervention?: Intervention;
    error?: {
      code: string;
      message: string;
      details?: string;
    };
  }> {
    const res = await fetch(`${API_BASE}/diagnose`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        studentId: data.studentId,
        question: data.question,
        expectedAnswer: data.expectedAnswer || '',
        studentAnswer: data.studentAnswer || '',
        studentReasoning: data.studentReasoning,
        concept: data.concept || 'linear_equations'
      })
    });

    const json = await res.json();
    return json;
  },

  async submitReasoning(
    sessionId: string, 
    reasoningText: string,
    submittedAnswer: string = ''
  ): Promise<{
    session: LearningSession;
    diagnosis: Diagnosis;
    intervention: Intervention;
  }> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/submit-reasoning`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reasoningText, submittedAnswer })
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      const errorMsg = data?.error?.message || data?.error || 'Reasoning evaluation failed.';
      const err = new Error(errorMsg);
      (err as any).code = data?.error?.code || 'DIAGNOSTIC_FAILURE';
      throw err;
    }

    return data;
  },

  async respondToDialogue(
    sessionId: string,
    studentResponse: string
  ): Promise<StructuredRespondResponse> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/respond`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentResponse })
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      const errorMsg = data?.error?.message || data?.error || 'Failed to process Socratic response.';
      const err = new Error(errorMsg);
      (err as any).code = data?.error?.code || 'DIALOGUE_ERROR';
      throw err;
    }

    return data;
  },

  async submitInterventionReply(sessionId: string, studentReply: string) {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/submit-intervention-reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentReply })
    });
    if (!res.ok) {
      throw new Error('Failed to submit intervention reply');
    }
    return await res.json();
  },

  async submitRecovery(sessionId: string, studentReasoning: string): Promise<{
    session: LearningSession;
    recoveryAttempt: RecoveryAttempt;
    updatedLearnerState: LearnerConceptState;
  }> {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/submit-recovery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ studentReasoning })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit recovery evaluation');
    }
    return await res.json();
  },

  // 4. Teacher API
  async getTeacherDashboard() {
    const res = await fetch(`${API_BASE}/teacher/dashboard`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch teacher cohort dashboard');
    }
    return await res.json();
  },

  async getTeacherStudentProfile(studentId: string) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch student profile');
    }
    return await res.json();
  },

  async reviewMisconception(studentId: string, reviewedBy?: string) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/review-misconception`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reviewedBy })
    });
    return await res.json();
  },

  async reclassifyMisconception(studentId: string, data: {
    newDiagnosis: string;
    newCode: string;
    newName: string;
    reason: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/reclassify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async assignRemediation(studentId: string, data: {
    strategy: string;
    customInstructions?: string;
    misconceptionCode?: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/remediation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async addTeacherNote(studentId: string, data: {
    noteText: string;
    category?: string;
    teacherName?: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/note`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async verifyRecovery(studentId: string, data: {
    verifiedBy?: string;
    feedbackNotes?: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/students/${studentId}/verify-recovery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  // 5. Phase 4 Evaluation Runner API
  async getEvalCases() {
    const res = await fetch(`${API_BASE}/eval/cases`, {
      headers: getHeaders()
    });
    return await res.json();
  },

  async runEvaluation(testCaseId?: string) {
    const res = await fetch(`${API_BASE}/eval/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ testCaseId })
    });
    return await res.json();
  },

  // 6. Notifications API
  async getNotifications(): Promise<NotificationResponse> {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        return { notifications: [], unreadCount: 0 };
      }
      return await res.json();
    } catch {
      return { notifications: [], unreadCount: 0 };
    }
  },

  async markNotificationRead(id: string): Promise<{ success: boolean; unreadCount: number }> {
    try {
      const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch {
      return { success: false, unreadCount: 0 };
    }
  },

  async markAllNotificationsRead(): Promise<{ success: boolean; markedCount: number; unreadCount: number }> {
    try {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await res.json();
    } catch {
      return { success: false, markedCount: 0, unreadCount: 0 };
    }
  }
};
