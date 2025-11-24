import { useState, useEffect } from 'react';
import { createLicencia, getLicencias, deleteLicencia } from '../services/licenciaService';
import EditModal from './EditModal';

export default function AdminPanel({ onLicenciaAdded }) {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        categoria: '',
        precio: '',
        imagenUrl: '',
        tipo_licencia: '',
        tiempo_duracion: '',
        cantidad_stock: ''
    });
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [tableError, setTableError] = useState('');
    const [tableSuccess, setTableSuccess] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [licencias, setLicencias] = useState([]);
    const [loadingLicencias, setLoadingLicencias] = useState(true);
    const [editingLicencia, setEditingLicencia] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [deleting, setDeleting] = useState(false);
    // Estado para usuario y rol
    const [userEmail, setUserEmail] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const itemsPerPage = 12;

    // Cargar licencias al montar el componente
    useEffect(() => {
        setUserEmail(localStorage.getItem('userEmail'));
        setUserRole(localStorage.getItem('userRole'));
        fetchLicencias();
    }, []);

    // Función para verificar si es admin
    const isAdmin = (role) => {
        if (!role || typeof role !== 'string') return false;
        return role.trim().toLowerCase() === 'admin';
    };

    const fetchLicencias = async () => {
        try {
            setLoadingLicencias(true);
            const data = await getLicencias();
            setLicencias(data);
        } catch (err) {
            console.error('Error al cargar licencias:', err);
        } finally {
            setLoadingLicencias(false);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setFormError('');
        setFormSuccess('');
    };

    // Crear nueva licencia
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError('');
        setFormSuccess('');

        // Validación de precio
        if (parseInt(formData.precio) <= 1) {
            setFormError('El precio debe ser mayor que 1');
            setLoading(false);
            return;
        }
        if (parseInt(formData.cantidad_stock) <= 1) {
            setFormError('La cantidad en stock debe ser mayor que 1');
            setLoading(false);
            return;
        }

        try {
            const licenciaData = {
                ...formData,
                precio: parseInt(formData.precio),
                cantidad_stock: parseInt(formData.cantidad_stock)
            };
            
            await createLicencia(licenciaData);
            setFormSuccess('¡Licencia creada exitosamente!');
            setTimeout(() => setFormSuccess(''), 3000);
            
            // Limpiar formulario
            setFormData({
                nombre: '',
                descripcion: '',
                categoria: '',
                precio: '',
                imagenUrl: '',
                tipo_licencia: '',
                tiempo_duracion: '',
                cantidad_stock: ''
            });
            
            // Actualizar lista de licencias
            fetchLicencias();
            if (onLicenciaAdded) {
                onLicenciaAdded();
            }
        } catch (err) {
            console.error('Error al crear licencia:', err);
            setFormError(err.response?.data?.message || 'Error al crear la licencia');
            setTimeout(() => setFormError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar licencia
    const handleEdit = (licencia) => {
        setEditingLicencia(licencia);
    };
    
    const handleCloseEdit = () => {
        setEditingLicencia(null);
    };
    
    const handleUpdated = () => {
        fetchLicencias();
        if (onLicenciaAdded) {
            onLicenciaAdded();
        }
    };

    // Eliminar licencia
    const handleDelete = async (licencia) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${licencia.nombre}"?`)) {
            return;
        }
        
        setDeleting(true);
        setTableError('');
        setTableSuccess('');
        
        try {
            await deleteLicencia(licencia.id);
            setTableSuccess('Licencia eliminada exitosamente');
            setTimeout(() => setTableSuccess(''), 3000);
            fetchLicencias();
            if (onLicenciaAdded) {
                onLicenciaAdded();
            }
        } catch (err) {
            console.error('Error al eliminar licencia:', err);
            setTableError('Error al eliminar la licencia');
            setTimeout(() => setTableError(''), 3000);
        } finally {
            setDeleting(false);
        }
    };

    // Paginación
    const totalPages = Math.ceil(licencias.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLicencias = licencias.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <>
            {userEmail && isAdmin(userRole) ? (
                <>
                    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start">
                        {/* Formulario para añadir una nueva licencia*/}
                        <div className="w-full lg:w-auto lg:max-w-md bg-blue-200 rounded-lg shadow-lg p-6 self-start">
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className="flex items-center text-2xl font-bold text-gray-700 gap-2">
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                                    </svg>
                                    Añadir Licencia
                                </h2>
                                <button 
                                    onClick={() => setShowForm(!showForm)} 
                                    className="text-gray-700 hover:text-gray-900 p-2">
                                    <svg className="w-6 h-6 transform transition-transform" style={{ transform: showForm ? 'rotate(90deg)' : 'rotate(270deg)' }} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            
                            {showForm && (
                                <>
                                    {formError && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                            {formError}
                                        </div>
                                    )}

                                    {formSuccess && (
                                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                            {formSuccess}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        {/* ...campos del formulario sin cambios... */}
                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Nombre *
                                            </label>
                                            <input
                                                type="text"
                                                name="nombre"
                                                value={formData.nombre}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: Windows 11 Pro"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Categoría *
                                            </label>
                                            <input
                                                type="text"
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: Windows, Office, Antivirus..."
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Precio *
                                            </label>
                                            <input
                                                type="number"
                                                name="precio"
                                                value={formData.precio}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: 19990"
                                                min="1"
                                                step="0.01"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                URL de Imagen
                                            </label>
                                            <input
                                                type="text"
                                                name="imagenUrl"
                                                value={formData.imagenUrl}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: /windows11.png"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Tipo de Licencia *
                                            </label>
                                            <input
                                                type="text"
                                                name="tipo_licencia"
                                                value={formData.tipo_licencia}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: Anual,Mensual,Permanente"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Tiempo de Duración de Licencia *
                                            </label>
                                            <input
                                                type="text"
                                                name="tiempo_duracion"
                                                value={formData.tiempo_duracion}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: 1 año, 6 meses, 3 meses"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Cantidad en stock *
                                            </label>
                                            <input
                                                type="number"
                                                name="cantidad_stock"
                                                value={formData.cantidad_stock}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Ej: 50, 100, 200"
                                                min="1"
                                                step="1"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 font-bold text-sm mb-1">
                                                Descripción *
                                            </label>
                                            <textarea
                                                name="descripcion"
                                                value={formData.descripcion}
                                                onChange={handleChange}
                                                className="w-full px-4 py-1 rounded-lg border-2 text-gray-900 border-gray-400 focus:border-yellow-300 focus:outline-none"
                                                placeholder="Descripción detallada de la licencia..."
                                                rows="3"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <div className="mt-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-white text-blue-700 font-bold py-2 rounded-lg hover:bg-yellow-300 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Creando...' : 'Crear Licencia'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>

                        {/* Tabla de Licencias */}
                        <div className="flex-1 bg-blue-200 rounded-lg shadow-lg p-3 md:p-6 self-start">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-3 md:mb-4">Editar Licencias</h2>
                            
                            {tableError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {tableError}
                                </div>
                            )}

                            {tableSuccess && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {tableSuccess}
                                </div>
                            )}
                            
                            {loadingLicencias ? (
                                <div className="text-center py-8">Cargando licencias...</div>
                            ) : licencias.length === 0 ? (
                                <div className="text-center py-8 text-gray-600">No hay licencias disponibles</div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white rounded-lg overflow-hidden">
                                            <thead className="bg-gray-700 text-white">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Categoría</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Tipo de Licencia</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Precio</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold">Stock</th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {currentLicencias.map((licencia) => (
                                                    <tr key={licencia.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-gray-900">{licencia.nombre}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{licencia.categoria}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{licencia.tipo_licencia}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">
                                                            ${licencia.precio.toLocaleString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">{licencia.cantidad_stock}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleEdit(licencia)}
                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
                                                                    title="Editar"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(licencia)}
                                                                    disabled={deleting}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition disabled:opacity-50"
                                                                    title="Eliminar"
                                                                >
                                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Paginación */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-4">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Anterior
                                            </button>
                                            
                                            {[...Array(totalPages)].map((_, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                    <button
                                                        key={`page-${pageNumber}`}
                                                        onClick={() => handlePageChange(pageNumber)}
                                                        className={`px-3 py-1 rounded ${
                                                            currentPage === pageNumber
                                                                ? 'bg-yellow-300 text-gray-900 font-bold'
                                                                : 'bg-white hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                );
                                            })}
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 bg-white rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Siguiente
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Modal de edición */}
                    {editingLicencia && (
                        <EditModal
                            licencia={editingLicencia}
                            onClose={handleCloseEdit}
                            onUpdated={handleUpdated}
                        />
                    )}
                </>
            ) : null }
        </>
    );
}