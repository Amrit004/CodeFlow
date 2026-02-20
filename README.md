# ◈ CodeFlow — Full-Stack Project Management App

A fully functional Kanban-style project management application with JWT authentication simulation, real data persistence via `localStorage`, drag-and-drop, and an activity audit log. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## 🚀 Features

### Authentication System
- **Login / Register** with form validation and error handling
- **JWT simulation** — creates, stores, and validates Base64-encoded JSON Web Tokens
- **Auto-login** — token persisted in localStorage, valid for 1 hour
- Password hashing (simple hash for demo; production would use bcrypt/argon2)
- Demo account with pre-loaded data

### Kanban Board
- **4 columns**: To Do → In Progress → In Review → Done
- **Drag-and-drop** reordering between columns (HTML5 Drag API)
- **Real-time search** filters cards by title and tags
- **Priority filter** (Critical, High, Medium, Low) with colour-coded indicators
- **Task cards** with priority dots, tags, due dates, assignee avatars, and strikethrough for Done

### Task Management
- Create, edit, delete tasks via a modal
- Fields: title, description, priority, status, due date, tags, assignee
- Overdue date highlighting
- Instant board and backlog sync after any change

### Backlog View
- Table view of all tasks with status pills and priority indicators
- Direct edit access per row

### Activity Log
- Every task create, edit, move, and delete logged with relative timestamps
- Persistent across sessions (last 50 events stored)

### Project Management
- Multiple projects with colour-coded sidebar
- Per-project task isolation
- Add new projects dynamically

### Settings
- Update display name and email
- Danger zone: clear all data

## 🧰 Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Frontend      | HTML5, CSS3 (Grid, Flexbox, custom properties) |
| Scripting     | Vanilla JavaScript (ES6+)              |
| Auth          | JWT simulation (Base64 encode/decode)  |
| Persistence   | `localStorage` (client-side DB)        |
| Drag-and-drop | HTML5 Drag API                         |
| Fonts         | Fraunces, DM Sans                      |
| Design        | Warm editorial SaaS aesthetic          |

## 🔐 Architecture Highlights

### JWT Authentication Flow
```
Register → Hash password → Store in localStorage user DB
         → createToken() → Base64(header.payload.sig)
         → Store token → parseToken() on reload
         → isTokenValid() checks exp claim → auto-login
```

### Data Layer (localStorage persistence)
```javascript
// All data stored under namespaced keys
DB.get('tasks', [])   // → parse JSON from localStorage
DB.set('tasks', data) // → JSON.stringify and persist
DB.del('tasks')       // → localStorage.removeItem
```

### Drag-and-Drop State Machine
```
dragstart → store taskId
dragover  → visual feedback on column
drop      → update task.status → save → re-render
dragend   → cleanup
```

## 📂 Project Structure

```
codeflow/
├── index.html        # Auth screen + full app shell
├── css/
│   └── style.css     # Auth, sidebar, Kanban, modal, all components
├── js/
│   └── app.js        # Auth, JWT, data layer, board, activity, settings
└── README.md
```

## ⚡ Getting Started

```bash
git clone https://github.com/Amrit004/codeflow.git
open index.html
```

No server or build step required. Try the **Demo Account** button to load pre-seeded data.

## 🗺 Roadmap

- [ ] Backend REST API (Node.js + Express + PostgreSQL)
- [ ] Real JWT with RS256 and refresh tokens
- [ ] WebSocket real-time collaboration
- [ ] Sprint planning with velocity charts
- [ ] Burndown chart (Canvas API)
- [ ] File attachments (IndexedDB)
- [ ] Email notifications
- [ ] GitHub Issues integration

## 💡 Motivation

This project demonstrates full software engineering concepts from my BSc and MSc Computer Science training: authentication flows (JWT), REST API patterns, state management, event-driven UI, and persistent data storage — all without a framework, to prove deep JavaScript fundamentals.

## 📄 Licence

MIT — Built by **Amritpal Singh Kaur** · [GitHub](https://github.com/Amrit004)
