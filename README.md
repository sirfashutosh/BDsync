# BD Sync (Business Development Sync)

**Secure meeting management and structured insights for high-performing Business Development teams.**

![BD Sync Hero](https://images.unsplash.com/photo-1553877615-30c7929470ddd?q=80&w=2670&auto=format&fit=crop)

## 🚨 The Problem
Business Development teams often struggle with information continuity and actionable data.

1.  **Fragmented Context:** "What did we discuss with this prospect last month?" often leads to frantic searching through scattered Google Docs, Slack messages, or personal notebooks.
2.  **Lost Action Items:** In the flow of conversation, critical next steps are jotted down but often not assigned to a specific owner or tracked, leading to dropped balls.
3.  **Siloed Knowledge:** One BD rep doesn't know what another retrieved in terms of market intelligence.
4.  **Unstructured Data:** Raw notes are messy. Converting them into a clean "Executive Summary" or extracting "Strategic Insights" is a manual, post-meeting chore that often gets skipped.

## 💡 The Solution: BD Sync
BD Sync is a dedicated workspace designed to force structure into the chaos of BD meetings. It treats meeting notes not just as text, but as **structured data** linking the past, present, and future of your deal flow.

It solves the core problems by:
*   **Enforcing Continuity:** The "Last Meeting Context" sidebar automatically pulls the summary and open tasks from the *previous* meeting with this team/client, ensuring you never start from zero.
*   **Structuring Outcomes:** Instead of just a text blob, you fill out specific fields for **Executive Summary**, **Action Items (with Owners)**, and **Strategic Insights**.
*   **Team Transparency:** All meetings are saved to a central team workspace, accessible to authorized members and admins.

## ✨ Key Features

### 🏢 Team Workspaces
*   **Department Overview:** Admins can create distinct teams (e.g., "Enterprise Squad", "SMB Unit", "Partnerships").
*   **Role-Based Access Control:**
    *   **Admins:** Manage teams and view all data.
    *   **Members:** Access only their assigned team's workspace.
*   **Easy Onboarding:** Generate secure invite links to onboard new reps instantly.

### 📝 Smart Meeting Recorder
*   **Live Context Awareness:** While you type notes for the current call, the left sidebar displays the **Previous Meeting's Summary** and **Pending Action Items**.
*   **Structured Data Capture:** Dedicated sections for:
    *   **Raw Notes:** Capture the flow of conversation.
    *   **Executive Summary:** High-level takeaways.
    *   **Action Items:** Assignable tasks with owners.
    *   **Strategic Insights:** High-value learnings or risks.

### 🤖 AI-Ready Infrastructure (Gemini)
*   The application works with **Google Gemini** to offer future capabilities such as auto-generation of summaries and extraction of action items from raw notes.
*   *Current State:* manual curation is prioritized for maximum accuracy, with the architecture ready for "One-Click AI Analysis."

### 📊 History & Analytics
*   **Meeting Timeline:** View a chronological history of all team interactions.
*   **Edit Capabilities:** Refine notes and action items after the call ends.

## 🛠️ Technology Stack
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS
*   **Backend:** Firebase (Firestore, Authentication)
*   **AI:** Google Gemini API (Integrated Service)
*   **Icons:** Lucide React

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Firebase Project

### Installation
1.  **Clone the repository**
    ```bash
    git clone https://github.com/sirfashutosh/BDsync.git
    cd BDsync
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Configure Firebase**
    *   Create a `.env.local` file.
    *   Add your Firebase configuration keys:
        ```env
        VITE_FIREBASE_API_KEY=your_key
        VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
        VITE_FIREBASE_PROJECT_ID=your_project_id
        # ... other firebase config
        ```
4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 🛡️ License
This project is proprietary software. All rights reserved.
