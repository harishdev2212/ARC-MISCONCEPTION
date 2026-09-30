import re

file_path = 'client/src/pages/ProgressPage.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add activeTab state
tab_state_insert = """  // Progress Data State
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawProgressData | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week'>('all');
  const [selectedError, setSelectedError] = useState<ErrorHistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths' | 'misconceptions' | 'errors' | 'history'>('overview');"""

content = content.replace("""  // Progress Data State
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RawProgressData | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week'>('all');
  const [selectedError, setSelectedError] = useState<ErrorHistoryItem | null>(null);""", tab_state_insert)

# 2. Add tabs UI and conditional rendering
old_body = """            {/* 1. TOP SUMMARY METRICS (4 Compact Cards) */}
            <ProgressSummary summary={progress.summary} />

            {/* EMPTY STATE BANNER (If new student with no history) */}
            {progress.isEmpty ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={28} />
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Your learning profile is just getting started.
                </h2>

                <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
                  Complete a few practice sessions and MindTrace will begin identifying your strengths, areas to improve, and recurring mistakes.
                </p>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span>Start Learning</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* 2. STRENGTHS & AREAS TO IMPROVE (Two Column Grid) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '24px',
                  marginBottom: '28px'
                }}>
                  <StrengthsCard 
                    strengths={progress.strengths} 
                    onStartPractice={handleStartPractice} 
                  />
                  <ImprovementAreas 
                    weaknesses={progress.weaknesses} 
                    onStartPractice={handleStartPractice} 
                  />
                </div>

                {/* 3. ERROR HISTORY TABLE ("Where Your Reasoning Went Wrong") */}
                <div id="section-errors">
                  <ErrorHistory 
                    errors={progress.errors} 
                    onSelectError={(item) => setSelectedError(item)} 
                  />
                </div>

                {/* 4. MISCONCEPTION PATTERNS & CONCEPT MASTERY (Two Column Grid) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                  gap: '24px',
                  marginBottom: '28px'
                }}>
                  <MisconceptionBreakdown misconceptions={progress.misconceptions} />
                  <ConceptMastery masteryItems={progress.mastery} />
                </div>

                {/* 5. LEARNING TIMELINE */}
                <LearningTimeline timeline={progress.timeline} />
              </>
            )}"""

new_body = """            {/* 1. TOP SUMMARY METRICS (4 Compact Cards) */}
            <ProgressSummary summary={progress.summary} />

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderBottom: '1px solid #E2E8F0',
              marginBottom: '28px',
              overflowX: 'auto',
              paddingBottom: '2px'
            }}>
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'strengths', label: 'Strengths & Weaknesses' },
                { id: 'misconceptions', label: 'Misconceptions' },
                { id: 'errors', label: 'Errors' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? '#2563EB' : '#64748B',
                    backgroundColor: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* EMPTY STATE BANNER (If new student with no history) */}
            {progress.isEmpty ? (
              <div style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={28} />
                </div>

                <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                  Your learning profile is just getting started.
                </h2>

                <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
                  Complete a few practice sessions and MindTrace will begin identifying your strengths, areas to improve, and recurring mistakes.
                </p>

                <button
                  type="button"
                  onClick={handleStartPractice}
                  style={{
                    marginTop: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span>Start Learning</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '24px',
                      marginBottom: '28px'
                    }}>
                      <StrengthsCard strengths={progress.strengths} onStartPractice={handleStartPractice} />
                      <ImprovementAreas weaknesses={progress.weaknesses} onStartPractice={handleStartPractice} />
                    </div>

                    <div id="section-errors" style={{ marginBottom: '28px' }}>
                      <ErrorHistory errors={progress.errors} onSelectError={(item) => setSelectedError(item)} />
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                      gap: '24px',
                      marginBottom: '28px'
                    }}>
                      <MisconceptionBreakdown misconceptions={progress.misconceptions} />
                      <ConceptMastery masteryItems={progress.mastery} />
                    </div>

                    <LearningTimeline timeline={progress.timeline} />
                  </>
                )}

                {/* STRENGTHS & WEAKNESSES TAB */}
                {activeTab === 'strengths' && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                    gap: '24px',
                    marginBottom: '28px'
                  }}>
                    <StrengthsCard strengths={progress.strengths} onStartPractice={handleStartPractice} />
                    <ImprovementAreas weaknesses={progress.weaknesses} onStartPractice={handleStartPractice} />
                  </div>
                )}

                {/* MISCONCEPTIONS TAB */}
                {activeTab === 'misconceptions' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <MisconceptionBreakdown misconceptions={progress.misconceptions} />

                    <div style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '16px',
                      padding: '26px 28px',
                      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                        Detected Misconceptions & Cognitive Evidence
                      </h3>
                      <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
                        Detailed breakdown showing the exact question, your submitted steps, the identified misconception, and targeted intervention.
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {progress.errors && progress.errors.length > 0 ? (
                          progress.errors.map((err, idx) => (
                            <div 
                              key={err.id || idx}
                              style={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                padding: '20px',
                                backgroundColor: '#F8FAFC',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Question
                                  </span>
                                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', fontFamily: "'JetBrains Mono', monospace" }}>
                                    {err.problem}
                                  </span>
                                </div>
                                <span style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: err.outcome === 'Recovered' ? '#16A34A' : '#D97706',
                                  backgroundColor: err.outcome === 'Recovered' ? '#DCFCE7' : '#FEF3C7',
                                  padding: '3px 8px',
                                  borderRadius: '5px'
                                }}>
                                  Severity: {err.outcome === 'Recovered' ? 'Low (Recovered)' : 'Moderate'}
                                </span>
                              </div>

                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                                gap: '12px'
                              }}>
                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Student Response
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#0F172A', fontStyle: 'italic' }}>
                                    "{err.whatYouSaid}"
                                  </div>
                                </div>

                                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', marginBottom: '4px' }}>
                                    Expected Reasoning
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#0F172A' }}>
                                    {err.whatHappened}
                                  </div>
                                </div>
                              </div>

                              <div style={{
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '10px'
                              }}>
                                <div>
                                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1E3A8A', textTransform: 'uppercase', marginBottom: '2px' }}>
                                    Detected Misconception: {err.detectedIssue}
                                  </div>
                                  <div style={{ fontSize: '13px', color: '#1D4ED8' }}>
                                    Recommended Practice: {err.intervention}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleStartPractice}
                                  style={{
                                    padding: '7px 14px',
                                    backgroundColor: '#2563EB',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Practice Now
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                            No active misconceptions logged yet. Continue practicing to see full cognitive diagnostics!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ERRORS TAB */}
                {activeTab === 'errors' && (
                  <div id="section-errors">
                    <ErrorHistory errors={progress.errors} onSelectError={(item) => setSelectedError(item)} />
                  </div>
                )}

                {/* HISTORY TAB */}
                {activeTab === 'history' && (
                  <LearningTimeline timeline={progress.timeline} />
                )}
              </>
            )}"""

if old_body in content:
    content = content.replace(old_body, new_body)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("PROGRESS_TABS_APPLIED_SUCCESS")
else:
    print("MATCH_FAILED")
