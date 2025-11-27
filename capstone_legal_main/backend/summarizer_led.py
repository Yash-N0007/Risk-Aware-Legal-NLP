# backend/summarizer_led.py
import os, re
from typing import List, Union
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# --- choose local fine-tuned LED if available ---
LOCAL_LED_PATH = os.getenv(
    "LED_MODEL_PATH",
    r"C:\Users\Atharva Dhuri\Desktop\Capstone\models\legal-led-final\final"
)
USE_LOCAL = os.path.exists(os.path.join(LOCAL_LED_PATH, "config.json"))

MODEL_ID = LOCAL_LED_PATH if USE_LOCAL else "allenai/led-base-16384"
print(f"Loading summarization model: {MODEL_ID}")

# LED fast tokenizer can be flaky on Windows + local folders; use_fast=False is safe.
tok = AutoTokenizer.from_pretrained(MODEL_ID, local_files_only=USE_LOCAL, use_fast=False)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID, local_files_only=USE_LOCAL)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Optional FP16 on CUDA: big speed + memory savings
if DEVICE.type == "cuda":
    try:
        model.half()  # FP16 weights
    except Exception:
        pass

model = model.to(DEVICE).eval()
torch.set_num_threads(max(1, (os.cpu_count() or 4) // 2))  # keep CPU responsive

# --- helpers -----------------------------------------------------------------

def _split_sents(t: str) -> List[str]:
    parts = re.split(r"(?<=[\.!?])\s+(?=[A-Z\(])", t)
    return [s.strip() for s in parts if s.strip()]

def _chunk_by_tokens(text: str, max_tokens: int = 3500) -> List[str]:
    """
    LED can handle long context, but staying <= ~4k tokens keeps memory/time sane on consumer GPUs.
    We approximate token count by ~1 token per 4 chars. Good enough for chunking.
    """
    sents = _split_sents(text)
    chunks, cur, cur_est = [], [], 0
    for s in sents:
        est = max(1, len(s) // 4)  # rough token estimate
        if cur and cur_est + est > max_tokens:
            chunks.append(" ".join(cur)); cur, cur_est = [], 0
        cur.append(s); cur_est += est
    if cur:
        chunks.append(" ".join(cur))
    return chunks

# --- core generation ----------------------------------------------------------

def _led_once(input_text: str, max_new: int = 300, min_new: int = 80,
              num_beams: int = 4, no_repeat_ngram_size: int = 3,
              length_penalty: float = 1.0) -> str:
    """
    One LED pass. Uses global attention on the first token (required for LED).
    """
    enc = tok(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=4096  # upper cap for safety; adjust if your GPU has headroom
    )
    input_ids = enc.input_ids.to(DEVICE)
    global_attn = torch.zeros_like(input_ids, device=DEVICE)
    global_attn[:, 0] = 1  # LED needs at least one global token (usually BOS)

    with torch.no_grad():
        # AMP autocast helps when model is half() on CUDA
        autocast = torch.cuda.amp.autocast if DEVICE.type == "cuda" else torch.cpu.amp.autocast
        with autocast():
            out = model.generate(
                input_ids=input_ids,
                global_attention_mask=global_attn,
                num_beams=num_beams,
                max_new_tokens=max_new,
                min_new_tokens=min_new,
                length_penalty=length_penalty,
                no_repeat_ngram_size=no_repeat_ngram_size,
                early_stopping=True
            )
    return tok.decode(out[0], skip_special_tokens=True, clean_up_tokenization_spaces=True)

def led_summarize(text: str, want_bullets: bool = False) -> Union[str, List[str]]:
    """
    Two-stage summary:
      1) Summarize each chunk
      2) Stitch and compress again to get a cohesive final
    """
    text = (text or "").strip()
    if not text:
        return [] if want_bullets else ""

    # Stage 1: chunk summaries (tune max_tokens to your GPU)
    chunks = _chunk_by_tokens(text, max_tokens=3500)
    first_pass = [
        _led_once(ch, max_new=300, min_new=80)  # per-chunk target size
        for ch in chunks
    ]

    # Stage 2: compress stitched
    stitched = " ".join(first_pass)
    final = _led_once(stitched, max_new=420, min_new=160, num_beams=5, length_penalty=1.05)

    if not want_bullets:
        return final

    # Return 4–6 clean bullets
    sents = _split_sents(final)
    bullets = [s for s in sents if len(s) > 15][:6]
    return bullets
