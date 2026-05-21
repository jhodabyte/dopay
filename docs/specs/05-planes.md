# Spec: Planes de Suscripción

Pencil frame: `9pn80` (05 - Planes, 1440 × 1100px)

## Descripción

Página pública de marketing + selección de plan. Muestra las tres opciones de suscripción con precios, funcionalidades y trust signals. Accesible desde el registro (paso 3) y desde el menú de la plataforma.

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  priceHeader: badge + título + subtítulo + toggle        │
├──────────────────────────────────────────────────────────┤
│  priceCardsRow: 3 cards de plan lado a lado              │
├──────────────────────────────────────────────────────────┤
│  priceFooter: trust signals                              │
└──────────────────────────────────────────────────────────┘
```

No tiene sidebar ni topbar de app (es una página de marketing o pantalla standalone dentro del onboarding).

---

## Sección: Header (`priceHeader`)

Centrado verticalmente, gap 16, padding 80px top / 40px bottom:

- **Badge** (pill `#0062FF15`): punto azul + "Planes diseñados para tu cartera"
- **Título** (Inter 700, 42px, `#1A1A1A`): "Elige el plan ideal para tus propiedades"
- **Subtítulo** (Inter regular, 15px, `#9CA3AF`, 640px max ancho): "Sin contratos forzosos. Cambia o cancela cuando quieras. Todos los planes incluyen recordatorios automáticos y soporte en español."
- **Toggle de facturación** (pill container blanco, cornerRadius 9999, padding 4):
  - Opción activa: pill sólido `#0062FF` (texto blanco)
  - Opción inactiva: texto gris
  - Opciones: "Mensual" / "Anual" (descuento en anual, ej. "-20%")

---

## Sección: Cards de Planes (`priceCardsRow`)

3 cards en fila (gap 20, centered), cada una 340px de ancho.

### Plan Básico (`plan1`) — Card blanca

- Header (`plan1Header`):
  - Nombre del plan: "Básico"
  - Descripción corta: "Ideal para arrendadores con pocas propiedades"
- Precio (`plan1Price`):
  - Monto mensual: **$50.000 – $100.000 COP**
  - Texto "/mes" alineado al fondo del precio
- CTA (`plan1CTA`): botón "Empezar" (fondo `#F7F8FA`, texto `#1A1A1A`, cornerRadius 10, full-width)
- Divider (`plan1Divider`): línea `#F7F8FA`
- Features (`plan1Features`): lista con íconos check (`#10B981`)
  - Registro de inmuebles
  - Control de pagos de arriendo y servicios
  - Recordatorios automáticos a inquilinos
  - Soporte básico
  - Reportes simples

### Plan Intermedio (`plan2`) — Card azul `#0062FF` ⭐ POPULAR

- Badge "Más popular" (pill blanca, absolute position en top -12px)
- Header: nombre "Intermedio" + descripción (textos blancos)
- Precio: **$105.000 – $200.000 COP** (blanco)
- CTA: botón blanco sólido (texto `#0062FF`)
- Divider: `#FFFFFF20`
- Features (íconos y texto blancos):
  - Todo lo del plan Básico
  - Reportes detallados
  - Historial de pagos completo
  - Gestión de múltiples inquilinos
  - Notificaciones personalizadas
  - Integración con diferentes métodos de pago

### Plan Premium (`plan3`) — Card blanca

- Header: "Premium" + descripción
- Precio: **$205.000 – $300.000 COP**
- CTA: botón fondo `#F7F8FA`
- Features:
  - Todo lo del plan Intermedio
  - Panel de control avanzado
  - Análisis financiero
  - Automatización de cobros
  - Generación de reportes profesionales
  - Soporte prioritario
  - Personalización de la plataforma

---

## Sección: Footer de confianza (`priceFooter`)

Fila horizontal centrada, gap 32:

| Ícono (Lucide) | Texto |
|----------------|-------|
| `shield-check` verde | "Datos protegidos · Ley 1581 de 2012" |
| `credit-card` azul | "Pasarela de pagos PCI DSS" |
| `headphones` morado | "Soporte 100% en español" |

---

## Comportamiento

- El toggle mensual/anual actualiza los precios mostrados en cada card en tiempo real
- Click en CTA de cualquier plan:
  - Si usuario no autenticado: redirigir a `/registro` con plan preseleccionado como query param
  - Si usuario autenticado con plan vigente: mostrar modal de confirmación de cambio de plan
  - Si usuario en trial: activar plan seleccionado al terminar trial
- Plan destacado (Intermedio) tiene escala visual mayor o sombra diferenciadora
- Página accesible en `/planes` (pública) y también embebida en el paso 3 del registro

---

## Notas de implementación

- Tabla en base de datos: `subscriptions` (id, user_id, plan, billing_cycle, start_date, trial_end_date, status)
- Al cambiar de plan: proratear el periodo restante si hay facturación activa
- Precios son rangos; la definición exacta puede depender de la cantidad de propiedades registradas
- Integración con pasarela de pago PCI DSS para cobro de suscripción
