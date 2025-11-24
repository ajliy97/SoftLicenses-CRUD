import { useState, useEffect } from 'react';
import { deleteLicencia } from '../services/licenciaService';
import { agregarLicencia, eliminarLicencia, obtenerCarrito, estaLogueado, actualizarCantidad } from '../services/pedidoService';

export default function Tarjeta({ producto, isAdmin, onEdit, onDelete, onCarritoActualizado, onLoginRequired, carritoVaciado }) {
    const [deleting, setDeleting] = useState(false);
    const [agregando, setAgregando] = useState(false);
    const [enCarrito, setEnCarrito] = useState(false);
    const [cantidadEnCarrito, setCantidadEnCarrito] = useState(1);

    useEffect(() => {
        if (carritoVaciado) {
            setEnCarrito(false);
            setCantidadEnCarrito(1);
        }
    }, [carritoVaciado]);

    useEffect(() => {
        verificarEnCarrito();
    }, [producto.id]);

    const verificarEnCarrito = async () => {
        if (!estaLogueado()) {
            console.log('Usuario no logueado, no se verifica carrito');
            return;
        }

        try {
            const carrito = await obtenerCarrito();
            // Buscar si el producto está en el carrito usando pedidoLicencias
            const pedidoLicencia = carrito.pedidoLicencias?.find(pl => pl.licencia.id === producto.id);
            const estaEnCarrito = !!pedidoLicencia;
            setEnCarrito(estaEnCarrito);

            // Obtener la cantidad desde el carrito
            if (estaEnCarrito) {
                const cantidad = pedidoLicencia.cantidad || 1;
                setCantidadEnCarrito(cantidad);
                console.log('Cantidad en carrito:', cantidad);
            }

            console.log('Producto en carrito:', estaEnCarrito);
        } catch (error) {
            console.error('Error al verificar carrito:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) {
            return;
        }

        setDeleting(true);
        try {
            await deleteLicencia(producto.id);
            alert('Licencia eliminada exitosamente');
            if (onDelete) {
                onDelete();
            }
        } catch (error) {
            console.error('Error al eliminar licencia:', error);
            alert('Error al eliminar la licencia');
        } finally {
            setDeleting(false);
        }
    };

    const handleAgregarAlCarrito = async () => {
        console.log('=== Intentando agregar al carrito ===');

        // Verificar si está logueado
        if (!estaLogueado()) {
            console.log('Usuario NO logueado, abriendo modal de login');
            if (onLoginRequired) {
                onLoginRequired();
            }
            return;
        }

        console.log('Usuario SÍ está logueado, agregando al carrito...');
        setAgregando(true);

        try {
            // Verificar si el carrito estaba vacío ANTES de agregar
            const carritoAntes = await obtenerCarrito();
            const carritoVacio = !carritoAntes.pedidoLicencias || carritoAntes.pedidoLicencias.length === 0;

            await agregarLicencia(producto.id);
            console.log('Producto agregado exitosamente');
            setEnCarrito(true);

            // SOLO abrir el modal si era el primer producto
            if (carritoVacio && onCarritoActualizado) {
                console.log('Era el primer producto, abriendo modal del carrito');
                onCarritoActualizado();
            } else {
                console.log('Ya había productos, NO se abre el modal');
            }
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
            if (error.message === 'Debe iniciar sesión') {
                if (onLoginRequired) {
                    onLoginRequired();
                }
            } else {
                alert(error.message || 'Error al agregar al carrito');
            }
        } finally {
            setAgregando(false);
        }
    };

    const handleCarritoVaciado = () => {
        setCarritoVaciado(true);
        setTimeout(() => setCarritoVaciado(false), 100);
    };

    const handleIncrementar = async () => {
        if (cantidadEnCarrito >= producto.cantidad_stock) {
            alert(`Stock máximo disponible: ${producto.cantidad_stock}`);
            return;
        }

        setAgregando(true);
        try {
            const nuevaCantidad = cantidadEnCarrito + 1;
            await actualizarCantidad(producto.id, nuevaCantidad);
            setCantidadEnCarrito(nuevaCantidad);
        } catch (error) {
            console.error('Error al incrementar:', error);
            alert('Error al actualizar cantidad');
        } finally {
            setAgregando(false);
        }
    };

    const handleDecrementar = async () => {
        if (cantidadEnCarrito > 1) {
            setAgregando(true);
            try {
                const nuevaCantidad = cantidadEnCarrito - 1;
                await actualizarCantidad(producto.id, nuevaCantidad);
                setCantidadEnCarrito(nuevaCantidad);
            } catch (error) {
                console.error('Error al decrementar:', error);
                alert('Error al actualizar cantidad');
            } finally {
                setAgregando(false);
            }
        } else {
            if (window.confirm('¿Eliminar este producto del carrito?')) {
                await handleQuitarDelCarrito();
            }
        }
    };

    const handleQuitarDelCarrito = async () => {
        setAgregando(true);
        try {
            await eliminarLicencia(producto.id);
            setEnCarrito(false);
            await verificarEnCarrito();
        } catch (error) {
            console.error('Error al quitar del carrito:', error);
            alert('Error al quitar del carrito');
        } finally {
            setAgregando(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full">
            {/* Imagen */}
            <div className="relative h-20 md:h-24 bg-gray-200 flex items-center justify-center p-4">
                <img
                    src={producto.imagenUrl || '/ejemplo.png'}
                    alt={producto.nombre}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                        if (e.target.src !== '/ejemplo.png') {
                            e.target.src = '/ejemplo.png';
                        }
                    }}
                />

                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    {producto.categoria}
                </div>
            </div>

            <div className="p-3 md:p-4 flex flex-col flex-grow">
                <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                    {producto.nombre}
                </h3>

                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow">
                    {producto.descripcion}
                </p>

                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow">
                    <span className='font-bold'>Tipo de licencia:</span> {producto.tipo_licencia}
                </p>

                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow">
                    <span className='font-bold'>Duración:</span> {producto.tiempo_duracion}
                </p>

                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2 flex-grow">
                    <span className='font-bold'>Cantidad disponible:</span> {producto.cantidad_stock}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg md:text-xl font-bold text-blue-500">
                        ${producto.precio} CLP
                    </span>

                    {!isAdmin && (
                        enCarrito ? (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5 rounded-lg px-2 py-1">
                                    <button
                                        onClick={handleDecrementar}
                                        disabled={agregando}
                                        className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 transition-colors font-bold text-sm"
                                    >
                                        −
                                    </button>
                                    <span className="w-8 text-center font-bold text-gray-800">
                                        {cantidadEnCarrito}
                                    </span>
                                    <button
                                        onClick={handleIncrementar}
                                        disabled={agregando || cantidadEnCarrito >= producto.cantidad_stock}
                                        className="w-5 h-5 flex items-center justify-center bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-sm"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={handleAgregarAlCarrito}
                                disabled={agregando || producto.cantidad_stock <= 0}
                                className="bg-cyan-500 text-white text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-semibold shadow-md hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                </svg>
                                {agregando ? 'Agregando...' : producto.cantidad_stock <= 0 ? 'Sin stock' : 'Agregar'}
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}