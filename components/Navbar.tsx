"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Trophy, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <Trophy className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">
                Bay<span className="text-primary">League</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-text-muted hover:text-white transition-colors">Home</Link>
            {user && (
              <Link href="/dashboard" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <UserIcon size={16} className="text-primary" />
                  <span className="text-sm font-medium">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-text-muted hover:text-white font-medium">Login</Link>
                <Link 
                  href="/signup" 
                  className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-lg active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
