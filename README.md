
# AI Trip Planner — Simple Edition (No TanStack, No TypeScript)

**Backend:** Express + JWT + SQLite (better-sqlite3)  
**Frontend:** Vite + React + React Router DOM v6 + Leaflet

### Backend
```
cd api
cp .env.example .env
npm i
npm run dev
```
Runs at http://localhost:4000

### Frontend
```
cd ../web
npm i
npm run dev
```
Open http://localhost:5173

**Demo user**: demo@demo.com / demo123

### api/.env (optional)
```
PORT=4000
JWT_SECRET=dev_change_me
OPENAI_API_KEY=
GOOGLE_MAPS_API_KEY=
CORS_ORIGIN=http://localhost:5173
```
