import React, { useState, useEffect, useRef } from 'react';
import styles from './CoverPhotosPanel.module.css';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import ProTipBox from './ProTipBox';
import { useListingEditStore } from '../../state/listingEditStore';
import DragAndDropContainer from './DragAndDropContainer';

function DragHandle() {
  return (
    <span className={styles.dragHandle} title="Drag to reorder">
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="5" r="1.5" fill="#757575"/>
        <circle cx="8" cy="12" r="1.5" fill="#757575"/>
        <circle cx="8" cy="19" r="1.5" fill="#757575"/>
      </svg>
    </span>
  );
}

function ensureTenSlots(arr) {
  const filled = arr.slice(0, 10);
  while (filled.length < 10) filled.push('');
  return filled;
}

function CoverPhotosPanel({ onBack }) {
  const coverPhotos = useListingEditStore(state => state.draft.coverPhotos);
  const setField = useListingEditStore(state => state.setField);
  const [input, setInput] = useState(ensureTenSlots(coverPhotos));
  const scrollRef = useRef(null);
  const bulkUploadRef = useRef(null);

  useEffect(() => {
    setInput(ensureTenSlots(coverPhotos));
  }, [coverPhotos]);

  const handleFileChange = (e, idx) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newArr = ensureTenSlots([...input]);
        newArr[idx] = reader.result;
        setInput(ensureTenSlots(newArr));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 10 files maximum
    const limitedFiles = files.slice(0, 10);
    
    // Find the first empty slot
    const firstEmptySlot = input.findIndex(img => !img || img.trim() === '');
    
    if (firstEmptySlot === -1) {
      alert('All 10 image slots are already filled. Please remove some images first.');
      return;
    }

    // Process each file
    limitedFiles.forEach((file, index) => {
      const slotIndex = firstEmptySlot + index;
      if (slotIndex >= 10) return; // Don't exceed 10 slots
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setInput(prevInput => {
          const newArr = [...prevInput];
          newArr[slotIndex] = reader.result;
          return ensureTenSlots(newArr);
        });
      };
      reader.readAsDataURL(file);
    });

    // Clear the input so the same files can be selected again if needed
    e.target.value = '';
  };

  const handleOrderChange = (newOrder) => {
    setInput(ensureTenSlots(newOrder));
  };

  const handleCancel = () => {
    setInput(ensureTenSlots(coverPhotos));
    if (onBack) onBack();
  };

  const handleSave = () => {
    setField('coverPhotos', ensureTenSlots(input));
    if (onBack) onBack();
  };

  const getUploadedCount = () => {
    return input.filter(img => img && img.trim() !== '').length;
  };

  return (
    <div className={styles.coverPhotosPanel}>
      <BackButton onClick={onBack} />
      <div className={styles.coverPhotosContentScrollable} ref={scrollRef}>
        <div className={styles.coverPhotosHeading}>Your cover photos</div>
        <ul className={styles.coverPhotosGuidelines}>
          <li>We recommend landscape-oriented photos with a 16:9 aspect ratio.</li>
          <li>Photos are automatically cropped from the center.</li>
          <li>Please do not use photos with watermarks.</li>
          <li>Max photo size: 10MB</li>
          <li>You can upload up to 10 cover photos</li>
        </ul>
        
        {/* Bulk Upload Section */}
        <div className={styles.bulkUploadSection}>
          <div className={styles.bulkUploadInfo}>
            <span className={styles.uploadCount}>{getUploadedCount()}/10 images uploaded</span>
          </div>
          <label className={styles.bulkUploadButton} htmlFor="bulk-upload-input">
            <input
              ref={bulkUploadRef}
              id="bulk-upload-input"
              type="file"
              accept="image/*"
              multiple
              className={styles.bulkUploadInput}
              onChange={handleBulkUpload}
            />
            Upload Multiple Images
          </label>
        </div>

        <DragAndDropContainer
          items={input}
          onOrderChange={handleOrderChange}
          renderItem={(img, slot) => (
            <div className={styles.coverPhotoSlot}>
              <DragHandle />
              <label className={styles.coverPhotoUpload} htmlFor={`cover-photo-input-${slot}`}>
                <input
                  id={`cover-photo-input-${slot}`}
                  type="file"
                  accept="image/*"
                  className={styles.coverPhotoInput}
                  onChange={e => handleFileChange(e, slot)}
                />
                {img && (
                  <img
                    src={img}
                    alt={`Cover ${slot + 1}`}
                    className={styles.coverPhotoPreview}
                  />
                )}
                <div className={styles.coverPhotoRequired}>
                  {slot === 0 ? 'Required' : `Photo ${slot + 1}`}
                </div>
              </label>
              <div className={styles.coverPhotoTip}>
                {slot === 0 ? 'Pro tip: A horizontal photo will look best.' : 'Optional additional photo'}
              </div>
            </div>
          )}
        />
      </div>
      <ProTipBox storageKey="proTipCoverPhotos" />
      <SaveButton onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}

export default CoverPhotosPanel; 