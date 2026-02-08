"""
Single app: FastAPI serves API + frontend on port 3000.
Open http://localhost:3000 in browser — no separate frontend server.
"""
import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from tools.generator import generate_test_cases

app = FastAPI(title="Local Test Case Generator", version="1.0.0")

# ---- API routes (must be before static mount) ----

class GenerateRequest(BaseModel):
    prompt: str
    context: str | None = None


class GenerateResponse(BaseModel):
    test_cases: list
    raw: dict


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "backend"}


@app.post("/api/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    try:
        data = generate_test_cases(req.prompt, req.context)
        return GenerateResponse(test_cases=data.get("test_cases", []), raw=data)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---- Serve frontend at / (index.html, style.css, app.js) ----
_frontend = _root / "frontend"
if _frontend.exists():
    app.mount("/", StaticFiles(directory=str(_frontend), html=True), name="static")
