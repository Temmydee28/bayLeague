"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  joinTournament: (tournamentId: string) => void;
  leaveTournament: (tournamentId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinTournament = (tournamentId: string) => {
    if (socket) {
      socket.emit('joinTournament', tournamentId);
    }
  };

  const leaveTournament = (tournamentId: string) => {
    if (socket) {
      socket.emit('leaveTournament', tournamentId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinTournament, leaveTournament }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
