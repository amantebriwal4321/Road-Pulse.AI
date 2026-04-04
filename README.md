# 🛣️ RoadPulse — Crowdsourced Road Health Digital Twin

> Real-time pothole detection and urban digital twin for Bengaluru.  
> Built for the Smart Infrastructure & Urban Digital Twins hackathon (Track 03).

![RoadPulse Dashboard](https://img.shields.io/badge/Status-Live_Demo-brightgreen) 
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![Leaflet](https://img.shields.io/badge/Map-Leaflet.js-199900?logo=leaflet)

---

## 🎯 What It Does

RoadPulse transforms smartphones into road quality sensors. As drivers travel with the app running, their phones detect potholes via accelerometer data. Reports are validated using **DBSCAN spatial clustering AI**, and confirmed potholes appear on a live city-wide map — creating an urban digital twin of road health.

### Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Pothole Map** | Real-time Leaflet map with severity-colored markers (CartoDB DarkMatter) |
| 🤖 **AI Validation** | DBSCAN clustering confirms potholes only when 3+ independent reports within 5m |
| 📊 **Road Health Score** | City-wide A–F grade with circular gauge (0–100 scale) |
| 📱 **Simulate Bump** | Demo button to simulate pothole detection from map center |
| 🎬 **Demo Mode** | Auto-generates reports across 8 Bengaluru hotspots every 2 seconds |
| ⚠️ **Ward Breakdown** | Sidebar showing ward-by-ward severity analysis with fly-to navigation |
| 💰 **Damage Estimator** | Estimated annual vehicle damage cost from active potholes |
| 🚨 **SMS Alerts** | Twilio SMS to municipality when severity ≥ 7.0 (configurable) |
| ✅ **Mark as Fixed** | One-click resolution directly from map popup |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.11 · FastAPI · Uvicorn |
| **Database** | Supabase (PostgreSQL + PostGIS) |
| **AI/ML** | scikit-learn DBSCAN (spatial clustering) |
| **Frontend** | React 18 · Vite 5 · Tailwind CSS 3 |
| **Map** | Leaflet.js · react-leaflet · CartoDB DarkMatter tiles |
| **Alerts** | Twilio SMS |
| **Hosting** | Railway (backend) · Vercel (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project with PostGIS enabled

### 1. Clone & Setup

```bash
git clone https://github.com/amantebriwal4321/Road-Pulse.AI.git
cd Road-Pulse.AI
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env from template
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_KEY
```

### 3. Database Setup

Run these SQL files in **Supabase SQL Editor** (in order):
1. `backend/schema.sql` — Creates tables, indexes, and PostGIS extension
2. `backend/rpc_functions.sql` — Creates spatial query functions

### 4. Seed Data (250 potholes)

```bash
cd backend
python seed_data.py
```

### 5. Start Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

### 6. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 📁 Project Structure

```
roadpulse/
├── backend/
│   ├── main.py              # FastAPI app + endpoints
│   ├── models.py            # Pydantic request/response schemas
│   ├── db_client.py         # Supabase CRUD operations
│   ├── ai_validator.py      # DBSCAN spatial clustering
│   ├── alerts.py            # Twilio SMS alerts
│   ├── seed_data.py         # 250 pothole seed generator
│   ├── schema.sql           # Database schema (PostGIS)
│   ├── rpc_functions.sql    # PostGIS spatial RPC functions
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile             # Railway deployment
│   └── .env.example         # Environment template
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main app shell
    │   ├── components/
    │   │   ├── MapView.jsx   # Leaflet map + markers + popups
    │   │   ├── Dashboard.jsx # Stats bar + Road Health Score
    │   │   ├── Sidebar.jsx   # Ward breakdown panel
    │   │   ├── ReportButton.jsx  # Simulate Bump button
    │   │   ├── AlertBanner.jsx   # Critical pothole alert
    │   │   ├── DemoMode.jsx  # Auto-simulator for demos
    │   │   ├── Legend.jsx    # Severity color legend
    │   │   └── SeverityBadge.jsx # Color-coded severity pill
    │   ├── hooks/
    │   │   ├── usePotholes.js    # Polls GET /potholes every 5s
    │   │   └── useSimulator.js   # Debounced report submission
    │   └── services/
    │       └── api.js        # Axios API client
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json           # Vercel deployment config
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Server health check |
| `GET` | `/potholes` | List all open potholes (query: `min_severity`, `city`) |
| `POST` | `/report` | Submit a raw pothole report |
| `POST` | `/pothole/{id}/fix` | Mark a pothole as fixed |

### POST /report — Request Body

```json
{
  "lat": 12.9716,
  "lng": 77.5946,
  "severity_raw": 7.5,
  "speed_kmh": 35.0,
  "device_id": "phone-abc123"
}
```

---

## 🚢 Deployment

### Backend → Railway

1. Create a new Railway project
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `TWILIO_SID` (optional)
   - `TWILIO_AUTH_TOKEN` (optional)
   - `TWILIO_FROM` (optional)
   - `MUNICIPALITY_PHONE` (optional)

### Frontend → Vercel

1. Create a new Vercel project
2. Connect your GitHub repo
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://roadpulse-backend.up.railway.app`)

---

## 🧠 How AI Validation Works

```
Driver reports bump → raw_report inserted
                    → Get all reports within 5m radius in last 7 days
                    → Run DBSCAN(eps=0.00005, min_samples=3)
                    → If cluster found:
                        → Pothole CONFIRMED (upsert with weighted avg severity)
                        → If severity ≥ 7.0: send SMS alert
                    → Else:
                        → Report stored, waiting for more independent confirmations
```

---

## 👥 Team

Built by **Aman Tebriwal** for the Smart Infrastructure & Urban Digital Twins Hackathon.

---

## 📄 License

MIT License — feel free to use, modify, and deploy.
