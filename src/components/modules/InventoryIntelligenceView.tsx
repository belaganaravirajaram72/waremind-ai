import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Layers,
  Search,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Box,
  TrendingUp,
} from 'lucide-react';
import type { ProductSKU } from '../../types/warehouse';

export const InventoryIntelligenceView: React.FC = () => {
  const { state } = useWarehouse();
  const { skus, bins } = state;

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSkuId, setSelectedSkuId] = useState<string | null>('SKU-WH-204');

  const skusList = Object.values(skus);

  const categories = ['ALL', 'ELECTRONICS', 'ROBOTICS', 'BATTERIES', 'FASTENERS', 'PHARMA', 'TOOLS', 'SENSORS'];

  const filteredSKUs = skusList.filter((sku) => {
    const matchesCat = categoryFilter === 'ALL' || sku.category === categoryFilter;
    const matchesSearch =
      sku.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sku.currentBinId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeSku = selectedSkuId ? skus[selectedSkuId] : filteredSKUs[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU Code, Name, or Bin Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <Tag className="w-4 h-4 text-slate-400 mr-1" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-all ${
                categoryFilter === c
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-[#0A0F1E] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: SKUs Master Table & SKU Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: SKUs Master Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white tracking-wider">
                INVENTORY SKU REPOSITORY ({filteredSKUs.length} items)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              54 SKUs Tracked Across 48 Bins
            </span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[620px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A0F1E]/80 text-[10px] font-mono uppercase text-slate-400 sticky top-0 border-b border-white/5">
                <tr>
                  <th className="p-3">SKU ID</th>
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Bin Location</th>
                  <th className="p-3">Available / Total</th>
                  <th className="p-3">Reorder Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredSKUs.map((sku) => {
                  const isSelected = activeSku?.id === sku.id;
                  const isCritical = sku.reorderRisk === 'CRITICAL';
                  const isHigh = sku.reorderRisk === 'HIGH';

                  return (
                    <tr
                      key={sku.id}
                      onClick={() => setSelectedSkuId(sku.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="p-3 font-bold text-cyan-400">{sku.id}</td>
                      <td className="p-3 font-sans text-white font-medium truncate max-w-[170px]">
                        {sku.name}
                      </td>
                      <td className="p-3">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sku.category}
                        </span>
                      </td>
                      <td className="p-3 text-purple-300 font-semibold">{sku.currentBinId}</td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold">{sku.availableStock}</span>
                          <span className="text-slate-500">/ {sku.totalStock}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : isHigh
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {sku.reorderRisk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: SKU Deep Dive */}
        {activeSku ? (
          <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-teal-400 uppercase tracking-widest">
                  SKU TELEMETRY
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeSku.id}</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ₹{activeSku.unitPrice.toLocaleString()} / unit
              </span>
            </div>

            <p className="text-xs text-white font-semibold">{activeSku.name}</p>

            {/* Stock Level Gauge */}
            <div className="bg-[#0A0F1E] rounded-xl p-3 border border-white/5 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Stock Availability:</span>
                <span className="text-cyan-400 font-bold">
                  {activeSku.availableStock} / {activeSku.totalStock} units
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-cyan-400 h-full"
                  style={{ width: `${(activeSku.availableStock / activeSku.totalStock) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(activeSku.reservedStock / activeSku.totalStock) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Available: {activeSku.availableStock}</span>
                <span>Reserved: {activeSku.reservedStock}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">DEMAND VELOCITY</span>
                <span className="text-white font-bold text-sm">{activeSku.demandVelocity}</span>
                <span className="text-slate-400 text-[10px]"> units/day</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">7-DAY FORECAST</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {activeSku.forecastDemandNext7d}
                </span>
                <span className="text-slate-400 text-[10px]"> units</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">REORDER POINT</span>
                <span className="text-amber-400 font-bold text-sm">{activeSku.reorderPoint}</span>
                <span className="text-slate-400 text-[10px]"> units</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">SAFETY STOCK</span>
                <span className="text-rose-400 font-bold text-sm">{activeSku.safetyStock}</span>
                <span className="text-slate-400 text-[10px]"> units</span>
              </div>
            </div>

            {/* Location Specs */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Current Slot:</span>
                <span className="text-purple-300 font-mono font-semibold">{activeSku.currentBinId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Optimal AI Slot:</span>
                <span className="text-cyan-400 font-mono font-semibold">{activeSku.optimalBinId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Unit Mass:</span>
                <span className="text-white font-mono">{activeSku.weightKg} kg</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Dimensions (L×W×H):</span>
                <span className="text-white font-mono">
                  {activeSku.dimensionsCm.l} × {activeSku.dimensionsCm.w} × {activeSku.dimensionsCm.h} cm
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-8 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-mono">
            Select an SKU to inspect metrics.
          </div>
        )}
      </div>
    </div>
  );
};
