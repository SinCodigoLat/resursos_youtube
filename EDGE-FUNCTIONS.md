# ⚡ EDGE-FUNCTIONS.md - Supabase Edge Functions

> **Objetivo**: Implementar funciones serverless para chat AI y pagos

---

## 📋 Índice

1. [Setup Inicial](#1-setup-inicial)
2. [Función: chat](#2-función-chat)
3. [Función: pay](#3-función-pay)
4. [Testing Local](#4-testing-local)
5. [Deploy a Producción](#5-deploy-a-producción)
6. [Monitoreo](#6-monitoreo)

---

## 1. Setup Inicial

### Paso 1.1: Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# npm (todas las plataformas)
npm install -g supabase
```

### Paso 1.2: Login a Supabase

```bash
supabase login
```

Esto abrirá el navegador para autenticarse.

### Paso 1.3: Link al Proyecto

```bash
# Obtener project-id desde Dashboard → Settings → General
supabase link --project-ref [PROJECT_ID]
```

### Paso 1.4: Crear Estructura de Funciones

```bash
# Crear directorio de funciones
supabase functions new chat
supabase functions new pay
```

Esto crea:
```
supabase/
  functions/
    chat/
      index.ts
    pay/
      index.ts
```

---

## 2. Función: chat

### Paso 2.1: Archivo `supabase/functions/chat/index.ts`

```typescript
// =====================================================
// PIDE CHAT EDGE FUNCTION
// Maneja conversación con AI y búsqueda de restaurantes
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =====================================================
// TYPES
// =====================================================
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  session_id: string;
  user_id: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  rating: number;
  delivery_time: string;
  delivery_fee: number;
  image_url?: string;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  available: boolean;
}

// =====================================================
// HELPERS
// =====================================================

// Normalizar tipo de cocina
function normalizeCuisine(text: string): string | null {
  const cuisineMap: Record<string, string> = {
    'sushi': 'Japonesa',
    'japonesa': 'Japonesa',
    'japonés': 'Japonesa',
    'japanese': 'Japonesa',
    
    'taco': 'Mexicana',
    'tacos': 'Mexicana',
    'mexicana': 'Mexicana',
    'burrito': 'Mexicana',
    'mexican': 'Mexicana',
    
    'pizza': 'Italiana',
    'italiana': 'Italiana',
    'pasta': 'Italiana',
    'italian': 'Italiana',
    
    'burger': 'Americana',
    'hamburguesa': 'Americana',
    'americana': 'Americana',
    'american': 'Americana',
    
    'ensalada': 'Saludable',
    'saludable': 'Saludable',
    'healthy': 'Saludable',
    'bowl': 'Saludable',
  };
  
  const lowerText = text.toLowerCase();
  
  for (const [key, value] of Object.entries(cuisineMap)) {
    if (lowerText.includes(key)) {
      return value;
    }
  }
  
  return null;
}

// Clasificar intención del usuario
function classifyIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Tracking
  if (lowerText.includes('dónde') || lowerText.includes('pedido') || lowerText.includes('estado')) {
    return 'TRACKING';
  }
  
  // Ver menú
  if (lowerText.includes('menú') || lowerText.includes('menu') || lowerText.includes('ver más')) {
    return 'VIEW_MENU';
  }
  
  // Carrito/Orden
  if (lowerText.includes('carrito') || lowerText.includes('confirmar') || lowerText.includes('pedir')) {
    return 'ORDER';
  }
  
  // Búsqueda de items específicos
  const itemKeywords = ['quiero', 'busco', 'antojo', 'me gustaría'];
  if (itemKeywords.some(kw => lowerText.includes(kw))) {
    return 'SEARCH_ITEM';
  }
  
  // Búsqueda de restaurante (con presupuesto o tipo)
  if (lowerText.includes('$') || lowerText.includes('tengo') || normalizeCuisine(text)) {
    return 'SEARCH_RESTAURANT';
  }
  
  return 'GENERAL';
}

// Extraer presupuesto del texto
function extractBudget(text: string): number | null {
  const match = text.match(/\$?\s*(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : null;
}

// =====================================================
// MAIN HANDLER
// =====================================================
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { messages, session_id, user_id }: ChatRequest = await req.json()
    const lastUserMessage = messages[messages.length - 1].content
    
    console.log('Processing message:', lastUserMessage)
    
    // Clasificar intención
    const intent = classifyIntent(lastUserMessage)
    console.log('Intent classified:', intent)
    
    let response: any = {
      role: 'assistant',
      content: '',
      intent,
    }
    
    // =====================================================
    // TRACKING
    // =====================================================
    if (intent === 'TRACKING') {
      // Buscar último pedido del usuario
      const { data: order } = await supabase
        .from('orders')
        .select('id, restaurant_id, status, restaurants(name)')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (order) {
        response.content = `Tu pedido está **${order.status}**. Te mantendremos actualizado.`
        response.orderStatus = {
          id: order.id,
          restaurantName: order.restaurants?.name || 'Restaurante',
          status: order.status,
        }
      } else {
        response.content = 'No encontré ningún pedido activo. ¿Quieres hacer uno nuevo?'
      }
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // =====================================================
    // SEARCH_RESTAURANT
    // =====================================================
    if (intent === 'SEARCH_RESTAURANT') {
      const budget = extractBudget(lastUserMessage)
      const cuisine = normalizeCuisine(lastUserMessage)
      
      console.log('Budget:', budget, 'Cuisine:', cuisine)
      
      let query = supabase
        .from('restaurants')
        .select(`
          id,
          name,
          cuisine_type,
          rating,
          delivery_time,
          delivery_fee,
          image_url,
          menu_items (
            id,
            name,
            description,
            price,
            image_url
          )
        `)
        .order('rating', { ascending: false })
      
      // Filtrar por tipo de cocina
      if (cuisine) {
        query = query.eq('cuisine_type', cuisine)
      }
      
      const { data: restaurants, error } = await query
      
      if (error) throw error
      
      // Filtrar items por presupuesto si existe
      const processedRestaurants = restaurants?.map((r: any) => {
        let affordableItems = r.menu_items || []
        
        if (budget) {
          affordableItems = affordableItems.filter(
            (item: any) => item.price <= budget - r.delivery_fee
          )
        }
        
        return {
          ...r,
          affordableItems: affordableItems.slice(0, 3), // Solo primeros 3
        }
      }).filter(r => r.affordableItems.length > 0) || []
      
      if (processedRestaurants.length === 0) {
        response.content = budget
          ? `No encontré opciones con ese presupuesto de $${budget}. ¿Quieres ajustar tu búsqueda?`
          : cuisine
          ? `No encontré restaurantes de comida ${cuisine}. ¿Te interesa otro tipo?`
          : 'No encontré restaurantes disponibles. ¿Pruebas con otro criterio?'
      } else {
        response.content = budget
          ? `Encontré ${processedRestaurants.length} opciones con tu presupuesto de $${budget}. ¡Echa un vistazo! 🍽️`
          : cuisine
          ? `Aquí tienes los mejores de comida ${cuisine}. ¿Cuál te llama la atención?`
          : `Encontré estas opciones para ti. ¿Te gusta alguna?`
        
        response.restaurants = processedRestaurants
      }
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // =====================================================
    // SEARCH_ITEM
    // =====================================================
    if (intent === 'SEARCH_ITEM') {
      // Extraer keywords del mensaje (eliminar palabras comunes)
      const stopwords = ['quiero', 'busco', 'antojo', 'me', 'gustaría', 'de', 'un', 'una', 'unos', 'unas']
      const keywords = lastUserMessage
        .toLowerCase()
        .split(' ')
        .filter(word => !stopwords.includes(word) && word.length > 2)
        .join(' ')
      
      console.log('Searching items with keywords:', keywords)
      
      const { data: items, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          image_url,
          restaurant:restaurants (
            id,
            name,
            cuisine_type,
            rating,
            delivery_time,
            delivery_fee
          )
        `)
        .ilike('name', `%${keywords}%`)
        .eq('available', true)
        .limit(10)
      
      if (error) throw error
      
      if (!items || items.length === 0) {
        response.content = `No encontré "${keywords}" en el menú. ¿Quieres buscar algo diferente?`
      } else {
        response.content = `Encontré ${items.length} opciones de "${keywords}". ¿Cuál te tienta?`
        response.itemResults = items
      }
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // =====================================================
    // ORDER (Mostrar carrito)
    // =====================================================
    if (intent === 'ORDER') {
      // Obtener estado del usuario
      const { data: userState } = await supabase
        .from('user_states')
        .select('cart')
        .eq('user_id', user_id)
        .single()
      
      const cart = userState?.cart || []
      
      if (cart.length === 0) {
        response.content = 'Tu carrito está vacío. ¿Qué te gustaría pedir?'
      } else {
        response.content = 'Aquí está tu carrito. ¿Listo para confirmar?'
        response.showCart = true
        response.cart = cart
      }
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // =====================================================
    // GENERAL (Fallback)
    // =====================================================
    response.content = `¡Hola! 👋 Soy tu asistente de pedidos. Puedo ayudarte a:

• Buscar restaurantes por presupuesto o tipo de comida
• Encontrar platos específicos
• Ver menús completos
• Gestionar tu carrito
• Rastrear tus pedidos

¿Qué te gustaría pedir hoy?`
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

---

## 3. Función: pay

### Paso 3.1: Archivo `supabase/functions/pay/index.ts`

```typescript
// =====================================================
// PIDE PAY EDGE FUNCTION
// Crea sesión de pago en Stripe
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PayRequest {
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    })

    const { orderId, successUrl, cancelUrl }: PayRequest = await req.json()
    
    // Obtener orden
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, restaurants(name)')
      .eq('id', orderId)
      .single()
    
    if (orderError || !order) {
      throw new Error('Order not found')
    }
    
    // Crear line items de Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Pedido de ${order.restaurants?.name || 'Restaurante'}`,
            description: `${order.items.length} items`,
          },
          unit_amount: Math.round(order.total * 100), // Convertir a centavos
        },
        quantity: 1,
      },
    ]
    
    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        order_id: orderId,
      },
    })
    
    // Guardar session_id en orden
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)
    
    return new Response(
      JSON.stringify({ checkoutUrl: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
```

---

## 4. Testing Local

### Paso 4.1: Configurar Variables de Entorno

Crear `supabase/.env`:

```bash
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
STRIPE_SECRET_KEY=sk_test_[YOUR_STRIPE_TEST_KEY]
```

### Paso 4.2: Iniciar Supabase Local

```bash
supabase start
```

### Paso 4.3: Servir Función Local

```bash
# Terminal 1: Chat function
supabase functions serve chat --env-file supabase/.env

# Terminal 2: Pay function
supabase functions serve pay --env-file supabase/.env
```

### Paso 4.4: Test con cURL

**Test Chat:**
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/chat' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{
    "messages": [{"role": "user", "content": "Tengo $20 y quiero sushi"}],
    "session_id": "test-session",
    "user_id": "test-user"
  }'
```

**Test Pay:**
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/pay' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{
    "orderId": "[ORDER_ID]",
    "successUrl": "http://localhost:5173/success",
    "cancelUrl": "http://localhost:5173/cancel"
  }'
```

---

## 5. Deploy a Producción

### Paso 5.1: Configurar Secrets

```bash
# Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_live_[YOUR_STRIPE_LIVE_KEY]

# Otros (ya están configurados automáticamente)
# SUPABASE_URL y SUPABASE_ANON_KEY
```

### Paso 5.2: Deploy Chat Function

```bash
supabase functions deploy chat
```

### Paso 5.3: Deploy Pay Function

```bash
supabase functions deploy pay
```

### Paso 5.4: Verificar Deploy

```bash
supabase functions list
```

Deberías ver:
```
NAME  STATUS   REGION
chat  active   us-east-1
pay   active   us-east-1
```

---

## 6. Monitoreo

### Paso 6.1: Ver Logs en Tiempo Real

```bash
# Logs de chat
supabase functions logs chat

# Logs de pay
supabase functions logs pay
```

### Paso 6.2: Dashboard de Supabase

**Edge Functions → [Función] → Metrics**

Monitorear:
- Invocations (llamadas)
- Errors (errores)
- Response Time (tiempo de respuesta)
- Bandwidth (ancho de banda)

---

## 🎯 URLs de Producción

Después del deploy:

```bash
Chat Function:
https://[PROJECT_ID].supabase.co/functions/v1/chat

Pay Function:
https://[PROJECT_ID].supabase.co/functions/v1/pay
```

---

## 🔧 Troubleshooting

### Error: "Function not found"
```bash
# Re-deploy
supabase functions deploy [function-name]
```

### Error: "CORS"
Verificar que `corsHeaders` estén en todas las respuestas.

### Error: "Unauthorized"
Verificar que el header `Authorization: Bearer [ANON_KEY]` esté presente.

### Error: Timeout
Aumentar límite (por defecto: 150s):
```bash
# En deploy
supabase functions deploy chat --timeout 300
```

---

## ✅ Checklist

- [ ] CLI instalada y logueada
- [ ] Proyecto linkeado
- [ ] Función `chat` creada y deployada
- [ ] Función `pay` creada y deployada
- [ ] Secrets configurados (Stripe)
- [ ] Testing local exitoso
- [ ] Deploy a producción exitoso
- [ ] Logs monitoreados

---

## 🚀 Siguiente Paso

**→ INTEGRATION.md**: Conectar frontend con backend
