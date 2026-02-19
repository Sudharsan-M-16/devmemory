from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import sys
import os
from collections import Counter

# Add parent directory to path so we can import from core/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.parser import parse_traceback
from core.memory import DevMemory
from core.llm import generate_fix_suggestion

app = FastAPI(title="DevMemory API")

# CORS - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React + Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize memory once
memory = DevMemory()

# Request models
class QueryRequest(BaseModel):
    error_text: str

class LearnRequest(BaseModel):
    error_text: str
    fix: str

# Response models
class Fingerprint(BaseModel):
    error_type: str
    error_message: str

class Match(BaseModel):
    similarity: float
    fix: str
    date: str

class QueryResponse(BaseModel):
    fingerprint: Fingerprint
    matches: List[Match]
    suggestion: str

@app.post("/query", response_model=QueryResponse)
async def query_error(req: QueryRequest):
    """Parse error, find similar past errors, generate suggestion"""
    
    # Parse the error
    fingerprint = parse_traceback(req.error_text)
    if not fingerprint:
        raise HTTPException(status_code=400, detail="Could not parse error traceback")
    
    # Search memory
    matches = memory.search(fingerprint, n_results=5)
    
    # Generate suggestion
    suggestion = generate_fix_suggestion(fingerprint, matches)
    
    return {
        "fingerprint": {
            "error_type": fingerprint.error_type,
            "error_message": fingerprint.error_message
        },
        "matches": matches[:3],  # Return top 3 for UI
        "suggestion": suggestion
    }

@app.post("/learn")
async def learn_error(req: LearnRequest):
    """Store a new error + fix in memory"""
    
    fingerprint = parse_traceback(req.error_text)
    if not fingerprint:
        raise HTTPException(status_code=400, detail="Could not parse error traceback")
    
    memory.store(fingerprint, req.fix)
    
    return {"success": True, "message": "Stored in memory"}

@app.get("/stats")
async def get_stats():
    metas = memory.get_all_metadatas()
    total = len(metas)

    if total == 0:
        return {
            "total_errors": 0,
            "avg_similarity": 0,
            "most_common_type": None,
            "error_type_counts": [],
            "recent_errors": [],
            "similarity_distribution": []
        }

    # Error type counts
    types = [m["error_type"] for m in metas if m.get("error_type")]
    type_counts = Counter(types)

    error_type_counts = [
        {"type": k, "count": v}
        for k, v in type_counts.most_common(10)
    ]

    most_common_type = type_counts.most_common(1)[0][0]

    # Errors per day
    per_day = Counter()
    for m in metas:
        d = m.get("date")
        if d:
            day = d.split("T")[0]
            per_day[day] += 1

    recent_errors = [
        {"date": k, "count": v}
        for k, v in sorted(per_day.items())[-14:]
    ]

    # Similarity distribution (from recent searches)
    sims = []
    for m in metas:
        if "similarity" in m:
            sims.append(m["similarity"])

    avg_similarity = round(sum(sims)/len(sims),3) if sims else 0

    buckets = {
        "0.5-0.6":0, "0.6-0.7":0, "0.7-0.8":0, "0.8-0.9":0, "0.9-1.0":0
    }

    for s in sims:
        if 0.5 <= s < 0.6: buckets["0.5-0.6"]+=1
        elif 0.6 <= s < 0.7: buckets["0.6-0.7"]+=1
        elif 0.7 <= s < 0.8: buckets["0.7-0.8"]+=1
        elif 0.8 <= s < 0.9: buckets["0.8-0.9"]+=1
        elif s >= 0.9: buckets["0.9-1.0"]+=1

    similarity_distribution = [
        {"bucket":k,"count":v} for k,v in buckets.items()
    ]

    return {
        "total_errors": total,
        "avg_similarity": avg_similarity,
        "most_common_type": most_common_type,
        "error_type_counts": error_type_counts,
        "recent_errors": recent_errors,
        "similarity_distribution": similarity_distribution
    }

@app.get("/memory")
async def get_memory(search: Optional[str] = None, error_type: Optional[str] = None):
    entries = memory.list(limit=200)
    
    # Filter by search term
    if search:
        search_lower = search.lower()
        entries = [
            e for e in entries
            if search_lower in (e.get("error_message", "") or "").lower()
            or search_lower in (e.get("fix", "") or "").lower()
        ]
    
    # Filter by error type
    if error_type and error_type != "all":
        entries = [e for e in entries if e.get("error_type") == error_type]
    
    return entries

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "memory_count": memory.count(),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)