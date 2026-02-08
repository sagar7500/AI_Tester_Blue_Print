# Technical SOP: Local LLM Test Case Generator

## Goal
To generate structured test cases in JSON format from user prompts using a local Ollama instance (Llama 3.2).

## Inputs
1. **User Prompt**: "string" (The feature or scenario to test).
2. **Context**: "string" (Optional additional info).

## Tool Logic
1. **Receive Input** from UI.
2. **Construct Payload**:
   - Model: 'llama3.2'
   - Format: 'json'
   - System Prompt: (Defined below)
   - User Prompt: Input string
3. **Call Ollama API** (`POST /api/generate`).
4. **Parse Response**: Extract JSON from `response.response`.
5. **Validate Schema**: Ensure output matches the `test_cases` array structure.
6. **Return Data** to UI.

## Edge Cases
- **Ollama Offline**: Show "Connection Error" in chat.
- **Model Not Found**: Trigger auto-pull or error message.
- **Invalid JSON**: Retry logic or show "Format Error".
- **Empty Response**: Prompt user to refine input.

## System Prompt Template
"You are a Senior QA Engineer. Generate comprehensive test cases for the following request in STRICT JSON format. Do not include markdown code blocks. The JSON structure is: { 'test_cases': [{ 'id', 'title', 'description', 'preconditions', 'steps': [], 'expected_result', 'priority' }] }"
