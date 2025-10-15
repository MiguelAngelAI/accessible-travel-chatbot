
# 🧠 Accessible Travel Chatbot — Full Assessment Solution

This repository contains the **final implementation** of the Accessible Travel Chatbot project, developed as part of a technical assessment.  
It includes a complete FastAPI backend, a React + Tailwind frontend, and integrated AI streaming responses via the OpenAI API.

---

## 🚀 Project Overview

The chatbot is designed to assist users with **accessibility-related travel information**, powered by a contextual PDF knowledge base.  
It reads and indexes a provided PDF file (`Accessible_Travel.pdf`) and uses the OpenAI API to generate relevant, helpful answers.

---

## 🧩 Architecture

### 🔹 Backend (FastAPI)
- **Language:** Python 3.12+
- **Framework:** FastAPI
- **Features:**
  - Loads and parses PDF context at startup.
  - Handles chat requests via **Server-Sent Events (SSE)**.
  - Manages multi-conversation state **in memory** (no database).
  - Graceful error handling and environment configuration via `.env`.
  - Rate limiting to avoid API overload.

**Key files:**
```
backend/
├── main.py                  # FastAPI server (SSE, multi-chat, PDF context)
├── utils/pdf_loader.py      # PDF reader using PyPDF2
├── .env                     # Contains your OpenAI API key and PDF path
├── requirements.txt          # Full dependency list
```

### 🔹 Frontend (React + Vite + TailwindCSS)
- **Framework:** React 18
- **Styling:** TailwindCSS + Framer Motion + Lucide Icons
- **Features:**
  - Clean modern UI (responsive, minimalistic, accessible).
  - **Mock/offline mode** for local testing without API key.
  - **Streaming real-time AI responses** (SSE integration).
  - **ChatGPT-style typing indicator** while thinking.
  - **Letter-by-letter response effect** when generating text.
  - Multi-conversation selector with in-memory cache.
  - Built-in rate limiting for request safety.

**Key files:**
```
frontend/
├── src/App.jsx               # Main component (multi-chat + SSE streaming)
├── src/components/Chat.jsx   # Chat window and input bar
├── src/components/MessageBubble.jsx
├── src/components/TypingIndicator.jsx
├── src/main.jsx              # React entry point
├── src/index.css             # TailwindCSS styles
```

---

## ⚙️ Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/<your-username>/accessible-travel-chatbot.git
cd accessible-travel-chatbot
```

### 🔧 Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # (Windows)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 💻 Frontend
```bash
cd frontend
npm install
npm run dev
```

### 🌐 Access the app
Visit: **http://localhost:5173**

---

## ⚙️ Environment Configuration

Create a `.env` file inside `backend/` with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
PDF_PATH=Accessible_Travel_Guide_Partial.pdf
OPENAI_MODEL=gpt-4o-mini
```
Create a `.env` file inside `frontend/` with the following content:

```
VITE_USE_MOCK=false
```

---

## 💬 Chat Logic

The chatbot runs in **mock/offline mode** by default (for development).  
When a valid API key is provided and the backend is running, it switches automatically to **real-time streaming mode**.

### Streaming Implementation
- Uses `EventSource` to handle real-time chunks from FastAPI.
- Responses appear letter-by-letter for a natural typing effect.
- A typing indicator shows while the bot is "thinking".

---

## 🧠 Features Summary

| Feature | Description |
|----------|--------------|
| **PDF Context Loader** | Loads and parses a travel accessibility guide PDF for contextual responses |
| **FastAPI + SSE** | Real-time streaming of AI responses via Server-Sent Events |
| **React Frontend** | Clean, responsive interface with TailwindCSS |
| **Typing Indicator** | Appears only when model is “thinking” before generation |
| **Letter-by-letter streaming** | Real-time progressive response output |
| **Multi-conversation** | Supports multiple chat sessions with memory cache |
| **Rate Limiting** | Prevents spam requests (<3s cooldown) |
| **In-memory cache** | Stores conversations without a database |
| **Error handling** | Catches invalid keys or empty PDF gracefully |
| **Offline mode** | Simulates AI responses without backend connection |

---

## ⚙️ Requirements

```
fastapi==0.115.0
uvicorn==0.30.6
openai==1.51.2
python-dotenv==1.0.1
PyPDF2==3.0.1
python-multipart==0.0.9
pydantic==2.9.2
starlette==0.38.6
anyio==4.9.0
```

Install all backend dependencies with:
```bash
pip install -r backend/requirements.txt
```

---

## 💡 Design Decisions

| Decision | Reason |
|-----------|--------|
| **FastAPI + SSE** | Efficient async streaming and simple integration |
| **No database** | Keeps architecture lightweight and compliant with assessment |
| **React + Tailwind** | Rapid UI development, accessible styling |
| **Streaming effect** | Improves UX realism and perceived intelligence |
| **Multi-conversation cache** | Demonstrates structured state management |
| **Env-based config** | Secure API key management and flexible PDF loading |

---

## 🧪 Testing

### Backend health check
```bash
curl http://127.0.0.1:8000/health
```
Expected output:
```json
{"ok": true, "pdf_loaded": true, "pdf_chars": 3908}
```

### Chat test (PowerShell)
```bash
Invoke-WebRequest -Uri "http://127.0.0.1:8000/chat" -Method POST -Body '{"message":"What is accessibility?"}' -ContentType "application/json"
```

---

## ⚙️ Recent Improvements

### 💬 Real-Time Streaming & Typing Indicator
- **ChatGPT-style** streaming responses (letter-by-letter).  
- **Smart typing indicator** only appears while the model “thinks”.  
- Fully compatible with the FastAPI SSE backend.

### 🧠 In-Memory Multi-Conversation Cache
- Each conversation retains its message history **in memory**.  
- Switching between chats restores previous messages instantly.  
- No external storage or database used.

### 🧩 Backend Stability
- Better SSE handling and error recovery.  
- Graceful handling of invalid or missing API keys.

---

## 📘 Example `.env.example`

```bash
# Backend
OPENAI_API_KEY=sk-yourkeyhere
PDF_PATH=Accessible_Travel_Guide_Partial.pdf
OPENAI_MODEL=gpt-4o-mini

# Frontend 
VITE_USE_MOCK=false   #Live mode with api key, true for mock mode
```

---

## 🌟 Future Improvements

- Support for multiple PDFs or knowledge sources.
- Add persistent localStorage saving (optional).
- Implement message rating or export feature.

---

## 🧾 Credits

Developed by **Miguel Angel Monturiol Castillo**  
AI Engineer & Full-Stack Developer  
📍 San Francisco, Heredia, Costa Rica

---
