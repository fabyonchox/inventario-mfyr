import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { X, Printer, Barcode } from 'lucide-react';
import type { Product } from '../types/inventory';


interface BarcodeModalProps {
  product: Product | null;
  onClose: () => void;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({ product, onClose }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (product && svgRef.current) {
      try {
        JsBarcode(svgRef.current, product.barcode || `100000${product.codigo}`, {
          format: 'CODE128',
          lineColor: '#0f172a',
          width: 2,
          height: 60,
          displayValue: true,
          font: 'monospace',
          fontSize: 14,
          textMargin: 4,
        });
      } catch (err) {
        console.error('Error generating barcode:', err);
      }
    }
  }, [product]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-sm">Etiqueta de Insumo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          <div
            id="printable-label"
            className="w-full bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 shadow-sm flex flex-col items-center text-center space-y-2"
          >
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 border-b border-slate-200 pb-1 w-full">
              Hospital • Medicina Física y Rehab
            </div>

            <div className="text-xs font-bold text-slate-900 leading-snug px-1">
              {product.descripcion}
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px]">
              <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                Cód: {product.codigo}
              </span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold text-slate-600">Empaque: {product.factor}</span>
            </div>

            <div className="w-full flex justify-center py-2 overflow-x-auto">
              <svg ref={svgRef} className="max-w-full" />
            </div>

            <div className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              {product.categoria}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="w-1/2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
