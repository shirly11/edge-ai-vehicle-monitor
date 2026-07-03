import React, { useState } from 'react';
import HomeView from './components/HomeView';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import AboutView from './components/AboutView';
import ArchitectureView from './components/ArchitectureView';
import VehicleIntegrationView from './components/VehicleIntegrationView';
import { Cpu, User, LayoutDashboard, BarChart2, ShieldAlert, BookOpen, GitBranch, Home, LogOut, Cable } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('auth_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const [activeTab, setActiveTab] = useState('home');

  const handleLogin = (jwtToken, userInfo) => {
    setToken(jwtToken);
    setUser(userInfo);
    localStorage.setItem('auth_token', jwtToken);
    localStorage.setItem('auth_user', JSON.stringify(userInfo));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setActiveTab('home');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans">
      {/* Global Telemetry Header Bar */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="p-2 bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan rounded-lg animate-pulse">
              <Cpu size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-wider text-white">EDGE AI DETECT</h1>
              <p className="text-[9px] font-mono text-cyber-cyan uppercase tracking-widest">Diagnostics Fleet v1.4</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'home' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Home size={14} /> Home
            </button>
            
            <button
              onClick={() => setActiveTab(token ? 'dashboard' : 'login')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard' || activeTab === 'login' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutDashboard size={14} /> Telemetry
            </button>

            <button
              onClick={() => setActiveTab(token ? 'analytics' : 'login')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'analytics' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart2 size={14} /> Analytics
            </button>

            <button
              onClick={() => setActiveTab('integration')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'integration' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cable size={14} /> Vehicle Integration
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'architecture' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <GitBranch size={14} /> Workflow
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'about' ? 'text-cyber-cyan bg-white/5 border border-white/10' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen size={14} /> Concepts
            </button>
          </nav>


        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView onStartMonitoring={() => setActiveTab(token ? 'dashboard' : 'login')} />
        )}
        {activeTab === 'login' && (
          <LoginView onLogin={handleLogin} />
        )}
        {activeTab === 'dashboard' && (
          token ? <DashboardView /> : <LoginView onLogin={handleLogin} />
        )}
        {activeTab === 'analytics' && (
          token ? <AnalyticsView /> : <LoginView onLogin={handleLogin} />
        )}

        {activeTab === 'integration' && (
          <VehicleIntegrationView />
        )}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>

      {/* Futuristic Bottom Status Bar */}
      <footer className="border-t border-white/5 bg-black/80 py-4 font-mono text-[9px] uppercase tracking-widest text-gray-500 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>Edge AI Predictive Diagnostics © 2026. All Rights Reserved.</div>
          <div className="flex gap-4 text-cyber-cyan">
            <span>SYS.STATE: Nominal</span>
            <span>MODEL: ISOLATION_FOREST_V2</span>
            <span>LATENCY: 0.12ms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
