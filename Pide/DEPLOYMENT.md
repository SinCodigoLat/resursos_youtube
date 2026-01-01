# 🚀 DEPLOYMENT.md - Despliegue Completo

> **Objetivo**: Desplegar PIDE a producción (Frontend + Backend)

---

## 📋 Índice

1. [Pre-Deploy Checklist](#1-pre-deploy-checklist)
2. [Deploy Frontend (Vercel)](#2-deploy-frontend-vercel)
3. [Deploy Backend (Supabase)](#3-deploy-backend-supabase)
4. [Configurar Stripe](#4-configurar-stripe)
5. [Configurar Dominio](#5-configurar-dominio)
6. [Post-Deploy Testing](#6-post-deploy-testing)
7. [Monitoreo y Mantenimiento](#7-monitoreo-y-mantenimiento)

---

## 1. Pre-Deploy Checklist

### Paso 1.1: Verificar Código

```bash
# Build local exitoso
npm run build

# Tests pasando (si tienes)
npm run test

# Linter sin errores
npm run lint

# TypeScript sin errores
npx tsc --noEmit
```

### Paso 1.2: Verificar Variables de Entorno

**.env.local** (local):
```bash
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

**.env.production** (producción - NO commitear):
```bash
VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY=[ANON_KEY]
```

### Paso 1.3: Actualizar URLs en Supabase

**Dashboard → Authentication → URL Configuration**:

```
Site URL: https://tu-dominio.com
Redirect URLs:
  - https://tu-dominio.com
  - https://tu-dominio.com/auth/callback
  - https://tu-dominio.vercel.app (preview)
```

---

## 2. Deploy Frontend (Vercel)

### Opción A: Deploy desde GitHub

#### Paso A.1: Crear Repositorio Git

```bash
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub
gh repo create pide-food-ai --public --source=. --remote=origin

# Push
git push -u origin main
```

#### Paso A.2: Conectar con Vercel

1. Ir a https://vercel.com
2. Click "Add New Project"
3. Importar repositorio `pide-food-ai`
4. Configurar:

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### Paso A.3: Agregar Variables de Entorno

**Settings → Environment Variables**:

```
VITE_SUPABASE_URL = https://[PROJECT_ID].supabase.co
VITE_SUPABASE_ANON_KEY = [ANON_KEY]
```

#### Paso A.4: Deploy

Click "Deploy" → Esperar 1-2 minutos

---

### Opción B: Deploy desde CLI

#### Paso B.1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso B.2: Login

```bash
vercel login
```

#### Paso B.3: Deploy

```bash
# Primera vez (configuración interactiva)
vercel

# Producción
vercel --prod
```

---

## 3. Deploy Backend (Supabase)

### Paso 3.1: Verificar Schema en Producción

```bash
# Conectar a proyecto
supabase link --project-ref [PROJECT_ID]

# Verificar estado
supabase db remote status
```

Si el schema no está aplicado:

```bash
# Hacer dump del schema local
supabase db dump --schema public > schema.sql

# Aplicar a producción
supabase db push
```

### Paso 3.2: Deploy Edge Functions

```bash
# Chat function
supabase functions deploy chat

# Pay function
supabase functions deploy pay

# Verificar
supabase functions list
```

### Paso 3.3: Configurar Secrets

```bash
# Stripe (producción)
supabase secrets set STRIPE_SECRET_KEY=sk_live_[YOUR_KEY]

# Verificar
supabase secrets list
```

### Paso 3.4: Insertar Datos Seed (si necesario)

```bash
# Ejecutar seeds desde Dashboard → SQL Editor
# O desde CLI:
supabase db remote execute < seeds.sql
```

---

## 4. Configurar Stripe

### Paso 4.1: Crear Cuenta Stripe

1. Ir a https://stripe.com
2. Registrarse
3. Completar proceso de verificación

### Paso 4.2: Obtener Claves de Producción

**Dashboard → Developers → API Keys**:

```
Publishable key: pk_live_[KEY]
Secret key: sk_live_[KEY]
```

### Paso 4.3: Configurar Webhook (Opcional)

**Developers → Webhooks → Add endpoint**:

```
Endpoint URL: https://[PROJECT_ID].supabase.co/functions/v1/stripe-webhook
Events to send:
  - checkout.session.completed
  - payment_intent.succeeded
```

Guardar **Signing secret**: `whsec_[SECRET]`

### Paso 4.4: Test de Pago

Usar tarjeta de prueba:
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
ZIP: Cualquier 5 dígitos
```

---

## 5. Configurar Dominio

### Paso 5.1: Agregar Dominio Custom en Vercel

**Project Settings → Domains**:

```
Add Domain: pide.com (o tu dominio)
```

### Paso 5.2: Configurar DNS

En tu proveedor de DNS (GoDaddy, Namecheap, etc.):

**Tipo A Record**:
```
@ → 76.76.21.21
```

**Tipo CNAME**:
```
www → cname.vercel-dns.com
```

### Paso 5.3: Esperar Propagación DNS

⏱️ Puede tomar 24-48 horas

Verificar:
```bash
dig pide.com
nslookup pide.com
```

### Paso 5.4: Actualizar URLs en Supabase

**Authentication → URL Configuration**:
```
Site URL: https://pide.com
Redirect URLs:
  - https://pide.com
  - https://pide.com/auth/callback
```

---

## 6. Post-Deploy Testing

### Paso 6.1: Smoke Tests

Verificar en producción:

- [ ] Página carga correctamente
- [ ] Login anónimo funciona
- [ ] Chat responde
- [ ] Búsqueda de restaurantes funciona
- [ ] Agregar al carrito funciona
- [ ] Checkout procesa
- [ ] Redirección a Stripe funciona
- [ ] Página de órdenes muestra historial
- [ ] Perfil se puede editar

### Paso 6.2: Performance Testing

**Lighthouse Audit**:

```bash
# Chrome DevTools → Lighthouse
# O usar CLI:
npm install -g lighthouse
lighthouse https://pide.com --view
```

Objetivos:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

### Paso 6.3: Cross-Browser Testing

Probar en:
- Chrome (Desktop + Mobile)
- Safari (Desktop + Mobile)
- Firefox
- Edge

---

## 7. Monitoreo y Mantenimiento

### Paso 7.1: Configurar Vercel Analytics

**Dashboard → Analytics**:
- Activar Web Analytics
- Activar Speed Insights

### Paso 7.2: Monitorear Supabase

**Dashboard → Project → Reports**:

Vigilar:
- API requests
- Database size
- Edge Function invocations
- Bandwidth usage

### Paso 7.3: Configurar Alertas

**Supabase → Project Settings → Billing → Usage alerts**:

```
Alert at: 80% of limit
Email: tu@email.com
```

### Paso 7.4: Logs y Debugging

**Vercel**:
```bash
# Ver logs en tiempo real
vercel logs [DEPLOYMENT_URL]
```

**Supabase**:
```bash
# Ver logs de Edge Functions
supabase functions logs chat --tail
supabase functions logs pay --tail
```

### Paso 7.5: Backups

**Supabase → Database → Backups**:
- Automático: Diario (Free tier: 7 días)
- Manual: Antes de cambios grandes

```bash
# Backup manual
supabase db dump --db-url [DATABASE_URL] > backup.sql
```

---

## 📊 Métricas de Éxito

### KPIs a Monitorear

**Técnicos**:
- Uptime: >99.9%
- Response time: <500ms (p95)
- Error rate: <1%
- Build time: <2 min

**Negocio**:
- Usuarios activos diarios
- Pedidos completados
- Tasa de conversión (visita → pedido)
- Ticket promedio

---

## 🔧 Troubleshooting Común

### Error: "Failed to fetch"

**Causa**: CORS o URL incorrecta

**Solución**:
```typescript
// Verificar en .env.production
VITE_SUPABASE_URL=https://[CORRECT_PROJECT_ID].supabase.co
```

### Error: 401 Unauthorized

**Causa**: Anon key incorrecta

**Solución**:
```bash
# Verificar key en Supabase Dashboard → Settings → API
# Actualizar en Vercel Environment Variables
```

### Error: Edge Function timeout

**Causa**: Función toma >150s

**Solución**:
```bash
# Aumentar timeout
supabase functions deploy chat --timeout 300
```

### Error: Stripe payment failed

**Causa**: Webhook signature inválida

**Solución**:
```bash
# Verificar signing secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_[SECRET]
```

---

## 🚦 Estrategia de Deploy

### Development → Staging → Production

```bash
# Development (local)
npm run dev

# Staging (Vercel preview)
git push origin develop
# Auto-deploy a preview URL

# Production
git push origin main
# Auto-deploy a producción
```

### Rollback

Si algo falla en producción:

**Vercel**:
```bash
# Revertir a deployment anterior
vercel rollback [PREVIOUS_DEPLOYMENT_URL]
```

**Supabase**:
```bash
# Restaurar backup
supabase db restore --db-url [URL] backup.sql
```

---

## ✅ Checklist Final de Deploy

### Frontend
- [ ] Build exitoso localmente
- [ ] Variables de entorno configuradas
- [ ] Deployado en Vercel
- [ ] Dominio configurado
- [ ] SSL activo
- [ ] Analytics configurado

### Backend
- [ ] Schema aplicado en Supabase
- [ ] Edge Functions deployadas
- [ ] Secrets configurados
- [ ] RLS habilitado
- [ ] Datos seed insertados
- [ ] Backups configurados

### Stripe
- [ ] Cuenta creada y verificada
- [ ] Claves de producción configuradas
- [ ] Webhook configurado (opcional)
- [ ] Test de pago exitoso

### Testing
- [ ] Smoke tests pasados
- [ ] Performance >90
- [ ] Cross-browser testeado
- [ ] Mobile responsive verificado

### Monitoreo
- [ ] Vercel Analytics activo
- [ ] Supabase alerts configuradas
- [ ] Logs accesibles
- [ ] Métricas definidas

---

## 🎉 ¡Listo para Producción!

Tu app **PIDE** está ahora en vivo:
- ✅ Frontend en Vercel
- ✅ Backend en Supabase
- ✅ Pagos con Stripe
- ✅ Monitoreo activo

**URLs**:
- App: https://tu-dominio.com
- API: https://[PROJECT_ID].supabase.co
- Dashboard Supabase: https://app.supabase.com
- Dashboard Vercel: https://vercel.com/dashboard

---

## 📚 Recursos Adicionales

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

---

## 🔄 Mantenimiento Continuo

### Semanal
- Revisar logs de errores
- Verificar métricas de uso
- Responder issues de usuarios

### Mensual
- Revisar costos (Vercel + Supabase + Stripe)
- Actualizar dependencias
- Revisar performance

### Trimestral
- Auditoría de seguridad
- Backup completo manual
- Review de features y roadmap
