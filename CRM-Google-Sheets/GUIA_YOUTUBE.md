GUIA MAESTRA: CRM PROFESIONAL Y GRATIS CON GOOGLE SHEETS

Objetivo: Crear una aplicación web (CRM) con gestión de clientes, pipeline y reportes, eliminando costos de software empresarial.

================================================================================
HERRAMIENTAS NECESARIAS
================================================================================

- Base de Datos: Google Sheets
- Lógica/IA: ChatGPT y Lovable (Frontend)
- Código: GitHub, Antigravity, Vercel (Hosting)
- Conector: Google Apps Script

================================================================================
PASO 1: DISEÑO Y FRONTEND
================================================================================

1.1 Preparar los Datos
   - Abre Google Sheets y crea una nueva hoja de cálculo
   - Nómbrala "CRM - Cliente Connect"
   - Crea la primera hoja llamada "Clientes" con estos encabezados:
     ID | Cliente | Región | Asignado a | Monto | Estado | Fecha | Producto | Notas
   - Agrega algunos datos de ejemplo para probar

1.2 Definir Funcionalidades con IA
   - Abre ChatGPT y describe tu CRM
   - Pide que defina las funciones principales basadas en tus datos
   - Solicita sugerencias de dashboard, métricas y reportes

1.3 Generar la Interfaz en Lovable
   - Usa Lovable para generar la interfaz profesional
   - Enfócate en el diseño visual, dashboard y lista de clientes
   - IMPORTANTE: En esta etapa NO te preocupes por la conexión técnica
   - Eso lo haremos después de exportar el código

================================================================================
PASO 2: ENTORNO DE DESARROLLO
================================================================================

2.1 Sincronizar con GitHub
   - En Lovable, exporta tu proyecto a GitHub
   - Esto crea una copia de seguridad y control de versiones
   - Anota la URL de tu repositorio

2.2 Configurar Antigravity
   - Abre Antigravity (este IDE de Google)
   - Clona el repositorio desde GitHub
   - En la terminal, ejecuta:
     npm install
     npm run dev
   - Verifica que la app se previsualiza localmente en http://localhost:8080

================================================================================
PASO 3: BACKEND Y SOLUCION CORS (PASO CRITICO)
================================================================================

Este es el paso más importante. Aquí conectamos tu interfaz con Google Sheets.

3.1 Generar el Script de Google Apps
   - Pide a ChatGPT que genere el código Google Apps Script para:
     * Leer clientes (GET)
     * Crear clientes (POST)
     * Actualizar clientes (PUT)
     * Eliminar clientes (DELETE)
   - El script debe incluir funciones para autenticación de usuarios

3.2 Copiar el Script a Google Sheets
   - Abre tu Google Sheet "CRM - Cliente Connect"
   - Ve a: Extensiones > Apps Script
   - Se abrirá el editor de Apps Script
   - ELIMINA todo el código que aparece por defecto
   - Pega el código generado por ChatGPT

3.3 Agregar Archivos Adicionales
   - Si tienes múltiples archivos (ClientesCRUD.gs, AuthSystem.gs):
     * Haz clic en el "+" junto a "Archivos"
     * Selecciona "Secuencia de comandos"
     * Nómbralo apropiadamente
     * Pega el código correspondiente
   - Guarda todos los archivos (Ctrl/Cmd + S)

3.4 PUNTO CRITICO: Función doOptions (Solución CORS)

PROBLEMA: Cuando tu aplicación web intenta comunicarse con Google Apps Script,
el navegador primero envía una petición "OPTIONS" para verificar si es seguro.
Si Google Apps Script no responde a esta petición, el navegador bloquea la 
conexión y verás errores como "CORS policy blocked" o "Network Error".

SOLUCION: Tu script DEBE incluir esta función exactamente como se muestra:

```javascript
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

IMPORTANTE: Esta función debe estar en el archivo principal de tu script.
Sin esta función, el login y todas las operaciones CRUD fallarán.

ALTERNATIVA (si la anterior no funciona):

```javascript
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON).append(JSON.stringify({status: "success"}));
  return output.setHeader("Access-Control-Allow-Origin", "*")
               .setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
               .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

3.5 Configurar las Funciones doGet y doPost

Asegúrate de que tu script también tenga estas funciones:

```javascript
function doGet(e) {
  // Maneja peticiones GET (leer datos)
  // Tu código aquí
}

function doPost(e) {
  // Maneja peticiones POST (crear/actualizar/eliminar)
  // Tu código aquí
}
```

NOTA: Estas funciones deben devolver respuestas con:
- ContentService.createTextOutput(JSON.stringify(resultado))
- .setMimeType(ContentService.MimeType.JSON)

3.6 Crear la Hoja de Usuarios (Para Login)
   - En Apps Script, busca la función: testCrearHojaUsuarios
   - Selecciónala en el menú desplegable superior
   - Haz clic en "Ejecutar" (botón play)
   - AUTORIZA los permisos cuando se solicite:
     * Selecciona tu cuenta de Google
     * Click en "Avanzado"
     * Click en "Ir a [nombre del proyecto] (no seguro)"
     * Click en "Permitir"
   - Verifica que en tu Google Sheet ahora hay una hoja "Usuarios"
   - Debe tener un usuario admin con:
     Email: admin@crm.com
     Password: admin123 (hasheado)

3.7 Publicar como Aplicación Web (CONFIGURACION CRITICA)

ATENCION: Esta configuración es CRUCIAL para que todo funcione.

Pasos:
1. En Apps Script, haz clic en "Implementar" (esquina superior derecha)
2. Selecciona "Nueva implementación"
3. Haz clic en el ícono de engranaje junto a "Seleccionar tipo"
4. Selecciona "Aplicación web"
5. Configura EXACTAMENTE así:
   - Descripción: "CRM API v1" (o cualquier nombre)
   - Ejecutar como: "Yo" (tu email)
   - Quién tiene acceso: "Cualquier persona" <-- MUY IMPORTANTE
6. Haz clic en "Implementar"
7. COPIA la URL completa que aparece (termina en /exec)

Ejemplo de URL:
https://script.google.com/macros/s/AKfycbzybsEzNsKIae8_ykvgyPtkNhBH0sfnu0UTdiUJo4oQ1b2AXeEZFjDEU-U0yV4pJcQKlg/exec

IMPORTANTE: Guarda esta URL en un lugar seguro. La necesitarás en el siguiente paso.

POR QUE "Cualquier persona": 
- Si pones "Solo yo", tu aplicación web no podrá acceder al script
- "Cualquier persona" permite que tu app (desplegada en Vercel) acceda al script
- La seguridad se maneja con el sistema de login en tu app, no aquí

================================================================================
PASO 4: INTEGRACION Y ACTUALIZACION
================================================================================

4.1 Conectar la URL en tu Código
   - En Antigravity, abre el archivo: /src/lib/config.ts
   - Busca la línea que dice: googleSheetsApiUrl
   - Reemplaza la URL con la que copiaste en el paso 3.7:

   export const config = {
     googleSheetsApiUrl: 'https://script.google.com/macros/s/TU_ID_AQUI/exec',
     // ... resto del código
   };

   - Guarda el archivo (Ctrl/Cmd + S)

4.2 Probar la Conexión Localmente
   - Asegúrate de que el servidor de desarrollo esté corriendo (npm run dev)
   - Si no está corriendo, ejecuta: npm run dev
   - Abre el navegador en: http://localhost:8080
   - Deberías ser redirigido a /login

4.3 Probar el Login
   - Usa las credenciales por defecto:
     Email: admin@crm.com
     Contraseña: admin123
   - Si el login funciona, verás el dashboard
   - Si ves un error, ve a la sección de Troubleshooting más abajo

4.4 REGLA DE ORO: Actualizaciones del Script

IMPORTANTE: Cada vez que hagas cambios en Google Apps Script:
1. Guarda los cambios en Apps Script
2. Ve a "Implementar" > "Nueva implementación" (NO "Administrar implementaciones")
3. Copia la NUEVA URL
4. Actualiza /src/lib/config.ts con la nueva URL
5. Reinicia el servidor de desarrollo (Ctrl+C y luego npm run dev)

POR QUE: Google Apps Script cachea las implementaciones. Si solo guardas sin 
crear una nueva implementación, tus cambios no se reflejarán en la app.

================================================================================
PASO 5: SEGURIDAD Y OPTIMIZACION MOVIL
================================================================================

5.1 Sistema de Login
   - El código ya incluye un sistema de autenticación
   - Verifica que funcione correctamente
   - Cambia la contraseña del admin después del primer login
   - Crea usuarios adicionales desde el panel de administración

5.2 Gestión de Usuarios
   - Solo los usuarios admin pueden crear/editar/eliminar otros usuarios
   - Los usuarios normales solo pueden ver y gestionar clientes
   - Verifica los roles y permisos

5.3 Optimización Móvil
   - El diseño ya es responsive
   - Prueba en diferentes tamaños de pantalla
   - Verifica que el menú de navegación inferior funcione en móvil
   - Prueba el botón flotante de acción (FAB)

================================================================================
PASO 6: DESPLIEGUE EN VERCEL
================================================================================

6.1 Preparar el Código
   - Asegúrate de que todos los cambios estén guardados
   - En la terminal de Antigravity, ejecuta:
     git add .
     git commit -m "feat: Configuración inicial del CRM"
     git push origin main

6.2 Conectar con Vercel
   - Ve a: https://vercel.com
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "Add New Project"
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite

6.3 Configurar el Proyecto
   - Framework Preset: Vite (detectado automáticamente)
   - Build Command: npm run build
   - Output Directory: dist
   - Install Command: npm install
   - NO necesitas agregar variables de entorno (la URL ya está en el código)

6.4 Desplegar
   - Haz clic en "Deploy"
   - Espera 1-2 minutos mientras Vercel construye y despliega
   - Vercel te dará una URL como: https://tu-proyecto.vercel.app

6.5 Verificar el Despliegue
   - Abre la URL de Vercel en tu navegador
   - Prueba el login
   - Verifica que puedas crear/editar/eliminar clientes
   - Confirma que los cambios se reflejan en Google Sheets

6.6 Configurar Dominio Personalizado (Opcional)
   - En Vercel, ve a Settings > Domains
   - Agrega tu dominio personalizado
   - Sigue las instrucciones de configuración DNS

================================================================================
CHECKLIST FINAL DE LANZAMIENTO
================================================================================

Antes de entregar el CRM a tu equipo, verifica TODOS estos puntos:

[ ] Google Sheets configurado con hojas "Clientes" y "Usuarios"
[ ] Usuario admin creado (admin@crm.com)
[ ] Código de Google Apps Script copiado completamente
[ ] Función doOptions presente en el script
[ ] Script desplegado como "Aplicación web"
[ ] Configuración de acceso: "Cualquier persona"
[ ] URL del script copiada y actualizada en /src/lib/config.ts
[ ] Login funciona localmente (http://localhost:8080)
[ ] Al crear un cliente en la app, se refleja en Google Sheets
[ ] Al editar un cliente en la app, se actualiza en Google Sheets
[ ] Al eliminar un cliente en la app, se elimina de Google Sheets
[ ] Dashboard muestra métricas correctas
[ ] Pipeline de ventas funciona
[ ] Gestión de usuarios funciona (solo admin)
[ ] Vista móvil se ve correctamente
[ ] Código subido a GitHub
[ ] Proyecto desplegado en Vercel
[ ] Login funciona en producción (URL de Vercel)
[ ] CRUD de clientes funciona en producción

================================================================================
TROUBLESHOOTING: SOLUCION DE PROBLEMAS COMUNES
================================================================================

PROBLEMA 1: Error "CORS policy blocked" o "Network Error"

CAUSA: La función doOptions no está presente o no está configurada correctamente.

SOLUCION:
1. Abre Google Apps Script
2. Verifica que existe la función doOptions (ver Paso 3.4)
3. Si no existe, agrégala
4. Guarda el archivo
5. Crea una NUEVA implementación (Implementar > Nueva implementación)
6. Copia la NUEVA URL
7. Actualiza /src/lib/config.ts con la nueva URL
8. Reinicia el servidor (Ctrl+C y npm run dev)

PROBLEMA 2: Error "Usuario no encontrado" al hacer login

CAUSA: La hoja de Usuarios no existe o no tiene el usuario admin.

SOLUCION:
1. Abre tu Google Sheet
2. Verifica que existe una hoja llamada "Usuarios"
3. Si no existe, ve a Apps Script
4. Ejecuta la función: testCrearHojaUsuarios
5. Verifica que ahora existe la hoja con el usuario admin
6. Intenta login nuevamente

PROBLEMA 3: Error "Acceso denegado" o "Permission denied"

CAUSA: La implementación del script no está configurada como "Cualquier persona".

SOLUCION:
1. Abre Google Apps Script
2. Ve a Implementar > Administrar implementaciones
3. Haz clic en el ícono de lápiz (editar) en la implementación activa
4. Verifica que "Quién tiene acceso" esté en "Cualquier persona"
5. Si no lo está, cámbialo
6. Guarda los cambios
7. Copia la URL (puede haber cambiado)
8. Actualiza /src/lib/config.ts si es necesario

PROBLEMA 4: Los cambios en el script no se reflejan en la app

CAUSA: Estás usando una URL de implementación antigua.

SOLUCION:
1. En Google Apps Script, crea una NUEVA implementación
2. NO uses "Administrar implementaciones"
3. Usa "Implementar > Nueva implementación"
4. Copia la NUEVA URL
5. Actualiza /src/lib/config.ts
6. Reinicia el servidor de desarrollo

PROBLEMA 5: Login funciona localmente pero no en Vercel

CAUSA: La URL del script no está actualizada en el código desplegado.

SOLUCION:
1. Verifica que /src/lib/config.ts tiene la URL correcta
2. Haz commit y push:
   git add .
   git commit -m "fix: Actualizar URL de Google Apps Script"
   git push origin main
3. Vercel redespliegará automáticamente
4. Espera 1-2 minutos y prueba nuevamente

PROBLEMA 6: Error al crear/editar clientes

CAUSA: El script no tiene permisos o la hoja no existe.

SOLUCION:
1. Verifica que la hoja "Clientes" existe en Google Sheets
2. Verifica que los encabezados están en la fila 1
3. Abre la consola del navegador (F12) y revisa el error exacto
4. Verifica que el token de autenticación se está enviando correctamente

PROBLEMA 7: Error "Failed to fetch" o "TypeError: Failed to fetch"

CAUSA: La URL del script es incorrecta o el script no está desplegado.

SOLUCION:
1. Verifica que la URL en config.ts termina en /exec
2. Copia la URL y ábrela directamente en el navegador
3. Deberías ver una respuesta JSON (aunque sea un error)
4. Si no ves nada, el script no está desplegado correctamente
5. Vuelve al Paso 3.7 y despliega nuevamente

================================================================================
NOTAS IMPORTANTES
================================================================================

SOBRE CORS:
El error de CORS es el problema MAS COMUN al configurar este proyecto.
La solución está en la función doOptions que maneja las peticiones preflight.
Esta función DEBE estar presente en tu script de Google Apps.

SOBRE SEGURIDAD:
- Este proyecto usa autenticación básica para fines educativos
- Para producción real, considera:
  * Usar JWT en lugar de tokens base64
  * Implementar bcrypt para hashear contraseñas
  * Agregar rate limiting
  * Implementar autenticación de dos factores (2FA)
  * Usar HTTPS siempre (Vercel lo hace automáticamente)

SOBRE GOOGLE SHEETS:
- Google Sheets tiene límites: 500 peticiones por 100 segundos
- Ideal para equipos pequeños (hasta 50 usuarios concurrentes)
- Para más usuarios, considera migrar a una base de datos real

SOBRE ACTUALIZACIONES:
- Cada push a GitHub activa un redespliegue automático en Vercel
- Los cambios en Google Apps Script requieren nueva implementación
- Mantén sincronizadas las URLs entre el script y tu código

================================================================================
RECURSOS ADICIONALES
================================================================================

Documentación del Proyecto:
- README.md - Descripción general
- docs/AUTH_SETUP.md - Configuración de autenticación
- docs/DEPLOY_VERCEL.md - Guía de despliegue detallada
- docs/MOBILE_OPTIMIZATION.md - Optimización móvil

Tecnologías Utilizadas:
- React 18 - Framework de UI
- TypeScript - Tipado estático
- Vite - Build tool
- Tailwind CSS - Estilos
- Shadcn/ui - Componentes
- Google Apps Script - Backend serverless
- Google Sheets - Base de datos

Soporte:
- Email: contacto@sincodigolat.com
- YouTube: @SinCodigoLat
- GitHub: https://github.com/SinCodigoLat/cliente-connect

================================================================================

Hecho con dedicación por SinCodigoLat
Versión: 1.0 - Enero 2026