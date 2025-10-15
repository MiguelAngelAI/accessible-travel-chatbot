import os
import json
import uuid
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from utils.pdf_loader import load_pdf_text

# =========================================================
# 🔧 CONFIGURACIÓN INICIAL
# =========================================================
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PDF_PATH = os.getenv("PDF_PATH", "accessible_travel.pdf")

if not OPENAI_API_KEY:
    print("⚠️  WARNING: OPENAI_API_KEY is not set. Check your .env file.")

# =========================================================
# 🤖 INICIALIZACIÓN DEL CLIENTE OPENAI
# =========================================================
client = None

try:
    import openai

    if OPENAI_API_KEY:
        # Configuración global de la API key (sin usar Client ni OpenAI())
        openai.api_key = OPENAI_API_KEY
        client = openai
        print("✅ OpenAI SDK initialized via global API key (safe mode).")
    else:
        print("⚠️ No OPENAI_API_KEY found. Please set it in .env.")

except Exception as e:
    client = None
    print(f"❌ OpenAI SDK initialization failed: {type(e).__name__} — {e}")

# =========================================================
# 🚀 CONFIGURACIÓN DE FASTAPI
# =========================================================
app = FastAPI(title="Context-Aware Chat Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # en producción, restringe a tu dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PDF_CONTEXT: str = ""
CONVERSATIONS: Dict[str, List[Dict[str, str]]] = {}  # conv_id -> messages[]

# =========================================================
# 🧱 MODELOS DE DATOS
# =========================================================
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


# =========================================================
# ⚙️ EVENTO DE INICIO
# =========================================================
@app.on_event("startup")
def startup_event():
    global PDF_CONTEXT
    try:
        PDF_CONTEXT = load_pdf_text(PDF_PATH)
        print(f"📘 PDF loaded successfully ({len(PDF_CONTEXT)} chars).")
    except Exception as e:
        print(f"❌ ERROR loading PDF: {e}. Make sure '{PDF_PATH}' exists.")


# =========================================================
# 💓 HEALTH CHECK
# =========================================================
@app.get("/health")
def health():
    return {
        "ok": True,
        "pdf_loaded": bool(PDF_CONTEXT),
        "pdf_chars": len(PDF_CONTEXT),
        "client_initialized": client is not None,
    }


# =========================================================
# 🧠 FUNCIONES AUXILIARES
# =========================================================
def ensure_conversation(conv_id: Optional[str]) -> str:
    """Crea o recupera un ID de conversación."""
    if not conv_id:
        conv_id = str(uuid.uuid4())
    if conv_id not in CONVERSATIONS:
        CONVERSATIONS[conv_id] = []
    return conv_id


def build_messages(conv_id: str, user_message: str) -> List[Dict[str, str]]:
    """Crea el contexto con system prompt + historial + mensaje nuevo."""
    system_prompt = (
        "You are a helpful assistant. Use the provided PDF context to answer user questions accurately. "
        "If the answer is in the PDF, reference the relevant page (e.g., 'See Page 5'). "
        "If not explicitly in the PDF, say so and provide a general explanation.\n\n"
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
    """Formatea un dict como evento SSE (Server-Sent Events)."""
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


# =========================================================
# 💬 ENDPOINT PRINCIPAL: /chat
# =========================================================
@app.get("/chat")
async def chat_get(request: Request, message: str):
    """Versión GET (SSE) compatible con frontend EventSource."""
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not found in environment (.env missing or invalid).")
    if client is None:
        raise HTTPException(status_code=500, detail="OpenAI client not initialized properly. Check SDK version or import.")

    conv_id = str(uuid.uuid4())
    conv_id = ensure_conversation(conv_id)  # ✅ Inicializa la conversación
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

            full_assistant_text = "".join(assistant_text_chunks).strip()
            if full_assistant_text:
                CONVERSATIONS[conv_id].append({"role": "assistant", "content": full_assistant_text})

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


# =========================================================
# (Opcional) Versión POST - por compatibilidad
# =========================================================
@app.post("/chat")
def chat_post(req: ChatRequest):
    """Sigue funcionando igual para pruebas POST manuales."""
    return {"message": "Use the GET /chat endpoint for streaming."}
