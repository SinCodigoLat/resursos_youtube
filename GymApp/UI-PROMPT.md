# UI-PROMPT.md - Prompt para Lovable

Copia y pega este prompt en [Lovable.dev](https://lovable.dev) para generar la aplicacion.

---

Actua como un desarrollador Fullstack Senior. Crea una aplicacion llamada **Fit IA**, un asistente virtual para gimnasios que gestiona membresias y clases por WhatsApp.

### 1. Estetica y Diseno (UI/UX)
- **Tema**: 'Fitness Energetico'. Usa una paleta de colores: Verde vibrante (#22c55e), negro (#0f0f0f), blanco (#ffffff), gris oscuro (#1a1a1a).
- **Tipografia**: Plus Jakarta Sans.
- **Componentes**: Usa shadcn/ui con animaciones sutiles (fades, slides).
- **Paginas**:
  - **Landing Page**: Hero con gradientes, seccion de beneficios, y botones de llamada a la accion claros.
  - **Auth**: Pagina de Login/Registro moderna con tarjetas centradas.
  - **Dashboard**: Layout con navegacion por pestanas (Tabs) y Sidebar responsive.

### 2. Estructura del Dashboard (Pestanas)
- **Mensajes**: Una interfaz de chat profesional estilo WhatsApp. Panel izquierdo con lista de chats (ultimo mensaje, hora, contador) y panel derecho con la conversacion (burbujas diferenciadas, avatares, auto-scroll).
- **Miembros**: Tabla con busqueda. Columnas: nombre, telefono, email, plan activo, fecha de vencimiento, estado (activo/vencido/pendiente). Badge de color segun estado.
- **Membresias**: Grid de cards con nombre del plan, precio mensual, duracion, beneficios (badges), y cantidad de miembros activos en ese plan.
- **Clases**: Calendario visual con vista semanal. Cada celda muestra clase, instructor, horario, cupos disponibles/ocupados. Click en clase para ver miembros inscritos.
- **Pagos**: Tabla con historial. Columnas: miembro, monto, fecha, metodo (efectivo/tarjeta/transferencia), estado (pagado/pendiente).
- **Configuracion**: Formulario para editar datos del gimnasio (Nombre, Direccion, Horarios de apertura/cierre, Planes disponibles como Array, Clases disponibles como Array, y URL del Webhook).

### 3. Integracion con Supabase (Backend)
Configura las siguientes tablas:

**members:**
- id (uuid, PK), name (text), phone (text, unique), email (text)
- membership_id (uuid, FK), start_date (date), end_date (date)
- status (text: active/expired/pending), created_at (timestamp)

**memberships:**
- id (uuid, PK), name (text), price (decimal), duration_days (int)
- benefits (text[]), is_active (boolean)

**classes:**
- id (uuid, PK), name (text), instructor (text), capacity (int)
- schedule (jsonb), duration_minutes (int), is_active (boolean)

**bookings:**
- id (uuid, PK), member_id (uuid, FK), class_id (uuid, FK)
- date (date), time (time), status (text: confirmed/cancelled/attended)
- created_at (timestamp)

**payments:**
- id (uuid, PK), member_id (uuid, FK), amount (decimal)
- date (date), method (text: cash/card/transfer), status (text: paid/pending)
- notes (text), created_at (timestamp)

**messages:**
- id (uuid, PK), member_id (uuid, FK), phone_number (text)
- direction (text: inbound/outbound), content (text), created_at (timestamp)

**gym_config:**
- id (uuid, PK), gym_name (text), address (text), timezone (text)
- opening_time (time), closing_time (time), webhook_url (text)

### 4. Logica Detallada de Edge Functions (IA y Automatizacion)

Genera el codigo para las siguientes funciones en Deno (Edge Functions):

#### A. `twilio-webhook-whatsapp` (Cerebro con Memoria y Timezone)
- **Seguridad**: Deshabilitar la verificacion de JWT para permitir POST de Twilio.
- **Manejo de Entrada**: Procesar `Body` y `From`.
- **Persistencia**: Guardar cada mensaje en la tabla `messages`.
- **Memoria (Historial)**:
  - Antes de llamar a OpenAI, consultar los ultimos 10-15 mensajes del mismo `phone_number` en la tabla `messages`.
  - Enviar este historial a la API de OpenAI para que Fit tenga contexto de la conversacion.
- **Sincronizacion Horaria**:
  - Obtener el `timezone` de `gym_config`.
  - Calcular la hora local del gimnasio y pasarla al System Prompt de OpenAI.
  - Instruir al AI a generar fechas ISO 8601 basadas en esa hora local.
- **Motor OpenAI**: Usar GPT-4o-mini con System Prompt dinamico.
- **Function Calling (Herramientas)**:
  - `get_membership_plans()` → Retorna lista de planes con precios y beneficios
  - `register_member(name, phone, email, membership_id)` → Crea nuevo miembro con membresia
  - `get_member_info(phone)` → Retorna info del miembro, plan activo, fecha vencimiento
  - `get_available_classes(date?)` → Lista clases disponibles con cupos
  - `book_class(phone, class_id, date)` → Inscribe miembro en clase
  - `cancel_class_booking(phone, booking_id)` → Cancela inscripcion
  - `register_payment(phone, amount, method)` → Registra pago y renueva membresia
  - `check_payment_status(phone)` → Retorna estado de pagos y fecha de vencimiento
- **Manejo de Respuesta**: Generar respuesta basada en historial y herramientas, guardarla en BD y enviarla via Twilio.

#### B. `send-reminders` (Recordatorios de Pago y Vencimiento)
- **Logica de Negocio**: Buscar miembros con `end_date = en 3 dias` y `status = active`.
- **Mensajeria**: Por cada miembro, construir un mensaje amable recordando la fecha de vencimiento, monto a pagar, y metodos de pago disponibles.
- **Control**: Marcar como notificado para no enviar duplicados.

#### C. `send-class-reminders` (Recordatorios de Clases)
- **Logica de Negocio**: Buscar bookings con `date = hoy` y `status = confirmed`.
- **Mensajeria**: Enviar recordatorio 2 horas antes de la clase con nombre, instructor y horario.

### 5. Configuracion de Automatizacion (Cron Jobs)
Para los recordatorios, incluye las instrucciones para configurar los Cron Jobs en Supabase mediante SQL:
```sql
-- Recordatorios de vencimiento: cada manana a las 9:00 AM
select cron.schedule(
  'enviar-recordatorios-vencimiento',
  '0 9 * * *',
  $$
  select net.http_post(
    url:='https://[PROJECT_REF].supabase.co/functions/v1/send-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  ) as request_id;
  $$
);

-- Recordatorios de clases: cada hora
select cron.schedule(
  'enviar-recordatorios-clases',
  '0 * * * *',
  $$
  select net.http_post(
    url:='https://[PROJECT_REF].supabase.co/functions/v1/send-class-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
  ) as request_id;
  $$
);
```
