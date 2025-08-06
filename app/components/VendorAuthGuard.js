'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../state/userStore';
import BackgroundGradients from './BackgroundGradients/BackgroundGradients';

export default function VendorAuthGuard({ children }) {
  const router = useRouter();
  const { user } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('VendorAuthGuard: Timeout reached, redirecting to home');
        setIsLoading(false);
        router.push('/');
      }
    }, 3000); // 3 seconds timeout

    return () => clearTimeout(timeout);
  }, [isLoading, router]);

  useEffect(() => {
    console.log('VendorAuthGuard: User data changed:', user);
    
    // If user is null or undefined, redirect to home (no user logged in)
    if (!user) {
      console.log('VendorAuthGuard: No user logged in, redirecting to home');
      setIsLoading(false);
      router.push('/');
      return;
    }



    if (user.role !== 'vendor') {
      // User is not a vendor, redirect to home
      console.log('VendorAuthGuard: User is not a vendor, redirecting to home');
      setIsLoading(false);
      router.push('/');
      return;
    }

    // Check if vendor profile is completed
    if (!user.vendorProfile?.profileCompleted) {
      // Profile not completed, redirect to onboarding
      console.log('VendorAuthGuard: Profile not completed, redirecting to onboarding');
      setIsLoading(false);
      router.push('/vendor_onboarding');
      return;
    }

    // User is authorized
    console.log('VendorAuthGuard: User authorized');
    setIsLoading(false);
  }, [user, router]);

  // Show loading state while checking authentication
  if (isLoading) {
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



  // If we reach here, user is authorized
  return children;
} 