# Spec: Propiedades

Pencil frames: `2w62m` (03 - Propiedades, 1440 × 1100px), `7rbwR` (07 - Detalle Propiedad, 1440 × 1300px)

## Descripción

Módulo central de la plataforma. Permite al arrendador registrar, consultar y administrar todos sus inmuebles en arriendo. Desde aquí accede al detalle de cada propiedad.

---

## Pantalla: Lista de Propiedades (`/propiedades`)

### Layout

```
┌─────────────┬───────────────────────────────────────────┐
│   Sidebar   │  Topbar: "Propiedades" / "Gestiona tus    │
│  (J8D70)    │   24 inmuebles activos"  [+ Nueva]        │
│  item activo├───────────────────────────────────────────┤
│  Propiedades│  propFilterRow: búsqueda + filtros        │
│             ├───────────────────────────────────────────┤
│             │  propGrid: tarjetas de inmuebles          │
└─────────────┴───────────────────────────────────────────┘
```

- Sidebar: item "Propiedades" activo (texto `#0062FF`, fondo `#FFFFFF00`)
- Topbar: título "Propiedades", subtítulo dinámico con conteo, CTA "Nueva propiedad"

### Sección: Filter Row (`propFilterRow`)

Fila horizontal con `justifyContent: space_between`:

- **Izquierda:** input de búsqueda por nombre o dirección (ícono lupa)
- **Centro/derecha:** filtros:
  - Selector de estado: Todas / Activas / Desocupadas / En mora
  - Selector de ciudad/localidad
  - Botón "Filtrar"

### Sección: Property Grid (`propGrid`)

Grid de tarjetas (2 o 3 columnas según viewport, gap 16).

Cada tarjeta de propiedad:
- Imagen del inmueble (fill imagen o placeholder gris)
- Chip de estado: `Activa` (verde), `Desocupada` (gris), `En mora` (rojo)
- Nombre/dirección del inmueble
- Nombre del arrendatario actual (si existe)
- Monto del arriendo mensual en COP
- Fecha próximo pago o días de mora
- Íconos de acciones: Ver detalle, Registrar pago, Editar
- Click en la card → navegar a `/propiedades/[id]`

### Modal: Nueva Propiedad

Disparado por CTA "Nueva propiedad" en Topbar. Formulario con:
- Nombre / Alias de la propiedad (ej. "Apto 502 · Chapinero")
- Dirección completa
- Ciudad
- Tipo de inmueble (apartamento, casa, local, bodega)
- Valor mensual del arriendo (COP)
- Fecha de inicio del contrato
- Foto del inmueble (opcional, upload)
- Botones: Cancelar / Guardar

---

## Pantalla: Detalle de Propiedad (`/propiedades/[id]`)

### Layout

```
┌─────────────┬────────────────────────────────────────────┐
│   Sidebar   │  Topbar: "Apto 502 · Chapinero"            │
│  (J8D70)    │    "Propiedad activa · Contrato vigente"   │
│             │    CTA: "Registrar pago"                   │
│             ├────────────────────────────────────────────┤
│             │  Breadcrumb: Propiedades › Apto 502        │
│             ├────────────────────────────────────────────┤
│             │  pdLayout: columna izq + columna der       │
└─────────────┴────────────────────────────────────────────┘
```

### Breadcrumb (`pdBreadcrumb`)

`Propiedades` (link) › `[Nombre del inmueble]` (texto actual)

### Layout de detalle (`pdLayout`)

Dos columnas (gap 20):

#### Columna izquierda — Información del inmueble
Card blanca, cornerRadius 16, padding 24:
- Foto del inmueble (imagen o placeholder)
- Nombre y dirección
- Tipo de inmueble + localidad
- Estado del contrato (activo / vencido / próximo a vencer)
- Fecha inicio y fin del contrato
- Valor mensual del arriendo
- Datos de servicios públicos incluidos (si aplica)
- Botón "Editar propiedad"

#### Columna izquierda inferior — Arrendatario actual
Card blanca, cornerRadius 16:
- Foto/avatar del arrendatario
- Nombre completo + teléfono + email
- Link "Ver perfil completo" → `/arrendatarios/[id]`
- Badge de estado de pago: Al día / Pendiente / En mora

#### Columna derecha — Historial de pagos
Card blanca, cornerRadius 16:
- Tabla o lista de pagos registrados
  - Columnas: Concepto | Fecha | Monto | Método | Estado
  - Estado con badge de color (verde pagado, amarillo pendiente, rojo vencido)
- Botón "Registrar nuevo pago" → abre modal `09 - Registrar Pago`
- Paginación si hay más de 10 registros

---

## Notas de implementación

- Tabla en base de datos: `properties` (id, owner_id, name, address, city, type, monthly_rent, contract_start, contract_end, status, tenant_id)
- Relación: `properties.tenant_id → tenants.id`
- Relación: `properties.id → payments.property_id`
- Al agregar nueva propiedad, opcionalmente asignar arrendatario existente o crear uno nuevo
- Ruta protegida; solo el `owner_id` dueño de la propiedad puede verla/editarla
