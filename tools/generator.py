"""
Layer 3: Deterministic Generator Tool.
Calls Ollama with a fixed system prompt and returns validated test_cases JSON.
"""
import json
import os
import sys

# Optional: use httpx for async; for sync use urllib or requests
try:
    import httpx
except ImportError:
    httpx = None

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
SYSTEM_PROMPT = (
    "You are a Senior QA Engineer. Generate comprehensive test cases for the following request in STRICT JSON format. "
    "Do not include markdown code blocks. The JSON structure is: "
    '{ "test_cases": [{ "id": "TC_001", "title": "Test Title", "description": "What is being tested", '
    '"preconditions": "Setup required", "steps": ["Step 1", "Step 2"], "expected_result": "Expected behavior", '
    '"priority": "High" }] }'
)


def generate_test_cases(prompt: str, context: str | None = None) -> dict:
    """
    Call Ollama and return parsed JSON with test_cases array.
    Raises ValueError on parse error or API error.
    """
    user_prompt = prompt if not context else f"{prompt}\n\nContext: {context}"
    payload = {
        "model": MODEL,
        "prompt": user_prompt,
        "system": SYSTEM_PROMPT,
        "format": "json",
        "stream": False,
    }
    url = f"{OLLAMA_URL.rstrip('/')}/api/generate"

    if httpx:
        with httpx.Client(timeout=120.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
    else:
        import urllib.request
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.loads(r.read().decode())

    raw = data.get("response", "")
    if not raw:
        raise ValueError("Empty response from Ollama")
    try:
        out = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON from model: {e}") from e
    if not isinstance(out.get("test_cases"), list):
        raise ValueError("Response must contain 'test_cases' array")
    return out


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generator.py '<prompt>'")
        sys.exit(1)
    try:
        result = generate_test_cases(sys.argv[1])
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
