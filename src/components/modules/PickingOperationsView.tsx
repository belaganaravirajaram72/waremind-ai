import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  CheckSquare,
  User,
  Activity,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const PickingOperationsView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { workers, orders, skus } = state;

  const pickingOrders = Object.values(orders).filter((o) => o.status === 'ALLOCATED' || o.status === 'PICKING');

  return (
    <div className="space-y-6">
      {/* Workers Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Object.values(workers).map((worker) => (
          <div
            key={worker.id}
            className="glass-panel rounded-xl p-4 border border-white/10 hover:border-amber-500/30 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-slate-950 font-mono"
                  style={{ backgroundColor: worker.avatarColor }}
                >
                  {worker.id.replace('WRK-', '')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-[95px]">{worker.name}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{worker.role}</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                  worker.status === 'PICKING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : worker.status === 'TRANSIT'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {worker.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px] font-mono border-t border-white/5 pt-2">
              <div className="flex justify-between text-slate-400">
                <span>Accuracy:</span>
                <span className="text-emerald-400 font-bold">{worker.accuracyRate}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Completed:</span>
                <span className="text-white font-bold">{worker.picksCompleted} picks</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Speed:</span>
                <span className="text-cyan-400">{worker.speedMps} m/s</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Location:</span>
                <span className="text-purple-300 font-semibold">{worker.currentBinId || 'Dock Area'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Picking Queues */}
      <div className="glass-panel rounded-xl p-5 border border-white/10">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white tracking-wider">
              PICK-TO-BIN LIVE QUEUE ({pickingOrders.length} In-Flight Orders)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-time pick verification across Hyderabad FC aisles
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {pickingOrders.map((ord) => (
            <div
              key={ord.id}
              className="bg-[#0A0F1E] border border-white/5 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-cyan-400 font-bold text-xs">{ord.id}</span>
                  <span className="text-slate-400 text-xs ml-2 font-sans">{ord.customerName}</span>
                </div>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                    ord.priority === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {ord.priority}
                </span>
              </div>

              {/* Order Lines to Pick */}
              <div className="space-y-2">
                {ord.lines.map((line) => {
                  const isDone = line.isPicked;
                  return (
                    <div
                      key={line.id}
                      className="bg-[#111A2B] border border-white/5 rounded-lg p-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white">{line.skuId}</span>
                          <span className="text-purple-300 font-mono text-[10px]">
                            Bin: {line.binLocationId}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate max-w-xs">{line.skuName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          Quantity: {line.quantityAllocated} units
                        </p>
                      </div>

                      <div>
                        {isDone ? (
                          <div className="flex items-center space-x-1 text-emerald-400 font-mono text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>PICKED</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => actions.completePickLine(ord.id, line.id, ord.assignedWorkerId || 'WRK-01')}
                            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold font-mono transition-all flex items-center space-x-1"
                          >
                            <span>Confirm Pick</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
