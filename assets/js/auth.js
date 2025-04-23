/**
 * Sistema de Autenticación para Plataforma de Eventos
 * Funcionalidades:
 * - Login de usuarios
 * - Registro de nuevos usuarios
 * - Recuperación de contraseña
 * - Validación de formularios
 * - Manejo de sesiones
 */

// Datos iniciales (simulando base de datos)
const initAuthSystem = () => {
    if (!localStorage.getItem('users')) {
        const adminUser = {
            id: '1',
            name: 'Administrador',
            email: 'admin@eventos.com',
            password: btoa('Admin123'), // Encriptación básica
            role: 'admin',
            verified: true,
            createdAt: new Date().toISOString()
        };
        
        const organizerUser = {
            id: '2',
            name: 'Organizador Ejemplo',
            email: 'organizador@eventos.com',
            password: btoa('Organizador123'),
            role: 'organizer',
            verified: true,
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('users', JSON.stringify([adminUser, organizerUser]));
    }
};

// Inicializar el sistema al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    initAuthSystem();
    setupAuthForms();
    checkCurrentSession();
});

// Configurar todos los formularios de autenticación
const setupAuthForms = () => {
    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Recover Password Form
    const recoverForm = document.getElementById('recoverForm');
    if (recoverForm) {
        recoverForm.addEventListener('submit', handleRecoverPassword);
    }

    // Reset Password Form
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }

    // Manejar cambio entre pestañas
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'register') {
        openTab('register');
    }
    
    // Manejar enlaces de recuperación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if(href === '#recover') {
                window.location.href = 'recover.html';
            }
        });
    });
};

// Manejar el inicio de sesión
const handleLogin = async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.querySelector('#loginForm input[type="checkbox"]').checked;

    // Validación básica
    if (!email || !password) {
        showAuthError('Por favor complete todos los campos');
        return;
    }

    try {
        const user = authenticateUser(email, password);
        
        if (user) {
            // Guardar sesión
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            saveUserSession(user);
            
            // Redirección basada en rol
            redirectByRole(user.role);
        } else {
            showAuthError('Credenciales incorrectas');
        }
    } catch (error) {
        showAuthError('Error al iniciar sesión: ' + error.message);
    }
};

// Autenticar usuario
const authenticateUser = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (!user) return null;
    
    // Comparar contraseñas (encriptadas con btoa en este ejemplo)
    if (atob(user.password) === password) {
        return { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified
        };
    }
    
    return null;
};

// Redirección basada en rol
const redirectByRole = (role) => {
    // Verificar si estamos en un subdirectorio
    const basePath = window.location.pathname.includes('/organizer/') ? '../' : '';
    
    switch (role) {
        case 'admin':
            window.location.href = `${basePath}admin/dashboard.html`;
            break;
        case 'organizer':
            window.location.href = `${basePath}organizer.html`;  // Cambiado a organizer.html
            break;
        default:
            window.location.href = `${basePath}participant.html`; // Cambiado a participant.html
    }
};

// Manejar registro de nuevo usuario
const handleRegister = (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    const userType = document.querySelector('input[name="userType"]:checked').value;
    const termsAccepted = document.querySelector('#registerForm input[type="checkbox"]').checked;

    // Validaciones
    if (!name || !email || !password || !confirmPassword) {
        showAuthError('Por favor complete todos los campos');
        return;
    }

    if (password !== confirmPassword) {
        showAuthError('Las contraseñas no coinciden');
        return;
    }

    if (!validatePassword(password)) {
        showAuthError('La contraseña debe tener al menos 8 caracteres, 1 número y 1 mayúscula');
        return;
    }

    if (!termsAccepted) {
        showAuthError('Debe aceptar los términos y condiciones');
        return;
    }

    try {
        registerNewUser(name, email, password, userType);
        showAuthSuccess('Registro exitoso! Por favor inicie sesión');
        openTab('login');
        document.getElementById('registerForm').reset();
    } catch (error) {
        showAuthError(error.message);
    }
};

// Validar fortaleza de contraseña
const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    
    return password.length >= minLength && hasNumber && hasUpper;
};

// Registrar nuevo usuario
const registerNewUser = (name, email, password, role) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Verificar si el email ya existe
    if (users.some(user => user.email === email)) {
        throw new Error('El correo electrónico ya está registrado');
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Encriptación básica
        role,
        verified: false,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Enviar email de verificación (simulado)
    sendVerificationEmail(email);
};

// Manejar recuperación de contraseña
const handleRecoverPassword = (e) => {
    e.preventDefault();
    
    const email = document.getElementById('recoverEmail').value.trim();
    
    if (!email) {
        showAuthError('Por favor ingrese su correo electrónico');
        return;
    }
    
    try {
        sendPasswordResetEmail(email);
        document.getElementById('recoverForm').style.display = 'none';
        document.getElementById('recoverSuccess').style.display = 'block';
    } catch (error) {
        showAuthError(error.message);
    }
};

// Manejar restablecimiento de contraseña
const handleResetPassword = (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const token = document.getElementById('resetToken').value;
    
    if (!newPassword || !confirmPassword) {
        showAuthError('Por favor complete todos los campos');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAuthError('Las contraseñas no coinciden');
        return;
    }
    
    if (!validatePassword(newPassword)) {
        showAuthError('La contraseña debe tener al menos 8 caracteres, 1 número y 1 mayúscula');
        return;
    }
    
    try {
        resetUserPassword(token, newPassword);
        document.getElementById('resetForm').style.display = 'none';
        document.getElementById('resetSuccess').style.display = 'block';
    } catch (error) {
        showAuthError(error.message);
    }
};

// Función para cambiar contraseña
const resetUserPassword = (token, newPassword) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.resetToken === token);
    
    if (userIndex === -1) {
        throw new Error('Token inválido o expirado');
    }
    
    users[userIndex].password = btoa(newPassword);
    delete users[userIndex].resetToken;
    localStorage.setItem('users', JSON.stringify(users));
};

// Guardar sesión de usuario
const saveUserSession = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('isAuthenticated', 'true');
};

// Verificar sesión actual
const checkCurrentSession = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    
    if (currentUser && isAuthenticated) {
        redirectByRole(currentUser.role);
    }
};

// Cerrar sesión
const logout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('isAuthenticated');
    window.location.href = '../index.html';
};

// Mostrar errores de autenticación
const showAuthError = (message) => {
    // Eliminar errores anteriores
    const existingError = document.querySelector('.auth-error');
    if (existingError) existingError.remove();
    
    const errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.innerHTML = `
        <div class="error-icon">!</div>
        <div class="error-message">${message}</div>
    `;
    
    const activeForm = document.querySelector('.auth-form.active');
    if (activeForm) {
        activeForm.insertBefore(errorElement, activeForm.firstChild);
        
        // Desaparecer después de 5 segundos
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
};

// Mostrar mensajes de éxito
const showAuthSuccess = (message) => {
    const successElement = document.createElement('div');
    successElement.className = 'auth-success';
    successElement.innerHTML = `
        <div class="success-icon">✓</div>
        <div class="success-message">${message}</div>
    `;
    
    const activeForm = document.querySelector('.auth-form.active');
    if (activeForm) {
        activeForm.insertBefore(successElement, activeForm.firstChild);
        
        // Desaparecer después de 5 segundos
        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }
};

// Cambiar entre pestañas
const openTab = (tabName) => {
    // Actualizar URL
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabName);
    window.history.pushState({}, '', url);
    
    // Cambiar pestañas visualmente
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });
    
    // Cambiar formularios
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
        if (form.id.includes(tabName)) {
            form.classList.add('active');
        }
    });
};

// Funciones simuladas para emails
const sendVerificationEmail = (email) => {
    console.log(`Email de verificación enviado a: ${email}`);
    // En una implementación real, usarías un servicio de email
};

const sendPasswordResetEmail = (email) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (!user) {
        console.log(`Email no registrado: ${email}`);
        return; // No revelar que el email no existe por seguridad
    }
    
    // Generar token simple (en producción usar algo más seguro)
    const resetToken = `token-${Date.now()}`;
    user.resetToken = resetToken;
    localStorage.setItem('users', JSON.stringify(users));
    
    console.log(`Email de recuperación enviado a: ${email} con token: ${resetToken}`);
    // En una implementación real, enviarías un email con un enlace que incluya el token
};

// Hacer funciones accesibles globalmente
window.openTab = openTab;
window.logout = logout;