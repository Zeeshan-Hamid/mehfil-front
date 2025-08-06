import Image from 'next/image';
import styles from './HowItWorksSection.module.css';

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Discover",
      description: "Browse top-tier venues and trusted vendors curated for your event's style and budget."
    },
    {
      number: "02", 
      title: "Book",
      description: "Secure your favorites instantly with transparent pricing and flexible payment options."
    },
    {
      number: "03",
      title: "Manage", 
      description: "From guest lists to vendor coordination, effortlessly oversee every detail all in one dashboard."
    }
  ];

  return (
    <section className={styles.howItWorksSection}>
      {/* Background */}
      <div className={styles.background}></div>
      
      {/* Title and Subtitle */}
      <div className={styles.header}>
        <h2 className={styles.title}>How It Works</h2>
        <p className={styles.subtitle}>
          Getting started is simple - no upfront costs, no risks!
        </p>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Left Side - Image */}
        <div className={styles.imageContainer}>
          <div className={styles.imageWrapper}>
            <div className={styles.imageBackground}></div>
            <div className={styles.imagePlaceholder}>
              <Image 
                src="/works.png" 
                alt="Elegant table setting with candles and flowers"
                fill
                style={{ objectFit: 'cover' }}
                className={styles.worksImage}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Steps */}
        <div className={styles.stepsContainer}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              {/* Number Circle */}
              <div className={styles.numberCircle}>
                <div className={styles.circleBackground}></div>
                <div className={styles.circleOverlay}></div>
                <span className={styles.number}>{step.number}</span>
              </div>
              
              {/* Step Content */}
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Element */}
      <div className={styles.decorativeElement}></div>
    </section>
  );
} 