import React from 'react';
import { Radio, Database, Cpu, Search, LayoutDashboard, BellRing } from 'lucide-react';

export default function ArchitectureView() {
  const steps = [
    {
      icon: <Radio className="text-cyber-cyan" size={28} />,
      title: "1. Vehicle Sensors",
      desc: "Engine thermocouples, battery voltmeters, vibration sensors, tire transceivers, and RPM tachometers read physical properties continuously.",
      stats: "CAN-bus / OBD-II telemetry"
    },
    {
      icon: <Database className="text-cyber-blue" size={28} />,
      title: "2. Data Collection",
      desc: "Raw metrics are compiled by on-board gateways, smoothing out signal jitter and formatting telemetry parameters into JSON records.",
      stats: "10Hz Local Compiling"
    },
    {
      icon: <Cpu className="text-cyber-green" size={28} />,
      title: "3. Edge AI Processing",
      desc: "Data is fed into the local machine learning engine. The pipeline processes multivariate correlations (e.g. RPM matching temperature spikes).",
      stats: "Sandboxed CPU Core"
    },
    {
      icon: <Search className="text-cyber-yellow" size={28} />,
      title: "4. Anomaly Detection",
      desc: "The Isolation Forest algorithm analyzes sensor feature vectors to calculate anomaly outlier scores, detecting multi-sensor faults.",
      stats: "Isolation Forest Model"
    },
    {
      icon: <LayoutDashboard className="text-purple-400" size={28} />,
      title: "5. Dashboard Analytics",
      desc: "Inference results, sensor stats, and health scores are pushed to the telemetry dashboard, updating visual gauges and trends.",
      stats: "Zero-latency React UI"
    },
    {
      icon: <BellRing className="text-cyber-red" size={28} />,
      title: "6. Predictive Alerts",
      desc: "If faults are detected, voice synthesizer notifications are triggered, critical status overrides occur, and repair steps are shown.",
      stats: "Active Warning System"
    }
  ];

  return (
    <div className="min-h-screen cyber-grid relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background neon flares */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-cyber-red/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-cyan to-white glitch-text">
            System Data Workflow
          </h2>
          <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">
            Sensor to Dashboard Analytics Architecture
          </p>
        </div>

        {/* Visual Map Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="glass-card p-6 border-white/5 flex flex-col justify-between hover:scale-[1.02] relative group">
              {/* Index counter */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-black/80 border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-cyber-cyan group-hover:border-cyber-cyan transition-colors shadow-inner">
                {idx + 1}
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-white/5 w-fit rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 text-[10px] font-mono text-gray-500 flex justify-between uppercase">
                <span>Metric Layer:</span>
                <span className="text-cyber-cyan">{step.stats}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Flow Connector Line SVG visual for big screens */}
        <div className="hidden lg:block glass-card p-6 border-white/5 text-center">
          <div className="flex items-center justify-between text-xs font-mono text-gray-500 uppercase px-4">
            <span>Sensor Readings</span>
            <span>➔</span>
            <span>Local Buffering</span>
            <span>➔</span>
            <span>AI Decision</span>
            <span>➔</span>
            <span>Telemetry GUI</span>
            <span>➔</span>
            <span>Alerts & Actions</span>
          </div>
          <div className="w-full bg-gray-900/50 h-1.5 rounded-full mt-4 overflow-hidden relative border border-white/5">
            <div className="telemetry-stream-bar h-full w-full"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
