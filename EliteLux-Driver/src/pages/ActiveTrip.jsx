// Real-time trip status updaters and chat integration
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, MessageSquare } from 'lucide-react';
import DriverChat from '../components/DriverChat';

export default function ActiveTrip({ driverId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchBooking();
    const sub = supabase.channel('active-booking')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `id=eq.${id}` }, fetchBooking)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [id]);

  const fetchBooking = async () => {
    const { data } = await supabase.from('bookings').select('*').eq('id', id).single();
    setBooking(data);
  };

  const updateStatus = async (newStatus) => {
    await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    
    // Create Notification for Customer
    let msg = '';
    if (newStatus === 'en_route') msg = 'Your driver is en route to the pickup location.';
    if (newStatus === 'arrived') msg = 'Your driver has arrived at the pickup location.';
    if (newStatus === 'in_progress') msg = 'Your trip has started.';
    if (newStatus === 'completed') msg = 'Your trip is completed. Thank you for choosing Elite Lux.';

    if (msg) {
      await supabase.from('notifications').insert({
        user_id: booking.user_id,
        type: 'trip_update',
        message: msg,
        is_read: false
      });
    }

    if (newStatus === 'completed') {
      // Increment driver trips
      const { data: dData } = await supabase.from('driver_profiles').select('total_trips').eq('id', driverId).single();
      await supabase.from('driver_profiles').update({ total_trips: (dData.total_trips || 0) + 1 }).eq('id', driverId);
      alert('Trip Completed!');
      navigate('/dashboard');
    }
  };

  if (!booking) return <div>Loading Trip Data...</div>;

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      
      {/* Status Flow */}
      <div style={{ flex: 1, background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
        <h2 style={{ marginBottom: '20px' }}>Trip Execution Flow</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', background: '#0a0a0a', padding: '15px', borderRadius: '8px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>CURRENT STATUS</span><br/>
            <span className={`badge-status badge-${booking.status}`}>{booking.status.replace('_', ' ')}</span>
          </div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>DISTANCE</span><br/>
            <span>{booking.distance_miles} mi</span>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <span style={{ fontSize: '0.8rem', color: '#888' }}>FARE</span><br/>
            <span>${booking.total_price}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {booking.status === 'assigned' && (
            <button onClick={() => updateStatus('en_route')} className="btn-gold" style={{ padding: '20px', fontSize: '1.2rem' }}>
              PUNCH IN: EN ROUTE
            </button>
          )}
          {booking.status === 'en_route' && (
            <button onClick={() => updateStatus('arrived')} className="btn-gold" style={{ padding: '20px', fontSize: '1.2rem' }}>
              MARK ARRIVED AT PICKUP
            </button>
          )}
          {booking.status === 'arrived' && (
            <button onClick={() => updateStatus('in_progress')} className="btn-gold" style={{ padding: '20px', fontSize: '1.2rem' }}>
              START TRIP
            </button>
          )}
          {booking.status === 'in_progress' && (
            <button onClick={() => updateStatus('completed')} style={{ padding: '20px', fontSize: '1.2rem', background: '#36b37e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              COMPLETE TRIP
            </button>
          )}
        </div>
      </div>

      {/* Communications */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px' }}>Customer Comms</h3>
          <button onClick={() => setIsChatOpen(true)} className="btn-gold" style={{ background: 'transparent', border: '1px solid #c6a87c', color: '#c6a87c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <MessageSquare size={18} /> OPEN SECURE CHAT
          </button>
        </div>
      </div>

      {isChatOpen && <DriverChat bookingId={id} driverId={driverId} onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
