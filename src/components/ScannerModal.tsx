import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Search, AlertCircle } from 'lucide-react';
import type { Product } from '../types/inventory';


interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualQuery, setManualQuery] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'mfyr-html5-scanner-reader';

  // Sonido de confirmación al escanear
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz (A5)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignorar si el navegador bloquea audio sin interacción
    }
  };

  const handleScanMatch = (rawCode: string) => {
    const cleaned = rawCode.trim();
    // Buscar coincidencia por código exacto, código de barra o sufijo
    const found = products.find(
      (p) =>
        p.codigo.toLowerCase() === cleaned.toLowerCase() ||
        p.barcode.toLowerCase() === cleaned.toLowerCase() ||
        cleaned.includes(p.codigo) ||
        p.barcode.includes(cleaned)
    );

    if (found) {
      playBeep();
      stopScanner();
      onSelectProduct(found);
      onClose();
    } else {
      setErrorMessage(`Código "${cleaned}" escaneado, pero no coincide con ningún insumo del catálogo.`);
    }
  };

  const startScanner = async () => {
    setErrorMessage(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerElementId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 250, height: 180 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanMatch(decodedText);
        },
        () => {
          // Errores normales de lectura de cuadro continuo
        }
      );
      setCameraActive(true);
    } catch (err: unknown) {
      console.error('Error starting scanner:', err);
      setCameraActive(false);
      const msg = err instanceof Error ? err.message : 'No se pudo acceder a la cámara.';
      setErrorMessage(`${msg}. Puedes ingresar el código numérico manualmente abajo.`);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Intentar iniciar la cámara al abrir
      startScanner();
    } else {
      stopScanner();
      setManualQuery('');
      setErrorMessage(null);
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrado para búsqueda manual instantánea
  const filteredProducts = manualQuery.trim()
    ? products
        .filter(
          (p) =>
            p.codigo.toLowerCase().includes(manualQuery.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(manualQuery.toLowerCase()) ||
            p.barcode.toLowerCase().includes(manualQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-300" />
            <div>
              <h3 className="font-bold text-base">Escáner de Insumo</h3>
              <p className="text-xs text-teal-200">Apunta al código de barras o digita el número</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-teal-800/80 hover:bg-teal-900 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center relative min-h-[260px]">
          <div
            id={readerElementId}
            className="w-full max-w-[280px] rounded-xl overflow-hidden border-2 border-teal-500/50 shadow-inner"
          />

          {!cameraActive && (
            <div className="text-center p-4 text-slate-300">
              <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-60" />
              <p className="text-xs text-slate-400 mb-3">
                {errorMessage || 'Cámara no iniciada o sin permisos'}
              </p>
              <button
                onClick={startScanner}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-lg shadow transition-colors cursor-pointer"
              >
                Reintentar Cámara
              </button>
            </div>
          )}

          {cameraActive && (
            <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-medium text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                Buscando código de barra...
              </span>
            </div>
          )}
        </div>

        {/* Manual Instant Code Search */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 overflow-y-auto flex-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Búsqueda Rápida por Código o Nombre</span>
            <span className="text-[10px] text-teal-700 font-normal">ej: 211-0080, 225, Durapore</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Escribe el código numérico o nombre..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              autoFocus
            />
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick results list */}
          {filteredProducts.length > 0 && (
            <div className="mt-2 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400">Coincidencias:</span>
              {filteredProducts.map((p) => (
                <button
                  key={p.codigo}
                  onClick={() => {
                    playBeep();
                    stopScanner();
                    onSelectProduct(p);
                    onClose();
                  }}
                  className="w-full text-left p-2.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100/80 px-1.5 py-0.5 rounded">
                        {p.codigo}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{p.categoria}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate mt-0.5 group-hover:text-teal-900">
                      {p.descripcion}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      {p.stockBodega1 + p.stockBodega2} {p.factor}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold uppercase">Seleccionar →</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {manualQuery.trim() && filteredProducts.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">
              No se encontraron insumos con "{manualQuery}".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
