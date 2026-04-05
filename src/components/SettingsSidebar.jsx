import React from 'react';
import { X, User, Shield, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './SettingsSidebar.css';

export default function SettingsSidebar({ 
  isOpen, 
  onClose, 
  user, 
  onSignOut 
}) {
  const menuItems = [
    { icon: <User size={20} />, label: 'Profile Settings', sub: 'Manage your personal info' },
    { icon: <CreditCard size={20} />, label: 'Payment Methods', sub: 'Cards and billing' },
    { icon: <Shield size={20} />, label: 'Privacy & Policy', sub: 'Legal and security' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="sidebar-overlay" onClick={onClose} />
          <motion.div 
            className="settings-sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="sidebar-header">
              <h2>Account Settings</h2>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="sidebar-user-block">
              <div className="user-avatar-large">
                <User size={32} />
              </div>
              <div className="user-info">
                <h3>{user?.email?.split('@')[0] || 'Member'}</h3>
                <p>{user?.email || 'member@elitelux.com'}</p>
                <span className="membership-tag">ELITE STATUS</span>
              </div>
            </div>

            <div className="sidebar-menu">
              {menuItems.map((item, index) => (
                <button key={index} className="menu-item-btn">
                  <div className="menu-item-icon">{item.icon}</div>
                  <div className="menu-item-text">
                    <span className="label">{item.label}</span>
                    <span className="sub">{item.sub}</span>
                  </div>
                  <ChevronRight size={18} className="chevron" />
                </button>
              ))}
            </div>

            <div className="sidebar-footer">
              <button className="sign-out-btn" onClick={onSignOut}>
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
              <div className="footer-meta">
                <span>Elite Lux Portfolio v1.0.4</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
