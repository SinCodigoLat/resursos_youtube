# Configuración Completa - Luna IA

Esta guía cubre toda la configuración necesaria para que Luna IA funcione correctamente.

## 1. Supabase

### 1.1 Crear Proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda las credenciales:
   - **Project URL**: `https://[PROJECT_ID].supabase.co`
   - **Anon Key**: La clave pública
   - **Service Role Key**: La clave privada (para Edge Functions)

### 1.2 Configurar Base de Datos

El esquema se crea automáticamente al importar el proyecto desde Lovable. Las tablas principales son:

- `guests` - Huéspedes
- `rooms` - Habitaciones
- `reservations` - Reservaciones
- `messages` - Mensajes de chat
- `hotels` - Configuración del hotel

### 1.3 Configurar Secrets en Edge Functions

Ve a **Settings** → **Edge Functions** → **Secrets** y agrega:

| Secret | Valor | Descripción |
|--------|-------|-------------|
| `OPENAI_API_KEY` | `sk-xxx...` | Tu API key de OpenAI |
| `TWILIO_ACCOUNT_SID` | `ACxxx...` | Account SID de Twilio |
| `TWILIO_AUTH_TOKEN` | `xxx...` | Auth Token de Twilio |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` | Número de WhatsApp |

### 1.4 Verificar Edge Functions

Las Edge Functions necesarias son:
- `webhook` - Recibe mensajes de Twilio
- `luna-agent` - Procesa mensajes con OpenAI

**IMPORTANTE**: Después de desplegar, verifica que las funciones tengan código:
1. Ve a **Edge Functions** en el dashboard
2. Haz clic en cada función
3. Verifica que el código esté visible (no vacío)

---

## 2. OpenAI

### 2.1 Obtener API Key

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea cuenta o inicia sesión
3. Ve a **API Keys** → **Create new secret key**
4. Copia la clave (solo se muestra una vez)

### 2.2 Verificar Créditos

- El modelo usado es `gpt-4o-mini` (económico)
- Costo aproximado: ~$0.001-0.01 por conversación
- Verifica que tengas créditos disponibles en **Billing**

---

## 3. Twilio (WhatsApp)

### 3.1 Crear Cuenta

1. Ve a [twilio.com](https://www.twilio.com) y crea una cuenta
2. Verifica tu número de teléfono

### 3.2 Configurar Sandbox de WhatsApp

1. En Twilio Console, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Sigue las instrucciones para unirte al sandbox:
   - Envía el mensaje indicado (ej: "join example-word") al número de sandbox
   - Espera la confirmación

### 3.3 Configurar Webhook

En la misma sección de sandbox:

1. Busca **Sandbox Configuration** o **When a message comes in**
2. Configura:
   - **URL**: `https://[TU_PROJECT_ID].supabase.co/functions/v1/webhook`
   - **Method**: `POST`
3. Guarda los cambios

### 3.4 Obtener Credenciales

En el dashboard principal de Twilio encontrarás:

- **Account SID**: En la parte superior (empieza con `AC`)
- **Auth Token**: Haz clic en "Show" para revelarlo
- **WhatsApp Number**: El número del sandbox (ej: `+14155238886`)

---

## 4. Variables de Entorno del Frontend

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://[TU_PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 5. Checklist de Verificación

### Antes de Probar

- [ ] Proyecto de Supabase creado
- [ ] 4 secrets configurados en Edge Functions
- [ ] Edge Functions desplegadas con código (no vacías)
- [ ] API Key de OpenAI válida con créditos
- [ ] Cuenta de Twilio verificada
- [ ] Sandbox de WhatsApp configurado
- [ ] Webhook URL configurada en Twilio
- [ ] Usuario unido al sandbox (mensaje "join xxx")
- [ ] Variables `.env` configuradas

### Prueba del Flujo Completo

1. Envía un mensaje desde WhatsApp al número de sandbox
2. Verifica en Supabase → Edge Functions → Logs que:
   - `webhook` recibe el mensaje
   - `luna-agent` procesa el mensaje
3. Verifica que la respuesta llegue a WhatsApp

### Debugging

Si algo falla, revisa en este orden:

1. **Logs de Edge Functions** en Supabase Dashboard
2. **Logs de Twilio** en Twilio Console → Monitor → Logs
3. **Console del navegador** para errores de frontend

---

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
