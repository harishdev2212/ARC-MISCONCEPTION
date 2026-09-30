const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('MINDTRACE STUDENT DASHBOARD REDESIGN — VERIFICATION');
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

// 1. Inspect StudentDashboardPage.tsx
const dashboardPath = path.join(__dirname, '../client/src/pages/StudentDashboardPage.tsx');
assert(fs.existsSync(dashboardPath), 'StudentDashboardPage.tsx exists');

const content = fs.readFileSync(dashboardPath, 'utf8');

// Section 1: Left Sidebar
assert(content.includes('dashboard-sidebar'), 'Sidebar container with styling class present');
assert(content.includes('MindTrace') && content.includes('AI'), 'MindTrace AI branding in sidebar');
assert(content.includes("'home'") && content.includes('Home'), 'Home navigation item');
assert(content.includes("'learn'") && content.includes('Learn'), 'Learn navigation item');
assert(content.includes("'practice'") && content.includes('Practice'), 'Practice navigation item');
assert(content.includes("'progress'") && content.includes('Progress'), 'Progress navigation item');
assert(content.includes("'insights'") && content.includes('My Insights'), 'My Insights navigation item');
assert(content.includes('Current Course'), 'Learning subcategory: Current Course');
assert(content.includes('Topics'), 'Learning subcategory: Topics');
assert(content.includes('Practice History'), 'Learning subcategory: Practice History');
assert(content.includes('Help & Support'), 'Sidebar footer: Help & Support');
assert(content.includes('Settings'), 'Sidebar footer: Settings');
assert(content.includes('Student · {gradeLevel}'), 'Sidebar student profile with grade level');
assert(content.includes('sidebarCollapsed'), 'Sidebar collapsible functionality');
assert(content.includes('mobileDrawerOpen'), 'Mobile drawer hamburger support');

// Section 2: Top Header
assert(content.includes('Good morning, {firstName} 👋'), 'Top header personalized greeting');
assert(content.includes('Continue where you left off.'), 'Top header subtitle');
assert(content.includes('Bell size={18}'), 'Header notification bell icon');
assert(content.includes('Sign Out'), 'Header direct Sign Out action');

// Section 3: Hero / Continue Learning
assert(content.includes('Continue Learning'), 'Hero Continue Learning badge');
assert(content.includes('Linear Equations'), 'Hero topic title');
assert(content.includes('Build confidence with multi-step equations'), 'Hero topic description');
assert(content.includes('Topic Progress') && content.includes('masteryPercent'), 'Hero topic progress bar');
assert(content.includes('3x + 8 = 29'), 'Hero mathematical visual element');
assert(content.includes('handleContinueLearning'), 'Hero button calls handleContinueLearning');

// Section 4: Quick Stats (4 cards)
assert(content.includes('Current Mastery'), 'Stat 1: Current Mastery');
assert(content.includes('Reasoning Attempts'), 'Stat 2: Reasoning Attempts');
assert(content.includes('Concepts Practiced'), 'Stat 3: Concepts Practiced');
assert(content.includes('Skills Improving'), 'Stat 4: Skills Improving');

// Section 5: "Your Learning"
assert(content.includes('Your Learning'), 'Section heading: Your Learning');
assert(content.includes('Distributive Property & Parentheses'), 'Curriculum topic card 1');
assert(content.includes('Combining Like Terms'), 'Curriculum topic card 2');

// Section 6: Cognitive Insight ("Your Learning Insight")
assert(content.includes('Your Learning Insight'), 'Cognitive insight section title');
assert(content.includes('Something to work on') || content.includes('On Track'), 'Cognitive status indicator');
assert(content.includes('Keeping both sides balanced'), 'Friendly explanation for equivalence misconception');

// Strictly verify NO forbidden technical jargon exposed
const forbiddenJargon = [
  'CALCULATION_SLIP',
  'LLM_UNAVAILABLE',
  'COGNITIVE_DIAGNOSTIC_STATE',
  'CONFIDENCE SCORE',
  'PIPELINE'
];

for (const term of forbiddenJargon) {
  // It shouldn't appear in the rendered UI text
  const occurrencesInStrings = content.includes(`"${term}"`) || content.includes(`'${term}'`) || content.includes(`>${term}<`);
  assert(!occurrencesInStrings, `Forbidden technical jargon "${term}" is NOT displayed to student`);
}

// Section 7: Recent Activity Timeline
assert(content.includes('Recent Activity'), 'Recent Activity heading');
assert(content.includes('Completed reasoning attempt'), 'Activity item: reasoning attempt');
assert(content.includes('Practiced inverse operations'), 'Activity item: inverse operations');
assert(content.includes('Concept understanding verified'), 'Activity item: verified understanding');

// Section 8: Right Panel / Quick Actions & Progress
assert(content.includes('Mastery Progress'), 'Progress visualization heading');
assert(content.includes('strokeDasharray') && content.includes('strokeDashoffset'), 'Circular SVG mastery indicator');
assert(content.includes('Quick Actions'), 'Quick Actions panel');
assert(content.includes('Practice a Concept'), 'Quick Action: Practice a Concept');
assert(content.includes('View Progress'), 'Quick Action: View Progress');
assert(content.includes('Review Insights'), 'Quick Action: Review Insights');
assert(content.includes('3-Day Learning Streak'), 'Motivational streak card');

// Section 9: Layout & App.tsx Wiring
const appPath = path.join(__dirname, '../client/src/App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(appContent.includes("currentView === 'student-dashboard'"), 'App.tsx directly routes student-dashboard');
assert(appContent.includes('<StudentDashboardPage onNavigate={handleNavigate} />'), 'App.tsx renders StudentDashboardPage');

console.log('\n====================================================');
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
