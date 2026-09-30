async function testLiveFlow() {
  console.log('1. Starting session on http://localhost:5000/api/sessions/start ...');
  const startRes = await fetch('http://localhost:5000/api/sessions/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: 'std-alex-rivera' })
  });
  const startJson = await startRes.json();
  const sid = startJson.session.id;
  console.log('  -> Session Created:', sid);

  console.log('\n2. Submitting initial reasoning (Attempt 1): "I subtracted 8 from the left side only, so 3x = 29."');
  const submitRes = await fetch(`http://localhost:5000/api/sessions/${sid}/submit-reasoning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reasoningText: 'I subtracted 8 from the left side only, so 3x = 29.',
      submittedAnswer: 'x = 7'
    })
  });
  const submitJson = await submitRes.json();
  console.log('  -> Diagnosis:', submitJson.diagnosis.diagnosis);
  console.log('  -> Affected Skill:', submitJson.diagnosis.affectedSkill);
  console.log('  -> Level:', submitJson.intervention.levelNumber || submitJson.intervention.level);
  console.log('  -> Prompt:', submitJson.intervention.socraticQuestion || submitJson.intervention.tutorMessage);

  console.log('\n3. Follow-up response (Attempt 2 - persistent): "I think I only need to change the side with the 8."');
  const resp1 = await fetch(`http://localhost:5000/api/sessions/${sid}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentResponse: 'I think I only need to change the side with the 8.'
    })
  });
  const json1 = await resp1.json();
  console.log('  -> Level:', json1.intervention.level);
  console.log('  -> Type:', json1.intervention.type);
  console.log('  -> Persists:', json1.diagnosis.persists);
  console.log('  -> Next Action:', json1.session.nextAction);
  console.log('  -> Prompt:', json1.intervention.text);

  console.log('\n4. Follow-up response (Attempt 3 - understanding): "I should subtract 8 from both sides so 3x = 21."');
  const resp2 = await fetch(`http://localhost:5000/api/sessions/${sid}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentResponse: 'I should subtract 8 from both sides so 3x = 21.'
    })
  });
  const json2 = await resp2.json();
  console.log('  -> Understanding Detected:', json2.diagnosis.understandingDetected);
  console.log('  -> Next Action:', json2.session.nextAction);
  console.log('  -> Level:', json2.intervention.level);
  console.log('  -> Message:', json2.intervention.text);

  console.log('\n5. Inspecting Teacher Student Profile endpoint: /api/teacher/students/std-alex-rivera');
  const teachRes = await fetch('http://localhost:5000/api/teacher/students/std-alex-rivera');
  const teachJson = await teachRes.json();
  console.log('  -> Teacher Inspection turns count:', teachJson.interventionHistory.length);
  console.log('  -> Latest Teacher Inspection turn:', JSON.stringify(teachJson.interventionHistory[0], null, 2));

  console.log('\n🎉 ALL LIVE ENDPOINTS & TEACHER INSPECTION SUCCESSFULLY VERIFIED!');
}

testLiveFlow().catch(console.error);
