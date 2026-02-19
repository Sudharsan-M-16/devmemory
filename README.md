# DevMemory

> An AI that remembers how *you* fix bugs — not how the internet does.

## The problem

You hit an error. You Google it, paste it into ChatGPT, get a generic answer. DevMemory does something different: it builds a **personal memory** of every error you've seen and how you fixed it. When you hit a new error, it searches that history first and says: *"You hit something like this before; you fixed it by doing X."*

## What it does

- **Learn**: Store errors and how you fixed them (from terminal or manually).
- **Query**: Paste an error → semantic search over your history → RAG-backed suggestion from Claude.
- **Eval**: Leave-one-out benchmark to measure retrieval precision.

## How it works

1. **Semantic fingerprint** — Parser extracts error type, message, and top stack frames (skips stdlib/site-packages).
2. **Embeddings** — `sentence-transformers/all-MiniLM-L6-v2` turns text into vectors (meaning, not just keywords).
3. **Vector store** — ChromaDB (local, cosine similarity) stores and retrieves similar past errors.
4. **RAG** — Top similar past errors + fixes are passed to Claude to generate a personalized suggestion.

## Stack

- **Embeddings**: sentence-transformers/all-MiniLM-L6-v2  
- **Vector DB**: ChromaDB (local, persistent)  
- **LLM**: Claude API (claude-sonnet)  
- **Language**: Python 3.9+

## Quick start

```bash
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY (get one at console.anthropic.com)
```

**Query an error:**

```bash
python -m cli.main query "AttributeError: 'NoneType' object has no attribute 'id'"
```

**Teach a fix:**

```bash
python -m cli.main learn "ModuleNotFoundError: No module named 'pandas'" "pip install pandas"
```

**Run benchmark (leave-one-out on eval set):**

```bash
python -m eval.benchmark
```

## Project layout

```
devmemory/
├── core/
│   ├── parser.py   # Semantic fingerprint from tracebacks
│   ├── memory.py   # ChromaDB + embeddings (store/search)
│   └── llm.py      # Claude RAG prompt
├── cli/
│   └── main.py     # query / learn
├── eval/
│   ├── test_errors.json
│   └── benchmark.py
├── data/.chromadb  # Local DB (created on first run)
├── requirements.txt
└── .env
```

## Benchmark

After adding more cases to `eval/test_errors.json`, run:

```bash
python -m eval.benchmark
```

Report Precision@1 and Precision@3 in your README. Methodology: leave-one-out evaluation on manually labeled error/fix pairs.

## License

MIT
