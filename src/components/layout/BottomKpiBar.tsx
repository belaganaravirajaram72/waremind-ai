import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Zap,
  CheckCircle,
  Activity,
  Compass,
  Cpu,
  Leaf,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export const BottomKpiBar: React.FC = () => {
  const { kpis } = useWarehouse();

  const items = [
    {
      label: 'Orders / Hour',
      value: `${kpis.ordersCompletedPerHour}`,
      unit: 'ord/hr',
      delta: '+24%',
      icon: Zap,
      color: 'text-pink-400',
    },
    {
      label: 'Fulfillment Rate',
      value: `${kpis.fulfillmentRatePct}%`,
      unit: '',
      delta: '+1.4%',
      icon: CheckCircle,
      color: 'text-cyan-400',
    },
    {
      label: 'Pick Accuracy',
      value: `${kpis.pickAccuracyPct}%`,
      unit: '',
      delta: 'Optimal',
      icon: Activity,
      color: 'text-amber-400',
    },
    {
      label: 'Travel Time Saved',
      value: `${kpis.baselineVsOptimizedDistanceSavedPct}%`,
      unit: 'saved',
      delta: '-38%',
      icon: Compass,
      color: 'text-emerald-400',
    },
    {
      label: 'Energy Saved',
      value: `${kpis.agvFleetUtilizationPct}%`,
      unit: 'active',
      delta: '-22%',
      icon: Cpu,
      color: 'text-orange-400',
    },
    {
      label: 'CO₂ / Order',
      value: `${kpis.totalSimulatedCarbonKg > 0 ? (kpis.totalSimulatedCarbonKg / 30).toFixed(2) : '0.31'}`,
      unit: 'kg CO₂',
      delta: `-${kpis.baselineVsOptimizedCarbonSavedPct}%`,
      icon: Leaf,
      color: 'text-emerald-300',
    },
    {
      label: 'Inventory Accuracy',
      value: `${kpis.inventoryAccuracyPct}%`,
      unit: '',
      delta: '100% SLA',
      icon: Layers,
      color: 'text-teal-400',
    },
    {
      label: 'Active Exceptions',
      value: `${kpis.openExceptionsCount}`,
      unit: 'incidents',
      delta: kpis.openExceptionsCount > 0 ? 'Action Req' : 'Clear',
      icon: AlertTriangle,
      color: kpis.openExceptionsCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-400',
    },
  ];

  return (
    <footer className="sticky bottom-0 z-30 bg-[#0A0F1E]/95 backdrop-blur-md border-t border-white/10 px-4 py-2 select-none shadow-2xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 divide-x divide-white/5">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="px-2 flex items-center space-x-2.5">
              <div className={`p-1.5 rounded-lg bg-white/5 ${item.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 truncate uppercase font-mono tracking-tight">
                  {item.label}
                </div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-mono font-bold text-sm text-white">{item.value}</span>
                  {item.unit && <span className="text-[9px] font-mono text-slate-500">{item.unit}</span>}
                  <span
                    className={`text-[9px] font-mono font-semibold ${
                      item.delta.startsWith('-') || item.delta.startsWith('+')
                        ? 'text-emerald-400'
                        : item.delta === 'Action Req'
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.delta}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </footer>
  );
};
