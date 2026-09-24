import re
from typing import Dict, Any, List

class EntityNormalizationService:
    @staticmethod
    def normalize_name(name: str) -> str:
        cleaned = re.sub(r'^(?:mr\.|ms\.|shri|dr\.)\s*', '', name.strip(), flags=re.IGNORECASE)
        parts = cleaned.split()
        return " ".join([p.capitalize() for p in parts])

    @staticmethod
    def normalize_phone(phone: str) -> str:
        digits = re.sub(r'\D', '', phone)
        if len(digits) > 10 and digits.startswith('91'):
            digits = digits[2:]
        return digits[-10:] if len(digits) >= 10 else digits

    @staticmethod
    def normalize_vehicle(v_reg: str) -> str:
        return re.sub(r'[\s\-]', '', v_reg).upper()

    @staticmethod
    def calculate_match_confidence(entity1: Dict[str, Any], entity2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Multi-attribute matching engine. Never merges solely on name similarity.
        """
        score = 0.0
        reasons = []

        # Phone match (high weight)
        p1 = EntityNormalizationService.normalize_phone(entity1.get("phone", ""))
        p2 = EntityNormalizationService.normalize_phone(entity2.get("phone", ""))
        if p1 and p2 and p1 == p2:
            score += 0.45
            reasons.append("Exact normalized phone number match")

        # Vehicle registration match (high weight)
        v1 = EntityNormalizationService.normalize_vehicle(entity1.get("vehicle", ""))
        v2 = EntityNormalizationService.normalize_vehicle(entity2.get("vehicle", ""))
        if v1 and v2 and v1 == v2:
            score += 0.40
            reasons.append("Matching vehicle registration identifier")

        # Name comparison (moderate weight)
        n1 = EntityNormalizationService.normalize_name(entity1.get("name", ""))
        n2 = EntityNormalizationService.normalize_name(entity2.get("name", ""))
        if n1 and n2:
            if n1.lower() == n2.lower():
                score += 0.25
                reasons.append("Exact full name match")
            elif n1.split()[0].lower() == n2.split()[0].lower() and len(n1) > 3:
                score += 0.15
                reasons.append("First name and partial identifier alignment")

        # Organization match
        org1 = entity1.get("organization", "").lower().strip()
        org2 = entity2.get("organization", "").lower().strip()
        if org1 and org2 and org1 == org2:
            score += 0.20
            reasons.append("Matching employer or corporate entity registration")

        # Location overlap
        loc1 = entity1.get("location", "").lower().strip()
        loc2 = entity2.get("location", "").lower().strip()
        if loc1 and loc2 and loc1 == loc2:
            score += 0.10
            reasons.append("Co-located geographic presence")

        confidence = round(min(1.0, score), 2)
        is_match = confidence >= 0.70

        return {
            "match": is_match,
            "confidence": confidence,
            "reasons": reasons if reasons else ["Insufficient multi-attribute alignment"]
        }

normalizer = EntityNormalizationService()
