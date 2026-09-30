const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('  MINDTRACE — REAL DATA-DRIVEN STUDENT PROGRESS VERIFICATION');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const timestamp = Date.now();
  const testEmail = `student.progress.${timestamp}@mindtrace.test`;
  const studentName = 'Maya Lin';

  // -------------------------------------------------------------
  // Test 1: Code Architecture & Component Verification
  // -------------------------------------------------------------
  console.log('--- Step 1: Frontend Architecture Verification ---');
  const componentsDir = path.join(__dirname, '../client/src/components/progress');
  const files = [
    'studentProgressBuilder.ts',
    'ProgressSummary.tsx',
    'StrengthsCard.tsx',
    'ImprovementAreas.tsx',
    'ErrorHistory.tsx',
    'MisconceptionBreakdown.tsx',
    'ConceptMastery.tsx',
    'LearningTimeline.tsx',
    'ErrorDetailModal.tsx'
  ];

  for (const file of files) {
    const filePath = path.join(componentsDir, file);
    assert(fs.existsSync(filePath), `Component exists: ${file}`);
  }

  const pagePath = path.join(__dirname, '../client/src/pages/ProgressPage.tsx');
  assert(fs.existsSync(pagePath), 'Page exists: ProgressPage.tsx');

  const pageContent = fs.readFileSync(pagePath, 'utf8');
  assert(pageContent.includes('Your Learning Progress'), 'ProgressPage contains main title');
  assert(pageContent.includes('This Week') && pageContent.includes('All Time'), 'ProgressPage contains time range filters');
  assert(pageContent.includes('Your learning profile is just getting started.'), 'ProgressPage handles empty state');
  assert(pageContent.includes('ErrorDetailModal'), 'ProgressPage integrates ErrorDetailModal');

  // Verify Student-Friendly Language (No forbidden technical jargon)
  const forbiddenTerms = [
    'LLM_UNAVAILABLE',
    'CALCULATION_SLIP',
    'COGNITIVE_DIAGNOSTIC_STATE',
    'confidence score',
    'model inference'
  ];
  for (const term of forbiddenTerms) {
    assert(!pageContent.includes(`"${term}"`), `Forbidden term "${term}" is NOT in ProgressPage UI strings`);
  }

  // -------------------------------------------------------------
  // Test 2: Register a Brand New Student (Empty State Baseline)
  // -------------------------------------------------------------
  console.log('\n--- Step 2: Register New Student & Verify Empty State ---');
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      name: studentName,
      email: testEmail,
      password: 'Password123!',
      role: 'student',
      gradeLevel: 'Grade 11'
    }
  );

  assert(regRes.status === 201, `Student registration returned 201 (got ${regRes.status})`);
  const token = regRes.data.token;
  const studentId = regRes.data.user.id;
  assert(!!token, 'Auth token received');
  assert(!!studentId, 'Student ID received');

  // Query /api/students/:id/progress
  const initialProgRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/students/${studentId}/progress`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  assert(initialProgRes.status === 200, `GET /api/students/:id/progress returns 200 (got ${initialProgRes.status})`);
  assert(initialProgRes.data.student.name === studentName, 'Progress data belongs to Maya Lin');
  assert(initialProgRes.data.diagnosticRecords.length === 0, 'New student has 0 historical diagnostic records');
  assert(initialProgRes.data.learnerState.attempts === 0, 'New student has 0 attempts recorded');

  // Verify client buildProgress utility on empty data
  const { buildStudentProgress } = require('../client/src/components/progress/studentProgressBuilder.ts');
  const emptyProcessed = buildStudentProgress(initialProgRes.data, 'all');
  assert(emptyProcessed.isEmpty === true, 'buildStudentProgress marks new student as isEmpty: true');
  assert(emptyProcessed.summary.reasoningAttempts === 0, 'Summary attempts is 0');
  assert(emptyProcessed.summary.misconceptionsFound === 0, 'Summary misconceptions is 0');
  assert(emptyProcessed.summary.currentMastery === '0%', 'Summary mastery is 0%');

  // -------------------------------------------------------------
  // Test 3: Start Session & Submit Reasoning with Balance Error
  // -------------------------------------------------------------
  console.log('\n--- Step 3: Student Submits Flawed Reasoning ---');
  const startRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/sessions/start',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
    },
    { conceptId: 'concept-linear-equations-core', questionId: 'q-two-01' }
  );

  assert(startRes.status === 200, 'Learning session started');
  const sessionId = startRes.data.session.id;

  // Submit unilateral operation error
  const reasoningRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/sessions/${sessionId}/submit-reasoning`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      reasoningText: 'I subtracted 8 from the left side so 3x is alone, then 3x = 29.',
      submittedAnswer: 'x = 29/3'
    }
  );

  assert(reasoningRes.status === 200, 'Reasoning submission evaluated');
  assert(reasoningRes.data.diagnosis.isCorrect === false, 'AI diagnostic correctly flagged misconception');
  assert(!!reasoningRes.data.intervention.socraticQuestion, 'Socratic intervention question generated');

  // -------------------------------------------------------------
  // Test 4: Query Progress Tab After Diagnostic Event
  // -------------------------------------------------------------
  console.log('\n--- Step 4: Verify Progress Updates with Real Data ---');
  const updatedProgRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/students/${studentId}/progress`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  assert(updatedProgRes.status === 200, 'GET /progress returns updated data');
  assert(updatedProgRes.data.diagnosticRecords.length >= 1, 'Diagnostic records array has 1+ events');
  assert(updatedProgRes.data.learnerState.attempts >= 1, 'Attempts incremented to 1+');

  const processedAfterError = buildStudentProgress(updatedProgRes.data, 'all');
  assert(processedAfterError.isEmpty === false, 'Profile is no longer empty');
  assert(processedAfterError.summary.reasoningAttempts >= 1, 'Summary reflects reasoning attempts >= 1');
  assert(processedAfterError.summary.misconceptionsFound >= 1, 'Summary reflects misconceptions found >= 1');
  assert(processedAfterError.errors.length >= 1, 'Error history contains recorded mistake');
  
  const topError = processedAfterError.errors[0];
  assert(topError.problem.includes('3x + 8 = 29'), 'Error history records problem equation');
  assert(topError.detectedIssue === 'Balance / Equivalence', 'Friendly category mapped to Balance / Equivalence');
  assert(topError.whatHappened.includes('Only one side'), 'Friendly explanation: Only one side of the equation was changed');
  assert(topError.outcome === 'Needs Practice' || topError.outcome === 'In Progress', 'Status reflects Needs Practice / In Progress');

  assert(processedAfterError.misconceptions.length >= 1, 'Common error patterns contains category breakdown');
  assert(processedAfterError.misconceptions[0].name === 'Balance / Equivalence', 'Top category is Balance / Equivalence');
  assert(processedAfterError.weaknesses.length >= 1, 'Areas to Improve includes Balance / Equivalence');

  // -------------------------------------------------------------
  // Test 5: Complete Transfer Recovery Stage
  // -------------------------------------------------------------
  console.log('\n--- Step 5: Student Completes Transfer Recovery ---');
  const recoveryRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/sessions/${sessionId}/submit-recovery`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    {
      studentReasoning: 'To maintain balance, I must subtract 11 from both sides of the equation: 4y = 39 - 11 = 28, so y = 7.'
    }
  );

  assert(recoveryRes.status === 200, 'Recovery evaluation returned 200');
  assert(recoveryRes.data.recoveryAttempt.status === 'recovered', 'Recovery marked as recovered');

  // -------------------------------------------------------------
  // Test 6: Verify Final Progress State (Strengths & Recovered Status)
  // -------------------------------------------------------------
  console.log('\n--- Step 6: Verify Final Progress Profile After Recovery ---');
  const finalProgRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/students/${studentId}/progress`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  );

  assert(finalProgRes.status === 200, 'GET /progress returns final data');
  const finalProcessed = buildStudentProgress(finalProgRes.data, 'all');

  assert(finalProcessed.strengths.length >= 1, 'Strengths section populated after verified recovery');
  assert(finalProcessed.strengths.some(s => s.concept.includes('Recovery') || s.concept.includes('Balance')), 'Strengths contains recovered balance mastery');
  assert(finalProcessed.errors[0].outcome === 'Recovered', 'Error history item outcome updated to Recovered');
  assert(finalProcessed.timeline.length >= 2, 'Timeline contains practice and recovery verification events');

  // -------------------------------------------------------------
  // Test 7: Student Authorization Isolation
  // -------------------------------------------------------------
  console.log('\n--- Step 7: Security Check (Data Isolation) ---');
  const tamperedRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/students/other-student-id/progress`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  assert(tamperedRes.status === 403, 'Student is forbidden (403) from accessing another student progress data');

  console.log('\n================================================================');
  console.log(`  VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
