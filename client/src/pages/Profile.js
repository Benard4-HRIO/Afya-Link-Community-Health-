import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUser, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, changePassword, loading } = useAuth();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    language: user?.language || 'en'
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);

  if (loading) return <LoadingSpinner className="min-h-screen" />;

  const submitProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    setChanging(true);
    await changePassword(passwords.currentPassword, passwords.newPassword);
    setPasswords({ currentPassword: '', newPassword: '' });
    setChanging(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center">
            <FaUser />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="card-body">
              <form onSubmit={submitProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input className="form-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input className="form-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-input" value={form.dateOfBirth || ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Gender</label>
                    <select className="form-input form-select" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label">Language</label>
                  <select className="form-input form-select" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>

                <button className="btn btn-primary" disabled={saving}>
                  <FaSave /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Change Password</h3>
            </div>
            <div className="card-body">
              <form onSubmit={submitPassword} className="space-y-4">
                <div>
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-input" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                </div>

                <button className="btn btn-primary" disabled={changing}>
                  <FaSave /> {changing ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;






