import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export default function DriverManagement() {
  const [applications, setApplications] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const sub = supabase.channel('driver-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_applications' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_profiles' }, fetchData)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: apps } = await supabase.from('driver_applications').select('*').eq('status', 'pending');
    const { data: profiles } = await supabase.from('driver_profiles').select('*');
    setApplications(apps || []);
    setDrivers(profiles || []);
    setLoading(false);
  };

  const handleApprove = async (app) => {
    try {
      const fakeId = crypto.randomUUID();
      await supabase.from('driver_profiles').insert({
        id: fakeId,
        full_name: app.full_name,
        phone_number: app.phone_number,
        vehicle_make: app.vehicle_make,
        vehicle_model: app.vehicle_model,
        license_plate: app.license_plate,
        profile_picture_url: app.profile_picture_url || '',
        is_active: false,
        rating: 5.0,
        total_trips: 0
      });

      await supabase.from('driver_applications').update({ status: 'approved' }).eq('id', app.id);

      alert('Driver Application Approved! They can now log in using their Full Name.');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Approval failed. Ensure constraints are dropped.');
    }
  };

  const handleReject = async (appId) => {
    await supabase.from('driver_applications').update({ status: 'rejected' }).eq('id', appId);
    fetchData();
  };

  if (loading) return <div style={{ color: '#888' }}>Loading Data...</div>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Driver Applications</h2>
      
      <div style={{ marginBottom: '40px' }}>
        {applications.length === 0 ? (
          <p style={{ color: '#888' }}>No pending applications currently.</p>
        ) : (
          <table className="table-glass">
            <thead>
              <tr>
                <th>Applicant Name</th>
                <th>Contact</th>
                <th>Vehicle</th>
                <th>License Plate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td style={{ fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {app.profile_picture_url ? (
                        <img src={app.profile_picture_url} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {app.full_name.charAt(0)}
                        </div>
                      )}
                      {app.full_name}
                    </div>
                  </td>
                  <td>{app.email}<br/><span style={{ color: '#888', fontSize:'0.85rem' }}>{app.phone_number}</span></td>
                  <td>{app.vehicle_make} {app.vehicle_model} ({app.vehicle_year})</td>
                  <td>{app.license_plate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleApprove(app)} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button onClick={() => handleReject(app.id)} className="btn-reject" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ marginBottom: '20px' }}>Active Fleet Roster</h2>
      <div>
        <table className="table-glass">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Vehicle</th>
              <th>Sub Status</th>
              <th>Trips Completed</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(drv => (
              <tr key={drv.id}>
                <td style={{ fontWeight: 'bold' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {drv.profile_picture_url ? (
                      <img src={drv.profile_picture_url} alt="Profile" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{drv.full_name.charAt(0)}</div>
                    )}
                    {drv.full_name}
                  </div>
                </td>
                <td>{drv.vehicle_make} {drv.vehicle_model} • {drv.license_plate}</td>
                <td>
                  <span className={`badge-status ${drv.is_active ? 'badge-completed' : 'badge-pending'}`}>
                    {drv.is_active ? 'Active (Paid)' : 'Inactive (Unpaid)'}
                  </span>
                </td>
                <td>{drv.total_trips}</td>
                <td>{drv.rating} ★</td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', color: '#888' }}>No drivers onboarded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
