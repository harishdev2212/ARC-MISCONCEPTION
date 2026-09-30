import React, { createContext, useContext, useState } from 'react';
import { 
  LearningSession, 
  Diagnosis, 
  Intervention, 
  RecoveryAttempt, 
  LearnerConceptState,
  StudentResponse,
  DialogueTurn,
  StructuredRespondResponse,
  Question,
  DiagnosticResult,
  SubjectType
} from '@shared/types';
import { api } from '../services/api';

interface DiagnosticErrorState {
  code: string;
  message: string;
}

interface SessionContextType {
  session: LearningSession | null;
  diagnosis: Diagnosis | null;
  intervention: Intervention | null;
  dialogueHistory: DialogueTurn[];
  transferQuestion: Question | null;
  recoveryAttempt: RecoveryAttempt | null;
  updatedLearnerState: LearnerConceptState | null;
  isSubmitting: boolean;
  lastError: DiagnosticErrorState | null;
  clearError: () => void;
  startSession: (studentId: string, options?: {
    conceptId?: string;
    customQuestion?: any;
    difficulty?: 'easy' | 'medium' | 'hard';
    questionId?: string;
    topic?: string;
    category?: string;
    subject?: SubjectType | string;
  }) => Promise<void>;
  submitReasoning: (reasoningText: string, submittedAnswer?: string) => Promise<boolean>;
  respondToDialogue: (studentResponse: string) => Promise<StructuredRespondResponse | null>;
  diagnoseDirect: (params: {
    studentId: string;
    question: string;
    expectedAnswer?: string;
    studentAnswer?: string;
    studentReasoning: string;
    concept?: string;
  }) => Promise<DiagnosticResult | null>;
  submitInterventionReply: (replyText: string) => Promise<void>;
  submitRecovery: (transferReasoning: string) => Promise<void>;
  resetSession: () => Promise<void>;
  jumpToPhase: (phase: LearningSession['currentPhase']) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<LearningSession | null>(null);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [intervention, setIntervention] = useState<Intervention | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([]);
  const [transferQuestion, setTransferQuestion] = useState<Question | null>(null);
  const [recoveryAttempt, setRecoveryAttempt] = useState<RecoveryAttempt | null>(null);
  const [updatedLearnerState, setUpdatedLearnerState] = useState<LearnerConceptState | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [lastError, setLastError] = useState<DiagnosticErrorState | null>(null);

  const clearError = () => setLastError(null);

  const startSession = async (studentId: string, options?: any) => {
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.startSession(studentId, options);
      setSession(res.session);
      setDiagnosis(null);
      setIntervention(null);
      setDialogueHistory([]);
      setTransferQuestion(null);
      setRecoveryAttempt(null);
      setUpdatedLearnerState(null);
    } catch (err: any) {
      console.error('Failed to start session', err);
      setLastError({
        code: 'SESSION_START_FAILED',
        message: err?.message || 'Could not start session.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Submit reasoning to backend /api/sessions/:id/submit-reasoning
   * Which runs the real Gemini AI diagnostic engine
   */
  const submitReasoning = async (reasoningText: string, submittedAnswer: string = ''): Promise<boolean> => {
    if (!session) return false;
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.submitReasoning(session.id, reasoningText, submittedAnswer);
      setSession(res.session);
      setDiagnosis(res.diagnosis);
      setIntervention(res.intervention);
      setDialogueHistory(res.session?.dialogueHistory || []);
      return true;
    } catch (err: any) {
      console.error('Diagnostic submission failed:', err);
      setLastError({
        code: err?.code || 'DIAGNOSTIC_FAILURE',
        message: err?.message || 'The diagnostic engine encountered an error.'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Direct call to POST /api/diagnose
   */
  const diagnoseDirect = async (params: {
    studentId: string;
    question: string;
    expectedAnswer?: string;
    studentAnswer?: string;
    studentReasoning: string;
    concept?: string;
  }): Promise<DiagnosticResult | null> => {
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.diagnose(params);
      if (!res.success || res.error) {
        setLastError({
          code: res.error?.code || 'DIAGNOSTIC_ERROR',
          message: res.error?.message || 'Diagnosis failed.'
        });
        return null;
      }
      if (res.intervention) {
        setIntervention(res.intervention);
      }
      return res.diagnosis || null;
    } catch (err: any) {
      setLastError({
        code: 'NETWORK_ERROR',
        message: err?.message || 'Network failure communicating with diagnostic API.'
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const respondToDialogue = async (studentResponse: string): Promise<StructuredRespondResponse | null> => {
    if (!session) return null;
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.respondToDialogue(session.id, studentResponse);
      if (res && res.success) {
        setDialogueHistory(res.session.dialogueHistory || []);
        setSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            attemptCount: res.session.attemptCount,
            interventionLevel: res.session.interventionLevel,
            nextAction: res.session.nextAction,
            dialogueHistory: res.session.dialogueHistory,
            understandingDetected: res.diagnosis.understandingDetected,
            misconceptionPersisting: res.diagnosis.persists
          };
        });

        // Update current intervention
        const levelMap: Record<1 | 2 | 3, any> = {
          1: 'level_1_socratic_question',
          2: 'level_2_counter_example',
          3: 'level_3_scaffolded_steps'
        };
        const newIntv: Intervention = {
          id: `intv-${Date.now()}`,
          diagnosisId: session.currentDiagnosis?.id || `diag-${Date.now()}`,
          studentId: session.studentId,
          level: levelMap[res.intervention.level] || 'level_1_socratic_question',
          levelNumber: res.intervention.level,
          type: res.intervention.type,
          tutorMessage: res.intervention.text,
          socraticQuestion: res.intervention.text,
          hintPrompt: res.intervention.hintPrompt,
          requiresStudentResponse: res.session.nextAction === 'WAIT_FOR_STUDENT',
          timestamp: new Date().toISOString(),
          status: res.intervention.isFallback ? 'mock_placeholder' : 'ai_generated',
          isFallback: res.intervention.isFallback
        };
        setIntervention(newIntv);

        if (res.diagnosis.understandingDetected) {
          // Pre-fetch transfer question
          api.submitInterventionReply(session.id, studentResponse).then(replyRes => {
            if (replyRes?.transferQuestion) {
              setTransferQuestion(replyRes.transferQuestion);
            }
          });
        }
      }
      return res;
    } catch (err: any) {
      console.error('Failed to submit dialogue response:', err);
      setLastError({
        code: err?.code || 'DIALOGUE_ERROR',
        message: err?.message || 'Failed to process Socratic response.'
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitInterventionReply = async (replyText: string) => {
    if (!session) return;
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.submitInterventionReply(session.id, replyText);
      setTransferQuestion(res.transferQuestion);
      setSession(prev => prev ? { ...prev, currentPhase: 'transfer_question', transferQuestion: res.transferQuestion } : null);
    } catch (err: any) {
      console.error('Failed to submit intervention reply', err);
      setLastError({
        code: 'REPLY_FAILED',
        message: err?.message || 'Failed to submit intervention reply.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitRecovery = async (transferReasoning: string) => {
    if (!session) return;
    setIsSubmitting(true);
    clearError();
    try {
      const res = await api.submitRecovery(session.id, transferReasoning);
      setSession(res.session);
      setRecoveryAttempt(res.recoveryAttempt);
      setUpdatedLearnerState(res.updatedLearnerState);
    } catch (err: any) {
      console.error('Failed to submit recovery', err);
      setLastError({
        code: 'RECOVERY_FAILED',
        message: err?.message || 'Failed to submit recovery check.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSession = async () => {
    if (session) {
      await startSession(session.studentId);
    }
  };

  const jumpToPhase = (phase: LearningSession['currentPhase']) => {
    setSession(prev => prev ? { ...prev, currentPhase: phase } : null);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        diagnosis,
        intervention,
        dialogueHistory,
        transferQuestion,
        recoveryAttempt,
        updatedLearnerState,
        isSubmitting,
        lastError,
        clearError,
        startSession,
        submitReasoning,
        respondToDialogue,
        diagnoseDirect,
        submitInterventionReply,
        submitRecovery,
        resetSession,
        jumpToPhase
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
