"use client";

import React from 'react';
import { Trophy, Users, Star } from 'lucide-react';

interface Stat {
  player: string;
  team: string;
  count: number;
}

interface Props {
  goalScorers: Stat[];
  assisters: Stat[];
}

const StatsGrid: React.FC<Props> = ({ goalScorers, assisters }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Top Scorers */}
      <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Trophy className="text-primary" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Golden Boot Race</h3>
        </div>

        <div className="space-y-4">
          {goalScorers.length === 0 ? (
            <p className="text-text-muted text-center py-8">No goals recorded yet</p>
          ) : (
            goalScorers.slice(0, 10).map((stat, idx) => (
              <div key={stat.player + idx} className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-black text-text-muted/30 w-6">#{idx + 1}</div>
                  <div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors">{stat.player}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider">{stat.team}</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-primary">{stat.count}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top Assists */}
      <div className="bg-bg-card border border-white/10 rounded-2xl p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Star className="text-blue-500" size={24} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Playmaker Awards</h3>
        </div>

        <div className="space-y-4">
          {assisters.length === 0 ? (
            <p className="text-text-muted text-center py-8">No assists recorded yet</p>
          ) : (
            assisters.slice(0, 10).map((stat, idx) => (
              <div key={stat.player + idx} className="flex items-center justify-between group p-3 rounded-xl hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-lg font-black text-text-muted/30 w-6">#{idx + 1}</div>
                  <div>
                    <div className="font-bold text-white group-hover:text-blue-500 transition-colors">{stat.player}</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider">{stat.team}</div>
                  </div>
                </div>
                <div className="text-2xl font-black text-blue-500">{stat.count}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
