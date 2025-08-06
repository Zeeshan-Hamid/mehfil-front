import Image from 'next/image';
import Link from 'next/link';
import styles from './BrowseCategoriesSection.module.css';

export default function BrowseCategoriesSection() {
  const categories = [
    {
      id: 1,
      title: "Decor",
      description: "Discover fun and exciting options for venue decorations",
      image: "/cat (1).png" // You can replace with actual category images
    },
    {
      id: 2,
      title: "Catering",
      description: "Explore delicious catering options for your special day",
      image: "/cat (2).png"
    },
    {
      id: 3,
      title: "Photography",
      description: "Capture your precious moments with professional photographers",
      image: "/cat (3).png"
    },
    {
      id: 4,
      title: "Venues",
      description: "Find the perfect venue for your dream celebration",
      image: "/cat (4).png"
    }
  ];

  return (
    <section className={styles.browseCategoriesSection}>
      {/* Background */}
      <div className={styles.background}></div>
      
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>Browse Top Categories</h2>
          <p className={styles.subtitle}>
            Find your perfect match in our curated collection of crowd-favorite vendors.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className={styles.categoriesContainer}>
        <Link href="/categories" className={styles.viewAllButton}>
          View All
        </Link>
        <div className={styles.categoriesGrid}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.imageContainer}>
                <Image 
                  src={category.image} 
                  alt={category.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.categoryImage}
                />
              </div>
              
              {/* Hover Overlay */}
              <div className={styles.hoverOverlay}>
                <div className={styles.overlayContent}>
                  <h3 className={styles.categoryTitle}>{category.title}</h3>
                  <p className={styles.categoryDescription}>{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 