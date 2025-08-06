'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';
import styles from './NotificationDropdown.module.css';

const NotificationDropdown = ({ 
  isOpen, 
  onClose, 
  bellRef,
  customStyles = {},
  showHeader = true,
  maxHeight = '400px'
}) => {
  const dropdownRef = useRef(null);
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    refresh
  } = useNotifications();

  console.log('🔔 [NotificationDropdown] State:', {
    isOpen,
    notifications: notifications?.length || 0,
    unreadCount,
    loading,
    hasMore
  });

  const [localLoading, setLocalLoading] = useState(false);
  const [hasMarkedVisibleAsRead, setHasMarkedVisibleAsRead] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, bellRef]);

  // Auto-mark visible unread notifications as read when dropdown opens
  useEffect(() => {
    if (isOpen && !hasMarkedVisibleAsRead && notifications.length > 0) {
      console.log('🔔 [NotificationDropdown] Auto-marking visible unread notifications as read');
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0) {
        console.log('🔔 [NotificationDropdown] Found unread notifications:', unreadNotifications.length);
        
        // Mark each unread notification as read with a small delay to avoid overwhelming the API
        unreadNotifications.forEach((notification, index) => {
          setTimeout(() => {
            markAsRead(notification._id);
          }, index * 100); // 100ms delay between each request
        });
        
        setHasMarkedVisibleAsRead(true);
      }
    }
    
    // Reset when dropdown closes
    if (!isOpen) {
      setHasMarkedVisibleAsRead(false);
    }
  }, [isOpen, notifications, hasMarkedVisibleAsRead, markAsRead]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    
    // Handle message notifications - redirect to messages page
    if (notification.type === 'message' || notification.type === 'vendor_inquiry') {
      // Extract vendor and event information from notification data
      const vendorId = notification.data?.vendorId || notification.data?.senderId;
      const eventId = notification.data?.eventId;
      
      if (vendorId) {
        // Redirect to customer profile dashboard messages tab with conversation parameters
        const redirectUrl = `/customer_profile_dash?tab=Messages${vendorId ? `&vendorId=${vendorId}` : ''}${eventId ? `&eventId=${eventId}` : ''}`;
        console.log('🔔 [NotificationDropdown] Redirecting to messages:', redirectUrl);
        router.push(redirectUrl);
      } else {
        // Fallback to messages tab without specific conversation
        router.push('/customer_profile_dash?tab=Messages');
      }
    } else if (notification.actionUrl) {
      // Handle other notification types with actionUrl
      window.location.href = notification.actionUrl;
    }
    
    onClose();
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    setLocalLoading(true);
    try {
      await markAllAsRead();
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle load more
  const handleLoadMore = async () => {
    setLocalLoading(true);
    try {
      await loadMore();
    } finally {
      setLocalLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setLocalLoading(true);
    try {
      await refresh();
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) return null;

  const hasUnreadNotifications = unreadCount > 0;
  const hasNotifications = notifications.length > 0;

  return (
    <div 
      ref={dropdownRef}
      className={styles.dropdown}
      style={{
        maxHeight,
        ...customStyles
      }}
    >
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.title}>
            Notifications
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount}</span>
            )}
          </div>
          <div className={styles.actions}>
            <button
              onClick={handleRefresh}
              className={styles.actionBtn}
              disabled={loading || localLoading}
              title="Refresh"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
            </button>
            {hasUnreadNotifications && (
              <button
                onClick={handleMarkAllAsRead}
                className={styles.actionBtn}
                disabled={loading || localLoading}
                title="Mark all as read"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      <div className={styles.content}>
        {loading && notifications.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <span>Loading notifications...</span>
          </div>
        ) : !hasNotifications ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <div className={styles.emptyText}>No notifications yet</div>
            <button onClick={handleRefresh} className={styles.refreshBtn}>
              Refresh
            </button>
          </div>
        ) : (
          <>
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                  onMarkAsRead={() => markAsRead(notification._id)}
                  onDelete={() => deleteNotification(notification._id)}
                />
              ))}
            </div>
            
            {hasMore && (
              <div className={styles.loadMore}>
                <button
                  onClick={handleLoadMore}
                  className={styles.loadMoreBtn}
                  disabled={loading || localLoading}
                >
                  {loading || localLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;