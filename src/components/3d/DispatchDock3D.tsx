import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const DispatchDock3D: React.FC = () => {
  const { state } = useWarehouse();
  const { shipments } = state;

  const vanDepartureRef = useRef<number>(0);
  const vanMeshRef = useRef<THREE.Group>(null);

  // Check if any shipment was recently dispatched
  const activeShipment = Object.values(shipments).find((s) => s.status === 'IN_TRANSIT');

  useFrame((_, delta) => {
    if (activeShipment && vanMeshRef.current) {
      // Animate van smoothly departing loading dock onto exterior road
      vanDepartureRef.current = Math.min(24, vanDepartureRef.current + delta * 3.5);
      vanMeshRef.current.position.x = 34 + vanDepartureRef.current;
    } else if (!activeShipment && vanMeshRef.current) {
      vanDepartureRef.current = 0;
      vanMeshRef.current.position.x = 34;
    }
  });

  return (
    <group>
      {/* Dock Staging Ramps & Levellers */}
      {[-8, 0, 8].map((bayZ, idx) => (
        <group key={idx} position={[31, 0.45, bayZ]}>
          {/* Hydraulic Dock Leveller Plate */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4.5, 0.1, 3.2]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Bumper Pads */}
          <mesh position={[2.3, -0.1, -1.4]}>
            <boxGeometry args={[0.3, 0.6, 0.4]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[2.3, -0.1, 1.4]}>
            <boxGeometry args={[0.3, 0.6, 0.4]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Electric Delivery Vans (Parked at Loading Bays) */}

      {/* Van 1: Active Dispatched Van at Bay 0 (Z = 0) */}
      <group ref={vanMeshRef} position={[34, 0, 0]} rotation={[0, 0, 0]}>
        {/* Van Main Cargo Body */}
        <mesh position={[-0.5, 1.8, 0]} castShadow>
          <boxGeometry args={[4.5, 2.4, 2.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Blue Accent Branding Stripe */}
        <mesh position={[-0.5, 1.3, 0]}>
          <boxGeometry args={[4.52, 0.4, 2.22]} />
          <meshStandardMaterial color="#2563eb" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Driver Cab Front */}
        <group position={[2.4, 1.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.5, 2.1]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
          {/* Windshield Glass */}
          <mesh position={[0.4, 0.35, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.1, 0.8, 1.9]} />
            <meshPhysicalMaterial
              color="#00f0ff"
              transmission={0.7}
              opacity={0.4}
              transparent
              roughness={0.1}
            />
          </mesh>
          {/* Front Grille & Headlights */}
          <mesh position={[0.76, -0.2, 0]}>
            <boxGeometry args={[0.05, 0.5, 1.8]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          {/* Dual LED Headlights */}
          {[-0.7, 0.7].map((lz, lIdx) => (
            <group key={lIdx} position={[0.78, -0.1, lz]}>
              <mesh>
                <boxGeometry args={[0.04, 0.15, 0.25]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Headlight Forward Cone when Active */}
              {activeShipment && (
                <spotLight
                  position={[0.2, 0, 0]}
                  target-position={[10, 0, lz]}
                  color="#ffffff"
                  intensity={2.5}
                  angle={0.6}
                  penumbra={0.4}
                  distance={18}
                />
              )}
            </group>
          ))}
        </group>

        {/* 4 Van Wheels with Alloy Rims */}
        {[
          [-1.8, 0.45, -1.05],
          [1.8, 0.45, -1.05],
          [-1.8, 0.45, 1.05],
          [1.8, 0.45, 1.05],
        ].map(([wx, wy, wz], idx) => (
          <group key={idx} position={[wx, wy, wz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.28, 20]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
            {/* Inner Alloy Wheel Rim */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.29, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Van 2: Static Parked Delivery Van at Bay -8 */}
      <group position={[34, 0, -8]}>
        <mesh position={[-0.5, 1.8, 0]} castShadow>
          <boxGeometry args={[4.5, 2.4, 2.2]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.5, 1.3, 0]}>
          <boxGeometry args={[4.52, 0.4, 2.22]} />
          <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.3} />
        </mesh>
        <group position={[2.4, 1.25, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.5, 1.5, 2.1]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.4, 0.35, 0]} rotation={[0, 0, -0.3]}>
            <boxGeometry args={[0.1, 0.8, 1.9]} />
            <meshPhysicalMaterial
              color="#00f0ff"
              transmission={0.7}
              opacity={0.4}
              transparent
              roughness={0.1}
            />
          </mesh>
        </group>
        {[
          [-1.8, 0.45, -1.05],
          [1.8, 0.45, -1.05],
          [-1.8, 0.45, 1.05],
          [1.8, 0.45, 1.05],
        ].map(([wx, wy, wz], idx) => (
          <group key={idx} position={[wx, wy, wz]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 0.28, 20]} />
              <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
