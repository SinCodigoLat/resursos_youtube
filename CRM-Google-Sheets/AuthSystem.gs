/**
 * SISTEMA DE AUTENTICACIÓN Y GESTIÓN DE USUARIOS
 * Google Apps Script - Extensión del CRUD de Clientes
 * 
 * Agrega funcionalidades de:
 * - Login/Logout
 * - Gestión de usuarios
 * - Roles (admin, usuario)
 * - Sesiones
 * 
 * @author Sistema CRM Cliente-Connect
 * @version 2.0.0
 */

// ============================================================================
// CONFIGURACIÓN DE USUARIOS
// ============================================================================

const USER_CONFIG = {
  SHEET_NAME: 'Usuarios',
  HEADER_ROW: 1,
  DATA_START_ROW: 2,
  COLUMNS: {
    ID: 1,
    EMAIL: 2,
    PASSWORD: 3,  // Nota: En producción usar hash
    NOMBRE: 4,
    ROL: 5,       // 'admin' o 'usuario'
    ACTIVO: 6,
    FECHA_CREACION: 7,
    ULTIMO_ACCESO: 8
  },
  ROLES_VALIDOS: ['admin', 'usuario'],
  SESSION_DURATION: 24 * 60 * 60 * 1000 // 24 horas en milisegundos
};

// ============================================================================
// FUNCIONES AUXILIARES DE USUARIOS
// ============================================================================

/**
 * Obtiene la hoja de usuarios
 * @returns {Sheet} La hoja de usuarios
 */
function getUsuariosSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(USER_CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(USER_CONFIG.SHEET_NAME);
    inicializarHojaUsuarios(sheet);
    crearAdminInicial(sheet);
  }
  
  return sheet;
}

/**
 * Inicializa la hoja de usuarios con encabezados
 * @param {Sheet} sheet - La hoja a inicializar
 */
function inicializarHojaUsuarios(sheet) {
  const headers = [
    'ID', 'Email', 'Password', 'Nombre', 
    'Rol', 'Activo', 'Fecha Creación', 'Último Acceso'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#34a853')
    .setFontColor('#ffffff');
  
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
  
  // Proteger la hoja para que solo admins puedan editarla
  const protection = sheet.protect().setDescription('Hoja de usuarios protegida');
  protection.setWarningOnly(true);
}

/**
 * Crea el usuario administrador inicial
 * @param {Sheet} sheet - La hoja de usuarios
 */
function crearAdminInicial(sheet) {
  const adminData = [
    1,
    'admin@crm.com',
    hashPassword('admin123'),  // Password inicial: admin123
    'Administrador',
    'admin',
    'SI',
    new Date().toISOString(),
    ''
  ];
  
  sheet.appendRow(adminData);
  
  Logger.log('Usuario administrador creado:');
  Logger.log('Email: admin@crm.com');
  Logger.log('Password: admin123');
  Logger.log('⚠️ IMPORTANTE: Cambiar la contraseña después del primer login');
}

/**
 * Genera un hash simple de la contraseña
 * NOTA: En producción usar un método más seguro
 * @param {string} password - Contraseña en texto plano
 * @returns {string} Hash de la contraseña
 */
function hashPassword(password) {
  // En producción, usar un método más seguro como bcrypt
  // Por ahora usamos un hash simple con Utilities
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password,
    Utilities.Charset.UTF_8
  );
  
  return hash.map(byte => {
    const v = (byte < 0) ? 256 + byte : byte;
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

/**
 * Genera un nuevo ID de usuario
 * @returns {number} Nuevo ID
 */
function generarNuevoIdUsuario() {
  const sheet = getUsuariosSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < USER_CONFIG.DATA_START_ROW) {
    return 1;
  }
  
  const ids = sheet.getRange(USER_CONFIG.DATA_START_ROW, USER_CONFIG.COLUMNS.ID, lastRow - 1, 1).getValues();
  const maxId = Math.max(...ids.map(row => row[0] || 0));
  
  return maxId + 1;
}

/**
 * Convierte una fila de datos en un objeto usuario
 * @param {Array} fila - Fila de datos
 * @param {number} rowIndex - Índice de la fila
 * @returns {Object} Objeto usuario (sin password)
 */
function filaAUsuario(fila, rowIndex, includePassword = false) {
  const usuario = {
    id: fila[0],
    email: fila[1],
    nombre: fila[3],
    rol: fila[4],
    activo: fila[5] === 'SI',
    fechaCreacion: fila[6],
    ultimoAcceso: fila[7],
    rowIndex: rowIndex
  };
  
  if (includePassword) {
    usuario.password = fila[2];
  }
  
  return usuario;
}

// ============================================================================
// OPERACIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Valida las credenciales de un usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Object} Resultado de la autenticación
 */
function login(email, password) {
  try {
    const sheet = getUsuariosSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < USER_CONFIG.DATA_START_ROW) {
      return {
        exito: false,
        mensaje: 'No hay usuarios registrados'
      };
    }
    
    const data = sheet.getRange(USER_CONFIG.DATA_START_ROW, 1, lastRow - 1, 8).getValues();
    
    // Buscar usuario por email
    const userIndex = data.findIndex(row => row[1].toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado'
      };
    }
    
    const userData = data[userIndex];
    const usuario = filaAUsuario(userData, USER_CONFIG.DATA_START_ROW + userIndex, true);
    
    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return {
        exito: false,
        mensaje: 'Usuario desactivado. Contacte al administrador.'
      };
    }
    
    // Verificar contraseña
    const passwordHash = hashPassword(password);
    if (usuario.password !== passwordHash) {
      return {
        exito: false,
        mensaje: 'Contraseña incorrecta'
      };
    }
    
    // Actualizar último acceso
    sheet.getRange(usuario.rowIndex, USER_CONFIG.COLUMNS.ULTIMO_ACCESO)
      .setValue(new Date().toISOString());
    
    // Generar token de sesión
    const token = generarToken(usuario);
    
    // Eliminar password antes de devolver
    delete usuario.password;
    delete usuario.rowIndex;
    
    return {
      exito: true,
      mensaje: 'Login exitoso',
      usuario: usuario,
      token: token
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error en el login',
      error: error.toString()
    };
  }
}

/**
 * Genera un token de sesión
 * @param {Object} usuario - Datos del usuario
 * @returns {string} Token de sesión
 */
function generarToken(usuario) {
  const tokenData = {
    userId: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    timestamp: new Date().getTime()
  };
  
  // En producción, usar JWT o similar
  const token = Utilities.base64Encode(JSON.stringify(tokenData));
  return token;
}

/**
 * Valida un token de sesión
 * @param {string} token - Token a validar
 * @returns {Object} Resultado de la validación
 */
function validarToken(token) {
  try {
    if (!token) {
      return {
        valido: false,
        mensaje: 'Token no proporcionado'
      };
    }
    
    const tokenData = JSON.parse(Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString());
    
    // Verificar expiración
    const now = new Date().getTime();
    const tokenAge = now - tokenData.timestamp;
    
    if (tokenAge > USER_CONFIG.SESSION_DURATION) {
      return {
        valido: false,
        mensaje: 'Sesión expirada'
      };
    }
    
    return {
      valido: true,
      usuario: tokenData
    };
    
  } catch (error) {
    return {
      valido: false,
      mensaje: 'Token inválido',
      error: error.toString()
    };
  }
}

// ============================================================================
// GESTIÓN DE USUARIOS (Solo Admin)
// ============================================================================

/**
 * Crea un nuevo usuario (solo admin)
 * @param {Object} datosUsuario - Datos del nuevo usuario
 * @param {string} tokenAdmin - Token del administrador
 * @returns {Object} Resultado de la operación
 */
function crearUsuario(datosUsuario, tokenAdmin) {
  try {
    // Validar que quien crea es admin
    const validacion = validarToken(tokenAdmin);
    if (!validacion.valido || validacion.usuario.rol !== 'admin') {
      return {
        exito: false,
        mensaje: 'Solo los administradores pueden crear usuarios'
      };
    }
    
    // Validar datos
    if (!datosUsuario.email || !datosUsuario.password || !datosUsuario.nombre) {
      return {
        exito: false,
        mensaje: 'Email, password y nombre son requeridos'
      };
    }
    
    if (!datosUsuario.rol || !USER_CONFIG.ROLES_VALIDOS.includes(datosUsuario.rol)) {
      return {
        exito: false,
        mensaje: `El rol debe ser: ${USER_CONFIG.ROLES_VALIDOS.join(' o ')}`
      };
    }
    
    // Verificar que el email no exista
    const sheet = getUsuariosSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow >= USER_CONFIG.DATA_START_ROW) {
      const emails = sheet.getRange(USER_CONFIG.DATA_START_ROW, USER_CONFIG.COLUMNS.EMAIL, lastRow - 1, 1).getValues();
      const emailExiste = emails.some(row => row[0].toLowerCase() === datosUsuario.email.toLowerCase());
      
      if (emailExiste) {
        return {
          exito: false,
          mensaje: 'El email ya está registrado'
        };
      }
    }
    
    // Crear usuario
    const nuevoId = generarNuevoIdUsuario();
    const userData = [
      nuevoId,
      datosUsuario.email,
      hashPassword(datosUsuario.password),
      datosUsuario.nombre,
      datosUsuario.rol,
      'SI',
      new Date().toISOString(),
      ''
    ];
    
    sheet.appendRow(userData);
    
    return {
      exito: true,
      mensaje: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoId,
        email: datosUsuario.email,
        nombre: datosUsuario.nombre,
        rol: datosUsuario.rol,
        activo: true
      }
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al crear usuario',
      error: error.toString()
    };
  }
}

/**
 * Lista todos los usuarios (solo admin)
 * @param {string} tokenAdmin - Token del administrador
 * @returns {Object} Lista de usuarios
 */
function listarUsuarios(tokenAdmin) {
  try {
    // Validar que quien consulta es admin
    const validacion = validarToken(tokenAdmin);
    if (!validacion.valido || validacion.usuario.rol !== 'admin') {
      return {
        exito: false,
        mensaje: 'Solo los administradores pueden listar usuarios'
      };
    }
    
    const sheet = getUsuariosSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < USER_CONFIG.DATA_START_ROW) {
      return {
        exito: true,
        mensaje: 'No hay usuarios registrados',
        usuarios: []
      };
    }
    
    const data = sheet.getRange(USER_CONFIG.DATA_START_ROW, 1, lastRow - 1, 8).getValues();
    const usuarios = data.map((fila, index) => 
      filaAUsuario(fila, USER_CONFIG.DATA_START_ROW + index, false)
    );
    
    return {
      exito: true,
      mensaje: `${usuarios.length} usuario(s) encontrado(s)`,
      usuarios: usuarios
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al listar usuarios',
      error: error.toString()
    };
  }
}

/**
 * Actualiza un usuario (solo admin)
 * @param {number} userId - ID del usuario a actualizar
 * @param {Object} datosActualizados - Datos a actualizar
 * @param {string} tokenAdmin - Token del administrador
 * @returns {Object} Resultado de la operación
 */
function actualizarUsuario(userId, datosActualizados, tokenAdmin) {
  try {
    // Validar que quien actualiza es admin
    const validacion = validarToken(tokenAdmin);
    if (!validacion.valido || validacion.usuario.rol !== 'admin') {
      return {
        exito: false,
        mensaje: 'Solo los administradores pueden actualizar usuarios'
      };
    }
    
    const sheet = getUsuariosSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < USER_CONFIG.DATA_START_ROW) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado'
      };
    }
    
    const data = sheet.getRange(USER_CONFIG.DATA_START_ROW, 1, lastRow - 1, 8).getValues();
    const userIndex = data.findIndex(row => row[0] === userId);
    
    if (userIndex === -1) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado'
      };
    }
    
    const rowIndex = USER_CONFIG.DATA_START_ROW + userIndex;
    
    // Actualizar campos permitidos
    if (datosActualizados.nombre) {
      sheet.getRange(rowIndex, USER_CONFIG.COLUMNS.NOMBRE).setValue(datosActualizados.nombre);
    }
    
    if (datosActualizados.rol && USER_CONFIG.ROLES_VALIDOS.includes(datosActualizados.rol)) {
      sheet.getRange(rowIndex, USER_CONFIG.COLUMNS.ROL).setValue(datosActualizados.rol);
    }
    
    if (datosActualizados.activo !== undefined) {
      sheet.getRange(rowIndex, USER_CONFIG.COLUMNS.ACTIVO).setValue(datosActualizados.activo ? 'SI' : 'NO');
    }
    
    if (datosActualizados.password) {
      sheet.getRange(rowIndex, USER_CONFIG.COLUMNS.PASSWORD).setValue(hashPassword(datosActualizados.password));
    }
    
    return {
      exito: true,
      mensaje: 'Usuario actualizado exitosamente'
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al actualizar usuario',
      error: error.toString()
    };
  }
}

/**
 * Elimina un usuario (solo admin)
 * @param {number} userId - ID del usuario a eliminar
 * @param {string} tokenAdmin - Token del administrador
 * @returns {Object} Resultado de la operación
 */
function eliminarUsuario(userId, tokenAdmin) {
  try {
    // Validar que quien elimina es admin
    const validacion = validarToken(tokenAdmin);
    if (!validacion.valido || validacion.usuario.rol !== 'admin') {
      return {
        exito: false,
        mensaje: 'Solo los administradores pueden eliminar usuarios'
      };
    }
    
    // No permitir eliminar el usuario admin principal (ID 1)
    if (userId === 1) {
      return {
        exito: false,
        mensaje: 'No se puede eliminar el administrador principal'
      };
    }
    
    const sheet = getUsuariosSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < USER_CONFIG.DATA_START_ROW) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado'
      };
    }
    
    const data = sheet.getRange(USER_CONFIG.DATA_START_ROW, 1, lastRow - 1, 8).getValues();
    const userIndex = data.findIndex(row => row[0] === userId);
    
    if (userIndex === -1) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado'
      };
    }
    
    const rowIndex = USER_CONFIG.DATA_START_ROW + userIndex;
    sheet.deleteRow(rowIndex);
    
    return {
      exito: true,
      mensaje: 'Usuario eliminado exitosamente'
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al eliminar usuario',
      error: error.toString()
    };
  }
}

// ============================================================================
// API WEB APP ACTUALIZADA CON AUTENTICACIÓN
// ============================================================================

/**
 * Maneja las peticiones OPTIONS (CORS preflight)
 * Esta función es necesaria para que el navegador permita peticiones POST
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta vacía con headers CORS
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Maneja las peticiones GET con autenticación
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta JSON
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'list';
    const token = e.parameter.token;
    
    // Acciones públicas (no requieren autenticación)
    if (action === 'login') {
      return ContentService
        .createTextOutput(JSON.stringify({
          exito: false,
          mensaje: 'Use POST para login'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validar token para acciones protegidas
    const validacion = validarToken(token);
    if (!validacion.valido) {
      return ContentService
        .createTextOutput(JSON.stringify({
          exito: false,
          mensaje: 'Sesión inválida o expirada',
          requiereLogin: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let resultado;
    const id = e.parameter.id ? parseInt(e.parameter.id) : null;
    
    switch (action) {
      case 'list':
        resultado = leerClientes(e.parameter);
        break;
        
      case 'get':
        if (!id) {
          resultado = { exito: false, mensaje: 'ID requerido' };
        } else {
          resultado = leerClientePorId(id);
        }
        break;
        
      case 'stats':
        resultado = obtenerEstadisticas();
        break;
        
      case 'top':
        const limite = e.parameter.limite ? parseInt(e.parameter.limite) : 10;
        resultado = obtenerTopClientes(limite);
        break;
        
      case 'users':
        resultado = listarUsuarios(token);
        break;
        
      default:
        resultado = { exito: false, mensaje: 'Acción no válida' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: 'Error en la petición',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Maneja las peticiones POST con autenticación
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta JSON
 */
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const action = datos.action;
    
    let resultado;
    
    // Login no requiere token
    if (action === 'login') {
      resultado = login(datos.email, datos.password);
      return ContentService
        .createTextOutput(JSON.stringify(resultado))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Validar token para otras acciones
    const validacion = validarToken(datos.token);
    if (!validacion.valido) {
      return ContentService
        .createTextOutput(JSON.stringify({
          exito: false,
          mensaje: 'Sesión inválida o expirada',
          requiereLogin: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    switch (action) {
      case 'create':
        resultado = crearCliente(datos.cliente);
        break;
        
      case 'update':
        if (!datos.id) {
          resultado = { exito: false, mensaje: 'ID requerido' };
        } else {
          resultado = actualizarCliente(datos.id, datos.cliente);
        }
        break;
        
      case 'delete':
        if (!datos.id) {
          resultado = { exito: false, mensaje: 'ID requerido' };
        } else {
          resultado = eliminarCliente(datos.id);
        }
        break;
        
      case 'createUser':
        resultado = crearUsuario(datos.usuario, datos.token);
        break;
        
      case 'updateUser':
        resultado = actualizarUsuario(datos.userId, datos.usuario, datos.token);
        break;
        
      case 'deleteUser':
        resultado = eliminarUsuario(datos.userId, datos.token);
        break;
        
      default:
        resultado = { exito: false, mensaje: 'Acción no válida' };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        exito: false,
        mensaje: 'Error en la petición',
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// FUNCIONES DE PRUEBA
// ============================================================================

/**
 * Función de prueba para crear la hoja de usuarios
 */
function testCrearHojaUsuarios() {
  const sheet = getUsuariosSheet();
  Logger.log('Hoja de usuarios creada');
  Logger.log('Usuario admin creado con email: admin@crm.com y password: admin123');
}

/**
 * Función de prueba para login
 */
function testLogin() {
  const resultado = login('admin@crm.com', 'admin123');
  Logger.log(resultado);
}

/**
 * Función de prueba para crear usuario
 */
function testCrearUsuarioNuevo() {
  // Primero hacer login como admin
  const loginResult = login('admin@crm.com', 'admin123');
  
  if (loginResult.exito) {
    const nuevoUsuario = {
      email: 'usuario@crm.com',
      password: 'usuario123',
      nombre: 'Usuario Test',
      rol: 'usuario'
    };
    
    const resultado = crearUsuario(nuevoUsuario, loginResult.token);
    Logger.log(resultado);
  }
}
