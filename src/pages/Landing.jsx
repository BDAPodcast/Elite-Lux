import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import Spline from '@splinetool/react-spline';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [shouldMountSpline, setShouldMountSpline] = useState(false);

  // Performance Guard: Delay Spline mounting by 1.5s to ensure initial scroll is smooth
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldMountSpline(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);


  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleBookNow = () => {
    navigate('/login');
  };

  return (
    <PageTransition>
      <div className="landing-page">
        
        {/* Section 1: Hero Section (with Spline) */}
        <section className="hero-section">
          <div className="hero-container">
            <motion.div 
              className="hero-booking-card"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="hero-title">Go anywhere in luxury</h1>
              
              <div className="time-select">
                <Clock size={18} />
                <span>Schedule ahead</span>
                <span className="carat">▼</span>
              </div>

              <div className="booking-inputs">
                <div className="booking-input-group">
                  <div className="icon-column">
                    <div className="dot-black"></div>
                    <div className="line-vertical"></div>
                  </div>
                  <input type="text" placeholder="Pickup location" className="location-input" />
                  <Navigation size={18} className="input-end-icon" />
                </div>
                <div className="booking-input-group">
                  <div className="icon-column">
                    <div className="square-black"></div>
                  </div>
                  <input type="text" placeholder="Dropoff location" className="location-input" />
                </div>
              </div>
              
              <div className="hero-divider"></div>

              <div className="hero-actions">
                <button className="btn-primary" onClick={handleBookNow}>See prices</button>
              </div>
            </motion.div>

            <motion.div 
              className="hero-spline-area"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="hero-spline-wrapper">
                {/* 
                  Performance Optimization: 
                  Show a high-quality "Snapshot" while the heavy 3D engine loads.
                  This stops the "lagging" the user reported by preventing the 3D engine 
                  from freezing the browser main thread during initial scroll.
                */}
                <AnimatePresence>
                  {!splineLoaded && (
                    <motion.div 
                      key="poster"
                      className="spline-poster"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >
                      <img src={`${import.meta.env.BASE_URL}service-escalade-hr.png`} alt="Loading..." className="spline-placeholder" />
                      <div className="spline-loader-overlay">
                        <div className="gold-spinner"></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Overlay to completely disable mouse interactions with Spline while keeping auto-animation */}
                <div className="spline-interaction-blocker"></div>
                
                {shouldMountSpline && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: splineLoaded ? 1 : 0 }}
                    transition={{ duration: 1.5 }}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <Spline 
                      scene="https://prod.spline.design/8YqOWfYEgdw8ZaXH/scene.splinecode" 
                      onLoad={() => setSplineLoaded(true)}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>

          </div>
        </section>

        {/* Section 2: About Us & Testimonials Side-by-Side (Dark Mode with Gold Trim) */}
        <section id="about" className="dark-trim-section">
          <div className="dark-trim-container">
            
            <motion.div 
              className="dark-about-us"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            >
              <h2 className="gold-text-header">The Elite Standard</h2>
              <p className="dark-text-body">
                Elite Lux isn't just another ride-sharing app. We are a premium, reservation-only black car service dedicated to providing an unparalleled luxury experience. Whether you’re heading to the airport or attending a corporate event, our carefully vetted chauffeurs ensure you arrive in absolute comfort, privacy, and safety.
              </p>
              <ul className="dark-about-list">
                <li><ShieldCheck size={20} className="gold-icon" /> Vetted & Professional Drivers</li>
                <li><Star size={20} className="gold-icon" /> Flawless Luxury Fleet</li>
                <li><Clock size={20} className="gold-icon" /> Guaranteed Punctuality</li>
              </ul>
              <button className="gold-btn-outline mt-lg">Learn More About Us</button>
            </motion.div>

            <motion.div 
              className="dark-testimonials"
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            >
              <h3 className="testimonials-title">What Our Clients Say</h3>
              
              <div className="testimonial-card">
                <div className="card-header">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=64&h=64&q=80" alt="Sarah J." className="testimony-profile" />
                  <div className="testimony-info">
                    <span className="client-name">Sarah J.</span>
                    <div className="stars">
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                    </div>
                  </div>
                </div>
                <p>"Impeccable service. My driver arrived 15 minutes early and the Maybach was absolutely spotless. The only way I travel to JFK."</p>
              </div>

              <div className="testimonial-card">
                 <div className="card-header">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=64&h=64&q=80" alt="Michael T." className="testimony-profile" />
                  <div className="testimony-info">
                    <span className="client-name">Michael T.</span>
                    <div className="stars">
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                    </div>
                  </div>
                </div>
                <p>"Finally, a service that understands true luxury. No surge pricing, true privacy, and incredible vehicles."</p>
              </div>

              <div className="testimonial-card">
                 <div className="card-header">
                  <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=64&h=64&q=80" alt="David L." className="testimony-profile" />
                  <div className="testimony-info">
                    <span className="client-name">David L.</span>
                    <div className="stars">
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                      <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                    </div>
                  </div>
                </div>
                <p>"The only service I trust for my corporate clients in the city. The chauffeurs are entirely professional."</p>
              </div>

            </motion.div>
          </div>
        </section>

        {/* Section 3: Alternating Flex Services */}
        <section id="services" className="modular-services-section">
          
          {/* Block 1: Medium Distance */}
          <motion.div 
            className="service-block"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          >
            <div className="service-text">
              <h2>Medium Distance Travel</h2>
              <p>Experience seamless, highly comfortable city-to-city transfers or trips spanning multiple hours. Perfect for regional meetings, weekend escapes, or connecting hubs with true black-car comfort.</p>
              <button className="btn-primary flex-btn-location mt-md" onClick={handleBookNow}>
                Book Now
              </button>
            </div>
            <div className="service-visual">
              <img src={`${import.meta.env.BASE_URL}service-escalade-hr.png`} alt="Medium Distance" />
            </div>
          </motion.div>

          <div className="service-connector">
            <div className="dotted-line"></div>
            <div className="arrow-down"></div>
          </div>

          {/* Block 2: Long Distance */}
          <motion.div 
            className="service-block inverted-block"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          >
            <div className="service-visual">
              <img src={`${import.meta.env.BASE_URL}service-interior-hr.png`} alt="Long Distance Travel" />
            </div>
            <div className="service-text">
              <h2>Long Distance Excursions</h2>
              <p>Skip the hassle of domestic flights. Our long distance chauffeurs provide an extended, uninterrupted environment of privacy and luxury, allowing you to rest or work flawlessly across state lines.</p>
              <div className="service-actions mt-md">
                <button className="btn-primary" onClick={handleBookNow}>Book Now</button>
              </div>
            </div>
          </motion.div>

          <div className="service-connector">
            <div className="dotted-line"></div>
            <div className="arrow-down"></div>
          </div>

          {/* Block 3: Multi-Location */}
          <motion.div 
            className="service-block"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
          >
            <div className="service-text">
              <h2>Multi-Location Ride Services</h2>
              <p>Need to bounce between boardrooms, dinners, and airports all in one day? Hire an Elite Lux vehicle for half or full day blocks with unlimited routed stops managed entirely by your dedicated driver.</p>
              <div className="service-actions mt-md">
                <button className="btn-primary" onClick={handleBookNow}>Book Now</button>
              </div>
            </div>
            <div className="service-visual">
              <img src={`${import.meta.env.BASE_URL}service-lyriq-hr.png`} alt="Multi Location Travel" />
            </div>
          </motion.div>

        </section>

      </div>
    </PageTransition>
  );
}
