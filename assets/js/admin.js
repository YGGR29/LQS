document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticación y rol
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = '../index.html';
        return;
    }

    // Configurar navegación por pestañas
    setupTabNavigation();

    // Cargar datos del dashboard
    loadDashboardData();

    // Cargar lista de usuarios
    loadUsers();

    // Cargar lista de eventos
    loadEvents();

    // Configurar eventos
    setupEventListeners();

    // Cargar configuración
    loadSettings();
});

function setupTabNavigation() {
    const tabs = document.querySelectorAll('.admin-nav li');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remover clase active de todos los tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Agregar clase active al tab seleccionado
            tab.classList.add('active');
            
            // Ocultar todos los contenidos
            document.querySelectorAll('.admin-tab').forEach(content => {
                content.classList.remove('active');
            });
            
            // Mostrar el contenido correspondiente
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}

function loadDashboardData() {
    // Datos simulados - en una implementación real estos vendrían de una API
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const registrations = JSON.parse(localStorage.getItem('registrations')) || [];
    
    // Estadísticas
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalEvents').textContent = events.filter(e => new Date(e.date) >= new Date()).length;
    document.getElementById('totalRegistrations').textContent = registrations.length;
    document.getElementById('totalRevenue').textContent = `$${(registrations.length * 50).toLocaleString()}`;
    
    // Cambios porcentuales (simulados)
    document.getElementById('userChange').textContent = '+12% este mes';
    document.getElementById('eventChange').textContent = '+8% este mes';
    document.getElementById('registrationChange').textContent = '+23% esta semana';
    document.getElementById('revenueChange').textContent = '+18% este mes';
    
    // Gráficos
    renderUsersChart(users);
    renderEventsChart(events);
    
    // Actividad reciente (simulada)
    renderRecentActivity();
}

function renderUsersChart(users) {
    const ctx = document.getElementById('usersChart').getContext('2d');
    
    // Agrupar usuarios por mes de registro (simulado)
    const monthlyData = [5, 8, 12, 15, 10, 14, 18, 20, 15, 12, 8, 10];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
            datasets: [{
                label: 'Registro de Usuarios',
                data: monthlyData,
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

function renderEventsChart(events) {
    const ctx = document.getElementById('eventsChart').getContext('2d');
    
    // Datos simulados por categoría
    const categories = {
        'Conferencia': 0,
        'Taller': 0,
        'Social': 0,
        'Deportivo': 0,
        'Otro': 0
    };
    
    events.forEach(event => {
        // En una implementación real, usarías la categoría real del evento
        const randomCategory = Object.keys(categories)[Math.floor(Math.random() * Object.keys(categories).length)];
        categories[randomCategory]++;
    });
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: [
                    'rgba(231, 76, 60, 0.7)',
                    'rgba(52, 152, 219, 0.7)',
                    'rgba(46, 204, 113, 0.7)',
                    'rgba(155, 89, 182, 0.7)',
                    'rgba(241, 196, 15, 0.7)'
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

function renderRecentActivity() {
    const activities = [
        { user: 'Ana López', action: 'Creó un nuevo evento', date: '2023-05-15T10:30:00' },
        { user: 'Carlos Ruiz', action: 'Se registró en un evento', date: '2023-05-15T09:15:00' },
        { user: 'María González', action: 'Actualizó su perfil', date: '2023-05-14T16:45:00' },
        { user: 'Admin', action: 'Eliminó un evento', date: '2023-05-14T14:20:00' },
        { user: 'Juan Pérez', action: 'Pagó una inscripción', date: '2023-05-14T11:10:00' }
    ];
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <tr>
            <td>${activity.user}</td>
            <td>${activity.action}</td>
            <td>${new Date(activity.date).toLocaleString('es-ES')}</td>
        </tr>
    `).join('');
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    renderUsersTable(users);
}

function renderUsersTable(users) {
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No hay usuarios registrados</td>
            </tr>
        `;
        return;
    }
    
    usersList.innerHTML = users.map(user => `
        <tr>
            <td><input type="checkbox" class="user-checkbox" data-id="${user.id}"></td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${new Date(user.createdAt).toLocaleDateString('es-ES')}</td>
            <td><span class="status-badge status-active">Activo</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editUser('${user.id}')">Editar</button>
                <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function loadEvents() {
    const events = JSON.parse(localStorage.getItem('events')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Agregar nombre del organizador a cada evento
    const eventsWithOrganizer = events.map(event => {
        const organizer = users.find(u => u.id === event.organizerId);
        return {
            ...event,
            organizerName: organizer ? organizer.name : 'Desconocido'
        };
    });
    
    renderEventsTable(eventsWithOrganizer);
}

function renderEventsTable(events) {
    const eventsList = document.getElementById('eventsList');

    if (events.length === 0) {
        eventsList.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No hay eventos registrados</td>
            </tr>
        `;
        return;
    }

    eventsList.innerHTML = events.map(event => `
        <tr>
            <td>${event.title}</td>
            <td>${event.organizerName}</td>
            <td>${new Date(event.date).toLocaleDateString('es-ES')}</td>
            <td>${event.location}</td>
            <td>${event.category}</td>
            <td><span class="status-badge status-${event.status.toLowerCase()}">${event.status}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editEvent('${event.id}')">Editar</button>
                <button class="btn-action btn-delete" onclick="deleteEvent('${event.id}')">Eliminar</button>
            </td>
        </tr>
    `).join('');
}
