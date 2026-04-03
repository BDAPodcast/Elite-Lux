import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import Logo from './Logo';
import './Layout.css';

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="app-container">
      {/* Header - Uber Style Black */}
      <nav className="header-nav">
        <div className="header-content">
          <div className="header-left">
            <Link to="/" className="brand-link" onClick={closeMenu}>
              <Logo width={120} />
            </Link>
            <div className="desktop-nav-links">
              <a href="#about" className="nav-item">About Us</a>
              <a href="#services" className="nav-item">Services</a>
            </div>
          </div>

          <div className="header-right desktop-nav-links">
            <Link to="/login" className="nav-item">Log In</Link>
            <Link to="/login" className="btn-signup btn-gold">Sign Up</Link>
          </div>

          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link to="/booking" className="mobile-nav-item" onClick={closeMenu}>Ride</Link>
          <Link to="/reserve" className="mobile-nav-item" onClick={closeMenu}>Reserve</Link>
          <Link to="/business" className="mobile-nav-item" onClick={closeMenu}>Business</Link>
          <Link to="/about" className="mobile-nav-item" onClick={closeMenu}>About</Link>
          <div className="divider"></div>
          <Link to="/login" className="mobile-nav-item" onClick={closeMenu}>Log in</Link>
          <Link to="/login" className="mobile-nav-item" onClick={closeMenu}>Sign up</Link>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer - Minimalist Black */}
      <footer className="footer-black">
        <div className="footer-container">
          <div className="footer-top">
            <Logo width={120} />
            <a href="#" className="visit-help">Visit Help Center</a>
          </div>

          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About us</Link>
              <Link to="/offerings">Our offerings</Link>
              <Link to="/newsroom">Newsroom</Link>
              <Link to="/investors">Investors</Link>
              <Link to="/careers">Careers</Link>
            </div>
            <div className="footer-column">
              <h4>Products</h4>
              <Link to="/booking">Ride</Link>
              <Link to="/drive">Drive</Link>
              <Link to="/deliver">Deliver</Link>
              <Link to="/business">Elite for Business</Link>
            </div>
            <div className="footer-column">
              <h4>Global citizenship</h4>
              <Link to="/safety">Safety</Link>
              <Link to="/sustainability">Sustainability</Link>
            </div>
            <div className="footer-column">
              <h4>Travel</h4>
              <Link to="/reserve">Reserve</Link>
              <Link to="/airports">Airports</Link>
              <Link to="/cities">Cities</Link>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="socials">
              <span className="social-icon">in</span>
              <span className="social-icon">yt</span>
              <span className="social-icon">ig</span>
              <span className="social-icon">x</span>
            </div>
            <div className="footer-bottom-links">
              <span className="flex-center"><Globe size={16} /> English</span>
              <span>New York City</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
