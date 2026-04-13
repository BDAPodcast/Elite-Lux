import React, { useState } from 'react';
import { Shield, Lock } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Bypassing real auth for simplicity as requested
    if (passcode === 'admin123') {
      onLogin();
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <Shield size={64} color="#c6a87c" />
        <h1 style={{ letterSpacing: '3px', marginTop: '20px' }}>ELITE<span style={{ color: '#888' }}>ADMIN</span></h1>
      </div>

      <form onSubmit={handleLogin} style={{
        background: '#111',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
      }}>
        <h3 style={{ marginBottom: '30px', textAlign: 'center', color: '#c6a87c' }}>Secure Access Restricted</h3>
        
        <div style={{ marginBottom: '25px', position: 'relative' }}>
          <Lock size={20} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          <input 
            type="password"
            placeholder="Enter Dispatch Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 15px 15px 45px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #333',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && <p style={{ color: '#cf1322', marginBottom: '20px', textAlign: 'center' }}>{error}</p>}

        <button type="submit" style={{
          width: '100%',
          padding: '15px',
          backgroundColor: '#c6a87c',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          AUTHORIZE
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '0.8rem' }}>
          Demo Passcode: admin123
        </p>
      </form>
    </div>
  );
}
