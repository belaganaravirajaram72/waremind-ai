import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const WorkerModel3D: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { workers, selectedEntity, bins } = state;
  const pulseRef = useRef<number>(0);

  useFrame((_, delta) => {
    pulseRef.current += delta * 3;
  });

  return (
    <group>
      {Object.values(workers).map((worker) => {
        const isSelected = selectedEntity.type === 'WORKER' && selectedEntity.id === worker.id;
        const targetBin = worker.currentBinId ? bins[worker.currentBinId] : null;

        // Path from worker to target bin
        const arPoints = targetBin
          ? [
              [worker.x, 0.05, worker.z] as [number, number, number],
              [worker.x, 0.05, targetBin.z] as [number, number, number],
              [targetBin.x, 0.05, targetBin.z] as [number, number, number],
            ]
          : null;

        return (
          <group key={worker.id}>
            {/* Holographic AR Path Ribbon from Worker to Target Bin */}
            {arPoints && worker.status === 'PICKING' && (
              <group>
                <Line points={arPoints} color="#a855f7" lineWidth={3} transparent opacity={0.8} />
                {/* Target Bin Pick Beacon */}
                {targetBin && (
                  <mesh position={[targetBin.x, 0.06, targetBin.z]}>
                    <ringGeometry args={[0.4, 0.6, 24]} />
                    <meshBasicMaterial color="#c084fc" transparent opacity={0.7} side={THREE.DoubleSide} />
                  </mesh>
                )}
              </group>
            )}

            {/* Worker Humanoid Mesh */}
            <group
              position={[worker.x, 0, worker.z]}
              onClick={(e) => {
                e.stopPropagation();
                actions.selectEntity('WORKER', worker.id);
              }}
            >
              {/* Boots / Shoes */}
              <mesh position={[-0.15, 0.1, 0]} castShadow>
                <boxGeometry args={[0.16, 0.2, 0.3]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>
              <mesh position={[0.15, 0.1, 0]} castShadow>
                <boxGeometry args={[0.16, 0.2, 0.3]} />
                <meshStandardMaterial color="#0f172a" roughness={0.9} />
              </mesh>

              {/* Work Trousers / Legs */}
              <mesh position={[-0.15, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.7} />
              </mesh>
              <mesh position={[0.15, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.7} />
              </mesh>

              {/* Torso & High-Vis Safety Vest */}
              <group position={[0, 1.05, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.5, 0.6, 0.26]} />
                  <meshStandardMaterial color="#facc15" roughness={0.5} />
                </mesh>
                {/* Reflective Silver Stripes */}
                <mesh position={[0, 0.05, 0.135]}>
                  <boxGeometry args={[0.46, 0.08, 0.01]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.1} />
                </mesh>
                <mesh position={[0, -0.15, 0.135]}>
                  <boxGeometry args={[0.46, 0.08, 0.01]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.1} />
                </mesh>
              </group>

              {/* Arms holding AR Scanner / Terminal */}
              <mesh position={[-0.32, 1.0, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
                <meshStandardMaterial color="#facc15" roughness={0.6} />
              </mesh>
              <mesh position={[0.32, 1.0, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.4, 12]} />
                <meshStandardMaterial color="#facc15" roughness={0.6} />
              </mesh>

              {/* Handheld Smart RF Terminal Scanner */}
              <mesh position={[0, 0.95, 0.3]}>
                <boxGeometry args={[0.22, 0.04, 0.16]} />
                <meshStandardMaterial color="#0284c7" metalness={0.7} />
              </mesh>
              {/* Terminal Screen Glow */}
              <mesh position={[0, 0.975, 0.3]}>
                <boxGeometry args={[0.18, 0.01, 0.12]} />
                <meshBasicMaterial color="#00f0ff" />
              </mesh>

              {/* Head */}
              <mesh position={[0, 1.5, 0]} castShadow>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshStandardMaterial color="#d4a373" roughness={0.8} />
              </mesh>

              {/* Industrial Safety Hardhat */}
              <mesh position={[0, 1.62, 0]} castShadow>
                <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} />
              </mesh>
              {/* Hardhat Rim */}
              <mesh position={[0, 1.58, 0.03]} rotation={[0.1, 0, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.02, 16]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.3} />
              </mesh>
              {/* Smart Glasses / AR HUD Visor */}
              <mesh position={[0, 1.52, 0.14]}>
                <boxGeometry args={[0.22, 0.05, 0.06]} />
                <meshBasicMaterial color="#a855f7" transparent opacity={0.8} />
              </mesh>

              {/* Selection Circle Halo */}
              {isSelected && (
                <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.6, 0.75, 24]} />
                  <meshBasicMaterial color="#a855f7" side={THREE.DoubleSide} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}
    </group>
  );
};
