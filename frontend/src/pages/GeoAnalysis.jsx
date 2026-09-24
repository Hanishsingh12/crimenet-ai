import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, ShieldCheck, ExternalLink, Filter } from 'lucide-react';
import { mapService } from '../services/api';
import { useCase } from '../context/CaseContext';
import { useNavigate } from 'react-router-dom';

// Fix default leaflet marker icon in React bundlers
const customMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #0284c7; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px #38bdf8;"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

export default function GeoAnalysis({ embeddedCaseId }) {
  const { activeCaseId } = useCase();
  const caseId = embeddedCaseId || activeCaseId || 'CASE-2026-001';
  const [locations, setLocations] = useState([]);
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    mapService.getLocations(caseId)
      .then(res => setLocations(res.data))
      .catch(err => console.error('Map locations error:', err))
      .finally(() => setLoading(false));
  }, [caseId]);

  const filteredLocations = locations.filter(l => {
    return typeFilter === 'ALL' || l.location_type.toLowerCase().includes(typeFilter.toLowerCase());
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header Bar */}
      {!embeddedCaseId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 text-rose-500" />
              <span>Geospatial Intelligence & Movement Analysis</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Synthetic checkpoints, logistics yards, and cross-state transit corridors.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Facility Types</option>
              <option value="Warehouse">Warehouses & Depots</option>
              <option value="Port">Cargo & Maritime Ports</option>
              <option value="Commercial">Commercial Offices</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Map + Side List Container */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Leaflet Map */}
        <div className="flex-1 h-full min-h-[380px] rounded-xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
          <MapContainer
            center={[28.6139, 77.2090]} // Centered on Delhi NCR
            zoom={8}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredLocations.map(loc => (
              <Marker
                key={loc.id}
                position={[loc.latitude, loc.longitude]}
                icon={customMarkerIcon}
                eventHandlers={{
                  click: () => setSelectedLoc(loc),
                }}
              >
                <Popup>
                  <div className="text-slate-900 text-xs p-1 font-sans">
                    <span className="font-bold text-sky-800 block text-sm">{loc.name}</span>
                    <span className="text-slate-600 block">{loc.address}</span>
                    <span className="text-slate-500 block text-[10px] font-mono mt-1">
                      Lat: {loc.latitude.toFixed(4)}, Lon: {loc.longitude.toFixed(4)}
                    </span>
                    <span className="font-semibold text-rose-700 block mt-1">
                      Type: {loc.location_type}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Location List Panel */}
        <div className="w-full lg:w-80 bg-[#111827] border border-slate-800 rounded-xl p-4 flex flex-col shrink-0 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-200">Monitored Facilities ({filteredLocations.length})</span>
            <span className="text-[10px] font-mono text-slate-400">100% Synthetic</span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {filteredLocations.map(loc => (
              <div
                key={loc.id}
                onClick={() => setSelectedLoc(loc)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                  selectedLoc?.id === loc.id
                    ? 'bg-sky-950/40 border-sky-500 text-sky-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-sky-400 font-bold">{loc.id}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {loc.location_type}
                  </span>
                </div>
                <h4 className="font-semibold text-white">{loc.name}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{loc.address}</p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Related: {loc.related_entities?.join(', ') || 'P001'}</span>
                  <span className="text-amber-400">{loc.event_count} events</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
            <ShieldCheck className="w-3 h-3 inline mr-1 text-sky-400" />
            All coordinates represent synthetic mock nodes. No actual sensitive law enforcement coordinates exposed.
          </div>
        </div>
      </div>
    </div>
  );
}
