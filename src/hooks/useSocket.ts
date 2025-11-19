
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// const SOCKET_URL = 'http://localhost:4000'; 
const SOCKET_URL = "http://159.89.170.55"

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected:', socketRef.current?.id);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
};
