import { Question, LearnerConceptState, DiagnosisCategory } from '@shared/types';
import { ALL_COMBINED_QUESTIONS, getQuestionsByCategory } from '../data/reference/questionBank';
import { generateRandomizedQuestion } from './questionRandomizer';
import { db } from '../data/db/database';
import { LINEAR_EQUATIONS_CONCEPT } from '../data/reference/curriculum';

export interface QuestionSelectionOptions {
  studentId: string;
  subject?: string;
  category?: string;
  topic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  excludeQuestionIds?: string[];
  allowGeneratedVariations?: boolean;
}

/**
 * Diagnostic Multi-Topic Question Selection Engine
 * 
 * Selects an optimal pedagogical diagnostic question based on:
 * 1. Requested subject (Mathematics, Programming, English)
 * 2. Requested topic or multi-topic diagnostic mix
 * 3. Mixed difficulty levels
 * 4. Student performance tracking across topics & concepts
 * 5. Identifying weak concepts (low accuracy, active misconceptions, recent errors)
 * 6. Targeting weak concepts with higher probability (70%)
 * 7. Reducing questions from concepts already demonstrated as strong (>80% accuracy)
 * 8. Excluding recently presented questions to prevent immediate repetition
 */
export class QuestionSelectionEngine {
  /**
   * Primary entry point for selecting the next diagnostic question for a learner.
   */
  public selectNextQuestion(options: QuestionSelectionOptions): Question {
    const { 
      studentId, 
      subject: requestedSubject,
      category: requestedCategory,
      topic: requestedTopic,
      difficulty: requestedDifficulty,
      excludeQuestionIds = [],
      allowGeneratedVariations = true
    } = options;

    const student = db.getStudent(studentId);
    const learnerState = db.getLearnerState(studentId, LINEAR_EQUATIONS_CONCEPT.id);
    const diagnosticRecords = db.getDiagnosticRecords(studentId);

    // Collect recently used question IDs from recent records and session exclude list
    const recentlyUsed = new Set<string>([
      ...excludeQuestionIds,
      ...diagnosticRecords.slice(-5).map(r => r.question)
    ]);

    // 1. Analyze performance across concepts and topics
    const { weakConcepts, weakTopics, strongConcepts } = this.analyzeStudentStrengthsAndWeaknesses(diagnosticRecords, learnerState);

    // 2. Base candidate pool based on requested subject/category/topic
    let candidatePool = ALL_COMBINED_QUESTIONS;
    if (requestedSubject) {
      const normSubj = requestedSubject.toLowerCase().trim();
      const bySubj = candidatePool.filter(q => (q.subject || 'Mathematics').toLowerCase().trim() === normSubj);
      if (bySubj.length > 0) {
        candidatePool = bySubj;
      }
    }
    if (requestedCategory) {
      const byCat = getQuestionsByCategory(requestedCategory);
      if (byCat.length > 0) {
        // Intersect with candidate pool if subject was filtered
        if (requestedSubject) {
          const intersected = byCat.filter(q => (q.subject || 'Mathematics').toLowerCase().trim() === requestedSubject.toLowerCase().trim());
          if (intersected.length > 0) candidatePool = intersected;
          else candidatePool = byCat;
        } else {
          candidatePool = byCat;
        }
      }
    }
    if (requestedTopic) {
      const byTopic = candidatePool.filter(q => 
        (q.topic || '').toLowerCase().includes(requestedTopic.toLowerCase()) ||
        (q.category || '').toLowerCase().includes(requestedTopic.toLowerCase())
      );
      if (byTopic.length > 0) {
        candidatePool = byTopic;
      }
    }

    // 3. Determine target difficulty
    const targetDifficulty = requestedDifficulty || this.computeAdaptiveDifficulty(learnerState, student?.gradeLevel);

    // 4. Filter out recently seen questions
    let eligibleQuestions = candidatePool.filter(q => {
      const qText = q.question || q.prompt || q.equation || '';
      if (recentlyUsed.has(q.id) || (q.equation && recentlyUsed.has(q.equation)) || (qText && recentlyUsed.has(qText))) {
        return false;
      }
      return true;
    });

    // If pool is exhausted, reset recently seen except immediate last
    if (eligibleQuestions.length === 0) {
      const immediateLast = excludeQuestionIds[excludeQuestionIds.length - 1];
      eligibleQuestions = candidatePool.filter(q => q.id !== immediateLast && q.equation !== immediateLast);
    }
    if (eligibleQuestions.length === 0) {
      eligibleQuestions = candidatePool;
    }

    // 5. Adaptive weakness targeting: 70% chance to target weak concepts or topics
    const shouldTargetWeakness = (weakConcepts.length > 0 || weakTopics.length > 0) && Math.random() < 0.70;
    let prioritizedPool: Question[] = [];

    if (shouldTargetWeakness) {
      prioritizedPool = eligibleQuestions.filter(q => {
        // Check if question addresses any weak topic
        const matchesWeakTopic = weakTopics.some(wt => 
          (q.topic || '').toLowerCase().includes(wt) || 
          (q.category || '').toLowerCase().includes(wt)
        );
        // Check if question concepts or misconception tags overlap with weak concepts
        const matchesWeakConcept = weakConcepts.some(wc => 
          (q.concepts || []).some(c => c.toLowerCase().includes(wc)) ||
          (q.misconceptionTags || []).some(m => m.toLowerCase().includes(wc)) ||
          (q.commonMisconceptions || []).some(m => m.toLowerCase().includes(wc))
        );
        return matchesWeakTopic || matchesWeakConcept;
      });
    }

    // 6. Reduce questions from concepts already demonstrated as strong
    if (prioritizedPool.length === 0 && strongConcepts.length > 0 && Math.random() < 0.80) {
      // Filter out strong concepts if possible
      const nonStrongPool = eligibleQuestions.filter(q => {
        const isStrong = strongConcepts.some(sc => 
          (q.concepts || []).some(c => c.toLowerCase().includes(sc)) ||
          (q.topic || '').toLowerCase().includes(sc)
        );
        return !isStrong;
      });
      if (nonStrongPool.length > 0) {
        prioritizedPool = nonStrongPool;
      }
    }

    // 7. Match target difficulty
    if (prioritizedPool.length === 0) {
      const matchingDiff = eligibleQuestions.filter(q => q.difficulty === targetDifficulty);
      if (matchingDiff.length > 0) {
        prioritizedPool = matchingDiff;
      }
    }

    // Fallback to all eligible questions
    if (prioritizedPool.length === 0) {
      prioritizedPool = eligibleQuestions;
    }

    // 8. Optionally generate a fresh randomized variation with probability 0.20 only if Mathematics/Algebra
    const isMathRequested = !requestedSubject || requestedSubject.toLowerCase() === 'mathematics';
    const isAlgebraRequested = !requestedCategory || requestedCategory.toLowerCase().includes('algebra');
    if (allowGeneratedVariations && isMathRequested && isAlgebraRequested && Math.random() < 0.20) {
      try {
        const generated = generateRandomizedQuestion(undefined, targetDifficulty);
        if (!generated.equation || !recentlyUsed.has(generated.equation)) {
          return generated;
        }
      } catch (genErr) {
        // Fall back to pool
      }
    }

    // Pick randomly from prioritized pool
    const chosenIndex = Math.floor(Math.random() * prioritizedPool.length);
    const chosen = prioritizedPool[chosenIndex] || candidatePool[0] || ALL_COMBINED_QUESTIONS[0];

    return chosen;
  }

  /**
   * Analyzes student diagnostic records to identify weak and strong concepts and topics.
   */
  private analyzeStudentStrengthsAndWeaknesses(
    diagnosticRecords: any[],
    learnerState: LearnerConceptState
  ): {
    weakConcepts: string[];
    weakTopics: string[];
    strongConcepts: string[];
  } {
    const conceptCounts: Record<string, { total: number; correct: number }> = {};
    const topicCounts: Record<string, { total: number; correct: number }> = {};
    const weakConcepts: string[] = [];
    const weakTopics: string[] = [];
    const strongConcepts: string[] = [];

    // Include active misconception from learner state
    if (learnerState.activeMisconception?.code) {
      const code = learnerState.activeMisconception.code.toLowerCase();
      weakConcepts.push(code);
      if (code.includes('sign')) weakConcepts.push('sign handling');
      if (code.includes('distrib')) weakConcepts.push('distributive property');
      if (code.includes('unilateral')) weakConcepts.push('operation applied to one side');
    }

    for (const rec of diagnosticRecords) {
      const topicKey = (rec.category || rec.topic || 'algebra').toLowerCase();
      const conceptKey = (rec.concept || rec.misconceptionTag || 'linear_equations').toLowerCase();

      if (!topicCounts[topicKey]) topicCounts[topicKey] = { total: 0, correct: 0 };
      if (!conceptCounts[conceptKey]) conceptCounts[conceptKey] = { total: 0, correct: 0 };

      topicCounts[topicKey].total += 1;
      conceptCounts[conceptKey].total += 1;

      if (rec.diagnosis === 'correct_reasoning') {
        topicCounts[topicKey].correct += 1;
        conceptCounts[conceptKey].correct += 1;
      } else {
        if (rec.misconceptionTag) {
          weakConcepts.push(rec.misconceptionTag.toLowerCase());
        }
      }
    }

    // Thresholds
    for (const [top, stats] of Object.entries(topicCounts)) {
      if (stats.total >= 2) {
        const acc = stats.correct / stats.total;
        if (acc < 0.60) weakTopics.push(top);
      }
    }

    for (const [con, stats] of Object.entries(conceptCounts)) {
      if (stats.total >= 2) {
        const acc = stats.correct / stats.total;
        if (acc < 0.60) weakConcepts.push(con);
        else if (acc >= 0.80) strongConcepts.push(con);
      }
    }

    return {
      weakConcepts: Array.from(new Set(weakConcepts)),
      weakTopics: Array.from(new Set(weakTopics)),
      strongConcepts: Array.from(new Set(strongConcepts))
    };
  }

  /**
   * Adapts difficulty based on student mastery level and grade.
   */
  private computeAdaptiveDifficulty(state: LearnerConceptState, gradeLevel?: string): 'easy' | 'medium' | 'hard' {
    const mastery = state.mastery; // 0.0 to 1.0

    if (mastery < 0.40) {
      return 'easy';
    }
    if (mastery >= 0.75) {
      return 'hard';
    }
    return 'medium';
  }
}

export const questionSelector = new QuestionSelectionEngine();
