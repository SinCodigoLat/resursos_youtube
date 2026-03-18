# Prompt - BarberOS

Usa este prompt para generar una web app navegable en Lovable, Bolt o v0.

---

## Prompt

Desarrolla esta web app:

# Plataforma BarberOS - Gestion de Citas para Barberia

Aplicacion web para gestionar el ciclo completo de reservas de clientes en una barberia: agenda, asignacion de barberos, ejecucion del servicio y registro del historial del cliente.

La aplicacion debe ser 100% navegable utilizando datos mock en memoria.

En fases posteriores se integrara:

- Supabase para persistencia de datos
- Autenticacion real de usuarios
- Notificaciones WhatsApp / SMS
- Pagos online

## Contexto del negocio

BarberOS es el sistema operativo interno de una barberia moderna.

Permite gestionar:

- reservas de clientes
- agenda de barberos
- ejecucion del servicio
- historial de clientes
- control de servicios realizados

Tagline:

`BarberOS - Sistema de gestion para barberias`

La plataforma representa el sistema interno de operacion de la barberia.

## Objetivo

Implementar el flujo completo de una reserva para tres roles:

`Admin -> Barbero -> Cliente`

Flujo operativo:

1. Cliente agenda cita.
2. Sistema asigna barbero o valida horario.
3. Barbero ejecuta el servicio.
4. Se registra el servicio realizado.
5. Cliente confirma el servicio.
6. La cita se marca como completada.

## Requisitos generales

- Todo debe funcionar solo con frontend y estado mock.
- Usar store global reactivo.
- Persistir datos en `localStorage`.
- Incluir boton de reset para volver al estado inicial de demo.
- Validar transiciones de estado.
- Mostrar feedback visual con toast en acciones importantes.
- Diseno responsive mobile y desktop.
- Interfaz moderna para barberia: limpia, premium, operativa.

## Rutas obligatorias

### `/`

Landing publica de la barberia.

Debe mostrar:

- nombre del negocio
- servicios ofrecidos
- descripcion breve
- boton reservar cita

### `/auth`

Pantalla de login / registro mock.

Debe permitir entrar como:

- Admin
- Barbero
- Cliente

### `/home`

Redireccion automatica segun rol.

| Rol | Redireccion |
| --- | --- |
| Admin | `/hub` |
| Barbero | `/barber` |
| Cliente | `/customer` |

### `/hub`

Panel administrativo.

Funciones:

- ver agenda completa
- ver citas del dia
- gestionar barberos
- gestionar servicios
- gestionar clientes
- crear cita manual
- reprogramar citas
- cancelar citas

### `/barber`

Aplicacion operativa para barberos.

Permite:

- ver citas asignadas
- iniciar servicio
- registrar notas
- marcar servicio completado
- consultar historial del cliente

### `/customer`

Vista del cliente.

Permite:

- ver proximas citas
- reservar cita
- ver historial de servicios

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

- ver agenda completa
- gestionar citas
- gestionar barberos
- gestionar servicios
- gestionar clientes

### Barbero

Acceso limitado a:

- citas asignadas
- control del servicio
- registro de notas
- historial del cliente

### Cliente

Acceso a:

- reservar citas
- ver proximas citas
- ver historial de servicios

## Estructura de datos

El sistema debe manejar estado global para:

- citas
- barberos
- clientes
- servicios
- sesiones de usuario

Todos los datos iniciales deben generarse como mock data en memoria.

Persistencia mock usando:

- `localStorage`

## Entidades principales

### Servicios

Lista de servicios disponibles.

Ejemplo:

- Corte clasico
- Fade
- Corte + barba
- Afeitado clasico
- Corte premium

Cada servicio incluye:

- id
- nombre
- duracion estimada
- precio
- descripcion corta

### Barberos

Informacion de cada barbero:

- id
- nombre
- especialidad
- horario disponible
- activo

### Clientes

Informacion de cada cliente:

- id
- nombre
- telefono
- historial de citas

### Citas

Cada cita incluye:

- id
- cliente
- barbero
- servicio
- fecha
- hora
- duracion
- estado
- notas del barbero
- eventos

## Estados de cita

Estados posibles:

- `scheduled`
- `in_service`
- `completed`
- `cancelled`
- `no_show`

## Transiciones de estado

Transiciones validas:

- `scheduled -> in_service`
- `in_service -> completed`
- `scheduled -> cancelled`
- `scheduled -> no_show`

Transiciones invalidas deben bloquearse y mostrar toast de error.

## Eventos de cita

Cada cita mantiene historial de eventos:

- cita creada
- barbero asignado
- servicio iniciado
- servicio finalizado
- cliente confirmado

## Modulo cliente (`/customer`)

Permite reservar citas.

Flujo:

1. Seleccionar servicio.
2. Seleccionar barbero.
3. Seleccionar fecha.
4. Seleccionar hora disponible.
5. Confirmar cita.

Vista cliente incluye:

### Proximas citas

Cada cita muestra:

- servicio
- barbero
- fecha y hora
- estado

### Historial

Lista de servicios pasados.

Incluye:

- servicio realizado
- barbero
- fecha
- notas del barbero

## Modulo barbero (`/barber`)

El barbero ve solo sus citas.

### Agenda del dia

Listado de citas asignadas.

Cada cita incluye:

- cliente
- servicio
- hora
- estado

### Acciones disponibles

Segun estado:

- Iniciar servicio: `scheduled -> in_service`
- Finalizar servicio: `in_service -> completed`

### Registro de notas

Barbero puede registrar:

- notas del servicio
- recomendaciones para el cliente

## Modulo admin (`/hub`)

Panel operativo completo.

### Secciones

#### Agenda global

Vista calendario simple con:

- citas del dia
- barberos
- horarios disponibles

#### Gestion de citas

Acciones:

- crear cita manual
- reprogramar
- cancelar

#### Gestion de barberos

Permite:

- agregar barberos
- editar horarios
- activar / desactivar

#### Gestion de servicios

Permite:

- crear servicios
- editar duracion
- editar precio

#### Gestion de clientes

Permite:

- ver historial
- editar informacion basica
- consultar proximas citas

## Reglas de negocio

- Una cita debe tener cliente, servicio, barbero y horario disponible.
- Un barbero no puede tener dos citas simultaneas.
- La duracion del servicio determina el bloque de agenda ocupado.
- No se deben mostrar horarios ocupados en el flujo de reserva.
- La cita solo puede marcarse como completada si ya paso por `in_service`.

## Datos mock iniciales

Barberia:

`BarberOS Demo Shop`

### Barberos

- `barber_01` - Carlos
- `barber_02` - Luis
- `barber_03` - Andres

### Clientes

- `cliente_01`
- `cliente_02`
- `cliente_03`
- `cliente_04`

### Servicios

- Corte clasico
- Fade
- Corte + barba
- Afeitado clasico
- Corte premium

### Citas iniciales

Genera entre 3 y 6 citas en distintos estados:

- `scheduled`
- `in_service`
- `completed`

## UX

La aplicacion debe incluir:

- badges de estado claros
- agenda visual simple
- feedback con toast
- responsive mobile
- cards y listas faciles de escanear
- dashboard claro para admin y barbero

## Objetivo final

Construir una aplicacion web completamente navegable que permita ejecutar el flujo completo de una reserva en barberia utilizando datos mock en memoria.

## Restricciones tecnicas

- No implementar backend real.
- No depender de APIs externas.
- No dejar pantallas vacias.
- Incluir datos seed y navegacion funcional entre todas las rutas.
- Cualquier accion importante debe reflejarse en la UI inmediatamente.

## Nota importante para la landing

Para elevar la calidad visual de la landing, prioriza generar imagenes propias con modelos de Gemini 3 cuando la herramienta lo permita, especialmente para hero sections, mockups conceptuales y escenas de barberia moderna.

Si no es viable generar imagenes dentro del flujo, usar una libreria externa como Pexels para poblar la landing con fotos consistentes de barberias, cortes, herramientas y clientes.

La landing no debe depender solo de bloques de color o placeholders genericos. Necesita apoyo visual real desde la primera version.
