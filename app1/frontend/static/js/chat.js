/**
 * LLM Chat Widget - Barbour ABI Style
 */

function initChatWidget(config = {}) {
    // Default configuration
    const defaultConfig = {
        apiUrl: '/api/chat',
        title: 'AI Assistant',
        subtitle: 'The team can also help',
        welcomeMessage: 'How can we help you today?',
        placeholderText: 'Type your message...',
        position: 'right',
        primaryColor: '#f05545' // Coral color from image
    };

    // Merge configuration
    const widgetConfig = { ...defaultConfig, ...config };

    // Create the chat widget elements
    createChatWidgetElements(widgetConfig);

    // Initialize the chat functionality
    initChatFunctionality(widgetConfig);
}

function createChatWidgetElements(config) {
    // Create container
    const container = document.createElement('div');
    container.id = 'chat-widget-container';
    document.body.appendChild(container);

    // Create chat button (always visible)
    const button = document.createElement('div');
    button.id = 'chat-widget-button';
    button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="white"/>
            <path d="M7 9h10M7 12h7" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
    `;
    container.appendChild(button);

    // Create chat popup
    const popup = document.createElement('div');
    popup.id = 'chat-widget-popup';

    // Create header with expand button
    popup.innerHTML = `
        <div id="chat-widget-header">
            <div id="chat-widget-header-left">
                <div id="chat-widget-logo">B</div>
                <div id="chat-widget-title-container">
                    <div id="chat-widget-title">${config.title}</div>
                    <div id="chat-widget-subtitle">${config.subtitle}</div>
                </div>
            </div>
            <div id="chat-widget-header-actions">
                <div id="chat-widget-control">&#x26F6;</div>
            </div>
        </div>
        <div id="chat-widget-messages"></div>
        <div id="chat-widget-input-container">
            <input type="text" id="chat-widget-input" placeholder="${config.placeholderText}">
            <button id="chat-widget-send">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="16" height="16">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
                </svg>
            </button>
        </div>
    `;
    container.appendChild(popup);

    // Adjust positions based on config
    if (config.position === 'left') {
        container.style.left = '20px';
        container.style.right = 'auto';
        popup.style.left = '0';
        popup.style.right = 'auto';
        button.style.left = '20px';
        button.style.right = 'auto';
    }

    // Keep track of chat state
    let isChatOpen = false;
    let isExpanded = false;

    // Toggle chat with the same button
    button.addEventListener('click', function () {
        if (isChatOpen) {
            // Close the chat
            popup.classList.remove('active');
            button.classList.remove('chat-open');

            // If we're in expanded view, exit that first
            if (isExpanded) {
                popup.classList.remove('expanded');
                isExpanded = false;
                const controlButton = document.getElementById('chat-widget-control');
                if (controlButton) controlButton.innerHTML = '&#x26F6;'; // Expand icon
            }
        } else {
            // Open the chat
            popup.classList.add('active');
            button.classList.add('chat-open');
        }

        // Toggle state
        isChatOpen = !isChatOpen;
    });

    // Control button toggles expanded view
    const controlButton = document.getElementById('chat-widget-control');
    controlButton.addEventListener('click', function (e) {
        // Stop event propagation to prevent issues
        e.stopPropagation();

        if (isExpanded) {
            // Exit expanded mode
            popup.classList.remove('expanded');
            isExpanded = false;
            controlButton.innerHTML = '&#x26F6;'; // Expand icon
        } else {
            // Enter expanded mode
            popup.classList.add('expanded');
            isExpanded = true;
            controlButton.innerHTML = '&#x2922;'; // Compress icon
        }

        // Force scroll to bottom when toggling view
        setTimeout(() => {
            const messagesContainer = document.getElementById('chat-widget-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    });

    // Add tooltip for expand button
    controlButton.title = "Toggle expanded view";

    // Initialize chat as closed
    popup.classList.remove('active');
    isChatOpen = false;

    // Add CSS for markdown formatting
    const style = document.createElement('style');
    style.textContent = `
        .formatted-response h1, .formatted-response h2, .formatted-response h3 {
            margin-top: 10px;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .formatted-response h1 {
            font-size: 1.4em;
        }
        .formatted-response h2 {
            font-size: 1.2em;
        }
        .formatted-response h3 {
            font-size: 1.1em;
        }
        .formatted-response p {
            margin: 8px 0;
        }
        .formatted-response ul, .formatted-response ol {
            margin: 8px 0;
            padding-left: 20px;
        }
        .formatted-response ul li, .formatted-response ol li {
            margin: 4px 0;
        }
        .formatted-response a {
            color: ${config.primaryColor};
            text-decoration: underline;
        }
        .formatted-response code {
            background-color: #f0f0f0;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: monospace;
        }
        .formatted-response pre {
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .formatted-response .markdown-table {
            border-collapse: collapse;
            margin: 15px 0;
            width: 100%;
        }
        .formatted-response .markdown-table th {
            background-color: #f5f5f5;
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            font-weight: bold;
        }
        .formatted-response .markdown-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        .formatted-response .markdown-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    `;
    document.head.appendChild(style);
}

function initChatFunctionality(config) {
    // Get elements
    const messagesContainer = document.getElementById('chat-widget-messages');
    const inputField = document.getElementById('chat-widget-input');
    const sendButton = document.getElementById('chat-widget-send');

    // Message history
    let messageHistory = [];

    // Add welcome message with Barbour ABI style logo
    if (config.welcomeMessage) {
        const welcomeElement = document.createElement('div');
        welcomeElement.className = 'chat-message chat-message-bot chat-message-bot-with-logo';
        welcomeElement.innerHTML = `
            <div class="chat-message-logo">B</div>
            ${config.welcomeMessage}
        `;
        messagesContainer.appendChild(welcomeElement);
    }

    // Function to send message
    function sendMessage() {
        const message = inputField.value.trim();
        if (message) {
            // Add user message to chat
            addUserMessage(message);

            // Clear input field
            inputField.value = '';

            // Update message history
            messageHistory.push({
                role: "user",
                content: message
            });

            // Show typing indicator
            showTypingIndicator();

            // Send to API and get response
            fetchBotResponse(messageHistory);
        }
    }

    // Function to add user message
    function addUserMessage(text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message chat-message-user';
        messageElement.textContent = text;
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }

    // Function to add bot message with Barbour ABI style
    function addBotMessage(text) {
        // Remove typing indicator
        const typingIndicator = document.querySelector('.chat-widget-typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        // Format the response with markdown
        const formattedText = parseMarkdown(text);

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message chat-message-bot chat-message-bot-with-logo';
        messageElement.innerHTML = `
            <div class="chat-message-logo">B</div>
            <div class="formatted-response">${formattedText}</div>
        `;
        messagesContainer.appendChild(messageElement);
        scrollToBottom();

        // Update message history
        messageHistory.push({
            role: "assistant",
            content: text
        });
    }

    // Improved markdown parser function
    function parseMarkdown(text) {
        // Handle headings
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');

        // Handle bold and italic
        text = text.replace(/\*\*(.*?)\*\*/gm, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/gm, '<em>$1</em>');

        // Handle lists
        text = text.replace(/^\s*\d+\.\s+(.*$)/gm, '<ol><li>$1</li></ol>');
        text = text.replace(/^\s*[\*\-]\s+(.*$)/gm, '<ul><li>$1</li></ul>');

        // Handle links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2" target="_blank">$1</a>');

        // Handle code blocks
        text = text.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
        text = text.replace(/`([^`]+)`/gm, '<code>$1</code>');

        // Handle paragraphs
        text = text.replace(/\n{2,}/g, '</p><p>');
        text = '<p>' + text + '</p>';

        // Fix nested list tags
        text = text.replace(/<\/ol><ol>/g, '');
        text = text.replace(/<\/ul><ul>/g, '');

        // Handle tables
        text = text.replace(/\|([^\n]+)\|\n\|([^\n]+)\|\n((?:\|[^\n]+\|\n?)+)/gm, (match, header, separator, rows) => {
            let tableHTML = '<table class="markdown-table">';
            tableHTML += '<thead><tr>';
            header.split('|').forEach(cell => {
                if (cell.trim()) tableHTML += `<th>${cell.trim()}</th>`;
            });
            tableHTML += '</tr></thead>';

            tableHTML += '<tbody>';
            rows.split('\n').forEach(row => {
                if (row.trim()) {
                    tableHTML += '<tr>';
                    row.split('|').forEach(cell => {
                        if (cell.trim()) tableHTML += `<td>${cell.trim()}</td>`;
                    });
                    tableHTML += '</tr>';
                }
            });
            tableHTML += '</tbody></table>';
            return tableHTML;
        });

        return text;
    }

    // Function to show typing indicator
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-widget-typing';
        typingElement.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingElement);
        scrollToBottom();
    }

    // Function to scroll to bottom
    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Function to fetch bot response
    async function fetchBotResponse(messages) {
        try {
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: messages })
            });

            if (!response.ok) {
                throw new Error('Failed to get response from the server');
            }

            const data = await response.json();
            addBotMessage(data.response);

        } catch (error) {
            console.error('Error:', error);
            addBotMessage('Sorry, I encountered an error. Please try again later.');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);

    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}