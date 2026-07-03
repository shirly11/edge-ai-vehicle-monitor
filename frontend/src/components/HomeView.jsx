import React from 'react';
import { Gauge, Shield, Cpu, Activity, ArrowRight, Server, Zap } from 'lucide-react';

export default function HomeView({ onStartMonitoring }) {
  return (
    <div className="min-h-screen cyber-grid relative w-full overflow-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Background neon flares */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-cyber-green/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-16 px-4 sm:px-6 lg:px-8">
        
        {/* Banner Section */}
        <div className="glass-card border-cyber-cyan/20 overflow-hidden relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-glow-cyan/5">
          <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-cyber-cyan/30 rounded-tr-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-cyber-cyan/30 rounded-bl-2xl"></div>
          
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 text-xs font-semibold uppercase tracking-widest">
              <Zap size={14} className="animate-bounce" /> Edge AI Engine Active
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Edge AI Vehicle <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan to-cyber-green glitch-text">
                Health Monitoring
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
              An advanced, real-time diagnostic suite running on-device machine learning models to detect hardware anomalies, calculate remaining useful life, and recommend predictive maintenance.
            </p>
            <div className="pt-4">
              <button
                onClick={onStartMonitoring}
                className="inline-flex items-center gap-2 bg-cyber-cyan hover:bg-cyber-cyan/90 text-black font-extrabold uppercase tracking-wider px-8 py-4 rounded-lg hover:shadow-glow-cyan/40 active:scale-95 transition-all text-sm group"
              >
                Start Telemetry Stream
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
          
          {/* Animated Graphic Frame */}
          <div className="w-full md:w-80 h-48 md:h-64 rounded-xl border border-white/10 bg-black/50 p-6 flex flex-col justify-between relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyber-cyan/10 via-transparent to-transparent"></div>
            
            <div className="flex justify-between items-center text-xs text-cyber-cyan">
              <span className="uppercase tracking-widest font-mono">SYS.STATUS: LOGGING</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
              </span>
            </div>
            
            <div className="flex flex-col gap-2 font-mono">
              <div className="text-2xl font-bold text-white flex items-baseline gap-1">
                98.4 <span className="text-xs text-gray-500">%</span>
              </div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Overall Fleet Health Index</div>
              <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyber-green to-cyber-cyan h-full w-[98.4%]"></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-4 border-t border-white/5">
              <div>VIB: 0.78 mm/s</div>
              <div>TEMP: 90.6 °C</div>
              <div>BATT: 14.1 V</div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="p-3 bg-cyber-cyan/10 text-cyber-cyan w-fit rounded-lg border border-cyber-cyan/20">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Unsupervised Anomaly Detection</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Utilizes an Isolation Forest machine learning model trained on multi-sensor telemetry to flag complex fault patterns before physical failure occurs.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="p-3 bg-cyber-green/10 text-cyber-green w-fit rounded-lg border border-cyber-green/20">
              <Gauge size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Zero-Latency Edge Execution</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Designed for sandboxed industrial vehicle controllers to run diagnostics offline, eliminating dependencies on cloud networks or external APIs.
            </p>
          </div>

          <div className="glass-card p-6 flex flex-col gap-4">
            <div className="p-3 bg-cyber-red/10 text-cyber-red w-fit rounded-lg border border-cyber-red/20">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">Predictive Actions</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Instantly converts anomalies into diagnostic directives, suggesting repairs, tracking voltage fluctuations, and alerting operators.
            </p>
          </div>
        </div>

        {/* Technical Stack Description Section */}
        <div className="glass-card p-8 border-white/5 bg-black/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Industrial IoT Architecture</h3>
              <p className="text-gray-400 text-sm max-w-2xl">
                Combining high-frequency vehicle CAN-bus data processing with local AI models. The system models cross-channel correlations between RPM, engine vibration, battery charging cycles, and fluid coolant levels.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-cyber-cyan bg-black/40 border border-white/5 px-4 py-3 rounded-lg">
              <Server size={16} /> Local Flask Server
              <span className="text-gray-600">|</span>
              <Activity size={16} /> React UI
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
