import React from 'react';
import Image from 'next/image';

export default function AI_Review_Summary({ summary }) {
  // Handle case where summary is not provided
  if (!summary) {
    return (
      <div style={{ width: '100%', background: '#FDFDFD', boxShadow: '2px 2px 14.6px rgba(0, 0, 0, 0.12)', borderRadius: 16, padding: '36px 40px', boxSizing: 'border-box', margin: '40px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Image src="/Ai_Sparkle.png" alt="AI Sparkle" width={24} height={24} style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: 24, lineHeight: '30px', color: '#000' }}>Review Summary</span>
        </div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 300, fontSize: 16, lineHeight: '20px', color: '#6E6E6E', marginBottom: 18 }}>
          This AI generated summary is the snapshot of this vendor's rating and feedback
        </div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 20, lineHeight: '32px', color: '#000', width: '100%', textAlign: 'center' }}>
          No review summary available
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ width: '100%', background: '#FDFDFD', boxShadow: '2px 2px 14.6px rgba(0, 0, 0, 0.12)', borderRadius: 16, padding: '36px 40px', boxSizing: 'border-box', margin: '40px 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        {/* AI Sparkle Icon */}
        <Image src="/Ai_Sparkle.png" alt="AI Sparkle" width={24} height={24} style={{ flexShrink: 0 }} />
        <span style={{ fontFamily: 'Outfit', fontWeight: 500, fontSize: 24, lineHeight: '30px', color: '#000' }}>Review Summary</span>
      </div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 300, fontSize: 16, lineHeight: '20px', color: '#6E6E6E', marginBottom: 18 }}>
        This AI generated summary is the snapshot of this vendor's rating and feedback
      </div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 400, fontSize: 20, lineHeight: '32px', color: '#000', width: '100%' }}>
        {summary}
      </div>
    </div>
  );
} 