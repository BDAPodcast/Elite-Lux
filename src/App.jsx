import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Loader from './components/Loader';

function AnimatedRoutes({ session }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={session ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="login" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="booking" element={session ? <Booking /> : <Navigate to="/" replace />} />
          <Route path="dashboard" element={session ? <Dashboard /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}


function App() {
  const [appReady, setAppReady] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router basename="/Elite-Lux">
      {!appReady && <Loader onComplete={() => setAppReady(true)} />}
      <AnimatedRoutes session={session} />
    </Router>
  );
}


export default App;

