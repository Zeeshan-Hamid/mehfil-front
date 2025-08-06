'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import styles from './NotificationBell.module.css';

const NotificationBell = ({ 
  customIcon = null,
  customBadgeColor = '#FF4444',
  customSize = 24,
  customStyles = {},
  dropdownPosition = 'right',
  showDropdown = true,
  iconSrc = '/notification_bell_icon.png'
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const bellRef = useRef(null);
  const { unreadCount } = useNotifications();

  console.log('🔔 [NotificationBell] Rendered with unreadCount:', unreadCount);

  const handleBellClick = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  const getDropdownStyles = () => {
    const baseStyles = {
      position: 'absolute',
      top: '100%',
      zIndex: 1000,
      marginTop: '8px'
    };

    switch (dropdownPosition) {
      case 'left':
        return { ...baseStyles, right: 0 };
      case 'center':
        return { ...baseStyles, left: '50%', transform: 'translateX(-50%)' };
      case 'right':
      default:
        return { ...baseStyles, right: 0 };
    }
  };

  return (
    <div className={styles.bellContainer} style={{ position: 'relative' }}>
      <button
        ref={bellRef}
        className={styles.bellButton}
        onClick={handleBellClick}
        style={customStyles}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        {customIcon ? (
          customIcon
        ) : (
          <Image
            src={iconSrc}
            alt="Notifications"
            width={customSize}
            height={customSize}
            className={styles.bellIcon}
            style={{ 
              width: `${customSize}px`, 
              height: `${customSize}px`,
              objectFit: 'contain'
            }}
          />
        )}
        
        {unreadCount > 0 && (
          <span 
            className={styles.badge}
            style={{ backgroundColor: customBadgeColor }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          isOpen={isDropdownOpen}
          onClose={handleCloseDropdown}
          bellRef={bellRef}
          customStyles={getDropdownStyles()}
        />
      )}
    </div>
  );
};

export default NotificationBell;