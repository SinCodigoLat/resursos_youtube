# BACKEND-SETUP.md - Supabase

Schema SQL para configurar la base de datos en Supabase.

---

## 1. Crear Proyecto

1. Ir a https://supabase.com
2. Crear nuevo proyecto: `fit-ai-coach`
3. Region: South America (Sao Paulo)
4. Guardar password de DB

---

## 2. Ejecutar Schema

**Dashboard → SQL Editor → New Query**

```sql
-- =====================================================
-- FIT AI COACH - DATABASE SCHEMA
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. GYMS (Multi-tenant)
-- =====================================================
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  whatsapp_number TEXT,
  ai_instructions TEXT,
  timezone TEXT DEFAULT 'America/Mexico_City',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. MEMBERSHIP_PLANS
-- =====================================================
CREATE TABLE membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  benefits JSONB DEFAULT '[]',
  color TEXT DEFAULT '#6366f1',
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. MEMBERS
-- =====================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plan_id UUID REFERENCES membership_plans(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'cancelled')),
  start_date DATE,
  end_date DATE,
  notes TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_gym ON members(gym_id);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_status ON members(status);

-- =====================================================
-- 4. CLASSES
-- =====================================================
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  capacity INTEGER DEFAULT 20,
  color TEXT DEFAULT '#22c55e',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_classes_gym ON classes(gym_id);

-- =====================================================
-- 5. CLASS_BOOKINGS
-- =====================================================
CREATE TABLE class_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, member_id, booking_date)
);

-- =====================================================
-- 6. PAYMENTS
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  plan_id UUID REFERENCES membership_plans(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  method TEXT DEFAULT 'stripe' CHECK (method IN ('stripe', 'cash', 'transfer')),
  invoice_number TEXT,
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_gym ON payments(gym_id);
CREATE INDEX idx_payments_member ON payments(member_id);

-- =====================================================
-- 7. CONVERSATIONS (WhatsApp)
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT,
  member_id UUID REFERENCES members(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gym_id, phone)
);

CREATE INDEX idx_conversations_gym ON conversations(gym_id);

-- =====================================================
-- 8. MESSAGES
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  is_from_ai BOOLEAN DEFAULT false,
  whatsapp_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- =====================================================
-- TRIGGER: Auto-create gym on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.gyms (owner_id, name)
  VALUES (NEW.id, 'Mi Gimnasio');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gyms_updated BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER members_updated BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER classes_updated BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 3. Configurar RLS

```sql
-- Habilitar RLS
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Gyms: Solo el owner ve su gym
CREATE POLICY "Users can view own gym" ON gyms
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can update own gym" ON gyms
  FOR UPDATE USING (auth.uid() = owner_id);

-- Membership Plans: Solo del gym del owner
CREATE POLICY "View own gym plans" ON membership_plans
  FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Manage own gym plans" ON membership_plans
  FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Members: Solo del gym del owner
CREATE POLICY "View own gym members" ON members
  FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Manage own gym members" ON members
  FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Classes: Solo del gym del owner
CREATE POLICY "View own gym classes" ON classes
  FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Manage own gym classes" ON classes
  FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Bookings: Solo de clases del gym del owner
CREATE POLICY "View own gym bookings" ON class_bookings
  FOR SELECT USING (class_id IN (
    SELECT id FROM classes WHERE gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Manage own gym bookings" ON class_bookings
  FOR ALL USING (class_id IN (
    SELECT id FROM classes WHERE gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  ));

-- Payments: Solo del gym del owner
CREATE POLICY "View own gym payments" ON payments
  FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Manage own gym payments" ON payments
  FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Conversations: Solo del gym del owner
CREATE POLICY "View own gym conversations" ON conversations
  FOR SELECT USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

CREATE POLICY "Manage own gym conversations" ON conversations
  FOR ALL USING (gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid()));

-- Messages: Solo de conversaciones del gym del owner
CREATE POLICY "View own gym messages" ON messages
  FOR SELECT USING (conversation_id IN (
    SELECT id FROM conversations WHERE gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  ));

CREATE POLICY "Manage own gym messages" ON messages
  FOR ALL USING (conversation_id IN (
    SELECT id FROM conversations WHERE gym_id IN (
      SELECT id FROM gyms WHERE owner_id = auth.uid()
    )
  ));
```

---

## 4. Habilitar Realtime

**Dashboard → Database → Replication**

Habilitar para:
- `conversations`
- `messages`

---

## 5. Credenciales

**Dashboard → Settings → API**

Copiar:
- Project URL
- anon public key

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Verificacion

```sql
-- Ver tablas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Crear usuario de prueba (desde Auth > Users > Add user)
-- Verificar que se creo el gym automaticamente
SELECT * FROM gyms;
```
