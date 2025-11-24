# SoftLicenses-CRUD

Este proyecto es una aplicación E-Commerce para la gestión y venta de licencias de software. Incluye un **frontend** desarrollado en React y un **backend** construido con Spring Boot.

## Estructura del proyecto

```
/
├── backend/   # API REST en Spring Boot
└── frontend/  # Aplicación web en React
```

## Características principales

- **Autenticación JWT** para usuarios y administradores.
- **Validación de usuarios** y roles.
- **Gestión de stock y precios** de licencias.
- **Paginación y búsqueda** de licencias.
- **Frontend moderno** con React y Tailwind CSS.
- **Backend robusto** con Spring Boot y JPA.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ajliy97/SoftLicenses-CRUD.git
cd SoftLicenses-CRUD
```

### 2. Backend

- Requiere Java 17+ y Maven.
- Configura la base de datos en `backend/src/main/resources/application.properties`.
- Ejecuta:

```bash
cd backend
mvn spring-boot:run
```

### 3. Frontend

- Requiere Node.js 18+.
- Ejecuta:

```bash
cd frontend
npm install
npm run dev
```

## Uso

- Accede a la aplicación web en [http://localhost:5173](http://localhost:5173).
- El backend corre en [http://localhost:8080](http://localhost:8080).
- Regístrate como usuario o inicia sesión como administrador para acceder al panel de administración.

## Ramas

- **main**: contiene tanto el frontend como el backend.
- **frontend**: solo la aplicación React.
- **backend**: solo la API Spring Boot.
MIT

---
