'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGradients from '../components/BackgroundGradients/BackgroundGradients';
import { useUserStore, useVendorStore } from '../state/userStore';
import apiService from '../utils/api';
import styles from './VendorOnboardingPage.module.css';

export default function VendorOnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useUserStore();
  const { initializeVendorData } = useVendorStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phoneNumber: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      country: 'United States',
      zipCode: ''
    }
  });

  // Check if user is authenticated and is a vendor
  useEffect(() => {
    console.log('Onboarding page - User data:', user);
    
    // Wait for user data to be available (both null and undefined indicate loading)
    if (user === null || user === undefined) {
      console.log('Onboarding page - User data still loading...');
      // User data is still loading, don't redirect yet
      return;
    }
    
    if (!user) {
      console.log('Onboarding page - No user, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (user.role !== 'vendor') {
      console.log('Onboarding page - User is not vendor, redirecting to home');
      router.push('/');
      return;
    }

    // If profile is already completed, redirect to profile listing
    if (user.vendorProfile?.profileCompleted) {
      console.log('Onboarding page - Profile already completed, redirecting to profile listing');
      router.push('/profile_listing');
      return;
    }

    console.log('Onboarding page - Profile not completed, showing onboarding form');
    console.log('Onboarding page - Vendor profile:', user.vendorProfile);

    // Pre-populate form with existing data
    if (user.vendorProfile) {
      setFormData({
        businessName: user.vendorProfile.businessName || '',
        ownerName: user.vendorProfile.ownerName || '',
        phoneNumber: user.phoneNumber || '',
        businessAddress: {
          street: user.vendorProfile.businessAddress?.street || '',
          city: user.vendorProfile.businessAddress?.city || '',
          state: user.vendorProfile.businessAddress?.state || '',
          country: user.vendorProfile.businessAddress?.country || 'United States',
          zipCode: user.vendorProfile.businessAddress?.zipCode || ''
        }
      });
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.businessName.trim()) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.ownerName.trim()) {
          newErrors.ownerName = 'Owner name is required';
        }
        break;
      
      case 2:
        if (!formData.phoneNumber.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[\+]?[0-9\s\-\(\)]{10,17}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid phone number';
        }
        break;
      
      case 3:
        if (!formData.businessAddress.street.trim()) {
          newErrors['businessAddress.street'] = 'Street address is required';
        }
        if (!formData.businessAddress.city.trim()) {
          newErrors['businessAddress.city'] = 'City is required';
        }
        if (!formData.businessAddress.state.trim()) {
          newErrors['businessAddress.state'] = 'State is required';
        }
        if (!formData.businessAddress.zipCode.trim()) {
          newErrors['businessAddress.zipCode'] = 'Zip code is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.updateVendorProfile({
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        phoneNumber: formData.phoneNumber,
        businessAddress: formData.businessAddress
      });

      if (response.success) {
        // Update user store with new data from backend response
        updateUser({
          ...user,
          phoneNumber: formData.phoneNumber,
          vendorProfile: response.data.user.vendorProfile
        });

        // Initialize vendor data with updated profile
        initializeVendorData(response.data.user);

        // Redirect to profile listing
        router.push('/profile_listing');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ general: error.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Business Information', description: 'Tell us about your business' },
    { number: 2, title: 'Contact Details', description: 'How can we reach you?' },
    { number: 3, title: 'Business Address', description: 'Where is your business located?' }
  ];

  // Show loading state while user data is being loaded
  if (user === null || user === undefined) {
    return (
      <main className="relative w-full min-h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-white/10 backdrop-blur-[17.5px] rounded-[25px] p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AF8EBA] mx-auto mb-4"></div>
            <p className="font-outfit text-gray-600">Loading...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'vendor') {
    return null;
  }

  return (
    <main className="relative w-full min-h-screen bg-[#FFFCFB] overflow-hidden">
      <BackgroundGradients />
      
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white/10 backdrop-blur-[17.5px] rounded-[25px] p-8 max-w-2xl w-full mx-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-outfit font-semibold text-3xl text-black mb-2">
              Complete Your Profile
            </h1>
            <p className="font-outfit text-gray-600">
              Let's get your business profile set up so you can start receiving bookings
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-outfit font-medium text-sm mb-2 ${
                  currentStep >= step.number 
                    ? 'bg-[#AF8EBA] text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="text-center">
                  <p className={`font-outfit font-medium text-xs ${
                    currentStep >= step.number ? 'text-black' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="font-outfit text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mt-4 ${
                    currentStep > step.number ? 'bg-[#AF8EBA]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
              {errors.general}
            </div>
          )}

          {/* Form Steps */}
          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-outfit font-medium text-sm text-black mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter your business name"
                    className={`${styles.inputField} ${errors.businessName ? styles.inputError : ''}`}
                  />
                  {errors.businessName && <p className={styles.errorText}>{errors.businessName}</p>}
                </div>

                <div>
                  <label className="block font-outfit font-medium text-sm text-black mb-2">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Enter owner's full name"
                    className={`${styles.inputField} ${errors.ownerName ? styles.inputError : ''}`}
                  />
                  {errors.ownerName && <p className={styles.errorText}>{errors.ownerName}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <label className="block font-outfit font-medium text-sm text-black mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className={`${styles.inputField} ${errors.phoneNumber ? styles.inputError : ''}`}
                />
                {errors.phoneNumber && <p className={styles.errorText}>{errors.phoneNumber}</p>}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block font-outfit font-medium text-sm text-black mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="businessAddress.street"
                    value={formData.businessAddress.street}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    className={`${styles.inputField} ${errors['businessAddress.street'] ? styles.inputError : ''}`}
                  />
                  {errors['businessAddress.street'] && <p className={styles.errorText}>{errors['businessAddress.street']}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-outfit font-medium text-sm text-black mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="businessAddress.city"
                      value={formData.businessAddress.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                      className={`${styles.inputField} ${errors['businessAddress.city'] ? styles.inputError : ''}`}
                    />
                    {errors['businessAddress.city'] && <p className={styles.errorText}>{errors['businessAddress.city']}</p>}
                  </div>

                  <div>
                    <label className="block font-outfit font-medium text-sm text-black mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="businessAddress.state"
                      value={formData.businessAddress.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                      className={`${styles.inputField} ${errors['businessAddress.state'] ? styles.inputError : ''}`}
                    />
                    {errors['businessAddress.state'] && <p className={styles.errorText}>{errors['businessAddress.state']}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-outfit font-medium text-sm text-black mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="businessAddress.country"
                      value={formData.businessAddress.country}
                      onChange={handleInputChange}
                      placeholder="Enter country"
                      className={styles.inputField}
                    />
                  </div>

                  <div>
                    <label className="block font-outfit font-medium text-sm text-black mb-2">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      name="businessAddress.zipCode"
                      value={formData.businessAddress.zipCode}
                      onChange={handleInputChange}
                      placeholder="Enter zip code"
                      className={`${styles.inputField} ${errors['businessAddress.zipCode'] ? styles.inputError : ''}`}
                    />
                    {errors['businessAddress.zipCode'] && <p className={styles.errorText}>{errors['businessAddress.zipCode']}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-[44px] font-outfit font-medium text-sm transition-colors ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-[#AF8EBA] text-white rounded-[44px] font-outfit font-medium text-sm hover:bg-[#9A7BA5] transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-[#AF8EBA] text-white rounded-[44px] font-outfit font-medium text-sm hover:bg-[#9A7BA5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Completing...' : 'Complete Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 