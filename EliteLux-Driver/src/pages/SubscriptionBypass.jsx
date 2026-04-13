import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Wallet, CheckCircle } from 'lucide-react';

export default function SubscriptionBypass({ driverId }) {
  const { driver } = useOutletContext();
  const navigate = useNavigate();

  const handlePay = async () => {
    try {
      await supabase.from('driver_profiles').update({ is_active: true }).eq('id', driverId);
      alert('Subscription Paid / Bypassed Successfully!');
      window.location.replace('/dashboard');
    } catch (e) {
      alert('Failed to pay subscription.');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Chauffeur Subscription</h2>
      
      {driver?.is_active ? (
        <div style={{ background: 'rgba(54, 179, 126, 0.1)', padding: '30px', borderRadius: '12px', border: '1px solid #36b37e', textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle size={48} color="#36b37e" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#36b37e', marginBottom: '10px' }}>Subscription Active</h3>
          <p style={{ color: '#888' }}>Your account is in good standing. You are ready to receive VIP dispatches.</p>
        </div>
      ) : (
        <div style={{ background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333', maxWidth: '500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <Wallet size={32} color="#c6a87c" />
            <h3 style={{ color: '#fff' }}>Monthly Platform Fee</h3>
          </div>
          
          <p style={{ color: '#888', marginBottom: '30px', lineHeight: '1.6' }}>
            To access the Elite Lux dispatch network and receive bookings, chauffeurs must maintain an active platform subscription. 
            This ensures quality control and covers platform maintenance.
          </p>
          
          <div style={{ borderBottom: '1px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>$499</span><span style={{ color: '#888' }}>/month</span>
          </div>
          
          <button onClick={handlePay} className="btn-gold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Wallet size={18} /> Bypass Payment (Demo Mode)
          </button>
        </div>
      )}
    </div>
  );
}
