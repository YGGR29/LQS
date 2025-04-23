document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    // Cargar conversaciones
    loadConversations(currentUser.id);

    // Configurar eventos
    document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
});

function loadConversations(userId) {
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Obtener conversaciones únicas para este usuario
    const conversations = {};
    
    messages.forEach(message => {
        if (message.senderId === userId || message.receiverId === userId) {
            const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
            const user = users.find(u => u.id === otherUserId);
            
            if (user) {
                if (!conversations[otherUserId]) {
                    conversations[otherUserId] = {
                        userId: otherUserId,
                        name: user.name,
                        lastMessage: message,
                        unread: message.receiverId === userId && !message.read
                    };
                } else {
                    // Mantener solo el mensaje más reciente
                    if (new Date(message.timestamp) > new Date(conversations[otherUserId].lastMessage.timestamp)) {
                        conversations[otherUserId].lastMessage = message;
                        conversations[otherUserId].unread = message.receiverId === userId && !message.read;
                    }
                }
            }
        }
    });

    renderConversationList(Object.values(conversations));
}

function renderConversationList(conversations) {
    const conversationList = document.getElementById('conversationList');
    
    if (conversations.length === 0) {
        conversationList.innerHTML = `
            <div class="no-conversations">
                <p>No tienes conversaciones</p>
                <button onclick="window.location.href='new_message.html'" class="btn-secondary">
                    Comenzar una nueva conversación
                </button>
            </div>
        `;
        return;
    }

    conversationList.innerHTML = conversations.map(conv => `
        <div class="conversation-item" data-userid="${conv.userId}" onclick="loadConversation('${conv.userId}')">
            <div class="conversation-header">
                <span class="conversation-name">${conv.name}</span>
                <span class="conversation-time">${formatTime(conv.lastMessage.timestamp)}</span>
            </div>
            <div class="conversation-preview">
                ${conv.lastMessage.content.substring(0, 50)}${conv.lastMessage.content.length > 50 ? '...' : ''}
            </div>
            ${conv.unread ? '<div class="unread-badge"></div>' : ''}
        </div>
    `).join('');
}

function loadConversation(userId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Marcar como leído
    messages.forEach(msg => {
        if (msg.receiverId === currentUser.id && msg.senderId === userId && !msg.read) {
            msg.read = true;
        }
    });
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Actualizar UI
    document.getElementById('currentConversation').textContent = `Conversación con ${user.name}`;
    
    const conversationMessages = messages.filter(msg => 
        (msg.senderId === currentUser.id && msg.receiverId === userId) ||
        (msg.senderId === userId && msg.receiverId === currentUser.id)
    ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    renderMessages(conversationMessages, currentUser.id);
    
    // Marcar como activa en la lista
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-userid') === userId) {
            item.classList.add('active');
        }
    });
}

function renderMessages(messages, currentUserId) {
    const container = document.getElementById('messagesContainer');
    
    if (messages.length === 0) {
        container.innerHTML = `
            <div class="no-messages">
                <p>No hay mensajes en esta conversación</p>
                <p>Envía un mensaje para comenzar</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="message ${msg.senderId === currentUserId ? 'sent' : 'received'}">
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${formatTime(msg.timestamp)}</div>
        </div>
    `).join('');
    
    // Scroll al final
    container.scrollTop = container.scrollHeight;
}

function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const activeConversation = document.querySelector('.conversation-item.active');
    
    if (!activeConversation) {
        alert('Selecciona una conversación primero');
        return;
    }
    
    const receiverId = activeConversation.getAttribute('data-userid');
    const messageContent = document.getElementById('messageInput').value.trim();
    
    if (!messageContent) {
        alert('Escribe un mensaje');
        return;
    }
    
    const newMessage = {
        id: Date.now().toString(),
        senderId: currentUser.id,
        receiverId,
        content: messageContent,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    // Guardar mensaje
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    messages.push(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    // Actualizar UI
    document.getElementById('messageInput').value = '';
    loadConversation(receiverId);
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Para uso global en la lista de conversaciones
window.loadConversation = loadConversation;