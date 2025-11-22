# E-Commerce Frontend

Este proyecto es el frontend de una aplicación de comercio electrónico desarrollada con React. Permite a los usuarios navegar, agregar productos al carrito, gestionar licencias y realizar compras. Está diseñado para integrarse con un backend en Spring Boot.

## Características

- Visualización de productos y detalles
- Carrito de compras con control de stock
- Gestión de licencias (admin)
- Autenticación de usuario
- Confirmación y pago de pedidos
- Historial de compras

## Tecnologías

- React
- Tailwind CSS
- Axios
- Context API

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/ajliy97/SoftLicenses-CRUD.git
   cd frontend
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura la URL del backend en los servicios (`src/services/`).

4. Inicia la aplicación:

   ```bash
   npm run dev
   ```

## Uso

- Accede a `http://localhost:5173` en tu navegador.
- Regístrate o inicia sesión para comenzar a comprar.
- Si eres administrador, puedes editar y eliminar licencias.

## Estructura

- `src/components`: Componentes reutilizables (Tarjeta, CartModal, etc.)
- `src/services`: Lógica de comunicación con el backend
- `src/pages`: Vistas principales de la app
