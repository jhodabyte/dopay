@AGENTS.md

# Dopay — Plataforma Web de Gestión de Pagos de Arriendos

## Propósito del Proyecto

Dopay es una plataforma SaaS web B2B dirigida a propietarios de inmuebles en arriendo, con foco inicial en Bogotá, Colombia. Centraliza la gestión administrativa de múltiples propiedades: control de pagos, seguimiento de arrendatarios, recordatorios automáticos y reportes financieros.

**Problema que resuelve:** propietarios con múltiples inmuebles manejan arriendos de forma manual (cuadernos, hojas de cálculo, pagos en efectivo), lo que genera desorganización, morosidad y pérdida de tiempo. Hasta 2–3 conflictos de arriendo por hora se reportan en Bogotá (Secretaría de Seguridad, 2024).

**Diferenciador clave frente a Folio y Rent Manager:** gestión centralizada por múltiples cuentas bancarias y pago de administración del inmueble desde la misma plataforma.

## Entidad Legal

- Tipo: Sociedad por Acciones Simplificada (SAS) — Ley 1258/2008
- Sede: Chapinero, Bogotá D.C., Colombia
- Datos personales: Ley 1581/2012
- Arrendamiento urbano: Ley 820/2003
- Comercio electrónico: responsabilidad sobre términos y condiciones, seguridad en pagos, canal de PQRS activo

## Usuarios y Roles

| Rol | Descripción |
|-----|-------------|
| **Arrendador (propietario)** | Usuario principal. Registra inmuebles, arrendatarios, gestiona cobros y consulta reportes. |
| **Arrendatario** | Recibe notificaciones de pago. No tiene acceso directo a la plataforma en el MVP. |
| **Admin Dopay** | Equipo interno. Gestiona suscripciones y soporte técnico. |

## Planes de Suscripción

| Plan | Costo mensual COP | Propiedades | Funcionalidades |
|------|-------------------|-------------|-----------------|
| **Básico** | $50.000 – $100.000 | Pocas | Registro inmuebles, control pagos, recordatorios automáticos, soporte básico, reportes simples |
| **Intermedio** | $105.000 – $200.000 | Cantidad media | Todo Básico + reportes detallados, historial de pagos, múltiples inquilinos, notificaciones personalizadas, integración métodos de pago |
| **Premium** | $205.000 – $300.000 | Ilimitado | Todo Intermedio + panel avanzado, análisis financiero, automatización de cobros, reportes profesionales, soporte prioritario, personalización |

Facturación mensual o anual. Prueba gratuita 14 días, sin tarjeta de crédito.

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2.6 — **leer `node_modules/next/dist/docs/` antes de codificar; tiene breaking changes** |
| UI | React 19.2.4 + TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | DigitalOcean (escalado automático, 1.000 usuarios concurrentes) |
| Pagos | Pasarela PCI DSS |
| Diseños | `pencil-new.pen` (Pencil MCP) |

## Design System

Paleta de color:

| Token | Hex |
|-------|-----|
| Primario | `#0062FF` |
| Fondo app | `#F7F8FA` |
| Blanco | `#FFFFFF` |
| Texto primario | `#1A1A1A` |
| Texto secundario | `#4B5563` |
| Texto muted | `#9CA3AF` |
| Éxito / verde | `#10B981` |
| Acento morado | `#8B5CF6` |
| Overlay oscuro | `#0F172A99` |

Fuente: **Inter**. Iconos: **Lucide** (icon_font). Radios: botones `10px`, cards `16px`, modales `20px`, pills `9999px`.

Componentes reutilizables (Pencil IDs):
- `J8D70` — Sidebar (240 × 1100px, blanco, navegación vertical con ítems activos en azul)
- `VAOAv` — Topbar (1200 × 72px, blanco, título + subtítulo + CTA derecha)

## Pantallas Diseñadas

| Pencil ID | Pantalla | Ruta sugerida |
|-----------|---------|--------------|
| `TK9r9` | 01 - Login | `/login` |
| `o90YE` | 06 - Registro paso 1 | `/registro` |
| `x9eNj` | 06b - Registro paso 2 | `/registro/paso-2` |
| `kPOdn` | 06c - Registro paso 3 | `/registro/paso-3` |
| `T3kgB` | 02 - Dashboard | `/dashboard` |
| `2w62m` | 03 - Propiedades | `/propiedades` |
| `7rbwR` | 07 - Detalle Propiedad | `/propiedades/[id]` |
| `uc4wU` | 04 - Pagos y Arrendatarios | `/pagos` |
| `jxIoM` | 09 - Registrar Pago (modal) | modal en `/pagos` o `/propiedades/[id]` |
| `8AyPN` | 08 - Perfil Arrendatario | `/arrendatarios/[id]` |
| `9pn80` | 05 - Planes | `/planes` |

## Specs por Feature

Ver `docs/specs/` para especificaciones detalladas de cada módulo.

## Operaciones y SLA

- Soporte: lunes–viernes 08:00–18:00
- SLA error leve: 1 día hábil (chat automático o correo)
- SLA error crítico: inmediato / medio día (protocolo de emergencia)
- Backups: automáticos diarios en servidores externos
- Mantenimiento preventivo: domingos en la noche (aviso previo en plataforma)
- Meta: 1.000 suscripciones anuales (~4 nuevas/día)
