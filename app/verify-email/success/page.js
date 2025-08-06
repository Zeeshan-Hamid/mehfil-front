'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserStore } from '../../state/userStore';
import styles from './page.module.css';

function VerifyEmailSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processVerification = async () => {
      try {
        const encodedData = searchParams.get('data');
        
        if (!encodedData) {
          setError('Invalid verification link');
          setIsProcessing(false);
          return;
        }

        // Decode the verification data
        const decodedData = Buffer.from(encodedData, 'base64').toString();
        const verificationData = JSON.parse(decodedData);

        if (!verificationData.success) {
          setError(verificationData.message || 'Verification failed');
          setIsProcessing(false);
          return;
        }

        // Extract user data and token
        const { user, token } = verificationData.data;

        // Login the user
        login(user, token);

        // Redirect based on user role
        if (user.role === 'vendor') {
          router.push('/profile_listing');
        } else if (user.role === 'customer') {
          router.push('/'); // Redirect to home page for customers
        } else {
          router.push('/');
        }

      } catch (error) {
        console.error('Error processing verification:', error);
        setError('Failed to process verification. Please try again.');
        setIsProcessing(false);
      }
    };

    processVerification();
  }, [searchParams, login, router]);

  if (isProcessing) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <h2>Verifying your email...</h2>
          <p>Please wait while we complete your verification.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>Verification Failed</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className={styles.button}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailSuccess() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <h2>Loading...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    }>
      <VerifyEmailSuccessContent />
    </Suspense>
  );
} 