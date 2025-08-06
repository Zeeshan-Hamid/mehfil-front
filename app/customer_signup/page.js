'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGradients from '../components/BackgroundGradients/BackgroundGradients';
import SignupContainer from '../components/SignupContainer/SignupContainer';
import apiService from '../utils/api';
import { useUserStore } from '../state/userStore';
import styles from './CustomerSignupPage.module.css';

export default function CustomerSignupPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: '',
    city: '',
    state: '',
    country: 'United States',
    zipCode: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleVendorSignUp = () => {
    router.push('/vendor_signup');
  };

  const handleBack = () => {
    router.back();
  };

  const handleGoogleSignup = () => {
    console.log('Starting Google signup process...');
    
    // Open Google OAuth popup for customer signup
    // Use the backend URL directly, not the frontend
    const backUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const googleAuthUrl = `${backUrl}/api/auth/google/customer`;
    console.log('Google Auth URL:', googleAuthUrl);
    
    // Create popup with specific features to avoid COOP issues
    const popup = window.open(
      googleAuthUrl,
      'googleAuth',
      'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
    );

    if (!popup) {
      console.error('Popup was blocked');
      setErrors({ general: 'Popup blocked! Please allow popups for this site and try again.' });
      return;
    }

    console.log('Popup opened successfully');

    // Listen for messages from the popup
    const handleMessage = (event) => {
      console.log('Received message:', event.data);
      console.log('Message origin:', event.origin);
      console.log('Expected origin:', window.location.origin);
      
      // Check if the message is from our backend popup and contains auth data NEXT_PUBLIC_BACKEND_URL=
      if ((event.origin === window.location.origin || event.origin === 'https://mehfil-backend-tzep.onrender.com') && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Google auth success received');
        const { user, token } = event.data;
        
        // Close the popup
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch (error) {
          console.log('Popup already closed or blocked');
        }
        
        // Remove the event listener
        window.removeEventListener('message', handleMessage);
        
        // Login the user
        login(user, token);
        
        // Redirect to home page for customers
        router.push('/');
      } else if ((event.origin === window.location.origin || event.origin === 'https://mehfil-backend-tzep.onrender.com') && event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.log('Google auth error received:', event.data.error);
        // Handle error
        try {
          if (popup && !popup.closed) {
            popup.close();
          }
        } catch (error) {
          console.log('Popup already closed or blocked');
        }
        window.removeEventListener('message', handleMessage);
        setErrors({ general: event.data.error || 'Google signup failed. Please try again.' });
      }
    };

    window.addEventListener('message', handleMessage);

    // Set a timeout to clean up if no response (instead of checking popup.closed)
    const timeout = setTimeout(() => {
      console.log('Google auth timeout reached');
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (error) {
        console.log('Could not close popup due to COOP policy');
      }
      window.removeEventListener('message', handleMessage);
    }, 300000); // 5 minutes timeout

    // Clean up timeout when message is received
    const originalHandleMessage = handleMessage;
    const wrappedHandleMessage = (event) => {
      clearTimeout(timeout);
      originalHandleMessage(event);
    };

    // Replace the event listener with the wrapped version
    window.removeEventListener('message', handleMessage);
    window.addEventListener('message', wrappedHandleMessage);
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

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Full name can only contain letters and spaces';
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

    // Gender validation
    if (!formData.gender.trim()) {
      newErrors.gender = 'Gender is required';
    } else if (!['male', 'female', 'prefer_not_to_say'].includes(formData.gender.toLowerCase())) {
      newErrors.gender = 'Please select a valid gender option';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
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
      const response = await apiService.signupCustomer(formData);
      
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
    <main className="relative w-full min-h-screen bg-[#FFFCFB] overflow-x-hidden overflow-y-auto">
      <BackgroundGradients />

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

      <SignupContainer 
        title="Join to build your own Mehfil"
        showButton={false}
        bottomLink={
          <p className={styles.bottomLink}>
            Are you a Vendor? <button className={styles.vendorLinkBtn} onClick={handleVendorSignUp}>Vendor sign up</button>
          </p>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Google Signup Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignup}
              className={styles.googleButton}
            >
              <img src="/google_logo.png" alt="Google" className={styles.googleIcon} />
              Sign up with Google
            </button>
          </div>

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerText}>Or continue with email</span>
          </div>

          {/* Full Name */}
          <div>
            <input 
              type="text" 
              name="fullName"
              placeholder="Full Name" 
              value={formData.fullName}
              onChange={handleInputChange}
              className={`${styles.inputField} ${errors.fullName ? styles.inputError : ''}`}
            />
            {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
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
          <div>
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
          <div>
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

          {/* Gender */}
          <div>
            <select 
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className={`${styles.inputField} ${errors.gender ? styles.inputError : ''}`}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            {errors.gender && <p className={styles.errorText}>{errors.gender}</p>}
          </div>

          {/* City */}
          <div>
            <input 
              type="text" 
              name="city"
              placeholder="City" 
              value={formData.city}
              onChange={handleInputChange}
              className={`${styles.inputField} ${errors.city ? styles.inputError : ''}`}
            />
            {errors.city && <p className={styles.errorText}>{errors.city}</p>}
          </div>

          {/* State */}
          <div>
            <input 
              type="text" 
              name="state"
              placeholder="State" 
              value={formData.state}
              onChange={handleInputChange}
              className={`${styles.inputField} ${errors.state ? styles.inputError : ''}`}
            />
            {errors.state && <p className={styles.errorText}>{errors.state}</p>}
          </div>

          {/* Country */}
          <div>
            <input 
              type="text" 
              name="country"
              placeholder="Country" 
              value={formData.country}
              onChange={handleInputChange}
              className={`${styles.inputField} ${errors.country ? styles.inputError : ''}`}
            />
            {errors.country && <p className={styles.errorText}>{errors.country}</p>}
          </div>

          {/* Zip Code */}
          <div>
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

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full h-[48px] bg-[#AF8EBA] rounded-[44px] font-outfit font-medium text-[16px] leading-[16px] text-white mt-6 hover:bg-[#9A7BA5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </SignupContainer>
    </main>
  );
}
