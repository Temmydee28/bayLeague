"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Match {
  _id: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  homeScore?: number;
  awayScore?: number;
  score?: { home: number; away: number };
  status: 'pending' | 'live' | 'finished';
  gmw: number;
  date?: string;
}

interface Props {
  matches: Match[];
}

const FixtureList: React.FC<Props> = ({ matches }) => {
  // Group by Game Week
  const grouped = matches.reduce((acc: any, match) => {
    const gmw = match.gmw || 1;
    if (!acc[gmw]) acc[gmw] = [];
    acc[gmw].push(match);
    return acc;
  }, {});

  const weeks = Object.keys(grouped).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-12">
      {weeks.map((week) => (
        <section key={week}>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-white whitespace-nowrap">Game Week {week}</h3>
            <div className="h-px w-full bg-white/5"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grouped[week].map((match: Match) => (
              <Link 
                key={match._id} 
                href={`/match/${match._id}`}
                className={cn(
                  "group relative bg-bg-card border border-white/5 rounded-2xl p-5 hover:border-primary/50 transition-all shadow-soft overflow-hidden",
                  match.status === 'live' && "border-primary/50 ring-1 ring-primary/20 glow-red"
                )}
              >
                {match.status === 'live' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[10px] font-bold text-white uppercase tracking-tighter rounded-bl-lg animate-pulse">
                    Live
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  {/* Home Team */}
                  <div className="flex-1 text-right">
                    <span className="font-bold text-white group-hover:text-primary transition-colors block truncate">
                      {match.homeTeam?.name || 'BYE'}
                    </span>
                  </div>

                  {/* Score / VS Overlay */}
                  <div className="flex flex-col items-center justify-center min-w-[80px] bg-white/5 rounded-xl py-2 px-3 border border-white/5">
                    {match.status === 'pending' ? (
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest italic">VS</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white">{match.score?.home ?? match.homeScore ?? 0}</span>
                        <span className="text-text-muted opacity-50">-</span>
                        <span className="text-xl font-black text-white">{match.score?.away ?? match.awayScore ?? 0}</span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 text-left">
                    <span className="font-bold text-white group-hover:text-primary transition-colors block truncate">
                      {match.awayTeam?.name || 'BYE'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted font-medium uppercase tracking-wider">
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md">
                    <Calendar size={12} />
                    {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="flex items-center gap-1 hover:text-primary">
                    Details <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default FixtureList;
