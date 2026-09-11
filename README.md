# 🏥 Control de Inventario — Medicina Física y Rehabilitación (MFYR)

> **Aplicación Web Progresiva (PWA Mobile-First) para el control integral, trazabilidad y gestión en tiempo real del stock de insumos clínicos despachados por Bodega General del Hospital.**

🌐 **Aplicación en Vivo (GitHub Pages):** [https://fabyonchox.github.io/inventario-mfyr/](https://fabyonchox.github.io/inventario-mfyr/)

---

## 📋 Resumen del Proyecto

Este sistema fue diseñado para digitalizar y modernizar el inventario del **Servicio de Medicina Física y Rehabilitación (MFYR)**, resolviendo las limitaciones del listado estático en Excel entregado mensualmente por Bodega General.

Permite a los profesionales (kinesiólogos, terapeutas ocupacionales, fonoaudiólogos, fisiatras y enfermería) registrar entradas, salidas y transferencias desde sus teléfonos inteligentes en los puntos de almacenamiento o desde las computadoras del servicio, manteniendo una bitácora auditable de **quién retiró cada insumo**, **cuándo** y **de qué bodega**.

---

## 🎯 Características Principales

- **📦 Catálogo Oficial de 74 Insumos**: Precargado con códigos numéricos institucionales (`211-0080`, `225-0145`, etc.), unidades de empaque (`UD`, `CA`, `RO`, `LT`, etc.) y códigos de barra.
- **🏷️ Clasificación en 6 Familias Clínicas**:
  1. 🩹 **Cicatrices y Compresivos**: Cintas K-Tape, Durapore, Micropore, mallas tubulares, vendas Comprilan, Elastomul, Covan, Foamy.
  2. 🧘 **Rehabilitación y Terapia**: Agujas de acupuntura/punción seca, electrodos TENS, bandas elásticas (roja, verde, negra), compresas húmedo-calientes, parafina, pasta ecográfica.
  3. 🫁 **Soporte Respiratorio / Fonación**: Sondas de oxígeno, bigoteras adulto/pediátrico, válvulas de fonación con puerto O2, filtros traqueostomía.
  4. 🥣 **Fono / Deglución / Alimentos**: Enterex espesante, goma xantana, colorantes.
  5. 🧼 **Higiene, Aseo y Protección**: Alcohol 95°, glicerina, guantes de nitrilo (S, M, L), gorros, bolsas de residuos, toallas clinic.
  6. 📋 **Administrativo y Estimulación**: Plasticina, témperas, útiles de oficina y registro.
- **🏢 Segregación Físico-Espacial (Bodega 1 vs Bodega 2)**:
  - **Bodega 1 (Principal)**: Almacén de abastecimiento central.
  - **Bodega 2 (Secundaria / Boxes)**: Stock de reposición rápida en salas de atención y gimnasio.
  - Transferencias internas rápidas entre recintos.
- **📥 Flujo de Recepción (Entrada)**: Escaneo de código o ingreso numérico, selección de bodega destino, cantidad, N° comprobante de despacho y timestamp automático.
- **📤 Flujo de Despacho (Salida)**: Validación de stock en tiempo real en la bodega de origen y **campo obligatorio *"¿A quién se le entrega?"*** con accesos rápidos para kinesiólogos, terapeutas, boxes o préstamos a otros servicios.
- **📷 Escáner Multimodal con Cámara**: Lector de código de barras y QR con sonido bip, más barra de búsqueda predictiva instantánea.
- **🖨️ Generador e Impresor de Códigos de Barra (Code 128)**: Para etiquetar repisas, estantes y gavetas en el servicio.
- **📜 Kardex y Exportación a Excel (`.xlsx`)**: Bitácora cronológica completa con descarga de planilla oficial de dos hojas (*Existencias* y *Movimientos*) con un clic.
- **📶 PWA Offline-Ready**: Funciona incluso en subterráneos o boxes sin conexión WiFi hospitalaria.

---

## 📱 Instalación en Dispositivos Móviles

La aplicación está optimizada para comportarse como una aplicación nativa en cualquier smartphone:

### En Android (Google Chrome)
1. Abre [https://fabyonchox.github.io/inventario-mfyr/](https://fabyonchox.github.io/inventario-mfyr/) en Chrome.
2. Toca los **tres puntos** (arriba a la derecha).
3. Selecciona **"Añadir a la pantalla de inicio"** o **"Instalar aplicación"**.

### En iOS (Safari)
1. Abre [https://fabyonchox.github.io/inventario-mfyr/](https://fabyonchox.github.io/inventario-mfyr/) en Safari.
2. Toca el botón **Compartir** (icono con flecha hacia arriba).
3. Selecciona **"Añadir a pantalla de inicio"**.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19, TypeScript, Vite
- **Estilos:** Tailwind CSS v4, Lucide Icons
- **Escáner:** `html5-qrcode`
- **Códigos de Barra:** `jsbarcode`
- **Planillas:** `xlsx` (SheetJS)
- **Despliegue Continuo:** GitHub Pages vía GitHub Actions

---

## 💻 Desarrollo Local

```bash
# Clonar repositorio
git clone https://github.com/fabyonchox/inventario-mfyr.git
cd inventario-mfyr

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

*Desarrollado para el Servicio de Medicina Física y Rehabilitación (MFYR).*
