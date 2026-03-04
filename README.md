# 🛰️ Land Encroachment Detection System
### Tuticorin District | Tamil Nadu, India

A full-stack geospatial intelligence platform for detecting and reporting **unauthorized encroachment on government (Poramboke) land** using satellite imagery, multi-factor AI analysis, and a WhatsApp bot for field officers (VAO/Village Administrative Officers).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [WhatsApp Bot](#whatsapp-bot)
- [Detection Methodology](#detection-methodology)
- [Risk Scoring](#risk-scoring)

---

## Overview

The system enables revenue department officials to monitor land parcels in Tuticorin district for encroachment activity using satellite data spanning 2019–2026. Officers can click any point on an interactive map, and the system cross-references the location with the survey land registry, then performs satellite-based analysis to detect:

- New construction / cement structures
- Unauthorized fencing or boundary walls
- Illegal agricultural activity
- Night-time habitation

Results are presented as a color-coded **VAO Summary Report** with an inspection checklist and urgency rating.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS / USERS                            │
│                                                                     │
│   ┌──────────────────────┐        ┌────────────────────────────┐   │
│   │   React Frontend     │        │   WhatsApp (Citizens /     │   │
│   │   (Vite + Tailwind)  │        │   Field Officers)          │   │
│   │   Map · Alerts ·     │        │   Send survey no. or GPS   │   │
│   │   Reports · Settings │        └──────────────┬─────────────┘   │
│   └──────────┬───────────┘                       │                 │
└──────────────┼───────────────────────────────────┼─────────────────┘
               │  HTTP REST                        │ Webhook / REST
               ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend  (nland.py)                       │
│                                                                     │
│  POST /getinfo          GET /whatsapp/status                        │
│  POST /whatsapp/query   GET /                                       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Analysis Pipeline                           │   │
│  │                                                             │   │
│  │  1. Spatial Check ──► GEE Asset (Land_Enroachement)         │   │
│  │     (Is point inside a known parcel? Public or Private?)    │   │
│  │                                                             │   │
│  │  2. Temporal Analysis (Copernicus Sentinel-2)               │   │
│  │     ├── NDBI Change  (2019 vs 2025-26) → Construction       │   │
│  │     ├── NDVI Change  (vegetation loss)                      │   │
│  │     └── NDWI         (water body changes)                   │   │
│  │                                                             │   │
│  │  3. Enhanced Detection                                      │   │
│  │     ├── Fencing Detection   (Sobel edge density analysis)   │   │
│  │     ├── Agricultural Pattern (NDVI time-series 2019-2026)   │   │
│  │     └── Night-time Lights   (VIIRS NOAA DNB monthly)        │   │
│  │                                                             │   │
│  │  4. Risk Scoring & VAO Summary Report                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                         │                                           │
│            ┌────────────┴────────────┐                              │
│            │  WhatsApp Services      │                              │
│            │  land_service.py        │                              │
│            │  reply_service.py       │                              │
│            └─────────────────────────┘                              │
└───────────────────────────┬─────────────────────────────────────────┘
                            │  GEE Python API
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Google Earth Engine (Project: nilaam-486911)           │
│                                                                     │
│  Assets:                      Collections:                          │
│  • Land_Enroachement          • COPERNICUS/S2_SR_HARMONIZED         │
│    (GeoJSON survey parcels)   • NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description | Data Source |
|---|---|---|
| 🏗️ **Construction Detection** | Detects new cement/built-up areas using NDBI changes | Sentinel-2 |
| 🌿 **NDVI Analysis** | Monitors vegetation loss indicating land clearing | Sentinel-2 |
| 🚧 **Fencing Detection** | Identifies new linear boundary features via edge density (Sobel) | Sentinel-2 |
| 🌾 **Agricultural Pattern** | Identifies unauthorized farming via seasonal NDVI cycles | Sentinel-2 (2019–2026) |
| 🌙 **Night-time Lights** | Detects new habitation via VIIRS radiance increase | NOAA VIIRS |
| 🗺️ **Interactive Map** | Click-to-analyze parcel viewer with GeoJSON overlay | React + Leaflet |
| 📋 **VAO Summary Report** | Auto-generated report with inspection checklist and urgency level | All sources |
| 🤖 **WhatsApp Bot** | Field officers query by survey number or GPS location | FastAPI webhook |
| 🔔 **Alerts Dashboard** | Ranked list of high-risk parcels | Frontend |
| 🌐 **Multilingual UI** | Interface supports multiple languages | translations.js |

---

## Tech Stack

### Backend
- **Python 3.12** — FastAPI, Uvicorn
- **Google Earth Engine (GEE)** Python API — satellite image processing
- **NumPy** — statistical analysis of NDVI time series

### Frontend
- **React 18** — component-based UI
- **Vite** — build tooling
- **Tailwind CSS** — utility-first styling
- **Leaflet / React-Leaflet** — interactive map with GeoJSON overlays

### WhatsApp Integration
- **FastAPI** endpoints (`/whatsapp/query`, `/whatsapp/status`)
- `land_service.py` — land parcel lookup (by location & survey number)
- `reply_service.py` — natural language response generator

### Data
- **Copernicus Sentinel-2** (10m resolution, 2019–2026)
- **NOAA VIIRS DNB** monthly composites (500m resolution)
- **Custom GEE Asset** — 48 parcels (16 public Poramboke, 32 private)

---

## Project Structure

```
Land-Encroachment-Detection-System/
├── code/
│   ├── backend/
│   │   ├── nland.py            # FastAPI app + GEE analysis engine
│   │   └── requirements.txt    # Python dependencies
│   └── frontend/
│       ├── src/
│       │   ├── App.jsx          # Root component + routing
│       │   ├── MapView.jsx      # Interactive Leaflet map
│       │   ├── AlertsPage.jsx   # High-risk parcel alerts
│       │   ├── ReportsPage.jsx  # Analysis report view
│       │   ├── SettingsPage.jsx # User preferences
│       │   └── translations.js  # i18n strings
│       ├── public/
│       │   └── Land_Enroachement.geojson  # Parcel boundary data
│       ├── index.html
│       ├── vite.config.js
│       └── tailwind.config.js
├── Whatsapp/
│   ├── main.py                 # WhatsApp webhook entry point
│   ├── land_service.py         # Parcel lookup by location/survey no.
│   ├── reply_service.py        # Response message builder
│   └── requirements.txt
├── Land_Enroachement.geojson   # Master parcel dataset
├── start_all.sh                # Linux: start backend + frontend
├── start_all.ps1               # Windows: start backend + frontend
└── .gitignore
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Earth Engine account with access to project `nilaam-486911`

### 1. Clone the repository
```bash
git clone https://github.com/darika-2006/Land-Encroachment-Detection-System.git
cd Land-Encroachment-Detection-System
```

### 2. Backend Setup
```bash
cd code/backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
earthengine authenticate         # First-time GEE auth
python nland.py                  # Starts on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd code/frontend
npm install
npm run dev                      # Starts on http://localhost:5173
```

### 4. One-command start (Linux)
```bash
chmod +x start_all.sh
./start_all.sh
```

---

## API Reference

### `POST /getinfo`
Analyze a GPS coordinate for encroachment.

**Request:**
```json
{
  "lat": 8.7832,
  "lon": 78.1348,
  "language": "en"
}
```

**Response fields:**
| Field | Description |
|---|---|
| `survey_no` | Land parcel survey number |
| `land_type` | `"Public (Poramboke)"` or `"Private"` |
| `current_activity` | Encroachment signal summary |
| `risk_assessment.encroachment_score` | 0–100 score |
| `risk_assessment.alert_color` | `GREEN / YELLOW / ORANGE / RED` |
| `vao_summary` | Full officer report with checklist |
| `enhanced_detection` | Fencing, agricultural, nightlight results |

### `GET /whatsapp/status`
Returns bot status and supported commands.

### `POST /whatsapp/query`
Query by text (survey number) or GPS location.

```json
{ "message": "126", "query_type": "text" }
{ "lat": 8.78, "lon": 78.13, "query_type": "location" }
```

---

## WhatsApp Bot

Field officers can interact with the bot via WhatsApp:

| Input | Response |
|---|---|
| `hi` / `hello` | Welcome message with instructions |
| `126` (survey number) | Land type, owner, encroachment status |
| GPS location share | Parcel details + public land warning |

---

## Detection Methodology

### NDBI (Normalized Difference Built-up Index)
$$NDBI = \frac{SWIR - NIR}{SWIR + NIR}$$
Values > 0.08 indicate cement/built-up surfaces. Change from 2019→2026 baseline flags new construction.

### NDVI (Normalized Difference Vegetation Index)
$$NDVI = \frac{NIR - Red}{NIR + Red}$$
Seasonal time-series (2019–2026, bi-monthly) analyzed for variance. Coefficient of Variation > 20% with ≥3 peaks indicates active farming cycles.

### Fencing Detection
Sobel gradient magnitude applied to RGB bands. An increase >30% in edge density between baseline and current period indicates new linear structures (fences, walls).

### Night-time Lights (VIIRS)
NOAA VIIRS DNB radiance increase > 2 nW/cm²/sr combined with current radiance > 3 indicates new human habitation.

---

## Risk Scoring

| Signal | Points |
|---|---|
| New construction detected | +40 |
| New fencing / boundary walls | +15 |
| Active agricultural pattern | +25 |
| Night-time human activity | +20 |

| Score | Alert Level | Color |
|---|---|---|
| 0–14 | No significant encroachment | 🟢 GREEN |
| 15–29 | Monitor closely | 🟡 YELLOW |
| 30–49 | Inspection within 7 days | 🟠 ORANGE |
| 50+ | CRITICAL — inspect within 24h | 🔴 RED |

---

> Built for the **Tuticorin District Hackathon** — empowering revenue officers with satellite intelligence to protect public land.

