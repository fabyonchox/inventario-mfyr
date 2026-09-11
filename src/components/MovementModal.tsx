import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Check, 
  AlertCircle, 
  ScanLine, 
  User, 
  Calendar
} from 'lucide-react';
import { 
  RECEPTOR_PRESETS, 
  MOTIVOS_SALIDA_OFICIALES, 
  OBSERVACIONES_ENTRADA_OFICIALES 
} from '../types/inventory';
import type { Product, MovementType, WarehouseId } from '../types/inventory';


import { processMovement } from '../services/storage';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: MovementType;
  selectedProduct: Product | null;
  products: Product[];
  onOpenScanner: () => void;
  onSuccess: (updatedProducts: Product[]) => void;
}

export const MovementModal: React.FC<MovementModalProps> = ({
  isOpen,
  onClose,
  type,
  selectedProduct,
  products,
  onOpenScanner,
  onSuccess,
}) => {
  const [productCode, setProductCode] = useState(selectedProduct ? selectedProduct.codigo : '');
  const [cantidad, setCantidad] = useState<number>(1);
  const [bodegaOrigen, setBodegaOrigen] = useState<WarehouseId>('BOD_1');
  const [bodegaDestino, setBodegaDestino] = useState<WarehouseId>('BOD_1');
  const [entregadoA, setEntregadoA] = useState('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setProductCode(selectedProduct.codigo);
    } else if (products.length > 0 && !productCode) {
      setProductCode(products[0].codigo);
    }
  }, [selectedProduct, products]);

  // Reset defaults on modal open
  useEffect(() => {
    if (isOpen) {
      setCantidad(1);
      setErrorMessage(null);
      if (type === 'ENTRADA') {
        setBodegaDestino('BOD_1');
      } else if (type === 'SALIDA') {
        setBodegaOrigen('BOD_1');
      } else if (type === 'TRANSFERENCIA') {
        setBodegaOrigen('BOD_1');
        setBodegaDestino('BOD_2');
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.codigo === productCode);

  const availableOriginStock = currentProduct
    ? bodegaOrigen === 'BOD_1'
      ? currentProduct.stockBodega1
      : currentProduct.stockBodega2
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentProduct) {
      setErrorMessage('Por favor selecciona un insumo válido.');
      return;
    }

    if (cantidad <= 0) {
      setErrorMessage('La cantidad debe ser mayor a 0.');
      return;
    }

    if (type === 'SALIDA') {
      if (!entregadoA.trim()) {
        setErrorMessage('El campo "A quién se le entrega" es obligatorio para la trazabilidad.');
        return;
      }
      if (cantidad > availableOriginStock) {
        setErrorMessage(
          `Stock insuficiente en ${bodegaOrigen === 'BOD_1' ? 'Bodega 1' : 'Bodega 2'}. Disponible: ${availableOriginStock} ${currentProduct.factor}.`
        );
        return;
      }
    }

    if (type === 'TRANSFERENCIA') {
      if (bodegaOrigen === bodegaDestino) {
        setErrorMessage('La bodega de origen y destino deben ser distintas.');
        return;
      }
      if (cantidad > availableOriginStock) {
        setErrorMessage(
          `Stock insuficiente para transferir. Disponible en origen: ${availableOriginStock} ${currentProduct.factor}.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = processMovement({
        tipo: type,
        productoCodigo: currentProduct.codigo,
        cantidad: Number(cantidad),
        bodegaOrigen: type === 'ENTRADA' ? undefined : bodegaOrigen,
        bodegaDestino: type === 'SALIDA' ? undefined : bodegaDestino,
        entregadoA: type === 'SALIDA' ? entregadoA.trim() : undefined,
        numeroComprobante: numeroComprobante.trim() || undefined,
        motivo: motivo.trim() || undefined,
        observacion: observacion.trim() || undefined,
      });

      // Efecto confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: type === 'ENTRADA' ? ['#059669', '#10b981', '#34d399'] : ['#0d9488', '#0284c7', '#6366f1'],
      });

      onSuccess(result.updatedProducts);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el movimiento.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeaderInfo = () => {
    switch (type) {
      case 'ENTRADA':
        return {
          title: 'Recepción de Insumos (Entrada)',
          subtitle: 'Ingreso mensual de Bodega General',
          bgColor: 'bg-emerald-700',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          icon: <ArrowDownToLine className="w-5 h-5 text-emerald-300" />,
          btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
        };
      case 'SALIDA':
        return {
          title: 'Entrega de Insumos (Salida)',
          subtitle: 'Despacho interno a profesionales y boxes',
          bgColor: 'bg-rose-700',
          badgeColor: 'bg-rose-100 text-rose-800',
          icon: <ArrowUpFromLine className="w-5 h-5 text-rose-300" />,
          btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
        };
      case 'TRANSFERENCIA':
        return {
          title: 'Transferencia Interna',
          subtitle: 'Mover entre Bodega 1 y Bodega 2',
          bgColor: 'bg-indigo-700',
          badgeColor: 'bg-indigo-100 text-indigo-800',
          icon: <ArrowLeftRight className="w-5 h-5 text-indigo-300" />,
          btnColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className={`p-4 ${header.bgColor} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
              {header.icon}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{header.title}</h3>
              <p className="text-xs text-white/80">{header.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selector de Insumo con Botón Escáner */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Insumo Clínico</span>
              <button
                type="button"
                onClick={onOpenScanner}
                className="text-teal-700 hover:text-teal-900 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Escanear Cámara</span>
              </button>
            </label>

            <div className="flex gap-2">
              <select
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                {products.map((p) => (
                  <option key={p.codigo} value={p.codigo}>
                    [{p.codigo}] {p.descripcion} ({p.factor})
                  </option>
                ))}
              </select>
            </div>

            {currentProduct && (
              <div className="mt-2 p-2.5 bg-teal-50/70 border border-teal-200/80 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Stock actual disponible:</span>
                  <div className="flex items-center gap-3 font-semibold text-slate-800 mt-0.5">
                    <span>Bodega 1: <strong className="text-teal-800">{currentProduct.stockBodega1}</strong> {currentProduct.factor}</span>
                    <span className="text-slate-300">•</span>
                    <span>Bodega 2: <strong className="text-indigo-800">{currentProduct.stockBodega2}</strong> {currentProduct.factor}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Total Servicio</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {currentProduct.stockBodega1 + currentProduct.stockBodega2} {currentProduct.factor}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cantidad con botones rápidos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cantidad {currentProduct ? `(${currentProduct.factor})` : ''}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-xl text-base font-bold text-center text-slate-900 focus:ring-2 focus:ring-teal-500"
                required
              />
              <div className="flex items-center gap-1.5">
                {[1, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCantidad(num)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      cantidad === num
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuración de Bodegas según tipo de movimiento */}
          {type === 'ENTRADA' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Destino Físico dentro del Servicio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBodegaDestino('BOD_1')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    bodegaDestino === 'BOD_1'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Bodega 1</span>
                  <span className="text-[11px] text-slate-500">Almacén Principal MFYR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBodegaDestino('BOD_2')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    bodegaDestino === 'BOD_2'
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Bodega 2</span>
                  <span className="text-[11px] text-slate-500">Secundaria / Boxes / Gimnasio</span>
                </button>
              </div>
            </div>
          )}

          {type === 'SALIDA' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  ¿De qué bodega se retira?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBodegaOrigen('BOD_1')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bodegaOrigen === 'BOD_1'
                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Bodega 1</span>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">
                        Disp: {currentProduct?.stockBodega1 || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Principal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBodegaOrigen('BOD_2')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      bodegaOrigen === 'BOD_2'
                        ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-900">Bodega 2</span>
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded">
                        Disp: {currentProduct?.stockBodega2 || 0}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">Secundaria/Boxes</span>
                  </button>
                </div>
              </div>

              {/* CAMPO OBLIGATORIO: ¿A quién se le entrega? */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    ¿A quién se le entrega? * (Obligatorio)
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    Trazabilidad
                  </span>
                </label>

                {/* Chips rápidos de destinatarios */}
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {RECEPTOR_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEntregadoA(preset)}
                      className={`text-[11px] px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                        entregadoA === preset
                          ? 'bg-amber-600 text-white border-amber-600 font-bold'
                          : 'bg-white hover:bg-amber-100 text-slate-700 border-amber-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  value={entregadoA}
                  onChange={(e) => setEntregadoA(e.target.value)}
                  placeholder="Escribe el nombre del profesional o destino..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </>
          )}

          {type === 'TRANSFERENCIA' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Origen
                </label>
                <select
                  value={bodegaOrigen}
                  onChange={(e) => setBodegaOrigen(e.target.value as WarehouseId)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="BOD_1">Bodega 1 (Principal)</option>
                  <option value="BOD_2">Bodega 2 (Boxes)</option>
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Disp: {availableOriginStock} {currentProduct?.factor}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Destino
                </label>
                <select
                  value={bodegaDestino}
                  onChange={(e) => setBodegaDestino(e.target.value as WarehouseId)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="BOD_2">Bodega 2 (Boxes)</option>
                  <option value="BOD_1">Bodega 1 (Principal)</option>
                </select>
              </div>
            </div>
          )}

          {/* Campos Complementarios: Comprobante y Motivo Oficial */}
          {type === 'SALIDA' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Motivo Oficial Hospitalario (Directriz Bodega General)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOTIVOS_SALIDA_OFICIALES.map((item) => (
                  <button
                    key={item.clave}
                    type="button"
                    onClick={() => setMotivo(item.clave)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                      motivo === item.clave
                        ? 'bg-rose-700 text-white border-rose-700 font-bold shadow-xs'
                        : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Selecciona arriba o escribe el motivo (ej. aba, baja, falla, préstamo)..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          )}

          {type === 'ENTRADA' && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center justify-between">
                <span>Tipo de Entrada (Directriz Bodega General)</span>
                <span className="text-[10px] text-emerald-700 font-normal">Punto 2 correo</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {OBSERVACIONES_ENTRADA_OFICIALES.map((obs) => (
                  <button
                    key={obs}
                    type="button"
                    onClick={() => {
                      setObservacion(obs);
                      if (obs === 'Inventario') setNumeroComprobante('Toma Inicial');
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                      observacion === obs
                        ? 'bg-emerald-700 text-white border-emerald-700 font-bold shadow-xs'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border-emerald-200'
                    }`}
                  >
                    {obs === 'Inventario' ? '📌 Inventario (Toma Inicial)' : obs}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comprobante y Observación General */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                N° Comprobante / Nómina Bodega (Opcional)
              </label>
              <input
                type="text"
                value={numeroComprobante}
                onChange={(e) => setNumeroComprobante(e.target.value)}
                placeholder="ej. 4941, Nómina Julio..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Observaciones Adicionales
              </label>
              <input
                type="text"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="ej. Inventario, Conteo físico..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>



          {/* Timestamp Automático */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Fecha y hora se registrarán automáticamente con la marca actual.</span>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 ${header.btnColor} text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50`}
            >
              <Check className="w-4 h-4" />
              <span>Confirmar {type === 'ENTRADA' ? 'Recepción' : type === 'SALIDA' ? 'Entrega' : 'Transferencia'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
