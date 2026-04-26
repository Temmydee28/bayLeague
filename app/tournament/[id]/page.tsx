"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, Calendar, List, PieChart, Share2, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import FixtureList from '@/components/tournament/FixtureList';
import TableStandings from '@/components/tournament/TableStandings';
import StatsGrid from '@/components/tournament/StatsGrid';

type Tab = 'fixtures' | 'table' | 'stats';

export default function AdminTournamentView() {
  const { id } = useParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('fixtures');
  const [rebalancing, setRebalancing] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const resp = await api.get(`/tournament/${id}`);
      setTournament({
        ...resp.data.tournament,
        matches: resp.data.matches,
        standings: resp.data.standings,
        topScorers: resp.data.topScorers,
        topAssisters: resp.data.topAssisters
      });
    } catch (err) {
      console.error('Failed to fetch tournament');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRebalance = async () => {
    if (!confirm('Rebalancing will regenerate all pending fixtures. Continue?')) return;
    setRebalancing(true);
    try {
      await api.put(`/tournament/edit-fixture/${id}`);
      await fetchTournament();
      alert('Fixtures rebalanced successfully!');
    } catch (err) {
      alert('Failed to rebalance fixtures');
    } finally {
      setRebalancing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
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
                Admin Console
              </span>
              <span className="text-text-muted text-sm">• {tournament.teams?.length} Teams</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
              {tournament.name}
            </h1>
            <div className="flex items-center gap-4">
               <p className="text-text-muted flex items-center gap-2">
                <Share2 size={14} /> Share Code: <span className="text-white font-mono bg-white/5 py-0.5 px-2 rounded border border-white/10">{tournament.shareCode}</span>
               </p>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(`${window.location.origin}/view/${tournament.shareCode}`);
                   alert('Public link copied!');
                 }}
                 className="text-primary text-xs font-bold hover:underline"
               >
                 Copy Public Link
               </button>
            </div>
          </div>
          
          <div className="flex gap-4">
             <button 
               onClick={handleRebalance}
               disabled={rebalancing}
               className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
             >
               {rebalancing ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
               Rebalance Fixtures
             </button>
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
        {activeTab === 'fixtures' && (
          <div>
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-4 mb-8">
              <AlertCircle className="text-primary shrink-0" size={20} />
              <p className="text-xs text-text-muted leading-relaxed uppercase tracking-wide">
                <span className="text-white font-bold">Admin Note:</span> Click on a match card to open the live match controller. You can start matches, record goals, and finalize scores from there.
              </p>
            </div>
            <FixtureList matches={tournament.matches || []} />
          </div>
        )}
        {activeTab === 'table' && <TableStandings standings={tournament.standings || []} />}
        {activeTab === 'stats' && <StatsGrid goalScorers={tournament.topScorers || []} assisters={tournament.topAssisters || []} />}
      </div>
    </div>
  );
}
