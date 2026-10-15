import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Cpu,
  Battery,
  MapPin,
  Compass,
  AlertTriangle,
  RotateCw,
  Zap,
  Route,
  ArrowRight,
} from 'lucide-react';
import type { AGVFleetVehicle } from '../../types/warehouse';

export const AGVFleetView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { agvs } = state;

  const [selectedAGVId, setSelectedAGVId] = useState<string>('AGV-01');

  const agvList = Object.values(agvs);
  const activeAGV = agvs[selectedAGVId] || agvList[0];

  const handleApplyReroute = (agv: AGVFleetVehicle) => {
    // Generate an intelligent detour avoiding central corridor congestion
    const detourRoute = [
      { x: agv.currentX, z: agv.currentZ, label: 'Current Pos' },
      { x: -6, z: 12, label: 'North Bypass Spine' },
      { x: 14, z: 12, label: 'East Gate Junction' },
      { x: agv.targetX, z: agv.targetZ, label: 'Destination Bay' },
    ];

    actions.applyAGVReroute(
      agv.id,
      detourRoute,
      'A* Pathfinding Detour: Aisle 3 cross-junction congested with human picker traffic. Rerouted via North Bypass Spine (+3.2m distance, -28s latency).'
    );
  };

  return (
    <div className="space-y-6">
      {/* Fleet Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agvList.map((agv) => {
          const isSelected = activeAGV.id === agv.id;
          const isCharging = agv.status === 'CHARGING';
          const isEnRoute = agv.status === 'EN_ROUTE';

          return (
            <div
              key={agv.id}
              onClick={() => setSelectedAGVId(agv.id)}
              className={`glass-panel rounded-xl p-4 border transition-all cursor-pointer ${
                isSelected
                  ? 'border-orange-500/50 shadow-lg shadow-orange-500/10'
                  : 'border-white/10 hover:border-orange-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-mono font-bold text-xs text-orange-400">
                    {agv.id.replace('AGV-0', '')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[110px]">{agv.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">Model TS-500</span>
                  </div>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                    isEnRoute
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isCharging
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {agv.status}
                </span>
              </div>

              {/* Battery Meter */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Battery Level:</span>
                  <span
                    className={`font-bold ${
                      agv.batteryPct > 50
                        ? 'text-emerald-400'
                        : agv.batteryPct > 25
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {Math.round(agv.batteryPct)}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      agv.batteryPct > 50
                        ? 'bg-emerald-400'
                        : agv.batteryPct > 25
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${agv.batteryPct}%` }}
                  />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="block text-slate-500">SPEED</span>
                  <span className="text-white font-bold">{agv.currentSpeedMps} m/s</span>
                </div>
                <div>
                  <span className="block text-slate-500">DISTANCE</span>
                  <span className="text-white font-bold">{agv.totalDistanceTraveledM} m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive on Active AGV */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Route & Waypoints */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Route className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-bold text-white tracking-wider">
                AGV TELEMETRY & ROUTE INSPECTOR — {activeAGV.id}
              </h3>
            </div>
            {activeAGV.isRerouted && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40">
                DYNAMIC DETOUR ACTIVE
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">CURRENT POSITION</span>
              <span className="text-white font-bold text-sm">
                ({activeAGV.currentX.toFixed(1)}, {activeAGV.currentZ.toFixed(1)}) m
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">TARGET POSITION</span>
              <span className="text-cyan-400 font-bold text-sm">
                ({activeAGV.targetX.toFixed(1)}, {activeAGV.targetZ.toFixed(1)}) m
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5">
              <span className="text-slate-500 text-[10px] block">ENERGY CONSUMED</span>
              <span className="text-emerald-400 font-bold text-sm">
                {activeAGV.energyConsumedKWh.toFixed(2)} kWh
              </span>
            </div>
          </div>

          {/* Waypoints Sequence List */}
          <div className="bg-[#0A0F1E] rounded-xl p-4 border border-white/5 space-y-2">
            <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
              A* WAYPOINT SEQUENCE ({activeAGV.route.length} Waypoints)
            </h4>

            {activeAGV.route.length === 0 ? (
              <p className="text-slate-500 text-xs font-mono">Vehicle currently in charging dock or stationary.</p>
            ) : (
              <div className="space-y-2">
                {activeAGV.route.map((wp, idx) => {
                  const isCurrent = idx === activeAGV.routeIndex;
                  const isDone = idx < activeAGV.routeIndex;

                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between ${
                        isCurrent
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-300 font-bold'
                          : isDone
                          ? 'bg-slate-900/60 border-white/5 text-slate-500'
                          : 'bg-[#111A2B] border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{wp.label || `Waypoint ${idx + 1}`}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-400">({wp.x}m, {wp.z}m)</span>
                        <span>{isDone ? '✓ REACHED' : isCurrent ? 'NAVIGATING' : 'PENDING'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reroute Trigger Action */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              Obstacle Avoidance: <span className="text-emerald-400 font-mono font-bold">Enabled</span>
            </div>

            <button
              onClick={() => handleApplyReroute(activeAGV)}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center space-x-2"
            >
              <RotateCw className="w-4 h-4" />
              <span>Apply Dynamic Reroute & Avoid Congestion</span>
            </button>
          </div>
        </div>

        {/* Right Column: Fleet Health & Charging Pad Status */}
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white tracking-wider">
              FLEET POWER & CHARGING BAYS
            </h3>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Charge Pad #1:</span>
                <span className="text-emerald-400 font-bold">AVAILABLE</span>
              </div>
              <div className="text-[10px] text-slate-500">Inductive 22kW Fast Charger</div>
            </div>

            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Charge Pad #2:</span>
                <span className="text-emerald-400 font-bold">AVAILABLE</span>
              </div>
              <div className="text-[10px] text-slate-500">Inductive 22kW Fast Charger</div>
            </div>

            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Charge Pad #3:</span>
                <span className="text-amber-400 font-bold">OCCUPIED (AGV-03)</span>
              </div>
              <div className="text-[10px] text-slate-500">Charging at 2.4 kW/min</div>
            </div>

            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Charge Pad #4:</span>
                <span className="text-emerald-400 font-bold">AVAILABLE</span>
              </div>
              <div className="text-[10px] text-slate-500">Inductive 22kW Fast Charger</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
