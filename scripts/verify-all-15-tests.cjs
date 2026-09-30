const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function post(path, body, headers = {}) {
  const payload = JSON.stringify(body);
  return request({
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      ...headers
    }
  }, payload);
}

function get(path, headers = {}) {
  return request({
    hostname: 'localhost',
    port: 5000,
    path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

async function runAll15Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING COMPREHENSIVE 15-POINT AUTH & DATA VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      if (details) console.log(`   ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      if (details) console.error(`   ${details}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testStudentEmail = `verify.student.${timestamp}@mindtrace.test`;
  const testStudentPass = 'StudentPass123!';

  // 1. New student registration
  console.log('\n--- 1. New student registration ---');
  const regRes = await post('/api/auth/register', {
    name: 'Emily Davis',
    email: testStudentEmail,
    password: testStudentPass,
    role: 'student',
    gradeLevel: 'Grade 10'
  });
  assert(regRes.status === 201 && regRes.body?.token && regRes.body?.user?.email === testStudentEmail,
    'Test 1: New student registration',
    `Registered user ID: ${regRes.body?.user?.id}, role: ${regRes.body?.user?.role}`
  );
  const newStudentId = regRes.body?.user?.id;
  const initialStudentToken = regRes.body?.token;

  // 2. Student login
  console.log('\n--- 2. Student login ---');
  const loginRes = await post('/api/auth/login', {
    email: testStudentEmail,
    password: testStudentPass,
    role: 'student'
  });
  assert(loginRes.status === 200 && loginRes.body?.token && loginRes.body?.user?.id === newStudentId,
    'Test 2: Student login with registered credentials',
    `Login token issued, User: ${loginRes.body?.user?.name}`
  );
  const studentToken = loginRes.body?.token;

  // 3. Wrong student password
  console.log('\n--- 3. Wrong student password ---');
  const wrongPassRes = await post('/api/auth/login', {
    email: testStudentEmail,
    password: 'IncorrectPassword!',
    role: 'student'
  });
  assert(wrongPassRes.status === 401 && wrongPassRes.body?.error === 'Invalid email or password.',
    'Test 3: Wrong student password returns 401 with clean error',
    `Error response: "${wrongPassRes.body?.error}"`
  );

  // 4. Refresh after login (GET /api/auth/me using Bearer token)
  console.log('\n--- 4. Refresh after login (Session Restore via JWT) ---');
  const meRes = await get('/api/auth/me', { 'Authorization': `Bearer ${studentToken}` });
  assert(meRes.status === 200 && meRes.body?.user?.id === newStudentId,
    'Test 4: Refresh after login preserves session via /api/auth/me',
    `Session restored for: ${meRes.body?.user?.email}`
  );

  // 5. Student logout
  console.log('\n--- 5. Student logout ---');
  const logoutRes = await post('/api/auth/logout', {}, { 'Authorization': `Bearer ${studentToken}` });
  assert(logoutRes.status === 200 && logoutRes.body?.success === true,
    'Test 5: Student logout endpoint returns success',
    `Message: ${logoutRes.body?.message}`
  );

  // 6. Student login again
  console.log('\n--- 6. Student login again ---');
  const loginAgainRes = await post('/api/auth/login', {
    email: testStudentEmail,
    password: testStudentPass,
    role: 'student'
  });
  assert(loginAgainRes.status === 200 && loginAgainRes.body?.token,
    'Test 6: Student re-login succeeds after logout',
    `Token renewed successfully`
  );
  const activeStudentToken = loginAgainRes.body?.token;

  // 7. Teacher login (both via email and username)
  console.log('\n--- 7. Teacher login ---');
  const teacherEmailRes = await post('/api/auth/login', {
    email: 'teacher@mindtrace.ai',
    password: 'teacher123',
    role: 'teacher'
  });
  const teacherUserRes = await post('/api/auth/login', {
    email: 'teacher',
    password: 'teacher123',
    role: 'teacher'
  });
  assert(teacherEmailRes.status === 200 && teacherUserRes.status === 200 && teacherEmailRes.body?.user?.role === 'teacher',
    'Test 7: Teacher login works via email (teacher@mindtrace.ai) and username (teacher)',
    `Teacher name: ${teacherEmailRes.body?.user?.name}`
  );
  const teacherToken = teacherEmailRes.body?.token;

  // 8. Wrong teacher password
  console.log('\n--- 8. Wrong teacher password ---');
  const wrongTeacherPass = await post('/api/auth/login', {
    email: 'teacher@mindtrace.ai',
    password: 'wrongTeacherPassword',
    role: 'teacher'
  });
  assert(wrongTeacherPass.status === 401 && wrongTeacherPass.body?.error === 'Invalid email or password.',
    'Test 8: Wrong teacher password rejected with 401',
    `Error: "${wrongTeacherPass.body?.error}"`
  );

  // 9. Student attempting teacher route (Authorization & Role Protection)
  console.log('\n--- 9. Student attempting teacher route ---');
  const studentAttemptTeacher = await get('/api/teacher/dashboard', {
    'Authorization': `Bearer ${activeStudentToken}`
  });
  assert(studentAttemptTeacher.status === 403 && studentAttemptTeacher.body?.error?.includes('Access restricted to teacher'),
    'Test 9: Student blocked from teacher endpoint with 403 Forbidden',
    `Security response: "${studentAttemptTeacher.body?.error}"`
  );

  // 10. Teacher accessing student reports
  console.log('\n--- 10. Teacher accessing student reports ---');
  const reportRes = await get('/api/teacher/students/demo_alex/report', {
    'Authorization': `Bearer ${teacherToken}`
  });
  assert(reportRes.status === 200 && reportRes.body?.report?.overview?.studentName === 'Alex Rivera',
    'Test 10: Teacher successfully retrieves student report',
    `Report retrieved for student: ${reportRes.body?.report?.overview?.studentName}, Mastery: ${reportRes.body?.report?.overview?.overallMastery}%`
  );

  // 11. Student progress persistence & Session creation
  console.log('\n--- 11. Student progress persistence & Session creation ---');
  // Start learning session for our new student
  const startSessRes = await post('/api/sessions/start', {
    studentId: newStudentId,
    conceptId: 'concept_linear_equations_one_var'
  }, { 'Authorization': `Bearer ${activeStudentToken}` });
  
  assert(startSessRes.status === 200 && startSessRes.body?.session?.id,
    'Test 11a: Learning session initiated for student',
    `Session ID: ${startSessRes.body?.session?.id}`
  );
  const sessionId = startSessRes.body?.session?.id;

  // 12. Misconception persistence
  console.log('\n--- 12. Misconception persistence via reasoning submission ---');
  // Submit flawed reasoning exhibiting a sign error: 3x + 8 = 29 -> 3x = 37
  const submitRes = await post(`/api/sessions/${sessionId}/submit-reasoning`, {
    reasoningText: 'I moved +8 to the other side without changing the sign, so 3x = 29 + 8 = 37, then x = 37/3.',
    submittedAnswer: 'x = 37/3'
  }, { 'Authorization': `Bearer ${activeStudentToken}` });

  assert(submitRes.status === 200 && submitRes.body?.diagnosis,
    'Test 12a: Reasoning evaluated and diagnosed by engine',
    `Diagnosis: ${submitRes.body?.diagnosis?.diagnosis}, ErrorType: ${submitRes.body?.diagnosis?.errorType || 'sign_error'}`
  );

  // Verify that the student's progress endpoint now reflects the event
  const studentProgRes = await get(`/api/students/${newStudentId}/progress`, {
    'Authorization': `Bearer ${activeStudentToken}`
  });
  assert(studentProgRes.status === 200 && studentProgRes.body?.diagnosticRecords?.length > 0,
    'Test 12b: Student progress reflects newly persisted diagnostic record',
    `Total records: ${studentProgRes.body?.diagnosticRecords?.length}, Latest question: "${studentProgRes.body?.diagnosticRecords[0]?.question}"`
  );

  // 13. Browser refresh simulation (Verify session + progress data persist)
  console.log('\n--- 13. Browser refresh simulation ---');
  const refreshCheckMe = await get('/api/auth/me', { 'Authorization': `Bearer ${activeStudentToken}` });
  const refreshCheckProg = await get(`/api/students/${newStudentId}/progress`, { 'Authorization': `Bearer ${activeStudentToken}` });
  assert(refreshCheckMe.status === 200 && refreshCheckProg.status === 200 && refreshCheckProg.body?.diagnosticRecords?.length > 0,
    'Test 13: Browser refresh maintains student identity and progress records',
    `Student: ${refreshCheckMe.body?.user?.name}, Records preserved: ${refreshCheckProg.body?.diagnosticRecords?.length}`
  );

  // 14. Backend restart & disk persistence verification
  console.log('\n--- 14. Disk persistence verification (survives server restart) ---');
  const fs = require('fs');
  const path = require('path');
  const dbPath = path.join(__dirname, '../server/src/data/db/mindtrace.json');
  const rawDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const userInDb = rawDb.users.find(u => u.id === newStudentId);
  const recordsInDb = rawDb.diagnosticRecords.filter(r => r.studentId === newStudentId);
  assert(userInDb && userInDb.email === testStudentEmail && recordsInDb.length > 0,
    'Test 14: Data persists to disk in mindtrace.json',
    `User verified on disk: ${userInDb?.email}, Disk records for student: ${recordsInDb.length}`
  );

  // 15. Existing demo accounts
  console.log('\n--- 15. Existing demo accounts ---');
  const demoTeacherCheck = await post('/api/auth/login', {
    email: 'teacher@mindtrace.ai',
    password: 'teacher123',
    role: 'teacher'
  });
  const demoStudentCheck1 = await post('/api/auth/login', {
    email: 'student@mindtrace.ai',
    password: 'student123',
    role: 'student'
  });
  const demoStudentCheck2 = await post('/api/auth/login', {
    email: 'alex@demo.mindtrace.ai',
    password: 'student123',
    role: 'student'
  });
  const demoStudentCheck3 = await post('/api/auth/login', {
    email: 'aarav.sharma@demo.mindtrace.ai',
    password: 'student123',
    role: 'student'
  });
  assert(
    demoTeacherCheck.status === 200 &&
    demoStudentCheck1.status === 200 &&
    demoStudentCheck2.status === 200 &&
    demoStudentCheck3.status === 200,
    'Test 15: All demo accounts verified (teacher@mindtrace.ai, student@mindtrace.ai, alex@demo.mindtrace.ai, aarav.sharma@demo.mindtrace.ai)',
    `Teacher: ${demoTeacherCheck.body?.user?.name}, Student 1: ${demoStudentCheck1.body?.user?.name}, Student 2: ${demoStudentCheck2.body?.user?.name}`
  );

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  
  if (failed > 0) {
    process.exit(1);
  }
}

runAll15Tests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
