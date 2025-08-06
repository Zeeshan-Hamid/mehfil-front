/**
 * Frontend Image Optimization Utility
 * Helps optimize images before upload to reduce file size and improve performance
 */

// Maximum file size for chat images (2MB)
const MAX_CHAT_IMAGE_SIZE = 2 * 1024 * 1024;

// Maximum dimensions for chat images
const MAX_CHAT_IMAGE_WIDTH = 800;
const MAX_CHAT_IMAGE_HEIGHT = 600;

/**
 * Compress and resize image for chat messages
 * @param {File} file - The image file to optimize
 * @returns {Promise<File>} - Optimized image file
 */
export const optimizeImageForChat = async (file) => {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    // Check file size
    if (file.size > MAX_CHAT_IMAGE_SIZE) {
      console.warn('⚠️ [ImageOptimizer] Image size exceeds 2MB limit:', file.size);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > MAX_CHAT_IMAGE_WIDTH || height > MAX_CHAT_IMAGE_HEIGHT) {
        const ratio = Math.min(
          MAX_CHAT_IMAGE_WIDTH / width,
          MAX_CHAT_IMAGE_HEIGHT / height
        );
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob with compression
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new file with optimized data
          const optimizedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          console.log('✅ [ImageOptimizer] Image optimized:', {
            originalSize: file.size,
            optimizedSize: optimizedFile.size,
            originalDimensions: `${img.naturalWidth}x${img.naturalHeight}`,
            optimizedDimensions: `${width}x${height}`,
          });

          resolve(optimizedFile);
        },
        'image/jpeg',
        0.8 // 80% quality for good balance
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validate image file for chat upload
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result with isValid and message
 */
export const validateImageForChat = (file) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      message: 'Please select an image file (JPEG, PNG, GIF, etc.)'
    };
  }

  // Check file size (5MB limit for original upload, will be optimized)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Image file is too large. Please select an image smaller than 5MB.'
    };
  }

  return {
    isValid: true,
    message: 'Image is valid for upload'
  };
};

/**
 * Get image dimensions without loading the full image
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Create a preview URL for an image file
 * @param {File} file - The image file
 * @returns {string} - Preview URL
 */
export const createImagePreview = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Clean up preview URL to prevent memory leaks
 * @param {string} previewUrl - The preview URL to revoke
 */
export const cleanupImagePreview = (previewUrl) => {
  if (previewUrl && previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl);
  }
}; 