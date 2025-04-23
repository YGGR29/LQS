document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'organizer') {
        window.location.href = '../index.html';
        return;
    }

    const createEventForm = document.getElementById('createEventForm');
    
    createEventForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const eventData = {
            name: document.getElementById('eventName').value.trim(),
            description: document.getElementById('eventDescription').value.trim(),
            date: document.getElementById('eventDate').value,
            time: document.getElementById('eventTime').value,
            location: document.getElementById('eventLocation').value.trim(),
            capacity: parseInt(document.getElementById('eventCapacity').value) || 0,
            image: document.getElementById('eventImage').value.trim(),
            organizerId: currentUser.id,
            participants: [],
            createdAt: new Date().toISOString()
        };

        if (!validateEventData(eventData)) {
            return;
        }

        saveEvent(eventData);
        showNotification('Evento creado exitosamente', 'success');
        setTimeout(() => {
            window.location.href = 'organizer.html';
        }, 1500);
    });
});

function validateEventData(eventData) {
    if (!eventData.name || !eventData.description || !eventData.date || !eventData.time || !eventData.location) {
        showNotification('Por favor complete todos los campos requeridos', 'error');
        return false;
    }

    if (new Date(eventData.date) < new Date()) {
        showNotification('La fecha del evento no puede ser en el pasado', 'error');
        return false;
    }

    return true;
}

function saveEvent(eventData) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    eventData.id = Date.now().toString();
    events.push(eventData);
    localStorage.setItem('events', JSON.stringify(events));
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}