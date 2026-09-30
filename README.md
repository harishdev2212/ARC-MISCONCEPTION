# MindTrace AI

## Team Details

- **Team Name:** ARC
- **Team ID:** ORION-2026-0303
- **Project Name:** MindTrace AI
- **Team Leader:** Charish P S 
- **Team Members:** Charish P S, R Nethra, Rakshana A
- **GitHub Repository:** https://github.com/harishdev2212/ARC-MISCONCEPTION
- **Repository Access:** Public

---

## Problem Statement

Traditional learning systems mainly determine whether an answer is correct
or incorrect. They often fail to identify why a student made a mistake or
whether the same misconception is recurring.

MindTrace AI addresses this problem by analyzing student responses and
reasoning patterns to identify underlying misconceptions and learning gaps.

---

## Our Solution

MindTrace AI is an AI-powered cognitive diagnostic learning platform.

The core learning cycle is:

**Student attempts a question**
→ **AI analyzes the response**
→ **Misconception is identified**
→ **Progress is updated**
→ **Student receives targeted feedback**
→ **Teacher can view the student's learning analysis**

The goal is not simply to tell students that an answer is wrong, but to help
identify and understand the reasoning behind the error.

---

## Key Features

### Student

- Student registration and authentication
- Personalized student dashboard
- Learn section
- Practice section
- Progress tracking
- My Insights
- Practice history
- Strength and weakness identification
- Misconception detection
- Targeted learning recommendations
- Interactive notifications
- Multiple learning topics
- Mathematical question/image understanding

### Misconception Analysis

MindTrace analyzes student responses to identify potential reasoning errors
and recurring misconceptions.

Detected misconceptions can be reflected in:

- Student progress
- Learning insights
- Practice recommendations
- Teacher reports

### Teacher Dashboard

Teachers can view student-level learning information including:

- Student performance
- Topic-wise progress
- Strengths
- Weaknesses
- Detected misconceptions
- Repeated errors
- Practice activity
- Individual student reports

---

## Supported Learning Areas

### Mathematics

The current diagnostic system supports mathematical learning with a focus on
algebraic reasoning and linear equations, with an extensible question and
topic structure.

### Programming

The platform is designed to support programming concepts and reasoning-based
learning.

### English

The platform is designed to support English learning including grammar,
language understanding and reasoning-based practice.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- HTML
- CSS

### Backend

- Node.js
- Express
- TypeScript
- REST API

### AI / Diagnostic Layer

- Large Language Model based analysis
- Natural Language Processing
- Socratic reasoning
- Misconception analysis
- AI-assisted learning feedback

### Development

- Google Antigravity
- Git
- GitHub

---

## System Architecture

```text
Student
   ↓
MindTrace Frontend
   ↓
Backend API
   ↓
AI / Diagnostic Engine
   ↓
Response & Misconception Analysis
   ↓
Progress / Student Data
   ↓
┌───────────────────────┐
│                       │
▼                       ▼
Student Dashboard   Teacher Dashboard
