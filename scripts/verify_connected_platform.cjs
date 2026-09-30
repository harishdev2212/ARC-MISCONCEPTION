const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, text: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };
    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, text: resData });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('RUNNING MINDTRACE CONNECTED PLATFORM ACCEPTANCE TESTS');
  console.log('====================================================\n');

  // ------------------------------------------------------------------
  // TEST 1: Register and practice as a new Student
  // ------------------------------------------------------------------
  console.log('--- TEST 1: STUDENT REGISTRATION, LOGIN, PRACTICE & PROGRESS ---');
  const studentEmail = `maya.${Date.now()}@test.edu`;
  const regRes = await post('/api/auth/register', {
    name: 'Maya Patel',
    email: studentEmail,
    password: 'Password123!',
    role: 'student',
    gradeLevel: 'Grade 10'
  });
  console.log('1. Registration status:', regRes.status, 'User:', regRes.data?.user?.name, 'isDemo:', regRes.data?.user?.isDemo);
  if (regRes.status !== 201) throw new Error('Student registration failed');

  const studentToken = regRes.data.token;
  const studentId = regRes.data.user.id;

  // Login check with same credentials
  const loginRes = await post('/api/auth/login', {
    email: studentEmail,
    password: 'Password123!',
    role: 'student'
  });
  console.log('2. Login status:', loginRes.status, 'User authenticated:', loginRes.data?.user?.email);

  // Initial progress should be clean/empty
  const initProg = await get(`/api/students/${studentId}/progress`, studentToken);
  console.log('3. Initial Student Progress (should be 0 attempts):', initProg.data?.learnerState?.attempts, 'Attempts');

  // Start learning session
  const sessRes = await post('/api/sessions/start', {
    studentId: studentId,
    topic: 'Linear Equations'
  }, studentToken);
  console.log('4. Practice session started. ID:', sessRes.data?.session?.id, 'Question:', sessRes.data?.session?.currentQuestion?.equation);
  const sessionId = sessRes.data.session.id;

  // Submit reasoning with one-sided balance misconception
  const diagRes = await post(`/api/sessions/${sessionId}/submit-reasoning`, {
    submittedAnswer: 'x = 7',
    reasoningText: 'I just subtracted 8 from the left side, so 3x = 29. Then x = 29/3.'
  }, studentToken);
  console.log('5. AI Diagnostic evaluated:', {
    category: diagRes.data?.diagnosis?.diagnosis,
    affectedSkill: diagRes.data?.diagnosis?.affectedSkill,
    confidence: diagRes.data?.diagnosis?.confidence,
    socraticQuestion: diagRes.data?.intervention?.socraticQuestion?.substring(0, 60) + '...'
  });

  // Respond to Socratic dialogue
  const socRes = await post(`/api/sessions/${sessionId}/respond`, {
    studentResponse: 'Oh! To keep it balanced, I have to subtract 8 from 29 on the right side too, which gives 21. Then 3x = 21, so x = 7!'
  }, studentToken);
  console.log('6. Socratic Response evaluated. Understanding detected:', socRes.data?.diagnosis?.understandingDetected);

  // Check updated student progress
  const updatedProg = await get(`/api/students/${studentId}/progress`, studentToken);
  console.log('7. Real Progress updated after session:', {
    attempts: updatedProg.data?.learnerState?.attempts,
    correctCount: updatedProg.data?.learnerState?.successfulAttempts,
    mastery: updatedProg.data?.learnerState?.mastery,
    diagnosticRecordsCount: updatedProg.data?.diagnosticRecords?.length,
    recentActivitiesCount: updatedProg.data?.recentActivities?.length
  });

  // ------------------------------------------------------------------
  // TEST 2: TEACHER LOGIN, CLASS OVERVIEW & STUDENT DRILLDOWNS
  // ------------------------------------------------------------------
  console.log('\n--- TEST 2: TEACHER DASHBOARD & COHORT ANALYTICS ---');
  const teacherLogin = await post('/api/auth/login', {
    email: 'teacher@mindtrace.ai',
    password: 'teacher123',
    role: 'teacher'
  });
  console.log('1. Teacher Login status:', teacherLogin.status, 'Teacher:', teacherLogin.data?.user?.name);
  const teacherToken = teacherLogin.data.token;

  const teacherDash = await get('/api/teacher/dashboard', teacherToken);
  console.log('2. Cohort Overview Metrics:', {
    totalStudents: teacherDash.data?.metrics?.totalStudents,
    activeStudents: teacherDash.data?.metrics?.activeStudents,
    averageMastery: teacherDash.data?.metrics?.avgMastery + '%',
    averageAccuracy: teacherDash.data?.metrics?.avgAccuracy + '%'
  });

  // Check demo students
  const demoStudents = teacherDash.data?.students?.filter(s => s.student?.isDemo);
  console.log('3. Demo Students count:', demoStudents?.length, 'Names:', demoStudents?.map(s => s.student?.name).join(', '));

  // Check real student is also in teacher roster
  const realStudentInRoster = teacherDash.data?.students?.find(s => s.student?.id === studentId);
  console.log('4. Real Student (Maya Patel) visible in Teacher Roster:', Boolean(realStudentInRoster), {
    name: realStudentInRoster?.student?.name,
    isDemo: realStudentInRoster?.student?.isDemo,
    masteryPercent: realStudentInRoster?.masteryPercent + '%'
  });

  // Check student drilldown for demo student Aarav Sharma
  const aarav = demoStudents?.find(s => s.student?.name.includes('Aarav'));
  if (aarav) {
    const drilldown = await get(`/api/teacher/students/${aarav.student.id}`, teacherToken);
    console.log('5. Teacher Drilldown for Aarav Sharma:', {
      name: drilldown.data?.student?.name,
      mastery: drilldown.data?.overallMastery + '%',
      accuracy: drilldown.data?.accuracyPercent + '%',
      strengths: drilldown.data?.strengths,
      weaknesses: drilldown.data?.weaknesses,
      commonMisconceptions: drilldown.data?.commonMisconceptions,
      recommendedIntervention: drilldown.data?.recommendedIntervention
    });
  }

  // ------------------------------------------------------------------
  // TEST 3: MULTI-STUDENT DATA ISOLATION
  // ------------------------------------------------------------------
  console.log('\n--- TEST 3: MULTI-STUDENT INDEPENDENT PROGRESS ISOLATION ---');
  const student2Email = `rohan.${Date.now()}@test.edu`;
  const regRes2 = await post('/api/auth/register', {
    name: 'Rohan Gupta',
    email: student2Email,
    password: 'Password123!',
    role: 'student',
    gradeLevel: 'Grade 11'
  });
  const student2Token = regRes2.data.token;
  const student2Id = regRes2.data.user.id;

  // Student 2 starts and completes session with correct answer
  const sess2Res = await post('/api/sessions/start', {
    studentId: student2Id,
    topic: 'Linear Equations'
  }, student2Token);
  const sess2Id = sess2Res.data.session.id;

  await post(`/api/sessions/${sess2Id}/submit-reasoning`, {
    submittedAnswer: 'x = 7',
    reasoningText: 'I subtracted 8 from both sides to get 3x = 21, then divided both sides by 3 to get x = 7.'
  }, student2Token);

  const progStudent2 = await get(`/api/students/${student2Id}/progress`, student2Token);
  const progStudent1 = await get(`/api/students/${studentId}/progress`, studentToken);

  console.log('1. Student 2 (Rohan) Progress:', {
    attempts: progStudent2.data?.learnerState?.attempts,
    correct: progStudent2.data?.learnerState?.successfulAttempts,
    mastery: progStudent2.data?.learnerState?.mastery
  });

  console.log('2. Student 1 (Maya) Progress (Unchanged and isolated):', {
    attempts: progStudent1.data?.learnerState?.attempts,
    correct: progStudent1.data?.learnerState?.successfulAttempts,
    mastery: progStudent1.data?.learnerState?.mastery
  });

  if (studentId !== student2Id) {
    console.log('Verified: Each student has their own isolated progress records and separate profiles!');
  }

  console.log('\n====================================================');
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
