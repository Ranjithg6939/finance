import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errs.email = 'Registered email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'New password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast(Object.values(errs)[0], 'error');
      return;
    }

    setErrors({});

    try {
      setLoading(true);
      await authService.resetPassword({ email: cleanEmail, password });
      showToast('Password updated successfully. Please login.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Set New Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose a strong password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              placeholder="name@company.com"
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                errors.email
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              placeholder="••••••••"
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                errors.password
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              placeholder="••••••••"
              className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none ${
                errors.confirmPassword
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                  : 'border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
              }`}
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword}</p>}
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Save New Password
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
