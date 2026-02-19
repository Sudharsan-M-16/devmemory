import chromadb
from pathlib import Path
from datetime import datetime
import hashlib
from chromadb.utils import embedding_functions


class DevMemory:
    def __init__(self, db_path="./data/.chromadb"):

        Path(db_path).mkdir(parents=True, exist_ok=True)

        # Create Chroma-compatible embedding function
        embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )

        self.client = chromadb.PersistentClient(path=db_path)

        self.collection = self.client.get_or_create_collection(
            name="error_memory",
            embedding_function=embedding_fn,
            metadata={"hnsw:space": "cosine"}
        )

        print("DevMemory initialized")

    def store(self, fingerprint, fix, project="unknown"):
        text = fingerprint.to_embed_text()

        base = hashlib.md5(text.encode()).hexdigest()[:12]
        uid = f"err_{base}"
        self.collection.add(
            documents=[text],
            metadatas=[{
                "error_type": fingerprint.error_type,
                "error_message": fingerprint.error_message,
                "fix": fix,
                "project": project,
                "date": datetime.now().isoformat()
            }],
            ids=[uid]
        )

    def search(self, fingerprint, n_results=3, threshold=0.55):

        if self.collection.count() == 0:
            return []

        text = fingerprint.to_embed_text()

        results = self.collection.query(
            query_texts=[text],
            n_results=n_results,
            include=["documents", "metadatas", "distances"]
        )

        matches = []

        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            similarity = 1 - dist
            if similarity >= threshold:
                matches.append({
                    "similarity": round(similarity, 3),
                    "fix": meta["fix"],
                    "date": meta["date"],
                    "error_type": meta["error_type"]
                })


        matches.sort(key=lambda x: x["similarity"], reverse=True)
        return matches

    def list(self, limit=100):
        """Return all stored errors for the memory browser"""
        try:
            results = self.collection.get(
                limit=limit,
                include=["metadatas", "documents"]
            )

            entries = []
            for meta in results["metadatas"]:
                entries.append({
                    "error_type": meta.get("error_type"),
                    "error_message": meta.get("error_message"),
                    "fix": meta.get("fix"),
                    "date": meta.get("date"),
                    "project": meta.get("project", "unknown")
                })

            return entries
        except Exception as e:
            print(f"Error listing memory: {e}")
            return []

    def get_all_metadatas(self):
        """Return raw metadatas for stats computation"""
        try:
            results = self.collection.get(include=["metadatas"])
            return results["metadatas"]
        except Exception as e:
            print("Error fetching metadatas:", e)
            return []

    def count(self):
        return self.collection.count()

