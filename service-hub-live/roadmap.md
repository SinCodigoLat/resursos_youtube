# Roadmap - ServiceOS

Este documento detalla los hitos y futuras características a implementar para evolucionar ServiceOS desde su versión actual (MVP mock) a un sistema totalmente funcional y escalable.

## Fase 1: MVP Funcional
- [ ] Establecer la arquitectura frontend con React, Vite y TypeScript (+ shadcn-ui/Tailwind).
- [ ] Inicio y Landing page (`/`).
- [ ] Panel y Hub Operativo con paneles y timeline de eventos (`/hub`).
- [ ] Módulo del Técnico/Operador con control de tiempo, materiales y filtrado de órdenes por sesión asignada (`/technician`).
- [ ] Vista del Cliente para mostrar resumen y recolectar firmas (`/customer`).
- [ ] Vista Backoffice/ERP Básica con auditoría (`/erp`).
- [ ] Integración de estado global persistido inicialmente en `localStorage`.

## Fase 2: Conectividad y Backend Real (En Progreso)
- [ ] **Base de Datos:** Migración de la lógica mock a Supabase (Tablas, RLS básico y Seeding).
- [ ] **Integración Supabase + Zustand:** Sincronización de acciones (status, tiempo, materiales, firmas) con el backend.
- [ ] **Autenticación (Auth):** Implementación de roles reales y seguros (Administrador, Operador, Cliente) usando Supabase Auth.
- [ ] **Gestión CRUD de Ajustes de Perfil:** Vista de perfil, edición de información y comprobación del Rol del usuario conectado al sistema.
- [ ] **Sincronización en Tiempo Real:** Implementación de Supabase Realtime para reflejar cambios entre módulos sin recarga manual.

## Fase 3: Operaciones Avanzadas
- [ ] **Módulo ABM de Entidades (CRUD):** Paneles de control para creación, edición y borrado de Técnicos, Clientes y Asignaciones de Órdenes en el ERP.
