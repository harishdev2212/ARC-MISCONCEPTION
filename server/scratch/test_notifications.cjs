const http = require('http');

function post(url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body || {});
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, text: chunks });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers
    }, (res) => {
      let chunks = '';
      res.on('data', d => chunks += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(chunks) });
        } catch {
          resolve({ status: res.statusCode, text: chunks });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Health ---');
  const health = await get('http://localhost:5000/api/health');
  console.log('Health:', health.status, health.data?.service);

  console.log('\n--- 2. Student Login (Alex Rivera) ---');
  const studentLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'student@mindtrace.ai',
    password: 'student123'
  });
  console.log('Student Login Status:', studentLogin.status);
  const studentToken = studentLogin.data?.token;
  const studentUser = studentLogin.data?.user;
  console.log('Student Logged In:', studentUser?.name, 'Role:', studentUser?.role);

  console.log('\n--- 3. Teacher Login (Dr. Evelyn Reed) ---');
  const teacherLogin = await post('http://localhost:5000/api/auth/login', {
    email: 'teacher@mindtrace.ai',
    password: 'teacher123'
  });
  console.log('Teacher Login Status:', teacherLogin.status);
  const teacherToken = teacherLogin.data?.token;
  const teacherUser = teacherLogin.data?.user;
  console.log('Teacher Logged In:', teacherUser?.name, 'Role:', teacherUser?.role);

  console.log('\n--- 4. Fetch Student Notifications ---');
  const studentNotifs = await get('http://localhost:5000/api/notifications', {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log('Student Notifs Status:', studentNotifs.status);
  console.log('Student Notifications Count:', studentNotifs.data?.notifications?.length, 'Unread:', studentNotifs.data?.unreadCount);
  console.log('Sample Student Titles:');
  studentNotifs.data?.notifications?.slice(0, 3).forEach(n => {
    console.log(` - [${n.read ? 'READ' : 'UNREAD'}] [${n.category}] ${n.title}: ${n.message.substring(0, 60)}... (url: ${n.actionUrl})`);
  });

  console.log('\n--- 5. Fetch Teacher Notifications ---');
  const teacherNotifs = await get('http://localhost:5000/api/notifications', {
    'Authorization': `Bearer ${teacherToken}`
  });
  console.log('Teacher Notifs Status:', teacherNotifs.status);
  console.log('Teacher Notifications Count:', teacherNotifs.data?.notifications?.length, 'Unread:', teacherNotifs.data?.unreadCount);
  console.log('Sample Teacher Titles:');
  teacherNotifs.data?.notifications?.slice(0, 3).forEach(n => {
    console.log(` - [${n.read ? 'READ' : 'UNREAD'}] [${n.category}] ${n.title}: ${n.message.substring(0, 60)}... (url: ${n.actionUrl})`);
  });

  console.log('\n--- 6. Test Role Privacy Isolation ---');
  // Student should NOT see any teacher notifications
  const studentSeeingTeacher = studentNotifs.data?.notifications?.some(n => n.role === 'teacher');
  console.log('Did student see any teacher notifications?', studentSeeingTeacher ? 'FAILED (LEAK)' : 'PASSED (STRICT PRIVACY)');

  // Verify all student notifs belong to student
  const allBelongToStudent = studentNotifs.data?.notifications?.every(n => n.userId === studentUser.id);
  console.log('Do all notifications belong strictly to Alex Rivera?', allBelongToStudent ? 'PASSED' : 'FAILED');

  console.log('\n--- 7. Mark One Notification As Read ---');
  const firstUnread = studentNotifs.data?.notifications?.find(n => !n.read);
  if (firstUnread) {
    console.log('Marking as read:', firstUnread.id, firstUnread.title);
    const markRes = await post(`http://localhost:5000/api/notifications/${firstUnread.id}/read`, {}, {
      'Authorization': `Bearer ${studentToken}`
    });
    console.log('Mark Res:', markRes.status, markRes.data);
    const updatedNotifs = await get('http://localhost:5000/api/notifications', {
      'Authorization': `Bearer ${studentToken}`
    });
    console.log('Updated Unread Count:', updatedNotifs.data?.unreadCount, '(Previously:', studentNotifs.data?.unreadCount, ')');
  }

  console.log('\n--- 8. Mark All As Read ---');
  const markAllRes = await post('http://localhost:5000/api/notifications/read-all', {}, {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log('Mark All Res:', markAllRes.status, markAllRes.data);
  const afterMarkAll = await get('http://localhost:5000/api/notifications', {
    'Authorization': `Bearer ${studentToken}`
  });
  console.log('After Mark All Unread Count:', afterMarkAll.data?.unreadCount);

  console.log('\n--- 9. Automatic Notification Trigger from Session Attempt ---');
  // Initialize session
  const initSession = await post('http://localhost:5000/api/sessions/start', {
    studentId: studentUser.id,
    conceptId: 'concept_linear_equations_1'
  }, {
    'Authorization': `Bearer ${studentToken}`
  });
  const sessionId = initSession.data?.session?.id || initSession.data?.id;
  console.log('Initialized Session:', sessionId);

  if (sessionId) {
    // Submit reasoning with a misconception
    const submitReasoning = await post(`http://localhost:5000/api/sessions/${sessionId}/submit-reasoning`, {
      reasoningText: 'I just added 7 to 22 and then didn\'t balance both sides',
      submittedAnswer: 'x = 10'
    });
    console.log('Reasoning Submitted. Diagnosis:', submitReasoning.data?.diagnosis?.diagnosis || submitReasoning.data?.diagnosis?.errorType);

    // Check student notifications
    const studentNotifsAfterAttempt = await get('http://localhost:5000/api/notifications', {
      'Authorization': `Bearer ${studentToken}`
    });
    console.log('New Student Notifications Count:', studentNotifsAfterAttempt.data?.notifications?.length, 'Unread:', studentNotifsAfterAttempt.data?.unreadCount);
    const newest = studentNotifsAfterAttempt.data?.notifications?.[0];
    console.log('Newest Student Notification:', newest?.title, '-', newest?.message, '(url:', newest?.actionUrl, ')');

    // Check teacher notifications
    const teacherNotifsAfterAttempt = await get('http://localhost:5000/api/notifications', {
      'Authorization': `Bearer ${teacherToken}`
    });
    const newestTeacher = teacherNotifsAfterAttempt.data?.notifications?.[0];
    console.log('Newest Teacher Notification:', newestTeacher?.title, '-', newestTeacher?.message, '(url:', newestTeacher?.actionUrl, ')');
  }

  console.log('\n==========================================');
  console.log('✅ ALL NOTIFICATION TESTS COMPLETED');
  console.log('==========================================');
}

run().catch(console.error);
