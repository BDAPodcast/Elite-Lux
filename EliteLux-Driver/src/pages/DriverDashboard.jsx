import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MapPin, Navigation, Clock } from 'lucide-react';

export default function DriverDashboard({ driverId }) {
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const { driver } = useOutletContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
    const sub = supabase.channel('driver-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchTrips)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [driverId]);

  const fetchTrips = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('driver_id', driverId).in('status', ['assigned', 'en_route', 'arrived', 'in_progress']).order('created_at', { ascending: false });
    if (data) {
      // Find if we are currently mid-trip
      const active = data.find(b => ['en_route', 'arrived', 'in_progress'].includes(b.status));
      if (active) {
        setActiveTrip(active);
        setAssignedTrips(data.filter(b => b.id !== active.id));
      } else {
        setActiveTrip(null);
        setAssignedTrips(data);
      }
    }
  };

  if (!driver?.is_active) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: '#cf1322', marginBottom: '15px' }}>Account Suspended</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>You must pay the subscription fee to view and accept dispatches.</p>
        <button onClick={() => navigate('/subscription')} className="btn-gold" style={{ width: 'auto', padding: '10px 20px' }}>Fix Account Status</button>
      </div>
    );
  }

  const handleStartTripFlow = (bookingId) => navigate(`/trip/${bookingId}`);
  const handleDecline = async (bookingId) => {
     if(window.confirm('Are you sure you want to decline this dispatch?')) {
       await supabase.from('bookings').update({ driver_id: null, status: 'cancelled' }).eq('id', bookingId);
     }
  };

  const TripCard = ({ b, isCurrent }) => (
    <div style={{ 
      background: '#111', 
      padding: '20px', 
      borderRadius: '12px', 
      border: `1px solid ${isCurrent ? '#c6a87c' : '#333'}`, 
      marginBottom: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {isCurrent && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#c6a87c' }} />}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <span className={`badge-status badge-${b.status}`}>{b.status.replace('_', ' ')}</span>
        <span style={{ color: '#c6a87c', fontWeight: 'bold' }}>{new Date(b.pickup_date).toLocaleDateString()} @ {b.pickup_time}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
        <Navigation size={18} color="#888" />
        <div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>PICKUP</div>
          <div style={{ fontWeight: '500' }}>{b.pickup_address}</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
        <MapPin size={18} color="#cf1322" />
        <div>
          <div style={{ fontSize: '0.8rem', color: '#888' }}>DROPOFF</div>
          <div style={{ fontWeight: '500' }}>{b.dropoff_address}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => handleStartTripFlow(b.id)} className="btn-gold" style={{ flex: 1 }}>
          {isCurrent ? 'RESUME TRIP' : 'ACCEPT'}
        </button>
        {!isCurrent && (
          <button onClick={() => handleDecline(b.id)} style={{ padding: '0 20px', background: '#333', border: '1px solid #444', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
            DECLINE
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {activeTrip && (
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#c6a87c', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} /> ACTIVE TRIP
          </h3>
          <TripCard b={activeTrip} isCurrent={true} />
        </div>
      )}

      <div>
        <h3 style={{ color: '#888', marginBottom: '15px' }}>ASSIGNED DISPATCHES</h3>
        {assignedTrips.map(b => (
          <TripCard key={b.id} b={b} isCurrent={false} />
        ))}
        {assignedTrips.length === 0 && !activeTrip && (
          <div style={{ background: '#111', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid #222' }}>
            <p style={{ color: '#888' }}>You have no pending assignments. Waiting for Dispatch...</p>
          </div>
        )}
      </div>
    </div>
  );
}
