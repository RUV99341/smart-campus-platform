# 🏫 Smart Campus Platform

A modern, AI-enhanced web application that enables students to submit, track, and resolve campus complaints while giving administrators tools to manage them efficiently. Built with a scalable Firebase backend and a dynamic React frontend.

<img width="1536" height="1024" alt="smart campus platform" src="https://github.com/user-attachments/assets/ac03c1df-bde8-4984-a574-480de6f8cb8f" />


---

## 📌 Table of Contents

- [🔍 Problem Statement](#-problem-statement)
- [🚀 Solution Overview](#-solution-overview)
- [💡 Key Features](#-key-features)
- [⚙️ Tech Stack](#️-tech-stack)
- [📈 System Architecture](#-system-architecture)
- [🔐 Role-Based Access](#-role-based-access)
- [🧠 AI Integration](#-ai-integration)
- [📦 Folder Structure](#-folder-structure)
- [📸 Screenshots](#-screenshots)
- [🔮 Future Enhancements](#-future-enhancements)
- [📂 Project Setup](#-project-setup)
- [📜 License](#-license)

---

## 🔍 Problem Statement

In many colleges, complaint systems are fragmented, paper-based, or handled through unstructured online forms, leading to lack of transparency and resolution delays. Students are often unaware of complaint statuses, and admins lack data insights or tools for prioritization.

---

## 🚀 Solution Overview

**Smart Campus Platform** solves this by providing a centralized web application with:

- Real-time complaint tracking
- Role-based access (student/admin)
- AI-powered content moderation
- Admin tools for filtering, resolving, and exporting complaints

---

## 💡 Key Features

### 🎓 For Students:
- Google Login (Firebase Auth)
- Submit complaints (title, description, category, optional image or image URL)
- Live complaint feed (auto-updated)
- View and manage personal complaints
- Animated, mobile-friendly UI

### 🛠️ For Admins:
- Admin-only dashboard
- View all complaints
- Filter by status/category
- Mark as resolved
- Export to CSV
- User management

### 🤖 AI-Moderation (Gemini API):
- Filters out offensive or inappropriate content before saving complaints

---

## ⚙️ Tech Stack

| Layer        | Tools / Libraries                                      |
|--------------|--------------------------------------------------------|
| Frontend     | React, React Router DOM, Framer Motion, CSS            |
| Authentication | Firebase Auth (Google Login + Role-Based Access)     |
| Database     | Firebase Firestore (NoSQL)                             |
| Backend Logic| Firebase Cloud Functions (serverless AI moderation)   |
| AI           | Gemini API (via Firebase)                              |
| Hosting      | Firebase Hosting                                       |
| Version Control | Git + GitHub                                        |

---

## 📈 System Architecture

```txt
Student/ Admin → React App → Firebase Auth
                        ↓
           Firebase Firestore ←→ Cloud Function (Gemini AI)
                        ↓
         Real-time updates on Dashboard & Feed
```
