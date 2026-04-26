"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, PlusCircle, Search, ArrowRight } from 'lucide-react';

export default function Home() {
  const [shareCode, setShareCode] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (shareCode.trim()) {
      router.push(`/view/${shareCode.trim()}`);
    }
  };

  return (
    <div className="relative isolate overflow-hidden min-h-screen">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#800020] to-[#ff4694] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#800020]/10 border border-[#800020]/20 text-[#800020] text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#800020] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#800020]"></span>
            </span>
            <span>League Management Reimagined</span>
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6 leading-tight">
            Elite Football <br /> 
            <span className="text-[#800020] tracking-tighter">Tournaments.</span>
          </h1>
          
          <p className="mt-6 text-xl leading-8 text-[#9CA3AF] max-w-2xl mx-auto font-light">
            Organize, track, and share your leagues in real-time. From grassroots to professional circuits, BayLeague brings professional tracking to your game.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-[#800020] px-8 py-4 text-lg font-bold text-white shadow-lg shadow-[#800020]/20 hover:bg-[#800020]/90 hover:scale-105 transition-all w-full sm:w-auto justify-center"
            >
              <PlusCircle size={22} />
              Create Tournament
            </Link>
            
            <form onSubmit={handleJoin} className="relative w-full sm:w-[400px]">
              <input
                type="text"
                placeholder="Enter Tournament Share Code..."
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-12 py-4 text-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent outline-none transition-all placeholder:text-[#9CA3AF]/50 text-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" size={20} />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
              >
                <ArrowRight size={18} />
              </button>
            </form>
          </div>

          {/* Stats / Features Grid */}
          <div className="mt-32 grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-12">
            {[
              { label: 'Real-time Updates', desc: 'Instant score tracking via WebSockets', icon: <Trophy className="text-[#800020]" /> },
              { label: 'Dynamic Standings', desc: 'Automated table calculation on every goal', icon: <Trophy className="text-[#800020]" /> },
              { label: 'Easy Sharing', desc: 'Unique codes for public viewing', icon: <Trophy className="text-[#800020]" /> },
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-2xl bg-[#121212] border border-white/5 hover:border-[#800020]/20 transition-all shadow-xl">
                <div className="w-12 h-12 bg-[#800020]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.label}</h3>
                <p className="text-[#9CA3AF] font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
