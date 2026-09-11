import React, { useState } from 'react';
import { X, FileSpreadsheet, ShoppingCart, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

import type { Product } from '../types/inventory';

interface OrderItem {
  codigo: string;
  descripcion: string;
  factor: string;
  categoria: string;
  stockActual: number;
  stockMinimo: number;
  cantidadPedida: number;
}

interface OrderRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const OrderRequestModal: React.FC<OrderRequestModalProps> = ({
  isOpen,
  onClose,
  products,
}) => {
  // Inicializar con todos los insumos en stock bajo/agotado
  const [items, setItems] = useState<OrderItem[]>(() => {
    return products
      .filter((p) => p.stockBodega1 + p.stockBodega2 <= p.stockMinimo)
      .map((p) => {
        const total = p.stockBodega1 + p.stockBodega2;
        const sugerido = Math.max(1, p.stockMinimo * 3 - total);
        return {
          codigo: p.codigo,
          descripcion: p.descripcion,
          factor: p.factor,
          categoria: p.categoria,
          stockActual: total,
          stockMinimo: p.stockMinimo,
          cantidadPedida: sugerido,
        };
      });
  });

  const [selectedAddCode, setSelectedAddCode] = useState('');

  if (!isOpen) return null;

  const handleUpdateQty = (codigo: string, qty: number) => {
    setItems((prev) =>
      prev.map((it) => (it.codigo === codigo ? { ...it, cantidadPedida: Math.max(1, qty) } : it))
    );
  };

  const handleRemoveItem = (codigo: string) => {
    setItems((prev) => prev.filter((it) => it.codigo !== codigo));
  };

  const handleAddItem = () => {
    if (!selectedAddCode) return;
    const prod = products.find((p) => p.codigo === selectedAddCode);
    if (!prod) return;

    if (items.some((it) => it.codigo === prod.codigo)) return;

    const total = prod.stockBodega1 + prod.stockBodega2;
    setItems((prev) => [
      ...prev,
      {
        codigo: prod.codigo,
        descripcion: prod.descripcion,
        factor: prod.factor,
        categoria: prod.categoria,
        stockActual: total,
        stockMinimo: prod.stockMinimo,
        cantidadPedida: Math.max(1, prod.stockMinimo * 2),
      },
    ]);
    setSelectedAddCode('');
  };

  const handleExportOrder = () => {
    if (items.length === 0) return;

    const fechaHoy = new Date().toISOString().split('T')[0];
    const rows = items.map((it) => ({
      'Código Institucional': it.codigo,
      'Descripción del Insumo Clínico': it.descripcion,
      'Unidad / Factor': it.factor,
      'Categoría': it.categoria,
      'Stock Actual en Servicio': it.stockActual,
      'Cantidad Solicitada a Bodega General': it.cantidadPedida,
      'Observación / Justificación': 'Pedido mensual regular MFYR',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Pedido Bodega General');
    XLSX.writeFile(wb, `Pedido_Mensual_Bodega_General_MFYR_${fechaHoy}.xlsx`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal-700/80 rounded-xl">
              <ShoppingCart className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Generador de Pedido Mensual a Bodega General
              </h3>
              <p className="text-xs text-teal-200">
                Directriz Punto 5: Cálculo automático de requerimientos para nómina de reposición
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-teal-900 hover:bg-teal-950 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Add product to order bar */}
          <div className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <select
              value={selectedAddCode}
              onChange={(e) => setSelectedAddCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="">-- Agregar otro insumo del catálogo al pedido --</option>
              {products
                .filter((p) => !items.some((it) => it.codigo === p.codigo))
                .map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    [{p.codigo}] {p.descripcion} (Stock actual: {p.stockBodega1 + p.stockBodega2})
                  </option>
                ))}
            </select>
            <button
              onClick={handleAddItem}
              disabled={!selectedAddCode}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Items Table */}
          {items.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">¡Todos los insumos tienen stock óptimo!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Puedes agregar insumos manualmente usando el selector de arriba si deseas solicitar reposición anticipada.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Insumos a solicitar: <strong>{items.length}</strong></span>
                <span className="text-teal-700 font-semibold">Total unidades solicitadas: {items.reduce((acc, it) => acc + it.cantidadPedida, 0)}</span>
              </div>

              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                {items.map((it) => (
                  <div key={it.codigo} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                          {it.codigo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{it.categoria}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 truncate mt-0.5">{it.descripcion}</h5>
                      <span className="text-[11px] text-slate-500">
                        Stock actual: <strong className={it.stockActual <= it.stockMinimo ? 'text-amber-700' : 'text-slate-700'}>{it.stockActual}</strong> {it.factor} (Mín: {it.stockMinimo})
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Solicitar ({it.factor})</label>
                        <input
                          type="number"
                          min="1"
                          value={it.cantidadPedida}
                          onChange={(e) => handleUpdateQty(it.codigo, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 bg-teal-50 border border-teal-300 rounded-lg text-sm font-extrabold text-center text-teal-950 focus:ring-2 focus:ring-teal-500"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveItem(it.codigo)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Quitar de la nómina"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={handleExportOrder}
            disabled={items.length === 0}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Descargar Nómina Oficial de Pedido (.xlsx)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
