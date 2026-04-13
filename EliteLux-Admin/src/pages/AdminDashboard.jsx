import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, FileText, CalendarDays, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    activeDrivers: 0,
    openBookings: 0,
    completedBookings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Listen for changes
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_applications' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_profiles' }, fetchStats)
      .subscribe();
      
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: pendingAppCount }, 
        { count: driverCount }, 
        { count: openBookingsCount }, 
        { count: completedBookingsCount }
      ] = await Promise.all([
        supabase.from('driver_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('driver_profiles').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['awaiting_driver']),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'completed')
      ]);

      setStats({
        pendingApplications: pendingAppCount || 0,
        activeDrivers: driverCount || 0,
        openBookings: openBookingsCount || 0,
        completedBookings: completedBookingsCount || 0,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setIsLoading(false);
    }
  };

  const statCardStyle = {
    backgroundColor: '#111',
    padding: '25px',
    borderRadius: '12px',
    border: '1px solid #222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
  };

  if (isLoading) return <div style={{ color: '#888' }}>Loading Master Metrics...</div>;

  return (
    <div>
      <h1 style={{ color: '#fff', marginBottom: '10px', fontSize: '2rem', fontWeight: '500' }}>Executive Overview</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Real-time metrics for Elite Lux operations.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
        {/* Pending Apps */}
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#c6a87c'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#222'; }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Pending Applications</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.pendingApplications}</div>
          </div>
          <div style={{ background: 'rgba(198, 168, 124, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <FileText size={32} color="#c6a87c" />
          </div>
        </div>
        
        {/* Active Drivers */}
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#c6a87c'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#222'; }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Active Fleet Drivers</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.activeDrivers}</div>
          </div>
          <div style={{ background: 'rgba(54, 179, 126, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <Users size={32} color="#36b37e" />
          </div>
        </div>

        {/* Needs Dispatch */}
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#c6a87c'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#222'; }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Pending Dispatches</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.openBookings}</div>
          </div>
          <div style={{ background: 'rgba(255, 171, 0, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <CalendarDays size={32} color="#ffab00" />
          </div>
        </div>

        {/* Completed Trips */}
        <div style={statCardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#c6a87c'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#222'; }}>
          <div>
            <div style={{ color: '#888', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '10px' }}>Completed Trips</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{stats.completedBookings}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '15px', borderRadius: '50%' }}>
            <CheckCircle size={32} color="#fff" />
          </div>
        </div>
      </div>
    </div>
  );
}
