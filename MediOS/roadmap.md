# MediOS - Roadmap de Implementacion

Plan para llevar MediOS de datos mock a produccion con Supabase y deploy en Vercel.

---

## Fase 1 - UI con datos mock (COMPLETADA)

- [x] Landing page publica
- [x] Flujo de booking paso a paso
- [x] Auth mock con selector de rol
- [x] Panel Admin (7 tabs)
- [x] Panel Doctor (3 tabs)
- [x] Portal Paciente (3 tabs)
- [x] Onboarding wizard
- [x] Store Zustand con logica de negocio
- [x] Datos mock: 4 doctores, 5 pacientes, 10 citas, 3 cobros
- [x] Transiciones de estado validadas
- [x] Persistencia en localStorage

---

## Fase 2 - Supabase: Base de Datos y Auth

### 2.1 - Setup inicial de Supabase (COMPLETADO)

- [x] Crear proyecto en Supabase (proyecto: medios, ID: citlzbdewetxsgdxwxjj, region: us-east-2)
- [x] Instalar `@supabase/supabase-js`
- [x] Crear cliente Supabase (`src/lib/supabase.ts`)
- [x] Configurar variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en `.env.local`
- [x] `.env.local` ya cubierto por `.local` en `.gitignore`

### 2.2 - Schema de base de datos (COMPLETADO)

8 tablas creadas con seed data:

- [x] **`clinics`** (1 registro) - configuracion de la clinica
- [x] **`profiles`** - vincula auth.users con roles (admin/doctor/patient)
- [x] **`services`** (5 registros) - especialidades/servicios
- [x] **`doctors`** (4 registros) - doctores con schedule JSONB
- [x] **`patients`** (5 registros) - pacientes
- [x] **`appointments`** (10 registros) - citas en distintos estados
- [x] **`appointment_events`** (23 registros) - historial de eventos
- [x] **`invoices`** (3 registros) - cobros
- [x] Seed data migrado de `mockData.ts` a SQL
- [x] Indices de performance en columnas mas consultadas

### 2.3 - Autenticacion (COMPLETADO)

- [x] Configurar Supabase Auth (email + password) - habilitado por defecto
- [x] Crear tabla `profiles` con campo `role` (admin, doctor, patient)
  - Trigger `handle_new_user()` crea perfil automaticamente en signup
  - Trigger actualizado para obtener `clinic_id` del registro doctor/paciente en invites
  - Fallback: si no hay `clinic_id`, usa la primera clinica disponible
- [x] Reemplazar auth mock (`/auth`) por login real con email/password
- [x] Crear pagina de registro para pacientes (toggle signup en `/auth`)
- [x] Proteger rutas: `/hub` solo admin, `/doctor` solo doctor, `/patient` solo paciente (`ProtectedRoute`)
- [x] Crear `AuthProvider` con contexto de sesion (`src/contexts/AuthContext.tsx`)
  - Fallback a JWT user_metadata si la query a profiles falla
- [x] Manejar token refresh y logout (Supabase `onAuthStateChange` + `signOut`)
- [x] Crear 3 usuarios demo: admin@medios.demo, sofia@medios.demo, maria@medios.demo (password: demo1234)
- [x] Vincular auth users con doctores y pacientes existentes (user_id)
- [x] Identities de email creadas para login funcional

### 2.4 - Row Level Security (RLS) (COMPLETADO)

- [x] **clinics**: lectura publica, escritura solo admin
- [x] **services**: lectura publica, CRUD solo admin
- [x] **doctors**: lectura publica, CRUD solo admin
- [x] **patients**: admin CRUD completo, doctor lectura, paciente solo su perfil, anon puede insertar
- [x] **appointments**:
  - Admin CRUD completo
  - Doctor puede leer y actualizar sus citas (transicionar estado, agregar notas)
  - Doctor puede insertar citas
  - Paciente puede leer, actualizar (cancelar) e insertar sus citas
  - Anon puede insertar (booking publico)
- [x] **appointment_events**: admin CRUD, doctor/paciente pueden insertar, lectura segun politica de appointments
- [x] **invoices**: admin CRUD completo, doctor puede insertar y leer cobros de sus citas, paciente solo los suyos
- [x] **profiles**: usuario ve su perfil (sin recursion, usa `auth.jwt()` para admin check), admin ve todos

### 2.5 - Capa de datos (reemplazar mock store) (COMPLETADO)

- [x] Crear `src/lib/api/` con funciones por entidad:
  - `appointments.ts` - CRUD + transiciones + hooks publicos para booking
  - `doctors.ts` - CRUD completo + `useDoctorByUserId` + hooks publicos
  - `patients.ts` - CRUD completo + `usePatientByUserId`
  - `invoices.ts` - CRUD + marcar pagado + cancelar
  - `services.ts` - CRUD completo + hooks publicos
  - `clinic.ts` - lectura/actualizacion + `usePublicClinic`
  - `storage.ts` - upload/delete de archivos en bucket `avatars`
- [x] Integrar con React Query (`useQuery`, `useMutation`) para cache y revalidacion
- [x] Migrar store Zustand: mantener solo estado de UI (`onboardingCompleted`)
- [x] Transformacion snake_case (DB) <-> camelCase (app) en capa API

### 2.6 - Migracion componente por componente (COMPLETADO)

Todos los componentes migrados de `useStore()` a React Query hooks:

- [x] **SettingsTab** - `useClinic()`, `useUpdateClinic()`, `useServices()` + servicios editables (crear, editar, eliminar)
- [x] **DoctorsTab** - CRUD completo con modal mejorado (secciones: Perfil, Horario, Acceso), foto upload, toggle activo
- [x] **PatientsTab** - CRUD completo con perfil detallado, metricas, historial, foto upload
- [x] **AgendaTab** - `useCreateAppointment()`, `useTransitionAppointment()`, datos de Supabase
- [x] **BillingTab** - cobros manuales (efectivo/tarjeta/transferencia), marcar pagado, cancelar, crear nuevo
- [x] **Dashboard** - KPIs, grafica 7 dias, alertas, todo desde Supabase
- [x] **ReportsTab** - ingresos del mes, tasa no-show, doctor mas activo, graficas
- [x] **Booking** - flujo adaptativo: logueado salta datos, no logueado puede crear cuenta
- [x] **DoctorPanel** - `useAuth()` + `useDoctorByUserId()` para filtrado
- [x] **PatientPortal** - `useAuth()` + `usePatientByUserId()` para filtrado
- [x] **Landing (Index)** - queries publicas para servicios, doctores, clinica
- [x] **Onboarding** - `useClinic()`, `useCreateDoctor()`, store solo para `completeOnboarding`
- [x] **MyDay** - navegacion por fecha (no solo hoy), acciones de consulta desde cualquier dia
- [x] **Consultation** - notas con autoguardado, cobro rapido, completar consulta
- [x] **MyPatientsTab** - historial filtrado por doctor logueado
- [x] **MyAppointments** - citas del paciente con cancelacion
- [x] **HistoryTab** - consultas pasadas del paciente
- [x] **PaymentsTab** - recibos y estado de pagos del paciente

### 2.7 - CRUD completo y sistema de invitacion (COMPLETADO)

- [x] **Doctores CRUD completo**: lista, detalle (perfil + horario + stats), editar (con horario semanal), eliminar con confirmacion
- [x] **Pacientes CRUD completo**: lista con busqueda, detalle (perfil + historial + metricas), crear, editar, eliminar
- [x] **Sistema de invitacion por enlace**: admin genera link -> persona se registra -> vinculacion automatica
  - Enlace: `/auth?invite=doctor|patient&id={recordId}`
  - Auth page detecta invite y muestra signup contextual
  - Trigger `handle_new_user()` actualizado para vincular `user_id` y obtener `clinic_id` del registro
  - Badge visual en cards: check verde (cuenta vinculada) o icono cadena (sin cuenta, click copia enlace)
  - Seccion "Acceso al sistema" en modal de edicion con enlace copiable
- [x] **Booking inteligente**: si logueado salta paso de datos; si no, permite crear cuenta con toggle
- [x] **QA pasado**: RLS corregido para doctor write (update appointments, insert events/invoices), patient write (cancel appointments), fix clinic_id null en invites

---

## Fase 3 - Funcionalidad Avanzada (futuro, fuera de alcance actual)

> Las siguientes funcionalidades estan fuera del alcance de esta etapa. Pagos son manuales (efectivo/tarjeta/transferencia) desde el panel del doctor.

### 3.1 - Realtime (futuro)

- [ ] Suscripciones Supabase Realtime en agenda
- [ ] Notificacion en dashboard cuando llega nueva cita

### 3.2 - Storage (COMPLETADO)

- [x] Bucket `avatars` creado en Supabase Storage (publico)
- [x] Politicas RLS: lectura publica, upload/update/delete para autenticados
- [x] Componente reutilizable `ImageUpload` con preview, validacion y cache-busting
- [x] Upload de fotos de doctores (crear + editar)
- [x] Upload de fotos de pacientes (editar, con avatar de inicial como fallback)
- [x] Utilidad `src/lib/api/storage.ts` (uploadFile, deleteFile, isStorageUrl)

### 3.3 - Edge Functions (futuro)

- [ ] Recordatorios de cita 24h antes (Edge Function + cron)
- [ ] Webhook para notificaciones WhatsApp/SMS (Twilio)
- [ ] Confirmacion de cita por link

### 3.4 - Pagos online (futuro)

- [ ] Integracion con Stripe para pagos online
- [ ] Generacion de recibos PDF

### 3.5 - Calendario externo (futuro)

- [ ] Sync con Google Calendar

---

## Fase 4 - Deploy a Produccion (Vercel) (COMPLETADO)

### 4.1 - Preparacion del build (COMPLETADO)

- [x] Verificar que `npm run build` pasa sin errores
- [x] Warning de chunk size (1.18MB) - no bloqueante, optimizar en futuro con code splitting
- [x] Configurar `vercel.json` con rewrites para SPA

### 4.2 - Setup de Vercel (COMPLETADO)

- [x] Conectar repositorio GitHub (SinCodigoLat/medios) a Vercel
- [x] Configurar variables de entorno en Vercel:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [x] Framework preset: Vite (auto-detectado)
- [x] Deploy inicial exitoso

### 4.3 - Dominio y produccion

- [x] Deploy funcional en Vercel
- [ ] Configurar dominio personalizado (opcional)
- [ ] Verificar que Supabase tiene la URL de produccion en allowed origins
- [ ] Test E2E completo en produccion

---

## Arquitectura Final

### Stack

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Radix |
| Estado servidor | React Query (TanStack Query) |
| Estado UI | Zustand (solo `onboardingCompleted`) |
| Backend | Supabase (Postgres + Auth + Storage + RLS) |
| Graficas | Recharts |
| Deploy | Vercel |

### Archivos clave creados

```
src/
  contexts/AuthContext.tsx          # Sesion real de Supabase
  components/auth/ProtectedRoute.tsx  # Guard de rutas por rol
  components/ui/image-upload.tsx    # Upload de fotos reutilizable
  components/ui/invite-link.tsx     # Enlace de invitacion copiable
  lib/supabase.ts                  # Cliente Supabase
  lib/api/
    appointments.ts                # CRUD + transiciones + public queries
    clinic.ts                      # Config clinica + public query
    doctors.ts                     # CRUD + byUserId + public query
    invoices.ts                    # CRUD + marcar pagado + cancelar
    patients.ts                    # CRUD + byUserId
    services.ts                    # CRUD + public query
    storage.ts                     # Upload/delete avatares
```

### Usuarios demo

| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@medios.demo | demo1234 |
| Doctor (Sofia) | sofia@medios.demo | demo1234 |
| Paciente (Maria) | maria@medios.demo | demo1234 |

---

## Orden de Ejecucion (completado)

| Paso | Que se hizo | Estado |
|------|------------|--------|
| 1 | Setup Supabase + schema + seed | Completado |
| 2 | Auth real + usuarios demo | Completado |
| 3 | RLS completo (todos los roles) | Completado |
| 4 | Capa de datos API (React Query) | Completado |
| 5 | Migrar todos los componentes | Completado |
| 6 | CRUD doctores + pacientes + servicios | Completado |
| 7 | Sistema de invitacion por enlace | Completado |
| 8 | Storage (fotos) | Completado |
| 9 | Booking inteligente (logueado/anonimo) | Completado |
| 10 | QA de RLS y flujos | Completado |
| 11 | Build + deploy Vercel | Completado |

---

## Lo que viene despues (Fase 3+)

- Supabase Realtime para agenda en vivo
- Notificaciones WhatsApp/SMS via Twilio
- Recordatorios automaticos (Edge Function + cron)
- Pagos con Stripe
- Expediente clinico completo (historial medico, alergias, medicamentos)
- Integracion con Google Calendar
- Multi-sucursal
- Code splitting para optimizar bundle size
