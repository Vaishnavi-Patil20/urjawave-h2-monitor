# System Architecture

## Overview

The UrjaWave Hydrogen Generation Monitor is a full-stack IoT-ML system that collects real-time sensor data from an ESP32 microcontroller, streams it via MQTT to a dashboard, and applies machine learning for predictive maintenance.

## Components

### 1. Sensor Layer (ESP32)
- **Microcontroller:** ESP32-WROOM-32
- **Sensors:**
  - Voltage divider (0-15V range)
  - ACS712 Hall-effect current sensor (5A range)
  - DS18B20 Temperature probe
  - YF-S201 Hall-effect water/gas flow sensor
- **Sampling Rate:** 4Hz (voltage/current), 2Hz (temperature), 1Hz (flow)
- **Local Storage:** 16GB SD card buffer

### 2. Communication Layer (MQTT)
- **Broker:** Mosquitto (local network: 192.168.1.105:1883)
- **Protocol:** MQTT v3.1.1
- **Topics:**
  - `urjawave/chamber/voltage`
  - `urjawave/chamber/current`
  - `urjawave/chamber/temp`
  - `urjawave/chamber/flow`
- **QoS:** Level 1 (at-least-once delivery)
- **Auto-reconnect:** Exponential backoff with 5 retry attempts

### 3. Dashboard (Frontend)
- **Tech:** HTML5, CSS3, SVG, Vanilla JavaScript
- **Features:**
  - Real-time sensor telemetry charts
  - MQTT connection status with throughput visualization
  - Anomaly detection alerts
  - Run history with CSV export
  - Chamber field simulation

### 4. ML Predictive Maintenance
- **Model:** RandomForest Regressor v2.4
- **Features:**
  - Cathode voltage drop (32% importance)
  - Temperature gradient (24%)
  - Current stability (18%)
  - Electrolyte conductivity (15%)
  - Gas purity in ppm (11%)
- **Output:** Health score (0-100%), RUL in runs, risk level
- **Training Data:** 6 months of historical run logs
- **F1 Score:** 0.94

## Data Flow

```
Sensors → ESP32 → MQTT Broker → Dashboard → ML Inference → Alerts
   ↑___________________________________________________________|
                    (Feedback loop for threshold tuning)
```

## Security
- Local network isolation (no cloud dependency)
- No sensitive data transmission
- CSV exports are client-side only
