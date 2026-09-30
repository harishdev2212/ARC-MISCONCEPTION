import { 
  LearnerConceptState, 
  Diagnosis, 
  RecoveryAttempt, 
  RecoveryStatus, 
  StudentResponse, 
  Intervention, 
  DiagnosisCategory, 
  RecommendedIntervention,
  MisconceptionCluster,
  TeacherPriorityAction,
  TeacherNote,
  TeacherRemediationAssignment,
  CognitiveTraceStep,
  Student
} from '@shared/types';
import type { DiagnosticRecord } from '@shared/types';
import { MOCK_LEARNER_STATES } from '../data/mock/learnerStates';
import { LINEAR_EQUATIONS_CONCEPT } from '../data/reference/curriculum';

export type { DiagnosticRecord };

/**
 * LearnerStateManager (Phase 1 Baseline / Phase 2 & 3 Teacher Intelligence Architecture)
 * 
 * Manages the student's dynamic cognitive model:
 * - Current mastery
 * - Active misconceptions
 * - Intervention count & recovery status
 * - Grounded persistence for StudentResponse, Diagnosis, Intervention, and DiagnosticRecords
 * - Teacher Remediation Controls (reviews, reclassifications, notes, assignments, recovery verifications)
 * - Derived Analytics (Cohort Metrics, Misconception Clusters, Priority Actions, Evidence Traces)
 */
import { db } from '../data/db/database';

export class LearnerStateManager {
  constructor() {
    // Persistent disk-backed state in database.ts
  }

  getStudentState(studentId: string, conceptId: string = LINEAR_EQUATIONS_CONCEPT.id): LearnerConceptState {
    return db.getLearnerState(studentId, conceptId);
  }

  /**
   * Stores StudentResponse, Diagnosis, and Intervention along with the unified DiagnosticRecord.
   * Does NOT store chain of thought.
   */
  recordDiagnosticEvent(
    record: DiagnosticRecord,
    response?: StudentResponse,
    diagnosis?: Diagnosis,
    intervention?: Intervention
  ): DiagnosticRecord {
    db.recordDiagnosticEvent(record, response, diagnosis, intervention);

    // Update the cognitive state (normalize to canonical concept id)
    const canonicalConceptId = (!record.concept || record.concept === 'linear_equations' || record.concept.includes('linear'))
      ? LINEAR_EQUATIONS_CONCEPT.id
      : record.concept;
    const state = this.getStudentState(record.studentId, canonicalConceptId);
    state.attempts += 1;
    state.lastAssessedAt = record.timestamp;

    if (record.diagnosis === 'correct_reasoning') {
      state.mastery = Math.min(1.0, +(state.mastery + 0.08).toFixed(2));
      db.addActivity(record.studentId, {
        type: 'reasoning_submission',
        title: 'Reasoning Verified',
        equation: record.question || 'Linear Equation',
        outcome: 'Correct Reasoning',
        status: 'success'
      });
    } else if (record.diagnosis !== 'insufficient_evidence' && record.diagnosis !== 'out_of_scope') {
      const isCalculationSlip = record.errorType === 'arithmetic_error' || record.errorType === 'careless_mistake' || record.errorType === 'correct_reasoning_incorrect_calculation';
      const name = record.misconceptionTag || (isCalculationSlip ? 'Arithmetic Calculation Error' : record.diagnosis.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      const code = `EQ-${(record.misconceptionTag || record.errorType || record.diagnosis).toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`;

      if (!isCalculationSlip) {
        state.interventionsReceived += 1;
        state.activeMisconception = {
          id: `misc-${record.misconceptionTag || record.diagnosis}`,
          code,
          name,
          detectedAt: record.timestamp,
          evidenceSnippet: record.evidence
        };

        state.misconceptionHistory.push({
          id: `hist-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          misconceptionId: `misc-${record.misconceptionTag || record.diagnosis}`,
          misconceptionName: name,
          questionId: record.question,
          detectedAt: record.timestamp,
          evidence: record.evidence,
          interventionLevelUsed: 'level_1_socratic_question',
          recovered: false
        });

        state.recoveryStatus = 'in_progress';
      }

      state.mastery = Math.max(0.15, +(state.mastery - (isCalculationSlip ? 0.02 : 0.05)).toFixed(2));

      db.addActivity(record.studentId, {
        type: 'reasoning_submission',
        title: `Submitted Reasoning for ${record.topic || record.category || 'Mathematics'}`,
        equation: record.question || 'Multi-Step Problem',
        outcome: isCalculationSlip ? 'Arithmetic Error' : 'Misconception Flagged',
        status: isCalculationSlip ? 'info' : 'warning'
      });
    }

    db.saveLearnerState(state);
    return record;
  }

  getDiagnosticRecords(studentId?: string): DiagnosticRecord[] {
    return db.getDiagnosticRecords(studentId);
  }

  getStudentResponses(studentId?: string): StudentResponse[] {
    return db.getStudentResponses(studentId || '');
  }

  updateOnRecovery(
    studentId: string,
    conceptId: string,
    recoveryAttempt: RecoveryAttempt
  ): LearnerConceptState {
    const state = this.getStudentState(studentId, conceptId);
    state.recoveryStatus = recoveryAttempt.status;
    state.lastAssessedAt = new Date().toISOString();

    if (recoveryAttempt.status === 'recovered') {
      state.activeMisconception = undefined;
      const latestHistory = state.misconceptionHistory[state.misconceptionHistory.length - 1];
      if (latestHistory) {
        latestHistory.recovered = true;
        latestHistory.recoveryTimestamp = recoveryAttempt.timestamp;
      }
      state.mastery = Math.min(1.0, +(state.mastery + 0.15).toFixed(2));
      db.addActivity(studentId, {
        type: 'recovery_check',
        title: 'Transfer Recovery Verified',
        equation: 'Transfer Equation Verification',
        outcome: 'Verified Recovered',
        status: 'success'
      });
    } else {
      db.addActivity(studentId, {
        type: 'recovery_check',
        title: 'Transfer Recovery Check',
        equation: 'Transfer Verification',
        outcome: 'In Progress',
        status: 'pending'
      });
    }

    db.saveLearnerState(state);
    return state;
  }

  getAllStates(): LearnerConceptState[] {
    return db.getAllLearnerStates();
  }

  // ==========================================
  // Phase 3: Teacher Remediation Controls
  // ==========================================

  addTeacherNote(note: TeacherNote): TeacherNote {
    db.addTeacherNote(note.studentId, note);
    return note;
  }

  getTeacherNotes(studentId: string): TeacherNote[] {
    return db.getTeacherNotes(studentId);
  }

  assignRemediation(assignment: TeacherRemediationAssignment): TeacherRemediationAssignment {
    db.addRemediationAssignment(assignment.studentId, assignment);
    return assignment;
  }

  getRemediations(studentId: string): TeacherRemediationAssignment[] {
    return db.getRemediationAssignments(studentId);
  }

  markMisconceptionReviewed(studentId: string, conceptId: string, reviewedBy: string): LearnerConceptState {
    const state = this.getStudentState(studentId, conceptId);
    // Add audit note
    this.addTeacherNote({
      id: `note-${Date.now()}`,
      teacherId: 'tch-teacher',
      teacherName: reviewedBy,
      studentId,
      noteText: `Educator reviewed active diagnosis for ${state.activeMisconception?.name || 'concept'}.`,
      timestamp: new Date().toISOString(),
      category: 'observation'
    });

    // Mark recent diagnosis as reviewed
    const diags = db.getDiagnosticRecords(studentId);
    if (diags.length > 0) {
      diags[diags.length - 1].teacherReviewed = true;
    }

    return state;
  }

  reclassifyMisconception(
    studentId: string, 
    conceptId: string, 
    newDiagnosis: DiagnosisCategory, 
    newCode: string, 
    newName: string, 
    reason: string
  ): LearnerConceptState {
    const state = this.getStudentState(studentId, conceptId);
    const oldName = state.activeMisconception?.name || 'Previous Classification';

    state.activeMisconception = {
      id: `misc-${newDiagnosis}`,
      code: newCode,
      name: newName,
      detectedAt: new Date().toISOString(),
      evidenceSnippet: `Teacher reclassification: ${reason}`
    };

    // Update history
    state.misconceptionHistory.push({
      id: `hist-reclass-${Date.now()}`,
      misconceptionId: `misc-${newDiagnosis}`,
      misconceptionName: newName,
      questionId: 'teacher-override',
      detectedAt: new Date().toISOString(),
      evidence: reason,
      interventionLevelUsed: 'level_1_socratic_question',
      recovered: false
    });

    this.addTeacherNote({
      id: `note-${Date.now()}`,
      teacherId: 'tch-teacher',
      teacherName: 'Teacher Audit',
      studentId,
      noteText: `Reclassified diagnosis from "${oldName}" to "${newName}". Rationale: ${reason}`,
      timestamp: new Date().toISOString(),
      category: 'audit_override'
    });

    return state;
  }

  verifyRecovery(studentId: string, conceptId: string, verifiedBy: string, notes?: string): LearnerConceptState {
    const state = this.getStudentState(studentId, conceptId);
    state.recoveryStatus = 'recovered';
    state.activeMisconception = undefined;
    state.mastery = Math.min(1.0, +(state.mastery + 0.15).toFixed(2));
    state.lastAssessedAt = new Date().toISOString();

    const latestHistory = state.misconceptionHistory[state.misconceptionHistory.length - 1];
    if (latestHistory) {
      latestHistory.recovered = true;
      latestHistory.recoveryTimestamp = new Date().toISOString();
    }

    this.addTeacherNote({
      id: `note-${Date.now()}`,
      teacherId: 'tch-teacher',
      teacherName: verifiedBy,
      studentId,
      noteText: `Manually verified student transfer recovery. ${notes || 'Reasoning balance confirmed by instructor.'}`,
      timestamp: new Date().toISOString(),
      category: 'remediation_plan'
    });

    return state;
  }

  // ==========================================
  // Phase 3: Derived Cohort Intelligence
  // ==========================================

  getMisconceptionClusters(students: Student[], conceptId: string = LINEAR_EQUATIONS_CONCEPT.id): MisconceptionCluster[] {
    const clusterMap: Map<string, {
      code: string;
      name: string;
      category: string;
      studentIds: string[];
      studentNames: string[];
      masteryList: number[];
      persistenceAttempts: number;
      description: string;
    }> = new Map();

    // Canonical descriptions for known algebra clusters
    const clusterMeta: Record<string, { name: string; category: string; desc: string }> = {
      'EQ-UNILATERAL-OP': {
        name: 'Unilateral Operation',
        category: 'Operational Balance',
        desc: 'Student subtracts, adds, or multiplies on one side of equation without mirror operation on the other side.'
      },
      'EQ-SIGN-INVERT': {
        name: 'Sign Inversion Failure',
        category: 'Sign Inversion',
        desc: 'Student transposes or moves a term across equals sign without reversing the arithmetic sign.'
      },
      'EQ-DISTRIB-PARTIAL': {
        name: 'Incomplete Distribution',
        category: 'Operational Balance',
        desc: 'Multiplies outer factor across only the first term inside parentheses.'
      },
      'EQ-OVERGENERALIZATION': {
        name: 'Combining Unlike Terms',
        category: 'Variable Isolation',
        desc: 'Combines variable and constant terms into a single monomial term (e.g. 2x + 4 = 6x).'
      },
      'EQ-PROCEDURAL-ERROR': {
        name: 'Procedural Operation Asymmetry',
        category: 'Operational Balance',
        desc: 'General arithmetic procedure failure in balancing equation equality.'
      }
    };

    for (const student of students) {
      const state = this.getStudentState(student.id, conceptId);
      const active = state.activeMisconception;
      if (active) {
        const code = active.code || 'EQ-PROCEDURAL-ERROR';
        const meta = clusterMeta[code] || {
          name: active.name,
          category: 'Algebraic Procedural',
          desc: 'Persistent misconception observed in algebraic manipulation.'
        };

        if (!clusterMap.has(code)) {
          clusterMap.set(code, {
            code,
            name: meta.name,
            category: meta.category,
            studentIds: [],
            studentNames: [],
            masteryList: [],
            persistenceAttempts: 0,
            description: meta.desc
          });
        }

        const cluster = clusterMap.get(code)!;
        cluster.studentIds.push(student.id);
        cluster.studentNames.push(student.name);
        cluster.masteryList.push(state.mastery);
        cluster.persistenceAttempts += Math.max(state.attempts, 1);
      }
    }

    const clusters: MisconceptionCluster[] = [];
    for (const [code, val] of clusterMap.entries()) {
      const count = val.studentIds.length;
      const avgMastery = Math.round(
        (val.masteryList.reduce((a, b) => a + b, 0) / (count || 1)) * 100
      );

      let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      if (count >= 2 || val.persistenceAttempts >= 3) {
        urgency = 'HIGH';
      } else if (count >= 1) {
        urgency = 'MEDIUM';
      }

      clusters.push({
        id: `cluster-${code}`,
        code,
        name: val.name,
        category: val.category,
        affectedStudentCount: count,
        affectedStudentIds: val.studentIds,
        affectedStudentNames: val.studentNames,
        averageMastery: avgMastery,
        persistenceAttempts: val.persistenceAttempts,
        urgency,
        description: val.description
      });
    }

    // Sort by affected count and urgency
    clusters.sort((a, b) => {
      const urgencyScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (urgencyScore[b.urgency] !== urgencyScore[a.urgency]) {
        return urgencyScore[b.urgency] - urgencyScore[a.urgency];
      }
      return b.affectedStudentCount - a.affectedStudentCount;
    });

    return clusters;
  }

  getPriorityActions(students: Student[], conceptId: string = LINEAR_EQUATIONS_CONCEPT.id): TeacherPriorityAction[] {
    const actions: TeacherPriorityAction[] = [];

    for (const student of students) {
      const state = this.getStudentState(student.id, conceptId);
      const masteryPct = Math.round(state.mastery * 100);

      // Check 1: Failed transfer question or escalation needed
      if (state.recoveryStatus === 'unrecovered_needs_escalation') {
        actions.push({
          id: `prio-${student.id}-failed-transfer`,
          studentId: student.id,
          studentName: student.name,
          conceptId,
          conceptTitle: LINEAR_EQUATIONS_CONCEPT.title,
          urgency: 'URGENT',
          reasonType: 'failed_transfer',
          description: `Failed transfer question after multi-turn dialogue. Recovery status flagged as escalation required.`,
          evidenceSnippet: state.activeMisconception?.evidenceSnippet || 'Transfer task unrecovered.',
          suggestedAction: 'Schedule 1-on-1 balance scale intervention or assign concrete manipulative practice.',
          timestamp: state.lastAssessedAt
        });
        continue;
      }

      // Check 2: Repeated failed interventions
      if (state.interventionsReceived >= 3 && state.recoveryStatus !== 'recovered') {
        actions.push({
          id: `prio-${student.id}-interventions`,
          studentId: student.id,
          studentName: student.name,
          conceptId,
          conceptTitle: LINEAR_EQUATIONS_CONCEPT.title,
          urgency: 'URGENT',
          reasonType: 'failed_interventions',
          description: `Received ${state.interventionsReceived} Socratic interventions without verified recovery. Misconception persisting.`,
          evidenceSnippet: state.activeMisconception?.evidenceSnippet || 'Student reasoning repeats operational error.',
          suggestedAction: 'Assign Level 3 worked-example walkthrough or step-by-step remediation.',
          timestamp: state.lastAssessedAt
        });
        continue;
      }

      // Check 3: High-confidence persistent active misconception
      if (state.activeMisconception && state.attempts >= 3) {
        actions.push({
          id: `prio-${student.id}-persistent`,
          studentId: student.id,
          studentName: student.name,
          conceptId,
          conceptTitle: LINEAR_EQUATIONS_CONCEPT.title,
          urgency: 'HIGH',
          reasonType: 'persistent_misconception',
          description: `Persistent ${state.activeMisconception.name} detected across ${state.attempts} attempts.`,
          evidenceSnippet: state.activeMisconception.evidenceSnippet,
          suggestedAction: 'Review diagnostic evidence logs and re-anchor balance equality rule.',
          timestamp: state.activeMisconception.detectedAt
        });
        continue;
      }

      // Check 4: Low Mastery (< 60%)
      if (masteryPct < 60) {
        actions.push({
          id: `prio-${student.id}-low-mastery`,
          studentId: student.id,
          studentName: student.name,
          conceptId,
          conceptTitle: LINEAR_EQUATIONS_CONCEPT.title,
          urgency: 'MODERATE',
          reasonType: 'low_mastery',
          description: `Current concept mastery is at ${masteryPct}%, below the 60% proficiency threshold.`,
          evidenceSnippet: `Total attempts: ${state.attempts}, Recovery status: ${state.recoveryStatus}.`,
          suggestedAction: 'Assign foundational inverse operation exercises.',
          timestamp: state.lastAssessedAt
        });
      }
    }

    // Sort by urgency
    const urgencyWeight = { URGENT: 3, HIGH: 2, MODERATE: 1 };
    actions.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);

    return actions;
  }

  getCognitiveEvidenceTrace(studentId: string, conceptId: string = LINEAR_EQUATIONS_CONCEPT.id): CognitiveTraceStep[] {
    const records = this.getDiagnosticRecords(studentId);
    const state = this.getStudentState(studentId, conceptId);
    const notes = this.getTeacherNotes(studentId);
    const traceSteps: CognitiveTraceStep[] = [];

    for (const rec of records) {
      const diag = rec.diagnosisId ? db.getDiagnosis(rec.diagnosisId) : undefined;
      const resp = rec.responseId ? db.getStudentResponseById(rec.responseId) : undefined;
      const intv = rec.interventionId ? db.getIntervention(rec.interventionId) : undefined;

      const stepConfidence = rec.confidence || 0.85;
      const stepBand = diag?.confidenceBand || (stepConfidence >= 0.85 ? 'HIGH_CONFIDENCE' : stepConfidence >= 0.60 ? 'MEDIUM_CONFIDENCE' : 'LOW_CONFIDENCE');

      traceSteps.push({
        id: `trace-${rec.id}`,
        studentId,
        questionId: rec.question,
        equation: rec.question,
        studentReasoning: rec.studentReasoning || '',
        studentAnswer: rec.studentAnswer || resp?.submittedAnswer,
        diagnosis: rec.diagnosis,
        misconceptionCode: `EQ-${rec.diagnosis.toUpperCase().replace(/_/g, '-')}`,
        misconceptionName: rec.diagnosis.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        confidence: stepConfidence,
        confidenceBand: stepBand,
        evidence: rec.evidence,
        affectedSkill: diag?.affectedSkill || 'algebraic_balance',
        pedagogicalInterpretation: rec.diagnosis === 'correct_reasoning'
          ? 'Sound algebraic reasoning: inverse operations applied bilaterally.'
          : `Grounded cognitive gap: ${rec.diagnosis.replace(/_/g, ' ')} detected in ${diag?.affectedSkill || 'operation'}.`,
        interventionLevel: intv?.levelNumber || 1,
        interventionText: intv?.tutorMessage || intv?.socraticQuestion,
        subsequentStudentResponse: intv?.studentReply,
        recoveryStatus: state.recoveryStatus,
        timestamp: rec.timestamp,
        teacherReviewed: diag?.teacherReviewed || false,
        reclassifiedFrom: diag?.reclassifiedFrom,
        notes: notes.filter(n => n.studentId === studentId)
      });
    }

    // If records are empty (e.g. from baseline mock), seed baseline trace item from state history
    if (traceSteps.length === 0 && state.misconceptionHistory.length > 0) {
      for (const item of state.misconceptionHistory) {
        traceSteps.push({
          id: `trace-hist-${item.id}`,
          studentId,
          questionId: item.questionId,
          equation: item.questionId,
          studentReasoning: item.evidence,
          diagnosis: 'procedural_error',
          misconceptionCode: item.misconceptionId.replace('misc-', 'EQ-').toUpperCase(),
          misconceptionName: item.misconceptionName,
          confidence: state.confidence,
          confidenceBand: 'HIGH_CONFIDENCE',
          evidence: item.evidence,
          affectedSkill: 'inverse_operations',
          pedagogicalInterpretation: item.recovered 
            ? 'Recovery demonstrated on subsequent transfer task.'
            : 'Active cognitive gap: Student alters one side of equality without mirror operation.',
          interventionLevel: 1,
          interventionText: 'What must occur on the right-hand side to preserve balance when an operation is performed on the left?',
          recoveryStatus: item.recovered ? 'recovered' : state.recoveryStatus,
          timestamp: item.detectedAt,
          notes: notes.filter(n => n.studentId === studentId)
        });
      }
    }

    return traceSteps;
  }
}
