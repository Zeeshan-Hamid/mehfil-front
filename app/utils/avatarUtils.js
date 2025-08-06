/**
 * Utility functions for handling user avatars and profile pictures
 */

/**
 * Generate initials from a name
 * @param {string} name - The full name
 * @returns {string} - The initials (max 2 characters)
 */
export const generateInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return '?';
  }
  
  const names = fullName.trim().split(' ');
  if (names.length === 0) {
    return '?';
  }
  
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  
  // Return first letter of first name and first letter of last name
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get avatar URL or initials for a user
 * @param {object} user - User object with name and profileImage
 * @returns {object} - Object with { type: 'image' | 'initials', value: string }
 */
export const getAvatarData = (user) => {
  const name = user?.name || 'Unknown';
  const profileImage = user?.profileImage;
  
  if (profileImage && profileImage.trim() !== '') {
    return {
      type: 'image',
      value: profileImage
    };
  }
  
  return {
    type: 'initials',
    value: generateInitials(name)
  };
};



// Function to get a color based on initials for consistent avatar colors
export const getAvatarColor = (initials) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  
  const index = initials.charCodeAt(0) % colors.length;
  return colors[index];
};

// Alias for backward compatibility
export const generateAvatarColor = getAvatarColor;