'use client';

import React from 'react';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { useNotificationSocket } from '../../hooks/useNotificationSocket';

// Component to initialize notification socket
const NotificationSocketProvider = ({ children }) => {
  useNotificationSocket();
  return children;
};

// Main app provider that wraps notification functionality
export const AppProvider = ({ children }) => {
  return (
    <NotificationProvider>
      <NotificationSocketProvider>
        {children}
      </NotificationSocketProvider>
    </NotificationProvider>
  );
};

export default AppProvider;