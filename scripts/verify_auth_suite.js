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

async function runTestSuite() {
  console.log('====================================================');
  console.log('MINDTRACE AUTHENTICATION SUITE — AUTOMATED VERIFICATION');
  console.log('====================================================\n');

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

  // --- Test Case 1: Register a new Student ---
  console.log('--- Test Case 1: Register a new Student ---');
  const studentPayload = {
    name: 'John Mathew',
    email: `john.mathew.${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'student',
    gradeLevel: 'Grade 10'
  };

  const regStudentRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(studentPayload)
  });

  assert(regStudentRes.status === 201, `Status is 201 (got ${regStudentRes.status})`);
  assert(regStudentRes.data?.token, 'JWT token returned on registration');
  assert(regStudentRes.data?.user?.name === 'John Mathew', 'Returned user name is John Mathew');
  assert(regStudentRes.data?.user?.gradeLevel === 'Grade 10', 'Returned student grade is Grade 10');
  assert(regStudentRes.data?.user?.role === 'student', 'Role is student');
  assert(!regStudentRes.data?.user?.passwordHash, 'Password hash is NOT exposed in response');

  const studentToken = regStudentRes.data?.token;
  const studentId = regStudentRes.data?.user?.id;

  // Check student dashboard for clean zeroed learning state
  const dashRes = await request(`/students/${studentId}/dashboard`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(dashRes.status === 200, 'Student dashboard retrieved with valid token');
  assert(dashRes.data?.learnerState?.attempts === 0, 'New student has 0 attempts (no fabricated history)');
  assert(dashRes.data?.learnerState?.mastery === 0, 'New student has 0% baseline mastery');
  assert(!dashRes.data?.learnerState?.activeMisconception, 'No active misconception pre-assigned');
  assert(Array.isArray(dashRes.data?.recentActivities) && dashRes.data?.recentActivities.length === 0, 'Empty recent activity array for new student');

  // --- Test Case 2: Logout ---
  console.log('\n--- Test Case 2: Logout ---');
  const logoutRes = await request('/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(logoutRes.status === 200, 'Logout succeeds with status 200');
  assert(logoutRes.data?.success === true, 'Logout returns success');

  // --- Test Case 3: Login using the newly created Student account ---
  console.log('\n--- Test Case 3: Login with newly created Student account ---');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: studentPayload.email,
      password: studentPayload.password
    })
  });
  assert(loginRes.status === 200, 'Login succeeded with status 200');
  assert(loginRes.data?.token, 'New JWT token issued on login');
  assert(loginRes.data?.user?.name === 'John Mathew', 'Authenticated user matches John Mathew');
  assert(loginRes.data?.user?.gradeLevel === 'Grade 10', 'Grade level restored as Grade 10');
  const freshStudentToken = loginRes.data?.token;

  // --- Test Case 4: Register a Teacher ---
  console.log('\n--- Test Case 4: Register a Teacher ---');
  const teacherPayload = {
    name: 'Dr. Sarah Connor',
    email: `sarah.connor.${Date.now()}@school.edu`,
    password: 'SecureTeacherPassword99!',
    role: 'teacher',
    subject: 'Mathematics'
  };
  const regTeacherRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(teacherPayload)
  });
  assert(regTeacherRes.status === 201, 'Teacher registered with status 201');
  assert(regTeacherRes.data?.user?.role === 'teacher', 'User role is teacher');
  assert(regTeacherRes.data?.user?.subject === 'Mathematics', 'Teacher subject is Mathematics');
  const teacherToken = regTeacherRes.data?.token;

  // Verify teacher can access teacher dashboard
  const cohortRes = await request('/teachers/dashboard', {
    headers: { Authorization: `Bearer ${teacherToken}` }
  });
  assert(cohortRes.status === 200, 'Teacher authorized to access /teachers/dashboard');
  assert(cohortRes.data?.metrics !== undefined && Array.isArray(cohortRes.data?.students), 'Cohort metrics and students returned to teacher');

  // Verify student is forbidden from teacher dashboard endpoint
  const studentForbiddenRes = await request('/teachers/dashboard', {
    headers: { Authorization: `Bearer ${freshStudentToken}` }
  });
  assert(studentForbiddenRes.status === 403, 'Student is forbidden (403) from accessing teacher dashboard');

  // --- Test Case 5: Wrong Password ---
  console.log('\n--- Test Case 5: Wrong Password ---');
  const wrongPassRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: studentPayload.email,
      password: 'CompletelyWrongPassword'
    })
  });
  assert(wrongPassRes.status === 401, 'Wrong password returns 401');
  assert(wrongPassRes.data?.error === 'Invalid email or password.', 'Error message is "Invalid email or password."');

  // --- Test Case 6: Duplicate Email ---
  console.log('\n--- Test Case 6: Duplicate Email ---');
  const dupEmailRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Imposter John',
      email: studentPayload.email,
      password: 'Password123!',
      role: 'student',
      gradeLevel: 'Grade 10'
    })
  });
  assert(dupEmailRes.status === 400, 'Duplicate email returns 400');
  assert(dupEmailRes.data?.error === 'An account with this email address already exists.', 'Error message clearly specifies email exists');

  // --- Test Case 7: Session Verification (GET /api/auth/me) ---
  console.log('\n--- Test Case 7: Refresh / Session Persistence (GET /api/auth/me) ---');
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${freshStudentToken}` }
  });
  assert(meRes.status === 200, 'GET /api/auth/me returns 200 with valid JWT');
  assert(meRes.data?.user?.email === studentPayload.email, 'Restored session email matches');
  assert(meRes.data?.user?.name === 'John Mathew', 'Restored session name matches');
  assert(meRes.data?.user?.role === 'student', 'Restored session role matches');

  // Verify invalid/expired token rejected
  const badTokenRes = await request('/auth/me', {
    headers: { Authorization: 'Bearer fake-invalid-token' }
  });
  assert(badTokenRes.status === 401, 'Invalid token returns 401');

  // --- Test Case 8: Two Different Students (Data Isolation) ---
  console.log('\n--- Test Case 8: Two Different Students (Data Isolation) ---');
  const student2Payload = {
    name: 'Alice Smith',
    email: `alice.smith.${Date.now()}@example.com`,
    password: 'AlicePassword456!',
    role: 'student',
    gradeLevel: 'Grade 11'
  };
  const regStudent2Res = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(student2Payload)
  });
  const student2Token = regStudent2Res.data?.token;
  const student2Id = regStudent2Res.data?.user?.id;

  assert(regStudent2Res.status === 201, 'Student 2 registered');
  assert(student2Id !== studentId, 'Student IDs are distinct');

  // Verify Student 2 cannot access Student 1 dashboard by altering ID in URL
  const student2HackingStudent1 = await request(`/students/${studentId}/dashboard`, {
    headers: { Authorization: `Bearer ${student2Token}` }
  });
  assert(student2HackingStudent1.status === 403, 'Student 2 forbidden (403) from accessing Student 1 dashboard by URL tampering');

  // Verify Student 1 cannot access Student 2 dashboard
  const student1HackingStudent2 = await request(`/students/${student2Id}/dashboard`, {
    headers: { Authorization: `Bearer ${freshStudentToken}` }
  });
  assert(student1HackingStudent2.status === 403, 'Student 1 forbidden (403) from accessing Student 2 dashboard');

  // Verify Student 2 has their own clean dashboard
  const student2Dash = await request(`/students/${student2Id}/dashboard`, {
    headers: { Authorization: `Bearer ${student2Token}` }
  });
  assert(student2Dash.status === 200, 'Student 2 accesses their own dashboard');
  assert(student2Dash.data?.student?.name === 'Alice Smith', 'Student 2 name is Alice Smith');
  assert(student2Dash.data?.student?.gradeLevel === 'Grade 11', 'Student 2 grade is Grade 11');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
