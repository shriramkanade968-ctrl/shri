import React from 'react';
import {
  Droplet,
  Activity,
  BedDouble,
  Wind,
  Zap,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  PackagePlus,
  RotateCcw
} from 'lucide-react';
import { BloodInventoryItem, HospitalCapacity } from '../types/hems';

interface ResourceInventoryProps {
  bloodInventory: BloodInventoryItem[];
  capacity: HospitalCapacity;
  onUpdateBloodUnits: (bloodType: string, delta: number) => void;
  onDispenseMtpPack: () => void;
  onUpdateVentilators: (delta: number) => void;
}

export const ResourceInventory: React.FC<ResourceInventoryProps> = ({
  bloodInventory,
  capacity,
  onUpdateBloodUnits,
  onDispenseMtpPack,
  onUpdateVentilators
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-rose-500" />
            <span>Critical Emergency Hospital Resources & Blood Bank</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time blood transfusion reserves, mechanical ventilator allocation, and central oxygen telemetry
          </p>
        </div>

        <button
          onClick={onDispenseMtpPack}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Droplet className="w-4 h-4 fill-current" />
          <span>Release MTP Cooler #1 (6 PRBC : 6 FFP : 1 Plt)</span>
        </button>
      </div>

      {/* Hospital Infrastructure Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ventilator Utilization */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Mechanical Ventilators
            </span>
            <Wind className="w-4 h-4 text-blue-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">
              {capacity.ventilators.inUse} <span className="text-sm font-normal text-slate-400">/ {capacity.ventilators.total}</span>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {capacity.ventilators.total - capacity.ventilators.inUse} Available
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${(capacity.ventilators.inUse / capacity.ventilators.total) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
            <span className="text-slate-400">Quick Allocate:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdateVentilators(-1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Release Ventilator"
              >
                <Minus className="w-3 h-3" />
              </button>
              <button
                onClick={() => onUpdateVentilators(1)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Deploy Ventilator"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Oxygen Supply */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Central Bulk Liquid O₂
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {capacity.oxygenSupplyPercent}%
            </span>
            <span className="text-xs font-mono text-slate-400">Nominal 55 PSI</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${capacity.oxygenSupplyPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            Vacuum Insulated Evaporator (VIE) cryogenic reserve safe for ~14 days.
          </p>
        </div>

        {/* Power Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              Emergency Electrical Grid
            </span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold font-mono text-slate-100">
              {capacity.powerStatus}
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">100% Ready</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full bg-amber-500" style={{ width: '100%' }} />
          </div>

          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
            Dual diesel turbine backup generators tested & fuel tanks 98% full.
          </p>
        </div>
      </div>

      {/* Blood Bank Live Stock Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-rose-500" />
              <span>Blood Bank Transfusion Inventory</span>
            </h3>
            <p className="text-xs text-slate-400">Click + or - to manage emergency blood unit release</p>
          </div>
          <span className="text-xs font-mono text-slate-400">Target Reserve: ≥ 15 units O+ / ≥ 12 units O-</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {bloodInventory.map((item, idx) => {
            const isCritical = item.units <= item.minSafeReserve;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                  isCritical
                    ? 'bg-rose-950/40 border-rose-800/80 shadow-md'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-slate-100 block">{item.type}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Min Reserve: {item.minSafeReserve} units</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black font-mono ${isCritical ? 'text-rose-400' : 'text-slate-100'}`}>
                      {item.units}
                    </span>
                    <span className="text-[11px] text-slate-500">units in fridge</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateBloodUnits(item.type, -1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Transfuse / Dispense Unit"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onUpdateBloodUnits(item.type, 1)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Restock Unit"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
