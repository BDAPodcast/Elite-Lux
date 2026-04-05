import React from 'react';
import { X, Bell, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './NotificationDrawer.css';

export default function NotificationDrawer({ 
  isOpen, 
  onClose, 
  notifications = [], 
  onMarkAsRead 
}) {
  // Only keep the latest 15 notifications (FIFO logic handled at data level typically, 
  // but we enforce it here for safety)
  const displayNotifications = [...notifications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 15);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="drawer-overlay" onClick={onClose} />
          <motion.div 
            className="notification-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="drawer-header">
              <div className="header-title">
                <Bell size={20} className="gold-text" />
                <h2>Notifications</h2>
              </div>
              <button className="close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="drawer-content">
              {displayNotifications.length === 0 ? (
                <div className="empty-state">
                  <p>You're all caught up!</p>
                </div>
              ) : (
                <div className="notification-list">
                  {displayNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                      onClick={() => onMarkAsRead(notif.id)}
                    >
                      <div className="notif-avatar">
                        {notif.sender_avatar ? (
                          <img src={notif.sender_avatar} alt={notif.sender_name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {notif.type === 'driver' ? <User size={18} /> : <Bell size={18} />}
                          </div>
                        )}
                      </div>
                      <div className="notif-info">
                        <div className="notif-header">
                          <span className="notif-sender">{notif.sender_name || 'Elite Lux System'}</span>
                          <span className="notif-time">
                            {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="notif-message">{notif.message}</p>
                      </div>
                      {!notif.is_read && <span className="unread-indicator" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="drawer-footer">
              <button className="clear-all-btn">Mark all as read</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
