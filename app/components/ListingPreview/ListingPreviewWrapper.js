'use client';

export default function ListingPreviewWrapper({ children }) {
  return (
    <div className="listing-preview-wrapper">
      {children}
      <style jsx global>{`
        .listing-preview-wrapper .navbar {
          --navbar-height: 72px !important;
          --navbar-padding: 18px !important;
          --logo-height: 36px !important;
          --logo-width: 28px !important;
          --brand-font-size: 18px !important;
          --nav-font-size: 16px !important;
          --button-height: 32px !important;
          --button-font-size: 14px !important;
          --button-padding-x: 26px !important;
          --icon-size: 20px !important;
          --icon-gap: 14px !important;
          --section-gap: 29px !important;
          position: static !important;
          flex-shrink: 0 !important;
        }
        
        .listing-preview-wrapper {
          width: 100%;
          height: auto;
          min-height: 100%;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }
        
        /* Ensure proper scrolling and content visibility */
        .listing-preview-wrapper > * {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
} 