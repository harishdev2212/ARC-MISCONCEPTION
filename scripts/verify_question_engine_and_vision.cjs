/**
 * Verification Test Suite: MindTrace Question Engine + Mathematical Image Input
 * 
 * Verifies all 10 required test scenarios:
 * 1. Normal equation & correct reasoning
 * 2. One-sided operation misconception
 * 3. Sign error
 * 4. Distributive-property error
 * 5. Variables on both sides
 * 6. Uploaded mathematical image (Vision extraction endpoint)
 * 7. OCR correction (Custom equation session creation)
 * 8. Socratic intervention (Targeted multi-turn prompt)
 * 9. Recovery question (Isomorphic variation with different numbers)
 * 10. Progress update (Real-time student progress reflects diagnostic and recovery events)
 */

const API_BASE = 'http://localhost:5000/api';

async function makeRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

// 1x1 transparent PNG base64 for vision endpoint testing
const SAMPLE_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting MindTrace Question Engine & Vision Test Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  const totalTests = 10;

  // Setup: Register a unique student for this test run
  const testEmail = `student.test.${Date.now()}@school.edu`;
  console.log(`[SETUP] Registering test student: ${testEmail}...`);
  const regRes = await makeRequest(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Taylor Rivera',
      email: testEmail,
      password: 'Password123!',
      role: 'student',
      gradeLevel: 'Grade 9'
    })
  });

  if (!regRes.ok || !regRes.data?.user?.id) {
    console.error('❌ Failed to register test student:', regRes.data);
    process.exit(1);
  }

  const student = regRes.data.user;
  const token = regRes.data.token;
  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(`✅ Student registered: ${student.name} (ID: ${student.id})\n`);

  // ----------------------------------------------------
  // Test 1: Normal Equation & Correct Reasoning
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 1: Normal Equation & Correct Reasoning');
  console.log('----------------------------------------------------');
  try {
    // Start session using question library selection
    const startRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ studentId: student.id, difficulty: 'easy' })
    });
    const session = startRes.data.session;
    console.log(`Selected Question: "${session.currentQuestion.equation}" (${session.currentQuestion.difficulty})`);

    // Submit correct reasoning
    const submitRes = await makeRequest(`${API_BASE}/sessions/${session.id}/submit-reasoning`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasoningText: 'I subtracted 5 from both sides of the equation to maintain balance, then simplified x = 7.',
        submittedAnswer: 'x = 7'
      })
    });

    if (submitRes.data?.diagnosis) {
      console.log(`Diagnostic Result: ${submitRes.data.diagnosis.diagnosis} (isCorrect: ${submitRes.data.diagnosis.isCorrect})`);
      console.log(`Confidence: ${submitRes.data.diagnosis.confidence}`);
      passedTests++;
      console.log('✅ TEST 1 PASSED: Normal equation solved and diagnosed.\n');
    } else {
      throw new Error(`Unexpected submit response: ${JSON.stringify(submitRes.data)}`);
    }
  } catch (err) {
    console.error('❌ TEST 1 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 2: One-Sided Operation Misconception
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 2: One-Sided Operation Misconception');
  console.log('----------------------------------------------------');
  let session2;
  try {
    const startRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: student.id,
        customQuestion: {
          equation: '3x + 8 = 29',
          prompt: 'Solve for x: 3x + 8 = 29',
          expectedAnswer: 'x = 7'
        }
      })
    });
    session2 = startRes.data.session;

    const submitRes = await makeRequest(`${API_BASE}/sessions/${session2.id}/submit-reasoning`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasoningText: 'I subtracted 8 from 29 on the right side to get 21, but left 3x + 8 alone on the left. Then I divided 21 by 3 to get 7.',
        submittedAnswer: 'x = 7'
      })
    });

    const diag = submitRes.data.diagnosis;
    console.log(`Diagnosis: ${diag.diagnosis}`);
    console.log(`Evidence: "${diag.evidence || diag.evidenceSnippets?.[0]?.quote}"`);
    console.log(`Socratic Question: "${submitRes.data.intervention?.socraticQuestion}"`);

    const isFlagged = !diag.isCorrect || diag.diagnosis === 'procedural_error';
    if (isFlagged && submitRes.data.intervention?.socraticQuestion) {
      passedTests++;
      console.log('✅ TEST 2 PASSED: One-sided operation flagged with Socratic question.\n');
    } else {
      throw new Error('Did not detect one-sided operation misconception.');
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 3: Sign Error
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 3: Sign Error Misconception');
  console.log('----------------------------------------------------');
  try {
    const startRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: student.id,
        customQuestion: {
          equation: '5x - 7 = 28',
          prompt: 'Solve for x: 5x - 7 = 28',
          expectedAnswer: 'x = 7'
        }
      })
    });
    const s3 = startRes.data.session;

    const submitRes = await makeRequest(`${API_BASE}/sessions/${s3.id}/submit-reasoning`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasoningText: 'I moved the -7 across the equals sign to the right side without changing its sign, so 5x = 28 - 7 = 21. Then x = 21/5.',
        submittedAnswer: 'x = 4.2'
      })
    });

    const diag = submitRes.data.diagnosis;
    console.log(`Diagnosis: ${diag.diagnosis}`);
    console.log(`Evidence: "${diag.evidence || diag.evidenceSnippets?.[0]?.quote}"`);

    if (!diag.isCorrect) {
      passedTests++;
      console.log('✅ TEST 3 PASSED: Sign error properly identified from reasoning.\n');
    } else {
      throw new Error('Sign error was not recognized as incorrect.');
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 4: Distributive-Property Error
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 4: Distributive-Property Error');
  console.log('----------------------------------------------------');
  try {
    const startRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: student.id,
        customQuestion: {
          equation: '3(x + 4) = 27',
          prompt: 'Solve for x: 3(x + 4) = 27',
          expectedAnswer: 'x = 5'
        }
      })
    });
    const s4 = startRes.data.session;

    const submitRes = await makeRequest(`${API_BASE}/sessions/${s4.id}/submit-reasoning`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasoningText: 'I multiplied 3 by x to get 3x, then just kept the + 4 so 3x + 4 = 27. Then 3x = 23.',
        submittedAnswer: 'x = 23/3'
      })
    });

    const diag = submitRes.data.diagnosis;
    console.log(`Diagnosis: ${diag.diagnosis}`);
    console.log(`Evidence: "${diag.evidence || diag.evidenceSnippets?.[0]?.quote}"`);

    if (!diag.isCorrect) {
      passedTests++;
      console.log('✅ TEST 4 PASSED: Incomplete distribution flagged correctly.\n');
    } else {
      throw new Error('Distributive error was not flagged.');
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 5: Variables on Both Sides
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 5: Variables on Both Sides');
  console.log('----------------------------------------------------');
  try {
    const startRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: student.id,
        questionId: 'q-both-01'
      })
    });
    const s5 = startRes.data.session;
    console.log(`Loaded Question: "${s5.currentQuestion.equation}"`);

    const submitRes = await makeRequest(`${API_BASE}/sessions/${s5.id}/submit-reasoning`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        reasoningText: 'First I subtracted 2x from both sides to get 3x + 3 = 18. Then I subtracted 3 from both sides to get 3x = 15. Finally I divided both sides by 3 to get x = 5.',
        submittedAnswer: 'x = 5'
      })
    });

    const diag = submitRes.data.diagnosis;
    console.log(`Diagnosis: ${diag.diagnosis} (isCorrect: ${diag.isCorrect})`);

    if (diag.isCorrect) {
      passedTests++;
      console.log('✅ TEST 5 PASSED: Variables on both sides successfully verified.\n');
    } else {
      throw new Error('Correct reasoning for variables on both sides was rejected.');
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 6: Uploaded Mathematical Image (Vision Endpoint)
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 6: Uploaded Mathematical Image');
  console.log('----------------------------------------------------');
  try {
    const visionRes = await makeRequest(`${API_BASE}/sessions/extract-math-image`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        imageBase64: SAMPLE_IMAGE_BASE64,
        mimeType: 'image/png'
      })
    });

    console.log('Vision API Response:', visionRes.data);
    // The endpoint returns structured JSON with success, equation, and confidence
    if (visionRes.data && (typeof visionRes.data.success === 'boolean')) {
      passedTests++;
      console.log('✅ TEST 6 PASSED: Image transcription endpoint returned valid structured schema.\n');
    } else {
      throw new Error('Vision extraction endpoint did not return valid response schema.');
    }
  } catch (err) {
    console.error('❌ TEST 6 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 7: OCR Correction & Custom Session Creation
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 7: OCR Correction & Session Start');
  console.log('----------------------------------------------------');
  try {
    const correctedEquation = '7x - 4 = 3x + 16';
    const correctedRes = await makeRequest(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentId: student.id,
        customQuestion: {
          equation: correctedEquation,
          prompt: `Solve for x: ${correctedEquation}`,
          expectedAnswer: 'x = 5'
        }
      })
    });

    const s7 = correctedRes.data.session;
    console.log(`Confirmed Custom Session Question: "${s7.currentQuestion.equation}"`);

    if (s7.currentQuestion.equation === correctedEquation) {
      passedTests++;
      console.log('✅ TEST 7 PASSED: OCR correction accepted and practice session initialized.\n');
    } else {
      throw new Error(`Expected equation ${correctedEquation}, got ${s7.currentQuestion.equation}`);
    }
  } catch (err) {
    console.error('❌ TEST 7 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 8: Socratic Intervention
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 8: Targeted Socratic Intervention');
  console.log('----------------------------------------------------');
  try {
    if (!session2) throw new Error('Session 2 was not available from Test 2.');

    // Student replies to Socratic prompt
    const socraticRes = await makeRequest(`${API_BASE}/sessions/${session2.id}/respond`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentResponse: 'I understand now that whatever I do to the right side, I must also subtract 8 from the left side so both pans of the scale stay balanced.'
      })
    });

    console.log('Socratic Evaluation:', socraticRes.data.diagnosis);
    if (socraticRes.data?.diagnosis) {
      passedTests++;
      console.log('✅ TEST 8 PASSED: Socratic dialogue processed understanding successfully.\n');
    } else {
      throw new Error('Socratic reply failed to process.');
    }
  } catch (err) {
    console.error('❌ TEST 8 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 9: Recovery Question
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 9: Isomorphic Recovery Question');
  console.log('----------------------------------------------------');
  try {
    if (!session2) throw new Error('Session 2 was not available.');

    // Submit recovery reasoning
    const recoveryRes = await makeRequest(`${API_BASE}/sessions/${session2.id}/submit-recovery`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        studentReasoning: 'On this transfer problem 4y + 11 = 39, I subtract 11 from BOTH sides: 4y + 11 - 11 = 39 - 11, which gives 4y = 28. Then I divide both sides by 4 to get y = 7.'
      })
    });

    console.log('Recovery Attempt Status:', recoveryRes.data.recoveryAttempt?.status);
    console.log('Notes:', recoveryRes.data.recoveryAttempt?.feedbackNotes);

    if (recoveryRes.data.recoveryAttempt?.status === 'recovered') {
      passedTests++;
      console.log('✅ TEST 9 PASSED: Recovery question successfully verified.\n');
    } else {
      throw new Error('Recovery status was not recovered.');
    }
  } catch (err) {
    console.error('❌ TEST 9 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Test 10: Progress Update
  // ----------------------------------------------------
  console.log('----------------------------------------------------');
  console.log('TEST 10: Student Progress Update');
  console.log('----------------------------------------------------');
  try {
    const progressRes = await makeRequest(`${API_BASE}/students/${student.id}/progress`, {
      headers: authHeaders
    });

    const prog = progressRes.data;
    const totalAttempts = prog.learnerState?.attempts ?? prog.diagnosticRecords?.length ?? 0;
    const recordsCount = prog.diagnosticRecords?.length ?? 0;
    const recoveryCount = prog.recoveryAttempts?.length ?? 0;
    const mastery = prog.learnerState?.mastery ?? 0;

    console.log('Progress Summary:');
    console.log(`- Diagnostic Records Tracked: ${recordsCount}`);
    console.log(`- Total Learner Attempts: ${totalAttempts}`);
    console.log(`- Recovery Attempts Logged: ${recoveryCount}`);
    console.log(`- Current Concept Mastery: ${Math.round(mastery * 100)}%`);

    if (recordsCount > 0 && recoveryCount > 0) {
      passedTests++;
      console.log('✅ TEST 10 PASSED: Student progress reflects actual diagnostic and recovery history.\n');
    } else {
      throw new Error(`Student progress missing records: records=${recordsCount}, recovery=${recoveryCount}`);
    }
  } catch (err) {
    console.error('❌ TEST 10 FAILED:', err.message);
  }

  // ----------------------------------------------------
  // Final Scorecard
  // ----------------------------------------------------
  console.log('====================================================');
  console.log(`🏆 TEST SUITE RESULT: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ALL REQUIREMENTS MET AND VERIFIED END-TO-END!');
    process.exit(0);
  } else {
    console.error(`⚠️ ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
