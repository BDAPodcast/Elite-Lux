import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './DriverLayout.css';

export default function DriverLayout({ driverId }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    const fetchDriver = async () => {
      const { data } = await supabase.from('driver_profiles').select('*').eq('id', driverId).single();
      if (data) setDriver(data);
    };
    if (driverId) fetchDriver();
    
    // Listen for Subscription updates
    const sub = supabase.channel('driver-sub')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver_profiles', filter: `id=eq.${driverId}` }, (payload) => {
        setDriver(payload.new);
      })
      .subscribe();
      
    return () => supabase.removeChannel(sub);
  }, [driverId]);

  const handleLogout = () => {
    localStorage.removeItem('driver_id');
    window.location.reload();
  };

  return (
    <div className="driver-layout">
      {/* Sidebar */}
      <aside className="driver-sidebar">
        <div className="sidebar-brand">
          <h2 style={{ color: '#c6a87c', margin: 0, letterSpacing: '2px' }}>ELITE<span style={{color: '#fff'}}>CHAUFFEUR</span></h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>My Trips</span>
          </Link>
          <Link to="/subscription" className={`nav-link ${location.pathname === '/subscription' ? 'active' : ''}`}>
            <Wallet size={20} />
            <span>Subscription</span>
            {driver && !driver.is_active && (
              <span style={{ background: '#cf1322', color: '#fff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', marginLeft: 'auto' }}>
                PAY
              </span>
            )}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="driver-main">
        <header className="driver-header">
          <h3>Driver Portal</h3>
          {driver && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <span style={{ color: driver.is_active ? '#36b37e' : '#cf1322', fontSize: '0.85rem', fontWeight: 'bold' }}>
                 {driver.is_active ? 'ACTIVE' : 'INACTIVE (PAY SUB)'}
               </span>
               <div className="driver-avatar">{driver.full_name.charAt(0).toUpperCase()}</div>
            </div>
          )}
        </header>

        <div className="driver-content-wrapper">
          <Outlet context={{ driver }} />
        </div>
      </main>
    </div>
  );
}
