import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useQuery } from 'react-query';
import axios from 'axios';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaClock, 
  FaStar, 
  FaFilter, 
  FaSearch,
  FaHospital,
  FaPills,
  FaAmbulance,
  FaHeart,
  FaUserMd,
  FaLocationArrow
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when location changes
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
};

// Custom marker icons by service type
const createCustomIcon = (type, isEmergency) => {
  const colors = {
    hospital: '#dc2626',
    clinic: '#2563eb',
    pharmacy: '#16a34a',
    emergency: '#dc2626',
    mental_health: '#9333ea',
    specialist: '#ea580c'
  };

  const emoji = {
    hospital: '🏥',
    clinic: '⚕️',
    pharmacy: '💊',
    emergency: '🚑',
    mental_health: '🧠',
    specialist: '👨‍⚕️'
  };

  const color = isEmergency ? '#dc2626' : (colors[type] || '#6b7280');
  const icon = emoji[type] || '⚕️';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 16px;
        ">
          ${icon}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const HealthServices = () => {
  const [filters, setFilters] = useState({
    type: '',
    emergency: '',
    is24Hours: '',
    search: '',
    radius: 15
  });
  const [selectedService, setSelectedService] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          setLocationError('');
        },
        (error) => {
          console.warn('Location access denied, using Kitengela center');
          // Default to Kitengela coordinates
          setUserLocation({
            lat: -1.4520,
            lng: 36.9550
          });
          setLocationError('Using default location (Kitengela)');
        }
      );
    } else {
      setUserLocation({
        lat: -1.4520,
        lng: 36.9550
      });
      setLocationError('Geolocation not supported');
    }
  }, []);

  // Fetch health services with all filters
  const { data: servicesData, isLoading, error, refetch } = useQuery(
    ['health-services', filters, userLocation],
    async () => {
      const params = {
        ...filters,
        lat: userLocation?.lat,
        lng: userLocation?.lng
      };
      
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      console.log('🔍 Fetching with params:', params);
      
      const response = await axios.get('http://localhost:5000/api/health-services', { params });
      console.log('📦 Received data:', response.data);
      
      return response.data;
    },
    {
      enabled: !!userLocation,
      retry: 1,
      onError: (err) => {
        console.error('❌ Error fetching services:', err);
      }
    }
  );

  const services = servicesData?.services || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      emergency: '',
      is24Hours: '',
      search: '',
      radius: 15
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(coords);
        setLocationError('');
        refetch();
      },
      (error) => {
        console.error('Location error:', error);
        alert("Unable to get your location. Please enable GPS and try again.");
      }
    );
  };

  const getServiceIcon = (type) => {
    const iconMap = {
      clinic: FaHospital,
      pharmacy: FaPills,
      hospital: FaHospital,
      emergency: FaAmbulance,
      mental_health: FaHeart,
      specialist: FaUserMd
    };
    return iconMap[type] || FaMapMarkerAlt;
  };

  const getServiceColor = (type) => {
    const colorMap = {
      clinic: 'text-blue-400',
      pharmacy: 'text-green-400',
      hospital: 'text-red-400',
      emergency: 'text-red-500',
      mental_health: 'text-purple-400',
      specialist: 'text-orange-400'
    };
    return colorMap[type] || 'text-gray-400';
  };

  const formatOperatingHours = (hours) => {
    if (!hours) return 'Hours not available';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return hours[today] || 'Hours not available';
  };

  // Extract coordinates from service (handles both location object and direct lat/lng)
  const getServiceCoords = (service) => {
    if (service.location?.latitude && service.location?.longitude) {
      return {
        lat: service.location.latitude,
        lng: service.location.longitude
      };
    }
    if (service.latitude && service.longitude) {
      return {
        lat: service.latitude,
        lng: service.longitude
      };
    }
    return null;
  };

  if (isLoading && !userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Services</h2>
          <p className="text-red-300 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🏥 Health Services Locator
          </h1>
          <p className="text-blue-100">
            Find nearby clinics, pharmacies, and emergency services in Kitengela
          </p>
          {locationError && (
            <p className="text-yellow-300 text-sm mt-2">📍 {locationError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg sticky top-4">
              <div className="border-b border-white/20 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <FaFilter className="mr-2 text-blue-300" />
                  Filters
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 pl-10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Search services..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>
                </div>

                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Service Type
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="clinic">⚕️ Clinic</option>
                    <option value="pharmacy">💊 Pharmacy</option>
                    <option value="hospital">🏥 Hospital</option>
                    <option value="emergency">🚑 Emergency</option>
                    <option value="mental_health">🧠 Mental Health</option>
                    <option value="specialist">👨‍⚕️ Specialist</option>
                  </select>
                </div>

                {/* Radius */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Search Radius: {filters.radius} km
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    value={filters.radius}
                    onChange={(e) => handleFilterChange('radius', e.target.value)}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-xs text-blue-300 mt-1">
                    <span>1 km</span>
                    <span>25 km</span>
                  </div>
                </div>

                {/* Emergency Services */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Emergency Services
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.emergency}
                    onChange={(e) => handleFilterChange('emergency', e.target.value)}
                  >
                    <option value="">All Services</option>
                    <option value="true">Emergency Only</option>
                    <option value="false">Non-Emergency</option>
                  </select>
                </div>

                {/* 24 Hours */}
                <div>
                  <label className="block text-sm font-medium text-blue-100 mb-2">
                    Operating Hours
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filters.is24Hours}
                    onChange={(e) => handleFilterChange('is24Hours', e.target.value)}
                  >
                    <option value="">All Hours</option>
                    <option value="true">24 Hours</option>
                    <option value="false">Regular Hours</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 space-y-2">
                  <button
                    onClick={handleUseMyLocation}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center"
                  >
                    <FaLocationArrow className="mr-2" />
                    Use My Location
                  </button>
                  
                  <button
                    onClick={handleResetFilters}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Results Count */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-blue-100 text-sm text-center">
                    Found <span className="font-bold text-white">{services.length}</span> service{services.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map and Services List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg overflow-hidden">
              <div className="h-96">
                {userLocation && (
                  <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={13}
                    className="h-full w-full"
                  >
                    <RecenterMap position={[userLocation.lat, userLocation.lng]} />
                    
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    
                    {/* User location marker */}
                    <Marker
                      position={[userLocation.lat, userLocation.lng]}
                      icon={L.divIcon({
                        className: 'user-location-marker',
                        html: `
                          <div style="
                            background-color: #3b82f6;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                          "></div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    >
                      <Popup>
                        <strong>📍 You are here</strong>
                      </Popup>
                    </Marker>

                    {/* Service markers */}
                    {services.map((service) => {
                      const coords = getServiceCoords(service);
                      if (!coords) return null;

                      return (
                        <Marker
                          key={service.id}
                          position={[coords.lat, coords.lng]}
                          icon={createCustomIcon(service.type, service.isEmergency)}
                          eventHandlers={{
                            click: () => setSelectedService(service)
                          }}
                        >
                          <Popup>
                            <div className="p-2 min-w-[200px]">
                              <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                              <p className="text-sm text-gray-600 capitalize mb-2">
                                {service.type.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-gray-500 mb-2">📍 {service.address}</p>
                              {service.phone && (
                                <p className="text-xs mb-1">📞 {service.phone}</p>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-yellow-500">⭐</span>
                                <span className="text-sm font-medium">
                                  {service.rating || 'N/A'}
                                  {service.reviewCount ? ` (${service.reviewCount})` : ''}
                                </span>
                              </div>
                              {service.distance && (
                                <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                                  📏 {service.distance.toFixed(2)} km away
                                </p>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                )}
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-blue-100 mt-4">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
                  <FaMapMarkerAlt className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Services Found</h3>
                  <p className="text-blue-100 mb-4">
                    Try adjusting your filters or increasing the search radius.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                services.map((service) => {
                  const Icon = getServiceIcon(service.type);
                  const iconColor = getServiceColor(service.type);
                  
                  return (
                    <div
                      key={service.id}
                      className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg cursor-pointer transition-all duration-200 hover:bg-white/15 hover:scale-[1.02] ${
                        selectedService?.id === service.id ? 'ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-2 flex-wrap gap-2">
                              <Icon className={`w-5 h-5 ${iconColor}`} />
                              <h3 className="text-lg font-semibold text-white">
                                {service.name}
                              </h3>
                              {service.isEmergency && (
                                <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs font-medium rounded border border-red-500/30">
                                  🚑 Emergency
                                </span>
                              )}
                              {service.is24Hours && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded border border-green-500/30">
                                  🌙 24/7
                                </span>
                              )}
                              {service.isVerified && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded border border-blue-500/30">
                                  ✓ Verified
                                </span>
                              )}
                            </div>
                            
                            {service.description && (
                              <p className="text-blue-100 text-sm mb-2">{service.description}</p>
                            )}
                            
                            <p className="text-blue-200 text-sm mb-3">📍 {service.address}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                              {service.phone && (
                                <div className="flex items-center">
                                  <FaPhone className="w-4 h-4 mr-1" />
                                  <a href={`tel:${service.phone}`} className="hover:text-white">
                                    {service.phone}
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center">
                                <FaClock className="w-4 h-4 mr-1" />
                                <span>{formatOperatingHours(service.operatingHours)}</span>
                              </div>
                              <div className="flex items-center">
                                <FaStar className="w-4 h-4 mr-1 text-yellow-400" />
                                <span>
                                  {service.rating || 'N/A'}
                                  {service.reviewCount ? ` (${service.reviewCount})` : ''}
                                </span>
                              </div>
                              {service.distance && (
                                <div className="flex items-center text-blue-300 font-medium">
                                  <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                                  <span>{service.distance.toFixed(2)} km away</span>
                                </div>
                              )}
                            </div>

                            {/* Services Offered */}
                            {service.services && service.services.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-blue-300 mb-1">Services offered:</p>
                                <div className="flex flex-wrap gap-2">
                                  {service.services.slice(0, 4).map((svc, idx) => (
                                    <span
                                      key={idx}
                                      className="text-xs bg-white/10 text-blue-100 px-2 py-1 rounded"
                                    >
                                      {svc}
                                    </span>
                                  ))}
                                  {service.services.length > 4 && (
                                    <span className="text-xs text-blue-300">
                                      +{service.services.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthServices;