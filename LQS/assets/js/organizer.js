document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación y rol
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar nombre de usuario en el header
    const headerTitle = document.querySelector('.organizer-header h1');
    if (headerTitle && currentUser.name) {
        headerTitle.textContent = `Bienvenido, ${currentUser.name}`;
    }

    // Configurar botones
    document.getElementById('createEventBtn').addEventListener('click', () => {
        window.location.href = 'create_event.html';
    });

    document.getElementById('messagesBtn').addEventListener('click', () => {
        window.location.href = 'messages.html';
    });

    // Cargar eventos del organizador
    loadOrganizerEvents(currentUser.id);
});

function loadOrganizerEvents(organizerId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const organizerEvents = events.filter(event => event.organizerId === organizerId);
    const eventsGrid = document.getElementById('eventsGrid');

    if (organizerEvents.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <p>No has creado ningún evento todavía.</p>
                <button id="createFirstEvent" class="btn-primary">Crear mi primer evento</button>
            </div>
        `;
        
        document.getElementById('createFirstEvent').addEventListener('click', () => {
            window.location.href = 'create_event.html';
        });
        return;
    }

    eventsGrid.innerHTML = organizerEvents.map(event => `
        <div class="event-card">
            <div class="event-image" style="background-image: url('${event.image || 'assets/img/event-default.jpg'}')"></div>
            <div class="event-info">
                <h3 class="event-title">${event.name}</h3>
                <p class="event-date">📅 ${new Date(event.date).toLocaleDateString('es-ES')}</p>
                <p class="event-location">📍 ${event.location || 'Ubicación no especificada'}</p>
                <div class="event-actions">
                    <button class="event-btn btn-participants" onclick="viewParticipants('${event.id}')">
                        Participantes
                    </button>
                    <button class="event-btn btn-edit" onclick="editEvent('${event.id}')">
                        Editar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewParticipants(eventId) {
    localStorage.setItem('currentEventView', eventId);
    window.location.href = 'event_participants.html';
}

function editEvent(eventId) {
    localStorage.setItem('editingEvent', eventId);
    window.location.href = 'edit_event.html';
}

// Hacer funciones accesibles globalmente
window.viewParticipants = viewParticipants;
window.editEvent = editEvent;