/**
 * Automated Verification Suite for Phase 2B Reflect Socratic Reasoning Loop
 * 
 * Verifies:
 * TEST 1: Correct reflection answer -> understanding confirmed -> Continue to Apply
 * TEST 2: Partially correct answer -> one targeted follow-up question
 * TEST 3: Incorrect answer -> one simpler guiding question
 * TEST 4: Max attempt constraint -> max 1 follow-up / 1 simpler question
 */

const API_BASE = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function registerStudent(name, email, password) {
  const res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role: 'student', gradeLevel: 'Grade 8' })
  });
  if (res.status !== 201) {
    throw new Error(`Register failed with status ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return res.data.user;
}

async function startSession(studentId) {
  const res = await request('/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ studentId })
  });
  return res.data.session;
}

async function submitInitialReasoning(sessionId, reasoningText, submittedAnswer = 'x = 9.67') {
  const res = await request(`/sessions/${sessionId}/submit-reasoning`, {
    method: 'POST',
    body: JSON.stringify({ reasoningText, submittedAnswer })
  });
  return res.data;
}

async function submitReflectionReply(sessionId, studentResponse) {
  const res = await request(`/sessions/${sessionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ studentResponse })
  });
  return res.data;
}

async function runTests() {
  console.log('================================================================');
  console.log('STARTING PHASE 2B REFLECT SOCRATIC REASONING LOOP VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST 1: Correct reflection answer -> understanding confirmed
  // -------------------------------------------------------------
  console.log('--- TEST 1: Correct Reflection Answer Flow ---');
  try {
    const ts = Date.now();
    const student1 = await registerStudent('Test Student 1', `reflect1_${ts}@test.com`, 'Pass123!');
    const session1 = await startSession(student1.id);
    
    // Initial solve with unilateral error
    const solve1 = await submitInitialReasoning(session1.id, 'I subtracted 8 from the left side only, so 3x = 29.');
    assert(solve1.diagnosis && !solve1.diagnosis.isCorrect, 'Phase 2A diagnosed initial misconception');
    assert(solve1.intervention.socraticQuestion && solve1.intervention.socraticQuestion.length > 10, 'Targeted initial Socratic question generated');
    console.log(`  Initial Socratic Question: "${solve1.intervention.socraticQuestion}"`);

    // Student submits correct reflection
    const reflect1 = await submitReflectionReply(
      session1.id, 
      'We must subtract 8 from both sides so that the equation stays balanced. 29 minus 8 gives 21, so 3x = 21.'
    );

    assert(reflect1.success === true, 'Socratic evaluation response successful');
    assert(reflect1.diagnosis.evaluationClassification === 'CORRECT', `Evaluator classified as CORRECT (got: ${reflect1.diagnosis.evaluationClassification})`);
    assert(reflect1.diagnosis.understandingDetected === true, 'understandingDetected is true');
    assert(reflect1.diagnosis.reflectUIState === 'REFLECT_CORRECT', `reflectUIState is REFLECT_CORRECT (got: ${reflect1.diagnosis.reflectUIState})`);
    assert(reflect1.diagnosis.understandingMessage && reflect1.diagnosis.understandingMessage.includes('balanced'), `Confirmed understanding message present: "${reflect1.diagnosis.understandingMessage}"`);
    assert(reflect1.session.nextAction === 'TRANSFER_CHECK', `Next action is TRANSFER_CHECK (ready for Apply)`);
    assert(!reflect1.diagnosis.nextQuestion, 'No more questions generated after understanding is confirmed');
  } catch (err) {
    console.error('Test 1 error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Partially correct answer -> ONE targeted follow-up
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Partially Correct Answer Flow ---');
  try {
    const ts = Date.now();
    const student2 = await registerStudent('Test Student 2', `reflect2_${ts}@test.com`, 'Pass123!');
    const session2 = await startSession(student2.id);

    // Initial solve with unilateral error
    const solve2 = await submitInitialReasoning(session2.id, 'I subtracted 8 from the left side only, so 3x = 29.');
    assert(solve2.diagnosis && !solve2.diagnosis.isCorrect, 'Phase 2A diagnosed initial misconception');

    // Student submits partial reflection
    const reflect2 = await submitReflectionReply(
      session2.id,
      'We need to do something to 29 on the other side as well, but what?'
    );

    assert(reflect2.success === true, 'Socratic evaluation response successful');
    assert(reflect2.diagnosis.evaluationClassification === 'PARTIAL', `Evaluator classified as PARTIAL (got: ${reflect2.diagnosis.evaluationClassification})`);
    assert(reflect2.diagnosis.understandingDetected === false, 'understandingDetected is false for partial answer');
    assert(reflect2.diagnosis.reflectUIState === 'REFLECT_PARTIAL', `reflectUIState is REFLECT_PARTIAL (got: ${reflect2.diagnosis.reflectUIState})`);
    assert(reflect2.diagnosis.nextQuestion && reflect2.diagnosis.nextQuestion.length > 10, `Targeted follow-up question generated: "${reflect2.diagnosis.nextQuestion}"`);
    assert(reflect2.session.nextAction === 'WAIT_FOR_STUDENT', 'Next action is WAIT_FOR_STUDENT to answer follow-up');
  } catch (err) {
    console.error('Test 2 error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Incorrect answer -> ONE simpler guiding question
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Incorrect Answer Flow ---');
  try {
    const ts = Date.now();
    const student3 = await registerStudent('Test Student 3', `reflect3_${ts}@test.com`, 'Pass123!');
    const session3 = await startSession(student3.id);

    // Initial solve with unilateral error
    const solve3 = await submitInitialReasoning(session3.id, 'I subtracted 8 from the left side only, so 3x = 29.');
    assert(solve3.diagnosis && !solve3.diagnosis.isCorrect, 'Phase 2A diagnosed initial misconception');

    // Student defends unilateral error
    const reflect3 = await submitReflectionReply(
      session3.id,
      'Only the left side should change because that is where 8 was. Leave 29 alone.'
    );

    assert(reflect3.success === true, 'Socratic evaluation response successful');
    assert(reflect3.diagnosis.evaluationClassification === 'INCORRECT', `Evaluator classified as INCORRECT (got: ${reflect3.diagnosis.evaluationClassification})`);
    assert(reflect3.diagnosis.understandingDetected === false, 'understandingDetected is false for incorrect answer');
    assert(reflect3.diagnosis.reflectUIState === 'REFLECT_INCORRECT', `reflectUIState is REFLECT_INCORRECT (got: ${reflect3.diagnosis.reflectUIState})`);
    assert(reflect3.diagnosis.nextQuestion && reflect3.diagnosis.nextQuestion.length > 10, `Simpler guiding question generated: "${reflect3.diagnosis.nextQuestion}"`);
    assert(reflect3.session.nextAction === 'WAIT_FOR_STUDENT', 'Next action is WAIT_FOR_STUDENT to answer simpler question');
  } catch (err) {
    console.error('Test 3 error:', err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Max Attempt Limit (1 initial + 1 follow-up)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Maximum Attempts Termination Flow ---');
  try {
    const ts = Date.now();
    const student4 = await registerStudent('Test Student 4', `reflect4_${ts}@test.com`, 'Pass123!');
    const session4 = await startSession(student4.id);

    // Attempt 1: Initial solve with error
    await submitInitialReasoning(session4.id, 'I subtracted 8 from the left side only, so 3x = 29.');
    
    // Attempt 2 (Reflection response 1: INCORRECT)
    const turn1 = await submitReflectionReply(session4.id, 'I do not know, maybe nothing.');
    assert(turn1.diagnosis.reflectUIState === 'REFLECT_INCORRECT', 'Turn 1 is REFLECT_INCORRECT');
    assert(turn1.session.attemptCount === 2, 'Attempt count is 2');

    // Attempt 3 (Reflection response 2: student answers the simpler question, reaches max turns)
    const turn2 = await submitReflectionReply(session4.id, 'Still not sure.');
    assert(turn2.diagnosis.reflectUIState === 'REFLECT_COMPLETE', `Max attempt triggers REFLECT_COMPLETE (got: ${turn2.diagnosis.reflectUIState})`);
    assert(turn2.session.nextAction === 'TRANSFER_CHECK', 'Transitions to TRANSFER_CHECK instead of looping forever');
    assert(turn2.diagnosis.understandingMessage && turn2.diagnosis.understandingMessage.length > 10, 'Summary understanding message provided');
    assert(!turn2.diagnosis.nextQuestion, 'No more questions asked');
  } catch (err) {
    console.error('Test 4 error:', err);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
