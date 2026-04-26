"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Plus, Settings, Users, Calendar, Share2, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Create Tournament State
  const [tName, setTName] = useState('');
  const [teamCount, setTeamCount] = useState(4);
  const [teams, setTeams] = useState(Array(4).fill(''));

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchTournaments();
      } else {
        setLoading(false);
        router.push('/login');
      }
    }
  }, [user, authLoading]);

  const fetchTournaments = async () => {
    try {
      const resp = await api.get('/tournament');
      setTournaments(resp.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamCountChange = (count: number) => {
    setTeamCount(count);
    const newTeams = [...teams];
    if (count > teams.length) {
      for (let i = teams.length; i < count; i++) newTeams.push('');
    } else {
      newTeams.splice(count);
    }
    setTeams(newTeams);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const resp = await api.post('/tournament', {
        name: tName,
        teams: teams.map(t => ({ name: t || 'Unnamed Team' })),
        settings: { legs: 1 }
      });
      setTournaments([...tournaments, resp.data]);
      setTName('');
      setTeams(Array(teamCount).fill(''));
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Failed to create tournament. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left: Create Tournament */}
        <div className="lg:w-1/3">
          <div className="bg-bg-card border border-white/10 rounded-2xl p-8 sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus className="text-primary" /> Create Tournament
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs font-medium">
                  {errorMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Tournament Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Champions League 2024"
                  className="w-full bg-bg-base border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Number of Teams</label>
                <select
                  className="w-full bg-bg-base border border-white/5 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all text-white appearance-none cursor-pointer"
                  value={teamCount}
                  onChange={(e) => handleTeamCountChange(parseInt(e.target.value))}
                >
                  {[4, 6, 8, 10, 12, 16].map(n => (
                    <option key={n} value={n}>{n} Teams</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <label className="block text-sm font-medium text-text-muted mb-2">Team Names</label>
                {teams.map((team, idx) => (
                  <input
                    key={idx}
                    type="text"
                    required
                    placeholder={`Team ${idx + 1}`}
                    className="w-full bg-bg-base border border-white/5 rounded-lg px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all text-white"
                    value={team}
                    onChange={(e) => {
                      const newTeams = [...teams];
                      newTeams[idx] = e.target.value;
                      setTeams(newTeams);
                    }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="animate-spin" /> : 'Launch Tournament'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: My Tournaments */}
        <div className="lg:w-2/3">
          <h2 className="text-3xl font-bold text-white mb-8">My Tournaments</h2>
          
          {error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center">
              <p className="text-red-500 font-medium mb-4">{error}</p>
              <button 
                onClick={() => { setLoading(true); fetchTournaments(); }}
                className="bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : tournaments.length === 0 ? (
            <div className="bg-bg-card border border-dashed border-white/10 rounded-2xl p-12 text-center">
              <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Tournaments Yet</h3>
              <p className="text-text-muted">Create your first league to start tracking matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tournaments.map((t: any) => (
                <div key={t._id} className="group bg-bg-card border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {t.status || 'Active'}
                      </div>
                      <button className="text-text-muted hover:text-white transition-colors">
                        <Share2 size={18} />
                      </button>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{t.name}</h3>
                    
                    <div className="flex items-center gap-4 text-text-muted text-sm mb-6">
                      <span className="flex items-center gap-1.5"><Users size={14} /> {t.teams?.length || 0} Teams</span>
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/tournament/${t._id}`} 
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 group"
                    >
                      Admin Panel <Settings size={16} className="group-hover:rotate-45 transition-transform" />
                    </Link>
                    <Link 
                      href={`/view/${t.shareCode}`} 
                      className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-xl transition-all"
                      title="Public Link"
                    >
                      <ArrowRight size={20} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
