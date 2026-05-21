# Spec: Notificaciones y Recordatorios

## Descripción

Sistema automático de alertas que notifica a arrendatarios sobre vencimientos de pago y confirma registros de pago. Es uno de los diferenciadores clave de Dopay frente a la gestión manual.

> Esta funcionalidad no tiene pantalla dedicada en Pencil pero es transversal a toda la plataforma y forma parte del value proposition del producto.

---

## Tipos de Notificación

### 1. Recordatorio de pago próximo a vencer

- **Destinatario:** arrendatario
- **Canal:** email y/o SMS (según configuración del arrendador)
- **Disparador:** automático, X días antes del `due_date` del cobro
- **Contenido:** nombre del arrendador, propiedad, concepto, monto, fecha límite, instrucciones de pago
- **Configuración:** el arrendador define cuántos días antes enviar (default: 3 días)

### 2. Aviso de pago vencido

- **Destinatario:** arrendatario (y copia al arrendador)
- **Canal:** email
- **Disparador:** automático al día siguiente del `due_date` si `status = 'pending'`
- **Contenido:** recordatorio de deuda + días de mora + datos de contacto del arrendador

### 3. Confirmación de pago registrado

- **Destinatario:** arrendatario
- **Canal:** email
- **Disparador:** manual, cuando el arrendador marca el toggle "Notificar arrendatario" al registrar un pago
- **Contenido:** resumen del pago: monto, concepto, fecha, método, número de referencia

### 4. Alerta interna al arrendador

- **Destinatario:** arrendador
- **Canal:** notificación en plataforma (badge en topbar) + email opcional
- **Disparador:** pago en mora > N días (configurable)
- **Contenido:** resumen de propiedades con mora, monto total en riesgo

---

## Configuración por Arrendador

Panel de configuración (dentro de Perfil/Ajustes):

| Configuración | Opciones |
|---------------|---------|
| Días de anticipación para recordatorio | 1, 3, 5, 7 días (default 3) |
| Canal de notificación al arrendatario | Email / SMS / Ambos |
| Notificación interna por mora | Activar/desactivar + umbral de días |
| Plantilla de mensaje | Texto personalizable con variables: `{{nombre}}`, `{{monto}}`, `{{fecha}}` |

---

## Disponibilidad por Plan

| Funcionalidad | Básico | Intermedio | Premium |
|---------------|--------|-----------|---------|
| Recordatorios automáticos | ✓ | ✓ | ✓ |
| Notificación de pago confirmado | ✓ | ✓ | ✓ |
| Aviso de pago vencido | ✓ | ✓ | ✓ |
| Canal SMS | - | ✓ | ✓ |
| Personalización de plantilla | - | - | ✓ |

---

## Notas de implementación

- Lógica de envío: Supabase Edge Functions con cron job diario (o pg_cron)
- Proveedor de email: a definir (SendGrid, Resend, etc.)
- Proveedor SMS: a definir (Twilio, Vonage, etc.)
- Registrar logs de notificaciones enviadas en tabla `notification_logs` (notification_id, type, recipient, sent_at, status)
- Respetar Ley 1581/2012: los arrendatarios deben aceptar recibir notificaciones (consentimiento explícito al momento de ser registrados por el arrendador)
