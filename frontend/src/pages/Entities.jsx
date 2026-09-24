import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Search, Filter, ArrowRight, Phone, Car, MapPin, Network, ExternalLink } from 'lucide-react';
import { entityService } from '../services/api';
import { useCase } from '../context/CaseContext';

export default function Entities() {
  const [entities, setEntities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { activeCaseId, setSelectedEntityId } = useCase();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('search');

  const fetchEntities = (term = '') => {
    setLoading(true);
    if (term.trim()) {
      entityService.searchEntities(term.trim(), activeCaseId)
        .then(res => setEntities(res.data))
        .catch(err => console.error('Entity search error:', err))
        .finally(() => setLoading(false));
    } else {
      entityService.getEntities({ case_id: activeCaseId, limit: 100 })
        .then(res => setEntities(res.data))
        .catch(err => console.error('Failed to load entities:', err))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    if (queryParam) {
      setSearchTerm(queryParam);
      fetchEntities(queryParam);
    } else {
      fetchEntities();
    }
  }, [activeCaseId, queryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEntities(searchTerm);
  };

  const handleOpenEntity = (id) => {
    setSelectedEntityId(id);
    navigate(`/entities/${id}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-sky-400" />
            <span>Entities & Investigated Subjects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Normalized entity profiles across telecom records, vehicle registries, and FIR logs.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID (e.g. P001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-sky-500 w-64"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition"
          >
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          Loading intelligence subjects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {entities.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenEntity(item.id)}
              className="bg-[#111827] border border-slate-800 hover:border-sky-600/60 rounded-xl p-4 cursor-pointer transition flex flex-col justify-between group shadow-sm hover:shadow-sky-500/5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {item.id}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.entity_type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                  {item.name}
                </h3>
                {item.extra_info && (
                  <p className="text-xs text-slate-400 mt-1 font-mono text-[11px]">
                    {item.extra_info}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Network className="w-3.5 h-3.5 text-sky-400" />
                    <span>{item.connections_count} links</span>
                  </span>
                  <span className="font-mono">
                    {item.cases_count} cases
                  </span>
                </div>

                <span className="text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px] font-medium">
                  <span>Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
