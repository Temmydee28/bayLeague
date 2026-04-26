"use client";

import React from 'react';
import { Trophy, User, ArrowRight, Star } from 'lucide-react';

interface Event {
  type: 'goal' | 'card' | 'sub';
  minute: number;
  playerName: string;
  assist?: string;
  team: string; // 'home' or 'away'
}

interface Props {
  events: Event[];
  homeTeamName: string;
  awayTeamName: string;
}

const Timeline: React.FC<Props> = ({ events, homeTeamName, awayTeamName }) => {
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  return (
    <div className="relative">
      {/* Center Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 -translate-x-1/2 hidden md:block"></div>

      <div className="space-y-8 relative">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 bg-bg-card border border-dashed border-white/10 rounded-2xl">
            <p className="text-text-muted">Waiting for kick-off activities...</p>
          </div>
        ) : (
          sortedEvents.map((event, idx) => (
            <div key={idx} className={`flex items-center gap-4 md:gap-0 ${event.team === 'home' ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              
              {/* Event Content */}
              <div className={`flex-1 ${event.team === 'home' ? 'md:text-right' : 'md:text-left'}`}>
                <div className={`inline-block bg-bg-card border border-white/10 p-4 rounded-xl shadow-lg relative overflow-hidden group hover:border-primary/30 transition-all ${event.team === 'home' ? 'md:mr-8' : 'md:ml-8'}`}>
                  
                  {/* Backdrop Minute */}
                  <div className="absolute -top-2 -right-2 text-4xl font-black text-white/[0.03] pointer-events-none group-hover:text-primary/5 transition-colors">
                    {event.minute}'
                  </div>

                  <div className={`flex items-center gap-3 ${event.team === 'home' ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                       <Trophy size={20} />
                    </div>
                    <div>
                      <div className="font-bold text-white leading-tight">Goal! {event.playerName}</div>
                      {event.assist && (
                        <div className="text-[10px] text-text-muted uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Star size={10} className="text-blue-500" /> Assist: {event.assist}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Minute Marker (Center) */}
              <div className="relative z-10 w-10 h-10 bg-primary border-4 border-bg-base rounded-full flex items-center justify-center text-[11px] font-black text-white shadow-xl">
                {event.minute}'
              </div>

              {/* Empty Spacer for desktop alignment */}
              <div className="flex-1 hidden md:block"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Timeline;
