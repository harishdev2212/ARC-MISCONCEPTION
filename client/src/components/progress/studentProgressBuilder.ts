import { LearnerConceptState } from '@shared/types';

export interface RawProgressData {
  student: {
    id: string;
    name: string;
    email: string;
    gradeLevel?: string;
    enrolledAt?: string;
    lastActiveAt?: string;
  };
  concept: any;
  learnerState: LearnerConceptState | null;
  diagnosticRecords: any[];
  recentActivities: any[];
  recoveryAttempts: any[];
  studentResponses?: any[];
  interventions?: Record<string, any>;
  diagnoses?: Record<string, any>;
  multiTopicProgress?: any;
}

export interface ProgressSummaryData {
  currentMastery: string;
  reasoningAttempts: number | string;
  conceptsPracticed: number | string;
  misconceptionsFound: number | string;
}

export interface StrengthItem {
  id: string;
  concept: string;
  status: 'Strong' | 'Verified';
  explanation: string;
  evidence: string;
}

export interface ImprovementItem {
  id: string;
  concept: string;
  status: 'Needs Practice' | 'Developing';
  explanation: string;
  attemptCount: number;
}

export interface ErrorHistoryItem {
  id: string;
  problem: string;
  whatYouSaid: string;
  whatHappened: string;
  detectedIssue: string;
  intervention: string;
  studentReply?: string;
  evidenceNotice: string;
  outcome: 'Recovered' | 'Needs Practice' | 'In Progress';
  timestamp: string;
  rawDate: string;
}

export interface MisconceptionPattern {
  name: string;
  count: number;
  percentage: number;
  description: string;
}

export interface ConceptMasteryItem {
  name: string;
  category: string;
  masteryPercent: number;
  statusText: string;
}

export interface TimelineEvent {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  detail: string;
  timeAgo: string;
  rawDate: string;
}

export interface ProcessedStudentProgress {
  summary: ProgressSummaryData;
  strengths: StrengthItem[];
  weaknesses: ImprovementItem[];
  errors: ErrorHistoryItem[];
  misconceptions: MisconceptionPattern[];
  mastery: ConceptMasteryItem[];
  timeline: TimelineEvent[];
  isEmpty: boolean;
}

// Student-friendly taxonomy map: Translates internal system diagnosis codes into clear, empowering language
export function translateDiagnosticIssue(diagnosis: string = '', affectedSkill: string = ''): {
  category: string;
  whatHappened: string;
  explanation: string;
} {
  const lower = `${diagnosis} ${affectedSkill}`.toLowerCase();

  if (lower.includes('balance') || lower.includes('equality') || lower.includes('unilateral') || lower.includes('procedural_error')) {
    return {
      category: 'Balance / Equivalence',
      whatHappened: 'Only one side of the equation was changed.',
      explanation: 'Several attempts changed one side of the equation without applying the exact same operation to the other side.'
    };
  }

  if (lower.includes('inverse') || lower.includes('sign') || lower.includes('cancel') || lower.includes('conceptual_flaw')) {
    return {
      category: 'Inverse Operations',
      whatHappened: 'The term was not canceled using its opposite inverse operation.',
      explanation: 'Some attempts used an operation that did not fully isolate the target variable or applied signs inconsistently.'
    };
  }

  if (lower.includes('distribut') || lower.includes('parenthes')) {
    return {
      category: 'Distributive Property',
      whatHappened: 'The outside multiplier was not multiplied across all terms inside the parentheses.',
      explanation: 'When expanding expressions, multiply the factor outside the group by every single term inside.'
    };
  }

  if (lower.includes('slip') || lower.includes('arithmetic') || lower.includes('calculation')) {
    return {
      category: 'Arithmetic Slip',
      whatHappened: 'A small calculation or arithmetic error occurred during computation.',
      explanation: 'The algebraic steps were conceptually sound, but an arithmetic calculation slip occurred.'
    };
  }

  if (lower.includes('like') || lower.includes('combine') || lower.includes('simplif')) {
    return {
      category: 'Combining Like Terms',
      whatHappened: 'Terms with variables and constant numbers were grouped before simplifying.',
      explanation: 'Variable terms and regular constant numbers cannot be merged directly.'
    };
  }

  return {
    category: 'Equation Structure',
    whatHappened: 'An unbalanced step occurred when simplifying the equation.',
    explanation: 'Maintaining equality requires performing identical transformations on both sides.'
  };
}

export function formatTimeAgo(timestampStr?: string): string {
  if (!timestampStr) return 'Recently';
  try {
    const date = new Date(timestampStr);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) return 'Today';
    if (diffHours < 48) return 'Yesterday';
    const days = Math.floor(diffHours / 24);
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

/**
 * buildStudentProgress()
 * Transforms raw database session/diagnostic records into structured, student-friendly learning progress models.
 */
export function buildStudentProgress(
  data: RawProgressData,
  timeRange: 'all' | 'week' = 'all'
): ProcessedStudentProgress {
  const learnerState = data.learnerState;
  const rawRecords = data.diagnosticRecords || [];
  const recentActivities = data.recentActivities || [];
  const recoveryAttempts = data.recoveryAttempts || [];
  const interventions = data.interventions || {};

  // 1. Time range filter
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const records = rawRecords.filter((rec) => {
    if (timeRange === 'all') return true;
    if (!rec.timestamp) return true;
    return new Date(rec.timestamp).getTime() >= sevenDaysAgo;
  });

  const totalAttempts = learnerState?.attempts ?? records.length;
  const isEmpty = totalAttempts === 0 && records.length === 0;

  // 2. Summary Cards
  const masteryNum = learnerState ? Math.round(learnerState.mastery * 100) : 0;
  const currentMasteryStr = isEmpty ? '0%' : `${masteryNum}%`;
  
  // Count unique concepts practiced
  const uniqueConcepts = new Set<string>();
  if (data.concept?.topic) uniqueConcepts.add(data.concept.topic);
  records.forEach(r => {
    if (r.concept) uniqueConcepts.add(r.concept);
  });
  const conceptsPracticedCount = isEmpty ? 0 : Math.max(1, uniqueConcepts.size);

  // Count actual misconceptions found
  const errorRecords = records.filter(r => r.diagnosis && r.diagnosis !== 'correct_reasoning' && r.diagnosis !== 'insufficient_evidence');
  const misconceptionsCount = learnerState?.misconceptionHistory?.length ?? errorRecords.length;

  const summary: ProgressSummaryData = {
    currentMastery: currentMasteryStr,
    reasoningAttempts: isEmpty ? 0 : totalAttempts,
    conceptsPracticed: conceptsPracticedCount,
    misconceptionsFound: isEmpty ? 0 : misconceptionsCount
  };

  // 3. Strengths
  const strengths: StrengthItem[] = [];
  const correctRecords = records.filter(r => r.diagnosis === 'correct_reasoning');
  const recoveredHist = (learnerState?.misconceptionHistory || []).filter(h => h.recovered);

  if (correctRecords.length > 0) {
    strengths.push({
      id: 'str-equation-setup',
      concept: 'Linear Equation Setup & Balance',
      status: 'Strong',
      explanation: 'Consistently identifies the variable structure and maintains balanced equality throughout.',
      evidence: `${correctRecords.length} verified successful reasoning attempt${correctRecords.length > 1 ? 's' : ''}`
    });
  }

  if (recoveredHist.length > 0 || recoveryAttempts.some(a => a.status === 'recovered')) {
    strengths.push({
      id: 'str-recovery-transfer',
      concept: 'Concept Recovery & Transfer',
      status: 'Verified',
      explanation: 'Successfully recognized and corrected operational errors after Socratic reflection, proving understanding on transfer items.',
      evidence: 'Demonstrated on transfer problem without assistance'
    });
  }

  if (masteryNum >= 50) {
    strengths.push({
      id: 'str-inverse-ops',
      concept: 'Inverse Operations',
      status: 'Strong',
      explanation: 'Confidently selects the appropriate inverse operations to isolate algebraic terms.',
      evidence: 'High consistency on variable cancellation'
    });
  }

  // 4. Areas to Improve (Weaknesses)
  const weaknesses: ImprovementItem[] = [];
  const weaknessGroups: Record<string, { count: number; category: string; explanation: string }> = {};

  errorRecords.forEach(r => {
    const translated = translateDiagnosticIssue(r.diagnosis, r.evidence);
    if (!weaknessGroups[translated.category]) {
      weaknessGroups[translated.category] = {
        count: 0,
        category: translated.category,
        explanation: translated.explanation
      };
    }
    weaknessGroups[translated.category].count++;
  });

  // Also include active misconception if present
  if (learnerState?.activeMisconception) {
    const translated = translateDiagnosticIssue('', learnerState.activeMisconception.name);
    if (!weaknessGroups[translated.category]) {
      weaknessGroups[translated.category] = {
        count: 1,
        category: translated.category,
        explanation: translated.explanation
      };
    }
  }

  Object.values(weaknessGroups).forEach((g, idx) => {
    weaknesses.push({
      id: `weak-${idx}`,
      concept: g.category,
      status: g.count >= 2 ? 'Needs Practice' : 'Developing',
      explanation: g.explanation,
      attemptCount: g.count
    });
  });

  // 5. Error History ("Where Your Reasoning Went Wrong")
  const errors: ErrorHistoryItem[] = errorRecords.map((r, idx) => {
    const translated = translateDiagnosticIssue(r.diagnosis, r.evidence);
    const intv = r.interventionId ? interventions[r.interventionId] : null;
    
    // Determine recovery outcome
    const wasRecovered = (learnerState?.misconceptionHistory || []).some(
      h => h.questionId === r.question && h.recovered
    ) || recoveryAttempts.some(a => a.status === 'recovered');

    const outcome: 'Recovered' | 'Needs Practice' | 'In Progress' = wasRecovered
      ? 'Recovered'
      : learnerState?.recoveryStatus === 'in_progress'
      ? 'In Progress'
      : 'Needs Practice';

    const questionAsked = intv?.socraticQuestion || intv?.tutorMessage ||
      'If you change one side of an equation, what must you do to the other side to keep it balanced?';

    return {
      id: r.id || `err-${idx}`,
      problem: r.question || '3x + 8 = 29',
      whatYouSaid: r.studentReasoning || (r.studentAnswer ? `Answer: ${r.studentAnswer}` : 'Operation applied to one side.'),
      whatHappened: translated.whatHappened,
      detectedIssue: translated.category,
      intervention: questionAsked,
      studentReply: intv?.studentReply,
      evidenceNotice: r.evidence || 'Identified by reasoning pattern analysis',
      outcome,
      timestamp: formatTimeAgo(r.timestamp),
      rawDate: r.timestamp || new Date().toISOString()
    };
  });

  // Sort errors newest first
  errors.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

  // 6. Misconception Breakdown ("Common Error Patterns")
  const catCounts: Record<string, number> = {};
  errors.forEach(e => {
    catCounts[e.detectedIssue] = (catCounts[e.detectedIssue] || 0) + 1;
  });

  const totalErrors = errors.length;
  const misconceptions: MisconceptionPattern[] = Object.entries(catCounts).map(([cat, count]) => {
    const percentage = totalErrors > 0 ? Math.round((count / totalErrors) * 100) : 0;
    const translated = translateDiagnosticIssue(cat);
    return {
      name: cat,
      count,
      percentage,
      description: translated.explanation
    };
  });

  misconceptions.sort((a, b) => b.count - a.count);

  // 7. Concept Mastery
  const mastery: ConceptMasteryItem[] = [
    {
      name: 'Linear Equations',
      category: 'Algebra → Multi-Step Equations',
      masteryPercent: masteryNum,
      statusText: masteryNum >= 75 ? 'Mastered' : masteryNum >= 40 ? 'Progressing' : 'Developing'
    },
    {
      name: 'Inverse Operations',
      category: 'Algebra Foundations',
      masteryPercent: isEmpty ? 0 : Math.min(100, Math.max(30, masteryNum + 20)),
      statusText: isEmpty ? 'Not Started' : 'Active Practice'
    },
    {
      name: 'Equation Balance',
      category: 'Properties of Equality',
      masteryPercent: isEmpty ? 0 : Math.min(100, Math.max(15, masteryNum)),
      statusText: isEmpty ? 'Not Started' : learnerState?.recoveryStatus === 'recovered' ? 'Verified' : 'Focus Area'
    }
  ];

  // 8. Learning Timeline ("Learning History")
  const timeline: TimelineEvent[] = [];

  // Add recent activity entries
  recentActivities.forEach((act, idx) => {
    const isSuccess = act.status === 'success' || act.outcome?.toLowerCase().includes('correct') || act.outcome?.toLowerCase().includes('verified');
    const isWarning = act.status === 'warning' || act.outcome?.toLowerCase().includes('flag') || act.outcome?.toLowerCase().includes('misconception');
    
    timeline.push({
      id: act.id || `act-${idx}`,
      type: isSuccess ? 'success' : isWarning ? 'warning' : 'info',
      title: act.title || 'Learning Session Event',
      detail: act.equation || act.outcome || 'Linear Equations',
      timeAgo: act.timestamp || 'Recently',
      rawDate: act.timestamp || new Date().toISOString()
    });
  });

  // If no recent activities, synthesize from error and correct records
  if (timeline.length === 0 && records.length > 0) {
    records.slice(0, 8).forEach((r, idx) => {
      const isCorrect = r.diagnosis === 'correct_reasoning';
      timeline.push({
        id: `tl-${idx}`,
        type: isCorrect ? 'success' : 'warning',
        title: isCorrect ? 'Completed reasoning attempt' : 'Learning gap noticed',
        detail: r.question || 'Linear Equations',
        timeAgo: formatTimeAgo(r.timestamp),
        rawDate: r.timestamp || new Date().toISOString()
      });
    });
  }

  return {
    summary,
    strengths,
    weaknesses,
    errors,
    misconceptions,
    mastery,
    timeline,
    isEmpty
  };
}
