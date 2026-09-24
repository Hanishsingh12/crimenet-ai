import React from 'react';
import { User, Phone, Car, MapPin, Building2, Folder, CreditCard, Calendar } from 'lucide-react';

export const NODE_COLORS = {
  Person: { bg: '#3b82f6', text: 'text-blue-400', label: 'Person', icon: User },
  Phone: { bg: '#10b981', text: 'text-emerald-400', label: 'Phone', icon: Phone },
  Vehicle: { bg: '#f59e0b', text: 'text-amber-400', label: 'Vehicle', icon: Car },
  Location: { bg: '#ef4444', text: 'text-rose-400', label: 'Location', icon: MapPin },
  Organization: { bg: '#8b5cf6', text: 'text-purple-400', label: 'Organization', icon: Building2 },
  Case: { bg: '#f97316', text: 'text-orange-400', label: 'Case', icon: Folder },
  BankAccount: { bg: '#14b8a6', text: 'text-teal-400', label: 'Bank Account', icon: CreditCard },
  Event: { bg: '#ec4899', text: 'text-pink-400', label: 'Event', icon: Calendar },
};

export default function CentralityLegend({ className = '' }) {
  return (
    <div className={`bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-3 ${className}`}>
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
        Semantic Node Legend
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {Object.entries(NODE_COLORS).map(([type, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={type} className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: cfg.bg }}
              />
              <span className="text-slate-300 flex items-center gap-1">
                <Icon className={`w-3 h-3 ${cfg.text}`} />
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
