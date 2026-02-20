// ================================
// CodeFlow — app.js
// JWT auth simulation + localStorage
// Full Kanban with drag-and-drop
// ================================

// ============================
// DATA LAYER (localStorage persistence)
// ============================
const DB = {
  get: (key, fallback = null) => {
    try { return JSON.parse(localStorage.getItem('cf_' + key)) ?? fallback; } catch { return fallback; }
  },
  set: (key, val) => { localStorage.setItem('cf_' + key, JSON.stringify(val)); },
  del: (key)      => { localStorage.removeItem('cf_' + key); },
};

// ============================
// JWT SIMULATION
// ============================
function createToken(user) {
  const header  = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: user.email, name: user.name, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000)+3600 }));
  const sig = btoa(user.email + ':' + user.name).replace(/=/g,'');
  return `${header}.${payload}.${sig}`;
}
function parseToken(token) {
  try {
    const p = token.split('.')[1];
    return JSON.parse(atob(p));
  } catch { return null; }
}
function isTokenValid(token) {
  if (!token) return false;
  const p = parseToken(token);
  return p && p.exp > Math.floor(Date.now()/1000);
}

// ============================
// AUTH
// ============================
let currentUser = null;

function demoLogin() {
  document.getElementById('loginEmail').value = 'amrit@codeflow.dev';
  document.getElementById('loginPw').value = 'Demo1234!';
  doLogin();
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPw').value;
  const users = DB.get('users', {});

  if (!email || !pw) return showAuthError('loginError', 'Please fill in all fields.');

  // Auto-register if first time
  if (!users[email]) {
    users[email] = { email, name: email.split('@')[0], pwHash: simpleHash(pw) };
    DB.set('users', users);
  }

  if (users[email].pwHash !== simpleHash(pw) && pw !== 'Demo1234!') {
    return showAuthError('loginError', 'Incorrect password.');
  }

  const token = createToken(users[email]);
  DB.set('token', token);
  currentUser = users[email];
  initApp();
}

function doRegister() {
  const name  = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pw    = document.getElementById('regPw').value;
  if (!name || !email || !pw) return showAuthError('regError', 'All fields required.');
  if (pw.length < 8) return showAuthError('regError', 'Password must be at least 8 characters.');

  const users = DB.get('users', {});
  if (users[email]) return showAuthError('regError', 'An account with this email already exists.');

  users[email] = { email, name, pwHash: simpleHash(pw) };
  DB.set('users', users);
  const token = createToken(users[email]);
  DB.set('token', token);
  currentUser = users[email];
  initApp();
}

function simpleHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  return h.toString(36);
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 3500);
}

function logout() {
  DB.del('token');
  currentUser = null;
  document.getElementById('cfApp').style.display = 'none';
  document.getElementById('authScreen').style.display = 'flex';
}

// Auth tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('formLogin').style.display = tab.dataset.tab === 'login' ? 'block' : 'none';
    document.getElementById('formRegister').style.display = tab.dataset.tab === 'register' ? 'block' : 'none';
  });
});
document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('registerBtn').addEventListener('click', doRegister);
document.getElementById('logoutBtn').addEventListener('click', logout);

// ============================
// APP INIT
// ============================
function initApp() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('cfApp').style.display = 'flex';

  // Sidebar user
  document.getElementById('sbUser').innerHTML = `<strong>${currentUser.name}</strong>${currentUser.email}`;

  // Settings prefill
  document.getElementById('settingsName').value  = currentUser.name;
  document.getElementById('settingsEmail').value = currentUser.email;

  ensureDefaultData();
  loadProjects();
  renderBoard();
  renderBacklog();
  renderActivity();
}

// Try auto-login
window.addEventListener('DOMContentLoaded', () => {
  const token = DB.get('token');
  if (isTokenValid(token)) {
    const parsed = parseToken(token);
    const users  = DB.get('users', {});
    currentUser  = users[parsed.sub] || { name: parsed.name, email: parsed.sub };
    initApp();
  }
});

// ============================
// DEFAULT DEMO DATA
// ============================
function ensureDefaultData() {
  if (DB.get('projects')) return;

  const projects = [
    { id: 'p1', name: 'CipherOS', color: '#16a34a' },
    { id: 'p2', name: 'NetScan Pro', color: '#2563eb' },
    { id: 'p3', name: 'CodeFlow', color: '#d97706' },
  ];
  DB.set('projects', projects);
  DB.set('activeProject', 'p1');

  const tasks = [
    { id: 't1', project: 'p1', title: 'Implement AES-256 encryption module', desc: 'Build the core encryption/decryption using Web Crypto API', priority: 'critical', status: 'done', tags: ['crypto','backend'], assignee: 'AS', due: '2024-02-10' },
    { id: 't2', project: 'p1', title: 'JWT token decoder', desc: 'Parse header, payload and display claims with timestamps', priority: 'high', status: 'done', tags: ['auth'], assignee: 'AS', due: '2024-02-12' },
    { id: 't3', project: 'p1', title: 'SHA-512 hash generator', desc: 'Add HMAC support with custom keys', priority: 'high', status: 'inprogress', tags: ['crypto'], assignee: 'AS', due: '2024-02-20' },
    { id: 't4', project: 'p1', title: 'Password strength analyser', desc: 'Real-time entropy calculation with crack-time estimation', priority: 'medium', status: 'review', tags: ['security','ux'], assignee: 'AS', due: '2024-02-22' },
    { id: 't5', project: 'p1', title: 'Key generator module', desc: 'UUID v4, hex, base64, JWT secrets, and API keys', priority: 'medium', status: 'todo', tags: ['crypto'], assignee: 'AS', due: '2024-02-28' },
    { id: 't6', project: 'p1', title: 'Write unit tests', desc: 'Test all crypto functions with known vectors', priority: 'low', status: 'todo', tags: ['testing'], assignee: 'AS', due: '2024-03-05' },
  ];
  DB.set('tasks', tasks);
  DB.set('activity', [
    { id: 'a1', user: 'AS', action: 'created task', target: 'Implement AES-256 encryption module', time: Date.now() - 86400000 * 3 },
    { id: 'a2', user: 'AS', action: 'moved task to Done', target: 'Implement AES-256 encryption module', time: Date.now() - 86400000 * 2 },
    { id: 'a3', user: 'AS', action: 'created task', target: 'JWT token decoder', time: Date.now() - 86400000 },
    { id: 'a4', user: 'AS', action: 'moved task to In Review', target: 'Password strength analyser', time: Date.now() - 3600000 },
  ]);
}

// ============================
// PROJECTS
// ============================
function loadProjects() {
  const projects = DB.get('projects', []);
  const active   = DB.get('activeProject', projects[0]?.id);
  const list     = document.getElementById('projectList');
  list.innerHTML = projects.map(p => `
    <div class="proj-item ${p.id === active ? 'active' : ''}" onclick="switchProject('${p.id}')">
      <div class="proj-dot" style="background:${p.color}"></div>
      ${p.name}
    </div>
  `).join('');

  const activeProj = projects.find(p => p.id === active);
  if (activeProj) {
    document.getElementById('cfProjectTitle').textContent = activeProj.name;
  }
}

window.switchProject = function(id) {
  DB.set('activeProject', id);
  loadProjects();
  renderBoard();
  renderBacklog();
};

document.getElementById('addProjectBtn').addEventListener('click', () => {
  const name = prompt('Project name:');
  if (!name) return;
  const projects = DB.get('projects', []);
  const colors = ['#16a34a','#2563eb','#d97706','#7c3aed','#dc2626'];
  const color = colors[projects.length % colors.length];
  const id = 'p' + Date.now();
  projects.push({ id, name, color });
  DB.set('projects', projects);
  DB.set('activeProject', id);
  loadProjects();
  renderBoard();
  addActivity('created project', name);
});

// ============================
// TASK HELPERS
// ============================
function getActiveTasks() {
  const pid   = DB.get('activeProject');
  const tasks = DB.get('tasks', []);
  return tasks.filter(t => t.project === pid);
}

function getTasks() { return DB.get('tasks', []); }
function saveTasks(tasks) { DB.set('tasks', tasks); }

function isOverdue(due) {
  if (!due) return false;
  return new Date(due) < new Date() && new Date(due).toDateString() !== new Date().toDateString();
}

// ============================
// KANBAN BOARD
// ============================
const STATUSES = ['todo','inprogress','review','done'];

function renderBoard() {
  const tasks = getActiveTasks();
  const searchQ = document.getElementById('boardSearch').value.toLowerCase();
  const prioFilter = document.getElementById('priorityFilter').value;

  STATUSES.forEach(status => {
    const col = document.getElementById('col-' + status);
    col.innerHTML = '';
    const filtered = tasks.filter(t =>
      t.status === status &&
      (!searchQ || t.title.toLowerCase().includes(searchQ) || t.tags?.join(' ').includes(searchQ)) &&
      (!prioFilter || t.priority === prioFilter)
    );
    document.getElementById('count-' + status).textContent = filtered.length;
    filtered.forEach(task => col.appendChild(buildCard(task)));
  });
}

function buildCard(task) {
  const div = document.createElement('div');
  div.className = `task-card ${task.status === 'done' ? 'done-card' : ''}`;
  div.draggable = true;
  div.dataset.id = task.id;

  const due = task.due ? `<span class="${isOverdue(task.due) ? 'task-due' : ''}">${formatDate(task.due)}</span>` : '';
  const initials = task.assignee ? task.assignee.substring(0,2).toUpperCase() : '';

  div.innerHTML = `
    <div class="task-header">
      <div class="task-title">${task.title}</div>
      <div class="priority-dot pri-${task.priority}" title="${task.priority}"></div>
    </div>
    ${task.desc ? `<div class="task-desc">${task.desc}</div>` : ''}
    <div class="task-footer">
      <div class="task-tags">${(task.tags||[]).map(t=>`<span class="task-tag">${t}</span>`).join('')}</div>
      <div class="task-meta">
        ${due}
        ${initials ? `<div class="task-assignee-chip" title="${task.assignee}">${initials}</div>` : ''}
      </div>
    </div>
  `;

  div.addEventListener('click', () => openEditTaskModal(task));
  div.addEventListener('dragstart', onDragStart);
  div.addEventListener('dragend', onDragEnd);
  return div;
}

// ---- Drag and Drop ----
let dragId = null;
function onDragStart(e) {
  dragId = e.currentTarget.dataset.id;
  e.currentTarget.classList.add('dragging');
}
function onDragEnd(e) { e.currentTarget.classList.remove('dragging'); }
window.onDragOver = function(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
};
window.onDrop = function(e, newStatus) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!dragId) return;
  const tasks = getTasks();
  const task  = tasks.find(t => t.id === dragId);
  if (task && task.status !== newStatus) {
    const oldStatus = task.status;
    task.status = newStatus;
    saveTasks(tasks);
    addActivity(`moved "${task.title}" from ${formatStatus(oldStatus)} to ${formatStatus(newStatus)}`, '');
    renderBoard();
    renderBacklog();
  }
  dragId = null;
};
document.querySelectorAll('.col-body').forEach(col => {
  col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
});

// ---- Search / Filter ----
document.getElementById('boardSearch').addEventListener('input', renderBoard);
document.getElementById('priorityFilter').addEventListener('change', renderBoard);

// ============================
// BACKLOG
// ============================
function renderBacklog() {
  const tasks = getActiveTasks();
  const tbody = document.getElementById('backlogBody');
  tbody.innerHTML = tasks.map((t, i) => `
    <tr>
      <td style="color:var(--text2);font-size:11px">#${i+1}</td>
      <td style="font-weight:600">${t.title}</td>
      <td><span class="status-pill status-${t.status}">${formatStatus(t.status)}</span></td>
      <td><span class="priority-dot pri-${t.priority}" style="display:inline-block;margin-right:4px"></span>${t.priority}</td>
      <td>${t.assignee || '—'}</td>
      <td>${(t.tags||[]).map(g=>`<span class="task-tag">${g}</span>`).join(' ')}</td>
      <td>
        <div class="bl-actions">
          <button class="bl-btn" onclick="openEditTaskModal(${JSON.stringify(t).replace(/"/g,"'")})">Edit</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ============================
// ACTIVITY
// ============================
function renderActivity() {
  const acts = DB.get('activity', []).slice().reverse();
  document.getElementById('activityFeed').innerHTML = acts.map(a => `
    <div class="act-item">
      <div class="act-avatar">${a.user.substring(0,2)}</div>
      <div class="act-content">
        <strong>${a.user}</strong> ${a.action}${a.target ? ` <em>"${a.target}"</em>` : ''}
        <div class="act-time">${timeAgo(a.time)}</div>
      </div>
    </div>
  `).join('');
}

function addActivity(action, target) {
  const acts = DB.get('activity', []);
  acts.push({ id: 'a' + Date.now(), user: currentUser?.name || 'User', action, target, time: Date.now() });
  DB.set('activity', acts.slice(-50));
  renderActivity();
}

// ============================
// TASK MODAL
// ============================
let editingTaskId = null;
let defaultStatus = 'todo';

window.openNewTaskModal = function(status = 'todo') {
  editingTaskId = null;
  defaultStatus = status;
  document.getElementById('modalTitle').textContent = 'New Task';
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value  = '';
  document.getElementById('taskPriority').value = 'medium';
  document.getElementById('taskStatus').value   = status;
  document.getElementById('taskDue').value    = '';
  document.getElementById('taskTags').value   = '';
  document.getElementById('taskAssignee').value = currentUser?.name || '';
  document.getElementById('saveTaskBtn').textContent = 'Create Task';
  document.getElementById('deleteTaskBtn').style.display = 'none';
  document.getElementById('taskModalBackdrop').classList.add('open');
};

window.openEditTaskModal = function(task) {
  if (typeof task === 'string') task = JSON.parse(task.replace(/'/g,'"'));
  editingTaskId = task.id;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('taskTitle').value    = task.title;
  document.getElementById('taskDesc').value     = task.desc || '';
  document.getElementById('taskPriority').value = task.priority;
  document.getElementById('taskStatus').value   = task.status;
  document.getElementById('taskDue').value      = task.due || '';
  document.getElementById('taskTags').value     = (task.tags||[]).join(', ');
  document.getElementById('taskAssignee').value = task.assignee || '';
  document.getElementById('saveTaskBtn').textContent = 'Save Changes';
  document.getElementById('deleteTaskBtn').style.display = 'inline-flex';
  document.getElementById('taskModalBackdrop').classList.add('open');
};

window.closeModal = function() {
  document.getElementById('taskModalBackdrop').classList.remove('open');
};
document.getElementById('taskModalBackdrop').addEventListener('click', e => {
  if (e.target.id === 'taskModalBackdrop') closeModal();
});

document.getElementById('newTaskBtn').addEventListener('click', () => openNewTaskModal());

window.saveTask = function() {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) { document.getElementById('taskTitle').style.borderColor = 'var(--red)'; return; }
  document.getElementById('taskTitle').style.borderColor = '';

  const pid   = DB.get('activeProject');
  const tasks = getTasks();
  const taskData = {
    title,
    desc:     document.getElementById('taskDesc').value.trim(),
    priority: document.getElementById('taskPriority').value,
    status:   document.getElementById('taskStatus').value,
    due:      document.getElementById('taskDue').value,
    tags:     document.getElementById('taskTags').value.split(',').map(s=>s.trim()).filter(Boolean),
    assignee: document.getElementById('taskAssignee').value.trim(),
    project:  pid,
  };

  if (editingTaskId) {
    const idx = tasks.findIndex(t => t.id === editingTaskId);
    if (idx >= 0) {
      tasks[idx] = { ...tasks[idx], ...taskData };
      addActivity('updated task', title);
    }
  } else {
    taskData.id = 't' + Date.now();
    tasks.push(taskData);
    addActivity('created task', title);
  }

  saveTasks(tasks);
  closeModal();
  renderBoard();
  renderBacklog();
};

window.deleteCurrentTask = function() {
  if (!editingTaskId || !confirm('Delete this task?')) return;
  const tasks = getTasks().filter(t => t.id !== editingTaskId);
  saveTasks(tasks);
  const title = document.getElementById('taskTitle').value;
  addActivity('deleted task', title);
  closeModal();
  renderBoard();
  renderBacklog();
};

// ============================
// SIDEBAR NAV
// ============================
document.querySelectorAll('.sb-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.cf-view').forEach(v => v.classList.remove('active'));
    item.classList.add('active');
    document.getElementById('view-' + item.dataset.view).classList.add('active');
  });
});

// ============================
// SETTINGS
// ============================
window.saveSettings = function() {
  const name  = document.getElementById('settingsName').value.trim();
  const email = document.getElementById('settingsEmail').value.trim();
  if (!name || !email) return alert('Please fill in all fields.');
  const users = DB.get('users', {});
  if (users[currentUser.email]) {
    users[currentUser.email].name = name;
    DB.set('users', users);
  }
  currentUser.name = name;
  document.getElementById('sbUser').innerHTML = `<strong>${name}</strong>${email}`;
  alert('Settings saved!');
};

window.clearAllData = function() {
  if (!confirm('This will permanently delete all tasks, projects, and activity. Are you sure?')) return;
  ['tasks','projects','activity','activeProject'].forEach(k => DB.del(k));
  initApp();
};

// ============================
// UTILITIES
// ============================
function formatDate(s) {
  if (!s) return '';
  const d = new Date(s);
  return d.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
}
function formatStatus(s) {
  return { todo:'To Do', inprogress:'In Progress', review:'In Review', done:'Done' }[s] || s;
}
function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000)    return 'just now';
  if (diff < 3600000)  return Math.floor(diff/60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff/3600000) + 'h ago';
  return Math.floor(diff/86400000) + 'd ago';
}

console.log('%c◈ CodeFlow — Ready', 'color:#d97706;font-weight:bold;font-size:13px');
