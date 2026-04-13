import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Car, Lock } from 'lucide-react';

export default function DriverLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // For Bypass, we just search for a driver profile matching the email mapped to their application fake name/id, but since we didn't save email in driver_profiles, let's just search by Name for the bypass/demo, or fetch all active. Wait, in DriverManagement we created driver_profiles with `full_name`. Let's just lookup by name.
    
    const { data, error: dbError } = await supabase.from('driver_profiles').select('*').ilike('full_name', email.trim()).single();
    
    if (dbError || !data) {
      setError('Driver not found. Enter exact full name, or apply first.');
    } else {
      onLogin(data.id);
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
        <Car size={64} color="#c6a87c" />
        <h1 style={{ letterSpacing: '3px', marginTop: '20px' }}>ELITE<span style={{ color: '#888' }}>CHAUFFEUR</span></h1>
      </div>

      <form onSubmit={handleLogin} style={{
        background: '#111',
        padding: '40px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
      }}>
        <h3 style={{ marginBottom: '30px', textAlign: 'center', color: '#c6a87c' }}>Driver Access</h3>
        
        <div style={{ marginBottom: '25px', position: 'relative' }}>
          <Lock size={20} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
          <input 
            type="text"
            placeholder="Enter Full Name (Bypass Auth)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          LOG IN
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ color: '#888' }}>Want to drive for Elite Lux?</p>
          <button 
            type="button" 
            onClick={() => navigate('/apply')}
            style={{ background: 'none', border: 'none', color: '#c6a87c', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }}
          >
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
}
