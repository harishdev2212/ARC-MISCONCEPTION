import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { MindTraceLogo } from './MindTraceLogo';
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  LogOut, 
  PanelLeftClose, 
  PanelLeftOpen,
  X,
  Sparkles,
  School,
  ShieldCheck
} from 'lucide-react';

interface TeacherSidebarProps {
  activeTab?: 'dashboard' | 'students' | 'analytics' | 'misconceptions' | 'reports';
  onSelectTab?: (tab: 'dashboard' | 'students' | 'analytics' | 'misconceptions' | 'reports') => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  activeTab = 'dashboard',
  onSelectTab,
  collapsed = false,
  onToggleCollapse
}) => {
  const { currentTeacher, user, logout } = useAuth();
  const { currentPath, navigate } = useRouter();

  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const teacherName = currentTeacher?.name || user?.name || 'Dr. Evelyn Reed';
  const school = currentTeacher?.school || user?.school || 'MindTrace Learning Academy';
  const subject = currentTeacher?.assignedClasses?.[0] || user?.subject || 'Multi-Subject Diagnostics';

  const initials = teacherName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'T';

  const handleTabClick = (tab: 'dashboard' | 'students' | 'analytics' | 'misconceptions' | 'reports') => {
    if (currentPath !== '/teacher') {
      navigate('/teacher');
    }
    if (onSelectTab) {
      onSelectTab(tab);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems: { id: 'dashboard' | 'students' | 'analytics' | 'misconceptions' | 'reports'; label: string; icon: any; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'misconceptions', label: 'Misconceptions', icon: Sparkles, badge: 'Live' },
    { id: 'reports', label: 'Reports', icon: FileText }
  ];

  return (
    <>
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
        <div>
          {/* Top Logo & Collapse */}
          <div style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #F1F5F9'
          }}>
            <div 
              onClick={() => handleTabClick('dashboard')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <MindTraceLogo
                variant={collapsed ? 'compact' : 'full'}
                size="md"
                subtitle="FACULTY"
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

          {/* Navigation Items */}
          <div style={{ padding: collapsed ? '16px 8px' : '16px 12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTabClick(item.id)}
                    title={item.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      backgroundColor: isActive ? '#FAF5FF' : 'transparent',
                      color: isActive ? '#6D28D9' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '14px',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isActive ? '0 1px 3px rgba(124, 58, 237, 0.1)' : 'none'
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
                        backgroundColor: isActive ? '#EDE9FE' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        color: isActive ? '#7C3AED' : 'inherit'
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
                        backgroundColor: isActive ? '#7C3AED' : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : '#64748B'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Profile & Settings */}
        <div style={{
          padding: collapsed ? '16px 8px' : '16px 14px',
          borderTop: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Settings button */}
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

          {/* Teacher Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '6px 0' : '8px 10px',
            backgroundColor: '#FAF5FF',
            borderRadius: '12px',
            border: '1px solid #E9D5FF',
            marginTop: '4px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
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
                    {teacherName}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6D28D9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {school}
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Educator Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: '13.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span>Account Role</span>
                <strong>Teacher / Faculty</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span>Institution</span>
                <strong>{school}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <span>Domain Focus</span>
                <strong>{subject}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                <span>Cohort Diagnostic Sync</span>
                <span className="badge badge-purple">Real-time Connected</span>
              </div>
            </div>
            <button className="btn btn-purple" style={{ width: '100%' }} onClick={() => setShowSettingsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
