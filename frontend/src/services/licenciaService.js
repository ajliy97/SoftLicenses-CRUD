import api from '../api/axios';

export const getLicencias = async () => {
    const response = await api.get('/licencia');
    return response.data;
};

export const createLicencia = async (licenciaData) => {
    const response = await api.post('/licencia', licenciaData);
    return response.data;
};

export const updateLicencia = async (id, licenciaData) => {
    const response = await api.put(`/licencia/${id}`, licenciaData);
    return response.data;
};

export const deleteLicencia = async (id) => {
    const response = await api.delete(`/licencia/${id}`);
    return response.data;
};