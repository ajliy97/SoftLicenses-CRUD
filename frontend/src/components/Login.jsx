import { useState } from 'react'
import { login, register } from '../services/usuarioService'

export default function Login({ onClose }) {
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false);


    //Validar dominio de correo
    const validarDominioCorreo = (email) => {
        return /^[^@]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(email);
    };

    //Validar contraseña segura
    const validarContrasenaSegura = (password) => {
        //Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/.test(password);
    };

    //Validar correo único en backend
    const esCorreoUnico = async (email) => {
    try {
        const response = await fetch(`http://localhost:8080/api/usuarios/email/${email}`);
        // Si el backend responde 404, el correo NO está registrado (es único)
        // Si responde 200, el correo SÍ está registrado
        return response.status === 404;
    } catch (error) {
        console.error('Error al validar correo único:', error);
        // En caso de error de red, permite el registro (puedes cambiar esto si prefieres bloquear)
        return true;
    }
};

    // Función para decodificar JWT
    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1]
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))
            return JSON.parse(jsonPayload)
        } catch (error) {
            console.error('Error decodificando JWT:', error)
            return null
        }
    }

    // Función para obtener el usuario completo del backend
    const obtenerUsuarioPorEmail = async (email, token) => {
        try {
            console.log('Obteniendo datos completos del usuario:', email)
            const response = await fetch(`http://localhost:8080/api/usuarios/email/${email}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            
            if (response.ok) {
                const usuario = await response.json()
                console.log('Usuario completo obtenido:', usuario)
                return usuario
            } else {
                console.error('Error al obtener usuario:', response.status)
                return null
            }
        } catch (error) {
            console.error('Error en obtenerUsuarioPorEmail:', error)
            return null
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                // LOGIN
                console.log('Intentando login con:', formData.email)
                const response = await login(formData.email, formData.password)
                console.log('Login exitoso, respuesta completa:', response)
                
                // Guardar token
                if (response.token) {
                    console.log('Token recibido:', response.token)
                    localStorage.setItem('token', response.token)
                    
                    // Decodificar el JWT para obtener email y rol
                    const decoded = decodeJWT(response.token)
                    console.log('JWT decodificado:', decoded)
                    
                    if (decoded && decoded.sub) {
                        // Guardar email (viene como 'sub' en el JWT)
                        console.log('Guardando email desde JWT:', decoded.sub)
                        localStorage.setItem('userEmail', decoded.sub)
                        
                        // Guardar rol
                        if (decoded.rol) {
                            console.log('Guardando rol desde JWT:', decoded.rol)
                            localStorage.setItem('userRol', decoded.rol)
                            localStorage.setItem('userRole', decoded.rol) // Por compatibilidad
                        }

                        //Obtener el ID del usuario del backend
                        console.log('Obteniendo usuario completo del servidor...')
                        const usuarioCompleto = await obtenerUsuarioPorEmail(decoded.sub, response.token)
                        
                        if (usuarioCompleto && usuarioCompleto.id) {
                            console.log('GUARDANDO USUARIO ID:', usuarioCompleto.id, '')
                            
                            // Guardar el ID en TODAS las formas posibles
                            localStorage.setItem('usuarioId', usuarioCompleto.id.toString())
                            localStorage.setItem('userId', usuarioCompleto.id.toString())
                            localStorage.setItem('usuario', JSON.stringify(usuarioCompleto))
                            localStorage.setItem('userName', usuarioCompleto.nombre || usuarioCompleto.email)
                            
                            // Verificar que se guardó
                            console.log('Verificación de guardado:')
                            console.log('  - usuarioId:', localStorage.getItem('usuarioId'))
                            console.log('  - userId:', localStorage.getItem('userId'))
                            console.log('  - usuario completo:', localStorage.getItem('usuario'))
                        } else {
                            console.error('No se pudo obtener el usuario completo del servidor')
                            throw new Error('No se pudo obtener la información completa del usuario')
                        }
                    } else {
                        console.error('No se pudo decodificar el JWT o falta el campo "sub"')
                        throw new Error('Token inválido')
                    }
                } else {
                    console.error('No hay token en la respuesta')
                    throw new Error('No se recibió token del servidor')
                }

                // Verificar TODO el localStorage
                console.log('LocalStorage completo después del login:')
                console.log('  - Token:', localStorage.getItem('token'))
                console.log('  - Email:', localStorage.getItem('userEmail'))
                console.log('  - Rol:', localStorage.getItem('userRol'))
                console.log('  - Usuario ID:', localStorage.getItem('usuarioId'))
                console.log('  - User ID:', localStorage.getItem('userId'))
                console.log('  - Usuario completo:', localStorage.getItem('usuario'))

                // Disparar evento personalizado para actualizar el Navbar
                console.log('Disparando evento userLoggedIn')
                window.dispatchEvent(new Event('userLoggedIn'))

                alert('¡Inicio de sesión exitoso!')
                onClose()
                
                // Recargar para actualizar todo
                console.log('Recargando página...')
                setTimeout(() => {
                    window.location.reload()
                }, 100)
                
            } else {
                // REGISTRO
                // Validar dominio de correo
                if (!validarDominioCorreo(formData.email)) {
                    setError('Ingresa un correo electrónico válido ejemplo nombre@dominio.com.');
                    setLoading(false);
                    return;
                }

                // Validar contraseña segura
                if (!validarContrasenaSegura(formData.password)) {
                    setError('La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas y un número o símbolo.');
                    setLoading(false);
                    return;
                }

                // Validar correo único en backend
                const correoUnico = await esCorreoUnico(formData.email);
                if (!correoUnico) {
                    setError('El correo ya está registrado.');
                    setLoading(false);
                    return;
                }

                console.log('Intentando registro con:', formData.email)
                const response = await register(
                    formData.email, 
                    formData.password,
                    'USER'
                )
                console.log('Registro exitoso:', response)
                
                alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.')
                setIsLogin(true)
                setFormData({ email: formData.email, password: '', name: '' })
            }
        } catch (err) {
            console.error('Error en login/registro:', err);
            // Si la respuesta es un objeto con clave "error", muestra ese mensaje
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else if (typeof err.response?.data === 'string') {
                setError(err.response.data);
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.message) {
                setError(err.message);
            } else {
                setError(isLogin ? 'Error al iniciar sesión' : 'Error al registrar usuario');
            }
        }
    }

    // Cerrar modal al hacer clic en el fondo
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div 
            className="fixed inset-0 backdrop-blur-2xl flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md relative animate-fadeIn">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Cerrar"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </h2>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre completo
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="Tu nombre"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <div className="relative">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contraseña
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={6}
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                />
                                {/* Botón ojo */}
                            <button
                                type="button"
                                className="absolute right-3 top-9 text-gray-400 hover:text-gray-700"
                                tabIndex={-1}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    // Ojo abierto
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 0a9 9 0 0118 0c0 2.21-3.58 6-9 6s-9-3.79-9-6z" />
                                    </svg>
                                ) : (
                                    // Ojo cerrado
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.42 0-9-3.79-9-6a9.97 9.97 0 012.122-3.62M6.7 6.7A9.97 9.97 0 0112 5c5.42 0 9 3.79 9 6 0 1.306-.835 2.417-2.122 3.62M15 12a3 3 0 11-6 0 3 3 0 016 0zm-6.7-5.3l13.3 13.3" />
                                    </svg>
                                )}
                            </button>
                                {!isLogin && (
                                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres
                                    <br/>Una mayúscula, una minúscula 
                                    <br/>Un número o símbolo.
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading 
                                ? (isLogin ? 'Iniciando sesión...' : 'Registrando...') 
                                : (isLogin ? 'Iniciar Sesión' : 'Registrarse')
                            }
                        </button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">O</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600">
                            {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError('')
                                    setFormData({ email: '', password: '', name: '' })
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800 font-semibold transition"
                                disabled={loading}
                            >
                                {isLogin ? 'Registrarse' : 'Inicia sesión'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}