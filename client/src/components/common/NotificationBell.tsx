import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Sparkles, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Check, 
  CheckCheck, 
  Clock, 
  ArrowRight,
  Inbox,
  X
} from 'lucide-react';
import { AppNotification } from '@shared/types';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from '../../context/RouterContext';

interface NotificationBellProps {
  buttonStyle?: React.CSSProperties;
  align?: 'right' | 'left';
}

function formatTimeAgo(isoTimestamp: string): string {
  try {
    const diffMs = Date.now() - new Date(isoTimestamp).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoTimestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  buttonStyle,
  align = 'right' 
}) => {
  const { 
    notifications, 
    unreadCount, 
    isOpen, 
    setIsOpen, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.actionUrl) {
      const url = notif.actionUrl.startsWith('/') ? notif.actionUrl : `/${notif.actionUrl}`;
      if (notif.relatedStudentId && url.startsWith('/teacher/student')) {
        navigate(url, { studentId: notif.relatedStudentId });
      } else {
        navigate(url);
      }
    }
  };

  const getCategoryStyles = (category?: string, type?: string) => {
    if (category === 'important' || type?.includes('repeated') || type?.includes('struggling')) {
      return {
        bg: '#FEE2E2',
        color: '#DC2626',
        border: '1px solid #FECACA',
        icon: <AlertOctagon size={16} />
      };
    }
    if (category === 'attention' || type?.includes('alert') || type?.includes('weakness')) {
      return {
        bg: '#FEF3C7',
        color: '#D97706',
        border: '1px solid #FDE68A',
        icon: <AlertTriangle size={16} />
      };
    }
    if (category === 'success' || type?.includes('improved') || type?.includes('milestone')) {
      return {
        bg: '#ECFDF5',
        color: '#059669',
        border: '1px solid #A7F3D0',
        icon: <CheckCircle2 size={16} />
      };
    }
    if (category === 'progress' || type?.includes('mastery')) {
      return {
        bg: '#EFF6FF',
        color: '#2563EB',
        border: '1px solid #BFDBFE',
        icon: <TrendingUp size={16} />
      };
    }
    // Default AI / Misconception: Purple
    return {
      bg: '#F5F3FF',
      color: '#7C3AED',
      border: '1px solid #DDD6FE',
      icon: <BrainCircuit size={16} />
    };
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* 🔔 Notification Button */}
      <button
        type="button"
        aria-label={`Notifications (${unreadCount} unread)`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          border: isOpen ? '1px solid #2563EB' : '1px solid #E2E8F0',
          backgroundColor: isOpen ? '#EFF6FF' : '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#2563EB' : (unreadCount > 0 ? '#1E293B' : '#64748B'),
          cursor: 'pointer',
          boxShadow: isOpen 
            ? '0 0 0 3px rgba(37, 99, 235, 0.12)' 
            : '0 1px 3px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
          ...buttonStyle
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.borderColor = '#CBD5E1';
            e.currentTarget.style.color = '#0F172A';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = buttonStyle?.backgroundColor?.toString() || '#FFFFFF';
            e.currentTarget.style.borderColor = '#E2E8F0';
            e.currentTarget.style.color = unreadCount > 0 ? '#1E293B' : '#64748B';
          }
        }}
      >
        <Bell size={19} className={unreadCount > 0 ? 'bell-shake-subtle' : ''} />

        {/* Unread Badge Counter (Shown ONLY when unreadCount > 0) */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              borderRadius: '9999px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: '0 2px 5px rgba(37, 99, 235, 0.35), 0 0 0 2px #FFFFFF',
              animation: 'badgePop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 📬 Polished Dropdown Panel */}
      {isOpen && (
        <div
          role="region"
          aria-label="Notification panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            [align === 'right' ? 'right' : 'left']: 0,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(15, 23, 42, 0.04)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'dropdownFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px 14px',
              borderBottom: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Notifications
              </h2>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE'
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px',
                    borderRadius: '6px',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF6FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0F172A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Tabs (All / Unread) */}
          <div
            style={{
              display: 'flex',
              padding: '6px 14px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #F1F5F9',
              gap: '6px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'all' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'all' ? '#0F172A' : '#64748B',
                fontSize: '12px',
                fontWeight: activeTab === 'all' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: activeTab === 'all' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unread')}
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === 'unread' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'unread' ? '#2563EB' : '#64748B',
                fontSize: '12px',
                fontWeight: activeTab === 'unread' ? 700 : 500,
                cursor: 'pointer',
                boxShadow: activeTab === 'unread' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Scrollable List */}
          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              padding: '6px 0'
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  color: '#94A3B8'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: '#64748B'
                  }}
                >
                  <Inbox size={22} />
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', maxWidth: '240px', margin: '0 auto' }}>
                  {activeTab === 'unread' 
                    ? "You're all caught up with your cognitive insights." 
                    : 'Real-time diagnostic alerts and progress milestones will appear here.'}
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const styles = getCategoryStyles(notif.category, notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 18px',
                      cursor: 'pointer',
                      backgroundColor: notif.read ? 'transparent' : '#F8FAFF',
                      borderLeft: notif.read ? '3px solid transparent' : '3px solid #2563EB',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = notif.read ? '#F8FAFC' : '#F1F5FD';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = notif.read ? 'transparent' : '#F8FAFF';
                    }}
                  >
                    {/* Category Icon */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: styles.bg,
                        color: styles.color,
                        border: styles.border,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {styles.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          marginBottom: '3px'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: notif.read ? 600 : 700,
                            color: notif.read ? '#334155' : '#0F172A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {notif.title}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            color: '#94A3B8',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Clock size={10} />
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: '12px',
                          lineHeight: 1.45,
                          color: notif.read ? '#64748B' : '#334155',
                          margin: '0 0 6px 0',
                          wordBreak: 'break-word'
                        }}
                      >
                        {notif.message}
                      </p>

                      {/* Footer Info: Topic tag / Action hint */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {notif.relatedTopic && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#64748B',
                              backgroundColor: '#F1F5F9',
                              padding: '2px 7px',
                              borderRadius: '4px'
                            }}
                          >
                            {notif.relatedTopic}
                          </span>
                        )}
                        {notif.actionUrl && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#2563EB',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}
                          >
                            View details
                            <ArrowRight size={11} />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator dot & mark single read button */}
                    {!notif.read && (
                      <button
                        type="button"
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          alignSelf: 'center',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#2563EB';
                          e.currentTarget.style.backgroundColor = '#EFF6FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#94A3B8';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#2563EB'
                          }}
                        />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid #F1F5F9',
              backgroundColor: '#FAFAFA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#94A3B8'
            }}
          >
            <span>MindTrace AI Cognitive Signals</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748B', fontWeight: 500 }}>
              <Sparkles size={11} color="#7C3AED" />
              Live Diagnostics
            </span>
          </div>
        </div>
      )}

      {/* Global subtle CSS animation */}
      <style>{`
        @keyframes dropdownFadeIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes badgePop {
          0% {
            transform: scale(0.5);
          }
          70% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};
