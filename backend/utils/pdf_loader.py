from pathlib import Path
from typing import Optional
from PyPDF2 import PdfReader

def load_pdf_text(pdf_path: str) -> str:
    path = Path(pdf_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF not found at: {pdf_path}")
    reader = PdfReader(str(path))
    texts = []
    for i, page in enumerate(reader.pages):
        try:
            txt = page.extract_text() or ""
        except Exception:
            txt = ""
        # Marca de página para que el modelo entienda la división
        texts.append(f"\n\n[Page {i+1}]\n{txt.strip()}")
    full_text = "\n".join(texts).strip()
    # Saneado básico
    return " ".join(full_text.split())
