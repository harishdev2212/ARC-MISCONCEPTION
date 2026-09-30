import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MindTraceLogo } from '../components/common/MindTraceLogo';
import { Eye, EyeOff, AlertCircle, BookOpen, Code2, PenTool, Check, ArrowRight, ShieldCheck, GraduationCap, School } from 'lucide-react';

interface LandingLoginPageProps {
  onNavigate: (view: string) => void;
}

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({ onNavigate }) => {
  const { login, isAuthenticated, user, role } = useAuth();

  const [roleTab, setRoleTab] = useState<'student' | 'teacher'>('student');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filledFeedback, setFilledFeedback] = useState(false);

  // If already authenticated, redirect straight to dashboard
  React.useEffect(() => {
    if (isAuthenticated && user && role) {
      if (role === 'teacher') {
        onNavigate('teacher-dashboard');
      } else {
        onNavigate('student-dashboard');
      }
    }
  }, [isAuthenticated, user, role, onNavigate]);

  const handleRoleChange = (selectedRole: 'student' | 'teacher') => {
    setRoleTab(selectedRole);
    setErrorMessage(null);
  };

  const handleFillDemo = (type: 'student' | 'teacher') => {
    setRoleTab(type);
    if (type === 'student') {
      setEmailOrUsername('student@mindtrace.ai');
      setPassword('student123');
    } else {
      setEmailOrUsername('teacher@mindtrace.ai');
      setPassword('teacher123');
    }
    setErrorMessage(null);
    setFilledFeedback(true);
    setTimeout(() => setFilledFeedback(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedInput = emailOrUsername.trim();
    if (!trimmedInput) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const authenticatedUser = await login({
        email: trimmedInput,
        password,
        role: roleTab
      });

      if (authenticatedUser.role === 'student') {
        onNavigate('student-dashboard');
      } else {
        onNavigate('teacher-dashboard');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'Google') => {
    setErrorMessage(`Single Sign-On with ${provider} is managed by registered school district accounts. Please sign in with your demo credentials or create an account.`);
  };

  const isTeacher = roleTab === 'teacher';
  const brandColor = isTeacher ? '#7C3AED' : '#2563EB';
  const brandGradient = isTeacher 
    ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' 
    : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
  const brandShadow = isTeacher 
    ? '0 4px 14px rgba(124, 58, 237, 0.28)' 
    : '0 4px 14px rgba(37, 99, 235, 0.28)';

  return (
    <div 
      className="login-page-container ambient-background"
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}
    >
      {/* ============================================================== */}
      {/* LEFT SIDE: Premium Educational AI Showcase                     */}
      {/* ============================================================== */}
      <div 
        className="login-left-panel"
        style={{
          flex: '1 1 54%',
          backgroundColor: '#FAFBFC',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 56px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Ambient geometric grid */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
            opacity: 0.45,
            pointerEvents: 'none'
          }} 
        />

        {/* Top: Brand Logo + Badge */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MindTraceLogo
            variant="full"
            size="lg"
            subtitle="COGNITIVE AI"
          />
        </div>

        {/* Center: Educational Statement & Stylized Learning Environment */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '560px', width: '100%', margin: '40px 0 20px' }}>
          {/* Main Headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 4vw, 50px)',
            fontWeight: 800,
            lineHeight: 1.12,
            letterSpacing: '-0.035em',
            color: '#0F172A',
            marginBottom: '16px'
          }}>
            Learn Smarter.<br />
            <span style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Think Deeper.
            </span><br />
            Grow Further.
          </h1>

          {/* Supporting Text */}
          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#475569',
            marginBottom: '32px',
            maxWidth: '480px'
          }}>
            MindTrace doesn't merely grade answers. It analyzes your cognitive reasoning, identifies misconceptions in real time, and helps you master Mathematics, Programming, and English.
          </p>

          {/* Stylized Digital Learning Environment */}
          <div 
            style={{
              position: 'relative',
              borderRadius: '20px',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
              border: '1px solid #E2E8F0',
              padding: '28px 24px',
              boxShadow: '0 10px 30px -8px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04)',
              overflow: 'hidden'
            }}
          >
            {/* Subtle neural network lines in background */}
            <svg 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}
              viewBox="0 0 400 240"
            >
              <line x1="50" y1="50" x2="200" y2="120" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="200" y1="120" x2="350" y2="60" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="200" y1="120" x2="220" y2="200" stroke="#0D9488" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="50" y1="180" x2="200" y2="120" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Orbiting Subject Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 1 }}>
              
              {/* Mathematics Node */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DBEAFE',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Mathematics</span>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', fontFamily: 'monospace' }}>2x + 5 = 17 ➔ Bilateral Balance</span>
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize: '11px' }}>Cognitive Check</span>
              </div>

              {/* Programming Node */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E9D5FF',
                  boxShadow: '0 2px 6px rgba(124, 58, 237, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#FAF5FF',
                    color: '#7C3AED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Code2 size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>Programming</span>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block', fontFamily: 'monospace' }}>for(int i = 0; i &lt; 5; i++) ➔ Loop Boundary</span>
                  </div>
                </div>
                <span className="badge badge-purple" style={{ fontSize: '11px' }}>Code Analysis</span>
              </div>

              {/* English Node */}
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #CCFBF1',
                  boxShadow: '0 2px 6px rgba(13, 148, 136, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#F0FDFA',
                    color: '#0D9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <PenTool size={16} />
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>English</span>
                    <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>Subject-Verb Agreement ➔ Inflection Rules</span>
                  </div>
                </div>
                <span className="badge" style={{ backgroundColor: '#F0FDFA', color: '#0D9488', border: '1px solid #99F6E4', fontSize: '11px' }}>Grammar Trace</span>
              </div>

            </div>

            {/* Bottom Insight Pulse */}
            <div style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748B'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                Real-time Misconception Diagnostic Engine
              </span>
              <span style={{ fontWeight: 600, color: '#2563EB' }}>Multi-Subject Enabled</span>
            </div>
          </div>
        </div>

        {/* Bottom: Academic Trust Badges */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          fontSize: '13px',
          fontWeight: 600,
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={16} color="#2563EB" /> Socratic AI Tutor
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <GraduationCap size={16} color="#7C3AED" /> Evidence-Based Insights
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <School size={16} color="#0D9488" /> Educator Analytics
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT SIDE: Authentication Card Area                           */}
      {/* ============================================================== */}
      <div 
        className="login-right-panel"
        style={{
          flex: '1 1 46%',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '48px 32px',
          position: 'relative'
        }}
      >
        <div 
          className="login-auth-card card"
          style={{ 
            maxWidth: '460px', 
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '38px 36px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
            border: isTeacher ? '1px solid #E9D5FF' : '1px solid #E2E8F0',
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
          }}
        >
          {/* Heading */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '30px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0F172A',
              margin: '0 0 6px 0',
              lineHeight: 1.2
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '14.5px',
              color: '#64748B',
              margin: 0
            }}>
              {isTeacher ? 'Sign in to monitor cohort analytics and student diagnostics.' : 'Sign in to continue your interactive cognitive practice.'}
            </p>
          </div>

          {/* ROLE SWITCH: Student vs Teacher Tabs */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: !isTeacher ? 700 : 500,
                color: !isTeacher ? '#FFFFFF' : '#64748B',
                backgroundColor: !isTeacher ? '#2563EB' : 'transparent',
                boxShadow: !isTeacher ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <GraduationCap size={16} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderRadius: '9px',
                fontSize: '14px',
                fontWeight: isTeacher ? 700 : 500,
                color: isTeacher ? '#FFFFFF' : '#64748B',
                backgroundColor: isTeacher ? '#7C3AED' : 'transparent',
                boxShadow: isTeacher ? '0 2px 6px rgba(124, 58, 237, 0.25)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <School size={16} />
              <span>Teacher</span>
            </button>
          </div>

          {/* 1-Click Demo Credentials Quick-Fill Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: isTeacher ? '#FAF5FF' : '#EFF6FF',
            border: isTeacher ? '1px solid #E9D5FF' : '1px solid #DBEAFE',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12.5px',
            color: isTeacher ? '#5B21B6' : '#1E40AF',
            transition: 'all 0.2s ease'
          }}>
            <div>
              <span style={{ fontWeight: 700 }}>Quick Demo:</span>{' '}
              <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {isTeacher ? 'teacher@mindtrace.ai' : 'student@mindtrace.ai'}
              </code>
            </div>
            <button
              type="button"
              onClick={() => handleFillDemo(roleTab)}
              style={{
                backgroundColor: isTeacher ? '#7C3AED' : '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'transform 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {filledFeedback ? <Check size={12} /> : null}
              {filledFeedback ? 'Filled!' : 'Auto-Fill'}
            </button>
          </div>

          {/* Inline Error Alert */}
          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#B91C1C',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: 1.45
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email / Username Field */}
            <div>
              <label 
                htmlFor="emailOrUsername" 
                style={{
                  display: 'block',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: '6px'
                }}
              >
                Email or Username
              </label>
              <input
                id="emailOrUsername"
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="student@mindtrace.ai"
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14.5px',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '10px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = brandColor;
                  e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Field with Visibility Toggle */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label 
                  htmlFor="password" 
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0F172A',
                    margin: 0
                  }}
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Password reset link has been dispatched to your email address.');
                  }}
                  style={{
                    fontSize: '13px',
                    color: brandColor,
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Forgot password?
                </a>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    fontSize: '14.5px',
                    color: '#0F172A',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandColor;
                    e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: brandColor,
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              />
              <label 
                htmlFor="rememberMe" 
                style={{
                  fontSize: '13.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                Remember me on this device
              </label>
            </div>

            {/* Primary Log In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px 20px',
                fontSize: '15px',
                fontWeight: 700,
                color: '#FFFFFF',
                background: brandGradient,
                border: 'none',
                borderRadius: '10px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: brandShadow,
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                  e.currentTarget.style.boxShadow = isTeacher 
                    ? '0 6px 18px rgba(124, 58, 237, 0.38)' 
                    : '0 6px 18px rgba(37, 99, 235, 0.38)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = brandShadow;
                }
              }}
            >
              {isSubmitting ? (
                <span>Signing in to MindTrace...</span>
              ) : (
                <>
                  <span>Sign in as {isTeacher ? 'Teacher' : 'Student'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '22px 0',
            gap: '12px'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          </div>

          {/* Google SSO button */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#1E293B',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'background-color 0.15s, border-color 0.15s, transform 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#94A3B8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Bottom Sign Up Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#64748B'
          }}>
            Don't have an account yet?{' '}
            <button 
              type="button" 
              onClick={() => onNavigate('register')}
              style={{
                color: brandColor,
                fontWeight: 700,
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '14px',
                padding: 0
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>

      {/* Responsive Stacking CSS */}
      <style>{`
        @media (max-width: 960px) {
          .login-page-container {
            flex-direction: column !important;
          }
          .login-left-panel {
            flex: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid #E2E8F0 !important;
            padding: 36px 24px !important;
          }
          .login-right-panel {
            flex: none !important;
            width: 100% !important;
            padding: 36px 20px !important;
          }
          .login-auth-card {
            padding: 30px 22px !important;
          }
        }
      `}</style>
    </div>
  );
};
