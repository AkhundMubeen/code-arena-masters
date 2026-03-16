# 🛡️ UniCodeArena (Code Arena Masters)

> **A real-time, high-performance competitive programming platform built to power university-level coding battles.**
> *Submitted for the CircuitBreak 2026 Hackathon.*

[![Live Demo](https://img.shields.io/badge/Demo-Live_Site-success?style=for-the-badge)](https://uni-code-arena.vercel.app/)
[![Demo Video](https://img.shields.io/badge/YouTube-Watch_Demo-red?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=NvPSGfQcLVE)

## 💡 Overview
As software engineering students, we saw a gap in how competitive programming is conducted at the university level. UniCodeArena solves the logistical nightmare of hosting local, department-level hackathons by providing an all-in-one execution and ranking ecosystem. 

To move fast and establish a clean, dark-mode aesthetic, we utilized **Lovable AI** to rapidly scaffold our initial **React**, **Vite**, and **Tailwind CSS** frontend components. This AI-assisted prototyping allowed us to dedicate our core engineering hours to the complex backend logic, real-time database synchronization, and API integrations.

## ✨ Core Features
* **⌨️ Practice Arena:** A lightweight, powerful IDE built directly into the browser supporting Python, C++, and Java out of the box.
* **👑 Admin Control Center:** Allows department heads to set precise Unix timestamp-based start times and generate unique 6-character alphanumeric access codes for private sessions.
* **⚔️ Live Competitions:** A high-pressure, competitive environment featuring a dynamic, real-time leaderboard that updates the instant a user passes all test cases.
* **👁️ God View:** Administrators can monitor live submissions, track participants, and ensure a smooth event.
* **🔄 Continuity Protection:** Progress is continuously synced to the database. If a user drops connection, they can rejoin and pick up exactly where they left off.

## 🛠️ Tech Stack & Architecture
* **Frontend:** React, Vite, Tailwind CSS 
* **AI Assistance:** Lovable AI (for rapid UI scaffolding)
* **Backend & Database:** Supabase (PostgreSQL, Auth)
* **Real-Time Engine:** Supabase Realtime (WebSocket connections for live leaderboards)
* **Code Execution:** Judge0 API / CodeArena API
* **Deployment & Routing:** Vercel (with custom `vercel.json` rewrite rules for client-side routing)

## 🚀 Getting Started

To run UniCodeArena locally, follow these steps:

### 1. Clone the repository
```bash
git clone [https://github.com/AkhundMubeen/code-arena-masters.git](https://github.com/AkhundMubeen/code-arena-masters.git)
cd code-arena-masters
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory and add your keys:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_JUDGE0_API_KEY=your_judge0_api_key
```

### 4. Start the development server
```bash
npm run dev
```

## 🔮 What's Next
Moving forward, we plan to add an automated admin UI for problem creation and deeper analytics tailored specifically for university professors. We want this to become the standard ecosystem for campus coding growth.
