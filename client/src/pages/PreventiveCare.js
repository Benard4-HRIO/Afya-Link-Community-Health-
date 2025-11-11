import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { FaCalendar, FaHeart, FaStethoscope, FaChartLine, FaBell, FaEdit, FaTrash } from 'react-icons/fa';
import { GiSyringe } from 'react-icons/gi'; // ✅ replaced FaVaccine with GiSyringe
import LoadingSpinner from '../components/LoadingSpinner';

const PreventiveCare = () => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [formData, setFormData] = useState({
    type: 'screening',
    category: 'general',
    title: '',
    date: '',
    value: '',
    unit: '',
    nextDueDate: '',
    doctor: '',
    facility: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch health records
  const { data: recordsData, isLoading } = useQuery(
    'health-records',
    () => axios.get('/api/preventive-care/records'),
    { select: (data) => data.data.records }
  );

  // Fetch dashboard data
  const { data: dashboardData } = useQuery(
    'health-dashboard',
    () => axios.get('/api/preventive-care/dashboard'),
    { select: (data) => data.data }
  );

  // Add/Update health record mutation
  const addRecordMutation = useMutation(
    (recordData) => axios.post('/api/preventive-care/records', recordData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('health-records');
        queryClient.invalidateQueries('health-dashboard');
        resetForm();
      }
    }
  );

  const updateRecordMutation = useMutation(
    ({ id, data }) => axios.put(`/api/preventive-care/records/${id}`, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('health-records');
        queryClient.invalidateQueries('health-dashboard');
        setEditingRecord(null);
        resetForm();
      }
    }
  );

  const deleteRecordMutation = useMutation(
    (id) => axios.delete(`/api/preventive-care/records/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('health-records');
        queryClient.invalidateQueries('health-dashboard');
      }
    }
  );

  const resetForm = () => {
    setFormData({
      type: 'screening',
      category: 'general',
      title: '',
      date: '',
      value: '',
      unit: '',
      nextDueDate: '',
      doctor: '',
      facility: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      updateRecordMutation.mutate({ id: editingRecord.id, data: formData });
    } else {
      addRecordMutation.mutate(formData);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      category: record.category,
      title: record.title,
      date: record.date,
      value: record.value || '',
      unit: record.unit || '',
      nextDueDate: record.nextDueDate || '',
      doctor: record.doctor || '',
      facility: record.facility || '',
      notes: record.notes || ''
    });
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      diabetes: FaHeart,
      hypertension: FaStethoscope,
      cholesterol: FaChartLine,
      vaccination: GiSyringe,
      general: FaStethoscope
    };
    return iconMap[category] || FaStethoscope;
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      diabetes: 'text-red-300',
      hypertension: 'text-blue-300',
      cholesterol: 'text-yellow-300',
      vaccination: 'text-green-300',
      general: 'text-gray-300'
    };
    return colorMap[category] || 'text-gray-300';
  };

  if (isLoading) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  const records = recordsData || [];
  const dashboard = dashboardData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Preventive Care Tracker</h1>
          <p className="text-blue-100">
            Track your health screenings, vaccinations, and medical appointments
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="text-center">
              <FaStethoscope className="w-8 h-8 text-blue-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{records.length}</div>
              <div className="text-blue-100">Total Records</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="text-center">
              <GiSyringe className="w-8 h-8 text-green-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {records.filter(r => r.type === 'vaccination').length}
              </div>
              <div className="text-blue-100">Vaccinations</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="text-center">
              <FaCalendar className="w-8 h-8 text-orange-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {dashboard.upcomingReminders?.length || 0}
              </div>
              <div className="text-blue-100">Upcoming</div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 shadow-lg">
            <div className="text-center">
              <FaBell className="w-8 h-8 text-purple-300 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {records.filter(r => r.isReminderSet).length}
              </div>
              <div className="text-blue-100">Reminders</div>
            </div>
          </div>
        </div>

        {/* Form and Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Record Form */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
              <div className="border-b border-white/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingRecord ? 'Edit Record' : 'Add Health Record'}
                </h3>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Record Type</label>
                    <select 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="screening" className="text-gray-800">Screening</option>
                      <option value="vaccination" className="text-gray-800">Vaccination</option>
                      <option value="checkup" className="text-gray-800">Checkup</option>
                      <option value="medication" className="text-gray-800">Medication</option>
                      <option value="test_result" className="text-gray-800">Test Result</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Category</label>
                    <select 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="general" className="text-gray-800">General</option>
                      <option value="diabetes" className="text-gray-800">Diabetes</option>
                      <option value="hypertension" className="text-gray-800">Hypertension</option>
                      <option value="cholesterol" className="text-gray-800">Cholesterol</option>
                      <option value="blood_pressure" className="text-gray-800">Blood Pressure</option>
                      <option value="weight" className="text-gray-800">Weight</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Blood Pressure Check"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-1">Value</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        placeholder="120/80" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-100 mb-1">Unit</label>
                      <input 
                        type="text" 
                        className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        placeholder="mmHg" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Next Due Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.nextDueDate}
                      onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Doctor/Facility</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.doctor}
                      onChange={(e) => setFormData({...formData, doctor: e.target.value})}
                      placeholder="Dr. John Doe" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-100 mb-1">Notes</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Additional notes..." 
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      type="submit" 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                      disabled={addRecordMutation.isLoading || updateRecordMutation.isLoading}
                    >
                      {addRecordMutation.isLoading || updateRecordMutation.isLoading ? (
                        <LoadingSpinner size="small" />
                      ) : (
                        editingRecord ? 'Update' : 'Add Record'
                      )}
                    </button>
                    {editingRecord && (
                      <button 
                        type="button" 
                        className="bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg border border-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        onClick={() => {
                          setEditingRecord(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
              <div className="border-b border-white/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Health Records</h3>
              </div>
              <div className="p-6">
                {records.length === 0 ? (
                  <div className="text-center py-8">
                    <FaStethoscope className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Records Yet</h3>
                    <p className="text-blue-100">Start by adding your first health record.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record) => {
                      const Icon = getCategoryIcon(record.category);
                      const iconColor = getCategoryColor(record.category);
                      return (
                        <div key={record.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:bg-white/10 transition duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />
                                <h4 className="font-semibold text-white">{record.title}</h4>
                                <span className="ml-2 px-2 py-1 bg-white/10 text-blue-100 text-xs rounded">
                                  {record.type}
                                </span>
                              </div>
                              <div className="text-sm text-blue-100 mb-2">
                                <div>Date: {new Date(record.date).toLocaleDateString()}</div>
                                {record.value && (
                                  <div>Value: {record.value} {record.unit}</div>
                                )}
                                {record.doctor && (
                                  <div>Doctor: {record.doctor}</div>
                                )}
                                {record.nextDueDate && (
                                  <div>Next Due: {new Date(record.nextDueDate).toLocaleDateString()}</div>
                                )}
                              </div>
                              {record.notes && (
                                <p className="text-sm text-blue-200">{record.notes}</p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(record)}
                                className="text-blue-300 hover:text-blue-100 transition duration-200"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteRecordMutation.mutate(record.id)}
                                className="text-red-300 hover:text-red-100 transition duration-200"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveCare;