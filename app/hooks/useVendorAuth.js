'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '../state/userStore';

export function useVendorAuth() {
  const router = useRouter();
  const { user } = useUserStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If user is not logged in, redirect immediately
    if (!user) {
      router.replace('/');
      return;
    }

    // If user is not a vendor, redirect immediately
    if (user.role !== 'vendor') {
      router.replace('/');
      return;
    }

    // If vendor profile is not completed, redirect to onboarding
    if (!user.vendorProfile?.profileCompleted) {
      router.replace('/vendor_onboarding');
      return;
    }

    // User is authorized
    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, router]);

  return { isAuthorized, isChecking, user };
} 