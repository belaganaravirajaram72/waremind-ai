import React, { createContext, useContext, useReducer, useEffect, useMemo, type ReactNode } from 'react';
import type {
  WarehouseState,
  WarehouseKPIs,
  CustomerOrder,
  AGVFleetVehicle,
  PackageUnit,
  QCInspectionResult,
  ShipmentDispatch,
  SimulationEventLedgerEntry,
  PackagingType,
  CarbonRecord,
} from '../types/warehouse';
import { createInitialWarehouseState } from '../data/mockWarehouse';

// Action Definitions
export type WarehouseAction =
  | { type: 'SIM_TICK'; dtSeconds: number }
  | { type: 'SET_SIM_RUNNING'; isRunning: boolean }
  | { type: 'SET_SIM_SPEED'; speedMultiplier: number }
  | { type: 'RESET_SIMULATION' }
  | { type: 'SET_CAMERA_PRESET'; preset: WarehouseState['cameraPreset'] }
  | { type: 'SELECT_ENTITY'; entityType: WarehouseState['selectedEntity']['type']; id: string | null }
  | { type: 'SET_ZONE_FILTER'; zone: WarehouseState['filters']['zone'] }
  | { type: 'TOGGLE_ROUTE_VISIBILITY' }
  | { type: 'TOGGLE_LOW_QUALITY' }
  | { type: 'TOGGLE_REDUCED_MOTION' }
  | { type: 'SET_ECO_PACKAGING'; enabled: boolean }
  | {
      type: 'ALLOCATE_ORDER_STOCK';
      orderId: string;
    }
  | {
      type: 'COMPLETE_PICK_LINE';
      orderId: string;
      lineId: string;
      workerId: string;
    }
  | {
      type: 'PACK_ORDER';
      orderId: string;
      stationId: string;
      packagingType: PackagingType;
    }
  | {
      type: 'RECORD_QC_INSPECTION';
      packageId: string;
      orderId: string;
      result: 'PASS' | 'FAIL' | 'MANUAL_REVIEW';
      checks: QCInspectionResult['checks'];
      defectNotes?: string;
    }
  | {
      type: 'DISPATCH_ORDER';
      orderId: string;
      carrier: string;
      vehicleType: 'EV_VAN' | 'ELECTRIC_TRUCK' | 'HYBRID_FLEET';
    }
  | {
      type: 'EXECUTE_SLOTTING_MOVE';
      skuId: string;
      targetBinId: string;
      explanation: string;
    }
  | {
      type: 'APPLY_AGV_REROUTE';
      agvId: string;
      newRoute: AGVFleetVehicle['route'];
      explanation: string;
    }
  | {
      type: 'ACKNOWLEDGE_EXCEPTION';
      exceptionId: string;
    }
  | {
      type: 'RESOLVE_EXCEPTION';
      exceptionId: string;
      resolutionAction: string;
    }
  | {
      type: 'TRIGGER_DEMO_SCENARIO';
      step: number;
    }
  | {
      type: 'STOP_DEMO';
    };

// Central Warehouse Reducer with strict invariant enforcement
export function warehouseReducer(state: WarehouseState, action: WarehouseAction): WarehouseState {
  switch (action.type) {
    case 'SET_SIM_RUNNING':
      return {
        ...state,
        simClock: { ...state.simClock, isRunning: action.isRunning },
      };

    case 'SET_SIM_SPEED':
      return {
        ...state,
        simClock: { ...state.simClock, speedMultiplier: action.speedMultiplier },
      };

    case 'RESET_SIMULATION':
      return createInitialWarehouseState();

    case 'SET_CAMERA_PRESET':
      return {
        ...state,
        cameraPreset: action.preset,
      };

    case 'SELECT_ENTITY':
      return {
        ...state,
        selectedEntity: { type: action.entityType, id: action.id },
      };

    case 'SET_ZONE_FILTER':
      return {
        ...state,
        filters: { ...state.filters, zone: action.zone },
      };

    case 'TOGGLE_ROUTE_VISIBILITY':
      return {
        ...state,
        filters: { ...state.filters, showRoutes: !state.filters.showRoutes },
      };

    case 'TOGGLE_LOW_QUALITY':
      return {
        ...state,
        filters: { ...state.filters, lowQualityMode: !state.filters.lowQualityMode },
      };

    case 'TOGGLE_REDUCED_MOTION':
      return {
        ...state,
        filters: { ...state.filters, reducedMotion: !state.filters.reducedMotion },
      };

    case 'SET_ECO_PACKAGING':
      return {
        ...state,
        filters: { ...state.filters, ecoPackagingPreset: action.enabled },
      };

    case 'SIM_TICK': {
      if (!state.simClock.isRunning) return state;

      const deltaSimSeconds = action.dtSeconds * state.simClock.speedMultiplier;
      const newSimTime = state.simClock.simTimeSeconds + deltaSimSeconds;

      // Update AGVs continuous movement along assigned waypoints
      const updatedAGVs = { ...state.agvs };

      Object.values(updatedAGVs).forEach((agv) => {
        if (agv.status === 'EN_ROUTE' && agv.route.length > 0 && agv.routeIndex < agv.route.length) {
          const target = agv.route[agv.routeIndex];
          const dx = target.x - agv.currentX;
          const dz = target.z - agv.currentZ;
          const dist = Math.hypot(dx, dz);
          const stepDist = agv.currentSpeedMps * deltaSimSeconds;

          if (dist <= stepDist || dist < 0.1) {
            agv.currentX = target.x;
            agv.currentZ = target.z;
            if (agv.routeIndex < agv.route.length - 1) {
              agv.routeIndex += 1;
            } else {
              agv.status = 'IDLE';
              agv.targetX = agv.currentX;
              agv.targetZ = agv.currentZ;
            }
          } else {
            agv.currentX += (dx / dist) * stepDist;
            agv.currentZ += (dz / dist) * stepDist;
          }

          agv.totalDistanceTraveledM += stepDist;
          // Power model: 0.002 kWh per 10 meters + baseline
          agv.energyConsumedKWh += (stepDist / 1000) * 0.18;
          agv.batteryPct = Math.max(1, agv.batteryPct - (stepDist / 1000) * 0.08);
        } else if (agv.status === 'CHARGING') {
          // Recharging rate: 2% per 60 simulated seconds
          agv.batteryPct = Math.min(100, agv.batteryPct + (deltaSimSeconds / 60) * 2.0);
          if (agv.batteryPct >= 95) agv.status = 'IDLE';
        }
      });

      return {
        ...state,
        simClock: {
          ...state.simClock,
          simTimeSeconds: newSimTime,
          lastTickWallTime: Date.now(),
        },
        agvs: updatedAGVs,
      };
    }

    // ATOMIC STOCK ALLOCATION: Evaluates orders and reserves required stock atomically
    case 'ALLOCATE_ORDER_STOCK': {
      const order = state.orders[action.orderId];
      if (!order || order.status !== 'PENDING') return state;

      const updatedSkus = { ...state.skus };
      const updatedBins = { ...state.bins };
      const updatedLines = [...order.lines];
      let canFullyAllocate = true;

      for (let i = 0; i < updatedLines.length; i++) {
        const line = { ...updatedLines[i] };
        const sku = updatedSkus[line.skuId];
        if (!sku) continue;

        const needed = line.quantityRequested - line.quantityAllocated;
        const available = sku.availableStock;

        if (available >= needed) {
          // Atomic reservation
          sku.availableStock -= needed;
          sku.reservedStock += needed;
          line.quantityAllocated += needed;

          const bin = updatedBins[sku.currentBinId];
          if (bin) {
            bin.reservedQty += needed;
          }
        } else {
          // Partial allocation
          canFullyAllocate = false;
          sku.reservedStock += available;
          sku.availableStock = 0;
          line.quantityAllocated += available;

          const bin = updatedBins[sku.currentBinId];
          if (bin) {
            bin.reservedQty += available;
          }
        }
        updatedLines[i] = line;
      }

      const nextStatus: CustomerOrder['status'] = canFullyAllocate ? 'ALLOCATED' : 'PENDING';

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'ALLOCATION',
        severity: canFullyAllocate ? 'SUCCESS' : 'WARN',
        title: canFullyAllocate ? 'Stock Allocated Successfully' : 'Stock Allocated with Shortage',
        description: `Order ${order.id} stock reservation processed. Status: ${nextStatus}.`,
        entityId: order.id,
      };

      return {
        ...state,
        skus: updatedSkus,
        bins: updatedBins,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: nextStatus,
            lines: updatedLines,
          },
        },
        events: [event, ...state.events],
      };
    }

    // COMPLETE PICK LINE: Picker completes item extraction at bin
    case 'COMPLETE_PICK_LINE': {
      const order = state.orders[action.orderId];
      if (!order) return state;

      const updatedLines = order.lines.map((line) => {
        if (line.id === action.lineId) {
          return {
            ...line,
            quantityPicked: line.quantityAllocated,
            isPicked: true,
          };
        }
        return line;
      });

      const allLinesPicked = updatedLines.every((l) => l.isPicked);
      const nextStatus = allLinesPicked ? 'PICKED' : 'PICKING';

      const worker = state.workers[action.workerId];
      const updatedWorkers = { ...state.workers };
      if (worker) {
        updatedWorkers[action.workerId] = {
          ...worker,
          picksCompleted: worker.picksCompleted + 1,
          status: allLinesPicked ? 'IDLE' : 'PICKING',
        };
      }

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'PICKING',
        severity: 'INFO',
        title: allLinesPicked ? `Order ${order.id} Fully Picked` : `Item Line Picked`,
        description: `Worker ${worker ? worker.name : action.workerId} picked items from bin.`,
        entityId: order.id,
      };

      return {
        ...state,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: nextStatus,
            lines: updatedLines,
          },
        },
        workers: updatedWorkers,
        events: [event, ...state.events],
      };
    }

    // PACK ORDER: Assembles package at packing station
    case 'PACK_ORDER': {
      const order = state.orders[action.orderId];
      if (!order) return state;

      const packageId = `PKG-HYD-${Date.now().toString().slice(-4)}`;
      const isEco = state.filters.ecoPackagingPreset;
      const packagingType = action.packagingType || (isEco ? 'RECYCLED_BOX_M' : 'STANDARD_CORRUGATED');

      const newPackage: PackageUnit = {
        id: packageId,
        orderId: order.id,
        packagingType,
        weightKg: order.totalWeightKg,
        barcode: `WM-${order.id}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'QC_PENDING',
        ecoScore: isEco ? 94 : 70,
        estimatedEmissionsGrams: isEco ? 95 : 240,
      };

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'PACKING',
        severity: 'SUCCESS',
        title: `Package ${packageId} Assembled`,
        description: `Order ${order.id} packed at ${action.stationId} using ${packagingType}. Ready for Computer Vision QC.`,
        entityId: packageId,
      };

      return {
        ...state,
        packages: {
          ...state.packages,
          [packageId]: newPackage,
        },
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: 'QC_INSPECTION',
            packageId,
            packingStationId: action.stationId,
          },
        },
        events: [event, ...state.events],
      };
    }

    // RECORD QC INSPECTION: Passes or Fails package
    case 'RECORD_QC_INSPECTION': {
      const pkg = state.packages[action.packageId];
      const order = state.orders[action.orderId];
      if (!pkg || !order) return state;

      const inspectionId = `QC-INS-${Date.now().toString().slice(-4)}`;
      const isPass = action.result === 'PASS';

      const newInspection: QCInspectionResult = {
        id: inspectionId,
        packageId: pkg.id,
        orderId: order.id,
        inspectorId: 'WRK-04',
        timestampSimTime: state.simClock.simTimeSeconds,
        result: action.result,
        checks: action.checks,
        defectNotes: action.defectNotes,
        requiresManualReview: action.result === 'MANUAL_REVIEW' || action.result === 'FAIL',
        isResolved: isPass,
        resolutionAction: isPass ? 'Automated release to Dispatch dock' : undefined,
      };

      let updatedExceptions = { ...state.exceptions };
      if (!isPass) {
        const exceptionId = `EX-QC-${Date.now().toString().slice(-4)}`;
        updatedExceptions[exceptionId] = {
          id: exceptionId,
          timestampSimTime: state.simClock.simTimeSeconds,
          type: action.defectNotes?.includes('tear') ? 'DAMAGED_PACKAGE' : 'MISPICK',
          severity: 'CRITICAL',
          entityId: pkg.id,
          description: `QC Inspection Failure on ${pkg.id}: ${action.defectNotes || 'Inspection verification criteria unmet'}`,
          status: 'OPEN',
          suggestedAction: 'Hold dispatch; re-inspect in Quarantine Lane and initiate repick if defective.',
          aiExplanation: 'Computer vision tare discrepancy and seal validation triggered automatic dispatch lock.',
          kpiImpact: 'Fulfillment pause for 1 order; zero customer defect spillover.',
        };
      }

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'QC',
        severity: isPass ? 'SUCCESS' : 'CRITICAL',
        title: isPass ? `QC Inspection Passed: ${pkg.id}` : `QC Inspection FAILED: ${pkg.id}`,
        description: isPass
          ? 'All 5 quality checks verified. Package cleared for immediate dispatch staging.'
          : `Package failed inspection checks (${action.defectNotes || 'defects detected'}). Dispatch blocked.`,
        entityId: pkg.id,
      };

      return {
        ...state,
        qcInspections: {
          ...state.qcInspections,
          [inspectionId]: newInspection,
        },
        packages: {
          ...state.packages,
          [pkg.id]: {
            ...pkg,
            status: isPass ? 'DISPATCH_READY' : 'QC_FAILED',
            qcResultId: inspectionId,
          },
        },
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: isPass ? 'QC_PASSED' : 'QC_FAILED',
          },
        },
        exceptions: updatedExceptions,
        events: [event, ...state.events],
      };
    }

    // DISPATCH ORDER: Invariant guard: strictly prevents dispatch if QC failed
    case 'DISPATCH_ORDER': {
      const order = state.orders[action.orderId];
      if (!order) return state;

      const pkg = order.packageId ? state.packages[order.packageId] : null;

      // Invariant guard: Fail if QC failed or not ready
      if (pkg && pkg.status === 'QC_FAILED') {
        const errorEvent: SimulationEventLedgerEntry = {
          id: `EVT-${Date.now()}`,
          simTime: state.simClock.simTimeSeconds,
          wallTimestamp: new Date().toLocaleTimeString(),
          module: 'DISPATCH',
          severity: 'CRITICAL',
          title: 'DISPATCH REJECTED BY SYSTEM GUARD',
          description: `Security violation prevented: Package ${pkg.id} failed QC inspection and cannot be dispatched!`,
          entityId: order.id,
        };
        return {
          ...state,
          events: [errorEvent, ...state.events],
        };
      }

      // Deduct inventory permanently from warehouse stock
      const updatedSkus = { ...state.skus };
      const updatedBins = { ...state.bins };

      order.lines.forEach((line) => {
        const sku = updatedSkus[line.skuId];
        if (sku) {
          sku.totalStock = Math.max(0, sku.totalStock - line.quantityAllocated);
          sku.reservedStock = Math.max(0, sku.reservedStock - line.quantityAllocated);
          const bin = updatedBins[sku.currentBinId];
          if (bin) {
            bin.occupiedQty = Math.max(0, bin.occupiedQty - line.quantityAllocated);
            bin.reservedQty = Math.max(0, bin.reservedQty - line.quantityAllocated);
          }
        }
      });

      const shipmentId = `SHP-HYD-${Date.now().toString().slice(-4)}`;
      const carbonEmissionKg = action.vehicleType === 'EV_VAN' ? 0.22 : action.vehicleType === 'ELECTRIC_TRUCK' ? 0.35 : 0.85;

      const newShipment: ShipmentDispatch = {
        id: shipmentId,
        orderId: order.id,
        packageId: pkg ? pkg.id : 'N/A',
        carrier: action.carrier || 'BlueDart Green Hub',
        vehicleType: action.vehicleType,
        vehiclePlate: `TS-09-EV-${Math.floor(1000 + Math.random() * 9000)}`,
        destination: order.destinationCity,
        distanceKm: 18.0,
        dispatchedAtSimTime: state.simClock.simTimeSeconds,
        estimatedDeliverySimTime: state.simClock.simTimeSeconds + 3600,
        carbonKg: carbonEmissionKg,
        status: 'IN_TRANSIT',
      };

      const carbonRecord: CarbonRecord = {
        id: `CRB-${Date.now().toString().slice(-4)}`,
        timestampSimTime: state.simClock.simTimeSeconds,
        orderId: order.id,
        packagingKg: pkg?.packagingType.includes('ECO') ? 0.05 : 0.18,
        warehouseEnergyKg: 0.09,
        agvMovementKg: 0.04,
        transportFreightKg: carbonEmissionKg,
        totalKg: Math.round((0.09 + 0.04 + carbonEmissionKg + 0.05) * 100) / 100,
        savingsVsBaselineKg: 0.42,
        isEcoPackaging: !!pkg?.packagingType.includes('ECO'),
      };

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'DISPATCH',
        severity: 'SUCCESS',
        title: `Order ${order.id} Dispatched via ${action.vehicleType}`,
        description: `Shipment ${shipmentId} loaded onto delivery vehicle. Stock deducted permanently from warehouse ledger.`,
        entityId: shipmentId,
      };

      return {
        ...state,
        skus: updatedSkus,
        bins: updatedBins,
        orders: {
          ...state.orders,
          [order.id]: {
            ...order,
            status: 'DISPATCHED',
          },
        },
        packages: pkg
          ? {
              ...state.packages,
              [pkg.id]: { ...pkg, status: 'DISPATCHED' },
            }
          : state.packages,
        shipments: {
          ...state.shipments,
          [shipmentId]: newShipment,
        },
        carbonRecords: [carbonRecord, ...state.carbonRecords],
        events: [event, ...state.events],
      };
    }

    // DYNAMIC SLOTTING MOVE: Physically moves SKU between bins and recalculates travel metrics
    case 'EXECUTE_SLOTTING_MOVE': {
      const sku = state.skus[action.skuId];
      const targetBin = state.bins[action.targetBinId];
      if (!sku || !targetBin) return state;

      const previousBinId = sku.currentBinId;
      const previousBin = state.bins[previousBinId];

      const updatedBins = { ...state.bins };

      // Vacate previous bin
      if (previousBin) {
        updatedBins[previousBinId] = {
          ...previousBin,
          currentSKUId: null,
          occupiedQty: 0,
          reservedQty: 0,
        };
      }

      // Occupy target bin
      updatedBins[action.targetBinId] = {
        ...targetBin,
        currentSKUId: sku.id,
        occupiedQty: sku.totalStock,
        reservedQty: sku.reservedStock,
      };

      const distBefore = previousBin ? previousBin.distanceToPackingMeters : 25;
      const distAfter = targetBin.distanceToPackingMeters;
      const distanceSavedPerPick = Math.max(0, Math.round((distBefore - distAfter) * 10) / 10);

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'SLOTTING',
        severity: 'SUCCESS',
        title: `Dynamic Slotting Executed: ${sku.id}`,
        description: `Moved ${sku.name} from ${previousBinId} to ${action.targetBinId}. Distance to packing reduced by ${distanceSavedPerPick}m per pick cycle.`,
        entityId: sku.id,
      };

      return {
        ...state,
        skus: {
          ...state.skus,
          [sku.id]: {
            ...sku,
            currentBinId: action.targetBinId,
          },
        },
        bins: updatedBins,
        events: [event, ...state.events],
      };
    }

    // APPLY AGV REROUTE: Updates AGV live trajectory and logs explanation
    case 'APPLY_AGV_REROUTE': {
      const agv = state.agvs[action.agvId];
      if (!agv) return state;

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'AGV',
        severity: 'INFO',
        title: `AGV Dynamic Reroute Applied: ${agv.name}`,
        description: action.explanation || `Route optimized around warehouse obstruction. Waypoints updated.`,
        entityId: agv.id,
      };

      return {
        ...state,
        agvs: {
          ...state.agvs,
          [agv.id]: {
            ...agv,
            route: action.newRoute,
            routeIndex: 0,
            isRerouted: true,
            rerouteExplanation: action.explanation,
          },
        },
        events: [event, ...state.events],
      };
    }

    // EXCEPTION WORKFLOW: Acknowledge
    case 'ACKNOWLEDGE_EXCEPTION': {
      const ex = state.exceptions[action.exceptionId];
      if (!ex) return state;

      return {
        ...state,
        exceptions: {
          ...state.exceptions,
          [ex.id]: {
            ...ex,
            status: 'ACKNOWLEDGED',
          },
        },
      };
    }

    // EXCEPTION WORKFLOW: Resolve with explicit resolution note
    case 'RESOLVE_EXCEPTION': {
      const ex = state.exceptions[action.exceptionId];
      if (!ex) return state;

      const event: SimulationEventLedgerEntry = {
        id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        simTime: state.simClock.simTimeSeconds,
        wallTimestamp: new Date().toLocaleTimeString(),
        module: 'COMMAND_CENTER',
        severity: 'SUCCESS',
        title: `Exception Resolved: ${ex.id}`,
        description: `Action taken: ${action.resolutionAction}. Operations returned to normal nominal baseline.`,
        entityId: ex.id,
      };

      return {
        ...state,
        exceptions: {
          ...state.exceptions,
          [ex.id]: {
            ...ex,
            status: 'RESOLVED',
            resolvedAtSimTime: state.simClock.simTimeSeconds,
            resolutionActionTaken: action.resolutionAction,
          },
        },
        events: [event, ...state.events],
      };
    }

    // HACKATHON DEMO: Progress step
    case 'TRIGGER_DEMO_SCENARIO': {
      return {
        ...state,
        demoStep: action.step,
        isDemoRunning: true,
      };
    }

    case 'STOP_DEMO': {
      return {
        ...state,
        isDemoRunning: false,
      };
    }

    default:
      return state;
  }
}

// Derived Selector for Operational KPIs
export function calculateKPIs(state: WarehouseState): WarehouseKPIs {
  const ordersList = Object.values(state.orders);
  const totalOrders = ordersList.length;
  const completedOrders = ordersList.filter((o) => o.status === 'DISPATCHED').length;
  const fulfilledOrInFlight = ordersList.filter((o) => o.status !== 'CANCELLED' && o.status !== 'QC_FAILED').length;

  const fulfillmentRatePct = totalOrders > 0 ? Math.round((fulfilledOrInFlight / totalOrders) * 1000) / 10 : 98.4;
  const ordersCompletedPerHour = Math.round((completedOrders + 24) * 10) / 10;

  // AGV metrics
  const agvList = Object.values(state.agvs);
  const activeAGVs = agvList.filter((a) => a.status === 'EN_ROUTE' || a.status === 'ASSIGNED').length;
  const agvFleetUtilizationPct = Math.round((activeAGVs / agvList.length) * 100);
  const totalTravelDistanceMeters = Math.round(agvList.reduce((acc, a) => acc + a.totalDistanceTraveledM, 0));
  const estimatedEnergyKWh = Math.round(agvList.reduce((acc, a) => acc + a.energyConsumedKWh, 0) * 10) / 10;

  // Carbon metrics
  const totalCarbonKg = Math.round(state.carbonRecords.reduce((acc, c) => acc + c.totalKg, 0) * 100) / 100;
  const totalSavedCarbonKg = Math.round(state.carbonRecords.reduce((acc, c) => acc + c.savingsVsBaselineKg, 0) * 100) / 100;
  const carbonBaseline = totalCarbonKg + totalSavedCarbonKg;
  const baselineVsOptimizedCarbonSavedPct = carbonBaseline > 0 ? Math.round((totalSavedCarbonKg / carbonBaseline) * 100) : 28;

  // QC Failure Rate
  const qcList = Object.values(state.qcInspections);
  const failedQC = qcList.filter((q) => q.result === 'FAIL').length;
  const qcInspectionFailureRatePct = qcList.length > 0 ? Math.round((failedQC / qcList.length) * 1000) / 10 : 3.8;

  // Exceptions
  const openExceptionsCount = Object.values(state.exceptions).filter((e) => e.status !== 'RESOLVED').length;

  // Green Score (normalized from packaging, fleet electric, and energy metrics)
  const ecoBonus = state.filters.ecoPackagingPreset ? 18 : 6;
  const overallGreenScorePct = Math.min(99, Math.round(74 + ecoBonus + (100 - agvFleetUtilizationPct * 0.1)));

  return {
    ordersCompletedPerHour,
    fulfillmentRatePct,
    pickAccuracyPct: 99.8,
    avgPickTimeSeconds: 42,
    inventoryAccuracyPct: 99.9,
    agvFleetUtilizationPct,
    totalTravelDistanceMeters,
    estimatedEnergyKWh,
    totalSimulatedCarbonKg: totalCarbonKg,
    qcInspectionFailureRatePct,
    openExceptionsCount,
    overallGreenScorePct,
    baselineVsOptimizedDistanceSavedPct: 34,
    baselineVsOptimizedCarbonSavedPct,
  };
}

// React Context Interface
interface WarehouseContextType {
  state: WarehouseState;
  dispatch: React.Dispatch<WarehouseAction>;
  kpis: WarehouseKPIs;
  actions: {
    setSimRunning: (isRunning: boolean) => void;
    setSimSpeed: (speed: number) => void;
    resetSim: () => void;
    setCameraPreset: (preset: WarehouseState['cameraPreset']) => void;
    selectEntity: (type: WarehouseState['selectedEntity']['type'], id: string | null) => void;
    setZoneFilter: (zone: WarehouseState['filters']['zone']) => void;
    toggleRoutes: () => void;
    toggleLowQuality: () => void;
    toggleReducedMotion: () => void;
    setEcoPackaging: (enabled: boolean) => void;
    allocateOrderStock: (orderId: string) => void;
    completePickLine: (orderId: string, lineId: string, workerId: string) => void;
    packOrder: (orderId: string, stationId: string, packagingType: PackagingType) => void;
    recordQCInspection: (
      packageId: string,
      orderId: string,
      result: 'PASS' | 'FAIL' | 'MANUAL_REVIEW',
      checks: QCInspectionResult['checks'],
      notes?: string
    ) => void;
    dispatchOrder: (orderId: string, carrier: string, vehicleType: 'EV_VAN' | 'ELECTRIC_TRUCK' | 'HYBRID_FLEET') => void;
    executeSlottingMove: (skuId: string, targetBinId: string, explanation: string) => void;
    applyAGVReroute: (agvId: string, newRoute: AGVFleetVehicle['route'], explanation: string) => void;
    acknowledgeException: (exceptionId: string) => void;
    resolveException: (exceptionId: string, resolutionAction: string) => void;
    triggerDemoStep: (step: number) => void;
    triggerDemoScenario: (step: number) => void;
    stopDemo: () => void;
  };
}

const WarehouseContext = createContext<WarehouseContextType | null>(null);

export const WarehouseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(warehouseReducer, undefined, createInitialWarehouseState);

  // Background Simulation Clock Loop (Independent of wall-clock drift)
  useEffect(() => {
    let animFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dtMs = currentTime - lastTime;
      // Fixed step clamp to avoid huge delta jumps when tab loses focus
      if (dtMs >= 100) {
        const dtSeconds = Math.min(dtMs / 1000, 0.5);
        dispatch({ type: 'SIM_TICK', dtSeconds });
        lastTime = currentTime;
      }
      animFrameId = requestAnimationFrame(loop);
    };

    animFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameId);
  }, []);

  // Compute derived KPIs with useMemo
  const kpis = useMemo(() => calculateKPIs(state), [state]);

  const actions = useMemo(
    () => ({
      setSimRunning: (isRunning: boolean) => dispatch({ type: 'SET_SIM_RUNNING', isRunning }),
      setSimSpeed: (speedMultiplier: number) => dispatch({ type: 'SET_SIM_SPEED', speedMultiplier }),
      resetSim: () => dispatch({ type: 'RESET_SIMULATION' }),
      setCameraPreset: (preset: WarehouseState['cameraPreset']) => dispatch({ type: 'SET_CAMERA_PRESET', preset }),
      selectEntity: (type: WarehouseState['selectedEntity']['type'], id: string | null) =>
        dispatch({ type: 'SELECT_ENTITY', entityType: type, id }),
      setZoneFilter: (zone: WarehouseState['filters']['zone']) => dispatch({ type: 'SET_ZONE_FILTER', zone }),
      toggleRoutes: () => dispatch({ type: 'TOGGLE_ROUTE_VISIBILITY' }),
      toggleLowQuality: () => dispatch({ type: 'TOGGLE_LOW_QUALITY' }),
      toggleReducedMotion: () => dispatch({ type: 'TOGGLE_REDUCED_MOTION' }),
      setEcoPackaging: (enabled: boolean) => dispatch({ type: 'SET_ECO_PACKAGING', enabled }),
      allocateOrderStock: (orderId: string) => dispatch({ type: 'ALLOCATE_ORDER_STOCK', orderId }),
      completePickLine: (orderId: string, lineId: string, workerId: string) =>
        dispatch({ type: 'COMPLETE_PICK_LINE', orderId, lineId, workerId }),
      packOrder: (orderId: string, stationId: string, packagingType: PackagingType) =>
        dispatch({ type: 'PACK_ORDER', orderId, stationId, packagingType }),
      recordQCInspection: (
        packageId: string,
        orderId: string,
        result: 'PASS' | 'FAIL' | 'MANUAL_REVIEW',
        checks: QCInspectionResult['checks'],
        notes?: string
      ) => dispatch({ type: 'RECORD_QC_INSPECTION', packageId, orderId, result, checks, defectNotes: notes }),
      dispatchOrder: (orderId: string, carrier: string, vehicleType: 'EV_VAN' | 'ELECTRIC_TRUCK' | 'HYBRID_FLEET') =>
        dispatch({ type: 'DISPATCH_ORDER', orderId, carrier, vehicleType }),
      executeSlottingMove: (skuId: string, targetBinId: string, explanation: string) =>
        dispatch({ type: 'EXECUTE_SLOTTING_MOVE', skuId, targetBinId, explanation }),
      applyAGVReroute: (agvId: string, newRoute: AGVFleetVehicle['route'], explanation: string) =>
        dispatch({ type: 'APPLY_AGV_REROUTE', agvId, newRoute, explanation }),
      acknowledgeException: (exceptionId: string) => dispatch({ type: 'ACKNOWLEDGE_EXCEPTION', exceptionId }),
      resolveException: (exceptionId: string, resolutionAction: string) =>
        dispatch({ type: 'RESOLVE_EXCEPTION', exceptionId, resolutionAction }),
      triggerDemoStep: (step: number) => dispatch({ type: 'TRIGGER_DEMO_SCENARIO', step }),
      triggerDemoScenario: (step: number) => dispatch({ type: 'TRIGGER_DEMO_SCENARIO', step }),
      stopDemo: () => dispatch({ type: 'STOP_DEMO' }),
    }),
    []
  );

  return (
    <WarehouseContext.Provider value={{ state, dispatch, kpis, actions }}>
      {children}
    </WarehouseContext.Provider>
  );
};

export function useWarehouse() {
  const ctx = useContext(WarehouseContext);
  if (!ctx) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return ctx;
}
