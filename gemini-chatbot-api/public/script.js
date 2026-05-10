document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');

    // Store the conversation history state
    let conversation = [];

    // Helper function to append messages to the chat interface
    function appendMessage(role, text) {
        const messageEl = document.createElement('div');
        messageEl.classList.add('message', `message-${role}`);
        
        // Using textContent instead of innerHTML to safely handle text and prevent XSS
        messageEl.textContent = text;
        
        chatBox.appendChild(messageEl);
        
        // Auto-scroll to the bottom of the chat box
        chatBox.scrollTop = chatBox.scrollHeight; 
        
        return messageEl;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = userInput.value.trim();
        if (!text) return;

        // 1. Add user message to UI and conversation state
        appendMessage('user', text);
        conversation.push({ role: 'user', text });

        // Clear the input field
        userInput.value = '';

        // 2. Show a temporary "Thinking..." bot message
        const botMessageEl = appendMessage('model', 'Thinking...');

        try {
            // 3. Send POST request to the backend with the full conversation
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ conversation })
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();

            // 4. Replace "Thinking..." with the AI's reply and add to state
            botMessageEl.textContent = data.result;
            conversation.push({ role: 'model', text: data.result });
        } catch (error) {
            console.error('Error during chat request:', error);
            // 5. Handle errors and empty responses
            botMessageEl.textContent = 'Failed to get response from server.';
        }
    });
});