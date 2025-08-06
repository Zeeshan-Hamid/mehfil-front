'use client';
import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

function Stars({ rating }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 24 24" fill={i <= rating ? '#FBBC04' : '#DBDCE0'} style={{ display: 'inline-block' }}>
          <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,22 12,18 5.5,22 7,14.5 2,9.5 9,9" />
        </svg>
      ))}
    </span>
  );
}

export default function SimilarVendors({ vendors = [], isPreview = false }) {
  const carouselRef = useRef(null);
  const router = useRouter();
  
  const handleVendorClick = (vendorId) => {
    if (!isPreview) {
      router.push(`/vendor_listing_details/${vendorId}`);
    }
  };
  
  // Handle case where vendors array is empty
  if (vendors.length === 0) {
    return (
      <div style={{ width: '100%', padding: '0 5vw', margin: '40px 0' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 24, lineHeight: '30px', color: '#000', marginBottom: 24 }}>
          Similar Vendors in Pakistan
        </div>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          No similar vendors available
        </div>
      </div>
    );
  }
  
  const scrollByCard = () => 300 + 33;
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -scrollByCard(), behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: scrollByCard(), behavior: 'smooth' });
    }
  };
  return (
    <div style={{ width: '100%', padding: '0 5vw', margin: '40px 0', position: 'relative' }}>
      <div style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 24, lineHeight: '30px', color: '#000', marginBottom: 24 }}>
        Similar Vendors in Pakistan
      </div>
      <div style={{ width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 36px' }}>
        <button onClick={isPreview ? undefined : scrollLeft} style={{ position: 'absolute', left: 0, zIndex: 2, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: isPreview ? 'default' : 'pointer', top: 'calc(50% - 18px)', transform: 'translateX(-50%)' }} aria-label="Scroll left" disabled={isPreview}>
          &#8592;
        </button>
        <div
          ref={carouselRef}
          style={{
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 33,
            padding: 0,
            paddingRight: 33,
            margin: '0 auto',
            height: 233,
            scrollBehavior: 'smooth',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {vendors.map((vendor, idx) => (
            <div 
              key={idx} 
              style={{ 
                width: 300, 
                minWidth: 300, 
                maxWidth: 300, 
                height: 233, 
                background: '#fff', 
                borderRadius: 16, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
                display: 'flex', 
                flexDirection: 'column', 
                overflow: 'hidden', 
                position: 'relative',
                cursor: isPreview ? 'default' : 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onClick={isPreview ? undefined : () => handleVendorClick(vendor.id)}
              onMouseEnter={isPreview ? undefined : (e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={isPreview ? undefined : (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              {/* Image */}
              <div style={{ width: 300, height: 156, position: 'relative' }}>
                <Image src={vendor.image} alt={vendor.name} width={300} height={156} style={{ borderRadius: 16, objectFit: 'cover' }} />
              </div>
              {/* Name and Stars */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 16, width: 300, height: 20, padding: 0, marginTop: 8, marginLeft: 0 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 16, lineHeight: '20px', color: '#000', display: 'flex', alignItems: 'flex-end' }}>{vendor.name}</span>
                <Stars rating={vendor.rating} />
              </div>
              {/* Location */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, width: 300, height: 16, marginTop: 8, marginLeft: 0 }}>
                <Image src="/location_icon.png" alt="Location" width={16} height={16} />
                <span style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 13, lineHeight: '16px', color: '#424242' }}>{vendor.location}</span>
              </div>
              {/* Reviews */}
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 6, width: 300, height: 16, marginTop: 8, marginLeft: 0 }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 13, lineHeight: '16px', color: '#424242' }}>{vendor.rating} ({vendor.reviews} Reviews)</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={isPreview ? undefined : scrollRight} style={{ position: 'absolute', right: 0, zIndex: 2, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', cursor: isPreview ? 'default' : 'pointer', top: 'calc(50% - 18px)', transform: 'translateX(50%)' }} aria-label="Scroll right" disabled={isPreview}>
          &#8594;
        </button>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 