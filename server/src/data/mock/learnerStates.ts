import { LearnerConceptState } from '@shared/types';

export const MOCK_LEARNER_STATES: Record<string, LearnerConceptState> = {
  // 1. Alex Rivera: Active Unilateral Operation misconception, currently in session
  'std-alex-rivera': {
    id: 'lcs-alex-001',
    studentId: 'std-alex-rivera',
    conceptId: 'concept-linear-eq-multistep',
    mastery: 0.58, // Conceptual baseline
    confidence: 0.65,
    activeMisconception: {
      id: 'misc-unilateral-op',
      code: 'EQ-UNILATERAL-OP',
      name: 'Unilateral Operation',
      detectedAt: '2026-09-28T18:32:00Z',
      evidenceSnippet: 'I subtracted 8 to cancel it out from the left, so 3x = 29.'
    },
    misconceptionHistory: [
      {
        id: 'hist-alex-01',
        misconceptionId: 'misc-unlike-terms',
        misconceptionName: 'Invalid Variable Combination',
        questionId: 'q-prior-01',
        detectedAt: '2026-09-24T10:15:00Z',
        evidence: 'Added 2x and 4 to make 6x.',
        interventionLevelUsed: 'level_1_socratic_question',
        recovered: true,
        recoveryTimestamp: '2026-09-24T10:28:00Z'
      },
      {
        id: 'hist-alex-02',
        misconceptionId: 'misc-unilateral-op',
        misconceptionName: 'Unilateral Operation',
        questionId: 'q-canon-01',
        detectedAt: '2026-09-28T18:32:00Z',
        evidence: 'I subtracted 8 to cancel it out from the left, so 3x = 29.',
        interventionLevelUsed: 'level_1_socratic_question',
        recovered: false
      }
    ],
    attempts: 4,
    hintsUsed: 2,
    interventionsReceived: 2,
    recoveryStatus: 'in_progress',
    lastAssessedAt: '2026-09-28T18:35:00Z'
  },

  // 2. Maya Lin: Recovered student with high mastery
  'std-maya-lin': {
    id: 'lcs-maya-002',
    studentId: 'std-maya-lin',
    conceptId: 'concept-linear-eq-multistep',
    mastery: 0.92,
    confidence: 0.90,
    activeMisconception: undefined,
    misconceptionHistory: [
      {
        id: 'hist-maya-01',
        misconceptionId: 'misc-sign-invert',
        misconceptionName: 'Sign Inversion Failure',
        questionId: 'q-canon-02',
        detectedAt: '2026-09-26T14:10:00Z',
        evidence: 'Moved -14 to right side and left it as -14.',
        interventionLevelUsed: 'level_2_counter_example',
        recovered: true,
        recoveryTimestamp: '2026-09-26T14:35:00Z'
      }
    ],
    attempts: 6,
    hintsUsed: 1,
    interventionsReceived: 1,
    recoveryStatus: 'recovered',
    lastAssessedAt: '2026-09-28T16:15:00Z'
  },

  // 3. Jordan Patel: Active Sign Inversion Failure
  'std-jordan-patel': {
    id: 'lcs-jordan-003',
    studentId: 'std-jordan-patel',
    conceptId: 'concept-linear-eq-multistep',
    mastery: 0.44,
    confidence: 0.50,
    activeMisconception: {
      id: 'misc-sign-invert',
      code: 'EQ-SIGN-INVERT',
      name: 'Sign Inversion Failure',
      detectedAt: '2026-09-28T14:18:00Z',
      evidenceSnippet: 'Transposed -14 across equals without changing to +14.'
    },
    misconceptionHistory: [
      {
        id: 'hist-jordan-01',
        misconceptionId: 'misc-sign-invert',
        misconceptionName: 'Sign Inversion Failure',
        questionId: 'q-canon-02',
        detectedAt: '2026-09-28T14:18:00Z',
        evidence: 'Transposed -14 across equals without changing to +14.',
        interventionLevelUsed: 'level_1_socratic_question',
        recovered: false
      }
    ],
    attempts: 3,
    hintsUsed: 3,
    interventionsReceived: 1,
    recoveryStatus: 'in_progress',
    lastAssessedAt: '2026-09-28T14:22:00Z'
  },

  // 4. Marcus Vance: Needs escalation / unrecovered after intervention
  'std-marcus-vance': {
    id: 'lcs-marcus-004',
    studentId: 'std-marcus-vance',
    conceptId: 'concept-linear-eq-multistep',
    mastery: 0.35,
    confidence: 0.38,
    activeMisconception: {
      id: 'misc-distrib-partial',
      code: 'EQ-DISTRIB-PARTIAL',
      name: 'Incomplete Distribution',
      detectedAt: '2026-09-27T19:40:00Z',
      evidenceSnippet: 'For 3(2x - 4), wrote 6x - 4 instead of 6x - 12.'
    },
    misconceptionHistory: [
      {
        id: 'hist-marcus-01',
        misconceptionId: 'misc-distrib-partial',
        misconceptionName: 'Incomplete Distribution',
        questionId: 'q-distrib-01',
        detectedAt: '2026-09-27T19:40:00Z',
        evidence: 'For 3(2x - 4), wrote 6x - 4 instead of 6x - 12.',
        interventionLevelUsed: 'level_3_scaffolded_steps',
        recovered: false
      }
    ],
    attempts: 5,
    hintsUsed: 4,
    interventionsReceived: 3,
    recoveryStatus: 'unrecovered_needs_escalation',
    lastAssessedAt: '2026-09-27T19:50:00Z'
  },

  // 5. Chloe Bennett: Steady progress, recovered on balance operations
  'std-chloe-bennett': {
    id: 'lcs-chloe-005',
    studentId: 'std-chloe-bennett',
    conceptId: 'concept-linear-eq-multistep',
    mastery: 0.84,
    confidence: 0.82,
    activeMisconception: undefined,
    misconceptionHistory: [
      {
        id: 'hist-chloe-01',
        misconceptionId: 'misc-unilateral-op',
        misconceptionName: 'Unilateral Operation',
        questionId: 'q-canon-01',
        detectedAt: '2026-09-25T11:20:00Z',
        evidence: 'Divided only one term on left side by 3.',
        interventionLevelUsed: 'level_2_counter_example',
        recovered: true,
        recoveryTimestamp: '2026-09-25T11:42:00Z'
      }
    ],
    attempts: 4,
    hintsUsed: 1,
    interventionsReceived: 1,
    recoveryStatus: 'recovered',
    lastAssessedAt: '2026-09-28T17:05:00Z'
  }
};
