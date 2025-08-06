import Image from 'next/image';
import styles from './TestimonialsSection.module.css';

export default function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      quote: "Mehfil made organizing our annual conference entirely effortless. Our team saved countless hours with their easy-to-understand dashboard.",
      author: "Sarah K.",
      position: "Event Manager, TechFlow Inc.",
      avatar: "/sarah.png" // You can replace with actual avatar images
    },
    {
      id: 2,
      quote: "Mehfil made organizing our annual conference entirely effortless. Our team saved countless hours with their easy-to-understand dashboard.",
      author: "Sarah K.",
      position: "Event Manager, TechFlow Inc.",
      avatar: "/sarah.png"
    },
    {
      id: 3,
      quote: "Mehfil made organizing our annual conference entirely effortless. Our team saved countless hours with their easy-to-understand dashboard.",
      author: "Sarah K.",
      position: "Event Manager, TechFlow Inc.",
      avatar: "/sarah.png"
    }
  ];

  return (
    <section className={styles.testimonialsSection}>
      {/* Background */}
      <div className={styles.background}></div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <h2 className={styles.title}>Testimonials</h2>
        <p className={styles.subtitle}>
          Hear from our satisfied clients who used Mafil to make their events special.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className={styles.testimonialsGrid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={styles.testimonialCard}>
            {/* Quote Icon */}
            <div className={styles.quoteIcon}>
              <Image 
                src="/testimonials.svg" 
                alt="Quote"
                width={55}
                height={55}
              />
            </div>
            
            {/* Testimonial Content */}
            <div className={styles.testimonialContent}>
              <p className={styles.testimonialText}>{testimonial.quote}</p>
              
              {/* Author Info */}
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>
                  <Image 
                    src={testimonial.avatar} 
                    alt={testimonial.author}
                    width={62}
                    height={62}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.authorDetails}>
                  <h4 className={styles.authorName}>{testimonial.author}</h4>
                  <p className={styles.authorPosition}>{testimonial.position}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 