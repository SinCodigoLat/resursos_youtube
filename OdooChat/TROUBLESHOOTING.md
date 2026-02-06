# OdooChat - Guía de Troubleshooting

Este documento contiene los errores comunes y soluciones probadas para la integración de Odoo con Supabase Edge Functions.

---

## Arquitectura

```
┌─────────────┐      ┌─────────────────────┐      ┌─────────────┐
│  React App  │ ───▶ │  Supabase Edge Fn   │ ───▶ │  Odoo API   │
│  (Frontend) │      │  (process-chat)     │      │  /jsonrpc   │
└─────────────┘      └─────────────────────┘      └─────────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  OpenAI API     │
                     │  (Function Call)│
                     └─────────────────┘
```

**Credenciales almacenadas en:** Supabase Edge Function Secrets

---

## Errores Comunes y Soluciones

### 1. "No se pudo obtener sesión de Odoo"

**Causa:** El código intenta extraer `session_id` del header `set-cookie`, pero Deno Edge Functions no pueden leer este header.

**Solución:** Usar `/jsonrpc` con estilo XML-RPC en lugar de `/web/session/authenticate`:

```typescript
// ❌ MAL - requiere cookies
const response = await fetch(`${ODOO_URL}/web/session/authenticate`, {...})
const sessionId = response.headers.get('set-cookie') // NO FUNCIONA EN DENO

// ✅ BIEN - pasa credenciales directamente
const response = await fetch(`${ODOO_URL}/jsonrpc`, {
  method: 'POST',
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'call',
    params: {
      service: 'common',
      method: 'authenticate',
      args: [DATABASE, USERNAME, PASSWORD, {}]
    },
    id: Date.now()
  })
})
// Devuelve UID directamente, sin necesidad de cookies
```

---

### 2. "Cannot convert field to SQL because it is not stored"

**Error completo:** `Cannot convert product.product.qty_available to SQL because it is not stored`

**Causa:** `qty_available` es un campo calculado (computed field) en Odoo. No se puede usar en `ORDER BY`.

**Campos afectados:**
- `product.product.qty_available` - Stock disponible
- `product.product.virtual_available` - Stock virtual
- `res.partner.total_due` - Deuda total (sin módulo contabilidad)
- Cualquier campo definido con `compute=` en el modelo

**Solución:** Ordenar en JavaScript después de obtener los datos:

```typescript
// ❌ MAL - causa error
const products = await callOdooRPC(uid, 'product.product', 'search_read',
  [[], ['name', 'qty_available']],
  { limit: 20, order: 'qty_available asc' }  // ERROR!
)

// ✅ BIEN - ordenar después
let products = await callOdooRPC(uid, 'product.product', 'search_read',
  [[], ['name', 'qty_available']],
  { limit: 100 }  // Traer más para ordenar correctamente
)
products.sort((a, b) => (a.qty_available || 0) - (b.qty_available || 0))
products = products.slice(0, 20)  // Aplicar limit después
```

---

### 3. "Object account.move doesn't exist"

**Causa:** El módulo de Facturación (Invoicing) no está instalado en Odoo.

**Solución:** No usar modelos de contabilidad si no está el módulo:
- `account.move` - Facturas
- `account.payment` - Pagos
- `res.partner.total_due` - Campo de deuda

**Módulos disponibles en Odoo SaaS trial:**
| Módulo | Modelo principal | Disponible |
|--------|------------------|------------|
| CRM | `crm.lead` | ✅ |
| Projects | `project.task` | ✅ |
| Inventory | `product.product` | ✅ |
| Contacts | `res.partner` | ✅ |
| Activities | `mail.activity` | ✅ |
| Invoicing | `account.move` | ❌ (no instalado) |

---

### 4. "Invalid field res.partner.total_due"

**Causa:** El campo `total_due` no existe sin el módulo de contabilidad.

**Solución:** Remover referencias a campos de contabilidad. Usar solo campos base de `res.partner`:
- `name`, `email`, `phone`, `mobile`
- `is_company`, `company_type`
- `street`, `city`, `country_id`
- `create_date`, `write_date`

---

### 5. Contraseñas con caracteres especiales

**Síntoma:** La autenticación falla aunque las credenciales son correctas.

**Causa:** Caracteres como `%`, `@`, `#`, `&` en la contraseña.

**Solución:** Las contraseñas van en el body JSON, NO en la URL. No necesitan encoding especial:

```typescript
// ✅ Funciona bien - los caracteres especiales van en JSON
const password = "*9hagGT2z%"  // El % no causa problemas
body: JSON.stringify({
  params: {
    args: [DATABASE, USERNAME, password, {}]  // Va en el body, no URL
  }
})
```

**Importante:** Guardar en Supabase Edge Function Secrets, no en código.

---

### 6. "Necesito que configures la conexión a Odoo"

**Causa:** Las credenciales de Odoo no están configuradas en Edge Function Secrets.

**Solución:** Configurar en Supabase Dashboard:
1. Project Settings → Edge Functions → Secrets
2. Agregar:
   - `ODOO_URL` = `https://tuempresa.odoo.com`
   - `ODOO_DATABASE` = `nombre-db`
   - `ODOO_USERNAME` = `usuario@email.com`
   - `ODOO_PASSWORD` = `contraseña`

---

## Tools Disponibles en Edge Function

La Edge Function `process-chat` tiene estas tools para OpenAI Function Calling:

| Tool | Modelo Odoo | Descripción |
|------|-------------|-------------|
| `get_products` | `product.product` | Buscar productos, ver stock |
| `get_customers` | `res.partner` | Listar clientes/contactos |
| `get_crm_pipeline` | `crm.lead` | Ver oportunidades de venta |
| `get_tasks` | `project.task` | Tareas de proyectos |
| `get_activities` | `mail.activity` | Actividades pendientes |

---

## Endpoints de Odoo

| Endpoint | Uso | Requiere cookies |
|----------|-----|------------------|
| `/web/session/authenticate` | Web login | ✅ Sí |
| `/web/dataset/call_kw` | Web API | ✅ Sí |
| `/jsonrpc` | XML-RPC style | ❌ **No** |
| `/xmlrpc/2/common` | XML-RPC puro | ❌ No |
| `/xmlrpc/2/object` | XML-RPC puro | ❌ No |

**Para Edge Functions usar siempre `/jsonrpc`** - pasa credenciales en el body.

---

## Patrón de Autenticación Correcto

```typescript
const ODOO_URL = Deno.env.get('ODOO_URL')
const ODOO_DATABASE = Deno.env.get('ODOO_DATABASE')
const ODOO_USERNAME = Deno.env.get('ODOO_USERNAME')
const ODOO_PASSWORD = Deno.env.get('ODOO_PASSWORD')

// 1. Autenticar - obtiene UID
async function authenticateOdoo(): Promise<number> {
  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'common',
        method: 'authenticate',
        args: [ODOO_DATABASE, ODOO_USERNAME, ODOO_PASSWORD, {}]
      },
      id: Date.now()
    })
  })
  const data = await response.json()
  if (!data.result) throw new Error('Credenciales inválidas')
  return data.result  // UID
}

// 2. Llamar métodos - pasa credenciales en cada llamada
async function callOdooRPC(
  uid: number,
  model: string,
  method: string,
  args: any[],
  kwargs: any = {}
): Promise<any> {
  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'call',
      params: {
        service: 'object',
        method: 'execute_kw',
        args: [ODOO_DATABASE, uid, ODOO_PASSWORD, model, method, args, kwargs]
      },
      id: Date.now()
    })
  })
  const data = await response.json()
  if (data.error) throw new Error(data.error.data?.message || 'Error Odoo')
  return data.result
}
```

---

## Queries de Ejemplo

### Productos con bajo stock
```typescript
let products = await callOdooRPC(uid, 'product.product', 'search_read', [
  [['qty_available', '>', 0]],  // Solo con stock
  ['name', 'qty_available', 'list_price']
], { limit: 100 })

// Ordenar por stock ascendente (menor primero)
products.sort((a, b) => a.qty_available - b.qty_available)
products = products.slice(0, 10)
```

### Pipeline de ventas
```typescript
const opportunities = await callOdooRPC(uid, 'crm.lead', 'search_read', [
  [['type', '=', 'opportunity']],
  ['name', 'expected_revenue', 'probability', 'stage_id', 'partner_id']
], { limit: 20, order: 'expected_revenue desc' })  // Este campo SÍ es stored
```

### Tareas pendientes
```typescript
const tasks = await callOdooRPC(uid, 'project.task', 'search_read', [
  [['stage_id.fold', '=', false]],  // Etapas no cerradas
  ['name', 'project_id', 'user_ids', 'date_deadline', 'priority']
], { limit: 20 })
```

### Actividades pendientes
```typescript
const activities = await callOdooRPC(uid, 'mail.activity', 'search_read', [
  [['user_id', '=', uid]],  // Asignadas al usuario actual
  ['summary', 'activity_type_id', 'date_deadline', 'res_name', 'res_model']
], { limit: 20, order: 'date_deadline asc' })
```

---

## Verificar Conexión

Para probar que Odoo responde correctamente:

```bash
curl -X POST https://tuempresa.odoo.com/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "common",
      "method": "authenticate",
      "args": ["database", "usuario@email.com", "password", {}]
    },
    "id": 1
  }'
```

**Respuesta exitosa:** `{"jsonrpc": "2.0", "id": 1, "result": 2}` (el número es el UID)

---

## Supabase Project

- **Edge Function:** `process-chat`
- **Logs:** Supabase Dashboard → Edge Functions → process-chat → Logs

---

## Referencias

- [Odoo External API Documentation](https://www.odoo.com/documentation/17.0/developer/reference/external_api.html)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
