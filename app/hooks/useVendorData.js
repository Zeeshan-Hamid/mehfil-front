import { useState, useEffect, useCallback } from 'react';
import apiService from '../utils/api';

// Transform backend data for display components
const transformForDisplay = (backendData) => {
  const minPrice = backendData.packages && backendData.packages.length > 0 
    ? Math.min(...backendData.packages.map(pkg => pkg.price || 0)) 
    : 0;
  
  const serviceIconMap = {
    'Catering': '/food_icon.png',
    'Decoration': '/decoration_icon.png', 
    'Music': '/soundsystem_icon.png',
    'Photography': '/cart_icon.png',
    'Lighting': '/decoration_icon.png',
    'Venue': '/seating_icon.png',
    'Transportation': '/cart_icon.png',
    'Planning': '/cart_icon.png'
  };
  
  const servicesDisplay = backendData.services.map(service => ({
    icon: serviceIconMap[service] || '/cart_icon.png',
    label: service
  }));
  
  const packagesDisplay = backendData.packages.map((pkg, index) => {
    const pkgPrice = parseInt(pkg.price) || 0;
    const priceDisplay = `$${pkgPrice.toLocaleString()}`;
    
    return {
      _id: pkg._id, // Add the package ID here
      name: pkg.name,
      price: priceDisplay,
      accent: index === 0,
      perHead: `$${pkgPrice.toLocaleString()}`,
      total: pkgPrice,
      description: pkg.description || '',
      features: pkg.includes || [],
      minPrice: pkgPrice,
      maxPrice: pkgPrice,
      services: [
        {
          icon: '/food_icon.png',
          title: 'Includes',
          items: pkg.includes || []
        }
      ]
    };
  });
  
  const locationDisplay = `${backendData.location.city}, ${backendData.location.state}`;
  const fullAddress = `${backendData.location.address}, ${backendData.location.city}, ${backendData.location.state} ${backendData.location.zipCode}`;
  
  const systemTags = backendData.tags.filter(tag => ['Verified User', 'Top Rated Vendor'].includes(tag));
  
  return {
    ...backendData,
    images: backendData.imageUrls && backendData.imageUrls.length > 0 ? backendData.imageUrls : ['/hero_bg_blur.png'],
    displayPrice: `$${minPrice}`,
    servicesDisplay,
    packagesDisplay, 
    locationDisplay,
    fullAddress,
    displayTags: systemTags,
    aiReviewSummary: "This venue comes highly recommended by our AI analysis..."
  };
};

export function useVendorData(vendorId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVendorData = useCallback(async () => {
    if (!vendorId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getListingDetails(vendorId);
      
      if (response.status === 'success') {
        console.log('Raw event data:', response.data.event);
        const transformedData = transformForDisplay(response.data.event);
        console.log('Transformed data:', transformedData);
        setData(transformedData);
      } else {
        setError('Failed to fetch vendor data.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  return { data, loading, error, refetch: fetchVendorData };
} 