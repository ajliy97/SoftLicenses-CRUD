import { useState, useEffect } from 'react'
import { logout } from '../services/usuarioService'
import { obtenerCarrito, estaLogueado } from '../services/pedidoService'
import CartModal from './CartModal'

export default function Navbar({ searchQuery, setSearchQuery, onUserClick }) {
    const [userEmail, setUserEmail] = useState(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [cantidadItems, setCantidadItems] = useState(0)
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        actualizarCantidadCarrito()
        updateUserEmailAndRole()

        window.addEventListener('userLoggedIn', handleUserLoggedIn)
        return () => {
            window.removeEventListener('userLoggedIn', handleUserLoggedIn)
        }
    }, [])

    const handleUserLoggedIn = () => {
        actualizarCantidadCarrito()
        updateUserEmailAndRole()
    }

    const actualizarCantidadCarrito = async () => {
        if (!estaLogueado()) {
            setCantidadItems(0)
            return
        }
        try {
            const carrito = await obtenerCarrito()
            const cantidad = carrito.pedidoLicencias ? carrito.pedidoLicencias.length : 0
            setCantidadItems(cantidad)
        } catch (error) {
            setCantidadItems(0)
        }
    }

    const handleCarritoActualizado = () => {
        actualizarCantidadCarrito()
        setIsCartOpen(true)
    }

    const handleCartClick = () => {
        if (!estaLogueado()) {
            alert('Debes iniciar sesión para ver el carrito')
            if (onUserClick) onUserClick()
            return
        }
        setIsCartOpen(true)
    }

    useEffect(() => {
        window.actualizarCarrito = handleCarritoActualizado
        return () => {
            delete window.actualizarCarrito
        }
    }, [])

    // Actualiza email y rol desde localStorage
    const updateUserEmailAndRole = () => {
        const email = localStorage.getItem('userEmail')
        const role = localStorage.getItem('userRole')
        setUserEmail(email)
        setUserRole(role)
    }

    const handleLogout = () => {
        logout()
        setUserEmail(null)
        setShowUserMenu(false)
        setCantidadItems(0)
        window.location.href = '/'
    }

    const getUserName = () => {
        if (!userEmail) return null
        return userEmail.split('@')[0]
    }

    // Función robusta para detectar admin
    const isAdmin = (role) => {
        if (!role || typeof role !== 'string') return false
        return role.trim().toLowerCase() === 'admin'
    }

    // Debug para ver el valor real del rol
    console.log('Estado userEmail:', userEmail)
    console.log('Estado userRole:', userRole)
    console.log('userRole normalizado:', userRole ? userRole.trim().toLowerCase() : userRole)
    console.log('Cantidad items carrito:', cantidadItems)

    return (
        <>
            <nav className="shadow-lg top-0 z-50 w-full">
                {/* Barra superior con texto centrado */}
                <div className="bg-blue-500 py-2">
                    <div className="max-w-7xl mx-auto px-4">
                        <p className="text-white text-center text-sm font-medium">
                            Compra tu licencia y recíbela en tu correo, sencillo, fácil y seguro
                        </p>
                    </div>
                </div>

                {/* Sección principal: Logo, Búsqueda e Iconos */}
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between gap-6">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <a href='/'>
                                <img src="/icon.png" alt="Logo" className="h-12 w-auto" />
                            </a>
                        </div>

                        {/* Barra de búsqueda */}
                        <div className="flex-1 md:max-w-2xl">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-2 px-4 pr-12 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800"
                                />
                                {searchQuery ? (
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                                        aria-label="Limpiar búsqueda"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors" aria-label="Buscar">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Iconos de Usuario y Carrito (Desktop) */}
                        <div className="flex items-center gap-4 hidden md:flex">
                            {/* Contenedor del botón de usuario con menú */}
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        if (userEmail) {
                                            setShowUserMenu(!showUserMenu)
                                        } else {
                                            onUserClick()
                                        }
                                    }}
                                    className="flex items-center gap-2 text-gray-700 hover:bg-blue-300 px-3 py-2 rounded-full transition-colors"
                                    aria-label="Usuario"
                                >
                                    {/* Nombre de usuario */}
                                    {userEmail && (
                                        <span className="text-sm font-medium">
                                            Bienvenido/a, {getUserName()}
                                        </span>
                                    )}
                                    {/* ICONO A LA DERECHA */}
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {/* Menú desplegable cuando está logueado */}
                                {userEmail && showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                        <div className="px-4 py-2 border-b border-gray-200">
                                            <p className="text-sm font-semibold text-gray-700">{getUserName()}</p>
                                            <p className="text-xs text-gray-500">{userEmail}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                            </svg>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Carrito de compra */}
                            {!isAdmin(userRole) && (
                                <button 
                                    onClick={handleCartClick}
                                    className="relative text-gray-700 hover:bg-blue-300 p-2 rounded-full transition-colors" 
                                    aria-label="Carrito"
                                >
                                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    {cantidadItems > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {cantidadItems}
                                        </span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Barra de navegación inferior solo vista móvil */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-300 py-2 md:hidden flex justify-center items-center gap-24 z-40">
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="text-gray-700 p-2 rounded-full transition-colors" aria-label="Inicio">
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => {
                            if (userEmail) {
                                setShowUserMenu(!showUserMenu)
                            } else {
                                onUserClick()
                            }
                        }}
                        className="text-gray-700 p-2 rounded-full transition-colors" 
                        aria-label="Usuario"
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {/* Menú desplegable cuando está logueado */}
                    {userEmail && showUserMenu && (
                        <div className="fixed mb-44 w-48 bg-gray-200 rounded-lg shadow-lg py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-200">
                                <p className="text-sm font-semibold text-gray-700">{getUserName()}</p>
                                <p className="text-xs text-gray-500">{userEmail}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                    {!isAdmin(userRole) && (
                        <button 
                            onClick={handleCartClick}
                            className="relative text-gray-700 p-2 rounded-full transition-colors" 
                            aria-label="Carrito"
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                            </svg>
                            {cantidadItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cantidadItems}
                                </span>
                            )}
                        </button>
                    )}
                </div>

                {/* Overlay para cerrar el menú al hacer clic fuera */}
                {showUserMenu && (
                    <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setShowUserMenu(false)}
                    />
                )}
            </nav>

            {/* Modal del carrito */}
            <CartModal 
                isOpen={isCartOpen} 
                onClose={() => {
                    setIsCartOpen(false)
                    actualizarCantidadCarrito()
                }} 
            />
        </>
    )
}