import React, { useState } from 'react';
import { WarehouseProvider } from './context/WarehouseContext';
import { Header } from './components/layout/Header';
import { Sidebar, type ModuleId } from './components/layout/Sidebar';
import { BottomKpiBar } from './components/layout/BottomKpiBar';
import { DemoModeModal } from './components/common/DemoModeModal';

// Module Views
import { AICommandCenterView } from './components/modules/AICommandCenterView';
import { DigitalTwinView } from './components/modules/DigitalTwinView';
import { OrderManagementView } from './components/modules/OrderManagementView';
import { InventoryIntelligenceView } from './components/modules/InventoryIntelligenceView';
import { PickingOperationsView } from './components/modules/PickingOperationsView';
import { PackingDispatchView } from './components/modules/PackingDispatchView';
import { DemandForecastingView } from './components/modules/DemandForecastingView';
import { DynamicSlottingView } from './components/modules/DynamicSlottingView';
import { QualityControlView } from './components/modules/QualityControlView';
import { AGVFleetView } from './components/modules/AGVFleetView';
import { CarbonIntelligenceView } from './components/modules/CarbonIntelligenceView';
import { VoicePickingView } from './components/modules/VoicePickingView';
import { ExceptionCenterView } from './components/modules/ExceptionCenterView';
import { AnalyticsReportsView } from './components/modules/AnalyticsReportsView';
import { SystemHealthLedgerView } from './components/modules/SystemHealthLedgerView';

const WarehouseAppContent: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleId>('COMMAND_CENTER');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const renderModuleView = () => {
    switch (activeModule) {
      case 'COMMAND_CENTER':
        return <AICommandCenterView onNavigate={setActiveModule} />;
      case 'DIGITAL_TWIN':
        return <DigitalTwinView />;
      case 'ORDER_MANAGEMENT':
        return <OrderManagementView />;
      case 'INVENTORY_INTELLIGENCE':
        return <InventoryIntelligenceView />;
      case 'PICKING_OPERATIONS':
        return <PickingOperationsView />;
      case 'PACKING_DISPATCH':
        return <PackingDispatchView />;
      case 'DEMAND_FORECASTING':
        return <DemandForecastingView />;
      case 'DYNAMIC_SLOTTING':
        return <DynamicSlottingView />;
      case 'QUALITY_CONTROL':
        return <QualityControlView />;
      case 'AGV_FLEET':
        return <AGVFleetView />;
      case 'CARBON_INTELLIGENCE':
        return <CarbonIntelligenceView />;
      case 'VOICE_PICKING':
        return <VoicePickingView />;
      case 'EXCEPTION_CENTER':
        return <ExceptionCenterView />;
      case 'ANALYTICS_REPORTS':
        return <AnalyticsReportsView />;
      case 'EVENT_LEDGER':
        return <SystemHealthLedgerView />;
      default:
        return <AICommandCenterView onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0F1E] text-[#F8FAFC]">
      {/* Global Facility Header */}
      <Header />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Active Module Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 relative">
          {renderModuleView()}
        </main>
      </div>

      {/* Sticky Bottom Operational KPI Bar */}
      <BottomKpiBar />

      {/* Hackathon Interactive Demo Presentation Modal */}
      <DemoModeModal />
    </div>
  );
};

export default function App() {
  return (
    <WarehouseProvider>
      <WarehouseAppContent />
    </WarehouseProvider>
  );
}
