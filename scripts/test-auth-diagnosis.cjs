const http = require('http');

function post(path, body) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, body: d });
        }
      });
    });
    req.write(payload);
    req.end();
  });
}

async function test() {
  console.log('--- DIAGNOSTIC AUTH TESTS ---');
  
  // 1. Login with username "teacher"
  const t1 = await post('/api/auth/login', { email: 'teacher', password: 'teacher123', role: 'teacher' });
  console.log('1. Login with username "teacher":', t1.status, t1.body);

  // 2. Login with student@mindtrace.ai
  const t2 = await post('/api/auth/login', { email: 'student@mindtrace.ai', password: 'student123', role: 'student' });
  console.log('2. Login with "student@mindtrace.ai":', t2.status, t2.body);

  // 3. Login with username "alex"
  const t3 = await post('/api/auth/login', { email: 'alex', password: 'student123', role: 'student' });
  console.log('3. Login with username "alex":', t3.status, t3.body);

  // 4. Login with "teacher@mindtrace.ai"
  const t4 = await post('/api/auth/login', { email: 'teacher@mindtrace.ai', password: 'teacher123', role: 'teacher' });
  console.log('4. Login with "teacher@mindtrace.ai":', t4.status, t4.body?.user?.name);

  // 5. Login with "alex@demo.mindtrace.ai"
  const t5 = await post('/api/auth/login', { email: 'alex@demo.mindtrace.ai', password: 'student123', role: 'student' });
  console.log('5. Login with "alex@demo.mindtrace.ai":', t5.status, t5.body?.user?.name);

  // 6. Test wrong password
  const t6 = await post('/api/auth/login', { email: 'teacher@mindtrace.ai', password: 'wrongpassword', role: 'teacher' });
  console.log('6. Wrong teacher password:', t6.status, t6.body);

  // 7. Test wrong role tab
  const t7 = await post('/api/auth/login', { email: 'teacher@mindtrace.ai', password: 'teacher123', role: 'student' });
  console.log('7. Teacher email on student tab:', t7.status, t7.body);

  // 8. Test new registration
  const testStudentEmail = `test.student.${Date.now()}@example.com`;
  const t8 = await post('/api/auth/register', {
    name: 'New Test Student',
    email: testStudentEmail,
    password: 'password123',
    role: 'student',
    gradeLevel: 'Grade 10'
  });
  console.log('8. Register new student:', t8.status, t8.body?.user?.name, t8.body?.user?.id);

  // 9. Register duplicate email
  const t9 = await post('/api/auth/register', {
    name: 'Duplicate Student',
    email: testStudentEmail,
    password: 'password123',
    role: 'student',
    gradeLevel: 'Grade 10'
  });
  console.log('9. Duplicate email registration:', t9.status, t9.body);
}

test();
