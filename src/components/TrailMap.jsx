import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, RefreshCw, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getLocationData } from '../lib/locationApi';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to recenter map when trail changes
const MapController = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);

    return null;
};

const TrailMap = ({ darkMode }) => {
    const [trailPoints, setTrailPoints] = useState([]);
    const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Default: Kathmandu, Nepal
    const [mapZoom, setMapZoom] = useState(13);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch location data from API
    const fetchLocationData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getLocationData();

            if (data && data.length > 0) {
                // Sort by timestamp to ensure correct order
                const sortedData = [...data].sort((a, b) =>
                    new Date(a.created_at) - new Date(b.created_at)
                );

                // Convert API data to trail points format
                const points = sortedData.map(location => ({
                    lat: parseFloat(location.latitude),
                    lng: parseFloat(location.longitude),
                    id: location.id,
                    locality: location.locality,
                    city: location.city,
                    state: location.state,
                    country: location.country,
                    timestamp: location.created_at,
                    device_id: location.device_id
                }));

                setTrailPoints(points);

                // Center map on first point
                if (points.length > 0) {
                    setMapCenter([points[0].lat, points[0].lng]);
                    setMapZoom(13);
                }
            } else {
                setTrailPoints([]);
            }
        } catch (err) {
            console.error('Error fetching location data:', err);
            setError(err.message || 'Failed to load location data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        fetchLocationData();
    }, []);

    // Calculate total distance (approximate)
    const calculateDistance = () => {
        if (trailPoints.length < 2) return 0;

        let totalDistance = 0;
        for (let i = 0; i < trailPoints.length - 1; i++) {
            const p1 = trailPoints[i];
            const p2 = trailPoints[i + 1];

            // Haversine formula for distance calculation
            const R = 6371; // Earth's radius in km
            const dLat = (p2.lat - p1.lat) * Math.PI / 180;
            const dLng = (p2.lng - p1.lng) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            totalDistance += R * c;
        }

        return totalDistance.toFixed(2);
    };

    return (
        <div className={`rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className={`text-base md:text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                            Activity Trail Map
                        </h3>
                        <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Your GPS location trail with direction
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchLocationData}
                    disabled={isLoading}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm ${isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className={`p-8 rounded-xl text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Loading location data...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className={`p-4 rounded-xl border-2 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                        <div>
                            <h4 className={`font-semibold ${darkMode ? 'text-red-200' : 'text-red-800'}`}>
                                Error Loading Data
                            </h4>
                            <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Trail Statistics */}
            {!isLoading && !error && trailPoints.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-blue-600'}`}>Total Points</div>
                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-blue-700'}`}>
                            {trailPoints.length}
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-green-50'}`}>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-green-600'}`}>Distance</div>
                        <div className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-green-700'}`}>
                            {calculateDistance()} km
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-purple-50'} col-span-2 md:col-span-1`}>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-purple-600'}`}>Last Updated</div>
                        <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-purple-700'}`}>
                            {trailPoints.length > 0
                                ? new Date(trailPoints[trailPoints.length - 1].timestamp).toLocaleString()
                                : 'N/A'
                            }
                        </div>
                    </div>
                </div>
            )}

            {/* Map Container */}
            {!isLoading && !error && (
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600" style={{ height: '400px' }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                    >
                        <MapController center={mapCenter} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Draw trail line */}
                        {trailPoints.length > 1 && (
                            <Polyline
                                positions={trailPoints.map(p => [p.lat, p.lng])}
                                color="#10b981"
                                weight={4}
                                opacity={0.7}
                            />
                        )}

                        {/* Add directional arrow markers between consecutive points */}
                        {trailPoints.length > 1 && trailPoints.map((point, index) => {
                            if (index === trailPoints.length - 1) return null;

                            const nextPoint = trailPoints[index + 1];
                            const midLat = (point.lat + nextPoint.lat) / 2;
                            const midLng = (point.lng + nextPoint.lng) / 2;

                            // Calculate angle for arrow rotation
                            const angle = Math.atan2(
                                nextPoint.lat - point.lat,
                                nextPoint.lng - point.lng
                            ) * (180 / Math.PI);

                            return (
                                <Marker
                                    key={`arrow-${index}`}
                                    position={[midLat, midLng]}
                                    icon={L.divIcon({
                                        className: 'arrow-icon',
                                        html: `
                      <div style="
                        transform: rotate(${angle + 90}deg);
                        width: 0;
                        height: 0;
                        border-left: 8px solid transparent;
                        border-right: 8px solid transparent;
                        border-bottom: 16px solid #10b981;
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                      "></div>
                    `,
                                        iconSize: [16, 16],
                                        iconAnchor: [8, 8]
                                    })}
                                />
                            );
                        })}

                        {/* Add markers for each point */}
                        {trailPoints.map((point, index) => (
                            <Marker key={point.id || index} position={[point.lat, point.lng]}>
                                <Popup>
                                    <div className="text-sm">
                                        <strong>Point {index + 1}</strong><br />
                                        <strong>Location:</strong> {point.locality || 'Unknown'}<br />
                                        <strong>City:</strong> {point.city || 'Unknown'}<br />
                                        <strong>State:</strong> {point.state || 'Unknown'}<br />
                                        <strong>Country:</strong> {point.country || 'Unknown'}<br />
                                        <strong>Coordinates:</strong><br />
                                        Lat: {point.lat.toFixed(6)}<br />
                                        Lng: {point.lng.toFixed(6)}<br />
                                        <strong>Time:</strong> {new Date(point.timestamp).toLocaleString()}<br />
                                        {point.device_id && (
                                            <>
                                                <strong>Device:</strong> {point.device_id}
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && trailPoints.length === 0 && (
                <div className={`mt-4 p-8 rounded-lg border-2 border-dashed text-center ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'
                    }`}>
                    <MapPin className={`w-12 h-12 mx-auto mb-3 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No location data available yet. Your GPS trail will appear here once location data is recorded.
                    </p>
                </div>
            )}

            {/* Trail Points List */}
            {!isLoading && !error && trailPoints.length > 0 && (
                <div className="mt-4">
                    <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Trail Points ({trailPoints.length})
                    </h4>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                        {trailPoints.map((point, index) => (
                            <div
                                key={point.id || index}
                                className={`flex items-center justify-between p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'
                                    }`}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-xs block ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            <strong>Point {index + 1}:</strong> {point.locality || point.city || 'Unknown'}
                                        </span>
                                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                                        </span>
                                    </div>
                                </div>
                                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {new Date(point.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrailMap;
