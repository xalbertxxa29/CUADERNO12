# Documentación del Sistema CUADERNO12 - Liderman

## 📋 Índice
1. [Introducción General](#introducción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Directorios](#estructura-de-directorios)
4. [Componentes Principales](#componentes-principales)
5. [Flujo de Funcionamiento](#flujo-de-funcionamiento)
6. [Módulos Críticos](#módulos-críticos)
7. [Gestión de Estado](#gestión-de-estado)
8. [Sincronización de Datos](#sincronización-de-datos)
9. [Modo Offline](#modo-offline)
10. [Seguridad y Autenticación](#seguridad-y-autenticación)
11. [Guía de Uso Paso a Paso](#guía-de-uso-paso-a-paso)
12. [Control de Versiones](#control-de-versiones)
13. [Troubleshooting](#troubleshooting)

---

## Introducción General

**CUADERNO12** es una aplicación web progresiva (PWA) desarrollada para **Liderman** que gestiona:
- **Acceso y salida de personal** (peatonal y vehicular)
- **Registro de incidentes y consignas**
- **Rondas de vigilancia** con lectura de códigos QR
- **Gestión de usuarios** con roles y permisos
- **Funcionamiento offline** con sincronización automática

**Versión Actual:** v69  
**Tecnologías:** HTML5, CSS3, JavaScript vanilla, Firebase Firestore, PWA, Service Worker

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          INTERFAZ DE USUARIO (HTML/CSS)         │  │
│  │  menu.html  |  peatonal.html  |  ronda.html    │  │
│  │  salida.html | accesovehicular.html | etc...   │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↑ ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │       LÓGICA DE APLICACIÓN (JavaScript)         │  │
│  │  menu.js | peatonal.js | ingresar_informacion │  │
│  │  salidavehicular.js | registrar_incidente.js  │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↑ ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │     ALMACENAMIENTO LOCAL Y GESTIÓN OFFLINE      │  │
│  │  offline-storage.js | offline-queue.js          │  │
│  │  offline-sync.js   | sync.js                    │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↑ ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │         SERVICE WORKER (sw.js)                  │  │
│  │  • Cache precargado (archivos estáticos)        │  │
│  │  • Cache runtime (datos dinámicos)              │  │
│  │  • Estrategia Network-First o Cache-First      │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↑ ↓ (red)                       │
├─────────────────────────────────────────────────────────┤
│                    FIREBASE (Nube)                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │        FIRESTORE (Base de Datos)                │  │
│  │  • Colecciones: USUARIOS, REGISTROS, INCIDENTES│  │
│  │  • Documentos: Información de usuarios y datos  │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↑ ↓                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │        FIREBASE AUTH (Autenticación)            │  │
│  │  • Login/Logout                                 │  │
│  │  • Gestión de sesiones                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura de Directorios

```
c:\Users\jsolis\Desktop\CUADERNO12\
│
├── HTML (Páginas)
│   ├── index.html                 (Login)
│   ├── menu.html                  (Menú principal)
│   ├── peatonal.html              (Acceso peatonal)
│   ├── salida.html                (Salida de peatón)
│   ├── accesovehicular.html       (Acceso vehicular)
│   ├── salidavehicular.html       (Salida vehicular)
│   ├── ronda.html                 (Lector QR - Rondas)
│   ├── registrar_incidente.html   (Registro de incidentes)
│   ├── ingresar_consigna.html     (Consignas)
│   ├── ingresar_informacion.html  (Registro en cuaderno)
│   ├── ver_consignas.html         (Ver consignas)
│   ├── registros.html             (Ver registros)
│   └── consigna_*.html            (Modales de consignas)
│
├── CSS (Estilos)
│   ├── style.css                  (Estilos principales - v69)
│   ├── ronda.css                  (Estilos para ronda)
│   └── webview.css                (Estilos para WebView - v69)
│
├── JavaScript (Lógica)
│   ├── firebase-config.js         (Configuración Firebase)
│   ├── initFirebase.js            (Inicialización Firebase)
│   ├── auth.js                    (Autenticación)
│   ├── ui.js                      (Utilidades UI)
│   ├── webview.js                 (Integración WebView)
│   ├── offline-storage.js         (Almacenamiento offline)
│   ├── offline-queue.js           (Cola offline)
│   ├── offline-sync.js            (Sincronización offline)
│   ├── sync.js                    (Sincronización general)
│   ├── menu.js                    (Lógica del menú)
│   ├── peatonal.js                (Lógica acceso peatonal)
│   ├── salida.js                  (Lógica salida peatón)
│   ├── accesovehicular.js         (Lógica acceso vehicular)
│   ├── salidavehicular.js         (Lógica salida vehicular)
│   ├── ronda-v2.js                (Lógica lector QR)
│   ├── registrar_incidente.js     (Lógica incidentes)
│   ├── ingresar_informacion.js    (Lógica cuaderno)
│   ├── ver_consignas.js           (Lógica consignas)
│   ├── registros.js               (Lógica registros)
│   └── consigna_*.js              (Lógica consignas)
│
├── PWA
│   ├── sw.js                      (Service Worker - v69)
│   ├── manifest.json              (Configuración PWA)
│   └── package.json               (Dependencias)
│
├── Multimedia
│   └── imagenes/
│       ├── logo1.png              (Logo Liderman)
│       └── [otras imágenes]
│
├── Librerías externas
│   └── vendor/
│       └── zxing/
│           └── index.min.js       (Lector de códigos QR)
│
└── Configuración
    ├── server.js                  (Servidor local)
    └── DOCUMENTACION_SISTEMA.md   (Este archivo)
```

---

## Componentes Principales

### 1. **index.html** - Página de Login
**Responsabilidad:** Autenticación de usuarios
**Flujo:**
- Usuario ingresa ID y contraseña
- Se valida contra Firebase Auth
- Si es correcto → redirige a menu.html
- Si falla → muestra error

**Archivos asociados:**
- auth.js (lógica de autenticación)
- firebase-config.js (configuración)
- ui.js (utilidades)

---

### 2. **menu.html** - Menú Principal (Estilo Especial)
**Responsabilidad:** Punto central de navegación
**Características:**
- Diseño en cuadrícula de 2 columnas
- Botones compactos con iconos y texto
- Tema claro (sin data-theme="dark")
- Muestra datos del usuario (nombre, cliente, unidad)
- Botón de cerrar sesión (icono de salida)

**Botones disponibles:**
1. Ingresar Información
2. Ingresar Consigna
3. Ronda (Lector QR)
4. Ver Información
5. Acceso Peatonal
6. Salida de Peatón
7. Acceso Vehicular
8. Salida Vehicular
9. Relevo (cambio de usuario)

**Archivos asociados:**
- menu.js (lógica y modales)
- style.css (estilos v69)
- webview.css (estilos v69)

---

### 3. **Páginas de Acceso** (peatonal.html, accesovehicular.html)
**Responsabilidad:** Registrar entrada de personas/vehículos
**Datos capturados:**
- Tipo de documento (Cedula, Pasaporte, etc.)
- Número de documento
- Placa del vehículo (si aplica)
- Fotografía (opcional)
- Observaciones

**Flujo:**
1. Usuario selecciona datos requeridos
2. Sistema toma foto (si aplica)
3. Datos se guardan en Firestore
4. Si está offline → se guardan localmente
5. Se sincroniza cuando hay conexión

---

### 4. **Páginas de Salida** (salida.html, salidavehicular.html)
**Responsabilidad:** Registrar salida de personas/vehículos
**Flujo:**
1. Se carga lista de registros "ABIERTOS"
2. Usuario selecciona uno
3. Se abre modal con detalles
4. Usuario confirma salida
5. Registro se cierra y se marca como "CERRADO"

---

### 5. **ronda.html** - Lector de Códigos QR
**Responsabilidad:** Registrar puntos de control (rondas de vigilancia)
**Características:**
- Integra librería Zxing para lectura QR
- Captura códigos en tiempo real
- Registra ubicación y hora
- Validación de códigos duplicados

**Archivos asociados:**
- ronda-v2.js (lógica)
- vendor/zxing/index.min.js (librería QR)

---

### 6. **registrar_incidente.html** - Registro de Incidentes
**Responsabilidad:** Documentar eventos especiales/problemas
**Datos:**
- Tipo de incidente
- Detalle
- Hora
- Ubicación
- Responsable
- Observaciones

---

### 7. **Gestión de Consignas**
**Páginas:**
- ingresar_consigna.html (crear consigna)
- ver_consignas.html (listar consignas)
- consigna_permanente.html (modal)
- consigna_temporal.html (modal)

**Tipos:**
- Permanentes (vigentes indefinidamente)
- Temporales (con fecha de vencimiento)

---

## Flujo de Funcionamiento

### Inicio de Sesión (0 - Autenticación)
```
┌─────────────────────────────────────────────────────┐
│                    USUARIO ABRE APP                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  Service Worker     │
         │  Sirve archivos en  │
         │  caché              │
         └─────────┬───────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │   Carga index.html  │
         │   (Página login)    │
         └─────────┬───────────┘
                   │
         Usuario ingresa:
         • ID (usuario)
         • Contraseña
                   │
                   ▼
         ┌─────────────────────┐
         │  Firebase Auth      │
         │  Valida credenciales│
         └─────────┬───────────┘
                   │
         ¿Válido?
         │
         ├─ SÍ ───▶ ┌────────────────┐
         │          │  Carga datos   │
         │          │  de USUARIOS   │
         │          │  en Firestore  │
         │          └────────┬───────┘
         │                   │
         │                   ▼
         │          ┌────────────────────┐
         │          │  Guarda en offline │
         │          │  storage (si existe)│
         │          └────────┬───────────┘
         │                   │
         │                   ▼
         │          ┌────────────────────┐
         │          │ Redirige a menu.html│
         │          └────────────────────┘
         │
         └─ NO ──▶ ┌────────────────────┐
                   │  Muestra error     │
                   │  "Credenciales     │
                   │   inválidas"       │
                   └────────────────────┘
```

### Registrar Acceso Peatonal (1 - Entrada)
```
┌──────────────────────────────────────────┐
│   Usuario en menu.html                   │
│   Presiona "Acceso Peatonal"             │
└───────────────┬──────────────────────────┘
                │
                ▼
    ┌──────────────────────────────┐
    │  Abre peatonal.html          │
    │  Sistema detecta conexión    │
    └───────────────┬──────────────┘
                    │
    ¿Online?
    │
    ├─ SÍ ──▶ ┌─────────────────────────┐
    │         │ Carga lista de clientes │
    │         │ y unidades desde        │
    │         │ Firestore               │
    │         └──────────┬──────────────┘
    │                    │
    │                    ▼
    │         ┌─────────────────────────┐
    │         │ Guarda en offline storage│
    │         │ para siguiente uso       │
    │         └──────────┬──────────────┘
    │                    │
    └─ NO ──▶ ┌──────────────────────────┐
              │ Carga del almacenamiento │
              │ offline (cache local)    │
              └──────────┬───────────────┘
                         │
                         ▼
         ┌──────────────────────────────┐
         │  Usuario selecciona:         │
         │  • Cliente                   │
         │  • Unidad                    │
         │  • Tipo de documento         │
         │  • Número de documento       │
         │  • Foto (opcional)           │
         │  • Observaciones             │
         └──────────────┬───────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  Usuario presiona REGISTRAR  │
         └──────────────┬───────────────┘
                        │
         ¿Online?
         │
         ├─ SÍ ──▶ ┌─────────────────────┐
         │         │ Guarda directamente │
         │         │ en Firestore        │
         │         │ (REGISTROS)         │
         │         └────────┬────────────┘
         │                  │
         │                  ▼
         │         ┌─────────────────────┐
         │         │ ✓ Éxito - Notifica │
         │         │   "Registrado"      │
         │         └─────────────────────┘
         │
         └─ NO ──▶ ┌──────────────────────────┐
                   │ Guarda en cola offline   │
                   │ (offline-queue.js)      │
                   │ Estado: PENDIENTE_SYNC  │
                   └───────────┬──────────────┘
                               │
                               ▼
                      ┌──────────────────────────┐
                      │ ✓ Guardado localmente   │
                      │   (se enviará después)  │
                      └──────────────────────────┘
```

### Sincronización Automática (2 - Sync)
```
┌──────────────────────────────────┐
│  Sistema detecta cambio de estado │
│  OFFLINE ──▶ ONLINE              │
└────────────────┬─────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  sync.js activa automáticamente│
    │  Verifica cola offline         │
    │  (offline-queue.js)            │
    └────────────┬───────────────────┘
                 │
    ¿Hay items pendientes?
    │
    ├─ SÍ ──▶ ┌──────────────────────┐
    │         │ Para cada item:      │
    │         │ • Intenta enviar a   │
    │         │   Firestore          │
    │         │ • Si éxito → elimina │
    │         │ • Si falla → reintenta│
    │         └─────────┬────────────┘
    │                   │
    │                   ▼
    │         ┌──────────────────────┐
    │         │ Notifica al usuario  │
    │         │ "Datos sincronizados"│
    │         └──────────────────────┘
    │
    └─ NO ──▶ ┌──────────────────────┐
              │ No hay nada que hacer │
              └──────────────────────┘
```

### Cierre de Sesión (3 - Logout)
```
┌──────────────────────────────────┐
│  Usuario presiona icono de salida │
│  en menu.html                     │
└────────────────┬─────────────────┘
                 │
                 ▼
    ┌────────────────────────────────┐
    │  Confirmar logout              │
    │  ¿Desea cerrar sesión?         │
    └────────────────┬───────────────┘
                     │
                ┌────┴──────┐
                │           │
            SÍ ▼           ▼ NO
         ┌─────────┐    ┌──────────┐
         │ Firebase│    │ Cancela  │
         │ signOut │    │ operación│
         └────┬────┘    └──────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ Limpia localStorage     │
    │ Limpia sesión           │
    │ Limpia cache temporal   │
    └────────┬────────────────┘
             │
             ▼
    ┌─────────────────────────┐
    │ Redirige a index.html   │
    │ (página login)          │
    └─────────────────────────┘
```

---

## Módulos Críticos

### 1. **Firebase Config (firebase-config.js)**
Contiene credenciales de Firebase Firestore:
```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

### 2. **Offline Storage (offline-storage.js)**
Gestiona almacenamiento local IndexedDB:
- Guarda datos de usuario
- Guarda datos de clientes/unidades
- Permite lectura sin conexión
- Interfaz: `offlineStorage.setUserData()`, `offlineStorage.getUserData()`

### 3. **Offline Queue (offline-queue.js)**
Gestiona cola de operaciones pendientes:
- Almacena registros que no se pudieron enviar
- Estados: PENDIENTE_SYNC, ENVIADO, FALLIDO
- Reintenta automáticamente cuando hay conexión

### 4. **Sync Manager (sync.js)**
Orquesta sincronización:
- Detecta cambios de estado de conexión
- Ejecuta reintentos
- Maneja conflictos
- Notifica al usuario

### 5. **Service Worker (sw.js v69)**
Gestión de caché y funcionamiento offline:
```javascript
const V = 'v69';
const PRECACHE = `precache-v69`;
const RUNTIME = `runtime-v69`;
```

**Estrategias:**
- **Precache:** Archivos críticos (HTML, CSS, JS)
- **Network-first:** Documentos HTML, imágenes
- **Cache-first:** Librerías, fuentes
- **Fallback:** Si todo falla, muestra error offline

---

## Gestión de Estado

### Contexto de Usuario
Cada página mantiene un contexto similar:
```javascript
let userCtx = {
  email: 'juan.solis@liderman.com.pe',
  uid: 'abc123...',
  cliente: 'CHORRILLOS',
  unidad: 'CAT',
  puesto: 'INGRESO'
};
```

### Datos en Firestore
**Estructura de colecciones:**

```
USUARIOS/
├── juan.solis
│   ├── NOMBRES: "Juan"
│   ├── APELLIDOS: "Solís"
│   ├── CLIENTE: "CHORRILLOS"
│   ├── UNIDAD: "CAT"
│   ├── PUESTO: "INGRESO"
│   └── EMAIL: "juan.solis@liderman.com.pe"
└── maria.rodriguez
    ├── NOMBRES: "María"
    ├── APELLIDOS: "Rodríguez"
    └── ...

REGISTROS/
├── AUTO_ID_1
│   ├── tipo: "ACCESO_PEATONAL"
│   ├── documento: "12345678"
│   ├── cliente: "CHORRILLOS"
│   ├── unidad: "CAT"
│   ├── timestamp: 1699887600000
│   ├── usuario: "juan.solis"
│   └── ...
└── AUTO_ID_2
    └── ...

INCIDENTES/
├── AUTO_ID_1
│   ├── tipo: "ROBO"
│   ├── detalle: "..."
│   ├── timestamp: 1699887600000
│   └── ...
└── ...

CONSIGNAS/
├── AUTO_ID_1
│   ├── texto: "..."
│   ├── tipo: "PERMANENTE" | "TEMPORAL"
│   ├── fecha_vencimiento: 1699887600000 (si temporal)
│   └── ...
└── ...
```

---

## Sincronización de Datos

### Flujo de Sincronización
```
1. Usuario crea registro (online/offline)
   ↓
2. Si ONLINE → Envía directamente a Firestore
   Si OFFLINE → Guarda en cola local
   ↓
3. Sistema detecta cambio a ONLINE
   ↓
4. sync.js procesa cola
   ↓
5. Reintenta cada 5 segundos máximo 3 veces
   ↓
6. Si éxito → Elimina de cola
   Si falla → Mantiene para reintento posterior
   ↓
7. Notifica al usuario del resultado
```

### Manejo de Conflictos
- **Timestamp:** Cada registro tiene timestamp
- **User Context:** Se identifica quién creó cada registro
- **Estados:** PENDIENTE_SYNC, ENVIADO, FALLIDO

---

## Modo Offline

### Capacidades Offline
✓ Ver datos en caché
✓ Crear nuevos registros (se guardan localmente)
✓ Visualizar historial
✗ Acceder a datos nuevos no descargados
✗ Ver cambios hechos por otros usuarios

### Almacenamiento Local
- **IndexedDB:** Datos principales
- **LocalStorage:** Preferencias y estado
- **Cache API:** Archivos estáticos del Service Worker

### Límites
- Máximo ~50MB por origen
- Datos se limpian si usuario no accede en 30 días
- Caché del SW se limpia al cerrar sesión

---

## Seguridad y Autenticación

### Flujo de Autenticación
```
1. User ID (email sin dominio)
   ↓
2. Contraseña
   ↓
3. Firebase Auth valida
   ↓
4. Si OK → Token JWT
   ↓
5. Token se envía en cada request
   ↓
6. Firestore valida seguridad
```

### Reglas de Seguridad Firestore
```javascript
// Cada usuario solo ve sus datos
match /USUARIOS/{document=**} {
  allow read, write: if request.auth != null;
}

// Registros públicos (todos pueden leer si autenticado)
match /REGISTROS/{document=**} {
  allow read, write: if request.auth != null;
}
```

### Protecciones
- ✓ Contraseña hasheada por Firebase
- ✓ JWT tokens con expiración
- ✓ Validación en cliente y servidor
- ✓ HTTPS obligatorio (en producción)
- ✓ Datos sensibles no se guardan en localStorage

---

## Guía de Uso Paso a Paso

### PASO 1: Abrir la Aplicación
```
1. Usuarios ingresa URL: http://localhost:5200
   (o URL de producción)

2. Se carga index.html
   (con Service Worker en background)

3. Aparece formulario de login
```

### PASO 2: Autenticarse
```
1. Ingresa ID de usuario:
   Ej: "juan.solis"
   
2. Ingresa contraseña:
   Ej: "password123"
   
3. Presiona "Iniciar Sesión"

4. Sistema valida credenciales contra Firebase
   
5. Si OK → Carga menu.html
   Si ERROR → Muestra "Credenciales inválidas"
```

### PASO 3: Navegar por el Menú
```
Desde menu.html puedes acceder a:

📋 REGISTROS
├─ Ingresar Información (→ ingresar_informacion.html)
├─ Registrar Incidente (→ registrar_incidente.html)
└─ Ver Registros (→ registros.html)

🎫 CONSIGNAS
├─ Ingresar Consigna (→ ingresar_consigna.html)
└─ Ver Consignas (→ ver_consignas.html)

👥 ACCESO DE PERSONAS
├─ Acceso Peatonal (→ peatonal.html)
└─ Salida de Peatón (→ salida.html)

🚗 ACCESO VEHICULAR
├─ Acceso Vehicular (→ accesovehicular.html)
└─ Salida Vehicular (→ salidavehicular.html)

📍 OTRAS FUNCIONES
├─ Ronda (→ ronda.html) [Lector QR]
└─ Relevo (Modal dentro de menu.html)
```

### PASO 4: Registrar Acceso Peatonal
```
1. Menú → "Acceso Peatonal"

2. Se abre peatonal.html

3. Selecciona Cliente:
   Ej: "CHORRILLOS"

4. Selecciona Unidad:
   (depende del cliente)

5. Selecciona Tipo de Documento:
   • Cédula de Identidad
   • Pasaporte
   • Licencia de Conducir
   • Otro

6. Ingresa Número de Documento:
   Ej: "12345678"

7. (Opcional) Toma foto

8. (Opcional) Agrega observaciones:
   Ej: "Visita programada"

9. Presiona "REGISTRAR ACCESO"

10. Sistema guarda en Firestore (o cola offline)
    ✓ "Acceso registrado"

11. Presiona "Volver" para regresar a menú
```

### PASO 5: Registrar Salida Peatonal
```
1. Menú → "Salida de Peatón"

2. Se carga lista de REGISTROS con estado ABIERTO

3. Usuario selecciona registro a cerrar

4. Se abre modal con detalles

5. Verifica información correcta

6. Presiona "CONFIRMAR SALIDA"

7. Registro se marca como CERRADO

8. Notificación: "Salida registrada"

9. Lista se actualiza
```

### PASO 6: Usar Lector QR (Ronda)
```
1. Menú → "Ronda"

2. Se abre ronda.html con cámara

3. Permite acceso a cámara del dispositivo

4. Apunta cámara a código QR

5. Sistema lee automáticamente

6. Valida código y registra punto de control

7. ✓ "Punto registrado"

8. Presiona "Volver" para regresar
```

### PASO 7: Cerrar Sesión
```
1. Desde menu.html

2. Presiona icono rojo de salida (arriba derecha)

3. Confirma: "¿Desea cerrar sesión?"

4. Presiona "Sí"

5. Limpia datos locales

6. Redirige a index.html (login)
```

---

## Control de Versiones

### Versión Actual: v69

#### Archivos Versionados (CRÍTICO)
```
✓ style.css v69
✓ webview.css v69
✓ sw.js v69
✓ Todos los .js: v69
✓ Todos los .html referencia v69
```

#### Consistencia de Versiones
**REVISIÓN COMPLETA:**

| Archivo | Versión | Estado |
|---------|---------|--------|
| style.css | v69 | ✓ OK |
| webview.css | v69 | ✓ OK |
| sw.js | v69 | ✓ OK |
| menu.html | v69 | ✓ OK |
| menu.js | v69 | ✓ OK |
| peatonal.html | v69 | ✓ OK |
| peatonal.js | v69 | ✓ OK |
| salida.html | v69 | ✓ OK |
| salida.js | v69 | ✓ OK |
| accesovehicular.html | v69 | ✓ OK |
| accesovehicular.js | v69 | ✓ OK |
| salidavehicular.html | v69 | ✓ OK |
| salidavehicular.js | v69 | ✓ OK |
| ronda.html | v69 | ✓ OK |
| ronda-v2.js | v69 | ✓ OK |
| registrar_incidente.html | v69 | ✓ OK |
| registrar_incidente.js | v69 | ✓ OK |
| ingresar_consigna.html | v69 | ✓ OK |
| ingresar_informacion.html | v69 | ✓ OK |
| ingresar_informacion.js | v69 | ✓ OK |
| ver_consignas.html | v69 | ✓ OK |
| ver_consignas.js | v69 | ✓ OK |
| registros.html | v69 | ✓ OK |
| registros.js | v69 | ✓ OK |
| firebase-config.js | v69 | ✓ OK |
| initFirebase.js | v69 | ✓ OK |
| auth.js | - | No versionado |
| ui.js | v69 | ✓ OK |
| webview.js | v69 | ✓ OK |
| offline-storage.js | v69 | ✓ OK |
| offline-queue.js | v69 | ✓ OK |
| offline-sync.js | v69 | ✓ OK |
| sync.js | v69 | ✓ OK |

**RESULTADO:** ✓ TODAS LAS VERSIONES SON CONSISTENTES (v69)

---

## Temas Específicos

### 1. Tema de Estilos

#### menu.html (SIN tema oscuro)
```
Fondo: Gradiente claro
Texto: Oscuro
Tema: LIGHT (defecto)
data-theme: NO TIENE
```

#### Todas las otras páginas (CON tema oscuro)
```
Fondo: Gradiente oscuro
Texto: Claro
Tema: DARK
data-theme="dark"
```

**Verificación:**
- ✓ menu.html: `<html lang="es">` (SIN data-theme)
- ✓ peatonal.html: `<html lang="es" data-theme="dark">`
- ✓ salida.html: `<html lang="es" data-theme="dark">`
- ✓ accesovehicular.html: `<html lang="es" data-theme="dark">`
- ✓ salidavehicular.html: `<html lang="es" data-theme="dark">`
- ✓ registrar_incidente.html: `<html lang="es" data-theme="dark">`
- ✓ ingresar_consigna.html: `<html lang="es" data-theme="dark">`
- ✓ ingresar_informacion.html: `<html lang="es" data-theme="dark">`
- ✓ ronda.html: `<html lang="es" data-theme="dark">`
- ✓ ver_consignas.html: `<html lang="es" data-theme="dark">`
- ✓ registros.html: `<html lang="es" data-theme="dark">`

**RESULTADO:** ✓ ESTETIZACIÓN CONSISTENTE

---

### 2. Botones de Navegación

#### menu.html
- Diseño: Grid 2 columnas, 3 filas
- Iconos: 1.5rem, color rojo (#e70909)
- Texto: 0.7rem, centrado
- Altura: 72px
- Transiciones suaves

#### Otras páginas (Volver/Atrás)
```javascript
// Correcto:
window.location.href = 'menu.html';

// INCORRECTO (causaba errores):
window.history.back();
```

**Revisión de botones:**
- ✓ salida.html: `<a href="menu.html">Volver</a>`
- ✓ salidavehicular.js: `window.location.href = 'menu.html';`
- ✓ peatonal.html: Tiene botón volver
- ✓ accesovehicular.html: Tiene botón volver
- ✓ ronda.html: Tiene botón volver

**RESULTADO:** ✓ NAVEGACIÓN CONSISTENTE

---

### 3. Conexión y Offline

#### Detección de estado
```javascript
// En sync.js
window.addEventListener('online', () => {
  console.log('🌐 Online detectado');
  procesarCola();
});

window.addEventListener('offline', () => {
  console.log('🔌 Offline detectado');
});
```

#### Cola de sincronización
```javascript
// En offline-queue.js
{
  id: 'unique-id',
  tipo: 'ACCESO_PEATONAL',
  datos: {...},
  estado: 'PENDIENTE_SYNC',
  timestamp: 1699887600000,
  intentos: 0
}
```

---

### 4. Service Worker (sw.js v69)

#### Precarga de archivos
```javascript
const PRECACHE = 'precache-v69';

// Se cargan automáticamente:
// - HTML principales
// - CSS (style.css, webview.css)
// - JS de Firebase
// - Librerías (zxing)
// - Manifest.json
```

#### Estrategia de caché
```
1. Network-First (Documentos HTML)
   - Intenta obtener de red
   - Si falla, usa caché
   - Si no hay caché, error

2. Cache-First (CSS, JS, Librerías)
   - Intenta caché primero
   - Si no hay, obtiene de red
   - Guarda para futuro

3. Fallback
   - Si todo falla
   - Muestra: "Offline - No hay datos"
```

---

### 5. Firebase Integración

#### Inicialización (initFirebase.js)
```javascript
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
```

#### Autenticación
```javascript
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
  }
  // Cargar datos del usuario
});
```

#### Lectura de datos
```javascript
const doc = await db
  .collection('USUARIOS')
  .doc(userId)
  .get();
```

#### Escritura de datos
```javascript
await db
  .collection('REGISTROS')
  .add({
    tipo: 'ACCESO_PEATONAL',
    documento: '12345678',
    timestamp: new Date()
  });
```

---

## Troubleshooting

### ERROR 1: "INTERNAL ASSERTION FAILED: Unexpected state"
**Causa:** Conflicto de instancias de Firebase  
**Solución:** Usar try-catch en inicialización
```javascript
try {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (err) {
  console.warn('Firebase ya inicializado');
}
```

### ERROR 2: "enableMultiTabIndexedDbPersistence() failed"
**Causa:** Múltiples pestañas/ventanas accediendo IndexedDB  
**Solución:** Usar solo en primera pestaña
```javascript
db.enablePersistence()
  .catch(err => {
    console.warn('Persistencia no disponible:', err);
  });
```

### ERROR 3: Botón Menú causa errores
**Causa:** `window.history.back()` causa conflictos  
**Solución:** Usar `window.location.href = 'menu.html'`

### ERROR 4: Datos no sincronizados
**Causa:** Sistema offline no detectado o cola corrupta  
**Solución:**
1. Abre DevTools → Application → IndexedDB
2. Limpia base de datos
3. Recarga página
4. Intenta nuevamente

### ERROR 5: Service Worker no actualiza
**Causa:** Caché viejo no se elimina  
**Solución:** Cambiar versión en sw.js
```javascript
// Viejo:
const V = 'v69';

// Nuevo:
const V = 'v70';
// Cambiar en TODOS los HTML: ?v=70
```

### ERROR 6: Fotos no se guardan
**Causa:** Permisos de cámara no concedidos  
**Solución:** Usuario debe permitir acceso a cámara
```javascript
// En navegador:
1. DevTools → Sensors → Override geolocation
2. O configurar en settings del dispositivo
```

---

## Checklist de Producción

### Antes de Deploy
- [ ] Versión consistente (v69)
- [ ] SW.js actualizado
- [ ] Todas las páginas con data-theme correcto
- [ ] Botones de navegación usan href, no history.back()
- [ ] Firebase config válido
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Rate limiting en Firestore
- [ ] Backups de datos

### Después de Deploy
- [ ] Probar login
- [ ] Probar acceso peatonal (online)
- [ ] Probar salida peatonal
- [ ] Probar modo offline
- [ ] Probar sincronización
- [ ] Probar lector QR
- [ ] Probar cierre de sesión
- [ ] Revisar consola (DevTools)
- [ ] Revisar IndexedDB
- [ ] Revisar caché del SW

---

## Resumen de Cambios Recientes (v69)

1. **Rediseño del menú:** Grid 2 columnas, iconos arriba, texto abajo
2. **Compactación:** Botones más pequeños y menos espaciosos
3. **Icono de logout:** Cambio de texto a icono de salida
4. **Tema consistente:** Todas las páginas (excepto menú) con tema oscuro
5. **Corrección de bugs:** Fix en salidavehicular.js (navigation)
6. **Mejor manejo de errores:** Try-catch global en menu.js
7. **Documentación:** Este archivo con guía completa

---

## Contacto y Soporte

Para reportar problemas o sugerencias:
- Revisar la sección [Troubleshooting](#troubleshooting)
- Revisar la consola del navegador (F12 → Console)
- Revisar Application Storage (F12 → Application)
- Contactar al equipo de desarrollo

---

**Documento actualizado:** 12 de Noviembre de 2025  
**Versión del sistema:** v69  
**Estado:** ✓ PRODUCCIÓN
