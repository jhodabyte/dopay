# Spec: Dashboard

Pencil frame: `T3kgB` (02 - Dashboard, 1440 × 1100px)

## Descripción

Vista principal post-login. Ofrece al arrendador una visión consolidada del estado de su cartera: KPIs financieros, actividad reciente y alertas de pagos pendientes.

---

## Layout

```
┌─────────────┬─────────────────────────────────────┐
│   Sidebar   │            Topbar                    │
│  (J8D70)    ├─────────────────────────────────────┤
│             │  kpiRow (4 tarjetas de métricas)     │
│             ├─────────────────────────────────────┤
│             │  contentRow (actividad + pendientes) │
│             ├─────────────────────────────────────┤
│             │  bottomRow (gráficas o resumen)      │
└─────────────┴─────────────────────────────────────┘
```

- Sidebar: componente reutilizable `J8D70`, item "Dashboard" activo
- Topbar: componente reutilizable `VAOAv`
- Área principal (`#F7F8FA`): padding 24px top/bottom, 32px left/right; gap 24 entre filas

---

## Sección: KPI Row (`kpiRow`)

4 tarjetas métricas en fila horizontal (gap 16, `fill_container` en cada una).

| KPI | Descripción | Ícono sugerido |
|-----|-------------|----------------|
| **Propiedades activas** | Total de inmuebles con contrato vigente | `home` |
| **Pagos recibidos este mes** | Suma de pagos confirmados en el mes actual | `check-circle` |
| **Pagos pendientes** | Cobros no registrados aún (en rojo/amarillo si hay mora) | `clock` |
| **Ingresos del mes** | Total COP recaudado en el periodo actual | `trending-up` |

Cada tarjeta:
- Card blanca, cornerRadius 16, padding 20, sombra suave
- Ícono + etiqueta + valor principal (número o COP)
- Variación vs mes anterior (delta con flecha)

---

## Sección: Content Row (`contentRow`)

Dos columnas (gap 16):

### Columna izquierda — Actividad reciente
- Lista de los últimos 5–8 eventos: pago registrado, nuevo arrendatario, contrato próximo a vencer
- Cada ítem: avatar/ícono + descripción + timestamp relativo (ej. "hace 2 horas")
- Link "Ver todo" al pie

### Columna derecha — Cobros pendientes
- Lista de arrendatarios con pago vencido o próximo a vencer (próximos 7 días)
- Cada ítem: nombre arrendatario + dirección + monto + días de mora
- Botón "Registrar pago" inline → abre modal `09 - Registrar Pago`
- Badge de urgencia (rojo si mora > 0 días, amarillo si vence en ≤ 3 días)

---

## Sección: Bottom Row (`bottomRow`)

Dos columnas (gap 16):

### Columna izquierda — Gráfica de ingresos
- Gráfica de barras mensual (últimos 6 meses)
- Eje Y: monto COP; eje X: mes abreviado
- Color: `#0062FF` con opacidad degradada

### Columna derecha — Distribución de propiedades
- Gráfica de dona o resumen por estado: activas, desocupadas, en mora
- Colores: verde (`#10B981`) activas, gris muted desocupadas, rojo mora

---

## Topbar específico del Dashboard

- Título: `"Dashboard"` / subtítulo: saludo personalizado con nombre del arrendador
- CTA derecha: botón "Registrar pago" (`#0062FF`) → abre modal

---

## Notas de implementación

- Datos en tiempo real desde Supabase (suscripciones Realtime o polling cada 60s)
- KPIs calculados por query agregada: filtrar por `owner_id` y mes actual
- Ruta protegida: requiere sesión activa
- Responsive: en móvil las columnas se apilan verticalmente
