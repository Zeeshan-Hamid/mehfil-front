'use client';

import React from 'react';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';

// Component to initialize notification socket
const NotificationSocketInitializer = ({ children }) => {
  useNotificationSocket();
  return children;
};

// Global notification provider that should wrap the entire app
export const GlobalNotificationProvider = ({ children }) => {
  return (
    <NotificationProvider>
      <NotificationSocketInitializer>
        {children}
      </NotificationSocketInitializer>
    </NotificationProvider>
  );
};

export default GlobalNotificationProvider;