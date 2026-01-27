# Fit IA - Asistente Virtual para Gimnasios

Sistema de gestion de membresias y clases con asistente de IA por WhatsApp.

**Video**: [YouTube - Sin Codigo Lat]

## Que Construiremos

- Landing page moderna
- Dashboard con mensajes, miembros, membresias, clases, pagos
- Chat estilo WhatsApp para supervisar la IA
- Pagos recurrentes con Stripe
- Asistente IA que registra miembros, agenda clases y cobra automaticamente

## Stack

| Tecnologia | Uso |
|------------|-----|
| Lovable | Generar UI inicial |
| Supabase | Base de datos + Auth + Edge Functions |
| Stripe | Pagos y suscripciones |
| Twilio | WhatsApp Business API |
| OpenAI | GPT-4o-mini para el asistente |
| Vercel | Deploy |

## Recursos

| Archivo | Contenido |
|---------|-----------|
| [UI-PROMPT.md](./UI-PROMPT.md) | Prompt para Lovable |

## Flujo del Video

1. **Lovable** → Generar UI con el prompt
2. **GitHub** → Sincronizar codigo
3. **Antigravity** → Clonar y ajustar con IA
4. **Supabase** → Configurar MCP, crear tablas automaticamente
5. **Stripe** → Vincular productos y webhooks
6. **Twilio** → Configurar sandbox de WhatsApp
7. **OpenAI** → Agregar API key para el agente
8. **Vercel** → Deploy final

## Credenciales Necesarias (en Supabase Secrets)

```
OPENAI_API_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

---

Desarrollado para **Sin Codigo Lat**
