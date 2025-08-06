'use client';
import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './ProfileListingPage.module.css';
import VendorDashboard from './VendorDashboard';
import { useUserStore } from '../state/userStore';
import { useVendorStore } from '../state/userStore';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ListingsContent from './components/ListingsContent';
import SettingsContent from './components/SettingsContent';
import BookingsContent from './components/BookingsContent';
import InvoicesContent from './components/InvoicesContent';
import AnalyticsContent from './components/AnalyticsContent';
import MarketingContent from './components/MarketingContent';
import ReviewsContent from './components/ReviewsContent';
import MessagesContent from './components/MessagesContent';
import { useVendorAuth } from '../hooks/useVendorAuth';
import AppProvider from '../components/Providers/AppProvider';
import VendorChatbot from '../components/VendorChatbot/VendorChatbot';

function ProfileListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user, token } = useUserStore();
  const { vendorData, setVendorData } = useVendorStore();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const allowBackRef = useRef(false);
  
  // Use the efficient vendor auth hook
  const { isAuthorized, isChecking } = useVendorAuth();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      // Consider mobile if width is small OR if height is much larger than width (vertical monitor)
      const isSmallWidth = window.innerWidth <= 600;
      const isVerticalMonitor = window.innerHeight > window.innerWidth * 1.2;
      setIsMobile(isSmallWidth || isVerticalMonitor);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set loading to false when mounted and user data is available
  useEffect(() => {
    if (mounted && user) {
      setIsLoading(false);
    }
  }, [mounted, user]);

  // Initialize vendor data from user data if not already set
  useEffect(() => {
    console.log('Profile listing - Checking vendor data initialization:', {
      user: !!user,
      userRole: user?.role,
      vendorData: !!vendorData,
      vendorProfile: !!user?.vendorProfile
    });
    
    if (user && user.role === 'vendor') {
      // Check if vendor data exists but is missing required arrays
      const needsInitialization = !vendorData || 
        !vendorData.recentBookings || 
        !vendorData.invoices || 
        !vendorData.stats;
      
      if (needsInitialization) {
        console.log('Profile listing - Initializing/updating vendor data structure');
        // Set vendor data from user profile with complete structure
        const completeVendorData = {
          id: user._id,
          businessName: user.vendorProfile?.businessName || user.name || 'Your Business',
          email: user.email,
          phone: user.phoneNumber || user.phone,
          ownerName: user.vendorProfile?.ownerName || user.name || 'Business Owner',
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
            bookings: 1,
            totalRevenue: 3300,
            avgRating: 5,
            profileViews: 25
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
          profile: user.vendorProfile || {},
          // Preserve existing data if it exists
          ...(vendorData && { ...vendorData })
        };
        
        setVendorData(completeVendorData);
      }
    }
  }, [user, vendorData, setVendorData]);

  // Add debugging for selected menu and content rendering
  useEffect(() => {
    console.log('Profile listing - Selected menu changed:', selectedMenu);
    console.log('Profile listing - Vendor data available:', !!vendorData);
    if (vendorData) {
      console.log('Profile listing - Bookings count:', vendorData.recentBookings?.length || 0);
      console.log('Profile listing - Invoices count:', vendorData.invoices?.length || 0);
    }
  }, [selectedMenu, vendorData]);

  // Block browser back navigation unless logging out
  useEffect(() => {
    if (mounted && !isLoading) {
      window.history.pushState({ profileListing: true }, '');
      const onPopState = (e) => {
        if (!allowBackRef.current) {
          window.history.pushState({ profileListing: true }, '');
        }
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }
  }, [mounted, isLoading]);

  // Call this on logout to allow back navigation
  const allowBackOnLogout = useCallback(() => {
    allowBackRef.current = true;
  }, []);

  useEffect(() => setMounted(true), []);
  
  // Handle tab query param for redirect
  useEffect(() => {
    if (mounted && !isLoading) {
      const tab = searchParams.get('tab');
      if (tab && menuItems.includes(tab)) {
        setSelectedMenu(tab);
      }
    }
  }, [mounted, isLoading, searchParams]);

  // Don't render anything if not authorized or still checking
  if (isChecking || !isAuthorized) {
    return null;
  }

  if (!mounted || isLoading || !user) {
    return (
      <div className={styles['profile-listing-bg']}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF8EBA] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure vendor data is available - this is now handled in the useEffect above
  if (user.role === 'vendor' && !vendorData) {
    return (
      <div className={styles['profile-listing-bg']}>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF8EBA] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading vendor data...</p>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    'Dashboard',
    // 'Analytics', // Hidden for now, uncomment to restore
    'Bookings',
    'Listings',
    'Reviews',
    'Invoices',
    'Messages',
    'Settings',
    'Marketing', // Added Marketing toggle
  ];

  function renderContent() {
    if (selectedMenu === 'Listings') {
      return <ListingsContent router={router} />;
    }
    if (selectedMenu === 'Settings') {
      return <SettingsContent />;
    }
    if (selectedMenu === 'Bookings') {
      return <BookingsContent />;
    }
    if (selectedMenu === 'Reviews') {
      return <ReviewsContent />;
    }
    if (selectedMenu === 'Invoices') {
      return <InvoicesContent />;
    }
    if (selectedMenu === 'Analytics') {
      return <AnalyticsContent />;
    }
    if (selectedMenu === 'Marketing') {
      return <MarketingContent />;
    }
    if (selectedMenu === 'Messages') {
      return <MessagesContent />;
    }
    // Placeholder for other sections
    return (
      <div className={styles['profile-placeholder-content']}>
        <h2>{selectedMenu}</h2>
        <p>This is the {selectedMenu} section. Content will appear here.</p>
      </div>
    );
  }

  // Only override main content for vendor dashboard
  const isVendor = user && user.role === 'vendor';

  return (
    <div className={styles['profile-listing-bg']}>
      {/* Mobile Backdrop */}
      <div 
        className={`${styles['sidebar-backdrop']} ${!sidebarCollapsed ? styles['active'] : ''}`}
        onClick={() => setSidebarCollapsed(true)}
      />
      {/* Sidebar Menu */}
      <Sidebar 
        menuItems={menuItems} 
        selectedMenu={selectedMenu} 
        setSelectedMenu={setSelectedMenu}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      {/* Desktop Collapse Toggle Button - Positioned outside sidebar */}
      {!isMobile && (
        <button 
          className={styles['sidebar-collapse-toggle']}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className={`${styles['collapse-arrow']} ${sidebarCollapsed ? styles['arrow-collapsed'] : ''}`}>
            <svg width="clamp(12px, 1.5vw, 16px)" height="clamp(12px, 1.5vw, 16px)" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </button>
      )}
      {/* Main Content */}
      <main className={`${styles['profile-listing-main']} ${sidebarCollapsed ? styles['main-collapsed'] : ''}`}>
        {/* Top Bar */}
        <TopBar 
          selectedMenu={selectedMenu} 
          allowBackOnLogout={allowBackOnLogout}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />
        {/* Dynamic Content */}
        {isVendor && selectedMenu === 'Dashboard' ? (
          <VendorDashboard onNavigate={setSelectedMenu} />
        ) : (
          renderContent()
        )}
      </main>
      
      {/* Vendor Chatbot */}
      {isVendor && <VendorChatbot />}
    </div>
  );
}

export default function ProfileListing() {
  return (
    <Suspense fallback={null}>
      <AppProvider>
        <ProfileListingContent />
      </AppProvider>
    </Suspense>
  );
}
