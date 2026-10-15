import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const AGVModel3D: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { agvs, selectedEntity, filters } = state;
  const lidarRef = useRef<THREE.Group>(null);

  // Rotate LiDAR sensors smoothly
  useFrame((_, delta) => {
    if (lidarRef.current) {
      lidarRef.current.rotation.y += delta * 6;
    }
  });

  return (
    <group>
      {Object.values(agvs).map((agv) => {
        const isSelected = selectedEntity.type === 'AGV' && selectedEntity.id === agv.id;
        const isCharging = agv.status === 'CHARGING';
        const isEnRoute = agv.status === 'EN_ROUTE';

        const statusColor = isCharging
          ? '#f59e0b'
          : isEnRoute
          ? '#f97316'
          : '#10b981';

        // Calculate heading angle based on destination
        const dx = agv.targetX - agv.currentX;
        const dz = agv.targetZ - agv.currentZ;
        const angle = Math.atan2(dx, dz);

        // Path waypoints for Drei Line
        const points = agv.route.map((wp) => [wp.x, 0.05, wp.z] as [number, number, number]);

        return (
          <group key={agv.id}>
            {/* Glowing Route Waypoints Ribbon */}
            {filters.showRoutes && points.length >= 2 && (
              <Line
                points={points}
                color={agv.isRerouted ? '#00f0ff' : '#f97316'}
                lineWidth={2}
                transparent
                opacity={0.7}
              />
            )}

            {/* Target Waypoint Marker Cylinder */}
            {filters.showRoutes && isEnRoute && (
              <mesh position={[agv.targetX, 0.04, agv.targetZ]}>
                <ringGeometry args={[0.3, 0.5, 16]} />
                <meshBasicMaterial color="#f97316" transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
            )}

            {/* Main AGV Physical Unit */}
            <group
              position={[agv.currentX, 0.25, agv.currentZ]}
              rotation={[0, angle, 0]}
              onClick={(e) => {
                e.stopPropagation();
                actions.selectEntity('AGV', agv.id);
              }}
            >
              {/* Lower Drive Chassis Base */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[1.4, 0.35, 1.8]} />
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>

              {/* High-visibility Safety Orange Armor Skirt */}
              <mesh position={[0, 0.02, 0]}>
                <boxGeometry args={[1.44, 0.16, 1.84]} />
                <meshStandardMaterial
                  color={agv.isRerouted ? '#0284c7' : '#ea580c'}
                  metalness={0.5}
                  roughness={0.4}
                />
              </mesh>

              {/* 4 Corner Omni-wheels */}
              {[
                [-0.65, -0.1, -0.6],
                [0.65, -0.1, -0.6],
                [-0.65, -0.1, 0.6],
                [0.65, -0.1, 0.6],
              ].map(([wx, wy, wz], idx) => (
                <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.15, 0.15, 0.12, 16]} />
                  <meshStandardMaterial color="#020617" roughness={0.8} />
                </mesh>
              ))}

              {/* Optical LiDAR Scanner Dome (Front Mounted) */}
              <group position={[0, 0.25, 0.7]} ref={lidarRef}>
                <mesh>
                  <cylinderGeometry args={[0.12, 0.14, 0.15, 16]} />
                  <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
                </mesh>
                {/* Scanner laser lens dot */}
                <mesh position={[0, 0, 0.12]}>
                  <boxGeometry args={[0.04, 0.04, 0.02]} />
                  <meshBasicMaterial color="#00f0ff" />
                </mesh>
              </group>

              {/* 360-Degree LED Status Glow Ring */}
              <mesh position={[0, 0.19, 0]}>
                <boxGeometry args={[1.36, 0.04, 1.76]} />
                <meshBasicMaterial color={statusColor} />
              </mesh>

              {/* Cargo Payload Deck on Top */}
              <group position={[0, 0.35, -0.1]}>
                {/* Pallet Base */}
                <mesh castShadow>
                  <boxGeometry args={[1.1, 0.08, 1.1]} />
                  <meshStandardMaterial color="#78350f" roughness={0.8} />
                </mesh>
                {/* Transport Container Box */}
                <mesh position={[0, 0.28, 0]} castShadow>
                  <boxGeometry args={[0.95, 0.48, 0.95]} />
                  <meshStandardMaterial
                    color={agv.carryingOrderId ? '#0284c7' : '#334155'}
                    roughness={0.4}
                  />
                </mesh>
              </group>

              {/* Battery Indicator Bar (Green/Amber/Red) */}
              <mesh position={[0.55, 0.18, 0]}>
                <boxGeometry args={[0.02, 0.06, 0.5]} />
                <meshBasicMaterial
                  color={agv.batteryPct > 50 ? '#22c55e' : agv.batteryPct > 20 ? '#eab308' : '#ef4444'}
                />
              </mesh>

              {/* Selection Halo Ring */}
              {isSelected && (
                <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[1.2, 1.4, 32]} />
                  <meshBasicMaterial color="#00f0ff" side={THREE.DoubleSide} />
                </mesh>
              )}
            </group>
          </group>
        );
      })}

      {/* AGV Charging Pads at Depot */}
      {[-14, -12, -10, -8].map((padZ, idx) => (
        <group key={idx} position={[-25, 0.02, padZ]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.8, 24]} />
            <meshBasicMaterial color="#f97316" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Charger Terminal Post */}
          <mesh position={[-1.2, 0.6, 0]}>
            <boxGeometry args={[0.3, 1.2, 0.3]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-1.0, 0.9, 0]}>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshBasicMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}
    </group>
  );
};
