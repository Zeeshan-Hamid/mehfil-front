'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../utils/api';
import { useUserStore } from '../state/userStore';

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  isInitialized: false
};

// Action types
const NOTIFICATION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATIONS: 'SET_NOTIFICATIONS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  APPEND_NOTIFICATIONS: 'APPEND_NOTIFICATIONS',
  UPDATE_NOTIFICATION: 'UPDATE_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_UNREAD_COUNT: 'SET_UNREAD_COUNT',
  MARK_AS_READ: 'MARK_AS_READ',
  MARK_ALL_AS_READ: 'MARK_ALL_AS_READ',
  SET_PAGE: 'SET_PAGE',
  SET_HAS_MORE: 'SET_HAS_MORE',
  RESET: 'RESET',
  SET_INITIALIZED: 'SET_INITIALIZED'
};

// Reducer function
function notificationReducer(state, action) {
  switch (action.type) {
    case NOTIFICATION_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case NOTIFICATION_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case NOTIFICATION_ACTIONS.SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null,
        page: 1
      };
    
    case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1
      };
    
    case NOTIFICATION_ACTIONS.APPEND_NOTIFICATIONS:
      return {
        ...state,
        notifications: [...state.notifications, ...action.payload],
        loading: false,
        error: null
      };
    
    case NOTIFICATION_ACTIONS.UPDATE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload._id ? action.payload : notification
        )
      };
    
    case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification._id !== action.payload),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case NOTIFICATION_ACTIONS.SET_UNREAD_COUNT:
      return { ...state, unreadCount: action.payload };
    
    case NOTIFICATION_ACTIONS.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification._id === action.payload ? { ...notification, isRead: true, readAt: new Date() } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case NOTIFICATION_ACTIONS.MARK_ALL_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, isRead: true, readAt: new Date() })),
        unreadCount: 0
      };
    
    case NOTIFICATION_ACTIONS.SET_PAGE:
      return { ...state, page: action.payload };
    
    case NOTIFICATION_ACTIONS.SET_HAS_MORE:
      return { ...state, hasMore: action.payload };
    
    case NOTIFICATION_ACTIONS.SET_INITIALIZED:
      return { ...state, isInitialized: action.payload };
    
    case NOTIFICATION_ACTIONS.RESET:
      return { ...initialState };
    
    default:
      return state;
  }
}

// Create context
const NotificationContext = createContext();

// Provider component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, token } = useUserStore();

  // Fetch notifications
  const fetchNotifications = useCallback(async (options = {}) => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    console.log('🔍 [NotificationContext] fetchNotifications called', { 
      token: !!actualToken, 
      user: !!user, 
      options,
      userStoreToken: !!token,
      localStorageToken: !!(typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null)
    });
    
    if (!actualToken) {
      console.log('❌ [NotificationContext] No token available');
      return;
    }

    try {
      dispatch({ type: NOTIFICATION_ACTIONS.SET_LOADING, payload: true });
      console.log('📡 [NotificationContext] Starting to fetch notifications...');
      
      const { page = 1, limit = 20, type = null, unreadOnly = false } = options;
      
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(type && { type }),
        ...(unreadOnly && { unreadOnly: 'true' })
      };

      console.log('📡 [NotificationContext] API params:', params);
      
      const response = await apiService.getNotifications(params);
      console.log('📨 [NotificationContext] API response:', response);
      
      if (response.status === 'success') {
        console.log('✅ [NotificationContext] Notifications fetched successfully:', response.data.notifications?.length || 0);
        
        if (page === 1) {
          dispatch({ type: NOTIFICATION_ACTIONS.SET_NOTIFICATIONS, payload: response.data.notifications });
        } else {
          dispatch({ type: NOTIFICATION_ACTIONS.APPEND_NOTIFICATIONS, payload: response.data.notifications });
        }
        
        dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: response.data.unreadCount });
        dispatch({ type: NOTIFICATION_ACTIONS.SET_PAGE, payload: page });
        dispatch({ type: NOTIFICATION_ACTIONS.SET_HAS_MORE, payload: response.data.pagination?.hasMore || false });
        
        if (!state.isInitialized) {
          dispatch({ type: NOTIFICATION_ACTIONS.SET_INITIALIZED, payload: true });
        }
      } else {
        console.log('❌ [NotificationContext] API response not successful:', response);
        dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: 'Failed to fetch notifications' });
      }
    } catch (error) {
      console.error('❌ [NotificationContext] Error fetching notifications:', error);
      dispatch({ type: NOTIFICATION_ACTIONS.SET_ERROR, payload: error.message });
    }
  }, [token, state.isInitialized, user]);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    console.log('🔢 [NotificationContext] fetchUnreadCount called', { token: !!actualToken });
    
    if (!actualToken) {
      console.log('❌ [NotificationContext] No token available for unread count');
      return;
    }

    try {
      console.log('📡 [NotificationContext] Fetching unread count...');
      const response = await apiService.getUnreadNotificationCount();
      console.log('📨 [NotificationContext] Unread count response:', response);
      
      if (response.status === 'success') {
        console.log('✅ [NotificationContext] Unread count fetched successfully:', response.data.unreadCount);
        dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: response.data.unreadCount });
      } else {
        console.log('❌ [NotificationContext] Unread count response not successful:', response);
      }
    } catch (error) {
      console.error('❌ [NotificationContext] Error fetching unread count:', error);
    }
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    if (!actualToken) return;

    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      if (response.data.status === 'success') {
        dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: notificationId });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [token]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (notificationIds = []) => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    if (!actualToken) return;

    try {
      const response = await apiService.markNotificationsAsRead(notificationIds);
      if (response.data.status === 'success') {
        if (notificationIds.length === 0) {
          // Mark all as read
          dispatch({ type: NOTIFICATION_ACTIONS.MARK_ALL_AS_READ });
        } else {
          // Mark specific ones as read
          notificationIds.forEach(id => {
            dispatch({ type: NOTIFICATION_ACTIONS.MARK_AS_READ, payload: id });
          });
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  }, [token]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    if (!actualToken) return;

    try {
      const response = await apiService.deleteNotification(notificationId);
      if (response.data.status === 'success') {
        dispatch({ type: NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION, payload: notificationId });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [token]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification) => {
    console.log('🔔 [NotificationContext] Adding new notification via socket:', notification);
    dispatch({ type: NOTIFICATION_ACTIONS.ADD_NOTIFICATION, payload: notification });
  }, []);

  // Update unread count (for real-time updates)
  const updateUnreadCount = useCallback((count) => {
    console.log('🔢 [NotificationContext] Updating unread count via socket:', count);
    dispatch({ type: NOTIFICATION_ACTIONS.SET_UNREAD_COUNT, payload: count });
  }, []);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchNotifications({ page: state.page + 1 });
    }
  }, [state.hasMore, state.loading, state.page, fetchNotifications]);

  // Initialize notifications when user logs in
  useEffect(() => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    console.log('🚀 [NotificationContext] useEffect triggered', { 
      user: !!user, 
      token: !!actualToken, 
      isInitialized: state.isInitialized 
    });
    
    if (user && actualToken && !state.isInitialized) {
      console.log('🚀 [NotificationContext] Starting initial fetch...');
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user, token, state.isInitialized, fetchNotifications, fetchUnreadCount]);

  // Reset when user logs out
  useEffect(() => {
    const actualToken = token || (typeof window !== 'undefined' ? localStorage.getItem('MehfilToken') : null);
    if (!user || !actualToken) {
      console.log('🔄 [NotificationContext] Resetting due to no user/token');
      dispatch({ type: NOTIFICATION_ACTIONS.RESET });
    }
  }, [user, token]);

  const value = {
    // State
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    isInitialized: state.isInitialized,
    
    // Actions
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markMultipleAsRead,
    deleteNotification,
    addNotification,
    updateUnreadCount,
    loadMore,
    
    // Utils
    refresh: () => fetchNotifications({ page: 1 }),
    markAllAsRead: () => markMultipleAsRead([])
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;