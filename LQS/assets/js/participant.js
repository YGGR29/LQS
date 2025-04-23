document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    // Cargar eventos disponibles
    loadAvailableEvents(currentUser.id);

    // Configurar eventos
    document.getElementById('messagesBtn').addEventListener('click', () => {
        window.location.href = 'messages.html';
    });

    // Configurar búsqueda
    document.getElementById('eventSearch').addEventListener('input', (e) => {
        filterEvents(e.target.value);
    });

    // Configurar filtro por categoría
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        filterEventsByCategory(e.target.value);
    });
});

function loadAvailableEvents(userId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const userEvents = JSON.parse(localStorage.getItem('userEvents')) || {}; // Aquí faltaba cerrar el paréntesis
    const registeredEvents = userEvents[userId] || [];
    
    const availableEvents = events.filter(event => {
        // Excluir eventos pasados
        const eventDate = new Date(event.date);
        const now = new Date();
        if (eventDate < now) return false;
        
        // Excluir eventos donde el usuario ya está registrado
        return !registeredEvents.includes(event.id);
    });

    renderEvents(availableEvents);
}

function renderEvents(events) {
    const eventsGrid = document.getElementById('eventsGrid');
    
    if (events.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <p>No hay eventos disponibles en este momento</p>
                <p>Vuelve a revisar más tarde</p>
            </div>
        `;
        return;
    }

    eventsGrid.innerHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const spotsLeft = event.capacity ? event.capacity - (event.participants?.length || 0) : 'Ilimitado';
        const isFull = event.capacity && spotsLeft <= 0;

        return `
            <div class="event-card">
                <div class="event-image" style="background-image: url('${event.image || '../assets/img/event-default.jpg'}')"></div>
                <div class="event-info">
                    <h3 class="event-title">${event.name}</h3>
                    <div class="event-meta">
                        <span>📅</span>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="event-meta">
                        <span>📍</span>
                        <span>${event.location || 'Ubicación no especificada'}</span>
                    </div>
                    <p class="event-description">${event.description || 'Descripción no disponible'}</p>
                    <div class="event-actions">
                        <span class="event-spots">${isFull ? 'AGOTADO' : `${spotsLeft} cupos disponibles`}</span>
                        <button class="btn-primary ${isFull ? 'btn-disabled' : ''}" 
                                onclick="registerToEvent('${event.id}')" 
                                ${isFull ? 'disabled' : ''}>
                            ${isFull ? 'Agotado' : 'Inscribirse'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterEvents(searchTerm) {
    const term = searchTerm.toLowerCase();
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        const title = card.querySelector('.event-title').textContent.toLowerCase();
        const description = card.querySelector('.event-description').textContent.toLowerCase();
        const location = card.querySelector('.event-meta:nth-of-type(2) span:nth-of-type(2)').textContent.toLowerCase();
        
        if (title.includes(term) || description.includes(term) || location.includes(term)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterEventsByCategory(category) {
    // Implementación básica - en una implementación real los eventos tendrían categorías
    const eventCards = document.querySelectorAll('.event-card');
    
    if (!category) {
        eventCards.forEach(card => card.style.display = '');
        return;
    }
    
    // Simulación de filtrado por categoría
    eventCards.forEach((card, index) => {
        // En una implementación real, usarías la categoría real del evento
        const eventCategories = ['conferencia', 'taller', 'social', 'deportivo'];
        const randomCategory = eventCategories[index % eventCategories.length];
        
        if (randomCategory === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

window.registerToEvent = function(eventId) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Actualizar lista de eventos del usuario
    const userEvents = JSON.parse(localStorage.getItem('userEvents') || {});
    if (!userEvents[currentUser.id]) {
        userEvents[currentUser.id] = [];
    }
    userEvents[currentUser.id].push(eventId);
    localStorage.setItem('userEvents', JSON.stringify(userEvents));

    // Actualizar lista de participantes del evento
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        if (!events[eventIndex].participants) {
            events[eventIndex].participants = [];
        }
        events[eventIndex].participants.push(currentUser.id);
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Mostrar confirmación y recargar
    alert('¡Inscripción exitosa!');
    window.location.reload();
};