'use client';
import { useListingEditStore } from '../../state/listingEditStore';
import VendorListingDetailsTemplate from '../vendor_listing_details/VendorListingDetailsTemplate';
import ListingPreviewWrapper from './ListingPreviewWrapper';

// Sample data that looks like a real vendor listing
const sampleVendorData = {
  name: 'Elegant Event Planners',
  images: [
    '/hero_bg_blur.png',
    '/hero_bg_blur.png',
    '/hero_bg_blur.png',
    '/hero_bg_blur.png',
    '/hero_bg_blur.png'
  ],
  locationDisplay: 'Karachi, Pakistan',
  fullAddress: 'Sample Address, Karachi, Pakistan',
  description: 'We specialize in creating memorable events with attention to detail and exceptional service. Our team brings creativity and professionalism to every celebration.',
  servicesDisplay: [
    { icon: '/decoration_icon.png', label: 'Decoration' },
    { icon: '/food_icon.png', label: 'Catering' },
    { icon: '/cart_icon.png', label: 'Photography' },
    { icon: '/soundsystem_icon.png', label: 'Sound System' },
    { icon: '/cart_icon.png', label: 'Event Planning' },
    { icon: '/seating_icon.png', label: 'Seating' }
  ],
  packagesDisplay: [
    { 
      name: 'Basic Package', 
      price: '$45,000', 
      accent: true,
      perHead: '$45,000',
      total: 45000,
      minPrice: 45000,
      maxPrice: 45000,
      description: 'Perfect starter package for intimate celebrations with essential services.',
      features: ['Complimentary consultation', '2-hour setup time', 'Basic cleanup service', 'Coordination on event day'],
      services: [
        { icon: '/decoration_icon.png', title: 'Includes', items: ['Basic Decoration', 'Sound System', 'Catering for 50 guests', 'Basic Photography'] }
      ]
    },
    { 
      name: 'Premium Package', 
      price: '$75,000', 
      accent: false,
      perHead: '$75,000',
      total: 75000,
      minPrice: 75000,
      maxPrice: 75000,
      description: 'Comprehensive package with premium services for mid-sized events.',
      features: ['Extended consultation', 'Custom decor themes', '4-hour setup time', 'Full cleanup service', 'On-site coordinator', 'Emergency backup equipment'],
      services: [
        { icon: '/decoration_icon.png', title: 'Includes', items: ['Premium Decoration', 'Sound System', 'Full Catering', 'Professional Photography', 'Live Music'] }
      ]
    },
    { 
      name: 'Deluxe Package', 
      price: '$140,000', 
      accent: false,
      perHead: '$140,000',
      total: 140000,
      minPrice: 140000,
      maxPrice: 140000,
      description: 'Luxury all-inclusive package with premium amenities and services.',
      features: ['Unlimited consultations', 'Premium decor with flowers', 'Full day setup', 'Complete cleanup', 'Dedicated event manager', 'Backup equipment & staff', 'Post-event photos', 'Guest gift bags'],
      services: [
        { icon: '/decoration_icon.png', title: 'Includes', items: ['Deluxe Decoration', 'Full Catering', 'Premium Photography', 'Live Band', 'Wedding Cake', 'Bridal Suite'] }
      ]
    }
  ],
  displayPrice: '$50,000',
  displayTags: ['Verified User', 'Top Rated Vendor'],
  aiReviewSummary: 'This vendor consistently delivers high-quality events with excellent customer service. Customers frequently praise their attention to detail and professional approach.'
};

// Service icon mapping
const serviceIconMap = {
  'Catering': '/food_icon.png',
  'Decoration': '/decoration_icon.png', 
  'Music': '/soundsystem_icon.png',
  'Photography': '/cart_icon.png',
  'Lighting': '/decoration_icon.png',
  'Venue': '/seating_icon.png',
  'Transportation': '/cart_icon.png',
  'Planning': '/cart_icon.png',
  'Sound System': '/soundsystem_icon.png',
  'Event Planning': '/cart_icon.png',
  'Seating': '/seating_icon.png'
};

// Data transformer that merges user data with sample data
const createPreviewData = (draft) => {
  const userImages = [
    ...(draft.coverPhotos || []),
    ...(draft.photoGallery || [])
  ];
  
  // Handle servicesProvided as either string or array
  const userServices = !draft.servicesProvided 
    ? [] 
    : Array.isArray(draft.servicesProvided)
      ? draft.servicesProvided
      : draft.servicesProvided.split(',').map(s => s.trim()).filter(s => s);
    
  // Transform user services to display format
  const userServicesDisplay = userServices.map(service => ({
    icon: serviceIconMap[service] || '/cart_icon.png',
    label: service
  }));
    
  const userPackages = draft.packages?.map((pkg, index) => {
    const price = parseInt(pkg.price) || parseInt(pkg.fixedPrice) || parseInt(pkg.minPrice) || 0;
    const priceDisplay = price > 0 ? `$${price.toLocaleString()}` : 'Price goes here';
    
    return {
      name: pkg.name || 'Package name goes here',
      price: priceDisplay,
      accent: index === 0,
      perHead: price > 0 ? `$${price.toLocaleString()}` : '$0',
      total: price,
      description: pkg.description || 'Package description goes here',
      features: pkg.includes && pkg.includes.length > 0 ? pkg.includes : ['Package features go here'],
      minPrice: price, // For compatibility with existing logic
      maxPrice: price,
      services: [
        {
          icon: '/decoration_icon.png',
          title: 'Includes',
          items: pkg.includes && pkg.includes.length > 0 ? pkg.includes : ['Package items go here']
        }
      ]
    };
  }) || [];
  
  const minPrice = userPackages.length > 0 && userPackages.some(p => p.total > 0)
    ? Math.min(...userPackages.filter(p => p.total > 0).map(p => p.total))
    : 0;
  
  // Create placeholder services if none provided
  const placeholderServices = userServicesDisplay.length > 0 ? userServicesDisplay : [
    { icon: '/cart_icon.png', label: 'Services go here - add your offerings' }
  ];
  
  // Create placeholder packages if none provided
  const placeholderPackages = userPackages.length > 0 ? userPackages : [
    {
      name: 'Package name goes here',
      price: 'Price goes here',
      accent: true,
      perHead: '$0',
      total: 0,
      description: 'Package description goes here - describe what\'s included',
      features: ['Package features go here - list what you provide'],
      minPrice: 0,
      maxPrice: 0,
      services: [
        {
          icon: '/decoration_icon.png',
          title: 'Includes',
          items: ['Package items go here - add your services']
        }
      ]
    }
  ];
  
  return {
    name: draft.name || 'Business name goes here',
    images: userImages.length > 0 ? userImages : sampleVendorData.images,
    locationDisplay: typeof draft.location === 'string' 
      ? draft.location 
      : (draft.location && typeof draft.location === 'object' 
          ? `${draft.location.street || ''} ${draft.location.city || ''} ${draft.location.state || ''} ${draft.location.zip || draft.location.zipCode || ''}`.trim() || 'Location goes here'
          : 'Location goes here'),
    fullAddress: typeof draft.location === 'string' 
      ? draft.location 
      : (draft.location && typeof draft.location === 'object' 
          ? `${draft.location.street || ''} ${draft.location.city || ''} ${draft.location.state || ''} ${draft.location.zip || draft.location.zipCode || ''}`.trim() || 'Full address goes here'
          : 'Full address goes here'),
    description: draft.description || 'Business description goes here - tell customers about your services and what makes you special',
    servicesDisplay: placeholderServices,
    packagesDisplay: placeholderPackages,
    displayPrice: minPrice > 0 ? `$${minPrice.toLocaleString()}` : 'Starting price goes here',
    displayTags: sampleVendorData.displayTags, // Only show admin-assigned tags, not user event type
    aiReviewSummary: sampleVendorData.aiReviewSummary
  };
};

export default function ListingPreviewTemplate() {
  const { draft } = useListingEditStore();
  const vendorData = createPreviewData(draft);

  return (
    <ListingPreviewWrapper>
      <VendorListingDetailsTemplate 
        vendorData={vendorData}
        loading={false}
        error={null}
        onRetry={null}
        isPreview={true}
      />
    </ListingPreviewWrapper>
  );
} 