'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../state/userStore';

export default function VendorLayout({ children }) {
  const router = useRouter();
  const { user } = useUserStore();

  useEffect(() => {
    // Check authentication immediately when component mounts
    if (!user) {
      // No user logged in, redirect to home
      router.replace('/');
      return;
    }

    if (user.role !== 'vendor') {
      // User is not a vendor, redirect to home
      router.replace('/');
      return;
    }

    // Check if vendor profile is completed
    if (!user.vendorProfile?.profileCompleted) {
      // Profile not completed, redirect to onboarding
      router.replace('/vendor_onboarding');
      return;
    }
  }, [user, router]);

  // Don't render anything if user is not authenticated or not a vendor
  if (!user || user.role !== 'vendor' || !user.vendorProfile?.profileCompleted) {
    return null; // Return null to prevent any rendering
  }

  // Only render children if user is authenticated and authorized
  return children;
} 