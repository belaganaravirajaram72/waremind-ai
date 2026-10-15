import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { WarehouseFloor } from './WarehouseFloor';
import { WarehouseStructure } from './WarehouseStructure';
import { StorageRacks3D } from './StorageRacks3D';
import { AGVModel3D } from './AGVModel3D';
import { WorkerModel3D } from './WorkerModel3D';
import { ConveyorSystem3D } from './ConveyorSystem3D';
import { CVInspectionTunnel3D } from './CVInspectionTunnel3D';
import { PackingStation3D } from './PackingStation3D';
import { DispatchDock3D } from './DispatchDock3D';
import { ZoneLabels3D } from './ZoneLabels3D';
import { EntityHUD3D } from './EntityHUD3D';
import { CameraController } from './CameraController';
import { useWarehouse } from '../../context/WarehouseContext';

interface WarehouseCanvasProps {
  className?: string;
}

export const WarehouseCanvas: React.FC<WarehouseCanvasProps> = ({ className = 'w-full h-full' }) => {
  const { state } = useWarehouse();
  const { filters } = state;

  return (
    <div className={`relative overflow-hidden bg-[#070b14] select-none ${className}`}>
      <Canvas
        shadows
        camera={{ position: [28, 25, 30], fov: 45, near: 0.5, far: 200 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        {/* Deep industrial fog for Unreal Engine 5 depth illusion */}
        <fog attach="fog" args={['#070b14', 45, 120]} />
        <color attach="background" args={['#070b14']} />

        {/* Cinematic Warehouse Lighting Setup */}
        <ambientLight intensity={0.7} color="#0e1726" />
        <directionalLight
          position={[16, 26, 18]}
          intensity={1.5}
          color="#f8fafc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={80}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
        />
        <directionalLight position={[-20, 16, -18]} intensity={0.6} color="#00e5ff" />

        {/* Zone Specific Key Accent Lights */}
        <pointLight position={[10, 4, -9]} color="#00f0ff" intensity={1.2} distance={15} />
        <pointLight position={[17, 4, 2]} color="#ec4899" intensity={1.2} distance={15} />
        <pointLight position={[17, 4, 12]} color="#10b981" intensity={1.4} distance={15} />
        <pointLight position={[28, 5, 0]} color="#2563eb" intensity={1.5} distance={18} />

        <Suspense fallback={null}>
          <WarehouseFloor zoneFilter={filters.zone} />
          <WarehouseStructure />
          <StorageRacks3D />
          <AGVModel3D />
          <WorkerModel3D />
          <ConveyorSystem3D />
          <CVInspectionTunnel3D />
          <PackingStation3D />
          <DispatchDock3D />
          <ZoneLabels3D />
          <EntityHUD3D />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
};
