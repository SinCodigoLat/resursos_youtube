# OdooChat - Prompt para Lovable

> Copia este prompt en Lovable para generar la UI. El backend (Supabase) se configura después.

---

## Prompt

```
Crea una aplicación web de chat llamada "OdooChat" - un asistente de IA para consultar datos de un ERP Odoo.

IMPORTANTE: Enfócate SOLO en la UI por ahora. El backend con Supabase se configurará después.

## Páginas

### 1. Login (/login)
- Logo de la app (ícono de robot + nombre "OdooChat")
- Formulario: email + contraseña
- Botón "Iniciar sesión"
- Link "¿No tienes cuenta? Regístrate"
- Diseño centrado, minimalista

### 2. Register (/register)
- Igual que login pero con campo "Nombre completo"
- Botón "Crear cuenta"
- Link "¿Ya tienes cuenta? Inicia sesión"

### 3. Chat Principal (/chat) - PÁGINA MÁS IMPORTANTE
- **Header:** Logo + nombre de usuario + botón configuración (engranaje)
- **Sidebar izquierdo:** Lista de conversaciones anteriores + botón "Nueva conversación"
- **Área de chat central:**
  - Si no hay mensajes: mostrar saludo "¡Hola, [nombre]!" con descripción "Soy OdooChat, tu asistente para consultar y gestionar datos de Odoo. ¿En qué puedo ayudarte hoy?" + 4 tarjetas de sugerencias (ver abajo)
  - Mensajes del usuario (burbujas alineadas a la derecha, color primario)
  - Mensajes del asistente (burbujas a la izquierda, fondo gris, con ícono de robot)
  - El asistente puede responder con Markdown (listas, negritas, tablas)
  - Indicador de "escribiendo..." con 3 puntos animados cuando procesa
- **Input inferior:** Campo de texto con placeholder "Pregunta algo sobre tu Odoo..." + botón enviar

### 4. Configuración (/settings)
- Header con botón "Volver al chat"
- Card "Conexión a Odoo": URL del servidor, base de datos, usuario (email), contraseña, botón "Probar conexión" con indicador visual (check verde o X roja)
- Card "Configuración de IA": Campo para API Key de OpenAI (con toggle mostrar/ocultar), selector de modelo (gpt-4o-mini / gpt-4o)
- Botones "Guardar" en cada card

## Tarjetas de Sugerencia (IMPORTANTE - usar estos textos exactos)

Cuando el chat está vacío, mostrar 4 tarjetas clickeables en grid 2x2 que insertan texto en el input:

1. "📊 Ver pipeline de ventas"
   → Al hacer clic inserta: "¿Cuál es el valor total del pipeline de ventas?"

2. "📦 Productos con bajo stock"
   → Al hacer clic inserta: "¿Qué productos tienen menos stock?"

3. "📋 Tareas pendientes"
   → Al hacer clic inserta: "¿Qué tareas tengo pendientes?"

4. "🔔 Actividades pendientes"
   → Al hacer clic inserta: "¿Qué actividades tengo pendientes con clientes?"

## Diseño Visual

- Tema oscuro por defecto (dark mode)
- Paleta: fondo oscuro (#0f0f0f), cards (#1a1a1a), bordes (#2a2a2a), acento púrpura (#714B67 - color Odoo)
- Tipografía: Inter o sistema sans-serif
- Bordes redondeados (radius: 12px en cards, 20px en burbujas)
- Animaciones suaves: fade-in en mensajes, transición en hover de tarjetas
- Mobile-first, responsive (sidebar se convierte en menú hamburguesa en móvil)

## Stack Técnico

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router para navegación
- Lucide React para íconos
- react-markdown para renderizar respuestas del asistente

## Comportamiento Mock (temporal)

Por ahora, sin backend real:
- Login/Register: aceptar cualquier credencial y guardar en localStorage
- Chat: simular respuestas del asistente con delay de 1.5 segundos
- Configuración: guardar en localStorage
- Conversaciones: guardar en estado local (array de objetos)

Ejemplo de respuesta mock del asistente:
"Encontré 5 oportunidades en tu pipeline de ventas con un valor total de **$45,000 USD**:
1. Empresa ABC - $15,000 (Propuesta)
2. Distribuidora Norte - $12,000 (Negociación)
..."

## NO hacer todavía

- NO conectar Supabase (se hace después)
- NO implementar Edge Functions
- NO conectar a Odoo real
- NO agregar más páginas de las especificadas
```

---

## Preguntas que Lovable podría hacer (y cómo responder)

| Pregunta de Lovable | Tu respuesta |
|---------------------|--------------|
| ¿Quieres que conecte Supabase ahora? | **No, después lo configuro yo** |
| ¿Colores específicos? | **Púrpura Odoo #714B67 como acento, tema oscuro** |
| ¿El sidebar debe ser colapsable? | **Sí, hamburger menu en móvil** |
| ¿Agregar más funcionalidades? | **No, solo lo especificado** |
| ¿Qué modelo de OpenAI por defecto? | **gpt-4o-mini** |

---

## Después de generar la UI

### Paso 2: Conectar Supabase

1. En Lovable: "Conecta Supabase" → usar tu proyecto
2. Crear tablas: `conversations`, `messages`, `odoo_connections`, `settings`

### Paso 3: Conectar Edge Function

La Edge Function `process-chat` ya existe y tiene estas tools:

| Tool | Consulta | Módulo Odoo |
|------|----------|-------------|
| `get_products` | Productos y stock | Inventory |
| `get_customers` | Clientes/contactos | Contacts |
| `get_crm_pipeline` | Oportunidades de venta | CRM |
| `get_tasks` | Tareas de proyectos | Projects |
| `get_activities` | Actividades pendientes | Activities |

**Credenciales Odoo:** Ya configuradas en Edge Function Secrets (no necesitan guardarse en BD del usuario).

---

## Referencia: Arquitectura Final

```
┌─────────────┐      ┌─────────────────────┐      ┌─────────────┐
│  React App  │ ───▶ │  Supabase Edge Fn   │ ───▶ │  Odoo API   │
│  (Lovable)  │      │  (process-chat)     │      │  /jsonrpc   │
└─────────────┘      └─────────────────────┘      └─────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  OpenAI API     │
                     │  (Function Call)│
                     └─────────────────┘
```

---

*Para errores de backend, ver: TROUBLESHOOTING-ODOO-CHAT.md*
