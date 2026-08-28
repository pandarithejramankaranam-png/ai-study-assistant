# StudyLens AI – Multimodal AI Study Assistant

> **A full-stack, multimodal AI learning assistant for college students built with React, Node.js, Express, MongoDB, and the Google Gemini Multimodal API.**

---

## 📌 Problem Statement

College students face immense cognitive overload attempting to digest dense course materials across fragmented formats:
- **PDF Textbooks & Lecture Slides**: Hundreds of pages of complex theory.
- **Handwritten Diagrams & Formulas**: Scanned or photographed lecture notes containing vital math and mind maps.
- **Audio Recordings**: Hours of recorded class lectures.

Traditional AI text wrappers fail to analyze handwritten diagrams or combine multi-format inputs simultaneously, forcing students to manually transcribe materials before seeking AI assistance.

---

## 💡 The Solution: StudyLens AI

**StudyLens AI** provides a unified **multimodal study workspace** where students can upload PDFs, handwritten note images, and voice lecture recordings in one central platform. 

Powered by **Google Gemini API**, StudyLens AI synthesizes information across multiple uploaded materials at once—enabling students to ask questions, generate interactive MCQ quizzes, predict high-yield exam questions, and generate revision cheat sheets.

---

## ✨ Features Overview

- 🔐 **Secure Authentication**: User Registration, Login, Profile updates, and JWT Token Authorization backed by MongoDB and bcrypt password hashing.
- 📁 **Multimodal Material Hub**: Upload, manage, preview, and delete PDF textbooks, JPG/PNG handwritten notes, and MP3/WAV voice recordings with drag-and-drop support.
- 💬 **Interactive AI Chat Workspace**: Chat with AI grounded in selected course materials, complete with conversation thread history saved in MongoDB.
- 📌 **Executive Summarizer**: Converts lengthy textbook chapters into bullet takeaways and terminology glossaries.
- 💡 **Topic Explainer**: Multi-depth explanations (ELI5 simple, detailed technical breakdown, or real-world analogies).
- 🎯 **Interactive MCQ Quiz Generator**: Generates custom test quizzes with immediate scoring, accuracy reports, and answer explanations.
- 📝 **High-Yield Exam Predictor**: Predicts short (5-mark) and long (15-mark) probable exam questions with model solutions.
- ⚡ **Smart Study Notes & Flashcards**: Generates structured revision guides, 1-page exam cheat sheets, and 3D flip-card decks.
- 🖼️ **Visual Diagram & OCR Parser**: Analyzes handwritten charts, mind maps, and mathematical equations.
- 🎙️ **Audio Lecture Analyzer**: Summarizes key takeaways and announcements from recorded voice lectures.

---

## 🤖 Multimodal AI Architecture

StudyLens AI implements a **true multimodal pipeline**:

```
[ User Uploads ] ──> ( DBMS.pdf + normalization_diagram.jpg + lecture.mp3 )
                            │
                            ▼
[ Multer Engine ] ──> Stores files in backend storage & extracts PDF text
                            │
                            ▼
[ Gemini AI Service ] ──> Converts files to Base64 Inline Data Parts
                            │
                            ▼
[ Google Gemini 1.5 ] ──> Processes combined PDF + Image + Audio + Prompt
                            │
                            ▼
[ MongoDB & React ] ──> Displays response & persists conversation history
```

When a user selects multiple study materials before submitting a query (e.g. *"Explain normalization using all attached materials"*), the backend service (`geminiService.js`) constructs base64 inline data objects (`{ inlineData: { data, mimeType } }`) for each selected document, image, or audio recording, passing them as a single multi-part payload to the Google Gemini API.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 19 + Vite 6
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 + Vanilla CSS tokens & Glassmorphism
- **HTTP Client**: Axios (with JWT interceptors)
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js v24 + Express.js
- **Database**: MongoDB + Mongoose ORM (with `mongodb-memory-server` zero-config fallback for local development)
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Validation**: Zod Schemas
- **File Processing**: Multer + `pdf-parse`

### AI Integration
- **SDK**: `@google/generative-ai`
- **Model**: `gemini-1.5-flash`

---

## 📁 Project Structure

```
studylens-ai/
├── README.md                   # Project documentation
├── .gitignore                  # Root Git ignore
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection & MemoryServer fallback
│   ├── controllers/
│   │   ├── authController.js   # User registration, login, profile & logout
│   │   ├── materialController.js # File upload, list, preview & deletion
│   │   ├── aiController.js     # Multimodal AI features & conversation logger
│   │   └── chatController.js   # Chat history threads manager
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT token protection middleware
│   │   └── uploadMiddleware.js # Multer file validation engine
│   ├── models/
│   │   ├── User.js             # User Mongoose model
│   │   ├── Material.js         # Material Mongoose model
│   │   ├── Conversation.js     # Conversation thread model
│   │   └── SavedStudyItem.js   # Saved notes & quiz model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── aiRoutes.js
│   │   └── chatRoutes.js
│   ├── services/
│   │   └── geminiService.js    # Dedicated Gemini API service
│   ├── utils/
│   │   └── zodSchemas.js       # Zod validation schemas
│   ├── uploads/                # Storage directory
│   ├── render.yaml             # Render deployment configuration
│   ├── .env.example            # Environment variables placeholder
│   ├── package.json
│   └── server.js               # Server entrypoint
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axiosClient.js  # Axios instance with auth headers
    │   ├── components/         # Reusable UI components (Navbar, Sidebar, QuizModal, Flashcards)
    │   ├── context/
    │   │   └── AuthContext.jsx # Authentication state provider
    │   ├── pages/              # App pages (Landing, Login, Register, Dashboard, AIChat, Documents, Analysis, Profile, 404)
    │   ├── App.jsx             # React Router setup
    │   └── index.css           # Tailwind CSS theme tokens
    ├── vercel.json             # Vercel SPA deployment configuration
    ├── vite.config.js
    └── package.json
```

---

## ⚙️ Environment Variables Reference

Secrets must exist **ONLY** in `backend/.env`. Never expose keys in the frontend or commit `.env` files to Git.

### Backend (`backend/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studylens
JWT_SECRET=studylens_secret_jwt_key_2026_super_secure
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone Repository & Setup Backend
```bash
git clone https://github.com/your-username/studylens-ai.git
cd studylens-ai/backend

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 2. Setup Frontend
```bash
cd ../frontend

# Install frontend dependencies
npm install
```

### 3. Running the Application Locally
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

---

## 🌐 Production Deployment Guide

### 1. Database Deployment (MongoDB Atlas)
1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new Cluster (M0 Free Tier).
3. Create a Database User & Password.
4. Add IP Access (`0.0.0.0/0` for cloud deployment).
5. Copy your connection string:
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/studylens?retryWrites=true&w=majority`

### 2. Backend Deployment (Render)
1. Log into [Render](https://render.com/).
2. Create a **New Web Service** connected to your GitHub repository.
3. Set Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Environment Variables:
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Generate a random secure secret>`
   - `GEMINI_API_KEY`: `<Your Google Gemini API Key>`

### 3. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set Framework Preset to **Vite**.
4. Set Root Directory to `frontend`.
5. Deploy! (`vercel.json` automatically handles SPA routes).

---

## 🔒 Security Best Practices Implemented

- ✅ **Secret Isolation**: `GEMINI_API_KEY` exists exclusively in `backend/.env`.
- ✅ **Repository Safety**: `.env` files are ignored via `.gitignore`.
- ✅ **Database Ownership Security**: All database queries strictly scope material and chat records to `{ userId: req.user._id }`.
- ✅ **File Input Sanitization**: Multer validates strict MIME types, extensions, and caps max upload size at 25MB.
- ✅ **Password Hashing**: Passwords are standard salted/hashed with `bcryptjs`.

---

## 📄 License

This project is open-source under the MIT License.
