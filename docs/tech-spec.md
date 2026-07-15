# Technical Specification

## ESP32 Configuration

```cpp
// Pin Mapping
#define VOLTAGE_PIN     34  // ADC1_CH6
#define CURRENT_PIN     35  // ADC1_CH7
#define TEMP_PIN        4   // OneWire bus
#define FLOW_PIN        18  // Digital input with interrupt

// Sampling Configuration
const int VOLTAGE_SAMPLES = 10;
const int CURRENT_SAMPLES = 10;
const float VOLTAGE_DIVIDER_RATIO = 3.0;
const float ACS712_SENSITIVITY = 0.185;  // V/A for 5A module

// MQTT Configuration
const char* MQTT_BROKER = "192.168.1.105";
const int MQTT_PORT = 1883;
const char* MQTT_CLIENT_ID = "esp32-chamber-A7";
const int MQTT_QOS = 1;
```

## MQTT Message Format

```json
{
  "timestamp": "2026-07-14T14:32:18Z",
  "voltage": 12.45,
  "current": 4.52,
  "temperature": 68.3,
  "gas_flow": 1056.2,
  "run_id": "RUN-20260714-005"
}
```

## ML Model Details

**Algorithm:** RandomForest Regressor
**Library:** scikit-learn v1.3.0
**Hyperparameters:**
- n_estimators: 200
- max_depth: 15
- min_samples_split: 5
- min_samples_leaf: 2

**Feature Engineering:**
- Rolling averages (5, 10, 20 run windows)
- Rate of change (delta per run)
- Cumulative degradation index
- Temperature-voltage interaction term

**Target Variables:**
- Component health score (0-100)
- Remaining Useful Life (runs until failure)

**Validation:**
- Train/Test split: 80/20
- Cross-validation: 5-fold
- F1 Score: 0.94
- RMSE: 4.2 runs
