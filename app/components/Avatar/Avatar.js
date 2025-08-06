'use client';

import { useState } from 'react';
import { generateInitials, generateAvatarColor } from '../../utils/avatarUtils';
import styles from './Avatar.module.css';

export default function Avatar({ 
  user, 
  size = 'medium', 
  className = '',
  showOnlineIndicator = false,
  isOnline = false 
}) {
  const [imageError, setImageError] = useState(false);
  
  const name = user?.name || 'Unknown';
  const profileImage = user?.profileImage;
  const initials = generateInitials(name);
  const backgroundColor = generateAvatarColor(name);
  
  const sizeClass = styles[size] || styles.medium;
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  // Show initials if no image or image failed to load
  const showInitials = !profileImage || imageError;
  
  return (
    <div className={`${styles.avatarContainer} ${sizeClass} ${className}`}>
      <div 
        className={styles.avatar}
        style={showInitials ? { backgroundColor } : {}}
      >
        {showInitials ? (
          <span className={styles.initials}>{initials}</span>
        ) : (
          <img 
            src={profileImage}
            alt={name}
            onError={handleImageError}
            className={styles.image}
          />
        )}
      </div>
      {showOnlineIndicator && isOnline && (
        <div className={styles.onlineIndicator}></div>
      )}
    </div>
  );
}