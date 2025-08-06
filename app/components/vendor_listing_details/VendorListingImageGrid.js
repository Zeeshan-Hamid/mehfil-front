'use client';
import Image from 'next/image';
import styles from './VendorListingImageGrid.module.css';
import { useState, useEffect } from 'react';

export default function VendorListingImageGrid({
  images = [],
  className = '',
  mainFlex = 2,
  sideFlex = 1.2,
  tallFlex = 1.1,
  mainAspect = '2/1',
  sideAspect = '306/170',
  tallAspect = '318/328',
  gap = '1vw',
  onViewAll,
  isPreview = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(null); // 'left' or 'right'
  const [animating, setAnimating] = useState(false);
  const [nextIndex, setNextIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openModal = (idx) => {
    setActiveIndex(idx);
    setModalOpen(true);
    setSlideDir(null);
    setNextIndex(null);
  };
  const closeModal = () => setModalOpen(false);
  const prevImage = (e) => {
    e.stopPropagation();
    if (animating) return;
    setSlideDir('left');
    setNextIndex((activeIndex - 1 + images.length) % images.length);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      setSlideDir(null);
      setAnimating(false);
      setNextIndex(null);
    }, 350);
  };
  const nextImage = (e) => {
    e.stopPropagation();
    if (animating) return;
    setSlideDir('right');
    setNextIndex((activeIndex + 1) % images.length);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
      setSlideDir(null);
      setAnimating(false);
      setNextIndex(null);
    }, 350);
  };

  // Mobile carousel functions
  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Mobile view - single image with carousel
  if (isMobile) {
    return (
      <>
        <div className={styles.mobileImageContainer}>
          <div className={styles.mobileMainImage}>
            <button 
              onClick={isPreview ? undefined : () => openModal(activeIndex)} 
              style={{ all: 'unset', cursor: isPreview ? 'default' : 'pointer', width: '100%', height: '100%', display: 'block' }}
            >
              <Image 
                src={images[activeIndex] || '/hero_bg_blur.png'} 
                alt={`Image ${activeIndex + 1}`} 
                fill 
                className={styles.mobileImage} 
              />
            </button>
            
            {/* Carousel Navigation */}
            {images.length > 1 && (
              <>
                <button 
                  className={styles.mobileCarouselBtn} 
                  onClick={goToPrev}
                  style={{ left: '10px' }}
                  disabled={isPreview}
                >
                  ‹
                </button>
                <button 
                  className={styles.mobileCarouselBtn} 
                  onClick={goToNext}
                  style={{ right: '10px' }}
                  disabled={isPreview}
                >
                  ›
                </button>
                
                {/* Dots indicator */}
                <div className={styles.mobileDots}>
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.mobileDot} ${index === activeIndex ? styles.mobileDotActive : ''}`}
                      onClick={() => setActiveIndex(index)}
                      disabled={isPreview}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Modal */}
        {modalOpen && !isPreview && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s', transition: 'background 0.2s',
            }}
            onClick={closeModal}
          >
            <button onClick={prevImage} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', zIndex: 1010 }}>&#8592;</button>
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'zoomIn 0.2s', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* Only render sliding images when navigating */}
                {slideDir && nextIndex !== null ? (
                  <>
                    <div className={`modal-image-anim${slideDir === 'left' ? ' slide-out-left' : ''}${slideDir === 'right' ? ' slide-out-right' : ''}`} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                      <Image src={images[activeIndex] || '/hero_bg_blur.png'} alt={`Image ${activeIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                    </div>
                    <div className={`modal-image-anim${slideDir === 'left' ? ' slide-in-right' : ''}${slideDir === 'right' ? ' slide-in-left' : ''}`} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                      <Image src={images[nextIndex] || '/hero_bg_blur.png'} alt={`Image ${nextIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                    </div>
                  </>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src={images[activeIndex] || '/hero_bg_blur.png'} alt={`Image ${activeIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                  </div>
                )}
              </div>
              <button onClick={closeModal} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 28, borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', zIndex: 1011, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>
                &#10005;
              </button>
            </div>
            <button onClick={nextImage} style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', zIndex: 1010 }}>&#8594;</button>
            <style jsx global>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes zoomIn { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
              .modal-image-anim {
                transition: transform 0.35s cubic-bezier(.77,0,.18,1), opacity 0.35s cubic-bezier(.77,0,.18,1);
              }
              .modal-image-anim.slide-out-left {
                transform: translateX(-100vw);
                opacity: 0;
                z-index: 2;
              }
              .modal-image-anim.slide-in-right {
                transform: translateX(100vw);
                opacity: 0;
                z-index: 1;
                animation: slideInFromRight 0.35s forwards;
              }
              .modal-image-anim.slide-out-right {
                transform: translateX(100vw);
                opacity: 0;
                z-index: 2;
              }
              .modal-image-anim.slide-in-left {
                transform: translateX(-100vw);
                opacity: 0;
                z-index: 1;
                animation: slideInFromLeft 0.35s forwards;
              }
              @keyframes slideInFromRight {
                from { transform: translateX(100vw); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
              @keyframes slideInFromLeft {
                from { transform: translateX(-100vw); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
          </div>
        )}
      </>
    );
  }

  // Desktop view - original layout
  return (
    <>
      <div className={`${styles.imagesRow} ${className}`.trim()} style={{ gap, position: 'relative' }}>
        {/* Main (largest) image on the left */}
        <div
          className={styles.mainImageWrapper}
          style={{ flex: mainFlex, aspectRatio: mainAspect }}
        >
          <button onClick={isPreview ? undefined : () => openModal(0)} style={{ all: 'unset', cursor: isPreview ? 'default' : 'pointer', width: '100%', height: '100%', display: 'block' }}>
            <Image src={images[0] || '/hero_bg_blur.png'} alt="Main" fill className={styles.mainImage} />
          </button>
        </div>
        {/* Two smaller images stacked vertically in the middle */}
        <div
          className={styles.sideImagesColumn}
          style={{ flex: sideFlex, gap, minWidth: 0 }}
        >
          <div className={styles.sideImageWrapper} style={{ aspectRatio: sideAspect }}>
            <button onClick={isPreview ? undefined : () => openModal(1)} style={{ all: 'unset', cursor: isPreview ? 'default' : 'pointer', width: '100%', height: '100%', display: 'block' }}>
              <Image src={images[1] || '/hero_bg_blur.png'} alt="Side 1" fill className={styles.sideImage} />
            </button>
          </div>
          <div className={styles.sideImageWrapper} style={{ aspectRatio: sideAspect }}>
            <button onClick={isPreview ? undefined : () => openModal(2)} style={{ all: 'unset', cursor: isPreview ? 'default' : 'pointer', width: '100%', height: '100%', display: 'block' }}>
              <Image src={images[2] || '/hero_bg_blur.png'} alt="Side 2" fill className={styles.sideImage} />
            </button>
          </div>
        </div>
        {/* Tall image on the far right */}
        <div
          className={styles.tallImageWrapper}
          style={{ flex: tallFlex, aspectRatio: tallAspect }}
        >
          <button onClick={isPreview ? undefined : () => openModal(3)} style={{ all: 'unset', cursor: isPreview ? 'default' : 'pointer', width: '100%', height: '100%', display: 'block' }}>
            <Image src={images[3] || '/hero_bg_blur.png'} alt="Tall" fill className={styles.tallImage} />
          </button>
          {onViewAll && (
            <button className={styles.viewAllBtn} onClick={isPreview ? undefined : onViewAll} style={{ cursor: isPreview ? 'default' : 'pointer', opacity: isPreview ? 0.6 : 1 }}>View All</button>
          )}
        </div>
        {/* View All Button at bottom right */}
        <button
          onClick={isPreview ? undefined : () => openModal(0)}
          style={{
            position: 'absolute',
            right: 0,
            bottom: 16,
            left: 'auto',
            marginRight: 16,
            marginLeft: 'auto',
            width: 117,
            height: 41,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 90,
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            lineHeight: '100%',
            cursor: isPreview ? 'default' : 'pointer',
            zIndex: 10,
            backdropFilter: 'blur(29.7px)',
            boxSizing: 'border-box',
            padding: 0,
            opacity: isPreview ? 0.6 : 1
          }}
          disabled={isPreview}
        >
          View All
        </button>
      </div>
      {modalOpen && !isPreview && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s', transition: 'background 0.2s',
          }}
          onClick={closeModal}
        >
          <button onClick={prevImage} style={{ position: 'absolute', left: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', zIndex: 1010 }}>&#8592;</button>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'zoomIn 0.2s', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {/* Only render sliding images when navigating */}
              {slideDir && nextIndex !== null ? (
                <>
                  <div className={`modal-image-anim${slideDir === 'left' ? ' slide-out-left' : ''}${slideDir === 'right' ? ' slide-out-right' : ''}`} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                    <Image src={images[activeIndex] || '/hero_bg_blur.png'} alt={`Image ${activeIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                  </div>
                  <div className={`modal-image-anim${slideDir === 'left' ? ' slide-in-right' : ''}${slideDir === 'right' ? ' slide-in-left' : ''}`} style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
                    <Image src={images[nextIndex] || '/hero_bg_blur.png'} alt={`Image ${nextIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={images[activeIndex] || '/hero_bg_blur.png'} alt={`Image ${activeIndex + 1}`} width={900} height={600} style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 16, objectFit: 'contain', boxShadow: '0 4px 32px #0008', transition: 'none' }} />
                </div>
              )}
            </div>
            <button onClick={closeModal} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', fontSize: 28, borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', zIndex: 1011, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, lineHeight: 1 }}>
              &#10005;
            </button>
          </div>
          <button onClick={nextImage} style={{ position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', zIndex: 1010 }}>&#8594;</button>
          <style jsx global>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes zoomIn { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
            .modal-image-anim {
              transition: transform 0.35s cubic-bezier(.77,0,.18,1), opacity 0.35s cubic-bezier(.77,0,.18,1);
            }
            .modal-image-anim.slide-out-left {
              transform: translateX(-100vw);
              opacity: 0;
              z-index: 2;
            }
            .modal-image-anim.slide-in-right {
              transform: translateX(100vw);
              opacity: 0;
              z-index: 1;
              animation: slideInFromRight 0.35s forwards;
            }
            .modal-image-anim.slide-out-right {
              transform: translateX(100vw);
              opacity: 0;
              z-index: 2;
            }
            .modal-image-anim.slide-in-left {
              transform: translateX(-100vw);
              opacity: 0;
              z-index: 1;
              animation: slideInFromLeft 0.35s forwards;
            }
            @keyframes slideInFromRight {
              from { transform: translateX(100vw); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideInFromLeft {
              from { transform: translateX(-100vw); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </>
  );
} 