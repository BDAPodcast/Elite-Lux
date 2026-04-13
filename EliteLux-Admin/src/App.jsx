import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import BookingManagement from './pages/BookingManagement';
import DriverManagement from './pages/DriverManagement';
import AdminLayout from './components/AdminLayout';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_auth') === 'true'
  );

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" /> : 
            <AdminLogin onLogin={() => {
              setIsAuthenticated(true);
              localStorage.setItem('admin_auth', 'true');
            }} />
          } 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" />}
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="drivers" element={<DriverManagement />} />
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}
