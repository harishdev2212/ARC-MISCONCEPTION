import { MisconceptionDefinition } from '@shared/types';
import { MISCONCEPTION_DEFINITIONS } from '../data/reference/curriculum';

/**
 * ClassificationEngine (Phase 1 Taxonomy / Phase 2 Multi-class Classifier)
 * 
 * Maps detected error patterns into normalized misconception ontology codes.
 */
export class ClassificationEngine {
  getDefinition(misconceptionId: string): MisconceptionDefinition | undefined {
    return MISCONCEPTION_DEFINITIONS.find(m => m.id === misconceptionId || m.code === misconceptionId);
  }

  getAllDefinitions(): MisconceptionDefinition[] {
    return MISCONCEPTION_DEFINITIONS;
  }
}
