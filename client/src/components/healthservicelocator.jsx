import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🧭 Component to recenter map when position changes
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 13);
    }
  }, [position, map]);
  return null;
};

// 🕒 Debounce helper
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// 🎨 Custom marker icons by service type
const getMarkerIcon = (type, isEmergency) => {
  const colors = {
    hospital: '#dc2626',     // red
    clinic: '#2563eb',       // blue
    pharmacy: '#16a34a',     // green
    emergency: '#dc2626',    // red
    mental_health: '#9333ea',// purple
    specialist: '#ea580c'    // orange
  };

  const color = isEmergency ? '#dc2626' : (colors[type] || '#6b7280');
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          margin-top: 3px;
          color: white;
          font-size: 14px;
          text-align: center;
        ">
          ${isEmergency ? '🚑' : type === 'pharmacy' ? '💊' : type === 'hospital' ? '🏥' : '⚕️'}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const HealthServiceLocator = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPosition, setSelectedPosition] = useState([-1.4520, 36.9550]); // Kitengela center
  const [userLocation, setUserLocation] = useState(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [open24Hours, setOpen24Hours] = useState(false);

  // Fetch services from backend
  const fetchHealthServices = useCallback(
    async (customParams = {}) => {
      setLoading(true);
      setError("");
      
      try {
        const params = {
          lat: selectedPosition[0],
          lng: selectedPosition[1],
          radius: radiusKm,
          search,
          type,
          emergency: emergencyOnly || undefined,
          is24Hours: open24Hours || undefined,
          ...customParams,
        };

        // Remove undefined values
        Object.keys(params).forEach(key => 
          params[key] === undefined && delete params[key]
        );

        const response = await axios.get(`${API_BASE_URL}/api/health-services`, { params });
        const data = response.data?.services || [];
        setServices(data);
        
        if (data.length === 0) {
          setError("No health services found matching your criteria. Try increasing the search radius.");
        }
      } catch (err) {
        console.error("❌ Error fetching health services:", err);
        setError(
          err.response?.data?.message || 
          "Error loading services. Please check if the server is running."
        );
      } finally {
        setLoading(false);
      }
    },
    [search, type, selectedPosition, radiusKm, emergencyOnly, open24Hours]
  );

  // Debounced fetch
  const debouncedFetch = useCallback(
    debounce(fetchHealthServices, 500),
    [fetchHealthServices]
  );

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setSelectedPosition(coords);
          setUserLocation(coords);
        },
        (err) => {
          console.warn("⚠️ Geolocation denied, using default Kitengela location");
        }
      );
    }
  }, []);

  // Fetch when filters change
  useEffect(() => {
    debouncedFetch();
  }, [search, type, selectedPosition, radiusKm, emergencyOnly, open24Hours]);

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setSelectedPosition(coords);
        setUserLocation(coords);
        fetchHealthServices({ lat: coords[0], lng: coords[1] });
      },
      (err) => {
        console.error("⚠️ Unable to retrieve location:", err);
        alert("Unable to retrieve your location. Please enable GPS and try again.");
        setLoading(false);
      }
    );
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setType("");
    setRadiusKm(10);
    setEmergencyOnly(false);
    setOpen24Hours(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Health Service Locator
          </h1>
          <p className="text-gray-600">
            Find nearby clinics, pharmacies, and hospitals in Kitengela
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by name or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Service Type Filter */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Service Types</option>
              <option value="hospital">🏥 Hospital</option>
              <option value="clinic">⚕️ Clinic</option>
              <option value="pharmacy">💊 Pharmacy</option>
              <option value="emergency">🚑 Emergency</option>
              <option value="mental_health">🧠 Mental Health</option>
              <option value="specialist">👨‍⚕️ Specialist</option>
            </select>

            {/* Radius Filter */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Radius: {radiusKm} km
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Location Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 font-medium"
            >
              📍 Use My Location
            </button>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">🚑 Emergency Services Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={open24Hours}
                onChange={(e) => setOpen24Hours(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">🌙 Open 24 Hours</span>
            </label>

            <button
              onClick={handleResetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="h-[500px] w-full relative">
            {loading && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-700">Loading services...</span>
              </div>
            )}
            
            <MapContainer
              center={selectedPosition}
              zoom={13}
              className="h-full w-full"
              scrollWheelZoom={true}
            >
              <RecenterMap position={selectedPosition} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={userLocation}
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
                        animation: pulse 2s infinite;
                      "></div>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                  })}
                >
                  <Popup>📍 <strong>You are here</strong></Popup>
                </Marker>
              )}

              {/* Health Service Markers */}
              {services.map((service) => {
                const lat = service.location?.latitude || service.latitude;
                const lng = service.location?.longitude || service.longitude;
                
                if (!lat || !lng) return null;

                return (
                  <Marker
                    key={service.id}
                    position={[lat, lng]}
                    icon={getMarkerIcon(service.type, service.isEmergency)}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 capitalize">
                          {service.type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">📍 {service.address}</p>
                        {service.phone && (
                          <p className="text-xs mb-1">📞 {service.phone}</p>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-medium">
                            {service.rating || 'No rating'} 
                            {service.reviewCount ? ` (${service.reviewCount} reviews)` : ''}
                          </span>
                        </div>
                        {service.distance && (
                          <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block">
                            📏 {service.distance.toFixed(2)} km away
                          </p>
                        )}
                        {service.is24Hours && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-1">
                            24/7
                          </span>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            Found {services.length} Service{services.length !== 1 ? 's' : ''}
          </h2>

          {!loading && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {service.isVerified && (
                      <span className="text-blue-600 text-sm">✓ Verified</span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 capitalize mb-2">
                    {service.type.replace('_', ' ')}
                  </p>
                  
                  <p className="text-xs text-gray-500 mb-3">📍 {service.address}</p>
                  
                  {service.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <span className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      {service.rating || 'N/A'}
                    </span>
                    
                    {service.distance && (
                      <span className="text-blue-600">
                        📏 {service.distance.toFixed(2)} km
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {service.isEmergency && (
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        🚑 Emergency
                      </span>
                    )}
                    {service.is24Hours && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        🌙 24/7
                      </span>
                    )}
                  </div>

                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="mt-3 block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      📞 Call Now
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : !loading && (
            <p className="text-gray-600 text-center py-8">
              No services found. Try adjusting your filters or search radius.
            </p>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default HealthServiceLocator;