import React from 'react';
import { 
  Package, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ClipboardList,
  ScanLine
} from 'lucide-react';

export type TabType = 'inventory' | 'history';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenInflow: () => void;
  onOpenOutflow: () => void;
  onOpenScanner: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenInflow,
  onOpenOutflow,
  onOpenScanner,
}) => {

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center gap-1">
        {/* Tab 1: Inventario */}
        <button
          onClick={() => onSelectTab('inventory')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'inventory'
              ? 'text-teal-700 bg-teal-50 font-bold scale-102'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Stock</span>
        </button>

        {/* Action 1: Entrada */}
        <button
          onClick={onOpenInflow}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mb-0.5 shadow-xs">
            <ArrowDownToLine className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-emerald-800">Entrada</span>
        </button>

        {/* Center Scanner FAB */}
        <div className="flex justify-center -mt-5">
          <button
            onClick={onOpenScanner}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-400 text-white flex flex-col items-center justify-center shadow-lg shadow-teal-600/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white cursor-pointer"
            title="Escanear Código de Barra o QR"
          >
            <ScanLine className="w-6 h-6" />
            <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">Escanear</span>
          </button>
        </div>

        {/* Action 2: Salida */}
        <button
          onClick={onOpenOutflow}
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-rose-700 hover:bg-rose-50 transition-all cursor-pointer active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 mb-0.5 shadow-xs">
            <ArrowUpFromLine className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold text-rose-800">Salida</span>
        </button>

        {/* Tab 2: Kardex */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'history'
              ? 'text-teal-700 bg-teal-50 font-bold scale-102'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Kardex</span>
        </button>
      </div>
    </div>
  );
};
