# 🗄️ BACKEND-SETUP.md - Supabase

> **Objetivo**: Configurar base de datos, autenticación y storage en Supabase

---

## 📋 Índice

1. [Crear Proyecto](#1-crear-proyecto)
2. [Configurar Autenticación](#2-configurar-autenticación)
3. [Crear Schema de Base de Datos](#3-crear-schema-de-base-de-datos)
4. [Configurar Storage](#4-configurar-storage)
5. [Configurar RLS (Row Level Security)](#5-configurar-rls)
6. [Seeds de Datos](#6-seeds-de-datos)
7. [Obtener Credenciales](#7-obtener-credenciales)

---

## 1. Crear Proyecto

### Paso 1.1: Registrarse en Supabase
1. Ir a https://supabase.com
2. Click en "Start your project"
3. Conectar con GitHub o crear cuenta

### Paso 1.2: Crear Nuevo Proyecto
```bash
Nombre: pide-food-ai
Región: South America (São Paulo) # O la más cercana
Database Password: [GUARDAR EN LUGAR SEGURO]
Pricing Plan: Free
```

### Paso 1.3: Esperar Provisión
⏱️ Toma 2-3 minutos. Verás:
- ✅ Database provisioned
- ✅ API ready
- ✅ Auth ready

---

## 2. Configurar Autenticación

### Paso 2.1: Habilitar Autenticación Anónima

**Dashboard → Authentication → Providers → Anonymous**

```json
{
  "enabled": true,
  "auto_confirm": true
}
```

### Paso 2.2: Configurar Email/Password (Opcional)

**Dashboard → Authentication → Providers → Email**

```json
{
  "enabled": true,
  "confirm_email": false,
  "secure_password_change": true
}
```

### Paso 2.3: Configurar URLs

**Authentication → URL Configuration**

```
Site URL: http://localhost:5173
Redirect URLs:
  - http://localhost:5173
  - http://localhost:5173/auth/callback
  - https://tu-dominio.com (producción)
```

---

## 3. Crear Schema de Base de Datos

### Paso 3.1: Ir a SQL Editor

**Dashboard → SQL Editor → New Query**

### Paso 3.2: Ejecutar Script de Tablas

```sql
-- =====================================================
-- PIDE FOOD AI - DATABASE SCHEMA
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES (Perfiles de Usuario)
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para auto-crear perfil cuando se crea usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. RESTAURANTS (Restaurantes)
-- =====================================================
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cuisine_type TEXT NOT NULL, -- "Japonesa", "Mexicana", etc.
  rating DECIMAL(2,1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  delivery_time TEXT NOT NULL, -- "25-35 min"
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);

-- =====================================================
-- 3. MENU_ITEMS (Items del Menú)
-- =====================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT, -- "Entradas", "Platos Fuertes", etc.
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_name ON menu_items(name);
CREATE INDEX idx_menu_items_available ON menu_items(available);

-- =====================================================
-- 4. ORDERS (Pedidos)
-- =====================================================
CREATE TYPE order_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED'
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  items JSONB NOT NULL, -- Array de {id, name, price, quantity}
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'PENDING',
  delivery_address TEXT,
  delivery_name TEXT,
  delivery_phone TEXT,
  notes TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Trigger updated_at
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. CHAT_MESSAGES (Mensajes del Chat)
-- =====================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT NOT NULL, -- ID de sesión del chat
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB, -- {restaurants, items, showCart, orderStatus, etc.}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_chat_session ON chat_messages(session_id);
CREATE INDEX idx_chat_user ON chat_messages(user_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at DESC);

-- =====================================================
-- 6. USER_STATES (Estado del Usuario/Carrito)
-- =====================================================
CREATE TABLE user_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE,
  budget DECIMAL(10,2),
  cuisine TEXT,
  cart JSONB DEFAULT '[]'::jsonb, -- Array de CartItem
  last_order_id UUID REFERENCES orders(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Índices
CREATE INDEX idx_user_states_user ON user_states(user_id);
CREATE INDEX idx_user_states_session ON user_states(session_id);

-- Trigger updated_at
CREATE TRIGGER user_states_updated_at
  BEFORE UPDATE ON user_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. PAYMENT_METHODS (Métodos de Pago - Futuro)
-- =====================================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);

-- =====================================================
-- ✅ SCHEMA CREADO
-- =====================================================
```

### Paso 3.3: Verificar Tablas Creadas

**Dashboard → Database → Tables**

Deberías ver:
- ✅ profiles
- ✅ restaurants
- ✅ menu_items
- ✅ orders
- ✅ chat_messages
- ✅ user_states
- ✅ payment_methods

---

## 4. Configurar Storage

### Paso 4.1: Crear Buckets

**Storage → New bucket**

```bash
Bucket 1:
  Name: restaurant-images
  Public: true
  File size limit: 5 MB
  Allowed MIME types: image/*

Bucket 2:
  Name: menu-items
  Public: true
  File size limit: 3 MB
  Allowed MIME types: image/*
```

### Paso 4.2: Políticas de Storage

```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('restaurant-images', 'menu-items'));

-- Permitir subida autenticada
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('restaurant-images', 'menu-items')
  AND auth.role() = 'authenticated'
);
```

---

## 5. Configurar RLS (Row Level Security)

### Paso 5.1: Habilitar RLS en Todas las Tablas

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
```

### Paso 5.2: Crear Políticas

```sql
-- =====================================================
-- POLICIES: PROFILES
-- =====================================================
-- Los usuarios pueden ver y editar solo su perfil
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- =====================================================
-- POLICIES: RESTAURANTS (Lectura pública)
-- =====================================================
CREATE POLICY "Anyone can view restaurants"
ON restaurants FOR SELECT
TO public
USING (true);

-- =====================================================
-- POLICIES: MENU_ITEMS (Lectura pública)
-- =====================================================
CREATE POLICY "Anyone can view menu items"
ON menu_items FOR SELECT
TO public
USING (true);

-- =====================================================
-- POLICIES: ORDERS
-- =====================================================
-- Usuarios pueden ver sus propios pedidos
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios pueden crear pedidos
CREATE POLICY "Users can create orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus pedidos PENDING
CREATE POLICY "Users can update own pending orders"
ON orders FOR UPDATE
USING (
  auth.uid() = user_id 
  AND status = 'PENDING'
);

-- =====================================================
-- POLICIES: CHAT_MESSAGES
-- =====================================================
-- Usuarios pueden ver sus mensajes
CREATE POLICY "Users can view own messages"
ON chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios pueden crear mensajes
CREATE POLICY "Users can create messages"
ON chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLICIES: USER_STATES
-- =====================================================
-- Usuarios pueden ver su estado
CREATE POLICY "Users can view own state"
ON user_states FOR SELECT
USING (auth.uid() = user_id);

-- Usuarios pueden actualizar su estado
CREATE POLICY "Users can update own state"
ON user_states FOR UPDATE
USING (auth.uid() = user_id);

-- Usuarios pueden insertar su estado
CREATE POLICY "Users can insert own state"
ON user_states FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- POLICIES: PAYMENT_METHODS
-- =====================================================
CREATE POLICY "Users can view own payment methods"
ON payment_methods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods"
ON payment_methods FOR ALL
USING (auth.uid() = user_id);
```

---

## 6. Seeds de Datos

### Paso 6.1: Insertar Restaurantes de Prueba

```sql
-- =====================================================
-- SEED DATA: RESTAURANTS
-- =====================================================
INSERT INTO restaurants (name, cuisine_type, rating, delivery_time, delivery_fee, image_url) VALUES
('Sushi Master', 'Japonesa', 4.8, '25-35 min', 3.00, 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
('Taco Loco', 'Mexicana', 4.6, '20-30 min', 2.50, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
('Pizza Bella', 'Italiana', 4.7, '30-40 min', 4.00, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
('Green Bowl', 'Saludable', 4.5, '15-25 min', 2.00, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
('Burger House', 'Americana', 4.4, '25-35 min', 3.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd');
```

### Paso 6.2: Insertar Items del Menú

```sql
-- =====================================================
-- SEED DATA: MENU_ITEMS (Sushi Master)
-- =====================================================
WITH sushi_master AS (
  SELECT id FROM restaurants WHERE name = 'Sushi Master'
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES
((SELECT id FROM sushi_master), 'California Roll (8 piezas)', 'Cangrejo, aguacate, pepino, sésamo', 12.00, 'Rolls', 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351'),
((SELECT id FROM sushi_master), 'Sashimi Mix (12 piezas)', 'Salmón, atún, pez mantequilla', 18.00, 'Sashimi', 'https://images.unsplash.com/photo-1563612116625-3012372fccce'),
((SELECT id FROM sushi_master), 'Nigiri Salmón (4 piezas)', 'Salmón fresco sobre arroz', 10.00, 'Nigiri', 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10'),
((SELECT id FROM sushi_master), 'Gyoza (6 piezas)', 'Empanadillas japonesas de cerdo', 8.00, 'Entradas', 'https://images.unsplash.com/photo-1626006824383-a77ce0dfdc2e');

-- =====================================================
-- SEED DATA: MENU_ITEMS (Taco Loco)
-- =====================================================
WITH taco_loco AS (
  SELECT id FROM restaurants WHERE name = 'Taco Loco'
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES
((SELECT id FROM taco_loco), 'Tacos al Pastor (3 und)', 'Cerdo marinado, piña, cilantro, cebolla', 9.50, 'Tacos', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
((SELECT id FROM taco_loco), 'Burrito de Carne Asada', 'Carne asada, frijoles, queso, guacamole', 13.00, 'Burritos', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f'),
((SELECT id FROM taco_loco), 'Quesadilla de Pollo', 'Pollo, queso, jalapeños', 11.00, 'Quesadillas', 'https://images.unsplash.com/photo-1618040996337-56904b7850b9'),
((SELECT id FROM taco_loco), 'Nachos Supreme', 'Chips, queso, carne, guacamole, crema', 12.50, 'Entradas', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d');

-- =====================================================
-- SEED DATA: MENU_ITEMS (Pizza Bella)
-- =====================================================
WITH pizza_bella AS (
  SELECT id FROM restaurants WHERE name = 'Pizza Bella'
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES
((SELECT id FROM pizza_bella), 'Margherita Clásica', 'Tomate, mozzarella, albahaca', 14.00, 'Pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
((SELECT id FROM pizza_bella), 'Pepperoni Suprema', 'Doble pepperoni, mozzarella extra', 16.00, 'Pizzas', 'https://images.unsplash.com/photo-1628840042765-356cda07504e'),
((SELECT id FROM pizza_bella), 'Cuatro Quesos', 'Mozzarella, parmesano, gorgonzola, ricotta', 17.00, 'Pizzas', 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
((SELECT id FROM pizza_bella), 'Ensalada Caprese', 'Tomate, mozzarella, albahaca, aceite de oliva', 9.00, 'Entradas', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c');

-- =====================================================
-- SEED DATA: MENU_ITEMS (Green Bowl)
-- =====================================================
WITH green_bowl AS (
  SELECT id FROM restaurants WHERE name = 'Green Bowl'
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES
((SELECT id FROM green_bowl), 'Buddha Bowl Completo', 'Quinoa, aguacate, edamame, tofu, espinaca', 13.50, 'Bowls', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd'),
((SELECT id FROM green_bowl), 'Ensalada de Kale', 'Kale, manzana, nueces, vinagreta de miel', 11.00, 'Ensaladas', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe'),
((SELECT id FROM green_bowl), 'Wrap de Pollo Grillé', 'Pollo, lechuga, tomate, hummus', 10.50, 'Wraps', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f'),
((SELECT id FROM green_bowl), 'Smoothie Verde', 'Espinaca, plátano, mango, leche de almendras', 7.00, 'Bebidas', 'https://images.unsplash.com/photo-1505252585461-04db1eb84625');

-- =====================================================
-- SEED DATA: MENU_ITEMS (Burger House)
-- =====================================================
WITH burger_house AS (
  SELECT id FROM restaurants WHERE name = 'Burger House'
)
INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url) VALUES
((SELECT id FROM burger_house), 'Classic Burger', 'Carne 200g, lechuga, tomate, cebolla, queso', 12.00, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
((SELECT id FROM burger_house), 'BBQ Bacon Burger', 'Carne 200g, bacon, cebolla caramelizada, BBQ', 14.50, 'Burgers', 'https://images.unsplash.com/photo-1550547660-d9450f859349'),
((SELECT id FROM burger_house), 'Papas Fritas Grandes', 'Papas crujientes con sal de mar', 5.50, 'Acompañamientos', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877'),
((SELECT id FROM burger_house), 'Onion Rings', 'Aros de cebolla empanizados', 6.00, 'Acompañamientos', 'https://images.unsplash.com/photo-1639024471283-03518883512d');
```

---

## 7. Obtener Credenciales

### Paso 7.1: API Keys

**Dashboard → Settings → API**

Copiar:
```bash
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]
```

### Paso 7.2: Crear archivo .env

En tu proyecto frontend:

```bash
# .env.local
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]
```

---

## ✅ Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Autenticación anónima habilitada
- [ ] Schema de base de datos ejecutado
- [ ] Storage buckets creados
- [ ] RLS habilitado y políticas creadas
- [ ] Datos seed insertados
- [ ] Credenciales copiadas
- [ ] Variables de entorno configuradas

---

## 🔐 Seguridad

**IMPORTANTE**:
- ✅ Nunca commits API keys privadas
- ✅ Usa variables de entorno
- ✅ RLS habilitado en producción
- ✅ Valida inputs en Edge Functions

---

## 📊 Verificación

Ejecutar en SQL Editor:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar restaurantes
SELECT COUNT(*) FROM restaurants;

-- Contar items
SELECT COUNT(*) FROM menu_items;

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Resultados esperados:
- 7 tablas públicas
- 5 restaurantes
- 20 items de menú
- RLS = true en todas

---

## 🚀 Siguiente Paso

**→ EDGE-FUNCTIONS.md**: Implementar lógica de AI y pagos
