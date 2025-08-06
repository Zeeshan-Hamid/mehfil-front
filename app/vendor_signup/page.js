'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGradients from '../components/BackgroundGradients/BackgroundGradients';
import styles from './VendorSignupPage.module.css';
import { useUserStore, useVendorStore } from '../state/userStore';
import apiService from '../utils/api';

export default function VendorSignupPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const { initializeVendorData } = useVendorStore();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    password: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    country: 'United States',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle Google OAuth popup message
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from our backend
      if (event.origin !== 'https://mehfil-backend-tzep.onrender.com') return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        const { user, token } = event.data;
        
        // Login the user
        login(user, token);
        
        // Initialize vendor data if user is a vendor
        if (user.role === 'vendor' && user.vendorProfile) {
          initializeVendorData(user);
        }
        
        // Redirect based on user role and profile completion
        if (user.role === 'vendor') {
          if (user.vendorProfile?.profileCompleted) {
            router.push('/profile_listing');
          } else {
            router.push('/vendor_onboarding');
          }
        } else {
          router.push('/');
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        setErrors({ general: event.data.error || 'Google authentication failed. Please try again.' });
        setIsGoogleLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, initializeVendorData, router]);

  const handleCustomerSignUp = () => {
    router.push('/customer_signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleBack = () => {
    router.back();
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const googleAuthUrl = await apiService.initiateGoogleAuth('vendor');
      
      // Open popup window for Google OAuth
      const popup = window.open(
        googleAuthUrl,
        'googleAuth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        setErrors({ general: 'Popup blocked. Please allow popups for this site and try again.' });
        setIsGoogleLoading(false);
        return;
      }

      // Monitor popup closure
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsGoogleLoading(false);
        }
      }, 1000);

    } catch (error) {
      console.error('Google OAuth error:', error);
      setErrors({ general: 'Failed to initiate Google authentication. Please try again.' });
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Business Name validation
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (formData.businessName.length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters';
    }

    // Owner Name validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Owner name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.ownerName)) {
      newErrors.ownerName = 'Owner name can only contain letters and spaces';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter, one uppercase letter, and one number';
    }

    // Phone validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[0-9\s\-\(\)]{10,17}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Address validation - only zipCode is required
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Zip code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.signupVendor(formData);
      
      if (response.success) {
        setShowSuccess(true);
        // Show success message for a few seconds before redirecting
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      } else if (error.message.includes('Validation failed')) {
        // Handle validation errors from backend
        const validationErrors = {};
        if (error.errors) {
          error.errors.forEach(err => {
            validationErrors[err.path] = err.msg;
          });
        }
        setErrors(validationErrors);
      } else {
        setErrors({ general: error.message || 'Something went wrong. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-[17.5px] rounded-[25px] p-8 max-w-md w-full mx-4 text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="font-outfit font-medium text-2xl text-black mb-4">
              Registration Successful!
            </h2>
            <p className="font-outfit text-gray-600 mb-6">
              Please check your email to verify your account. You'll be redirected to login shortly.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full min-h-screen bg-[#FFFCFB] overflow-x-hidden">
      <BackgroundGradients />

      <div className={styles.signupCard}>
        {/* Back button */}
        <button 
          onClick={handleBack}
          className={styles.backButton}
          aria-label="Go back"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Left side - Purple gradient */}
        <div className={styles.leftPanel}>
          <div className={styles.logoBlock}>
            <img 
              src="/logo.png" 
              alt="Mehfil Logo" 
              className={styles.logo}
            />
            <div className={styles.brandTitle}>
              Mehfil
            </div>
            <div className={styles.leftDesc}>
              Join our community and grow your business with Mehfil
            </div>
          </div>
          <div className={styles.leftLoginBtn} onClick={handleLogin}>
            <button className={styles.leftLoginBtnInner}>
              Login
            </button>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h1 className={styles.heading}>Welcome</h1>
            <p className={styles.subheading}>Create your vendor account to get started</p>

            {/* Social signup buttons */}
            <div className="space-y-3 mb-6">
              <button 
                type="button"
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className={`${styles.socialBtn} ${isGoogleLoading ? styles.socialBtnDisabled : ''}`}
              >
                <img src="/google_logo.png" alt="Google" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                {isGoogleLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
            </div>

            <p className="font-outfit font-normal text-[16px] leading-[20px] text-black text-center mb-4">Or sign up with your email</p>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                  {errors.general}
                </div>
              )}

              {/* Business Name */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="businessName"
                  placeholder="Business Name" 
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.businessName ? styles.inputError : ''}`}
                />
                {errors.businessName && <p className={styles.errorText}>{errors.businessName}</p>}
              </div>

              {/* Owner Name */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="ownerName"
                  placeholder="Owner Name" 
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.ownerName ? styles.inputError : ''}`}
                />
                {errors.ownerName && <p className={styles.errorText}>{errors.ownerName}</p>}
              </div>

              {/* Email */}
              <div className="mb-4">
                <input 
                  type="email" 
                  name="email"
                  placeholder="Email" 
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-4">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.password ? styles.inputError : ''}`}
                />
                {errors.password && <p className={styles.errorText}>{errors.password}</p>}
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <input 
                  type="tel" 
                  name="phoneNumber"
                  placeholder="Phone Number" 
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.phoneNumber ? styles.inputError : ''}`}
                />
                {errors.phoneNumber && <p className={styles.errorText}>{errors.phoneNumber}</p>}
              </div>

              {/* Street */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="street"
                  placeholder="Street Address (Optional)" 
                  value={formData.street}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.street ? styles.inputError : ''}`}
                />
                {errors.street && <p className={styles.errorText}>{errors.street}</p>}
              </div>

              {/* City */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="city"
                  placeholder="City (Optional)" 
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.city ? styles.inputError : ''}`}
                />
                {errors.city && <p className={styles.errorText}>{errors.city}</p>}
              </div>

              {/* State */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="state"
                  placeholder="State (Optional)" 
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.state ? styles.inputError : ''}`}
                />
                {errors.state && <p className={styles.errorText}>{errors.state}</p>}
              </div>

              {/* Country */}
              <div className="mb-4">
                <input 
                  type="text" 
                  name="country"
                  placeholder="Country"
                  defaultValue="United States"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.country ? styles.inputError : ''}`}
                />
                {errors.country && <p className={styles.errorText}>{errors.country}</p>}
              </div>

              {/* Zip Code */}
              <div className="mb-6">
                <input 
                  type="text" 
                  name="zipCode"
                  placeholder="Zip Code" 
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.zipCode ? styles.inputError : ''}`}
                />
                {errors.zipCode && <p className={styles.errorText}>{errors.zipCode}</p>}
              </div>

              {/* Signup button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`${styles.signupBtn} ${isLoading ? styles.signupBtnDisabled : ''}`}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            {/* Customer signup link */}
            <p className={styles.customerSignUp}>
              Are you a customer? <button className={styles.linkBtn} onClick={handleCustomerSignUp}>Sign up here</button>
            </p>

            {/* Join now */}
            <div className="flex flex-col items-center gap-2">
              <div className={styles.divider}></div>
              <p className={styles.joinNow}>
                Already have an account? <button className={styles.linkBtn} onClick={handleLogin}>Login Now</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
