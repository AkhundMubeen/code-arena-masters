# 🛡️ UniCodeArena (Code Arena Masters)

> **A real-time, high-performance competitive programming platform built to power university-level coding battles.**
> *Submitted for the CircuitBreak 2026 Hackathon.*

[![Live Demo](https://img.shields.io/badge/Demo-Live_Site-success?style=for-the-badge)](https://uni-code-arena.vercel.app/)
[![Tech Stack](https://img.shields.io/badge/Built_with-React_|_Supabase_|_Judge0-blue?style=for-the-badge)](#)

## 💡 Overview
As software engineering students, we saw a gap in how competitive programming is conducted at the university level. UniCodeArena solves the logistical nightmare of hosting local, department-level hackathons by providing an all-in-one execution and ranking ecosystem. It is fast, secure, and specifically built for real-time campus battles.

## ✨ Core Features
* **⌨️ Practice Arena:** A lightweight, powerful IDE built directly into the browser supporting Python, C++, and Java out of the box.
* **👑 Admin Control Center:** Allows department heads to set precise Unix timestamp-based start times and generate unique 6-character alphanumeric access codes for private sessions.
* **⚔️ Live Competitions:** A high-pressure, competitive environment featuring a dynamic, real-time leaderboard that updates the instant a user passes all test cases.
* **👁️ God View:** Administrators can monitor live submissions, track participants, and ensure a smooth event.
* **🔄 Continuity Protection:** Progress is continuously synced to the database. If a user drops connection, they can rejoin and pick up exactly where they left off.

## 🛠️ Tech Stack & Architecture
* **Frontend:** React, Vite, Tailwind CSS (Initial UI scaffolded via Lovable AI)
* **Backend & Database:** Supabase (PostgreSQL, Auth)
* **Real-Time Engine:** Supabase Realtime (WebSocket connections for live leaderboards)
* **Code Execution:** Judge0 API
* **Deployment & Routing:** Vercel (with custom `vercel.json` rewrite rules for client-side routing)

### Database Schema Highlights
* `questions`: A curated bank of 120+ DSA problems categorized by difficulty (Easy, Medium, Hard, Beast).
* `competitions`: Manages active sessions, host IDs, access codes, and Unix timestamps.
* `submissions`: Logs real-time code execution results, language used, and pass/fail states.

## 🚀 Getting Started

To run UniCodeArena locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/AkhundMubeen/code-arena-masters.git](https://github.com/AkhundMubeen/code-arena-masters.git)
cd code-arena-masters
