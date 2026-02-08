/**
 * Layer 4: Frontend — calls FastAPI backend (Layer 2) for test case generation.
 */

// Same origin — API served by same app on port 3000
const CONFIG = {
    HEALTH_PATH: '/api/health',
    GENERATE_PATH: '/api/generate',
    GENERATE_TIMEOUT_MS: 5 * 60 * 1000  // 5 min — Llama can be slow
};

const state = {
    isProcessing: false,
    isConnected: false,
    ollamaOk: false
};

const ui = {
    chatHistory: document.getElementById('chat-history'),
    userInput: document.getElementById('user-input'),
    sendBtn: document.getElementById('send-btn'),
    connDot: document.getElementById('connection-dot'),
    connText: document.getElementById('connection-text')
};

async function init() {
    await checkBackendConnection();
    ui.userInput.focus();
    setInterval(checkBackendConnection, 10000);
}

async function checkBackendConnection() {
    try {
        const response = await fetch(CONFIG.HEALTH_PATH);
        if (response.ok) {
            const data = await response.json();
            const ollamaOk = data.ollama === 'ok';
            updateConnectionStatus(true, ollamaOk);
        } else {
            updateConnectionStatus(false, false);
        }
    } catch (error) {
        console.error('Backend connection check failed:', error);
        updateConnectionStatus(false, false);
    }
}

function updateConnectionStatus(backendOk, ollamaOk) {
    state.isConnected = backendOk;
    state.ollamaOk = ollamaOk;
    if (backendOk) {
        ui.connDot.classList.add('online');
        ui.connText.textContent = ollamaOk ? 'Backend & Ollama Online' : 'Backend Online · Ollama Offline';
        ui.sendBtn.disabled = false;
        ui.sendBtn.title = ollamaOk ? 'Ready to send' : 'Start Ollama first (e.g. run_ollama.bat) to generate test cases';
    } else {
        ui.connDot.classList.remove('online');
        ui.connText.textContent = 'Offline (start the app server)';
        ui.sendBtn.disabled = true;
        ui.sendBtn.title = 'Server is not running';
    }
}

async function generateTestCases(userPrompt) {
    if (state.isProcessing) return;

    addMessage(userPrompt, 'user');
    ui.userInput.value = '';

    if (!state.ollamaOk) {
        const aiMessageId = addMessage('…', 'ai', true);
        updateAIMessage(aiMessageId, null, 'Ollama is offline. Start Ollama (e.g. run run_ollama.bat or from the system tray). The status above will switch to "Ollama Online" when it\'s ready — then try again.');
        return;
    }

    setProcessing(true);
    const aiMessageId = addMessage('Generating test cases... (this can take 1–2 minutes)', 'ai', true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.GENERATE_TIMEOUT_MS);

    try {
        const response = await fetch(CONFIG.GENERATE_PATH, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: userPrompt }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || response.statusText || 'API Error');
        }

        const testData = { test_cases: data.test_cases || data.raw?.test_cases || [] };
        updateAIMessage(aiMessageId, testData);
    } catch (error) {
        clearTimeout(timeoutId);
        const msg = error.name === 'AbortError'
            ? 'Request took too long. The model may be slow — try again or use a shorter prompt.'
            : error.message;
        updateAIMessage(aiMessageId, null, msg);
    } finally {
        setProcessing(false);
    }
}

function addMessage(content, type, isLoading = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
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
    bubble.innerHTML = '';

    if (error) {
        bubble.style.border = '1px solid var(--error)';
        bubble.textContent = `❌ Error: ${error}`;
        return;
    }

    const title = document.createElement('div');
    title.style.marginBottom = '10px';
    title.innerHTML = `<strong>✅ Generated ${data.test_cases?.length || 0} Test Cases:</strong>`;
    bubble.appendChild(title);

    if (data.test_cases && Array.isArray(data.test_cases)) {
        data.test_cases.forEach(tc => {
            bubble.appendChild(createTestCaseCard(tc));
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
            <span class="priority-badge priority-${(tc.priority || 'Medium')}">${tc.priority || 'Medium'}</span>
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

init();
