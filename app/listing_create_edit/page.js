"use client";
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Navbar_Listing_create_edit from '../components/Navbar_Listing_create_edit/Navbar_Listing_create_edit';
import ListingPreview from '../components/ListingPreview/ListingPreview';
import EditListPanel from '../components/EditListPanel/EditListPanel';
import styles from './ListingCreateEditPage.module.css';
import { useVendorAuth } from '../hooks/useVendorAuth';
import apiService from '../utils/api';
import { useListingEditStore } from '../state/listingEditStore';
import { FiSave, FiX, FiEye, FiChevronUp, FiChevronDown } from 'react-icons/fi';

const sections = [
  { label: 'Cover Images', status: 'complete' },
  { label: 'Business Info', status: 'complete' },
  { label: 'Bio', status: 'complete' },
  { label: 'Markets', status: 'complete' },
  { label: 'Services Provided', status: 'complete' },
  { label: 'Reviews', status: 'complete' },
  { label: 'FAQ', status: 'warning' },
  { label: 'Automated Messages', status: 'warning' },
];

// Mobile sections for tab navigation
const mobileSections = [
  { key: 'name', label: 'Name' },
  { key: 'coverPhotos', label: 'Images' },
  { key: 'eventType', label: 'Type' },
  { key: 'servicesProvided', label: 'Services' },
  { key: 'description', label: 'Bio' },
  { key: 'packages', label: 'Packages' },
  { key: 'location', label: 'Location' },
];

function ListingCreateEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Debug: Log all search parameters
  console.log('All search parameters:', Object.fromEntries(searchParams.entries()));
  
  const eventId = searchParams.get('id') || searchParams.get('eventId'); // Support both 'id' and 'eventId' parameters
  
  // Calculate responsive sidebar width based on viewport
  const getResponsiveSidebarWidth = () => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth <= 480) return Math.min(viewportWidth * 0.95, 350);
    if (viewportWidth <= 768) return Math.min(viewportWidth * 0.9, 400);
    if (viewportWidth <= 900) return Math.min(viewportWidth * 0.25, 300);
    if (viewportWidth <= 1200) return Math.min(viewportWidth * 0.3, 350);
    return Math.min(viewportWidth * 0.35, 450);
  };
  
  const [sidebarWidth, setSidebarWidth] = useState(getResponsiveSidebarWidth());
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const sidebarRef = useRef(null);
  const resizerRef = useRef(null);
  
  // Mobile state
  const [mobileActiveTab, setMobileActiveTab] = useState('name');
  const [isMobileTabExpanded, setIsMobileTabExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the efficient vendor auth hook
  const { isAuthorized, isChecking } = useVendorAuth();
  
  // Check if we're in edit mode
  const isEditMode = !!eventId;
  
  // Get store functions
  const clearDraft = useListingEditStore(state => state.clearDraft);
  const draft = useListingEditStore(state => state.draft);
  const saveListing = useListingEditStore(state => state.saveListing);
  
  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Clear draft when creating a new listing (not editing)
  useEffect(() => {
    if (!isEditMode) {
      console.log('Creating new listing - clearing draft');
      clearDraft();
    }
  }, [isEditMode, clearDraft]);
  
  // Debug logs
  console.log('Parent component - eventId:', eventId);
  console.log('Parent component - isEditMode:', isEditMode);
  console.log('Parent component - eventData:', eventData);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    // Add dragging class for visual feedback
    if (resizerRef.current) {
      resizerRef.current.classList.add(styles['resizer-dragging']);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const containerRect = sidebarRef.current?.parentElement?.getBoundingClientRect();
    if (!containerRect) return;
    
    const newWidth = e.clientX - containerRect.left;
    const viewportWidth = window.innerWidth;
    
    // Responsive min and max widths
    let minWidth, maxWidth;
    if (viewportWidth <= 480) {
      minWidth = viewportWidth * 0.8;
      maxWidth = viewportWidth * 0.95;
    } else if (viewportWidth <= 768) {
      minWidth = viewportWidth * 0.7;
      maxWidth = viewportWidth * 0.9;
    } else if (viewportWidth <= 900) {
      minWidth = 200;
      maxWidth = viewportWidth * 0.32;
    } else if (viewportWidth <= 1200) {
      minWidth = 220;
      maxWidth = viewportWidth * 0.35;
    } else {
      minWidth = 250;
      maxWidth = viewportWidth * 0.45;
    }
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Remove dragging class
    if (resizerRef.current) {
      resizerRef.current.classList.remove(styles['resizer-dragging']);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const newWidth = getResponsiveSidebarWidth();
      if (sidebarWidth > newWidth) {
        setSidebarWidth(newWidth);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarWidth]);

  // Fetch event data if in edit mode
  useEffect(() => {
    if (!isEditMode || !eventId) return;

    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching event data for ID:', eventId);
        const response = await apiService.getEvent(eventId);
        console.log('API response:', response);
        
        if (response.status === 'success') {
          console.log('Setting event data:', response.data.event);
          setEventData(response.data.event);
        } else {
          setError('Failed to load event data');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [isEditMode, eventId]);

  // Mobile functions
  const handleMobileTabClick = (tabKey) => {
    setMobileActiveTab(tabKey);
    setIsMobileTabExpanded(true);
  };

  const handleMobileTabToggle = () => {
    setIsMobileTabExpanded(!isMobileTabExpanded);
  };

  const handleMobileSave = async () => {
    try {
      const response = await saveListing(isEditMode, eventId);
      clearDraft();
      router.push('/profile_listing');
    } catch (error) {
      alert(error.message || 'Error saving listing');
    }
  };

  const getSectionStatus = (sectionKey) => {
    switch (sectionKey) {
      case 'name':
        return draft.name && draft.name.trim().length > 0 ? 'complete' : 'incomplete';
      case 'coverPhotos':
        return draft.coverPhotos && draft.coverPhotos.length > 0 ? 'complete' : 'incomplete';
      case 'eventType':
        return draft.eventType && draft.eventType.length > 0 ? 'complete' : 'incomplete';
      case 'servicesProvided':
        return draft.servicesProvided && draft.servicesProvided.length > 0 ? 'complete' : 'incomplete';
      case 'description':
        return draft.description && draft.description.trim().length >= 20 ? 'complete' : 'incomplete';
      case 'packages':
        return draft.packages && draft.packages.length > 0 ? 'complete' : 'incomplete';
      case 'location':
        if (typeof draft.location === 'object' && draft.location) {
          return (draft.location.city && draft.location.state && (draft.location.zip || draft.location.zipCode)) ? 'complete' : 'incomplete';
        }
        return (draft.location && draft.location.trim().length > 0) ? 'complete' : 'incomplete';
      default:
        return 'incomplete';
    }
  };

  // Don't render anything if not authorized or still checking
  if (isChecking || !isAuthorized) {
    return null;
  }

  // Show loading state while fetching event data
  if (isEditMode && isLoading) {
    return (
      <div className={styles['listing-create-edit-container']}>
        <Navbar_Listing_create_edit />
        <div className={styles['loading-container']}>
          <div className={styles['loading-spinner']}></div>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

  // Show error state if failed to load event data
  if (isEditMode && error) {
    return (
      <div className={styles['listing-create-edit-container']}>
        <Navbar_Listing_create_edit />
        <div className={styles['error-container']}>
          <h3>Error Loading Event</h3>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/listing_create_edit')}
            className={styles['error-button']}
          >
            Create New Event Instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['listing-create-edit-container']}>
      {/* Top Bar */}
      <Navbar_Listing_create_edit />
      
      {/* Main Content */}
      <div className={styles['listing-create-edit-main']}>
        {/* Desktop Sidebar */}
        <div 
          ref={sidebarRef}
          className={styles['sidebar-column']}
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        >
          <EditListPanel 
            isEditMode={isEditMode}
            eventData={eventData}
            eventId={eventId}
          />
        </div>
        
        {/* Desktop Resizer Handle */}
        <div 
          ref={resizerRef}
          className={styles['resizer-handle']}
          onMouseDown={handleMouseDown}
          title="Drag to resize sidebar"
        />
        
        {/* Preview Area */}
        <div className={styles['preview-area-wrapper']}>
          <div className={styles['preview-heading']}>Preview</div>
          <div className={styles['preview-scroll-box']}>
            <ListingPreview />
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className={`${styles['mobile-tab-nav']} ${isMobileTabExpanded ? styles['expanded'] : styles['collapsed']}`}>
        {/* Mobile Tab Header */}
        <div className={styles['mobile-tab-header']}>
          <div className={styles['mobile-tab-title']}>
            {mobileSections.find(s => s.key === mobileActiveTab)?.label}
          </div>
          <button 
            className={styles['mobile-tab-toggle']}
            onClick={handleMobileTabToggle}
          >
            {isMobileTabExpanded ? <FiChevronDown size={20} /> : <FiChevronUp size={20} />}
          </button>
        </div>

        {/* Mobile Tab List */}
        <div className={styles['mobile-tab-list']}>
          {mobileSections.map((section) => {
            const status = getSectionStatus(section.key);
            return (
              <button
                key={section.key}
                className={`${styles['mobile-tab-btn']} ${
                  mobileActiveTab === section.key ? styles['active'] : ''
                } ${status === 'complete' ? styles['complete'] : ''}`}
                onClick={() => handleMobileTabClick(section.key)}
              >
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Content Area */}
        {isMobileTabExpanded && (
          <div className={`${styles['mobile-content-area']} ${styles['show']}`}>
            <div className={styles['mobile-content-header']}>
              <div className={styles['mobile-content-title']}>
                {mobileSections.find(s => s.key === mobileActiveTab)?.label}
              </div>
              <button 
                className={styles['mobile-content-close']}
                onClick={() => setIsMobileTabExpanded(false)}
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Mobile Panel Content */}
            <div style={{ padding: '0' }}>
              <EditListPanel 
                isEditMode={isEditMode}
                eventData={eventData}
                eventId={eventId}
                mobileActiveTab={mobileActiveTab}
                onMobileClose={() => setIsMobileTabExpanded(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <button 
        className={styles['mobile-fab']}
        onClick={handleMobileSave}
        title="Save Listing"
      >
        <FiSave size={20} />
      </button>
    </div>
  );
}

export default function ListingCreateEdit() {
  return (
    <Suspense fallback={
      <div className={styles['listing-create-edit-container']}>
        <Navbar_Listing_create_edit />
        <div className={styles['loading-container']}>
          <div className={styles['loading-spinner']}></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <ListingCreateEditContent />
    </Suspense>
  );
} 