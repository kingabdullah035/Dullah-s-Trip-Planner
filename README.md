#Dullah’s Trip Planner – Simple Edition  
_(AI-powered travel planning app)_

**Backend:** Express + SQLite (better-sqlite3) + Supabase Auth + OpenAI  
**Frontend:** Vite + React + React Router DOM v6 + Leaflet

---

#Features

- 💬 AI chat that generates detailed trip plans & itineraries
- 🧳 Save, edit, and view trips (with Supabase authentication)
- 🗺️ Interactive map using Leaflet
- 🧠 Local SQLite database for persistent data
- ☁️ Easy deployment with **Render (API)** + **Vercel (Web)**

---

## 🧩 Project Structure

Dullahs-Trip-Planner/
│
├── api/ # Express backend (Node.js)
│ ├── server.js # Main server entry
│ ├── routes/ # Chat, Trips, Auth routes
│ ├── data.db # SQLite database (auto-created)
│ └── .env # Local environment variables
│
├── web/ # Vite + React frontend
│ ├── main.jsx
│ ├── pages/
│ ├── styles.css
│ └── .env
│
└── README.md

#Backend

```bash
cd api
npm install
npm run dev

#Frontend
cd ../web
npm install
npm run dev
```
