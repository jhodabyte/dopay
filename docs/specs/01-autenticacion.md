# Spec: Autenticación

Pencil frames: `TK9r9` (Login), `o90YE` (Registro paso 1), `x9eNj` (Registro paso 2), `kPOdn` (Registro paso 3)

## Descripción

Módulo de entrada a la plataforma. Permite al arrendador iniciar sesión o crear una cuenta nueva mediante un flujo de 3 pasos. No requiere tarjeta de crédito para el registro; incluye prueba gratuita de 14 días.

---

## Pantalla: Login (`/login`)

### Layout
Pantalla dividida en dos columnas (1440 × 900px):

- **Panel izquierdo** (`#0062FF`, 600px): marketing brand + hero copy + estadísticas
  - Logo Dopay (blanco, 44px corner-radius 12)
  - Hero: `"Controla tus arriendos sin perder un solo pago."` (Inter 700, 42px)
  - Subtítulo: centralización, recordatorios, reportes, soporte en tiempo real
  - 3 estadísticas de confianza (ej. +1.000 propietarios, pagos gestionados, etc.)

- **Panel derecho** (`#F7F8FA`): formulario centrado
  - Card blanca (420px ancho, padding 40, cornerRadius 16, gap 24)
  - Encabezado del formulario
  - Campo email
  - Campo contraseña
  - Fila opciones: "Recordarme" + "¿Olvidaste tu contraseña?"
  - Botón primario "Ingresar" (`#0062FF`, cornerRadius 10, full-width)
  - Divider "o continúa con"
  - Botones OAuth (Google, etc.)
  - Link "¿No tienes cuenta? Regístrate"

### Comportamiento
- Validación de email y contraseña en cliente antes de enviar
- En error: mostrar mensaje inline debajo del campo afectado
- En éxito: redirigir a `/dashboard`
- Enlace "¿Olvidaste tu contraseña?" → flujo de recuperación (fuera de scope MVP)

---

## Pantalla: Registro Paso 1 — Datos personales (`/registro`)

### Layout
Mismo patrón de dos columnas (1440 × 900px):

- **Panel izquierdo** (`#0062FF`, 520px): marketing de conversión
  - Logo + título: `"Únete a +1.000 propietarios que ya organizan sus arriendos."`
  - Subtítulo: prueba 14 días, sin tarjeta, cancela cuando quieras
  - Lista de 3 beneficios clave
  - Testimonial de un usuario real (card con `#FFFFFF15` de fondo)

- **Panel derecho** (`#F7F8FA`): formulario (460px ancho, padding 36, gap 20)
  - Encabezado del formulario (título + indicador de paso 1/3)
  - Fila nombre y apellido (2 inputs en paralelo)
  - Campo email
  - Fila código de país + teléfono
  - Campo contraseña
  - Checkbox aceptar términos y condiciones + política de privacidad
  - Botón CTA "Continuar" (`#0062FF`, full-width)
  - Link "¿Ya tienes cuenta? Inicia sesión"

### Validaciones
- Nombre y apellido: requeridos, mínimo 2 caracteres
- Email: formato válido, único en el sistema
- Teléfono: formato colombiano (+57, 10 dígitos)
- Contraseña: mínimo 8 caracteres, al menos 1 número
- Términos: obligatorio marcar para continuar

---

## Pantalla: Registro Paso 2 (`/registro/paso-2`)

### Descripción
Configuración inicial de la cuenta del arrendador (información sobre su cartera de propiedades).

### Campos esperados (inferidos del flujo)
- Cantidad de propiedades en arriendo (selector)
- Ciudad(es) donde se ubican los inmuebles
- Cómo gestionan actualmente sus arriendos (manual, Excel, otra app)

### Comportamiento
- Botón "Atrás" regresa al paso 1 sin perder datos
- Botón "Continuar" avanza al paso 3

---

## Pantalla: Registro Paso 3 — Selección de plan (`/registro/paso-3`)

### Descripción
El usuario elige su plan de suscripción antes de acceder al dashboard. Puede seleccionar facturación mensual o anual.

### Campos / Componentes
- Toggle mensual / anual
- 3 cards de planes (Básico, Intermedio, Premium) — mismos precios y features que `/planes`
- Botón "Empezar prueba gratis" (sin cobro inmediato, 14 días trial)
- Link para saltar y elegir plan después

### Comportamiento
- Al confirmar plan: crear cuenta + sesión activa → redirigir a `/dashboard`
- Sin selección de plan: acceso con plan Básico por defecto durante trial

---

## Notas de implementación

- Rutas de registro son públicas (no requieren sesión)
- Ruta `/dashboard` y todas las rutas internas requieren sesión activa (middleware de auth)
- Datos del formulario multi-paso deben persistir en estado del cliente (no perderse al navegar entre pasos)
- Integración con Supabase Auth para gestión de sesiones
