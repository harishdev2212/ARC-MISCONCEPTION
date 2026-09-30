import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import { GeminiDiagnosticEngine } from './pipeline/diagnosticEngine';
import { SocraticDialogueEngine } from './pipeline/socraticDialogueEngine';
import { LearnerStateManager } from './pipeline/learnerStateManager';
import { LearningSession } from '@shared/types';

async function runTestSuite() {
  console.log('====================================================');
  console.log('  🧪 Running MindTrace Phase 2B Socratic Engine Suite');
  console.log('====================================================\n');

  const diagnosticEngine = new GeminiDiagnosticEngine();
  const dialogueEngine = new SocraticDialogueEngine(diagnosticEngine);
  const learnerStateManager = new LearnerStateManager();

  let allPassed = true;

  // --------------------------------------------------------------------------
  // TEST 1 — Persistent Misconception Multi-Turn Escalation
  // Problem: 3x + 8 = 29
  // Turn 1: "I subtract 8 only from the left side, so 3x = 29." -> Level 1 Socratic probe
  // Turn 2: "I think I only need to change the side with the 8." -> Level 2 Targeted hint
  // Turn 3: "I still only want to subtract from the left." -> Level 3 Conceptual explanation
  // --------------------------------------------------------------------------
  console.log('--- TEST 1: Persistent Misconception Multi-Turn Escalation (3x + 8 = 29) ---');
  try {
    const session1: LearningSession = {
      id: `sess-test-1-${Date.now()}`,
      studentId: 'std-alex-rivera',
      conceptId: 'concept-linear-eq-multistep',
      currentQuestion: {
        id: 'q-canon-01',
        conceptId: 'concept-linear-eq-multistep',
        equation: '3x + 8 = 29',
        prompt: 'Solve for x: 3x + 8 = 29',
        instructions: 'Show your steps.',
        expectedFinalAnswer: 'x = 7',
        referenceSolutionSteps: ['Subtract 8 from both sides: 3x = 21', 'Divide by 3: x = 7'],
        isTransferQuestion: false,
        difficulty: 'easy'
      },
      currentPhase: 'question',
      isComplete: false,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attemptCount: 1,
      interventionLevel: 1,
      studentResponses: ['I subtract 8 only from the left side, so 3x = 29.'],
      dialogueHistory: [
        {
          id: 'turn-1',
          attempt: 1,
          studentResponse: 'I subtract 8 only from the left side, so 3x = 29.',
          diagnosis: 'procedural_error',
          misconceptionCode: 'EQ-PROPERTIES-OF-EQUALITY',
          confidence: 0.98,
          evidence: 'Student subtracted from left side only',
          affectedSkill: 'properties_of_equality',
          interventionLevel: 1,
          interventionType: 'SOCRATIC_PROBE',
          interventionText: 'If you subtract 8 from the left side, what must happen to the right side to keep the equation balanced?',
          persists: true,
          understandingDetected: false,
          timestamp: new Date().toISOString()
        }
      ],
      currentDiagnosis: {
        id: 'diag-1',
        responseId: 'resp-1',
        studentId: 'std-alex-rivera',
        questionId: 'q-canon-01',
        isCorrect: false,
        diagnosis: 'procedural_error',
        confidence: 0.98,
        evidence: 'Student subtracted from left side only',
        affectedSkill: 'properties_of_equality',
        detectedErrors: [],
        evidenceSnippets: [],
        timestamp: new Date().toISOString(),
        status: 'ai_evaluated'
      },
      currentIntervention: {
        id: 'intv-1',
        diagnosisId: 'diag-1',
        studentId: 'std-alex-rivera',
        level: 'level_1_socratic_question',
        levelNumber: 1,
        type: 'SOCRATIC_PROBE',
        tutorMessage: 'If you subtract 8 from the left side, what must happen to the right side to keep the equation balanced?',
        socraticQuestion: 'If you subtract 8 from the left side, what must happen to the right side to keep the equation balanced?',
        requiresStudentResponse: true,
        timestamp: new Date().toISOString(),
        status: 'ai_generated'
      },
      misconceptionPersisting: true,
      understandingDetected: false,
      nextAction: 'WAIT_FOR_STUDENT'
    };

    // Follow-up 1 (Attempt 2)
    const reply1 = 'I think I only need to change the side with the 8.';
    console.log(`  Student Reply 1: "${reply1}"`);
    const res1 = await dialogueEngine.processFollowUpResponse(session1, reply1, learnerStateManager);
    console.log(`  -> Diagnosis persists: ${res1.diagnosis.persists}`);
    console.log(`  -> Assigned Intervention Level: Level ${res1.intervention.level} (${res1.intervention.type})`);
    console.log(`  -> Tutor Prompt: "${res1.intervention.text}"`);

    if (res1.intervention.level !== 2) {
      throw new Error(`Expected Level 2 hint after first persistent reply, got Level ${res1.intervention.level}`);
    }
    if (res1.intervention.type !== 'TARGETED_HINT') {
      throw new Error(`Expected TARGETED_HINT, got ${res1.intervention.type}`);
    }
    if (!res1.diagnosis.persists) {
      throw new Error('Expected diagnosis.persists to be true');
    }

    // Follow-up 2 (Attempt 3)
    const reply2 = 'I still only change the 8 on the left side so 3x = 29.';
    console.log(`\n  Student Reply 2: "${reply2}"`);
    const res2 = await dialogueEngine.processFollowUpResponse(session1, reply2, learnerStateManager);
    console.log(`  -> Diagnosis persists: ${res2.diagnosis.persists}`);
    console.log(`  -> Assigned Intervention Level: Level ${res2.intervention.level} (${res2.intervention.type})`);
    console.log(`  -> Tutor Explanation: "${res2.intervention.text}"`);

    if (res2.intervention.level !== 3) {
      throw new Error(`Expected Level 3 explanation after repeated failure, got Level ${res2.intervention.level}`);
    }
    if (res2.intervention.type !== 'CONCEPTUAL_EXPLANATION') {
      throw new Error(`Expected CONCEPTUAL_EXPLANATION, got ${res2.intervention.type}`);
    }

    console.log('  ✅ TEST 1 PASSED: Multi-turn deterministic escalation (L1 Probe -> L2 Hint -> L3 Explanation) verified.\n');
  } catch (err: any) {
    console.error('  ❌ TEST 1 FAILED:', err.message);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // TEST 2 — Early Recovery (Student self-corrects after probe)
  // Problem: 3x + 8 = 29
  // Student: "I subtract 8 from both sides, giving 3x = 21."
  // Expected: Understanding detected, persists = false, advance to TRANSFER_CHECK
  // --------------------------------------------------------------------------
  console.log('--- TEST 2: Early Recovery Recognition ---');
  try {
    const session2: LearningSession = {
      id: `sess-test-2-${Date.now()}`,
      studentId: 'std-maya-lin',
      conceptId: 'concept-linear-eq-multistep',
      currentQuestion: {
        id: 'q-canon-01',
        conceptId: 'concept-linear-eq-multistep',
        equation: '3x + 8 = 29',
        prompt: 'Solve for x: 3x + 8 = 29',
        instructions: 'Show your steps.',
        expectedFinalAnswer: 'x = 7',
        referenceSolutionSteps: ['Subtract 8 from both sides: 3x = 21', 'Divide by 3: x = 7'],
        isTransferQuestion: false,
        difficulty: 'easy'
      },
      currentPhase: 'diagnosis_intervention',
      isComplete: false,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attemptCount: 1,
      interventionLevel: 1,
      studentResponses: ['I subtracted from left only.'],
      dialogueHistory: [],
      currentDiagnosis: {
        id: 'diag-2',
        responseId: 'resp-2',
        studentId: 'std-maya-lin',
        questionId: 'q-canon-01',
        isCorrect: false,
        diagnosis: 'procedural_error',
        confidence: 0.95,
        evidence: 'Subtracted 8 from left only',
        affectedSkill: 'properties_of_equality',
        detectedErrors: [],
        evidenceSnippets: [],
        timestamp: new Date().toISOString(),
        status: 'ai_evaluated'
      },
      currentIntervention: {
        id: 'intv-2',
        diagnosisId: 'diag-2',
        studentId: 'std-maya-lin',
        level: 'level_1_socratic_question',
        levelNumber: 1,
        type: 'SOCRATIC_PROBE',
        tutorMessage: 'If you subtract 8 from the left, what must you do to the right side?',
        socraticQuestion: 'If you subtract 8 from the left, what must you do to the right side?',
        requiresStudentResponse: true,
        timestamp: new Date().toISOString(),
        status: 'ai_generated'
      }
    };

    const recoveryResponse = 'I should subtract 8 from both sides, giving 3x = 21.';
    console.log(`  Student Reply: "${recoveryResponse}"`);
    const res = await dialogueEngine.processFollowUpResponse(session2, recoveryResponse, learnerStateManager);

    console.log(`  -> persists: ${res.diagnosis.persists}`);
    console.log(`  -> understandingDetected: ${res.diagnosis.understandingDetected}`);
    console.log(`  -> nextAction: ${res.session.nextAction}`);
    console.log(`  -> Intervention type: ${res.intervention.type}`);
    console.log(`  -> Tutor Message: "${res.intervention.text}"`);

    if (res.diagnosis.persists) {
      throw new Error('Expected persists to be false for balanced recovery response');
    }
    if (!res.diagnosis.understandingDetected) {
      throw new Error('Expected understandingDetected to be true');
    }
    if (res.session.nextAction !== 'TRANSFER_CHECK') {
      throw new Error(`Expected nextAction to be TRANSFER_CHECK, got ${res.session.nextAction}`);
    }
    if (res.intervention.level > 1) {
      throw new Error(`Should NOT escalate intervention level upon recovery! Level was ${res.intervention.level}`);
    }

    console.log('  ✅ TEST 2 PASSED: Early recovery detected; moved to TRANSFER_CHECK without escalation.\n');
  } catch (err: any) {
    console.error('  ❌ TEST 2 FAILED:', err.message);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // TEST 3 — Different Misconception: Incomplete Distribution
  // Problem: 3(x + 4) = 21
  // Student: "I multiply 3 by x but leave the 4 unchanged."
  // Expected: Detect incomplete distribution / distributive property.
  // Socratic intervention addresses distribution, NOT balance scale.
  // --------------------------------------------------------------------------
  console.log('--- TEST 3: Misconception-Specific Targeting (Distribution: 3(x + 4) = 21) ---');
  try {
    const diag = await diagnosticEngine.diagnose({
      studentId: 'std-jordan-patel',
      question: '3(x + 4) = 21',
      expectedAnswer: 'x = 3',
      studentAnswer: 'x = 17/3',
      studentReasoning: 'I multiply 3 by x but leave the 4 unchanged.',
      concept: 'linear_equations'
    });

    console.log(`  Diagnosis Result:`, JSON.stringify(diag, null, 2));

    const isDistrib = diag.affectedSkill.includes('distribut') || 
                      diag.evidence.toLowerCase().includes('distribut') || 
                      diag.evidence.toLowerCase().includes('parenthes') || 
                      diag.evidence.toLowerCase().includes('4');

    if (!isDistrib) {
      throw new Error(`Expected distribution-related diagnostic focus, got: ${diag.affectedSkill}`);
    }

    // Generate Socratic wording for this diagnosed misconception
    const wording = await dialogueEngine.generateSocraticIntervention({
      concept: 'linear_equations',
      affectedSkill: diag.affectedSkill,
      interventionLevel: 1,
      interventionType: 'SOCRATIC_PROBE',
      studentReasoning: 'I multiply 3 by x but leave the 4 unchanged.'
    });

    console.log(`  -> Socratic Intervention Text: "${wording.text}"`);
    console.log(`  -> Guiding Principle: "${wording.hintPrompt}"`);

    const lowerText = wording.text.toLowerCase();
    const addressesDistribution = lowerText.includes('parenthes') || 
                                  lowerText.includes('distribut') || 
                                  lowerText.includes('term') || 
                                  lowerText.includes('factor') || 
                                  lowerText.includes('multipl');

    if (!addressesDistribution) {
      throw new Error(`Socratic intervention did not target distributive property: ${wording.text}`);
    }

    console.log('  ✅ TEST 3 PASSED: Incomplete distribution accurately targeted with concept-specific Socratic intervention.\n');
  } catch (err: any) {
    console.error('  ❌ TEST 3 FAILED:', err.message);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // TEST 4 — Correct Reasoning
  // Problem: 3x + 8 = 29
  // Student: "I subtract 8 from both sides to get 3x = 21, then divide both sides by 3, so x = 7."
  // Expected: isCorrect = true, diagnosis = correct_reasoning, positive feedback
  // --------------------------------------------------------------------------
  console.log('--- TEST 4: Fully Correct Step-by-Step Reasoning ---');
  try {
    const diag = await diagnosticEngine.diagnose({
      studentId: 'std-chloe-bennett',
      question: '3x + 8 = 29',
      expectedAnswer: 'x = 7',
      studentAnswer: 'x = 7',
      studentReasoning: 'I subtract 8 from both sides to get 3x = 21, then divide both sides by 3, so x = 7.',
      concept: 'linear_equations'
    });

    console.log(`  Diagnosis Result: isCorrect=${diag.isCorrect}, diagnosis=${diag.diagnosis}, affectedSkill=${diag.affectedSkill}`);

    if (!diag.isCorrect || diag.diagnosis !== 'correct_reasoning') {
      throw new Error(`Expected isCorrect: true, diagnosis: 'correct_reasoning', got ${diag.diagnosis}`);
    }

    const wording = await dialogueEngine.generateSocraticIntervention({
      concept: 'linear_equations',
      affectedSkill: diag.affectedSkill,
      interventionLevel: 1,
      interventionType: 'POSITIVE_FEEDBACK',
      studentReasoning: 'I subtract 8 from both sides to get 3x = 21, then divide both sides by 3, so x = 7.'
    });

    console.log(`  -> Positive Feedback: "${wording.text}"`);

    console.log('  ✅ TEST 4 PASSED: Correct bilateral reasoning recognized; no misconception intervention triggered.\n');
  } catch (err: any) {
    console.error('  ❌ TEST 4 FAILED:', err.message);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // TEST 5 — Deterministic Fallback Resilience
  // Verifies that when LLM generation is skipped or errors out,
  // the deterministic fallback provides precise, pedagogically sound questions.
  // --------------------------------------------------------------------------
  console.log('--- TEST 5: Deterministic Fallback Safety ---');
  try {
    // Create an engine with forceFallback=true to guarantee fallback activation
    const fallbackEngine = new SocraticDialogueEngine(undefined, true);

    const probe = await fallbackEngine.generateSocraticIntervention({
      concept: 'linear_equations',
      affectedSkill: 'properties_of_equality',
      interventionLevel: 1,
      interventionType: 'SOCRATIC_PROBE',
      studentReasoning: 'I subtracted only from left side.'
    });

    const hint = await fallbackEngine.generateSocraticIntervention({
      concept: 'linear_equations',
      affectedSkill: 'properties_of_equality',
      interventionLevel: 2,
      interventionType: 'TARGETED_HINT',
      studentReasoning: 'Still left side.'
    });

    const explanation = await fallbackEngine.generateSocraticIntervention({
      concept: 'linear_equations',
      affectedSkill: 'properties_of_equality',
      interventionLevel: 3,
      interventionType: 'CONCEPTUAL_EXPLANATION',
      studentReasoning: 'Still left side.'
    });

    console.log(`  Fallback L1 Probe: "${probe.text}" (isFallback: ${probe.isFallback})`);
    console.log(`  Fallback L2 Hint: "${hint.text}" (isFallback: ${hint.isFallback})`);
    console.log(`  Fallback L3 Explanation: "${explanation.text}" (isFallback: ${explanation.isFallback})`);

    if (!probe.isFallback || !hint.isFallback || !explanation.isFallback) {
      throw new Error('Expected isFallback to be true in offline mode');
    }
    if (!probe.text.includes('balance') && !probe.text.includes('side')) {
      throw new Error('Fallback L1 probe missing key balance guidance');
    }
    if (!hint.text.includes('scale') && !hint.text.includes('balance')) {
      throw new Error('Fallback L2 hint missing scale analogy');
    }
    if (!explanation.text.includes('equal') && !explanation.text.includes('subtract')) {
      throw new Error('Fallback L3 explanation missing mathematical principle');
    }

    console.log('  ✅ TEST 5 PASSED: Deterministic fallback hierarchy is 100% resilient and marked.\n');
  } catch (err: any) {
    console.error('  ❌ TEST 5 FAILED:', err.message);
    allPassed = false;
  }

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('====================================================');
  if (allPassed) {
    console.log('  🎉 ALL 5 PHASE 2B TEST SUITE CASES PASSED!');
    console.log('====================================================');
    process.exit(0);
  } else {
    console.error('  💥 SOME TEST CASES FAILED');
    console.log('====================================================');
    process.exit(1);
  }
}

runTestSuite();
