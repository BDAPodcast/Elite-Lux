import React, { useState } from 'react';
import { MapPin, Navigation, Calendar as CalendarIcon, CreditCard, ChevronRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import './Booking.css';

export default function Booking() {
  const [step, setStep] = useState(1); // 1: Locations, 2: Vehicles, 3: Confirmation
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    { id: 'sedan', name: 'Luxury Sedan', price: 150, capacity: '3 Pax', image: 'sedan' },
    { id: 'suv', name: 'Executive SUV', price: 250, capacity: '6 Pax', image: 'suvs' },
    { id: 'sprinter', name: 'Premium Sprinter', price: 400, capacity: '14 Pax', image: 'sprinter' }
  ];

  return (
    <PageTransition>
      <div className="booking-page">
      <div className="booking-layout">
        
        {/* Left/Top Area: Map Placeholder */}
        <div className="map-view">
          <div className="map-placeholder">
            <div className="map-overlay">
              <span className="map-text">Interactive Map View</span>
              <p className="map-subtext">Route rendering placeholder</p>
            </div>
            {/* Draw a fake route line */}
            <svg className="fake-route" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 20,80 Q 50,70 40,40 T 80,20" stroke="var(--color-gold)" strokeWidth="2" fill="none" strokeDasharray="5,5" />
              <circle cx="20" cy="80" r="3" fill="var(--color-white)" />
              <circle cx="80" cy="20" r="3" fill="var(--color-gold)" />
            </svg>
          </div>
        </div>

        {/* Right/Bottom Area: Booking Flow */}
        <div className="booking-panel glass-panel">
          
          {step === 1 && (
            <div className="booking-step slide-in">
              <h2 className="panel-title">Schedule a Ride</h2>
              <div className="form-group pickup-group">
                <div className="input-wrapper">
                  <Navigation className="input-icon" size={18} color="var(--color-white)" />
                  <input type="text" placeholder="Pick-up Location" defaultValue="JFK International Airport" />
                </div>
                <div className="route-line"></div>
                <div className="input-wrapper">
                  <MapPin className="input-icon" size={18} color="var(--color-gold)" />
                  <input type="text" placeholder="Drop-off Location" defaultValue="The Plaza Hotel, Manhattan" />
                </div>
              </div>

              <div className="form-group">
                <label>Date & Time (Min 2 hours advance)</label>
                <div className="input-wrapper">
                  <CalendarIcon className="input-icon" size={18} />
                  <input type="datetime-local" />
                </div>
              </div>

              <button className="btn-primary w-100 mt-lg" onClick={() => setStep(2)}>
                Select Vehicle
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="booking-step slide-in">
              <h2 className="panel-title">Select Vehicle</h2>
              <div className="vehicle-list">
                {vehicles.map(v => (
                  <div 
                    key={v.id} 
                    className={`vehicle-card ${selectedVehicle === v.id ? 'selected' : ''}`}
                    onClick={() => setSelectedVehicle(v.id)}
                  >
                    <div className="vehicle-img-mini">
                      {v.name[0]}
                    </div>
                    <div className="vehicle-details">
                      <h4>{v.name}</h4>
                      <span className="capacity">{v.capacity} • {v.id.toUpperCase()}</span>
                    </div>
                    <div className="vehicle-price">
                      ${v.price}
                    </div>
                  </div>
                ))}
              </div>
              <div className="step-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>Back</button>
                <button 
                  className="btn-primary" 
                  disabled={!selectedVehicle}
                  onClick={() => setStep(3)}
                >
                  Continuue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-step slide-in">
              <h2 className="panel-title">Review & Confirm</h2>
              <div className="summary-card">
                <div className="summary-row">
                  <span>Pick-up</span>
                  <strong>JFK Airport</strong>
                </div>
                <div className="summary-row">
                  <span>Drop-off</span>
                  <strong>The Plaza Hotel</strong>
                </div>
                <div className="summary-row">
                  <span>Vehicle</span>
                  <strong>{vehicles.find(v => v.id === selectedVehicle)?.name}</strong>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total (Fixed)</span>
                  <strong className="gold-text">${vehicles.find(v => v.id === selectedVehicle)?.price}</strong>
                </div>
              </div>

              <div className="payment-method">
                <CreditCard size={20} color="var(--color-text-muted)" />
                <span>•••• •••• •••• 4242</span>
              </div>

              <div className="step-actions mt-lg">
                <button className="btn-secondary" onClick={() => setStep(2)}>Back</button>
                <button className="btn-primary" onClick={() => alert('Booking Confirmed! (Dummy)')}>
                  Confirm Ride
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
    </PageTransition>
  );
}
