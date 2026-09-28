# 🌿 AyuSutra — Lifespan, Guided

> **AyuSutra** is a healthcare platform that connects you to hospitals, specialists, blood banks, and health guidance via an AI assistant.

---

## 🚀 Quick Start (Monolithic Deployment)

AyuSutra is built as a monolithic application. The Node.js backend serves the frontend statically, so you only need to run the backend server.

### 1. Backend Setup
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend` folder based on `.env.example`:
```env
PORT=5000
MONGO_URI="your_mongodb_atlas_connection_string"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_google_gemini_key"
MAPPLS_CLIENT_ID="your_mappls_client_id"
MAPPLS_CLIENT_SECRET="your_mappls_client_secret"
```

### 3. Run the App
```bash
npm run dev                
```

### 4. Open in Browser
Open your browser and navigate to: **http://localhost:5000**

---

## 🛠️ Core Tech Stack

### Frontend
- **HTML5 & CSS3** (Vanilla, Custom Design System)
- **Vanilla JavaScript** (No external frameworks)
- **Mappls API / Google Maps API** (For location tracking and mapping)

### Backend
- **Node.js & Express.js**
- **MongoDB & Mongoose** (Database and ODM)
- **Google Gemini API** (For Chatbot & Medical Report Summarization)
- **JWT (JSON Web Tokens)** (Authentication)

---

## 🗄️ Core Database Models (MongoDB)

| Model | Purpose |
|-------|-----------|
| `User` | Stores patient profiles and hashed passwords. |
| `Hospital` | Karnataka hospitals with GeoJSON locations for proximity searches. |
| `BloodBank` | Blood bank locations and timings. |
| `Diagnostic` | Diagnostic centre data. |
| `PatientHistory` | User medical records, uploads, and AI-generated summaries. |
| `SymptomLog` | Symptom tracking and computed severity scores. |

---

## ⚠️ Medical Disclaimer
AyuSutra provides **general health information and guidance only**. It does **not** diagnose medical conditions and does **not** replace professional medical advice. Always consult a licensed doctor for diagnosis and treatment.
