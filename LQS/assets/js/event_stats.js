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
    document.getElementById('statsTitle').textContent = `Estadísticas: ${event.name}`;

    // Cargar estadísticas
    loadEventStats(event);

    // Configurar eventos
    document.getElementById('exportStatsBtn').addEventListener('click', () => {
        exportStats(event);
    });
});

function loadEventStats(event) {
    // Datos básicos
    const participantsCount = event.participants?.length || 0;
    const capacityPercentage = event.capacity > 0 
        ? Math.round((participantsCount / event.capacity) * 100) 
        : 0;
    
    document.getElementById('totalParticipants').textContent = participantsCount;
    document.getElementById('capacityPercentage').textContent = `${capacityPercentage}%`;
    document.getElementById('todayRegistrations').textContent = getTodayRegistrations(event);
    document.getElementById('totalRevenue').textContent = `$${calculateRevenue(event)}`;

    // Gráficos
    renderRegistrationChart(event);
    renderDemographicsChart(event);
}

function getTodayRegistrations(event) {
    if (!event.participants || event.participants.length === 0) return 0;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    return users.filter(user => 
        event.participants.includes(user.id) && 
        user.createdAt.split('T')[0] === today
    ).length;
}

function calculateRevenue(event) {
    // Simulación - en una implementación real usarías datos de pagos
    return (event.participants?.length || 0) * 50;
}

function renderRegistrationChart(event) {
    const ctx = document.getElementById('registrationsChart').getContext('2d');
    
    // Datos simulados para el gráfico
    const labels = [];
    const data = [];
    
    // Generar datos de los últimos 7 días
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
        
        // Conteo simulado de registros por día
        const count = Math.floor(Math.random() * 10);
        data.push(count);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Registros por día',
                data: data,
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: 'rgba(231, 76, 60, 1)',
                borderWidth: 2,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderDemographicsChart(event) {
    const ctx = document.getElementById('demographicsChart').getContext('2d');
    
    // Datos simulados para el gráfico
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['18-25 años', '26-35 años', '36-45 años', '46+ años'],
            datasets: [{
                data: [35, 40, 15, 10],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                }
            }
        }
    });
}

function exportStats(event) {
    // Simulación de exportación
    alert(`Exportando estadísticas del evento: ${event.name}`);
    // En una implementación real, generarías un PDF o Excel con los datos
}