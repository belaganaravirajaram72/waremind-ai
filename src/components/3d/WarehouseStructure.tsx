import React, { useMemo } from 'react';
import * as THREE from 'three';

export const WarehouseStructure: React.FC = () => {
  // Generate perimeter column positions
  const columnPositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    const xMin = -34, xMax = 34, zMin = -26, zMax = 26;

    // West and East wall columns
    for (let z = zMin; z <= zMax; z += 13) {
      pos.push([xMin, 5, z]);
      pos.push([xMax, 5, z]);
    }
    // North and South wall columns
    for (let x = xMin + 13.6; x < xMax; x += 13.6) {
      pos.push([x, 5, zMin]);
      pos.push([x, 5, zMax]);
    }
    return pos;
  }, []);

  // Roof truss bars
  const trussXPositions = [-24, -12, 0, 12, 24];

  return (
    <group>
      {/* Perimeter Columns */}
      {columnPositions.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 10, 0.7]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Column Footing Plate */}
          <mesh position={[0, -4.9, 0]}>
            <boxGeometry args={[1.2, 0.2, 1.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Glass Perimeter Walls (Semi-transparent dark industrial glass) */}
      {/* North Wall */}
      <mesh position={[0, 5, -26]}>
        <boxGeometry args={[68, 10, 0.1]} />
        <meshPhysicalMaterial
          color="#0e1e38"
          transmission={0.6}
          opacity={0.25}
          transparent
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
      {/* South Wall */}
      <mesh position={[0, 5, 26]}>
        <boxGeometry args={[68, 10, 0.1]} />
        <meshPhysicalMaterial
          color="#0e1e38"
          transmission={0.6}
          opacity={0.25}
          transparent
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
      {/* West Wall */}
      <mesh position={[-34, 5, 0]}>
        <boxGeometry args={[0.1, 10, 52]} />
        <meshPhysicalMaterial
          color="#0e1e38"
          transmission={0.6}
          opacity={0.25}
          transparent
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>

      {/* East Wall - With 3 Roll-up Loading Dock Openings */}
      {/* East Upper Header */}
      <mesh position={[34, 8.5, 0]}>
        <boxGeometry args={[0.1, 3, 52]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* East Wall Solid Spans between doors */}
      <mesh position={[34, 3.5, -20]}>
        <boxGeometry args={[0.1, 7, 12]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[34, 3.5, 20]}>
        <boxGeometry args={[0.1, 7, 12]} />
        <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Loading Dock Bay Portals (Bay 01, Bay 02, Bay 03) */}
      {[-8, 0, 8].map((bayZ, idx) => (
        <group key={idx} position={[33.95, 3.5, bayZ]}>
          {/* Roll-up Shutter Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 6.8, 5.2]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.5} />
          </mesh>
          {/* Slatted Industrial Roll-up Shutter (Partially Open) */}
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[0.15, 3.2, 4.8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
          </mesh>
          {/* Dock Seal Cushions */}
          <mesh position={[0.2, 0, -2.5]}>
            <boxGeometry args={[0.4, 6.8, 0.4]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[0.2, 0, 2.5]}>
            <boxGeometry args={[0.4, 6.8, 0.4]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
          <mesh position={[0.2, 3.4, 0]}>
            <boxGeometry args={[0.4, 0.4, 5.4]} />
            <meshStandardMaterial color="#020617" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Overhead Roof Trusses & Structural Rafters */}
      {trussXPositions.map((trussX, idx) => (
        <group key={idx} position={[trussX, 9.8, 0]}>
          {/* Main Horizontal Beam */}
          <mesh>
            <boxGeometry args={[0.4, 0.5, 52]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Overhead LED Linear Light Strip */}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.15, 0.05, 46]} />
            <meshBasicMaterial color="#93c5fd" />
          </mesh>
          {/* Subtle LED Glow Point */}
          <pointLight position={[0, -0.6, 0]} color="#93c5fd" intensity={0.6} distance={20} decay={2} />
        </group>
      ))}
    </group>
  );
};
