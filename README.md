# 📘 Towards Risk-Aware Legal NLP  
### Benchmarking Transformer Models & Proposing an Attention-Based Anomaly Detection Framework

This repository contains the full implementation of our Legal NLP capstone project, which unifies **summarization**, **clause retrieval**, and **risk/anomaly detection** into one modular, explainable pipeline.  
The system is optimized for **long-form legal contracts** and **regulatory documents**, with a focus on **real-time clause-level reasoning** and **transformer-based analysis**.

The project is based on our research poster:  
**“Towards Risk-Aware Legal NLP”**

---

# 🚀 Project Overview

Legal documents are long, complex, and context-dense.  
Traditional keyword search or rule-based systems fail to capture deeper semantic meaning.

This project introduces a **three-module, integrated pipeline**:

### **1. Summarization Module**
Generates concise, abstractive summaries using a **fine-tuned BART model**.

### **2. Retrieval-Augmented Generation (RAG)**
Retrieves the most relevant clauses using **E5-base-v2 embeddings**  
and answers questions using **Flan-T5**, grounded in retrieved evidence.

### **3. Risk & Anomaly Detection**
Detects unusual or risky clauses using:
- **LegalBERT**  
- **InLegalBERT**  
- **E5 semantic deviation**  
- Fused using **Reciprocal Rank Fusion (RRF)**

The final output includes:
- High-quality summaries  
- Clause-grounded Q&A  
- Color-coded risk classification:  
  - 🟢 Green – Normal  
  - 🟡 Yellow – Moderate deviation  
  - 🟠 Orange – High-risk clause  

---

# 🏗️ System Architecture

        ┌─────────────────────────────┐
        │     PDF / Contract Upload   │
        └───────────────▲─────────────┘
                        │
            Text Extraction (pdfplumber)
                        │
        ┌───────────────▼──────────────┐
        │      Clause Segmentation      │
        └───────────────▲──────────────┘
                        │
        ┌───────────────┼──────────────┬─────────────────┐
        │               │              │                 │
        ▼               ▼              ▼                 │
Abstractive      Semantic Retrieval   Risk / Anomaly     │
Summarization      (E5 + T5)          Detection          │
   (BART)                         (LegalBERT Ensemble)   │
        │               │              │                 │
        └───────────────┼──────────────┴─────────────────┘
                        ▼
          Unified Review Dashboard Output


---

# 📦 Core Modules

## **1. Summarization**
- Fine-tuned **BART** model  
- Produces extractive + abstractive summaries  
- Evaluation:
  - **ROUGE-L: 0.3454**
  - **BERTScore-F1: 0.8682**

---

## **2. Retrieval-Augmented Generation (RAG)**
- Uses **E5-base-v2 embeddings** for clause similarity search  
- **Flan-T5** performs grounded question answering  
- Reduces hallucinations vs standalone LLMs  
- Ideal for complex contract queries  

---

## **3. Clause-Level Risk Detection**

Uses **three independent deviation signals**:

| Signal Type           | Model Used      | Purpose                               |
|----------------------|-----------------|----------------------------------------|
| Linguistic deviation | InLegalBERT     | Token-level irregularity               |
| Semantic deviation   | LegalBERT       | Meaning shift detection                |
| Contextual deviation | E5 Embeddings   | Out-of-distribution clause behavior    |

Combined via **RRF (Reciprocal Rank Fusion)** → stable, ranked anomaly scores.

Final color classification:
- 🟢 **Green** – Contextually normal  
- 🟡 **Yellow** – Moderate deviation  
- 🟠 **Orange** – High-risk or unusual clause  

---

# 🧠 Research Motivation

As summarized in the research poster:

### Key gaps in existing Legal NLP:
- Systems treat summarization, retrieval, and anomaly detection as *separate* tasks  
- Datasets (CUAD, ContractEval, LexRAG) lack **risk scoring**  
- Transformer models hallucinate without grounding  
- Existing anomaly benchmarks (RAAD, TAD-Bench) are not generalizable  

### Our contributions:
- Fully integrated **end-to-end legal intelligence pipeline**  
- Clause-grounded RAG + summarization + anomaly scoring  
- Multi-signal deviation detection with RRF  
- High interpretability designed for legal practitioners  

---

# 📊 Results

- Summaries were **factual and context-preserving**  
- RAG module achieved strong clause retrieval accuracy (E5 embeddings)  
- Multi-model deviation scoring achieved **>90% interpretability accuracy**  
- End-to-end pipeline ran efficiently on full legal documents (GPU optimized)  

---

# 🛠️ Tech Stack

### **Backend & Processing**
- FastAPI  
- pdfplumber  
- SQLAlchemy  
- PyTorch (GPU inference)  

### **Models**
- **BART** (Summarization)  
- **E5-base-v2** (Embeddings)  
- **Flan-T5** (RAG / Q&A)  
- **LegalBERT**, **InLegalBERT** (Risk metrics)  

### **Outputs**
- Summaries (text)  
- Clause-grounded Q&A  
- Risk-colored PDF reports (Green/Yellow/Orange)  

---

