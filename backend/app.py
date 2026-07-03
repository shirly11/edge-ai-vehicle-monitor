import os
import json
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from anomaly_detector import VehicleAnomalyDetector

app = Flask(__name__)
# Enable CORS for frontend integration
CORS(app)

# Path settings
DATA_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(DATA_DIR, "vehicle_health_data.csv")
JSONL_PATH = os.path.join(DATA_DIR, "vehicle_health_data.jsonl")

# Initialize our AI model
detector = VehicleAnomalyDetector(CSV_PATH)

def load_dataset():
    if os.path.exists(CSV_PATH):
        return pd.read_csv(CSV_PATH)
    return pd.DataFrame()

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")
    
    # Glassmorphism frontend will authenticate with these credentials
    if username == "admin" and password == "edgeai2026":
        return jsonify({
            "status": "success",
            "token": "mock-jwt-token-edge-ai-vehicle-telemetry-key",
            "user": {"username": "admin", "role": "Fleet Operator"}
        })
    else:
        return jsonify({
            "status": "error",
            "message": "Invalid username or password credentials. Hint: use admin / edgeai2026"
        }), 401

@app.route("/api/fleet/summary", methods=["GET"])
def get_fleet_summary():
    df = load_dataset()
    if df.empty:
        return jsonify({
            "total_records": 0,
            "active_vehicles": 0,
            "avg_health": 0.0,
            "critical_alerts": 0,
            "pending_maintenance": 0
        })

    # Calculate statistics matching UI metrics
    total_records = len(df)
    active_vehicles = int(df["vehicle_id"].nunique())
    
    # We want average health score of the latest state of each vehicle in the dataset
    latest_rows = df.sort_values("timestamp").groupby("vehicle_id").last().reset_index()
    
    avg_health = float(latest_rows["health_score"].mean())
    critical_alerts = int(latest_rows[latest_rows["anomaly_status"] == "Critical"].shape[0])
    pending_maintenance = int(latest_rows[latest_rows["maintenance_required"] == "Yes"].shape[0])

    return jsonify({
        "total_records": total_records,
        "active_vehicles": active_vehicles,
        "avg_health": round(avg_health, 2),
        "critical_alerts": critical_alerts,
        "pending_maintenance": pending_maintenance
    })

@app.route("/api/fleet/vehicles", methods=["GET"])
def get_fleet_vehicles():
    df = load_dataset()
    if df.empty:
        return jsonify([])
    
    vehicles = df["vehicle_id"].unique().tolist()
    vehicles.sort()
    
    # Compute current status for each vehicle
    latest_rows = df.sort_values("timestamp").groupby("vehicle_id").last().reset_index()
    vehicles_status = []
    
    for _, row in latest_rows.iterrows():
        vehicles_status.append({
            "vehicle_id": row["vehicle_id"],
            "health_score": float(row["health_score"]),
            "anomaly_status": row["anomaly_status"],
            "maintenance_required": row["maintenance_required"],
            "timestamp": row["timestamp"],
            "engine_temperature": float(row["engine_temperature"]),
            "battery_voltage": float(row["battery_voltage"]),
            "vibration_level": float(row["vibration_level"]),
            "fuel_level": float(row["fuel_level"])
        })
        
    return jsonify(vehicles_status)

@app.route("/api/vehicle/<vehicle_id>", methods=["GET"])
def get_vehicle_history(vehicle_id):
    df = load_dataset()
    if df.empty:
        return jsonify([])
        
    # Filter by vehicle id and sort chronologically
    vehicle_df = df[df["vehicle_id"] == vehicle_id].sort_values("timestamp")
    
    if vehicle_df.empty:
        return jsonify({"error": f"Vehicle {vehicle_id} not found"}), 404
        
    # Convert rows to dict
    history = vehicle_df.to_dict(orient="records")
    return jsonify(history)

@app.route("/api/predict", methods=["POST"])
def predict():
    sensor_data = request.json or {}
    prediction = detector.predict(sensor_data)
    return jsonify(prediction)

@app.route("/api/report/download", methods=["GET"])
def download_report():
    df = load_dataset()
    if df.empty:
        return jsonify({"error": "No data available"}), 400
        
    # Generate fleet health summary text file dynamically
    report_path = os.path.join(DATA_DIR, "fleet_health_report.txt")
    
    # Compile stats
    total_records = len(df)
    unique_vehicles = df["vehicle_id"].unique().tolist()
    latest_states = df.sort_values("timestamp").groupby("vehicle_id").last().reset_index()
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("========================================================\n")
        f.write("EDGE AI VEHICLE HEALTH MONITORING SYSTEM - FLEET REPORT\n")
        f.write(f"Generated Timestamp: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("========================================================\n\n")
        
        f.write(f"1. FLEET OVERVIEW STATISTICS\n")
        f.write(f"-----------------------------\n")
        f.write(f"Total Telemetry Logs Analyzed: {total_records}\n")
        f.write(f"Monitored Vehicles: {len(unique_vehicles)} ({', '.join(unique_vehicles)})\n")
        f.write(f"Average Fleet Health Score: {latest_states['health_score'].mean():.2f}%\n")
        f.write(f"Vehicles Requiring Maintenance: {latest_states[latest_states['maintenance_required'] == 'Yes'].shape[0]} / {len(unique_vehicles)}\n\n")
        
        f.write("2. REAL-TIME VEHICLE STATUS MATRIX\n")
        f.write("----------------------------------\n")
        f.write(f"{'Vehicle ID':<12} | {'Health Score':<12} | {'Status':<10} | {'Maintenance?':<12} | {'Last Report Timestamp'}\n")
        f.write("-" * 80 + "\n")
        for _, row in latest_states.iterrows():
            f.write(f"{row['vehicle_id']:<12} | {row['health_score']:<11.1f}% | {row['anomaly_status']:<10} | {row['maintenance_required']:<12} | {row['timestamp']}\n")
            
        f.write("\n3. PREDICTIVE CRITICAL ANOMALIES LOG\n")
        f.write("------------------------------------\n")
        critical_logs = df[df["anomaly_status"] == "Critical"].sort_values("timestamp", ascending=False).head(20)
        if critical_logs.empty:
            f.write("No critical anomalies logged in historical records.\n")
        else:
            f.write(f"{'Timestamp':<20} | {'Vehicle ID':<12} | {'Temp (°C)':<10} | {'Battery (V)':<12} | {'Vib (mm/s)':<12} | {'Score'}\n")
            f.write("-" * 80 + "\n")
            for _, row in critical_logs.iterrows():
                f.write(f"{row['timestamp']:<20} | {row['vehicle_id']:<12} | {row['engine_temperature']:<10.2f} | {row['battery_voltage']:<12.2f} | {row['vibration_level']:<12.2f} | {row['health_score']:.1f}%\n")
                
        f.write("\n========================================================\n")
        f.write("Report generated by local Edge AI Diagnostics Model.\n")
        f.write("========================================================\n")

    return send_file(
        report_path,
        mimetype="text/plain",
        as_attachment=True,
        download_name="fleet_health_report.txt"
    )

if __name__ == "__main__":
    # Start the local development Flask API
    app.run(host="0.0.0.0", port=5000, debug=True)
