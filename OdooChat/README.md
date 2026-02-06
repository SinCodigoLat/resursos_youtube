# OdooChat - Asistente IA para Odoo

Habla con tu Odoo usando lenguaje natural. Sistema que conecta un chat con IA a los datos de tu ERP: pipeline de ventas, inventario, proyectos, contactos y actividades.

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18 + Vite + TypeScript |
| **Estilos** | Tailwind CSS + Shadcn UI |
| **Backend** | Supabase (Auth, Database, Edge Functions) |
| **IA** | OpenAI GPT-4o / GPT-4o-mini (Function Calling) |
| **ERP** | Odoo (JSON-RPC API) |
| **Hosting** | Vercel |

## Arquitectura

```
+--------------+      +---------------------+      +-------------+
|  React App   | ---> |  Supabase Edge Fn   | ---> |  Odoo API   |
|  (Lovable)   |      |  (process-chat)     |      |  /jsonrpc   |
+--------------+      +---------------------+      +-------------+
                               |
                               v
                      +-----------------+
                      |  OpenAI API     |
                      |  (Function Call)|
                      +-----------------+
```

1. El usuario escribe una pregunta en lenguaje natural
2. La Edge Function envia la pregunta a OpenAI con tools definidas
3. OpenAI decide que tool llamar (ej: `get_crm_pipeline`)
4. La Edge Function ejecuta la consulta contra Odoo via JSON-RPC
5. Los resultados se envian de vuelta a OpenAI para generar una respuesta legible
6. El usuario recibe la respuesta en el chat

## Tools Disponibles

| Tool | Modelo Odoo | Que consulta |
|------|-------------|-------------|
| `get_products` | `product.product` | Productos y stock |
| `get_customers` | `res.partner` | Clientes y contactos |
| `get_crm_pipeline` | `crm.lead` | Oportunidades de venta |
| `get_tasks` | `project.task` | Tareas de proyectos |
| `get_activities` | `mail.activity` | Actividades pendientes |

## Recursos en esta carpeta

| Archivo | Descripcion |
|---------|-------------|
| `LOVABLE-PROMPT.md` | Prompt para generar la UI en Lovable. Copia y pega para obtener la interfaz completa. |
| `TROUBLESHOOTING.md` | Errores comunes y soluciones probadas para la integracion Odoo + Supabase Edge Functions. |

## Como empezar

### Paso 1: Generar la UI

1. Ve a [lovable.dev](https://lovable.dev)
2. Copia el contenido de `LOVABLE-PROMPT.md`
3. Pega el prompt y genera la app
4. Lovable te dara una app React funcional con UI completa

### Paso 2: Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Conecta Lovable con tu proyecto de Supabase
3. Configura las tablas: `conversations`, `messages`, `odoo_connections`, `settings`
4. Despliega la Edge Function `process-chat`

### Paso 3: Configurar credenciales

En Supabase Dashboard > Edge Functions > Secrets:

| Secret | Valor |
|--------|-------|
| `ODOO_URL` | URL de tu servidor Odoo (ej: `https://miempresa.odoo.com`) |
| `ODOO_DATABASE` | Nombre de la base de datos |
| `ODOO_USERNAME` | Email del usuario de Odoo |
| `ODOO_PASSWORD` | Contrasena o API Key de Odoo |
| `OPENAI_API_KEY` | Tu API Key de OpenAI |

### Paso 4: Desplegar

1. Conecta el repo con Vercel
2. Agrega las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Despliega

## Seguridad

- Autenticacion via Supabase Auth
- Row Level Security (RLS) en base de datos
- Credenciales de Odoo en Secrets del backend (nunca expuestas al frontend)
- API Keys de OpenAI por usuario

## Errores comunes

Consulta `TROUBLESHOOTING.md` para soluciones a:
- "No se pudo obtener sesion de Odoo" (cookies vs JSON-RPC)
- "Cannot convert field to SQL" (campos computados)
- "Object account.move doesn't exist" (modulos no instalados)
- Contrasenas con caracteres especiales

## Licencia

MIT - Usa, modifica y distribuye libremente.

---

Desarrollado para la comunidad de [Sin Codigo Lat](https://youtube.com/@SinCodigoLat).
