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

async function testGeminiDiagnosticFlow() {
  console.log('================================================================');
  console.log('  MINDTRACE — REAL GEMINI AI COMPLETE END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // 1. Register a real student
  const studentEmail = `gemini.verify.${Date.now()}@school.edu`;
  console.log(`[1] Registering student: ${studentEmail}...`);
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Maya Lin',
      email: studentEmail,
      password: 'Password123!',
      role: 'student',
      gradeLevel: 'Grade 9'
    })
  });

  if (!regRes.ok || !regRes.data?.token) {
    throw new Error(`Failed to register student: ${JSON.stringify(regRes.data)}`);
  }

  const token = regRes.data.token;
  const student = regRes.data.user;
  console.log(`✅ Student registered: ${student.name} (${student.id})\n`);

  // 2. Start a learning session
  console.log('[2] Starting learning session...');
  const startRes = await request('/sessions/start', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentId: student.id,
      conceptId: 'concept-linear-eq-multistep'
    })
  });

  if (!startRes.ok || !startRes.data?.session) {
    throw new Error(`Failed to start session: ${JSON.stringify(startRes.data)}`);
  }

  const session = startRes.data.session;
  console.log(`✅ Session created: ${session.id}`);
  console.log(`   Canonical Question: ${session.currentQuestion.prompt}`);
  console.log(`   Equation: ${session.currentQuestion.equation}\n`);

  // 3. Submit student reasoning to Gemini
  const studentReasoning = 'I added 4 to 10 and got 14, then divided by 2 to get 7.';
  const submittedAnswer = '7';
  console.log('[3] Submitting student reasoning to Gemini AI Diagnostic Pipeline...');
  console.log(`   Reasoning: "${studentReasoning}"`);
  console.log(`   Answer: "${submittedAnswer}"`);

  const startTime = Date.now();
  const reasoningRes = await request(`/sessions/${session.id}/submit-reasoning`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      reasoningText: studentReasoning,
      submittedAnswer
    })
  });

  const latency = Date.now() - startTime;
  console.log(`\n⏱️ Request round-trip completed in ${latency}ms`);

  if (!reasoningRes.ok || !reasoningRes.data?.diagnosis) {
    console.error('❌ Reasoning submission failed:', JSON.stringify(reasoningRes.data, null, 2));
    throw new Error(`Reasoning submission failed with status ${reasoningRes.status}`);
  }

  const { diagnosis, intervention, session: updatedSession } = reasoningRes.data;

  console.log('\n================================================================');
  console.log('  REAL GEMINI AI DIAGNOSTIC OUTPUT');
  console.log('================================================================');
  console.log(`Status:              ${diagnosis.status} (Verified AI Evaluated)`);
  console.log(`Is Correct:          ${diagnosis.isCorrect}`);
  console.log(`Diagnosis Category:  ${diagnosis.diagnosis}`);
  console.log(`Confidence:          ${diagnosis.confidence} (${diagnosis.confidenceBand || 'HIGH_CONFIDENCE'})`);
  console.log(`Affected Skill:      ${diagnosis.affectedSkill}`);
  console.log(`Evidence:            "${diagnosis.evidence}"`);
  console.log(`Intervention Rec:    ${diagnosis.recommendedIntervention}`);
  console.log(`Needs Recovery Test: ${diagnosis.needsRecoveryTest}`);

  console.log('\n================================================================');
  console.log('  SOCRATIC INTERVENTION GENERATED');
  console.log('================================================================');
  console.log(`Level:               ${intervention.level} (Level ${intervention.levelNumber})`);
  console.log(`Tutor Message:       "${intervention.tutorMessage}"`);
  console.log(`Socratic Question:   "${intervention.socraticQuestion}"`);
  console.log(`Hint Prompt:         "${intervention.hintPrompt || 'N/A'}"`);
  console.log(`Next Session Phase:  ${updatedSession.currentPhase}`);

  // Assertions
  if (diagnosis.isCorrect !== false) throw new Error('Expected diagnosis.isCorrect to be false');
  if (!diagnosis.evidence || diagnosis.evidence.length < 5) throw new Error('Expected rich evidence from Gemini');
  if (diagnosis.status !== 'ai_evaluated') throw new Error('Expected status to be ai_evaluated');
  if (updatedSession.currentPhase !== 'diagnosis_intervention') throw new Error('Expected phase to be diagnosis_intervention');

  // 4. Test Socratic Dialogue Turn
  console.log('\n[4] Submitting student Socratic reply showing understanding...');
  const studentReply = 'Because an equation is a balance, so if I subtract 4 from one side, I must subtract 4 from both sides to keep it equal!';
  const replyRes = await request(`/sessions/${session.id}/respond`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentReply
    })
  });

  if (!replyRes.ok) {
    throw new Error(`Socratic reply failed: ${JSON.stringify(replyRes.data)}`);
  }

  console.log('✅ Socratic dialogue turn evaluated:');
  console.log(`   Understanding Detected: ${replyRes.data.diagnosis?.understandingDetected}`);
  console.log(`   Misconception Persisting: ${replyRes.data.diagnosis?.persists}`);
  console.log(`   Next Action: ${replyRes.data.session?.nextAction}`);
  console.log(`   Tutor Follow-up: "${replyRes.data.intervention?.text}"`);

  console.log('\n================================================================');
  console.log('  🎉 COMPLETE GEMINI DIAGNOSTIC & SOCRATIC PIPELINE CONFIRMED WORKING!');
  console.log('================================================================');
}

testGeminiDiagnosticFlow().catch(err => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
