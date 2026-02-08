# Project Constitution (Gemini)

## 1. Data Schemas

### Test Case Generation Request (Input)
```json
{
  "user_prompt": "string",
  "context": "string (optional)"
}
```

### Test Case Response (Output)
```json
{
  "test_cases": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "preconditions": "string",
      "steps": [
        "string"
      ],
      "expected_result": "string",
      "priority": "High | Medium | Low"
    }
  ]
}
```

## 2. Behavioral Rules
- **Persona:** Senior QA Engineer.
- **Tone:** Professional, precise, and deterministic.
- **Logic:** 
  - Always generate structured JSON output.
  - Never hallucinate features not implicated by the user prompt.
  - Prioritize "Happy Path" first, then "Edge Cases".
- **Ollama Integration:**
  - Use `format: "json"` in API calls.
  - Set `temperature: 0.1` for consistency.

## 3. Architectural Invariants
- **Frontend:** Vanilla JS + HTML5 (Single Page App).
- **Backend:** Integrated (Client-side API calls to Ollama localhost:11434).
- **Styling:** Vanilla CSS (Rich Aesthetics: Glassmorphism, Dark Mode, CSS Variables).
- **State Management:** JS Classes / LocalStorage.
- **No external servers:** Purely local execution.

