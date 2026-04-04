# Prompt - TallerOS

Usa este prompt para generar una web app navegable en Lovable, Bolt o v0.

---

## Prompt

Desarrolla esta web app:

# TallerOS - Sistema de Gestion para Talleres Mecanicos

Aplicacion web para gestionar el ciclo completo de un vehiculo en el taller: recepcion, diagnostico, cotizacion, reparacion y entrega al cliente.

La aplicacion debe ser 100% navegable utilizando datos mock en memoria.

En fases posteriores se integrara:

- Supabase para persistencia de datos
- Autenticacion real de usuarios
- Notificaciones WhatsApp automaticas
- Facturacion CFDI
- Pagos online

## Contexto del negocio

TallerOS es el sistema operativo interno de un taller mecanico moderno.

Permite gestionar:

- recepcion e ingreso de vehiculos
- diagnostico y cotizacion
- ordenes de trabajo y asignacion de mecanicos
- seguimiento de reparaciones
- inventario basico de refacciones
- historial de vehiculos y clientes
- entrega y cobro

Tagline:

`TallerOS - El taller bajo control`

La plataforma representa el sistema interno de operacion del taller.

## Objetivo

Implementar el flujo completo de un vehiculo en el taller para tres roles:

`Admin -> Mecanico -> Cliente`

Flujo operativo:

1. Cliente llega o agenda. Recepcion registra el vehiculo.
2. Mecanico realiza diagnostico y registra hallazgos con fotos.
3. Sistema genera cotizacion. Cliente aprueba.
4. Mecanico ejecuta la reparacion y consume refacciones del inventario.
5. Admin revisa y marca la orden como lista.
6. Cliente recibe notificacion. Paga y recoge el vehiculo.
7. Orden se cierra. Historial queda registrado por placa.

## Requisitos generales

- Todo debe funcionar solo con frontend y estado mock.
- Usar store global reactivo.
- Persistir datos en `localStorage`.
- Incluir boton de reset para volver al estado inicial de demo.
- Validar transiciones de estado.
- Mostrar feedback visual con toast en acciones importantes.
- Diseno responsive mobile y desktop.
- Interfaz moderna, limpia y operativa. Estilo industrial/tecnico con colores oscuros y acentos naranjas.

## Rutas obligatorias

### `/`

Landing publica del taller.

Debe mostrar:

- nombre del negocio
- servicios ofrecidos
- descripcion breve
- boton agendar / traer mi auto

### `/auth`

Pantalla de login mock.

Debe permitir entrar como:

- Admin
- Mecanico
- Cliente

### `/home`

Redireccion automatica segun rol.

| Rol | Redireccion |
| --- | --- |
| Admin | `/hub` |
| Mecanico | `/mecanico` |
| Cliente | `/cliente` |

### `/hub`

Panel administrativo del taller.

Funciones:

- ver todas las ordenes activas
- ver ordenes del dia (kanban por estado)
- gestionar mecanicos
- gestionar inventario de refacciones
- crear orden manual
- ver historial de vehiculos por placa
- dashboard de ingresos del dia

### `/mecanico`

Aplicacion operativa para mecanicos.

Permite:

- ver ordenes asignadas
- registrar diagnostico con notas
- marcar inicio de reparacion
- registrar refacciones utilizadas
- marcar reparacion completada

### `/cliente`

Vista del cliente.

Permite:

- ver estado actual de su vehiculo (tipo "rastreo de paquete")
- ver cotizacion y aprobarla
- ver historial de servicios por placa
- agendar proxima visita

### `/tracker/:orden_id`

Vista publica de seguimiento (sin login).

Muestra:

- estado actual del vehiculo con barra de progreso visual
- nombre del vehiculo / placa
- ultimo evento registrado
- hora estimada de entrega

### `/settings`

Configuracion de perfil.

Incluye:

- nombre
- rol
- informacion basica

## Sistema de roles

### Admin

Acceso completo al sistema.

Puede:

- ver y gestionar todas las ordenes
- asignar mecanicos
- gestionar inventario
- ver reportes de ingresos
- cerrar ordenes y registrar cobro

### Mecanico

Acceso limitado a:

- ordenes asignadas
- registro de diagnostico
- ejecucion de la reparacion
- consumo de refacciones

### Cliente

Acceso a:

- estado en tiempo real de su vehiculo
- aprobar o rechazar cotizacion
- historial de servicios

## Estructura de datos

El sistema debe manejar estado global para:

- ordenes de trabajo
- vehiculos
- clientes
- mecanicos
- refacciones (inventario)
- eventos por orden

Todos los datos iniciales deben generarse como mock data en memoria.

Persistencia mock usando:

- `localStorage`

## Entidades principales

### Ordenes de trabajo

Cada orden incluye:

- id
- vehiculo (placa, marca, modelo, anio, color)
- cliente
- mecanico asignado
- descripcion del problema reportado por el cliente
- diagnostico del mecanico
- lista de servicios a realizar
- refacciones utilizadas
- cotizacion (monto total)
- estado_cotizacion: `pending` | `approved` | `rejected`
- estado: ver estados de orden
- eventos (historial)
- fecha de ingreso
- hora estimada de entrega
- monto final cobrado

### Vehiculos

Informacion de cada vehiculo:

- id
- placa
- marca
- modelo
- anio
- color
- cliente_id
- historial de ordenes

### Clientes

Informacion de cada cliente:

- id
- nombre
- telefono
- vehiculos registrados

### Mecanicos

Informacion de cada mecanico:

- id
- nombre
- especialidad
- activo

### Refacciones (Inventario)

Cada refaccion incluye:

- id
- nombre
- stock disponible
- precio unitario
- categoria (Motor, Frenos, Electrico, Suspension, General)

## Estados de la orden

Estados posibles:

- `received` - Vehiculo ingresado al taller
- `diagnosing` - Mecanico realizando diagnostico
- `quoted` - Cotizacion enviada al cliente
- `approved` - Cliente aprobo la cotizacion
- `in_repair` - Reparacion en proceso
- `ready` - Vehiculo listo para entregar
- `delivered` - Vehiculo entregado y cobrado
- `cancelled` - Orden cancelada

## Transiciones de estado

Transiciones validas:

- `received -> diagnosing`
- `diagnosing -> quoted`
- `quoted -> approved` (accion del cliente)
- `quoted -> cancelled` (cliente rechaza)
- `approved -> in_repair`
- `in_repair -> ready`
- `ready -> delivered`
- `received -> cancelled`

Transiciones invalidas deben bloquearse y mostrar toast de error.

## Eventos de orden

Cada orden mantiene historial de eventos con timestamp:

- vehiculo ingresado
- diagnostico registrado
- cotizacion enviada
- cotizacion aprobada / rechazada
- reparacion iniciada
- refaccion utilizada (nombre + cantidad)
- reparacion completada
- vehiculo entregado

## Modulo cliente (`/cliente`)

### Tracker de vehiculo

Vista principal: barra de progreso visual con los pasos del flujo.

```
Recibido -> Diagnostico -> Cotizacion -> En reparacion -> Listo -> Entregado
```

Cada paso muestra:

- icono del estado
- fecha/hora del evento
- descripcion breve

### Cotizacion

Cuando el estado es `quoted`:

- Mostrar lista de servicios y refacciones
- Mostrar monto total
- Boton: Aprobar cotizacion
- Boton: Rechazar cotizacion

### Historial

Lista de servicios pasados por placa.

Incluye:

- descripcion del servicio
- mecanico
- fecha
- monto cobrado

## Modulo mecanico (`/mecanico`)

El mecanico ve solo sus ordenes asignadas.

### Lista de ordenes

Filtros:

- Activas
- Completadas

Cada orden incluye:

- placa + vehiculo
- problema reportado
- estado actual

### Acciones disponibles segun estado

- Iniciar diagnostico: `received -> diagnosing`
- Guardar diagnostico y generar cotizacion: `diagnosing -> quoted`
- Iniciar reparacion: `approved -> in_repair`
- Registrar refacciones utilizadas (descontar del inventario)
- Marcar reparacion completada: `in_repair -> ready`

### Registro de refacciones

Al marcar refacciones utilizadas:

- Selector de refaccion del inventario
- Cantidad utilizada
- El stock se descuenta en tiempo real
- Se agrega al evento de la orden

## Modulo admin (`/hub`)

Panel operativo completo.

### Kanban de ordenes

Columnas por estado:

- Recibidos
- Diagnosticando
- Cotizados
- En reparacion
- Listos
- Entregados

Cada card muestra:

- placa + vehiculo
- cliente
- mecanico asignado
- hora de ingreso
- monto cotizado (si aplica)

### Dashboard del dia

Metricas en tiempo real:

- vehiculos activos en taller
- ordenes cerradas hoy
- ingresos del dia
- refacciones con stock bajo (menos de 3 unidades)

### Gestion de inventario

Tabla de refacciones con:

- nombre
- stock actual
- precio
- categoria
- boton agregar stock

### Historial por placa

Buscar placa -> ver todas las ordenes historicas del vehiculo.

### Asignar mecanico

Desde cualquier orden en estado `received` o `diagnosing`, el admin puede asignar o reasignar mecanico.

## Reglas de negocio

- Una orden debe tener vehiculo, cliente y descripcion del problema para crearse.
- La cotizacion debe ser aprobada por el cliente antes de iniciar la reparacion.
- Solo se pueden registrar refacciones si hay stock disponible.
- El stock se descuenta en tiempo real al registrar una refaccion.
- La orden solo puede marcarse como `ready` si paso por `in_repair`.
- El tracker publico (`/tracker/:orden_id`) es accesible sin login.

## Datos mock iniciales

Taller:

`TallerOS Demo - Taller Mecanico`

### Mecanicos

- `mec_01` - Carlos Ruiz (Motor y Transmision)
- `mec_02` - Luis Hernandez (Electrico y Electronico)
- `mec_03` - Andres Morales (Frenos y Suspension)

### Clientes

- `cli_01` - Juan Garcia | Tel: 5512345678
- `cli_02` - Maria Lopez | Tel: 5598765432
- `cli_03` - Roberto Torres | Tel: 5567891234
- `cli_04` - Ana Mendoza | Tel: 5543219876

### Vehiculos

- Placa `ABC-123` - Nissan Sentra 2019 (gris) - Juan Garcia
- Placa `XYZ-456` - Toyota Corolla 2021 (blanco) - Maria Lopez
- Placa `DEF-789` - Volkswagen Jetta 2018 (negro) - Roberto Torres
- Placa `GHI-012` - Chevrolet Aveo 2020 (rojo) - Ana Mendoza

### Inventario inicial

- Filtro de aceite | stock: 12 | $85 MXN | Motor
- Aceite motor 5W-30 (1L) | stock: 20 | $120 MXN | Motor
- Pastillas de freno delanteras | stock: 6 | $450 MXN | Frenos
- Bujias (juego 4) | stock: 8 | $380 MXN | Motor
- Filtro de aire | stock: 5 | $210 MXN | Motor
- Correa de distribucion | stock: 2 | $890 MXN | Motor
- Amortiguador delantero | stock: 4 | $1,200 MXN | Suspension
- Bateria 60Ah | stock: 3 | $1,800 MXN | Electrico

### Ordenes iniciales

Genera 5 ordenes en distintos estados para que el kanban se vea vivo:

- 1 orden en `received`
- 1 orden en `diagnosing`
- 1 orden en `quoted` (con cotizacion lista, esperando aprobacion del cliente)
- 1 orden en `in_repair` (con refacciones ya registradas)
- 1 orden en `ready` (lista para entregar)

## UX

La aplicacion debe incluir:

- barra de progreso visual en el tracker del cliente
- badges de estado con colores consistentes (naranja para activo, verde para listo, gris para cerrado)
- kanban en el hub admin
- feedback con toast en cada transicion
- responsive mobile (en movil el kanban colapsa a lista filtrable)
- cards escaneables con info clave visible sin abrir detalle
- alerta visual cuando el stock de una refaccion baja de 3 unidades

## Objetivo final

Construir una aplicacion web completamente navegable que permita ejecutar el flujo completo de un vehiculo en el taller mecanico utilizando datos mock en memoria, con tres roles diferenciados y un tracker publico accesible sin login.

## Restricciones tecnicas

- No implementar backend real.
- No depender de APIs externas.
- No dejar pantallas vacias.
- Incluir datos seed y navegacion funcional entre todas las rutas.
- Cualquier accion importante debe reflejarse en la UI inmediatamente.

## Nota importante para la landing

Para elevar la calidad visual de la landing, prioriza generar imagenes propias con modelos de Gemini cuando la herramienta lo permita, especialmente para hero sections, mockups conceptuales y escenas de taller mecanico moderno.

Si no es viable generar imagenes dentro del flujo, usar una libreria externa como Pexels para poblar la landing con fotos consistentes de talleres, mecanicos, herramientas y vehiculos.

La landing no debe depender solo de bloques de color o placeholders genericos. Necesita apoyo visual real desde la primera version.
