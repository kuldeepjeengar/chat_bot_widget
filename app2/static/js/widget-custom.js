/**
 * Enhanced Chat Widget
 * A customizable chat widget that connects to an external API
 */
function enhancedChatWidget(config) {
    // Default configuration
    const defaultConfig = {
        apiUrl: 'http://localhost:8000/api/chat',
        title: 'Chat Assistant',
        welcomeMessage: 'Hello! How can I help you today?',
        placeholderText: 'Type your message...',
        sendButtonText: 'Send',
        position: 'right', // 'right' or 'left'
        theme: 'light', // 'light' or 'dark'
        primaryColor: '#3498db',
        secondaryColor: '#2980b9',
        iconClass: 'fas fa-comment', // Font Awesome icon class
        autoOpen: false, // Whether to automatically open the chat widget
        showTimestamp: true, // Whether to show timestamps on messages
        enableAttachments: false, // Whether to allow file attachments
        enableVoice: false, // Whether to enable voice input
        enableEmoji: false, // Whether to enable emoji picker
    };

    try {
        // Merge default config with user config
        const mergedConfig = { ...defaultConfig, ...config };
        
        // Create widget elements
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'chat-widget-container';
        
        const widgetButton = document.createElement('div');
        widgetButton.className = 'chat-widget-button';
        widgetButton.innerHTML = `<i class="${mergedConfig.iconClass}"></i>`;
        widgetButton.style.backgroundColor = mergedConfig.primaryColor;
        
        const widgetPanel = document.createElement('div');
        widgetPanel.className = 'chat-widget-panel chat-widget-hidden';
        
        // Create widget header
        const widgetHeader = document.createElement('div');
        widgetHeader.className = 'chat-widget-header';
        widgetHeader.style.backgroundColor = mergedConfig.primaryColor;
        widgetHeader.innerHTML = `
            <div>${mergedConfig.title}</div>
            <div class="chat-widget-close">&times;</div>
        `;
        
        // Create messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'chat-widget-messages';
        
        // Create input area
        const inputContainer = document.createElement('div');
        inputContainer.className = 'chat-widget-input';
        inputContainer.innerHTML = `
            <input type="text" placeholder="${mergedConfig.placeholderText}">
            <button style="background-color: ${mergedConfig.primaryColor}">${mergedConfig.sendButtonText}</button>
        `;
        
        // Assemble the widget
        widgetPanel.appendChild(widgetHeader);
        widgetPanel.appendChild(messagesContainer);
        widgetPanel.appendChild(inputContainer);
        
        widgetContainer.appendChild(widgetButton);
        widgetContainer.appendChild(widgetPanel);
        
        // Add the widget to the document
        document.body.appendChild(widgetContainer);
        
        // Add event listeners
        widgetButton.addEventListener('click', toggleWidget);
        widgetHeader.querySelector('.chat-widget-close').addEventListener('click', closeWidget);
        
        const sendButton = inputContainer.querySelector('button');
        const inputField = inputContainer.querySelector('input');
        
        sendButton.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        // Add welcome message
        if (mergedConfig.welcomeMessage) {
            addBotMessage(mergedConfig.welcomeMessage);
        }
        
        // Auto open if configured
        if (mergedConfig.autoOpen) {
            setTimeout(openWidget, 1000);
        }
        
        // Widget functions
        function toggleWidget() {
            if (widgetPanel.classList.contains('chat-widget-hidden')) {
                openWidget();
            } else {
                closeWidget();
            }
        }
        
        function openWidget() {
            widgetPanel.classList.remove('chat-widget-hidden');
            widgetPanel.classList.add('chat-widget-visible');
            inputField.focus();
        }
        
        function closeWidget() {
            widgetPanel.classList.remove('chat-widget-visible');
            widgetPanel.classList.add('chat-widget-hidden');
        }
        
        function sendMessage() {
            const message = inputField.value.trim();
            if (!message) return;
            
            // Add user message to chat
            addUserMessage(message);
            inputField.value = '';
            
            // Show typing indicator
            showTypingIndicator();
            
            // Check if the API is available
            fetch(mergedConfig.apiUrl, {
                method: 'HEAD',
                cache: 'no-cache'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('API not available');
                }
                
                // If API is available, send the message
                return fetch(mergedConfig.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: message })
                });
            })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response
                if (data.response) {
                    addBotMessage(data.response);
                } else if (data.message) {
                    addBotMessage(data.message);
                } else {
                    addBotMessage("I received your message and I'm processing it.");
                }
            })
            .catch(error => {
                // Hide typing indicator
                hideTypingIndicator();
                
                console.error('Error:', error);
                if (error.message === 'API not available') {
                    addBotMessage("Sorry, the chat service is currently unavailable. Please try again later.");
                } else {
                    addBotMessage("Sorry, I couldn't process your request. Please try again later.");
                }
            });
        }
        
        function addUserMessage(text) {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message user-message';
            messageElement.textContent = text;
            
            if (mergedConfig.showTimestamp) {
                addTimestamp(messageElement);
            }
            
            messagesContainer.appendChild(messageElement);
            scrollToBottom();
        }
        
        function addBotMessage(text) {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message bot-message';
            messageElement.textContent = text;
            
            if (mergedConfig.showTimestamp) {
                addTimestamp(messageElement);
            }
            
            messagesContainer.appendChild(messageElement);
            scrollToBottom();
        }
        
        function addTimestamp(messageElement) {
            const timestamp = document.createElement('div');
            timestamp.className = 'message-timestamp';
            timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timestamp.style.fontSize = '0.7rem';
            timestamp.style.marginTop = '5px';
            timestamp.style.opacity = '0.7';
            messageElement.appendChild(timestamp);
        }
        
        function showTypingIndicator() {
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'typing-indicator';
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            typingIndicator.id = 'typing-indicator';
            messagesContainer.appendChild(typingIndicator);
            scrollToBottom();
        }
        
        function hideTypingIndicator() {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }
        
        function scrollToBottom() {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Return public methods
        return {
            open: openWidget,
            close: closeWidget,
            toggle: toggleWidget,
            sendMessage: function(text) {
                inputField.value = text;
                sendMessage();
            }
        };
    } catch (error) {
        console.error("Error initializing chat widget:", error);
        return {
            open: function() { console.error("Widget failed to initialize"); },
            close: function() { console.error("Widget failed to initialize"); },
            toggle: function() { console.error("Widget failed to initialize"); },
            sendMessage: function() { console.error("Widget failed to initialize"); }
        };
    }
} 