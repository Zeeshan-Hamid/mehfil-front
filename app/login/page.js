'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGradients from '../components/BackgroundGradients/BackgroundGradients';
import styles from './LoginPage.module.css';
import { useUserStore } from '../state/userStore';
import { useVendorStore } from '../state/userStore';
import apiService from '../utils/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const { initializeVendorData } = useVendorStore();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google OAuth popup message
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from our backend
      if (event.origin !== 'http://localhost:8000') return;

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
        } else if (user.role === 'customer') {
          router.push('/');
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

  const handleSignUp = () => {
    router.push('/customer_signup');
  };

  const handleVendorSignUp = () => {
    router.push('/vendor_signup');
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleGoogleLogin = async (role = 'customer') => {
    setIsGoogleLoading(true);
    setErrors({});

    try {
      const googleAuthUrl = await apiService.initiateGoogleAuth(role);
      
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiService.login(formData);
      
      if (response.success) {
        const { user, token } = response.data;
        
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
        } else if (user.role === 'customer') {
          router.push('/');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid email or password')) {
        setErrors({ general: 'Invalid email or password' });
      } else if (error.message.includes('verify your email')) {
        setErrors({ general: 'Please verify your email before logging in. Check your inbox for a verification email.' });
      } else if (error.message.includes('deactivated')) {
        setErrors({ general: 'Account is deactivated. Please contact support.' });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
      <BackgroundGradients />

      <div className={styles.loginCard}>
        {/* Back button */}
        <button 
          onClick={handleBack}
          className={styles.backButton}
          aria-label="Go back to home page"
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
              To stay connected with us, please login with your personal information
            </div>
          </div>
          <div className={styles.leftSignUpBtn} onClick={handleSignUp}>
            <button className={styles.leftSignUpBtnInner}>
              Sign Up
            </button>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className={styles.rightPanel}>
          <div className={styles.formContainer}>
            <h1 className={styles.heading}>Welcome</h1>
            <p className={styles.subheading}>Log into your account to continue</p>

            {/* Social login buttons */}
            <div className="space-y-3 mb-6">
              <button 
                type="button"
                onClick={() => handleGoogleLogin('customer')}
                disabled={isGoogleLoading}
                className={`${styles.socialBtn} ${isGoogleLoading ? styles.socialBtnDisabled : ''}`}
              >
                <img src="/google_logo.png" alt="Google" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>

            <p className="font-outfit font-normal text-[16px] leading-[20px] text-black text-center mb-4">Login with your email</p>

            <form onSubmit={handleLogin}>
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                  {errors.general}
                </div>
              )}

              {/* Email input */}
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

              {/* Password input */}
              <div className="mb-6">
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

              {/* Login button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className={`${styles.loginBtn} ${isLoading ? styles.loginBtnDisabled : ''}`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {/* Forgot password */}
            <p className={styles.forgotPassword}>
              Forgot your password? <button className={styles.linkBtn} onClick={() => router.push('/forgot-password')}>Click here</button>
            </p>

            {/* Vendor login */}
            <p className={styles.vendorSignUp}>
              Are you a vendor? <button className={styles.linkBtn} onClick={handleVendorSignUp}>Sign up here</button>
            </p>

            {/* Join now */}
            <div className="flex flex-col items-center gap-2">
              <div className={styles.divider}></div>
              <p className={styles.joinNow}>
                Not a member yet? <button className={styles.linkBtn} onClick={handleSignUp}>Join Now</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
