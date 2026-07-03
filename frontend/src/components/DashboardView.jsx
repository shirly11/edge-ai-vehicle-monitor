import React, { useState, useEffect, useRef } from 'react';
import {
  Gauge,
  Thermometer,
  Zap,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Send,
  Download,
  AlertCircle,
  Wrench,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function DashboardView() {
  // Telemetry Metrics State
  const [metrics, setMetrics] = useState({
    vehicle_id: 'VEH_001',
    engine_temperature: 92.5,
    battery_voltage: 14.1,
    vibration_level: 0.8,
    tire_pressure: 32.5,
    speed: 75.0,
    fuel_level: 82.0,
    engine_rpm: 2800,
    coolant_level: 88.0,
    health_score: 100.0,
    anomaly_status: 'Normal',
    maintenance_required: 'No',
    ai_risk_score: 5,
    alerts: [],
    recommendations: ["All systems nominal"],
    diagnostics: {
      has_issue: false,
      anomaly_type: "System Nominal",
      explanation: "All telemetry sensors are operating within optimal baseline tolerances.",
      root_cause: "Operational wear index within normal parameters.",
      real_world_risks: "None identified under present driving conditions.",
      maintenance_action: "Standard scheduled maintenance inspection in 5,000 miles.",
      urgency: "Routine Monitoring / Low Priority",
      risk_level: "Low Risk",
      failure_timeline: "No failure imminent"
    }
  });

  // Simulator Control States
  const [selectedVehicle, setSelectedVehicle] = useState('VEH_001');
  const [vehicles, setVehicles] = useState(['VEH_001', 'VEH_002', 'VEH_003', 'VEH_004', 'VEH_005']);
  const [datasetRows, setDatasetRows] = useState([]);
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(2000); // ms per tick
  const [consoleLogs, setConsoleLogs] = useState(["[SYSTEM] Diagnostics system initialized. Standby..."]);
  
  // Voice Synthesis Toggle
  const [voiceAlertsEnabled, setVoiceAlertsEnabled] = useState(true);

  // Demo Flow States
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [lastSpeechText, setLastSpeechText] = useState('');

  // AI Chat Assistant States
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Diagnostics assistant ready. You can ask about current engine state, battery charger, vibration levels, or run a full health check.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);
  
  // Refs
  const simInterval = useRef(null);

  // Manual Simulation States
  const [manualInput, setManualInput] = useState({
    engine_temperature: 90.0,
    battery_voltage: 14.1,
    vibration_level: 0.8,
    engine_rpm: 2500,
    speed: 80.0,
    fuel_level: 75.0,
    tire_pressure: 32.5,
    coolant_level: 90.0,
    vehicle_id: 'SIM_VEH'
  });
  const [manualResult, setManualResult] = useState(null);
  const [manualLoading, setManualLoading] = useState(false);

  // Load dataset for simulation
  const fetchVehicleHistory = async (vehicleId) => {
    try {
      addConsoleLog(`[SYSTEM] Initializing telemetry log buffer for ${vehicleId}...`);
      const response = await fetch(`http://localhost:5000/api/vehicle/${vehicleId}`);
      if (!response.ok) throw new Error('Failed to load dataset');
      const data = await response.json();
      setDatasetRows(data);
      setCurrentRowIndex(0);
      addConsoleLog(`[SYSTEM] Telemetry buffer ready: ${data.length} records loaded.`);
      
      // Load initial row metrics
      if (data.length > 0) {
        updateMetricsWithPrediction(data[0]);
      }
    } catch (err) {
      console.warn('Backend server offline, using local simulation backup data.');
      // Local backup dataset generation
      generateMockDataset(vehicleId);
    }
  };

  const generateMockDataset = (vehicleId) => {
    const mockRows = [];
    const baseTemp = vehicleId === 'VEH_002' ? 102 : 90;
    const baseVib = vehicleId === 'VEH_004' ? 1.5 : 0.8;
    const baseHealth = vehicleId === 'VEH_002' ? 55 : vehicleId === 'VEH_004' ? 82 : 100;
    
    for (let i = 0; i < 50; i++) {
      const isOutlier = i === 15 || i === 32;
      mockRows.push({
        vehicle_id: vehicleId,
        timestamp: `2026-07-02 18:${i}:00`,
        engine_temperature: baseTemp + (isOutlier ? 14 : Math.sin(i / 2) * 2),
        battery_voltage: 14.1 + (isOutlier ? -4.3 : Math.cos(i / 3) * 0.1),
        vibration_level: baseVib + (isOutlier ? 0.9 : Math.sin(i / 5) * 0.1),
        tire_pressure: 32.5 + Math.sin(i) * 0.5,
        speed: 60 + Math.sin(i / 3) * 15,
        fuel_level: 95.0 - (i * 0.5),
        engine_rpm: 2000 + (Math.sin(i / 3) * 600),
        coolant_level: 90.0 - (i * 0.2),
        health_score: isOutlier ? Math.max(30, baseHealth - 30) : baseHealth,
        anomaly_status: isOutlier ? 'Critical' : 'Normal',
        maintenance_required: isOutlier ? 'Yes' : 'No'
      });
    }
    setDatasetRows(mockRows);
    setCurrentRowIndex(0);
    updateMetricsWithPrediction(mockRows[0]);
    addConsoleLog(`[SYSTEM] Loaded offline telemetry cache: ${mockRows.length} rows.`);
  };

  // Run predictions on current sensor state
  const updateMetricsWithPrediction = async (sensorState) => {
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sensorState)
      });
      if (response.ok) {
        const prediction = await response.json();
        const merged = { ...sensorState, ...prediction };
        setMetrics(merged);
        handleAlertsAndSpeech(merged);
      } else {
        throw new Error('Prediction API issue');
      }
    } catch (err) {
      // Fallback local rules prediction engine
      const localPredict = runLocalRules(sensorState);
      const merged = { ...sensorState, ...localPredict };
      setMetrics(merged);
      handleAlertsAndSpeech(merged);
    }
  };

  // Manual Inference Execution
  const handleManualInference = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    setIsSimulating(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualInput)
      });
      if (response.ok) {
        const prediction = await response.json();
        setManualResult(prediction);
        setMetrics({ ...manualInput, ...prediction });
        handleAlertsAndSpeech({ ...manualInput, ...prediction });
      } else {
        throw new Error('Prediction API issue');
      }
    } catch (err) {
      console.warn('API offline, running local rules for manual input:', err);
      const prediction = runLocalRules(manualInput);
      setManualResult(prediction);
      setMetrics({ ...manualInput, ...prediction });
      handleAlertsAndSpeech({ ...manualInput, ...prediction });
    } finally {
      setManualLoading(false);
    }
  };

  // Local fallback rule execution
  const runLocalRules = (state) => {
    const temp = state.engine_temperature;
    const voltage = state.battery_voltage;
    const vib = state.vibration_level;
    const coolant = state.coolant_level;
    const pressure = state.tire_pressure;
    const fuel = state.fuel_level;

    let deductions = 0.0;
    let alerts = [];
    let recs = [];

    if (temp > 100) {
      deductions += (temp - 100) * 2;
      alerts.append ? alerts.push({ severity: 'Critical', message: `Critical engine temperature: ${temp}°C` }) : alerts.push({ severity: 'Critical', message: `Critical temperature: ${temp}°C` });
      recs.push("Potential engine failure detected");
      recs.push("Check coolant system");
    }
    if (voltage < 10) {
      deductions += (10 - voltage) * 25;
      alerts.push({ severity: 'Critical', message: `Critical battery voltage: ${voltage}V` });
      recs.push("Battery health critically low");
      recs.push("Maintenance required within 3 days");
    } else if (voltage < 13.5) {
      deductions += (13.5 - voltage) * 10;
      alerts.push({ severity: 'Warning', message: `Low battery charging: ${voltage}V` });
      recs.push("Check alternator charging");
    }
    if (vib > 1.2) {
      deductions += (vib - 1.2) * 15;
      alerts.push({ severity: vib > 4.5 ? 'Critical' : 'Warning', message: `Abnormal vibration: ${vib} mm/s` });
      recs.push("High mechanical vibration alert");
    }
    if (coolant < 70) {
      deductions += (70 - coolant) * 0.8;
      alerts.push({ severity: 'Warning', message: `Low coolant fluid: ${coolant}%` });
    }
    if (pressure < 30) {
      deductions += (30 - pressure) * 3;
      alerts.push({ severity: 'Warning', message: `Improper tire pressure: ${pressure} PSI` });
    }

    const health = Math.max(0, Math.min(100, 100 - deductions));
    const status = (health < 40 || temp > 115 || voltage < 10) ? 'Critical' : (health < 70 || temp > 100 || vib > 1.2) ? 'Warning' : 'Normal';
    const maintenance = status !== 'Normal' ? 'Yes' : 'No';

    const diag = {
      has_issue: status !== 'Normal',
      anomaly_type: 'System Nominal',
      explanation: 'All telemetry sensors are operating within optimal baseline tolerances.',
      root_cause: 'Operational wear index within normal parameters.',
      real_world_risks: 'None identified under present driving conditions.',
      maintenance_action: 'Standard scheduled maintenance inspection in 5,000 miles.',
      urgency: 'Routine Monitoring / Low Priority',
      risk_level: 'Low Risk',
      failure_timeline: 'No failure imminent'
    };

    if (status !== 'Normal') {
      if (temp > 100) {
        diag.anomaly_type = "Engine Thermal Runaway / Overheating";
        diag.risk_level = "High Risk";
        diag.urgency = "Immediate / Emergency Stop";
        diag.failure_timeline = "Estimated block damage within 15 minutes of continuous running";
        diag.root_cause = `Elevated thermal dissipation. Coolant fluid capacity is holding at ${coolant}%, resulting in heat build-up under workload.`;
        diag.real_world_risks = "Cylinder head warping, engine block cracking, catastrophic seizure, thermal fire.";
        diag.maintenance_action = "Safely pull over, shut down engine, check coolant fluid lines, inspect radiator pressure, and replace coolant pump.";
        diag.explanation = `Engine temperature has reached ${temp}°C, exceeding the structural safety threshold of 100°C. Anomaly status is set to ${status} due to thermal expansion hazards.`;
      } else if (voltage < 10) {
        diag.anomaly_type = "Alternator Power Charging Failure";
        diag.risk_level = "High Risk";
        diag.urgency = "High Urgency / Complete system shutdown risk";
        diag.failure_timeline = "Estimated operational collapse within 30-45 minutes";
        diag.root_cause = `Battery bus voltage is critically low at ${voltage}V, indicating alternator stator failures or depleted cells.`;
        diag.real_world_risks = "Loss of electronic steering control, complete dark-out of driver telemetry, engine ignition shutdown.";
        diag.maintenance_action = "Test alternator charging current, check voltage regulator fuse blocks, and perform capacity check.";
        diag.explanation = `Bus voltage drops to ${voltage}V. This is categorized as ${status} because the vehicle electronics require at least 12.0V to maintain microprocessor loop stability.`;
      } else if (vib > 1.2) {
        diag.anomaly_type = "Mechanical Vibration / Harmonic Outlier";
        diag.risk_level = vib > 4.5 ? "High Risk" : "Medium Risk";
        diag.urgency = vib > 4.5 ? "High Urgency" : "Moderate Urgency";
        diag.failure_timeline = vib > 4.5 ? "Drivetrain shear failure imminent (within 1-2 hours)" : "Estimated drivetrain wear acceleration within 24-48 operating hours";
        diag.root_cause = `Excessive chassis mechanical harmonics measured at ${vib} mm/s RMS. Correlates with drive shafts torque imbalance or worn mounts.`;
        diag.real_world_risks = "Drive shaft shear, structural mount fractures, steering rack joint dislocation.";
        diag.maintenance_action = "Inspect driveshaft balance, retorque engine mounting bolts, check hub bearings.";
        diag.explanation = `Chassis vibration level is high at ${vib} mm/s, which exceeds the mechanical baseline limits of 1.2 mm/s. The anomaly classification is ${status}.`;
      } else if (coolant < 70) {
        diag.anomaly_type = "Thermodynamic Coolant Depletion";
        diag.risk_level = coolant < 40 ? "High Risk" : "Medium Risk";
        diag.urgency = coolant < 40 ? "Immediate Response" : "Moderate Urgency";
        diag.failure_timeline = coolant < 40 ? "Thermal surge estimated within 2 hours of high-load operation" : "Within 3 days of regular driving";
        diag.root_cause = `Coolant fluid level drops to ${coolant}%. Likely caused by minor leaks in the radiator core or head gasket fluid bypass.`;
        diag.real_world_risks = "Engine thermal blockages, cylinder block overheating, eventual engine cylinder cracking.";
        diag.maintenance_action = "Inspect the radiator pressure relief valve, search hoses for leaks, top up fluid.";
        diag.explanation = `Fluid coolant is low at ${coolant}% (Optimal: 70-100%). This triggers a ${status} status to protect against thermal runway.`;
      } else {
        diag.anomaly_type = "Multivariate Sensor Outlier / Edge AI Detection";
        diag.risk_level = "Medium Risk";
        diag.urgency = "Routine Diagnostics";
        diag.failure_timeline = "Within 3-5 days of driving";
        diag.root_cause = "Anomaly identified by the Isolation Forest model matching outliers in multi-sensor correlations.";
        diag.real_world_risks = "Secondary components wear, sensor calibration drift, suboptimal vehicle fuel economy.";
        diag.maintenance_action = "Connect diagnostic CAN interface, run full OBD-II scans, check sensor grounding.";
        diag.explanation = "The Edge Isolation Forest ML model detected an out-of-distribution vector, suggesting a multivariate anomaly state.";
      }
    }

    return {
      health_score: parseFloat(health.toFixed(2)),
      anomaly_status: status,
      maintenance_required: maintenance,
      ai_risk_score: status === 'Critical' ? 92 : status === 'Warning' ? 64 : 8,
      alerts,
      recommendations: recs.length > 0 ? recs : ["System operating nominally"],
      diagnostics: diag
    };
  };

  const handleAlertsAndSpeech = (mergedData) => {
    // Write telemetry output logs to console
    const sensorMsg = `[DATA] VEHICLE=${mergedData.vehicle_id} TEMP=${mergedData.engine_temperature}°C VIB=${mergedData.vibration_level}mm/s BATT=${mergedData.battery_voltage}V SPEED=${mergedData.speed}km/h`;
    const modelMsg = `[MODEL] ANOMALY_STATUS=${mergedData.anomaly_status} RISK_SCORE=${mergedData.ai_risk_score}% HEALTH_SCORE=${mergedData.health_score}%`;
    addConsoleLog(sensorMsg);
    addConsoleLog(modelMsg);

    // Check for popup warning conditions
    const hasPopupAlert = 
      mergedData.engine_temperature > 100 ||
      mergedData.battery_voltage < 10 ||
      mergedData.vibration_level > 1.2 ||
      mergedData.engine_rpm > 6000 ||
      mergedData.fuel_level < 10;
      
    // Trigger popups only on transition from Normal to Warning/Critical
    const prevNormal = metrics.anomaly_status === 'Normal';
    const currentNormal = mergedData.anomaly_status === 'Normal';
    if (hasPopupAlert && prevNormal && !currentNormal) {
      setShowCriticalModal(true);
    }

    // Speak critical alerts if voice is enabled and alert is new
    if (voiceAlertsEnabled && mergedData.anomaly_status === 'Critical') {
      const speechText = `Critical vehicle warning. Health index has dropped. Recommendations. ${mergedData.recommendations.join('. ')}`;
      if (speechText !== lastSpeechText) {
        speakVoice(speechText);
        setLastSpeechText(speechText);
      }
    }
  };

  // Browser speech synthesis API
  const speakVoice = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel previous utterances to avoid queuing delay
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      // Find a premium system voice (e.g. Google US English, Microsoft Zira)
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira'));
      if (premiumVoice) utterance.voice = premiumVoice;
      window.speechSynthesis.speak(utterance);
      addConsoleLog(`[VOICE OUTPUT] "${text}"`);
    }
  };

  // Issue-specific Alert Details Aggregator
  const getActiveAlertDetails = () => {
    const temp = metrics.engine_temperature;
    const voltage = metrics.battery_voltage;
    const vib = metrics.vibration_level;
    const rpm = metrics.engine_rpm;
    const fuel = metrics.fuel_level;

    if (temp > 100) {
      return {
        title: "CRITICAL ENGINE OVERHEAT",
        subsystem: "THERMAL PROPULSION",
        explanation: "Critical engine coolant failure risk detected. Structural head damage warning.",
        recommendation: "Perform immediate radiator inspection, check for coolant leaks, and inspect radiator fan loop.",
        colorClass: "text-cyber-red",
        glowClass: "border-glow-red border-cyber-red shadow-glow-red/20 pulse-glow-red",
        icon: "🔥 animate-pulse",
        urgency: "Immediate Emergency Stop",
        timeline: "Within 15 minutes of continuous running"
      };
    }
    if (voltage < 10) {
      return {
        title: "BATTERY SYSTEM FAILURE",
        subsystem: "ELECTRICAL POWER BUS",
        explanation: "Critical battery bus voltage depletion. Alternator failure possibility.",
        recommendation: "Recharge or replace battery, test alternator charging circuit, and check bus fuse block.",
        colorClass: "text-cyber-red",
        glowClass: "border-glow-red border-cyber-red shadow-glow-red/20 pulse-glow-red",
        icon: "⚡ animate-bounce",
        urgency: "Immediate Ignition Alert",
        timeline: "Estimated chassis shutdown within 30 minutes"
      };
    }
    if (vib > 1.2) {
      return {
        title: "MECHANICAL VIBRATION ANOMALY",
        subsystem: "STRUCTURAL HARMONICS",
        explanation: "Chassis harmonic amplitude exceeded. Rotating component instability risk.",
        recommendation: "Inspect mounts and suspension, balance driveshaft balance, check wheel hub bearings.",
        colorClass: "text-cyber-yellow",
        glowClass: "border-glow-yellow border-cyber-yellow shadow-glow-yellow/20",
        icon: "⚙️ animate-spin",
        urgency: "Moderate Priority",
        timeline: "Drivetrain wear acceleration within 24 hours"
      };
    }
    if (rpm > 6000) {
      return {
        title: "ENGINE RPM INSTABILITY",
        subsystem: "KINETIC DRIVETRAIN",
        explanation: "Engine rotating speed exceeds mechanical safety bounds. Excessive transmission coupling load.",
        recommendation: "Reduce acceleration immediately. Downshift gears and verify throttle linkage.",
        colorClass: "text-cyber-yellow",
        glowClass: "border-glow-yellow border-cyber-yellow shadow-glow-yellow/20",
        icon: "🔄 animate-pulse",
        urgency: "High Priority",
        timeline: "Immediate mechanical fatigue risk"
      };
    }
    if (fuel < 10) {
      return {
        title: "LOW FUEL EMERGENCY",
        subsystem: "FLUID STORAGE",
        explanation: "Fuel level is critically low. Direct trip interruption risk.",
        recommendation: "Navigate to the nearest refueling station immediately.",
        colorClass: "text-cyber-yellow",
        glowClass: "border-glow-yellow border-cyber-yellow shadow-glow-yellow/20",
        icon: "⛽",
        urgency: "Moderate Priority",
        timeline: "Starvation estimated within 15 miles"
      };
    }

    // Default fallback
    return {
      title: "MULTIVARIATE SENSOR ANOMALY",
      subsystem: "EDGE AI COGNITIVE CORE",
      explanation: "Unusual sensor correlation signature identified by Isolation Forest model.",
      recommendation: "Perform system diagnostics check and run OBD-II CAN-bus checks.",
      colorClass: "text-cyber-yellow",
      glowClass: "border-glow-yellow border-cyber-yellow shadow-glow-yellow/20",
      icon: "🔍",
      urgency: "Routine Inspection",
      timeline: "Within 3-5 days of driving"
    };
  };

  // Simulation ticking interval
  useEffect(() => {
    if (isSimulating && datasetRows.length > 0 && !demoActive) {
      simInterval.current = setInterval(() => {
        setCurrentRowIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % datasetRows.length;
          updateMetricsWithPrediction(datasetRows[nextIndex]);
          return nextIndex;
        });
      }, simSpeed);
    } else {
      clearInterval(simInterval.current);
    }

    return () => clearInterval(simInterval.current);
  }, [isSimulating, datasetRows, simSpeed, demoActive]);

  useEffect(() => {
    fetchVehicleHistory(selectedVehicle);
  }, [selectedVehicle]);

  // Console logging helper
  const addConsoleLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Chat message parsing logic
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let aiText = '';
      const lower = userText.toLowerCase();

      if (lower.includes('temp') || lower.includes('heat') || lower.includes('coolant')) {
        if (metrics.engine_temperature > 100) {
          aiText = `Current engine temperature is CRITICAL at ${metrics.engine_temperature}°C. Coolant level is low at ${metrics.coolant_level}%. The Isolation Forest model classifies this multivariate anomaly signature as a high-risk engine block danger. RECOMMENDATION: Shut down engine immediately and check for coolant leaks.`;
        } else {
          aiText = `Engine temperature is nominal at ${metrics.engine_temperature}°C (Limit: 100°C). Coolant reservoir is holding at ${metrics.coolant_level}%. No thermal anomalies detected.`;
        }
      } else if (lower.includes('batt') || lower.includes('volt') || lower.includes('alternator')) {
        if (metrics.battery_voltage < 10) {
          aiText = `Battery voltage is critically low at ${metrics.battery_voltage}V. Alternator is not providing charge. RECOMMENDATION: Replace battery cell battery module within 3 days.`;
        } else if (metrics.battery_voltage < 13.5 || metrics.battery_voltage > 14.5) {
          aiText = `Battery voltage is warning boundary at ${metrics.battery_voltage}V. Standard range is 13.5V to 14.5V. Alternator charging check suggested.`;
        } else {
          aiText = `Battery charging is excellent at ${metrics.battery_voltage}V. Alternator output is stable.`;
        }
      } else if (lower.includes('vibrate') || lower.includes('vibration') || lower.includes('shak')) {
        if (metrics.vibration_level > 1.2) {
          aiText = `Vibration frequency amplitude is abnormal at ${metrics.vibration_level} mm/s (Limit: 1.2 mm/s). The anomaly is flagged as Outlier due to mechanical instability. Check torque mounts and crankshaft shafts.`;
        } else {
          aiText = `Chassis vibration amplitude is nominal at ${metrics.vibration_level} mm/s RMS. Mechanical mounts are stable.`;
        }
      } else if (lower.includes('health') || lower.includes('diagnostic') || lower.includes('status')) {
        aiText = `Local diagnostics result: Overall health score is ${metrics.health_score}% (${getHealthScoreLabel(metrics.health_score)}). Anomaly status is ${metrics.anomaly_status}. Current recommendations: ${metrics.recommendations.join(', ')}.`;
      } else {
        aiText = `I am analyzing the current diagnostics for ${metrics.vehicle_id}. All sensor metrics are loaded. You can ask me details about the engine temperature, battery voltage, mechanical vibration levels, or input specific repair tasks.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
      speakVoice(aiText);
    }, 600);
  };

  // HEALTH SCORE LABELING
  const getHealthScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 40) return 'Warning';
    return 'Critical';
  };

  const getHealthColorClass = (score) => {
    if (score >= 90) return 'text-cyber-green border-cyber-green/30';
    if (score >= 70) return 'text-cyber-blue border-cyber-blue/30';
    if (score >= 40) return 'text-cyber-yellow border-cyber-yellow/30';
    return 'text-cyber-red border-cyber-red/30 animate-pulse';
  };

  // STEP BY STEP HACKATHON DEMO FLOW SEQUENCE
  const startHackathonDemoFlow = () => {
    setDemoActive(true);
    setIsSimulating(false);
    setDemoStep(1);
    addConsoleLog("[DEMO] Starting Hackathon Demo Sequence...");
    
    // Step 1: Initialize Healthy Metrics
    const step1Metrics = {
      vehicle_id: selectedVehicle,
      engine_temperature: 90.0,
      battery_voltage: 14.1,
      vibration_level: 0.72,
      tire_pressure: 32.5,
      speed: 80.0,
      fuel_level: 75.0,
      engine_rpm: 2600,
      coolant_level: 89.0,
      health_score: 100.0,
      anomaly_status: 'Normal',
      maintenance_required: 'No',
      ai_risk_score: 4,
      alerts: [],
      recommendations: ["All systems normal"],
      diagnostics: {
        has_issue: false,
        anomaly_type: "System Nominal",
        explanation: "All telemetry sensors are operating within optimal baseline tolerances.",
        root_cause: "Operational wear index within normal parameters.",
        real_world_risks: "None identified under present driving conditions.",
        maintenance_action: "Standard scheduled maintenance inspection in 5,000 miles.",
        urgency: "Routine Monitoring / Low Priority",
        risk_level: "Low Risk",
        failure_timeline: "No failure imminent"
      }
    };
    setMetrics(step1Metrics);
    addConsoleLog("[DEMO - STEP 1] Initialized healthy baseline. Engine temperature is 90°C. Health score is 100%.");
    speakVoice("Initializing demo sequence. Vehicle telemetry is healthy. All systems operating within specifications.");
    
    // Step 2: Temperature rises gradually
    setTimeout(() => {
      setDemoStep(2);
      const step2Metrics = {
        ...step1Metrics,
        engine_temperature: 96.5,
        health_score: 100.0
      };
      setMetrics(step2Metrics);
      addConsoleLog("[DEMO - STEP 2] Temperature rising gradually. Engine temperature is 96.5°C. Diagnostics check...");
    }, 4000);

    // Step 3 & 4: Anomaly Detected and Critical Alert Popup
    setTimeout(() => {
      setDemoStep(3);
      const step3Metrics = {
        ...step1Metrics,
        engine_temperature: 105.8, // Above 100°C limit
        coolant_level: 42.0,
        health_score: 52.4, // Reduced health
        anomaly_status: 'Critical',
        maintenance_required: 'Yes',
        ai_risk_score: 94,
        alerts: [{
          severity: 'Critical',
          message: 'Critical engine overheating alert: Temperature is 105.8°C (Limit: 100°C)',
          sensor: 'engine_temperature'
        }],
        recommendations: ["Potential engine failure detected", "Check coolant system", "Maintenance required within 3 days"],
        diagnostics: {
          has_issue: true,
          anomaly_type: "Engine Thermal Runaway / Overheating",
          explanation: "Engine temperature has reached 105.8°C, exceeding the structural safety threshold of 100°C. Anomaly status is set to Critical due to thermal expansion hazards.",
          root_cause: "Elevated thermal dissipation. Coolant fluid capacity is holding at 42.0%, resulting in heat build-up under workload.",
          real_world_risks: "Cylinder head warping, engine block cracking, catastrophic seizure, thermal fire.",
          maintenance_action: "Safely pull over, shut down engine, check coolant fluid lines, inspect radiator pressure, and replace coolant pump.",
          urgency: "Immediate / Emergency Stop",
          risk_level: "High Risk",
          failure_timeline: "Estimated block damage within 15 minutes of continuous running"
        }
      };
      setMetrics(step3Metrics);
      addConsoleLog("[DEMO - STEP 3 & 4] AI Anomaly Detected! Engine temp 105.8°C crosses critical threshold.");
      setShowCriticalModal(true);
      speakVoice("Warning: Critical engine overheating detected. Potential engine failure imminent. Please check coolant system immediately.");
    }, 8000);

    // Step 5 & 6: Health score decreases and recommendations are finalized
    setTimeout(() => {
      setDemoStep(5);
      // Temperature continues climbing, health plunges further
      setMetrics(prev => ({
        ...prev,
        engine_temperature: 116.4,
        health_score: 31.8,
        ai_risk_score: 98,
        alerts: [
          { severity: 'Critical', message: 'Critical engine overheating: 116.4°C' },
          { severity: 'Critical', message: 'Critical coolant pressure loss: 35.0%' }
        ],
        recommendations: ["Potential engine failure imminent", "Flush coolant and repair lines", "Stop vehicle safe inspection"],
        diagnostics: {
          has_issue: true,
          anomaly_type: "Engine Thermal Runaway / Overheating",
          explanation: "Engine temperature has climbed to 116.4°C with coolant dropping to 35.0%, representing severe fluid leakage and failure.",
          root_cause: "Complete depletion of ethylene-glycol radiator loop pressure.",
          real_world_risks: "Engine block cracking, structural head gasket rupture, immediate block seizure.",
          maintenance_action: "Stop vehicle immediately. Shut down ignition and inspect coolant lines.",
          urgency: "Emergency Shutdown Required",
          risk_level: "High Risk",
          failure_timeline: "Failure imminent (within 1-2 minutes)"
        }
      }));
      addConsoleLog("[DEMO - STEP 5 & 6] Health score reduced to Critical state (31.8%). Recommendations updated.");
    }, 12000);
  };

  const stopDemo = () => {
    setDemoActive(false);
    setDemoStep(0);
    setShowCriticalModal(false);
    addConsoleLog("[DEMO] Resetting diagnostics sequence to normal telemetry tracking.");
    fetchVehicleHistory(selectedVehicle);
  };

  return (
    <div className="min-h-screen cyber-grid py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Critical Overlay Alert Banner */}
      {showCriticalModal && (() => {
        const details = getActiveAlertDetails();
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className={`w-full max-w-lg glass-card border-2 p-8 text-center space-y-6 relative ${details.glowClass}`}>
              <div className={`absolute top-4 right-4 cursor-pointer font-bold hover:scale-110 ${details.colorClass}`} onClick={() => setShowCriticalModal(false)}>✕</div>
              
              <div className="flex flex-col items-center gap-2">
                <div className="text-5xl mb-2">
                  {details.icon === "🔥 animate-pulse" ? "🔥" :
                   details.icon === "⚡ animate-bounce" ? "⚡" :
                   details.icon === "⚙️ animate-spin" ? "⚙️" :
                   details.icon === "🔄 animate-pulse" ? "🔄" : details.icon}
                </div>
                <div className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
                  Subsystem: <span className={details.colorClass}>{details.subsystem}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className={`text-2xl font-black tracking-wider glitch-text uppercase ${details.colorClass}`}>
                  {details.title}
                </h2>
                <p className="text-white font-mono text-xs uppercase tracking-widest">
                  Local Edge AI Inference Notification
                </p>
              </div>

              <div className="bg-black/50 p-5 rounded-lg border border-white/5 font-mono text-left text-xs space-y-2.5 text-gray-300">
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Vehicle ID:</span>
                  <span className="text-white font-bold">{metrics.vehicle_id}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Diagnostic Warning:</span>
                  <span className="text-white font-bold">{details.explanation}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Inference Urgency:</span>
                  <span className={`${details.colorClass} font-bold`}>{details.urgency}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1.5">
                  <span>Est. Failure Timeline:</span>
                  <span className="text-cyber-cyan font-bold">{details.timeline}</span>
                </div>
                <div className="pt-2 text-cyber-green font-semibold uppercase text-[9px] tracking-wider">
                  Prescribed Actions:
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed pl-1">
                  {details.recommendation}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setShowCriticalModal(false); speakVoice("Muting diagnostic warning alerts."); }}
                  className="flex-1 py-3 bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-extrabold uppercase tracking-wider text-xs rounded-lg transition-all"
                >
                  Mute Alert Console
                </button>
                <button
                  onClick={stopDemo}
                  className="px-5 py-3 border border-white/20 hover:border-white text-white font-mono text-xs rounded-lg transition-all"
                >
                  Reset Telemetry
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Title & Core Navigation Controllers */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 glass-card p-6 border-white/5">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3.5 w-3.5 rounded-full bg-cyber-green animate-pulse"></span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">Edge AI Predictive Diagnostics</h1>
          </div>
          <p className="text-gray-400 text-xs mt-1 font-mono uppercase tracking-widest">
            Telemetry Dashboard ➔ F1 Fused Telemetry Interface
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Demo button */}
          <button
            onClick={demoActive ? stopDemo : startHackathonDemoFlow}
            className={`flex items-center gap-2 font-black uppercase text-xs tracking-wider px-5 py-3 rounded-lg border transition-all ${
              demoActive 
                ? 'bg-cyber-red border-cyber-red text-black shadow-glow-red/20' 
                : 'bg-cyber-cyan border-cyber-cyan text-black hover:shadow-glow-cyan/35'
            }`}
          >
            <Sparkles size={16} className={demoActive ? 'animate-spin' : ''} />
            {demoActive ? `ANALYSIS RUNNING (Step ${demoStep}/6)` : 'START REAL-TIME VEHICLE ANALYSIS'}
          </button>

          {/* Voice alerts toggle */}
          <button
            onClick={() => setVoiceAlertsEnabled(!voiceAlertsEnabled)}
            className={`p-3 rounded-lg border transition-all ${
              voiceAlertsEnabled
                ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan'
                : 'bg-gray-900 border-white/5 text-gray-500'
            }`}
            title={voiceAlertsEnabled ? "Mute Voice Alerts" : "Enable Voice Alerts"}
          >
            {voiceAlertsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <span className="text-gray-700 hidden sm:block">|</span>

          {/* Vehicle selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-mono uppercase text-gray-400">Target Vehicle:</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              disabled={demoActive}
              className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-cyber-cyan text-xs focus:outline-none focus:border-cyber-cyan tracking-wider font-mono disabled:opacity-50"
            >
              {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <span className="text-gray-700 hidden sm:block">|</span>

          {/* Simulator state toggles */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              disabled={demoActive}
              className={`p-2.5 rounded-lg border text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                isSimulating
                  ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green'
                  : 'bg-gray-900 border-white/5 text-gray-400 hover:border-white/15'
              }`}
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              {isSimulating ? 'Simulating' : 'Simulate'}
            </button>
            
            <button
              onClick={() => {
                setCurrentRowIndex(0);
                if (datasetRows.length > 0) updateMetricsWithPrediction(datasetRows[0]);
                addConsoleLog("[SYSTEM] Telemetry history buffer index reset.");
              }}
              disabled={demoActive}
              className="p-2.5 bg-gray-900 border border-white/5 text-gray-400 hover:text-white rounded-lg transition-colors"
              title="Reset Buffer"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN METRIC DIALS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: HEALTH SCORE RADIAL DIAL */}
        <div className="glass-card p-6 border-white/5 flex flex-col items-center justify-between text-center relative overflow-hidden h-[240px]">
          <div className="absolute top-3 left-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest">Health Score</div>
          
          <div className="relative mt-4 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke={
                  metrics.health_score >= 90 ? '#39ff14' : metrics.health_score >= 70 ? '#3b82f6' : metrics.health_score >= 40 ? '#ffcc00' : '#ff007f'
                }
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="314.15"
                strokeDashoffset={314.15 - (314.15 * metrics.health_score) / 100}
                className="gauge-circle"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white font-mono">{metrics.health_score}%</span>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 mt-1 border rounded-full ${getHealthColorClass(metrics.health_score)}`}>
                {getHealthScoreLabel(metrics.health_score)}
              </span>
            </div>
          </div>
          
          <div className="w-full text-xs text-gray-400 font-mono mt-4 uppercase">
            Outlier Risk Score: <span className="text-cyber-cyan font-bold">{metrics.ai_risk_score}%</span>
          </div>
        </div>

        {/* Card 2: ENGINE TEMPERATURE */}
        <div className={`glass-card p-6 flex flex-col justify-between h-[240px] relative ${metrics.engine_temperature > 100 ? 'border-cyber-red/30 shadow-glow-red/5' : 'border-white/5'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Engine Temperature</span>
            <Thermometer size={18} className={metrics.engine_temperature > 100 ? 'text-cyber-red animate-pulse' : 'text-gray-400'} />
          </div>
          <div className="my-auto space-y-1">
            <div className="text-4xl font-extrabold font-mono text-white flex items-baseline gap-1">
              {metrics.engine_temperature} <span className="text-lg text-gray-500">°C</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono uppercase">LIMIT: 100.0 °C</p>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-900/60 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metrics.engine_temperature > 100 ? 'bg-cyber-red' : 'bg-cyber-cyan'}`}
                style={{ width: `${Math.min(100, (metrics.engine_temperature / 140) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>0°C</span>
              <span>140°C</span>
            </div>
          </div>
        </div>

        {/* Card 3: BATTERY CHARGING VOLTAGE */}
        <div className={`glass-card p-6 flex flex-col justify-between h-[240px] relative ${metrics.battery_voltage < 10 ? 'border-cyber-red/30 shadow-glow-red/5' : 'border-white/5'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Battery Charger</span>
            <Zap size={18} className={metrics.battery_voltage < 10 ? 'text-cyber-red animate-pulse' : 'text-cyber-cyan'} />
          </div>
          <div className="my-auto space-y-1">
            <div className="text-4xl font-extrabold font-mono text-white flex items-baseline gap-1">
              {metrics.battery_voltage} <span className="text-lg text-gray-500">V</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono uppercase">Nominal: 13.5V - 14.5V</p>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-900/60 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metrics.battery_voltage < 10 ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue'}`}
                style={{ width: `${Math.min(100, (metrics.battery_voltage / 16) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>0V</span>
              <span>16V</span>
            </div>
          </div>
        </div>

        {/* Card 4: CHASSIS VIBRATION */}
        <div className={`glass-card p-6 flex flex-col justify-between h-[240px] relative ${metrics.vibration_level > 1.2 ? 'border-cyber-yellow/30 shadow-glow-yellow/5' : 'border-white/5'}`}>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Structural Vibration</span>
            <Activity size={18} className={metrics.vibration_level > 1.2 ? 'text-cyber-yellow animate-pulse' : 'text-cyber-green'} />
          </div>
          <div className="my-auto space-y-1">
            <div className="text-4xl font-extrabold font-mono text-white flex items-baseline gap-1">
              {metrics.vibration_level} <span className="text-lg text-gray-500">mm/s</span>
            </div>
            <p className="text-[10px] text-gray-400 font-mono uppercase">LIMIT: 1.20 mm/s (RMS)</p>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-gray-900/60 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${metrics.vibration_level > 1.2 ? 'bg-cyber-yellow' : 'bg-cyber-green'}`}
                style={{ width: `${Math.min(100, (metrics.vibration_level / 6.0) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-gray-500">
              <span>0.0 mm/s</span>
              <span>6.0 mm/s</span>
            </div>
          </div>
        </div>

      </div>

      {/* AUXILIARY SENSORS SLIDERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Tire Pressure */}
        <div className="glass-card p-5 border-white/5 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-cyber-cyan text-sm">PSI</div>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Tire Pressure</div>
            <div className="text-xl font-bold font-mono text-white">{metrics.tire_pressure} PSI</div>
            <div className="text-[9px] text-gray-400 font-mono">Range: 30 - 35 PSI</div>
          </div>
        </div>

        {/* Fuel Level */}
        <div className="glass-card p-5 border-white/5 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-cyber-yellow text-sm">FUEL</div>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Fuel Level</div>
            <div className="text-xl font-bold font-mono text-white">{metrics.fuel_level}%</div>
            <div className="text-[9px] text-gray-400 font-mono">Tank Volume</div>
          </div>
        </div>

        {/* Engine RPM */}
        <div className="glass-card p-5 border-white/5 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-cyber-green text-sm">RPM</div>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Engine RPM</div>
            <div className="text-xl font-bold font-mono text-white">{metrics.engine_rpm}</div>
            <div className="text-[9px] text-gray-400 font-mono">Crankshaft Speed</div>
          </div>
        </div>

        {/* Ground Speed */}
        <div className="glass-card p-5 border-white/5 flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-purple-400 text-sm">SPD</div>
          <div className="flex-1 space-y-1">
            <div className="text-[10px] font-mono text-gray-500 uppercase">Vehicle Velocity</div>
            <div className="text-xl font-bold font-mono text-white">{metrics.speed} km/h</div>
            <div className="text-[9px] text-gray-400 font-mono">GPS Ground Tracker</div>
          </div>
        </div>

      </div>

      {/* AI RECOMMENDATIONS & HARDWARE LOGS CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: AI Diagnostics Panel (Left) */}
        <div className="glass-card p-6 border-white/5 lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-cyber-cyan animate-pulse" size={18} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Edge Cognitive AI Diagnostic Console</h3>
              </div>
              <span className="text-[9px] font-mono text-gray-500 uppercase">Telemetry Engine: active</span>
            </div>
            
            {/* Primary indicators row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Anomaly Type */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Anomaly Type</div>
                <div className="text-xs font-bold text-white font-mono truncate" title={metrics.diagnostics?.anomaly_type || 'System Nominal'}>
                  {metrics.diagnostics?.anomaly_type || 'System Nominal'}
                </div>
              </div>

              {/* Risk Level */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Risk Level</div>
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${
                    (metrics.diagnostics?.risk_level || 'Low Risk') === 'High Risk' ? 'bg-cyber-red animate-pulse' :
                    (metrics.diagnostics?.risk_level || 'Low Risk') === 'Medium Risk' ? 'bg-cyber-yellow' : 'bg-cyber-green'
                  }`}></span>
                  <span className={`text-xs font-bold font-mono uppercase ${
                    (metrics.diagnostics?.risk_level || 'Low Risk') === 'High Risk' ? 'text-cyber-red' :
                    (metrics.diagnostics?.risk_level || 'Low Risk') === 'Medium Risk' ? 'text-cyber-yellow' : 'text-cyber-green'
                  }`}>
                    {metrics.diagnostics?.risk_level || 'Low Risk'}
                  </span>
                </div>
              </div>

              {/* Urgency */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Urgency Level</div>
                <div className="text-xs font-bold text-white font-mono truncate">
                  {metrics.diagnostics?.urgency || 'Routine'}
                </div>
              </div>

              {/* Est. Failure Time */}
              <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1">
                <div className="text-[9px] font-mono text-gray-500 uppercase">Est. Failure Time</div>
                <div className="text-xs font-bold text-cyber-cyan font-mono truncate">
                  {metrics.diagnostics?.failure_timeline || 'N/A'}
                </div>
              </div>
            </div>

            {/* Explanations & Reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Explanation panel */}
              <div className="p-4 bg-black/50 border border-white/5 rounded-lg space-y-2">
                <div className="text-[9px] font-mono text-cyber-cyan uppercase">AI Reasoning & Diagnostics</div>
                <p className="text-gray-300 text-xs font-mono leading-relaxed h-[85px] overflow-y-auto scrollbar">
                  {metrics.diagnostics?.explanation || 'All operational parameters reside within stable limits.'}
                </p>
              </div>

              {/* Risks & Root cause */}
              <div className="p-4 bg-black/50 border border-white/5 rounded-lg space-y-2">
                <div className="text-[9px] font-mono text-cyber-red uppercase">Mission Risk & Root Cause</div>
                <div className="space-y-1 text-xs font-mono h-[85px] overflow-y-auto scrollbar">
                  <div className="text-gray-400">
                    <span className="text-cyber-yellow font-bold text-[10px]">ROOT:</span> {metrics.diagnostics?.root_cause || 'Operational parameters nominal.'}
                  </div>
                  <div className="text-gray-400 mt-1">
                    <span className="text-cyber-red font-bold text-[10px]">HAZARD:</span> {metrics.diagnostics?.real_world_risks || 'No severe failure modes active.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescribed Maintenance Actions */}
            <div className="space-y-1">
              <div className="text-[9px] font-mono text-cyber-green uppercase">Prescribed Repair Action</div>
              <div className="p-4 rounded-lg bg-cyber-green/5 border border-cyber-green/20 text-xs font-mono flex items-start gap-2.5 text-gray-300">
                <Wrench size={16} className="text-cyber-green shrink-0 mt-0.5" />
                <span>{metrics.diagnostics?.maintenance_action || 'No actions recommended. Next routine inspection in 5,000 miles.'}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 p-4 rounded-lg bg-black/20 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left w-full">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Diagnostics Logs Explorer</span>
              <p className="text-gray-400 text-[11px] leading-relaxed">Save the telemetry index log records as a diagnostic summary report.</p>
            </div>
            <a
              href="http://localhost:5000/api/report/download"
              download="fleet_health_report.txt"
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black font-extrabold uppercase text-xs tracking-wider px-5 py-3 rounded-lg hover:shadow-glow-cyan/40 transition-all shrink-0"
            >
              <Download size={14} /> Download Report
            </a>
          </div>
        </div>

        {/* Column 2: Edge AI Diagnostics Terminal Console (Right) */}
        <div className="glass-card p-6 border-white/5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Local Hardware Console</span>
            <span className="text-[10px] font-mono text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 px-2 py-0.5 rounded">STDOUT</span>
          </div>
          
          <div className="flex-1 bg-black/60 rounded-lg p-4 font-mono text-[10px] text-cyber-green space-y-2.5 overflow-y-auto mt-4 scrollbar">
            {consoleLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed border-b border-white/5 pb-1.5 opacity-90 hover:opacity-100 transition-opacity">
                {log}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MANUAL SENSOR INFERENCE PANEL */}
      <div className="glass-card p-6 border-white/5 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <Activity className="text-cyber-cyan animate-pulse" size={18} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Manual Sensor Simulation Console</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Controls */}
          <form onSubmit={handleManualInference} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Temp slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Engine Temperature (°C)</span>
                  <span className="text-cyber-cyan font-bold">{manualInput.engine_temperature} °C</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="140"
                  step="0.5"
                  value={manualInput.engine_temperature}
                  onChange={(e) => setManualInput({ ...manualInput, engine_temperature: parseFloat(e.target.value) })}
                  className="w-full accent-cyber-cyan cursor-pointer bg-gray-950 h-1 rounded"
                />
              </div>

              {/* Voltage slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Battery Charger (V)</span>
                  <span className="text-cyber-blue font-bold">{manualInput.battery_voltage} V</span>
                </div>
                <input
                  type="range"
                  min="8.0"
                  max="16.0"
                  step="0.1"
                  value={manualInput.battery_voltage}
                  onChange={(e) => setManualInput({ ...manualInput, battery_voltage: parseFloat(e.target.value) })}
                  className="w-full accent-cyber-blue cursor-pointer bg-gray-950 h-1 rounded"
                />
              </div>

              {/* Vibration slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Structural Vibration (mm/s)</span>
                  <span className="text-cyber-green font-bold">{manualInput.vibration_level} mm/s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="6.0"
                  step="0.05"
                  value={manualInput.vibration_level}
                  onChange={(e) => setManualInput({ ...manualInput, vibration_level: parseFloat(e.target.value) })}
                  className="w-full accent-cyber-green cursor-pointer bg-gray-950 h-1 rounded"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* RPM slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Engine RPM</span>
                  <span className="text-cyber-yellow font-bold">{manualInput.engine_rpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="50"
                  value={manualInput.engine_rpm}
                  onChange={(e) => setManualInput({ ...manualInput, engine_rpm: parseInt(e.target.value) })}
                  className="w-full accent-cyber-yellow cursor-pointer bg-gray-950 h-1 rounded"
                />
              </div>

              {/* Speed slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Ground Velocity (km/h)</span>
                  <span className="text-purple-400 font-bold">{manualInput.speed} km/h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="1"
                  value={manualInput.speed}
                  onChange={(e) => setManualInput({ ...manualInput, speed: parseFloat(e.target.value) })}
                  className="w-full accent-purple-400 cursor-pointer bg-gray-950 h-1 rounded"
                />
              </div>

              {/* Fuel slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Fuel Level (%)</span>
                  <span className="text-orange-400 font-bold">{manualInput.fuel_level} %</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={manualInput.fuel_level}
                  onChange={(e) => setManualInput({ ...manualInput, fuel_level: parseFloat(e.target.value) })}
                  className="w-full accent-orange-400 cursor-pointer bg-gray-955 h-1 rounded"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={manualLoading}
                className="w-full py-3 bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black font-extrabold uppercase tracking-wider text-xs rounded-lg hover:shadow-glow-cyan/35 transition-all cursor-pointer"
              >
                {manualLoading ? "Processing Edge AI Inference..." : "Submit Sensor Values to local AI Model"}
              </button>
            </div>
          </form>

          {/* Right Column: AI Analytics Outputs */}
          <div className="lg:col-span-1 p-5 rounded-xl bg-black/40 border border-white/5 space-y-4">
            <div className="text-xs font-bold text-cyber-cyan uppercase font-mono tracking-widest border-b border-white/5 pb-2">
              Inference Diagnostic Output
            </div>
            
            {manualResult ? (
              <div className="space-y-4 font-mono text-xs">
                {/* Health Score */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">HEALTH SCORE:</span>
                  <span className={`text-xl font-bold ${
                    manualResult.health_score >= 90 ? 'text-cyber-green' : manualResult.health_score >= 70 ? 'text-cyber-blue' : manualResult.health_score >= 40 ? 'text-cyber-yellow' : 'text-cyber-red'
                  }`}>{manualResult.health_score}%</span>
                </div>

                {/* Predicted Status */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">STATUS DIAGNOSIS:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    manualResult.anomaly_status === 'Critical' ? 'text-cyber-red border-cyber-red/30 bg-cyber-red/10' :
                    manualResult.anomaly_status === 'Warning' ? 'text-cyber-yellow border-cyber-yellow/30 bg-cyber-yellow/10' :
                    'text-cyber-green border-cyber-green/30 bg-cyber-green/10'
                  }`}>
                    {manualResult.anomaly_status}
                  </span>
                </div>

                {/* Risk Level */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span>AI RISK FACTOR:</span>
                    <span>{manualResult.ai_risk_score}%</span>
                  </div>
                  <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      manualResult.anomaly_status === 'Critical' ? 'bg-cyber-red' :
                      manualResult.anomaly_status === 'Warning' ? 'bg-cyber-yellow' : 'bg-cyber-green'
                    }`} style={{ width: `${manualResult.ai_risk_score}%` }}></div>
                  </div>
                </div>

                {/* Triggered Alerts / Anomaly Type */}
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 uppercase">Triggered Alerts:</div>
                  <div className="bg-black/50 p-2.5 rounded border border-white/5 max-h-[80px] overflow-y-auto space-y-1 scrollbar text-[10px] text-gray-300">
                    {manualResult.alerts.length > 0 ? (
                      manualResult.alerts.map((alt, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${alt.severity === 'Critical' ? 'bg-cyber-red' : 'bg-cyber-yellow'}`}></span>
                          <span>{alt.message}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No anomalies triggered. Sensor states are nominal.</div>
                    )}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 uppercase">AI Directives:</div>
                  <div className="bg-black/50 p-2.5 rounded border border-white/5 max-h-[80px] overflow-y-auto space-y-1 scrollbar text-[10px] text-cyber-cyan">
                    {manualResult.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-center text-xs text-gray-500 font-mono">
                Awaiting manual inputs. Adjust the sliders on the left and submit to verify AI classification thresholds.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDGE AI ASSISTANT CHATBOT PANEL */}
      <div className="glass-card p-6 border-white/5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Edge AI Chatbot Assistant</h3>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">
            Query local diagnostic parameters directly. Type questions to explain sensor outlier signatures, alternator charger states, or vehicle mechanical health index parameters.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={() => setChatInput("Run vehicle diagnostic status check")} className="text-[10px] font-mono bg-black/40 border border-white/10 hover:border-cyber-cyan text-gray-300 hover:text-cyber-cyan px-2.5 py-1.5 rounded transition-all">Health Check</button>
            <button onClick={() => setChatInput("Explain engine temperature warnings")} className="text-[10px] font-mono bg-black/40 border border-white/10 hover:border-cyber-cyan text-gray-300 hover:text-cyber-cyan px-2.5 py-1.5 rounded transition-all">Temp Diagnostic</button>
            <button onClick={() => setChatInput("Diagnose mechanical vibrations")} className="text-[10px] font-mono bg-black/40 border border-white/10 hover:border-cyber-cyan text-gray-300 hover:text-cyber-cyan px-2.5 py-1.5 rounded transition-all">Vibration Scan</button>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col h-[280px] bg-black/40 rounded-xl border border-white/5 overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-lg text-xs leading-relaxed font-mono ${
                  msg.sender === 'user'
                    ? 'bg-cyber-cyan/15 border border-cyber-cyan/20 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300'
                }`}>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest block mb-1">
                    {msg.sender === 'user' ? 'Operator' : 'Edge AI Core'}
                  </span>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask the diagnostics assistant..."
              className="flex-1 bg-black/80 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-cyber-cyan font-mono"
            />
            <button
              type="submit"
              className="p-2.5 bg-cyber-cyan text-black rounded-lg hover:shadow-glow-cyan/30 active:scale-95 transition-all"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
