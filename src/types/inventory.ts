export interface Product {
  codigo: string;
  descripcion: string;
  factor: string;
  barcode: string;
  categoria: string;
  stockBodega1: number;
  stockBodega2: number;
  stockMinimo: number;
}

export type WarehouseId = 'BOD_1' | 'BOD_2';

export interface Warehouse {
  id: WarehouseId;
  nombre: string;
  descripcion: string;
}

export type MovementType = 'ENTRADA' | 'SALIDA' | 'TRANSFERENCIA';

export interface Movement {
  id: string;
  tipo: MovementType;
  productoCodigo: string;
  productoDescripcion: string;
  cantidad: number;
  bodegaOrigen?: WarehouseId;
  bodegaDestino?: WarehouseId;
  fecha: string; // ISO string
  entregadoA?: string;
  numeroComprobante?: string;
  motivo?: string;
  observacion?: string;
  usuario?: string;
}

export const CATEGORIAS_CLINICAS = [
  'Cicatrices y Compresivos',
  'Rehabilitación y Terapia',
  'Soporte Respiratorio / Fonación',
  'Fono / Deglución / Alimentos',
  'Higiene, Aseo y Protección',
  'Administrativo y Estimulación',
  'Otros Insumos',
] as const;

export const MOTIVOS_SALIDA_OFICIALES = [
  { clave: 'aba', label: 'aba (Abastecimiento / Reposición Box)' },
  { clave: 'baja', label: 'baja (Vencido / Deterioro / Merma)' },
  { clave: 'falla', label: 'falla (Defecto de Fábrica / Roto)' },
  { clave: 'prestamo', label: 'prestamo (Préstamo a otro Servicio)' },
  { clave: 'tratamiento', label: 'tratamiento (Atención Paciente)' },
] as const;

export const OBSERVACIONES_ENTRADA_OFICIALES = [
  'Inventario', // Según directriz oficial de Bodega General
  'Nómina Mensual Bodega General',
  'Pedido Extraordinario',
  'Devolución de Préstamo',
] as const;

export const RECEPTOR_PRESETS = [
  'Kinesiología - Box 1',
  'Kinesiología - Box 2',
  'Kinesiología - Gimnasio',
  'Terapia Ocupacional - Adulto',
  'Terapia Ocupacional - Infantil',
  'Fonoaudiología',
  'Médico Fisiatra',
  'Enfermería MFYR',
  'Traumatología (Préstamo)',
  'UCI / Hospitalizados',
] as const;

