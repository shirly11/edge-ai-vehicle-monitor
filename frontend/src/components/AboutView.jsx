import React from 'react';
import { Cpu, WifiOff, ShieldCheck, Database, HardDrive, Compass } from 'lucide-react';

export default function AboutView() {
  return (
    <div className="min-h-screen cyber-grid relative py-12 px-4 sm:px-6 lg:px-8">
      {/* Background glow */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-cyber-green/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10 px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-green to-white glitch-text">
            Edge AI Systems Architecture
          </h2>
          <p className="text-gray-400 text-sm uppercase tracking-widest mt-2">
            Local Intelligence for On-Board Vehicle Diagnostics
          </p>
        </div>

        {/* Conceptual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: What is Edge AI */}
          <div className="glass-card p-8 border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-cyber-green">
              <Cpu size={24} />
              <h3 className="text-lg font-bold uppercase tracking-wider">The Edge AI Concept</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Traditionally, machine learning algorithms are executed on centralized cloud clusters, requiring continuous transmission of high-frequency sensor readings. **Edge AI** shifts this computation directly onto on-board vehicle microcontrollers.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              By hosting and executing models locally, the vehicle performs real-time calculations without cloud reliance, ensuring millisecond-level reaction times to electrical or mechanical alerts.
            </p>
          </div>

          {/* Card 2: Offline Resilience */}
          <div className="glass-card p-8 border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-cyber-cyan">
              <WifiOff size={24} />
              <h3 className="text-lg font-bold uppercase tracking-wider">Benefits of Offline AI</h3>
            </div>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan font-bold">•</span>
                <span>**Zero Network Latency**: Diagnoses can be made instantly, triggering alerts within milliseconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan font-bold">•</span>
                <span>**Guaranteed Reliability**: Operates seamlessly in deep tunnels, remote mines, or offshore logistics routes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan font-bold">•</span>
                <span>**Maximum Privacy & Security**: Telemetry data does not leave the vehicle's sandboxed hardware bus.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyber-cyan font-bold">•</span>
                <span>**Reduced Bandwidth**: Eliminates the expense of streaming gigabytes of raw sensor data over cellular networks.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Predictive Maintenance */}
          <div className="glass-card p-8 border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-cyber-yellow">
              <ShieldCheck size={24} />
              <h3 className="text-lg font-bold uppercase tracking-wider">Predictive Maintenance</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Reactive maintenance waits for parts to break, resulting in costly breakdowns and vehicle downtime. Preventive maintenance schedules regular checkups, which is costly and often unnecessary.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              **Predictive Maintenance** utilizes sensor cross-correlations (e.g. tracking RPM and structural vibration simultaneously) to identify signs of degradation. This allows parts to be serviced right before they fail.
            </p>
          </div>

          {/* Card 4: Industrial Applications */}
          <div className="glass-card p-8 border-white/5 space-y-4">
            <div className="flex items-center gap-3 text-cyber-red">
              <Compass size={24} />
              <h3 className="text-lg font-bold uppercase tracking-wider">Industrial Applications</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Edge AI vehicle monitoring is currently deployed across several heavy industries:
            </p>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><strong>• Mining & Heavy Equipment</strong>: Haul trucks running continuously in deep pits where satellite communication is unavailable.</li>
              <li><strong>• Railway Telemetry</strong>: High-speed trains predicting bearing wear and axle vibrations.</li>
              <li><strong>• Autonomous Drone Fleets</strong>: Drones detecting rotor anomalies and battery cells decay mid-flight.</li>
              <li><strong>• Fleet Management (F1)</strong>: Real-time telemetry computing racecar component degradation.</li>
            </ul>
          </div>
        </div>

        {/* Hardware Architecture Banner */}
        <div className="glass-card p-8 border-cyber-green/20 bg-black/40 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-cyber-green/10 text-cyber-green rounded-xl shrink-0">
            <HardDrive size={36} />
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-bold text-white uppercase tracking-wider">Local Hardware Sandboxing</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              The on-board Isolation Forest model is optimized to run with low memory and CPU overhead. By analyzing sliding window metrics, it detects anomalies without consuming valuable processing resources.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
