import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import { WarehouseCanvas } from '../3d/WarehouseCanvas';
import {
  Camera,
  Layers,
  Box,
  Cpu,
  User,
  Info,
  Maximize2,
  Sliders,
  RotateCw,
} from 'lucide-react';

export const DigitalTwinView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { cameraPreset, filters, selectedEntity, agvs, workers, bins, skus } = state;

  const presets: Array<{ key: typeof cameraPreset; label: string }> = [
    { key: 'OVERVIEW', label: 'Facility Overview' },
    { key: 'PICKING', label: 'Picking Aisles' },
    { key: 'PACKING', label: 'Packing Hub' },
    { key: 'QC', label: 'CV QC Bay' },
    { key: 'AGV', label: 'AGV Network' },
    { key: 'DISPATCH', label: 'Dispatch Docks' },
    { key: 'SLOTTING', label: 'AI Slotting Hub' },
  ];

  const zones: Array<typeof filters.zone> = ['ALL', 'ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D'];

  return (
    <div className="space-y-4">
      {/* 3D Simulation Controls HUD */}
      <div className="glass-panel rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Camera Presets */}
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <Camera className="w-4 h-4 text-cyan-400 mr-1 shrink-0" />
          <span className="text-xs text-slate-400 mr-1 font-mono shrink-0">VIEW:</span>
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => actions.setCameraPreset(p.key)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all shrink-0 ${
                cameraPreset === p.key
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'bg-[#111A2B] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Zone Filters & Toggles */}
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-mono">ZONE:</span>
          <div className="flex bg-[#111A2B] rounded-lg p-0.5 border border-white/5">
            {zones.map((z) => (
              <button
                key={z}
                onClick={() => actions.setZoneFilter(z)}
                className={`px-2 py-0.5 text-xs rounded font-mono ${
                  filters.zone === z
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {z.replace('ZONE_', '')}
              </button>
            ))}
          </div>

          <button
            onClick={() => actions.toggleRoutes()}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              filters.showRoutes
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold'
                : 'bg-[#111A2B] text-slate-400 border-white/5'
            }`}
          >
            Route Lines: {filters.showRoutes ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Frame */}
      <div className="relative w-full h-[620px] bg-[#070B14] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        {/* Render Interactive Three.js R3F Canvas */}
        <WarehouseCanvas className="w-full h-full" />

        {/* Floating Quick Focus Toolbar (Bottom Left) */}
        <div className="absolute bottom-4 left-4 pointer-events-none z-10 flex flex-col space-y-2">
          <div className="pointer-events-auto bg-[#0A0F1E]/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center space-x-3 text-xs font-mono shadow-xl">
            <span className="text-slate-400 font-bold">FOCUS:</span>
            <button
              onClick={() => {
                actions.selectEntity('AGV', 'AGV-01');
                actions.setCameraPreset('AGV');
              }}
              className="text-orange-400 hover:text-orange-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-orange-500/10"
            >
              <Cpu className="w-3 h-3" />
              <span>AGV-01</span>
            </button>
            <button
              onClick={() => {
                actions.selectEntity('AGV', 'AGV-02');
                actions.setCameraPreset('AGV');
              }}
              className="text-orange-400 hover:text-orange-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-orange-500/10"
            >
              <Cpu className="w-3 h-3" />
              <span>AGV-02</span>
            </button>
            <button
              onClick={() => {
                actions.selectEntity('WORKER', 'WRK-01');
                actions.setCameraPreset('PICKING');
              }}
              className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-purple-500/10"
            >
              <User className="w-3 h-3" />
              <span>Priya (Picker)</span>
            </button>
            <button
              onClick={() => {
                actions.selectEntity('BIN', 'BIN-A-04');
                actions.setCameraPreset('SLOTTING');
              }}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 px-1.5 py-0.5 rounded hover:bg-cyan-500/10"
            >
              <Box className="w-3 h-3" />
              <span>Golden Bin A-04</span>
            </button>
          </div>

          {/* Navigation Controls Tip */}
          <div className="text-[10px] text-slate-400 font-mono bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md self-start border border-white/5">
            🖱️ Left Drag: Orbit | Right Drag: Pan | Scroll: Zoom | Click Object: Inspect
          </div>
        </div>

        {/* Selected Entity Card (Top Right floating) */}
        {selectedEntity.type && selectedEntity.id && (
          <div className="absolute top-4 right-4 pointer-events-auto z-10 bg-[#0A0F1E]/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 text-xs font-mono shadow-2xl max-w-xs space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="font-bold text-white flex items-center space-x-1.5 text-cyan-400">
                <Info className="w-3.5 h-3.5" />
                <span>{selectedEntity.type}: {selectedEntity.id}</span>
              </span>
              <button
                onClick={() => actions.selectEntity(null, null)}
                className="text-slate-400 hover:text-white text-[11px] px-1 py-0.5"
              >
                ✕ Close
              </button>
            </div>
            {selectedEntity.type === 'AGV' && agvs[selectedEntity.id] && (
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>Task: <span className="text-white font-bold">{agvs[selectedEntity.id].status}</span></p>
                <p>Battery: <span className="text-emerald-400 font-bold">{Math.round(agvs[selectedEntity.id].batteryPct)}%</span></p>
                <p>Traveled: <span className="text-orange-400 font-bold">{Math.round(agvs[selectedEntity.id].totalDistanceTraveledM)}m</span></p>
              </div>
            )}
            {selectedEntity.type === 'BIN' && bins[selectedEntity.id] && (
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>SKU: <span className="text-white font-bold">{bins[selectedEntity.id].currentSKUId || 'None'}</span></p>
                <p>Occupied: <span className="text-emerald-400 font-bold">{bins[selectedEntity.id].occupiedQty} units</span></p>
                <p>Dist to Pack: <span className="text-cyan-400 font-bold">{bins[selectedEntity.id].distanceToPackingMeters}m</span></p>
              </div>
            )}
            {selectedEntity.type === 'WORKER' && workers[selectedEntity.id] && (
              <div className="space-y-1 text-slate-300 text-[11px]">
                <p>Name: <span className="text-white font-bold">{workers[selectedEntity.id].name}</span></p>
                <p>Role: <span className="text-purple-400 font-bold">{workers[selectedEntity.id].role}</span></p>
                <p>Accuracy: <span className="text-emerald-400 font-bold">{workers[selectedEntity.id].accuracyRate}%</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
