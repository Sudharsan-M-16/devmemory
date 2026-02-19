# DevMemory

> A local-first AI system that builds a personal memory of your debugging history and retrieves how *you* fixed similar errors in the past.

DevMemory observes errors, embeds them into a vector database, and performs semantic retrieval over your own debugging history before asking an LLM. Instead of generic internet advice, it surfaces fixes that **you personally used before**.

---

## Why This Exists

Most AI coding tools treat you like a stranger every time.

They know the internet.  
They don’t know *you*.

DevMemory fills that gap by building a persistent, private memory of:

- Errors you encountered  
- How you fixed them  
- When and where they occurred  

When a new error appears, DevMemory retrieves semantically similar past errors and uses them as context for a personalized suggestion.

---

## Key Capabilities

- Semantic parsing of Python tracebacks into compact fingerprints  
- Vector-based retrieval using sentence embeddings  
- Retrieval-Augmented Generation (RAG) over personal history  
- Leave-one-out evaluation harness with Precision@k metrics  
- CLI + FastAPI backend + React dashboard  
- Fully local-first (no code sent to external services by default)

---

## Architecture

Terminal / UI
|
v
Parser (semantic fingerprint)
|
v
Embedding Model (MiniLM)
|
v
ChromaDB (local vector store)
|
v
Top-k Similar Errors + Fixes
|
v
LLM (RAG Prompt)
|
v
Personalized Fix Suggestion


---

## Tech Stack

- Python 3.10+  
- sentence-transformers (all-MiniLM-L6-v2)  
- ChromaDB (persistent local vector DB)  
- FastAPI (backend)  
- React + Vite (frontend dashboard)  
- Ollama / Claude (LLM backend)

---

## Example Workflow

1. Paste error or capture it from terminal  
2. DevMemory parses and embeds it  
3. Retrieves similar past errors  
4. Generates suggestion grounded in your history  
5. You optionally store the new fix

---

## CLI Usage

Create environment:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Query an error:

python -m cli.main query "AttributeError: 'NoneType' object has no attribute 'id'"
Teach a fix:

python -m cli.main learn "ModuleNotFoundError: No module named 'pandas'" "pip install pandas"
Evaluation
DevMemory includes a leave-one-out retrieval benchmark on labeled error/fix pairs.

Run:

python -m eval.benchmark
Current results (30 test cases):

Precision@1 ≈ 92.6%

Precision@3 ≈ 92.6%

No-match cases: 0

These numbers measure retrieval quality, not LLM correctness.

Project Structure
devmemory/
├── core/
│   ├── parser.py
│   ├── memory.py
│   └── llm.py
├── cli/
│   └── main.py
├── backend/
│   └── main.py
├── ui/
│   └── (React frontend)
├── eval/
│   ├── benchmark.py
│   └── test_errors.json
├── data/
├── requirements.txt
└── README.md
