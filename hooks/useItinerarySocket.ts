// hooks/useItinerarySocket.ts
import { API_URL } from '@/api/client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketOptions {
  itineraryId: string;
  userId: string;
  onEvents?: {
    fieldLocked?: (data: { field: string; userId: string }) => void;
    fieldUnlocked?: (data: { field: string }) => void;
    userJoined?: (data: { userId: string }) => void;
    suggestedChange?: (data: {
      userId: string;
      field: string;
      value: any;
      id: string;
    }) => void;
    changeLogged?: (data: any) => void;
  };
}

export function useItinerarySocket({ itineraryId, userId, onEvents }: SocketOptions) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${API_URL}/itinerary`, {
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Join room
    socket.emit('joinRoom', { itineraryId, userId });

    // Listen to events
    socket.on('fieldLocked', onEvents?.fieldLocked || (() => {}));
    socket.on('fieldUnlocked', onEvents?.fieldUnlocked || (() => {}));
    socket.on('userJoined', onEvents?.userJoined || (() => {}));
    socket.on('suggestedChange', onEvents?.suggestedChange || (() => {}));
    socket.on('changeLogged', onEvents?.changeLogged || (() => {}));

    return () => {
      socket.disconnect();
    };
  }, [itineraryId, userId]);

  const emit = (event: string, payload: any) => {
    socketRef.current?.emit(event, payload);
  };

  return {
    emit,
    startEditing: (field: string) => {
      emit('startEditing', { itineraryId, userId, field });
    },
    stopEditing: (field: string) =>
      emit('stopEditing', { itineraryId, userId, field }),
    suggestChange: (field: string, value: any) =>
      emit('suggestChange', { itineraryId, userId, field, value }),
    logChange: (field: string, newValue: any) =>
      emit('logChange', {
        itineraryId,
        userId,
        field,
        // previousValue,
        newValue,
        type: 'update_field', // optional type enum
      }),
    undo: () => emit('undoChange', { itineraryId, userId }),
  };
}