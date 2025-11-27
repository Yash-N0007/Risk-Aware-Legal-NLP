from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

print("Loading FLAN-T5 for RAG answers...")
model_name = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
rag_pipeline = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

def generate_answer(question, context):
    prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer:"
    out = rag_pipeline(prompt, max_length=256, do_sample=False)[0]["generated_text"]
    return out