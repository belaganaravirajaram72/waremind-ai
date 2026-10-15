import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { WarehouseCanvas } from '../3d/WarehouseCanvas';
import {
  Activity,
  Layers,
  CheckCircle,
  Truck,
  Cpu,
  Leaf,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Zap,
  Camera,
  Play,
  RotateCcw,
  Compass,
  Box,
  Sliders,
} from 'lucide-react';

export const AICommandCenterView: React.FC<{ onNavigate: (module: any) => void }> = ({ onNavigate }) => {
  const { state, actions, kpis } = useWarehouse();
  const { orders, skus, agvs, exceptions, events, decisions, cameraPreset } = state;

  const [activeTab, setActiveTab] = useState<'3D_TWIN' | 'AI_STREAM'>('3D_TWIN');

  const pendingOrders = Object.values(orders).filter((o) => o.status === 'PENDING');
  const criticalOrders = Object.values(orders).filter((o) => o.priority === 'CRITICAL');
  const openExceptions = Object.values(exceptions).filter((e) => e.status !== 'RESOLVED');
  const topPriorityOrder = criticalOrders[0] || pendingOrders[0] || Object.values(orders)[0];

  return (
    <div className="space-y-5">
      {/* Top Banner Alert if Critical Exceptions exist */}
      {openExceptions.length > 0 && (
        <div className="bg-gradient-to-r from-rose-950/40 via-[#111A2B] to-slate-900 border border-rose-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 glow-danger">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs text-white">
                  {openExceptions.length} Active Operational Exception{openExceptions.length > 1 ? 's' : ''} Require Resolution
                </span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                  CRITICAL
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {openExceptions[0]?.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('EXCEPTION_CENTER')}
            className="self-start sm:self-auto px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold tracking-wide transition-all shadow-md shadow-rose-600/20 shrink-0 font-mono"
          >
            Review in Exception Center →
          </button>
        </div>
      )}

      {/* Main Command Center Layout: 3D Digital Twin Center + Live AI Intelligence Right Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* CENTER VIEWPORT: Large Interactive 3D Digital Twin */}
        <div className="xl:col-span-8 flex flex-col space-y-3">
          {/* Viewport Header Controls */}
          <div className="glass-panel rounded-xl p-2.5 border border-white/10 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
              <span className="text-xs font-bold text-white tracking-wide font-mono">
                HYDERABAD FC 3D DIGITAL TWIN
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                ACTIVE
              </span>
            </div>

            {/* Quick Camera Presets */}
            <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
              <Camera className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
              {(['OVERVIEW', 'PICKING', 'PACKING', 'QC', 'AGV', 'DISPATCH'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => actions.setCameraPreset(p)}
                  className={`px-2 py-0.5 text-[11px] rounded transition-all shrink-0 ${
                    cameraPreset === p
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('DIGITAL_TWIN')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1 shrink-0"
              title="Open full screen 3D Twin"
            >
              <span>Expand Twin</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* 3D Viewport Box */}
          <div className="relative w-full h-[520px] bg-[#070B14] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <WarehouseCanvas className="w-full h-full" />

            {/* In-Canvas Quick Status Overlay */}
            <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/5">
              <span>🖱️ Orbit / Pan / Zoom Enabled</span>
              <span>•</span>
              <span className="text-emerald-400">4 AGVs Tracking</span>
              <span>•</span>
              <span className="text-cyan-400">Priya (Picker) Active</span>
            </div>

            {/* Quick Interactive Actions Floating Dock */}
            <div className="absolute top-3 right-3 pointer-events-auto z-10 flex items-center space-x-2">
              <button
                onClick={() => {
                  if (pendingOrders.length > 0) {
                    actions.allocateOrderStock(pendingOrders[0].id);
                  }
                }}
                disabled={pendingOrders.length === 0}
                className="px-2.5 py-1 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-600/20 flex items-center space-x-1 disabled:opacity-40"
              >
                <Zap className="w-3 h-3" />
                <span>Allocate Stock</span>
              </button>
              <button
                onClick={() => onNavigate('DYNAMIC_SLOTTING')}
                className="px-2.5 py-1 bg-purple-600/90 hover:bg-purple-500 text-white rounded-lg text-xs font-mono font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center space-x-1"
              >
                <Box className="w-3 h-3" />
                <span>Optimize Slot</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live AI Operational Intelligence Feed */}
        <div className="xl:col-span-4 space-y-4">
          {/* Card 1: Live Priority Order SLA Risk */}
          {topPriorityOrder && (
            <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    HIGHEST SLA PRIORITY ORDER
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                  {topPriorityOrder.priority}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Order ID:</span>
                  <span className="text-cyan-400 font-bold">{topPriorityOrder.id}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Consignee:</span>
                  <span className="text-white font-sans font-semibold">{topPriorityOrder.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Destination:</span>
                  <span className="text-white">{topPriorityOrder.destinationCity}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Algorithmic Score:</span>
                  <span className="text-rose-400 font-bold">{topPriorityOrder.priorityScore} / 100</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="text-amber-400 font-bold">{topPriorityOrder.status}</span>
                </div>
              </div>

              {topPriorityOrder.status === 'PENDING' && (
                <button
                  onClick={() => actions.allocateOrderStock(topPriorityOrder.id)}
                  className="w-full mt-2 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition-all"
                >
                  ⚡ Execute AI Stock Allocation
                </button>
              )}
            </div>
          )}

          {/* Card 2: AI Recommendation & Dynamic Slotting */}
          <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 space-y-2.5 glow-blue">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">
                  AI RECOMMENDATION ENGINE
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                Confidence 91%
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              <strong className="text-cyan-300">Slot Relocation:</strong> Move high-velocity SKU <span className="font-mono text-white">SKU-WH-204</span> from Bin C-18 to Golden Zone <span className="font-mono text-white">BIN-A-04</span>.
            </p>

            <div className="bg-[#0A0F1E] rounded-lg p-2.5 border border-white/5 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Travel Distance Saved:</span>
                <span className="text-emerald-400 font-bold">-38% per pick</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Expected Throughput:</span>
                <span className="text-cyan-400 font-bold">+24% orders/hr</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('DYNAMIC_SLOTTING')}
              className="w-full py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition-all"
            >
              Inspect Slotting Optimizer →
            </button>
          </div>

          {/* Card 3: AGV Fleet Live Telemetry */}
          <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  AGV NETWORK & A* ROUTING
                </span>
              </div>
              <button
                onClick={() => onNavigate('AGV_FLEET')}
                className="text-[10px] font-mono text-orange-400 hover:text-orange-300"
              >
                Fleet Grid →
              </button>
            </div>

            <div className="space-y-2">
              {Object.values(agvs).slice(0, 3).map((agv) => (
                <div
                  key={agv.id}
                  className="bg-[#0A0F1E] rounded-lg p-2 border border-white/5 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-white font-bold">{agv.name}</span>
                      <span
                        className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                          agv.status === 'EN_ROUTE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : agv.status === 'CHARGING'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {agv.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Battery {Math.round(agv.batteryPct)}% • {agv.currentSpeedMps} m/s
                    </span>
                  </div>
                  <span className="text-cyan-400 font-bold">{Math.round(agv.totalDistanceTraveledM)}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Event Ledger Preview Ticker */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <div className="flex items-center space-x-2 text-white font-semibold">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">REAL-TIME OPERATIONAL EVENT TICKER</span>
          </div>
          <button
            onClick={() => onNavigate('EVENT_LEDGER')}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All ({events.length})</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {events.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              className="bg-[#0A0F1E]/60 border border-white/5 rounded-lg p-2.5 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    evt.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400'
                      : evt.severity === 'WARN'
                      ? 'bg-amber-500/20 text-amber-400'
                      : evt.severity === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {evt.module}
                </span>
                <span className="text-[10px] font-mono text-slate-500">T+{evt.simTime}s</span>
              </div>
              <p className="font-semibold text-white truncate font-sans">{evt.title}</p>
              <p className="text-[11px] text-slate-400 line-clamp-2 font-sans">{evt.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
