import React from 'react';
import { Html } from '@react-three/drei';

interface ZoneBadge {
  position: [number, number, number];
  title: string;
  tag: string;
  color: string;
  borderColor: string;
  bgColor: string;
}

const ZONES: ZoneBadge[] = [
  {
    position: [-6, 5.5, -9],
    title: 'ZONE A: PICKING',
    tag: 'AISLES 1-5',
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/80',
  },
  {
    position: [-6, 5.5, 9],
    title: 'ZONE B: BULK PICKING',
    tag: 'AISLES 6-10',
    color: 'text-amber-300',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-950/80',
  },
  {
    position: [10, 5.5, -9],
    title: 'AI SLOTTING HUB',
    tag: 'GOLDEN ZONE',
    color: 'text-cyan-300',
    borderColor: 'border-cyan-500/50',
    bgColor: 'bg-cyan-950/80',
  },
  {
    position: [17, 4.5, 2],
    title: 'PACKING ZONE',
    tag: 'STATIONS 1-3',
    color: 'text-pink-300',
    borderColor: 'border-pink-500/40',
    bgColor: 'bg-pink-950/80',
  },
  {
    position: [17, 4.5, 12],
    title: 'CV QC INSPECTION',
    tag: 'VISION BAY 01',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/80',
  },
  {
    position: [29, 5.5, 0],
    title: 'DISPATCH DOCK',
    tag: 'EV FLEET BAYS 1-3',
    color: 'text-blue-300',
    borderColor: 'border-blue-500/40',
    bgColor: 'bg-blue-950/80',
  },
  {
    position: [-25, 4.0, -12],
    title: 'AGV FLEET DEPOT',
    tag: 'SOLAR CHARGING',
    color: 'text-orange-300',
    borderColor: 'border-orange-500/40',
    bgColor: 'bg-orange-950/80',
  },
  {
    position: [-25, 4.0, 12],
    title: 'CARBON INTELLIGENCE',
    tag: 'SOLAR & HVAC',
    color: 'text-emerald-300',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-950/80',
  },
];

export const ZoneLabels3D: React.FC = () => {
  return (
    <group>
      {ZONES.map((zone, idx) => (
        <group key={idx} position={zone.position}>
          <Html center distanceFactor={28} className="pointer-events-none select-none">
            <div
              className={`px-2.5 py-1 rounded-lg backdrop-blur-md border ${zone.borderColor} ${zone.bgColor} flex items-center space-x-2 shadow-lg shadow-black/50`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <div className="text-left font-mono whitespace-nowrap">
                <div className={`text-[10px] font-bold tracking-wider ${zone.color}`}>
                  {zone.title}
                </div>
                <div className="text-[8px] text-slate-400">{zone.tag}</div>
              </div>
            </div>
          </Html>
        </group>
      ))}
    </group>
  );
};
