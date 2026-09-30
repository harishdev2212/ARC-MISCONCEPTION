import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { MindTraceLogo } from './MindTraceLogo';
import { 
  LayoutDashboard, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Compass, 
  History, 
  HelpCircle, 
  Settings, 
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen,
  X,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface StudentSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}) => {
  const { currentStudent, user, logout } = useAuth();
  const { currentPath, navigate } = useRouter();

  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const studentName = currentStudent?.name || user?.name || 'Student';
  const gradeLevel = currentStudent?.gradeLevel || user?.gradeLevel || 'Grade 12';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'S';

  const handleNav = (path: string) => {
    navigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/home', icon: LayoutDashboard },
    { label: 'Learn', path: '/learn', icon: BookOpen },
    { label: 'Practice', path: '/practice', icon: Target, badge: 'AI' },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'My Insights', path: '/insights', icon: Sparkles, badge: 'Smart' }
  ];

  const learningLinks = [
    { label: 'Current Course', path: '/course', icon: Layers },
    { label: 'Topics', path: '/topics', icon: Compass },
    { label: 'Practice History', path: '/history', icon: History }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 90
          }}
        />
      )}

      <aside 
        style={{
          width: collapsed ? '76px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 95,
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          flexShrink: 0,
          boxShadow: '1px 0 3px rgba(15, 23, 42, 0.02)'
        }}
      >
        {/* Top: Logo & Collapse Button */}
        <div>
          <div style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div 
              onClick={() => handleNav('/home')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <MindTraceLogo
                variant={collapsed ? 'compact' : 'full'}
                size="md"
                subtitle="AI"
              />
            </div>

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            )}
          </div>

          {/* Core Navigation */}
          <div style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path || (item.path === '/practice' && currentPath.startsWith('/practice'));
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    title={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                      color: isActive ? '#1D4ED8' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isActive ? '0 1px 3px rgba(37, 99, 235, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.color = '#0F172A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#475569';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '7px',
                        backgroundColor: isActive ? '#DBEAFE' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isActive ? '#2563EB' : 'inherit'
                      }}>
                        <Icon size={18} />
                      </div>
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#2563EB' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#64748B'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Learning Section */}
            <div style={{ marginTop: '24px' }}>
              {!collapsed && (
                <div style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#94A3B8',
                  padding: '0 12px 8px'
                }}>
                  Learning
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {learningLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleNav(item.path)}
                      title={item.label}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        width: '100%',
                        padding: collapsed ? '9px 0' : '8px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                        color: isActive ? '#1D4ED8' : '#475569',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '13.5px',
                        border: 'none',
                        borderRadius: '9px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#475569';
                        }
                      }}
                    >
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isActive ? '#2563EB' : 'inherit'
                      }}>
                        <Icon size={17} />
                      </div>
                      {!collapsed && <span>{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Profile & Actions */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 14px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Help & Settings buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Help & Support"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '8px 0' : '7px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: 'transparent',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <HelpCircle size={16} />
              {!collapsed && <span>Help & Support</span>}
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              title="Settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '8px 0' : '7px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                backgroundColor: 'transparent',
                color: '#64748B',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748B';
              }}
            >
              <Settings size={16} />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>

          {/* User Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '6px 0' : '8px 10px',
            backgroundColor: '#F8FAFC',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {initials}
                </div>
                {/* Active status indicator dot */}
                <span style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '9px',
                  height: '9px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid #FFFFFF'
                }} />
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {studentName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {gradeLevel}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      {showHelpModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Help & Support</h3>
              <button onClick={() => setShowHelpModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
              MindTrace AI identifies learning misconceptions in real time. Submit your reasoning step-by-step during Practice to receive targeted cognitive guidance.
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setShowHelpModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '90%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Learner Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: '13.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span>Account Role</span>
                <strong>Student</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span>Grade Level</span>
                <strong>{gradeLevel}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span>Diagnostic Engine</span>
                <span className="badge badge-success">Online (Active)</span>
              </div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowSettingsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
