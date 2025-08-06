import Link from "next/link";
import HeroSection from "./components/HeroSection/HeroSection";
import SearchSection from "./components/SearchSection/SearchSection";
import HowItWorksSection from "./components/HowItWorksSection/HowItWorksSection";
import BrowseCategoriesSection from "./components/BrowseCategoriesSection/BrowseCategoriesSection";
import TestimonialsSection from "./components/TestimonialsSection/TestimonialsSection";
import EventHighlightsSection from "./components/EventHighlightsSection/EventHighlightsSection";
import GetInTouchSection from "./components/GetInTouchSection/GetInTouchSection";
import FAQSection from "./components/FAQSection/FAQSection";
import Footer from "./components/Footer/Footer";
import CustomerChatbot from "./components/CustomerChatbot/CustomerChatbot";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.homepage}>
      {/* Hero Section with Background Images */}
      <HeroSection />

      {/* Search Section */}
      <SearchSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Browse Categories Section */}
      <BrowseCategoriesSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Event Highlights Section */}
      {/* <EventHighlightsSection /> */}

      {/* Get In Touch Section */}
      <GetInTouchSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
      <CustomerChatbot />
    </div>
  );
}
