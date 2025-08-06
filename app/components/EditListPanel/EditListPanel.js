"use client";
import { useState, useEffect } from 'react';
import NamePanel from '../panels/NamePanel';
import EventTypePanel from '../panels/EventTypePanel';
import CoverPhotosPanel from '../panels/CoverPhotosPanel';
import PhotoGalleryPanel from '../panels/PhotoGalleryPanel';
import PackagesPanel from '../panels/PackagesPanel';
import LocationPanel from '../panels/LocationPanel';
import DescriptionPanel from '../panels/DescriptionPanel';
import ServicesProvidedPanel from '../panels/ServicesProvidedPanel';
import SaveButton from '../panels/SaveButton';
import { useListingEditStore } from '../../state/listingEditStore';
import styles from './EditListPanel.module.css';
import { useRouter } from 'next/navigation';

// Function to determine section status based on actual data
function getSectionStatus(draft, sectionLabel) {
  switch (sectionLabel) {
    case 'Name':
      return (draft.name && draft.name.trim().length > 0) ? 'complete' : 'incomplete';
    case 'Cover Images':
      return (draft.coverPhotos && draft.coverPhotos.length > 0 && draft.coverPhotos.some(img => img && img.trim() !== '')) ? 'complete' : 'incomplete';
    case 'Event Type':
      return (draft.eventType && draft.eventType.length > 0) ? 'complete' : 'incomplete';
    case 'Services Provided':
      return (draft.servicesProvided && draft.servicesProvided.length > 0) ? 'complete' : 'incomplete';
    case 'Drescription':
    case 'Description':
      return (draft.description && draft.description.trim().length >= 20) ? 'complete' : 'incomplete';
    case 'Packages':
      return (draft.packages && draft.packages.length > 0) ? 'complete' : 'incomplete';
    case 'Location':
      if (typeof draft.location === 'object' && draft.location) {
        return (draft.location.city && draft.location.state && (draft.location.zip || draft.location.zipCode)) ? 'complete' : 'incomplete';
      }
      return (draft.location && draft.location.trim().length > 0) ? 'complete' : 'incomplete';
    default:
      return 'incomplete';
  }
}

const mainSections = [
  { label: 'Name' },
  { label: 'Cover Images' },
  { label: 'Event Type' },
  { label: 'Services Provided' },
  { label: 'Drescription' },
  { label: 'Packages' },
  { label: "Location" },
];

const eventTypes = [
  "Wedding",
  "Birthday",
  "Corporate Event",
  "Engagement",
  "Anniversary",
  "Baby Shower",
  "Conference",
  "Workshop",
  "Other"
];

export default function EditListPanel({ 
  isEditMode = false, 
  eventData = null, 
  eventId = null,
  mobileActiveTab = null,
  onMobileClose = null
}) {
  const [panel, setPanel] = useState('main');
  const draft = useListingEditStore(state => state.draft);
  const resetDraft = useListingEditStore(state => state.resetDraft);
  const saveListing = useListingEditStore(state => state.saveListing);
  const setDraft = useListingEditStore(state => state.setDraft);
  const router = useRouter();
  
  // Debug: Log current draft state
  console.log('Current draft state:', draft);

  // Handle mobile tab navigation
  useEffect(() => {
    if (mobileActiveTab) {
      // Map mobile tab to panel
      const tabToPanel = {
        'name': 'name',
        'coverPhotos': 'coverPhotos',
        'eventType': 'eventType',
        'servicesProvided': 'servicesProvided',
        'description': 'description',
        'packages': 'packages',
        'location': 'location'
      };
      
      const targetPanel = tabToPanel[mobileActiveTab];
      if (targetPanel) {
        setPanel(targetPanel);
      }
    }
  }, [mobileActiveTab]);

  // Populate draft with existing event data when in edit mode
  useEffect(() => {
    console.log('EditListPanel useEffect triggered:', { isEditMode, eventData });
    
    if (isEditMode && eventData) {
      console.log('Populating draft with event data:', eventData);
      
      // Reset draft first to ensure clean state
      resetDraft();
      
      // Small delay to ensure reset is complete
      setTimeout(() => {
        // Transform the event data to match the draft structure
        const populatedDraft = {
          name: eventData.name || '',
          eventType: eventData.eventType ? [eventData.eventType] : [], // Convert string to array
          description: eventData.description || '',
          coverPhotos: eventData.imageUrls || [],
          packages: eventData.packages || [],
          location: eventData.location || '', // Keep as object if it exists, otherwise empty string
          servicesProvided: eventData.services || [],
          tags: eventData.tags || []
        };
        
        console.log('Transformed draft data:', populatedDraft);
        setDraft(populatedDraft);
      }, 100);
    }
  }, [isEditMode, eventData, setDraft, resetDraft]);

  // Save listing to account with API integration
  async function saveListingToAccount() {
    try {
      // Show loading state
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.textContent = isEditMode ? 'Updating...' : 'Saving...';
      }
      
      const response = await saveListing(isEditMode, eventId); // Pass edit mode and event ID
      
      // Clear the draft after successful save
      resetDraft();
      
      // Redirect to profile_listing after success
      router.push('/profile_listing');
      
    } catch (error) {
      console.error('Error saving listing:', error);
      
      // Show specific error messages based on error type
      let errorMessage = isEditMode ? 'Error updating listing' : 'Error saving listing';
      if (error.message.includes('required fields')) {
        errorMessage = error.message;
      } else if (error.message.includes('image')) {
        errorMessage = 'Please upload at least one cover image';
      } else if (error.message.includes('409')) {
        errorMessage = 'An event with this name and type already exists. Please choose a different name or type.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Please log in again to save your listing.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      // Reset button state
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = isEditMode ? 'Update Listing' : 'Save Listing';
      }
    }
  }

  function handleCancel() {
    const message = isEditMode 
      ? 'Are you sure you want to reset all changes? This will revert to the original data.'
      : 'Are you sure you want to reset all changes?';
      
    if (window.confirm(message)) {
      resetDraft();
    }
  }

  // Handle back navigation for mobile
  const handleBack = () => {
    if (onMobileClose) {
      onMobileClose();
    } else {
      setPanel('main');
    }
  };

  return (
    <aside className={styles['listing-create-edit-sidebar']}>
      <div className={styles['sidebar-title']} style={{ marginBottom: 12 }}>
        {isEditMode ? 'Edit your listing' : 'Create your listing'}
      </div>
      <div className={`${styles['sidebar-section-list']} ${styles['sidebar-panel-stack']}`}>
        {/* Main Panel - Only show on desktop */}
        {!mobileActiveTab && (
          <div className={`${styles['sidebar-panel']} ${styles['main-panel']}${panel === 'main' ? ` ${styles.active}` : ''}`}> 
            <div className={styles['sidebar-section-divider']} />
            {mainSections.map((section, idx) => {
              const status = getSectionStatus(draft, section.label);
              return (
                <div key={section.label}>
                  <button
                    className={styles['sidebar-section-btn']}
                    onClick={() => {
                      if (section.label === 'Name') setPanel('name');
                      else if (section.label === 'Cover Images') setPanel('coverPhotos');
                      else if (section.label === 'Event Type') setPanel('eventType');
                      else if (section.label === 'Packages') setPanel('packages');
                      else if (section.label === 'Location') setPanel('location');
                      else if (section.label === 'Drescription' || section.label === 'Description') setPanel('description');
                      else if (section.label === 'Services Provided') setPanel('servicesProvided');
                    }}
                  >
                    <span className={styles['sidebar-section-label']}>{section.label}</span>
                    <span className={styles['sidebar-section-status']}>
                      {status === 'complete' ? (
                        <span className={`${styles['status-icon']} ${styles['status-complete']}`}>✔️</span>
                      ) : (
                        <span className={`${styles['status-icon']} ${styles['status-incomplete']}`}>! </span>
                      )}
                    </span>
                    <span className={styles['sidebar-section-arrow']}>›</span>
                  </button>
                  <div className={styles['sidebar-section-divider']} />
                </div>
              );
            })}
            {/* Sticky Save/Cancel for main panel */}
            {panel === 'main' && (
              <div className={styles.stickySaveBar}>
                <SaveButton
                  onSave={saveListingToAccount}
                  onCancel={handleCancel}
                  saveText={isEditMode ? "Update Listing" : "Save Listing"}
                  cancelText="Reset"
                />
              </div>
            )}
          </div>
        )}
        
        {/* Name Input Panel */}
        {panel === 'name' && (
          <NamePanel onBack={handleBack} />
        )}
        {/* Cover Photos Input Panel */}
        {panel === 'coverPhotos' && (
          <CoverPhotosPanel onBack={handleBack} />
        )}
        {/* Event Type Input Panel */}
        {panel === 'eventType' && (
          <EventTypePanel onBack={handleBack} />
        )}
        {/* Packages Input Panel */}
        {panel === 'packages' && (
          <PackagesPanel onBack={handleBack} />
        )}
        {/* Location Input Panel */}
        {panel === 'location' && (
          <LocationPanel onBack={handleBack} />
        )}
        {/* Description Input Panel */}
        {panel === 'description' && (
          <DescriptionPanel onBack={handleBack} />
        )}
        {/* Services Provided Input Panel */}
        {panel === 'servicesProvided' && (
          <ServicesProvidedPanel onBack={handleBack} />
        )}
      </div>
    </aside>
  );
} 