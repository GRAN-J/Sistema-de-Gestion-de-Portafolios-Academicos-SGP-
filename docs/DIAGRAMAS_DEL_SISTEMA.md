# 📊 Diagramas del Sistema SGP (Mermaid)

Este documento contiene la definición técnica de los diagramas del sistema.

---

## 1️⃣ Diagrama de Casos de Uso
Describe las funcionalidades disponibles para cada rol (Actor) y sus interacciones con el sistema.

```mermaid
graph TD
    %% Estilos Globales
    classDef actor fill:#ffffff,stroke:#000000,stroke-width:2px;
    classDef usecase fill:#ffffff,stroke:#000000,stroke-width:1px,rx:20,ry:20;

    %% Actores
    Estudiante["👤<br/>Estudiante"]:::actor
    Docente["👤<br/>Docente"]:::actor
    Coordinador["👤<br/>Coordinador"]:::actor

    %% Límite del Sistema
    subgraph Sistema ["Sistema de Gestión de Portafolios"]
        direction TB
        
        %% Grupo Acceso
        UC1([Registrarse]):::usecase
        UC2([Iniciar Sesión]):::usecase
        UC3([Recuperar Contraseña]):::usecase
        
        %% Grupo Estudiante
        UC4([Crear Portafolio]):::usecase
        UC5([Subir Archivos]):::usecase
        UC6([Enviar a Revisión]):::usecase
        UC7([Ver Mis Portafolios]):::usecase
        
        %% Grupo Docente
        UC8([Ver Asignados]):::usecase
        UC9([Descargar Archivo]):::usecase
        UC10([Evaluar Proyecto]):::usecase
        UC11([Realizar Observaciones]):::usecase
        
        %% Grupo Coordinador
        UC12([Ver Estadísticas]):::usecase
        UC13([Gestionar Asignaciones]):::usecase
        UC14([Listar Todos]):::usecase
    end
    
    %% Relaciones
    Estudiante --> UC1
    Estudiante --> UC2
    Estudiante --> UC3
    Estudiante --> UC4
    Estudiante --> UC5
    Estudiante --> UC6
    Estudiante --> UC7
    Estudiante --> UC9

    Docente --> UC2
    Docente --> UC3
    Docente --> UC8
    Docente --> UC9
    Docente --> UC10
    Docente --> UC11

    Coordinador --> UC2
    Coordinador --> UC3
    Coordinador --> UC9
    Coordinador --> UC12
    Coordinador --> UC13
    Coordinador --> UC14
```

---

## 2️⃣ Diagrama de Clases
Representa la estructura de datos (Modelo) y las relaciones entre entidades.

```mermaid
classDiagram
    direction LR
    
    class Usuario {
        +ObjectId _id
        +String nombre
        +String correo
        +String password
        +String rol
        +ObjectId docenteAsignado
    }

    class Portafolio {
        +ObjectId _id
        +String titulo
        +String descripcion
        +String estado
        +ObjectId autor
        +ObjectId docenteRevisor
        +Date createdAt
    }

    class Archivo {
        <<Subdocumento>>
        +String nombreOriginal
        +String ruta
        +String tipo
    }

    %% Relaciones
    Usuario "1" --> "0..*" Portafolio : Autor (Estudiante)
    Portafolio "0..*" --> "0..1" Usuario : Revisor (Docente)
    Portafolio "1" *-- "0..*" Archivo : Contiene
    Usuario "0..*" --> "0..1" Usuario : docenteAsignado (Supervisa)
```

---

## 3️⃣ Diagrama de Estados (Portafolio)
Muestra el ciclo de vida de un proyecto académico.

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Borrador
    
    Borrador --> Enviado : Estudiante envía
    Borrador --> Borrador : Estudiante edita
    
    Enviado --> Aprobado : Docente aprueba
    Enviado --> Rechazado : Docente rechaza
    
    Rechazado --> Borrador : Docente habilita edición
    Rechazado --> [*]
    
    Aprobado --> [*]
```

---

## 4️⃣ Diagrama de Secuencia (Envío de Portafolio)
Detalla la interacción temporal de objetos.

```mermaid
sequenceDiagram
    participant Estudiante
    participant Frontend
    participant API as "Backend API"
    participant DB as "Base de Datos"
    participant FS as "Sistema de Archivos"

    Estudiante->>Frontend: Click "Guardar Cambios"
    Frontend->>API: POST /api/portfolios (FormData)
    
    activate API
    API->>API: Validar Token (Autenticación)
    API->>FS: Guardar Archivo (Multer)
    FS-->>API: Retorna Metadatos
    
    API->>DB: Buscar Usuario (verificar asignación)
    DB-->>API: Retorna ID Docente
    
    API->>DB: Crear Portafolio
    DB-->>API: Confirmación
    API-->>Frontend: 201 Creado
    deactivate API
    
    Frontend-->>Estudiante: Mensaje "Proyecto Guardado"
```

---

## 5️⃣ Diagrama de Componentes
Arquitectura de software y módulos.

```mermaid
graph TD
    subgraph "Cliente (Frontend)"
        ReactApp[App React]
        Axios[Servicio Axios]
        AuthCtx[Contexto de Autenticación]
    end

    subgraph "Servidor (Backend)"
        Express[Servidor Express]
        AuthCtrl[Controlador de Autenticación]
        PortCtrl[Controlador de Portafolios]
        UserCtrl[Controlador de Usuarios]
        Multer[Middleware de Carga]
    end

    subgraph "Persistencia"
        MongoDB[(MongoDB)]
        FS[Sistema de Archivos /uploads]
    end

    ReactApp --> AuthCtx
    ReactApp --> Axios
    Axios -->|HTTP/JSON| Express
    
    Express --> AuthCtrl
    Express --> PortCtrl
    Express --> UserCtrl
    
    PortCtrl --> Multer
    Multer --> FS
    
    AuthCtrl --> MongoDB
    PortCtrl --> MongoDB
    UserCtrl --> MongoDB
```

---

## 6️⃣ Diagrama de Distribución (Despliegue)
Infraestructura física y distribución de componentes.

```mermaid
graph TD
    %% Definición de Nodos
    subgraph Cliente ["💻 Dispositivo Cliente"]
        direction TB
        Browser["🌐 Navegador Web"]
        ReactApp["⚛️ App React (SPA)"]
    end

    subgraph AppServer ["🚀 Servidor de Aplicaciones"]
        direction TB
        API["⚙️ Backend: Express API"]
        NodeJS["🟢 Runtime: Node.js"]
        Uploads["📂 Almacenamiento: /uploads"]
    end

    subgraph DBServer ["🗄️ Servidor de Datos"]
        direction TB
        DB[("🍃 MongoDB (NoSQL)")]
    end

    %% Conexiones
    Browser <-->|"Puerto 5000 (HTTPS)"| API
    ReactApp <-->|"Peticiones REST"| API
    
    API <-->|"Puerto 27017"| DB
    API <-->|"Acceso a Archivos"| Uploads
```
