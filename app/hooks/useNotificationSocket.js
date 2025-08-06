'use client';

import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useUserStore } from '../state/userStore';
import socketService from '../utils/socketService';

export const useNotificationSocket = () => {
  const { addNotification, updateUnreadCount, fetchUnreadCount } = useNotifications();
  const { token, user } = useUserStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    console.log('🔌 [useNotificationSocket] useEffect triggered', { 
      token: !!token, 
      user: !!user, 
      isInitialized: isInitialized.current 
    });
    
    if (!token || !user || isInitialized.current) {
      console.log('❌ [useNotificationSocket] Skipping socket setup - missing requirements');
      return;
    }

    console.log('🔌 [useNotificationSocket] Connecting to socket...');
    // Connect to socket using the singleton instance
    socketService.connect(token);

    // Set up notification event listeners
    const setupNotificationListeners = () => {
      const socket = socketService.socket;
      console.log('🔌 [useNotificationSocket] Setting up listeners, socket exists:', !!socket);
      if (!socket) return;

                  // Set up notification handler
            socketService.onNotification((data) => {
              console.log('🔔 [NotificationSocket] Received notification event:', data);
              
              if (data.notification) {
                addNotification(data.notification);
                
                // Optional: Play notification sound or show browser notification
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification(data.notification.title, {
                    body: data.notification.message,
                    icon: '/logo.png', // Use your app icon
                    tag: data.notification._id
                  });
                }
              } else if (data.type === 'unread_count_update' && typeof data.data.unreadCount === 'number') {
                updateUnreadCount(data.data.unreadCount);
              } else if (data.type === 'notification_read_success' && typeof data.data.unreadCount === 'number') {
                updateUnreadCount(data.data.unreadCount);
              } else if (data.type === 'notification_error') {
                console.error('❌ [NotificationSocket] Notification error:', data.data);
              }
            });

      console.log('🔔 [NotificationSocket] Notification listeners set up');
    };

    // Wait for socket connection
    let connectionAttempts = 0;
    const maxAttempts = 10;
    
    const checkConnection = () => {
      connectionAttempts++;
      console.log(`🔌 [useNotificationSocket] Checking connection attempt ${connectionAttempts}/${maxAttempts}`);
      
      if (socketService.isConnected) {
        console.log('✅ [useNotificationSocket] Socket connected, setting up listeners');
        setupNotificationListeners();
        // Fetch initial unread count
        fetchUnreadCount();
        isInitialized.current = true;
      } else if (connectionAttempts < maxAttempts) {
        console.log('⏳ [useNotificationSocket] Socket not connected yet, retrying...');
        // Retry after a short delay
        setTimeout(checkConnection, 1000);
      } else {
        console.log('❌ [useNotificationSocket] Failed to connect after max attempts');
      }
    };

    checkConnection();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('📧 [NotificationSocket] Notification permission:', permission);
      });
    }

                // Cleanup on unmount or token change
            return () => {
              socketService.offNotification();
              console.log('🔔 [NotificationSocket] Notification listeners cleaned up');
              isInitialized.current = false;
            };
  }, [token, user, addNotification, updateUnreadCount, fetchUnreadCount]);

  // Helper functions for socket notification actions
  const markNotificationAsReadViaSocket = (notificationId) => {
    if (socketService.socket) {
      socketService.socket.emit('mark_notification_read', { notificationId });
    }
  };

  const getNotificationsViaSocket = (options = {}) => {
    if (socketService.socket) {
      socketService.socket.emit('get_notifications', options);
    }
  };

  return {
    isConnected: socketService.isConnected || false,
    markNotificationAsReadViaSocket,
    getNotificationsViaSocket
  };
};