import React, { useState } from 'react';
import { User, Settings, CreditCard, Clock, MessageSquare, Star, Shield } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import Chat from '../components/Chat';
import './Dashboard.css';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Dummy data
  const upcomingRides = [
    { id: '#ELSUV12345', vehicle: 'Executive SUV', date: 'Dec 20, 2024', status: 'Upcoming', from: 'JFK Airport', to: 'The Plaza Hotel', price: '$250' }
  ];

  const pastRides = [
    { id: '#ELSED98765', vehicle: 'Luxury Sedan', date: 'Nov 15, 2024', status: 'Completed', from: 'Wall Street', to: 'Newark Airport', price: '$150' }
  ];

  return (
    <PageTransition>
      <div className="dashboard-page">
        <div className="dashboard-layout">
          
          {/* Sidebar */}
          <aside className="sidebar glass-panel">
            <div className="profile-summary">
              <div className="avatar placeholder-avatar">
                <User size={30} color="var(--color-black)" />
              </div>
              <h3>John Doe</h3>
              <p className="member-status">Elite Member</p>
            </div>

            <nav className="sidebar-nav">
              <button className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                <Clock size={20} /> My Rides
              </button>
              <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <User size={20} /> Profile
              </button>
              <button className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>
                <CreditCard size={20} /> Payment Methods
              </button>
              <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                <Settings size={20} /> Settings
              </button>
              <div className="sidebar-divider"></div>
              <button className="nav-item text-danger">
                Log Out
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <div className="dashboard-content">
            
            {activeTab === 'bookings' && (
              <div className="fade-in">
                <h2 className="section-title text-left">Your Rides</h2>
                
                <h3 className="subsection-title">Upcoming</h3>
                {upcomingRides.map(ride => (
                  <div key={ride.id} className="ride-card glass-panel">
                    <div className="ride-header">
                      <div>
                        <h4>{ride.vehicle}</h4>
                        <p className="ride-date">{ride.date} • {ride.id}</p>
                      </div>
                      <span className="badge badge-upcoming">{ride.status}</span>
                    </div>
                    <div className="ride-body">
                      <div className="route">
                        <div className="dot start"></div>
                        <span className="route-text">{ride.from}</span>
                        <div className="line"></div>
                        <div className="dot end"></div>
                        <span className="route-text">{ride.to}</span>
                      </div>
                      <div className="ride-price">{ride.price}</div>
                    </div>
                    <div className="ride-actions">
                      <button className="btn-secondary small">Reschedule</button>
                      <button className="btn-primary small" onClick={() => setIsChatOpen(true)}>
                        Chat with Driver <MessageSquare size={14} style={{marginLeft: '5px'}} />
                      </button>
                    </div>
                  </div>
                ))}

                <h3 className="subsection-title mt-xl">Past Rides</h3>
                {pastRides.map(ride => (
                  <div key={ride.id} className="ride-card glass-panel">
                    <div className="ride-header">
                      <div>
                        <h4>{ride.vehicle}</h4>
                        <p className="ride-date">{ride.date} • {ride.id}</p>
                      </div>
                      <span className="badge badge-completed">{ride.status}</span>
                    </div>
                    <div className="ride-body">
                      <div className="route">
                        <div className="dot start"></div>
                        <span className="route-text">{ride.from}</span>
                        <div className="line"></div>
                        <div className="dot end"></div>
                        <span className="route-text">{ride.to}</span>
                      </div>
                      <div className="ride-price">{ride.price}</div>
                    </div>
                    <div className="ride-actions">
                      <button className="btn-secondary small">Report Issue</button>
                      <button className="btn-primary small">Rate Ride <Star size={14} style={{marginLeft: '5px'}} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="fade-in profile-tab">
                <h2 className="section-title text-left">Profile Information</h2>
                <div className="glass-panel form-panel">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" defaultValue="John" />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" defaultValue="Doe" />
                  </div>
                  <div className="form-group mt-md">
                    <label>Email Address</label>
                    <input type="email" defaultValue="you@example.com" disabled />
                  </div>
                  <div className="form-group mt-md">
                    <label>Phone Number</label>
                    <input type="tel" defaultValue="+1 234 567 8900" />
                  </div>
                  <button className="btn-primary mt-lg">Save Changes</button>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="fade-in payment-tab">
                <h2 className="section-title text-left">Payment Methods</h2>
                <div className="glass-panel form-panel">
                   <div className="saved-card">
                     <div className="card-info">
                       <CreditCard size={24} />
                       <div>
                         <h4>John Doe</h4>
                         <p>•••• •••• •••• 4242</p>
                       </div>
                     </div>
                     <button className="text-btn text-danger">Remove</button>
                   </div>
                   <button className="btn-primary w-100 mt-md">Add New Payment Method</button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="fade-in settings-tab">
                 <h2 className="section-title text-left">Account Settings</h2>
                 <div className="glass-panel form-panel">
                    <h3 className="subsection-title">Security</h3>
                    <button className="btn-secondary w-100 mb-md" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                      <Shield size={16} /> Update Password
                    </button>

                    <h3 className="subsection-title mt-lg">Notifications</h3>
                    <div className="toggle-row">
                      <span>Ride Updates (SMS)</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-row">
                      <span>Email Receipts</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div className="toggle-row">
                      <span>Promotional Offers</span>
                      <input type="checkbox" />
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>

        <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      </div>
    </PageTransition>
  );
}
