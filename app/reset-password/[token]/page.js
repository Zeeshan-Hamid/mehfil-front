'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BackgroundGradients from '../../components/BackgroundGradients/BackgroundGradients';
import apiService from '../../utils/api';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token;
  
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Invalid reset link');
        setIsValidating(false);
        return;
      }

      try {
        const response = await apiService.verifyResetToken(token);
        if (response.success) {
          setIsValid(true);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setError('This password reset link is invalid or has expired. Please request a new one.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      setError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      return false;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.resetPassword(token, formData.password, formData.passwordConfirm);
      
      if (response.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleRequestNewLink = () => {
    router.push('/forgot-password');
  };

  if (isValidating) {
    return (
      <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={styles.loadingCard}>
            <div className={styles.spinner}></div>
            <h2 className={styles.loadingTitle}>Validating Reset Link...</h2>
            <p className={styles.loadingMessage}>Please wait while we verify your password reset link.</p>
          </div>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Password Reset Successful!</h2>
            <p className={styles.successMessage}>
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            <div className={styles.successActions}>
              <button 
                onClick={handleBackToLogin}
                className={styles.backButton}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isValid) {
    return (
      <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={styles.errorCard}>
            <div className={styles.errorIcon}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className={styles.errorTitle}>Invalid Reset Link</h2>
            <p className={styles.errorMessage}>
              {error || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <div className={styles.errorActions}>
              <button 
                onClick={handleRequestNewLink}
                className={styles.primaryButton}
              >
                Request New Link
              </button>
              <button 
                onClick={handleBackToLogin}
                className={styles.secondaryButton}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
      <BackgroundGradients />
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={styles.resetPasswordCard}>
          {/* Left Panel */}
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
                Create a new password for your account. Make sure it's secure and easy to remember.
              </div>
            </div>
            <div className={styles.leftBackBtn} onClick={handleBackToLogin}>
              <button className={styles.leftBackBtnInner}>
                Back to Login
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.rightPanel}>
            <div className={styles.formContainer}>
              <h1 className={styles.heading}>Reset Password</h1>
              <p className={styles.subheading}>
                Enter your new password below. Make sure it's secure and different from your previous password.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    New Password
                  </label>
                  <input 
                    type="password" 
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                    className={styles.inputField}
                    disabled={isLoading}
                  />
                  <div className={styles.passwordRequirements}>
                    <p>Password must contain:</p>
                    <ul>
                      <li className={formData.password.length >= 8 ? styles.requirementMet : styles.requirementNotMet}>
                        At least 8 characters
                      </li>
                      <li className={/[a-z]/.test(formData.password) ? styles.requirementMet : styles.requirementNotMet}>
                        One lowercase letter
                      </li>
                      <li className={/[A-Z]/.test(formData.password) ? styles.requirementMet : styles.requirementNotMet}>
                        One uppercase letter
                      </li>
                      <li className={/\d/.test(formData.password) ? styles.requirementMet : styles.requirementNotMet}>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="passwordConfirm" className={styles.label}>
                    Confirm New Password
                  </label>
                  <input 
                    type="password" 
                    id="passwordConfirm"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    className={styles.inputField}
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`${styles.submitButton} ${isLoading ? styles.submitButtonDisabled : ''}`}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>

              <div className={styles.bottomLinks}>
                <p className={styles.rememberPassword}>
                  Remember your password? <button className={styles.linkButton} onClick={handleBackToLogin}>Back to Login</button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 