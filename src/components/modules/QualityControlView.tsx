import React, { useState } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import {
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  QrCode,
  Scale,
  FileCheck,
} from 'lucide-react';

export const QualityControlView: React.FC = () => {
  const { state, actions } = useWarehouse();
  const { qcInspections, packages, orders } = state;

  const [selectedPackageId, setSelectedPackageId] = useState<string>('PKG-HYD-528');

  // Interactive Inspection Sim State
  const [barcodeValid, setBarcodeValid] = useState<boolean>(true);
  const [skuMatch, setSkuMatch] = useState<boolean>(true);
  const [qtyMatch, setQtyMatch] = useState<boolean>(true);
  const [packageIntegrity, setPackageIntegrity] = useState<boolean>(true);
  const [missingItemsDetected, setMissingItemsDetected] = useState<boolean>(false);
  const [defectNotes, setDefectNotes] = useState<string>('');

  const targetPkg = packages[selectedPackageId] || Object.values(packages)[0];

  const handleSimulatePass = () => {
    setBarcodeValid(true);
    setSkuMatch(true);
    setQtyMatch(true);
    setPackageIntegrity(true);
    setMissingItemsDetected(false);
    setDefectNotes('');

    actions.recordQCInspection(
      targetPkg.id,
      targetPkg.orderId,
      'PASS',
      {
        barcodeValidity: true,
        skuMatch: true,
        quantityMatch: true,
        packageIntegrity: true,
        missingItemsDetected: false,
      },
      'All automated computer vision and optical tare verifications passed.'
    );
  };

  const handleSimulateFail = (reason: 'DAMAGED_CARTON' | 'MISSING_ITEM') => {
    const isTear = reason === 'DAMAGED_CARTON';
    setBarcodeValid(true);
    setSkuMatch(true);
    setQtyMatch(!isTear ? false : true);
    setPackageIntegrity(isTear ? false : true);
    setMissingItemsDetected(!isTear);
    const note = isTear
      ? 'Vision model detected carton perimeter tear & seal perforation'
      : 'Optical weight scale discrepancy: missing 1x unit detected (-420g)';
    setDefectNotes(note);

    actions.recordQCInspection(
      targetPkg.id,
      targetPkg.orderId,
      'FAIL',
      {
        barcodeValidity: true,
        skuMatch: true,
        quantityMatch: !isTear ? false : true,
        packageIntegrity: isTear ? false : true,
        missingItemsDetected: !isTear,
      },
      note
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              AI COMPUTER VISION QUALITY CONTROL STATION
            </h3>
            <p className="text-xs text-slate-300">
              Stationary multi-spectral optical camera bay, volumetric dimensioner, and high-precision tare weight verification.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-emerald-400 bg-[#0A0F1E] px-3 py-1.5 rounded-lg border border-white/5">
          Inspection Station QC-01 Active
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inspection Simulator Camera View */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white tracking-wider">
                OPTICAL VISION CAMERA FEED (CAMERA BAY #1)
              </h4>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">
              Package: {targetPkg?.id || 'PKG-HYD-528'}
            </span>
          </div>

          {/* Simulated Camera Viewfinder */}
          <div className="relative w-full h-64 bg-[#070B14] rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
            {/* Viewfinder crosshairs */}
            <div className="absolute inset-4 border border-emerald-500/30 rounded pointer-events-none" />
            <div className="absolute top-6 left-6 text-[10px] font-mono text-emerald-400">
              [REC] 60 FPS • 4K MULTI-SPECTRUM • HYDERABAD FC QC
            </div>
            <div className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-400">
              TARE WEIGHT: {targetPkg ? `${targetPkg.weightKg} kg` : '3.4 kg'}
            </div>

            {/* Simulated 3D Package in inspection bay */}
            <div className="text-center space-y-2 z-10">
              <div className="w-24 h-24 mx-auto bg-slate-900/90 border-2 border-emerald-400/80 rounded-xl flex items-center justify-center glow-blue shadow-2xl">
                <QrCode className="w-12 h-12 text-emerald-400 animate-pulse" />
              </div>
              <div className="font-mono text-xs text-white font-bold">
                {targetPkg?.barcode || 'WM-HYD-9028-1129'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Order Reference: {targetPkg?.orderId}
              </div>
            </div>
          </div>

          {/* 5-Point Quality Check Checklist */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">1. Barcode Valid:</span>
              <span className={barcodeValid ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {barcodeValid ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">2. SKU Match:</span>
              <span className={skuMatch ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {skuMatch ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">3. Quantity Count:</span>
              <span className={qtyMatch ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {qtyMatch ? 'PASS' : 'FAIL'}
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">4. Carton Seal:</span>
              <span className={packageIntegrity ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {packageIntegrity ? 'INTACT' : 'PERFORATED'}
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">5. Missing Items:</span>
              <span className={!missingItemsDetected ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {!missingItemsDetected ? 'NONE' : 'DETECTED'}
              </span>
            </div>
            <div className="bg-[#0A0F1E] p-3 rounded-lg border border-white/5 flex items-center justify-between">
              <span className="text-slate-400">Tare Optical Delta:</span>
              <span className="text-cyan-400 font-bold">±0.02 kg (OK)</span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulatePass}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simulate Clean PASS</span>
            </button>
            <button
              onClick={() => handleSimulateFail('DAMAGED_CARTON')}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Damaged Carton</span>
            </button>
            <button
              onClick={() => handleSimulateFail('MISSING_ITEM')}
              className="px-4 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Missing Item Shortage</span>
            </button>
          </div>
        </div>

        {/* Right Column: Historical QC Inspection Log */}
        <div className="glass-panel rounded-xl p-5 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-slate-300" />
              <h4 className="text-xs font-bold text-white tracking-wider">
                QC INSPECTIONS AUDIT
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {Object.keys(qcInspections).length} Recorded
            </span>
          </div>

          <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {Object.values(qcInspections).map((ins) => {
              const isPass = ins.result === 'PASS';
              return (
                <div
                  key={ins.id}
                  className="bg-[#0A0F1E] border border-white/5 rounded-lg p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400">{ins.packageId}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        isPass
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {ins.result}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">Order: {ins.orderId}</p>
                  {ins.defectNotes && (
                    <p className="text-[11px] text-rose-300 bg-rose-950/40 p-1.5 rounded border border-rose-500/20">
                      Defect: {ins.defectNotes}
                    </p>
                  )}
                  {ins.resolutionAction && (
                    <p className="text-[10px] text-slate-500 font-mono">
                      Action: {ins.resolutionAction}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
