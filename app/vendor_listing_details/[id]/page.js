'use client';
import { useParams } from 'next/navigation';
import VendorListingDetailsTemplate from '../../components/vendor_listing_details/VendorListingDetailsTemplate';
import { useVendorData } from '../../hooks/useVendorData';
import CustomerChatbot from '../../components/CustomerChatbot/CustomerChatbot';



export default function VendorListingDetailsPage() {
  const params = useParams();
  const vendorId = params.id;
  const { data: vendorData, loading, error, refetch } = useVendorData(vendorId);

  return (
    <>
      <VendorListingDetailsTemplate 
        vendorData={vendorData}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
      <CustomerChatbot />
    </>
  );
} 