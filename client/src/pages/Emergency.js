import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useMutation, useQuery } from 'react-query';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaAmbulance, FaPhone, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

const Emergency = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [location, setLocation] = useState(null);
  const [urgency, setUrgency] = useState('medium');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        () => setLocation(null)
      );
    }
  }, []);

  const { data: contacts, isLoading: loadingContacts } = useQuery(
    'emergency-contacts',
    async () => (await axios.get('/api/emergency/contacts')).data
  );

  const { data: guidelines, isLoading: loadingGuidelines } = useQuery(
    'emergency-guidelines',
    async () => (await axios.get('/api/emergency/guidelines')).data
  );

  const sendAlertMutation = useMutation(
    () => axios.post('/api/emergency/alert', { phone, message, location, emergencyType: 'general' })
  );

  const requestAmbulanceMutation = useMutation(
    () => axios.post('/api/emergency/ambulance', { phone, location, urgency, condition: message })
  );

  return (
    <div
      className="min-h-screen relative flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://media.istockphoto.com/id/1327568875/photo/healthcare-business-graph-data-and-growth-insurance-healthcare-doctor-analyzing-medical-of.jpg?s=612x612&w=0&k=20&c=R4idIeTPq0f1TPSJwAq4KUeLUQg6ul8eIBSjvs9MXQk=')`,
      }}
    >
      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-blue-900/50 to-black/80"></div>

      {/* Main content */}
      <div className="relative container mx-auto px-4 py-16 z-10 text-white">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Emergency Help Center</h1>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Immediate access to emergency services. Share your location for faster medical response.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Emergency Alert Card */}
            <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <FaExclamationTriangle className="text-yellow-400 text-2xl" />
                <h3 className="text-xl font-semibold">Send Emergency Alert (SMS)</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Phone Number</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none"
                      placeholder="e.g., +2547XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-200 mb-1">Message (optional)</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none"
                      placeholder="Describe the emergency"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <FaMapMarkerAlt />
                  {location ? (
                    <span>
                      Location ready ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                    </span>
                  ) : (
                    <span>Location not available</span>
                  )}
                </div>

                <button
                  className="w-full bg-red-600 hover:bg-red-700 transition py-2 rounded-lg font-semibold shadow-lg"
                  onClick={() => sendAlertMutation.mutate()}
                  disabled={sendAlertMutation.isLoading || !phone}
                >
                  {sendAlertMutation.isLoading ? 'Sending…' : '🚨 Send Alert'}
                </button>
              </div>
            </div>

            {/* Ambulance Request Card */}
            <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <FaAmbulance className="text-red-400 text-2xl" />
                <h3 className="text-xl font-semibold">Request Ambulance</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Phone Number</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none"
                      placeholder="e.g., +2547XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Urgency</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 focus:outline-none"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-200 mb-1">Condition</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none"
                      placeholder="e.g., injury, chest pain"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-200">
                  <FaMapMarkerAlt />
                  {location ? (
                    <span>
                      Location ready ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                    </span>
                  ) : (
                    <span>Location not available</span>
                  )}
                </div>

                <button
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition py-2 rounded-lg font-semibold shadow-lg"
                  onClick={() => requestAmbulanceMutation.mutate()}
                  disabled={requestAmbulanceMutation.isLoading || !phone || !location}
                >
                  {requestAmbulanceMutation.isLoading ? 'Requesting…' : '🚑 Request Ambulance'}
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            {/* Emergency Contacts */}
            <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <FaPhone className="text-blue-400 text-xl" />
                <h3 className="text-lg font-semibold">Emergency Contacts</h3>
              </div>
              {loadingContacts ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-3">
                  {Object.values(contacts || {}).map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-white/10 border border-white/20">
                      <div className="font-medium text-white">{c.name}</div>
                      <div className="text-sm text-gray-200">{c.description}</div>
                      <div className="text-sm text-blue-300 mt-1">{c.phone}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Response Guidelines */}
            <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Response Guidelines</h3>
              {loadingGuidelines ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4 text-sm text-gray-100">
                  {Object.values(guidelines || {}).map((g) => (
                    <div key={g.title}>
                      <div className="font-medium mb-1">{g.title}</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {g.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
