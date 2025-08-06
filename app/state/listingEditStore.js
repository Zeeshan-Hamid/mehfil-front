import { create } from 'zustand';
import apiService from '../utils/api';

// Utility to load from sessionStorage
function loadDraft() {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.sessionStorage.getItem('listingDraft');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

// Utility to save to sessionStorage
function saveDraft(draft) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem('listingDraft', JSON.stringify(draft));
  } catch {}
}

const defaultDraft = {
  name: '',
  coverPhotos: [],
  photoGallery: [],
  eventType: [],
  servicesProvided: [],
  description: '',
  packages: [],
  location: '',
  tags: [],
};

export const useListingEditStore = create((set, get) => ({
  draft: defaultDraft,
  setField: (field, value) => {
    set(state => {
      const updated = { ...state.draft, [field]: value };
      saveDraft(updated);
      return { draft: updated };
    });
  },
  setDraft: (newDraft) => {
    console.log('Setting draft in store:', newDraft);
    set({ draft: newDraft });
    saveDraft(newDraft);
  },
  resetDraft: () => {
    set({ draft: defaultDraft });
    saveDraft(defaultDraft);
  },
  clearDraft: () => {
    set({ draft: defaultDraft });
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('listingDraft');
    }
  },
  hydrateDraft: () => {
    const loaded = loadDraft();
    if (loaded) set({ draft: loaded });
  },
  saveListing: async (isUpdate = false, eventId = null) => {
    const state = get();
    const draft = state.draft;
    
    // Validate required fields
    if (!draft.name || !draft.eventType || !draft.description || !draft.servicesProvided || !draft.location) {
      throw new Error('Please fill in all required fields: Name, Event Type, Description, Services, and Location');
    }
    
    if (!draft.coverPhotos || draft.coverPhotos.length === 0) {
      throw new Error('Please upload at least one cover image');
    }
    
    // Validate that cover photos don't exceed 10 images
    const validCoverPhotos = draft.coverPhotos.filter(img => img && img.trim() !== '');
    if (validCoverPhotos.length > 10) {
      throw new Error('You can upload a maximum of 10 cover images');
    }
    
    // Transform data to match API expectations
    const eventData = {
      name: draft.name,
      eventType: mapEventTypeToBackend(draft.eventType[0] || draft.eventType), // API expects single string, frontend has array
      description: draft.description,
      services: draft.servicesProvided,
      packages: draft.packages || [],
      location: typeof draft.location === 'string' ? { address: draft.location } : {
        city: draft.location?.city || '',
        state: draft.location?.state || '',
        zipCode: draft.location?.zip || draft.location?.zipCode || '', // Handle both zip and zipCode
        country: draft.location?.country || 'United States'
      },
      tags: draft.tags || [],
    };
    
    // Helper function to map frontend event types to backend enum values
    function mapEventTypeToBackend(frontendType) {
      const mapping = {
        'Wedding': 'wedding',
        'Engagement': 'engagement',
        'Birthday': 'birthday',
        'Anniversary': 'anniversary',
        'Corporate Event': 'corporate',
        'Conference': 'corporate',
        'Workshop': 'corporate',
        'Baby Shower': 'other',
        'Other': 'other'
      };
      return mapping[frontendType] || 'other';
    }
    
    // Combine cover photos and photo gallery for images
    const allImages = [...(draft.coverPhotos || []), ...(draft.photoGallery || [])];
    
    // Convert base64 data URLs to File objects for API upload
    const imageFiles = allImages
      .filter(img => img && img.trim() !== '') // Filter out empty slots
      .map((img, index) => {
        if (img.startsWith('data:image/')) {
          // Convert base64 to File object
          return dataURLtoFile(img, `image-${index}.jpg`);
        }
        return img; // Already a File object
      });
    
    try {
      let response;
      if (isUpdate && eventId) {
        response = await apiService.updateEvent(eventId, eventData, imageFiles);
      } else {
        response = await apiService.createEvent(eventData, imageFiles);
      }
      
      return response;
    } catch (error) {
      console.error('Error saving listing:', error);
      throw error;
    }
  },
}));

// Helper function to convert base64 data URL to File object
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

// On first load in the browser, hydrate from sessionStorage
if (typeof window !== 'undefined') {
  const loaded = loadDraft();
  if (loaded) {
    useListingEditStore.setState({ draft: loaded });
  }
} 