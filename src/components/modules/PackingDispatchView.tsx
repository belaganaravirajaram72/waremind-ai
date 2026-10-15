import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Package,
  Truck,
  CheckCircle,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Leaf,
  Layers,
} from 'lucide-react';
import type { PackagingType } from '../../types/warehouse';

export const PackingDispatchView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { packingStations, packages, orders, shipments } = state;

  const [selectedVehicle, setSelectedVehicle] = useState<'EV_VAN' | 'ELECTRIC_TRUCK' | 'HYBRID_FLEET'>('EV_VAN');
  const [selectedPackaging, setSelectedPackaging] = useState<PackagingType>('RECYCLED_BOX_M');

  const dispatchReadyOrders = Object.values(orders).filter((o) => o.status === 'QC_PASSED');
  const pickedOrders = Object.values(orders).filter((o) => o.status === 'PICKED');

  return (
    <div className="space-y-6">
      {/* Packing Hubs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.values(packingStations).map((station) => (
          <div
            key={station.id}
            className="glass-panel rounded-xl p-4 border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-pink-400" />
                <h4 className="text-xs font-bold text-white">{station.name}</h4>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                  station.status === 'PACKING'
                    ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {station.status}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Lead Operator:</span>
                <span className="text-white">{station.operator}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Packed Today:</span>
                <span className="text-emerald-400 font-bold">{station.packagesPackedToday} units</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Efficiency:</span>
                <span className="text-cyan-400 font-bold">{station.efficiencyScore}%</span>
              </div>
            </div>

            {/* Pack Next Picked Order Trigger */}
            {pickedOrders.length > 0 && (
              <button
                onClick={() => actions.packOrder(pickedOrders[0].id, station.id, selectedPackaging)}
                className="w-full py-2 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-lg text-xs font-bold font-mono transition-all"
              >
                Assemble Package for {pickedOrders[0].id}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Dispatch Operations Dock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dispatch Ready Staging */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white tracking-wider">
                DISPATCH STAGING DOCK ({dispatchReadyOrders.length} Cleared Orders)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% QC Passed Guard</span>
            </span>
          </div>

          {dispatchReadyOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              No orders currently in QC_PASSED stage waiting for vehicle loading.
            </div>
          ) : (
            <div className="space-y-3">
              {dispatchReadyOrders.map((ord) => {
                const pkg = ord.packageId ? packages[ord.packageId] : null;

                return (
                  <div
                    key={ord.id}
                    className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-white text-xs">{ord.id}</span>
                        <span className="text-[10px] font-mono text-cyan-400">{pkg?.id || 'PKG-READY'}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          QC VERIFIED
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {ord.customerName} • Destination: <span className="font-mono text-white">{ord.destinationCity}</span>
                      </p>
                      <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400 pt-1">
                        <span>Weight: {ord.totalWeightKg} kg</span>
                        <span className="text-emerald-400">Carbon: {ord.carbonEstimateKg} kg CO₂</span>
                        <span className="text-purple-300">{pkg?.packagingType || 'RECYCLED_BOX_M'}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => actions.dispatchOrder(ord.id, 'BlueDart Electric Fleet', selectedVehicle)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-blue-500/20"
                      >
                        🚀 Dispatch via {selectedVehicle.replace('_', ' ')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dispatch Fleet Settings */}
        <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white tracking-wider">
              FLEET & PACKAGING CONTROLS
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                DISPATCH TRANSPORT FLEET
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                {[
                  { id: 'EV_VAN', label: '100% Electric EV Van (0.22 kg CO₂/km)' },
                  { id: 'ELECTRIC_TRUCK', label: 'Electric Heavy Freight (0.35 kg CO₂/km)' },
                  { id: 'HYBRID_FLEET', label: 'Hybrid Regional Transport (0.85 kg CO₂/km)' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehicle(v.id as any)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      selectedVehicle === v.id
                        ? 'bg-blue-600/20 text-cyan-300 border-cyan-400 font-bold'
                        : 'bg-[#0A0F1E] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                STATION PACKAGING PRESET
              </label>
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                {[
                  { id: 'RECYCLED_BOX_M', label: 'Eco Recycled Carton (FSC Certified)' },
                  { id: 'ECO_POLYMAILER', label: '100% Biodegradable Polymailer' },
                  { id: 'STANDARD_CORRUGATED', label: 'Standard Corrugated Box' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPackaging(p.id as any)}
                    className={`p-2.5 rounded-lg text-left border transition-all ${
                      selectedPackaging === p.id
                        ? 'bg-pink-600/20 text-pink-300 border-pink-400 font-bold'
                        : 'bg-[#0A0F1E] text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
