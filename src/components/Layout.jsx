import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Logo from './Logo';
import AuthenticatedNav from './AuthenticatedNav';
import NotificationDrawer from './NotificationDrawer';
import SettingsSidebar from './SettingsSidebar';
import './Layout.css';

export default function Layout({ session }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const isAppPage = ['/dashboard', '/booking'].includes(location.pathname);

  // Realtime Subscription
  useEffect(() => {
    if (session) {
      // 1. Initial Fetch
      const fetchNotifications = async () => {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(15);
        if (data) setNotifications(data);
      };
      
      fetchNotifications();

      // 2. Realtime Channel
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev].slice(0, 15));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session]);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsSettingsOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMobileMenuOpen(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
    navigate('/');
  };

  const handleMarkAsRead = async (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className={`app-container ${isAppPage ? 'is-app-view' : ''}`}>
      
      {/* Dynamic Header */}
      {session && isAppPage ? (
        <AuthenticatedNav 
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasNewNotifications={hasUnread}
          userAvatar={avatarUrl}
        />
      ) : (
        <nav className="header-nav">
          <div className="header-content">
            <div className="header-left">
              <Link to="/" className="brand-link" onClick={closeMenu}>
                <Logo width={120} />
              </Link>
              {!isAppPage && (
                <div className="desktop-nav-links">
                  <a href="#about" className="nav-item">About Us</a>
                  <a href="#services" className="nav-item">Services</a>
                </div>
              )}
            </div>

            <div className="header-right desktop-nav-links">
              {session ? (
                <button 
                  className="nav-item" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-white)' }}
                  onClick={handleSignOut}
                >
                  Sign Out
                </button>
              ) : (
                <>
                  <Link to="/login" className="nav-item">Log In</Link>
                  <Link to="/login" className="btn-signup btn-gold">Sign Up</Link>
                </>
              )}
            </div>

            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      )}

      {/* Sidebars & Drawers */}
      <NotificationDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
      <SettingsSidebar 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        user={session?.user}
        onSignOut={handleSignOut}
        onAvatarChange={setAvatarUrl}
        avatarUrl={avatarUrl}
      />

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && !isAppPage && (
        <div className="mobile-menu">
          <Link to="/booking" className="mobile-nav-item" onClick={closeMenu}>Ride</Link>
          <Link to="/reserve" className="mobile-nav-item" onClick={closeMenu}>Reserve</Link>
          <Link to="/about" className="mobile-nav-item" onClick={closeMenu}>About</Link>
          <div className="divider"></div>
          <Link to="/login" className="mobile-nav-item" onClick={closeMenu}>Log in</Link>
          <Link to="/login" className="mobile-nav-item" onClick={closeMenu}>Sign up</Link>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer - Only show on Landing/Static pages */}
      {!isAppPage && (
        <footer className="footer-black">
          <div className="footer-container">
            <div className="footer-top">
              <Logo width={120} />
              <a href="#" className="visit-help">Visit Help Center</a>
            </div>

            <div className="footer-links-grid">
              <div className="footer-column">
                <h4>Company</h4>
                <Link to="/about">About us</Link>
                <Link to="/newsroom">Newsroom</Link>
                <Link to="/investors">Investors</Link>
                <Link to="/careers">Careers</Link>
              </div>
              <div className="footer-column">
                <h4>Products</h4>
                <Link to="/booking">Ride</Link>
                <Link to="/drive">Drive</Link>
                <Link to="/deliver">Deliver</Link>
                <Link to="/business">Elite for Business</Link>
              </div>
              <div className="footer-column">
                <h4>Global citizenship</h4>
                <Link to="/safety">Safety</Link>
                <Link to="/sustainability">Sustainability</Link>
              </div>
              <div className="footer-column">
                <h4>Travel</h4>
                <Link to="/reserve">Reserve</Link>
                <Link to="/airports">Airports</Link>
                <Link to="/cities">Cities</Link>
              </div>
            </div>

            <div className="footer-bottom">
              <div className="socials">
                <span className="social-icon">in</span>
                <span className="social-icon">yt</span>
                <span className="social-icon">ig</span>
                <span className="social-icon">x</span>
              </div>
              <div className="footer-bottom-links">
                <span className="flex-center"><Globe size={16} /> English</span>
                <span>New York City</span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

