Crea una aplicación web llamada “DeliveryOS” para un sistema completo de pedidos de restaurantes.

IMPORTANTE

- Enfoque en UI + lógica mock en frontend.

- Datos mock en memoria/localStorage.

- Más adelante conectaremos Supabase.

- No backend real en esta fase.

OBJETIVO

Mostrar el flujo completo:

Cliente crea pedido -> POS confirma/prepara -> se asigna repartidor -> repartidor entrega -> pedido cerrado.

RUTAS (OBLIGATORIAS)

- /                 -> Landing

- /hub              -> Hub principal con vista integrada

- /customer         -> Módulo Cliente

- /pos              -> Módulo POS

- /driver           -> Módulo Driver

- /erp              -> Vista Backoffice/ERP mock

ARQUITECTURA FRONTEND (OBLIGATORIA)

- Usar un store global único (estado compartido) para pedidos, productos, driver y eventos.

- Todos los módulos deben reflejar cambios en tiempo real mock (sin recargar).

- Persistir estado en localStorage.

- Botón “Reset” limpia estado y vuelve a datos iniciales.

1) Landing (/)

- Hero: “Sistema operativo para restaurantes con delivery”

- Subtítulo con 3 módulos: Menu, POS, Driver

- Sección arquitectura visual con cards conectadas:

  - App Cliente

  - POS/Operación

  - Driver App

  - Gateway (mock)

  - Odoo ERP (mock)

- Sección beneficios: multi-sucursal, trazabilidad, roles, bajo costo operativo

2) Hub (/hub)

- Layout desktop con 3 paneles simultáneos:

  - Panel A: Cliente/Menu

  - Panel B: POS Operación

  - Panel C: Driver

- Barra superior:

  - Nombre del negocio

  - Navegación a /customer /pos /driver /erp

- Timeline lateral de eventos:

  - Pedido creado

  - Confirmado

  - Preparando

  - Listo

  - En ruta

  - Entregado

  - Cerrado

3) Módulo Cliente (/customer)

- Menú por categorías:

  - Entradas, Platos fuertes, Bebidas, Postres, Para llevar

- Cards de producto: foto mock, nombre, precio, botón “Agregar”

- Carrito lateral:

  - items, subtotal, total

  - datos cliente: nombre, teléfono, dirección

  - botón “Crear pedido”

- Al crear:

  - estado operativo inicial: created

  - mostrar confirmación

4) Módulo POS (/pos)

- Estilo operativo/caja moderno.

- Columnas:

  - Nuevos

  - Preparando

  - Listos para entregar

  - Cerrados

- Card de pedido:

  - ID, cliente, sucursal, items, total, hora

- Acciones:

  - Confirmar (created -> confirmed)

  - Preparar (confirmed -> preparing)

  - Marcar listo (preparing -> ready)

  - Asignar rider (ready + driver seleccionado -> out_for_delivery)

- Selector de repartidor.

5) Módulo Driver (/driver)

- Lista de pedidos asignados al driver activo.

- Filtros:

  - Pendientes (created/confirmed/preparing/ready)

  - En ruta (out_for_delivery)

  - Completados (delivered/cancelled)

- Detalle:

  - cliente, teléfono, dirección, total, sucursal

- Botones:

  - Marcar salida (ready -> out_for_delivery)

  - Marcar entregado (out_for_delivery -> delivered)

  - Reportar incidencia (created/confirmed -> cancelled, opcional)

- Badges claros por estado.

6) Vista Backoffice/ERP mock (/erp)

- Tabla administrativa:

  - order_id, restaurant_id, customer_name, total, status_operativo, status_pos, driver, updated_at

- Auditoría:

  - lista de eventos con timestamp + trace_id mock

- Mostrar separación clara:

  - status_operativo (delivery): created/confirmed/preparing/ready/out_for_delivery/delivered/cancelled

  - status_pos (caja/contable): draft/paid/cancel

REGLAS DE ESTADO (OBLIGATORIAS)

- created -> confirmed

- confirmed -> preparing

- preparing -> ready

- ready -> out_for_delivery

- out_for_delivery -> delivered

- created -> cancelled

- confirmed -> cancelled

- Bloquear transiciones inválidas + toast de error.

DATOS MOCK

- 1 restaurante mexicano

- 10-15 productos mock por categorías

- 1 driver mock: driver_01 Luis

- 3-5 pedidos iniciales para que la UI se vea viva

UX

- “Autoplay flujo” crea/avanza pedidos automáticamente cada pocos segundos y resalta módulo impactado.

- Toasts en cada transición.

- Colores consistentes por estado.

- Mobile responsive (en móvil, paneles del Hub como tabs).

NO HACER (después)

- No autenticación real

- No API real

- No DB externa

- No features fuera del flujo principal