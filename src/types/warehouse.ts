export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type OrderStatus =
  | 'PENDING'
  | 'ALLOCATED'
  | 'PICKING'
  | 'PICKED'
  | 'PACKING'
  | 'PACKED'
  | 'QC_INSPECTION'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'DISPATCHED'
  | 'CANCELLED';

export type WorkerStatus = 'IDLE' | 'PICKING' | 'TRANSIT' | 'RESTING';

export type AGVStatus = 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'BLOCKED';

export type QCStatus = 'PASS' | 'FAIL' | 'MANUAL_REVIEW';

export type ExceptionSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ExceptionStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVING' | 'RESOLVED';

export type ExceptionType =
  | 'LOW_STOCK'
  | 'STOCKOUT'
  | 'DAMAGED_PACKAGE'
  | 'MISPICK'
  | 'UNSCANNED_MOVEMENT'
  | 'AGV_CONGESTION'
  | 'LOW_BATTERY'
  | 'DELAYED_ORDER'
  | 'PACKING_BOTTLENECK'
  | 'ROUTE_FAILURE';

export type PackagingType =
  | 'ECO_POLYMAILER'
  | 'RECYCLED_BOX_S'
  | 'RECYCLED_BOX_M'
  | 'RECYCLED_BOX_L'
  | 'STANDARD_CORRUGATED'
  | 'HEAVY_REINFORCED_CRATE';

export interface ProductSKU {
  id: string; // e.g. SKU-WH-204
  name: string;
  category: 'ELECTRONICS' | 'ROBOTICS' | 'BATTERIES' | 'FASTENERS' | 'PHARMA' | 'TOOLS' | 'SENSORS';
  weightKg: number;
  dimensionsCm: { l: number; w: number; h: number };
  unitPrice: number;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  reorderPoint: number;
  safetyStock: number;
  demandVelocity: number; // units/day
  currentBinId: string;
  optimalBinId: string;
  historicalDemand: number[]; // 30-day simulated historical demand
  forecastDemandNext7d: number;
  reorderRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  compatibilityZone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
}

export interface BinLocation {
  id: string; // e.g. A-01, C-18
  rackId: string;
  zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  aisle: number;
  shelf: number;
  level: number;
  x: number; // meters in 3D coordinate space
  y: number;
  z: number;
  maxWeightKg: number;
  currentSKUId: string | null;
  occupiedQty: number;
  reservedQty: number;
  distanceToPackingMeters: number;
}

export interface StorageRack {
  id: string; // e.g. RACK-A1
  zone: 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  binIds: string[];
}

export interface OrderLine {
  id: string;
  skuId: string;
  skuName: string;
  quantityRequested: number;
  quantityAllocated: number;
  quantityPicked: number;
  binLocationId: string;
  isPicked: boolean;
}

export interface CustomerOrder {
  id: string; // e.g. ORD-HYD-9001
  customerName: string;
  priority: PriorityLevel;
  priorityScore: number; // algorithmic score (0-100)
  status: OrderStatus;
  createdAtSimTime: number;
  deadlineSimTime: number;
  lines: OrderLine[];
  assignedWorkerId?: string;
  assignedAGVId?: string;
  packingStationId?: string;
  packageId?: string;
  totalWeightKg: number;
  destinationCity: string;
  carbonEstimateKg: number;
}

export interface WorkerTask {
  id: string;
  workerId: string;
  orderId: string;
  skuId: string;
  fromBinId: string;
  toStationId: string;
  quantity: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface WarehouseWorker {
  id: string;
  name: string;
  role: 'PICKER' | 'PACKER' | 'QC_INSPECTOR' | 'SUPERVISOR';
  avatarColor: string;
  status: WorkerStatus;
  x: number;
  y: number;
  z: number;
  speedMps: number;
  currentBinId?: string;
  currentTaskId?: string;
  picksCompleted: number;
  accuracyRate: number; // percentage e.g. 99.4
}

export interface RouteWaypoint {
  x: number;
  z: number;
  label?: string;
}

export interface AGVFleetVehicle {
  id: string; // e.g. AGV-01
  name: string;
  status: AGVStatus;
  batteryPct: number;
  currentX: number;
  currentZ: number;
  targetX: number;
  targetZ: number;
  currentSpeedMps: number;
  maxSpeedMps: number;
  carryingOrderId?: string;
  route: RouteWaypoint[];
  routeIndex: number;
  totalDistanceTraveledM: number;
  energyConsumedKWh: number;
  isRerouted?: boolean;
  rerouteExplanation?: string;
}

export interface PackingStation {
  id: string;
  name: string;
  operator: string;
  status: 'IDLE' | 'PACKING' | 'WAITING_QC' | 'BOTTLENECK';
  currentOrderId?: string;
  packagesPackedToday: number;
  efficiencyScore: number;
  x: number;
  z: number;
}

export interface QCInspectionResult {
  id: string;
  packageId: string;
  orderId: string;
  inspectorId: string;
  timestampSimTime: number;
  result: QCStatus;
  checks: {
    barcodeValidity: boolean;
    skuMatch: boolean;
    quantityMatch: boolean;
    packageIntegrity: boolean;
    missingItemsDetected: boolean;
  };
  defectNotes?: string;
  requiresManualReview: boolean;
  isResolved: boolean;
  resolutionAction?: string;
}

export interface PackageUnit {
  id: string; // PKG-HYD-501
  orderId: string;
  packagingType: PackagingType;
  weightKg: number;
  barcode: string;
  status: 'ASSEMBLED' | 'QC_PENDING' | 'QC_PASSED' | 'QC_FAILED' | 'DISPATCH_READY' | 'DISPATCHED';
  qcResultId?: string;
  ecoScore: number; // 0 to 100
  estimatedEmissionsGrams: number;
}

export interface WarehouseException {
  id: string;
  timestampSimTime: number;
  type: ExceptionType;
  severity: ExceptionSeverity;
  entityId: string;
  description: string;
  status: ExceptionStatus;
  suggestedAction: string;
  aiExplanation: string;
  resolvedAtSimTime?: number;
  resolutionActionTaken?: string;
  kpiImpact: string;
}

export interface ShipmentDispatch {
  id: string;
  orderId: string;
  packageId: string;
  carrier: string;
  vehicleType: 'EV_VAN' | 'ELECTRIC_TRUCK' | 'HYBRID_FLEET';
  vehiclePlate: string;
  destination: string;
  distanceKm: number;
  dispatchedAtSimTime: number;
  estimatedDeliverySimTime: number;
  carbonKg: number;
  status: 'LOADING' | 'IN_TRANSIT' | 'DELIVERED';
  routeProgressPct?: number;
  currentLocationName?: string;
  etaMinutes?: number;
}

export interface CarbonRecord {
  id: string;
  timestampSimTime: number;
  orderId: string;
  packagingKg: number;
  warehouseEnergyKg: number;
  agvMovementKg: number;
  transportFreightKg: number;
  totalKg: number;
  savingsVsBaselineKg: number;
  isEcoPackaging: boolean;
}

export interface SimulationEventLedgerEntry {
  id: string;
  simTime: number;
  wallTimestamp: string;
  module:
    | 'COMMAND_CENTER'
    | 'INVENTORY'
    | 'ALLOCATION'
    | 'PICKING'
    | 'PACKING'
    | 'QC'
    | 'AGV'
    | 'SLOTTING'
    | 'SUSTAINABILITY'
    | 'DISPATCH';
  severity: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL';
  title: string;
  description: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AIDecisionAudit {
  id: string;
  triggerEvent: string;
  timestampSimTime: number;
  module: 'ORDER_PRIORITY' | 'DYNAMIC_SLOTTING' | 'AGV_ROUTING' | 'QC_ASSESSMENT' | 'INVENTORY_RECOVERY';
  inputs: Record<string, any>;
  chosenAction: string;
  alternativesConsidered: string[];
  reasoningFormula: string;
  expectedImpact: string;
  confidenceScore: number; // 0.0 - 1.0
  executed: boolean;
  actualOutcome?: string;
}

export interface WarehouseKPIs {
  ordersCompletedPerHour: number;
  fulfillmentRatePct: number;
  pickAccuracyPct: number;
  avgPickTimeSeconds: number;
  inventoryAccuracyPct: number;
  agvFleetUtilizationPct: number;
  totalTravelDistanceMeters: number;
  estimatedEnergyKWh: number;
  totalSimulatedCarbonKg: number;
  qcInspectionFailureRatePct: number;
  openExceptionsCount: number;
  overallGreenScorePct: number;
  baselineVsOptimizedDistanceSavedPct: number;
  baselineVsOptimizedCarbonSavedPct: number;
}

export interface WarehouseState {
  facilityName: string;
  simClock: {
    isRunning: boolean;
    speedMultiplier: number;
    simTimeSeconds: number; // seconds since simulation zero
    dayNumber: number;
    lastTickWallTime: number;
  };
  cameraPreset: 'OVERVIEW' | 'PICKING' | 'PACKING' | 'QC' | 'AGV' | 'DISPATCH' | 'SLOTTING';
  selectedEntity: {
    type: 'SKU' | 'BIN' | 'ORDER' | 'WORKER' | 'AGV' | 'EXCEPTION' | 'PACKAGE' | null;
    id: string | null;
  };
  filters: {
    zone: 'ALL' | 'ZONE_A' | 'ZONE_B' | 'ZONE_C' | 'ZONE_D';
    showRoutes: boolean;
    lowQualityMode: boolean;
    reducedMotion: boolean;
    ecoPackagingPreset: boolean;
  };
  skus: Record<string, ProductSKU>;
  bins: Record<string, BinLocation>;
  racks: StorageRack[];
  orders: Record<string, CustomerOrder>;
  workers: Record<string, WarehouseWorker>;
  agvs: Record<string, AGVFleetVehicle>;
  packingStations: Record<string, PackingStation>;
  packages: Record<string, PackageUnit>;
  qcInspections: Record<string, QCInspectionResult>;
  exceptions: Record<string, WarehouseException>;
  shipments: Record<string, ShipmentDispatch>;
  carbonRecords: CarbonRecord[];
  events: SimulationEventLedgerEntry[];
  decisions: AIDecisionAudit[];
  demoStep: number;
  isDemoRunning: boolean;
}
