import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MindTraceLogo } from './MindTraceLogo';
import { NotificationBell } from './NotificationBell';
import { 
  GraduationCap, 
  BrainCircuit, 
  LogOut, 
  ArrowRightLeft, 
  LayoutDashboard, 
  BookOpenCheck,
  Users,
  Sparkles,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { 
    role, 
    user,
    currentStudent, 
    currentTeacher, 
    logout 
  } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // If not logged in
  if (!role) {
    return (
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <MindTraceLogo
            variant="full"
            size="md"
            subtitle="AI"
            onClick={() => onNavigate('landing')}
            clickable
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('landing')}
            >
              <span>Log In</span>
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onNavigate('register')}
            >
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // 1. STUDENT TOP NAVIGATION (Clean, minimal white educational nav)
  // =========================================================================
  if (role === 'student') {
    const displayName = currentStudent?.name || user?.name || 'Student';
    const initials = displayName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Left: MindTrace AI Logo + Name */}
          <MindTraceLogo
            variant="full"
            size="md"
            subtitle="AI"
            onClick={() => onNavigate('student-dashboard')}
            clickable
          />

          {/* Center/left navigation: Learn, Practice, Progress */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onNavigate('student-dashboard')}
              style={{
                background: currentView === 'student-dashboard' ? '#eff6ff' : 'transparent',
                color: currentView === 'student-dashboard' ? '#2563eb' : '#64748b',
                fontWeight: currentView === 'student-dashboard' ? 600 : 500,
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'student-dashboard') {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'student-dashboard') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              Learn
            </button>
            <button
              type="button"
              onClick={() => onNavigate('learning-session')}
              style={{
                background: currentView.includes('session') || currentView.includes('diagnosis') || currentView.includes('transfer') ? '#eff6ff' : 'transparent',
                color: currentView.includes('session') || currentView.includes('diagnosis') || currentView.includes('transfer') ? '#2563eb' : '#64748b',
                fontWeight: currentView.includes('session') ? 600 : 500,
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!currentView.includes('session')) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (!currentView.includes('session')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              Practice
            </button>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              style={{
                background: currentView === 'progress' ? '#eff6ff' : 'transparent',
                color: currentView === 'progress' ? '#2563eb' : '#64748b',
                fontWeight: currentView === 'progress' ? 600 : 500,
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (currentView !== 'progress') {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#0f172a';
                }
              }}
              onMouseLeave={(e) => {
                if (currentView !== 'progress') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              Progress
            </button>
          </nav>

          {/* Right: Student name/avatar, Grade 9, Profile menu */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NotificationBell />
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: isProfileOpen ? '#f8fafc' : 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '4px 10px 4px 6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              {/* Circular Avatar */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700
              }}>
                {initials}
              </div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {currentStudent?.name || user?.name || 'Student'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  Student · {currentStudent?.gradeLevel || user?.gradeLevel || 'Grade 9'}
                </div>
              </div>
              <ChevronDown size={14} color="#94a3b8" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '240px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(0,0,0,0.02)',
                  padding: '8px',
                  zIndex: 100
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Authenticated Account
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>
                    {currentStudent?.name || user?.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {currentStudent?.email || user?.email}
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <span style={{
                      display: 'inline-block',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 7px'
                    }}>
                      Student · {currentStudent?.gradeLevel || user?.gradeLevel || 'Grade 9'}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                      onNavigate('landing');
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      fontSize: '13px',
                      color: '#dc2626',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} color="#dc2626" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // =========================================================================
  // 2. TEACHER TOP NAVIGATION (Teacher Workspace)
  // =========================================================================
  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        maxWidth: '1120px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand */}
        <MindTraceLogo
          variant="full"
          size="md"
          subtitle="TEACHER"
          onClick={() => onNavigate('teacher-dashboard')}
          clickable
        />

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            onClick={() => onNavigate('teacher-dashboard')}
            className={`btn btn-sm ${currentView === 'teacher-dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <LayoutDashboard size={14} />
            <span>Cohort Overview</span>
          </button>
          <button 
            onClick={() => onNavigate('teacher-profile')}
            className={`btn btn-sm ${currentView === 'teacher-profile' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Users size={14} />
            <span>Student Profiles</span>
          </button>
          <button 
            onClick={() => onNavigate('evaluation-console')}
            className={`btn btn-sm ${currentView === 'evaluation-console' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={14} color={currentView === 'evaluation-console' ? '#ffffff' : '#2563eb'} />
            <span>AI Eval Console</span>
          </button>
        </nav>

        {/* Teacher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NotificationBell />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700
            }}>
              {(currentTeacher?.name || user?.name || 'T')
                .split(' ')
                .filter(Boolean)
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                {currentTeacher?.name || user?.name || 'Educator'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Teacher · {currentTeacher?.department || user?.department || 'Mathematics'}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="btn btn-secondary btn-sm"
            title="Log Out"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}
          >
            <LogOut size={13} color="#dc2626" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
