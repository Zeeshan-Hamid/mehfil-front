'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getVendorProfile } from '../../../services/vendorService';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaStar, FaComments } from 'react-icons/fa';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const VendorProfilePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleMessageVendor = () => {
    // Navigate to customer profile dashboard messages tab with vendor-only conversation
    router.push(`/customer_profile_dash?tab=Messages&vendorId=${id}`);
  };

  useEffect(() => {
    if (id) {
      const fetchVendorProfile = async () => {
        try {
          setLoading(true);
          const response = await getVendorProfile(id);
          console.log('Vendor profile response:', response);
          setVendor(response.data.vendor);
          setEvents(response.data.events);
          setError(null);
        } catch (err) {
          setError(err.message || 'Failed to fetch vendor profile.');
          setVendor(null);
          setEvents([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVendorProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, Nunito, Roboto, sans-serif' }}>
        <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px" />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>Loading vendor profile...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, Nunito, Roboto, sans-serif' }}>
        <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px" />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
          <div style={{ textAlign: 'center', color: '#d32f2f' }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>Error</div>
            <div style={{ fontSize: 16 }}>{error}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, Nunito, Roboto, sans-serif' }}>
        <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px" />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' }}>
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: 24, marginBottom: 16 }}>Vendor not found</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { vendorProfile } = vendor;

  return (
    <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Outfit, Nunito, Roboto, sans-serif' }}>
      <Navbar backgroundColor="#AF8EBA" customHeight="25px 20px" />
      
      <div style={{ flex: 1, background: '#f8f9fa', padding: '40px 5vw', paddingTop: '120px' }}>
        {/* Vendor Header Section */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(175, 142, 186, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#AF8EBA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FaUser style={{ fontSize: 48, color: '#fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{vendorProfile.businessName}</h1>
              <p style={{ fontSize: 18, color: '#666', marginBottom: 16 }}>by {vendorProfile.ownerName}</p>
              
                             {/* Contact Information */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <FaEnvelope style={{ color: '#AF8EBA', fontSize: 16 }} />
                   <span style={{ color: '#666', fontSize: 14 }}>{vendor.email}</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <FaPhone style={{ color: '#AF8EBA', fontSize: 16 }} />
                   <span style={{ color: '#666', fontSize: 14 }}>{vendor.phoneNumber}</span>
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12, gridColumn: 'span 2' }}>
                   <FaMapMarkerAlt style={{ color: '#AF8EBA', fontSize: 16 }} />
                   <span style={{ color: '#666', fontSize: 14 }}>
                     {`${vendorProfile.businessAddress.street}, ${vendorProfile.businessAddress.city}, ${vendorProfile.businessAddress.state} ${vendorProfile.businessAddress.zipCode}`}
                   </span>
                 </div>
               </div>
               
               {/* Message Vendor Button */}
               <div style={{ marginTop: 24 }}>
                 <button
                   onClick={handleMessageVendor}
                   style={{
                     display: 'flex',
                     alignItems: 'center',
                     gap: 8,
                     background: '#AF8EBA',
                     color: '#fff',
                     border: 'none',
                     borderRadius: 25,
                     padding: '12px 24px',
                     fontSize: 14,
                     fontWeight: 600,
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     fontFamily: 'Outfit, sans-serif',
                     boxShadow: '0 2px 8px rgba(175, 142, 186, 0.3)'
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = '#9a7da6';
                     e.target.style.transform = 'translateY(-1px)';
                     e.target.style.boxShadow = '0 4px 12px rgba(175, 142, 186, 0.4)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = '#AF8EBA';
                     e.target.style.transform = 'translateY(0)';
                     e.target.style.boxShadow = '0 2px 8px rgba(175, 142, 186, 0.3)';
                   }}
                 >
                   <FaComments style={{ fontSize: 16 }} />
                   Message Vendor
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(175, 142, 186, 0.1)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: '#1a1a1a', marginBottom: 24 }}>
            Listings from {vendorProfile.businessName}
          </h2>
          
          {events.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                             {events.map((event) => (
                 <div 
                   key={event._id} 
                   style={{ 
                     background: '#f8f9fa', 
                     borderRadius: 12, 
                     padding: 24, 
                     border: '1px solid rgba(0,0,0,0.05)', 
                     cursor: 'pointer',
                     transition: 'all 0.2s ease'
                   }}
                   onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
                   onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                   onClick={() => window.location.href = `/vendor_listing_details/${event._id}`}
                 >
                   <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                     {/* Event Image - Circular */}
                     <div style={{ 
                       width: 80, 
                       height: 80, 
                       borderRadius: '50%', 
                       overflow: 'hidden', 
                       flexShrink: 0,
                       border: '2px solid #AF8EBA'
                     }}>
                       <img 
                         src={event.imageUrls && event.imageUrls.length > 0 ? event.imageUrls[0] : '/hero_bg_blur.png'} 
                         alt={event.name}
                         style={{ 
                           width: '100%', 
                           height: '100%', 
                           objectFit: 'cover'
                         }}
                         onError={(e) => {
                           e.target.src = '/hero_bg_blur.png';
                         }}
                       />
                     </div>
                     
                     {/* Event Content */}
                     <div style={{ flex: 1, minWidth: 0 }}>
                       <div style={{ marginBottom: 16 }}>
                         <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>{event.name}</h3>
                         <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5 }}>
                           {event.description ? event.description.substring(0, 120) + '...' : 'No description available'}
                         </p>
                       </div>
                       
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontSize: 18, fontWeight: 700, color: '#AF8EBA' }}>
                           {event.packages && event.packages.length > 0 
                             ? `$${Math.min(...event.packages.map(pkg => pkg.price || 0)).toLocaleString()}`
                             : 'Price not available'
                           }
                         </span>
                         <span style={{ 
                           color: '#AF8EBA', 
                           fontSize: 14, 
                           fontWeight: 600,
                           cursor: 'pointer'
                         }}>
                           View Details →
                         </span>
                       </div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: '#666' }}>
              <div style={{ fontSize: 24, marginBottom: 16 }}>📦</div>
              <div style={{ fontSize: 18, marginBottom: 8 }}>No listings found</div>
              <div style={{ fontSize: 14 }}>This vendor hasn't created any listings yet.</div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VendorProfilePage;
