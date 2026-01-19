# Problemas Conocidos y Soluciones - Luna IA

Este documento contiene todos los problemas descubiertos durante el desarrollo y sus soluciones. **Lee esto antes de debuggear**.

---

## Checklist Rápido Pre-Producción

```
□ Supabase Secrets configurados (4 secrets)
□ Webhook URL en Twilio sandbox
□ Usuario unido al sandbox de Twilio
□ Edge Functions desplegadas CON contenido (verificar)
□ Base de datos con seed data (habitaciones, etc)
□ Frontend corriendo (npm run dev)
```

---

## Problemas de Twilio

### 1. Twilio envía form-urlencoded, no JSON

**Problema**: El webhook espera JSON pero Twilio envía `application/x-www-form-urlencoded`.

**Solución**: Detectar Content-Type y parsear según el formato:

```typescript
const contentType = req.headers.get("content-type") || "";
if (contentType.includes("application/json")) {
  payload = await req.json();
} else if (contentType.includes("application/x-www-form-urlencoded")) {
  const rawBody = await req.text();
  const params = new URLSearchParams(rawBody);
  payload = {
    from: params.get("From") || "",
    body: params.get("Body") || "",
  };
}
```

### 2. Prefijo `whatsapp:` en números

**Problema**: Twilio añade `whatsapp:` a los números, causando duplicados en la base de datos.

**Solución**: Normalizar SIEMPRE antes de guardar:

```typescript
function normalizePhone(phone: string): string {
  return phone.replace("whatsapp:", "").trim();
}
```

### 3. Auth Token desactualizado

**Problema**: Twilio regenera tokens y el viejo deja de funcionar.

**Solución**: Verificar en Twilio Console que el Auth Token en Supabase esté actualizado.

### 4. Mensajes no llegan a WhatsApp

**Causas comunes**:
1. Usuario no está unido al sandbox (debe enviar "join xxx" primero)
2. Número en formato incorrecto (debe incluir `whatsapp:+...`)
3. Secrets no configurados en Supabase

**Diagnóstico**: Agregar logs en el webhook:

```typescript
console.log("=== TWILIO DIAGNOSTIC ===");
console.log("TWILIO_ACCOUNT_SID configured:", !!twilioAccountSid);
console.log("TWILIO_AUTH_TOKEN configured:", !!twilioAuthToken);
console.log("TWILIO_WHATSAPP_NUMBER:", twilioWhatsAppNumber);
```

---

## Problemas de Edge Functions

### 5. Funciones desplegadas vacías

**Problema**: El deploy devuelve código 200 pero el archivo `index.ts` está vacío en producción. Luna no responde.

**Síntomas**:
- Mensajes se guardan en la base de datos
- Webhook devuelve 200
- Luna no genera respuestas

**Solución**:
1. Verificar contenido con `get_edge_function` (el campo `content` debe tener código)
2. Redesplegar la función con el código completo

### 6. CORS bloqueando peticiones del Dashboard

**Problema**: El navegador bloquea peticiones al Edge Function con error 405.

**Solución**: Manejar OPTIONS al inicio de la función:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  // ... resto de la lógica
});
```

### 7. Múltiples instancias de Supabase Client

**Problema**: Durante hot reload se crean múltiples conexiones.

**Solución**: Usar patrón Singleton:

```typescript
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, options);
  }
  return supabaseInstance;
};
```

---

## Problemas de OpenAI Function Calling

### 8. OpenAI no llama funciones cuando debería

**Problema**: OpenAI genera texto conversacional en lugar de ejecutar funciones, incluso cuando el usuario confirma.

**Solución**: Detectar keywords de confirmación y forzar la llamada:

```typescript
const confirmationKeywords = ["confirmo", "sí", "si", "adelante", "procede"];
const isConfirming = confirmationKeywords.some(keyword =>
  message.toLowerCase().includes(keyword)
);

if (isConfirming) {
  forceFunctionCall = { name: "create_reservation" };
}

// En la llamada a OpenAI
body: JSON.stringify({
  // ...
  function_call: forceFunctionCall, // "auto" o { name: "..." }
})
```

### 9. room_id mal interpretado

**Problema**: OpenAI usa "1", "2" o nombres de habitación en lugar del UUID.

**Solución**:
1. Validar server-side:
```typescript
if (room_id && room_id.length < 10) {
  return { error: "ID de habitación inválido. Usa el UUID completo." };
}
```

2. Devolver `room_id` duplicado en `check_room_availability`:
```typescript
return {
  available_rooms: rooms.map((room) => ({
    room_id: room.id,  // ← Para create_reservation
    id: room.id,       // ← Compatibilidad
    name: room.name,
  }))
};
```

### 10. Respuestas vacías de OpenAI

**Problema**: OpenAI ejecuta la función pero no genera mensaje de confirmación.

**Solución**: Fallback final si no hay texto:

```typescript
if (!assistantMessage.trim()) {
  const finalRes = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [...history, {
      role: "system",
      content: "El proceso terminó con éxito. Confirma al usuario amigablemente."
    }]
  });
  assistantMessage = finalRes.choices[0].message.content;
}
```

---

## Problemas de Fechas y Datos

### 11. Año incorrecto en reservaciones

**Problema**: El LLM usa 2024 si no tiene la fecha actual.

**Solución**: Inyectar fecha en el systemPrompt:

```typescript
const now = new Date();
const formattedNow = now.toLocaleDateString('es-MX', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});
const systemPrompt = `HOY ES: ${formattedNow}. Usa el año ${now.getFullYear()}.`;
```

### 12. Formato de fechas inválido

**Problema**: Fechas en formato incorrecto causan errores.

**Solución**: Validar con regex antes de procesar:

```typescript
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(check_in_date)) {
  return {
    error: "Formato de fecha inválido. Use YYYY-MM-DD (ejemplo: 2026-01-20)"
  };
}
```

### 13. Nombre genérico del huésped

**Problema**: Se crean reservaciones con nombres como "Huésped 1052".

**Solución**: Instrucción en el systemPrompt:

```
ANTES de crear la reservación, SIEMPRE pregunta por el nombre completo
si el nombre actual es genérico (ej: "Huésped 1052").
```

---

## Problemas de Base de Datos

### 14. Conflictos de reservaciones no detectados

**Problema**: La query SQL con `.lte()/.gte()` no funciona correctamente.

**Solución**: Filtrar manualmente en JavaScript:

```typescript
const conflictingReservations = allReservations?.filter((res) => {
  const resCheckIn = new Date(res.check_in_date);
  const resCheckOut = new Date(res.check_out_date);
  return (
    (checkIn >= resCheckIn && checkIn < resCheckOut) ||
    (checkOut > resCheckIn && checkOut <= resCheckOut) ||
    (checkIn <= resCheckIn && checkOut >= resCheckOut)
  );
}) || [];
```

### 15. Registros duplicados de huéspedes

**Problema**: Se crean huéspedes con y sin prefijo `whatsapp:`.

**Solución**:
1. Normalizar número SIEMPRE antes de guardar
2. Limpiar duplicados:
```sql
DELETE FROM messages WHERE guest_id = 'id_del_duplicado';
DELETE FROM guests WHERE phone LIKE 'whatsapp:%';
```

---

## Problemas de Frontend

### 16. Mensajes no aparecen en tiempo real

**Problema**: Nuevos mensajes no se muestran automáticamente.

**Solución**: Combinar polling + suscripción:

```typescript
// Polling
const { data } = useQuery({
  queryKey: ['messages'],
  refetchInterval: 2000,
});

// Suscripción
const channel = supabase
  .channel('messages_realtime')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  })
  .subscribe();
```

### 17. Token de sesión no funciona con Edge Functions

**Problema**: `session.access_token` no autoriza las llamadas.

**Solución**: Usar `VITE_SUPABASE_ANON_KEY` directamente:

```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/luna-agent`, {
  headers: {
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  },
});
```

---

## Debugging

### 18. LOGGING OBLIGATORIO

Toda función crítica debe incluir logs:

```typescript
console.log("Creating reservation with:", { room_id, check_in_date, guestId });
console.log("Function result:", JSON.stringify(functionResult).substring(0, 200));
console.error("Room error:", roomError);
```

### 19. Dónde revisar logs

- **Edge Functions**: Supabase Dashboard → Settings → Edge Functions → Logs
- **Twilio**: Twilio Console → Monitor → Logs
- **Frontend**: Console del navegador (F12)

### 20. JSON.stringify para objetos

Los objetos complejos no se muestran bien en logs:

```typescript
console.log("Data:", JSON.stringify(data, null, 2));
```

---

## Validaciones

### 21. Validar existencia de entidades

Antes de crear relaciones, verificar que existan:

```typescript
const { data: room, error } = await supabase
  .from('rooms')
  .select('id')
  .eq('id', room_id)
  .single();

if (error || !room) {
  return { error: "Habitación no encontrada" };
}
```

### 22. Errores descriptivos

En lugar de errores genéricos, ser específico:

```typescript
// MAL
return { error: "Error" };

// BIEN
return {
  error: "Formato de fecha inválido. Use YYYY-MM-DD (ejemplo: 2026-01-20)"
};
```

---

## Resumen de Errores Comunes

| Error | Causa Probable | Solución |
|-------|----------------|----------|
| "Twilio credentials not configured" | Secrets faltantes | Agregar los 4 secrets en Supabase |
| Luna no responde | Edge Function vacía | Verificar y redesplegar |
| Mensaje no llega a WhatsApp | Usuario no en sandbox | Enviar "join xxx" primero |
| Error 405 en Dashboard | CORS no configurado | Agregar manejo de OPTIONS |
| Reservación con año 2024 | Fecha no inyectada | Agregar fecha actual al prompt |
| room_id inválido | OpenAI usando índices | Validar longitud > 10 |
