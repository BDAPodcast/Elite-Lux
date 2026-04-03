import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './Login.css';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        alert('Verification email sent! Please check your inbox.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="login-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <img src={`${import.meta.env.BASE_URL}bg-wet-window.png`} alt="Wet Window" className="login-bg" />

      <motion.div 
        className="login-modal"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 70 }}
      >
        <div className="login-left">
          <div className="login-left-content">
            <h1 className="login-title">
              {isSignUp ? 'Create Account' : 'Welcome back'}
            </h1>
            
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleAuth} className="login-form">
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
              
              {!isSignUp && (
                <div className="forgot-password">
                  <a href="#reset">Forgot Password?</a>
                </div>
              )}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'PROCESSING...' : (isSignUp ? 'SIGN UP' : 'LOGIN')}
              </button>
            </form>

            <div className="signup-prompt">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
              <button 
                type="button" 
                className="toggle-auth-btn"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Log In' : 'Sign Up'}
              </button>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-right-image-container">
             <img src={`${import.meta.env.BASE_URL}bg-cartier-side.png`} alt="Luxury Storefront" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

