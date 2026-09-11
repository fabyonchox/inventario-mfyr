import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  Layers, 
  AlertTriangle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  Barcode, 
  X
} from 'lucide-react';
import { CATEGORIAS_CLINICAS } from '../types/inventory';
import type { Product } from '../types/inventory';


interface InventoryViewProps {
  products: Product[];
  onOpenMovement: (type: 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA', product: Product) => void;
  onOpenBarcode: (product: Product) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onOpenMovement,
  onOpenBarcode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<'ALL' | 'BOD_1' | 'BOD_2'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Totales
  const totalStockB1 = useMemo(() => products.reduce((acc, p) => acc + p.stockBodega1, 0), [products]);
  const totalStockB2 = useMemo(() => products.reduce((acc, p) => acc + p.stockBodega2, 0), [products]);
  const lowStockCount = useMemo(
    () => products.filter((p) => p.stockBodega1 + p.stockBodega2 <= p.stockMinimo).length,
    [products]
  );

  // Filtrado reactivo
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'ALL' || p.categoria === selectedCategory;

      const totalStock = p.stockBodega1 + p.stockBodega2;
      const matchesLowStock = !onlyLowStock || totalStock <= p.stockMinimo;

      const matchesLocation =
        selectedLocation === 'ALL' ||
        (selectedLocation === 'BOD_1' && p.stockBodega1 > 0) ||
        (selectedLocation === 'BOD_2' && p.stockBodega2 > 0);

      return matchesSearch && matchesCategory && matchesLowStock && matchesLocation;
    });
  }, [products, searchTerm, selectedCategory, selectedLocation, onlyLowStock]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Cicatrices y Compresivos':
        return '🩹';
      case 'Rehabilitación y Terapia':
        return '🧘';
      case 'Soporte Respiratorio / Fonación':
        return '🫁';
      case 'Fono / Deglución / Alimentos':
        return '🥣';
      case 'Higiene, Aseo y Protección':
        return '🧼';
      case 'Administrativo y Estimulación':
        return '📋';
      default:
        return '📦';
    }
  };

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Stat 1: Total Catálogo */}
        <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight block">
              Catálogo Insumos
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-slate-900">{products.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">ítems activos</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Bodega 1 */}
        <div
          onClick={() => setSelectedLocation(selectedLocation === 'BOD_1' ? 'ALL' : 'BOD_1')}
          className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            selectedLocation === 'BOD_1'
              ? 'bg-teal-50/90 border-teal-400 ring-2 ring-teal-400/20'
              : 'bg-white border-slate-200/90 hover:border-teal-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-tight block">
              Bodega 1 (Principal)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-teal-950">{totalStockB1}</span>
              <span className="text-[10px] text-teal-700 font-medium">unidades</span>
            </div>
          </div>
        </div>

        {/* Stat 3: Bodega 2 */}
        <div
          onClick={() => setSelectedLocation(selectedLocation === 'BOD_2' ? 'ALL' : 'BOD_2')}
          className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            selectedLocation === 'BOD_2'
              ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400/20'
              : 'bg-white border-slate-200/90 hover:border-indigo-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-tight block">
              Bodega 2 (Boxes)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-indigo-950">{totalStockB2}</span>
              <span className="text-[10px] text-indigo-700 font-medium">unidades</span>
            </div>
          </div>
        </div>

        {/* Stat 4: Stock Crítico */}
        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer shadow-xs flex items-center gap-3 ${
            onlyLowStock
              ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200/90 hover:border-amber-300'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-tight block">
              Alertas Reposición
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-amber-950">{lowStockCount}</span>
              <span className="text-[10px] text-amber-700 font-medium">insumos críticos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código (ej: 225-0145), descripción o código de barra..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300/80 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Location Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Bodega:
          </span>
          <button
            onClick={() => setSelectedLocation('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedLocation === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas las Bodegas ({products.length})
          </button>
          <button
            onClick={() => setSelectedLocation('BOD_1')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedLocation === 'BOD_1'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200/60'
            }`}
          >
            Bodega 1 - Principal ({products.filter((p) => p.stockBodega1 > 0).length})
          </button>
          <button
            onClick={() => setSelectedLocation('BOD_2')}
            className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedLocation === 'BOD_2'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            Bodega 2 - Boxes ({products.filter((p) => p.stockBodega2 > 0).length})
          </button>
        </div>

        {/* Clinical Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-teal-600 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas las Familias
          </button>
          {CATEGORIAS_CLINICAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
              className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-teal-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{getCategoryIcon(cat)}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Products Grid / List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Mostrando <strong>{filteredProducts.length}</strong> de {products.length} insumos</span>
          {onlyLowStock && (
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Filtro activo: Stock Crítico
            </span>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No se encontraron insumos</h3>
            <p className="text-xs text-slate-400 mt-1">
              Prueba cambiando el término de búsqueda o desactivando los filtros de bodega/categoría.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const total = product.stockBodega1 + product.stockBodega2;
              const isOut = total === 0;
              const isLow = !isOut && total <= product.stockMinimo;

              return (
                <div
                  key={product.codigo}
                  className={`bg-white rounded-2xl border p-3.5 sm:p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                    isOut
                      ? 'border-rose-200 bg-rose-50/20'
                      : isLow
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div>
                    {/* Top Row: Code, Packaging & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono font-extrabold text-teal-900 bg-teal-100/90 px-2 py-0.5 rounded-md border border-teal-200">
                          {product.codigo}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {product.factor}
                        </span>
                      </div>

                      {/* Status Indicator */}
                      {isOut ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          Agotado
                        </span>
                      ) : isLow ? (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          Stock Crítico ({total})
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Normal
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug mb-1 line-clamp-2">
                      {product.descripcion}
                    </h4>

                    {/* Category Label */}
                    <span className="text-[10px] font-semibold text-slate-500 mb-3 flex items-center gap-1">
                      <span>{getCategoryIcon(product.categoria)}</span>
                      <span>{product.categoria}</span>
                    </span>

                    {/* Warehouse Breakdown Pill Box */}
                    <div className="grid grid-cols-2 gap-2 my-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="text-center border-r border-slate-200 pr-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-tight">
                          Bodega 1 (Principal)
                        </span>
                        <span className={`text-sm font-extrabold ${product.stockBodega1 > 0 ? 'text-teal-900' : 'text-slate-400'}`}>
                          {product.stockBodega1} <span className="text-[10px] font-normal">{product.factor}</span>
                        </span>
                      </div>
                      <div className="text-center pl-1">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-tight">
                          Bodega 2 (Boxes)
                        </span>
                        <span className={`text-sm font-extrabold ${product.stockBodega2 > 0 ? 'text-indigo-900' : 'text-slate-400'}`}>
                          {product.stockBodega2} <span className="text-[10px] font-normal">{product.factor}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => onOpenMovement('ENTRADA', product)}
                      className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                      title="Registrar entrada desde Bodega General"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Entrada</span>
                    </button>

                    <button
                      onClick={() => onOpenMovement('SALIDA', product)}
                      className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer active:scale-95"
                      title="Registrar salida y entrega a profesional"
                    >
                      <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-600" />
                      <span>Salida</span>
                    </button>

                    <button
                      onClick={() => onOpenMovement('TRANSFERENCIA', product)}
                      className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-lg transition-colors cursor-pointer"
                      title="Transferir entre Bodega 1 y Bodega 2"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
                    </button>

                    <button
                      onClick={() => onOpenBarcode(product)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Ver etiqueta y código de barras para imprimir"
                    >
                      <Barcode className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
