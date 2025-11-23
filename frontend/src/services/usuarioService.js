import api from '../api/axios';

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('userEmail', response.data.email);
    localStorage.setItem('userRole', response.data.rol); // Guardar rol del usuario
    localStorage.setItem('userRol', response.data.rol);
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const register = async (email, password, rol) => {
    const response = await api.post('/auth/register', { 
        email, 
        password, 
        rol 
    });
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRol'); 
    localStorage.removeItem('userRole');  
    window.dispatchEvent(new Event('userLoggedOut'));
};