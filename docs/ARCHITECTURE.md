# UrjaWave Architecture

```text
Electrolyzer / Sensors / PLC / DAQ
              |
       MQTT / HTTP / Modbus*
              |
        UrjaWave API
     |        |        |
 Telemetry  Safety   Auth/RBAC
     |        |        |
     +---- SQLite -----+
              |
         Socket.IO
              |
      React Operations Console
```

`*` Protocol adapters are the hardware integration boundary. The current demonstrator exposes a validated HTTP telemetry contract and deterministic DEMO mode.
