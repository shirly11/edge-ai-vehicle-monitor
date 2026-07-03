import React, { useState } from 'react';
import { Lock, User, Cpu, ShieldAlert } from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('edgeai2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Attempt backend auth first
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        onLogin(data.token, data.user);
      } else {
        setError(data.message || 'Invalid username or password credentials.');
      }
    } catch (err) {
      console.warn('Backend offline, using fallback auth logic:', err);
      // Fallback local auth for resilience during presentation if API is offline
      if (username === 'admin' && password === 'edgeai2026') {
        onLogin('mock-local-token', { username: 'admin', role: 'Fleet Operator (Offline Mode)' });
      } else {
        setError('Invalid username or password. (Hint: admin / edgeai2026)');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid scanlines flex items-center justify-center px-4 relative">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-red/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-card p-8 border border-white/10 relative z-20 shadow-glow-cyan/10">
        {/* Header Design */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 mb-4 animate-pulse">
            <Cpu size={36} />
          </div>
          <h2 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyber-cyan to-white glitch-text uppercase">
            System Authorization
          </h2>
          <p className="text-gray-400 text-xs mt-2 uppercase tracking-widest">
            Edge AI Vehicle Diagnostics Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cyber-cyan uppercase tracking-wider block">
              Operator Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 transition-all text-sm"
                placeholder="Enter operator code..."
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cyber-cyan uppercase tracking-wider block">
              Authorization Key
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 transition-all text-sm"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyber-cyan to-cyber-blue text-black font-bold uppercase tracking-wider py-3 rounded-lg hover:shadow-glow-cyan/50 hover:brightness-110 active:scale-95 transition-all text-sm relative overflow-hidden group disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authorizing...
              </span>
            ) : (
              <span>Initialize Handshake</span>
            )}
          </button>
        </form>

        {/* Footer Hints */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            Access restricted to authorized personnel only
          </p>
          <p className="text-[10px] text-cyber-cyan/50 mt-1">
            Demo Credentials: admin / edgeai2026
          </p>
        </div>
      </div>
    </div>
  );
}
