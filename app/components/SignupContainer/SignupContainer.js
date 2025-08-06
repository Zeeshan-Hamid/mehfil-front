import { useEffect, useState } from 'react';

export default function SignupContainer({ 
  title, 
  children, 
  leftSideContent,
  bottomLink,
  showButton = true
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const leftPanel = (
    <div className="signupLeftPanel w-[288px] min-h-[400px] bg-gradient-to-b from-[#C4AAD9] to-[#9D69C7] flex flex-col items-center justify-center relative">
      <div className="text-center px-4">
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Mehfil Logo" 
            className="w-[121px] h-[155.57px] object-contain mx-auto"
          />
        </div>
        <div className="font-outfit font-medium text-[36px] leading-[36px] text-white mb-4 text-center">
          Join Our Community
        </div>
        <div className="font-outfit font-normal text-[15px] leading-[19px] text-white/75 text-center max-w-[221px] mx-auto">
          Sign up to access your dashboard
        </div>
      </div>
    </div>
  );

  const mobileLeftPanel = (
    <div className="signupLeftPanel w-full bg-gradient-to-b from-[#C4AAD9] to-[#9D69C7] flex flex-col items-center justify-center py-4">
      <img 
        src="/logo.png" 
        alt="Mehfil Logo" 
        style={{ width: 48, height: 60, marginBottom: 4 }}
      />
      <div className="font-outfit font-medium text-[16px] leading-[20px] text-white mb-1 text-center">
        Join Our Community
      </div>
      <div className="font-outfit font-normal text-[10px] leading-[13px] text-white/75 text-center max-w-[120px] mx-auto">
        Sign up to access your dashboard
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="signupContainer w-full min-w-0 flex flex-col min-h-screen">
        {mobileLeftPanel}
        <div className="signupRightPanel w-full flex flex-col items-center justify-start flex-1 overflow-y-auto">
          <div className="signupFormCard w-full max-w-md px-4 py-6">
            <h1 className="font-outfit font-medium text-[18px] leading-[22px] text-black mb-4 text-center">{title}</h1>
            <div className="space-y-4">
              {children}
            </div>
            {showButton && (
              <button className="w-full h-[40px] bg-[#AF8EBA] rounded-[32px] font-outfit font-medium text-[14px] leading-[16px] text-white mt-4 hover:bg-[#9A7BA5] transition-colors cursor-pointer">
                Sign Up
              </button>
            )}
            {bottomLink}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signupContainer absolute w-[900px] max-h-[95vh] min-h-[700px] left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-[25px] overflow-hidden flex">
      {leftPanel}
      <div className="signupRightPanel w-[612px] bg-white/10 backdrop-blur-[17.5px] flex items-start justify-center pt-8 overflow-y-auto">
        <div className="w-[520px] px-6 pb-8">
          <h1 className="font-outfit font-medium text-[25px] leading-[25px] text-black mb-8 text-center">{title}</h1>
          <div className="space-y-4">
            {children}
          </div>
          {showButton && (
            <button className="w-full h-[48px] bg-[#AF8EBA] rounded-[44px] font-outfit font-medium text-[16px] leading-[16px] text-white mt-6 hover:bg-[#9A7BA5] transition-colors cursor-pointer">
              Sign Up
            </button>
          )}
          {bottomLink}
        </div>
      </div>
    </div>
  );
} 