import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", email);
    // Simulate login & redirect to dashboard
    navigate('/dashboard');
  };

  return (
    <motion.div 
      className="login-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background full screen droplet image */}
      <img src="/bg-wet-window.png" alt="Wet Window" className="login-bg" />

      {/* The main center modal */}
      <motion.div 
        className="login-modal"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 70 }}
      >
        
        {/* Left Side: White Area with Slanted Edge */}
        <div className="login-left">
          <div className="login-left-content">
            <h1 className="login-title">Welcome back</h1>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label>Email</label>
                <input 
                  type="email" 
                  placeholder="john.doe@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="•••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div className="forgot-password">
                <a href="#reset">Forgot Password?</a>
              </div>

              <button type="submit" className="login-btn">
                LOGIN
              </button>
            </form>

            <div className="signup-prompt">
              Don't have an account? <a href="#signup">Sign Up</a>
            </div>
          </div>
        </div>

        {/* Right Side: Image background with straight edges (covered by the slanted left) */}
        <div className="login-right">
          <div className="login-right-image-container">
               <img src="/bg-cartier-side.png" alt="Luxury Storefront" />
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
