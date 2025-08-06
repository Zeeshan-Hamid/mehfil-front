import { useEffect, useState } from 'react';

export default function BackgroundGradients() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    // Render multiple softly blurred, colored gradient blobs for mobile
    return (
      <div className="absolute w-full h-full left-0 top-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            width: '80vw',
            height: '40vw',
            left: '10vw',
            top: '0',
            background: 'radial-gradient(circle at 50% 30%, #C4AAD9 0%, #FFFCFB 80%)',
            opacity: 0.35,
            filter: 'blur(48px)',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '60vw',
            height: '40vw',
            left: '5vw',
            top: '40vh',
            background: 'radial-gradient(circle at 30% 70%, #B599A9 0%, #FFFCFB 80%)',
            opacity: 0.22,
            filter: 'blur(36px)',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '70vw',
            height: '30vw',
            left: '25vw',
            top: '70vh',
            background: 'radial-gradient(circle at 70% 80%, #A24C5B 0%, #FFFCFB 80%)',
            opacity: 0.18,
            filter: 'blur(36px)',
            zIndex: 0,
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute w-[2079.09px] h-[2071.49px] left-[-437px] top-[-434px]">
      <div className="absolute w-[524.26px] h-[619.47px] left-[121.03px] top-0 bg-gradient-to-br from-[#4C4F60] to-[#956D89] blur-[100px] rotate-45"></div>
      <div className="absolute w-[581.95px] h-[686.03px] left-[93.5px] top-[678.5px] bg-gradient-to-br from-[#85919D] to-[#95718B] blur-[100px] -rotate-45"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[1120.33px] top-[793.41px] bg-gradient-to-br from-[#EAE1DC] to-[#87647F] blur-[100px] rotate-180"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[729.23px] top-[878.32px] bg-gradient-to-br from-[#EAE1DC] to-[#6E5B71] blur-[100px] rotate-180"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[1308.23px] top-[223.32px] bg-gradient-to-br from-[#EAE1DC] to-[#B599A9] blur-[100px] rotate-180"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[-77px] top-[-99.54px] bg-gradient-to-br from-[#EAE1DC] to-[#BDA5B2] blur-[100px] -rotate-[46.72deg]"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[1403.76px] top-[756.76px] bg-gradient-to-br from-[#EAE1DC] to-[#9C8597] blur-[100px] rotate-[59.14deg]"></div>
      <div className="absolute w-[374.23px] h-[447.32px] left-[1403.76px] top-[512px] bg-gradient-to-br from-[#EAE1DC] to-[#7D637C] blur-[100px] rotate-[59.14deg]"></div>
      <div className="absolute w-[264.33px] h-[268.35px] left-[1207.35px] top-[606.34px] bg-gradient-to-br from-[#EAE1DC] to-[#8B6782] blur-[100px] rotate-[59.14deg]"></div>
      <div className="absolute w-[439px] h-[529px] left-[1248.19px] top-[577.63px] bg-gradient-to-br from-[#4C4F60] to-[#9D6A8A] blur-[100px] -rotate-[150deg]"></div>
      <div className="absolute w-[579.72px] h-[662.8px] left-[425.64px] top-[1286.6px] bg-gradient-to-br from-[#85919D] to-[#A24C5B] blur-[100px] rotate-[142.75deg]"></div>
      <div className="absolute w-[439px] h-[529px] left-[958px] top-[-125.41px] bg-gradient-to-br from-[#4C4F60] to-[#8F6984] blur-[100px] -rotate-[44.66deg]"></div>
    </div>
  );
} 