# Fit AI Coach - Tu Gimnasio en WhatsApp 24/7

Sistema de gestion para gimnasios con asistente de IA integrado via WhatsApp.

**Video**: [Proximamente]

## Que Construiremos

- Dashboard de administracion moderno
- Gestion de miembros y membresias
- Calendario de clases con reservas
- Chat WhatsApp con IA (reserva clases, genera links de pago)
- Pagos recurrentes con Stripe

## Stack

| Categoria | Tecnologia |
|-----------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Backend | Supabase (DB + Auth + Edge Functions + Realtime) |
| IA | OpenAI GPT-4o con Function Calling |
| WhatsApp | Twilio |
| Pagos | Stripe Subscriptions |

## Documentacion

| Archivo | Contenido |
|---------|-----------|
| [UI-PROMPT.md](./UI-PROMPT.md) | Prompt para generar UI en Lovable |
| [BACKEND-SETUP.md](./BACKEND-SETUP.md) | Schema SQL de Supabase |

## Arquitectura

```
Usuario (WhatsApp)
       |
    Twilio
       |
  Edge Function (webhook)
       |
  Edge Function (ai-agent)
       |
    OpenAI API
       |
  Supabase DB
       |
    Twilio
       |
Usuario (WhatsApp)
```

## Tablas Principales

- `gyms` - Datos del gimnasio (multi-tenant)
- `members` - Miembros con estado de membresia
- `membership_plans` - Planes con precios de Stripe
- `classes` - Clases grupales con horarios
- `class_bookings` - Reservas de clases
- `payments` - Historial de pagos
- `conversations` - Chats de WhatsApp
- `messages` - Mensajes individuales

## Funcionalidades de la IA

1. **Consultar planes** - "Cuanto cuesta la membresia?"
2. **Ver clases** - "Que clases hay manana?"
3. **Reservar clase** - "Quiero reservar yoga el lunes"
4. **Generar link de pago** - "Quiero pagar mi membresia"

---

Desarrollado para **Sin Codigo Lat**
