// Demo interactive functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('demo-chat');
    const input = document.getElementById('demo-input');
    const sendBtn = document.getElementById('demo-send');
    const memoryItems = document.querySelectorAll('.demo-memory-item');
    const graphOverlay = document.getElementById('demo-graph');

    if (!chatContainer || !input || !sendBtn) return;

    // Generate knowledge graph visualization
    function createGraphNodes() {
        if (!graphOverlay) return;

        const positions = [
            { x: 10, y: 20 },
            { x: 30, y: 15 },
            { x: 50, y: 25 },
            { x: 70, y: 18 },
            { x: 85, y: 30 },
            { x: 20, y: 45 },
            { x: 45, y: 55 },
            { x: 65, y: 48 },
            { x: 80, y: 60 },
            { x: 35, y: 75 },
            { x: 60, y: 70 },
            { x: 75, y: 85 }
        ];

        positions.forEach((pos, i) => {
            const node = document.createElement('div');
            node.className = 'demo-graph-node';
            node.style.left = pos.x + '%';
            node.style.top = pos.y + '%';
            node.style.animationDelay = (i * 0.2) + 's';
            graphOverlay.appendChild(node);

            // Add connections to nearby nodes
            if (i > 0) {
                const prev = positions[i - 1];
                const connection = document.createElement('div');
                connection.className = 'demo-graph-connection';
                connection.style.left = prev.x + '%';
                connection.style.top = prev.y + '%';

                const dx = pos.x - prev.x;
                const dy = pos.y - prev.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * (180 / Math.PI);

                connection.style.width = distance + '%';
                connection.style.transform = `rotate(${angle}deg)`;
                connection.style.animationDelay = (i * 0.15) + 's';
                graphOverlay.appendChild(connection);
            }
        });
    }

    createGraphNodes();

    // Add message to chat
    function addMessage(text, isUser = false) {
        const message = document.createElement('div');
        message.className = 'demo-message' + (isUser ? ' user' : '');
        message.innerHTML = `
            <div class="demo-message-avatar">${isUser ? 'U' : 'V'}</div>
            <div class="demo-message-content">
                <div class="demo-message-text">${text}</div>
            </div>
        `;
        chatContainer.appendChild(message);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Add typing indicator
    function addTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'demo-message typing-indicator';
        typing.id = 'demo-typing';
        typing.innerHTML = `
            <div class="demo-message-avatar">V</div>
            <div class="demo-message-content">
                <div class="demo-typing">
                    <div class="demo-typing-dot"></div>
                    <div class="demo-typing-dot"></div>
                    <div class="demo-typing-dot"></div>
                </div>
            </div>
        `;
        chatContainer.appendChild(typing);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Remove typing indicator
    function removeTypingIndicator() {
        const typing = document.getElementById('demo-typing');
        if (typing) {
            typing.remove();
        }
    }

    // AI response simulation
    function getAIResponse(userMessage) {
        const responses = [
            "I've searched your memory bank. Based on our previous conversations, I found 3 relevant contexts. Would you like me to summarize them?",
            "Great question! I remember we discussed this last week. Let me pull up the relevant notes from your Project Setup memory.",
            "I've cross-referenced this with your Design System conversations. There might be a connection to the component library we built.",
            "I'm accessing your API Integration context. It seems like you were working on implementing the authentication flow.",
            "Based on your Database Schema memories, I can help you optimize that query. Want me to show you the implementation?",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Send message
    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, true);
        input.value = '';

        addTypingIndicator();

        setTimeout(() => {
            removeTypingIndicator();
            addMessage(getAIResponse(text));
        }, 1500 + Math.random() * 1000);
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Drag and drop functionality
    memoryItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.memory);
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });

        item.addEventListener('click', () => {
            const memoryTitle = item.querySelector('.demo-memory-title').textContent;
            input.value = `Using ${memoryTitle} memory as context...`;
            input.focus();
        });
    });

    // Drop zone effect on chat container
    chatContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        chatContainer.style.background = 'rgba(0, 212, 232, 0.1)';
    });

    chatContainer.addEventListener('dragleave', () => {
        chatContainer.style.background = '';
    });

    chatContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        chatContainer.style.background = '';
        const memoryId = e.dataTransfer.getData('text/plain');
        const memoryItem = document.querySelector(`[data-memory="${memoryId}"]`);
        if (memoryItem) {
            const memoryTitle = memoryItem.querySelector('.demo-memory-title').textContent;
            addMessage(`Using ${memoryTitle} memory as context...`, true);
            setTimeout(() => {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`I've loaded the ${memoryTitle} context. What would you like to explore from this memory?`);
                }, 1000);
            }, 500);
        }
    });

    // Recipe cards click
    const recipeCards = document.querySelectorAll('.demo-recipe-card');
    recipeCards.forEach(card => {
        card.addEventListener('click', () => {
            const recipeTitle = card.querySelector('.demo-recipe-title').textContent;
            addMessage(`Loading ${recipeTitle} context recipe...`, true);
            setTimeout(() => {
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addMessage(`I've applied the ${recipeTitle} recipe. I'm now pulling relevant memories tagged with ${Array.from(card.querySelectorAll('.demo-recipe-tag')).map(t => t.textContent).join(', ')}.`);
                }, 1200);
            }, 500);
        });
    });
});
