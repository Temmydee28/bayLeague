"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trophy, Clock, Play, Square, Plus, Loader2, Star, ChevronLeft } from 'lucide-react';
import api from '@/lib/axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/context/AuthContext';
import Timeline from '@/components/match/Timeline';
import Modal from '@/components/ui/Modal';

export default function MatchPage() {
  const { id } = useParams();
  const router = useRouter();
  const { socket, joinTournament } = useSocket();
  const { user } = useAuth();
  
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalData, setGoalData] = useState({ team: 'home', player: '', minute: '', assist: '' });
  const [goalLoading, setGoalLoading] = useState(false);

  // For Real-time Timer
  const [timer, setTimer] = useState<number | string>(0);
  const timerRef = useRef<any>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  useEffect(() => {
    if (socket) {
      socket.on('matchUpdated', (updatedMatch: any) => {
        if (updatedMatch._id === id) {
          setMatch((prevMatch: any) => {
            if (prevMatch && updatedMatch.events?.length > (prevMatch.events?.length || 0)) {
              const newEvent = updatedMatch.events[updatedMatch.events.length - 1];
              if (newEvent.type === 'goal') {
                const homeId = updatedMatch.homeTeam._id?.toString() || updatedMatch.homeTeam.toString();
                const eventTeamId = newEvent.teamId.toString();
                const teamName = eventTeamId === homeId ? updatedMatch.homeTeam.name : updatedMatch.awayTeam.name;
                
                setToastMessage(`GOAL! ${newEvent.playerName} scores for ${teamName}!`);
                setTimeout(() => setToastMessage(null), 5000);
              }
            }
            return {
              ...updatedMatch,
              homeScore: updatedMatch.score?.home ?? 0,
              awayScore: updatedMatch.score?.away ?? 0
            };
          });
        }
      });

      return () => {
        socket.off('matchUpdated');
      };
    }
  }, [socket, id]);

  const fetchMatch = async () => {
    try {
      const resp = await api.get(`/match/${id}`);
      setMatch(resp.data);
      if (resp.data.tournamentId) {
         joinTournament(resp.data.tournamentId);
      }
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Match not found or connection lost.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (match?.status === 'live' && match.startTime) {
      const start = new Date(match.startTime).getTime();
      const updateTimer = () => {
        const now = new Date().getTime();
        const diff = Math.floor((now - start) / 1000 / 60); // minutes
        
        if (diff <= 45) {
          setTimer(diff);
        } else if (diff > 45 && diff <= 60) {
          setTimer('HT');
        } else {
          setTimer(diff - 15);
        }
      };
      updateTimer();
      timerRef.current = setInterval(updateTimer, 10000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [match]);

  const handleStart = async () => {
    try {
      await api.post('/match/start', { matchId: id });
    } catch (err) {
      alert('Failed to start match');
    }
  };

  const handleEnd = async () => {
    if (!confirm('Are you sure you want to end this match? This cannot be undone.')) return;
    try {
      await api.post('/match/end', { matchId: id });
    } catch (err) {
      alert('Failed to end match');
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setGoalLoading(true);
    try {
      await api.post('/match/add-event', {
        matchId: id,
        type: 'goal',
        teamId: goalData.team === 'home' ? match.homeTeam._id : match.awayTeam._id,
        playerName: goalData.player,
        minute: parseInt(goalData.minute) || timer,
        assist: goalData.assist
      });
      setShowGoalModal(false);
      setGoalData({ team: 'home', player: '', minute: '', assist: '' });
    } catch (err) {
      alert('Failed to add goal');
    } finally {
      setGoalLoading(false);
    }
  };

  const handleUpdateStat = async (team: 'home' | 'away', stat: 'corners' | 'shots', increment: number) => {
    if (!match.stats) return;
    const newStats = { ...match.stats };
    newStats[team] = { ...newStats[team], [stat]: Math.max(0, (newStats[team][stat] || 0) + increment) };
    
    // Optimistic UI update
    setMatch({ ...match, stats: newStats });
    
    try {
      await api.patch('/match/update-stats', { matchId: id, stats: newStats });
    } catch (err) {
      console.error('Failed to update stats');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[calc(100vh-64px)]"><Loader2 className="animate-spin text-primary w-12 h-12" /></div>;
  
  if (error || !match) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center px-4">
      <div className="bg-bg-card border border-white/10 p-12 rounded-[2.5rem] shadow-2xl">
        <Trophy className="w-20 h-20 text-white/5 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">{error || 'Match Not Found'}</h2>
        <p className="text-text-muted mb-8 max-w-sm mx-auto">We couldn't retrieve the match data. The match might have been removed or there's a network issue.</p>
        <button 
          onClick={() => { setLoading(true); fetchMatch(); }} 
          className="bg-primary text-white px-10 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const isOwner = user && match.owner === user.id;

  // Map events for Timeline split layout (home vs away)
  const mappedEvents = match?.events?.map((e: any) => {
    const homeId = match.homeTeam._id?.toString() || match.homeTeam.toString();
    return {
      ...e,
      team: e.teamId.toString() === homeId ? 'home' : 'away'
    };
  }) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-bounce">
           <div className="bg-primary text-white px-8 py-4 rounded-full font-black text-xl shadow-[0_0_40px_rgba(128,0,32,0.6)] flex items-center gap-3 border border-white/20">
             <Trophy size={28} />
             {toastMessage}
           </div>
        </div>
      )}
      
      {/* Back Button */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-colors group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Tournament
      </button>

      {/* Hero Scoreboard */}
      <div className="bg-bg-card border border-white/10 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
        
        <div className="relative flex flex-col items-center">
          {/* Status Badge */}
          <div className="mb-8 flex items-center justify-center">
             {match.status === 'live' ? (
               <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-xs font-black text-primary uppercase tracking-widest leading-none">Live • {timer}'</span>
               </div>
             ) : (
               <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-black text-text-muted uppercase tracking-widest leading-none">
                  {match.status === 'finished' ? 'Full Time' : 'Not Started'}
               </div>
             )}
          </div>

          <div className="flex items-center justify-between w-full gap-4 md:gap-12">
            <div className="flex-1 text-center group">
               <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-primary/50 transition-all font-black text-2xl md:text-4xl text-primary">
                 {match.homeTeam.name.charAt(0)}
               </div>
               <h3 className="text-xl md:text-3xl font-black text-white">{match.homeTeam.name}</h3>
            </div>

            <div className="flex flex-col items-center">
               <div className="flex items-center gap-4 md:gap-8">
                 <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">{match.homeScore ?? 0}</span>
                 <span className="text-4xl md:text-6xl font-thin text-text-muted opacity-20">:</span>
                 <span className="text-6xl md:text-8xl font-black text-white tracking-tighter">{match.awayScore ?? 0}</span>
               </div>
            </div>

            <div className="flex-1 text-center group">
               <div className="w-16 h-16 md:w-24 md:h-24 bg-white/5 rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-primary/50 transition-all font-black text-2xl md:text-4xl text-primary">
                 {match.awayTeam.name.charAt(0)}
               </div>
               <h3 className="text-xl md:text-3xl font-black text-white">{match.awayTeam.name}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      {isOwner && (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12 bg-bg-card border border-white/10 p-4 rounded-2xl shadow-xl">
          {match.status === 'pending' && (
            <button 
              onClick={handleStart}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
            >
              <Play size={18} fill="white" /> Start Match
            </button>
          )}
          {match.status === 'live' && (
            <>
              <button 
                onClick={() => setShowGoalModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <Plus size={18} /> Add Goal
              </button>
              <button 
                onClick={handleEnd}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                <Square size={18} fill="white" /> End Match
              </button>
            </>
          )}
          {match.status === 'finished' && (
            <p className="text-text-muted text-sm font-medium">Match has concluded. No further actions required.</p>
          )}
        </div>
      )}

      {/* Match Timeline */}
      <div className="mb-24">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <Clock className="text-primary" /> Key Events
        </h2>
        <Timeline events={mappedEvents} homeTeamName={match.homeTeam.name} awayTeamName={match.awayTeam.name} />
      </div>

      {/* Match Stats Panel */}
      <div className="mb-24">
        <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
          <Star className="text-primary" /> Match Stats
        </h2>
        <div className="bg-bg-card border border-white/10 p-8 rounded-2xl shadow-xl">
          <div className="grid grid-cols-3 gap-4 text-center items-center">
            {/* Home Stats */}
            <div className="space-y-6">
               <div>
                  <div className="text-2xl font-black text-white">{match.stats?.home?.shots || 0}</div>
                  {isOwner && match.status === 'live' && (
                    <div className="flex justify-center gap-2 mt-2">
                       <button onClick={() => handleUpdateStat('home', 'shots', -1)} className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10">-</button>
                       <button onClick={() => handleUpdateStat('home', 'shots', 1)} className="w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white">+</button>
                    </div>
                  )}
               </div>
               <div>
                  <div className="text-2xl font-black text-white">{match.stats?.home?.corners || 0}</div>
                  {isOwner && match.status === 'live' && (
                    <div className="flex justify-center gap-2 mt-2">
                       <button onClick={() => handleUpdateStat('home', 'corners', -1)} className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10">-</button>
                       <button onClick={() => handleUpdateStat('home', 'corners', 1)} className="w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white">+</button>
                    </div>
                  )}
               </div>
            </div>
            
            {/* Labels */}
            <div className="space-y-6">
               <div className="text-sm font-bold text-text-muted uppercase tracking-widest h-14 flex items-center justify-center">Shots On Target</div>
               <div className="text-sm font-bold text-text-muted uppercase tracking-widest h-14 flex items-center justify-center">Corners</div>
            </div>

            {/* Away Stats */}
            <div className="space-y-6">
               <div>
                  <div className="text-2xl font-black text-white">{match.stats?.away?.shots || 0}</div>
                  {isOwner && match.status === 'live' && (
                    <div className="flex justify-center gap-2 mt-2">
                       <button onClick={() => handleUpdateStat('away', 'shots', -1)} className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10">-</button>
                       <button onClick={() => handleUpdateStat('away', 'shots', 1)} className="w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white">+</button>
                    </div>
                  )}
               </div>
               <div>
                  <div className="text-2xl font-black text-white">{match.stats?.away?.corners || 0}</div>
                  {isOwner && match.status === 'live' && (
                    <div className="flex justify-center gap-2 mt-2">
                       <button onClick={() => handleUpdateStat('away', 'corners', -1)} className="w-6 h-6 bg-white/5 rounded flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10">-</button>
                       <button onClick={() => handleUpdateStat('away', 'corners', 1)} className="w-6 h-6 bg-primary/20 text-primary rounded flex items-center justify-center hover:bg-primary hover:text-white">+</button>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Modal */}
      <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)} title="⚽ Record a Goal">
        <form onSubmit={handleAddGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Team Scoring</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGoalData({...goalData, team: 'home'})}
                className={`p-3 rounded-xl border font-bold transition-all ${goalData.team === 'home' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-text-muted'}`}
              >
                {match.homeTeam.name}
              </button>
              <button
                type="button"
                onClick={() => setGoalData({...goalData, team: 'away'})}
                className={`p-3 rounded-xl border font-bold transition-all ${goalData.team === 'away' ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-text-muted'}`}
              >
                {match.awayTeam.name}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Scorer Name</label>
            <input
              type="text"
              required
              className="w-full bg-bg-base border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-white"
              value={goalData.player}
              onChange={(e) => setGoalData({...goalData, player: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Minute</label>
              <input
                type="number"
                placeholder={timer.toString()}
                className="w-full bg-bg-base border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-white"
                value={goalData.minute}
                onChange={(e) => setGoalData({...goalData, minute: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Assist (Optional)</label>
              <input
                type="text"
                className="w-full bg-bg-base border border-white/5 rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-primary text-white"
                value={goalData.assist}
                onChange={(e) => setGoalData({...goalData, assist: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={goalLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {goalLoading ? <Loader2 className="animate-spin" /> : 'Confirm Goal'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
