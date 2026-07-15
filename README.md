# ⚡ UrjaWave — Hydrogen Generation IoT-ML Monitor

> **Real-time sensor telemetry, predictive maintenance ML, and MQTT-connected dashboard** for a government-funded (₹2L NAIN 2.0) clean-energy hydrogen prototype.

**Live Demo:** [GitHub Pages](https://vaishnavi-patil.github.io/urjawave-h2-monitor/)

---

## 🎯 What This Is

As **CTO of UrjaWave** (NAIN 2.0 Startup, Govt. of Karnataka), I built this dashboard to replace manual power-supply readings with a **continuous, automated data pipeline** — from ESP32 sensors → MQTT broker → real-time visualization → ML-based predictive maintenance.

This dashboard was the **centerpiece demo** for government reviewers and investors at IIIT Dharwad.

---

## 🚀 Features

| Module | Description | Status |
|--------|-------------|--------|
| **Sensor Layer** | ESP32 + Voltage/Current/Temp/Flow sensors | ✅ Active |
| **Data Pipeline** | MQTT v3.1.1 over WiFi (Mosquitto broker) | ✅ Live |
| **Real-Time Dashboard** | HTML5 + SVG + Vanilla JS, dark-themed | ✅ Live |
| **Anomaly Detection** | Threshold-based alerts with severity levels | ✅ Active |
| **Predictive Maintenance** | RandomForest v2.4 (F1: 0.94) | ✅ Inference |
| **Chamber Simulation** | Field distribution validation | ✅ Validated |
| **Data Export** | Timestamped CSV generation | ✅ Ready |
| **Run History** | Complete test log with efficiency metrics | ✅ Ready |

---

## 📸 Dashboard Preview

![Dashboard Preview](assets/demo-screenshot.png)

---

## 🏗️ System Architecture

```
┌─────────────┐      MQTT/HTTP       ┌──────────────┐     WebSocket      ┌─────────────┐
│   ESP32     │  ──────────────────▶  │   Broker     │  ───────────────▶  │  Dashboard  │
│  Sensors    │   urjawave/chamber/*  │  (Mosquitto) │                    │  (This Repo)│
│  (C/Python) │                       └──────────────┘                    └─────────────┘
└─────────────┘                                                                │
       │                                                                       ▼
       │                                                              ┌──────────────┐
       └─────────────────────────────────────────────────────────────▶│  ML Model    │
                                                                      │  (Python/    │
                                                                      │ scikit-learn)│
                                                                      └──────────────┘
```

---

## 🔧 Tech Stack

**Hardware & Embedded:**
- ESP32 microcontroller
- Voltage, Current, Temperature, Gas Flow sensors
- High-voltage electrolyzer control (C/Python optimized)

**Communication:**
- MQTT v3.1.1 protocol
- Mosquitto broker (local: `192.168.1.105:1883`)
- WiFi connectivity with auto-reconnect

**Frontend Dashboard:**
- HTML5 + CSS3 (Grid/Flexbox)
- SVG real-time charts (no external libraries)
- Vanilla JavaScript (no frameworks)
- Dark-themed industrial UI

**Machine Learning:**
- RandomForest Regressor v2.4
- Feature importance: Cathode Voltage Drop (32%), Temp Gradient (24%), Current Stability (18%)
- RUL (Remaining Useful Life) prediction per component
- F1 Score: 0.94

**Data & Storage:**
- Timestamped CSV export
- MongoDB (production logging)
- SD card local buffer (ESP32)

---

## 🎓 My Role as CTO

- **Led end-to-end technical development** of the hydrogen generation prototype
- **Architected the full-stack monitoring dashboard** (this repository)
- **Developed embedded control systems** for high-voltage electrolyzers (C/Python)
- **Integrated ESP32 sensor networks** with real-time MQTT data streaming
- **Built predictive maintenance ML model** to forecast electrode degradation
- **Secured ₹2 lakh in government funding** and presented at IIIT Dharwad under Karnataka's startup initiative
- **Owned system design, hardware-software integration, and cross-functional team leadership**

---

## 📊 Key Metrics Tracked

| Metric | Range | Alert Threshold |
|--------|-------|-----------------|
| Voltage | 10–14 V | Drop > 2V |
| Current | 3–6 A | Fluctuation > 0.5A |
| Temperature | 55–85°C | Warn: 75°C, Critical: 80°C |
| Gas Flow | 800–1300 L/hr | Below 900 L/hr |
| Efficiency | 0–100% of 1,200 L/hr target | Below 70% |

---

## 🛠️ Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/vaishnavi-patil/urjawave-h2-monitor.git

# 2. Open in browser (no build step needed)
cd urjawave-h2-monitor
open index.html        # macOS
# OR
start index.html       # Windows
# OR
xdg-open index.html    # Linux
```

3. Click **"Start Run"** to simulate a live hydrogen generation test session
4. Watch real-time sensor charts, MQTT throughput, and ML degradation predictions

> **Note:** This repository contains the frontend simulation. The production version connects to a live ESP32 via MQTT broker and streams real sensor data.

---

## 📁 Project Structure

```
urjawave-h2-monitor/
├── index.html              # Main dashboard (single-file app)
├── README.md               # This file
├── LICENSE                 # MIT License
├── .gitignore             # Git ignore rules
├── assets/
│   └── demo-screenshot.png # Dashboard preview image
└── docs/
    ├── architecture.md     # Detailed system architecture
    └── tech-spec.md        # ESP32 + MQTT + ML technical spec
```

---

## 🏆 Achievements

- 🥇 **NAIN 2.0 Startup Program** — Government of Karnataka
- 💰 **₹2,00,000 Funding Secured**
- 🎤 **Presented at IIIT Dharwad** under state startup initiative
- 🔬 **Hydrogen generation prototype** — from concept to presentation-ready product
- 📡 **Real-time IoT monitoring** — replaced manual readings with automated pipeline
- 🤖 **Predictive ML model** — forecasts component failure before it happens

---

## 📄 License

MIT License — Built with 💙 by **Vaishnavi Patil**, CTO @ UrjaWave

```
MIT License

Copyright (c) 2026 Vaishnavi Patil

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🤝 Connect

- **LinkedIn:** [linkedin.com/in/vaishnavi-patil-88a2382b6](https://linkedin.com/in/vaishnavi-patil-88a2382b6)
- **Email:** vaishnavi.patil@example.com
- **Location:** Belagavi, Karnataka, India

---

> *"This dashboard turned 'it works' into a dataset with evidence — not just a video."*
