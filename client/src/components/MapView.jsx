import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerImage from '../assets/hero.jpg';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../context/GroupContext';
import { useNavigate } from 'react-router-dom';
import MemberList from './MemberList';
const deviceIcon = new L.Icon({
  iconUrl: markerImage,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'device-marker-icon',
});
function MapView() {
  const { token } = useAuth();
  const { groups, activeGroupId } = useGroups();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const socketReadyRef = useRef(false);
  const [devices, setDevices] = useState({});
  const [deviceOwners, setDeviceOwners] = useState({});
  const [liveDeviceIds, setLiveDeviceIds] = useState(new Set());
  const [currentPosition, setCurrentPosition] = useState(null);
  const activeGroup = groups.find((g) => g._id === activeGroupId);
  useEffect(() => {
    if (!activeGroupId) {
      navigate('/groups');
      return;
    }
    async function setupConnection() {
      const res = await fetch('/api/devices/ensure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: activeGroupId }),
      });
      if (!res.ok) {
        console.error('Failed to ensure device:', await res.text());
        return;
      }
      const device = await res.json();
      console.log('Using device:', device._id);
      try {
        const groupDevicesRes = await fetch(`/api/devices/group/${activeGroupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (groupDevicesRes.ok) {
          const groupDevices = await groupDevicesRes.json();
          const initialDevices = {};
          const ownerMap = {};
          groupDevices.forEach((d) => {
            ownerMap[d._id] = d.owner;
            if (d._id === device._id) return;
            if (d.lastLocation?.lat != null && d.lastLocation?.lng != null) {
              initialDevices[d._id] = {
                lat: d.lastLocation.lat,
                lng: d.lastLocation.lng,
                name: d.name,
              };
            }
          });
          setDevices(initialDevices);
          setDeviceOwners(ownerMap);
        }
      } catch (err) {
        console.error('Failed to fetch group devices:', err);
      }

      socketRef.current = io('http://localhost:3000', {
        query: { groupId: activeGroupId, deviceId: device._id },
      });
      socketRef.current.on('connect', () => {
        socketReadyRef.current = true;
        console.log('Socket connected:', socketRef.current.id);
        setLiveDeviceIds((prev) => new Set(prev).add(device._id));
        setDeviceOwners((prev) => ({ ...prev, [device._id]: device.owner }));
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
        setLiveDeviceIds((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
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
        setLiveDeviceIds((prev) => new Set(prev).add(data.id));
      });
    }
    if (token) {
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
  }, [token, activeGroupId]);
  const mapCenter = currentPosition ? [currentPosition.lat, currentPosition.lng] : [28.6139, 77.2090];
  const onlineMemberIds = new Set(
    [...liveDeviceIds]
      .map((deviceId) => deviceOwners[deviceId])
      .filter(Boolean)
  );
  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <MemberList group={activeGroup} onlineDeviceIds={onlineMemberIds} />
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
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
    </div>
  );
}

export default MapView;