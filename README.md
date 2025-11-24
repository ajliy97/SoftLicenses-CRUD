# SoftLicenses-CRUD - Backend

Este repositorio contiene el **backend** de la aplicación E-Commerce para la gestión y venta de licencias de software.  
Desarrollado con **Spring Boot** y **Java**.

## Características

- API RESTful para gestión de usuarios, autenticación y licencias.
- Autenticación y autorización con JWT.
- Roles de usuario: `admin` y `user`.
- CRUD completo para licencias de software.
- Validación de datos y manejo de errores.
- Integración con base de datos mediante JPA/Hibernate.

## Requisitos

- Java 17 o superior
- Maven
- Base de datos (por defecto H2, configurable en `application.properties`)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/ajliy97/SoftLicenses-CRUD.git
   cd SoftLicenses-CRUD/backend
   ```

2. Configura la base de datos en `src/main/resources/application.properties`.

3. Ejecuta el backend:
   ```bash
   mvn spring-boot:run
   ```

## Endpoints principales

- `/api/usuarios` - Gestión de usuarios
- `/api/v1/auth` - Autenticación y registro
- `/api/licencias` - CRUD de licencias

## Seguridad

- Autenticación con JWT.
- Rutas protegidas según rol.
- Validación de correo único y contraseña segura.
