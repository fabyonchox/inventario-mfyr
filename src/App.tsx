import React, { useState, useEffect } from 'react';
import type { Product, Movement, MovementType } from './types/inventory';
import { getStoredProducts, getStoredMovements } from './services/storage';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { InventoryView } from './components/InventoryView';
import { HistoryView } from './components/HistoryView';
import { ScannerModal } from './components/ScannerModal';
import { MovementModal } from './components/MovementModal';
import { BarcodeModal } from './components/BarcodeModal';
import { OrderRequestModal } from './components/OrderRequestModal';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, X } from 'lucide-react';



export const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [currentTab, setCurrentTab] = useState<TabType>('inventory');

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [movementModal, setMovementModal] = useState<{
    isOpen: boolean;
    type: MovementType;
    product: Product | null;
  }>({
    isOpen: false,
    type: 'ENTRADA',
    product: null,
  });

  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);

  // Scanned item action drawer (when scanned from global camera button)

  const [scannedProductChoice, setScannedProductChoice] = useState<Product | null>(null);

  // Load initial data
  useEffect(() => {
    setProducts(getStoredProducts());
    setMovements(getStoredMovements());
  }, []);

  const refreshData = (newProducts?: Product[]) => {
    if (newProducts) {
      setProducts(newProducts);
    } else {
      setProducts(getStoredProducts());
    }
    setMovements(getStoredMovements());
  };

  const handleOpenMovement = (type: MovementType, product: Product | null = null) => {
    setMovementModal({
      isOpen: true,
      type,
      product,
    });
  };

  const handleProductScanned = (product: Product) => {
    // Cuando se escanea desde el botón principal, mostrar menú rápido de acción para ese producto
    setScannedProductChoice(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        products={products}
        movements={movements}
        onDataReset={(newProds) => refreshData(newProds)}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenOrderModal={() => setOrderModalOpen(true)}
      />


      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {currentTab === 'inventory' ? (
          <InventoryView
            products={products}
            onOpenMovement={(type, prod) => handleOpenMovement(type, prod)}
            onOpenBarcode={(prod) => setBarcodeModalProduct(prod)}
          />
        ) : (
          <HistoryView movements={movements} products={products} />
        )}
      </main>

      {/* Mobile-First Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenInflow={() => handleOpenMovement('ENTRADA')}
        onOpenOutflow={() => handleOpenMovement('SALIDA')}
        onOpenScanner={() => setScannerOpen(true)}
      />


      {/* Camera Barcode & QR Scanner Modal */}
      <ScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        products={products}
        onSelectProduct={handleProductScanned}
      />

      {/* Movement Modal (Entrada, Salida, Transferencia) */}
      <MovementModal
        isOpen={movementModal.isOpen}
        onClose={() => setMovementModal({ ...movementModal, isOpen: false })}
        type={movementModal.type}
        selectedProduct={movementModal.product}
        products={products}
        onOpenScanner={() => setScannerOpen(true)}
        onSuccess={(updatedProds) => refreshData(updatedProds)}
      />

      {/* Printable Barcode Modal */}
      <BarcodeModal
        product={barcodeModalProduct}
        onClose={() => setBarcodeModalProduct(null)}
      />

      {/* Monthly Restock Order Generator (Rule 5) */}
      <OrderRequestModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        products={products}
      />


      {/* Quick Action Drawer after Scanning */}
      {scannedProductChoice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Insumo Identificado
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  [{scannedProductChoice.codigo}] {scannedProductChoice.descripcion}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>Bodega 1: <strong>{scannedProductChoice.stockBodega1}</strong></span>
                  <span>•</span>
                  <span>Bodega 2: <strong>{scannedProductChoice.stockBodega2}</strong></span>
                  <span>•</span>
                  <span>Total: <strong>{scannedProductChoice.stockBodega1 + scannedProductChoice.stockBodega2} {scannedProductChoice.factor}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setScannedProductChoice(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">¿Qué acción deseas realizar con este insumo?</p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  const prod = scannedProductChoice;
                  setScannedProductChoice(null);
                  handleOpenMovement('ENTRADA', prod);
                }}
                className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Registrar Entrada</span>
              </button>

              <button
                onClick={() => {
                  const prod = scannedProductChoice;
                  setScannedProductChoice(null);
                  handleOpenMovement('SALIDA', prod);
                }}
                className="p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <ArrowUpFromLine className="w-4 h-4" />
                <span>Registrar Salida</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
              <button
                onClick={() => {
                  const prod = scannedProductChoice;
                  setScannedProductChoice(null);
                  handleOpenMovement('TRANSFERENCIA', prod);
                }}
                className="py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transferir Bodega</span>
              </button>

              <button
                onClick={() => {
                  const prod = scannedProductChoice;
                  setScannedProductChoice(null);
                  setBarcodeModalProduct(prod);
                }}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Ver Etiqueta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
