# QA Visual Report — Dopay
Fecha: 2026-05-21

## Resumen
- Páginas revisadas: 12/12
- Problemas críticos: 2
- Problemas menores: 4
- Advertencias: 3
- Páginas OK: 8

## Estado por página

### ✅ Login (`/login`)
- Desktop: OK
- Mobile: OK (panel izquierdo usa `hidden md:flex` — se oculta en < 768px correctamente en código)
- Notas: Todos los elementos presentes. Colores correctos (#0062FF panel izquierdo, blanco card). Toggle mostrar/ocultar contraseña funcional. Google OAuth button presente. "¿No tienes cuenta?" link correcto.

### ✅ Registro Paso 1 (`/registro`)
- Desktop: OK
- Mobile: OK (misma lógica de panel oculto)
- Notas: Nombre y apellido lado a lado (flex gap-3). Teléfono con +57. Toggle contraseña presente. Barra de fortaleza de contraseña implementada (aparece al tipear). Checkbox términos funcional.

### ✅ Registro Paso 2 (`/registro/paso-2`)
- Desktop: OK
- Mobile: No verificado (limitación técnica del browser MCP con pantallas HiDPI)
- Notas: "Paso 2 de 3" presente. Select de cantidad de propiedades con 5 opciones. Input de ciudad. Radio group con 4 opciones de gestión. Botones "Atrás" y "Continuar".

### ✅ Registro Paso 3 (`/registro/paso-3`)
- Desktop: OK
- Mobile: No verificado (limitación HiDPI)
- Notas: Toggle Mensual/Anual con -20% badge. 3 cards de planes. Card Intermedio con fondo azul (#0062FF) y badge "Más popular". Precios en cada card. Link "Saltar por ahora" presente.

### ⚠️ Dashboard (`/dashboard`)
- Desktop: OK (funciona pero con error de consola)
- Mobile: No verificado (limitación HiDPI)
- Notas: Sidebar presente con Dashboard activo en azul. Topbar con "Dashboard" y "Registrar pago". 4 KPI cards presentes. Sección "Actividad reciente" con datos. Sección "Cobros pendientes" con lista. Gráficas de barras y distribución presentes.
- **Problema**: KPIs "Pagos recibidos este mes" = 0 y "Ingresos del mes" = $0 aunque hay pagos marcados como `paid` en los datos. Esto ocurre porque los `paid_date` del mock data son de noviembre 2024 y el filtro es por mes/año actual (mayo 2026). El mock data está desactualizado.

### ✅ Propiedades (`/propiedades`)
- Desktop: OK
- Mobile: No verificado (limitación HiDPI)
- Notas: Topbar con contador "3 inmuebles activos" y "Nueva propiedad". Barra de filtros con búsqueda, dropdown estado (tabs), dropdown ciudad. Grid de 3 columnas (responsive: sm:2, lg:3). 5 cards presentes. Chips de estado correctos. No hay imágenes (mock data tiene `image_url: null` — se muestra placeholder correcto).

### ⚠️ Detalle Propiedad (`/propiedades/prop-001`)
- Desktop: OK con observación
- Mobile: No verificado
- Notas: Breadcrumb "Propiedades › Apto 302 - Chapinero" presente. Card izquierda con datos completos. Card arrendatario con avatar, nombre, email, badge "Pendiente". Tabla de historial de pagos presente. Botón "Registrar nuevo pago" presente.
- **Problema menor**: Tabla de historial de pagos tiene columnas `Concepto, Fecha, Monto, Estado` pero le falta la columna **Método** especificada en el spec del diseño.

### ✅ Pagos (`/pagos`)
- Desktop: OK
- Mobile: No verificado (tabla tiene `overflow-x-auto` para scroll horizontal)
- Notas: 4 KPI cards presentes. Tabla con columnas: Arrendatario, Propiedad, Concepto, Monto, Fecha límite, Estado, Acciones. Filtros por estado (tabs), propiedad (select), mes (select), búsqueda. Paginación funcional. Botón "Exportar" presente.
- **Nota de datos**: Total recaudado = $0 por el mismo problema del mock data desactualizado (pagos de 2024, actual 2026).

### ❌ Perfil Arrendatario (`/arrendatarios/tenant-001`)
- Desktop: CON PROBLEMAS
- Mobile: No verificado
- Notas: Breadcrumb visible ("Pagos › Ana Martínez"). Profile card con avatar, info de contacto, badge, botón "Editar". Estadísticas en columna derecha correctas (Total pagado, Tiempo como arrendatario, Próximo pago, Promedio días retraso). Gráfica de cumplimiento últimos 6 meses.
- **Problema**: En la tabla de pagos dentro del perfil del arrendatario, la columna "Arrendatario" muestra `?` en el avatar y `—` como nombre. Esto se debe a que `TenantPaymentSection.tsx` pasa `tenant: null` al construir `paymentsWithDetails`. La tabla no oculta la columna cuando `showTenantLinks=false`, sino que muestra datos vacíos.

### ✅ Planes (`/planes`)
- Desktop: OK
- Mobile: No verificado (cards en flex-col para mobile según código)
- Notas: Badge "Planes diseñados para tu cartera". Título correcto. Toggle Mensual/Anual presente. 3 cards con Intermedio en azul y badge "Más popular". Features con checkmarks. Footer con 3 trust signals (Ley 1581, PCI DSS, Soporte en español). FAQ section con 3 preguntas.

### ✅ Notificaciones (`/ajustes/notificaciones`)
- Desktop: OK
- Mobile: No verificado
- Notas: Nav lateral con 3 opciones (Notificaciones activa, Perfil, Facturación). 4 secciones de configuración. Toggles presentes (4 en total: toggles en secciones 2 y 3 + radios días/canal). Sección Premium con overlay `opacity-40 pointer-events-none`. Botón "Guardar configuración" presente.

### ✅ Modal "Registrar pago" (desde Dashboard)
- Desktop: OK
- Mobile: No verificado
- Notas: Modal se abre correctamente con overlay oscuro (`rgba(15,23,42,0.6)`). Título "Registrar pago". Campos: Propiedad (select), Concepto (select), Monto (input con $ prefix), Método de pago (select), Notas (textarea). Toggle "Notificar arrendatario" presente. Botones "Cancelar" y "Guardar pago". Botón X funcional. Cierra con Escape.

---

## Problemas encontrados

### 🔴 Críticos (rompen la funcionalidad o muestran datos incorrectos claramente)

1. **Hydration Error en todas las páginas del área (app)** — Todas las páginas con layout de app (dashboard, propiedades, pagos, arrendatarios, ajustes) generan un error de hidratación React en la consola:
   - **Causa**: `components/notifications/ToastProvider.tsx` usa `typeof document !== 'undefined'` para condicionar el `createPortal`, lo que causa mismatch entre SSR y cliente.
   - **Fix**: Reemplazar la condición con `useState(false)` + `useEffect` para montar el portal solo client-side:
     ```tsx
     const [mounted, setMounted] = useState(false)
     useEffect(() => { setMounted(true) }, [])
     // ...
     {mounted && createPortal(..., document.body)}
     ```
   - **Impacto**: Error en consola en cada navegación. React re-renderiza todo el árbol desde cero, afectando performance.

2. **Tabla de pagos en Perfil Arrendatario muestra `?` y `—`** — `/arrendatarios/[id]`
   - **Causa**: `TenantPaymentSection.tsx` línea 28 establece `tenant: null` en `paymentsWithDetails`. El componente `PaymentsTable` muestra `?` en el avatar y `—` en el nombre cuando `tenant` es null, incluso cuando `showTenantLinks=false`.
   - **Fix**: Pasar el tenant actual a cada payment en `TenantPaymentSection`, o hacer que la tabla oculte la columna "Arrendatario" cuando `showTenantLinks=false`.
   - **Impacto**: UX confusa — el usuario ve datos vacíos donde debería ver el nombre del arrendatario o no ver la columna.

### 🟡 Menores (UI incorrecta pero no rompe)

1. **Columna "Método" faltante en tabla de historial** — `/propiedades/[id]`
   - La tabla de historial de pagos tiene: Concepto, Fecha, Monto, Estado. Le falta la columna "Método" especificada en el spec del diseño (`jxIoM`).
   - El campo `method` existe en el mock data (`transfer`, `pse`, `nequi`) pero no se muestra.

2. **KPI "Pagos recibidos este mes" = 0 y "Ingresos del mes" = $0** — Dashboard y Pagos
   - Los cálculos filtran por mes/año actual (mayo 2026) pero todos los `paid_date` del mock data son de noviembre 2024.
   - No es un bug de código — la lógica es correcta — pero el mock data desactualizado hace que estos KPIs siempre muestren 0, lo que genera confusión al revisar la UI.
   - **Fix**: Actualizar las fechas del mock data para que sean relativas a `new Date()`.

3. **Tabla de pagos en Perfil Arrendatario muestra columna "Arrendatario" innecesaria** — `/arrendatarios/[id]`
   - Cuando se está en el perfil de un arrendatario, la columna "Arrendatario" es redundante. Debería ocultarse cuando `showTenantLinks=false`.
   - El prop `showTenantLinks` solo controla si el nombre es un link, pero no oculta la columna completa.

4. **Verificación mobile limitada** — El browser MCP en macOS HiDPI (devicePixelRatio=2) no puede reducir el viewport a menos de ~707px CSS porque `window.innerWidth` no refleja el resize de ventana. No fue posible verificar el responsive layout real en 375px para las páginas del área app. Las clases Tailwind están correctamente implementadas en el código (`hidden md:flex`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

### 🟢 Advertencias (mejoras sugeridas)

1. **Mock data desactualizado** — Las fechas del mock data (`paid_date`, `due_date`, `contract_end`) son de 2024. Para testing visual efectivo deberían actualizarse con fechas relativas al momento actual o usar `Date.now()` ajustado.

2. **Sidebar duplicado en DOM** — El AppShell renderiza dos instancias del componente `Sidebar` (desktop + mobile). Aunque esto es un patrón válido para responsive, genera nodos duplicados en el DOM que pueden confundir a screen readers y herramientas de accesibilidad.

3. **Ajustes: ruta `/ajustes` redirige** — La ruta `/ajustes` existe pero parece llevar al mismo lugar que antes. Sería conveniente que redirija automáticamente a `/ajustes/notificaciones` como ruta por defecto.

---

## Errores de consola

### Error crítico (se repite en todas las páginas del área app):
```
Error: Hydration failed because the server rendered HTML didn't match the client.
  Afectado: ToastProvider en AppShell
  Causa: typeof document !== 'undefined' en createPortal
  Páginas: /dashboard, /propiedades, /propiedades/[id], /pagos, /arrendatarios/[id], /ajustes/notificaciones
  Archivo: components/notifications/ToastProvider.tsx
```

### Sin otros errores de consola en:
- `/login` — limpio
- `/registro`, `/registro/paso-2`, `/registro/paso-3` — limpio
- `/planes` — limpio (ruta independiente sin AppShell)
