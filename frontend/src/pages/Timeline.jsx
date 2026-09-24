import React, { useEffect, useState } from 'react';
import { Clock, Filter, Calendar, FileText, Phone, Car, DollarSign, Eye, MapPin } from 'lucide-react';
import { timelineService } from '../services/api';
import { useCase } from '../context/CaseContext';
import { useNavigate } from 'react-router-dom';

export default function Timeline({ embeddedCaseId }) {
  const { activeCaseId } = useCase();
  const caseId = embeddedCaseId || activeCaseId || 'CASE-2026-001';
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTimeline = () => {
    setLoading(true);
    const params = {};
    if (selectedType !== 'ALL') params.event_type = selectedType;
    if (entityFilter.trim()) params.entity_id = entityFilter.trim().toUpperCase();

    timelineService.getTimeline(caseId, params)
      .then(res => setEvents(res.data))
      .catch(err => console.error('Timeline fetch failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTimeline();
  }, [caseId, selectedType]);

  const getEventIcon = (type) => {
    switch (type) {
      case 'FIR_FILING': return { icon: FileText, color: 'text-rose-400', bg: 'bg-rose-500/20' };
      case 'COMMUNICATION_BURST': return { icon: Phone, color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
      case 'VEHICLE_TRANSIT': return { icon: Car, color: 'text-amber-400', bg: 'bg-amber-500/20' };
      case 'FINANCIAL_DISBURSEMENT': return { icon: DollarSign, color: 'text-teal-400', bg: 'bg-teal-500/20' };
      case 'SURVEILLANCE_SIGHTING': return { icon: Eye, color: 'text-sky-400', bg: 'bg-sky-500/20' };
      default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-800' };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Top Header if not embedded */}
      {!embeddedCaseId && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Clock className="w-6 h-6 text-sky-400" />
              <span>Chronological Timeline Analysis</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Time-series progression of FIR registrations, telecom surges, and field sightings.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-300 font-medium">Filter Category:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Event Types</option>
            <option value="FIR_FILING">FIR Filings</option>
            <option value="COMMUNICATION_BURST">Communication Bursts</option>
            <option value="VEHICLE_TRANSIT">Vehicle Transits</option>
            <option value="FINANCIAL_DISBURSEMENT">Financial Disbursements</option>
            <option value="SURVEILLANCE_SIGHTING">Surveillance Sightings</option>
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchTimeline(); }} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter Entity (e.g. P001)..."
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading chronological timeline stream...
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {events.map((evt, idx) => {
            const { icon: Icon, color, bg } = getEventIcon(evt.event_type);
            return (
              <div key={evt.id || idx} className="relative group">
                {/* Timeline Node Dot */}
                <div className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full ${bg} border border-slate-700 flex items-center justify-center shrink-0 z-10 shadow`}>
                  <Icon className={`w-3.5 h-3.5 ${color}`} />
                </div>

                {/* Event Card */}
                <div className="bg-[#111827] border border-slate-800 group-hover:border-sky-600/60 rounded-xl p-4 transition shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-mono text-sky-400 font-bold text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {evt.timestamp}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 w-fit">
                      {evt.event_type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-1.5">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                    <div className="flex items-center space-x-3">
                      {evt.primary_entity_id && (
                        <button
                          onClick={() => navigate(`/entities/${evt.primary_entity_id}`)}
                          className="font-mono text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Subject: {evt.primary_entity_id} ({evt.primary_entity_name || ''})
                        </button>
                      )}
                      {evt.location_name && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          {evt.location_name}
                        </span>
                      )}
                    </div>

                    <span className="font-mono text-[10px] text-slate-500">
                      Record: {evt.id}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
