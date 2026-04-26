"use client";

import React from 'react';

interface Standing {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface Props {
  standings: Standing[];
}

const TableStandings: React.FC<Props> = ({ standings }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-bg-card shadow-soft">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 text-text-muted text-xs uppercase tracking-widest font-bold">
            <th className="px-6 py-4">#</th>
            <th className="px-6 py-4">Team</th>
            <th className="px-6 py-4 text-center">P</th>
            <th className="px-6 py-4 text-center">W</th>
            <th className="px-6 py-4 text-center">D</th>
            <th className="px-6 py-4 text-center">L</th>
            <th className="px-6 py-4 text-center hidden md:table-cell">GF</th>
            <th className="px-6 py-4 text-center hidden md:table-cell">GA</th>
            <th className="px-6 py-4 text-center">GD</th>
            <th className="px-6 py-4 text-center text-white">PTS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {standings.map((team, idx) => (
            <tr key={team.name} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-6 py-4 text-sm font-medium text-text-muted">{idx + 1}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    {team?.name?.charAt(0)}
                  </div>
                  <span className="font-bold text-white">{team.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center text-sm">{team.played}</td>
              <td className="px-6 py-4 text-center text-sm">{team.wins}</td>
              <td className="px-6 py-4 text-center text-sm">{team.draws}</td>
              <td className="px-6 py-4 text-center text-sm text-red-400/80">{team.losses}</td>
              <td className="px-6 py-4 text-center text-sm text-text-muted hidden md:table-cell">{team.goalsFor}</td>
              <td className="px-6 py-4 text-center text-sm text-text-muted hidden md:table-cell">{team.goalsAgainst}</td>
              <td className="px-6 py-4 text-center text-sm">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</td>
              <td className="px-6 py-4 text-center font-bold text-primary">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableStandings;
