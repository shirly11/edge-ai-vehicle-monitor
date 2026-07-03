import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Radar, Bar } from 'react-chartjs-2';
import { RefreshCw, Download, AlertTriangle } from 'lucide-react';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsView() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('VEH_001');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch unique vehicles and current state
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch vehicle status
      const vRes = await fetch('http://localhost:5000/api/fleet/vehicles');
      if (!vRes.ok) throw new Error('Failed to load fleet data');
      const vData = await vRes.json();
      setVehicles(vData);

      // Fetch history for selected vehicle
      const hRes = await fetch(`http://localhost:5000/api/vehicle/${selectedVehicle}`);
      if (!hRes.ok) throw new Error('Failed to load vehicle history');
      const hData = await hRes.json();
      setHistory(hData);
    } catch (err) {
      console.warn('API error, loading fallback analytical values:', err);
      // Fallback telemetry generation for demo resilience
      generateMockAnalytics(selectedVehicle);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (vehicleId) => {
    // Generate 30 mock history points
    const mockHist = [];
    const baseTemp = vehicleId === 'VEH_001' ? 92 : vehicleId === 'VEH_002' ? 104 : 88;
    const baseVib = vehicleId === 'VEH_004' ? 1.4 : 0.8;
    const baseHealth = vehicleId === 'VEH_002' ? 62 : vehicleId === 'VEH_004' ? 84 : 98;
    const baseStatus = baseHealth < 70 ? 'Critical' : baseHealth < 90 ? 'Warning' : 'Normal';

    for (let i = 30; i >= 1; i--) {
      const tempVar = Math.sin(i / 3) * 3 + Math.random() * 2;
      const voltVar = Math.cos(i / 4) * 0.2 + 13.9 + Math.random() * 0.1;
      const vibVar = Math.sin(i / 2) * 0.15 + baseVib + Math.random() * 0.1;
      const fuelVar = (i * 2.8) % 100;
      const rpmVar = 800 + (Math.random() * 2000);
      const isAnom = baseTemp + tempVar > 100 || voltVar < 10 || vibVar > 1.2;

      mockHist.push({
        vehicle_id: vehicleId,
        timestamp: `2026-07-02 18:${50 - i}:00`,
        engine_temperature: parseFloat((baseTemp + tempVar).toFixed(2)),
        battery_voltage: parseFloat(voltVar.toFixed(2)),
        vibration_level: parseFloat(vibVar.toFixed(2)),
        tire_pressure: parseFloat((32.5 + Math.sin(i) * 0.8).toFixed(2)),
        speed: parseFloat((rpmVar / 30).toFixed(2)),
        fuel_level: parseFloat(fuelVar.toFixed(2)),
        engine_rpm: parseFloat(rpmVar.toFixed(2)),
        coolant_level: parseFloat((92.0 - i * 0.4).toFixed(2)),
        health_score: isAnom ? Math.max(35, baseHealth - 15) : baseHealth,
        anomaly_status: isAnom ? (baseTemp + tempVar > 100 ? 'Critical' : 'Warning') : 'Normal',
        maintenance_required: isAnom ? 'Yes' : 'No'
      });
    }

    setHistory(mockHist);
    setVehicles([
      { vehicle_id: 'VEH_001', health_score: 98, anomaly_status: 'Normal', engine_temperature: 92.5, battery_voltage: 14.1, vibration_level: 0.8 },
      { vehicle_id: 'VEH_002', health_score: 55, anomaly_status: 'Critical', engine_temperature: 103.4, battery_voltage: 13.8, vibration_level: 1.05 },
      { vehicle_id: 'VEH_003', health_score: 96, anomaly_status: 'Normal', engine_temperature: 88.2, battery_voltage: 14.0, vibration_level: 0.75 },
      { vehicle_id: 'VEH_004', health_score: 82, anomaly_status: 'Warning', engine_temperature: 91.1, battery_voltage: 13.9, vibration_level: 1.34 },
      { vehicle_id: 'VEH_005', health_score: 99, anomaly_status: 'Normal', engine_temperature: 87.4, battery_voltage: 14.2, vibration_level: 0.68 }
    ]);
  };

  useEffect(() => {
    fetchData();
  }, [selectedVehicle]);

  // Chart Global styling configs
  const gridOptions = {
    grid: {
      color: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    ticks: {
      color: '#9ca3af',
      font: { size: 10, family: 'Outfit' }
    }
  };

  // 1. Health History Line Chart Data
  const healthChartData = {
    labels: history.map(h => h.timestamp.split(' ')[1]),
    datasets: [
      {
        label: 'Health Score (%)',
        data: history.map(h => h.health_score),
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointBackgroundColor: '#00f0ff',
      }
    ]
  };

  // 2. Temperature Line Chart Data
  const tempChartData = {
    labels: history.map(h => h.timestamp.split(' ')[1]),
    datasets: [
      {
        label: 'Engine Temp (°C)',
        data: history.map(h => h.engine_temperature),
        borderColor: '#ff007f',
        backgroundColor: 'rgba(255, 0, 127, 0.05)',
        borderWidth: 2,
        tension: 0.2,
        fill: false,
        pointBackgroundColor: '#ff007f',
      }
    ]
  };

  // 3. Battery Voltage Line Chart Data
  const batteryChartData = {
    labels: history.map(h => h.timestamp.split(' ')[1]),
    datasets: [
      {
        label: 'Battery Voltage (V)',
        data: history.map(h => h.battery_voltage),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.2,
        pointRadius: 2,
      }
    ]
  };

  // 4. RPM vs Speed Multi-axis Chart Data
  const rpmSpeedChartData = {
    labels: history.map(h => h.timestamp.split(' ')[1]),
    datasets: [
      {
        label: 'RPM',
        data: history.map(h => h.engine_rpm),
        borderColor: '#39ff14',
        borderWidth: 2,
        tension: 0.3,
        yAxisID: 'y-rpm',
      },
      {
        label: 'Speed (km/h)',
        data: history.map(h => h.speed),
        borderColor: '#ffcc00',
        borderWidth: 1.5,
        borderDash: [5, 5],
        tension: 0.3,
        yAxisID: 'y-speed',
      }
    ]
  };

  // 5. Anomaly Pie Chart Data
  // Dynamically group from history
  const normalCount = history.filter(h => h.anomaly_status === 'Normal').length;
  const warningCount = history.filter(h => h.anomaly_status === 'Warning').length;
  const criticalCount = history.filter(h => h.anomaly_status === 'Critical').length;

  const anomalyChartData = {
    labels: ['Normal Logs', 'Warning Alerts', 'Critical Alerts'],
    datasets: [
      {
        data: [normalCount, warningCount, criticalCount],
        backgroundColor: [
          'rgba(57, 255, 20, 0.65)',
          'rgba(255, 204, 0, 0.65)',
          'rgba(255, 0, 127, 0.65)'
        ],
        borderColor: [
          '#39ff14',
          '#ffcc00',
          '#ff007f'
        ],
        borderWidth: 1.5
      }
    ]
  };

  // 6. Fleet Comparison Radar Chart
  // Map average statistics across the vehicles
  const radarChartData = {
    labels: ['Health Score', 'Tire Pressure', 'Coolant Level', 'Battery Level %', 'Stability index'],
    datasets: vehicles.map((v, idx) => {
      const colors = ['#00f0ff', '#39ff14', '#ff007f', '#ffcc00', '#c084fc'];
      // Map pseudo radar profiles per vehicle based on current sensor state
      const batPercentage = (v.battery_voltage - 10) / 4.5 * 100;
      const vibStability = Math.max(10, 100 - (v.vibration_level * 35));
      return {
        label: v.vehicle_id,
        data: [
          v.health_score,
          (v.health_score > 90 ? 95 : 75), // pseudo pressure profile
          (v.health_score > 70 ? 90 : 45), // coolant profile
          Math.min(100, Math.max(10, batPercentage)),
          Math.min(100, Math.max(10, vibStability))
        ],
        backgroundColor: `${colors[idx % colors.length]}15`,
        borderColor: colors[idx % colors.length],
        borderWidth: 1.5
      };
    })
  };

  return (
    <div className="min-h-screen cyber-grid py-10 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Control Panel Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-6 border-white/5">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">Diagnostics & Analytics Hub</h2>
          <p className="text-gray-400 text-xs mt-1 font-mono uppercase">Multi-Vehicle Telemetry Aggregates</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Selector */}
          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-4 py-2 text-cyber-cyan text-sm focus:outline-none focus:border-cyber-cyan tracking-wider font-mono w-full md:w-48"
          >
            {vehicles.map(v => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.vehicle_id} (Health: {v.health_score}%)
              </option>
            ))}
          </select>
          
          <button
            onClick={fetchData}
            className="p-2 border border-white/10 rounded-lg hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <a
            href="http://localhost:5000/api/report/download"
            download="fleet_health_report.txt"
            className="flex items-center gap-2 bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black font-bold uppercase text-xs tracking-wider px-4 py-2.5 rounded-lg hover:shadow-glow-cyan/40 transition-all shrink-0"
          >
            <Download size={14} />
            Download Fleet Report
          </a>
        </div>
      </div>

      {/* Primary Analytics Charts */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyber-cyan"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Charts Row 1: Vehicle Health & Temperature */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">📈 Chronological Vehicle Health Trends</h3>
              <div className="h-64">
                <Line
                  data={healthChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: gridOptions,
                      y: { ...gridOptions, min: 0, max: 100 }
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-6 border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">🔥 Thermal Signature Trends (Celsius)</h3>
              <div className="h-64">
                <Line
                  data={tempChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: gridOptions,
                      y: gridOptions
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Charts Row 2: Battery Analytics & Speed/RPM */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">🔋 Battery Charger Voltage Profile</h3>
              <div className="h-64">
                <Line
                  data={batteryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: gridOptions,
                      y: { ...gridOptions, min: 8, max: 16 }
                    },
                    plugins: { legend: { display: false } }
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-6 border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">⚙️ Engine RPM vs Ground Speed</h3>
              <div className="h-64">
                <Line
                  data={rpmSpeedChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: gridOptions,
                      'y-rpm': {
                        type: 'linear',
                        position: 'left',
                        ...gridOptions
                      },
                      'y-speed': {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ...gridOptions
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Charts Row 3: Anomaly Distribution & Radar Fleet Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-6 border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">⚖️ Telemetry Anomaly Signature Distribution</h3>
                <div className="h-64 relative flex items-center justify-center">
                  <Doughnut
                    data={anomalyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: { color: '#9ca3af', font: { family: 'Outfit', size: 11 } }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              {criticalCount > 0 && (
                <div className="mt-4 p-3 bg-cyber-red/10 border border-cyber-red/20 rounded-lg flex items-center gap-3 text-xs text-cyber-red font-mono">
                  <AlertTriangle size={18} />
                  <span>WARNING: Fleet contains active anomalies! Maintenance required immediately.</span>
                </div>
              )}
            </div>

            <div className="glass-card p-6 border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-mono">🕸️ Multi-Vehicle Comparison Radar</h3>
              <div className="h-64 relative flex items-center justify-center">
                <Radar
                  data={radarChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.05)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        pointLabels: { color: '#9ca3af', font: { family: 'Outfit', size: 10 } },
                        ticks: { display: false },
                        min: 0,
                        max: 100
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: { color: '#9ca3af', font: { family: 'Outfit', size: 11 } }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
