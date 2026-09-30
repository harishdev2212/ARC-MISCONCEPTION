import { Router, Response } from 'express';
import { db } from '../data/db/database';
import { LINEAR_EQUATIONS_CONCEPT } from '../data/reference/curriculum';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

export const studentRoutes = Router();

/**
 * GET /api/students/:id/dashboard
 * Protected dashboard data endpoint scoped strictly to the authenticated student
 */
studentRoutes.get('/:id/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const requestedId = req.params.id;
  const currentUser = req.user!;

  // Security check: Students cannot access other students' dashboards
  if (currentUser.role === 'student' && currentUser.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized to view this student profile.' });
  }

  const studentUser = db.findUserById(requestedId);
  if (!studentUser) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const student = {
    id: studentUser.id,
    name: studentUser.name,
    email: studentUser.email,
    gradeLevel: studentUser.gradeLevel || 'Grade 9',
    enrolledAt: studentUser.createdAt,
    lastActiveAt: studentUser.lastActiveAt
  };

  const learnerState = db.getLearnerState(student.id, LINEAR_EQUATIONS_CONCEPT.id);
  const recentActivities = db.getRecentActivities(student.id);

  return res.json({
    student,
    concept: LINEAR_EQUATIONS_CONCEPT,
    learnerState,
    recentActivities
  });
});

/**
 * GET /api/students/:id/learner-state
 */
studentRoutes.get('/:id/learner-state', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const requestedId = req.params.id;
  const currentUser = req.user!;

  if (currentUser.role === 'student' && currentUser.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const learnerState = db.getLearnerState(requestedId, LINEAR_EQUATIONS_CONCEPT.id);
  return res.json({ learnerState });
});

/**
 * GET /api/students/:id/progress
 * Comprehensive real data-driven student learning analysis endpoint
 */
studentRoutes.get('/:id/progress', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const requestedId = req.params.id;
  const currentUser = req.user!;

  // Security check: Students cannot access other students' progress data
  if (currentUser.role === 'student' && currentUser.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized to view this student progress.' });
  }

  const studentUser = db.findUserById(requestedId);
  if (!studentUser) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const student = {
    id: studentUser.id,
    name: studentUser.name,
    email: studentUser.email,
    gradeLevel: studentUser.gradeLevel || 'Grade 12',
    enrolledAt: studentUser.createdAt,
    lastActiveAt: studentUser.lastActiveAt
  };

  const learnerState = db.getLearnerState(student.id, LINEAR_EQUATIONS_CONCEPT.id);
  const diagnosticRecords = db.getDiagnosticRecords(student.id);
  const recentActivities = db.getRecentActivities(student.id);
  const recoveryAttempts = db.getRecoveryAttempts(student.id);
  const studentResponses = db.getStudentResponses(student.id);

  // Map related interventions and diagnoses for full context
  const interventions: Record<string, any> = {};
  const diagnoses: Record<string, any> = {};
  for (const r of diagnosticRecords) {
    if (r.interventionId) {
      const intv = db.getIntervention(r.interventionId);
      if (intv) interventions[r.interventionId] = intv;
    }
    if (r.diagnosisId) {
      const diag = db.getDiagnosis(r.diagnosisId);
      if (diag) diagnoses[r.diagnosisId] = diag;
    }
  }

  const multiTopicProgress = db.getMultiTopicStudentProgress(student.id);

  return res.json({
    student,
    concept: LINEAR_EQUATIONS_CONCEPT,
    learnerState,
    diagnosticRecords,
    recentActivities,
    recoveryAttempts,
    studentResponses,
    interventions,
    diagnoses,
    multiTopicProgress
  });
});

/**
 * GET /api/students/:id/multi-topic-progress
 */
studentRoutes.get('/:id/multi-topic-progress', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const requestedId = req.params.id;
  const currentUser = req.user!;

  if (currentUser.role === 'student' && currentUser.id !== requestedId) {
    return res.status(403).json({ error: 'Unauthorized to view this student progress.' });
  }

  const progress = db.getMultiTopicStudentProgress(requestedId);
  return res.json({ progress });
});
