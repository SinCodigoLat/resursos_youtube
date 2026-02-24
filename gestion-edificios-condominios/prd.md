Construye una aplicacion web.
El objetivo es crear un MVP navegable (solo UI) para una plataforma de gestion de edificios residenciales en Mexico.

Restricciones obligatorias

- Solo UI y flujos visuales
- Usar datos MOCK en todas las pantallas
- Sin backend real
- Sin pagos reales
- Sin integraciones externas
- Enfoque total en UX y flujos operativos

1. Landing page publica

- Titulo principal: "Administra edificios sin WhatsApp ni Excel"
- Propuesta de valor corta para administradores
- 3-4 beneficios claros
- CTA principal: "Ingresar al dashboard"
- Secciones con mockups del producto

2. Autenticacion (simulada)

- Pantalla simple de login
- Selector visual de rol:
  - Super Admin
  - Admin de edificio
  - Seguridad / Recepcion
  - Mantenimiento
  - Residente
- No aplicar permisos reales, solo cambio visual de vistas.

3. Dashboard principal

Mostrar KPIs simulados:

- Tickets de mantenimiento abiertos
- Visitas programadas hoy
- Pagos pendientes
- Unidades con morosidad

Incluir:

- Alertas operativas
- Acciones pendientes
- Diseno claro, orientado a operacion diaria
- Vista optimizada para movil

4. Gestion de edificios y unidades

- Lista de edificios
- Vista interna por edificio:
  - Unidades
  - Arrendatarios asignados
  - Resumen de contrato (mock)
- Acciones visuales:
  - Crear / editar
  - Navegar entre entidades

5. Gestion de visitas

Flujo:

- Residente registra una visita
- El sistema genera un codigo temporal
- Seguridad valida el acceso
- Registro en bitacora de entradas y salidas

Pantallas:

- Lista de visitas
- Detalle de visita
- Pantalla de validacion para seguridad

6. Mantenimiento

Crear ticket con:

- Categoria
- Prioridad
- Descripcion
- Evidencia (imagen mock)

Estados del ticket:

- Abierto
- En proceso
- Cerrado

- Indicador visual de SLA (simulado)

7. Cobranza basica (solo visual)

- Cargos por unidad
- Estado de pago:
  - Pagado
  - Pendiente
  - Vencido
- Recordatorios de pago (mock)
- Estado de cuenta por unidad

8. Centro de comunicacion

Envio de mensajes:

- Individuales
- Masivos

Segmentacion por:

- Edificio
- Unidad

- Historial de mensajes enviados (simulado)

9. Importacion CSV (simulada)

- Pantalla de carga de archivo
- Vista previa de validacion
- Lista de errores
- Resumen de registros importados con exito
- Todo visual, sin procesamiento real

Reglas de diseno y UX

- Web responsive
- Mentalidad mobile-first
- Navegacion clara por modulos
- Estilo B2B SaaS sobrio
- Priorizar rapidez, control y claridad

Objetivo final

Una app 100% navegable, ideal para:

- Demo comercial
- Validacion con clientes
