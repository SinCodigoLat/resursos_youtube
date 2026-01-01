# 🎨 UI-PROMPT.md - Lovable

> **Objetivo**: Generar la interfaz completa de PIDE en Lovable

---

## 🎯 Concepto

Crea **PIDE** (Pedidos Inteligentes con Diseño Excepcional): un asistente AI de pedidos de comida donde el usuario simplemente expresa su presupuesto o antojo.

**Tagline**: "No navegues. Solo pide."

---

## 🛠️ Stack Tecnológico

```json
{
  "framework": "React 18 + TypeScript + Vite",
  "styling": "Tailwind CSS",
  "components": "Shadcn/ui",
  "routing": "React Router DOM v6",
  "state": "React Hooks + TanStack Query",
  "forms": "React Hook Form + Zod",
  "icons": "Lucide React",
  "notifications": "Sonner",
  "dates": "date-fns (locale español)"
}
```

---

## 🎨 Tema Visual

### Colores (Tema Oscuro)

```css
/* Primarios */
--primary: 24 95% 53%;              /* Naranja #FF6B35 */
--primary-foreground: 0 0% 100%;

/* Sidebar Oscuro */
--sidebar-bg: 240 10% 8%;
--sidebar-fg: 0 0% 95%;
--sidebar-hover: 240 5% 15%;
--sidebar-active: 24 95% 53%;

/* Chat Claro */
--chat-bg: 240 5% 98%;
--chat-user-bg: 24 95% 53%;
--chat-assistant-bg: 0 0% 100%;

/* General */
--radius: 0.75rem;
```

### Tipografía
- **Fuente**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

---

## 📐 Layout

```
┌─────────────────────────────────┐
│ Sidebar  │  Chat Window         │
│ (256px)  │                      │
│          │  Messages            │
│ - Logo   │  Input               │
│ - Chats  │  Suggestions         │
│ - Nav    │                      │
│ - User   │                      │
└─────────────────────────────────┘
```

---

## 🧩 Componentes Core

### 1. Sidebar
**Elementos**:
- Logo "PIDE" + tagline
- Botón "Nuevo Pedido" (naranja, icono +)
- Sección "CONVERSACIONES RECIENTES":
  - Nombre/mensaje inicial
  - Fecha (ej: "1 ene")
  - Precio (ej: "$22")
  - Badge estado (ej: "En Curso")
- Nav: Chat Actual, Mi Perfil, Mis Pedidos, Pagos, Preferencias
- User Profile: Avatar + nombre

**Comportamiento**:
- Colapsable: 256px ↔ 64px
- Estado activo: fondo naranja

---

### 2. ChatWindow
**Estructura de mensaje**:
```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  restaurants?: Restaurant[];
  itemResults?: MenuItemWithRestaurant[];
  showCart?: boolean;
  showCheckout?: boolean;
  visualMenu?: { restaurantName: string; items: MenuItem[] };
  orderStatus?: { id: string; restaurantName: string; status: string };
  timestamp: Date;
}
```

**Sugerencias** (aparecen cuando input vacío):
```typescript
const SUGGESTIONS = [
  { icon: "🍕", label: "Tengo $20 y quiero algo rico" },
  { icon: "🍣", label: "Busco el mejor sushi" },
  { icon: "🥗", label: "Quiero algo saludable" },
  { icon: "🌮", label: "Antojo de comida mexicana" },
];
```

**Mensajes**:
- **Usuario**: Burbuja naranja, derecha, `rounded-2xl rounded-br-md`
- **Asistente**: Burbuja blanca, izquierda, `rounded-2xl rounded-bl-md`

---

### 3. RestaurantCard
```
┌──────────────────────────┐
│ [Img]  │ California Roll │
│ 128px  │ Sushi Master    │
│        │ ⭐4.8 ⏱25 min  │
│        │ 💰$3 · $12.00   │
│        │ [Pedir][Menú]   │
└──────────────────────────┘
```

**Props**:
```typescript
interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    cuisineType: string;
    rating: number;
    deliveryTime: string;
    deliveryFee: number;
    affordableItems: MenuItem[];
  };
  onAddToCart: (item: MenuItem) => void;
  onViewMenu: (id: string) => void;
}
```

---

### 4. MenuItemCard
Similar a RestaurantCard pero para items individuales.

---

### 5. CartSummary
**Elementos**:
- Lista items con controles +/- y 🗑️
- Resumen:
  ```
  Subtotal:  $24.00
  Envío:     $ 3.00
  ─────────────────
  Total:     $27.00
  ```
- Botón "Confirmar Pedido"

---

### 6. CheckoutForm
**Campos**:
- Nombre (min 2 chars)
- Teléfono (min 8 chars)
- Dirección (min 5 chars)

**Validación**: React Hook Form + Zod

---

### 7. OrderTrackingCard
**Timeline**:
```
⏱️ Pendiente → 📦 Preparando → 🚚 En camino → ✅ Entregado
```

**Estados con colores**:
- PENDING: amarillo
- PREPARING: naranja
- SHIPPED: azul
- DELIVERED: verde
- CANCELLED: rojo

---

### 8. VisualMenu
Grid responsive de items del restaurante con botón "Agregar".

---

## 📄 Páginas (Routes)

### `/` - Chat Principal
```tsx
<div className="flex h-screen">
  <Sidebar />
  <main className="flex-1"><ChatWindow /></main>
</div>
```

### `/profile` - Perfil
Formulario editable: nombre, teléfono, dirección

### `/orders` - Historial
- Lista pedidos: ID, restaurante, estado, items, total
- Modal con detalles completos
- Botón "Pagar Ahora" si PENDING

### `/payment` - Métodos de Pago
Gestión de métodos guardados

### `/settings` - Preferencias
Configuraciones usuario

---

## 📊 Tipos TypeScript

```typescript
interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string; // "Japonesa", "Mexicana", etc.
  rating: number;
  delivery_time: string; // "25-35 min"
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

interface Order {
  id: string;
  user_id?: string;
  restaurant_id?: string;
  items: CartItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  delivery_address?: string;
  created_at: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
```

---

## 🎯 Flujos Usuario

### Flujo 1: Búsqueda y Pedido
1. Usuario: "Tengo $20 y quiero algo rico"
2. AI → RestaurantCard(s)
3. Click "Pedir" → CartSummary
4. "Confirmar" → CheckoutForm
5. Submit → Crear pedido (mock)

### Flujo 2: Items Específicos
1. Usuario: "Quiero tacos"
2. AI → MenuItemCard(s)
3. Mismo flujo de carrito

### Flujo 3: Tracking
1. Usuario: "¿Dónde está mi pedido?"
2. AI → OrderTrackingCard

---

## 📦 Datos Mock

```typescript
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Sushi Master",
    cuisine_type: "Japonesa",
    rating: 4.8,
    delivery_time: "25-35 min",
    delivery_fee: 3.00,
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351"
  },
  {
    id: "2",
    name: "Taco Loco",
    cuisine_type: "Mexicana",
    rating: 4.6,
    delivery_time: "20-30 min",
    delivery_fee: 2.50,
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
  }
];

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    restaurant_id: "1",
    name: "California Roll (8 piezas)",
    description: "Cangrejo, aguacate, pepino",
    price: 12.00,
    category: "Rolls",
    available: true,
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351"
  }
];
```

**Tipos de cocina**: Japonesa, Italiana, Mexicana, Americana, Saludable

---

## 🎨 Detalles UI

### Chat Input
- Fondo: `bg-secondary`
- Border: `rounded-2xl`
- Textarea auto-expandible (máx 128px)
- Botón envío: circular naranja
- Placeholder: "Escribe tu pedido... (ej: Tengo $30 y quiero sushi)"

### Animaciones
- **slide-up**: Elementos nuevos
- **fade-in**: Transiciones
- **Hover**: Sombra + escala sutil

---

## ✅ Checklist Implementación

- [ ] Sidebar (colapsable)
- [ ] ChatWindow (mensajes + input + sugerencias)
- [ ] RestaurantCard
- [ ] MenuItemCard
- [ ] CartSummary
- [ ] CheckoutForm
- [ ] OrderTrackingCard
- [ ] VisualMenu
- [ ] Página: Index (/)
- [ ] Página: Profile (/profile)
- [ ] Página: Orders (/orders)
- [ ] Página: Payment (/payment)
- [ ] Página: Settings (/settings)
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Tema oscuro aplicado
- [ ] Animaciones suaves

---

## 🎯 Resultado Esperado

UI completa y funcional con:
- ✅ Interfaz tipo ChatGPT
- ✅ Sidebar oscuro colapsable
- ✅ Widgets dinámicos en mensajes
- ✅ Gestión visual de carrito
- ✅ Formularios validados
- ✅ Responsive y accesible
- ✅ Datos mock para desarrollo

**Siguiente paso**: Descargar código → Backend en Supabase
