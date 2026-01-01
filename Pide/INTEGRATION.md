# 🔌 INTEGRATION.md - Conectar Frontend y Backend

> **Objetivo**: Integrar UI de Lovable con Supabase y Edge Functions

---

## 📋 Índice

1. [Configurar Supabase Client](#1-configurar-supabase-client)
2. [Implementar Autenticación](#2-implementar-autenticación)
3. [Integrar Chat con Edge Function](#3-integrar-chat-con-edge-function)
4. [Gestión de Carrito](#4-gestión-de-carrito)
5. [Integrar Pagos](#5-integrar-pagos)
6. [Realtime (Opcional)](#6-realtime-opcional)
7. [Testing de Integración](#7-testing-de-integración)

---

## 1. Configurar Supabase Client

### Paso 1.1: Instalar Dependencias

```bash
npm install @supabase/supabase-js
# o
yarn add @supabase/supabase-js
```

### Paso 1.2: Crear Variables de Entorno

Crear `.env.local`:

```bash
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]
```

### Paso 1.3: Crear Cliente de Supabase

`src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 2. Implementar Autenticación

### Paso 2.1: Hook de Autenticación

`src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Login anónimo
  const signInAnonymously = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      setUser(data.user)
      return data
    } catch (error) {
      console.error('Error signing in anonymously:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return {
    user,
    loading,
    signInAnonymously,
    signOut,
  }
}
```

### Paso 2.2: Proteger App con Auth

`src/App.tsx`:

```typescript
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

function App() {
  const { user, loading, signInAnonymously } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      signInAnonymously()
    }
  }, [loading, user, signInAnonymously])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    // Tu app aquí
  )
}
```

---

## 3. Integrar Chat con Edge Function

### Paso 3.1: Hook para Chat

`src/hooks/useChat.ts`:

```typescript
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { v4 as uuidv4 } from 'uuid'

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  restaurants?: any[];
  itemResults?: any[];
  showCart?: boolean;
  showCheckout?: boolean;
  visualMenu?: any;
  orderStatus?: any;
  timestamp: Date;
}

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(uuidv4())

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Llamar a Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          session_id: sessionId,
          user_id: user.id,
        },
      })

      if (error) throw error

      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.content,
        restaurants: data.restaurants,
        itemResults: data.itemResults,
        showCart: data.showCart,
        showCheckout: data.showCheckout,
        visualMenu: data.visualMenu,
        orderStatus: data.orderStatus,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Guardar mensajes en DB (opcional)
      await Promise.all([
        supabase.from('chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'user',
          content: userMessage.content,
        }),
        supabase.from('chat_messages').insert({
          session_id: sessionId,
          user_id: user.id,
          role: 'assistant',
          content: assistantMessage.content,
          metadata: {
            restaurants: data.restaurants,
            itemResults: data.itemResults,
            showCart: data.showCart,
            orderStatus: data.orderStatus,
          },
        }),
      ])

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Mensaje de error
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: 'Lo siento, hubo un error. ¿Puedes intentar de nuevo?',
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
  }
}
```

### Paso 3.2: Usar en ChatWindow

`src/components/ChatWindow.tsx`:

```typescript
import { useChat } from '@/hooks/useChat'
import { RestaurantCard } from './RestaurantCard'
import { MenuItemCard } from './MenuItemCard'
import { CartSummary } from './CartSummary'
import { CheckoutForm } from './CheckoutForm'
import { OrderTrackingCard } from './OrderTrackingCard'

export function ChatWindow() {
  const { messages, isLoading, sendMessage } = useChat()
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl p-4",
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-white border rounded-bl-md'
              )}
            >
              {/* Contenido del mensaje */}
              <p>{message.content}</p>

              {/* Widgets dinámicos */}
              {message.restaurants && (
                <div className="mt-4 space-y-3">
                  {message.restaurants.map(r => (
                    <RestaurantCard key={r.id} restaurant={r} />
                  ))}
                </div>
              )}

              {message.itemResults && (
                <div className="mt-4 space-y-3">
                  {message.itemResults.map(item => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              )}

              {message.showCart && <CartSummary />}
              
              {message.showCheckout && <CheckoutForm />}
              
              {message.orderStatus && (
                <OrderTrackingCard {...message.orderStatus} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-2xl rounded-bl-md p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pedido..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
```

---

## 4. Gestión de Carrito

### Paso 4.1: Hook de Carrito

`src/hooks/useCart.ts`:

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurant_id: string;
}

export function useCart() {
  const { user } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar carrito desde DB
  useEffect(() => {
    if (!user) return

    const loadCart = async () => {
      const { data } = await supabase
        .from('user_states')
        .select('cart')
        .eq('user_id', user.id)
        .single()

      setCart(data?.cart || [])
      setLoading(false)
    }

    loadCart()
  }, [user])

  // Sincronizar carrito con DB
  const syncCart = async (newCart: CartItem[]) => {
    if (!user) return

    await supabase
      .from('user_states')
      .upsert({
        user_id: user.id,
        cart: newCart,
        updated_at: new Date().toISOString(),
      })
  }

  const addToCart = async (item: CartItem) => {
    const existingItem = cart.find(i => i.id === item.id)
    
    let newCart: CartItem[]
    if (existingItem) {
      newCart = cart.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    } else {
      newCart = [...cart, { ...item, quantity: 1 }]
    }

    setCart(newCart)
    await syncCart(newCart)
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id)
      return
    }

    const newCart = cart.map(item =>
      item.id === id ? { ...item, quantity } : item
    )

    setCart(newCart)
    await syncCart(newCart)
  }

  const removeFromCart = async (id: string) => {
    const newCart = cart.filter(item => item.id !== id)
    setCart(newCart)
    await syncCart(newCart)
  }

  const clearCart = async () => {
    setCart([])
    await syncCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  // Asumimos fee del primer item (todos deberían ser del mismo restaurante)
  const deliveryFee = cart.length > 0 ? 3.00 : 0
  const total = subtotal + deliveryFee

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    total,
  }
}
```

### Paso 4.2: Usar en Componentes

```typescript
// En RestaurantCard.tsx
const { addToCart } = useCart()

const handleAddToCart = (item: MenuItem) => {
  addToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: 1,
    restaurant_id: restaurant.id,
  })
  
  toast.success(`${item.name} agregado al carrito`)
}
```

---

## 5. Integrar Pagos

### Paso 5.1: Crear Pedido y Pagar

`src/hooks/useOrders.ts`:

```typescript
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useCart } from './useCart'

export function useOrders() {
  const { user } = useAuth()
  const { cart, clearCart, total, subtotal, deliveryFee } = useCart()

  const createOrderAndPay = async (deliveryData: {
    name: string;
    phone: string;
    address: string;
  }) => {
    if (!user || cart.length === 0) return

    try {
      // Crear pedido
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          restaurant_id: cart[0].restaurant_id,
          items: cart,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          delivery_name: deliveryData.name,
          delivery_phone: deliveryData.phone,
          delivery_address: deliveryData.address,
          status: 'PENDING',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Llamar Edge Function de pago
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('pay', {
        body: {
          orderId: order.id,
          successUrl: `${window.location.origin}/orders?success=true`,
          cancelUrl: `${window.location.origin}/orders?cancelled=true`,
        },
      })

      if (paymentError) throw paymentError

      // Limpiar carrito
      await clearCart()

      // Redirigir a Stripe Checkout
      window.location.href = paymentData.checkoutUrl

    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Error al procesar el pago')
    }
  }

  return {
    createOrderAndPay,
  }
}
```

### Paso 5.2: Usar en CheckoutForm

```typescript
// En CheckoutForm.tsx
const { createOrderAndPay } = useOrders()

const onSubmit = async (data: FormData) => {
  await createOrderAndPay(data)
}
```

---

## 6. Realtime (Opcional)

### Paso 6.1: Suscribirse a Cambios de Pedido

```typescript
// En OrderTrackingCard.tsx
useEffect(() => {
  if (!orderId) return

  const subscription = supabase
    .channel(`order:${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        setStatus(payload.new.status)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [orderId])
```

---

## 7. Testing de Integración

### Paso 7.1: Test Manual

**Checklist**:
- [ ] Login anónimo funciona
- [ ] Chat envía mensajes
- [ ] Búsqueda de restaurantes funciona
- [ ] Búsqueda de items funciona
- [ ] Agregar al carrito funciona
- [ ] Actualizar cantidades funciona
- [ ] Checkout crea pedido
- [ ] Redirección a Stripe funciona
- [ ] Tracking de pedido funciona

### Paso 7.2: Test de Edge Functions

```bash
# Desde DevTools Console
const response = await fetch('https://[PROJECT_ID].supabase.co/functions/v1/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer [ANON_KEY]',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Tengo $20' }],
    session_id: 'test',
    user_id: 'test',
  }),
})

const data = await response.json()
console.log(data)
```

---

## ✅ Checklist de Integración

- [ ] Supabase client configurado
- [ ] Variables de entorno (.env.local)
- [ ] Hook useAuth implementado
- [ ] Hook useChat implementado
- [ ] Hook useCart implementado
- [ ] Hook useOrders implementado
- [ ] Componentes conectados
- [ ] Edge Functions funcionando
- [ ] Stripe configurado
- [ ] Testing manual completo

---

## 🚀 Siguiente Paso

**→ DEPLOYMENT.md**: Desplegar aplicación completa
