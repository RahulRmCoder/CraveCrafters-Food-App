// Create a new file: public/js/chatWidget.js

class ChatWidget {
    constructor() {
        this.messages = [];
        this.isOpen = false;
        this.isLoading = false;
        
        // Create and inject CSS
        this.injectStyles();
        
        // Create and inject HTML
        this.createWidget();
        
        // Add event listeners
        this.bindEvents();
    }

    injectStyles() {
        const styles = `
            .chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 1000;
                font-family: Arial, sans-serif;
            }

            .chat-button {
                background-color: #cb202d;
                color: white;
                border: none;
                border-radius: 50%;
                width: 60px;
                height: 60px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }

            .chat-window {
                display: none;
                position: fixed;
                bottom: 100px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                flex-direction: column;
            }

            .chat-header {
                background-color: #cb202d;
                color: white;
                padding: 15px;
                border-top-left-radius: 10px;
                border-top-right-radius: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .message {
                max-width: 80%;
                padding: 10px;
                border-radius: 10px;
                margin: 5px 0;
            }

            .user-message {
                background-color: #cb202d;
                color: white;
                align-self: flex-end;
            }

            .bot-message {
                background-color: #f0f0f0;
                color: black;
                align-self: flex-start;
            }

            .chat-input {
                padding: 15px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }

            .chat-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                outline: none;
            }

            .chat-input button {
                background-color: #cb202d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
            }

            .chat-input button:disabled {
                opacity: 0.5;
            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <button class="chat-button">
                <i class="fas fa-comments"></i>
            </button>
            <div class="chat-window">
                <div class="chat-header">
                    <span>CraveCrafters Assistant</span>
                    <i class="fas fa-times" style="cursor: pointer;"></i>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type your message...">
                    <button type="submit">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    }

    bindEvents() {
        const chatButton = document.querySelector('.chat-button');
        const chatWindow = document.querySelector('.chat-window');
        const closeButton = document.querySelector('.chat-header .fa-times');
        const input = document.querySelector('.chat-input input');
        const sendButton = document.querySelector('.chat-input button');

        chatButton.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            chatWindow.style.display = this.isOpen ? 'flex' : 'none';
            chatButton.style.display = this.isOpen ? 'none' : 'block';
        });

        closeButton.addEventListener('click', () => {
            this.isOpen = false;
            chatWindow.style.display = 'none';
            chatButton.style.display = 'block';
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(input.value);
                input.value = '';
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage(input.value);
            input.value = '';
        });
    }

    async sendMessage(content) {
        if (!content.trim()) return;

        // Add user message
        this.addMessage(content, 'user');

        // Set loading state
        this.isLoading = true;
        const sendButton = document.querySelector('.chat-input button');
        sendButton.disabled = true;

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...this.messages, { role: 'human', content }]
                }),
            });

            const data = await response.json();
            this.addMessage(data.content, 'bot');
        } catch (error) {
            console.error('Error:', error);
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            this.isLoading = false;
            sendButton.disabled = false;
        }
    }

    addMessage(content, type) {
        const messagesContainer = document.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type === 'user' ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Store message in history
        this.messages.push({
            role: type === 'user' ? 'human' : 'assistant',
            content
        });
    }
}