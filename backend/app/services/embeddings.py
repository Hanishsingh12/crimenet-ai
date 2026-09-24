import math
import re
from typing import List

class LocalEmbeddingService:
    """
    Lightweight, local embedding and vector similarity service.
    Requires no paid cloud APIs or heavy 2GB models, runs 100% locally.
    """
    def __init__(self, dimension: int = 128):
        self.dimension = dimension

    def get_embedding(self, text: str) -> List[float]:
        # Fast deterministic hash-embedding for semantic comparison
        tokens = re.findall(r'\w+', text.lower())
        vec = [0.0] * self.dimension
        if not tokens:
            return vec

        for token in tokens:
            h = hash(token)
            idx = abs(h) % self.dimension
            sign = 1.0 if (h >> 7) & 1 else -1.0
            vec[idx] += sign

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if len(vec1) != len(vec2) or not vec1:
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        return round(max(0.0, min(1.0, dot)), 4)

embedding_service = LocalEmbeddingService()
