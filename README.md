# 🧠 MindTrace
## 👥 Team Details

- **Team Name:** ARC
- **Team ID:** ORION-2026-0303
- **Project:** MindTrace AI
- **GitHub Repository:** PASTE YOUR PUBLIC GITHUB LINK HERE
> *"Don't grade the answer. Trace the thinking."*

**MindTrace** is a Socratic diagnostic tutoring platform for mathematics (Core MVP: **Algebra → Linear Equations**). Unlike typical answer-evaluating systems or direct LLM chatbot clones, MindTrace analyzes a student's free-form mathematical reasoning, identifies underlying cognitive misconceptions, delivers tiered Socratic interventions that promote self-correction without spoiling solutions, and verifies authentic conceptual unlearning through isomorphic transfer questions.

---

## 🏛️ System Architecture

MindTrace is structured with clean separation of concerns across the diagnostic lifecycle:

```
[ Frontend: React + Vite + TypeScript ]
                 ↓
      [ Express REST API Gateway ]
                 ↓
 ┌────────────────────────────────────────────────────────┐
 │            MindTrace Pedagogical Core Pipeline         │
 │                                                        │
 │ 1. Reference Curriculum & Misconceptions Catalog      │
 │ 2. Student Reasoning Capture                           │
 │ 3. AI Diagnostic Engine (Phase 1 Placeholder Stubs)    │
 │ 4. Misconception Classification (Ontology Taxonomy)   │
 │ 5. Adaptive Socratic Intervention Policy (Tier 1-3)    │
 │ 6. Dynamic Learner Cognitive State Manager             │
 │ 7. Isomorphic Transfer & Recovery Engine               │
 └────────────────────────────────────────────────────────┘
```

### Clean Separation of Concerns
1. **Source / Reference Material**: Canonical equations, solution steps, curriculum prerequisites, and misconception definitions (`server/src/data/reference/`).
2. **Student Responses**: Verbatim free-form reasoning text, submitted answers, and timestamps (`shared/types.ts`).
3. **AI-Generated Output**: Diagnostic classifications, confidence gauges, extracted evidence snippets, and Socratic reflection questions (`server/src/pipeline/`).
4. **Learner Cognitive State**: Dynamic mastery tracking, confidence scores, misconception history logs, attempt counters, and recovery status (`server/src/pipeline/learnerStateManager.ts`).
5. **Teacher Decisions**: Analytics dashboards, cohort attention alerts, and verbatim evidence audits (`server/src/routes/teacherRoutes.ts`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18 (Tested on v24.19.0)
- **npm** >= 9

### Quick Start (Single Command)
Run both the Express backend API and the Vite frontend client simultaneously:

```bash
# In the project root:
npm run dev
```

This launches:
- **Backend API Server**: [`http://localhost:5000`](http://localhost:5000)
- **Frontend Web App**: [`http://localhost:3000`](http://localhost:3000)

### Running Separately
```bash
# Terminal 1 - Backend:
npm run server

# Terminal 2 - Frontend:
npm run client
```

---

## 📄 Main Pages & User Flows

### 1. Student Flow
- **Landing / Login Page (`/`)**: Product branding, role picker with one-click student demo access (`Alex Rivera`, `Maya Lin`, `Jordan Patel`, `Marcus Vance`, `Chloe Bennett`).
- **Student Dashboard (`student-dashboard`)**: Displays current topic (*Multi-Step Linear Equations & Balance*), concept mastery progress (58%), active misconception alert card (`EQ-UNILATERAL-OP: Unilateral Operation`), recent reasoning activity audit trail, and "Continue Learning" CTA.
- **Learning Session (`learning-session`)**: Displays the canonical algebra question ($3x + 8 = 29$), large free-form reasoning text area, sample reasoning pre-fill buttons for instant testing, and submission trigger.
- **Diagnosis & Socratic Dialogue (`diagnosis-intervention`)**: Polished placeholder UI displaying diagnosed misconception, diagnostic confidence (91%), verbatim evidence quote excerpt, Tier 1 Socratic tutor reflection prompt, and student guided reflection input box.
- **Transfer / Recovery Check (`transfer-recovery`)**: Presents an isomorphic transfer problem ($4y + 11 = 39$), collects student reasoning, evaluates conceptual recovery vs memorization, awards mastery deltas (+15%), and verifies unlearning.

### 2. Teacher Flow
- **Teacher Dashboard (`teacher-dashboard`)**: Analytical cohort overview featuring total learners, concepts needing attention, active misconception clusters, cohort transfer recovery rate (60%), and a searchable/filterable student roster.
- **Teacher Student Profile (`teacher-profile`)**: Deep-dive cognitive inspection showing overall mastery, multi-step vs prerequisite concept breakdown, chronological misconception history, verbatim highlighted evidence quotes, and full Socratic dialogue audit trails.

---

## 🗄️ Domain Data Models (`shared/types.ts`)

- `Student`: Learner identity, grade level, topic enrollment.
- `Teacher`: Instructor identity, department, assigned classes.
- `Concept`: Mathematical curriculum node with prerequisites and misconception catalog.
- `Question`: Canonical or transfer problem containing equations, prompts, and reference steps.
- `StudentResponse`: Free-form natural language reasoning text, answer, and timestamps.
- `Diagnosis`: Detected error categorization, confidence metrics, and verbatim evidence snippets.
- `Intervention`: Tiered Socratic prompts (L1: Questioning → L2: Counter-example → L3: Scaffolding).
- `RecoveryAttempt`: Transfer problem response evaluation and verification status.
- `LearnerConceptState`: Comprehensive cognitive model tracking:
  - `mastery`
  - `confidence`
  - `misconception`
  - `attempts`
  - `hintsUsed`
  - `interventions`
  - `recoveryStatus` (`not_tested` | `in_progress` | `recovered` | `unrecovered_needs_escalation`)

---

## 🔮 Roadmap: Remaining for Phase 2

1. **AI Diagnostic Engine Integration**:
   - Replace `MockDiagnosticEngine` with an LLM-powered reasoning parser (Gemini API with structured JSON output schema).
   - Implement Computer Algebra System (CAS) / AST solver to verify equivalence steps deterministically alongside semantic analysis.
2. **Automated Evidence Grounding**:
   - Extract exact character/token-level span offsets in student reasoning text where mathematical fallacies originate.
3. **Adaptive Socratic Policy Engine**:
   - Dynamic escalation from Level 1 (reflective inquiry) to Level 2 (visual scale contradiction) and Level 3 (scaffolded decomposition) based on repeated misconceptions.
4. **Bayesian Knowledge Tracing (BKT)**:
   - Upgrade simple mastery adjustments into Bayesian or Elo-based latent skill estimation.
5. **Teacher Pedagogical Interventions**:
   - Allow teachers to add manual notes, trigger live classroom remediation assignments, or override AI diagnosis flags.
