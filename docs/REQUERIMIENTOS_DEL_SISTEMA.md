# Requerimientos del Sistema y Dependencias

Este documento detalla los requerimientos técnicos, dependencias y configuraciones necesarias para ejecutar el Sistema de Gestión de Portafolios Académicos.

## 1. Requerimientos del Entorno (Prerrequisitos)

Para ejecutar este proyecto, necesitas tener instalado lo siguiente en tu sistema:

*   **Node.js**: Versión `v18.x` o superior (Recomendado `v20.x` LTS).
*   **npm**: Gestor de paquetes de Node (incluido con Node.js).
*   **MongoDB**: Base de datos NoSQL. Puede ser una instancia local (`mongod`) o una conexión remota (MongoDB Atlas). Versión recomendada `v6.0+`.
*   **Git**: Para control de versiones.

## 2. Dependencias del Backend (`server/package.json`)

El servidor utiliza **Node.js** con **Express**. Las principales librerías son:

### Dependencias de Producción
*   **express**: Framework web para manejar rutas y peticiones HTTP.
*   **mongoose**: ODM (Object Data Modeling) para interactuar con MongoDB.
*   **bcryptjs**: Para encriptar contraseñas de usuarios de forma segura.
*   **jsonwebtoken**: Para la autenticación basada en tokens (JWT).
*   **multer**: Middleware para manejar la subida de archivos (PDF/DOCX).
*   **cors**: Habilita el intercambio de recursos de origen cruzado (necesario para conectar con el frontend).
*   **dotenv**: Carga variables de entorno desde un archivo `.env`.
*   **helmet**: Añade cabeceras de seguridad HTTP.
*   **morgan**: Logger de peticiones HTTP (útil para desarrollo y depuración).
*   **nodemailer**: Para el envío de correos electrónicos (recuperación de contraseña).
*   **express-async-handler**: Manejo simplificado de errores en rutas asíncronas.
*   **colors**: Utilidad para colorear la consola (opcional).

### Dependencias de Desarrollo
*   **nodemon**: Reinicia automáticamente el servidor cuando detecta cambios en el código.

## 3. Dependencias del Frontend (`client/package.json`)

El cliente es una aplicación **React** construida con **Vite**.

### Dependencias de Producción
*   **react** / **react-dom**: Librería principal para construir la interfaz de usuario.
*   **react-router-dom**: Manejo de rutas y navegación en la SPA (Single Page Application).
*   **axios**: Cliente HTTP basado en promesas para realizar peticiones al backend.
*   **jwt-decode**: Utilidad para decodificar tokens JWT en el lado del cliente (para leer roles/ expiración).

### Dependencias de Desarrollo
*   **vite**: Herramienta de construcción y servidor de desarrollo rápido.
*   **eslint**: Linter para identificar y reportar patrones en el código JS/React.
*   **@vitejs/plugin-react**: Plugin de Vite para soporte de React.

## 4. Variables de Entorno Requeridas (`.env`)

El archivo `.env` en la carpeta `server/` debe contener las siguientes variables para que el sistema funcione correctamente:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/portfolio-db
JWT_SECRET=tu_secreto_super_seguro
# Configuración de Correo (Gmail App Password)
EMAIL_SERVICE=Gmail
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
# URL del Frontend (para enlaces de recuperación y CORS)
FRONTEND_URL=http://localhost:5173
```

## 5. Requerimientos Funcionales Básicos

1.  **Autenticación**: Registro, Login, Recuperación de Contraseña, Roles (Estudiante, Docente, Coordinador).
2.  **Gestión de Portafolios**: Crear, Editar, Eliminar, Listar portafolios.
3.  **Carga de Archivos**: Subida segura de PDF/DOCX con validación de tipo MIME.
4.  **Revisión**: Flujo de aprobación/rechazo por parte de docentes con comentarios.
5.  **Seguridad**: Protección contra Path Traversal, XSS (vía Helmet), Hashing de contraseñas.
