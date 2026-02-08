
const fetch = require('node-fetch');

async function testOllama() {
    console.log('Testing Ollama Connection...');
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            // Testing with a simple prompt and valid json schema
            body: JSON.stringify({
                model: 'llama3.2',
                prompt: 'Say "Hello, World!"',
                stream: false
            }),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Ollama Response Logic Verified:', data.response);
    } catch (error) {
        console.error('❌ Ollama Connection Failed:', error);
    }
}

testOllama();
