# Team Task Manager

A full-stack Team Task Manager web application built with React, Node.js, Express, and MongoDB. Features secure JWT-based authentication, role-based access control (RBAC), and a modern responsive UI.

**Live Demo:** [https://team-task-manager-production.up.railway.app](https://team-task-manager-production.up.railway.app)

## Features

- **Secure Authentication** - JWT-based signup/login with password hashing (bcrypt)
- **Role-Based Access Control** - Admin and Member roles with strict permissions
- **Project Management** - Create, update, delete projects with team member management
- **Task Management** - Create, assign, update tasks with status transitions
- **Task Status Workflow** - todo → in-progress → done with valid transition enforcement
- **Due Dates & Overdue Detection** - Automatic overdue detection for tasks past due date
- **Dashboard** - Real-time task statistics (total, completed, pending, overdue, by priority)
- **Activity Logging** - Track all actions for auditing
- **Filtering & Search** - Filter tasks by status, priority, and search by title/description
- **Pagination** - Efficient pagination for projects and tasks
- **Responsive UI** - Mobile-friendly design with Tailwind CSS

## Tech Stack

### Backend
- **Node.js + Express** - RESTful API server
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcrypt.js** - Password hashing
- **Joi** - Request validation
- **Helmet** - Security headers
- **Rate Limiting** - API rate limiting
- **Morgan** - HTTP request logging

### Frontend
- **React 18** - UI library with hooks
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library

## Architecture

```
├── backend/
│   └── src/
│       ├── models/           # Mongoose schemas
│       │   ├── user.model.js
│       │   ├── project.model.js
│       │   ├── task.model.js
│       │   └── activityLog.model.js
│       ├── controllers/      # Request handlers
│       │   ├── auth.controller.js
│       │   ├── user.controller.js
│       │   ├── project.controller.js
│       │   ├── task.controller.js
│       │   └── dashboard.controller.js
│       ├── routes/           # API route definitions
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── project.routes.js
│       │   ├── task.routes.js
│       │   └── dashboard.routes.js
│       ├── middleware/       # Express middleware
│       │   ├── auth.middleware.js
│       │   ├── validation.middleware.js
│       │   └── errorHandler.js
│       ├── utils/            # Validation schemas & helpers
│       │   ├── auth.validation.js
│       │   ├── project.validation.js
│       │   ├── task.validation.js
│       │   ├── apiResponse.js
│       │   └── activityLogger.js
│       └── server.js         # Entry point
├── frontend/
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── Modal.jsx
│       │   ├── TaskCard.jsx
│       │   └── StatCard.jsx
│       ├── pages/            # Page components
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Projects.jsx
│       │   ├── ProjectDetail.jsx
│       │   └── Tasks.jsx
│       ├── context/          # React context
│       │   └── AuthContext.jsx
│       ├── services/         # API service layer
│       │   └── api.js
│       └── App.jsx           # Main app component
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

2. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

3. Set up the frontend
```bash
cd frontend
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser

### Environment Variables

```env
# Backend (.env)
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get current user | Authenticated |

### Users
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Authenticated |
| GET | `/api/users/:id` | Get user by ID | Authenticated |
| PUT | `/api/users/:id` | Update user | Self or Admin |

### Projects
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/projects` | Create project | Admin |
| GET | `/api/projects` | List user's projects | Authenticated |
| GET | `/api/projects/:id` | Get project details | Member |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| POST | `/api/projects/:id/members` | Add member | Admin |
| DELETE | `/api/projects/:id/members/:userId` | Remove member | Admin |

### Tasks
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/tasks` | Create task | Admin |
| GET | `/api/tasks` | List tasks (filtered) | Authenticated |
| GET | `/api/tasks/:id` | Get task details | Authenticated |
| PUT | `/api/tasks/:id` | Update task | Assigned or Admin |
| PATCH | `/api/tasks/:id/status` | Update task status | Assigned or Admin |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

### Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard` | Get dashboard stats | Authenticated |
| GET | `/api/dashboard/projects/:id` | Get project stats | Member |

## Role-Based Access Control

| Action | Admin | Member |
|--------|-------|--------|
| Create projects | ✅ | ❌ |
| Delete projects | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Delete tasks | ✅ | ❌ |
| Update any task | ✅ | ❌ |
| Update own tasks | ✅ | ✅ |
| Change task status | ✅ | ✅ (own tasks) |
| View all tasks | ✅ | ✅ (own assigned) |
| View projects | ✅ (all) | ✅ (member of) |

## Task Status Transitions

```
todo ──→ in-progress ──→ done
  ↑           ↑            │
  └───────────┴────────────┘
```

Valid transitions:
- `todo` → `in-progress`
- `in-progress` → `todo` or `done`
- `done` → `in-progress`

## Deployment

### Railway

1. Push code to GitHub
2. Connect GitHub repo to Railway
3. Set environment variables in Railway dashboard
4. Deploy backend service (Node.js)
5. Deploy frontend service (Static/Node.js with build step)

### Railway Environment Variables
```
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-production-secret>
JWT_EXPIRES_IN=7d
FRONTEND_URL=<your-frontend-railway-url>
```

## License

MIT
