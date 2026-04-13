import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, MapPin, Clock, Phone, MessageSquare, TrendingUp, AlertCircle, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import PageTransition from '../components/PageTransition';
import MapSimulation from '../components/MapSimulation';
import Chat from '../components/Chat';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [totalTrips, setTotalTrips] = useState(0);
  const [nextPickup, setNextPickup] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [licensePlate, setLicensePlate] = useState('UNASSIGNED');
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelPassword, setCancelPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    const initDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setSession(session);
      await fetchData(session.user.id);
      setIsLoading(false);

      const channel = supabase.channel('customer-dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `user_id=eq.${session.user.id}` }, () => {
           fetchData(session.user.id);
        })
        .subscribe();
      
      return () => supabase.removeChannel(channel);
    };
    initDashboard();
  }, [navigate]);

  const fetchData = async (userId) => {
    try {
      const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed');
      setTotalTrips(count || 0);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .not('status', 'in', '("cancelled","completed")')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (bookings && bookings.length > 0) {
        const bk = bookings[0];
        setNextPickup(bk);
        if (bk.driver_id) {
           const { data: drv } = await supabase.from('driver_profiles').select('*').eq('id', bk.driver_id).single();
           if (drv) {
              setDriverProfile(drv);
              setLicensePlate(drv.license_plate);
           }
        }
      } else {
        setNextPickup(null);
        setDriverProfile(null);
        setLicensePlate('UNASSIGNED');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const handleCancelRequest = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setCancelError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: session.user.email, password: cancelPassword });
      if (authError) {
        setCancelError('Incorrect password. Access denied.');
        setIsVerifying(false);
        return;
      }
      if (nextPickup) {
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', nextPickup.id);
      }
      setIsCancelModalOpen(false);
      setCancelPassword('');
      alert('Dispatch successfully cancelled.');
    } catch {
      setCancelError('Cancellation failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCallDriver = () => {
    if (driverProfile) {
      alert(`Initiating secure VoIP call to ${driverProfile.full_name} at ${driverProfile.phone_number}... (Simulated)`);
    } else {
      alert("No driver assigned yet.");
    }
  };

  if (isLoading) return <div className="dashboard-loading">Loading Luxury Dashboard...</div>;

  return (
    <PageTransition>
      <div className="dashboard-page">
        <div className="dashboard-container">
          
          <div className="dashboard-grid">
            
            {/* Card 1: Your Ratings */}
            <motion.div className="dashboard-card ratings-card" whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
              <div className="card-header">
                <div className="header-top">
                   <h2>YOUR RATINGS</h2>
                   <div className="ratings-icon-box"><TrendingUp size={16} color="#000" /></div>
                </div>
              </div>
              
              <div className="rating-hero">
                <div className="rating-big"><span className="rating-value">5.0</span><span className="rating-scale">/ 5.0</span></div>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={24} fill="#c6a87c" color="#c6a87c" strokeWidth={2} />)}
                </div>
              </div>

              <div className="rating-stats-grid">
                <div className="rating-stat-item"><span className="stat-label">TOTAL TRIPS</span><span className="stat-number">{totalTrips}</span></div>
                <div className="rating-stat-item"><span className="stat-label">ON-TIME %</span><span className="stat-number">100%</span></div>
              </div>
            </motion.div>

            {/* Card 2: Driver Profile */}
            <motion.div className="dashboard-card driver-profile-card" whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
              <div className="card-header"><h2>DRIVER PROFILE</h2></div>
              
              {driverProfile ? (
                 <>
                  <div className="driver-profile-content">
                    <div className="driver-image-container">
                      {driverProfile.profile_picture_url ? (
                        <img src={driverProfile.profile_picture_url} alt="Driver" style={{width:'80px',height:'80px',borderRadius:'50%',objectFit:'cover',border:'2px solid #c6a87c'}} />
                      ) : (
                        <div style={{width:'80px',height:'80px',background:'#c6a87c',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',fontWeight:'bold',color:'#000'}}>
                          {driverProfile.full_name.charAt(0)}
                        </div>
                      )}
                      <div className="verified-badge">VERIFIED</div>
                    </div>
                    
                    <div className="driver-info-main">
                      <h3>{driverProfile.full_name}</h3>
                      <div className="license-plate-tag">{licensePlate}</div>
                      <p className="driver-title">{driverProfile.vehicle_make} {driverProfile.vehicle_model}</p>
                      <div className="driver-rating-row">
                        <Star size={14} fill="#c6a87c" color="#c6a87c" />
                        <span>{driverProfile.rating} Rating</span>
                      </div>
                    </div>
                  </div>

                  <div className="driver-actions">
                    <button className="btn-driver-action" onClick={handleCallDriver}><Phone size={18} /><span>Call</span></button>
                    <button className="btn-driver-action" onClick={() => setIsChatOpen(true)}><MessageSquare size={18} /><span>Message</span></button>
                  </div>
                 </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
                  <AlertCircle size={32} style={{marginBottom:'10px'}}/>
                  <p>Awaiting Dispatch Assignment</p>
                </div>
              )}
            </motion.div>

            {/* Card 3: Next Pickup */}
            <motion.div className="dashboard-card next-pickup-card" whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
              <div className="card-header">
                <div className="header-top">
                  <h2>YOUR DISPATCH</h2>
                  {nextPickup && <span className="priority-badge" style={{background: nextPickup.status === 'awaiting_driver' ? 'rgba(255,171,0,0.2)' : 'rgba(101,84,192,0.2)', color: nextPickup.status === 'awaiting_driver' ? '#ffab00' : '#6554c0'}}>
                    {nextPickup.status.replace('_', ' ').toUpperCase()}
                  </span>}
                </div>
              </div>
              
              {nextPickup ? (
                <>
                  <div className="pickup-time-row">
                    <div className="calendar-box">
                      <span className="month">{new Date(nextPickup.pickup_date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                      <span className="day">{new Date(nextPickup.pickup_date).getDate()}</span>
                    </div>
                    <div className="time-details">
                      <span className="pickup-time">{nextPickup.pickup_time}</span>
                      <span className="est-arrival"><Clock size={14} /> Est. Arrival: Live</span>
                    </div>
                  </div>

                  <div className="pickup-stat-row">
                     <div className="stat-icon-circle"><MapPin size={18} /></div>
                     <div className="stat-text">
                       <label>Pickup Location</label>
                       <span className="truncate">{nextPickup.pickup_address}</span>
                     </div>
                  </div>

                  {nextPickup.status === 'awaiting_driver' ? (
                     <button className="btn-cancel-dispatch" onClick={() => setIsCancelModalOpen(true)}>Cancel Dispatch</button>
                  ) : (
                     <div style={{ background: '#36b37e', color: '#fff', padding: '10px', textAlign: 'center', borderRadius: '4px', marginTop: '10px', fontWeight: 'bold' }}>
                       Driver Locked In
                     </div>
                  )}
                </>
              ) : (
                <div className="empty-pickup">
                  <AlertCircle size={40} color="#888" />
                  <p>No upcoming trips. Schedule your next elite journey.</p>
                  <button className="btn-action-small" onClick={() => navigate('/booking')}>Book Now</button>
                </div>
              )}
            </motion.div>

            {/* Card 4: Route Map */}
            <motion.div className="dashboard-card route-map-card" whileHover={{ y: -5, boxShadow: "0 15px 35px rgba(0,0,0,0.2)" }}>
              <div className="card-header"><div className="route-map-header"><div className="route-map-title-box">ROUTE MAP</div></div></div>
              <div className="mini-map-container">
                <MapSimulation mini={true} />
                <div className="map-zoom-controls"><button className="zoom-btn"><Plus size={18} /></button><button className="zoom-btn"><Minus size={18} /></button></div>
                <div className="map-footer-label"><div className="waypoint-dot"></div><span>Real-time tracking enabled</span><span className="expand-link">Live View</span></div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Verification Modal */}
        <AnimatePresence>
          {isCancelModalOpen && (
            <div className="modal-overlay">
              <motion.div className="verification-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <div className="modal-header">
                  <AlertCircle size={32} color="#cf1322" />
                  <h3>Security Verification</h3>
                  <p>Please enter your password to confirm cancellation.</p>
                </div>
                <form onSubmit={handleCancelRequest}>
                  <div className="modal-input-group">
                    <input type="password" placeholder="Your Password" value={cancelPassword} onChange={(e) => setCancelPassword(e.target.value)} required autoFocus />
                    {cancelError && <p className="error-text">{cancelError}</p>}
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={() => setIsCancelModalOpen(false)}>Back</button>
                    <button type="submit" className="btn-confirm" disabled={isVerifying}>{isVerifying ? 'Verifying...' : 'Cancel Dispatch'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Chat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
          driverName={driverProfile?.full_name || "Assigned Driver"} 
          bookingId={nextPickup?.id}
          customerId={session?.user?.id}
        />
      </div>
    </PageTransition>
  );
}
