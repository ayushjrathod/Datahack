import fastapi
from typing import List, Dict, Optional

app = fastapi.FastAPI()

question_weights_finance = {
    1: 5,  # Firewall configuration
    2: 4,  # Firewall rule review
    3: 3,  # Documentation
    4: 4,  # Default password changes
    5: 5,  # Data encryption at rest
    6: 5,  # Data encryption in transit
    7: 4,  # Data retention
    8: 5,  # Sensitive data storage
    9: 4,  # Data deletion
    10: 4,  # System updates
    11: 4,  # Antivirus software
    12: 4,  # Vulnerability scans
    13: 3,  # Penetration testing
    14: 5,  # Access control
    15: 5,  # Multi-factor authentication
    16: 4,  # Unique IDs
    17: 4,  # Access rights review
    18: 4,  # Physical access control
    19: 4,  # Access logging
    20: 4,  # Audit log retention
    21: 4,  # Log review
    22: 4,  # Vulnerability scans
    23: 5,  # Security policy
    24: 3,  # Policy review
    25: 4,  # Employee training
    26: 3,  # Employee awareness
    27: 5,  # Incident response plan
    28: 3,  # Plan testing
    29: 4,  # Designated personnel
    30: 5,  # Breach notification
    31: 4,  # Data storage limitation
    32: 5,  # Encryption
    33: 4,  # Key management
    34: 4,  # Data erasure
    35: 5,  # Encryption in transit
    36: 4,  # Key rotation
    37: 5,  # Data transmission
    38: 4,  # Third-party due diligence
    39: 4,  # Vendor verification
    40: 3,  # Contract review
    41: 3,  # Documentation
    42: 4,  # Data storage
    43: 5,  # Physical access
    44: 4,  # Background checks
    45: 3,  # Service provider list
    46: 4,  # Onboarding/offboarding
    47: 5,  # Service provider agreements
    48: 4,  # Patch management
    49: 4,  # Security monitoring
    50: 5,  # Network segmentation
}

question_weights_hipaa = {
    1: 5,
    2: 4,
    3: 4,
    4: 5,
    5: 3,
    6: 3,
    7: 4,
    8: 3,
    9: 5,
    10: 5,
    11: 4,
    12: 3,
    13: 4,
    14: 3,
    15: 5,
    16: 4,
    17: 4,
    18: 5,
    19: 3,
    20: 4,
    21: 3,
    22: 5,
    23: 4,
    24: 3,
    25: 4,
    26: 3,
    27: 4,
    28: 3,
    29: 4,
    30: 3,
    31: 4,
    32: 3,
    33: 4,
    34: 4,
    35: 5,
    36: 4,
    37: 5,
    38: 4,
    39: 5,
    40: 3,
    41: 4,
    42: 3,
    43: 5,
    44: 5,
    45: 5,
    46: 4,
    47: 4,
    48: 5,
    49: 5,
    50: 3
}
def calculate_score_finance(answers: List[Dict]) -> int:
    score = 0
    for answer in answers:
        question_id = answer["id"]
        weight = question_weights_finance.get(question_id, 0)
        if answer["answer"] == "yes":
            score += weight
    return score

# Function to calculate the score based on answers and weights
def calculate_score(answers: List[Dict]) -> int:
    score = 0
    for answer in answers:
        question_id = answer["id"]
        weight = question_weights_hipaa.get(question_id, 0)
        if answer["answer"] == "yes":
            score += weight
    return score

# FastAPI endpoint to handle the scoring request
@app.post("/score-hipaa")
def score_questions(answers: List[Dict]) -> Dict:
    score = calculate_score(answers)
    normalized_score = (score/212)*100
    return {"score": normalized_score}


@app.post("/score-finance")
def score_questions(answers: List[Dict]) -> Dict:
    score = calculate_score_finance(answers)
    normalized_score = (score/212)*100
    return {"score": normalized_score}

