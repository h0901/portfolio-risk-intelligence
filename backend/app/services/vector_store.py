import faiss
import numpy as np
from app.services.embedder import embed
from app.services.knowledge_base import DOCUMENTS

# Dimension of all-MiniLM-L6-v2 embeddings
EMBEDDING_DIM = 384

_index = None
_documents = None

def build_index():
    """Embed all documents and build the FAISS index. Called once at startup."""
    global _index, _documents

    print("Building FAISS vector index...")
    _documents = DOCUMENTS

    texts = [f"{doc['title']}. {doc['content']}" for doc in _documents]
    embeddings = embed(texts).astype("float32")

    # IndexFlatIP = inner product similarity (works with normalized vectors = cosine similarity)
    _index = faiss.IndexFlatIP(EMBEDDING_DIM)
    _index.add(embeddings)

    print(f"Vector index built with {_index.ntotal} documents.")

def search(query: str, top_k: int = 3) -> list[dict]:
    """Search the vector index for documents most relevant to the query."""
    global _index, _documents

    if _index is None:
        build_index()

    query_vec = embed([query]).astype("float32")

    # Search returns distances and indices of top_k nearest documents
    distances, indices = _index.search(query_vec, top_k)

    results = []
    for dist, idx in zip(distances[0], indices[0]):
        if idx < len(_documents):
            results.append({
                "title": _documents[idx]["title"],
                "content": _documents[idx]["content"].strip(),
                "score": float(dist),
            })

    return results