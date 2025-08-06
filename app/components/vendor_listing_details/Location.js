import React from 'react';
import Image from 'next/image';

export default function Location({ address, displayText }) {
  // Handle case where props are not provided
  if (!address || !displayText) {
    return (
      <div style={{ width: '100%', padding: '0 5vw', margin: '40px 0' }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 24, lineHeight: '30px', color: '#000', marginBottom: 24 }}>
          Location
        </div>
        <div style={{ textAlign: 'center', color: '#666', fontSize: '16px' }}>
          Location information not available
        </div>
      </div>
    );
  }
  
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  
  return (
    <div style={{ width: '100%', padding: '0 5vw', margin: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
      {/* Location Label */}
      <div style={{ fontFamily: 'Outfit', fontStyle: 'normal', fontWeight: 400, fontSize: 24, lineHeight: '30px', color: '#000', marginBottom: 4 }}>
        Location
      </div>
      {/* Address */}
      <div style={{ fontFamily: 'Outfit', fontStyle: 'normal', fontWeight: 300, fontSize: 20, lineHeight: '25px', color: '#000', marginBottom: 16 }}>
        {displayText}
      </div>
      {/* Map Container */}
      <div style={{ width: '100%', height: 300, background: '#FFF', borderRadius: 5, position: 'relative', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {/* Google Maps Iframe */}
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map Location"
        />
        {/* Google Logo */}
        <div style={{ position: 'absolute', left: 5, bottom: 0, width: 66, height: 26 }}>
          <Image src="/google_logo.png" alt="Google Logo" width={66} height={26} style={{ filter: 'drop-shadow(0px 0px 3px #FFF)' }} />
        </div>
      </div>
    </div>
  );
} 