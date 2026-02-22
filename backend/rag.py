import os
import math
import logging
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(override=True)
logger = logging.getLogger(__name__)

print(f"--- RAG.PY INITIALIZED ---")
print(f"Working Directory: {os.getcwd()}")
print(f"File Path: {__file__}")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if GROQ_API_KEY:
    GROQ_API_KEY = GROQ_API_KEY.strip().strip('"').strip("'")
    print(f"GROQ_API_KEY loaded: {GROQ_API_KEY[:6]}...{GROQ_API_KEY[-4:]} (Length: {len(GROQ_API_KEY)})")
else:
    print("WARNING: GROQ_API_KEY NOT FOUND in environment!")

def log_debug(msg):
    with open("rag_debug.log", "a") as f:
        f.write(f"{datetime.now()}: {msg}\n")

# In-memory vector store
VECTOR_STORE = []


# ---------- SIMPLE TEXT EMBEDDING (NO AI NEEDED) ----------
# We simulate embeddings using word frequency (works fine for college project)
def get_embedding(text):
    words = text.lower().split()
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1
    return freq


def cosine_similarity(v1, v2):
    common = set(v1.keys()) & set(v2.keys())
    dot = sum(v1[w] * v2[w] for w in common)

    mag1 = math.sqrt(sum(v*v for v in v1.values()))
    mag2 = math.sqrt(sum(v*v for v in v2.values()))

    if mag1 == 0 or mag2 == 0:
        return 0
    return dot / (mag1 * mag2)


# ---------- INDEX ----------
def index_content(courses_data):
    global VECTOR_STORE
    VECTOR_STORE = []

    for course in courses_data:
        text = f"Course: {course['title']} Description: {course['description']}"
        VECTOR_STORE.append({
            "text": text,
            "embedding": get_embedding(text)
        })


# ---------- RETRIEVE ----------
def retrieve(query, top_k=3):
    query_emb = get_embedding(query)

    scored = []
    for chunk in VECTOR_STORE:
        score = cosine_similarity(query_emb, chunk["embedding"])
        scored.append((score, chunk["text"]))

    scored.sort(reverse=True, key=lambda x: x[0])
    return [text for _, text in scored[:top_k]]


# ---------- GENERATE (OpenRouter AI) ----------

def generate_response(query, context_chunks):
    try:
        context = "\n".join(context_chunks)

        prompt = f"""
You are an AI learning assistant helping a college student.

Context:
{context}

Student Question:
{query}

Explain clearly and simply.
"""

        log_debug(f"Requesting Groq with model: llama-3.1-8b-instant")
        log_debug(f"Key used: {GROQ_API_KEY[:6]}...{GROQ_API_KEY[-4:]}")

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.4
            },
            timeout=120
        )

        log_debug(f"Groq Response Status: {response.status_code}")
        data = response.json()
        log_debug(f"Groq Response Data: {data}")
        print("GROQ:", data)

        if "choices" in data:
            return data["choices"][0]["message"]["content"]

        return str(data)

    except Exception as e:
        return f"AI Error: {e}"

def generate_questions(topic, question_type, count=10):
    try:
        if question_type == "mcq":
            prompt = f"""
Generate {count} multiple choice questions about '{topic}'. 
Return a JSON object with a key "questions" containing a list of objects.
Each object MUST follow this structure exactly:
{{
    "questionText": "The question string",
    "questionType": "mcq",
    "options": [
        {{"text": "Option 1"}},
        {{"text": "Option 2"}},
        {{"text": "Option 3"}},
        {{"text": "Option 4"}}
    ],
    "correctOptionIndex": 0
}}
"""
        else: # descriptive
            prompt = f"""
Generate {count} descriptive questions about '{topic}'. 
Return a JSON object with a key "questions" containing a list of objects.
Each object MUST follow this structure exactly:
{{
    "questionText": "The descriptive question string",
    "questionType": "descriptive",
    "correctAnswerText": "A sample correct answer or key points"
}}
"""

        log_debug(f"Generating {count} {question_type} questions for topic: {topic}")

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {"role": "system", "content": "You are a helpful educational assistant that generates structured quiz questions in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "response_format": { "type": "json_object" }
            },
            timeout=60
        )

        data = response.json()
        log_debug(f"Groq Response Data: {data}")
        if "choices" in data:
            content = data["choices"][0]["message"]["content"]
            log_debug(f"AI Response Content: {content}")
            import json
            parsed = json.loads(content)
            
            if isinstance(parsed, dict):
                for key in ["questions", "quiz", "data"]:
                    if key in parsed and isinstance(parsed[key], list):
                        return parsed[key]
                if "questionText" in parsed: 
                    return [parsed]
            
            return parsed

        return []

    except Exception as e:
        log_debug(f"Generation Error: {e}")
        return []