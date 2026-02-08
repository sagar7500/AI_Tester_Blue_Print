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

OLLAMA_URL = os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
# Llama 3.2 can take 2–5+ minutes on CPU; use a long timeout
OLLAMA_TIMEOUT = float(os.environ.get("OLLAMA_TIMEOUT", "300"))
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
    timeout_msg = (
        "Ollama took too long to respond. "
        "Make sure Ollama is running (and Llama 3.2 is pulled), then try again. "
        "First run can be slow while the model loads."
    )

    try:
        if httpx:
            with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
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
            with urllib.request.urlopen(req, timeout=int(OLLAMA_TIMEOUT)) as r:
                data = json.loads(r.read().decode())
    except Exception as e:
        err = str(e).lower()
        # Safe check for httpx exceptions without causing AttributeError
        is_httpx_timeout = False
        if httpx:
            try:
                is_httpx_timeout = isinstance(e, (httpx.TimeoutException, httpx.ConnectTimeout, httpx.ReadTimeout))
            except AttributeError:
                pass
        
        if "timed out" in err or "timeout" in err or is_httpx_timeout:
            raise ValueError(timeout_msg) from e
        if "connection" in err or "refused" in err or "cannot connect" in err:
            raise ValueError(
                "Cannot connect to Ollama. Is it running? Start it (e.g. run_ollama.bat or from the system tray)."
            ) from e
        raise ValueError(str(e)) from e

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
