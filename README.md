# 🌍 Accessible Travel Chatbot

An intelligent PDF-powered chatbot that provides accessibility-related information based on uploaded travel guides.  
Built with **FastAPI**, **React + Vite**, and **OpenAI GPT-4o-mini**, this project demonstrates a full-stack AI integration with real-time streaming responses.

---

## 🧠 Overview

This chatbot reads context directly from a travel guide PDF (included in the repo) and answers user questions in natural language, referencing relevant pages when needed.

Features:
- 🔗 **Full-stack AI pipeline** (FastAPI + React + OpenAI)
- 📘 **Context-aware answers** grounded in a PDF
- ⚡ **Live streaming** responses via Server-Sent Events (SSE)
- 🧱 **Mock/offline mode** for development without API calls
- 💬 **ChatGPT-style interface** with smooth animations
- ✨ **Auto-scroll, message memory, and welcome message**
- 🎨 **Glass-effect UI** with animated gradient background

---

## 🏗️ Project Structure

```
Chatbot/
├── backend/
│   ├── main.py                 # FastAPI backend (OpenAI + PDF logic)
│   ├── utils/pdf_loader.py     # Loads and parses the PDF
│   ├── requirements.txt        # Backend dependencies
│   ├── .env                    # API key + model configuration
│   └── Accessible_Travel_Guide_Partial.pdf
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   └── TypingIndicator.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── .env                    # Frontend mode toggle (mock/live)
│
└── README.md                   # (this file)
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/accessible-travel-chatbot.git
cd accessible-travel-chatbot
```

---

### 2️⃣ Backend Setup

#### Create a virtual environment and install dependencies:
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate    # On Windows
pip install -r requirements.txt
```

#### Create your `.env` file:
```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini
PDF_PATH=Accessible_Travel_Guide_Partial.pdf
```

#### Run the backend:
```bash
python -m uvicorn main:app --reload --port 8000
```

If everything is working, you should see:
```
✅ OpenAI client initialized successfully.
📘 PDF loaded successfully (3908 chars).
```

---

### 3️⃣ Frontend Setup

#### Install dependencies:
```bash
cd ../frontend
npm install
```

#### Configure `.env`:
```env
VITE_USE_MOCK=false
```

#### Run the development server:
```bash
npm run dev
```

Visit 👉 **http://localhost:5173**

---

## 💬 Chat Logic

By default, the app supports a **mock/offline mode** for development and testing,  
which simulates AI responses without calling the backend.  
In production, the chatbot connects to the FastAPI backend and streams **real AI responses** from the OpenAI API.

Frontend uses:
```js
const evtSource = new EventSource("http://127.0.0.1:8000/chat?message=" + encodeURIComponent(message));
```

---

## 🧩 Technologies Used

| Layer | Stack |
|-------|--------|
| Frontend | React + Vite + TailwindCSS + Framer Motion |
| Backend | FastAPI + OpenAI SDK + PyPDF2 |
| Streaming | Server-Sent Events (SSE) |
| Model | GPT-4o-mini (configurable) |
| UI | Glassmorphism + Animated Gradients |

---

## 🧱 Key Features

| Feature | Description |
|----------|-------------|
| 📘 **PDF context** | Reads and embeds accessibility info from the provided guide |
| ⚡ **Live streaming** | Uses SSE for real-time response updates |
| 🧩 **Modular code** | Clear separation between frontend, backend, and utils |
| 💬 **Memory** | Stores conversation context across messages |
| 🧠 **Mock mode** | Optional local testing without OpenAI API |
| 🎨 **Clean UI** | ChatGPT-inspired with blur, gradient, and smooth animations |

---

## 🧾 Example Interaction

**User:**  
> What accessibility regulations exist in Canada?

**Bot:**  
> In Canada, the Accessible Canada Act (ACA) of 2019 promotes barrier-free access in federally regulated sectors. Additionally, provincial laws such as Ontario’s Accessibility for Ontarians with Disabilities Act (AODA) go further in requiring accessible business practices. See Page 8 of the PDF.

---

## 🧑‍💻 Developer Notes

- SSE connection is automatically re-established if interrupted.  
- PDF context is truncated to 180 000 chars for token safety.  
- The project avoids over-engineering, focusing on clarity and real functionality.

---

## 📦 Deployment

To deploy on any platform (Render, Railway, etc.):

1. Set environment variables (`OPENAI_API_KEY`, `OPENAI_MODEL`, `PDF_PATH`).  
2. Serve the built frontend with:
   ```bash
   npm run build
   ```
3. Run FastAPI backend behind a process manager:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

---

## 🧭 License

MIT License © 2025 Miguel Ángel Monturiol Castillo  
For educational and demonstration purposes.
