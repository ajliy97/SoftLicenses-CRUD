
const API_URL = 'http://localhost:8080/api/pedidos';

// Obtener usuarioId del localStorage
const getUsuarioId = () => {
    let usuarioId = localStorage.getItem('usuarioId');
    
    if (!usuarioId) {
        usuarioId = localStorage.getItem('userId');
    }
    
    if (!usuarioId) {
        const usuario = localStorage.getItem('usuario');
        if (usuario) {
            try {
                const usuarioObj = JSON.parse(usuario);
                usuarioId = usuarioObj.id;
            } catch (e) {
                console.error('Error al parsear usuario:', e);
            }
        }
    }
    
    console.log('Usuario ID encontrado:', usuarioId);
    
    if (!usuarioId) {
        throw new Error('Debe iniciar sesión');
    }
    
    // Convertir a string para asegurar consistencia
    return String(usuarioId);
};

// Obtener token JWT del localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Crear headers con autenticación
const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const usuarioId = getUsuarioId();
        if (usuarioId) {
            headers['Usuario-Id'] = usuarioId;
        }
    } catch (e) {
        // No agregar Usuario-Id si no está logueado
    }
    
    console.log('Headers generados:', headers);
    
    return headers;
};

// Verificar si el usuario está logueado
export const estaLogueado = () => {
    try {
        const usuarioId = getUsuarioId();
        const token = getToken();
        return !!(usuarioId && token);
    } catch (error) {
        return false;
    }
};

// Obtener carrito del usuario
export const obtenerCarrito = async () => {
    try {
        const headers = getHeaders();
        console.log('Obteniendo carrito con headers:', headers);
        
        const response = await fetch(`${API_URL}/carrito`, {
            headers: headers
        });

        console.log('Respuesta obtenerCarrito:', response.status);

        if (response.status === 401) {
            throw new Error('Debe iniciar sesión');
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(errorText || 'Error al obtener el carrito');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en obtenerCarrito:', error);
        throw error;
    }
};

// Agregar licencia al carrito
export const agregarLicencia = async (licenciaId) => {
    try {
        const usuarioId = getUsuarioId();
        console.log('Agregando licencia', licenciaId, 'para usuario:', usuarioId);
        
        const headers = getHeaders();
        console.log('Headers para agregar licencia:', headers);
        
        const response = await fetch(`${API_URL}/carrito/licencia/${licenciaId}`, {
            method: 'POST',
            headers: headers
        });

        console.log('Respuesta agregarLicencia:', response.status);

        if (response.status === 401) {
            throw new Error('Debe iniciar sesión');
        }

        if (!response.ok) {
            const error = await response.text();
            console.error('Error del servidor:', error);
            throw new Error(error || 'Error al agregar al carrito');
        }

        const result = await response.json();
        console.log('Licencia agregada exitosamente:', result);
        return result;
    } catch (error) {
        console.error('Error en agregarLicencia:', error);
        throw error;
    }
};

// Eliminar licencia del carrito
export const eliminarLicencia = async (licenciaId) => {
    try {
        const response = await fetch(`${API_URL}/carrito/licencia/${licenciaId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al eliminar del carrito');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en eliminarLicencia:', error);
        throw error;
    }
};

// Vaciar carrito
export const vaciarCarrito = async () => {
    try {
        const response = await fetch(`${API_URL}/carrito/vaciar`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al vaciar el carrito');
        }

        return true;
    } catch (error) {
        console.error('Error en vaciarCarrito:', error);
        throw error;
    }
};

// Confirmar compra
export const confirmarCompra = async (cantidades) => {
    try {
        console.log('Enviando cantidades al backend:', cantidades);
        
        const response = await fetch(`${API_URL}/carrito/confirmar`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(cantidades)
        });

        console.log('Respuesta confirmarCompra:', response.status);

        if (response.status === 401) {
            throw new Error('Debe iniciar sesión');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al confirmar la compra');
        }

        const result = await response.json();
        console.log('Compra confirmada:', result);
        return result;
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        throw error;
    }
};

// Obtener historial de pedidos
export const obtenerHistorial = async () => {
    try {
        const response = await fetch(`${API_URL}/historial`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener el historial');
        }

        return await response.json();
    } catch (error) {
        console.error('Error en obtenerHistorial:', error);
        throw error;
    }
};

// Actualizar cantidad de una licencia en el carrito
export const actualizarCantidad = async (licenciaId, cantidad) => {
    try {
        console.log(`Actualizando cantidad de licencia ${licenciaId} a ${cantidad}`);
        
        const response = await fetch(`${API_URL}/carrito/licencia/${licenciaId}/cantidad?cantidad=${cantidad}`, {
            method: 'PUT',
            headers: getHeaders()
        });

        console.log('Respuesta actualizarCantidad:', response.status);

        if (response.status === 401) {
            throw new Error('Debe iniciar sesión');
        }

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Error al actualizar cantidad');
        }

        const result = await response.json();
        console.log('Cantidad actualizada:', result);
        return result;
    } catch (error) {
        console.error('Error en actualizarCantidad:', error);
        throw error;
    }
};