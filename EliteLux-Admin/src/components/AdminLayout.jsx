import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, LogOut } from 'lucide-react';
import './AdminLayout.css';

export default function AdminLayout() {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    window.location.reload();
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/bookings', label: 'Dispatch', icon: CalendarDays },
    { path: '/drivers', label: 'Drivers', icon: Users },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <h2 style={{ color: '#c6a87c', margin: 0, letterSpacing: '2px' }}>ELITE<span style={{color: '#fff'}}>ADMIN</span></h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <header className="admin-header">
          <h3>Admin Portal</h3>
          <div className="admin-profile">
            <div className="admin-avatar">AD</div>
          </div>
        </header>

        <div className="admin-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
