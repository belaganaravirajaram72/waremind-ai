import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

const PRESET_CONFIGS: Record<
  string,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  OVERVIEW: {
    position: [28, 25, 30],
    target: [0, 2, 0],
  },
  PICKING: {
    position: [-6, 11, 14],
    target: [-6, 2, 0],
  },
  PACKING: {
    position: [18, 8, -8],
    target: [17, 2, 2],
  },
  QC: {
    position: [21, 6, 7],
    target: [17, 2, 12],
  },
  AGV: {
    position: [4, 12, 12],
    target: [0, 1, 0],
  },
  DISPATCH: {
    position: [34, 10, -5],
    target: [30, 2, 0],
  },
  SLOTTING: {
    position: [10, 10, 6],
    target: [10, 3, -9],
  },
};

export const CameraController: React.FC = () => {
  const { state } = useWarehouse();
  const { cameraPreset } = state;
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetCamPos = useRef(new THREE.Vector3(...PRESET_CONFIGS.OVERVIEW.position));
  const targetLookAt = useRef(new THREE.Vector3(...PRESET_CONFIGS.OVERVIEW.target));

  useEffect(() => {
    const config = PRESET_CONFIGS[cameraPreset] || PRESET_CONFIGS.OVERVIEW;
    targetCamPos.current.set(...config.position);
    targetLookAt.current.set(...config.target);
  }, [cameraPreset]);

  useFrame(() => {
    // Smooth lerp to camera target preset
    camera.position.lerp(targetCamPos.current, 0.05);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, 0.05);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.05}
      minDistance={6}
      maxDistance={75}
    />
  );
};
