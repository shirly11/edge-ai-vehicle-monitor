import os
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

class VehicleAnomalyDetector:
    def __init__(self, data_path=None):
        if data_path is None:
            # Locate file relative to this script
            data_path = os.path.join(os.path.dirname(__file__), "vehicle_health_data.csv")
        
        self.data_path = data_path
        self.features = [
            "engine_temperature",
            "battery_voltage",
            "vibration_level",
            "tire_pressure",
            "speed",
            "engine_rpm",
            "coolant_level",
            "fuel_level"
        ]
        self.model = None
        self.mean_stats = {}
        self.std_stats = {}
        self.train_model()

    def train_model(self):
        try:
            if not os.path.exists(self.data_path):
                print(f"Dataset path not found: {self.data_path}. Initializing fallback statistics.")
                # Fallback statistics if file is missing
                self.mean_stats = {f: 50.0 for f in self.features}
                return

            df = pd.read_csv(self.data_path)
            # Remove any empty rows
            df = df.dropna(subset=self.features)
            
            # Select features
            X = df[self.features]
            
            # Train Isolation Forest
            # 15% contamination matches dataset's typical anomaly ratio
            self.model = IsolationForest(contamination=0.15, random_state=42)
            self.model.fit(X)
            
            # Save features statistics to explain anomalies in UI
            for col in self.features:
                self.mean_stats[col] = float(df[col].mean())
                self.std_stats[col] = float(df[col].std())
                
            print("AI Isolation Forest model successfully trained on the dataset.")
        except Exception as e:
            print(f"Error training Isolation Forest model: {e}")

    def predict(self, sensor_values):
        """
        Predicts anomaly and provides health diagnostics for a dictionary of sensor readings.
        """
        # Formulate input for model
        input_data = {}
        for feat in self.features:
            # Fallback if metric is missing
            input_data[feat] = float(sensor_values.get(feat, self.mean_stats.get(feat, 0.0)))

        # Convert to 2D array for sklearn
        X_new = pd.DataFrame([input_data])[self.features]
        
        # Default status
        if self.model is not None:
            # predict returns 1 (normal) or -1 (anomaly)
            is_outlier = int(self.model.predict(X_new)[0]) == -1
            # decision_function: negative values are outliers, positive are inliers
            score = float(self.model.decision_function(X_new)[0])
            # Map score to a 0-100 anomaly confidence/risk scale (lower score -> higher risk)
            # score ranges roughly between -0.3 and 0.3
            risk_score = int(max(0, min(100, (0.3 - score) / 0.6 * 100)))
        else:
            is_outlier = False
            risk_score = 0
            
        # Get sensor parameters
        temp = input_data["engine_temperature"]
        voltage = input_data["battery_voltage"]
        vibration = input_data["vibration_level"]
        pressure = input_data["tire_pressure"]
        coolant = input_data["coolant_level"]
        fuel = input_data["fuel_level"]
        rpm = input_data["engine_rpm"]
        speed = input_data["speed"]

        # Health score calculation matching the generator logic
        deductions = 0.0
        
        # Engine Temperature deductions
        if temp > 100.0:
            deductions += (temp - 100.0) * 2.0
            
        # Battery Voltage deductions
        if voltage < 13.5:
            deductions += (13.5 - voltage) * 20.0
        elif voltage > 14.5:
            deductions += (voltage - 14.5) * 15.0
            
        # Vibration deductions
        if vibration > 2.0:
            deductions += (vibration - 2.0) * 10.0
            
        # Tire Pressure deductions
        if pressure < 30.0:
            deductions += (30.0 - pressure) * 4.0
        elif pressure > 35.0:
            deductions += (pressure - 35.0) * 3.5
            
        # Coolant Level deductions
        if coolant < 70.0:
            deductions += (70.0 - coolant) * 1.0
            
        # Fuel Level deductions
        if fuel < 15.0:
            deductions += (15.0 - fuel) * 0.8
            
        health_score = max(0.0, min(100.0, 100.0 - deductions))
        health_score = round(health_score, 2)

        # Categorize status based on conditions
        alerts = []
        recommendations = []
        
        # Check rule conditions specified in prompt
        # Condition 1: temperature > 100 -> Critical overheating alert
        if temp > 100.0:
            alerts.append({
                "severity": "Critical",
                "message": f"Critical engine overheating alert: Temperature is {temp}°C (Limit: 100°C)",
                "sensor": "engine_temperature"
            })
            recommendations.append("Potential engine failure detected")
            recommendations.append("Check coolant system")

        # Condition 2: battery_voltage < 10 -> Battery warning
        if voltage < 10.0:
            alerts.append({
                "severity": "Critical",
                "message": f"Critical battery failure: Voltage is {voltage}V (Limit: 10V)",
                "sensor": "battery_voltage"
            })
            recommendations.append("Battery health critically low")
            recommendations.append("Maintenance required within 3 days")
        elif voltage < 13.5 or voltage > 14.5:
            alerts.append({
                "severity": "Warning",
                "message": f"Abnormal battery voltage: {voltage}V (Normal: 13.5V - 14.5V)",
                "sensor": "battery_voltage"
            })
            recommendations.append("Check vehicle alternator charging system")

        # Condition 3: vibration_level > 1.2 -> Abnormal vibration alert
        if vibration > 1.2:
            severity = "Critical" if vibration > 4.5 else "Warning"
            alerts.append({
                "severity": severity,
                "message": f"Abnormal vibration alert: {vibration} mm/s (Limit: 1.2 mm/s)",
                "sensor": "vibration_level"
            })
            recommendations.append("High structural/engine vibration detected")
            if vibration > 2.0:
                recommendations.append("Schedule mechanical inspection")

        # Tire Pressure Warnings
        if pressure < 25.0:
            alerts.append({
                "severity": "Critical",
                "message": f"Critical tire decompression: {pressure} PSI (Limit: 25 PSI)",
                "sensor": "tire_pressure"
            })
            recommendations.append("Tire puncture suspected. Stop driving immediately.")
        elif pressure < 30.0 or pressure > 35.0:
            alerts.append({
                "severity": "Warning",
                "message": f"Improper tire pressure: {pressure} PSI (Normal: 30-35 PSI)",
                "sensor": "tire_pressure"
            })
            recommendations.append("Adjust tire pressure to manufacturer specifications")

        # Coolant warning
        if coolant < 40.0:
            alerts.append({
                "severity": "Critical",
                "message": f"Critical coolant level: {coolant}% (Limit: 40%)",
                "sensor": "coolant_level"
            })
            recommendations.append("Low coolant. Potential overheating hazard.")
        elif coolant < 70.0:
            alerts.append({
                "severity": "Warning",
                "message": f"Low coolant level: {coolant}% (Normal: 70% - 100%)",
                "sensor": "coolant_level"
            })
            recommendations.append("Top up coolant fluid reservoir")

        # Fuel warning
        if fuel < 5.0:
            alerts.append({
                "severity": "Critical",
                "message": f"Fuel level critically low: {fuel}%",
                "sensor": "fuel_level"
            })
            recommendations.append("Refuel vehicle immediately")
        elif fuel < 15.0:
            alerts.append({
                "severity": "Warning",
                "message": f"Low fuel level: {fuel}%",
                "sensor": "fuel_level"
            })

        # Determine overall anomaly status
        # If health score is low, or there is an outlier, or we have critical alerts
        has_critical = any(a["severity"] == "Critical" for a in alerts)
        has_warning = any(a["severity"] == "Warning" for a in alerts)
        
        # Health Score Logic:
        # 90–100 → Excellent
        # 70–89 → Good
        # 40–69 → Warning
        # Below 40 → Critical
        if health_score < 40.0 or has_critical:
            status = "Critical"
            maintenance_required = "Yes"
        elif health_score < 70.0 or has_warning or is_outlier:
            status = "Warning"
            maintenance_required = "Yes"
        else:
            status = "Normal"
            maintenance_required = "No"

        # Fallback recommendation if anomaly is detected but recommendations are empty
        if status != "Normal" and not recommendations:
            recommendations.append("Edge AI suggests scheduling system diagnostics")
            recommendations.append("Check sensor calibration")

        # Set default recommendations if healthy
        if status == "Normal":
            recommendations.append("All vehicle systems operating within specifications")
            recommendations.append("Next routine inspection in 5,000 miles")

        # Root-cause analysis & detailed diagnostic reasoning
        diag = {
            "has_issue": status != "Normal",
            "anomaly_type": "System Nominal",
            "explanation": "All telemetry sensors are operating within optimal baseline tolerances.",
            "root_cause": "Operational wear index within normal parameters.",
            "real_world_risks": "None identified under present driving conditions.",
            "maintenance_action": "Standard scheduled maintenance inspection in 5,000 miles.",
            "urgency": "Routine Monitoring / Low Priority",
            "risk_level": "Low Risk",
            "failure_timeline": "No failure imminent"
        }

        # Check for specific root cause triggers
        if status != "Normal":
            # 1. Engine Overheating
            if temp > 100.0:
                diag["anomaly_type"] = "Engine Thermal Runaway / Overheating"
                diag["risk_level"] = "High Risk"
                diag["urgency"] = "Immediate / Emergency Stop"
                diag["failure_timeline"] = "Estimated block damage within 15 minutes of continuous running"
                diag["root_cause"] = f"Elevated thermal dissipation. Coolant fluid capacity is holding at {coolant}%, resulting in heat build-up under workload."
                diag["real_world_risks"] = "Cylinder head warping, engine block cracking, catastrophic seizure, thermal fire."
                diag["maintenance_action"] = "Safely pull over, shut down engine, check coolant fluid lines, inspect radiator pressure, and replace coolant pump."
                diag["explanation"] = f"Engine temperature has reached {temp}°C, exceeding the structural safety threshold of 100°C. Anomaly status is set to {status} due to thermal expansion hazards."

            # 2. Battery Voltage Failure
            elif voltage < 10.0 or (voltage < 13.5 and deductions > 20):
                diag["anomaly_type"] = "Alternator Power Charging Failure"
                diag["risk_level"] = "High Risk"
                diag["urgency"] = "High Urgency / Complete system shutdown risk"
                diag["failure_timeline"] = "Estimated operational collapse within 30-45 minutes"
                diag["root_cause"] = f"Battery bus voltage is critically low at {voltage}V, indicating alternator stator failures or depleted lithium cell capacity."
                diag["real_world_risks"] = "Loss of electronic steering control, complete dark-out of driver telemetry, engine ignition shutdown."
                diag["maintenance_action"] = "Test alternator charging current, check voltage regulator fuse blocks, and perform complete battery cell capacity check."
                diag["explanation"] = f"Bus voltage drops to {voltage}V. This is categorized as {status} because the vehicle electronics require at least 12.0V to maintain microprocessor loop stability."

            # 3. Abnormal Vibration
            elif vibration > 1.2:
                diag["anomaly_type"] = "Mechanical Vibration / Harmonic Outlier"
                diag["risk_level"] = "High Risk" if vibration > 4.5 else "Medium Risk"
                diag["urgency"] = "High Urgency" if vibration > 4.5 else "Moderate Urgency"
                diag["failure_timeline"] = "Estimated drivetrain wear acceleration within 24-48 operating hours" if vibration < 4.5 else "Drivetrain shear failure imminent (within 1-2 hours)"
                diag["root_cause"] = f"Excessive chassis mechanical harmonics measured at {vibration} mm/s RMS. Correlates with driveshafts torque imbalance or worn mounts."
                diag["real_world_risks"] = "Drive shaft shear, structural mount fractures, steering rack joint dislocation."
                diag["maintenance_action"] = "Inspect driveshaft balance, retorque engine mounting bolts, check wheel hub bearings for play."
                diag["explanation"] = f"Chassis vibration level is high at {vibration} mm/s, which exceeds the mechanical baseline limits of 1.2 mm/s. The anomaly classification is {status}."

            # 4. Low Coolant Level
            elif coolant < 70.0:
                diag["anomaly_type"] = "Thermodynamic Coolant Depletion"
                diag["risk_level"] = "High Risk" if coolant < 40.0 else "Medium Risk"
                diag["urgency"] = "Immediate Response" if coolant < 40.0 else "Moderate Urgency"
                diag["failure_timeline"] = "Thermal surge estimated within 2 hours of high-load operation" if coolant < 40.0 else "Within 3 days of regular driving"
                diag["root_cause"] = f"Coolant fluid level drops to {coolant}%. Likely caused by minor leaks in the radiator core or head gasket fluid bypass."
                diag["real_world_risks"] = "Engine thermal blockages, cylinder block overheating, eventual engine cylinder cracking."
                diag["maintenance_action"] = "Inspect the radiator pressure relief valve, search hoses for fluid residue, top up ethylene-glycol coolant fluid."
                diag["explanation"] = f"Fluid coolant is low at {coolant}% (Optimal: 70-100%). This triggers a {status} status to protect against thermal runway conditions."

            # 5. RPM Instability / Slippage
            elif rpm > 4500 and speed < 25.0:
                diag["anomaly_type"] = "Propulsion Transfer Slippage"
                diag["risk_level"] = "High Risk"
                diag["urgency"] = "High Urgency"
                diag["failure_timeline"] = "Estimated clutch plates failure within 2 days of urban driving"
                diag["root_cause"] = f"High crankshaft speed ({rpm} RPM) mismatched with low ground velocity ({speed} km/h). Severe transmission friction plate slipping."
                diag["real_world_risks"] = "Total loss of drive thrust, sudden deceleration in highway traffic, transmission fire."
                diag["maintenance_action"] = "Inspect transmission fluid pressure, perform solenoid diagnostic sweeps, replace worn friction plates."
                diag["explanation"] = f"Propulsion coupling failure detected: Engine speed is {rpm} RPM with speed at only {speed} km/h. Categorized as {status}."

            # 6. Tire Pressure Imbalance
            elif pressure < 30.0 or pressure > 35.0:
                diag["anomaly_type"] = "Pneumatic Pressure Imbalance"
                diag["risk_level"] = "High Risk" if pressure < 25.0 else "Medium Risk"
                diag["urgency"] = "Immediate Safe Stop" if pressure < 25.0 else "Moderate Urgency"
                diag["failure_timeline"] = "Tire blowout danger at highway speeds" if pressure < 25.0 else "Within 24 hours of operation"
                diag["root_cause"] = f"Tire inflation is out of threshold at {pressure} PSI. Indicates active puncture leaks or thermal overinflation expansion."
                diag["real_world_risks"] = "Loss of directional vehicle control during high speed cornering, sidewall blowouts."
                diag["maintenance_action"] = "Verify pneumatic valve core sealing, inspect sidewalls for punctures or bubbles, re-adjust PSI pressure."
                diag["explanation"] = f"Tire pressure reads at {pressure} PSI (Safe range: 30-35 PSI). Alerting with a {status} classification for tire safety."
            
            # 7. Generic / Multi-sensor Outlier (Isolation Forest)
            else:
                diag["anomaly_type"] = "Multivariate Sensor Outlier / Edge AI Detection"
                diag["risk_level"] = "Medium Risk"
                diag["urgency"] = "Routine Diagnostics"
                diag["failure_timeline"] = "Within 3-5 days of driving"
                diag["root_cause"] = "Anomaly identified by the Isolation Forest model matching outliers in multi-sensor correlations."
                diag["real_world_risks"] = "Secondary components wear, sensor calibration drift, suboptimal vehicle fuel economy."
                diag["maintenance_action"] = "Connect diagnostic CAN interface, run full OBD-II scans, check sensor grounding."
                diag["explanation"] = f"The Edge Isolation Forest ML model detected an out-of-distribution vector with risk score {risk_score}%, suggesting a multivariate anomaly state."

        return {
            "health_score": health_score,
            "anomaly_status": status,
            "maintenance_required": maintenance_required,
            "ai_outlier": is_outlier,
            "ai_risk_score": risk_score,
            "alerts": alerts,
            "recommendations": list(set(recommendations)),
            "diagnostics": diag
        }
