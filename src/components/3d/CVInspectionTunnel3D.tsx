import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const CVInspectionTunnel3D: React.FC = () => {
  const { state } = useWarehouse();
  const { qcInspections, exceptions } = state;
  const laserRef = useRef<THREE.Mesh>(null);
  const warningLightRef = useRef<THREE.PointLight>(null);

  // Check if there is an active QC failure or damaged package
  const hasDamageAlert = Object.values(exceptions).some(
    (e) => (e.type === 'DAMAGED_PACKAGE' || e.type === 'MISPICK') && e.status !== 'RESOLVED'
  );

  const latestQC = Object.values(qcInspections)[0];
  const isFail = hasDamageAlert || (latestQC && latestQC.result === 'FAIL');

  useFrame((_, delta) => {
    // Laser scanning sweep animation
    if (laserRef.current) {
      laserRef.current.position.y = 1.0 + Math.sin(Date.now() * 0.005) * 0.25;
    }
    // Warning beacon pulse if failure
    if (warningLightRef.current) {
      warningLightRef.current.intensity = isFail ? 1.5 + Math.sin(Date.now() * 0.01) * 1.0 : 0.4;
    }
  });

  const scanColor = isFail ? '#ef4444' : '#10b981';

  return (
    <group position={[17, 0, 12]}>
      {/* Heavy Steel Tunnel Arch Frame */}
      {/* Left Column */}
      <mesh position={[-1.0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.25, 2.8, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Right Column */}
      <mesh position={[1.0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.25, 2.8, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Top Inspection Canopy Roof */}
      <mesh position={[0, 2.7, 0]} castShadow>
        <boxGeometry args={[2.2, 0.3, 2.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Front & Rear Portal Bevel Trims */}
      <mesh position={[0, 2.7, -1.1]}>
        <boxGeometry args={[2.24, 0.08, 0.08]} />
        <meshBasicMaterial color={scanColor} />
      </mesh>
      <mesh position={[0, 2.7, 1.1]}>
        <boxGeometry args={[2.24, 0.08, 0.08]} />
        <meshBasicMaterial color={scanColor} />
      </mesh>

      {/* Dual Overhead High-Resolution Computer Vision Cameras */}
      {[-0.4, 0.4].map((camX, idx) => (
        <group key={idx} position={[camX, 2.45, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
            <meshStandardMaterial color="#0284c7" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Camera Lens Glass */}
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      ))}

      {/* Barcode & Dimensioning Side Array Sensors */}
      {[-0.85, 0.85].map((sensorX, idx) => (
        <group key={idx} position={[sensorX, 1.4, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 0.6, 1.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Infrared Sensor Matrix Dots */}
          {[-0.4, 0, 0.4].map((sz, sIdx) => (
            <mesh key={sIdx} position={[sensorX > 0 ? -0.035 : 0.035, 0, sz]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color={scanColor} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Pulsating Animated Laser Inspection Plane */}
      <mesh ref={laserRef} position={[0, 1.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, 1.8]} />
        <meshBasicMaterial
          color={scanColor}
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Overhead Status Beacon Light */}
      <group position={[0, 3.0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.12, 0.2, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={scanColor} />
        </mesh>
        <pointLight
          ref={warningLightRef}
          position={[0, 0.2, 0]}
          color={scanColor}
          intensity={0.8}
          distance={8}
          decay={2}
        />
      </group>

      {/* Rejection Lane / Defect Diverter Pneumatic Arm */}
      <group position={[1.1, 0.8, 1.4]}>
        <mesh rotation={[0, isFail ? 0.6 : 0, 0]}>
          <boxGeometry args={[0.08, 0.25, 1.2]} />
          <meshStandardMaterial color="#ef4444" metalness={0.7} />
        </mesh>
      </group>
    </group>
  );
};
