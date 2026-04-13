import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import PageTransition from '../components/PageTransition';
import MapSimulation from '../components/MapSimulation';
import './Booking.css';

export default function Booking() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  // Form State
  const [pickup, setPickup] = useState('JFK International Airport');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState('medium');
  const [seats, setSeats] = useState(2);
  const [distance, setDistance] = useState(0); // Updated live from Google Maps

  // Pricing Logic
  const getBasePrice = () => {
    switch(serviceType) {
      case 'medium': return 200;
      case 'long': return 550;
      case 'multi': return 600;
      default: return 200;
    }
  };

  const getSeatModifier = () => {
    switch(Number(seats)) {
      case 2: return 0;
      case 4: return 75;
      case 6: return 150;
      default: return 0;
    }
  };

  const totalPrice = getBasePrice() + getSeatModifier() + (distance * 10);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // 1. Create Booking Record
      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: user.id,
        pickup_address: pickup,
        dropoff_address: dropoff,
        service_type: serviceType,
        seats: seats,
        pickup_date: date,
        pickup_time: time,
        distance_miles: distance,
        base_price: getBasePrice(),
        total_price: totalPrice,
        status: 'awaiting_driver'
      });

      if (bookingError) throw bookingError;

      // 2. Create Initial Notification
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'system',
        message: 'Your booking has been received. We will get back to you once we have a driver available for your trip.',
        is_read: false
      });

      if (notifError) throw notifError;

      setBookingConfirmed(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Booking failed:', error.message);
      alert('Booking failed. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="booking-page celebration-view">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="confirmation-card glass-panel"
        >
          <CheckCircle size={64} color="var(--color-gold)" />
          <h2>Booking Confirmed!</h2>
          <p>We are matching you with an Elite chauffeur. Redirecting to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="booking-page">
        <div className="booking-layout">
          
          {/* Left Area: Map (Black/Gold) */}
          <div className="map-panel-uber">
            <MapSimulation 
              onPickupChange={setPickup} 
              onDropoffChange={setDropoff}
              onDistanceChange={setDistance}
            />
          </div>

          {/* Right Area: Form (White/Black) */}
          <div className="booking-form-panel">
            <div className="booking-form-container">
              <header className="form-header">
                <h1>Schedule a Ride</h1>
                <p className="text-muted">Premium luxury chauffeur services tailored to you.</p>
              </header>

              <form className="luxury-booking-form" onSubmit={handleBooking}>
                {/* Locations */}
                <div className="location-inputs-group">
                  <div className="input-row-wrapper">
                    <Navigation size={18} className="icon-black" />
                    <input 
                      type="text" 
                      placeholder="Pick-up Location" 
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="input-row-wrapper">
                    <MapPin size={18} className="icon-black" />
                    <input 
                      type="text" 
                      placeholder="Drop-off Location" 
                      value={dropoff}
                      onChange={(e) => setDropoff(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="form-grid-uber mt-lg">
                  <div className="form-group-uber">
                    <label>Pickup Date & Time</label>
                    <div className="input-row-wrapper">
                      <CalendarIcon size={18} className="icon-black" />
                      <input 
                        type="datetime-local" 
                        value={date && time ? `${date}T${time}` : (date ? date : '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) {
                            const [d, t] = val.split('T');
                            setDate(d || '');
                            setTime(t || '');
                          }
                        }}
                        required 
                      />
                    </div>
                  </div>
                </div>

                {/* Service Type & Seats */}
                <div className="form-grid-uber mt-md">
                  <div className="form-group-uber">
                    <label>Elite Service</label>
                    <select 
                      className="uber-select" 
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                    >
                      <option value="medium">Medium Distance</option>
                      <option value="long">Long Distance</option>
                      <option value="multi">Multi-Location</option>
                    </select>
                  </div>
                  <div className="form-group-uber">
                    <label>Elite Seats</label>
                    <select 
                      className="uber-select" 
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value))}
                    >
                      <option value="2">2 Seater</option>
                      <option value="4">4 Seater</option>
                      <option value="6">6 Seater</option>
                    </select>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="uber-pricing mt-lg">
                  <div className="uber-row">
                    <span>Base Fare</span>
                    <span>${getBasePrice()}</span>
                  </div>
                  <div className="uber-row">
                    <span>Distance ({distance} mi)</span>
                    <span>${distance * 10}</span>
                  </div>
                  <div className="uber-total">
                    <span>Estimate</span>
                    <strong>${totalPrice}</strong>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-uber-request w-100 mt-xl" 
                  disabled={loading}
                >
                  {loading ? 'REQUESTING...' : 'Search'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}

