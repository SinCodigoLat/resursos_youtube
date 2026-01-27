# UI-PROMPT.md - Lovable

Prompt para generar la interfaz de Fit AI Coach en Lovable.

---

## Prompt

Crea **Fit AI Coach**: una plataforma SaaS de gestion para gimnasios con asistente de IA por WhatsApp.

### Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router DOM v6
- TanStack Query
- React Hook Form + Zod
- Lucide React (iconos)
- Recharts (graficos)
- Framer Motion (animaciones)

### Tema Visual
- **Modo oscuro** como default
- Fondo principal: `#0a0a0f` (casi negro con tinte azul)
- Acento primario: `#6366f1` (indigo/violeta)
- Acento secundario: `#22c55e` (verde para estados activos)
- Glassmorphism en cards de landing
- Bordes sutiles con `border-white/10`

### Paginas

#### 1. Landing Page (/)
- Hero con gradiente animado
- Features grid (6 cards con iconos)
- Seccion de pricing (3 planes)
- CTA final
- Botones: "Iniciar Gratis" y "Ver Demo"

#### 2. Login (/login)
- Formulario centrado con fondo blur
- Email + Password
- Link a registro

#### 3. Registro (/register)
- Nombre del gimnasio
- Email + Password
- Acepto terminos

#### 4. Dashboard (/dashboard)
Layout con sidebar oscuro colapsable:

**Sidebar**:
- Logo "Fit AI Coach"
- Menu: Mensajes, Miembros, Membresias, Clases, Pagos, Configuracion
- Icono de estado (online/offline)

**Contenido principal** (cambia por seccion):

##### Mensajes (/dashboard/messages)
Clon de WhatsApp:
- Lista de conversaciones (izquierda)
- Chat activo (derecha)
- Input de mensaje
- Badge de mensajes sin leer
- Indicador "IA" en mensajes automaticos

##### Miembros (/dashboard/members)
- Header: titulo + boton "Nuevo Miembro"
- Barra de busqueda + filtros (estado, plan)
- Tabla con columnas: Nombre, Telefono, Plan, Estado, Vencimiento, Acciones
- Estados con badges de colores:
  - Activo: verde
  - Pendiente: amarillo
  - Vencido: rojo
- Modal para crear/editar miembro

##### Membresias (/dashboard/plans)
- Grid de cards (3 columnas)
- Cada card: nombre, precio, duracion, beneficios, color
- Boton editar/eliminar
- Modal para crear/editar plan
- Input de beneficios como chips/tags

##### Clases (/dashboard/classes)
- Vista calendario semanal (7 columnas)
- Clases como bloques de colores
- Click en clase → modal con detalles y lista de inscritos
- Boton "Nueva Clase"
- Colores por tipo: yoga(verde), spinning(naranja), crossfit(rojo)

##### Pagos (/dashboard/payments)
- Stats cards: Total mes, Pendientes, Completados
- Grafico de barras (ultimos 6 meses)
- Tabla de transacciones recientes
- Columnas: Fecha, Miembro, Plan, Monto, Estado, Metodo

##### Configuracion (/dashboard/settings)
- Tabs: Perfil | WhatsApp | IA
- Perfil: nombre gym, logo, direccion, telefono
- WhatsApp: numero conectado, estado
- IA: textarea para instrucciones personalizadas

### Tipos TypeScript

```typescript
interface Gym {
  id: string;
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  whatsapp_number?: string;
  ai_instructions?: string;
}

interface Member {
  id: string;
  gym_id: string;
  name: string;
  phone: string;
  email?: string;
  plan_id?: string;
  status: 'active' | 'pending' | 'expired';
  start_date?: string;
  end_date?: string;
  stripe_customer_id?: string;
}

interface MembershipPlan {
  id: string;
  gym_id: string;
  name: string;
  price: number;
  duration_days: number;
  benefits?: string[];
  color?: string;
  stripe_price_id?: string;
}

interface GymClass {
  id: string;
  gym_id: string;
  name: string;
  instructor: string;
  day_of_week: number; // 0-6
  time: string; // "07:00"
  duration_minutes: number;
  capacity: number;
  color?: string;
}

interface ClassBooking {
  id: string;
  class_id: string;
  member_id: string;
  booking_date: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

interface Payment {
  id: string;
  gym_id: string;
  member_id?: string;
  plan_id?: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: 'stripe' | 'cash' | 'transfer';
  paid_at?: string;
}

interface Conversation {
  id: string;
  gym_id: string;
  phone: string;
  name?: string;
  member_id?: string;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  is_from_ai: boolean;
  created_at: string;
}
```

### Datos Mock

```typescript
const mockPlans = [
  { id: '1', name: 'Basico', price: 30, duration_days: 30, color: '#6b7280', benefits: ['Acceso gym', '2 clases/semana'] },
  { id: '2', name: 'Premium', price: 50, duration_days: 30, color: '#6366f1', benefits: ['Acceso ilimitado', 'Todas las clases', 'Casillero'] },
  { id: '3', name: 'VIP', price: 80, duration_days: 30, color: '#eab308', benefits: ['Todo Premium', 'Entrenador personal', 'Nutriologo'] },
];

const mockClasses = [
  { id: '1', name: 'Yoga', instructor: 'Ana Lopez', day_of_week: 1, time: '07:00', duration_minutes: 60, capacity: 20, color: '#22c55e' },
  { id: '2', name: 'Spinning', instructor: 'Pedro Sanchez', day_of_week: 1, time: '18:00', duration_minutes: 45, capacity: 15, color: '#f97316' },
  { id: '3', name: 'CrossFit', instructor: 'Roberto Torres', day_of_week: 3, time: '09:00', duration_minutes: 60, capacity: 12, color: '#ef4444' },
];
```

### Responsive
- Sidebar colapsado en mobile (hamburger menu)
- Cards en 1 columna en mobile
- Tablas con scroll horizontal
- Chat ocupa pantalla completa en mobile

### Animaciones
- Fade in para transiciones de pagina
- Scale en hover de cards
- Slide para sidebar en mobile
- Loading skeletons en carga de datos
