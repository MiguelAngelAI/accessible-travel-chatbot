import os
import json
import uuid
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from utils.pdf_loader import load_pdf_text

# --- Cargar variables de entorno ---
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("⚠️  No OpenAI API key found in environment variables.")

# --- Inicialización segura del cliente OpenAI ---
client = None
try:
    import openai

    if OPENAI_API_KEY:
        openai.api_key = OPENAI_API_KEY
        client = openai
        print("✅ OpenAI SDK initialized via global API key (safe mode).")
    else:
        print("⚠️ No OPENAI_API_KEY found. Please set it in .env.")
except Exception as e:
    client = None
    print(f"❌ OpenAI SDK initialization failed: {type(e).__name__} — {e}")

# --- App FastAPI ---
app = FastAPI(title="Context-Aware Chat Backend", version="1.1.0")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Estado global ---
PDF_CONTEXT: str = ""
CONVERSATIONS: Dict[str, List[Dict[str, str]]] = {}


@app.on_event("startup")
def startup_event():
    """Carga el PDF al iniciar el servidor."""
    global PDF_CONTEXT
    pdf_path = os.getenv("PDF_PATH", "Accessible_Travel_Guide_Partial.pdf")
    try:
        PDF_CONTEXT = load_pdf_text(pdf_path)
        print(f"📘 PDF loaded successfully ({len(PDF_CONTEXT)} chars).")
    except Exception as e:
        print(f"❌ Error loading PDF: {e}. Check '{pdf_path}' exists.")


@app.get("/health")
def health():
    """Chequeo simple de salud."""
    return {"ok": True, "pdf_loaded": bool(PDF_CONTEXT), "pdf_chars": len(PDF_CONTEXT)}


@app.get("/debug")
def debug():
    """Muestra información de diagnóstico sobre el entorno OpenAI."""
    import sys
    import openai
    return {
        "python_executable": sys.executable,
        "openai_version": getattr(openai, "__version__", "unknown"),
        "openai_file": getattr(openai, "__file__", "unknown"),
        "client_initialized": client is not None,
    }


# --- Funciones auxiliares ---
def ensure_conversation(conv_id: Optional[str]) -> str:
    """Crea o recupera un ID de conversación."""
    if not conv_id:
        conv_id = str(uuid.uuid4())
    if conv_id not in CONVERSATIONS:
        CONVERSATIONS[conv_id] = []
    return conv_id


def build_messages(conv_id: str, user_message: str) -> List[Dict[str, str]]:
    """Construye el historial de mensajes para enviar al modelo."""
    system_prompt = (
        "You are a helpful assistant. Answer the user's questions using the provided PDF context when relevant. "
        "If the answer is in the PDF, cite the section or page briefly (e.g., 'See Page 5'). "
        "If the PDF lacks the answer, state that it's not explicitly covered and provide a best-effort answer.\n\n"
        "--- PDF CONTEXT START ---\n"
        f"{PDF_CONTEXT[:180000]}\n"
        "--- PDF CONTEXT END ---\n"
    )
    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
    for m in CONVERSATIONS.get(conv_id, []):
        messages.append(m)
    messages.append({"role": "user", "content": user_message})
    return messages


def sse_format(payload: Dict[str, Any]) -> str:
    """Formatea un dict como evento SSE."""
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


# --- Endpoint principal GET (SSE compatible) ---
@app.get("/chat")
def chat(message: str, conversation_id: Optional[str] = None):
    """
    Endpoint principal (GET) que devuelve respuestas por streaming SSE.
    Compatible con EventSource en el frontend.
    """
    if client is None or not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured or SDK not initialized.")

    conv_id = ensure_conversation(conversation_id)
    messages = build_messages(conv_id, message)

    def event_stream():
        CONVERSATIONS[conv_id].append({"role": "user", "content": message})
        model_name = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        try:
            stream = openai.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=0.2,
                stream=True,
            )

            assistant_text_chunks: List[str] = []
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and getattr(delta, "content", None):
                    token = delta.content
                    assistant_text_chunks.append(token)
                    yield sse_format({"type": "content", "content": token})

            full_text = "".join(assistant_text_chunks).strip()
            if full_text:
                CONVERSATIONS[conv_id].append({"role": "assistant", "content": full_text})

            yield sse_format({"type": "done", "conversation_id": conv_id})

        except Exception as e:
            yield sse_format({"type": "error", "message": str(e)})

    headers = {
        "Cache-Control": "no-cache",
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    }
    return StreamingResponse(event_stream(), headers=headers, media_type="text/event-stream")
