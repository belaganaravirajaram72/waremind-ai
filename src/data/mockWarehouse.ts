import type {
  ProductSKU,
  BinLocation,
  StorageRack,
  CustomerOrder,
  WarehouseWorker,
  AGVFleetVehicle,
  PackingStation,
  PackageUnit,
  QCInspectionResult,
  WarehouseException,
  ShipmentDispatch,
  CarbonRecord,
  SimulationEventLedgerEntry,
  AIDecisionAudit,
  WarehouseState,
} from '../types/warehouse';

// Deterministic Pseudo-Random Generator for repeatable seeds
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = pseudoRandom(1337);

// Generate 20 Racks & 48 Bins with 3D coordinates
export function generateRacksAndBins(): { racks: StorageRack[]; bins: Record<string, BinLocation> } {
  const racks: StorageRack[] = [];
  const bins: Record<string, BinLocation> = {};

  const zones: Array<'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D'> = ['ZONE_A', 'ZONE_B', 'ZONE_C', 'ZONE_D'];
  const zoneOffsets = {
    ZONE_A: { x: -16, z: -8 },
    ZONE_B: { x: -16, z: 8 },
    ZONE_C: { x: 4, z: -8 },
    ZONE_D: { x: 4, z: 8 },
  };

  let rackCounter = 1;

  zones.forEach((zone) => {
    const offset = zoneOffsets[zone];
    for (let r = 0; r < 5; r++) {
      const rackId = `RACK-${zone.slice(-1)}${r + 1}`;
      const rackX = offset.x + r * 6;
      const rackZ = offset.z;
      const binIds: string[] = [];

      // 3 levels per rack, 2 slots per level = 6 bins per rack
      for (let level = 1; level <= 3; level++) {
        for (let shelf = 1; shelf <= 2; shelf++) {
          const binCode = `${zone.slice(-1)}-${String(rackCounter * 2 + shelf).padStart(2, '0')}`;
          const binId = `BIN-${binCode}`;
          binIds.push(binId);

          // Calculate approximate distance to packing station (at x: 20, z: 0)
          const binX = rackX + (shelf === 1 ? -1 : 1);
          const binY = (level - 1) * 1.5 + 0.5;
          const binZ = rackZ;
          const distToPacking = Math.round(Math.hypot(20 - binX, 0 - binZ) * 10) / 10;

          bins[binId] = {
            id: binId,
            rackId,
            zone,
            aisle: r + 1,
            shelf,
            level,
            x: binX,
            y: binY,
            z: binZ,
            maxWeightKg: 150,
            currentSKUId: null, // assigned during SKU generation
            occupiedQty: 0,
            reservedQty: 0,
            distanceToPackingMeters: distToPacking,
          };
        }
      }

      racks.push({
        id: rackId,
        zone,
        x: rackX,
        z: rackZ,
        width: 3.6,
        height: 5.0,
        depth: 1.6,
        binIds,
      });

      rackCounter++;
    }
  });

  return { racks, bins };
}

// Generate 54 realistic SKUs
export function generateSKUs(binIds: string[]): Record<string, ProductSKU> {
  const skuTemplates = [
    { name: 'Wireless Industrial Headphones', cat: 'ELECTRONICS', price: 129, weight: 0.4 },
    { name: 'AGV Lidar Optical Sensor V4', cat: 'SENSORS', price: 680, weight: 0.8 },
    { name: 'Lithium Iron 48V Battery Module', cat: 'BATTERIES', price: 420, weight: 8.5 },
    { name: 'Titanium M6 Hex Flange Fasteners (100pk)', cat: 'FASTENERS', price: 45, weight: 1.2 },
    { name: 'Robotic Gripper Pneumatic Actuator', cat: 'ROBOTICS', price: 310, weight: 2.1 },
    { name: 'Cold-Chain Insulin Vaccine Pack', cat: 'PHARMA', price: 540, weight: 0.6 },
    { name: 'Brushless Torque Driver 18V', cat: 'TOOLS', price: 195, weight: 1.8 },
    { name: 'Thermal Imaging Inspection Module', cat: 'SENSORS', price: 890, weight: 0.5 },
    { name: 'High-Speed Conveyor Bearing Assembly', cat: 'ROBOTICS', price: 85, weight: 3.4 },
    { name: 'Emergency Spill Containment Kit', cat: 'TOOLS', price: 110, weight: 4.2 },
    { name: 'Embedded Edge AI Controller Nano', cat: 'ELECTRONICS', price: 275, weight: 0.3 },
    { name: 'Industrial RFID Long-Range Transceiver', cat: 'SENSORS', price: 160, weight: 0.4 },
    { name: 'Precision Caliper Micrometer Pro', cat: 'TOOLS', price: 75, weight: 0.5 },
    { name: 'Sterile Biometric Specimen Vials', cat: 'PHARMA', price: 210, weight: 0.9 },
    { name: 'Heavy Duty Structural M12 Anchors', cat: 'FASTENERS', price: 62, weight: 5.1 },
    { name: 'Smart IoT Vibration Telemetry Tag', cat: 'SENSORS', price: 48, weight: 0.15 },
    { name: 'High-Current Battery Connector Harness', cat: 'BATTERIES', price: 38, weight: 0.7 },
    { name: 'Pneumatic Hose Quick-Release Valve', cat: 'FASTENERS', price: 28, weight: 0.3 },
  ];

  const skus: Record<string, ProductSKU> = {};

  // Build 54 SKUs
  for (let i = 0; i < 54; i++) {
    const tmpl = skuTemplates[i % skuTemplates.length];
    const skuCode = `SKU-WH-${200 + i}`;
    const assignedBinId = binIds[i % binIds.length];
    const optimalBinId = binIds[Math.floor(rng() * Math.min(10, binIds.length))]; // high frequency items belong in front

    // Generate 30 days of historical demand
    const baseDemand = 8 + Math.floor(rng() * 35);
    const historicalDemand: number[] = [];
    for (let d = 0; d < 30; d++) {
      const dailyFluctuation = Math.floor((rng() - 0.45) * 12);
      historicalDemand.push(Math.max(1, baseDemand + dailyFluctuation));
    }

    const demandVelocity = Math.round((historicalDemand.slice(-7).reduce((a, b) => a + b, 0) / 7) * 10) / 10;
    const forecastDemandNext7d = Math.round(demandVelocity * 7 * (1.05 + rng() * 0.15));

    const totalStock = 25 + Math.floor(rng() * 120);
    const reservedStock = Math.floor(rng() * Math.min(15, totalStock * 0.3));
    const availableStock = totalStock - reservedStock;
    const reorderPoint = Math.round(demandVelocity * 3.5);
    const safetyStock = Math.round(demandVelocity * 1.5);

    let reorderRisk: ProductSKU['reorderRisk'] = 'LOW';
    if (availableStock <= safetyStock) reorderRisk = 'CRITICAL';
    else if (availableStock <= reorderPoint) reorderRisk = 'HIGH';
    else if (availableStock <= reorderPoint * 1.4) reorderRisk = 'MEDIUM';

    // Specific highlight sku for user prompt demo (SKU-WH-204)
    const isTargetDemoSku = i === 4;
    const skuId = isTargetDemoSku ? 'SKU-WH-204' : skuCode;
    const skuName = isTargetDemoSku ? 'Wireless Headphones' : `${tmpl.name} #${i + 1}`;

    skus[skuId] = {
      id: skuId,
      name: skuName,
      category: tmpl.cat as any,
      weightKg: Math.round(tmpl.weight * (0.9 + rng() * 0.3) * 100) / 100,
      dimensionsCm: {
        l: Math.round(15 + rng() * 30),
        w: Math.round(10 + rng() * 20),
        h: Math.round(8 + rng() * 15),
      },
      unitPrice: tmpl.price,
      totalStock,
      availableStock,
      reservedStock,
      reorderPoint,
      safetyStock,
      demandVelocity,
      currentBinId: assignedBinId,
      optimalBinId,
      historicalDemand,
      forecastDemandNext7d,
      reorderRisk,
      compatibilityZone: (assignedBinId.includes('A') ? 'ZONE_A' : assignedBinId.includes('B') ? 'ZONE_B' : assignedBinId.includes('C') ? 'ZONE_C' : 'ZONE_D'),
    };
  }

  return skus;
}

// Generate 32 Realistic Customer Orders
export function generateCustomerOrders(skus: Record<string, ProductSKU>, _bins?: Record<string, BinLocation>): Record<string, CustomerOrder> {
  const customers = [
    'Apollo Health Tech Hyderabad',
    'Tata Advanced Systems Aerospace',
    'GMR Aero Technic MRO',
    'Dr. Reddy\'s Laboratories QC',
    'Bharat Electronics Limited R&D',
    'Schneider Electric Hub Medchal',
    'Aurobindo Automated Logistics',
    'Mahindra Aerospace Components',
    'T-Hub DeepTech Hardware Fab',
    'Amazon Fulfilment Center Shamshabad',
  ];

  const skuKeys = Object.keys(skus);
  const orders: Record<string, CustomerOrder> = {};

  const priorityDistribution: Array<CustomerOrder['priority']> = [
    'CRITICAL', 'CRITICAL',
    'HIGH', 'HIGH', 'HIGH', 'HIGH',
    'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM', 'MEDIUM',
    'LOW', 'LOW', 'LOW',
  ];

  for (let i = 1; i <= 32; i++) {
    const orderId = `ORD-HYD-${9000 + i}`;
    const priority = priorityDistribution[i % priorityDistribution.length];
    const customer = customers[i % customers.length];

    // Priority Score formula: CRITICAL=90-99, HIGH=75-89, MEDIUM=50-74, LOW=20-49
    let priorityScore = 50;
    if (priority === 'CRITICAL') priorityScore = 92 + Math.floor(rng() * 7);
    else if (priority === 'HIGH') priorityScore = 76 + Math.floor(rng() * 14);
    else if (priority === 'MEDIUM') priorityScore = 52 + Math.floor(rng() * 20);
    else priorityScore = 25 + Math.floor(rng() * 20);

    // Number of order lines: 1 to 4
    const lineCount = 1 + Math.floor(rng() * 3);
    const lines = [];
    let totalWeight = 0;

    for (let l = 1; l <= lineCount; l++) {
      const sku = skus[skuKeys[(i * 3 + l) % skuKeys.length]];
      const qtyRequested = 1 + Math.floor(rng() * 6);
      const isAllocated = i > 4; // First few pending/allocating
      const qtyAllocated = isAllocated ? qtyRequested : Math.min(qtyRequested, sku.availableStock);
      const isPicked = i > 12;

      totalWeight += sku.weightKg * qtyRequested;

      lines.push({
        id: `LINE-${orderId}-${l}`,
        skuId: sku.id,
        skuName: sku.name,
        quantityRequested: qtyRequested,
        quantityAllocated: qtyAllocated,
        quantityPicked: isPicked ? qtyAllocated : 0,
        binLocationId: sku.currentBinId,
        isPicked,
      });
    }

    // Determine lifecycle status
    let status: CustomerOrder['status'] = 'PENDING';
    if (i <= 3) status = 'PENDING';
    else if (i <= 8) status = 'ALLOCATED';
    else if (i <= 14) status = 'PICKING';
    else if (i <= 19) status = 'PICKED';
    else if (i <= 23) status = 'PACKING';
    else if (i <= 26) status = 'QC_INSPECTION';
    else if (i <= 28) status = 'QC_PASSED';
    else if (i === 29) status = 'QC_FAILED';
    else status = 'DISPATCHED';

    const cities = ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Bengaluru', 'Chennai'];

    orders[orderId] = {
      id: orderId,
      customerName: customer,
      priority,
      priorityScore,
      status,
      createdAtSimTime: 3600 - i * 90,
      deadlineSimTime: 7200 + (priority === 'CRITICAL' ? 1200 : priority === 'HIGH' ? 2400 : 7200),
      lines,
      assignedWorkerId: i % 2 === 0 ? `WRK-0${1 + (i % 5)}` : undefined,
      assignedAGVId: i % 3 === 0 ? `AGV-0${1 + (i % 4)}` : undefined,
      packingStationId: `STATION-PACK-0${1 + (i % 3)}`,
      packageId: i > 20 ? `PKG-HYD-${500 + i}` : undefined,
      totalWeightKg: Math.round(totalWeight * 10) / 10,
      destinationCity: cities[i % cities.length],
      carbonEstimateKg: Math.round((0.4 + totalWeight * 0.08) * 100) / 100,
    };
  }

  return orders;
}

// Generate 5 Warehouse Workers
export function generateWorkers(): Record<string, WarehouseWorker> {
  return {
    'WRK-01': {
      id: 'WRK-01',
      name: 'Ravi Teja Varma',
      role: 'PICKER',
      avatarColor: '#00E5FF',
      status: 'PICKING',
      x: -12.5,
      y: 0,
      z: -8.0,
      speedMps: 1.2,
      currentBinId: 'BIN-A-04',
      currentTaskId: 'TSK-PICK-101',
      picksCompleted: 64,
      accuracyRate: 99.8,
    },
    'WRK-02': {
      id: 'WRK-02',
      name: 'Ananya Reddy',
      role: 'PICKER',
      avatarColor: '#EAB308',
      status: 'TRANSIT',
      x: -4.0,
      y: 0,
      z: 4.5,
      speedMps: 1.1,
      currentBinId: 'BIN-B-12',
      picksCompleted: 58,
      accuracyRate: 99.4,
    },
    'WRK-03': {
      id: 'WRK-03',
      name: 'Karthik Sharma',
      role: 'PACKER',
      avatarColor: '#EC4899',
      status: 'PICKING',
      x: 18.0,
      y: 0,
      z: -3.0,
      speedMps: 0.9,
      picksCompleted: 82,
      accuracyRate: 100.0,
    },
    'WRK-04': {
      id: 'WRK-04',
      name: 'Suresh Kumar',
      role: 'QC_INSPECTOR',
      avatarColor: '#10B981',
      status: 'PICKING',
      x: 22.0,
      y: 0,
      z: 5.0,
      speedMps: 0.8,
      picksCompleted: 112,
      accuracyRate: 99.9,
    },
    'WRK-05': {
      id: 'WRK-05',
      name: 'Deepika Rao',
      role: 'SUPERVISOR',
      avatarColor: '#8B5CF6',
      status: 'IDLE',
      x: 0,
      y: 0,
      z: 0,
      speedMps: 1.0,
      picksCompleted: 12,
      accuracyRate: 100.0,
    },
  };
}

// Generate 4 Autonomous Guided Vehicles (AGVs)
export function generateAGVs(): Record<string, AGVFleetVehicle> {
  return {
    'AGV-01': {
      id: 'AGV-01',
      name: 'AGV Alpha (Heavy Carrier)',
      status: 'EN_ROUTE',
      batteryPct: 88,
      currentX: -10,
      currentZ: -2,
      targetX: 18,
      targetZ: -2,
      currentSpeedMps: 1.5,
      maxSpeedMps: 2.0,
      carryingOrderId: 'ORD-HYD-9014',
      route: [
        { x: -10, z: -2, label: 'Aisle 2 Exit' },
        { x: 0, z: -2, label: 'Central Corridor' },
        { x: 10, z: -2, label: 'East Junction' },
        { x: 18, z: -2, label: 'Packing Station 1' },
      ],
      routeIndex: 1,
      totalDistanceTraveledM: 1420,
      energyConsumedKWh: 3.4,
    },
    'AGV-02': {
      id: 'AGV-02',
      name: 'AGV Beta (Rapid Shuttle)',
      status: 'ASSIGNED',
      batteryPct: 76,
      currentX: 8,
      currentZ: 6,
      targetX: -14,
      targetZ: 6,
      currentSpeedMps: 1.4,
      maxSpeedMps: 2.2,
      carryingOrderId: 'ORD-HYD-9016',
      route: [
        { x: 8, z: 6, label: 'Zone D Aisle' },
        { x: 0, z: 6, label: 'Central Spine' },
        { x: -14, z: 6, label: 'Zone B Ingress' },
      ],
      routeIndex: 0,
      totalDistanceTraveledM: 980,
      energyConsumedKWh: 2.3,
    },
    'AGV-03': {
      id: 'AGV-03',
      name: 'AGV Gamma (Precision Bot)',
      status: 'CHARGING',
      batteryPct: 24, // low battery scenario
      currentX: 18,
      currentZ: -12,
      targetX: 18,
      targetZ: -12,
      currentSpeedMps: 0.0,
      maxSpeedMps: 1.8,
      route: [],
      routeIndex: 0,
      totalDistanceTraveledM: 2150,
      energyConsumedKWh: 5.8,
    },
    'AGV-04': {
      id: 'AGV-04',
      name: 'AGV Delta (High Payload)',
      status: 'EN_ROUTE',
      batteryPct: 91,
      currentX: 2,
      currentZ: -6,
      targetX: 22,
      targetZ: 5,
      currentSpeedMps: 1.3,
      maxSpeedMps: 1.8,
      carryingOrderId: 'ORD-HYD-9022',
      route: [
        { x: 2, z: -6, label: 'Zone C Aisle' },
        { x: 12, z: 0, label: 'Cross Corridor' },
        { x: 22, z: 5, label: 'QC Station 2' },
      ],
      routeIndex: 1,
      totalDistanceTraveledM: 1150,
      energyConsumedKWh: 2.9,
    },
  };
}

// Generate Packing & QC Stations
export function generateStations(): {
  packingStations: Record<string, PackingStation>;
  qcInspections: Record<string, QCInspectionResult>;
  packages: Record<string, PackageUnit>;
  exceptions: Record<string, WarehouseException>;
  shipments: Record<string, ShipmentDispatch>;
} {
  const packingStations: Record<string, PackingStation> = {
    'STATION-PACK-01': {
      id: 'STATION-PACK-01',
      name: 'Packing Hub 1 (Eco-Boxing)',
      operator: 'Karthik Sharma',
      status: 'PACKING',
      currentOrderId: 'ORD-HYD-9023',
      packagesPackedToday: 82,
      efficiencyScore: 96,
      x: 18.0,
      z: -3.0,
    },
    'STATION-PACK-02': {
      id: 'STATION-PACK-02',
      name: 'Packing Hub 2 (High-Speed)',
      operator: 'Prasad Rao',
      status: 'PACKING',
      currentOrderId: 'ORD-HYD-9024',
      packagesPackedToday: 94,
      efficiencyScore: 98,
      x: 18.0,
      z: 0.0,
    },
    'STATION-PACK-03': {
      id: 'STATION-PACK-03',
      name: 'Packing Hub 3 (Heavy Freight)',
      operator: 'Venkatesh K.',
      status: 'IDLE',
      packagesPackedToday: 41,
      efficiencyScore: 92,
      x: 18.0,
      z: 3.0,
    },
  };

  const packages: Record<string, PackageUnit> = {
    'PKG-HYD-526': {
      id: 'PKG-HYD-526',
      orderId: 'ORD-HYD-9026',
      packagingType: 'RECYCLED_BOX_M',
      weightKg: 3.4,
      barcode: 'WM-HYD-9026-8841',
      status: 'QC_PENDING',
      ecoScore: 92,
      estimatedEmissionsGrams: 140,
    },
    'PKG-HYD-528': {
      id: 'PKG-HYD-528',
      orderId: 'ORD-HYD-9028',
      packagingType: 'ECO_POLYMAILER',
      weightKg: 0.8,
      barcode: 'WM-HYD-9028-1129',
      status: 'DISPATCH_READY',
      ecoScore: 98,
      estimatedEmissionsGrams: 42,
    },
    'PKG-HYD-529': {
      id: 'PKG-HYD-529',
      orderId: 'ORD-HYD-9029',
      packagingType: 'STANDARD_CORRUGATED',
      weightKg: 5.6,
      barcode: 'WM-HYD-9029-9943',
      status: 'QC_FAILED', // Target QC exception scenario
      ecoScore: 68,
      estimatedEmissionsGrams: 285,
    },
  };

  const qcInspections: Record<string, QCInspectionResult> = {
    'QC-INS-801': {
      id: 'QC-INS-801',
      packageId: 'PKG-HYD-528',
      orderId: 'ORD-HYD-9028',
      inspectorId: 'WRK-04',
      timestampSimTime: 1800,
      result: 'PASS',
      checks: {
        barcodeValidity: true,
        skuMatch: true,
        quantityMatch: true,
        packageIntegrity: true,
        missingItemsDetected: false,
      },
      requiresManualReview: false,
      isResolved: true,
      resolutionAction: 'Automated conveyor release to Dispatch Staging Dock 1',
    },
    'QC-INS-802': {
      id: 'QC-INS-802',
      packageId: 'PKG-HYD-529',
      orderId: 'ORD-HYD-9029',
      inspectorId: 'WRK-04',
      timestampSimTime: 2150,
      result: 'FAIL',
      checks: {
        barcodeValidity: true,
        skuMatch: true,
        quantityMatch: false, // mismatch trigger
        packageIntegrity: false, // puncture detected
        missingItemsDetected: true,
      },
      defectNotes: 'Carton seal perforated; expected 4 units SKU-WH-202, scanned 3 units.',
      requiresManualReview: true,
      isResolved: false,
    },
  };

  const exceptions: Record<string, WarehouseException> = {
    'EX-HYD-01': {
      id: 'EX-HYD-01',
      timestampSimTime: 2150,
      type: 'DAMAGED_PACKAGE',
      severity: 'CRITICAL',
      entityId: 'PKG-HYD-529',
      description: 'QC Inspection Failure: Damaged carton integrity and missing 1x unit SKU-WH-202 for ORD-HYD-9029.',
      status: 'OPEN',
      suggestedAction: 'Route package to Quarantine Re-pick Lane B and trigger priority replenishment pick.',
      aiExplanation: 'Barcode scanned OK, but optical tare scale detected -420g discrepancy and vision check identified torn perimeter tape.',
      kpiImpact: 'Fulfillment delayed by ~14 mins; customer delivery SLA remains intact if re-picked within 20 mins.',
    },
    'EX-HYD-02': {
      id: 'EX-HYD-02',
      timestampSimTime: 1400,
      type: 'LOW_STOCK',
      severity: 'WARNING',
      entityId: 'SKU-WH-204',
      description: 'SKU-WH-204 (Wireless Headphones) stock breached reorder threshold (8 units remaining).',
      status: 'ACKNOWLEDGED',
      suggestedAction: 'Execute Cross-Dock replenishment order for 50 units from Hyderabad Central Vendor Hub.',
      aiExplanation: 'Demand velocity surged 2.4x today due to regional flash sale in Secunderabad zone.',
      kpiImpact: 'Stockout probability is 82% if unreplenished within next 4 simulated hours.',
    },
    'EX-HYD-03': {
      id: 'EX-HYD-03',
      timestampSimTime: 1950,
      type: 'LOW_BATTERY',
      severity: 'WARNING',
      entityId: 'AGV-03',
      description: 'AGV-03 battery level dropped to 24% during active mission.',
      status: 'RESOLVING',
      suggestedAction: 'Auto-routed to Dock Charge Pad 3; tasks re-allocated to AGV-01.',
      aiExplanation: 'Dynamic power management preemptively scheduled inductive fast charge to avoid mid-aisle stalling.',
      kpiImpact: 'Fleet capacity momentarily reduced by 25%; offset by AGV-01 speed escalation.',
    },
  };

  const shipments: Record<string, ShipmentDispatch> = {
    'SHP-HYD-701': {
      id: 'SHP-HYD-701',
      orderId: 'ORD-HYD-9030',
      packageId: 'PKG-HYD-520',
      carrier: 'BlueDart Smart EV Fleet',
      vehicleType: 'EV_VAN',
      vehiclePlate: 'TS-09-EA-4412',
      destination: 'Hitec City, Hyderabad',
      distanceKm: 18.5,
      dispatchedAtSimTime: 1200,
      estimatedDeliverySimTime: 2700,
      carbonKg: 0.28,
      status: 'IN_TRANSIT',
    },
    'SHP-HYD-702': {
      id: 'SHP-HYD-702',
      orderId: 'ORD-HYD-9031',
      packageId: 'PKG-HYD-521',
      carrier: 'Delhivery Green Express',
      vehicleType: 'ELECTRIC_TRUCK',
      vehiclePlate: 'TS-07-EE-9901',
      destination: 'Gachibowli, Hyderabad',
      distanceKm: 24.2,
      dispatchedAtSimTime: 950,
      estimatedDeliverySimTime: 3100,
      carbonKg: 0.39,
      status: 'IN_TRANSIT',
    },
  };

  return { packingStations, qcInspections, packages, exceptions, shipments };
}

// Initial Events & AI Decision Log
export function generateInitialEventsAndDecisions(): {
  events: SimulationEventLedgerEntry[];
  decisions: AIDecisionAudit[];
} {
  const events: SimulationEventLedgerEntry[] = [
    {
      id: 'EVT-001',
      simTime: 100,
      wallTimestamp: new Date().toLocaleTimeString(),
      module: 'COMMAND_CENTER',
      severity: 'INFO',
      title: 'Warehouse Engine Initialized',
      description: 'Hyderabad FC Smart Warehouse digital twin booted with 54 SKUs, 48 Bins, 4 AGVs, 5 Workers.',
    },
    {
      id: 'EVT-002',
      simTime: 620,
      module: 'ALLOCATION',
      severity: 'SUCCESS',
      wallTimestamp: new Date().toLocaleTimeString(),
      title: 'Atomic Stock Reservation Approved',
      description: 'Order ORD-HYD-9014 allocated 6 units across Zone A and Zone B without shortage.',
      entityId: 'ORD-HYD-9014',
    },
    {
      id: 'EVT-003',
      simTime: 1400,
      module: 'SLOTTING',
      severity: 'WARN',
      wallTimestamp: new Date().toLocaleTimeString(),
      title: 'Dynamic Slotting Imbalance Detected',
      description: 'SKU-WH-204 is slotted in Bin C-18 (32.4m from packing). Recommending high-velocity slot A-04 (11.2m).',
      entityId: 'SKU-WH-204',
    },
    {
      id: 'EVT-004',
      simTime: 2150,
      module: 'QC',
      severity: 'CRITICAL',
      wallTimestamp: new Date().toLocaleTimeString(),
      title: 'QC Check Failed — Dispatch Blocked',
      description: 'Package PKG-HYD-529 failed seal and quantity checks. Dispatch blocked automatically.',
      entityId: 'PKG-HYD-529',
    },
  ];

  const decisions: AIDecisionAudit[] = [
    {
      id: 'DEC-001',
      triggerEvent: 'Urgent Order Ingress (ORD-HYD-9001)',
      timestampSimTime: 300,
      module: 'ORDER_PRIORITY',
      inputs: { deadline: 'T+20min', customerSLA: 'Tier-1 Enterprise', stockAvailable: 18 },
      chosenAction: 'Escalate to CRITICAL (Score 98) & Preempt AGV-01',
      alternativesConsidered: ['Standard FIFO queueing', 'Worker manual batch pick'],
      reasoningFormula: 'Priority = 0.45*(1/Deadline) + 0.35*(SLA_Weight) + 0.20*(OrderValue)',
      expectedImpact: 'Fulfillment SLA risk mitigated from 74% to 4%',
      confidenceScore: 0.94,
      executed: true,
      actualOutcome: 'Order allocated within 1.2s; picker dispatched to Bin A-02.',
    },
    {
      id: 'DEC-002',
      triggerEvent: 'High-Velocity Pick Concentration',
      timestampSimTime: 1400,
      module: 'DYNAMIC_SLOTTING',
      inputs: { skuId: 'SKU-WH-204', currentBin: 'C-18', proposedBin: 'A-04', picksPerDay: 48 },
      chosenAction: 'Relocate SKU-WH-204 from Bin C-18 to Bin A-04',
      alternativesConsidered: ['Retain in Zone C', 'Move to Zone B-08'],
      reasoningFormula: 'SlottingScore = Frequency * (Dist_Current - Dist_Proposed) * ItemWeightFactor',
      expectedImpact: 'Saves 21.2m per pick trip; ~1,017m daily travel reduction (65% drop).',
      confidenceScore: 0.91,
      executed: false,
    },
    {
      id: 'DEC-003',
      triggerEvent: 'Aisle 3 Ingress Congestion',
      timestampSimTime: 1750,
      module: 'AGV_ROUTING',
      inputs: { agvId: 'AGV-02', obstacleAisle: 3, detourAisle: 4, batteryCost: '0.04 kWh' },
      chosenAction: 'A* Dynamic Reroute via Bypass Corridor North',
      alternativesConsidered: ['Hold position for 45s', 'Reroute via South Dock'],
      reasoningFormula: 'Cost = Distance + 15 * CongestionDensity + 5 * InclinePenalty',
      expectedImpact: 'Zero collision deadlocks, arrives 38 seconds earlier than waiting.',
      confidenceScore: 0.96,
      executed: true,
      actualOutcome: 'AGV-02 bypassed blockage seamlessly with zero idle delay.',
    },
  ];

  return { events, decisions };
}

// Generate complete deterministic initial warehouse state
export function createInitialWarehouseState(): WarehouseState {
  const { racks, bins } = generateRacksAndBins();
  const binIds = Object.keys(bins);
  const skus = generateSKUs(binIds);

  // Assign SKUs into bins
  Object.values(skus).forEach((sku) => {
    if (bins[sku.currentBinId]) {
      bins[sku.currentBinId].currentSKUId = sku.id;
      bins[sku.currentBinId].occupiedQty = sku.totalStock;
      bins[sku.currentBinId].reservedQty = sku.reservedStock;
    }
  });

  const orders = generateCustomerOrders(skus, bins);
  const workers = generateWorkers();
  const agvs = generateAGVs();
  const { packingStations, qcInspections, packages, exceptions, shipments } = generateStations();
  const { events, decisions } = generateInitialEventsAndDecisions();

  // Carbon baseline records
  const carbonRecords: CarbonRecord[] = [
    {
      id: 'CRB-001',
      timestampSimTime: 1200,
      orderId: 'ORD-HYD-9030',
      packagingKg: 0.08,
      warehouseEnergyKg: 0.12,
      agvMovementKg: 0.05,
      transportFreightKg: 0.28,
      totalKg: 0.53,
      savingsVsBaselineKg: 0.32,
      isEcoPackaging: true,
    },
    {
      id: 'CRB-002',
      timestampSimTime: 950,
      orderId: 'ORD-HYD-9031',
      packagingKg: 0.14,
      warehouseEnergyKg: 0.15,
      agvMovementKg: 0.06,
      transportFreightKg: 0.39,
      totalKg: 0.74,
      savingsVsBaselineKg: 0.28,
      isEcoPackaging: true,
    },
  ];

  return {
    facilityName: 'SMART WAREHOUSE OPERATIONS — HYDERABAD FC',
    simClock: {
      isRunning: true,
      speedMultiplier: 1.0,
      simTimeSeconds: 2400,
      dayNumber: 1,
      lastTickWallTime: Date.now(),
    },
    cameraPreset: 'OVERVIEW',
    selectedEntity: {
      type: null,
      id: null,
    },
    filters: {
      zone: 'ALL',
      showRoutes: true,
      lowQualityMode: false,
      reducedMotion: false,
      ecoPackagingPreset: true,
    },
    skus,
    bins,
    racks,
    orders,
    workers,
    agvs,
    packingStations,
    packages,
    qcInspections,
    exceptions,
    shipments,
    carbonRecords,
    events,
    decisions,
    demoStep: 0,
    isDemoRunning: false,
  };
}
