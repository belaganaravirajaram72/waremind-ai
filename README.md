# 🚀 WAREMIND AI — SMART WAREHOUSE DIGITAL TWIN

### AI-Powered Warehouse Operations & Order Fulfillment System
### SMART WAREHOUSE OPERATIONS — HYDERABAD FC

> **Predict. Decide. Move. Fulfill.**

---

## 🏆 Executive Summary

**WAREMIND AI** is an industrial-grade **3D Warehouse Digital Twin & Autonomous Operations Command Center** designed for high-throughput fulfillment at the **Hyderabad FC** logistics facility. 

Unlike traditional passive dashboards or simple CRUD applications, **WAREMIND AI** actively runs the complete warehouse lifecycle:
```text
ORDER CREATED → AI PRIORITY → INVENTORY CHECK → ATOMIC ALLOCATION → DEMAND FORECAST → DYNAMIC SLOTTING → PICKING → AGV / WORKER ROUTE → PACKING → CV QUALITY CHECK → CARBON CALCULATION → DISPATCH → HYDERABAD LAST-MILE DELIVERY → INVENTORY UPDATE → ANALYTICS
```

The system is governed by a unified operational philosophy:
$$\text{Exception} \longrightarrow \text{Decision} \longrightarrow \text{Resolution} \longrightarrow \text{KPI}$$

Every AI decision is paired with **algorithmic explainability**, detailing input variables, mathematical rationale, projected delta impacts, and audited outcomes.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| **3D Digital Twin Engine** | Three.js, React Three Fiber (R3F), Drei |
| **State Management** | Centralized React Context + `useReducer` with Deterministic Invariant Enforcement |
| **Data & Visualizations** | Recharts, Lucide React |
| **Simulation Runtime** | Independent Sim-Clock with Multi-Speed Time Warping (1x, 2x, 5x) |
| **Speech & AR Guidance** | Web Speech Synthesis API (English & Telugu `తెలుగు`) + Holographic Wayfinding Ribbons |
| **Verification & Testing** | Vitest, Oxlint |

---

## 🎨 Global Visual Aesthetics (Unreal Engine 5-Inspired)

- **Primary Background**: `#0A0F1E` Dark Industrial Metallic Surface.
- **Atmosphere**: Deep blue ambient illumination, soft volumetric fog, illuminated floor grids with neon dot intersections.
- **Glassmorphism**: Translucent floating telemetry cards (`backdrop-blur-md`), razor-thin glowing borders, and interactive HUD viewports.
- **8 Color-Coded Operational Zones**:
  - 🟡 **Picking Zone (`#EAB308`)**: Multi-tier pallet racking, storage totes, picking aisles, and human-robot collaborative work cells.
  - 🩷 **Packing Zone (`#EC4899`)**: Packaging workbenches, touchscreen terminals, carton roll dispensers, and parcels.
  - 🔵 **Dispatch Zone (`#2563EB`)**: Hydraulic dock levellers, roll-up shutter portals, and animated EV delivery vans.
  - 🔷 **AI Slotting Zone (`#00E5FF`)**: High-velocity Golden Zone racks with real-time SKU relocation highlights.
  - 🟢 **CV QC Zone (`#10B981`)**: Computer vision camera portal with animated pulsating laser scanner plane.
  - 🟠 **AGV Optimization Zone (`#F97316`)**: Omni-directional AGV robot network, collision-free corridors, and solar induction charging docks.
  - 🌱 **Carbon Zone (`#34D399`)**: Real-time Scope 1, 2, and 3 emissions telemetry and solar battery bank status.
  - 🟣 **AR Voice Zone (`#8B5CF6`)**: Worker staging beacon with holographic wayfinding paths.

---

## ⚡ Core Feature Implementations

### 1. 🔷 Dynamic Slotting & Demand Velocity Forecasting
- **The Problem**: Static bin assignments force workers to travel excessive distances for fast-moving goods.
- **The Solution**: 30-day moving average demand forecasting engine classifies SKUs into Velocity tiers (*Critical, Fast, Normal, Slow*).
- **The Decision**: High-velocity `SKU-WH-204` (Wireless Audio System) is dynamically migrated from remote `Bin C-18` (48m from packing) to Golden Zone `Bin A-04` (21m from packing).
- **The Impact**:
  - Picker travel distance: **-38%** (-1.02 km/day)
  - Travel time saved: **38%** (42s $\rightarrow$ 26s per pick)
  - Fulfillment throughput: **+24%**

### 2. 🟢 Computer Vision QC & Theft-Prevention Architecture
- **Visual Inspection Bay**: Stationary camera bay with dual overhead lenses and pulsating multi-spectral laser plane.
- **Verification Matrix**: Barcode validity, SKU matching, volumetric dimensioning, and optical tare weight matching.
- **Failure Mitigation**:
  - Damaged carton detection automatically halts infeed, flashes red alert beacon, diverts package via pneumatic reject arm, and logs an exception.
  - Mis-pick detection (`WH-209` detected instead of `WH-204`) locks dispatch staging.
  - Unscanned inventory movement pauses picker workflow until RFID/barcode scan verification is logged.

### 3. 🟠 Autonomous AGV Fleet Optimization & A* Pathfinding
- **4 Active Autonomous Guided Vehicles**: `AGV-01`, `AGV-02`, `AGV-03`, `AGV-04` equipped with rotating LiDAR domes, 360° LED status halos, cargo decks, and battery telemetry.
- **Congestion Avoidance**: When cross-aisle picker traffic creates deadlock in Lane B-04, the system calculates an A* detour via the North Bypass Spine.
- **Energy Optimization**:
  - Baseline Route: 184m (18% battery consumption)
  - Optimized Detour: 151m (14% battery consumption)
  - Energy Saved: **22%**
- **Automated Recharging**: Depleted AGVs autonomously return to solar-powered inductive charging pads.

### 4. 🌱 Sustainability & Carbon Intelligence
- **Carbon Accounting Formula**:
  $$\text{Total CO}_2 = \text{Packaging} + \text{Warehouse Energy} + \text{AGV Fleet Power} + \text{Last-Mile EV Freight}$$
- **Interactive Eco-Packaging Slider**: Dynamic 0%–100% slider updates carton emissions in real time.
- **Green Score**: Computes facility ESG rating (94 / 100, Grade A+).

### 5. 🟣 Hands-Free Voice Picking & AR Worker Guidance
- **Visual AR Wayfinding**: Holographic ribbon projects across the 3D warehouse floor leading worker Priya Sharma directly to the target bin.
- **Dual-Language Verbal Assistant**: Supports both English and Telugu:
  - English: *"Next Item"* / *"Confirm Pick"*
  - Telugu: `తదుపరి వస్తువు` / `ధృవీకరించండి`
- **Native Browser Speech Synthesis**: `SpeechSynthesisUtterance` gives spoken audio prompts.

### 6. 🚚 Dispatch Pipeline & Hyderabad Last-Mile Route Radar
- **3D Dispatch Departure**: Triggering dispatch animates the EV Van's headlights, closes roll-up doors, and drives the vehicle out of Bay 1 onto the exterior road.
- **Hyderabad Route Radar**: Live tracking radar traces the vehicle from **Hyderabad FC Logistics Hub** $\rightarrow$ **Outer Ring Road** $\rightarrow$ **Gachibowli Junction** $\rightarrow$ **Hitec City Client**, displaying live distance countdown and ETA.

---

## 🧭 15 Modular Navigation Workspaces

1. **AI Command Center**: Integrated dual-pane dashboard with embedded 3D digital twin viewport, live priority SLA alerts, and AI decision stream.
2. **3D Digital Twin**: Full-screen interactive Three.js environment with 7 camera presets, zone filters, and quick focus toggles.
3. **Order Management**: 32 customer orders with priority scores (0–100) and atomic stock allocation controls.
4. **Inventory Intelligence**: 54 SKUs tracked across 48 bins with reorder risk classification and 3D rack highlighting.
5. **Picking Operations**: Human picker and robot collaborative queues with pick verification.
6. **Packing & Dispatch**: 3 packing hubs, FSC packaging type selection, and vehicle loading staging.
7. **Demand Forecasting**: Interactive historical area charts with moving average projection.
8. **Dynamic Slotting**: Aisle travel reduction engine comparing before vs. after metrics.
9. **Computer Vision QC**: Real-time laser scanning inspection simulator with pass/fail scenarios.
10. **AGV Fleet**: Robot telemetry, battery monitoring, and A* detour rerouting.
11. **Carbon Intelligence**: Scope 1, 2, 3 carbon accounting with interactive packaging slider.
12. **AR & Voice Picking**: Telugu/English voice assistant with live audio visualizer.
13. **Exception Center**: Lifecycle resolution queue for warehouse incidents with instantaneous action triggers.
14. **Analytics & Reports**: Before vs. After operational benchmarks and hourly throughput charts.
15. **Event Ledger & Audit**: Append-only immutable transaction log and explainable AI decision journal.

---

## 🎬 Hackathon Demo Mode (▶ PLAY DEMO)

Clicking **PLAY DEMO** in the header launches an automated **20-step judge walkthrough**:
1. Urgent Order Ingress (`ORD-HYD-9001`)
2. Algorithmic Priority Score Calculation (96/100)
3. Inventory Shortage Detection (7 Available vs. 10 Needed)
4. Atomic Stock Allocation Decision
5. Automated Vendor Replenishment Trigger
6. Demand Velocity Forecasting Peak
7. Dynamic Slotting Proposal (C-18 $\rightarrow$ A-04)
8. Physical SKU Relocation in 3D Warehouse
9. Picker & AGV Collaborative Assignment
10. Holographic AR Wayfinding Ribbon Projection
11. Transit to Packing Hub via North Spine
12. Robotic Arm Conveyor Infeed
13. FSC Recycled Carton Packaging Assembly
14. Multi-Spectral Laser CV Inspection Scan
15. Quality Control Verification PASS ✓
16. Carbon Footprint & Green Score Computation
17. Hydraulic Dock Loading onto EV Van
18. Van Departure & Transit to Hitec City
19. Live Telemetry & Throughput Analytics Update
20. Before-vs-After Transformation Metrics (38% Travel Saved, 22% Energy Saved, 26% CO₂ Reduced)

---

## 🛠️ Installation & Execution

### Prerequisites
- Node.js 18+
- npm 9+

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Run unit & state invariant tests
npm test

# 3. Build optimized production bundle
npm run build

# 4. Launch local development server
npm run dev

# 5. Preview production build
npm run preview
```

---

## 🌟 Hackathon Verdict

**WAREMIND AI** unites operations research, 3D simulation, and explainable artificial intelligence into a cohesive, production-grade warehouse operating system designed to fulfill tomorrow's supply chains today.
