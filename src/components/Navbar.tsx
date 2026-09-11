import React, { useState } from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Package, 
  Layers,
  Menu,
  X
} from 'lucide-react';
import type { Product, Movement } from '../types/inventory';

import { exportToExcel, exportBackupJson, resetToInitialCatalog } from '../services/storage';

interface NavbarProps {
  products: Product[];
  movements: Movement[];
  onDataReset: (newProducts: Product[]) => void;
  onOpenScanner: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  products,
  movements,
  onDataReset,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalStockB1 = products.reduce((acc, p) => acc + p.stockBodega1, 0);
  const totalStockB2 = products.reduce((acc, p) => acc + p.stockBodega2, 0);
  const lowStockCount = products.filter(
    (p) => p.stockBodega1 + p.stockBodega2 <= p.stockMinimo
  ).length;

  const handleReset = () => {
    if (
      window.confirm(
        '¿Estás seguro de restablecer el catálogo a los 74 productos iniciales del hospital? Se borrará el historial local.'
      )
    ) {
      const reset = resetToInitialCatalog();
      onDataReset(reset);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Service Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                  MFYR • Hospital
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online / Offline Ready
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Control de Inventario <span className="font-normal text-slate-500 text-sm hidden sm:inline">| Medicina Física y Rehabilitación</span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics in Desktop Header */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700">
              <Package className="w-4 h-4 text-teal-600" />
              <span>Bodega 1: <strong className="text-slate-900 font-bold">{totalStockB1}</strong> u.</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Bodega 2: <strong className="text-slate-900 font-bold">{totalStockB2}</strong> u.</span>
            </div>

            {lowStockCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-200 text-xs font-semibold text-amber-700 animate-pulse-subtle">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{lowStockCount} alertas de stock</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToExcel(products, movements)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg transition-colors cursor-pointer active:scale-95"
              title="Descargar planilla Excel oficial con existencias y kardex"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel</span>
            </button>

            <button
              onClick={() => exportBackupJson(products, movements)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer active:scale-95"
              title="Descargar copia de seguridad en JSON"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Respaldo</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-slate-500 block">Stock Bodega 1</span>
              <strong className="text-slate-900 text-sm font-bold">{totalStockB1} u.</strong>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <span className="text-slate-500 block">Stock Bodega 2</span>
              <strong className="text-slate-900 text-sm font-bold">{totalStockB2} u.</strong>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="flex items-center justify-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs font-semibold text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{lowStockCount} insumos bajo stock mínimo</span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                exportToExcel(products, movements);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Descargar Planilla Excel (.xlsx)
            </button>
            <button
              onClick={() => {
                exportBackupJson(products, movements);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 rounded-lg border border-slate-200"
            >
              <Download className="w-4 h-4 text-slate-600" />
              Descargar Respaldo JSON
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restablecer Catálogo Original
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
