import re
from typing import Dict, List, Any

# Deterministic Regex Patterns
PHONE_REGEX = re.compile(r'(?:\+?91[\-\s]?)?[6-9]\d{9}')
VEHICLE_REGEX = re.compile(r'[A-Z]{2}[-\s]?\d{2}[-\s]?[A-Z]{1,2}[-\s]?\d{4}', re.IGNORECASE)
BANK_ACCOUNT_REGEX = re.compile(r'\b\d{9,18}\b')
CASE_ID_REGEX = re.compile(r'\b(?:CASE|FIR)[-\s]?\d{4}[-\s]?\d{3,4}\b', re.IGNORECASE)
DATE_REGEX = re.compile(r'\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b')

# Lexicon for deterministic entity categorisation
KNOWN_CRIME_TYPES = [
    "Smuggling", "Extortion", "Counterfeit Currency", "Money Laundering",
    "Illegal Weapons Trafficking", "Cyber Fraud", "Narcotics", "Theft", "Bribery"
]

KNOWN_LOCATIONS = [
    "New Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru", "Hyderabad",
    "Ahmedabad", "Jaipur", "Surat", "Chandigarh", "Noida", "Gurugram", "Warehouse Sector 18",
    "Okhla Industrial Area", "Nhava Sheva Port", "Aerocity", "Connaught Place"
]

class EntityExtractionService:
    @staticmethod
    def extract_from_text(text: str) -> Dict[str, Any]:
        entities = {
            "PHONE": [],
            "VEHICLE": [],
            "BANK_ACCOUNT": [],
            "CASE": [],
            "DATE": [],
            "CRIME_TYPE": [],
            "LOCATION": [],
            "PERSON": [],
            "ORGANIZATION": []
        }

        # 1. Deterministic Regex Extraction
        phones = list(set(PHONE_REGEX.findall(text)))
        entities["PHONE"] = [{"value": p, "confidence": 0.98, "method": "regex"} for p in phones]

        vehicles = list(set(VEHICLE_REGEX.findall(text)))
        entities["VEHICLE"] = [{"value": v.upper().replace(" ", "-"), "confidence": 0.95, "method": "regex"} for v in vehicles]

        cases = list(set(CASE_ID_REGEX.findall(text)))
        entities["CASE"] = [{"value": c.upper(), "confidence": 0.99, "method": "regex"} for c in cases]

        dates = list(set(DATE_REGEX.findall(text)))
        entities["DATE"] = [{"value": d, "confidence": 0.90, "method": "regex"} for d in dates]

        # 2. Known Lexicon Matching
        for ct in KNOWN_CRIME_TYPES:
            if re.search(r'\b' + re.escape(ct) + r'\b', text, re.IGNORECASE):
                entities["CRIME_TYPE"].append({"value": ct, "confidence": 0.92, "method": "lexicon"})

        for loc in KNOWN_LOCATIONS:
            if re.search(r'\b' + re.escape(loc) + r'\b', text, re.IGNORECASE):
                entities["LOCATION"].append({"value": loc, "confidence": 0.90, "method": "lexicon"})

        # 3. Rule-based Pattern for Person Names & Organizations
        # e.g., "Mr. Rajesh Sharma", "Shri Vikram Malhotra", "Sunil Verma", "Apex Logistics Ltd"
        person_matches = re.findall(r'\b(?:Mr\.|Shri|Dr\.|Ms\.)?\s*([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b', text)
        for p in set(person_matches):
            p_clean = p.strip()
            # Filter common words
            if p_clean not in ["New Delhi", "Smart India", "Criminal Network", "Apex Logistics", "Prime Freight"]:
                entities["PERSON"].append({"value": p_clean, "confidence": 0.86, "method": "heuristic_nlp"})

        org_matches = re.findall(r'\b([A-Z][a-zA-Z0-9\s]{2,25}(?:Logistics|Enterprises|Traders|Motors|Solutions|Holdings|Imports|Exports|Pvt Ltd|Ltd))\b', text)
        for org in set(org_matches):
            entities["ORGANIZATION"].append({"value": org.strip(), "confidence": 0.89, "method": "heuristic_nlp"})

        # Extract Bank Accounts (avoiding phone numbers)
        for acc in set(BANK_ACCOUNT_REGEX.findall(text)):
            if acc not in [p.replace("+", "").replace("-", "") for p in phones] and len(acc) >= 11:
                entities["BANK_ACCOUNT"].append({"value": acc, "confidence": 0.88, "method": "regex"})

        # Entity Counts summary
        summary = {k: len(v) for k, v in entities.items()}
        return {
            "entities": entities,
            "counts": summary,
            "total_entities_extracted": sum(summary.values())
        }

entity_extractor = EntityExtractionService()
