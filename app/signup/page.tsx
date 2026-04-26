"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/signup', formData);
      login(response.data.token, response.data.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="w-full max-w-md">
        <div className="bg-bg-card border border-white/10 p-8 rounded-2xl shadow-2xl relative">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3 group hover:rotate-0 transition-transform">
              <Trophy className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-text-muted mt-2">Join the elite tournament league</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="text"
                  required
                  placeholder="Choose a username"
                  className="w-full bg-bg-base border border-white/5 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-bg-base border border-white/5 rounded-xl px-12 py-3.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-white"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Sign Up <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
