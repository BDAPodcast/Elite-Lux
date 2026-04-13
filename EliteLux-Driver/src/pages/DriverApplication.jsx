import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function DriverApplication() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: '',
    license_plate: '',
    profile_picture_url: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('driver_applications').insert(formData);
      setSubmitted(true);
    } catch (e) {
      alert('Failed to submit application.');
    }
    setLoading(false);
  };

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  if (submitted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
        <CheckCircle size={64} color="#c6a87c" />
        <h2 style={{ marginTop: '20px' }}>Application Received</h2>
        <p style={{ color: '#888', marginTop: '10px', textAlign: 'center', maxWidth: '400px' }}>
          Our admin team will review your details. Once approved, you can log in using your Full Name.
        </p>
        <button onClick={() => navigate('/login')} style={{ marginTop: '30px', padding: '10px 20px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '40px 20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
        <h2 style={{ color: '#c6a87c', marginBottom: '10px', textAlign: 'center' }}>Elite Chauffeur Application</h2>
        <p style={{ color: '#888', textAlign: 'center', marginBottom: '30px' }}>Join the most exclusive fleet in the city.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Full Name</label>
            <input type="text" name="full_name" required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Email</label>
            <input type="email" name="email" required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Phone Number</label>
            <input type="tel" name="phone_number" required onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Profile Picture URL</label>
            <input type="url" name="profile_picture_url" placeholder="https://example.com/photo.jpg" onChange={handleChange} style={inputStyle} />
          </div>
          
          <h3 style={{ marginTop: '10px', color: '#fff', borderBottom: '1px solid #333', paddingBottom: '10px' }}>Vehicle Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Make (e.g. Mercedes)</label>
              <input type="text" name="vehicle_make" required onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Model (e.g. S-Class)</label>
               <input type="text" name="vehicle_model" required onChange={handleChange} style={inputStyle} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>Year</label>
              <input type="number" name="vehicle_year" required onChange={handleChange} style={inputStyle} />
            </div>
            <div>
               <label style={{ display: 'block', marginBottom: '5px', color: '#888' }}>License Plate</label>
               <input type="text" name="license_plate" required onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
             padding: '15px', background: '#c6a87c', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', marginTop: '20px', cursor: 'pointer'
          }}>
            {loading ? 'Submitting...' : 'Submit to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '4px', boxSizing: 'border-box'
};
