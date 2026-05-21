# Spec: Pagos y Arrendatarios

Pencil frames: `uc4wU` (04 - Pagos y Arrendatarios, 1440 × 1100px), `jxIoM` (09 - Registrar Pago modal, 1440 × 1000px), `8AyPN` (08 - Perfil Arrendatario, 1440 × 1200px)

## Descripción

Módulo de seguimiento financiero. Permite visualizar el estado de todos los cobros, registrar pagos recibidos y consultar el perfil individual de cada arrendatario.

---

## Pantalla: Pagos y Arrendatarios (`/pagos`)

### Layout

```
┌─────────────┬──────────────────────────────────────────────┐
│   Sidebar   │  Topbar: "Pagos" / "Seguimiento de cobros    │
│  (J8D70)    │   y arrendatarios"   CTA: "Registrar pago"  │
│  item Pagos ├──────────────────────────────────────────────┤
│  activo     │  paySummary: 4 tarjetas resumen              │
│             ├──────────────────────────────────────────────┤
│             │  payTableCard: tabla de pagos                │
└─────────────┴──────────────────────────────────────────────┘
```

### Sección: Summary (`paySummary`)

4 tarjetas KPI en fila (gap 16):

| Tarjeta | Descripción |
|---------|-------------|
| **Total recaudado** | Suma de pagos confirmados en el mes actual (COP) |
| **Pendientes de cobro** | Cobros aún no registrados como pagados |
| **En mora** | Pagos vencidos (> fecha límite) |
| **Próximos vencimientos** | Pagos que vencen en los próximos 7 días |

### Sección: Tabla de Pagos (`payTableCard`)

Card blanca (cornerRadius 16, `fill_container` ancho):

**Header de la tabla:**
- Título "Pagos"
- Filtros inline: por estado (Todos / Pagados / Pendientes / Vencidos), por propiedad, por mes
- Input búsqueda por arrendatario

**Columnas de la tabla:**

| Columna | Descripción |
|---------|-------------|
| Arrendatario | Avatar + nombre completo (link a `/arrendatarios/[id]`) |
| Propiedad | Nombre/dirección del inmueble |
| Concepto | Arriendo, administración, servicios, otro |
| Monto | Valor en COP |
| Fecha límite | Fecha de vencimiento del cobro |
| Estado | Badge: `Pagado` (verde), `Pendiente` (amarillo), `Vencido` (rojo) |
| Acciones | Ícono registrar pago (si pendiente) / ver comprobante (si pagado) |

**Footer:**
- Paginación (filas por página: 10 / 25 / 50)
- Total de registros

---

## Modal: Registrar Pago (`jxIoM`)

Overlay oscuro (`#0F172A99`) sobre la pantalla actual. Card modal blanca (560px ancho, cornerRadius 20).

### Header del modal (`rpHeader`)
- Título: "Registrar pago"
- Subtítulo/descripción breve
- Botón cerrar (X, circle gris `#F7F8FA`, 32px)

### Formulario (`rpForm`)

| Campo | Tipo | Notas |
|-------|------|-------|
| **Propiedad** (`rpProp`) | Selector desplegable | Lista de propiedades del arrendador |
| **Concepto** (`rpConceptRow`) | Selector múltiple | Arriendo / Administración / Servicios / Otro |
| **Monto** (`rpAmountRow`) | Input numérico COP | Con formato de miles (ej. $1.200.000) |
| **Método de pago** (`rpMethod`) | Radio / Selector | Transferencia / PSE / Efectivo / Nequi / Daviplata |
| **Notas** (`rpNotes`) | Textarea opcional | Referencia o número de transacción |
| **Notificar arrendatario** (`rpNotify`) | Toggle on/off | Envía confirmación por email/SMS al arrendatario |

### Acciones del modal (`rpActions`)
- Botón "Cancelar" (fondo `#F7F8FA`, cornerRadius 10)
- Botón "Guardar pago" (fondo `#0062FF`, cornerRadius 10)

### Comportamiento
- Al guardar: crear registro en `payments`, actualizar estado del cobro, disparar notificación si toggle activo
- Al cancelar: cerrar modal sin guardar
- Validación: propiedad, concepto y monto son requeridos
- El modal se puede abrir desde: Topbar de `/pagos`, tabla de pagos, Dashboard, Detalle de Propiedad, Perfil Arrendatario

---

## Pantalla: Perfil Arrendatario (`/arrendatarios/[id]`)

### Layout

```
┌─────────────┬──────────────────────────────────────────────┐
│   Sidebar   │  Topbar: "[Nombre]" / "Arrendatario ·        │
│  (J8D70)    │   Cliente desde [Mes Año]"   CTA: "Registrar │
│             │   pago"                                      │
│             ├──────────────────────────────────────────────┤
│             │  Breadcrumb: Pagos › [Nombre Arrendatario]   │
│             ├──────────────────────────────────────────────┤
│             │  tdProfileCard: tarjeta de perfil            │
│             ├──────────────────────────────────────────────┤
│             │  tdLayout: historial + métricas              │
└─────────────┴──────────────────────────────────────────────┘
```

### Tarjeta de perfil (`tdProfileCard`)

Card blanca, cornerRadius 16, padding 28, layout horizontal, gap 24:
- Avatar del arrendatario (foto o iniciales)
- Información de contacto:
  - Nombre completo
  - Email
  - Teléfono
  - Fecha desde que es cliente
- Badge de estado de pago: "Al día" (verde) / "Pendiente" / "En mora X días"
- Botón "Editar información"
- Propiedad(es) asignada(s)

### Layout de detalle (`tdLayout`)

Dos columnas (gap 20):

#### Columna izquierda — Historial de pagos
- Tabla/lista de pagos del arrendatario (igual que en tabla general pero filtrada por este arrendatario)
- Totales pagados / pendientes en el pie

#### Columna derecha — Estadísticas del arrendatario
- Promedio de días de retraso en pagos
- Monto total pagado (acumulado)
- Tiempo como arrendatario
- Próximo pago: fecha + monto

---

## Tabla de base de datos relacionadas

```
tenants        (id, owner_id, name, email, phone, created_at)
payments       (id, property_id, tenant_id, concept, amount, due_date, paid_date, method, status, notes)
```

- `status`: enum `pending | paid | overdue`
- `concept`: enum `rent | admin | utilities | other`
- Notificaciones manejadas por función de Supabase Edge Function o servicio de email externo

---

## Notas de implementación

- Filtros de tabla deben ser URL params para permitir compartir/bookmarking
- Exportar tabla a CSV (Plan Intermedio y Premium)
- Historial de pagos paginado por cursor (Supabase)
- En mora se calcula comparando `due_date` con `now()` y `status = 'pending'`
