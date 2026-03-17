from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at startup — cached after first load
_model = None

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("Loading embedding model (first time only)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded.")
    return _model

def embed(texts: list[str]) -> np.ndarray:
    model = get_model()
    return model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)

def embed_single(text: str) -> np.ndarray:
    return embed([text])[0]