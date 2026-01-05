/**
 * CRUD COMPLETO PARA CLIENTES - Google Apps Script
 * 
 * Este script proporciona operaciones CRUD (Create, Read, Update, Delete)
 * para gestionar clientes en Google Sheets.
 * 
 * Estructura del CSV:
 * ID, Cliente, Región, Asignado a, Monto, Estado, Fecha, Producto, Notas
 * 
 * @author Sistema CRM Cliente-Connect
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * Configuración de la hoja de cálculo
 */
const CONFIG = {
  SHEET_NAME: 'Clientes',
  HEADER_ROW: 1,
  DATA_START_ROW: 2,
  COLUMNS: {
    ID: 1,
    CLIENTE: 2,
    REGION: 3,
    ASIGNADO_A: 4,
    MONTO: 5,
    ESTADO: 6,
    FECHA: 7,
    PRODUCTO: 8,
    NOTAS: 9
  },
  ESTADOS_VALIDOS: ['Activo', 'Prospecto', 'Cerrado'],
  REGIONES_VALIDAS: ['Norte', 'Sur', 'Este', 'Oeste']
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene la hoja de clientes
 * @returns {Sheet} La hoja de clientes
 */
function getClientesSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    inicializarHoja(sheet);
  }
  
  return sheet;
}

/**
 * Inicializa la hoja con los encabezados
 * @param {Sheet} sheet - La hoja a inicializar
 */
function inicializarHoja(sheet) {
  const headers = [
    'ID', 'Cliente', 'Región', 'Asignado a', 
    'Monto', 'Estado', 'Fecha', 'Producto', 'Notas'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('#ffffff');
  
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Genera un nuevo ID único
 * @returns {number} Nuevo ID
 */
function generarNuevoId() {
  const sheet = getClientesSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow < CONFIG.DATA_START_ROW) {
    return 1;
  }
  
  const ids = sheet.getRange(CONFIG.DATA_START_ROW, CONFIG.COLUMNS.ID, lastRow - 1, 1).getValues();
  const maxId = Math.max(...ids.map(row => row[0] || 0));
  
  return maxId + 1;
}

/**
 * Valida los datos del cliente
 * @param {Object} cliente - Datos del cliente
 * @returns {Object} Resultado de validación {valido: boolean, errores: string[]}
 */
function validarCliente(cliente) {
  const errores = [];
  
  // Validar campos requeridos
  if (!cliente.cliente || cliente.cliente.trim() === '') {
    errores.push('El nombre del cliente es requerido');
  }
  
  if (!cliente.region || !CONFIG.REGIONES_VALIDAS.includes(cliente.region)) {
    errores.push(`La región debe ser una de: ${CONFIG.REGIONES_VALIDAS.join(', ')}`);
  }
  
  if (!cliente.asignadoA || cliente.asignadoA.trim() === '') {
    errores.push('El campo "Asignado a" es requerido');
  }
  
  if (!cliente.monto || isNaN(cliente.monto) || cliente.monto < 0) {
    errores.push('El monto debe ser un número positivo');
  }
  
  if (!cliente.estado || !CONFIG.ESTADOS_VALIDOS.includes(cliente.estado)) {
    errores.push(`El estado debe ser uno de: ${CONFIG.ESTADOS_VALIDOS.join(', ')}`);
  }
  
  if (!cliente.fecha) {
    errores.push('La fecha es requerida');
  }
  
  if (!cliente.producto || cliente.producto.trim() === '') {
    errores.push('El producto es requerido');
  }
  
  return {
    valido: errores.length === 0,
    errores: errores
  };
}

/**
 * Convierte una fila de datos en un objeto cliente
 * @param {Array} fila - Fila de datos
 * @param {number} rowIndex - Índice de la fila
 * @returns {Object} Objeto cliente
 */
function filaACliente(fila, rowIndex) {
  return {
    id: fila[0],
    cliente: fila[1],
    region: fila[2],
    asignadoA: fila[3],
    monto: fila[4],
    estado: fila[5],
    fecha: fila[6],
    producto: fila[7],
    notas: fila[8] || '',
    rowIndex: rowIndex
  };
}

/**
 * Convierte un objeto cliente en una fila de datos
 * @param {Object} cliente - Objeto cliente
 * @returns {Array} Fila de datos
 */
function clienteAFila(cliente) {
  return [
    cliente.id,
    cliente.cliente,
    cliente.region,
    cliente.asignadoA,
    cliente.monto,
    cliente.estado,
    cliente.fecha,
    cliente.producto,
    cliente.notas || ''
  ];
}

// ============================================================================
// OPERACIONES CRUD
// ============================================================================

/**
 * CREATE - Crear un nuevo cliente
 * 
 * @param {Object} datosCliente - Datos del nuevo cliente
 * @returns {Object} Resultado de la operación
 * 
 * Ejemplo de uso:
 * var nuevoCliente = {
 *   cliente: "Tech Solutions SA",
 *   region: "Norte",
 *   asignadoA: "juan@empresa.com",
 *   monto: 5000,
 *   estado: "Prospecto",
 *   fecha: "2026-01-15",
 *   producto: "Software CRM",
 *   notas: "Cliente potencial importante"
 * };
 * var resultado = crearCliente(nuevoCliente);
 */
function crearCliente(datosCliente) {
  try {
    // Validar datos
    const validacion = validarCliente(datosCliente);
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: 'Error de validación',
        errores: validacion.errores
      };
    }
    
    // Generar ID
    const nuevoId = generarNuevoId();
    datosCliente.id = nuevoId;
    
    // Insertar en la hoja
    const sheet = getClientesSheet();
    const fila = clienteAFila(datosCliente);
    sheet.appendRow(fila);
    
    // Formatear la nueva fila
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, CONFIG.COLUMNS.MONTO).setNumberFormat('$#,##0.00');
    sheet.getRange(lastRow, CONFIG.COLUMNS.FECHA).setNumberFormat('yyyy-mm-dd');
    
    return {
      exito: true,
      mensaje: 'Cliente creado exitosamente',
      cliente: datosCliente
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al crear cliente',
      error: error.toString()
    };
  }
}

/**
 * READ - Leer todos los clientes
 * 
 * @param {Object} filtros - Filtros opcionales (estado, region, asignadoA)
 * @returns {Object} Resultado con lista de clientes
 * 
 * Ejemplo de uso:
 * var todosLosClientes = leerClientes();
 * var clientesActivos = leerClientes({estado: "Activo"});
 * var clientesNorte = leerClientes({region: "Norte"});
 */
function leerClientes(filtros = {}) {
  try {
    const sheet = getClientesSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < CONFIG.DATA_START_ROW) {
      return {
        exito: true,
        mensaje: 'No hay clientes registrados',
        clientes: []
      };
    }
    
    const data = sheet.getRange(CONFIG.DATA_START_ROW, 1, lastRow - 1, 9).getValues();
    
    let clientes = data.map((fila, index) => 
      filaACliente(fila, CONFIG.DATA_START_ROW + index)
    );
    
    // Aplicar filtros
    if (filtros.estado) {
      clientes = clientes.filter(c => c.estado === filtros.estado);
    }
    
    if (filtros.region) {
      clientes = clientes.filter(c => c.region === filtros.region);
    }
    
    if (filtros.asignadoA) {
      clientes = clientes.filter(c => c.asignadoA === filtros.asignadoA);
    }
    
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      clientes = clientes.filter(c => 
        c.cliente.toLowerCase().includes(busqueda) ||
        c.producto.toLowerCase().includes(busqueda) ||
        (c.notas && c.notas.toLowerCase().includes(busqueda))
      );
    }
    
    return {
      exito: true,
      mensaje: `${clientes.length} cliente(s) encontrado(s)`,
      clientes: clientes
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al leer clientes',
      error: error.toString()
    };
  }
}

/**
 * READ - Leer un cliente por ID
 * 
 * @param {number} id - ID del cliente
 * @returns {Object} Resultado con datos del cliente
 * 
 * Ejemplo de uso:
 * var cliente = leerClientePorId(1);
 */
function leerClientePorId(id) {
  try {
    const resultado = leerClientes();
    
    if (!resultado.exito) {
      return resultado;
    }
    
    const cliente = resultado.clientes.find(c => c.id === id);
    
    if (!cliente) {
      return {
        exito: false,
        mensaje: `Cliente con ID ${id} no encontrado`
      };
    }
    
    return {
      exito: true,
      mensaje: 'Cliente encontrado',
      cliente: cliente
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al leer cliente',
      error: error.toString()
    };
  }
}

/**
 * UPDATE - Actualizar un cliente existente
 * 
 * @param {number} id - ID del cliente a actualizar
 * @param {Object} datosActualizados - Datos a actualizar
 * @returns {Object} Resultado de la operación
 * 
 * Ejemplo de uso:
 * var resultado = actualizarCliente(1, {
 *   estado: "Activo",
 *   monto: 7500,
 *   notas: "Cliente confirmado"
 * });
 */
function actualizarCliente(id, datosActualizados) {
  try {
    // Buscar el cliente
    const resultadoBusqueda = leerClientePorId(id);
    
    if (!resultadoBusqueda.exito) {
      return resultadoBusqueda;
    }
    
    const clienteActual = resultadoBusqueda.cliente;
    
    // Combinar datos actuales con actualizaciones
    const clienteActualizado = {
      ...clienteActual,
      ...datosActualizados,
      id: id // Asegurar que el ID no cambie
    };
    
    // Validar datos actualizados
    const validacion = validarCliente(clienteActualizado);
    if (!validacion.valido) {
      return {
        exito: false,
        mensaje: 'Error de validación',
        errores: validacion.errores
      };
    }
    
    // Actualizar en la hoja
    const sheet = getClientesSheet();
    const fila = clienteAFila(clienteActualizado);
    sheet.getRange(clienteActual.rowIndex, 1, 1, 9).setValues([fila]);
    
    // Formatear
    sheet.getRange(clienteActual.rowIndex, CONFIG.COLUMNS.MONTO).setNumberFormat('$#,##0.00');
    sheet.getRange(clienteActual.rowIndex, CONFIG.COLUMNS.FECHA).setNumberFormat('yyyy-mm-dd');
    
    return {
      exito: true,
      mensaje: 'Cliente actualizado exitosamente',
      cliente: clienteActualizado
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al actualizar cliente',
      error: error.toString()
    };
  }
}

/**
 * DELETE - Eliminar un cliente
 * 
 * @param {number} id - ID del cliente a eliminar
 * @returns {Object} Resultado de la operación
 * 
 * Ejemplo de uso:
 * var resultado = eliminarCliente(1);
 */
function eliminarCliente(id) {
  try {
    // Buscar el cliente
    const resultadoBusqueda = leerClientePorId(id);
    
    if (!resultadoBusqueda.exito) {
      return resultadoBusqueda;
    }
    
    const cliente = resultadoBusqueda.cliente;
    
    // Eliminar la fila
    const sheet = getClientesSheet();
    sheet.deleteRow(cliente.rowIndex);
    
    return {
      exito: true,
      mensaje: 'Cliente eliminado exitosamente',
      clienteEliminado: cliente
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al eliminar cliente',
      error: error.toString()
    };
  }
}

// ============================================================================
// FUNCIONES DE ESTADÍSTICAS Y REPORTES
// ============================================================================

/**
 * Obtiene estadísticas generales de clientes
 * @returns {Object} Estadísticas
 */
function obtenerEstadisticas() {
  try {
    const resultado = leerClientes();
    
    if (!resultado.exito) {
      return resultado;
    }
    
    const clientes = resultado.clientes;
    
    const stats = {
      total: clientes.length,
      porEstado: {},
      porRegion: {},
      montoTotal: 0,
      montoPromedio: 0
    };
    
    // Calcular estadísticas
    clientes.forEach(cliente => {
      // Por estado
      stats.porEstado[cliente.estado] = (stats.porEstado[cliente.estado] || 0) + 1;
      
      // Por región
      stats.porRegion[cliente.region] = (stats.porRegion[cliente.region] || 0) + 1;
      
      // Montos
      stats.montoTotal += Number(cliente.monto) || 0;
    });
    
    stats.montoPromedio = stats.total > 0 ? stats.montoTotal / stats.total : 0;
    
    return {
      exito: true,
      mensaje: 'Estadísticas calculadas',
      estadisticas: stats
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al calcular estadísticas',
      error: error.toString()
    };
  }
}

/**
 * Obtiene los clientes con mayor monto
 * @param {number} limite - Número de clientes a retornar
 * @returns {Object} Top clientes
 */
function obtenerTopClientes(limite = 10) {
  try {
    const resultado = leerClientes();
    
    if (!resultado.exito) {
      return resultado;
    }
    
    const topClientes = resultado.clientes
      .sort((a, b) => b.monto - a.monto)
      .slice(0, limite);
    
    return {
      exito: true,
      mensaje: `Top ${topClientes.length} clientes`,
      clientes: topClientes
    };
    
  } catch (error) {
    return {
      exito: false,
      mensaje: 'Error al obtener top clientes',
      error: error.toString()
    };
  }
}

// ============================================================================
// API WEB APP (Para exponer como servicio web)
// ============================================================================

/**
 * Maneja las peticiones GET
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta JSON
 */
function doGet(e) {
  try {
    const action = e.parameter.action || 'list';
    const id = e.parameter.id ? parseInt(e.parameter.id) : null;
    
    let resultado;
    
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
 * Maneja las peticiones POST
 * @param {Object} e - Evento de la petición
 * @returns {TextOutput} Respuesta JSON
 */
function doPost(e) {
  try {
    const datos = JSON.parse(e.postData.contents);
    const action = datos.action;
    
    let resultado;
    
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
// FUNCIONES DE PRUEBA (Para ejecutar desde el editor de scripts)
// ============================================================================

/**
 * Función de prueba para crear un cliente
 */
function testCrearCliente() {
  const nuevoCliente = {
    cliente: "Test Company",
    region: "Norte",
    asignadoA: "test@empresa.com",
    monto: 5000,
    estado: "Prospecto",
    fecha: "2026-01-15",
    producto: "Software de Prueba",
    notas: "Cliente de prueba"
  };
  
  const resultado = crearCliente(nuevoCliente);
  Logger.log(resultado);
}

/**
 * Función de prueba para leer clientes
 */
function testLeerClientes() {
  const resultado = leerClientes();
  Logger.log(resultado);
}

/**
 * Función de prueba para actualizar un cliente
 */
function testActualizarCliente() {
  const resultado = actualizarCliente(1, {
    estado: "Activo",
    notas: "Cliente actualizado en prueba"
  });
  Logger.log(resultado);
}

/**
 * Función de prueba para eliminar un cliente
 */
function testEliminarCliente() {
  const resultado = eliminarCliente(1);
  Logger.log(resultado);
}

/**
 * Función de prueba para obtener estadísticas
 */
function testEstadisticas() {
  const resultado = obtenerEstadisticas();
  Logger.log(resultado);
}
