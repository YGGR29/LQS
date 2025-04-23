document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'organizer') {
        window.location.href = '../index.html';
        return;
    }

    const eventId = localStorage.getItem('editingEvent');
    if (!eventId) {
        window.location.href = 'organizer.html';
        return;
    }

    const events = JSON.parse(localStorage.getItem('events')) || [];
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
        window.location.href = 'organizer.html';
        return;
    }

    // Llenar formulario con datos del evento
    document.getElementById('editEventName').value = event.name;
    document.getElementById('editEventDescription').value = event.description;
    document.getElementById('editEventDate').value = event.date;
    document.getElementById('editEventTime').value = event.time;
    document.getElementById('editEventLocation').value = event.location;
    document.getElementById('editEventCapacity').value = event.capacity;
    document.getElementById('editEventImage').value = event.image || '';

    // Configurar eventos
    document.getElementById('editEventForm').addEventListener('submit', (e) => {
        e.preventDefault();
        updateEvent(eventId);
    });

    document.getElementById('deleteEventBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
            deleteEvent(eventId);
        }
    });
});

function updateEvent(eventId) {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const eventIndex = events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return;

    const updatedEvent = {
        ...events[eventIndex],
        name: document.getElementById('editEventName').value.trim(),
        description: document.getElementById('editEventDescription').value.trim(),
        date: document.getElementById('editEventDate').value,
        time: document.getElementById('editEventTime').value,
        location: document.getElementById('editEventLocation').value.trim(),
        capacity: parseInt(document.getElementById('editEventCapacity').value) || 0,
        image: document.getElementById('editEventImage').value.trim()
    };

    events[eventIndex] = updatedEvent;
    localStorage.setItem('events', JSON.stringify(events));
    
    showNotification('Evento actualizado exitosamente', 'success');
    setTimeout(() => {
        window.location.href = 'organizer.html';
    }, 1500);
}

function deleteEvent(eventId) {
    let events = JSON.parse(localStorage.getItem('events')) || [];
    events = events.filter(e => e.id !== eventId);
    localStorage.setItem('events', JSON.stringify(events));
    
    showNotification('Evento eliminado exitosamente', 'success');
    setTimeout(() => {
        window.location.href = 'organizer.html';
    }, 1500);
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