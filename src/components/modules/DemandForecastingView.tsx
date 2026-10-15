import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  TrendingUp,
  Search,
  Calendar,
  AlertCircle,
  BarChart,
  Activity,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export const DemandForecastingView: React.FC = () => {
  const { state } = useWarehouse();
  const { skus } = state;

  const [selectedSkuId, setSelectedSkuId] = useState<string>('SKU-WH-204');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const skusList = Object.values(skus);
  const activeSku = skus[selectedSkuId] || skusList[0];

  const chartData = activeSku.historicalDemand.map((qty, idx) => ({
    day: `Day ${idx + 1}`,
    historical: qty,
    forecast: idx >= 23 ? Math.round(qty * 1.08) : null,
  }));

  const filteredSKUs = skusList.filter(
    (s) =>
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner explaining the forecasting engine */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              AI-ASSISTED DEMAND VELOCITY & SAFETY STOCK FORECASTING
            </h3>
            <p className="text-xs text-slate-300">
              Deterministic 30-day moving averages, seasonal variance dampening, and automated reorder risk classification.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-[#0A0F1E] px-3 py-1.5 rounded-lg border border-white/5">
          Confidence Index: 94.2%
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: SKU Selector */}
        <div className="glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[520px] divide-y divide-white/5">
            {filteredSKUs.map((sku) => (
              <button
                key={sku.id}
                onClick={() => setSelectedSkuId(sku.id)}
                className={`w-full text-left p-3 text-xs transition-colors flex items-center justify-between ${
                  activeSku.id === sku.id
                    ? 'bg-indigo-500/15 border-l-2 border-l-indigo-400'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-cyan-400 block">{sku.id}</span>
                  <span className="text-slate-300 truncate max-w-[170px] block font-sans">
                    {sku.name}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold block">{sku.demandVelocity} u/d</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      sku.reorderRisk === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : sku.reorderRisk === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {sku.reorderRisk}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Historical Demand Chart & Reorder Risk Calculator */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-xl p-5 border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                  DEMAND CURVE AUDIT
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {activeSku.id} — {activeSku.name}
                </h4>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="flex items-center space-x-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>30-Day Actual</span>
                </span>
                <span className="flex items-center space-x-1.5 text-indigo-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>7-Day Project</span>
                </span>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-64 mt-4 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748B" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0F1E',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="historical"
                    stroke="#00E5FF"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHist)"
                    name="Daily Demand"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Demand Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 font-mono text-xs">
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">CURRENT STOCK</span>
                <span className="text-white font-bold text-sm">{activeSku.availableStock}</span>
                <span className="text-slate-500 text-[10px]"> / {activeSku.totalStock}</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">DEMAND VELOCITY</span>
                <span className="text-cyan-400 font-bold text-sm">{activeSku.demandVelocity}</span>
                <span className="text-slate-500 text-[10px]"> units/day</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">SAFETY THRESHOLD</span>
                <span className="text-rose-400 font-bold text-sm">{activeSku.safetyStock}</span>
                <span className="text-slate-500 text-[10px]"> units</span>
              </div>
              <div className="bg-[#0A0F1E] p-2.5 rounded-lg border border-white/5">
                <span className="text-slate-500 text-[10px] block">NEXT 7-DAY FORECAST</span>
                <span className="text-emerald-400 font-bold text-sm">{activeSku.forecastDemandNext7d}</span>
                <span className="text-slate-500 text-[10px]"> units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
