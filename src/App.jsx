import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Loader from './components/Loader';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="booking" element={<Booking />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [appReady, setAppReady] = useState(false);

  return (
    <Router>
      {!appReady && <Loader onComplete={() => setAppReady(true)} />}
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
