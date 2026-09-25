import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { Landmark, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../../components/common/Button';

export default function Login() {
  const [email, setEmail] = useState('admin@finance.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-3">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to FinVeda</h2>
          <p className="text-xs text-slate-500 mt-1">Loan & Finance Management System</p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-emerald-800">Demo Login Accounts:</p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@finance.com');
                  setPassword('password123');
                }}
                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold hover:bg-emerald-700"
              >
                Fill Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff@finance.com');
                  setPassword('password123');
                }}
                className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px] font-bold hover:bg-slate-800"
              >
                Fill Staff
              </button>
            </div>
          </div>
          <div className="space-y-0.5 text-[11px]">
            <p>Admin: <code className="bg-white px-1.5 py-0.5 rounded font-mono">admin@finance.com</code> / <code className="bg-white px-1.5 py-0.5 rounded font-mono">password123</code></p>
            <p>Staff: <code className="bg-white px-1.5 py-0.5 rounded font-mono">staff@finance.com</code> / <code className="bg-white px-1.5 py-0.5 rounded font-mono">password123</code></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email / Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@finance.com or admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} className="w-full py-2.5 text-sm">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
