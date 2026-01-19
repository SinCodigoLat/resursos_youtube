# Prompts - Luna IA

Este archivo contiene los prompts utilizados para crear y operar Luna IA.

---

## 1. Prompt de Lovable (Creación del Proyecto)

> **Nota**: Este es el prompt que se usó para generar el proyecto inicial en [Lovable.dev](https://lovable.dev)

```
Actúa como un desarrollador Fullstack Senior. Crea una aplicación llamada **Luna IA**, un asistente virtual para hoteles que gestiona reservas de habitaciones por WhatsApp.

### 1. Estética y Diseño (UI/UX)
- **Tema**: 'Hotel Elegante'. Usa una paleta de colores: Azul marino (#1e3a5f), dorado (#d4af37), blanco (#ffffff).
- **Tipografía**: Plus Jakarta Sans.
- **Componentes**: Usa shadcn/ui con animaciones sutiles (fades, slides).
- **Páginas**:
  - **Landing Page**: Hero con gradientes, sección de beneficios, y botones de llamada a la acción claros.
  - **Auth**: Página de Login/Registro moderna con tarjetas centradas.
  - **Dashboard**: Layout con navegación por pestañas (Tabs) y Sidebar responsive.

### 2. Estructura del Dashboard (Pestañas)
- **Mensajes**: Una interfaz de chat profesional estilo WhatsApp. Panel izquierdo con lista de chats (último mensaje, hora, contador) y panel derecho con la conversación (burbujas diferenciadas, avatares, auto-scroll).
- **Reservas**: Calendario visual con vista mensual. Cada celda muestra habitaciones ocupadas/disponibles. Click en fecha para ver detalle de reservas. Filtros por tipo de habitación.
- **Habitaciones**: Grid de cards con foto, nombre, tipo, precio por noche, amenidades (badges), y toggle de disponibilidad.
- **Huéspedes**: Tabla con búsqueda. Columnas: nombre, teléfono, email, reservas totales, última visita.
- **Configuración**: Formulario para editar datos del hotel (Nombre, Dirección, Horarios de check-in/out, Tipos de habitación como Array, y URL del Webhook).

### 3. Integración con Supabase (Backend)
Configura las siguientes tablas:

**rooms:**
- id (uuid, PK), name (text), type (text), capacity (int), price_per_night (decimal)
- amenities (text[]), is_available (boolean), image_url (text)

**guests:**
- id (uuid, PK), name (text), phone (text, unique), email (text)
- id_number (text), created_at (timestamp)

**reservations:**
- id (uuid, PK), room_id (uuid, FK), guest_id (uuid, FK)
- check_in_date (date), check_out_date (date)
- status (text: pending/confirmed/checked_in/completed/cancelled)
- total_price (decimal), notes (text), reminder_sent (boolean), created_at (timestamp)

**messages:**
- id (uuid, PK), guest_id (uuid, FK), phone_number (text)
- direction (text: inbound/outbound), content (text), created_at (timestamp)

**hotel_config:**
- id (uuid, PK), hotel_name (text), address (text), timezone (text)
- check_in_time (time), check_out_time (time), webhook_url (text)

### 4. Lógica Detallada de Edge Functions (IA y Automatización)

Genera el código para las siguientes funciones en Deno (Edge Functions):

#### A. `twilio-webhook-whatsapp` (Cerebro con Memoria y Timezone)
- **Seguridad**: Deshabilitar la verificación de JWT para permitir POST de Twilio.
- **Manejo de Entrada**: Procesar `Body` y `From`.
- **Persistencia**: Guardar cada mensaje en la tabla `messages`.
- **Memoria (Historial)**:
  - Antes de llamar a OpenAI, consultar los últimos 10-15 mensajes del mismo `phone_number` en la tabla `messages`.
  - Enviar este historial a la API de OpenAI para que Luna tenga contexto de la conversación.
- **Sincronización Horaria**:
  - Obtener el `timezone` de `hotel_config`.
  - Calcular la hora local del hotel y pasarla al System Prompt de OpenAI.
  - Instruir al AI a generar fechas ISO 8601 basadas en esa hora local.
- **Motor OpenAI**: Usar GPT-4o-mini con System Prompt dinámico.
- **Function Calling (Herramientas)**:
  - `check_availability(check_in_date, check_out_date, room_type?)` → Consulta `rooms` y `reservations` para fechas
  - `create_reservation(guest_name, phone, email, room_id, check_in, check_out)` → Crea/obtiene guest, crea reservation
  - `get_reservation(reservation_id)` → Retorna detalles de una reserva
  - `confirm_checkin(reservation_id)` → Actualiza status a "checked_in"
  - `cancel_reservation(reservation_id)` → Actualiza status a "cancelled"
- **Manejo de Respuesta**: Generar respuesta basada en historial y herramientas, guardarla en BD y enviarla vía Twilio.

#### B. `send-reminders` (Recordatorios de Check-in)
- **Lógica de Negocio**: Buscar reservas con `check_in_date = mañana` y `reminder_sent = false` y `status = confirmed`.
- **Mensajería**: Por cada reserva, construir un mensaje amable recordando el check-in, horario, y detalles de la habitación.
- **Control**: Actualizar `reminder_sent = true` tras el envío exitoso por Twilio.

### 5. Configuración de Automatización (Cron Job)
Para los recordatorios, incluye las instrucciones para configurar el Cron Job en Supabase mediante SQL:

SELECT cron.schedule(
  'enviar-recordatorios-checkin',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url:='https://[PROJECT_REF].supabase.co/functions/v1/send-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  ) as request_id;
  $$
);

### 6. Tecnologías y Librerías Clave
- **Frontend**: React 18, Vite, Tailwind CSS, TanStack Query (Polling de 5s para chats).
- **Backend**: Supabase (Postgres, Auth, Edge Functions).
- **Integraciones**: OpenAI SDK, Twilio REST API.
- **Utilidades**: date-fns para manejo de fechas en el Dashboard.
```

---

## 2. System Prompt del Agente Luna (OpenAI)

Este es el prompt que usa el agente Luna para interactuar con los huéspedes via WhatsApp.

**Ubicación en el código**: `supabase/functions/luna-agent/index.ts`

```
Eres Luna, asistente de ${hotelConfig?.hotel_name}. HOY ES: ${formattedNow}.

CRÍTICO:
1. Si el nombre es genérico (ej: "Huésped"), PREGUNTA el nombre antes de crear la reserva.
2. Usa update_guest_info para guardar el nombre.
3. Para reservar usa el UUID room_id. NO números como '1'.
4. Formato de fecha: YYYY-MM-DD.
5. NO digas 'procesando...', ejecuta la función directamente.
```

### Variables Dinámicas

- `${hotelConfig?.hotel_name}` - Nombre del hotel desde la configuración
- `${formattedNow}` - Fecha actual formateada (ej: "domingo, 19 de enero de 2026")

### Funciones Disponibles (Function Calling)

El agente tiene acceso a 3 funciones:

#### `check_room_availability`
Consulta disponibilidad de habitaciones.

```json
{
  "check_in_date": "YYYY-MM-DD",
  "check_out_date": "YYYY-MM-DD",
  "capacity": 2,
  "room_type": "deluxe"
}
```

#### `create_reservation`
Crea una reservación (requiere UUID de habitación).

```json
{
  "room_id": "uuid-de-la-habitacion",
  "check_in_date": "YYYY-MM-DD",
  "check_out_date": "YYYY-MM-DD",
  "notes": "Notas opcionales"
}
```

#### `update_guest_info`
Actualiza el nombre del huésped.

```json
{
  "name": "Nombre Completo"
}
```

---

## 3. Contexto Adicional Inyectado

Además del system prompt, Luna recibe:

1. **Configuración del hotel** - Nombre, dirección, políticas
2. **Información del huésped** - Nombre, email, teléfono
3. **Últimos 10 mensajes** - Historial de la conversación actual

---

## Notas de Optimización

### Por qué el prompt es corto

El prompt se mantiene conciso porque:
1. GPT-4o-mini funciona mejor con instrucciones directas
2. Las funciones (function calling) guían el comportamiento
3. Menos tokens = menor costo y latencia

### Lecciones aprendidas

- **Inyectar fecha actual** evita que use años incorrectos
- **"NO digas procesando"** evita que genere texto en lugar de ejecutar funciones
- **Validar UUID** previene que use índices como "1", "2"
