import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Settings, User } from 'lucide-react';
import Logo from './Logo';
import './AuthenticatedNav.css';

export default function AuthenticatedNav({ 
  onOpenNotifications, 
  onOpenSettings, 
  hasNewNotifications, 
  userAvatar 
}) {
  const location = useLocation();

  return (
    <nav className="auth-nav">
      <div className="auth-nav-content">
        <div className="auth-nav-left">
          <Link to="/dashboard" className="auth-brand">
            <Logo width={100} />
          </Link>
          <div className="auth-links">
            <Link 
              to="/dashboard" 
              className={`auth-nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/booking" 
              className={`auth-nav-item ${location.pathname === '/booking' ? 'active' : ''}`}
            >
              Booking
            </Link>
          </div>
        </div>

        <div className="auth-nav-right">
          <button 
            className="auth-icon-btn notification-btn" 
            onClick={onOpenNotifications}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {hasNewNotifications && <span className="notification-dot"></span>}
          </button>
          
          <button 
            className="auth-icon-btn" 
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>

          <button className="profile-btn" onClick={onOpenSettings} aria-label="Profile">
            <div className="profile-circle">
              {userAvatar ? (
                <img src={userAvatar} alt="Profile" />
              ) : (
                <User size={20} color="var(--color-black)" />
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
