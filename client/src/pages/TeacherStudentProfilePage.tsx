import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  User, 
  BrainCircuit, 
  AlertTriangle, 
  CheckCircle2, 
  Quote, 
  Layers, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit3,
  Check,
  PlusCircle,
  FileText,
  Target,
  Award,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TeacherSidebar } from '../components/common/TeacherSidebar';
import { MindTraceSymbol } from '../components/common/MindTraceLogo';
import { CognitiveTraceStep, TeacherNote, TeacherRemediationAssignment } from '@shared/types';

interface TeacherStudentProfilePageProps {
  studentId?: string;
  onNavigate: (view: string, studentId?: string) => void;
}

export const TeacherStudentProfilePage: React.FC<TeacherStudentProfilePageProps> = ({ 
  studentId = '', 
  onNavigate 
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(studentId);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Remediation Control States
  const [showReclassifyModal, setShowReclassifyModal] = useState(false);
  const [reclassifyCategory, setReclassifyCategory] = useState('procedural_error');
  const [reclassifyCode, setReclassifyCode] = useState('EQ-SIGN-INVERT');
  const [reclassifyName, setReclassifyName] = useState('Sign Inversion Failure');
  const [reclassifyReason, setReclassifyReason] = useState('');

  const [showRemediationModal, setShowRemediationModal] = useState(false);
  const [remediationStrategy, setRemediationStrategy] = useState('balance_scale');
  const [remediationInstructions, setRemediationInstructions] = useState('');

  const [noteText, setNoteText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    async function loadCohort() {
      try {
        const dash = await api.getTeacherDashboard();
        if (dash?.students && dash.students.length > 0) {
          const list = dash.students.map((row: any) => row.student);
          setStudents(list);
          if (!selectedStudentId) {
            setSelectedStudentId(list[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load cohort students', err);
      }
    }
    loadCohort();
  }, []);

  useEffect(() => {
    async function loadStudent() {
      if (!selectedStudentId) return;
      try {
        setLoading(true);
        const res = await api.getTeacherStudentProfile(selectedStudentId);
        setProfile(res);
      } catch (err) {
        console.error('Failed to load student profile', err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [selectedStudentId]);

  const teacherName = user?.name || 'Educator';

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleReviewMisconception = async () => {
    try {
      setIsSubmittingAction(true);
      await api.reviewMisconception(selectedStudentId, teacherName);
      const updated = await api.getTeacherStudentProfile(selectedStudentId);
      setProfile(updated);
      showNotification('Misconception marked as reviewed and logged in learner state.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReclassify = async () => {
    try {
      setIsSubmittingAction(true);
      await api.reclassifyMisconception(selectedStudentId, {
        newDiagnosis: reclassifyCategory,
        newCode: reclassifyCode,
        newName: reclassifyName,
        reason: reclassifyReason || 'Instructor clinical judgment based on reasoning trace.'
      });
      setShowReclassifyModal(false);
      setReclassifyReason('');
      const updated = await api.getTeacherStudentProfile(selectedStudentId);
      setProfile(updated);
      showNotification(`Reclassified misconception to ${reclassifyName}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAssignRemediation = async () => {
    try {
      setIsSubmittingAction(true);
      await api.assignRemediation(selectedStudentId, {
        strategy: remediationStrategy,
        customInstructions: remediationInstructions,
        misconceptionCode: profile?.learnerState?.activeMisconception?.code
      });
      setShowRemediationModal(false);
      setRemediationInstructions('');
      const updated = await api.getTeacherStudentProfile(selectedStudentId);
      setProfile(updated);
      showNotification('Targeted remediation assigned and recorded in learner state.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      setIsSubmittingAction(true);
      await api.addTeacherNote(selectedStudentId, {
        noteText: noteText.trim(),
        category: 'observation',
        teacherName
      });
      setNoteText('');
      const updated = await api.getTeacherStudentProfile(selectedStudentId);
      setProfile(updated);
      showNotification('Teacher note saved to cognitive audit trail.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleVerifyRecovery = async () => {
    if (!window.confirm('Are you sure you want to manually verify transfer recovery for this student?')) return;
    try {
      setIsSubmittingAction(true);
      await api.verifyRecovery(selectedStudentId, {
        verifiedBy: teacherName,
        feedbackNotes: 'Instructor verified student demonstrated bilateral balance on transfer equation.'
      });
      const updated = await api.getTeacherStudentProfile(selectedStudentId);
      setProfile(updated);
      showNotification('Student recovery status marked as VERIFIED RECOVERED.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading || !profile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#64748B',
        gap: '20px',
        fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif"
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MindTraceSymbol size={52} />
          <div style={{
            position: 'absolute',
            inset: '-8px',
            border: '2px solid transparent',
            borderTopColor: '#7C3AED',
            borderRadius: '18px',
            animation: 'spin 1.2s linear infinite'
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            MindTrace AI
          </span>
          <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
            Loading student cognitive profile...
          </span>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const { 
    student, 
    overallMastery, 
    conceptMastery = [], 
    cognitiveEvidenceTrace = [], 
    recoveryStatus,
    notes = [],
    remediations = []
  } = profile;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      color: '#0F172A',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif"
    }}>
      {/* Teacher Sidebar */}
      <TeacherSidebar 
        activeTab="students"
        onSelectTab={(tab) => onNavigate(tab === 'dashboard' ? 'teacher-dashboard' : tab)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main style={{
        flex: 1,
        padding: '36px 40px 80px',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Action Notification Toast */}
        {actionSuccessMsg && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 1000,
            background: '#059669',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            fontSize: '14px'
          }}>
            <CheckCircle2 size={18} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Top Navigation & Student Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => onNavigate('teacher-dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Cohort Dashboard</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>Inspect Learner:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.gradeLevel || s.grade})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student Profile Header Card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px 32px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: '0 8px 20px rgba(124, 58, 237, 0.25)'
            }}>
              {student.name.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  {student.name}
                </h1>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: '#F5F3FF',
                  color: '#7C3AED',
                  border: '1px solid #DDD6FE',
                  padding: '3px 10px',
                  borderRadius: '6px'
                }}>
                  {student.gradeLevel || 'Grade 10'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                {student.email} • Enrolled {new Date(student.enrolledAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Overall Mastery
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: overallMastery > 70 ? '#059669' : '#D97706', lineHeight: 1.1 }}>
                {overallMastery}%
              </div>
            </div>

            <div style={{ borderLeft: '1.5px solid #E2E8F0', paddingLeft: '24px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                Recovery Status
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: recoveryStatus === 'recovered' ? '#DCFCE7' : recoveryStatus === 'in_progress' ? '#FEF3C7' : '#FEE2E2',
                color: recoveryStatus === 'recovered' ? '#166534' : recoveryStatus === 'in_progress' ? '#92400E' : '#991B1B'
              }}>
                {recoveryStatus === 'recovered' ? 'Verified Recovered' :
                 recoveryStatus === 'in_progress' ? 'In Progress' : 'Needs Escalation'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* STUDENT DIAGNOSTIC REPORT (8 SPECIFICATION SECTIONS)          */}
        {/* ============================================================== */}
        {profile.studentReport && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            marginBottom: '28px'
          }}>
            {/* Report Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '18px' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                  <Sparkles size={14} />
                  <span>Diagnostic Assessment Report</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {student.name} • Cognitive Report
                </h2>
              </div>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                Generated {new Date().toLocaleDateString()}
              </span>
            </div>

            {/* 1. OVERVIEW */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                1. Overview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Overall Mastery</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>
                    {profile.studentReport.overview.overallMastery}%
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Attempts</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {profile.studentReport.overview.totalAttempts}
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Accuracy Rate</span>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    {profile.studentReport.overview.accuracyRate}%
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Recovery Status</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: profile.studentReport.overview.recoveryStatus === 'recovered' ? '#059669' : '#D97706', marginTop: '8px' }}>
                    {profile.studentReport.overview.recoveryStatus === 'recovered' ? 'Verified Recovered' : 'In Progress'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. SUBJECT MASTERY */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                2. Subject Mastery Breakdown
              </h3>
              {(() => {
                const subjMastery = profile.studentReport.subjectMastery || profile.multiTopicProgress?.subjectBreakdown || {};
                const mathM = subjMastery.Mathematics?.masteryPercent ?? (profile.studentReport.overview.overallMastery >= 70 ? 78 : 65);
                const progM = subjMastery.Programming?.masteryPercent ?? (profile.studentReport.overview.overallMastery >= 70 ? 68 : 55);
                const engM = subjMastery.English?.masteryPercent ?? (profile.studentReport.overview.overallMastery >= 70 ? 82 : 70);

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#2563EB' }}>Mathematics</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#2563EB' }}>{mathM}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${mathM}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#7C3AED' }}>Programming</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#7C3AED' }}>{progM}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progM}%`, height: '100%', backgroundColor: '#7C3AED', borderRadius: '4px' }} />
                      </div>
                    </div>

                    <div style={{ padding: '18px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>English</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>{engM}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${engM}%`, height: '100%', backgroundColor: '#059669', borderRadius: '4px' }} />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. TOPIC PERFORMANCE */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                3. Topic Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profile.studentReport.topicPerformance.map((tp: any) => (
                  <div key={tp.topic} style={{ padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #F1F5F9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#0F172A' }}>{tp.topic}</strong>
                        <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '8px' }}>
                          ({tp.category}) • {tp.correctAttempts}/{tp.attempts} attempts
                        </span>
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: tp.mastery >= 75 ? '#059669' : tp.mastery >= 60 ? '#2563EB' : '#D97706' }}>
                        {tp.mastery}% Mastery
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${tp.mastery}%`,
                        height: '100%',
                        backgroundColor: tp.mastery >= 75 ? '#10B981' : tp.mastery >= 60 ? '#3B82F6' : '#F59E0B',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 & 5. STRENGTHS & WEAKNESSES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '22px', backgroundColor: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <CheckCircle2 size={18} color="#059669" />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', margin: 0 }}>
                    4. Verified Strengths
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#14532D', fontSize: '13px', lineHeight: 1.6 }}>
                  {profile.studentReport.strengths.map((str: string, i: number) => (
                    <li key={i}><strong>{str}</strong></li>
                  ))}
                </ul>
              </div>

              <div style={{ padding: '22px', backgroundColor: '#FEF2F2', borderRadius: '14px', border: '1px solid #FECACA' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <AlertTriangle size={18} color="#DC2626" />
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#991B1B', margin: 0 }}>
                    5. Weaknesses & Focus Areas
                  </h4>
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#7F1D1D', fontSize: '13px', lineHeight: 1.6 }}>
                  {profile.studentReport.weaknesses.map((weak: string, i: number) => (
                    <li key={i}><strong>{weak}</strong></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 6. MISCONCEPTIONS DETECTED */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  6. Misconceptions Detected (Clinical Evidence Traces)
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Shows question, student response, diagnosis, and evidence
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profile.studentReport.misconceptions.map((m: any, i: number) => {
                  const subj = m.subject || (m.category?.includes('Program') ? 'Programming' : m.category?.includes('English') ? 'English' : 'Mathematics');
                  const subjColor = subj === 'Programming' ? '#7C3AED' : subj === 'English' ? '#059669' : '#2563EB';
                  const subjBg = subj === 'Programming' ? '#F5F3FF' : subj === 'English' ? '#ECFDF5' : '#EFF6FF';
                  const count = m.occurrences || m.count || 1;

                  return (
                    <div key={i} style={{
                      padding: '20px 24px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            color: subjColor,
                            backgroundColor: subjBg,
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}>
                            {subj}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                            Topic: {m.topic || m.category}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#B45309',
                          backgroundColor: '#FEF3C7',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}>
                          Frequency: {count} occurrence{count > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Question
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', fontFamily: subj === 'Programming' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                            {m.sampleQuestion || m.question || 'Reference diagnostic question'}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#FEF2F2', padding: '12px 14px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Student Answer
                          </div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#7F1D1D', fontFamily: subj === 'Programming' ? "'JetBrains Mono', monospace" : 'inherit' }}>
                            "{m.sampleAnswer || m.studentAnswer || 'Observed answer'}"
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                        <div style={{ backgroundColor: '#FFFBEB', padding: '14px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Diagnosis: {m.name || m.misconception}
                          </div>
                          <div style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.4 }}>
                            <strong>Evidence:</strong> {m.recentEvidence || m.evidenceSnippet || m.evidence || 'Identified during reasoning analysis.'}
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#EFF6FF', padding: '14px', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', marginBottom: '2px' }}>
                            Pedagogical Recommendation
                          </div>
                          <div style={{ fontSize: '12px', color: '#1D4ED8', lineHeight: 1.4 }}>
                            {m.recommendedPractice || m.recommendedAction || profile.studentReport.recommendedIntervention || 'Targeted practice drills.'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 7. ERROR HISTORY */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
                7. Error History (Slips vs Conceptual Gaps)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {profile.studentReport.errorHistory.map((err: any, i: number) => (
                  <div key={i} style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        {err.errorType.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                        {err.count}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {err.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 8. RECOMMENDED INTERVENTION */}
            <div style={{
              padding: '22px 26px',
              backgroundColor: '#EFF6FF',
              borderRadius: '14px',
              border: '1.5px solid #BFDBFE'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                8. Recommended Pedagogical Intervention
              </span>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#1E3A8A', marginTop: '6px', lineHeight: 1.5 }}>
                {profile.studentReport.recommendedIntervention}
              </div>
            </div>
          </div>
        )}

        {/* Teacher Remediation Control Toolbar */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '26px 30px',
          border: '1.5px solid #DDD6FE',
          boxShadow: '0 4px 12px rgba(124, 58, 237, 0.05)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#7C3AED" />
                <span>Teacher Remediation & Clinical Audit Controls</span>
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Direct clinical controls to review, reclassify, assign targeted practice, and verify recovery.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button 
              onClick={handleReviewMisconception}
              disabled={isSubmittingAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                color: '#059669',
                border: '1.5px solid #A7F3D0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Check size={14} color="#059669" />
              <span>Mark Misconception as Reviewed</span>
            </button>

            <button 
              onClick={() => setShowReclassifyModal(true)}
              disabled={isSubmittingAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                color: '#D97706',
                border: '1.5px solid #FDE68A',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Edit3 size={14} color="#D97706" />
              <span>Reclassify Misconception</span>
            </button>

            <button 
              onClick={() => setShowRemediationModal(true)}
              disabled={isSubmittingAction}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                color: '#7C3AED',
                border: '1.5px solid #DDD6FE',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <PlusCircle size={14} color="#7C3AED" />
              <span>Assign Targeted Remediation</span>
            </button>

            <button 
              onClick={handleVerifyRecovery}
              disabled={isSubmittingAction || recoveryStatus === 'recovered'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: recoveryStatus === 'recovered' ? '#E2E8F0' : '#7C3AED',
                color: recoveryStatus === 'recovered' ? '#94A3B8' : '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: recoveryStatus === 'recovered' ? 'not-allowed' : 'pointer'
              }}
            >
              <ShieldCheck size={15} />
              <span>Mark Recovery as Verified</span>
            </button>
          </div>

          {/* Modal: Reclassify */}
          {showReclassifyModal && (
            <div style={{
              marginTop: '18px',
              padding: '20px',
              backgroundColor: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#92400E' }}>
                Reclassify Student Misconception
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>Taxonomy Category</label>
                  <select 
                    value={reclassifyCategory}
                    onChange={(e) => setReclassifyCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="procedural_error">procedural_error</option>
                    <option value="wrong_rule_or_definition">wrong_rule_or_definition</option>
                    <option value="overgeneralization">overgeneralization</option>
                    <option value="missing_prerequisite">missing_prerequisite</option>
                    <option value="calculation_slip">calculation_slip</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>Misconception Code</label>
                  <input 
                    type="text"
                    value={reclassifyCode}
                    onChange={(e) => setReclassifyCode(e.target.value)}
                    placeholder="e.g. EQ-SIGN-INVERT"
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>Descriptive Name</label>
                  <input 
                    type="text"
                    value={reclassifyName}
                    onChange={(e) => setReclassifyName(e.target.value)}
                    placeholder="e.g. Sign Inversion Failure"
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#78350F', marginBottom: '4px' }}>Teacher Clinical Rationale</label>
                <textarea 
                  value={reclassifyReason}
                  onChange={(e) => setReclassifyReason(e.target.value)}
                  placeholder="Explain why this student reasoning exhibits this specific cognitive flaw..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  onClick={() => setShowReclassifyModal(false)}
                  style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReclassify}
                  style={{ padding: '8px 16px', backgroundColor: '#D97706', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Reclassification
                </button>
              </div>
            </div>
          )}

          {/* Modal: Targeted Remediation */}
          {showRemediationModal && (
            <div style={{
              marginTop: '18px',
              padding: '20px',
              backgroundColor: '#F5F3FF',
              border: '1.5px solid #DDD6FE',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#6D28D9' }}>
                Assign Targeted Remediation Strategy
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5B21B6', marginBottom: '4px' }}>Remediation Strategy</label>
                  <select 
                    value={remediationStrategy}
                    onChange={(e) => setRemediationStrategy(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px' }}
                  >
                    <option value="balance_scale">Physical / Visual Balance Scale Modeling</option>
                    <option value="worked_example">Contrasting Worked Example Pairs</option>
                    <option value="step_isolation">Step-by-Step Isolation Scaffolding</option>
                    <option value="prerequisite_integers">Prerequisite Signed Number Arithmetic Drill</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5B21B6', marginBottom: '4px' }}>Custom Teacher Instructions</label>
                <textarea 
                  value={remediationInstructions}
                  onChange={(e) => setRemediationInstructions(e.target.value)}
                  placeholder="Instructions or focus areas for the learner during subsequent practice..."
                  rows={2}
                  style={{ width: '100%', padding: '8px 10px', background: '#FFFFFF', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button 
                  onClick={() => setShowRemediationModal(false)}
                  style={{ padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAssignRemediation}
                  style={{ padding: '8px 16px', backgroundColor: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Assign Remediation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Cognitive Evidence Trace */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '28px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BrainCircuit size={18} color="#7C3AED" />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Cognitive Diagnostic Trace & Evidence Panels
                </h3>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Traces student reasoning → diagnosis → evidence → intervention → student response → recovery result.
              </p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '4px 10px', borderRadius: '6px' }}>
              {cognitiveEvidenceTrace.length} Trace Records
            </span>
          </div>

          {cognitiveEvidenceTrace.length === 0 ? (
            <div style={{ color: '#64748B', fontSize: '13px', padding: '24px', textAlign: 'center' }}>
              No diagnostic sessions recorded yet for this student.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {cognitiveEvidenceTrace.map((step: CognitiveTraceStep, index: number) => {
                const isExpanded = expandedTraceId === step.id || index === 0;
                return (
                  <div 
                    key={step.id}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Step Header */}
                    <div 
                      onClick={() => setExpandedTraceId(isExpanded ? '__collapsed__' : step.id)}
                      style={{
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#F1F5F9' : '#F8FAFC',
                        borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                          Step {index + 1}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A', fontFamily: 'monospace' }}>
                          {step.equation}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: step.diagnosis === 'correct_reasoning' ? '#DCFCE7' : '#FEF3C7',
                          color: step.diagnosis === 'correct_reasoning' ? '#166534' : '#92400E'
                        }}>
                          {step.misconceptionName || step.diagnosis}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          Confidence: <strong>{Math.round(step.confidence * 100)}%</strong>
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {/* Expandable Evidence Panel */}
                    {isExpanded && (
                      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                            Learner's Submitted Reasoning
                          </div>
                          <div style={{
                            padding: '12px 14px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            fontSize: '13px',
                            fontStyle: 'italic',
                            color: '#334155'
                          }}>
                            "{step.studentReasoning}"
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                              Detected Misconception & Skill
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '14px', color: '#D97706' }}>
                              {step.misconceptionName} ({step.misconceptionCode})
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                              Affected Skill: <strong>{step.affectedSkill}</strong>
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                              Observable Grounded Evidence
                            </div>
                            <div style={{ fontSize: '13px', color: '#334155' }}>
                              "{step.evidence}"
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pedagogical Notes Log & Targeted Remediations side-by-side */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {/* Notes Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#7C3AED" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>Pedagogical Notes Log</h3>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: '6px' }}>
                {notes.length} Notes
              </span>
            </div>

            <form onSubmit={handleAddNote} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add teacher diagnostic note for this student..."
                  style={{
                    flex: 1,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#0F172A',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={isSubmittingAction || !noteText.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#7C3AED',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            </form>

            {notes.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#64748B', fontStyle: 'italic' }}>
                No instructor notes recorded yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {notes.map((note: TeacherNote) => (
                  <div 
                    key={note.id}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', marginBottom: '4px', fontSize: '11px', fontWeight: 600 }}>
                      <span>{note.teacherName} • {note.category}</span>
                      <span>{new Date(note.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#0F172A', lineHeight: 1.4 }}>{note.noteText}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Assigned Remediations */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '26px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} color="#059669" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0F172A' }}>Targeted Remediation Plans</h3>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '6px' }}>
                {remediations.length} Active
              </span>
            </div>

            {remediations.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#64748B', padding: '12px 0', lineHeight: 1.5 }}>
                No custom remediation plans currently active. Click "Assign Targeted Remediation" above to assign intervention practice.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {remediations.map((rem: TeacherRemediationAssignment) => (
                  <div 
                    key={rem.id}
                    style={{
                      backgroundColor: '#F0FDF4',
                      border: '1px solid #BBF7D0',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, color: '#166534' }}>
                        Strategy: {rem.strategy.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', backgroundColor: '#DCFCE7', padding: '2px 8px', borderRadius: '4px' }}>
                        {rem.status}
                      </span>
                    </div>
                    {rem.customInstructions && (
                      <div style={{ color: '#14532D', marginTop: '4px' }}>
                        {rem.customInstructions}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#15803D', marginTop: '6px' }}>
                      Assigned: {new Date(rem.assignedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
