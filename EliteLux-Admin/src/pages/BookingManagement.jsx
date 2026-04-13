import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Navigation, MapPin } from 'lucide-react';

export default function BookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const sub = supabase.channel('booking-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, fetchData)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: bData } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    const { data: dData } = await supabase.from('driver_profiles').select('*').eq('is_active', true);
    setBookings(bData || []);
    setActiveDrivers(dData || []);
    setLoading(false);
  };

  const handleAssignDriver = async (bookingId, driverId) => {
    if (!driverId) return;
    try {
      await supabase.from('bookings').update({ driver_id: driverId, status: 'assigned' }).eq('id', bookingId);
      
      // Also notify customer
      const booking = bookings.find(b => b.id === bookingId);
      await supabase.from('notifications').insert({
        user_id: booking.user_id,
        type: 'driver_assigned',
        message: 'A driver has been assigned to your booking and is preparing for dispatch.',
        is_read: false
      });
      alert('Driver assigned successfully!');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Failed to assign driver.');
    }
  };

  if (loading) return <div style={{ color: '#888' }}>Loading Data...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Dispatch Management</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>Assign active drivers to incoming requests.</p>

      <table className="table-glass">
        <thead>
          <tr>
            <th>Trip ID / Details</th>
            <th>Route</th>
            <th>Type</th>
            <th>Status / Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.filter(b => b.status === 'awaiting_driver' || b.status === 'cancelled').map(b => (
            <tr key={b.id}>
              <td>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{b.id.split('-')[0].toUpperCase()}</span><br />
                <strong style={{ color: '#c6a87c' }}>{new Date(b.pickup_date).toLocaleDateString()} @ {b.pickup_time}</strong>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <Navigation size={14} color="#888" /> <span style={{ fontSize: '0.9rem' }}>{b.pickup_address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={14} color="#cf1322" /> <span style={{ fontSize: '0.9rem' }}>{b.dropoff_address}</span>
                </div>
              </td>
              <td>
                {b.service_type.toUpperCase()}<br/>
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{b.seats} Seats</span>
              </td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span className={`badge-status badge-${b.status}`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  
                  {(b.status === 'awaiting_driver' || b.status === 'cancelled') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select 
                        id={`driver-select-${b.id}`}
                        style={{ padding: '8px', background: '#0a0a0a', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
                      >
                        <option value="">Select a Driver...</option>
                        {activeDrivers.map(drv => (
                          <option key={drv.id} value={drv.id}>{drv.full_name} ({drv.vehicle_model})</option>
                        ))}
                      </select>
                      <button 
                        className="btn-gold" 
                        onClick={() => {
                          const select = document.getElementById(`driver-select-${b.id}`);
                          handleAssignDriver(b.id, select.value);
                        }}
                      >
                        Dispatch
                      </button>
                    </div>
                  )}
                  {b.status === 'cancelled' && (
                     <span style={{ fontSize: '0.85rem', color: '#cf1322', fontWeight: 'bold', marginTop: '5px' }}>Needs Re-dispatch</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {bookings.filter(b => b.status === 'awaiting_driver' || b.status === 'cancelled').length === 0 && (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#888' }}>No active dispatches waiting. All Clear.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
