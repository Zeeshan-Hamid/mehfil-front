import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';

export function ServicesContainer({ containerRef, header, services = [] }) {
  return (
    <div ref={containerRef} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {header}
      <div style={{ 
        fontFamily: 'Outfit, sans-serif', 
        fontWeight: 300, 
        fontSize: 'clamp(14px, 2.5vw, 20px)', 
        lineHeight: 'clamp(18px, 3vw, 25px)', 
        color: '#000', 
        marginBottom: 'clamp(16px, 3vw, 24px)' 
      }}>
        Facilities we provide to our customers
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'clamp(12px, 2vw, 20px) clamp(20px, 4vw, 40px)',
        width: '100%'
      }}>
        {services.map((service, i) => (
          <div key={service.label} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'clamp(8px, 1.5vw, 16px)', 
            minWidth: 0, 
            fontFamily: 'Outfit, sans-serif', 
            fontWeight: 400, 
            fontSize: 'clamp(14px, 2.5vw, 20px)', 
            lineHeight: 'clamp(18px, 3vw, 25px)', 
            color: service.label?.includes('goes here') ? '#999' : '#000',
            fontStyle: service.label?.includes('goes here') ? 'italic' : 'normal',
            padding: 'clamp(4px, 1vw, 8px)',
            borderRadius: 'clamp(4px, 0.8vw, 6px)',
            transition: 'background-color 0.2s ease'
          }}>
            <Image 
              src={service.icon} 
              alt={service.label} 
              width={24} 
              height={24} 
              style={{ 
                minWidth: 'clamp(20px, 3.5vw, 24px)', 
                minHeight: 'clamp(20px, 3.5vw, 24px)',
                maxWidth: 'clamp(20px, 3.5vw, 24px)',
                maxHeight: 'clamp(20px, 3.5vw, 24px)'
              }} 
            />
            <span style={{ 
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {service.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DescriptionContainer({ description, height, header }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const descriptionRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (descriptionRef.current) {
      const element = descriptionRef.current;
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [description]);

  const handleMouseEnter = (e) => {
    if (isTruncated) {
      const rect = containerRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX
      });
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        flex: 1, 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        height: height ? height : '100%',
        position: 'relative'
      }}
    >
      {header}
      <div 
        ref={descriptionRef}
        style={{ 
          fontFamily: 'Outfit, sans-serif', 
          fontWeight: 300, 
          fontSize: 'clamp(14px, 2.5vw, 18px)', 
          lineHeight: 'clamp(18px, 3vw, 24px)', 
          color: description?.includes('goes here') ? '#999' : '#000',
          fontStyle: description?.includes('goes here') ? 'italic' : 'normal',
          maxHeight: 'clamp(80px, 15vw, 120px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          cursor: isTruncated ? 'help' : 'default',
          position: 'relative',
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={isTruncated ? 'Hover to see full description' : ''}
      >
        {description}
        {isTruncated && (
          <span style={{ 
            position: 'absolute', 
            bottom: 0, 
            right: 0, 
            background: 'linear-gradient(90deg, transparent, #fff 20%)',
            paddingLeft: 'clamp(10px, 2vw, 20px)',
            fontSize: 'clamp(10px, 1.8vw, 14px)',
            color: '#666'
          }}>
            ...
          </span>
        )}
      </div>

      {/* Popup overlay for full description */}
      {isHovered && isTruncated && (
        <div
          style={{
            position: 'fixed',
            top: popupPosition.top,
            left: popupPosition.left,
            maxWidth: 'clamp(250px, 50vw, 400px)',
            background: '#FFFFFF',
            border: '1px solid #E0E0E0',
            borderRadius: 'clamp(6px, 1.2vw, 8px)',
            padding: 'clamp(12px, 2.5vw, 16px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 300,
            fontSize: 'clamp(12px, 2.2vw, 16px)',
            lineHeight: 'clamp(16px, 2.8vw, 22px)',
            color: description?.includes('goes here') ? '#999' : '#000',
            fontStyle: description?.includes('goes here') ? 'italic' : 'normal',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
        >
          {description}
        </div>
      )}
    </div>
  );
}

export default function ServicesDescSection({ description, services = [] }) {
  const servicesRef = useRef(null);
  const [height, setHeight] = useState();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (servicesRef.current) {
      setHeight(servicesRef.current.offsetHeight);
    }
  }, [description]);

  return (
    <>
      {/* Removed section separator lines for consistency; now handled in page.js */}
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 'clamp(16px, 3vw, 48px)', 
          width: '100%', 
          alignItems: 'flex-start',
          marginBottom: 'clamp(16px, 3vw, 24px)'
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontFamily: 'Outfit, sans-serif', 
              fontWeight: 400, 
              fontSize: 'clamp(18px, 3.5vw, 24px)', 
              lineHeight: 'clamp(22px, 4vw, 30px)', 
              color: '#000', 
              marginBottom: 'clamp(12px, 2.5vw, 24px)' 
            }}>
              Services
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontFamily: 'Outfit, sans-serif', 
              fontWeight: 400, 
              fontSize: 'clamp(18px, 3.5vw, 24px)', 
              lineHeight: 'clamp(22px, 4vw, 30px)', 
              color: '#000', 
              marginBottom: 'clamp(12px, 2.5vw, 24px)' 
            }}>
              Description
            </div>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: 'clamp(20px, 4vw, 48px)', 
          width: '100%', 
          alignItems: 'stretch' 
        }}>
          <ServicesContainer containerRef={servicesRef} header={null} services={services} />
          <DescriptionContainer description={description} height={isMobile ? undefined : height} header={null} />
        </div>
      </div>
    </>
  );
} 