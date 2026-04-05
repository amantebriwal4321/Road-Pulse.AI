with open("README.md", "w") as f:
    f.write("""# 🛣️ RoadPulse — Crowdsourced Road Health Digital Twin

> Real-time pothole detection and urban digital twin for Bengaluru.
> Built for the Smart Infrastructure & Urban Digital Twins hackathon.

![RoadPulse Dashboard](https://img.shields.io/badge/Status-Live_Demo-brightgreen)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase)
![Leaflet](https://img.shields.io/badge/Map-Leaflet.js-199900?logo=leaflet)

---

## 🎯 Project Overview

RoadPulse transforms everyday smartphones into distributed road quality sensors. As drivers navigate the city with the app running, their phones continuously monitor road conditions. RoadPulse calculates whether a pothole is formed by evaluating randomly generated data for the **accelerometer (X, Y, Z axis)** and **gyroscope (X, Y, Z axis)**. 

When anomalous bump patterns are detected, reports are sent to the cloud and validated using **DBSCAN spatial clustering AI**. Confirmed potholes magically appear on a live city-wide map, creating a real-time urban digital twin of the city's road health.

### 🌟 Key Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Live Pothole Map** | Real-time Leaflet map with severity-colored markers (CartoDB DarkMatter). |
| 🤖 **AI Validation** | DBSCAN clustering confirms potholes only when 3+ independent reports are within 5m. |
| 📊 **Road Health Score** | City-wide A–F grade with a live circular gauge (0–100 scale). |
| 📱 **Simulate Bump** | Interactively simulate pothole detection from the map center. |
| 🎬 **Demo Mode** | Auto-generates reports across 8 Bengaluru hotspots to display system resilience. |
| ⚠️ **Ward Breakdown** | Sidebar showing ward-by-ward severity analysis with fly-to navigation. |
| 💰 **Damage Estimator** | Actionable financial metrics showing estimated vehicle damage from potholes. |
| 🚨 **Twilio SMS Alerts** | Automated alerts sent to municipality via Twilio when severity ≥ 7.0 (configurable). |
| ✅ **Mark as Fixed** | One-click issue resolution directly from the map popup. |

---

## 🏗️ Architecture & Tech Stack

RoadPulse is built on a scalable and modern architecture consisting of three core layers.

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React 18, Vite, Leaflet, Tailwind CSS | The highly interactive map UI and dashboard for citizens and officials. |
| **Backend** | Python 3.11, FastAPI, Uvicorn | High-performance REST API prioritizing fast mathematical validation. |
| **Database** | Supabase (PostgreSQL + PostGIS) | Geospatial database to execute ultra-fast distance queries. |
| **AI/ML** | scikit-learn (DBSCAN) | Density-based spatial clustering to eliminate false positives. |

---

## 🌊 System Flow & Lifecycle

The lifecycle of a single pothole report from a smartphone sensor to the dashboard.

```mermaid
graph TD
    A[Smartphone Sensors] -->|Randomly Generated Accel X,Y,Z & Gyro X,Y,Z| B(Calculate Anomaly)
    B -->|Anomaly Detected| C[POST /report]
    C --> D{Look for nearby reports<br>within 5m, last 7 days}
    D -->|PostGIS ST_DWithin| E[DBSCAN Clustering AI]
    E --> F{Cluster >= 3 reports?}
    F -->|Yes| G[CONFIRM POTHOLE]
    F -->|No| H[Store for future validation]
    G --> I[Upsert to Database]
    I --> J{Severity >= 7.0?}
    J -->|Yes| K[Twilio SMS Alert sent rapidly to Officials]
    J -->|No| L[Update Dashboard]
    K --> L
    L --> M[Live Map Update via GET /potholes]
```

### Flow 1: Reporting a Pothole
1. The app continuously calculates bumps using accelerometer and gyroscope parameters.
2. An anomaly triggers a `POST` to `/report` with location and raw severity.
3. The backend stores the report and executes a PostGIS spatial query (`ST_DWithin`) to find nearby reports.
4. **AI Validation**: Scikit-Learn's DBSCAN algorithm runs on the cluster. If 3 or more independent reports are within a 5-meter radius, the pothole is **CONFIRMED**.
5. If severity is high enough, **Twilio** dispatches an SMS Alert immediately to municipal authorities.

### Flow 2: Live Visualization
1. The React frontend constantly polls `/potholes` API.
2. Newly validated anomalies dynamically render as `CircleMarker` nodes on the Leaflet Map.
3. Dashboards recalculate the aggregate **Road Health Score**, **Open Potholes**, and **Estimated Damage Costs**.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase project with PostGIS extension enabled

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
# Include your Supabase URL, Key, and Twilio Variables
```

### 3. Database Setup

Run the SQL schemas inside the **Supabase SQL Editor**:
1. `backend/schema.sql` — Initializes tables and PostGIS extension.
2. `backend/rpc_functions.sql` — Injects blazing-fast spatial routing queries.

### 4. Setup Initial Map Ecosystem (Data Initializer)

```bash
cd backend
python seed_data.py
```
*(Populates initial environmental bounds across Bengaluru wards.)*

### 5. Run the Engine

**Start FastAPI Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Start React Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit the Digital Twin at **http://localhost:5173** 🎉

---

## 🧠 Behind the AI: DBSCAN Clustering

By utilizing density-based spatial clustering of applications with noise (DBSCAN), RoadPulse gracefully handles varying densities of pothole reports.
- **Parameters**: `eps=0.00005` (~5 meters), `min_samples=3`.
- **Eradicating Noise**: A single errant bump (e.g., dropping the phone) won't falsely mark a pothole. It strictly requires overlapping multi-device validation.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/health` | Health Check / Readiness Probe |
| `GET`  | `/potholes` | Fetch confirmed active anomalies |
| `POST` | `/report` | Submit telemetry report (`lat`, `lng`, `severity_raw`, `speed_kmh`, `device_id`) |
| `POST` | `/pothole/{id}/fix` | Resolve anomaly manually from the dashboard |

---

## 🚀 Deployment Strategy

- **Backend / Engine:** Hosted on Railway for scalable Python compute.
- **Frontend / Dashboard:** Hosted on Vercel for edge availability.

*Don't forget to configure the `VITE_API_URL` on the frontend layer connecting to your active Backend.*

---

<p align="center">
Built by <b>Aman Tebriwal</b> to revolutionize urban asset management. Let's make our roads safer, smarter, and driven by data! 🌍
</p>
""")
