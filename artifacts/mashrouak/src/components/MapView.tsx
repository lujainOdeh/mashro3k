import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icon = (tone: string) => L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:${tone};border:3px solid white;box-shadow:0 2px 8px #172b4d66"></div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
const markerIcon = icon('#16a085');
const courierIcon = icon('#172b4d');
const pickupIcon = icon('#f4b860');

function ClickSelect({ onChange }: { onChange?: (point: { lat: number; lng: number }) => void }) {
  const map = useMapEvents({ click(event) { onChange?.({ lat: event.latlng.lat, lng: event.latlng.lng }); } });
  useEffect(() => { map.invalidateSize(); }, [map]);
  return null;
}

export type MapPoint = { lat: number; lng: number; label?: string; kind?: 'pickup' | 'courier' | 'dropoff' };
export function MapView({ center = { lat: 31.9539, lng: 35.9106 }, points = [], selected, onSelect, height = 320 }: { center?: { lat: number; lng: number }; points?: MapPoint[]; selected?: MapPoint; onSelect?: (point: MapPoint) => void; height?: number }) {
  return (
    <div style={{ height, position: 'relative' }}>
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%', borderRadius: 14 }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ClickSelect onChange={onSelect ? (point) => onSelect({ ...point, label: 'الموقع المحدد' }) : undefined} />
        <Circle center={[center.lat, center.lng]} radius={420} pathOptions={{ color: '#16a085', fillColor: '#16a085', fillOpacity: 0.06, weight: 1 }} />
        {points.map((point, index) => <Marker key={`${point.kind ?? 'point'}-${index}`} position={[point.lat, point.lng]} icon={point.kind === 'pickup' ? pickupIcon : point.kind === 'courier' ? courierIcon : markerIcon}><Popup>{point.label ?? 'موقع توصيل تجريبي'}<br />موقع توضيحي تقريبي</Popup></Marker>)}
        {selected && <Marker position={[selected.lat, selected.lng]} icon={markerIcon} draggable eventHandlers={{ dragend(event) { const point = event.target.getLatLng(); onSelect?.({ lat: point.lat, lng: point.lng, label: 'الموقع المحدد' }); } }}><Popup>اسحب العلامة أو انقر على الخريطة لتحديد العنوان</Popup></Marker>}
      </MapContainer>
      <span style={{ position: 'absolute', zIndex: 401, insetInlineStart: 10, bottom: 10, background: 'white', borderRadius: 8, padding: '6px 9px', fontSize: 11, color: '#64748b' }}>خريطة OpenStreetMap · مواقع تجريبية</span>
    </div>
  );
}
