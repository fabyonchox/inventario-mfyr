import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Filter, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  User, 
  Calendar,
  Building2
} from 'lucide-react';
import type { Movement, MovementType, Product } from '../types/inventory';

import { exportToExcel } from '../services/storage';

interface HistoryViewProps {
  movements: Movement[];
  products: Product[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ movements, products }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.productoCodigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productoDescripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.entregadoA && m.entregadoA.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.numeroComprobante && m.numeroComprobante.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filterType === 'ALL' || m.tipo === filterType;

      return matchesSearch && matchesType;
    });
  }, [movements, searchTerm, filterType]);

  const totalInflow = movements
    .filter((m) => m.tipo === 'ENTRADA')
    .reduce((acc, m) => acc + m.cantidad, 0);

  const totalOutflow = movements
    .filter((m) => m.tipo === 'SALIDA')
    .reduce((acc, m) => acc + m.cantidad, 0);

  const totalTransfers = movements
    .filter((m) => m.tipo === 'TRANSFERENCIA')
    .reduce((acc, m) => acc + m.cantidad, 0);

  const getBadgeForType = (tipo: MovementType) => {
    switch (tipo) {
      case 'ENTRADA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ArrowDownToLine className="w-3 h-3" />
            Entrada
          </span>
        );
      case 'SALIDA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ArrowUpFromLine className="w-3 h-3" />
            Salida
          </span>
        );
      case 'TRANSFERENCIA':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <ArrowLeftRight className="w-3 h-3" />
            Transferencia
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Kardex Header & Metrics */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              Kardex y Auditoría de Movimientos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable de recepciones, despachos y reubicaciones internas
          </p>
        </div>

        <button
          onClick={() => exportToExcel(products, movements)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Todo a Excel</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Recepciones</span>
          <span className="text-lg font-extrabold text-emerald-950">+{totalInflow} u.</span>
        </div>
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-rose-800 block">Total Entregas</span>
          <span className="text-lg font-extrabold text-rose-950">-{totalOutflow} u.</span>
        </div>
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200/80 text-center">
          <span className="text-[10px] uppercase font-bold text-indigo-800 block">Reubicaciones</span>
          <span className="text-lg font-extrabold text-indigo-950">{totalTransfers} u.</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por receptor (ej: Kinesiología, Box 1), insumo, código o N° comprobante..."
            className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Tipo:
          </span>
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({movements.length})
          </button>
          <button
            onClick={() => setFilterType('ENTRADA')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'ENTRADA'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Entradas ({movements.filter((m) => m.tipo === 'ENTRADA').length})
          </button>
          <button
            onClick={() => setFilterType('SALIDA')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'SALIDA'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Salidas ({movements.filter((m) => m.tipo === 'SALIDA').length})
          </button>
          <button
            onClick={() => setFilterType('TRANSFERENCIA')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterType === 'TRANSFERENCIA'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            Transferencias ({movements.filter((m) => m.tipo === 'TRANSFERENCIA').length})
          </button>
        </div>
      </div>

      {/* Movements Feed */}
      <div className="space-y-2.5">
        {filteredMovements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No hay movimientos registrados</h3>
            <p className="text-xs text-slate-400 mt-1">
              Los registros de recepción o despacho aparecerán aquí con su fecha y receptor.
            </p>
          </div>
        ) : (
          filteredMovements.map((mov) => {
            const dateObj = new Date(mov.fecha);
            const dateFormatted = dateObj.toLocaleDateString('es-CL', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
            const timeFormatted = dateObj.toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={mov.id}
                className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col gap-2"
              >
                {/* Header Row: Type badge, Date, and Quantity */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getBadgeForType(mov.tipo)}
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      {dateFormatted} a las {timeFormatted}
                    </span>
                  </div>

                  <span
                    className={`text-sm sm:text-base font-extrabold ${
                      mov.tipo === 'ENTRADA'
                        ? 'text-emerald-700'
                        : mov.tipo === 'SALIDA'
                        ? 'text-rose-700'
                        : 'text-indigo-700'
                    }`}
                  >
                    {mov.tipo === 'ENTRADA' ? '+' : mov.tipo === 'SALIDA' ? '-' : '⇄'} {mov.cantidad} u.
                  </span>
                </div>

                {/* Product Detail */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {mov.productoCodigo}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                      {mov.productoDescripcion}
                    </h4>
                  </div>
                </div>

                {/* Body Details: Bodega & Receptor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs text-slate-600">
                  {/* Location Info */}
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {mov.tipo === 'ENTRADA' && (
                        <span>Ingresó a: <strong className="text-slate-800 font-bold">{mov.bodegaDestino === 'BOD_1' ? 'Bodega 1' : 'Bodega 2'}</strong></span>
                      )}
                      {mov.tipo === 'SALIDA' && (
                        <span>Retirado de: <strong className="text-slate-800 font-bold">{mov.bodegaOrigen === 'BOD_1' ? 'Bodega 1' : 'Bodega 2'}</strong></span>
                      )}
                      {mov.tipo === 'TRANSFERENCIA' && (
                        <span>
                          De: <strong>{mov.bodegaOrigen === 'BOD_1' ? 'Bodega 1' : 'Bodega 2'}</strong> → A: <strong>{mov.bodegaDestino === 'BOD_1' ? 'Bodega 1' : 'Bodega 2'}</strong>
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Recipient Info (Critical for Salidas) */}
                  {mov.entregadoA && (
                    <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200">
                      <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Entregado a: <strong className="font-bold">{mov.entregadoA}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Optional Comprobante and Observation */}
                {(mov.numeroComprobante || mov.motivo || mov.observacion) && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg flex flex-wrap items-center gap-x-3 gap-y-1">
                    {mov.numeroComprobante && (
                      <span>N° Comprobante: <strong className="text-slate-700">{mov.numeroComprobante}</strong></span>
                    )}
                    {mov.motivo && (
                      <span>Motivo: <span className="text-slate-700">{mov.motivo}</span></span>
                    )}
                    {mov.observacion && (
                      <span>Nota: <span className="text-slate-700">{mov.observacion}</span></span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
