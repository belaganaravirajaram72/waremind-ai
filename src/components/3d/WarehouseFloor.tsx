import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';

interface WarehouseFloorProps {
  zoneFilter?: string;
}

export const WarehouseFloor: React.FC<WarehouseFloorProps> = ({ zoneFilter = 'ALL' }) => {
  // Create neon grid texture procedurally
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a0f1e';
      ctx.fillRect(0, 0, 256, 256);

      // Outer border
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 256, 256);

      // Fine subgrid
      ctx.strokeStyle = '#111e38';
      ctx.lineWidth = 0.5;
      for (let i = 32; i < 256; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 256);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(256, i);
        ctx.stroke();
      }

      // Neon dot intersections
      ctx.fillStyle = '#00f0ff';
      for (let x = 0; x <= 256; x += 64) {
        for (let y = 0; y <= 256; y += 64) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 12);
    return texture;
  }, []);

  return (
    <group>
      {/* Main Warehouse Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[68, 52]} />
        <meshStandardMaterial
          map={gridTexture}
          roughness={0.4}
          metalness={0.7}
          color="#0d1527"
        />
      </mesh>

      {/* Exterior Ground Apron */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[84, 68]} />
        <meshStandardMaterial color="#060913" roughness={0.9} metalness={0.2} />
      </mesh>

      {/* Operational Zone Perimeter Lines & Glows */}

      {/* 🟡 ZONE A & B (Picking Aisles) */}
      <group position={[-6, 0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[26, 34]} />
          <meshBasicMaterial
            color="#eab308"
            transparent
            opacity={zoneFilter === 'ALL' || zoneFilter === 'ZONE_A' || zoneFilter === 'ZONE_B' ? 0.06 : 0.02}
          />
        </mesh>
        <Line
          points={[
            [-13, 0.02, -17],
            [13, 0.02, -17],
            [13, 0.02, 17],
            [-13, 0.02, 17],
            [-13, 0.02, -17],
          ]}
          color="#facc15"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      </group>

      {/* 🔷 AI SLOTTING GOLDEN ZONE */}
      <group position={[10, 0.015, -9]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 12]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.08} />
        </mesh>
        <Line
          points={[
            [-7, 0.02, -6],
            [7, 0.02, -6],
            [7, 0.02, 6],
            [-7, 0.02, 6],
            [-7, 0.02, -6],
          ]}
          color="#00f0ff"
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      </group>

      {/* 🩷 PACKING ZONE */}
      <group position={[17, 0.01, 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 16]} />
          <meshBasicMaterial color="#ec4899" transparent opacity={0.07} />
        </mesh>
        <Line
          points={[
            [-6, 0.02, -8],
            [6, 0.02, -8],
            [6, 0.02, 8],
            [-6, 0.02, 8],
            [-6, 0.02, -8],
          ]}
          color="#f43f5e"
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      </group>

      {/* 🟢 CV QC ZONE */}
      <group position={[17, 0.01, 14]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[12, 6]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.08} />
        </mesh>
        <Line
          points={[
            [-6, 0.02, -3],
            [6, 0.02, -3],
            [6, 0.02, 3],
            [-6, 0.02, 3],
            [-6, 0.02, -3],
          ]}
          color="#22c55e"
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      </group>

      {/* 🔵 DISPATCH ZONE */}
      <group position={[28, 0.01, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 36]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.07} />
        </mesh>
        <Line
          points={[
            [-5, 0.02, -18],
            [5, 0.02, -18],
            [5, 0.02, 18],
            [-5, 0.02, 18],
            [-5, 0.02, -18],
          ]}
          color="#3b82f6"
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      </group>

      {/* 🟠 AGV CHARGING & PARKING DEPOT */}
      <group position={[-25, 0.01, -12]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.07} />
        </mesh>
        <Line
          points={[
            [-5, 0.02, -5],
            [5, 0.02, -5],
            [5, 0.02, 5],
            [-5, 0.02, 5],
            [-5, 0.02, -5],
          ]}
          color="#fb923c"
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      </group>

      {/* 🌱 CARBON & SUSTAINABILITY HUB */}
      <group position={[-25, 0.01, 12]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.06} />
        </mesh>
        <Line
          points={[
            [-5, 0.02, -5],
            [5, 0.02, -5],
            [5, 0.02, 5],
            [-5, 0.02, 5],
            [-5, 0.02, -5],
          ]}
          color="#34d399"
          lineWidth={2}
          transparent
          opacity={0.6}
        />
      </group>

      {/* Floor Hazard Stripes at Dock Entrance */}
      {[-12, -6, 0, 6, 12].map((z, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[23.5, 0.012, z]}>
          <planeGeometry args={[0.6, 2.5]} />
          <meshBasicMaterial color="#facc15" />
        </mesh>
      ))}
    </group>
  );
};
