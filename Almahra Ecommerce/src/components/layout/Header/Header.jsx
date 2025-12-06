import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import Button from "../../common/Button/Button.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import { useAuth } from "../../../context/AuthContext.jsx";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);
  const handleCartClick = () => navigate("/cart");
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      {/* Top Bar */}
      <div className="header__top">
        <div className="container">
          <div className="header__top-content">
            <div className="header__contact">
              <span>📞 +1 (555) 123-4567</span>
              <span>📧 info@almahra-opticals.com</span>
            </div>
            <div className="header__auth">
              {isAuthenticated ? (
                <>
                  <span className="header__user-greeting">
                    Hello, {user.firstName}!
                  </span>
                  <Button variant="ghost" size="small" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="small" onClick={() => navigate("/login")}>
                    Login
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => navigate("/login")}>
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header__main">
        <div className="container">
          <div className="header__content">
            {/* Logo */}
            <div className="header__logo">
              <Link to="/" className="header__logo-link">
                <img
                  src="/images/logo.svg"
                  alt="Almahra Opticals"
                  className="header__logo-img"
                />
                <span className="header__logo-text">Almahra Opticals</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav
              className={`header__nav ${isMenuOpen ? "header__nav--open" : ""}`}
            >
              <ul className="header__nav-list">
                <li>
                  <Link to="/" className="header__nav-link">
                    Home
                  </Link>
                </li>
                <li className="header__nav-item--dropdown">
                  <Link to="/products" className="header__nav-link">
                    Products
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </Link>
                  <div className="header__dropdown">
                    <div className="header__dropdown-content">
                      <div className="header__dropdown-section">
                        <h3>Categories</h3>
                        <ul>
                          <li>
                            <Link to="/products?category=sunglasses">
                              Sunglasses
                            </Link>
                          </li>
                          <li>
                            <Link to="/products?category=prescription">
                              Prescription Glasses
                            </Link>
                          </li>
                          <li>
                            <Link to="/products?category=reading">
                              Reading Glasses
                            </Link>
                          </li>
                          <li>
                            <Link to="/products?category=contacts">
                              Contact Lenses
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="header__dropdown-section">
                        <h3>Brands</h3>
                        <ul>
                          <li>
                            <Link to="/products?brand=ray-ban">Ray-Ban</Link>
                          </li>
                          <li>
                            <Link to="/products?brand=oakley">Oakley</Link>
                          </li>
                          <li>
                            <Link to="/products?brand=persol">Persol</Link>
                          </li>
                          <li>
                            <Link to="/products?brand=maui-jim">Maui Jim</Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <Link to="/try-ar" className="header__nav-link">
                    Try AR
                  </Link>
                </li>
                <li>
                  <Link to="/appointment" className="header__nav-link">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="header__nav-link">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="header__nav-link">
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Actions */}
            <div className="header__actions">
              {/* Search */}
              <button
                className="header__action-btn"
                onClick={toggleSearch}
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </button>

              {/* Wishlist */}
              <button className="header__action-btn" aria-label="Wishlist">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              {/* Account */}
              {isAuthenticated ? (
                <div className="header__account-dropdown">
                  <button className="header__action-btn" aria-label="Account">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </button>
                  <div className="header__account-menu">
                    <Link to="/profile" className="header__account-menu-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      My Profile
                    </Link>
                    <Link to="/profile#orders" className="header__account-menu-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                        <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="header__account-menu-item header__account-menu-item--logout">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="header__action-btn" aria-label="Account">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </Link>
              )}

              {/* Cart */}
              <button
                className="header__action-btn header__cart-btn"
                onClick={handleCartClick}
                aria-label="Shopping Cart"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M9 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                  <path d="M20 22a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"></path>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {itemCount > 0 && (
                  <span className="header__cart-count">{itemCount}</span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="header__menu-toggle"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
              >
                <span
                  className={`header__hamburger ${
                    isMenuOpen ? "header__hamburger--open" : ""
                  }`}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {isSearchOpen && (
        <div className="header__search">
          <div className="container">
            <div className="header__search-content">
              <input
                type="text"
                placeholder="Search for glasses, brands, or styles..."
                className="header__search-input"
                autoFocus
              />
              <button className="header__search-btn">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="M21 21l-4.35-4.35"></path>
                </svg>
              </button>
              <button className="header__search-close" onClick={toggleSearch}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
