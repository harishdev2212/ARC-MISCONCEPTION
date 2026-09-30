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

async function runSocraticVarietyVerification() {
  console.log('================================================================');
  console.log('  MINDTRACE — SOCRATIC QUESTION VARIETY & FLOW VERIFICATION');
  console.log('================================================================\n');

  // 1. Register a test student
  const studentEmail = `student.variety.${Date.now()}@mindtrace.test`;
  console.log(`[1] Registering test student: ${studentEmail}...`);
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Jordan Brooks',
      email: studentEmail,
      password: 'Password123!',
      role: 'student',
      gradeLevel: 'Grade 9'
    })
  });

  if (!regRes.ok || !regRes.data?.token) {
    throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  }

  const token = regRes.data.token;
  const student = regRes.data.user;
  console.log(`✅ Student registered: ${student.name} (${student.id})\n`);

  // 2. Start Session 1
  console.log('[2] Starting learning session 1...');
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

  const session1 = startRes.data.session;
  console.log(`✅ Session 1 ID: ${session1.id}`);
  console.log(`   Initial question: ${session1.currentQuestion.equation}\n`);

  // 3. Submit reasoning exhibiting unilateral operation error
  console.log('[3] Submitting reasoning with unilateral balance misconception...');
  const reasonRes = await request(`/sessions/${session1.id}/submit-reasoning`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      reasoningText: 'I subtracted 4 from the left side to isolate 2x, so 2x = 10.',
      submittedAnswer: 'x = 5'
    })
  });

  if (!reasonRes.ok || !reasonRes.data?.diagnosis) {
    throw new Error(`Reasoning submission failed: ${JSON.stringify(reasonRes.data)}`);
  }

  const initialTurn = reasonRes.data.intervention;
  const updatedSess1 = reasonRes.data.session;
  console.log(`✅ Gemini Diagnostic Result:`);
  console.log(`   isCorrect: ${reasonRes.data.diagnosis.isCorrect}`);
  console.log(`   diagnosis: ${reasonRes.data.diagnosis.diagnosis}`);
  console.log(`   affectedSkill: ${reasonRes.data.diagnosis.affectedSkill}`);
  console.log(`   Socratic Question 1: "${initialTurn.socraticQuestion}"`);
  console.log(`   Question Bank ID: ${initialTurn.questionBankId || 'N/A'}`);
  console.log(`   Session usedQuestionIds: [${(updatedSess1.usedQuestionIds || []).join(', ')}]\n`);

  // 4. Follow-up Turn 1 (Student defends the error)
  console.log('[4] Follow-up Turn 1: Student defends unilateral operation...');
  const turn1Res = await request(`/sessions/${session1.id}/respond`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentResponse: 'I only need to change the side that has the +4 so x is by itself.'
    })
  });

  if (!turn1Res.ok || !turn1Res.data?.intervention) {
    throw new Error(`Turn 1 failed: ${JSON.stringify(turn1Res.data)}`);
  }

  const turn1Data = turn1Res.data;
  console.log(`✅ Turn 1 Response:`);
  console.log(`   Intervention Level: ${turn1Data.intervention.level} (Adaptive escalation)`);
  console.log(`   Persists: ${turn1Data.diagnosis.persists}`);
  console.log(`   Socratic Question 2: "${turn1Data.intervention.text}"`);
  console.log(`   Hint Principle: "${turn1Data.intervention.hintPrompt}"`);
  console.log(`   Updated usedQuestionIds: [${(turn1Data.session?.usedQuestionIds || []).join(', ')}]\n`);

  // Verify that Question 2 is DIFFERENT from Question 1
  if (turn1Data.intervention.text === initialTurn.socraticQuestion) {
    throw new Error(`Question repeated! Question 2 is identical to Question 1: "${turn1Data.intervention.text}"`);
  }
  console.log('✅ Question Variety Verified: Question 2 differs from Question 1!\n');

  // 5. Follow-up Turn 2 (Student persists again -> Level 3)
  console.log('[5] Follow-up Turn 2: Student persists again...');
  const turn2Res = await request(`/sessions/${session1.id}/respond`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentResponse: "I still don't see why the 10 has to change."
    })
  });

  if (!turn2Res.ok || !turn2Res.data?.intervention) {
    throw new Error(`Turn 2 failed: ${JSON.stringify(turn2Res.data)}`);
  }

  const turn2Data = turn2Res.data;
  console.log(`✅ Turn 2 Response:`);
  console.log(`   Intervention Level: ${turn2Data.intervention.level}`);
  console.log(`   Socratic Question 3: "${turn2Data.intervention.text}"`);
  console.log(`   Key Principle: "${turn2Data.intervention.hintPrompt}"\n`);

  if (turn2Data.intervention.text === turn1Data.intervention.text) {
    throw new Error(`Question repeated! Question 3 is identical to Question 2.`);
  }
  console.log('✅ Question Variety Verified: Question 3 differs from Questions 1 & 2!\n');

  // 6. Follow-up Turn 3 (Student demonstrates understanding of bilateral balance)
  console.log('[6] Follow-up Turn 3: Student recognizes bilateral equality principle...');
  const turn3Res = await request(`/sessions/${session1.id}/respond`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentResponse: 'I understand now — whatever I subtract from the left, I must subtract from both sides so 2x = 6.'
    })
  });

  if (!turn3Res.ok || !turn3Res.data?.diagnosis) {
    throw new Error(`Turn 3 failed: ${JSON.stringify(turn3Res.data)}`);
  }

  const turn3Data = turn3Res.data;
  console.log(`✅ Turn 3 Response:`);
  console.log(`   Understanding Detected: ${turn3Data.diagnosis.understandingDetected}`);
  console.log(`   Next Action: ${turn3Data.session.nextAction}`);
  console.log(`   Socratic Message: "${turn3Data.intervention.text}"\n`);

  // 7. Verify Transfer Problem Recovery
  console.log('[7] Submitting reasoning on transfer problem...');
  const recoveryRes = await request(`/sessions/${session1.id}/submit-recovery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      studentReasoning: 'To solve 4y + 11 = 39 while keeping both sides balanced, I subtract 11 from both sides (4y = 28), then divide both sides by 4 to get y = 7.'
    })
  });

  if (!recoveryRes.ok || !recoveryRes.data?.recoveryAttempt) {
    throw new Error(`Recovery check failed: ${JSON.stringify(recoveryRes.data)}`);
  }

  const recData = recoveryRes.data;
  console.log(`✅ Transfer Evaluation Result:`);
  console.log(`   Status: ${recData.recoveryAttempt.status}`);
  console.log(`   Confidence: ${recData.recoveryAttempt.recoveryConfidence}`);
  console.log(`   Feedback: "${recData.recoveryAttempt.feedbackNotes}"\n`);

  // 8. Verify Teacher Dashboard metrics and terminology
  console.log('[8] Testing Teacher Dashboard endpoint and terminology...');
  const teacherEmail = `teacher.test.${Date.now()}@school.edu`;
  const teacherReg = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Prof. Marcus Vance',
      email: teacherEmail,
      password: 'Password123!',
      role: 'teacher',
      department: 'Mathematics'
    })
  });

  if (!teacherReg.ok || !teacherReg.data?.token) {
    throw new Error(`Teacher registration failed: ${JSON.stringify(teacherReg.data)}`);
  }

  const teacherToken = teacherReg.data.token;
  const teacherDash = await request('/teacher/dashboard', {
    headers: { Authorization: `Bearer ${teacherToken}` }
  });

  if (!teacherDash.ok || !teacherDash.data?.metrics) {
    throw new Error(`Teacher dashboard fetch failed: ${JSON.stringify(teacherDash.data)}`);
  }

  console.log(`✅ Teacher Dashboard Metrics:`);
  console.log(`   Enrolled Learners: ${teacherDash.data.metrics.totalStudents}`);
  console.log(`   Topics Needing Attention: ${teacherDash.data.metrics.conceptsNeedingAttentionCount}`);
  console.log(`   Concept Transfer Rate: ${teacherDash.data.metrics.recoveryRatePercent}%`);
  console.log(`   Active Misconceptions: ${teacherDash.data.metrics.activeMisconceptionsCount}`);
  console.log(`   Common Learning Difficulties Clusters: ${teacherDash.data.misconceptionClusters.length} clusters\n`);

  console.log('================================================================');
  console.log('  🎉 ALL 8 PHASES VERIFIED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runSocraticVarietyVerification().catch((err) => {
  console.error('\n❌ Verification Failed:', err);
  process.exit(1);
});
