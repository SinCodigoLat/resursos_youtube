# PRD

## Plataforma CasaLista - Gestion de Servicios a Domicilio

Aplicacion web para gestionar el ciclo completo de un servicio tecnico en domicilio: asignacion, ejecucion en campo, registro operativo y validacion del cliente.

La aplicacion debe ser 100% navegable utilizando datos mock en memoria.

En fases posteriores se integrara:

- Supabase para persistencia de datos
- Autenticacion real de usuarios
- Posible integracion de pagos

## Contexto Del Negocio

CasaLista es una empresa ficticia que ofrece servicios a domicilio como:

- plomeria
- electricidad
- reparaciones del hogar
- mantenimiento general
- instalacion de equipos

Tagline:

`CasaLista - Servicios a domicilio`

La plataforma representa el sistema interno de operacion de la empresa.

## Objetivo

Implementar el flujo completo de un servicio a domicilio para tres roles:

`Admin -> Tecnico -> Cliente`

Flujo operativo:

1. Admin crea o asigna una orden.
2. Tecnico ejecuta el servicio en casa del cliente.
3. Tecnico registra tiempo, materiales y notas.
4. Cliente revisa el trabajo realizado.
5. Cliente firma conformidad.
6. El servicio se cierra.

## Rutas Del Sistema

### `/`

Landing page publica de la empresa CasaLista.

Debe mostrar:

- nombre del negocio
- servicios ofrecidos
- descripcion breve de la empresa
- servicios dummy para demo

### `/auth`

Pantalla de acceso y registro de usuarios.

### `/home`

Redireccion automatica segun rol del usuario autenticado.

| Rol | Redireccion |
| --- | --- |
| Admin | `/hub` |
| Tecnico | `/technician` |
| Cliente | `/customer` |

### `/hub`

Panel operativo del Admin.

Funciones principales:

- ver todas las ordenes
- asignar tecnicos
- visualizar estado de servicios
- gestionar clientes
- gestionar materiales

### `/technician`

Aplicacion operativa para tecnicos en campo.

Permite:

- ver ordenes asignadas
- iniciar servicio
- pausar o reanudar
- registrar materiales
- agregar notas
- solicitar firma del cliente
- finalizar servicio

### `/customer`

Vista del cliente para revisar el servicio realizado.

Permite:

- ver resumen del servicio
- revisar materiales y tiempo registrado
- confirmar el trabajo realizado
- firmar digitalmente

### `/settings`

Configuracion del perfil del usuario.

Incluye:

- nombre
- rol
- informacion basica

## Sistema De Roles

### Admin

Acceso completo al sistema.

Puede:

- ver todas las ordenes
- asignar tecnicos
- gestionar clientes
- gestionar materiales
- visualizar estados de servicio

### Tecnico

Acceso limitado a:

- ordenes asignadas
- control de tiempo del servicio
- registro de trabajo realizado
- registro de materiales
- solicitud de firma del cliente

### Cliente

Acceso unicamente a:

- servicios asociados a su cuenta
- resumen del trabajo realizado
- confirmacion y firma del servicio

## Estructura De Datos

El sistema debe manejar estado global para:

- ordenes
- tecnicos
- clientes
- materiales
- sesiones de usuario

Todos los datos iniciales deben generarse como mock data en memoria.

## Eventos De Servicio

Cada servicio mantiene un historial de eventos:

- servicio asignado
- trabajo iniciado
- trabajo pausado
- trabajo reanudado
- material registrado
- firma capturada
- servicio cerrado

## Modulo Tecnico (`/technician`)

El tecnico solo puede interactuar con sus ordenes asignadas.

### Servicios Asignados

Listado de ordenes asignadas al tecnico autenticado.

Cada orden incluye:

- cliente
- direccion
- estado
- prioridad

### Control De Tiempo

Acciones disponibles segun estado del servicio:

- `Iniciar`: cambia estado a `in_progress`
- `Pausar`: cambia estado a `paused`
- `Reanudar`: vuelve a `in_progress`
- `Finalizar`: detiene el registro de tiempo

### Registro De Trabajo

Permite registrar:

- checklist de tareas
- notas tecnicas

### Registro De Materiales

Permite registrar:

- material utilizado
- cantidad
- nota opcional

### Cierre Del Servicio

Condiciones obligatorias para cerrar:

- al menos un registro de tiempo
- checklist completado
- firma del cliente capturada

Una vez cerrado el servicio:

- no se permiten modificaciones

## Vista Cliente (`/customer`)

El cliente puede:

- ver resumen del servicio
- ver registros de tiempo
- ver materiales utilizados
- confirmar conformidad
- firmar digitalmente

Datos registrados en la firma:

- firma digital
- nombre del firmante
- timestamp automatico

## Reglas De Estado

Estados posibles del servicio:

- `assigned`
- `in_progress`
- `paused`
- `completed`
- `cancelled`

Transiciones validas:

- `assigned -> in_progress`
- `in_progress -> paused`
- `paused -> in_progress`
- `in_progress -> completed`
- `assigned -> cancelled`

Las transiciones invalidas deben bloquearse.

## Datos Mock Iniciales

### Empresa

`CasaLista - Servicios a domicilio`

### Operadores

- `op_01 - Carlos`
- `op_02 - Maria`

### Clientes

- `cliente_01`
- `cliente_02`
- `cliente_03`

### Servicios Activos

3 a 5 ordenes iniciales en diferentes estados.

### Materiales

Lista de 10 materiales basicos para reparaciones.

Ejemplo:

- tornillos
- cables
- tuberia PVC
- interruptores
- cinta aislante
- sellador
- valvulas
- etc.

## Objetivo Final

Construir una aplicacion web completamente navegable y funcional para los 3 roles que permita ejecutar el flujo completo de un servicio a domicilio utilizando datos mock en memoria.
