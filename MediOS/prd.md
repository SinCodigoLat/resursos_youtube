Desarrolla esta web app:

# MediOS - Sistema de Gestion para Clinicas

Aplicacion web para gestionar el ciclo completo de una clinica medica: agendamiento de citas, gestion de pacientes, cobros y reportes operativos.

La aplicacion debe ser 100% navegable utilizando datos mock en memoria.

En fases posteriores se integrara:

- Supabase para persistencia de datos
- Autenticacion real de usuarios
- Notificaciones WhatsApp / SMS (recordatorios de cita)
- Pagos online
- Integracion con calendarios externos

## Contexto del negocio

MediOS es el sistema operativo interno de una clinica medica moderna.

Los EHR (Electronic Health Records) tradicionales cuestan $300-$800/mes por doctor, tienen interfaces obsoletas, cobran miles de dolares por exportar tus datos y obligan a los doctores a pasar mas tiempo frente a la computadora que con sus pacientes.

MediOS es la alternativa: simple, rapido, y los datos son tuyos.

Tagline:

`MediOS - Tu clinica. Tus datos. Tu sistema.`

## Objetivo

Implementar el flujo completo de una cita medica para tres roles:

`Admin/Gestor -> Doctor -> Paciente`

Flujo operativo:

1. Paciente agenda cita (link publico o admin la crea).
2. Sistema envia recordatorio 24h antes (placeholder).
3. Paciente llega, doctor lo atiende.
4. Doctor registra notas de la consulta.
5. Admin/Doctor cobra la consulta.
6. La cita se marca como completada.

## Requisitos generales

- Todo debe funcionar solo con frontend y estado mock.
- Usar store global reactivo.
- Persistir datos en `localStorage`.
- Incluir boton de reset para volver al estado inicial de demo.
- Validar transiciones de estado.
- Mostrar feedback visual con toast en acciones importantes.
- Diseno responsive mobile y desktop.
- Interfaz moderna para salud: limpia, confiable, profesional.
- Paleta de colores: Azul medico (#2563EB), blanco (#FFFFFF), gris claro (#F8FAFC), verde exito (#22C55E), rojo alerta (#EF4444).

## Arquitectura de rutas y navegacion

IMPORTANTE: Esta app usa POCAS rutas con TABS internos para organizar el contenido. Cada tab debe ser una vista limpia con UNA sola responsabilidad. No apilar multiples secciones verticalmente en una misma vista. Cada tab ocupa todo el espacio disponible.

### Rutas

| Ruta | Acceso | Descripcion |
| --- | --- | --- |
| `/` | Publico | Landing de la clinica |
| `/booking` | Publico | Flujo de agendamiento paso a paso |
| `/auth` | Publico | Login mock con selector de rol |
| `/hub` | Admin | Panel administrativo con tabs |
| `/doctor` | Doctor | Panel del doctor con tabs |
| `/patient` | Paciente | Portal del paciente con tabs |

NO crear rutas adicionales. Todo el contenido vive dentro de tabs en las 3 rutas principales (`/hub`, `/doctor`, `/patient`).

### Navegacion por tabs

#### `/hub` - Panel Admin

Sidebar izquierdo fijo con iconos + labels. Al hacer click cambia el contenido principal.

Tabs:

| Tab | Icono | Contenido |
| --- | --- | --- |
| Dashboard | LayoutDashboard | KPIs, grafica, alertas |
| Agenda | Calendar | Calendario global de todos los doctores |
| Doctores | UserCog | Lista, agregar, editar horarios |
| Pacientes | Users | Buscar, ver perfil, historial |
| Cobros | CreditCard | Tabla de cobros con filtros |
| Reportes | BarChart3 | Metricas e ingresos |
| Configuracion | Settings | Datos de la clinica |

Layout: sidebar (64px colapsado / 240px expandido) + area principal. El sidebar se colapsa en mobile a bottom nav con iconos.

#### `/doctor` - Panel Doctor

Tabs superiores (horizontal tab bar):

| Tab | Contenido |
| --- | --- |
| Mi Dia | Agenda del dia + card proximo paciente |
| Consulta | Vista de consulta activa (notas, perfil paciente, cobro) |
| Mis Pacientes | Lista de pacientes que ha atendido, con historial |

En mobile los tabs son swipeables.

#### `/patient` - Portal Paciente

Tabs superiores (horizontal tab bar):

| Tab | Contenido |
| --- | --- |
| Mis Citas | Proximas citas + boton agendar nueva |
| Historial | Consultas pasadas |
| Pagos | Recibos y estado de pagos |

## Landing (`/`)

Debe mostrar:

- Hero: nombre de la clinica + tagline + boton "Agendar Cita" grande
- Seccion especialidades: cards con icono, nombre, descripcion breve
- Seccion doctores: cards con foto, nombre, especialidad
- Seccion "Por que MediOS": 3 cards (tus datos son tuyos, sin contratos, simple de usar)
- Testimonios mock de pacientes (3 cards con foto, nombre, texto)
- Footer con datos de contacto

Para imagenes usar URLs de Unsplash con busquedas como "doctor portrait", "modern clinic", "dental office". No usar placeholders genericos.

## Booking publico (`/booking`)

Flujo paso a paso con stepper visual (barra de progreso arriba):

**Paso 1 - Especialidad**
Cards grandes con icono y nombre. Click selecciona y avanza.

**Paso 2 - Doctor**
Cards con foto, nombre, especialidad, proximos 3 horarios disponibles. Click selecciona y avanza.

**Paso 3 - Fecha y hora**
Calendario visual a la izquierda. Slots de hora como botones a la derecha. Dias sin disponibilidad deshabilitados. Horarios ocupados no se muestran.

**Paso 4 - Datos del paciente**
Formulario: nombre, telefono, email, motivo de consulta (textarea breve).

**Paso 5 - Confirmacion**
Resumen completo de la cita. Boton "Confirmar Cita". Al confirmar: toast de exito + pantalla de confirmacion con detalle.

Boton "Atras" en cada paso. No permitir agendar en el pasado.

## Auth (`/auth`)

Pantalla centrada con card de login.

Selector visual de rol (3 cards grandes):

- Admin (icono Shield) - "Gestiona la clinica"
- Doctor (icono Stethoscope) - "Atiende pacientes"
- Paciente (icono User) - "Agenda y consulta"

Click en rol + boton "Entrar" redirige a la ruta correspondiente.

## Panel Admin - `/hub`

### Tab: Dashboard

Fila superior de 5 KPI cards:

- Citas hoy (numero + icono Calendar)
- Completadas (numero + icono CheckCircle)
- No-shows (numero + icono XCircle)
- Ingresos hoy (monto + icono DollarSign)
- Pacientes nuevos (numero + icono UserPlus)

Debajo:

- Grafica de barras: citas por dia (ultimos 7 dias)
- Lista de alertas: citas sin confirmar, cobros pendientes

### Tab: Agenda

Vista de calendario por dia o semana (toggle).

Muestra citas de todos los doctores con codigo de color por doctor.

Click en cita abre modal con:

- detalle completo
- botones de accion segun estado (confirmar, cancelar, marcar no-show)

Boton "Nueva Cita" abre modal con formulario rapido (paciente, doctor, fecha, hora, servicio).

### Tab: Doctores

Tabla o grid de cards con:

- foto
- nombre
- especialidad
- estado (activo/inactivo) con toggle
- horario resumido
- stats: citas esta semana, no-shows

Boton "Agregar Doctor" abre modal con formulario (nombre, especialidad, horario por dia, foto URL).

Click en doctor abre detalle con edicion de horarios.

### Tab: Pacientes

Barra de busqueda prominente (por nombre o telefono).

Tabla de pacientes con:

- nombre
- telefono
- ultima visita
- balance pendiente

Click en paciente abre perfil con:

- datos personales
- historial de citas (lista)
- cobros asociados
- boton "Crear Cita" para este paciente

### Tab: Cobros

Tabla con columnas:

- fecha
- paciente
- doctor
- servicio
- monto
- estado (badge: paid verde, pending amarillo, cancelled rojo)
- metodo de pago

Filtros en la parte superior:

- estado (todos, pending, paid, cancelled)
- rango de fechas
- doctor (select)

### Tab: Reportes

4 cards de metricas:

- Ingresos del mes (numero grande)
- Tasa de no-show (porcentaje)
- Doctor mas activo (nombre + numero de consultas)
- Horario mas demandado (rango de hora)

Debajo:

- Grafica de barras: ingresos por semana (ultimo mes)
- Grafica circular: citas completadas vs no-shows vs canceladas

### Tab: Configuracion

Formulario editable:

- Nombre de la clinica
- Direccion
- Telefono
- Email
- Horario de atencion (apertura, cierre)
- Duracion default por especialidad

Boton "Guardar" con toast de confirmacion.

## Panel Doctor - `/doctor`

### Tab: Mi Dia

**Seccion superior**: Card destacada "Proximo Paciente"

- nombre del paciente
- edad
- motivo de consulta
- hora de la cita
- historial breve (ultima visita si existe)
- boton "Iniciar Consulta" (cambia estado a `in_progress` y lleva a tab Consulta)

**Seccion inferior**: Lista cronologica del dia

Cada cita como card horizontal:

- hora
- nombre paciente
- motivo
- badge de estado
- accion segun estado (iniciar, marcar no-show)

### Tab: Consulta

Esta tab muestra la consulta activa (cita en estado `in_progress`).

Si no hay consulta activa: mensaje "No hay consulta en curso. Inicia una desde Mi Dia."

Si hay consulta activa, layout de 2 columnas en desktop (1 columna en mobile):

**Columna izquierda - Paciente:**

- nombre, edad, telefono, email
- historial: lista de consultas anteriores (fecha, doctor, servicio, notas)

**Columna derecha - Consulta actual:**

- servicio y motivo
- textarea "Notas de la consulta" (autoguardado en store)
- boton "Completar Consulta" (cambia estado a `completed`)
- boton "Cobrar" (abre modal de cobro rapido)

**Modal de cobro rapido:**

- monto prellenado con precio del servicio
- selector metodo: efectivo, tarjeta, transferencia
- notas opcionales
- boton "Confirmar Cobro"
- al confirmar: crea cobro como `paid`, toast de exito, cierra modal

### Tab: Mis Pacientes

Lista de todos los pacientes que este doctor ha atendido.

Cada paciente como card:

- nombre
- ultima visita
- total de consultas

Click abre perfil con historial de consultas (solo las de este doctor).

## Portal Paciente - `/patient`

### Tab: Mis Citas

**Seccion superior**: Boton "Agendar Nueva Cita" (redirige a `/booking`).

**Lista de proximas citas** (estado scheduled o confirmed):

Card por cita:

- doctor (nombre + foto)
- especialidad
- fecha y hora
- estado con badge
- boton "Cancelar" (si scheduled o confirmed, abre confirmacion)
- boton "Reagendar" (abre modal para seleccionar nueva fecha/hora)

Si no hay citas: mensaje "No tienes citas programadas" + boton agendar.

### Tab: Historial

Lista de consultas pasadas (completed, cancelled, no_show):

Card por consulta:

- fecha
- doctor
- especialidad
- estado final con badge
- resumen breve (motivo de consulta, NO notas internas del doctor)

### Tab: Pagos

Lista de recibos:

Card por pago:

- fecha
- monto
- estado (paid, pending) con badge
- metodo de pago
- servicio asociado

Si hay cobros pending: alerta arriba "Tienes pagos pendientes".

## Onboarding (primera vez)

Al entrar como Admin por primera vez (flag `onboarding_completed` en localStorage), mostrar wizard modal de pantalla completa:

**Paso 1**: Nombre de la clinica + direccion + telefono
**Paso 2**: Agregar primer doctor (nombre, especialidad, horario)
**Paso 3**: Definir servicios y precios (tabla editable)
**Paso 4**: Pantalla de exito "Tu clinica esta lista" + boton "Ir al Dashboard"

Stepper visual arriba. Al completar, guardar flag y redirigir a `/hub`.

## Sistema de roles

### Admin / Gestor

Acceso completo al sistema.

Puede:

- ver agenda de todos los doctores
- crear/editar/cancelar citas
- gestionar doctores
- gestionar pacientes
- ver y generar cobros
- ver reportes
- configurar la clinica

### Doctor

Acceso limitado a:

- sus citas asignadas
- perfil de sus pacientes
- notas clinicas (solo las suyas)
- cobro rapido de consulta
- su agenda y disponibilidad

### Paciente

Acceso a:

- agendar citas (via `/booking`)
- ver sus proximas citas
- cancelar o reagendar
- ver historial de consultas (sin notas internas del doctor)
- ver recibos de pago

## Entidades principales

### Especialidades / Servicios

Cada servicio incluye:

- id
- nombre
- duracion estimada en minutos
- precio de consulta
- descripcion corta
- icono (nombre de icono Lucide)

### Doctores

- id
- nombre completo
- especialidad_id
- foto (URL de Unsplash)
- horario disponible (objeto con dias y rango de horas)
- activo (boolean)
- bio corta

### Pacientes

- id
- nombre completo
- telefono
- email
- fecha de nacimiento
- historial de citas (array de ids)
- balance pendiente (calculado)

### Citas (Appointments)

- id
- paciente_id
- doctor_id
- servicio_id
- fecha
- hora
- duracion
- estado
- motivo (texto breve del paciente)
- notas clinicas (texto del doctor, solo visible para doctor y admin)
- eventos (array de objetos {tipo, timestamp})

### Cobros (Invoices)

- id
- cita_id
- paciente_id
- monto
- estado (pending, paid, cancelled)
- metodo de pago (efectivo, tarjeta, transferencia)
- fecha de pago
- notas

## Estados de cita

- `scheduled` (agendada)
- `confirmed` (confirmada)
- `in_progress` (en consulta)
- `completed` (completada)
- `cancelled` (cancelada)
- `no_show` (no se presento)

Colores de badge:

- scheduled: azul
- confirmed: azul oscuro
- in_progress: amarillo
- completed: verde
- cancelled: gris
- no_show: rojo

## Transiciones de estado

Transiciones validas:

- `scheduled -> confirmed`
- `scheduled -> cancelled`
- `scheduled -> no_show`
- `confirmed -> in_progress`
- `confirmed -> cancelled`
- `confirmed -> no_show`
- `in_progress -> completed`

Transiciones invalidas deben bloquearse y mostrar toast de error.

## Eventos de cita

Cada cita mantiene historial de eventos como array:

```
[
  { tipo: "created", timestamp: "..." },
  { tipo: "reminder_sent", timestamp: "..." },
  { tipo: "confirmed", timestamp: "..." },
  { tipo: "in_progress", timestamp: "..." },
  { tipo: "notes_added", timestamp: "..." },
  { tipo: "completed", timestamp: "..." },
  { tipo: "invoice_created", timestamp: "..." }
]
```

## Reglas de negocio

- Una cita debe tener paciente, doctor, servicio y horario disponible.
- Un doctor no puede tener dos citas simultaneas.
- La duracion del servicio determina el bloque de agenda ocupado.
- No se deben mostrar horarios ocupados en el flujo de reserva.
- La cita solo puede marcarse como completada si paso por `in_progress`.
- El cobro se genera al completar la consulta o manualmente por admin.
- Un paciente puede cancelar hasta 2 horas antes de la cita (mock).
- Notas clinicas del doctor NO son visibles para el paciente.

## Datos mock iniciales

Clinica:

`Clinica MediOS Demo`

Direccion: Av. Reforma 500, Col. Centro, Ciudad de Mexico
Telefono: +52 55 1234 5678
Horario: Lunes a Viernes 9:00 - 19:00

### Doctores

- `doc_01` - Dra. Sofia Martinez - Medicina General - L-V 9:00-17:00
- `doc_02` - Dr. Carlos Herrera - Odontologia - L-V 10:00-18:00
- `doc_03` - Dra. Ana Lopez - Pediatria - L,M,J 9:00-14:00
- `doc_04` - Dr. Roberto Diaz - Dermatologia - M,J,V 11:00-19:00

### Pacientes

- `pac_01` - Maria Garcia - 35 anos - tel: 5512345001
- `pac_02` - Juan Rodriguez - 28 anos - tel: 5512345002
- `pac_03` - Laura Sanchez - 42 anos - tel: 5512345003
- `pac_04` - Pedro Gonzalez - 55 anos - tel: 5512345004
- `pac_05` - Ana Torres - 8 anos (pediatria) - tel: 5512345005

### Especialidades

| Especialidad | Duracion | Precio | Icono |
| --- | --- | --- | --- |
| Medicina General | 30 min | $800 MXN | Stethoscope |
| Odontologia | 45 min | $1,200 MXN | SmilePlus |
| Pediatria | 30 min | $900 MXN | Baby |
| Dermatologia | 30 min | $1,000 MXN | Scan |
| Nutricion | 45 min | $700 MXN | Apple |

### Citas iniciales

Generar 10 citas en distintos estados para que la UI se vea viva:

- 3 en `scheduled` (proximos dias)
- 2 en `confirmed` (hoy)
- 2 en `completed` (dias pasados, con notas clinicas y cobro asociado)
- 1 en `in_progress` (ahora mismo, asignada a doc_01 con pac_01)
- 1 en `no_show` (ayer)
- 1 en `cancelled`

### Cobros iniciales

- 2 cobros `paid` asociados a citas completed (uno efectivo, uno tarjeta)
- 1 cobro `pending` asociado a una cita completed

## UX

- Badges de estado claros con colores definidos arriba.
- Feedback con toast en cada accion (crear, editar, cancelar, cobrar).
- Responsive mobile first.
- Cards con bordes suaves y sombra sutil.
- Tabs limpios, sin contenido apilado.
- Cada tab ocupa todo el espacio disponible, no scroll infinito.
- Transiciones suaves entre tabs.
- Calendario visual limpio para seleccion de fecha.
- Slots de hora como botones seleccionables con hover.
- En mobile: sidebar del hub se convierte en bottom navigation.
- En mobile: tabs horizontales son swipeables.

## Objetivo final

Construir una aplicacion web completamente navegable que permita ejecutar el flujo completo de una cita medica en clinica utilizando datos mock en memoria.

La app debe verse como un producto real, no como un prototipo. El nivel de pulido debe ser suficiente para mostrar en un video de YouTube y para que un doctor diga "esto lo quiero para mi clinica".

## Restricciones tecnicas

- No implementar backend real.
- No depender de APIs externas.
- No dejar pantallas vacias. Todas las tabs deben tener datos mock visibles.
- Incluir datos seed y navegacion funcional entre todas las rutas y tabs.
- Cualquier accion importante debe reflejarse en la UI inmediatamente.
- NO crear rutas adicionales fuera de las 6 definidas.
- NO apilar secciones largas verticalmente dentro de un tab. Cada tab es UNA vista enfocada.

## Lo que viene despues (NO implementar ahora)

- Supabase (auth + DB + edge functions)
- Notificaciones WhatsApp via Twilio o API directa
- Recordatorios automaticos (edge function + cron)
- Pagos con Stripe
- Expediente clinico completo (historial medico, alergias, medicamentos)
- Integracion con Google Calendar
- Multi-sucursal
