// Tareas predeterminadas por categorías con íconos y colores
const DEFAULT_TASKS = {
    trabajo: [
        { text: 'Revisar correos importantes', hours: 2, icon: '📧', color: '#c084fc' },
        { text: 'Preparar presentación semanal', hours: 24, icon: '📊', color: '#f472b6' },
        { text: 'Reunión con equipo', hours: 48, icon: '👥', color: '#60a5fa' },
        { text: 'Planificar proyecto nuevo', hours: 72, icon: '📋', color: '#a78bfa' }
    ],
    personal: [
        { text: 'Hacer ejercicio', hours: 3, icon: '💪', color: '#34d399' },
        { text: 'Leer 30 minutos', hours: 5, icon: '📚', color: '#fbbf24' },
        { text: 'Llamar a familia', hours: 12, icon: '📞', color: '#f87171' },
        { text: 'Meditar 10 minutos', hours: 2, icon: '🧘', color: '#60a5fa' }
    ],
    estudio: [
        { text: 'Completar curso de JavaScript', hours: 72, icon: '💻', color: '#818cf8' },
        { text: 'Practicar algoritmos', hours: 6, icon: '🧮', color: '#c084fc' },
        { text: 'Ver tutorial de React', hours: 8, icon: '⚛️', color: '#38bdf8' },
        { text: 'Leer documentación', hours: 4, icon: '📖', color: '#f472b6' }
    ],
    hogar: [
        { text: 'Limpiar habitación', hours: 4, icon: '🧹', color: '#4ade80' },
        { text: 'Hacer la compra', hours: 10, icon: '🛒', color: '#facc15' },
        { text: 'Pagar facturas', hours: 48, icon: '💰', color: '#fb923c' },
        { text: 'Regar plantas', hours: 24, icon: '🌱', color: '#34d399' }
    ]
};

// Estado de la aplicación
let currentUser = null;
let currentFilter = 'all';
let currentTheme = 'dark';
let countdownInterval = null;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
});

function checkLoginStatus() {
    const savedUser = localStorage.getItem('multitask-user');
    const savedTheme = localStorage.getItem('multitask-theme');
    
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    if (savedUser) {
        currentUser = savedUser;
        showMainApp();
        initializeApp();
    } else {
        showLogin();
    }
    
    // Solicitar permiso para notificaciones
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function showLogin() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <div class="login-container">
            <div class="theme-switch">
                <button onclick="toggleTheme()" class="theme-btn">
                    <i data-lucide="${currentTheme === 'dark' ? 'moon' : 'sun'}"></i>
                </button>
            </div>
            
            <h1 class="login-title">Multi<span style="color: var(--primary);">Task</span></h1>
            <p class="login-subtitle">Organiza tu día con estilo</p>
            
            <div class="login-form">
                <input type="text" id="login-username" placeholder="Tu nombre" autocomplete="off">
                <input type="password" id="login-password" placeholder="Contraseña (opcional)">
                <button onclick="handleLogin()" class="login-btn">
                    <i data-lucide="log-in"></i>
                    Iniciar sesión
                </button>
            </div>
            
            <div class="quick-categories">
                <h4>📋 Explorar categorías</h4>
                <div class="category-buttons">
                    <button class="category-btn" onclick="showCategoryPreview('trabajo')">
                        <span class="category-dot" style="background: #c084fc;"></span>
                        💼 Trabajo
                    </button>
                    <button class="category-btn" onclick="showCategoryPreview('personal')">
                        <span class="category-dot" style="background: #34d399;"></span>
                        🧘 Personal
                    </button>
                    <button class="category-btn" onclick="showCategoryPreview('estudio')">
                        <span class="category-dot" style="background: #818cf8;"></span>
                        📚 Estudio
                    </button>
                    <button class="category-btn" onclick="showCategoryPreview('hogar')">
                        <span class="category-dot" style="background: #4ade80;"></span>
                        🏠 Hogar
                    </button>
                </div>
            </div>

            <details class="quick-tasks">
                <summary>📋 Ver tareas predeterminadas</summary>
                <div class="task-buttons" id="defaultTasksList"></div>
            </details>
        </div>
    `;
    updateDefaultTasksList();
    lucide.createIcons();
}

function updateDefaultTasksList() {
    const container = document.getElementById('defaultTasksList');
    if (!container) return;
    
    let html = '';
    for (const [category, tasks] of Object.entries(DEFAULT_TASKS)) {
        tasks.forEach((task, index) => {
            html += `<button class="task-btn" onclick="useDefaultTask('${category}', ${index})" style="border-color: ${task.color}">
                ${task.icon} ${task.text}
            </button>`;
        });
    }
    container.innerHTML = html;
}

function showCategoryPreview(category) {
    const task = DEFAULT_TASKS[category][0];
    alert(`📋 Tareas de ${category}:\n\n${DEFAULT_TASKS[category].map(t => `• ${t.icon} ${t.text}`).join('\n')}`);
}

function handleLogin() {
    const username = document.getElementById('login-username').value.trim();
    if (username) {
        currentUser = username;
        localStorage.setItem('multitask-user', username);
        showMainApp();
        initializeApp();
    } else {
        alert('Por favor ingresa tu nombre');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('multitask-user');
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    showLogin();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('multitask-theme', currentTheme);
    
    // Actualizar icono del tema si existe
    const themeIcon = document.querySelector('.theme-btn i');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', currentTheme === 'dark' ? 'moon' : 'sun');
        lucide.createIcons();
    }
}

function useDefaultTask(category, index) {
    const task = DEFAULT_TASKS[category][index];
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + task.hours);
    
    // Formatear fecha para input datetime-local
    const year = deadline.getFullYear();
    const month = String(deadline.getMonth() + 1).padStart(2, '0');
    const day = String(deadline.getDate()).padStart(2, '0');
    const hours = String(deadline.getHours()).padStart(2, '0');
    const minutes = String(deadline.getMinutes()).padStart(2, '0');
    
    const taskInput = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskDate');
    const categorySelect = document.getElementById('taskCategory');
    
    if (taskInput) taskInput.value = task.text;
    if (dateInput) dateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    if (categorySelect) categorySelect.value = category;
}

function showMainApp() {
    const container = document.getElementById('app-container');
    container.innerHTML = `
        <div class="app-header">
            <div class="user-info">
                <span class="username-display">👤 ${currentUser}</span>
                <div class="header-actions">
                    <button onclick="toggleTheme()" class="theme-btn">
                        <i data-lucide="${currentTheme === 'dark' ? 'moon' : 'sun'}"></i>
                    </button>
                    <button onclick="logout()" class="logout-btn">Cerrar sesión</button>
                </div>
            </div>
            <header>
                <h1>Multi<span>Task</span></h1>
                <p id="date-display"></p>
            </header>
        </div>

        <div class="stats-container">
            <div class="stat-card">
                <span class="stat-label">Total</span>
                <span class="stat-value" id="totalTasks">0</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Completadas</span>
                <span class="stat-value" id="completedTasks">0</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Pendientes</span>
                <span class="stat-value" id="pendingTasks">0</span>
            </div>
        </div>

        <div class="progress-container">
            <div class="progress-bar">
                <div id="progressFill" class="progress-fill" style="width: 0%"></div>
            </div>
            <span id="completionRate">0% completado</span>
        </div>

        <details class="quick-tasks">
            <summary>⚡ Tareas rápidas por categoría</summary>
            <div class="category-filters">
                <button class="filter-btn ${currentFilter === 'all' ? 'active' : ''}" onclick="filterTasks('all')">Todas</button>
                <button class="filter-btn ${currentFilter === 'trabajo' ? 'active' : ''}" onclick="filterTasks('trabajo')">💼 Trabajo</button>
                <button class="filter-btn ${currentFilter === 'personal' ? 'active' : ''}" onclick="filterTasks('personal')">🧘 Personal</button>
                <button class="filter-btn ${currentFilter === 'estudio' ? 'active' : ''}" onclick="filterTasks('estudio')">📚 Estudio</button>
                <button class="filter-btn ${currentFilter === 'hogar' ? 'active' : ''}" onclick="filterTasks('hogar')">🏠 Hogar</button>
            </div>
            <div class="task-buttons" id="quickTaskButtons"></div>
        </details>

        <div class="input-container">
            <input type="text" id="taskInput" placeholder="¿Cuál es el siguiente paso?">
            <div class="input-row">
                <input type="datetime-local" id="taskDate">
                <select id="taskCategory" class="category-select">
                    <option value="trabajo">💼 Trabajo</option>
                    <option value="personal">🧘 Personal</option>
                    <option value="estudio">📚 Estudio</option>
                    <option value="hogar">🏠 Hogar</option>
                </select>
            </div>
            <textarea id="taskNotes" placeholder="Notas adicionales (opcional)" rows="2"></textarea>
            <button onclick="addTask()" class="add-btn">
                <i data-lucide="plus"></i> Añadir tarea
            </button>
        </div>

        <ul id="taskList"></ul>

        <div class="footer-stats">
            <span id="pendingCount">0 pendientes</span>
            <div class="footer-actions">
                <button onclick="clearCompleted()" class="clear-btn">
                    <i data-lucide="trash-2"></i> Limpiar
                </button>
                <button onclick="exportTasks()" class="export-btn">
                    <i data-lucide="download"></i>
                </button>
            </div>
        </div>
    `;
    updateQuickTaskButtons();
    lucide.createIcons();
}

function updateQuickTaskButtons() {
    const container = document.getElementById('quickTaskButtons');
    if (!container) return;
    
    let html = '';
    for (const [category, tasks] of Object.entries(DEFAULT_TASKS)) {
        if (currentFilter === 'all' || currentFilter === category) {
            tasks.forEach((task, index) => {
                html += `<button class="task-btn" onclick="useDefaultTask('${category}', ${index})" style="border-color: ${task.color}">
                    ${task.icon} ${task.text}
                </button>`;
            });
        }
    }
    container.innerHTML = html;
}

function filterTasks(filter) {
    currentFilter = filter;
    showMainApp();
    loadTasks();
    updateQuickTaskButtons();
}

function initializeApp() {
    displayCurrentDate();
    loadTasks();
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    countdownInterval = setInterval(updateAllCountdowns, 1000);
}

function displayCurrentDate() {
    const now = new Date();
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
        dateDisplay.innerText = now.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
}

function addTask() {
    const input = document.getElementById('taskInput');
    const dateInput = document.getElementById('taskDate');
    const categorySelect = document.getElementById('taskCategory');
    const notesInput = document.getElementById('taskNotes');

    if (!input.value || !dateInput.value) {
        alert('Por favor completa la tarea y la fecha límite');
        return;
    }

    const task = {
        id: Date.now(),
        text: input.value,
        deadline: new Date(dateInput.value).getTime(),
        completed: false,
        category: categorySelect ? categorySelect.value : 'trabajo',
        favorite: false,
        createdAt: new Date().getTime(),
        notes: notesInput ? notesInput.value : ''
    };

    const tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks-pro', JSON.stringify(tasks));

    // Verificar si es urgente para notificación
    if (task.deadline - new Date().getTime() < 1800000) {
        showNotification('⚠️ Tarea urgente', `"${task.text}" vence pronto`);
    }

    renderTask(task);
    input.value = '';
    dateInput.value = '';
    if (notesInput) notesInput.value = '';
    updateStats();
}

function renderTask(task) {
    const taskList = document.getElementById('taskList');
    if (!taskList) return;
    
    // Filtrar por categoría si es necesario
    if (currentFilter !== 'all' && task.category !== currentFilter) return;
    
    const li = document.createElement('li');
    li.id = `task-${task.id}`;
    li.className = `task-item category-${task.category}`;
    if (task.completed) li.classList.add('completed');
    if (task.favorite) li.classList.add('favorite');

    const categoryColors = {
        trabajo: '#c084fc',
        personal: '#34d399',
        estudio: '#818cf8',
        hogar: '#4ade80'
    };

    li.innerHTML = `
        <div class="task-main">
            <div class="task-info" onclick="toggleTask(${task.id})">
                <div class="circle" style="border-color: ${categoryColors[task.category]}"></div>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                <i data-lucide="star" class="favorite-btn ${task.favorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${task.id})"></i>
                <i data-lucide="x" class="delete-btn" onclick="event.stopPropagation(); deleteTask(${task.id})"></i>
            </div>
        </div>
        ${task.notes ? `<div class="task-notes">📝 ${task.notes}</div>` : ''}
        <div class="task-meta">
            <span class="category-badge" style="background: ${categoryColors[task.category]}20; color: ${categoryColors[task.category]}">
                ${task.category}
            </span>
            <div class="countdown" id="timer-${task.id}">Iniciando...</div>
        </div>
    `;

    taskList.appendChild(li);
    lucide.createIcons();
    updateSingleTimer(task);
}

function updateAllCountdowns() {
    const tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    tasks.forEach(task => {
        if (!task.completed) updateSingleTimer(task);
    });
}

function updateSingleTimer(task) {
    const display = document.getElementById(`timer-${task.id}`);
    if (!display) return;

    const now = new Date().getTime();
    const diff = task.deadline - now;

    if (diff <= 0) {
        display.innerText = "⚠️ TIEMPO AGOTADO";
        display.classList.add('urgent');
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let timeText = '';
    if (days > 0) {
        timeText = `${days}d ${hours}h`;
    } else if (hours > 0) {
        timeText = `${hours}h ${minutes}m`;
    } else {
        timeText = `${minutes}m ${seconds}s`;
    }

    display.innerText = `⏳ ${timeText}`;
    
    if (diff < 1800000) { // Menos de 30 minutos
        display.classList.add('urgent');
    } else {
        display.classList.remove('urgent');
    }
}

function toggleTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    localStorage.setItem('tasks-pro', JSON.stringify(tasks));
    
    const taskElement = document.getElementById(`task-${id}`);
    if (taskElement) {
        taskElement.classList.toggle('completed');
        
        // Si se completó, mostrar mensaje motivador
        if (tasks.find(t => t.id === id).completed) {
            showMotivationalMessage();
        }
    }
    updateStats();
}

function toggleFavorite(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    tasks = tasks.map(t => t.id === id ? {...t, favorite: !t.favorite} : t);
    localStorage.setItem('tasks-pro', JSON.stringify(tasks));
    
    const taskElement = document.getElementById(`task-${id}`);
    if (taskElement) {
        taskElement.classList.toggle('favorite');
        const favIcon = taskElement.querySelector('.favorite-btn');
        favIcon.classList.toggle('active');
    }
}

function deleteTask(id) {
    if (confirm('¿Eliminar esta tarea?')) {
        let tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('tasks-pro', JSON.stringify(tasks));
        
        const taskElement = document.getElementById(`task-${id}`);
        if (taskElement) {
            taskElement.style.animation = 'slideIn 0.3s reverse';
            setTimeout(() => {
                taskElement.remove();
                updateStats();
            }, 200);
        }
    }
}

function clearCompleted() {
    if (confirm('¿Eliminar todas las tareas completadas?')) {
        let tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
        tasks = tasks.filter(t => !t.completed);
        localStorage.setItem('tasks-pro', JSON.stringify(tasks));
        
        const taskList = document.getElementById('taskList');
        if (taskList) {
            taskList.innerHTML = '';
            tasks.forEach(renderTask);
        }
        updateStats();
    }
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    if (taskList) {
        taskList.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
        tasks.forEach(renderTask);
        updateStats();
    }
}

function updateStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const progress = total > 0 ? (completed / total) * 100 : 0;

    const totalEl = document.getElementById('totalTasks');
    const completedEl = document.getElementById('completedTasks');
    const pendingEl = document.getElementById('pendingTasks');
    const progressFill = document.getElementById('progressFill');
    const completionRate = document.getElementById('completionRate');
    const pendingCount = document.getElementById('pendingCount');

    if (totalEl) totalEl.innerText = total;
    if (completedEl) completedEl.innerText = completed;
    if (pendingEl) pendingEl.innerText = pending;
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (completionRate) completionRate.innerText = `${Math.round(progress)}% completado`;
    if (pendingCount) pendingCount.innerText = `${pending} pendientes`;
}

function showNotification(title, body) {
    if (Notification.permission === "granted") {
        new Notification(title, { 
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/1632/1632598.png'
        });
    }
}

function showMotivationalMessage() {
    const messages = [
        '🎉 ¡Buen trabajo!',
        '⭐ ¡Sigue así!',
        '💪 ¡Una menos!',
        '🌟 ¡Excelente!',
        '🎯 ¡Meta cumplida!'
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    // Mostrar mensaje flotante
    const msg = document.createElement('div');
    msg.className = 'motivation-message';
    msg.innerText = randomMsg;
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--primary), var(--accent));
        color: white;
        padding: 10px 20px;
        border-radius: 30px;
        animation: slideIn 0.3s;
        z-index: 1000;
    `;
    document.body.appendChild(msg);
    setTimeout(() => {
        msg.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => msg.remove(), 300);
    }, 2000);
}

function exportTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks-pro') || '[]');
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `multitask-${currentUser}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Agregar estilos adicionales dinámicamente
const style = document.createElement('style');
style.textContent = `
    .task-notes {
        font-size: 0.75rem;
        opacity: 0.6;
        padding: 5px 10px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
        margin: 5px 0;
    }
    
    .logout-btn {
        background: none;
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        padding: 6px 12px;
        color: var(--text-primary);
        cursor: pointer;
        font-size: 0.7rem;
        transition: all 0.2s;
    }
    
    .logout-btn:hover {
        border-color: var(--danger);
        color: var(--danger);
        background: rgba(251, 113, 133, 0.1);
    }
    
    textarea {
        resize: vertical;
        min-height: 60px;
        font-family: 'Inter', sans-serif;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);