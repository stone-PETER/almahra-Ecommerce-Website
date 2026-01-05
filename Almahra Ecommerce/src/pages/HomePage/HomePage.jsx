import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/layout/Footer/Footer';
import './HomePage.css';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const heroSlides = [
    {
      image: '/images/Carousel1.png',
      title: 'Premium Eyewear Collection',
      subtitle: 'Discover Your Perfect Style'
    },
    {
      image: '/images/Carousel2.png',
      title: 'Luxury Frames',
      subtitle: 'Elegance Meets Comfort'
    },
    {
      image: '/images/Carousel3.png',
      title: 'Crystal Clear Vision',
      subtitle: 'Experience The Difference'
    },
    {
      image: '/images/Carousel4.png',
      title: 'Designer Sunglasses',
      subtitle: 'Style That Stands Out'
    }
  ];

  const brands = [
    { name: 'Hugo Boss', logo: '/images/brands/boss.png' },
    { name: 'Ray-Ban', logo: '/images/brands/rayban.png' },
    { name: 'Carrera', logo: '/images/brands/carrera.png' },
    { name: 'Emporio Armani', logo: '/images/brands/emporio-armani.png' },
    { name: 'Gucci', logo: '/images/brands/gucci.png' },
    { name: 'Oakley', logo: '/images/brands/oakley.png' },
    { name: 'Police', logo: '/images/brands/police.png' }
  ];

  const stats = [
    { number: '5', label: 'Stores across UAE' },
    { number: '400+', label: 'Collections' },
    { number: '15+', label: 'Premium brands' },
    { number: '2000+', label: 'Happy customers' }
  ];

  const categories = [
    { name: 'Eyeglasses', image: '/images/image 10.png', link: '/products?category=eyeglasses' },
    { name: 'Sunglasses', image: '/images/image 11.png', link: '/products?category=sunglasses' },
    { name: 'Contact Lenses', image: '/images/image 12.png', link: '/products?category=contacts' },
    { name: 'Accessories', image: '/images/image 13.png', link: '/products?category=accessories' }
  ];

  const topSellers = [
    { name: 'Oakley Prizm', image: '/images/image 14.png', link: '/products/oakley-prizm' },
    { name: 'Clear Frames', image: '/images/image 15.png', link: '/products/clear-frames' },
    { name: 'Bold Frames', image: '/images/image 16.png', link: '/products/bold-frames' },
    { name: 'Ray-Ban Meta', image: '/images/image 17.png', link: '/products/rayban-meta' }
  ];

  const services = [
    { 
      title: 'Eye Checkup', 
      image: '/images/image 18.png',
      description: 'Professional eye examination',
      link: '/appointment'
    },
    { 
      title: 'In-house lens fitting', 
      image: '/images/image 19.png',
      description: 'Expert lens fitting service',
      link: '/services/lens-fitting'
    },
    { 
      title: 'Virtual Try-On', 
      image: '/images/image 20.png',
      description: 'Try glasses virtually with AR',
      link: '/try-ar'
    },
    { 
      title: 'Shop Now - Pay Later', 
      image: '/images/image 21.png',
      description: 'Flexible payment options',
      link: '/products'
    }
  ];

  const featuredProducts = [
    { name: 'Premium Collection', image: '/images/image 5.png', type: 'eyewear' },
    { name: 'Designer Brands', image: '/images/image 6.png', type: 'luxury' },
    { name: 'Modern Styles', image: '/images/image 7.png', type: 'contemporary' },
    { name: 'Classic Frames', image: '/images/image 8.png', type: 'traditional' },
    { name: 'Chroma Lens', image: '/images/image 9.png', type: 'nature-palette' }
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="homepage">
      {/* Promotional Banner */}
      <section className="promo-banner">
        <div className="container">
          <p className="promo-banner__text">25% Off on all brands</p>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <button className="hero-nav hero-nav--left" onClick={handlePrevSlide} aria-label="Previous slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        
        <div className="hero-content">
          <div className="hero-image">
            <img src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].title} />
            <div className="hero-overlay">
              <button className="hero-cta" onClick={() => navigate('/products')}>
                Explore Now
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,8 16,12 12,16"></polyline>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button className="hero-nav hero-nav--right" onClick={handleNextSlide} aria-label="Next slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Logos Section */}
      <section className="brands-section">
        <div className="container">
          <div className="brands-grid">
            {brands.map((brand, index) => (
              <div key={index} className="brand-card">
                <img src={brand.logo} alt={brand.name} className="brand-logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="featured-section">
        <div className="container">
          <div className="featured-grid">
            {featuredProducts.map((product, index) => (
              <div key={index} className="featured-card" onClick={() => navigate(product.link || '/products')}>
                <div className="featured-image">
                  <img src={product.image} alt={product.name} />
                  <div className="featured-overlay">
                    <button className="view-now-btn">
                      View now
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12,8 16,12 12,16"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Categories</h2>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link key={index} to={category.link} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                  <div className="category-overlay">
                    <p className="category-name">{category.name}</p>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="category-arrow">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,8 16,12 12,16"></polyline>
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="top-sellers-section">
        <div className="container">
          <h2 className="section-title">Top Sellers</h2>
          <div className="top-sellers-grid">
            {topSellers.map((product, index) => (
              <div key={index} className="seller-card" onClick={() => navigate(product.link)}>
                <div className="seller-image">
                  <img src={product.image} alt={product.name} />
                  <div className="seller-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,8 16,12 12,16"></polyline>
                    </svg>
                  </div>
                </div>
                <p className="seller-name">{product.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover More CTA */}
      <section className="discover-cta">
        <div className="container">
          <button className="discover-btn" onClick={() => navigate('/products')}>
            Discover More
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,8 16,12 12,16"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card" onClick={() => navigate(service.link)}>
                <div className="service-image">
                  <img src={service.image} alt={service.title} />
                  <div className="service-overlay">
                    <h3 className="service-title">{service.title}</h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,8 16,12 12,16"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Services CTA */}
      <section className="more-services-cta">
        <div className="container">
          <button className="more-services-btn" onClick={() => navigate('/services')}>
            More Services
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,8 16,12 12,16"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
