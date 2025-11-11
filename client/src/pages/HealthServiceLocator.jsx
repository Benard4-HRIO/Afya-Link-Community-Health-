import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// 🧭 Helper: Recenter map when position changes
const RecenterMap = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 13);
  }, [position, map]);
  return null;
};

// 🕒 Helper: Debounce to avoid excessive API calls while typing
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const HealthServiceLocator = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPosition, setSelectedPosition] = useState([-1.444, 36.958]); // Default: Kitengela
  const [userLocation, setUserLocation] = useState(null);

  // Fetch services
  const fetchHealthServices = useCallback(
    async (query = {}) => {
      setLoading(true);
      setError("");
      try {
        const params = {
          lat: selectedPosition[0],
          lng: selectedPosition[1],
          radius: 15,
          search,
          type,
          ...query,
        };

        const response = await axios.get(`${API_BASE_URL}/api/health-services`, { params });
        const data = response.data?.services || [];
        setServices(data);
      } catch (err) {
        console.error("❌ Error fetching health services:", err);
        setError("Error loading services. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [search, type, selectedPosition]
  );

  // Debounce fetch for smoother typing
  const debouncedFetch = useCallback(debounce(fetchHealthServices, 600), [fetchHealthServices]);

  // Get user's GPS location once on load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setSelectedPosition(coords);
          setUserLocation(coords);
        },
        () => {
          console.warn("⚠️ Using default Kitengela location");
        }
      );
    }
  }, []);

  // Fetch whenever filters or search change
  useEffect(() => {
    debouncedFetch();
  }, [search, type, selectedPosition]);

  // 🧭 Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

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
      }
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Health Service Locator</h1>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by name, service type, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Services</option>
          <option value="clinic">Clinic</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="emergency">Emergency</option>
          <option value="mental_health">Mental Health</option>
          <option value="specialist">Specialist</option>
        </select>

        <button
          onClick={handleUseMyLocation}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          📍 Use My Location
        </button>
      </div>

      {/* Map Section */}
      <div className="h-[400px] w-full mb-8 rounded-lg overflow-hidden shadow relative">
        <MapContainer center={selectedPosition} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <RecenterMap position={selectedPosition} />

          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation}>
              <Popup>📍 You are here</Popup>
            </Marker>
          )}

          {/* Health services markers */}
          {services.map(
            (s) =>
              s.latitude &&
              s.longitude && (
                <Marker key={s.id} position={[s.latitude, s.longitude]}>
                  <Popup>
                    <strong>{s.name}</strong>
                    <br />
                    {s.type}
                    <br />
                    📍 {s.address || "No address available"}
                    <br />
                    ⭐ {s.rating || "No rating yet"}
                  </Popup>
                </Marker>
              )
          )}
        </MapContainer>
      </div>

      {/* Results Section */}
      {loading && <p>Loading health services...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.id} className="border rounded-lg p-4 shadow hover:shadow-md">
              <h2 className="text-xl font-semibold">{s.name}</h2>
              <p className="text-gray-600">{s.type}</p>
              <p className="text-sm text-gray-500">{s.address}</p>
              <p className="text-yellow-600 font-medium">
                ⭐ {s.rating || "No rating yet"}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        !error && (
          <p className="text-gray-600">
            No Services Found. Try adjusting your filters or zooming out.
          </p>
        )
      )}
    </div>
  );
};

export default HealthServiceLocator;
