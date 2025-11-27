# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid, io, re

from pypdf import PdfReader
from bs4 import BeautifulSoup

# our local modules
from .summarizer_led import led_summarize          # <- correct import name
from .rag_flant5 import generate_answer

# --- Embeddings (SBERT) ---
try:
    from sentence_transformers import SentenceTransformer
    SBERT = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
except Exception:
    SBERT = None  # we'll fall back to TF-IDF if needed

app = FastAPI(title="Legal Summarization & RAG (Demo)")

# CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
DOCS: Dict[str, Dict] = {}

# ----------------- helpers -----------------
def extract_text(filename: str, data: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((p.extract_text() or "") for p in reader.pages)
    elif filename.lower().endswith((".html", ".htm")):
        soup = BeautifulSoup(data, "html.parser")
        return soup.get_text(" ")
    else:
        return data.decode("utf-8", errors="ignore")

def clean_text(t: str) -> str:
    t = re.sub(r"\r", "\n", t)
    t = re.sub(r"\s+\n", "\n", t)
    t = re.sub(r"\n{2,}", "\n\n", t)
    t = re.sub(r"[ \t]{2,}", " ", t)
    return t.strip()

def split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[\.!?])\s+(?=[A-Z\(])", text)
    return [s.strip() for s in parts if len(s.strip()) > 0]

def chunk_by_words(text: str, max_words: int = 400) -> List[str]:
    words = text.split()
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words:
            chunks.append(" ".join(cur))
            cur = []
    if cur:
        chunks.append(" ".join(cur))
    return chunks

def extractive_summary(text: str, max_sentences: int = 5) -> List[str]:
    keys = {"court","issue","hold","reason","contract","clause","section","order","notice","termination"}
    scored = []
    for s in split_sentences(text):
        tokens = re.findall(r"[A-Za-z]{3,}", s.lower())
        score = len(tokens) + sum(2 for t in tokens if t in keys)
        scored.append((score, s))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [s for _, s in scored[:max_sentences]]

# ----------------- models -----------------
class UploadOut(BaseModel):
    doc_id: str
    title: str
    chars: int

class SummarizeIn(BaseModel):
    doc_id: str
    mode: str = "abstractive"   # "abstractive" (LED) | "extractive"

class IndexIn(BaseModel):
    doc_id: str

class RagIn(BaseModel):
    doc_id: str
    question: str
    k: int = 5

# ----------------- routes -----------------
@app.post("/upload", response_model=UploadOut)
async def upload(file: UploadFile = File(...)):
    data = await file.read()
    text = clean_text(extract_text(file.filename, data))
    doc_id = str(uuid.uuid4())[:8]
    DOCS[doc_id] = {
        "title": file.filename,
        "text": text,
        "sentences": split_sentences(text),
        "chunks": chunk_by_words(text, 250),
    }
    return UploadOut(doc_id=doc_id, title=file.filename, chars=len(text))

@app.post("/summarize")
def summarize(inp: SummarizeIn):
    if inp.doc_id not in DOCS:
        return {"error": "Document not found"}
    text = DOCS[inp.doc_id]["text"]

    if inp.mode == "abstractive":
        summary = led_summarize(text, want_bullets=False)   # set True to return a bullet list
        return {"doc_id": inp.doc_id, "summary": summary}   # string paragraph (or list if want_bullets=True)
    else:
        return {"doc_id": inp.doc_id, "summary": extractive_summary(text)}  # list of strings

@app.post("/index")
def build_index(inp: IndexIn):
    if inp.doc_id not in DOCS:
        return {"error": "doc not found"}
    sents = DOCS[inp.doc_id]["sentences"]
    if not sents:
        return {"error": "no sentences"}
    try:
        if SBERT is None:
            raise RuntimeError("SBERT unavailable")
        X = SBERT.encode(sents, convert_to_numpy=True, normalize_embeddings=True)
        DOCS[inp.doc_id]["emb"] = X
        return {"doc_id": inp.doc_id, "sentences": len(sents), "retriever": "sbert"}
    except Exception as e:
        # fallback: TF-IDF
        from sklearn.feature_extraction.text import TfidfVectorizer
        vec = TfidfVectorizer(ngram_range=(1,2), min_df=1)
        X = vec.fit_transform(sents)
        DOCS[inp.doc_id]["tfidf_vec"] = vec
        DOCS[inp.doc_id]["tfidf_X"] = X
        return {"doc_id": inp.doc_id, "sentences": len(sents), "retriever": "tfidf", "note": str(e)}

@app.post("/ask")
def ask(inp: RagIn):
    if inp.doc_id not in DOCS:
        return {"error": "Document not found"}

    sents = DOCS[inp.doc_id]["sentences"]
    hits = []

    if "emb" in DOCS[inp.doc_id]:
        import numpy as np
        q = SBERT.encode([inp.question], convert_to_numpy=True, normalize_embeddings=True)[0]
        X = DOCS[inp.doc_id]["emb"]
        sims = (X @ q)
        idx = np.argsort(-sims)[:inp.k]
        hits = [{"i": int(i), "text": sents[int(i)], "score": float(sims[int(i)])} for i in idx]
    elif "tfidf_vec" in DOCS[inp.doc_id]:
        from sklearn.metrics.pairwise import cosine_similarity
        vec = DOCS[inp.doc_id]["tfidf_vec"]; X = DOCS[inp.doc_id]["tfidf_X"]
        sims = cosine_similarity(X, vec.transform([inp.question])).ravel()
        idx = sims.argsort()[::-1][:inp.k]
        hits = [{"i": int(i), "text": sents[int(i)], "score": float(sims[int(i)])} for i in idx]
    else:
        return {"error": "Document not indexed. Call /index first."}

    context = "\n".join(h["text"] for h in hits)
    answer = generate_answer(inp.question, context)

    return {
        "answer": answer,
        "citations": [{"i": h["i"], "score": round(h["score"], 3), "text": h["text"][:300]} for h in hits],
    }
