"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Trophy, Calendar, List, PieChart, Share2, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import FixtureList from '@/components/tournament/FixtureList';
import TableStandings from '@/components/tournament/TableStandings';
import StatsGrid from '@/components/tournament/StatsGrid';

type Tab = 'fixtures' | 'table' | 'stats';

export default function ViewTournament() {
  const { shareCode } = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('fixtures');

  useEffect(() => {
    fetchTournament();
  }, [shareCode]);

  const fetchTournament = async () => {
    try {
      const resp = await api.get(`/tournament/view/${shareCode}`);
      setTournament({
        ...resp.data.tournament,
        matches: resp.data.matches,
        standings: resp.data.standings,
        topScorers: resp.data.topScorers,
        topAssisters: resp.data.topAssisters
      });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch tournament details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
        <Trophy className="w-20 h-20 text-white/5 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">{error || 'Tournament Not Found'}</h2>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">
          {error ? 'There was a problem connecting to the server.' : 'The share code you entered might be incorrect or the tournament was deleted.'}
        </p>
        <div className="flex gap-4">
          <button onClick={() => window.location.href = '/'} className="bg-white/5 border border-white/10 px-8 py-3 rounded-xl font-bold">Go Home</button>
          <button onClick={() => { setLoading(true); fetchTournament(); }} className="bg-primary px-8 py-3 rounded-xl font-bold shadow-lg">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="relative bg-bg-card border border-white/10 rounded-2xl p-8 mb-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Trophy size={160} />
        </div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {tournament.status || 'Ongoing'}
              </span>
              <span className="text-text-muted text-sm">• {tournament.teams?.length} Teams</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
              {tournament.name}
            </h1>
            <p className="text-text-muted flex items-center gap-2">
              <Share2 size={14} /> Share Code: <span className="text-white font-mono">{shareCode}</span>
            </p>
          </div>
          
          {/* Quick Stats Banner */}
          <div className="flex gap-8 bg-white/5 p-4 rounded-xl border border-white/5">
            <div className="text-center">
              <div className="text-2xl font-black text-white">{tournament.matches?.filter((m:any) => m.status === 'finished').length || 0}</div>
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Played</div>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <div className="text-2xl font-black text-primary">{tournament.matches?.filter((m:any) => m.status === 'live').length || 0}</div>
              <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Live</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-bg-card p-1.5 rounded-xl border border-white/10 w-fit">
        {[
          { id: 'fixtures', label: 'Fixtures', icon: <Calendar size={18} /> },
          { id: 'table', label: 'Standings', icon: <List size={18} /> },
          { id: 'stats', label: 'Player Stats', icon: <PieChart size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all
              ${activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-muted hover:text-white hover:bg-white/5'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="transition-all duration-300">
        {activeTab === 'fixtures' && <FixtureList matches={tournament.matches || []} />}
        {activeTab === 'table' && <TableStandings standings={tournament.standings || []} />}
        {activeTab === 'stats' && <StatsGrid goalScorers={tournament.topScorers || []} assisters={tournament.topAssisters || []} />}
      </div>
    </div>
  );
}
