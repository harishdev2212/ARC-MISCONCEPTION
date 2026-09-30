import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MindTraceLogo } from '../components/common/MindTraceLogo';
import { Eye, EyeOff, AlertCircle, GraduationCap, School, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserRole } from '@shared/types';

interface RegisterPageProps {
  onNavigate: (view: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();

  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 9');
  const [subject, setSubject] = useState('Mathematics & Cognitive Science');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Full name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (role === 'student' && !gradeLevel.trim()) {
      errs.gradeLevel = 'Please specify your grade / class.';
    }

    if (role === 'teacher' && !subject.trim()) {
      errs.subject = 'Please specify your subject / department.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        gradeLevel: role === 'student' ? gradeLevel.trim() : undefined,
        subject: role === 'teacher' ? subject.trim() : undefined,
        department: role === 'teacher' ? subject.trim() : undefined
      });

      if (role === 'student') {
        onNavigate('student-dashboard');
      } else {
        onNavigate('teacher-dashboard');
      }
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTeacher = role === 'teacher';
  const brandColor = isTeacher ? '#7C3AED' : '#2563EB';
  const brandGradient = isTeacher 
    ? 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' 
    : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
  const brandShadow = isTeacher 
    ? '0 4px 14px rgba(124, 58, 237, 0.28)' 
    : '0 4px 14px rgba(37, 99, 235, 0.28)';

  return (
    <div 
      className="register-page-container ambient-background"
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
      {/* LEFT PANEL: Educational AI Platform Overview                   */}
      {/* ============================================================== */}
      <div 
        className="register-left-panel"
        style={{
          flex: '1 1 50%',
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
        {/* Subtle grid texture */}
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

        {/* Top-Left Logo */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MindTraceLogo
            variant="full"
            size="lg"
            subtitle="COGNITIVE AI"
          />
        </div>

        {/* Center Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', width: '100%', margin: '40px 0 20px' }}>
          <h1 style={{
            fontSize: 'clamp(36px, 3.8vw, 48px)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.035em',
            color: '#0F172A',
            marginBottom: '16px'
          }}>
            Real Understanding.<br />
            <span style={{
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Personalized Growth.
            </span>
          </h1>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: '#475569',
            marginBottom: '32px',
            maxWidth: '460px'
          }}>
            Create an account to experience true cognitive diagnosis: discover not just whether an answer was right, but exactly where your reasoning went off track.
          </p>

          {/* Pillars List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155' }}>
                Multi-subject practice in Mathematics, Programming, and English
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155' }}>
                Instant cognitive misconception detection powered by Google Gemini
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F0FDFA', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
              <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#334155' }}>
                Transparent teacher reports and data-grounded progress insights
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Indicators */}
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
            <ShieldCheck size={16} color="#2563EB" /> Secure Bcrypt Auth
          </span>
          <span>•</span>
          <span>Adaptive Question Library</span>
          <span>•</span>
          <span>Zero Mock Data</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: Clean Elevated Registration Card                  */}
      {/* ============================================================== */}
      <div 
        className="register-right-panel"
        style={{
          flex: '1 1 50%',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 32px',
          overflowY: 'auto'
        }}
      >
        <div 
          className="register-auth-card card"
          style={{ 
            maxWidth: '460px', 
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '38px 36px',
            boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.06), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
            border: isTeacher ? '1px solid #E9D5FF' : '1px solid #E2E8F0',
            transition: 'border-color 0.3s ease'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '22px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: '#0F172A',
              marginBottom: '6px'
            }}>
              Create your account
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#64748B',
              margin: 0
            }}>
              Join MindTrace AI with your real profile to start learning.
            </p>
          </div>

          {/* Role Selection Segmented Control */}
          <div style={{
            display: 'flex',
            backgroundColor: '#F1F5F9',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '20px'
          }}>
            <button
              type="button"
              onClick={() => { setRole('student'); setErrors({}); setServerError(null); }}
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '13.5px',
                fontWeight: !isTeacher ? 700 : 500,
                color: !isTeacher ? '#FFFFFF' : '#64748B',
                backgroundColor: !isTeacher ? '#2563EB' : 'transparent',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: !isTeacher ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <GraduationCap size={15} />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('teacher'); setErrors({}); setServerError(null); }}
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '13.5px',
                fontWeight: isTeacher ? 700 : 500,
                color: isTeacher ? '#FFFFFF' : '#64748B',
                backgroundColor: isTeacher ? '#7C3AED' : 'transparent',
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: isTeacher ? '0 2px 6px rgba(124, 58, 237, 0.25)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <School size={15} />
              <span>Teacher / Educator</span>
            </button>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              padding: '10px 14px',
              color: '#DC2626',
              fontSize: '13px',
              marginBottom: '18px',
              lineHeight: 1.45
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: '' })); }}
                placeholder={role === 'student' ? 'e.g. John Mathew' : 'e.g. Dr. Jane Smith'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.name ? '#EF4444' : '#CBD5E1'}`,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = brandColor;
                  e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name ? '#EF4444' : '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.name && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.name}</div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
                placeholder={role === 'student' ? 'john.mathew@school.edu' : 'jane.smith@school.edu'}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.email ? '#EF4444' : '#CBD5E1'}`,
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = brandColor;
                  e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#EF4444' : '#CBD5E1';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.email && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.email}</div>
              )}
            </div>

            {/* Role Specific Field */}
            {role === 'student' ? (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Grade / Class
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                >
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                  Subject / Department
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => { setSubject(e.target.value); if (errors.subject) setErrors(prev => ({ ...prev, subject: '' })); }}
                  placeholder="e.g. Mathematics & Cognitive Science"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${errors.subject ? '#EF4444' : '#CBD5E1'}`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandColor;
                    e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.subject ? '#EF4444' : '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {errors.subject && (
                  <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.subject}</div>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Password <span style={{ fontSize: '11px', fontWeight: 400, color: '#94A3B8' }}>(min. 6 characters)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                  placeholder="Create a secure password"
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 14px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${errors.password ? '#EF4444' : '#CBD5E1'}`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandColor;
                    e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? '#EF4444' : '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.password}</div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                  placeholder="Re-enter your password"
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 14px',
                    fontSize: '14px',
                    borderRadius: '10px',
                    border: `1px solid ${errors.confirmPassword ? '#EF4444' : '#CBD5E1'}`,
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandColor;
                    e.target.style.boxShadow = `0 0 0 3px ${isTeacher ? 'rgba(124, 58, 237, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.confirmPassword ? '#EF4444' : '#CBD5E1';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.confirmPassword}</div>
              )}
            </div>

            {/* Submit Button */}
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
                marginTop: '8px',
                boxShadow: brandShadow,
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1.5px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {isSubmitting ? (
                <span>Creating your account...</span>
              ) : (
                <>
                  <span>Register as {isTeacher ? 'Teacher' : 'Student'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Login Link */}
          <div style={{
            marginTop: '22px',
            textAlign: 'center',
            fontSize: '13.5px',
            color: '#64748B'
          }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: brandColor,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Log In
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
