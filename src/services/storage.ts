import type { Product, Movement, MovementType, WarehouseId } from '../types/inventory';
import { INITIAL_PRODUCTS } from '../data/initialCatalog';
import * as XLSX from 'xlsx';

const PRODUCTS_KEY = 'mfyr_inventory_products_v1';
const MOVEMENTS_KEY = 'mfyr_inventory_movements_v1';

export const getStoredProducts = (): Product[] => {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading products from storage:', err);
    return INITIAL_PRODUCTS;
  }
};

export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Error saving products:', err);
  }
};

export const getStoredMovements = (): Movement[] => {
  try {
    const raw = localStorage.getItem(MOVEMENTS_KEY);
    if (!raw) {
      const initialMovements: Movement[] = [
        {
          id: 'init-1',
          tipo: 'ENTRADA',
          productoCodigo: '225-0145',
          productoDescripcion: 'TELA ADHESIVA HIPOALERGENICA 5 CMX 9.1 M/DURAPORE',
          cantidad: 3,
          bodegaDestino: 'BOD_1',
          fecha: new Date(Date.now() - 3600000 * 48).toISOString(),
          numeroComprobante: '4941',
          observacion: 'Despacho mensual Bodega General',
          usuario: 'Bodega MFYR',
        },
        {
          id: 'init-2',
          tipo: 'ENTRADA',
          productoCodigo: '225-0670',
          productoDescripcion: 'VENDA BSN MEDICAL COMPRILAN 8X5',
          cantidad: 5,
          bodegaDestino: 'BOD_1',
          fecha: new Date(Date.now() - 3600000 * 48).toISOString(),
          numeroComprobante: '4941',
          observacion: 'Despacho mensual Bodega General',
          usuario: 'Bodega MFYR',
        },
        {
          id: 'init-3',
          tipo: 'ENTRADA',
          productoCodigo: '211-0080',
          productoDescripcion: 'GLICERINA SIN FRAGANCIA-JABOL LT.',
          cantidad: 3,
          bodegaDestino: 'BOD_1',
          fecha: new Date(Date.now() - 3600000 * 36).toISOString(),
          numeroComprobante: '4941',
          observacion: 'Despacho mensual Bodega General',
          usuario: 'Bodega MFYR',
        },
        {
          id: 'init-4',
          tipo: 'SALIDA',
          productoCodigo: '211-0080',
          productoDescripcion: 'GLICERINA SIN FRAGANCIA-JABOL LT.',
          cantidad: 1,
          bodegaOrigen: 'BOD_1',
          fecha: new Date(Date.now() - 3600000 * 12).toISOString(),
          entregadoA: 'Traumatología (Préstamo)',
          numeroComprobante: '111',
          motivo: 'Devolución préstamo traumatología',
          usuario: 'Bodega MFYR',
        },
      ];
      localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(initialMovements));
      return initialMovements;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading movements:', err);
    return [];
  }
};

export const saveMovements = (movements: Movement[]): void => {
  try {
    localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(movements));
  } catch (err) {
    console.error('Error saving movements:', err);
  }
};

export interface ProcessMovementInput {
  tipo: MovementType;
  productoCodigo: string;
  cantidad: number;
  bodegaOrigen?: WarehouseId;
  bodegaDestino?: WarehouseId;
  entregadoA?: string;
  numeroComprobante?: string;
  motivo?: string;
  observacion?: string;
  usuario?: string;
}

export const processMovement = (
  input: ProcessMovementInput
): { movement: Movement; updatedProducts: Product[] } => {
  const products = getStoredProducts();
  const productIndex = products.findIndex((p) => p.codigo === input.productoCodigo);

  if (productIndex === -1) {
    throw new Error(`Insumo con código ${input.productoCodigo} no encontrado en el catálogo.`);
  }

  const product = { ...products[productIndex] };

  if (input.cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a cero.');
  }

  if (input.tipo === 'ENTRADA') {
    if (!input.bodegaDestino) throw new Error('Debe especificar la bodega de destino.');
    if (input.bodegaDestino === 'BOD_1') {
      product.stockBodega1 += input.cantidad;
    } else {
      product.stockBodega2 += input.cantidad;
    }
  } else if (input.tipo === 'SALIDA') {
    if (!input.bodegaOrigen) throw new Error('Debe especificar la bodega de origen.');
    if (!input.entregadoA || input.entregadoA.trim() === '') {
      throw new Error('El campo "A quién se le entrega" es obligatorio para registrar la salida.');
    }

    const availableStock =
      input.bodegaOrigen === 'BOD_1' ? product.stockBodega1 : product.stockBodega2;

    if (input.cantidad > availableStock) {
      const bodegaName = input.bodegaOrigen === 'BOD_1' ? 'Bodega 1' : 'Bodega 2';
      throw new Error(
        `Stock insuficiente en ${bodegaName}. Disponible: ${availableStock} ${product.factor}, Solicitado: ${input.cantidad} ${product.factor}.`
      );
    }

    if (input.bodegaOrigen === 'BOD_1') {
      product.stockBodega1 -= input.cantidad;
    } else {
      product.stockBodega2 -= input.cantidad;
    }
  } else if (input.tipo === 'TRANSFERENCIA') {
    if (!input.bodegaOrigen || !input.bodegaDestino) {
      throw new Error('Debe especificar bodega de origen y destino para la transferencia.');
    }
    if (input.bodegaOrigen === input.bodegaDestino) {
      throw new Error('La bodega de origen y destino no pueden ser la misma.');
    }

    const availableStock =
      input.bodegaOrigen === 'BOD_1' ? product.stockBodega1 : product.stockBodega2;

    if (input.cantidad > availableStock) {
      const bodegaName = input.bodegaOrigen === 'BOD_1' ? 'Bodega 1' : 'Bodega 2';
      throw new Error(
        `Stock insuficiente para transferir desde ${bodegaName}. Disponible: ${availableStock} ${product.factor}.`
      );
    }

    if (input.bodegaOrigen === 'BOD_1') {
      product.stockBodega1 -= input.cantidad;
      product.stockBodega2 += input.cantidad;
    } else {
      product.stockBodega2 -= input.cantidad;
      product.stockBodega1 += input.cantidad;
    }
  }

  products[productIndex] = product;
  saveProducts(products);

  const newMovement: Movement = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `mov-${Date.now()}`,
    tipo: input.tipo,
    productoCodigo: product.codigo,
    productoDescripcion: product.descripcion,
    cantidad: input.cantidad,
    bodegaOrigen: input.bodegaOrigen,
    bodegaDestino: input.bodegaDestino,
    fecha: new Date().toISOString(),
    entregadoA: input.entregadoA,
    numeroComprobante: input.numeroComprobante,
    motivo: input.motivo,
    observacion: input.observacion,
    usuario: input.usuario || 'Operador MFYR',
  };

  const movements = [newMovement, ...getStoredMovements()];
  saveMovements(movements);

  return { movement: newMovement, updatedProducts: products };
};

export const exportToExcel = (products: Product[], movements: Movement[]): void => {
  const stockRows = products.map((p) => {
    const total = p.stockBodega1 + p.stockBodega2;
    let estado = 'Normal';
    if (total === 0) estado = 'Agotado';
    else if (total <= p.stockMinimo) estado = 'Crítico / Bajo';

    return {
      'Código Institucional': p.codigo,
      'Descripción del Insumo': p.descripcion,
      'Categoría': p.categoria,
      'Unidad/Factor': p.factor,
      'Stock Bodega 1 (Principal)': p.stockBodega1,
      'Stock Bodega 2 (Boxes/Secundaria)': p.stockBodega2,
      'Stock Total Servicio': total,
      'Stock Mínimo Alerta': p.stockMinimo,
      'Estado': estado,
      'Código de Barra': p.barcode,
    };
  });

  const movementRows = movements.map((m) => {
    const fechaObj = new Date(m.fecha);
    const fechaFormato = fechaObj.toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'medium',
    });

    const origen = m.bodegaOrigen === 'BOD_1' ? 'Bodega 1' : m.bodegaOrigen === 'BOD_2' ? 'Bodega 2' : '-';
    const destino = m.bodegaDestino === 'BOD_1' ? 'Bodega 1' : m.bodegaDestino === 'BOD_2' ? 'Bodega 2' : '-';

    return {
      'Fecha y Hora': fechaFormato,
      'Tipo Movimiento': m.tipo,
      'Código': m.productoCodigo,
      'Insumo': m.productoDescripcion,
      'Cantidad': m.cantidad,
      'Bodega Origen': origen,
      'Bodega Destino': destino,
      'Entregado A (Receptor)': m.entregadoA || '-',
      'N° Comprobante / Guía': m.numeroComprobante || '-',
      'Motivo / Detalle': m.motivo || '-',
      'Observación': m.observacion || '-',
      'Usuario': m.usuario || '-',
    };
  });

  const wb = XLSX.utils.book_new();
  const wsStock = XLSX.utils.json_to_sheet(stockRows);
  const wsMovements = XLSX.utils.json_to_sheet(movementRows);

  XLSX.utils.book_append_sheet(wb, wsStock, 'Existencias Bodegas');
  XLSX.utils.book_append_sheet(wb, wsMovements, 'Kardex Movimientos');

  const fechaHoy = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Inventario_MFYR_Rehabilitacion_${fechaHoy}.xlsx`);
};

export const exportBackupJson = (products: Product[], movements: Movement[]): void => {
  const data = {
    version: '1.0',
    fechaExportacion: new Date().toISOString(),
    servicio: 'Medicina Física y Rehabilitación',
    products,
    movements,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Respaldo_Inventario_MFYR_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const resetToInitialCatalog = (): Product[] => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  localStorage.removeItem(MOVEMENTS_KEY);
  return INITIAL_PRODUCTS;
};
