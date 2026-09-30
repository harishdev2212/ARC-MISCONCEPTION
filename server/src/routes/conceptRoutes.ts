import { Router, Request, Response } from 'express';
import { LINEAR_EQUATIONS_CONCEPT, ALL_QUESTIONS } from '../data/reference/curriculum';

export const conceptRoutes = Router();

conceptRoutes.get('/', (req: Request, res: Response) => {
  res.json({
    concepts: [LINEAR_EQUATIONS_CONCEPT]
  });
});

conceptRoutes.get('/:id', (req: Request, res: Response) => {
  if (req.params.id === LINEAR_EQUATIONS_CONCEPT.id || req.params.id === 'current') {
    return res.json(LINEAR_EQUATIONS_CONCEPT);
  }
  return res.status(404).json({ error: 'Concept not found' });
});

conceptRoutes.get('/:id/questions', (req: Request, res: Response) => {
  const questions = ALL_QUESTIONS.filter(q => q.conceptId === LINEAR_EQUATIONS_CONCEPT.id);
  res.json({ questions });
});
