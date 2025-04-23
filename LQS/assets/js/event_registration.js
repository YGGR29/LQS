document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../index.html';
        return;
    }

    // Obtener ID del evento de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');
    
    if (!eventId) {
        window.location.href = 'participant.html';
        return;
    }

    // Cargar datos del evento
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        window.location.href = 'participant.html';
        return;
    }

    // Mostrar datos del evento
    displayEventDetails(event);

    // Configurar formulario
    const registrationForm = document.getElementById('registrationForm');
    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerParticipant(eventId, currentUser.id);
    });

    // Verificar si ya está inscrito
    checkExistingRegistration(eventId, currentUser.id);

    // Configurar modal
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('confirmationModal').style.display = 'none';
        window.location.href = 'participant.html';
    });

    document.getElementById('viewTicketBtn').addEventListener('click', () => {
        // Redirigir a la página del ticket
        window.location.href = `event_ticket.html?id=${eventId}`;
    });
});

function displayEventDetails(event) {
    document.getElementById('eventTitle').textContent = `Inscripción: ${event.name}`;
    
    const eventImage = document.getElementById('eventImage');
    eventImage.style.backgroundImage = `url('${event.image || '../assets/img/event-default.jpg'}')`;
    
    const eventDate = new Date(event.date);
    document.getElementById('eventDate').textContent = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    document.getElementById('eventTime').textContent = event.time || 'Por definir';
    document.getElementById('eventLocation').textContent = event.location || 'Por definir';
    
    const spotsLeft = event.capacity ? event.capacity - (event.participants?.length || 0) : 'Ilimitados';
    document.getElementById('eventSpots').textContent = spotsLeft;
    
    // Autocompletar datos del usuario
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('fullName').value = user.name;
    document.getElementById('email').value = user.email;
}

function checkExistingRegistration(eventId, userId) {
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    const existingRegistration = registrations.find(r => 
        r.eventId === eventId && r.userId === userId
    );
    
    if (existingRegistration) {
        // Mostrar mensaje que ya está registrado
        alert('Ya estás registrado en este evento');
        window.location.href = 'participant.html';
    }
}

function registerParticipant(eventId, userId) {
    const registrationData = {
        eventId,
        userId,
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        comments: document.getElementById('comments').value.trim(),
        registrationDate: new Date().toISOString(),
        ticketId: `TKT-${Date.now().toString(36).toUpperCase()}`
    };

    // Guardar registro
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    registrations.push(registrationData);
    localStorage.setItem('registrations', JSON.stringify(registrations));

    // Actualizar lista de participantes del evento
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex !== -1) {
        if (!events[eventIndex].participants) {
            events[eventIndex].participants = [];
        }
        events[eventIndex].participants.push(userId);
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Mostrar confirmación
    showConfirmation(registrationData);
}

function showConfirmation(registration) {
    const modal = document.getElementById('confirmationModal');
    const message = `Has sido registrado exitosamente en el evento. 
        Tu número de ticket es: ${registration.ticketId}`;
    
    document.getElementById('confirmationMessage').textContent = message;
    modal.style.display = 'flex';
}