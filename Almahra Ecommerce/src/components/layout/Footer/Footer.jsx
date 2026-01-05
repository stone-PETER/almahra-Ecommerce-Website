import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const categories = [
    { name: 'All', link: '/products' },
    { name: 'Sunglasses', link: '/products?category=sunglasses' },
    { name: 'Eyeglasses', link: '/products?category=eyeglasses' },
    { name: 'Contact Lenses', link: '/products?category=contacts' },
    { name: 'Accessories', link: '/products?category=accessories' }
  ];

  const brands = [
    { name: 'All', link: '/products' },
    { name: 'Arnette', link: '/products?brand=arnette' },
    { name: 'Ray-Ban', link: '/products?brand=rayban' },
    { name: 'Oakley', link: '/products?brand=oakley' },
    { name: 'Maui Jim', link: '/products?brand=mauijim' },
    { name: 'More Brands...', link: '/products' }
  ];

  const styles = [
    { name: 'Aviator', link: '/products?style=aviator' },
    { name: 'Square', link: '/products?style=square' },
    { name: 'Round', link: '/products?style=round' },
    { name: 'Rectangle', link: '/products?style=rectangle' },
    { name: 'More Styles...', link: '/products' }
  ];

  const locations = [
    'AL MUNTAZAH | AL SADD',
    'AL WUKAIR | AL KHOR',
    'AL DUHAIL'
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Left Section - Links */}
            <div className="footer-links">
              <div className="footer-column">
                <h3 className="footer-column-title">Categories</h3>
                <ul className="footer-list">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <Link to={category.link}>{category.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Brands</h3>
                <ul className="footer-list">
                  {brands.map((brand, index) => (
                    <li key={index}>
                      <Link to={brand.link}>{brand.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="footer-column">
                <h3 className="footer-column-title">Styles</h3>
                <ul className="footer-list">
                  {styles.map((style, index) => (
                    <li key={index}>
                      <Link to={style.link}>{style.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Section - Company Info */}
            <div className="footer-info">
              <div className="footer-logo">
                <img src="/images/LOGO.svg" alt="Al Mahra Opticals" className="footer-logo-img" />
              </div>

              <div className="footer-locations">
                <div className="location-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div className="location-list">
                  {locations.map((location, index) => (
                    <p key={index} className="location-item">{location}</p>
                  ))}
                </div>
              </div>

              <div className="footer-contact">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <a href="tel:+97450702307" className="contact-link">+974 5070 2307</a>
                </div>

                <div className="contact-item">
                  <div className="contact-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <div className="contact-emails">
                    <a href="mailto:info@almahraopticals.com" className="contact-link">info@almahraopticals.com</a>
                    <span className="email-separator">|</span>
                    <a href="mailto:almahraoptics@gmail.com" className="contact-link">almahraoptics@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">© Copyrights 2025. All Rights Reserved.</p>
            <p className="developer">Designed and Developed by <a href="https://elyxiz.io" target="_blank" rel="noopener noreferrer">Elyxiz.io</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
