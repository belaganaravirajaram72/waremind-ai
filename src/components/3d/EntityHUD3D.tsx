import React from 'react';
import { Html } from '@react-three/drei';
import { useWarehouse } from '../../context/WarehouseContext';
import { X, Battery, Cpu, User, Layers, MapPin, Zap } from 'lucide-react';

export const EntityHUD3D: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { selectedEntity, agvs, bins, skus, workers } = state;

  if (!selectedEntity.type || !selectedEntity.id) return null;

  // Selected AGV
  if (selectedEntity.type === 'AGV') {
    const agv = agvs[selectedEntity.id];
    if (!agv) return null;

    return (
      <group position={[agv.currentX, 1.8, agv.currentZ]}>
        <Html center distanceFactor={22} className="pointer-events-auto">
          <div className="w-56 glass-panel rounded-xl p-3 border border-orange-500/50 shadow-2xl text-xs font-mono space-y-2 backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center space-x-1.5 text-orange-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>{agv.name}</span>
              </div>
              <button
                onClick={() => actions.selectEntity(null, null)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">{agv.status}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Battery:</span>
                <span className="text-white font-bold">{Math.round(agv.batteryPct)}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Distance:</span>
                <span className="text-cyan-400 font-bold">{Math.round(agv.totalDistanceTraveledM)}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Destination:</span>
                <span className="text-purple-300">[{agv.targetX.toFixed(1)}, {agv.targetZ.toFixed(1)}]</span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    );
  }

  // Selected Bin / SKU
  if (selectedEntity.type === 'BIN') {
    const bin = bins[selectedEntity.id];
    if (!bin) return null;
    const sku = bin.currentSKUId ? skus[bin.currentSKUId] : null;

    return (
      <group position={[bin.x, bin.y + 1.2, bin.z]}>
        <Html center distanceFactor={22} className="pointer-events-auto">
          <div className="w-60 glass-panel rounded-xl p-3 border border-cyan-500/50 shadow-2xl text-xs font-mono space-y-2 backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                <Layers className="w-3.5 h-3.5" />
                <span>{bin.id}</span>
              </div>
              <button
                onClick={() => actions.selectEntity(null, null)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="text-slate-300 font-sans font-semibold truncate">
                {sku ? sku.name : 'Empty Slot'}
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Stock:</span>
                <span className="text-emerald-400 font-bold">{bin.occupiedQty} units</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dist to Pack:</span>
                <span className="text-white">{bin.distanceToPackingMeters}m</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Zone:</span>
                <span className="text-amber-300">{bin.zone}</span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    );
  }

  // Selected Worker
  if (selectedEntity.type === 'WORKER') {
    const worker = workers[selectedEntity.id];
    if (!worker) return null;

    return (
      <group position={[worker.x, 2.2, worker.z]}>
        <Html center distanceFactor={22} className="pointer-events-auto">
          <div className="w-56 glass-panel rounded-xl p-3 border border-purple-500/50 shadow-2xl text-xs font-mono space-y-2 backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <div className="flex items-center space-x-1.5 text-purple-400 font-bold">
                <User className="w-3.5 h-3.5" />
                <span>{worker.name}</span>
              </div>
              <button
                onClick={() => actions.selectEntity(null, null)}
                className="text-slate-400 hover:text-white p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Role:</span>
                <span className="text-white">{worker.role}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Accuracy:</span>
                <span className="text-emerald-400 font-bold">{worker.accuracyRate}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Picks Done:</span>
                <span className="text-cyan-400 font-bold">{worker.picksCompleted}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-amber-300">{worker.status}</span>
              </div>
            </div>
          </div>
        </Html>
      </group>
    );
  }

  return null;
};
