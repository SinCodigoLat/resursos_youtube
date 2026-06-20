# Crea CUALQUIER aplicación web y móvil sin programar (con IA)

Esta es la guía de acompañamiento del video. Aquí tienes el mapa completo, las herramientas, los prompts listos para copiar y las soluciones a los errores más comunes, para que repliques el proceso con tu propia idea.

> En el video construimos una **app de delivery sin comisiones** (web + móvil, hasta dejarla lista para las tiendas). Pero el método es el mismo para cualquier app: un CRM, reservas, inventario, marketplace, lo que sea. Cambia la idea, el camino no cambia.

---

## La idea central

No empieces por la herramienta. Empieza por el **problema**. Si no hay un problema real que resolver, nadie te va a dar su tiempo ni su dinero.

Tú eres el **arquitecto**. La IA construye, pero tú decides qué se construye y por qué. Esa es la habilidad que de verdad importa.

Toda aplicación tiene 3 partes:

1. **Interfaz** → lo que se ve.
2. **Datos** → lo que se guarda por detrás (no se ve).
3. **Integración** → lo que conecta ambas (lo que pasa cuando haces clic en un botón).

Si entiendes esto, vas a crear buenas apps. Si no, te vas a frustrar aunque la IA te ayude.

---

## El proceso en 4 pasos

| Paso | Qué haces | Herramientas |
|------|-----------|--------------|
| 1. Planifica | Conviertes tu problema en un PRD (documento de requerimientos) | Agente IA (Claude Code / Codex) |
| 2. Construye el panel web | Panel de control con base de datos y usuarios reales | Lovable + Supabase |
| 3. Publica en internet | Tu app web en línea, lista para mostrar a clientes | Cloudflare |
| 4. Lanza la app móvil | App para iOS y Android, lista para las tiendas | Expo + React Native → App Store / Google Play |

> Regla de oro: **no hagas la app móvil sin tener primero un panel de control web.** Si vas directo a lo móvil, te quedas sin visibilidad del proyecto cuando lances al mercado.

---

## Cuentas que vas a necesitar (todas tienen plan gratis)

- [ ] **Agente de IA** — [Claude Code](https://www.anthropic.com/claude-code) o [Codex (OpenAI)](https://openai.com/codex). El modelo casi no importa, todos son competentes hoy.
- [ ] [**Lovable**](https://lovable.dev) — genera la base de tu app web.
- [ ] [**GitHub**](https://github.com) — donde vive el código de tu proyecto.
- [ ] [**Supabase**](https://supabase.com) — base de datos, archivos y autenticación. Gratis hasta ~100.000 usuarios al iniciar.
- [ ] [**Cloudflare**](https://cloudflare.com) — para publicar tu web en internet.
- [ ] [**Expo**](https://expo.dev) — para construir y lanzar la app móvil.
- [ ] [**Apple Developer**](https://developer.apple.com) (iOS) y/o [**Google Play Console**](https://play.google.com/console) (Android) — solo cuando vayas a publicar en tiendas.
- [ ] Un dominio (opcional, ~10 USD/año en GoDaddy, Namecheap, etc.)

> Trabaja a costo cero mientras validas. Antes de gastar dinero, gana certeza de que alguien te va a pagar por la solución.

---

## Paso 1 — Planifica (del problema al PRD)

1. Abre tu agente de IA y empieza una sesión nueva en una carpeta del proyecto.
2. **Describe el problema, no la solución técnica.** Si el agente te sugiere un stack, no estás obligado a aceptarlo.
3. Pídele que genere un **PRD** (documento de requerimientos): roles, flujo, y sobre todo, cuál es el problema que resuelve.

### Prompt para describir el problema (ejemplo del video)

```
Quiero crear una aplicación para ayudar de 5 a 10 restaurantes que serán mis
primeros clientes, donde yo comienzo con una flota de delivery con motos.

- Los restaurantes no necesitan pasarme nada: yo escaneo su menú y lo subo a la app.
- El cliente final ordena desde la aplicación.
- La app notifica los pedidos a alguien del restaurante y a mí (el repartidor).
- Mi ventaja: no cobro el porcentaje que cobran Uber o Rappi. Solo cobro el envío,
  porque soy un negocio de flotas.

No me sugieras stack todavía. Primero ayúdame a pensar la solución y luego generamos un PRD.
```

> Adapta este prompt a TU idea. Lo importante es el patrón: problema → involucrados → flujo → qué tiene que pasar para considerarlo resuelto.

### Prompt para generar el PRD

```
Con base en el problema anterior, genérame un PRD (documento de requerimientos)
con alcance de MVP: roles, funcionalidades principales, flujo de usuario y el
problema central que resuelve.
```

---

## Paso 2 — Construye el panel web (Lovable + Supabase)

1. En [Lovable](https://lovable.dev), pega tu PRD y pide: **"crea este proyecto, enfócate en la parte web"**.
2. Elige una de las opciones que te ofrece y deja que genere la primera versión.
3. **No te pongas a editar dentro de Lovable.** En su lugar:
   - Ve a **Ajustes → Git → conectar con GitHub** y conecta el proyecto.
   - Copia el enlace del repo y pásaselo a tu agente de IA para abrir el proyecto **en local** (en tu computadora).
4. Conecta **Supabase** para tener base de datos y autenticación reales:
   - Crea un proyecto nuevo en Supabase (en la nube).
   - Pídele a tu agente que use el **Supabase CLI** y se conecte a ese proyecto en la nube.

> ¿Por qué local + nube? Trabajas el código en tu computadora (para editar), pero la base de datos vive en internet (para que funcione de verdad).

---

## Paso 3 — Publica en internet (Cloudflare)

1. Crea tu cuenta en [Cloudflare](https://cloudflare.com).
2. Pídele a tu agente que despliegue el proyecto a un **Worker de Cloudflare**.
3. Listo: ya tienes una URL pública que puedes mostrar a clientes.
4. (Opcional) Conecta un dominio propio:
   - Cómpralo en GoDaddy, Namecheap, etc. (~10 USD/año).
   - En Cloudflare → Dominios → agrega el dominio.
   - Pídele a tu agente: **"pon este dominio al sitio que acabas de desplegar"**.

---

## Paso 4 — Lanza la app móvil (Expo + React Native)

1. La app móvil reutiliza todo lo del panel web y agrega lo propio de móvil (por ejemplo, **notificaciones push**).
2. Pídele a tu agente que cree la app con **Expo + React Native** y la previsualice primero en **local** (simulador o tu teléfono).
3. Para lanzar:
   - **iOS:** se construye el binario con Expo y se sube a **TestFlight** (para probar) antes de publicar.
   - **Android:** pide el **APK / AAB** y súbelo a Google Play Console. Es el mismo proceso.

> Tip: empieza por iOS si puedes. Las apps de iOS suelen generar más ingresos. Pero todo lo que haces aquí sirve igual para Android.

### Lo que necesitas para iOS

- Una cuenta de **Apple Developer**.
- Tu **Team ID** (10 caracteres): developer.apple.com → Membresía → Detalles.
- Una **API Key de App Store Connect** (.p8): App Store Connect → Usuarios y Accesos → Integraciones → crear key con permisos de administración. **Se descarga una sola vez.**
- Si usas notificaciones push, Apple te pedirá un permiso específico para tu Apple ID.

---

## Función bonus del video: importar menús con un JSON

En vez de pedirle al restaurante que te llene su menú (están ocupados), tú lo haces por ellos sin fricción:

1. En el panel, genera la **plantilla de prompt** para importar el menú.
2. Pega ese prompt en ChatGPT **junto con una foto del menú** escaneado.
3. ChatGPT te devuelve el menú en formato JSON.
4. Pega ese JSON en el panel → Importar. Listo, el restaurante ya tiene su menú.

> Patrón general: quítale fricción a tus usuarios. Así como el cliente entra y pide sin pensar, el restaurante recibe su menú sin tener que hacer nada.

---

## Errores comunes y cómo resolverlos

**No puedo hacer login / botones que no responden**
No le pases a la IA solo el mensaje de error de pantalla (suele ser poco claro). Mejor:
1. Clic derecho → **Inspeccionar** → pestaña **Consola**.
2. Copia los errores que aparecen ahí.
3. Pégaselos a tu agente con contexto: *"no puedo hacer login, estos son los errores de la consola"*.

**Supabase: el registro/login no funciona al inicio**
A veces hay que desactivar el "confirmar email" en Supabase → Authentication → Providers. El agente no puede hacerlo solo, lo haces tú y luego le dices que continúe.

**Cloudflare / Expo se conectan a la cuenta equivocada**
Si manejas cuentas de clientes, el CLI puede conectarse a la que no es. Pídele explícitamente: *"haz login con mi cuenta personal, no la del cliente"* (o pásale el enlace de login correcto).

**Pon funciones porque hacen negocio, no por ponerlas**
Mira qué hacen las apps exitosas y traslada solo lo que aporta. Demasiadas funciones confunden al usuario y no hacen que tu proyecto gane dinero.

---

## Antes de publicar en tiendas

- Crea tu **política de privacidad** y **términos y condiciones**. Pídele a tu agente que los genere como páginas en el sitio web que ya publicaste, y enlázalos.
- Sube capturas, descripción y demás metadatos. Tu agente puede ayudarte con buena parte de esto vía la API de App Store Connect.

---

## ¿Quieres ayuda para llevar tu idea a la realidad?

Esto que ves es el mapa completo. Si quieres convertir tu idea, tu negocio local o ese proceso que hoy llevas a mano en un producto real:

👉 **[agenciasincodigo.com](https://agenciasincodigo.com/?utm_source=github&utm_medium=referral&utm_campaign=crear_cualquier_app_sin_programar&utm_content=readme)**

Ahí puedes ver cómo trabajo, hablarme directo y encontrar el camino correcto: hacerlo conmigo, hacerlo con acompañamiento o aprender el sistema paso a paso.

---

*Apps reales • MVPs • Automatización • Productos digitales · No-Code • IA aplicada*
