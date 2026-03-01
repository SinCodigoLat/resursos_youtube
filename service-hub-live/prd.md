
# PRD v1.0 — **ServiceOS**

**Plataforma web para gestión operativa de servicios a domicilio**

---

## IMPORTANTE

* Enfoque en **UI + lógica mock en frontend**
* Datos **mock en memoria / localStorage**
* Sin backend real en esta fase
* Más adelante se conectará Supabase
* No pagos, no integraciones externas
* UX orientada a **uso en sitio / operación diaria**

---

## OBJETIVO

Mostrar el flujo completo de un servicio a domicilio:

**Orden asignada → trabajo en casa del cliente → registro de horas y materiales → firma → servicio cerrado**

---

## RUTAS (OBLIGATORIAS)

* `/` → Landing
* `/auth` → Acceso y Registro
* `/home` → Redirección inteligente por rol
* `/hub` → Vista operativa integrada (Admin)
* `/technician` → App de Servicio (Técnico en campo)
* `/customer` → Vista Cliente (Revisión y Firma)
* `/erp` → Backoffice / Gestión de Entidades
* `/settings` → Perfil y Configuración

---

## ARQUITECTURA FRONTEND (OBLIGATORIA)

* **Store global reactivo**
  * Sincronización de órdenes, técnicos, clientes y materiales.
  * Gestión de sesiones y perfiles.
* **Sistema de Roles y Permisos**
  * **Admin**: Acceso total al Hub, ERP y configuraciones.
  * **Técnico**: Acceso a órdenes asignadas y control de campo.
  * **Cliente**: Acceso a vista de resumen y captura de firma.
* Cambios reflejados en tiempo real (mock/memoria)
* Persistencia en `localStorage` (para desarrollo local/mock)
* Botón **Reset** para volver a estado inicial controlado
* Estados operativos validados por reglas de transición

---

## 1) Landing (`/`)

**Hero**

* Título:
  **“Sistema operativo para servicios a domicilio”**
* Subtítulo:
  Órdenes, horas, materiales y firmas desde la casa del cliente.

**Sección módulos**

* Operador de servicio
* Cliente
* Operación / Backoffice

**Arquitectura visual (cards conectadas)**

* Web App Operador
* Cliente (firma)
* Operación
* ERP / Facturación (mock)

**Beneficios**

* Reemplaza papel y WhatsApp
* Evidencia del trabajo realizado
* Control real de tiempos y materiales
* Escalable a múltiples operadores

**CTA**

* “Ingresar al sistema”

---

## 2) Hub Operativo (`/hub`)

**Layout desktop (3 paneles)**

* Panel A: Servicios asignados
* Panel B: Servicio activo (detalle)
* Panel C: Eventos / Estados

**Barra superior**

* Nombre de la empresa
* Navegación:

  * Servicio
  * Cliente
  * ERP

**Timeline lateral de eventos**

* Servicio asignado
* Trabajo iniciado
* Pausado
* Material registrado
* Firma capturada
* Servicio cerrado

**Mobile**

* Paneles como tabs

---

## 3) Módulo Servicio (`/technician`)

### A. Lista de servicios
* Vista segmentada por asignación (solo las órdenes del técnico logueado).
* Indicadores visuales de estado (StatusBadge).

### B. Control de tiempo (Multi-step)
* Botones dinámicos según el estado:
  * **Iniciar**: Activa el contador y cambia estado a `in_progress`.
  * **Pausar / Reanudar**: Control de interrupciones.
  * **Finalizar**: Detiene el cronómetro.
* Cronómetro en tiempo real con formato monoespaciado.

### C. Hoja de servicio
* Checklist interactivo de tareas obligatorias.
* Área de notas para observaciones técnicas.

### D. Materiales utilizados
* Buscador/Selector de materiales del inventario.
* Registro de cantidad usada con validación de stock mock.

### E. Cierre del servicio
* Validación obligatoria antes de cerrar:
  * Al menos un registro de tiempo.
  * Checklist completado al 100%.
  * Firma del cliente capturada.
* Botón "Cerrar servicio" (bloquea la edición tras el cierre).

---

## 4) Vista Cliente (`/customer`)

**Uso pasivo**

* **Resumen Ejecutivo**:
  * Lista de trabajos realizados (vistos desde el técnico).
  * Consumo de materiales.
  * Registros de tiempo (resumen).
* **Captura de Conformidad**:
  * Signature Pad dedicado.
  * Validador de nombre del firmante.
  * Timestamp automático al firmar.

---

## 5) Vista Backoffice / ERP mock (`/erp`)

### Gestión de Entidades (CRUD)
* **Órdenes**: Creación y asignación a técnicos.
* **Técnicos**: Gestión de staff y disponibilidad.
* **Clientes**: Directorio centralizado de cuentas.

### Auditoría y Eventos
* Timeline centralizado de todas las acciones del sistema.
* Registro detallado por service_id.

### Estados

* **estado_operativo**

  * assigned
  * in_progress
  * paused
  * completed
  * cancelled

---

## REGLAS DE ESTADO (OBLIGATORIAS)

* assigned → in_progress

* in_progress → paused

* paused → in_progress

* in_progress → completed

* assigned → cancelled

* Bloquear transiciones inválidas

* Mostrar toast de error

---

## DATOS MOCK INICIALES

* 1 empresa de servicios a domicilio
* 1 operador:

  * op_01 — Carlos
* 3–5 servicios activos
* 10 materiales básicos
* 3 clientes mock

---

## UX

* Toasts en cada acción
* Colores consistentes por estado
* Indicadores claros de progreso
* Mobile-first
* Flujo rápido, sin fricción

---

## NO HACER (DESPUÉS)

* Pagos reales integrados.
* GPS tracking avanzado.
* Reportes de BI/Analítica.
* Notificaciones automáticas.

---

## OBJETIVO FINAL

Una aplicación web **100% navegable**, ideal para:

* Validación con negocios de servicios a domicilio
* Demostración comercial
* Base sólida para backend real
