document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'organizer') {
        window.location.href = '../index.html';
        return;
    }

    const eventId = localStorage.getItem('currentEventView');
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

    // Mostrar título con nombre del evento
    document.getElementById('participantsTitle').textContent = `Participantes: ${event.name}`;

    // Cargar participantes
    loadParticipants(event.participants || []);

    // Configurar eventos
    document.getElementById('exportParticipantsBtn').addEventListener('click', () => {
        exportParticipantsToCSV(event.name, event.participants || []);
    });

    document.getElementById('participantSearch').addEventListener('input', (e) => {
        filterParticipants(e.target.value);
    });

    document.getElementById('sendMessageBtn').addEventListener('click', () => {
        sendMessageToSelected();
    });
});

function loadParticipants(participantIds) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const participants = users.filter(user => participantIds.includes(user.id));
    const participantsList = document.getElementById('participantsList');
    
    if (participants.length === 0) {
        participantsList.innerHTML = `<tr><td colspan="5" class="no-data">No hay participantes registrados</td></tr>`;
        return;
    }

    participantsList.innerHTML = participants.map(user => `
        <tr>
            <td><input type="checkbox" class="participant-checkbox" data-id="${user.id}"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
            <td>
                <button class="btn-small" onclick="viewParticipantDetails('${user.id}')">
                    Ver
                </button>
            </td>
        </tr>
    `).join('');
}

function filterParticipants(searchTerm) {
    const rows = document.querySelectorAll('#participantsList tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const email = row.cells[2].textContent.toLowerCase();
        row.style.display = (name.includes(term) || email.includes(term)) ? '' : 'none';
    });
}

function exportParticipantsToCSV(eventName, participantIds) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const participants = users.filter(user => participantIds.includes(user.id));
    
    let csvContent = "Nombre,Email,Fecha de Registro\n";
    participants.forEach(user => {
        csvContent += `${user.name},${user.email},${new Date(user.createdAt).toLocaleDateString('es-ES')}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `participantes_${eventName.replace(/ /g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function sendMessageToSelected() {
    const selected = Array.from(document.querySelectorAll('.participant-checkbox:checked'))
        .map(checkbox => checkbox.getAttribute('data-id'));
    
    if (selected.length === 0) {
        alert('Por favor selecciona al menos un participante');
        return;
    }
    
    localStorage.setItem('messageRecipients', JSON.stringify(selected));
    window.location.href = 'send_message.html';
}

window.viewParticipantDetails = (userId) => {
    localStorage.setItem('viewingParticipant', userId);
    window.location.href = 'participant_details.html';
};