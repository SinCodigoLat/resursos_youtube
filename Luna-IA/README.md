# Luna IA - Smart Hotel Reservations

Sistema inteligente de gestión de reservas para hoteles con asistente de IA integrado via WhatsApp.

## Descripción

Luna IA es una plataforma SaaS que automatiza la gestión de reservas de hoteles mediante Inteligencia Artificial, integrándose con WhatsApp para atender huéspedes 24/7.

**Video Tutorial**: [Próximamente]

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Backend** | Supabase (Database + Auth + Edge Functions) |
| **IA** | OpenAI GPT-4o-mini con Function Calling |
| **Mensajería** | Twilio (WhatsApp Business API) |
| **Estilos** | Tailwind CSS |
| **Componentes** | shadcn/ui (Radix UI) |
| **Estado** | TanStack Query |

## Funcionalidades

- **Atención IA 24/7**: Luna responde automáticamente por WhatsApp
- **Reservas Inteligentes**: Consulta de disponibilidad y creación de reservas por chat
- **Control de Habitaciones**: Panel visual de estados en tiempo real
- **Gestión de Huéspedes**: Base de datos con perfiles e historial
- **Dashboard Administrativo**: Interfaz moderna con métricas clave

## Arquitectura

```
Usuario (WhatsApp)
       ↓
    Twilio
       ↓
  Supabase Edge Function (webhook)
       ↓
  Supabase Edge Function (luna-agent)
       ↓
    OpenAI API
       ↓
  Base de Datos (Supabase)
       ↓
    Twilio
       ↓
Usuario (WhatsApp)
```

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [SETUP.md](./SETUP.md) | Configuración inicial completa |
| [GOTCHAS.md](./GOTCHAS.md) | Problemas conocidos y soluciones |

## Requisitos Previos

- Node.js v18+
- Cuenta de Supabase
- Cuenta de Twilio (sandbox o producción)
- API Key de OpenAI

## Instalación Rápida

```bash
# 1. Clonar el proyecto (desde Lovable.dev export o template)
git clone <tu-proyecto>
cd luna-ia

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar desarrollo
npm run dev
```

## Configuración de Servicios

Ver [SETUP.md](./SETUP.md) para instrucciones detalladas de:
- Supabase (base de datos y Edge Functions)
- Twilio (WhatsApp sandbox)
- OpenAI (API Key)

## Problemas Conocidos

Ver [GOTCHAS.md](./GOTCHAS.md) para:
- 22 problemas documentados con soluciones
- Checklist pre-producción
- Tips de debugging

---

Desarrollado para la comunidad de **Sin Código Lat**
