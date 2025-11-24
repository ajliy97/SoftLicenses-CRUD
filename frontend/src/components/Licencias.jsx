import { useEffect, useState } from 'react';
import Tarjeta from './Tarjeta';
import AdminPanel from './AdminPanel';
import Login from './Login'; 
import { getLicencias } from '../services/licenciaService';

export default function Licencias({ searchQuery = '', carritoVaciado }) {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [showLogin, setShowLogin] = useState(false);
    const [userRol, setUserRol] = useState(localStorage.getItem('userRol'));

    // Escuchar eventos de login/logout para actualizar el rol del usuario
    useEffect(() => {
        const handleRoleChange = () => {
            setUserRol(localStorage.getItem('userRol'));
        };
        window.addEventListener('userLoggedOut', handleRoleChange);
        window.addEventListener('userLoggedIn', handleRoleChange);

        return () => {
            window.removeEventListener('userLoggedOut', handleRoleChange);
            window.removeEventListener('userLoggedIn', handleRoleChange);
        };
    }, []);

    //Detectar tamaño de pantalla para ajustar itemsPerPage
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setItemsPerPage(4);
            } else if (window.innerWidth < 1024) {
                setItemsPerPage(6);
            } else {
                setItemsPerPage(8);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        fetchLicencias();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Escuchar cambios en localStorage (logout/login)
    useEffect(() => {
        const handleStorageChange = () => {
            setUserRol(localStorage.getItem('userRol'));
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('userLoggedIn', handleStorageChange);
        window.addEventListener('userLoggedOut', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('userLoggedIn', handleStorageChange);
            window.removeEventListener('userLoggedOut', handleStorageChange);
        };
    }, []);

    const fetchLicencias = async () => {
        try {
            setLoading(true);
            const data = await getLicencias();
            setProductos(data);
        } catch (err) {
            setError('Error al cargar las licencias');
        } finally {
            setLoading(false);
        }
    };

    // Filtrar licencias
    const productosFiltrados = productos.filter(producto => {
        if (!searchQuery || searchQuery.trim() === '') return true;
        const searchLower = searchQuery.toLowerCase().trim();
        return (
            producto.nombre?.toLowerCase().includes(searchLower) ||
            producto.categoria?.toLowerCase().includes(searchLower) ||
            producto.descripcion?.toLowerCase().includes(searchLower)
        );
    });

    // Paginación
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProductos = productosFiltrados.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Cargando licencias...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-500">{error}</div>
            </div>
        );
    }

    const esAdmin = (userRol || '').trim().toLowerCase() === 'admin';
    console.log('userRol:', userRol);

    return (
        <div className="max-w-full md:max-w-7xl mx-auto px-2 md:px-4 py-8">
            {esAdmin ? (
                <AdminPanel onLicenciaAdded={fetchLicencias} />
            ) : (
                <>
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-500 px-2 md:px-0">
                        Licencias Disponibles 
                        {searchQuery && <span className="text-blue-600"> - Buscando: "{searchQuery}"</span>}
                    </h2>
                    {productosFiltrados.length > 0 ? (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-4">
                                {currentProductos.map((producto) => (
                                    <Tarjeta 
                                        key={producto.id} 
                                        producto={producto}
                                        isAdmin={false}
                                        carritoVaciado={carritoVaciado}
                                        onLoginRequired={() => setShowLogin(true)}
                                        onCarritoActualizado={() => window.actualizarCarrito && window.actualizarCarrito()}
                                    />
                                ))}
                            </div>
                            {showLogin && (
                                <Login
                                    onClose={() => setShowLogin(false)} 
                                />
                            )}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Anterior
                                    </button>
                                    <div className="flex gap-1 flex-wrap">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const pageNumber = index + 1;
                                            return (
                                                <button
                                                    key={`page-${pageNumber}`}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-4 py-2 rounded transition ${
                                                        currentPage === pageNumber
                                                            ? 'bg-yellow-300 text-gray-900 font-bold'
                                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Siguiente
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                {searchQuery 
                                    ? `No se encontraron productos con "${searchQuery}"`
                                    : 'No hay licencias disponibles'
                                }
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>    
    );
}