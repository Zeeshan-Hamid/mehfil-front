"use client";

import { useState } from 'react';
import styles from './FAQSection.module.css';

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "What type of events can I plan?",
      answer: "Mehfil supports a wide range of events including weddings, corporate events, birthday parties, anniversaries, conferences, and more. Our platform connects you with specialized vendors for any occasion you can imagine."
    },
    {
      id: 2,
      question: "How do I know vendors are reliable?",
      answer: "All vendors on Mehfil are thoroughly vetted and verified. We check their credentials, reviews, and past performance. Additionally, each vendor has ratings and reviews from previous clients to help you make informed decisions."
    },
    {
      id: 3,
      question: "Can I negotiate prices with vendors?",
      answer: "Yes, you can negotiate prices directly with vendors through our platform. We provide transparent pricing, but many vendors are open to discussions about custom packages and pricing based on your specific needs and budget."
    },
    {
      id: 4,
      question: "What if I need to cancel a booking?",
      answer: "Cancellation policies vary by vendor and are clearly stated in their terms. Most vendors offer flexible cancellation options, and our customer support team is here to help mediate any issues and ensure fair resolution."
    }
  ];

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <section className={styles.faqSection}>
      {/* Background */}
      <div className={styles.background}></div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Frequently Asked Questions</h2>
        <p className={styles.subtitle}>
          Find common questions about event planning and booking with Mehfil. Discover how we can make your special day seamless.
        </p>
      </div>

      {/* FAQ List */}
      <div className={styles.faqContainer}>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.id} className={styles.faqItem}>
              <div 
                className={styles.faqHeader}
                onClick={() => toggleFAQ(faq.id)}
              >
                <button 
                  className={styles.faqQuestion}
                >
                  {faq.question}
                </button>
                <div className={styles.faqIcon}>
                  <svg 
                    width="18" 
                    height="12" 
                    viewBox="0 0 18 12" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`${styles.arrow} ${openFAQ === faq.id ? styles.arrowOpen : ''}`}
                  >
                    <path 
                      d="M1 1L9 9L17 1" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              
              <div className={`${styles.faqAnswer} ${openFAQ === faq.id ? styles.faqAnswerOpen : ''}`}>
                <p>{faq.answer}</p>
              </div>
              
              <div className={styles.faqDivider}></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 