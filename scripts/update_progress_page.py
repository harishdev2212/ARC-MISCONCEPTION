with open('client/src/pages/ProgressPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if "import { useRouter } from '../context/RouterContext';" not in content:
    content = content.replace("import { useAuth } from '../context/AuthContext';", "import { useAuth } from '../context/AuthContext';\nimport { useRouter } from '../context/RouterContext';\nimport { StudentSidebar } from '../components/common/StudentSidebar';")

# Update handleStartPractice
old_fn = """  const handleStartPractice = async () => {
    if (!currentStudent) return;
    try {
      if (!session) {
        await startSession(currentStudent.id);
      }
      onNavigate('learning-session');
    } catch (err) {
      console.error('Error starting session', err);
      onNavigate('learning-session');
    }
  };"""

new_fn = """  const { navigate } = useRouter();
  const handleStartPractice = async () => {
    if (!currentStudent) return;
    try {
      if (!session) {
        await startSession(currentStudent.id);
      }
      navigate('/practice');
    } catch (err) {
      console.error('Error starting session', err);
      navigate('/practice');
    }
  };"""

content = content.replace(old_fn, new_fn)

# Replace aside
start_marker = '{/* 1. LEFT SIDEBAR'
end_marker = '</aside>'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker, start_pos) + len(end_marker)

if start_pos != -1 and end_pos != -1:
    replacement = """{/* 1. Shared Student Sidebar */}
      <StudentSidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />"""
    content = content[:start_pos] + replacement + content[end_pos:]
    with open('client/src/pages/ProgressPage.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('PROGRESS_SIDEBAR_SUCCESS')
else:
    print('MARKERS NOT FOUND', start_pos, end_pos)
