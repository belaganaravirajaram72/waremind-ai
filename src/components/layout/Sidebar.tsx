import React from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Layers,
  CheckSquare,
  Package,
  TrendingUp,
  Grid,
  Camera,
  Cpu,
  Leaf,
  Mic,
  AlertTriangle,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export type ModuleId =
  | 'COMMAND_CENTER'
  | 'DIGITAL_TWIN'
  | 'ORDER_MANAGEMENT'
  | 'INVENTORY_INTELLIGENCE'
  | 'PICKING_OPERATIONS'
  | 'PACKING_DISPATCH'
  | 'DEMAND_FORECASTING'
  | 'DYNAMIC_SLOTTING'
  | 'QUALITY_CONTROL'
  | 'AGV_FLEET'
  | 'CARBON_INTELLIGENCE'
  | 'VOICE_PICKING'
  | 'EXCEPTION_CENTER'
  | 'ANALYTICS_REPORTS'
  | 'EVENT_LEDGER';

interface SidebarProps {
  activeModule: ModuleId;
  setActiveModule: (id: ModuleId) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  id: ModuleId;
  label: string;
  category: 'CORE' | 'OPERATIONS' | 'AI_OPTIMIZATION' | 'ANALYTICS';
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge?: (state: any, kpis: any) => string | number | null;
}

export const NAV_ITEMS: NavItem[] = [
  // CORE
  {
    id: 'COMMAND_CENTER',
    label: 'AI Command Center',
    category: 'CORE',
    icon: LayoutDashboard,
    accentColor: 'text-cyan-400',
  },
  {
    id: 'DIGITAL_TWIN',
    label: '3D Digital Twin',
    category: 'CORE',
    icon: Box,
    accentColor: 'text-blue-400',
  },

  // OPERATIONS
  {
    id: 'ORDER_MANAGEMENT',
    label: 'Order Management',
    category: 'OPERATIONS',
    icon: ShoppingCart,
    accentColor: 'text-sky-400',
    badge: (state) => Object.values(state.orders).filter((o: any) => o.status === 'PENDING').length || null,
  },
  {
    id: 'INVENTORY_INTELLIGENCE',
    label: 'Inventory Intelligence',
    category: 'OPERATIONS',
    icon: Layers,
    accentColor: 'text-teal-400',
  },
  {
    id: 'PICKING_OPERATIONS',
    label: 'Picking Operations',
    category: 'OPERATIONS',
    icon: CheckSquare,
    accentColor: 'text-amber-400',
  },
  {
    id: 'PACKING_DISPATCH',
    label: 'Packing & Dispatch',
    category: 'OPERATIONS',
    icon: Package,
    accentColor: 'text-pink-400',
  },

  // AI & OPTIMIZATION
  {
    id: 'DEMAND_FORECASTING',
    label: 'Demand Forecasting',
    category: 'AI_OPTIMIZATION',
    icon: TrendingUp,
    accentColor: 'text-indigo-400',
  },
  {
    id: 'DYNAMIC_SLOTTING',
    label: 'Dynamic Slotting',
    category: 'AI_OPTIMIZATION',
    icon: Grid,
    accentColor: 'text-cyan-300',
    badge: () => 'AI Rec',
  },
  {
    id: 'QUALITY_CONTROL',
    label: 'Computer Vision QC',
    category: 'AI_OPTIMIZATION',
    icon: Camera,
    accentColor: 'text-emerald-400',
  },
  {
    id: 'AGV_FLEET',
    label: 'AGV Fleet Optimization',
    category: 'AI_OPTIMIZATION',
    icon: Cpu,
    accentColor: 'text-orange-400',
    badge: (state) => Object.values(state.agvs).filter((a: any) => a.status === 'EN_ROUTE').length + ' Active',
  },
  {
    id: 'CARBON_INTELLIGENCE',
    label: 'Carbon Intelligence',
    category: 'AI_OPTIMIZATION',
    icon: Leaf,
    accentColor: 'text-mint-400 text-emerald-300',
  },
  {
    id: 'VOICE_PICKING',
    label: 'AR & Voice Picking',
    category: 'AI_OPTIMIZATION',
    icon: Mic,
    accentColor: 'text-purple-400',
  },

  // ANALYTICS & RESILIENCE
  {
    id: 'EXCEPTION_CENTER',
    label: 'Exception Center',
    category: 'ANALYTICS',
    icon: AlertTriangle,
    accentColor: 'text-rose-400',
    badge: (state) => {
      const open = Object.values(state.exceptions).filter((e: any) => e.status !== 'RESOLVED').length;
      return open > 0 ? open : null;
    },
  },
  {
    id: 'ANALYTICS_REPORTS',
    label: 'Analytics & Reports',
    category: 'ANALYTICS',
    icon: BarChart3,
    accentColor: 'text-violet-400',
  },
  {
    id: 'EVENT_LEDGER',
    label: 'Event Ledger & Audit',
    category: 'ANALYTICS',
    icon: FileText,
    accentColor: 'text-slate-300',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  collapsed,
  setCollapsed,
}) => {
  const { state, kpis } = useWarehouse();

  const categories = [
    { key: 'CORE', label: 'COMMAND & TWIN' },
    { key: 'OPERATIONS', label: 'WAREHOUSE FULFILLMENT' },
    { key: 'AI_OPTIMIZATION', label: 'INTELLIGENCE ENGINES' },
    { key: 'ANALYTICS', label: 'AUDIT & PERFORMANCE' },
  ];

  return (
    <aside
      className={`bg-[#0A0F1E] border-r border-white/10 flex flex-col transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Module Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {categories.map((cat) => {
          const items = NAV_ITEMS.filter((item) => item.category === cat.key);
          return (
            <div key={cat.key} className="space-y-1">
              {!collapsed && (
                <div className="px-3 py-1 text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
                  {cat.label}
                </div>
              )}
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                const badgeContent = item.badge ? item.badge(state, kpis) : null;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full flex items-center rounded-lg transition-all text-xs font-medium group relative ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2 justify-between'
                    } ${
                      isActive
                        ? 'bg-[#111A2B] text-white border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-sm" />
                    )}

                    <div className="flex items-center space-x-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? item.accentColor : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      {!collapsed && (
                        <span className={`truncate ${isActive ? 'font-semibold text-white' : ''}`}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!collapsed && badgeContent && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          item.id === 'EXCEPTION_CENTER'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            : item.id === 'DYNAMIC_SLOTTING'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {badgeContent}
                      </span>
                    )}

                    {/* Collapsed Badge Dot */}
                    {collapsed && badgeContent && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-white/10 flex items-center justify-between">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900/80 transition-colors text-xs space-x-2"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="font-mono text-[11px] text-slate-500">COLLAPSE SIDEBAR</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
