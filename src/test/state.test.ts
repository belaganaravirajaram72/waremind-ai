import { describe, it, expect } from 'vitest';
import { createInitialWarehouseState } from '../data/mockWarehouse';
import { warehouseReducer, calculateKPIs } from '../context/WarehouseContext';

describe('Warehouse State & Reducer Invariant Suite', () => {
  it('initializes deterministic seed with required entity counts', () => {
    const state = createInitialWarehouseState();

    expect(Object.keys(state.skus).length).toBeGreaterThanOrEqual(50);
    expect(Object.keys(state.bins).length).toBeGreaterThanOrEqual(40);
    expect(state.racks.length).toBeGreaterThanOrEqual(20);
    expect(Object.keys(state.orders).length).toBeGreaterThanOrEqual(30);
    expect(Object.keys(state.workers).length).toBe(5);
    expect(Object.keys(state.agvs).length).toBe(4);
    expect(Object.keys(state.packingStations).length).toBe(3);
  });

  it('atomically allocates order stock without negative balance', () => {
    const initialState = createInitialWarehouseState();
    const pendingOrder = Object.values(initialState.orders).find((o) => o.status === 'PENDING');
    expect(pendingOrder).toBeDefined();

    if (!pendingOrder) return;

    const firstLine = pendingOrder.lines[0];
    const skuBefore = initialState.skus[firstLine.skuId];
    const availableBefore = skuBefore.availableStock;
    const reservedBefore = skuBefore.reservedStock;

    const nextState = warehouseReducer(initialState, {
      type: 'ALLOCATE_ORDER_STOCK',
      orderId: pendingOrder.id,
    });

    const skuAfter = nextState.skus[firstLine.skuId];
    expect(skuAfter.availableStock).toBeLessThanOrEqual(availableBefore);
    expect(skuAfter.availableStock).toBeGreaterThanOrEqual(0);
    expect(skuAfter.reservedStock).toBeGreaterThanOrEqual(reservedBefore);
    expect(skuAfter.totalStock).toBe(skuAfter.availableStock + skuAfter.reservedStock);
  });

  it('blocks dispatch when package has failed QC inspection', () => {
    const state = createInitialWarehouseState();

    // Order ORD-HYD-9029 is in QC_FAILED state with PKG-HYD-529
    const failedOrder = state.orders['ORD-HYD-9029'];
    expect(failedOrder).toBeDefined();
    expect(failedOrder.status).toBe('QC_FAILED');

    const nextState = warehouseReducer(state, {
      type: 'DISPATCH_ORDER',
      orderId: 'ORD-HYD-9029',
      carrier: 'BlueDart Green',
      vehicleType: 'EV_VAN',
    });

    // Guard must prevent dispatch
    expect(nextState.orders['ORD-HYD-9029'].status).toBe('QC_FAILED');
    expect(nextState.events[0].severity).toBe('CRITICAL');
    expect(nextState.events[0].title).toContain('DISPATCH REJECTED');
  });

  it('updates SKU and bins atomically upon dynamic slotting move', () => {
    const state = createInitialWarehouseState();
    const sku = state.skus['SKU-WH-204'];
    expect(sku).toBeDefined();
    const previousBinId = sku.currentBinId;
    const targetBinId = 'BIN-A-04';

    const nextState = warehouseReducer(state, {
      type: 'EXECUTE_SLOTTING_MOVE',
      skuId: 'SKU-WH-204',
      targetBinId,
      explanation: 'Move high-velocity SKU closer to packing hub',
    });

    expect(nextState.skus['SKU-WH-204'].currentBinId).toBe(targetBinId);
    expect(nextState.bins[targetBinId].currentSKUId).toBe('SKU-WH-204');
    expect(nextState.bins[previousBinId].currentSKUId).toBeNull();
    expect(nextState.events[0].module).toBe('SLOTTING');
  });

  it('accurately calculates derived KPIs from state entities', () => {
    const state = createInitialWarehouseState();
    const kpis = calculateKPIs(state);

    expect(kpis.fulfillmentRatePct).toBeGreaterThan(90);
    expect(kpis.pickAccuracyPct).toBeGreaterThanOrEqual(99.0);
    expect(kpis.ordersCompletedPerHour).toBeGreaterThan(0);
    expect(kpis.agvFleetUtilizationPct).toBeGreaterThanOrEqual(0);
    expect(kpis.agvFleetUtilizationPct).toBeLessThanOrEqual(100);
    expect(kpis.overallGreenScorePct).toBeGreaterThan(50);
  });
});
