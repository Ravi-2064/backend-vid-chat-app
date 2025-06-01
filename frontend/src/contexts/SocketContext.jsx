import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { handleNetworkError } from '../utils/errorHandler';

// Create and export the context
export const SocketContext = createContext(null);

// Create and export the hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Create and export the provider component
export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Create socket connection with proper configuration
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      console.error('Socket connection error:', error);
      handleNetworkError(error);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  const joinRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit('leave_room', roomId);
    }
  };

  const sendMessage = (roomId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', { roomId, message });
    }
  };

  const value = {
    socket,
    isConnected,
    reconnect,
    joinRoom,
    leaveRoom,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 