"use client";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./CustomerProfileDashPage.module.css";
import Sidebar from "./Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { useUserStore } from "../state/userStore";
import DashboardContent from "./components/DashboardContent";
import Footer from "../components/Footer/Footer";
import MyOrdersContent from "./components/MyOrdersContent";
import MyEventsContent from "./components/MyEventsContent";
import FavoritesContent from "./components/FavoritesContent";
import MessagesContent from "./components/MessagesContent";
import SettingsContent from "./components/SettingsContent";
import CustomerChatbot from "../components/CustomerChatbot/CustomerChatbot";

function CustomerProfileDashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMenu, setSelectedMenu] = useState("Dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const navigationHistory = useRef(["Dashboard"]);
  const isNavigatingBack = useRef(false);

  useEffect(() => setMounted(true), []);
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle tab query param for redirect
  useEffect(() => {
    if (mounted) {
      const tab = searchParams.get("tab");
      if (tab && menuItems.includes(tab)) {
        setSelectedMenu(tab);
        // Add to navigation history if not already there
        if (navigationHistory.current[navigationHistory.current.length - 1] !== tab) {
          navigationHistory.current.push(tab);
        }
      }
    }
  }, [mounted, searchParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.selectedMenu) {
        isNavigatingBack.current = true;
        setSelectedMenu(event.state.selectedMenu);
        // Update navigation history
        const currentIndex = navigationHistory.current.indexOf(event.state.selectedMenu);
        if (currentIndex !== -1) {
          navigationHistory.current = navigationHistory.current.slice(0, currentIndex + 1);
        }
      } else {
        // If no state, go back to Dashboard (home page)
        setSelectedMenu("Dashboard");
        navigationHistory.current = ["Dashboard"];
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update browser history when menu changes
  useEffect(() => {
    if (mounted && !isNavigatingBack.current) {
      // Update URL without triggering navigation
      const url = new URL(window.location);
      url.searchParams.set('tab', selectedMenu);
      window.history.replaceState({ selectedMenu }, '', url.toString());
      
      // Add to navigation history
      if (navigationHistory.current[navigationHistory.current.length - 1] !== selectedMenu) {
        navigationHistory.current.push(selectedMenu);
      }
    }
    isNavigatingBack.current = false;
  }, [selectedMenu, mounted]);

  // Handle menu selection with proper history management
  const handleMenuSelection = useCallback((menu) => {
    if (menu !== selectedMenu) {
      setSelectedMenu(menu);
      // Push new state to browser history
      const url = new URL(window.location);
      url.searchParams.set('tab', menu);
      window.history.pushState({ selectedMenu: menu }, '', url.toString());
      
      // Add to navigation history
      navigationHistory.current.push(menu);
    }
  }, [selectedMenu]);

  if (!mounted) return null;

  const menuItems = [
    "Dashboard",
    "My Orders",
    "My Events",
    "Messages",
    "Favorites",
    "Settings",
  ];

  function renderContent() {
    if (selectedMenu === "Dashboard") {
      return <DashboardContent />;
    }
    if (selectedMenu === "My Orders") {
      return <MyOrdersContent />;
    }
    if (selectedMenu === "My Events") {
      return <MyEventsContent />;
    }
    if (selectedMenu === "Messages") {
      return <MessagesContent />;
    }
    if (selectedMenu === "Favorites") {
      return <FavoritesContent />;
    }
    if (selectedMenu === "Settings") {
      return <SettingsContent />;
    }
    // Placeholder for other toggle page content
    return (
      <div className={styles["profile-placeholder-content"]}>
        <h2>{selectedMenu}</h2>
        <p>This is the {selectedMenu} section. Content will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar backgroundColor="#AF8EBA" customHeight="15px 15px" />
      <div className={styles["profile-listing-bg"]}>
        {/* Mobile Backdrop */}
        <div 
          className={`${styles['sidebar-backdrop']} ${sidebarCollapsed ? '' : styles['active']}`}
          onClick={() => setSidebarCollapsed(true)}
        />
        {/* Left Panel - Sidebar Menu */}
        <Sidebar 
          menuItems={menuItems} 
          selectedMenu={selectedMenu} 
          setSelectedMenu={handleMenuSelection}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        {/* Right Panel - Main Content */}
        <main className={`${styles["profile-listing-main"]} ${sidebarCollapsed ? styles["main-collapsed"] : ""}`}>
          {/* Mobile Toggle Button */}
          {isMobile && (
            <button 
              className={styles['mobile-toggle-btn']}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
            >
              <div className={`${styles['mobile-toggle-arrow']} ${sidebarCollapsed ? styles['arrow-collapsed'] : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          )}
          {/* Dynamic Content */}
          {renderContent()}
        </main>
      </div>
      <Footer />
      <CustomerChatbot />
    </>
  );
}

export default function CustomerProfileDashPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerProfileDashContent />
    </Suspense>
  );
} 