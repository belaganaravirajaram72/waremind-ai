import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useWarehouse } from '../../context/WarehouseContext';

const CATEGORY_COLORS: Record<string, string> = {
  ELECTRONICS: '#00f0ff',
  ROBOTICS: '#3b82f6',
  BATTERIES: '#f59e0b',
  FASTENERS: '#a855f7',
  PHARMA: '#10b981',
  TOOLS: '#64748b',
  SENSORS: '#ec4899',
};

export const StorageRacks3D: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { racks, bins, skus, selectedEntity, filters } = state;

  const targetSku = skus['SKU-WH-204'];
  const suggestedBinId = 'BIN-A-04';

  return (
    <group>
      {racks.map((rack) => {
        // Filter by zone if applied
        if (filters.zone !== 'ALL' && rack.zone !== filters.zone) {
          return null;
        }

        const isGoldenZone = rack.id === 'RACK-A2' || rack.id === 'RACK-A3';

        return (
          <group key={rack.id} position={[rack.x, 0, rack.z]}>
            {/* 4 Upright Steel Frame Posts */}
            {[
              [-rack.width / 2, -rack.depth / 2],
              [rack.width / 2, -rack.depth / 2],
              [-rack.width / 2, rack.depth / 2],
              [rack.width / 2, rack.depth / 2],
            ].map(([ox, oz], idx) => (
              <mesh key={idx} position={[ox, rack.height / 2, oz]} castShadow>
                <boxGeometry args={[0.08, rack.height, 0.08]} />
                <meshStandardMaterial
                  color={isGoldenZone ? '#00e5ff' : '#ea580c'}
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            ))}

            {/* 3 Shelf Beam Levels */}
            {[1, 2, 3].map((lvl) => {
              const yPos = (lvl - 1) * 1.5 + 0.2;
              return (
                <group key={lvl} position={[0, yPos, 0]}>
                  {/* Front and back load beams */}
                  <mesh position={[0, 0, -rack.depth / 2]}>
                    <boxGeometry args={[rack.width, 0.08, 0.05]} />
                    <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 0, rack.depth / 2]}>
                    <boxGeometry args={[rack.width, 0.08, 0.05]} />
                    <meshStandardMaterial color="#f97316" metalness={0.6} roughness={0.4} />
                  </mesh>
                  {/* Shelf Decking Platform */}
                  <mesh position={[0, 0.02, 0]}>
                    <boxGeometry args={[rack.width - 0.1, 0.02, rack.depth - 0.1]} />
                    <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
                  </mesh>
                </group>
              );
            })}

            {/* Render Bins belonging to this rack */}
            {rack.binIds.map((binId) => {
              const bin = bins[binId];
              if (!bin) return null;

              const sku = bin.currentSKUId ? skus[bin.currentSKUId] : null;
              const isSelected = selectedEntity.type === 'BIN' && selectedEntity.id === bin.id;
              const isTargetSkuCurrent = targetSku && targetSku.currentBinId === bin.id;
              const isTargetSkuSuggested = bin.id === suggestedBinId;

              // Bin relative coordinates inside this rack group
              const relX = bin.x - rack.x;
              const relY = bin.y;
              const relZ = bin.z - rack.z;

              const binColor = sku
                ? CATEGORY_COLORS[sku.category] || '#38bdf8'
                : '#1e293b';

              return (
                <group
                  key={bin.id}
                  position={[relX, relY, relZ]}
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.selectEntity('BIN', bin.id);
                  }}
                >
                  {/* Storage Bin Tote */}
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[1.3, 0.55, 0.9]} />
                    <meshStandardMaterial
                      color={
                        isSelected
                          ? '#ffffff'
                          : isTargetSkuCurrent
                          ? '#a855f7'
                          : isTargetSkuSuggested
                          ? '#00f0ff'
                          : binColor
                      }
                      roughness={0.3}
                      metalness={0.2}
                      emissive={
                        isSelected
                          ? '#00f0ff'
                          : isTargetSkuSuggested
                          ? '#00f0ff'
                          : isTargetSkuCurrent
                          ? '#a855f7'
                          : '#000000'
                      }
                      emissiveIntensity={isSelected || isTargetSkuSuggested || isTargetSkuCurrent ? 0.6 : 0}
                    />
                  </mesh>

                  {/* Bin Lip & Compartment Divider */}
                  <mesh position={[0, 0.28, 0]}>
                    <boxGeometry args={[1.34, 0.06, 0.94]} />
                    <meshStandardMaterial color="#0f172a" roughness={0.6} />
                  </mesh>

                  {/* Stored Cargo Contents (Boxes/Parcels inside tote if occupied) */}
                  {bin.occupiedQty > 0 && (
                    <group position={[0, 0.35, 0]}>
                      <mesh castShadow>
                        <boxGeometry args={[0.9, 0.3, 0.65]} />
                        <meshStandardMaterial color="#b45309" roughness={0.7} />
                      </mesh>
                    </group>
                  )}

                  {/* Selection / Optimization Highlight Glow Beacon */}
                  {(isSelected || isTargetSkuSuggested || isTargetSkuCurrent) && (
                    <mesh position={[0, 0.8, 0]}>
                      <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
                      <meshBasicMaterial
                        color={isTargetSkuCurrent ? '#c084fc' : '#22d3ee'}
                        transparent
                        opacity={0.7}
                      />
                    </mesh>
                  )}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Dynamic Slotting Animated Migration Arc (C-18 to A-04) if move is pending */}
      {targetSku && targetSku.currentBinId !== suggestedBinId && (
        <group>
          {/* Dynamic Relocation Hologram Curve */}
          <mesh position={[6, 3.5, 0]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshBasicMaterial color="#00f0ff" />
          </mesh>
        </group>
      )}
    </group>
  );
};
