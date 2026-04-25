import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [incomingSOS,    setIncomingSOS]    = useState(null);
  const [sharedLocations, setSharedLocations] = useState({});

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(process.env.REACT_APP_API_URL || 'localhost:5000');
    socketRef.current.emit('join', user._id);

    // Incoming SOS from a contact
    socketRef.current.on('sos:alert', (data) => {
      setIncomingSOS(data);
      if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 1000]);
      if (Notification.permission === 'granted') {
        new Notification(`🚨 SOS from ${data.userName}!`, { body: data.message });
      }
    });

    // Live location update from a contact
    socketRef.current.on('location:received', (data) => {
      setSharedLocations((prev) => ({ ...prev, [data.userId]: data }));
    });

    return () => socketRef.current?.disconnect();
  }, [user]);

  const emitLocation = (latitude, longitude, sharedWith) => {
    socketRef.current?.emit('location:update', { userId: user._id, latitude, longitude, sharedWith });
  };

  const triggerSOSSocket = (latitude, longitude, contacts) => {
    socketRef.current?.emit('sos:trigger', {
      userId: user._id, userName: user.name, latitude, longitude,
      contacts: contacts.map((c) => c.appUserId).filter(Boolean)
    });
  };

  return (
    <SocketContext.Provider value={{ emitLocation, triggerSOSSocket, incomingSOS, sharedLocations, setIncomingSOS }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
