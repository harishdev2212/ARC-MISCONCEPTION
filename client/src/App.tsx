import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { SessionProvider } from './context/SessionContext';
import { NotificationProvider } from './context/NotificationContext';
import { LandingLoginPage } from './pages/LandingLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { LearnPage } from './pages/LearnPage';
import { LearningSessionPage } from './pages/LearningSessionPage';
import { ProgressPage } from './pages/ProgressPage';
import { InsightsPage } from './pages/InsightsPage';
import { CoursePage } from './pages/CoursePage';
import { TopicsPage } from './pages/TopicsPage';
import { PracticeHistoryPage } from './pages/PracticeHistoryPage';
import { DiagnosisInterventionPage } from './pages/DiagnosisInterventionPage';
import { TransferRecoveryPage } from './pages/TransferRecoveryPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { TeacherStudentProfilePage } from './pages/TeacherStudentProfilePage';

const AppContent: React.FC = () => {
  const { role, isLoading, isAuthenticated } = useAuth();
  const { currentPath, navigate, selectedStudentId } = useRouter();

  // Loading state during persistent session restore from JWT
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#fafbfc',
        color: '#64748b',
        gap: '14px',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Restoring session...</span>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 1. Unauthenticated routes
  if (!isAuthenticated || !role) {
    if (currentPath === '/register') {
      return (
        <RegisterPage 
          onNavigate={(view) => {
            if (view === 'login' || view === 'landing') navigate('/login');
            else if (view === 'teacher-dashboard' || view === 'teacher') navigate('/teacher');
            else navigate('/home');
          }} 
        />
      );
    }
    return (
      <LandingLoginPage 
        onNavigate={(view) => {
          if (view === 'register') navigate('/register');
          else if (view === 'teacher-dashboard' || view === 'teacher') navigate('/teacher');
          else navigate('/home');
        }} 
      />
    );
  }

  // 2. Teacher Protected Routes
  if (role === 'teacher') {
    if (currentPath.startsWith('/teacher/student')) {
      const studentId = selectedStudentId || currentPath.replace('/teacher/student/', '').trim();
      return (
        <TeacherStudentProfilePage 
          studentId={studentId} 
          onNavigate={(view, sid) => {
            if (view === 'teacher-dashboard' || view === '/teacher') {
              navigate('/teacher');
            } else if (sid) {
              navigate(`/teacher/student/${sid}`, { studentId: sid });
            } else {
              navigate(view.startsWith('/') ? view : `/${view}`);
            }
          }} 
        />
      );
    }
    return <TeacherDashboardPage />;
  }

  // 3. Student Protected Routes
  if (currentPath.startsWith('/teacher')) {
    return <StudentDashboardPage onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)} />;
  }

  switch (currentPath) {
    case '/home':
    case '/':
    case '/login':
    case '/register':
      return <StudentDashboardPage onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)} />;
    case '/learn':
      return <LearnPage />;
    case '/practice':
      return <LearningSessionPage onNavigate={(view) => {
        if (view === 'diagnosis-intervention') navigate('/diagnosis-intervention');
        else if (view === 'transfer-recovery') navigate('/transfer-recovery');
        else navigate(view.startsWith('/') ? view : `/${view}`);
      }} />;
    case '/progress':
      return <ProgressPage onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)} />;
    case '/insights':
      return <InsightsPage />;
    case '/course':
      return <CoursePage />;
    case '/topics':
      return <TopicsPage />;
    case '/history':
      return <PracticeHistoryPage />;
    case '/diagnosis-intervention':
      return <DiagnosisInterventionPage onNavigate={(view) => {
        if (view === 'transfer-recovery') navigate('/transfer-recovery');
        else if (view === 'learning-session' || view === 'practice') navigate('/practice');
        else navigate(view.startsWith('/') ? view : `/${view}`);
      }} />;
    case '/transfer-recovery':
      return <TransferRecoveryPage onNavigate={(view) => {
        if (view === 'learning-session' || view === 'practice') navigate('/practice');
        else if (view === 'progress') navigate('/progress');
        else navigate(view.startsWith('/') ? view : `/${view}`);
      }} />;
    default:
      return <StudentDashboardPage onNavigate={(view) => navigate(view.startsWith('/') ? view : `/${view}`)} />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RouterProvider>
          <SessionProvider>
            <AppContent />
          </SessionProvider>
        </RouterProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
