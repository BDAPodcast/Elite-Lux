import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DriverLogin from './pages/DriverLogin';
import DriverApplication from './pages/DriverApplication';
import DriverDashboard from './pages/DriverDashboard';
import SubscriptionBypass from './pages/SubscriptionBypass';
import ActiveTrip from './pages/ActiveTrip';
import DriverLayout from './components/DriverLayout';

export default function App() {
  const [driverId, setDriverId] = useState(localStorage.getItem('driver_id'));

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={driverId ? <Navigate to="/dashboard" /> : <DriverLogin onLogin={(id) => {
            setDriverId(id);
            localStorage.setItem('driver_id', id);
          }} />} 
        />
        <Route 
          path="/apply" 
          element={driverId ? <Navigate to="/dashboard" /> : <DriverApplication />} 
        />

        {/* Protected */}
        <Route 
          path="/" 
          element={driverId ? <DriverLayout driverId={driverId} /> : <Navigate to="/login" />}
        >
          <Route path="subscription" element={<SubscriptionBypass driverId={driverId} />} />
          <Route path="dashboard" element={<DriverDashboard driverId={driverId} />} />
          <Route path="trip/:id" element={<ActiveTrip driverId={driverId} />} />
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}
