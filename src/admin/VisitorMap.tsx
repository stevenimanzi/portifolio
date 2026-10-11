import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { countryName, type VisitDoc } from './analyticsData';
import { countryCentroids } from './countryCentroids';

interface Spot {
  lat: number;
  lng: number;
  label: string;
  count: number;
  approx: boolean;
}

/** Groups visits into map spots: exact city coordinates when known, otherwise the country centre. */
function toSpots(visits: VisitDoc[]): Spot[] {
  const spots = new Map<string, Spot>();
  visits.forEach(v => {
    let lat: number | undefined;
    let lng: number | undefined;
    let approx = false;
    let label = '';

    if (typeof v.lat === 'number' && typeof v.lng === 'number') {
      lat = v.lat;
      lng = v.lng;
      label = [v.city, v.country ? countryName(v.country) : ''].filter(Boolean).join(', ') || 'Unknown place';
    } else if (v.country && countryCentroids[v.country]) {
      [lat, lng] = countryCentroids[v.country];
      approx = true;
      label = countryName(v.country);
    }
    if (lat === undefined || lng === undefined) return;

    const key = approx ? `c:${v.country}` : `${lat.toFixed(1)},${lng.toFixed(1)}`;
    const existing = spots.get(key);
    if (existing) existing.count += 1;
    else spots.set(key, { lat, lng, label, count: 1, approx });
  });
  return [...spots.values()];
}

/** World map of where visitors are, one glowing dot per place (size = number of visits). */
export default function VisitorMap({ visits, height = 380 }: { visits: VisitDoc[]; height?: number }) {
  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const spots = useMemo(() => toSpots(visits), [visits]);

  useEffect(() => {
    if (!holder.current) return;
    const map = L.map(holder.current, { worldCopyJump: true, scrollWheelZoom: false, minZoom: 1, maxZoom: 12 }).setView([12, 20], 2);
    // OpenStreetMap needs no API key for light use with attribution; the CSS in admin.css darkens it.
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 12
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    spots.forEach(spot => {
      const marker = L.circleMarker([spot.lat, spot.lng], {
        radius: Math.min(26, 7 + Math.sqrt(spot.count) * 4),
        color: '#3b82f6',
        weight: 1.5,
        fillColor: '#3b82f6',
        fillOpacity: 0.35
      });
      const popup = document.createElement('div');
      popup.textContent = `${spot.label}: ${spot.count} visit${spot.count === 1 ? '' : 's'}${spot.approx ? ' (approximate)' : ''}`;
      marker.bindPopup(popup);
      marker.addTo(layer);
    });

    if (spots.length > 0) {
      map.fitBounds(L.latLngBounds(spots.map(s => [s.lat, s.lng] as [number, number])), { padding: [50, 50], maxZoom: 5 });
    }
  }, [spots]);

  return (
    <div className="adm-map-wrap" style={{ height }}>
      <div ref={holder} className="adm-map" role="img" aria-label="Map of visitor locations"></div>
      {spots.length === 0 && <div className="adm-map-empty">Visitor locations will appear here as people visit your website.</div>}
    </div>
  );
}
