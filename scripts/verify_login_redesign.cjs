const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('MINDTRACE AI LOGIN REDESIGN — VERIFICATION SUITE');
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

// 1. Inspect LandingLoginPage.tsx
const loginPagePath = path.join(__dirname, '..', 'client', 'src', 'pages', 'LandingLoginPage.tsx');
assert(fs.existsSync(loginPagePath), 'LandingLoginPage.tsx exists');

const loginSource = fs.readFileSync(loginPagePath, 'utf8');

// 2. Verify demo email is removed
assert(!loginSource.includes('alex.rivera@lincoln-high.edu'), 'Demo email "alex.rivera@lincoln-high.edu" is completely removed');
assert(!loginSource.includes('e.rostova@lincoln-high.edu'), 'Teacher demo email is completely removed');

// 3. Verify initial state is empty
assert(loginSource.includes("const [emailOrUsername, setEmailOrUsername] = useState('');"), 'Email input state defaults to empty string');
assert(loginSource.includes('placeholder="Enter your email or username"'), 'Placeholder is "Enter your email or username"');

// 4. Verify Microsoft login is completely removed
assert(!loginSource.toLowerCase().includes('microsoft'), 'Microsoft login is completely removed from the page');

// 5. Verify Google login is retained
assert(loginSource.includes('Continue with Google'), 'Google login is retained');

// 6. Verify brand headline and text
assert(loginSource.includes('Learn Smarter.') && loginSource.includes('Think Deeper.') && loginSource.includes('Grow Further.'), 'Main headline matches "Learn Smarter. Think Deeper. Grow Further."');
assert(loginSource.includes('An AI-powered learning platform designed to help you understand, practice and master with clarity.'), 'Supporting paragraph matches requirements');

// 7. Verify image asset
assert(loginSource.includes('/focused_study_workspace.jpg'), 'Uses /focused_study_workspace.jpg in image tag');
const publicImagePath = path.join(__dirname, '..', 'client', 'public', 'focused_study_workspace.jpg');
assert(fs.existsSync(publicImagePath), 'focused_study_workspace.jpg exists in client/public/');
const imgStats = fs.statSync(publicImagePath);
assert(imgStats.size > 50000, `Image is valid high-res file (${Math.round(imgStats.size / 1024)} KB)`);

// 8. Verify typography & palette tokens
assert(loginSource.includes('#2563EB') || loginSource.includes('#2563eb'), 'Primary blue (#2563EB) is used');
assert(loginSource.includes('#F8FAFC') || loginSource.includes('#f8fafc'), 'Light cool gray background (#F8FAFC) is used');
assert(loginSource.includes('#0F172A') || loginSource.includes('#0f172a'), 'Deep primary text (#0F172A) is used');
assert(loginSource.includes('#64748B') || loginSource.includes('#64748b'), 'Secondary text (#64748B) is used');
assert(loginSource.includes('#E2E8F0') || loginSource.includes('#e2e8f0'), 'Borders (#E2E8F0) are used');

// 9. Verify UI structure
assert(loginSource.includes('Welcome Back'), '"Welcome Back" heading is present');
assert(loginSource.includes('Log in to continue your learning journey.'), 'Subheading is present');
assert(loginSource.includes('Email or Username'), '"Email or Username" label is present');
assert(loginSource.includes('Forgot password?'), '"Forgot password?" link is present');
assert(loginSource.includes('Remember me on this device'), '"Remember me on this device" checkbox is present');
assert(loginSource.includes("roleTab === 'student' ? 'Student' : 'Teacher'") && loginSource.includes("Log in as"), 'Dynamic primary button with "Log in as Student" is present');
assert(loginSource.includes("Don't have an account?"), '"Don\'t have an account? Sign Up" is present');
assert(loginSource.includes("onNavigate('register')"), 'Navigation to register view is preserved');

// 10. Verify responsiveness
assert(loginSource.includes('@media (max-width: 960px)'), 'Responsive media query handles mobile/tablet stacking');

console.log(`\n====================================================`);
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`====================================================`);

if (failed > 0) process.exit(1);
