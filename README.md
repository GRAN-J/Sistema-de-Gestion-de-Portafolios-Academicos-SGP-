# 🎓 Sistema de Gestión de Portafolios Académicos (SGP)

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

Una plataforma integral **Full Stack (MERN)** diseñada para la gestión, evaluación y seguimiento de portafolios académicos en entornos universitarios. El sistema permite a estudiantes crear y enviar proyectos, y a docentes revisarlos, aprobarlos o solicitar cambios, todo bajo un estricto control de acceso basado en roles (RBAC).

---

## 🚀 Características Principales

### 🔐 Seguridad y Autenticación
- **JWT (JSON Web Tokens):** Autenticación stateless segura.
- **RBAC (Role-Based Access Control):** 
  - **Estudiantes:** Gestión de sus propios proyectos (Redirección directa a portafolios).
  - **Docentes:** Revisión exclusiva de **estudiantes asignados**. Privacidad garantizada (no ven proyectos de otros docentes).
  - **Coordinadores:** Gestión de asignaciones (Estudiante -> Docente), supervisión global y estadísticas completas.
- **Recuperación de Contraseña:** Flujo seguro con tokens hasheados (SHA-256), expiración automática y envío de correos vía Nodemailer (soporte Ethereal/SMTP).
- **Protección de Datos:** Contraseñas encriptadas con `bcryptjs`.

### 📂 Gestión de Archivos (File System)
- **Carga Segura:** Implementación de `Multer` con validación estricta de tipos MIME (`PDF`, `DOCX`) y límite de tamaño (5MB).
- **Almacenamiento Privado:** Los archivos se guardan fuera del acceso público directo (`/server/uploads`).
- **Nombres Únicos:** Generación de nombres criptográficos para evitar colisiones.
- **Descarga Protegida:** Endpoint dedicado que valida permisos antes de servir el archivo (Anti Path Traversal).
- **Limpieza Automática:** El sistema elimina archivos obsoletos al actualizar o borrar un proyecto.

### 📊 Funcionalidades de Negocio
- **Gestión de Asignaciones:** Coordinador vincula Estudiante ➝ Docente (Relación 1 a 1).
- **Flujo de Estados:** Borrador ➝ Enviado ➝ Aprobado / Rechazado.
- **Retroalimentación:** Observaciones específicas por proyecto.
- **Dashboard Segmentado:** 
  - **Coordinador:** Estadísticas globales y gestión total.
  - **Docente:** Métricas exclusivas de su carga asignada.
  - **Estudiante:** Acceso directo a sus portafolios (sin dashboard).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Frontend** | React.js (Vite) | SPA moderna, rápida y reactiva. |
| **Estilos** | CSS Modules / Plain CSS | Diseño minimalista y profesional. |
| **Backend** | Node.js + Express | API RESTful escalable y modular. |
| **Base de Datos** | MongoDB + Mongoose | Modelado de datos flexible y potente. |
| **Seguridad** | Helmet, CORS, Bcrypt | Protección contra vulnerabilidades web comunes. |
| **Email** | Nodemailer | Servicio desacoplado para notificaciones. |

---

## 📂 Estructura del Proyecto

El proyecto sigue una arquitectura limpia basada en capas (Layered Architecture):

```bash
/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Componentes reutilizables (Navbar, ProtectedRoute)
│   │   ├── context/        # Gestión de estado global (AuthContext)
│   │   ├── pages/          # Vistas principales (Dashboard, Login, PortfolioForm)
│   │   └── services/       # Comunicación con API (Axios config)
│
├── server/                 # Backend (Node.js)
│   ├── src/
│   │   ├── config/         # Configuración de DB y variables
│   │   ├── controllers/    # Lógica de negocio (Auth, Portfolio)
│   │   ├── middleware/     # Middlewares (Auth, Roles, Upload, Error)
│   │   ├── models/         # Esquemas de Mongoose (User, Portfolio)
│   │   ├── routes/         # Definición de endpoints API
│   │   └── services/       # Servicios auxiliares (EmailService)
│   └── uploads/            # Almacenamiento físico de archivos (Privado)
```

---

## 📚 Documentación Técnica y Diagramas

Para una comprensión visual completa del flujo de trabajo y la arquitectura del sistema, se ha generado documentación técnica detallada en la carpeta `docs/`.

- [**Diagramas UML del Sistema**](./docs/DIAGRAMAS_DEL_SISTEMA.md): Incluye Diagramas de Clases, Estados, Secuencia, Colaboración, Componentes, Distribución y Casos de Uso (Roles) (Mermaid).
- [**Requerimientos y Dependencias**](./docs/REQUERIMIENTOS_DEL_SISTEMA.md): Lista detallada de prerrequisitos de software, versiones de Node.js/MongoDB y librerías utilizadas.

---

## 🏗️ Arquitectura de Seguridad

El sistema implementa un modelo de seguridad en defensa en profundidad (Defense in Depth) distribuido en múltiples capas:

- **Capa de Autenticación:** Verificación de identidad mediante **JWT** (stateless) y gestión de sesiones segura.
- **Capa de Autorización:** Control de acceso basado en roles (**RBAC**) que restringe endpoints y recursos según el perfil (Estudiante, Docente, Coordinador).
- **Capa de Validación:** Middleware `Multer` para saneamiento de archivos y validación estricta de esquemas con `Mongoose`.
- **Capa de Persistencia:** Almacenamiento seguro de contraseñas (Hashing) y aislamiento de archivos físicos fuera del acceso público.
- **Capa de Infraestructura:** Cabeceras de seguridad HTTP con **Helmet** y control de origen con **CORS**.

Este enfoque garantiza que la integridad del sistema no dependa de un único punto de fallo.

---

## ⚡ Instalación y Configuración

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v16 o superior)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local o Atlas)

### 🔧 Versiones Recomendadas
- **Node.js:** v18.x o superior (LTS recomendado).
- **MongoDB:** v6.0 o superior.

### 1️⃣ Configuración del Backend

1.  Navega a la carpeta del servidor e instala dependencias:
    ```bash
    cd server
    npm install
    ```

2.  Crea un archivo `.env` en `/server` con las siguientes variables:
    ```env
    NODE_ENV=development
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/portfolio_db
    JWT_SECRET=tu_clave_secreta_super_segura
    
    # Configuración de Email (Desarrollo usa Ethereal automáticamente si se omiten)
    # EMAIL_HOST=smtp.gmail.com
    # EMAIL_PORT=587
    # EMAIL_USER=tu_correo@gmail.com
    # EMAIL_PASS=tu_password_app
    
    # URL del Frontend para enlaces de recuperación
    FRONTEND_URL=http://localhost:3000
    ```

3.  Inicia el servidor en modo desarrollo:
    ```bash
    cd server
    npm run dev
    ```
    > El servidor correrá en `http://localhost:5000`.

### 2️⃣ Configuración del Frontend

1.  Navega a la carpeta del cliente e instala dependencias:
    ```bash
    cd client
    npm install
    ```

2.  Inicia la aplicación:
    ```bash
    npm run dev
    ```
    > La aplicación correrá en `http://localhost:3000`.

---

## 👥 Gestión de Roles Administrativos

Por seguridad, el registro público (`/api/auth/register`) asigna automáticamente el rol de **estudiante**. No es posible crear administradores desde la interfaz web.

Para crear roles privilegiados (**Docente** o **Coordinador**), existen dos métodos:

### Método 1: Modificación Directa en Base de Datos (Recomendado para Dev)
1.  Registra un usuario normal desde el frontend.
2.  Accede a tu base de datos MongoDB (usando MongoDB Compass o Shell).
3.  Busca la colección `usuarios`.
4.  Edita el documento del usuario deseado y cambia el campo `rol`:
    *   `"estudiante"` -> `"docente"`
    *   `"estudiante"` -> `"coordinador"`
5.  Guarda los cambios.

### Método 2: Endpoint Administrativo (Requiere Coordinador previo)
Si ya existe un coordinador, este puede usar el endpoint protegido para crear otros usuarios con roles específicos:
- `POST /api/auth/create-user` (Requiere Token de Coordinador)

---

## 📚 Documentación de API (Endpoints)

Todas las respuestas exitosas siguen el formato estándar JSON: `{ success: true, data: ... }`.

### 👤 Autenticación y Usuarios (`/api/auth`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Registrar nuevo usuario (Estudiante) | Público |
| `POST` | `/login` | Iniciar sesión y obtener Token | Público |
| `GET` | `/me` | Obtener perfil del usuario actual | Privado |
| `GET` | `/teachers` | Listar docentes (para asignación) | Coordinador |
| `GET` | `/students` | Listar estudiantes y sus asignaciones | Coordinador |
| `PUT` | `/assign-teacher` | Vincular Estudiante con Docente | Coordinador |
| `POST` | `/forgot-password` | Solicitar recuperación | Público |

### 📁 Portafolios (`/api/portfolios`)

| Método | Endpoint | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Listar portafolios (Filtro automático por rol/asignación) | Privado |
| `POST` | `/` | Crear nuevo portafolio (Hereda docente asignado) | Estudiante |
| `GET` | `/:id` | Ver detalles de un portafolio | Privado* |
| `PUT` | `/:id` | Actualizar portafolio (Datos o Archivo) | Privado* |
| `DELETE` | `/:id` | Eliminar portafolio y archivo asociado | Estudiante |
| `GET` | `/stats` | Estadísticas (Globales o Asignadas) | Docente/Coord |

> (*) **Reglas de Negocio en Actualización:**
> - **Estudiante:** Solo puede editar si el estado es `borrador`.
> - **Docente:** Solo puede editar `estado` y `observaciones`.

---

## 🧪 Pruebas y Flujos Comunes

### 1. Flujo de Recuperación de Contraseña
1. Ir a `/login` -> Click en "¿Olvidaste tu contraseña?".
2. Ingresar correo.
3. Revisar consola del backend (en modo desarrollo) para ver el **Link de Ethereal**.
4. Abrir link -> Click en "Restablecer" -> Ingresar nueva clave.
5. Iniciar sesión con la nueva credencial.

### 2. Flujo Completo de Gestión (Nuevo)
1. **Coordinador:** Entra a **ASIGNACIONES**, busca al estudiante "Juan" y le asigna al docente "Pedro".
2. **Estudiante (Juan):** Crea un portafolio. El sistema detecta automáticamente a "Pedro" como su revisor.
3. **Docente (Pedro):** Entra a su dashboard. En "MIS PROYECTOS ASIGNADOS" ve el trabajo de Juan.
4. **Revisión:** Pedro descarga el archivo, revisa y puede:
   - **Aprobar:** El ciclo termina.
   - **Rechazar:** Puede habilitar una casilla para permitir que Juan corrija y reenvíe.

### 3. Flujo de Carga y Descarga de Archivos
1. **Estudiante:** Crea proyecto, adjunta PDF. El estado inicial es `borrador`.
2. **Estudiante:** Edita el proyecto, cambia el archivo (el anterior se borra del servidor).
3. **Estudiante:** Cambia estado a `enviado`.
4. **Docente:** Ve el proyecto en su lista. Descarga el archivo usando el botón seguro.
5. **Docente:** Aprueba el proyecto y deja observaciones.

---

## 🔒 Buenas Prácticas Implementadas

1.  **Anti Path Traversal:** Validación de rutas en descarga de archivos.
2.  **User Enumeration Prevention:** Mensajes genéricos en recuperación de contraseña.
3.  **Secure Storage:** Archivos fuera del `public_html` o carpetas estáticas.
4.  **Token Hashing:** Tokens de recuperación hasheados en BD.
5.  **Environment Variables:** Configuración sensible separada del código.

### 🛡️ Seguridad Avanzada
Adicionalmente a las prácticas estándar, se han implementado contramedidas específicas:
- **Protección XSS y Clickjacking:** Implementación de `Helmet` para configurar cabeceras HTTP seguras (Content-Security-Policy, X-Frame-Options).
- **CORS Restrictivo:** Configuración explícita para permitir peticiones solo desde orígenes confiables (Frontend).
- **Sanitización de Datos:** Prevención de inyección NoSQL mediante esquemas tipados.

---

## 🚀 Roadmap / Mejoras Futuras

Para escalar el proyecto a un entorno de producción de alto tráfico, se proponen las siguientes mejoras:

- [ ] **Rate Limiting:** Implementación de `express-rate-limit` para mitigar ataques de fuerza bruta y DDoS.
- [ ] **Auditoría (Logging):** Sistema de logs persistentes (ej. Winston) para trazar descargas de archivos y cambios de estado críticos.
- [ ] **Testing Automatizado:** Suite de pruebas unitarias y de integración con **Jest** y **Supertest**.
- [ ] **CI/CD:** Pipelines de despliegue continuo (GitHub Actions) para automatizar pruebas y deployment.
- [ ] **Almacenamiento en Nube:** Migración de `uploads` locales a servicios como AWS S3 o Cloudinary para escalabilidad horizontal.

---

## 📄 Licencia

Este proyecto es un prototipo de investigación académica. Uso exclusivo educativo.
