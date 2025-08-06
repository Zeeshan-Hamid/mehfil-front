import { create } from 'zustand';

const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.localStorage.getItem('MehfilUser');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const getInitialToken = () => {
  if (typeof window === 'undefined') return null;
  try {
    const token = window.localStorage.getItem('MehfilToken');
    console.log('🔍 [UserStore] Getting initial token from localStorage:', !!token);
    return token;
  } catch (error) {
    console.error('❌ [UserStore] Error getting initial token:', error);
    return null;
  }
};

const getInitialVendorData = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = window.localStorage.getItem('MehfilVendorData');
    console.log('Getting initial vendor data from localStorage:', data);
    const parsedData = data ? JSON.parse(data) : null;
    console.log('Parsed vendor data:', parsedData);
    console.log('Parsed vendor data stats:', parsedData?.stats);
    return parsedData;
  } catch (error) {
    console.error('Error getting initial vendor data:', error);
    return null;
  }
};

export const useUserStore = create((set, get) => ({
  user: typeof window !== 'undefined' ? getInitialUser() : null,
  token: typeof window !== 'undefined' ? getInitialToken() : null,
  
  login: (userData, token) => {
    console.log('🔍 [UserStore] Login called with user:', !!userData, 'token:', !!token);
    set({ user: userData, token });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilUser', JSON.stringify(userData));
      window.localStorage.setItem('MehfilToken', token);
      console.log('✅ [UserStore] Token stored in localStorage');
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('MehfilUser');
      window.localStorage.removeItem('MehfilToken');
      // Also clear vendor data on logout
      window.localStorage.removeItem('MehfilVendorData');
    }
    
    // Disconnect socket service on logout
    if (typeof window !== 'undefined') {
      // Import socket service dynamically to avoid circular dependencies
      import('../utils/socketService').then(({ default: socketService }) => {
        socketService.handleLogout();
      }).catch(error => {
        console.warn('⚠️ [UserStore] Could not disconnect socket service:', error);
      });
    }
  },
  
  updateUser: (userData) => {
    const currentState = get();
    const updatedUser = { ...currentState.user, ...userData };
    set({ user: updatedUser });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilUser', JSON.stringify(updatedUser));
    }
  },
  
  // Legacy method for backward compatibility
  loginWithRole: (role) => {
    const user = { role };
    set({ user });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilUser', JSON.stringify(user));
    }
  },
}));

// Helper function to create complete vendor data structure
const createCompleteVendorData = (user) => {
  return {
    id: user._id,
    businessName: user.vendorProfile?.businessName || 'Your Business',
    email: user.email,
    phone: user.phoneNumber,
    ownerName: user.vendorProfile?.ownerName || 'Business Owner',
    profilePhoto: user.vendorProfile?.profileImage || '/man-in-suit2-removebg-preview.png',
    location: {
      address: user.vendorProfile?.businessAddress?.street || '',
      city: user.vendorProfile?.businessAddress?.city || '',
      state: user.vendorProfile?.businessAddress?.state || '',
      country: user.vendorProfile?.businessAddress?.country || '',
      zipCode: user.vendorProfile?.businessAddress?.zipCode || ''
    },
    // Complete stats structure
    stats: {
      bookings: 0,
      totalRevenue: 0,
      avgRating: 0,
      profileViews: 0
    },
    // Sample data for bookings
    recentBookings: [
      {
        id: 1,
        clientName: 'Sample Client',
        event: 'Wedding',
        date: '2024-01-15',
        amount: 2500,
        status: 'Confirmed',
        clientLocation: 'New York',
        clientPhone: '+1-555-0123',
        package: 'Premium Package',
        guests: 150,
        eventLocation: 'Grand Hotel',
        eventDate: '2024-06-15',
        additionalDetails: 'Beautiful outdoor wedding ceremony',
        paymentMethod: 'Credit Card'
      }
    ],
    // Sample data for reviews
    recentReviews: [
      {
        id: 1,
        name: 'Sarah Johnson',
        text: 'Excellent service and beautiful arrangements!',
        rating: 5,
        date: '2024-01-10'
      }
    ],
    // Sample data for inquiries
    pendingInquiries: [
      {
        id: 1,
        name: 'Mike Wilson',
        email: 'mike@example.com',
        phone: '+1-555-0456',
        event: 'Corporate Event',
        date: '2024-02-20',
        message: 'Looking for catering services for our annual meeting'
      }
    ],
    // Sample data for listings
    listings: [
      {
        id: 1,
        name: 'Wedding Catering Service',
        coverImages: true,
        businessInfo: 'Premium wedding catering',
        price: 2000,
        photoGallery: true,
        bio: 'Specializing in elegant wedding catering',
        markets: 'New York, New Jersey',
        packages: 'Basic, Premium, Luxury',
        services: 'Catering, Setup, Cleanup',
        faq: 'Available',
        reviews: '5.0 (25 reviews)',
        preferredVendors: 'Venues, Photographers',
        automatedHellos: 'Enabled',
        status: 'Active'
      }
    ],
    // Sample data for invoices
    invoices: [
      {
        id: 1,
        clientName: 'John Smith',
        event: 'Wedding Reception',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 2500,
        status: 'Paid',
        invoiceNumber: 'INV-001'
      },
      {
        id: 2,
        clientName: 'Emily Davis',
        event: 'Corporate Lunch',
        date: '2024-01-20',
        dueDate: '2024-02-20',
        amount: 800,
        status: 'Pending',
        invoiceNumber: 'INV-002'
      }
    ],
    analytics: {
      monthlyRevenue: 5000,
      totalBookings: 12,
      averageRating: 4.8
    },
    // Social media links
    facebook: user.vendorProfile?.socialLinks?.facebook || '',
    instagram: user.vendorProfile?.socialLinks?.instagram || '',
    website: user.vendorProfile?.socialLinks?.website || '',
    // Halal certification
    halalCert: user.vendorProfile?.halalCertification?.hasHalalCert || false,
    // Profile data
    profile: user.vendorProfile || {}
  };
};

export const useVendorStore = create((set) => ({
  vendorData: typeof window !== 'undefined' ? getInitialVendorData() : null,
  setVendorData: (data) => {
    console.log('Setting vendor data:', data);
    console.log('Vendor data stats:', data?.stats);
    set({ vendorData: data });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilVendorData', JSON.stringify(data));
    }
  },
  initializeVendorData: (user) => {
    const completeData = createCompleteVendorData(user);
    console.log('Initializing complete vendor data:', completeData);
    set({ vendorData: completeData });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilVendorData', JSON.stringify(completeData));
    }
  },
  addInvoice: (invoice) => set((state) => {
    const updated = {
      ...state.vendorData,
      invoices: [invoice, ...(state.vendorData?.invoices || [])],
    };
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('MehfilVendorData', JSON.stringify(updated));
    }
    return { vendorData: updated };
  }),
  clearVendorData: () => {
    set({ vendorData: null });
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('MehfilVendorData');
    }
  },
})); 