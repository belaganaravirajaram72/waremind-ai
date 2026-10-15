import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

export const ConveyorSystem3D: React.FC = () => {
  const { state } = useWarehouse();
  const robotArmRef = useRef<THREE.Group>(null);
  const robotForearmRef = useRef<THREE.Group>(null);
  const packageOffsetRef = useRef<number>(0);
  const boxesGroupRef = useRef<THREE.Group>(null);

  // Animate robot arm and conveyor packages
  useFrame((_, delta) => {
    // Conveyor package progression
    packageOffsetRef.current = (packageOffsetRef.current + delta * 1.5) % 18;

    if (boxesGroupRef.current) {
      boxesGroupRef.current.children.forEach((child, idx) => {
        const baseZ = -4 + ((packageOffsetRef.current + idx * 4.5) % 18);
        child.position.z = baseZ;
      });
    }

    // Robotic arm articulation
    if (robotArmRef.current) {
      robotArmRef.current.rotation.y = Math.sin(Date.now() * 0.0015) * 0.7;
    }
    if (robotForearmRef.current) {
      robotForearmRef.current.rotation.x = -0.3 + Math.sin(Date.now() * 0.002) * 0.2;
    }
  });

  return (
    <group>
      {/* Main Longitudinal Conveyor Line (runs through Packing & QC to Dispatch) */}
      <group position={[17, 0.8, 5]}>
        {/* Conveyor Bed */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.2, 20]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Conveyor Belt Surface (Black textured rubber) */}
        <mesh position={[0, 0.11, 0]}>
          <boxGeometry args={[1.0, 0.02, 19.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>

        {/* Side Guard Rails */}
        <mesh position={[-0.55, 0.25, 0]}>
          <boxGeometry args={[0.06, 0.25, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.55, 0.25, 0]}>
          <boxGeometry args={[0.06, 0.25, 20]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Conveyor Support Legs */}
        {[-8, -4, 0, 4, 8].map((legZ, idx) => (
          <group key={idx} position={[0, -0.45, legZ]}>
            <mesh position={[-0.5, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0.5, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.7, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0, -0.2, 0]}>
              <boxGeometry args={[1.0, 0.04, 0.04]} />
              <meshStandardMaterial color="#334155" />
            </mesh>
          </group>
        ))}

        {/* Moving Packages along Conveyor */}
        <group ref={boxesGroupRef}>
          {[0, 1, 2, 3].map((idx) => (
            <group key={idx} position={[0, 0.3, -4 + idx * 4.5]}>
              {/* Cardboard Box Package */}
              <mesh castShadow>
                <boxGeometry args={[0.65, 0.38, 0.55]} />
                <meshStandardMaterial color="#b45309" roughness={0.8} />
              </mesh>
              {/* Shipping Label */}
              <mesh position={[0, 0.195, 0]}>
                <boxGeometry args={[0.3, 0.01, 0.2]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              {/* Barcode Lines on Label */}
              <mesh position={[0, 0.205, 0]}>
                <boxGeometry args={[0.24, 0.005, 0.1]} />
                <meshBasicMaterial color="#0f172a" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Articulated Industrial Robotic Transfer Arm */}
      <group position={[14.8, 0, 2]}>
        {/* Heavy Cast Iron Base */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.6, 0.7, 0.4, 24]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Rotating Waist Turntable */}
        <group position={[0, 0.4, 0]} ref={robotArmRef}>
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.4, 16]} />
            <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.4} />
          </mesh>

          {/* Lower Arm Boom */}
          <group position={[0, 0.4, 0]}>
            <mesh position={[0, 0.7, 0]} rotation={[0.2, 0, 0]} castShadow>
              <boxGeometry args={[0.25, 1.4, 0.25]} />
              <meshStandardMaterial color="#ea580c" metalness={0.7} roughness={0.3} />
            </mesh>

            {/* Elbow Joint & Upper Forearm */}
            <group position={[0, 1.3, 0.2]} ref={robotForearmRef}>
              <mesh castShadow>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial color="#0f172a" metalness={0.9} />
              </mesh>
              <mesh position={[0, 0.6, 0.2]} rotation={[-0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.2, 1.2, 0.2]} />
                <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.4} />
              </mesh>

              {/* End-Effector Vacuum Gripper */}
              <group position={[0, 1.1, 0.5]}>
                <mesh>
                  <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                  <meshStandardMaterial color="#38bdf8" metalness={0.8} />
                </mesh>
                {/* Suction Cups */}
                {[-0.08, 0.08].map((ox, i) =>
                  [-0.08, 0.08].map((oz, j) => (
                    <mesh key={`${i}-${j}`} position={[ox, -0.08, oz]}>
                      <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
                      <meshStandardMaterial color="#0284c7" />
                    </mesh>
                  ))
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};
