import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerImage from '../assets/hero.jpg';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
const GROUP_ID = "6a4a94509fde067ea31f1405";
const deviceIcon = new L.Icon({
  iconUrl: markerImage,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'device-marker-icon',
});

function MapView() {
  const {token} = useAuth();
  const socketRef = useRef(null);
  const socketReadyRef = useRef(false);
  const [devices, setDevices] = useState({});
  const [currentPosition, setCurrentPosition] = useState(null);
  useEffect(() => {
    async function setupConnection() {
      const res = await fetch('/api/devices/ensure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({groupId: GROUP_ID}),
      });
      if (!res.ok) {
        console.error('Failed to ensure device:', await res.text());
        return;
      }
      const device = await res.json();
      console.log('Using device:', device._id);
      socketRef.current = io('http://localhost:3000', {
        query: { groupId: GROUP_ID, deviceId: device._id },
      });
      socketRef.current.on('connect', () => {
        socketReadyRef.current = true;
        console.log('Socket connected:', socketRef.current.id);
      });
      socketRef.current.on('disconnect', () => {
        socketReadyRef.current = false;
      });
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });
      socketRef.current.on('user-disconnected', (id) => {
        setDevices((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      });
      socketRef.current.on('receive-location', (data) => {
        if (data?.latitude == null || data?.longitude == null) return;
        setDevices((prev) => ({
          ...prev,
          [data.id]: {
            lat: data.latitude,
            lng: data.longitude,
            name: data.name || "Manvendra's lappy",
          },
        }));
      });
    }
    if(token) {
      setupConnection();
    }
    let watcherId;
    if (navigator.geolocation) {
      watcherId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          if (socketReadyRef.current && socketRef.current?.connected) {
            socketRef.current.emit('send-location', { latitude, longitude });
          }
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      socketRef.current?.disconnect();
      if (watcherId) navigator.geolocation.clearWatch(watcherId);
    };
  }, [token]);
  const mapCenter = currentPosition ? [currentPosition.lat, currentPosition.lng] : [28.6139, 77.2090];
  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {currentPosition && (
        <Marker position={[currentPosition.lat, currentPosition.lng]}>
          <Popup>Your location</Popup>
        </Marker>
      )}
      {Object.entries(devices).map(([id, pos]) => (
        <Marker key={id} position={[pos.lat, pos.lng]} icon={deviceIcon}>
          <Popup>{pos.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
export default MapView;