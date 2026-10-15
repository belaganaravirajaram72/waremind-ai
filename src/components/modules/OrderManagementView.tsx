import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { CustomerOrder } from '../../types/warehouse';

export const OrderManagementView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { orders, skus } = state;

  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('ORD-HYD-9001');

  const ordersList = Object.values(orders);

  const filteredOrders = ordersList.filter((ord) => {
    const matchesPriority = filterPriority === 'ALL' || ord.priority === filterPriority;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.destinationCity.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  const activeOrder = selectedOrderId ? orders[selectedOrderId] : filteredOrders[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Order ID, Consignee, or Destination..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          <span className="text-xs text-slate-400 font-mono">PRIORITY:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={`px-3 py-1 text-xs rounded-lg font-mono font-medium transition-all ${
                filterPriority === p
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-[#0A0F1E] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Orders List & Detailed Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Orders Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold text-white tracking-wider">
                ACTIVE CUSTOMER ORDERS ({filteredOrders.length})
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Sorted by Priority Algorithmic Score
            </span>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[620px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0A0F1E]/80 text-[10px] font-mono uppercase text-slate-400 sticky top-0 border-b border-white/5">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer / City</th>
                  <th className="p-3">Priority Score</th>
                  <th className="p-3">Lines</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredOrders.map((ord) => {
                  const isSelected = activeOrder?.id === ord.id;
                  const isCritical = ord.priority === 'CRITICAL';
                  const isHigh = ord.priority === 'HIGH';

                  return (
                    <tr
                      key={ord.id}
                      onClick={() => setSelectedOrderId(ord.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        {isCritical && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                        <span>{ord.id}</span>
                      </td>
                      <td className="p-3">
                        <div className="text-white font-sans text-xs truncate max-w-[160px]">
                          {ord.customerName}
                        </div>
                        <div className="text-[10px] text-slate-500">{ord.destinationCity}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`font-bold ${
                              isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-slate-300'
                            }`}
                          >
                            {ord.priorityScore}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isHigh
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {ord.priority}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300">{ord.lines.length} items</td>
                      <td className="p-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            ord.status === 'PENDING'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30'
                              : ord.status === 'ALLOCATED'
                              ? 'bg-blue-950 text-blue-400 border border-blue-500/30'
                              : ord.status === 'PICKING'
                              ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                              : ord.status === 'DISPATCHED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'QC_FAILED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {ord.status === 'PENDING' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              actions.allocateOrderStock(ord.id);
                            }}
                            className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded text-[10px] font-bold transition-all shadow-sm shadow-cyan-500/20"
                          >
                            ⚡ Allocate Stock
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">Allocated</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Active Order Details & Allocation Inspector */}
        {activeOrder ? (
          <div className="glass-panel rounded-xl p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                  ORDER SPECIFICATION
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{activeOrder.id}</h3>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  activeOrder.priority === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                {activeOrder.priority} (SCORE: {activeOrder.priorityScore})
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Consignee:</span>
                <span className="font-semibold text-white">{activeOrder.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Destination Hub:</span>
                <span className="text-white font-mono">{activeOrder.destinationCity}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Total Cargo Weight:</span>
                <span className="text-white font-mono">{activeOrder.totalWeightKg} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Estimated Carbon:</span>
                <span className="text-emerald-400 font-mono">{activeOrder.carbonEstimateKg} kg CO₂</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Assigned AGV:</span>
                <span className="text-orange-400 font-mono">{activeOrder.assignedAGVId || 'Unassigned'}</span>
              </div>
            </div>

            {/* Order Lines Breakdown */}
            <div className="mt-4">
              <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                ORDER LINES ALLOCATION ({activeOrder.lines.length} items)
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {activeOrder.lines.map((line) => {
                  const sku = skus[line.skuId];
                  const isFullyAllocated = line.quantityAllocated >= line.quantityRequested;

                  return (
                    <div
                      key={line.id}
                      className="bg-[#0A0F1E] border border-white/5 rounded-lg p-2.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-semibold">{line.skuId}</span>
                        <span className="font-mono text-slate-400 text-[10px]">Bin {line.binLocationId}</span>
                      </div>
                      <p className="text-white font-sans truncate">{line.skuName}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                        <span className="text-slate-400">
                          Req: {line.quantityRequested} | Alloc: {line.quantityAllocated}
                        </span>
                        <span className={isFullyAllocated ? 'text-emerald-400' : 'text-amber-400'}>
                          {isFullyAllocated ? '✓ 100% Stock Reserved' : '⚠️ Partial Shortage'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              {activeOrder.status === 'PENDING' && (
                <button
                  onClick={() => actions.allocateOrderStock(activeOrder.id)}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20"
                >
                  ⚡ Execute Atomic Stock Reservation
                </button>
              )}
              {activeOrder.status === 'QC_FAILED' && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 flex items-start space-x-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Dispatch Locked by QC Engine</span>
                    Package failed verification. Resolve in Exception Center before dispatch.
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-xl p-8 border border-white/10 flex items-center justify-center text-slate-500 text-xs font-mono">
            Select an order to inspect details.
          </div>
        )}
      </div>
    </div>
  );
};
