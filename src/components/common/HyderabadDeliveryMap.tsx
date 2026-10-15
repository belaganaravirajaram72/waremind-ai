import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { Truck, MapPin, Navigation, Clock, CheckCircle2, ShieldCheck, Zap, X } from 'lucide-react';

interface HyderabadDeliveryMapProps {
  onClose?: () => void;
}

export const HyderabadDeliveryMap: React.FC<HyderabadDeliveryMapProps> = ({ onClose }) => {
  const { state } = useWarehouse();
  const { shipments, simClock } = state;

  const activeShipment = Object.values(shipments).find((s) => s.status === 'IN_TRANSIT') || Object.values(shipments)[0];

  const [progress, setProgress] = useState<number>(35);

  useEffect(() => {
    // Advance transit progress smoothly
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkpoints = [
    { name: 'HYDERABAD FC LOGISTICS HUB', dist: '0.0 km', eta: 'Departed', done: true },
    { name: 'Shamshabad Outer Ring Road (ORR)', dist: '4.2 km', eta: 'Cleared', done: progress >= 25 },
    { name: 'Gachibowli Financial District Junction', dist: '12.8 km', eta: 'En Route', done: progress >= 65 },
    { name: 'Hitec City Mindspace Hub (Client)', dist: '18.4 km', eta: `${Math.max(1, Math.round((100 - progress) * 0.3))} mins`, done: progress >= 100 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-blue-500/40 shadow-2xl space-y-4 max-w-lg w-full bg-[#0A0F1E]/95 backdrop-blur-xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-wide">
              HYDERABAD LAST-MILE EV ROUTE RADAR
            </h4>
            <span className="text-[10px] font-mono text-slate-400">
              VEHICLE: {activeShipment?.vehiclePlate || 'TS-09-EV-8421'} • {activeShipment?.vehicleType || 'EV_VAN'}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Live Route Telemetry Header */}
      <div className="grid grid-cols-3 gap-2 bg-[#070B14] p-3 rounded-xl border border-white/5 text-xs font-mono">
        <div>
          <span className="text-slate-500 text-[10px] block">DESTINATION</span>
          <span className="text-cyan-400 font-bold truncate block">{activeShipment?.destination || 'Hitec City, HYD'}</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">REMAINING</span>
          <span className="text-emerald-400 font-bold">{Math.max(0, Math.round((100 - progress) * 0.184 * 10) / 10)} km</span>
        </div>
        <div>
          <span className="text-slate-500 text-[10px] block">ESTIMATED ETA</span>
          <span className="text-amber-400 font-bold">{Math.max(1, Math.round((100 - progress) * 0.32))} mins</span>
        </div>
      </div>

      {/* Visual Hyderabad Route Map Diagram */}
      <div className="relative py-4 px-3 bg-[#070B14] rounded-xl border border-white/5">
        <div className="space-y-6 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-cyan-400 before:to-emerald-400">
          {checkpoints.map((cp, idx) => (
            <div key={idx} className="flex items-center space-x-4 relative z-10">
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                  cp.done
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-[#0A0F1E] border-slate-700 text-slate-500'
                }`}
              >
                {cp.done ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${cp.done ? 'text-white' : 'text-slate-400'}`}>
                    {cp.name}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold">{cp.eta}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{cp.dist}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Animated Van Marker on Route */}
        <div
          className="absolute left-3.5 -translate-x-1/2 transition-all duration-1000 z-20"
          style={{ top: `${15 + progress * 0.7}%` }}
        >
          <div className="p-1 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/50 animate-bounce">
            <Truck className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Eco Badge */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Zap className="w-3.5 h-3.5" />
          <span>Zero Emission Electric Fleet</span>
        </div>
        <span className="text-emerald-300 font-bold">0.22 kg CO₂ Saved</span>
      </div>
    </div>
  );
};
