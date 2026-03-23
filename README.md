# Project — MERN Stack

## Structure
```
/
├── backend/              # Node.js + Express API (Person 1 & 2)
├── frontend-admin/       # React admin portal (Person 3)
└── frontend-portal/      # React customer portal (Person 4)
```

## Team
| Person | Role | Area |
|--------|------|------|
| P1 | Backend Lead + Repo Owner | Server, Auth, DB connection |
| P2 | Backend API | Schemas, Routes, Reports |
| P3 | Admin Portal UI | React admin app |
| P4 | Customer Portal UI | React customer app |

## Getting Started

### 1. Clone the repo
```bash
git clone <repo-url>
cd <repo-name>
git checkout dev
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### 3. Frontend Admin setup
```bash
cd frontend-admin
npm install
cp .env.example .env
npm run dev
```

### 4. Frontend Portal setup
```bash
cd frontend-portal
npm install
cp .env.example .env
npm run dev
```

## Git Workflow
- `main` — production only
- `dev` — shared working branch (default)
- `feat/<name>` — your feature branch

**Never push directly to `main` or `dev`.** Always open a Pull Request.

```bash
# Start a new feature
git checkout dev
git pull origin dev
git checkout -b feat/your-feature-name

# Done? Push and open PR
git push origin feat/your-feature-name
```

## Commit message format
```
feat: add product schema
fix: correct invoice total calculation
chore: update dependencies
```
