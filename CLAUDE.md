# CLAUDE.md — RoadPulse Project Intelligence File

Read this entire file before touching any code in this project.

---

## What This Project Is

RoadPulse is a crowdsourced pothole detection system that creates a live
city-wide road health digital twin. Users drive with the app running, their
phone detects potholes via accelerometer, reports are validated using DBSCAN
spatial clustering, and confirmed potholes are visualised on a real-time
Leaflet map with a stats dashboard and Twilio SMS alerts.

Built for a hackathon under the theme "Smart Infrastructure & Urban Digital
Twins" (Track 03). Optimise for demo-readiness and working features.

---

## Tech Stack — Never Deviate

| Layer       | Technology                                       |
|-------------|--------------------------------------------------|
| Frontend    | React 18, Vite 5, Tailwind CSS, Leaflet.js      |
| Map         | Leaflet + react-leaflet (CartoDB DarkMatter)     |
| Backend     | FastAPI, Python 3.10+, Uvicorn                   |
| AI Layer    | scikit-learn DBSCAN (no training needed)         |
| Database    | Supabase (PostgreSQL + PostGIS)                  |
| HTTP Client | Axios (frontend), httpx (backend)                |
| Alerts      | Twilio SMS                                       |
| Language    | JavaScript (no TypeScript), Python               |

---

## How To Run

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your Supabase + Twilio credentials
uvicorn main:app --reload --port 8000
# API docs: http://localhost:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### Seed Demo Data
```bash
cd backend
python seed_data.py
# Inserts 250 Bengaluru potholes into Supabase
```

---

## Project Structure

```
roadpulse/
├── CLAUDE.md
├── .gitignore
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── .env              ← never committed
│   ├── main.py            ← FastAPI endpoints only
│   ├── models.py          ← Pydantic schemas only
│   ├── db_client.py       ← all Supabase read/write
│   ├── ai_validator.py    ← DBSCAN logic only
│   ├── alerts.py          ← Twilio SMS only
│   └── seed_data.py       ← standalone demo data generator
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── services/api.js
        ├── hooks/
        │   ├── usePotholes.js
        │   └── useSimulator.js
        └── components/
            ├── MapView.jsx
            ├── Dashboard.jsx
            ├── AlertBanner.jsx
            ├── ReportButton.jsx
            └── SeverityBadge.jsx
```

---

## API Endpoints

| Method | Path                    | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | /health                 | Server liveness check              |
| GET    | /potholes               | All open potholes (polled by map)  |
| POST   | /report                 | Ingest raw report from device      |
| POST   | /pothole/{id}/fix       | Mark pothole as fixed              |

---

## Database (Supabase PostgreSQL + PostGIS)

### potholes table
- id, lat, lng, severity (0–10), report_count, status, ward, city
- first_reported, last_reported, location (geography point)

### raw_reports table
- id, lat, lng, severity_raw, speed_kmh, device_id, created_at, pothole_id

---

## AI Validation (DBSCAN)

- eps = 0.00005 (~5 metres)
- min_samples = 3
- Requires 3+ independent reports within 5m to confirm a pothole
- Severity = weighted average of all reports in cluster

---

## Do Not

- Switch to Firebase, MongoDB, or any other database
- Introduce TypeScript or Docker
- Add authentication or login flows
- Use paid APIs (everything on free tiers)
- Put ML logic in main.py (belongs in ai_validator.py)
- Put DB operations in main.py (belongs in db_client.py)
- Commit the .env file
