import React, { useState, useEffect, useRef } from 'react';
import styles from './PhotoGalleryPanel.module.css';
import SaveButton from './SaveButton';
import BackButton from './BackButton';
import ProTipBox from './ProTipBox';
import { useListingEditStore } from '../../state/listingEditStore';

function UploadDoodle() {
  // Placeholder SVG doodle
  return (
    <svg width="120" height="107" viewBox="0 0 120 107" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="30" width="100" height="60" rx="10" fill="#F6EFFF" stroke="#AF8EBA" strokeWidth="2"/>
      <circle cx="60" cy="60" r="18" fill="#FDF9FF" stroke="#AF8EBA" strokeWidth="2"/>
      <path d="M40 80L60 50L80 80" stroke="#AF8EBA" strokeWidth="2"/>
      <circle cx="60" cy="60" r="4" fill="#AF8EBA"/>
      <rect x="50" y="20" width="20" height="10" rx="3" fill="#AF8EBA"/>
    </svg>
  );
}

function PhotoGalleryPanel({ onBack }) {
  const photoGallery = useListingEditStore(state => state.draft.photoGallery);
  const setField = useListingEditStore(state => state.setField);
  const [input, setInput] = useState(photoGallery || []);
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (
      !Array.isArray(photoGallery) ||
      photoGallery.length !== input.length ||
      photoGallery.some((v, i) => v !== input[i])
    ) {
      setInput(photoGallery || []);
    }
    // eslint-disable-next-line
  }, [photoGallery]);

  const handleFiles = files => {
    const arr = Array.from(files);
    const readers = arr.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(imgs => {
      setInput(prev => [...prev, ...imgs]);
    });
  };

  const handleFileChange = e => {
    handleFiles(e.target.files);
  };

  const handleDrop = e => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleCancel = () => {
    setInput(photoGallery || []);
    if (onBack) onBack();
  };

  const handleSave = () => {
    setField('photoGallery', input);
    if (onBack) onBack();
  };

  return (
    <div className={styles.photoGalleryPanel}>
      <BackButton onClick={onBack} />
      <div className={styles.photoGalleryContent}>
        <div className={styles.photoGalleryHeading}>Your photo gallery</div>
        <div className={styles.photoGallerySubheading}>Add photos showcasing your work.</div>
        <div className={styles.photoGalleryGuidelines}>
          <ul className={styles.photoGalleryGuidelinesUl}>
            <li className={styles.photoGalleryGuidelinesLi}>10 photos minimum (50 recommended)</li>
            <li className={styles.photoGalleryGuidelinesLi}>JPEG and PNG files under 10MB, please.</li>
          </ul>
        </div>
        <div
          className={
            styles.photoGalleryUploadArea +
            (dragActive ? ' ' + styles.photoGalleryUploadAreaActive : '')
          }
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className={styles.photoGalleryUploadDoodle}><UploadDoodle /></div>
          <div className={styles.photoGalleryUploadText}>Drag and drop watermark-free files here</div>
          <button
            className={styles.photoGalleryUploadBtn}
            type="button"
            onClick={e => {
              e.stopPropagation();
              fileInputRef.current && fileInputRef.current.click();
            }}
          >
            Upload
          </button>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
        {/* Show previews of uploaded images */}
        {input.length > 0 && (
          <div className={styles.photoGalleryPreviewGrid}>
            {input.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Gallery ${idx + 1}`}
                className={styles.photoGalleryPreviewImg}
              />
            ))}
          </div>
        )}
      </div>
      <ProTipBox storageKey="proTipPhotoGallery" />
      <SaveButton onCancel={handleCancel} onSave={handleSave} />
    </div>
  );
}

export default PhotoGalleryPanel; 