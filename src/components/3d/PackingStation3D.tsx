import React from 'react';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const PackingStation3D: React.FC = () => {
  const { state } = useWarehouse();
  const { packingStations } = state;

  return (
    <group>
      {Object.values(packingStations).map((station) => {
        const isPacking = station.status === 'PACKING';

        return (
          <group key={station.id} position={[station.x, 0, station.z]}>
            {/* Main Workbench Desk */}
            <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.2, 0.9, 1.2]} />
              <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
            </mesh>

            {/* Stainless Steel Work Surface Top */}
            <mesh position={[0, 0.92, 0]} receiveShadow>
              <boxGeometry args={[2.24, 0.04, 1.24]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Electronic Tare Weight Scale Insert */}
            <mesh position={[-0.4, 0.945, 0]}>
              <boxGeometry args={[0.7, 0.02, 0.5]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Packaging Supply Shelves (Carton dispenser tower) */}
            <group position={[0.7, 1.4, -0.4]}>
              <mesh>
                <boxGeometry args={[0.6, 0.9, 0.35]} />
                <meshStandardMaterial color="#334155" metalness={0.6} />
              </mesh>
              {/* Folded flat boxes */}
              {[0.1, 0.25, 0.4].map((oy, idx) => (
                <mesh key={idx} position={[0, -0.3 + oy, 0.05]}>
                  <boxGeometry args={[0.5, 0.03, 0.25]} />
                  <meshStandardMaterial color="#b45309" roughness={0.9} />
                </mesh>
              ))}
            </group>

            {/* Overhead Monitor Display Screen (Touchscreen Console) */}
            <group position={[-0.4, 1.6, -0.4]}>
              {/* Mounting Arm */}
              <mesh position={[0, -0.3, 0]}>
                <cylinderGeometry args={[0.03, 0.03, 0.6, 12]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} />
              </mesh>
              {/* Screen Enclosure */}
              <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.6, 0.4, 0.05]} />
                <meshStandardMaterial color="#020617" roughness={0.3} />
              </mesh>
              {/* Screen Glowing Face */}
              <mesh position={[0, 0, 0.03]} rotation={[0.2, 0, 0]}>
                <boxGeometry args={[0.54, 0.34, 0.01]} />
                <meshBasicMaterial color={isPacking ? '#ec4899' : '#00f0ff'} />
              </mesh>
            </group>

            {/* Assembled Shipping Box in Process */}
            {isPacking && (
              <mesh position={[-0.4, 1.15, 0]} castShadow>
                <boxGeometry args={[0.5, 0.36, 0.4]} />
                <meshStandardMaterial color="#b45309" roughness={0.7} />
              </mesh>
            )}

            {/* Station Status Glowing Light Base Ring */}
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.3, 1.45, 24]} />
              <meshBasicMaterial
                color={isPacking ? '#ec4899' : '#00f0ff'}
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
