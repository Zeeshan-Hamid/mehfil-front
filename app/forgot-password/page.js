'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundGradients from '../components/BackgroundGradients/BackgroundGradients';
import apiService from '../utils/api';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.forgotPassword(email);
      
      if (response.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (isSuccess) {
    return (
      <main className="relative w-full h-screen bg-[#FFFCFB] overflow-hidden">
        <BackgroundGradients />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className={styles.successTitle}>Check Your Email</h2>
            <p className={styles.successMessage}>
              If an account exists with <strong>{email}</strong>, you will receive password reset instructions in your email.
            </p>
            <div className={styles.successActions}>
              <button 
                onClick={handleBackToLogin}
                className={styles.backButton}
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
        <div className={styles.forgotPasswordCard}>
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
                Don't worry! It happens to the best of us. Enter your email to reset your password.
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
              <h1 className={styles.heading}>Forgot Password</h1>
              <p className={styles.subheading}>
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className={styles.inputField}
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`${styles.submitButton} ${isLoading ? styles.submitButtonDisabled : ''}`}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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