# 📊 Diagramas del Sistema SGP (Mermaid)

Este documento contiene la definición técnica de los diagramas del sistema. La sintaxis ha sido validada para ser compatible con la mayoría de los renderizadores Mermaid.

---

## 1️⃣ Diagrama de Casos de Uso
Describe las funcionalidades disponibles para cada rol (Actor) y sus interacciones con el sistema.

El diagrama de casos de uso representa las funcionalidades principales del Sistema de Gestión de Portafolios Académicos y las interacciones de los diferentes actores con la plataforma.

```mermaid
graph TD
    %% Estilos Globales
    classDef actor fill:#ffffff,stroke:#000000,stroke-width:2px;
    classDef usecase fill:#ffffff,stroke:#000000,stroke-width:1px,rx:20,ry:20;

    %% Actores (Fuera del límite del sistema)
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
        
        %% Enlace invisible para orden vertical
        UC2 ~~~ UC4

        %% Grupo Estudiante
        UC4([Crear Portafolio]):::usecase
        UC5([Subir Archivos]):::usecase
        UC6([Enviar a Revisión]):::usecase
        UC7([Ver Mis Portafolios]):::usecase
        
        %% Enlace invisible
        UC7 ~~~ UC8

        %% Grupo Docente
        UC8([Ver Asignados]):::usecase
        UC9([Descargar Archivo]):::usecase
        UC10([Evaluar Proyecto]):::usecase
        UC11([Realizar Observaciones]):::usecase
        
        %% Enlace invisible
        UC11 ~~~ UC12

        %% Grupo Coordinador
        UC12([Ver Estadísticas]):::usecase
        UC13([Gestionar Asignaciones]):::usecase
        UC14([Listar Todos]):::usecase
    end
    
    %% Estilo del límite del sistema
    style Sistema fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5

    %% Relaciones (Cruzando el límite)
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
Representa la estructura de datos (Modelo) y las relaciones entre entidades del sistema.

```mermaid
classDiagram
    direction LR
    
    %% Definición de Clases
    class User {
        +ObjectId _id
        +String nombre
        +String correo
        +String password
        +String rol
        +ObjectId docenteAsignado
    }

    class Portfolio {
        +ObjectId _id
        +String titulo
        +String descripcion
        +String estado
        +ObjectId autor
        +ObjectId docenteRevisor
        +Date createdAt
    }

    class Archivo {
        <<Subdocument>>
        +String nombreOriginal
        +String ruta
        +String tipo
    }

    %% Relaciones
    User "1" --> "0..*" Portfolio : Autor (Estudiante)
    Portfolio "0..*" --> "0..1" User : Revisor (Docente)
    Portfolio "1" *-- "0..*" Archivo : Contiene

    %% Relación Reflexiva (Auto-referencia)
    User "0..*" --> "0..1" User : docenteAsignado (Supervisa)
```

---

## 3️⃣ Diagrama de Estados (Portafolio)
Muestra el ciclo de vida y las transiciones de estado de un proyecto académico.

```mermaid
stateDiagram-v2
    direction TB
    [*] --> Borrador
    
    Borrador --> Enviado : Estudiante envía
    Borrador --> Borrador : Estudiante edita
    
    Enviado --> Aprobado : Docente aprueba
    Enviado --> Rechazado : Docente rechaza
    
    Rechazado --> [*] : Fin del ciclo
    Rechazado --> Borrador : Docente habilita edición
    
    Aprobado --> [*]
```

---

## 4️⃣ Diagrama de Secuencia
Detalla la interacción temporal de objetos durante el **Envío de un Portafolio**.

```mermaid
sequenceDiagram
    participant Estudiante
    participant Frontend
    participant API as "Backend API"
    participant DB as "MongoDB"
    participant FS as "FileSystem"

    Estudiante->>Frontend: Click "Guardar Cambios"
    Frontend->>API: POST /api/portfolios (FormData)
    
    activate API
    API->>API: Validar Token (Auth)
    API->>FS: Guardar Archivo (Multer)
    FS-->>API: Retorna Metadata Archivo
    
    API->>DB: Buscar Usuario (verificar docenteAsignado)
    DB-->>API: Retorna ID Docente
    
    API->>DB: Create Portfolio (con ID Docente implícito)
    DB-->>API: Confirmación (Documento)
    API-->>Frontend: 201 Created
    deactivate API
    
    Frontend-->>Estudiante: Mensaje "Proyecto Guardado"
```

---

## 5️⃣ Diagrama de Componentes
Describe la arquitectura de software, módulos y sus dependencias.

```mermaid
graph TD
    subgraph "Cliente (Frontend)"
        ReactApp[React App]
        Axios[Axios Service]
        AuthCtx[Auth Context]
    end

    subgraph "Servidor (Backend)"
        Express[Express Server]
        AuthCtrl[Auth Controller]
        PortCtrl[Portfolio Controller]
        UserCtrl[User Controller]
        Multer[Multer Middleware]
    end

    subgraph "Persistencia"
        MongoDB[(MongoDB)]
        FS[FileSystem /uploads]
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

## 6️⃣ Diagrama de Despliegue
Representa la distribución física de los artefactos de software en los nodos de ejecución.

```mermaid
graph TD
    subgraph "Nodo Cliente"
        Browser[Navegador Web]
    end

    subgraph "Nodo Servidor de Aplicaciones"
        NodeJS[Node.js Runtime]
        API[Express API]
        Uploads[Folder: /uploads]
    end

    subgraph "Nodo Servidor de Datos"
        DB[(MongoDB Database)]
    end

    Browser -- "HTTP/HTTPS (Puerto 3000/5000)" --> API
    NodeJS -- "Ejecuta" --> API
    API -- "TCP/IP (Puerto 27017)" --> DB
    API -- "I/O (Lectura/Escritura)" --> Uploads
```

---

## 7️⃣ Diagrama de Colaboración
Enfocado en la interacción entre objetos para el proceso de **Asignación de Docente**.

```mermaid
graph TD
    Coordinador((Coordinador))
    Front[Frontend: Asignaciones]
    API[API: PUT /assign-teacher]
    DB[(MongoDB: Users)]

    Coordinador -- 1. Selecciona Estudiante y Docente --> Front
    Front -- 2. Envía IDs --> API
    API -- 3. Busca Estudiante --> DB
    API -- 4. Actualiza campo docenteAsignado --> DB
    DB -- 5. Confirma actualización --> API
    API -- 6. Respuesta 200 OK --> Front
    Front -- 7. Muestra Check Verde --> Coordinador
```
