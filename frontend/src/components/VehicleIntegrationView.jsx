import React, { useState, useEffect, useRef } from 'react';
import {
  Car,
  Cpu,
  Wifi,
  Radio,
  Zap,
  Activity,
  CheckCircle2,
  Wrench,
  Bot,
  Settings,
  Layers,
  Database,
  Network,
  ShieldCheck,
  Signal,
  Flame,
  Gauge,
  Thermometer,
  RotateCcw,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Sliders,
  ChevronRight,
  ChevronDown,
  Info,
  Server,
  Terminal,
  Play
} from 'lucide-react';

export default function VehicleIntegrationView() {
  const [selectedMode, setSelectedMode] = useState('obd2'); // 'simulation', 'obd2', 'canbus', 'iot'
  const [telemetry, setTelemetry] = useState({
    engine_temperature: 92.4,
    rpm: 2450,
    battery_voltage: 14.05,
    fuel_level: 78.4,
    speed: 82.5,
    coolant_level: 89.2,
    tire_pressure: 32.8,
    vibration_level: 0.72
  });

  const [aiStats, setAiStats] = useState({
    confidence: 98.65,
    probability: 1.84,
    latency: 0.125
  });

  const [packetsPerSec, setPacketsPerSec] = useState(85);
  const [consoleLogs, setConsoleLogs] = useState([
    "[SYSTEM] Real-world vehicle integration module online.",
    "[SYSTEM] Awaiting diagnostic interface link..."
  ]);

  const consoleRef = useRef(null);

  // Scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Telemetry updates loop
  useEffect(() => {
    let logCounter = 1;
    const interval = setInterval(() => {
      // Fluctuations based on selected mode
      setTelemetry(prev => {
        const rpmNoise = selectedMode === 'simulation' ? 8 : 70;
        const speedNoise = selectedMode === 'simulation' ? 0.2 : 1.5;
        let baseRpm = prev.rpm;
        let baseSpeed = prev.speed;

        if (selectedMode === 'canbus') {
          baseRpm = 2300 + Math.sin(Date.now() / 8000) * 800;
          baseSpeed = 95 + Math.cos(Date.now() / 12000) * 15;
        } else if (selectedMode === 'iot') {
          baseRpm = 1800 + Math.cos(Date.now() / 10000) * 300;
          baseSpeed = 65 + Math.sin(Date.now() / 9000) * 8;
        } else if (selectedMode === 'simulation') {
          baseRpm = 2450 + Math.sin(Date.now() / 4000) * 30;
          baseSpeed = 82 + Math.sin(Date.now() / 7000) * 1.5;
        } else {
          // OBD-II mode
          baseRpm = baseRpm + (Math.random() - 0.5) * rpmNoise;
          baseSpeed = baseSpeed + (Math.random() - 0.5) * speedNoise;
          if (baseRpm < 1600) baseRpm = 2000;
          if (baseRpm > 4000) baseRpm = 2800;
          if (baseSpeed < 45) baseSpeed = 70;
          if (baseSpeed > 130) baseSpeed = 90;
        }

        return {
          engine_temperature: Number((91.5 + Math.sin(Date.now() / 25000) * 3 + (Math.random() - 0.5) * 0.2).toFixed(1)),
          rpm: Math.round(baseRpm),
          battery_voltage: Number((13.9 + Math.sin(Date.now() / 4000) * 0.3).toFixed(2)),
          fuel_level: Number((prev.fuel_level - 0.001).toFixed(3)),
          speed: Number((baseSpeed).toFixed(1)),
          coolant_level: Number((88.5 + Math.sin(Date.now() / 7000) * 1.2).toFixed(1)),
          tire_pressure: Number((32.8 + Math.cos(Date.now() / 15000) * 0.4).toFixed(1)),
          vibration_level: Number((0.68 + (Math.random() - 0.5) * 0.04 + (baseRpm > 3200 ? 0.35 : 0)).toFixed(2))
        };
      });

      // Fluctuate latency and packet rates
      setAiStats({
        confidence: Number((98.5 + Math.random() * 1.0).toFixed(2)),
        probability: Number((1.1 + Math.random() * 0.8).toFixed(2)),
        latency: Number((0.11 + Math.random() * 0.03).toFixed(3))
      });

      setPacketsPerSec(Math.round(80 + Math.random() * 12));

      // Append logs
      const timestamp = new Date().toLocaleTimeString();
      let logMsg = '';
      if (selectedMode === 'simulation') {
        logMsg = `[SIMULATION] Reading dataset record sequence #${logCounter} - Checksum: OK`;
      } else if (selectedMode === 'obd2') {
        const obdCommands = [
          `[OBD-II] Polling PID 01 0C (Engine RPM) ➔ Result: ${telemetry.rpm} RPM`,
          `[OBD-II] Polling PID 01 0D (Chassis Speed) ➔ Result: ${telemetry.speed} km/h`,
          `[OBD-II] Bluetooth serial connection COM3 stable. Latency: 14ms.`,
          `[OBD-II] TX ➔ 01 05 | RX ➔ 41 05 ${(Math.round(telemetry.engine_temperature + 40)).toString(16).toUpperCase()}`
        ];
        logMsg = obdCommands[Math.floor(Math.random() * obdCommands.length)];
      } else if (selectedMode === 'canbus') {
        const canFrames = [
          `[CAN] Inbound ISO-15765-4 Frame ID: 0x18FEE000 Data: F5 A0 12 CC FF FF FF FF`,
          `[CAN] Engine Controller broadcast received: ID 0x0CF00400 (Active)`,
          `[CAN] Bus transceiver state: ACTIVE. Bus load: 36.4%`,
          `[CAN] Rx packet size: 64 bytes. Zero frames dropped.`
        ];
        logMsg = canFrames[Math.floor(Math.random() * canFrames.length)];
      } else if (selectedMode === 'iot') {
        const iotMsgs = [
          `[ESP32] Telemetry payload packet streamed successfully via UDP to port 5555.`,
          `[ESP32] Client connection active. RSSI: -65dBm. SSID: VehiLink_Edge`,
          `[ESP32] Broadcast JSON: {"temp":${telemetry.engine_temperature},"rpm":${telemetry.rpm},"vib":${telemetry.vibration_level}}`,
          `[ESP32] Sensor validation task completed. Heap: 194KB free.`
        ];
        logMsg = iotMsgs[Math.floor(Math.random() * iotMsgs.length)];
      }

      setConsoleLogs(prev => [...prev.slice(-20), `[${timestamp}] ${logMsg}`]);
      logCounter++;
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedMode, telemetry]);

  // Edge AI data pipeline stages
  const pipelineStages = [
    { title: "Vehicle Sensors", desc: "Monitors engine heat, TPMS, raw chassis vibration, and alternator volts.", icon: <Flame size={18} /> },
    { title: "OBD-II / CAN Bus", desc: "Transmits packets over vehicle network gateways to diagnostic ports.", icon: <Layers size={18} /> },
    { title: "Flask Backend", desc: "Ingests raw telemetry frames via fast microservices APIs.", icon: <Server size={18} /> },
    { title: "Edge AI Inference", desc: "Triggers on-device Isolation Forest scoring matrix processes.", icon: <Cpu size={18} /> },
    { title: "Anomaly Detection", desc: "Flags multi-sensor outliers and measures structural stress anomalies.", icon: <Activity size={18} /> },
    { title: "Predictive Dashboard", desc: "Displays health metrics, logs, and triggers warning synthesizers.", icon: <CheckCircle2 size={18} /> }
  ];

  // Hardware module profiles
  const hardwareProfiles = [
    {
      name: "ELM327 OBD-II Adapter",
      desc: "Interoperable WiFi/Bluetooth OBD-II transceiver parsing J1979 PIDs. Fits standard passenger vehicle ports.",
      compat: "Plug & Play",
      wireless: "BLE 5.0 / WiFi 2.4G",
      latency: "12 - 15ms",
      icon: <Car className="text-cyber-cyan" size={20} />
    },
    {
      name: "MCP2515 CAN Adapter",
      desc: "Industrial SPI-to-CAN transceiver reading raw J1939 broadcast frames up to 1Mbps. Used for fleet wiring harnesses.",
      compat: "Fully Ready",
      wireless: "Wired SPI Bus",
      latency: "1 - 3ms",
      icon: <Network className="text-cyber-green" size={20} />
    },
    {
      name: "ESP32 Telemetry Node",
      desc: "Low-power microcontroller streaming custom battery and voltage telemetry over UDP/MQTT sockets.",
      compat: "Compatible",
      wireless: "WiFi 4 / Bluetooth 4.2",
      latency: "15 - 20ms",
      icon: <Radio className="text-purple-400" size={20} />
    },
    {
      name: "Raspberry Pi Edge Gateway",
      desc: "Single-board ARM controller processing Isolation Forest scores locally and hosting Flask analytics.",
      compat: "Recommended Host",
      wireless: "WiFi 5 / Dual-BLE 5.0",
      latency: "4 - 8ms",
      icon: <Cpu className="text-cyber-yellow" size={20} />
    }
  ];

  return (
    <div className="min-h-screen cyber-grid relative py-10 bg-[#030712]">
      {/* Inline styles for flows */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-cyan {
          0%, 100% { filter: drop-shadow(0 0 2px var(--cyber-cyan)); opacity: 0.7; }
          50% { filter: drop-shadow(0 0 10px var(--cyber-cyan)); opacity: 1; }
        }
        .flow-glow {
          animation: pulse-cyan 2s infinite ease-in-out;
        }
      `}} />

      {/* Decorative neon background ambient glows */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-cyber-green/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10 w-full">
        
        {/* PAGE HEADER */}
        <div className="text-center md:text-left border-b border-white/5 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-cyber-cyan tracking-widest uppercase bg-cyber-cyan/10 border border-cyber-cyan/30 px-3 py-1 rounded-full">
                AUTOMOTIVE CONNECTIVITY LAYER
              </span>
              <h2 className="text-3xl font-black uppercase tracking-wider text-white mt-3 font-sans glitch-text">
                Real-World Vehicle Integration
              </h2>
              <p className="text-gray-400 text-xs uppercase tracking-widest mt-1 font-mono">
                Connect live vehicles via OBD-II, CAN Bus interfaces, or IoT Edge microcontrollers
              </p>
            </div>
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-mono">
              <span className="h-2.5 w-2.5 rounded-full bg-cyber-green animate-pulse"></span>
              <span className="text-gray-400 uppercase">STREAM TARGET:</span>
              <span className="text-white font-bold uppercase">
                {selectedMode === 'simulation' ? 'SIMULATOR' : selectedMode}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION D: REAL-TIME TELEMETRY STATUS (Top grid dashboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="glass-card p-4 border-white/5 space-y-1 hover:border-cyber-cyan/35 transition-all">
            <span className="text-[8px] font-mono text-gray-500 uppercase block">Telemetry Stream</span>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyber-green animate-ping"></span>
              <span className="text-sm font-bold text-white uppercase font-sans">
                {selectedMode === 'simulation' ? 'SIMULATION ACTIVE' : 'LIVE VEHICLE'}
              </span>
            </div>
          </div>

          <div className="glass-card p-4 border-white/5 space-y-1 hover:border-cyber-cyan/35 transition-all">
            <span className="text-[8px] font-mono text-gray-500 uppercase block">OBD-II Packet Latency</span>
            <div className="text-sm font-bold text-cyber-cyan font-mono">
              {selectedMode === 'simulation' ? '0ms (Cached)' : '14 ms'}
            </div>
          </div>

          <div className="glass-card p-4 border-white/5 space-y-1 hover:border-cyber-cyan/35 transition-all">
            <span className="text-[8px] font-mono text-gray-500 uppercase block">Inbound Packets Rate</span>
            <div className="text-sm font-bold text-cyber-green font-mono">
              {selectedMode === 'simulation' ? '0 pkts/sec' : `${packetsPerSec} pkts/sec`}
            </div>
          </div>

          <div className="glass-card p-4 border-white/5 space-y-1 hover:border-cyber-cyan/35 transition-all">
            <span className="text-[8px] font-mono text-gray-500 uppercase block">Active ECUs / Gateways</span>
            <div className="text-sm font-bold text-white font-mono">
              {selectedMode === 'simulation' ? '1 Module' : '3 Modules (Active)'}
            </div>
          </div>

          <div className="glass-card p-4 border-white/5 space-y-1 hover:border-cyber-cyan/35 transition-all">
            <span className="text-[8px] font-mono text-gray-500 uppercase block">Inference Process Time</span>
            <div className="text-sm font-bold text-cyber-yellow font-mono">
              {aiStats.latency} ms
            </div>
          </div>

        </div>

        {/* SECTION A: VEHICLE CONNECTIVITY MODES */}
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Sliders className="text-cyber-cyan" size={18} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Vehicle Connectivity Modes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Simulation Mode */}
            <div 
              onClick={() => setSelectedMode('simulation')}
              className={`p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                selectedMode === 'simulation' 
                  ? 'bg-cyber-cyan/5 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.08)]' 
                  : 'bg-black/40 border-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 bg-white/5 rounded-lg border ${selectedMode === 'simulation' ? 'border-cyber-cyan text-cyber-cyan' : 'border-white/10 text-gray-400'}`}>
                    <Database size={16} />
                  </div>
                  {/* Cyber Toggle */}
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${selectedMode === 'simulation' ? 'bg-cyber-cyan' : 'bg-gray-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-black transition-transform ${selectedMode === 'simulation' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  Simulation Mode
                </h4>
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                  Run algorithm validation using filesystem telemetry datasets.
                </p>
              </div>
              <span className="text-[8px] font-mono text-gray-500 uppercase mt-4 block border-t border-white/5 pt-2">
                TARGET: LOCAL_DATASET
              </span>
            </div>

            {/* OBD-II Mode */}
            <div 
              onClick={() => setSelectedMode('obd2')}
              className={`p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                selectedMode === 'obd2' 
                  ? 'bg-cyber-cyan/5 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.08)]' 
                  : 'bg-black/40 border-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 bg-white/5 rounded-lg border ${selectedMode === 'obd2' ? 'border-cyber-cyan text-cyber-cyan' : 'border-white/10 text-gray-400'}`}>
                    <Car size={16} />
                  </div>
                  {/* Cyber Toggle */}
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${selectedMode === 'obd2' ? 'bg-cyber-cyan' : 'bg-gray-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-black transition-transform ${selectedMode === 'obd2' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  OBD-II Real Vehicle Mode
                </h4>
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                  Connect over Bluetooth serial links to read standard OBD-II diagnostic PIDs.
                </p>
              </div>
              <span className="text-[8px] font-mono text-gray-500 uppercase mt-4 block border-t border-white/5 pt-2">
                TARGET: BLE_ELM327
              </span>
            </div>

            {/* CAN Bus Monitoring */}
            <div 
              onClick={() => setSelectedMode('canbus')}
              className={`p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                selectedMode === 'canbus' 
                  ? 'bg-cyber-cyan/5 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.08)]' 
                  : 'bg-black/40 border-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 bg-white/5 rounded-lg border ${selectedMode === 'canbus' ? 'border-cyber-cyan text-cyber-cyan' : 'border-white/10 text-gray-400'}`}>
                    <Network size={16} />
                  </div>
                  {/* Cyber Toggle */}
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${selectedMode === 'canbus' ? 'bg-cyber-cyan' : 'bg-gray-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-black transition-transform ${selectedMode === 'canbus' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  CAN Bus Fleet Monitoring
                </h4>
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                  Parse raw J1939 broadcast frames directly from high-speed CAN networks.
                </p>
              </div>
              <span className="text-[8px] font-mono text-gray-500 uppercase mt-4 block border-t border-white/5 pt-2">
                TARGET: CAN_MCP2515
              </span>
            </div>

            {/* IoT Sensor Gateway */}
            <div 
              onClick={() => setSelectedMode('iot')}
              className={`p-5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                selectedMode === 'iot' 
                  ? 'bg-cyber-cyan/5 border-cyber-cyan shadow-[0_0_15px_rgba(0,240,255,0.08)]' 
                  : 'bg-black/40 border-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2 bg-white/5 rounded-lg border ${selectedMode === 'iot' ? 'border-cyber-cyan text-cyber-cyan' : 'border-white/10 text-gray-400'}`}>
                    <Wifi size={16} />
                  </div>
                  {/* Cyber Toggle */}
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${selectedMode === 'iot' ? 'bg-cyber-cyan' : 'bg-gray-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-black transition-transform ${selectedMode === 'iot' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  IoT Sensor Gateway
                </h4>
                <p className="text-[10px] text-gray-400 font-mono leading-relaxed">
                  Receive battery, thermal, and sensor readings streamed over MQTT/UDP gateway networks.
                </p>
              </div>
              <span className="text-[8px] font-mono text-gray-500 uppercase mt-4 block border-t border-white/5 pt-2">
                TARGET: UDP_ESP32
              </span>
            </div>

          </div>
        </div>

        {/* SECTION C: EDGE AI DATA PIPELINE (100% Responsive Grid with vertical stacking on smaller viewports) */}
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Network className="text-cyber-cyan animate-pulse" size={18} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Edge AI Telemetry Data Pipeline
              </h3>
            </div>
            <span className="text-[9px] font-mono text-cyber-cyan uppercase bg-cyber-cyan/10 border border-cyber-cyan/20 px-2 py-0.5 rounded">
              Local Inference Flow
            </span>
          </div>

          {/* Grid Layout representing the pipeline stage wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative">
            {pipelineStages.map((stage, idx) => (
              <div key={idx} className="flex flex-col md:flex-row lg:flex-col items-center gap-4 relative">
                {/* Stage Card */}
                <div className="w-full bg-black/60 border border-white/10 rounded-xl p-4 flex flex-col justify-between items-center text-center min-h-[140px] hover:border-cyber-cyan/40 transition-colors group">
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-gray-400 group-hover:text-cyber-cyan transition-all duration-300">
                    {stage.icon}
                  </div>
                  <h4 className="text-xs font-bold text-white mt-3 uppercase tracking-wider font-sans line-clamp-1">
                    {stage.title}
                  </h4>
                  <p className="text-[9px] text-gray-500 mt-1 uppercase font-mono leading-relaxed line-clamp-2">
                    {stage.desc}
                  </p>
                </div>

                {/* Animated Arrow Connector (Down on mobile/tablet, Right on desktop) */}
                {idx < 5 && (
                  <div className="text-cyber-cyan/40 flow-glow shrink-0 flex items-center justify-center lg:absolute lg:top-1/2 lg:-right-4 lg:-translate-y-1/2 lg:translate-x-1.5 z-20">
                    <ChevronRight className="hidden lg:block shrink-0" size={16} />
                    <ChevronDown className="lg:hidden shrink-0" size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* OBD-II LIVE VEHICLE STREAM CONSOLE & LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Live Telemetry metrics display */}
          <div className="lg:col-span-2 glass-card p-6 border-white/5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="text-cyber-cyan" size={18} />
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    OBD-II Live Telemetry Stream
                  </h4>
                </div>
                <span className="text-[9px] font-mono text-gray-500 uppercase">
                  Connected via {selectedMode === 'simulation' ? 'Cached Database' : 'BLE Gateway'}
                </span>
              </div>

              {/* Status List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 bg-black/40 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-gray-300 uppercase">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                  <span>Vehicle Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                  <span>ECU Gateway Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-green animate-pulse"></span>
                  <span>CAN Bus online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                  <span>Edge AI scoring</span>
                </div>
              </div>

              {/* Parameter Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-1 hover:border-cyber-cyan/20 transition-all">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block">Engine RPM</span>
                  <div className="text-lg font-black font-mono text-white">
                    {telemetry.rpm.toLocaleString()} <span className="text-[9px] font-normal text-gray-400">RPM</span>
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-1 hover:border-cyber-cyan/20 transition-all">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block">Ground Speed</span>
                  <div className="text-lg font-black font-mono text-white">
                    {telemetry.speed} <span className="text-[9px] font-normal text-gray-400">km/h</span>
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-1 hover:border-cyber-cyan/20 transition-all">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block">Coolant Temp</span>
                  <div className="text-lg font-black font-mono text-white">
                    {telemetry.engine_temperature} <span className="text-[9px] font-normal text-gray-400">°C</span>
                  </div>
                </div>

                <div className="p-4 bg-black/50 border border-white/5 rounded-xl space-y-1 hover:border-cyber-cyan/20 transition-all">
                  <span className="text-[8px] font-mono text-gray-500 uppercase block">Battery Volt</span>
                  <div className="text-lg font-black font-mono text-white">
                    {telemetry.battery_voltage} <span className="text-[9px] font-normal text-gray-400">V</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Custom Log Terminal Wrapper */}
            <div className="bg-black/90 rounded-xl border border-white/5 p-4 flex flex-col justify-between h-[150px] relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5 bg-black z-10">
                <span className="text-[9px] font-mono text-cyber-cyan font-bold uppercase tracking-widest flex items-center gap-1">
                  <Terminal size={10} /> Live Diagnostic Socket Stream
                </span>
                <span className="text-[8px] font-mono text-gray-500">Baud: 500K</span>
              </div>
              <div ref={consoleRef} className="flex-1 overflow-y-auto font-mono text-[9px] text-cyber-green space-y-1 py-2 scrollbar select-none z-10">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="opacity-80 hover:opacity-100 transition-opacity">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Holographic Explanation & AI Confidence */}
          <div className="space-y-6">
            
            {/* AI assistant explanations */}
            <div className="glass-card p-6 border-cyber-cyan/25 bg-cyber-cyan/5 shadow-[0_0_15px_rgba(0,240,255,0.03)] relative overflow-hidden space-y-4">
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,240,255,0.06)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
              
              <div className="flex items-center gap-3 border-b border-cyber-cyan/15 pb-3">
                <div className="p-2 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-lg text-cyber-cyan">
                  <Bot size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                    Edge Pilot Assistant
                  </h4>
                  <span className="text-[8px] font-mono text-cyber-cyan uppercase">Model: ISOLATION_FOREST_V2</span>
                </div>
              </div>

              <p className="font-mono text-[10px] text-gray-300 leading-relaxed">
                "This system currently uses simulated telemetry streams for prototype validation. In production deployment, the platform can integrate directly with real vehicle ECUs, CAN Bus systems, OBD-II interfaces, and IoT edge devices for real-time predictive diagnostics."
              </p>
            </div>

            {/* AI Diagnostics details */}
            <div className="glass-card p-6 border-white/5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                Edge AI Diagnostics Model Stats
              </h4>
              <div className="space-y-2.5 font-mono text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">AI MODEL CONFIDENCE:</span>
                  <span className="text-cyber-green font-bold">{aiStats.confidence}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ANOMALY OUTLIER SCORE:</span>
                  <span className="text-cyber-red font-bold">{aiStats.probability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">EDGE COMPUTE LATENCY:</span>
                  <span className="text-cyber-cyan font-bold">{aiStats.latency} ms</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SECTION B: AUTOMOTIVE HARDWARE SUPPORT */}
        <div className="glass-card p-6 border-white/5 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="text-cyber-cyan animate-pulse" size={18} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Supported Automotive Hardware Modules
              </h3>
            </div>
            <span className="text-[8px] font-mono text-gray-500 uppercase">
              Harness compatibility: 100%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hardwareProfiles.map((hw, idx) => (
              <div 
                key={idx}
                className="bg-black/45 border border-white/5 hover:border-cyber-cyan/20 rounded-xl p-5 flex flex-col justify-between transition-colors relative group overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-full w-[2px] bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/5 border border-white/10 rounded-lg">
                      {hw.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">{hw.name}</h4>
                      <span className="text-[8px] font-mono text-cyber-cyan uppercase">{hw.wireless}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono leading-relaxed">{hw.desc}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[8px] font-mono text-gray-500 uppercase">
                  <div>
                    <span>COMPAT:</span>
                    <span className="text-cyber-green block font-bold">{hw.compat}</span>
                  </div>
                  <div>
                    <span>LATENCY:</span>
                    <span className="text-white block font-bold">{hw.latency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
