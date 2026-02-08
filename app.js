/**
 * ⚡ A.I. Tester Logic Phase 3 & 4
 * Handles seamless interaction with local Ollama instance.
 */

// Configuration
const CONFIG = {
    OLLAMA_API: 'http://localhost:11434/api/generate',
    MODEL: 'llama3.2',
    SYSTEM_PROMPT: `You are a Senior QA Engineer. Generate comprehensive test cases for the following request in STRICT JSON format. Do not include markdown code blocks. The JSON structure is: { "test_cases": [{ "id": "TC_001", "title": "Test Title", "description": "What is being tested", "preconditions": "Setup required", "steps": ["Step 1", "Step 2"], "expected_result": "Expected behavior", "priority": "High" }] }`
};

// State
const state = {
    isProcessing: false,
    isConnected: false
};

// UI Elements
const ui = {
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    connDot: document.getElementById('connection-dot'),
    connText: document.getElementById('connection-text')
};

// --- Initialization ---

async function init() {
    await checkOllamaConnection();
    ui.userInput.focus();
}

// --- Logic Layer ---

async function checkOllamaConnection() {
    try {
        const response = await fetch('http://localhost:11434/');
        if (response.ok) {
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false);
        }
    } catch (error) {
        console.error('Connection Check Failed:', error);
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(isConnected) {
    state.isConnected = isConnected;
    if (isConnected) {
        ui.connDot.classList.add('online');
        ui.connText.textContent = 'Ollama Online';
        ui.sendBtn.disabled = false;
        ui.sendBtn.title = "Ready to send";
    } else {
        ui.connDot.classList.remove('online');
        ui.connText.textContent = 'Offline (CORS/Network Error)';
        ui.sendBtn.disabled = true;
        ui.sendBtn.title = "Ollama is offline or blocking connections";
    }
}

async function generateTestCases(userPrompt) {
    if (state.isProcessing) return;
    setProcessing(true);

    // Add User Message
    addMessage(userPrompt, 'user');
    ui.userInput.value = '';

    // Create AI Placeholder
    const aiMessageId = addMessage('Generating test cases...', 'ai', true);

    try {
        const payload = {
            model: CONFIG.MODEL,
            prompt: userPrompt,
            system: CONFIG.SYSTEM_PROMPT,
            format: 'json',
            stream: false
        };

        const response = await fetch(CONFIG.OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Ollama API Error');

        const data = await response.json();

        // Parse and Render
        let testData;
        try {
            testData = JSON.parse(data.response);
        } catch (e) {
            console.error('JSON Parse Error:', data.response);
            throw new Error('Failed to parse AI response as JSON.');
        }

        updateAIMessage(aiMessageId, testData);

    } catch (error) {
        updateAIMessage(aiMessageId, null, error.message);
    } finally {
        setProcessing(false);
    }
}

// --- View Rendering ---

function addMessage(content, type, isLoading = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;

    // Simple ID for updates
    const msgId = Date.now().toString();
    msgDiv.dataset.id = msgId;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';

    if (isLoading) {
        bubble.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> ${content}`;
    } else {
        bubble.textContent = content;
    }

    msgDiv.appendChild(bubble);
    ui.chatHistory.appendChild(msgDiv);
    scrollToBottom();

    return msgId;
}

function updateAIMessage(msgId, data, error = null) {
    const msgDiv = document.querySelector(`.message[data-id="${msgId}"]`);
    if (!msgDiv) return;

    const bubble = msgDiv.querySelector('.bubble');
    bubble.innerHTML = ''; // Clear loading state

    if (error) {
        bubble.style.border = '1px solid var(--error)';
        bubble.textContent = `❌ Error: ${error}`;
        return;
    }

    // Render Title
    const title = document.createElement('div');
    title.style.marginBottom = '10px';
    title.innerHTML = `<strong>✅ Generated ${data.test_cases?.length || 0} Test Cases:</strong>`;
    bubble.appendChild(title);

    // Render Cards
    if (data.test_cases && Array.isArray(data.test_cases)) {
        data.test_cases.forEach(tc => {
            const card = createTestCaseCard(tc);
            bubble.appendChild(card);
        });
    } else {
        bubble.textContent = JSON.stringify(data, null, 2);
    }

    scrollToBottom();
}

function createTestCaseCard(tc) {
    const card = document.createElement('div');
    card.className = 'test-case-card';

    card.innerHTML = `
        <div class="card-header">
            <span style="font-weight:600; font-family:var(--font-mono)">${tc.id || 'TC'}</span>
            <span class="priority-badge priority-${tc.priority || 'Medium'}">${tc.priority || 'Medium'}</span>
        </div>
        <div class="card-body">
            <div class="card-section">
                <div class="card-value" style="font-weight:600; font-size:1rem">${tc.title}</div>
                <div class="card-value" style="color:var(--text-secondary); font-size:0.85rem; margin-top:4px">${tc.description}</div>
            </div>
            
            <div class="card-section">
                <div class="card-label">Preconditions</div>
                <div class="card-value">${tc.preconditions || 'None'}</div>
            </div>

            <div class="card-section">
                <div class="card-label">Steps</div>
                <div class="step-list card-value">
                    ${(tc.steps || []).map((step, i) => `<div>${i + 1}. ${step}</div>`).join('')}
                </div>
            </div>

            <div class="card-section">
                <div class="card-label">Expected Result</div>
                <div class="card-value" style="color:var(--success)">${tc.expected_result}</div>
            </div>
        </div>
    `;

    return card;
}

function scrollToBottom() {
    ui.chatHistory.scrollTop = ui.chatHistory.scrollHeight;
}

function setProcessing(busy) {
    state.isProcessing = busy;
    ui.sendBtn.disabled = busy;
    ui.userInput.disabled = busy;
    if (busy) {
        ui.sendBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i>';
    } else {
        ui.sendBtn.innerHTML = '<i class="ri-send-plane-fill"></i>';
        ui.userInput.focus();
    }
}

// --- User Interaction ---

ui.sendBtn.addEventListener('click', () => {
    const text = ui.userInput.value.trim();
    if (text) generateTestCases(text);
});

ui.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const text = ui.userInput.value.trim();
        if (text) generateTestCases(text);
    }
});

// Run Init
init();
