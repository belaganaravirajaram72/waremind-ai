import React, { useEffect, useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  CheckCircle,
  Truck,
  Box,
  Cpu,
  Camera,
  Layers,
  Leaf,
  BarChart3,
} from 'lucide-react';

interface DemoStepInfo {
  step: number;
  title: string;
  category: string;
  description: string;
  aiExplanation: string;
  cameraPreset: 'OVERVIEW' | 'PICKING' | 'PACKING' | 'QC' | 'AGV' | 'DISPATCH' | 'SLOTTING';
  executeAction?: (actions: any, state: any) => void;
}

const DEMO_STEPS: DemoStepInfo[] = [
  {
    step: 1,
    title: 'Urgent Order Ingress (ORD-HYD-9001)',
    category: 'ORDER CREATION',
    description: 'High-value emergency medical robotics order #ORD-HYD-9001 arrives from Hyderabad FC client.',
    aiExplanation: 'Ingress verified: Customer SLA deadline is 45 minutes. System elevates priority queue.',
    cameraPreset: 'OVERVIEW',
  },
  {
    step: 2,
    title: 'Algorithmic Priority Score Calculation',
    category: 'AI PRIORITY',
    description: 'System evaluates customer tier, deadline proximity, inventory availability, and SLA penalty risk.',
    aiExplanation: 'Priority Score computed: 96 / 100 [CRITICAL]. Order bumped to head of picking pipeline.',
    cameraPreset: 'OVERVIEW',
  },
  {
    step: 3,
    title: 'Inventory Availability & Shortage Detection',
    category: 'INVENTORY CHECK',
    description: 'Order requests 10 units of SKU-WH-204 (Wireless Audio System). Warehouse has 7 available units.',
    aiExplanation: 'Shortage detected: Available = 7, Requested = 10. Secondary order #ORD-HYD-9015 also competing for stock.',
    cameraPreset: 'PICKING',
  },
  {
    step: 4,
    title: 'Atomic Inventory Allocation Decision',
    category: 'AI ALLOCATION',
    description: 'AI decides: Allocate all 7 available units to urgent order #ORD-HYD-9001, delay normal order.',
    aiExplanation: 'Reason: Urgent order SLA breach cost is 8.5x higher. Partial fulfillment authorized immediately.',
    cameraPreset: 'PICKING',
    executeAction: (actions, state) => {
      actions.allocateOrderStock('ORD-HYD-9001');
    },
  },
  {
    step: 5,
    title: 'Automated Replenishment Recommendation',
    category: 'INVENTORY RECOVERY',
    description: 'System triggers immediate replenishment order #REP-409 to vendor for 100 units.',
    aiExplanation: 'Safety Stock Breach: Inventory dropped below buffer threshold of 30 units. Lead time is 4.2 hours.',
    cameraPreset: 'PICKING',
  },
  {
    step: 6,
    title: 'Demand Velocity Forecasting Engine',
    category: 'DEMAND FORECAST',
    description: 'AI forecast models identify SKU-WH-204 as top 5% fastest-moving item for Hyderabad festival peak.',
    aiExplanation: 'Deterministic 30-day moving average velocity is 48 picks/day (Confidence: 94%). High pick frequency.',
    cameraPreset: 'SLOTTING',
  },
  {
    step: 7,
    title: 'Dynamic Slotting Recommendation',
    category: 'OPERATIONS RESEARCH',
    description: 'AI recommends moving SKU-WH-204 from remote Bin C-18 into Golden Zone Bin A-04.',
    aiExplanation: 'Golden zone proximity reduces picker walk distance from 48m to 21m (-38% cycle time reduction).',
    cameraPreset: 'SLOTTING',
  },
  {
    step: 8,
    title: 'Physical SKU Relocation in 3D Warehouse',
    category: 'DYNAMIC SLOTTING',
    description: 'Inventory slot relocation executed. SKU moved physically into Golden Zone Rack A-04.',
    aiExplanation: 'Throughput increases by +24%. Daily picker walking distance reduced by 1.02 km.',
    cameraPreset: 'SLOTTING',
    executeAction: (actions) => {
      actions.executeSlottingMove('SKU-WH-204', 'BIN-A-04', 'Golden Zone optimization executed.');
    },
  },
  {
    step: 9,
    title: 'Picker Assignment & A* Coordination',
    category: 'PICKING DISPATCH',
    description: 'Worker Priya Sharma and AGV-02 dispatched to Aisle 2 for rapid item extraction.',
    aiExplanation: 'Combined human-robot collaborative picking reduces idle handling latency by 45%.',
    cameraPreset: 'PICKING',
  },
  {
    step: 10,
    title: 'Holographic AR Wayfinding Ribbon Active',
    category: 'AR GUIDANCE',
    description: 'Glowing AR guidance path projects onto warehouse floor leading directly to Bin A-04.',
    aiExplanation: 'Worker smart glasses show pick quantity and verify barcode in dual English/Telugu voice.',
    cameraPreset: 'PICKING',
    executeAction: (actions) => {
      actions.completePickLine('ORD-HYD-9001', 'LINE-9001-1', 'WRK-01');
    },
  },
  {
    step: 11,
    title: 'Picked Cargo Transport to Packing Hub',
    category: 'TRANSIT',
    description: 'AGV-02 transports picked items along collision-free A* transit corridors to Packing Hub.',
    aiExplanation: 'Sensor telemetry confirms zero congestion delay along North Spine.',
    cameraPreset: 'PACKING',
  },
  {
    step: 12,
    title: 'Conveyor Induction & Infeed',
    category: 'AUTOMATION',
    description: 'Articulated robotic arm transfers container onto the automated conveyor belt line.',
    aiExplanation: 'Conveyor drive speed modulated dynamically to match Packing Station 1 throughput.',
    cameraPreset: 'PACKING',
  },
  {
    step: 13,
    title: 'FSC Eco-Packaging Box Assembly',
    category: 'PACKING',
    description: 'Order packed in FSC-certified 100% recycled carton with biodegradable air pillows.',
    aiExplanation: 'Packaging carbon footprint reduced by 62% compared to standard virgin corrugated boxes.',
    cameraPreset: 'PACKING',
    executeAction: (actions) => {
      actions.packOrder('ORD-HYD-9001', 'STATION-01', 'RECYCLED_BOX_M');
    },
  },
  {
    step: 14,
    title: 'Computer Vision Optical Inspection Scan',
    category: 'CV QUALITY CONTROL',
    description: 'Package enters camera inspection tunnel. Laser scanner sweeps barcode, dimensions, and carton seal.',
    aiExplanation: 'Real-time multi-spectral camera inspects perimeter integrity and confirms zero tare weight discrepancies.',
    cameraPreset: 'QC',
  },
  {
    step: 15,
    title: 'Quality Control Verification PASS ✓',
    category: 'QC VERIFICATION',
    description: 'All 5 QC checks validated: Barcode ✓, SKU Match ✓, Weight ✓, Seal Condition ✓, Zero Damage ✓.',
    aiExplanation: 'Inspection score 100%. Pneumatic diverter releases package directly to Dispatch Dock staging.',
    cameraPreset: 'QC',
    executeAction: (actions, state) => {
      const order = state.orders['ORD-HYD-9001'];
      if (order && order.packageId) {
        actions.recordQCInspection(
          order.packageId,
          order.id,
          'PASS',
          {
            barcodeValidity: true,
            skuMatch: true,
            quantityMatch: true,
            packageIntegrity: true,
            missingItemsDetected: false,
          },
          'Automated computer vision passed all criteria.'
        );
      }
    },
  },
  {
    step: 16,
    title: 'Carbon Footprint & Green Score Accounting',
    category: 'SUSTAINABILITY',
    description: 'Per-order carbon audit completed: Total 0.31 kg CO₂ (-26% reduction vs baseline manual warehouse).',
    aiExplanation: 'Hyderabad FC Green Score confirmed at 94/100 (Grade A+). Scope 1, 2, and 3 accounting logged.',
    cameraPreset: 'QC',
  },
  {
    step: 17,
    title: 'Hydraulic Dock Loading onto Electric Van',
    category: 'DISPATCH LOADING',
    description: 'Package loaded into BlueDart EV Delivery Van (TS-09-EV-8421) at Loading Bay 1.',
    aiExplanation: 'Dock leveller confirmed. Zero tailpipe emission last-mile fleet selected.',
    cameraPreset: 'DISPATCH',
  },
  {
    step: 18,
    title: 'Delivery Van Departure & Transit',
    category: 'DISPATCH',
    description: 'Van headlights illuminate; vehicle departs loading dock en route to customer in Hitec City, Hyderabad.',
    aiExplanation: 'ETA: 32 minutes (18.4 km via Outer Ring Road). Live GPS tracking activated.',
    cameraPreset: 'DISPATCH',
    executeAction: (actions) => {
      actions.dispatchOrder('ORD-HYD-9001', 'BlueDart EV Hub', 'EV_VAN');
    },
  },
  {
    step: 19,
    title: 'Live Warehouse Telemetry & Analytics Update',
    category: 'ANALYTICS',
    description: 'System updates operational ledger, throughput counters, AGV battery consumption, and stock tables.',
    aiExplanation: 'Fulfillment Rate rises to 98.4%. Orders/Hour updates to 32 ord/hr. Zero open exceptions.',
    cameraPreset: 'OVERVIEW',
  },
  {
    step: 20,
    title: 'Before-vs-After Operational Transformation',
    category: 'HACKATHON CONCLUSION',
    description: 'Picker Travel: -38% | Energy Saved: -22% | CO₂ Abated: -26% | Throughput: +24%.',
    aiExplanation: 'WAREMIND AI proves end-to-end autonomous fulfillment: Exception → Decision → Resolution → KPI.',
    cameraPreset: 'OVERVIEW',
  },
];

export const DemoModeModal: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { isDemoRunning, demoStep } = state;

  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const currentStepIndex = Math.max(0, Math.min(DEMO_STEPS.length - 1, demoStep));
  const currentStep = DEMO_STEPS[currentStepIndex];

  // Auto-play timer
  useEffect(() => {
    if (!isDemoRunning || !isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStepIndex < DEMO_STEPS.length - 1) {
        handleGoToStep(currentStepIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isDemoRunning, isPlaying, currentStepIndex]);

  const handleGoToStep = (newIndex: number) => {
    const step = DEMO_STEPS[newIndex];
    actions.triggerDemoScenario(newIndex);
    actions.setCameraPreset(step.cameraPreset);

    if (step.executeAction) {
      step.executeAction(actions, state);
    }
  };

  if (!isDemoRunning) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center p-6">
      {/* Semi-transparent Backdrop subtle glow */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto" onClick={() => actions.stopDemo()} />

      {/* Main Holographic Demo Control Panel */}
      <div className="relative pointer-events-auto w-full max-w-3xl glass-panel rounded-2xl p-5 border border-cyan-500/50 shadow-2xl shadow-cyan-950/80 text-white space-y-4 glow-blue">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide">
                  WAREMIND AI • HACKATHON LIVE DEMO MODE
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-bold">
                  STEP {currentStep.step} / {DEMO_STEPS.length}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                HYDERABAD FC • AUTONOMOUS WAREHOUSE FULFILLMENT STORY
              </span>
            </div>
          </div>

          <button
            onClick={() => actions.stopDemo()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Content Card */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              {currentStep.category}
            </span>
            <h3 className="text-base font-bold text-white font-sans">
              {currentStep.title}
            </h3>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          {/* AI Explainability Box (Section 41) */}
          <div className="bg-[#0A0F1E]/80 rounded-xl p-3 border border-cyan-500/30 text-xs font-mono space-y-1">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WHY THIS DECISION WAS MADE:</span>
            </div>
            <p className="text-slate-300 font-sans text-xs">
              {currentStep.aiExplanation}
            </p>
          </div>
        </div>

        {/* Progress Bar & Interactive Transport Controls */}
        <div className="space-y-3 pt-1">
          {/* Progress Line */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full transition-all duration-300"
              style={{ width: `${((currentStep.step) / DEMO_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Transport Buttons */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleGoToStep(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 flex items-center space-x-1 transition-all"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-4 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause Auto' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => handleGoToStep(Math.min(DEMO_STEPS.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === DEMO_STEPS.length - 1}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-300 flex items-center space-x-1 transition-all"
              >
                <span>Next</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span>Cam: <strong className="text-cyan-400">{currentStep.cameraPreset}</strong></span>
              <span>•</span>
              <button
                onClick={() => {
                  actions.resetSim();
                  handleGoToStep(0);
                }}
                className="text-slate-400 hover:text-white underline"
              >
                Restart Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
