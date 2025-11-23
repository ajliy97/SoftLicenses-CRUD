import { useState, useEffect } from 'react';
import { obtenerCarrito, eliminarLicencia, vaciarCarrito, confirmarCompra, actualizarCantidad } from '../services/pedidoService';

export default function CartModal({ isOpen, onClose, onCarritoVaciado }) {
    const [carrito, setCarrito] = useState(null);
    const [loading, setLoading] = useState(false);
    const [procesando, setProcesando] = useState(false);
    const [cantidades, setCantidades] = useState({});

    useEffect(() => {
        if (isOpen) {
            cargarCarrito();
        }
    }, [isOpen]);

    const cargarCarrito = async () => {
        setLoading(true);
        try {
            const data = await obtenerCarrito();
            setCarrito(data);

            // Inicializar el estado cantidades con los datos del backend
            if (data.pedidoLicencias) {
                const cantidadesIniciales = {};
                data.pedidoLicencias.forEach(pl => {
                    cantidadesIniciales[pl.licencia.id] = pl.cantidad;
                });
                setCantidades(cantidadesIniciales);
            } else {
                setCantidades({});
            }
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            if (error.message === 'Debe iniciar sesión') {
                onClose();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleIncrementar = async (licenciaId, stockDisponible) => {
        const cantidadActual = cantidades[licenciaId] || 1;
        if (cantidadActual >= stockDisponible) {
            alert(`Stock máximo disponible: ${stockDisponible}`);
            return;
        }
        try {
            const nuevaCantidad = cantidadActual + 1;
            await actualizarCantidad(licenciaId, nuevaCantidad);
            setCantidades(prev => ({
                ...prev,
                [licenciaId]: nuevaCantidad
            }));
            await cargarCarrito();
        } catch (error) {
            console.error('Error al incrementar:', error);
            alert('Error al actualizar cantidad');
        }
    };

    const handleDecrementar = async (licenciaId) => {
        const cantidadActual = cantidades[licenciaId] || 1;
        if (cantidadActual > 1) {
            try {
                const nuevaCantidad = cantidadActual - 1;
                await actualizarCantidad(licenciaId, nuevaCantidad);
                setCantidades(prev => ({
                    ...prev,
                    [licenciaId]: nuevaCantidad
                }));
                await cargarCarrito();
            } catch (error) {
                console.error('Error al decrementar:', error);
                alert('Error al actualizar cantidad');
            }
        } else {
            if (window.confirm('¿Eliminar este producto del carrito?')) {
                try {
                    await eliminarLicencia(licenciaId);
                    await cargarCarrito();
                    const carritoActualizado = await obtenerCarrito();
                    if (
                        !carritoActualizado.pedidoLicencias ||
                        carritoActualizado.pedidoLicencias.length === 0
                    ) {
                        onClose();
                    }
                } catch (error) {
                    alert('Error al eliminar producto');
                }
            }
        }
    };

    const handleVaciar = async () => {
        if (!window.confirm('¿Estás seguro de vaciar el carrito?')) return;
        try {
            await vaciarCarrito();
            if (onCarritoVaciado) onCarritoVaciado();
            onClose();
        } catch (error) {
            alert('Error al vaciar el carrito');
        }
    };

    const calcularTotal = () => {
        if (!carrito || !carrito.pedidoLicencias) return 0;
        return carrito.pedidoLicencias.reduce((total, pl) => {
            const cantidad = cantidades[pl.licencia.id] || pl.cantidad || 1;
            return total + (pl.licencia.precio * cantidad);
        }, 0);
    };

    const calcularTotalProductos = () => {
        if (!carrito || !carrito.pedidoLicencias) return 0;
        return carrito.pedidoLicencias.reduce((sum, pl) => {
            const cantidad = cantidades[pl.licencia.id] || pl.cantidad || 1;
            return sum + cantidad;
        }, 0);
    };

    const handlePagar = async () => {
        const totalProductos = calcularTotalProductos();
        const total = calcularTotal();
        if (!window.confirm(`¿Confirmar el pago de ${totalProductos} producto(s) por $${total} CLP? Se descontará el stock.`)) {
            return;
        }
        setProcesando(true);
        try {
            await confirmarCompra(cantidades);
            alert('¡Compra realizada exitosamente! El stock ha sido descontado.');
            onClose();
            window.location.reload();
        } catch (error) {
            alert(error.message || 'Error al confirmar la compra');
        } finally {
            setProcesando(false);
        }
    };

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 backdrop-blur-md border-gray-800 border-b-4 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Carrito de Compras</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-4">
                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Cargando carrito...</p>
                        </div>
                    ) : !carrito || !carrito.pedidoLicencias || carrito.pedidoLicencias.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-600 mt-4">Tu carrito está vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {carrito.pedidoLicencias.map((pl) => (
                                <div key={pl.licencia.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <img
                                        src={pl.licencia.imagenUrl || '/ejemplo.png'}
                                        alt={pl.licencia.nombre}
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => {
                                            if (e.target.src !== '/ejemplo.png') {
                                                e.target.src = '/ejemplo.png';
                                            }
                                        }}
                                    />
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-gray-800">{pl.licencia.nombre}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{pl.licencia.descripcion}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {pl.licencia.tipo_licencia} - {pl.licencia.tiempo_duracion}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Stock disponible: {pl.licencia.cantidad_stock}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <span className="font-bold text-blue-500 text-lg">
                                            ${pl.licencia.precio * (cantidades[pl.licencia.id] || pl.cantidad || 1)} CLP
                                        </span>
                                        {/* Controles de cantidad */}
                                        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-300 px-2 py-1">
                                            <button
                                                onClick={() => handleDecrementar(pl.licencia.id)}
                                                className="w-5 h-5 flex items-center justify-center bg-red-400 text-white rounded hover:bg-red-500 transition-colors font-bold text-lg"
                                                title={cantidades[pl.licencia.id] === 1 ? "Eliminar del carrito" : "Disminuir cantidad"}
                                            >
                                                −
                                            </button>
                                            <span className="w-8 text-center font-semibold text-gray-800">
                                                {cantidades[pl.licencia.id] || pl.cantidad || 1}
                                            </span>
                                            <button
                                                onClick={() => handleIncrementar(pl.licencia.id, pl.licencia.cantidad_stock)}
                                                disabled={cantidades[pl.licencia.id] >= pl.licencia.cantidad_stock}
                                                className="w-5 h-5 flex items-center justify-center bg-green-400 text-white rounded hover:bg-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-bold text-lg"
                                                title="Aumentar cantidad"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {carrito && carrito.pedidoLicencias && carrito.pedidoLicencias.length > 0 && (
                    <div className="border-t p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-600">{calcularTotalProductos()} producto(s)</p>
                                <p className="text-2xl font-bold text-gray-800">Total: ${calcularTotal()} CLP</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleVaciar}
                                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Vaciar Carrito
                            </button>
                            <button
                                onClick={handlePagar}
                                disabled={procesando}
                                className="flex-1 bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {procesando ? 'Procesando...' : 'Pagar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}