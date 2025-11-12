# GUÍA RÁPIDA DE USO - CUADERNO12 v69

## 🚀 Inicio Rápido (5 minutos)

### 1. Abrir la App
```
1. Navega a: http://localhost:5200
2. O ingresa URL de producción
3. Espera 2-3 segundos a que cargue
```

### 2. Login
```
ID: juan.solis
Contraseña: ••••••••
Presiona: Iniciar Sesión
```

### 3. Eres Bienvenido al Menú
```
Verás 9 botones en 2 columnas con iconos rojos
```

---

## 📚 Funciones Principales

### REGISTROS (Cuaderno)

#### Acceso Peatonal
```
Menú → "Acceso Peatonal"
↓
1. Selecciona Cliente (ej: CHORRILLOS)
2. Selecciona Unidad (ej: CAT)
3. Tipo de documento (Cédula, Pasaporte, etc)
4. Número de documento (ej: 12345678)
5. (Opcional) Foto
6. (Opcional) Observaciones
7. Presiona: REGISTRAR ACCESO
8. ✓ Listo

Vuelve con botón "Volver"
```

#### Salida de Peatón
```
Menú → "Salida de Peatón"
↓
1. Lista de registros ABIERTOS
2. Selecciona uno
3. Se abre modal con detalles
4. Verifica datos
5. Presiona: CONFIRMAR SALIDA
6. ✓ Registro cerrado

Vuelve con botón "Volver"
```

#### Acceso Vehicular
```
Similar a acceso peatonal, pero:
- Requiere PLACA del vehículo
- Requiere CHOFER
- Requiere DESTINO
```

#### Salida Vehicular
```
Similar a salida peatonal
- Lista de accesos vehiculares ABIERTOS
- Cierra el registro
```

---

### INCIDENTES

#### Registrar Incidente
```
Menú → "Ingresar Información" → "Registro de Incidente"
↓
1. Tipo de incidente (ROBO, DAÑO, etc)
2. Detalle del incidente
3. (Opcional) Ubicación
4. (Opcional) Foto
5. Observaciones
6. Presiona: GUARDAR
7. ✓ Incidente registrado
```

#### Ver Registros
```
Menú → "Ver Información" → "Ver Registros"
↓
Muestra lista de:
- Accesos peatonales
- Salidas peatonales
- Accesos vehiculares
- Salidas vehiculares
- Incidentes
```

---

### CONSIGNAS (Avisos)

#### Crear Consigna
```
Menú → "Ingresar Consigna"
↓
1. Tipo: PERMANENTE o TEMPORAL
2. Texto de la consigna
3. Si es TEMPORAL → fecha vencimiento
4. Presiona: GUARDAR
5. ✓ Consigna creada
```

#### Ver Consignas
```
Menú → "Ver Información" → "Ver Consignas"
↓
Lista todas las consignas activas
(PERMANENTES + TEMPORALES vigentes)
```

---

### LECTOR QR

#### Usar Lector
```
Menú → "Ronda"
↓
1. Permite acceso a cámara
2. Apunta a código QR
3. Sistema lee automáticamente
4. ✓ Punto registrado
5. Presiona: Volver
```

---

### CUADERNO (Registro en Libro)

#### Ingresar en Cuaderno
```
Menú → "Ingresar Información" → "Registro en el Cuaderno"
↓
Formulario libre para escribir:
- Fecha/Hora (automática)
- Descripción
- Observaciones
- Responsable (auto-llena)
```

---

### RELEVO (Cambio de Turno)

#### Cambiar Usuario
```
Menú → "Relevo"
↓
1. ID del nuevo usuario
2. Contraseña del nuevo usuario
3. Comentario de relevo
4. Firma de conformidad
5. Presiona: GUARDAR
6. ✓ Cambio de usuario
```

**Nota:** NO pierdes tu sesión actual durante relevo

---

## 🔧 Modo Offline

### Automático
```
Sin conexión = Sistema guarda localmente
Con conexión = Sistema sincroniza automáticamente
```

### Manual
```
Si datos no sincronizan:
1. Abre DevTools (F12)
2. Ve a Application
3. Limpia IndexedDB
4. Recarga página
5. Intenta nuevamente
```

---

## ⚙️ Configuración

### Cambiar Tema (si aplica)
```
MENÚ = Tema claro (blanco)
OTRAS = Tema oscuro (negro)

Esto es intencional ✓
```

### Preferencias
```
DevTools → Application → LocalStorage
Donde se guardan tus preferencias
```

---

## ❌ Solucionar Problemas

### "Credenciales inválidas"
```
✓ Verifica ID correcto
✓ Verifica contraseña
✓ Mayúsculas/minúsculas importan
✓ Sin espacios al inicio/final
```

### "Sin conexión a internet"
```
✓ App sigue funcionando
✓ Crea registros localmente
✓ Sincroniza cuando hay conexión
✓ No pierdas datos
```

### "Datos no sincronizados"
```
✓ Espera 30 segundos
✓ Verifica conexión
✓ Limpia caché (F12 → Cache Storage)
✓ Recarga página
```

### "Foto no se guarda"
```
✓ Permite acceso a cámara
✓ Cámara encendida
✓ Luz suficiente
✓ Intenta nuevamente
```

### "Botón no responde"
```
✓ Espera 2 segundos
✓ Revisa consola (F12 → Console)
✓ Recarga página
✓ Limpia caché
```

---

## 🎨 Interfaz

### Menú Principal (menu.html)
```
┌─────────────────────────────┐
│        LOGO LIDERMAN        │
│                             │
│         Bienvenido          │
│       Juan Solís            │
│   CHORRILLOS - CAT - INGRESO│
├─────────────────────────────┤
│  📄    │    📢              │
│Ingresar│ Ingresar          │
│Informac│ Consigna          │
├─────────────────────────────┤
│  📊    │   👁️              │
│Ronda   │ Ver               │
│        │ Información       │
├─────────────────────────────┤
│  👤    │    🚪             │
│Acceso  │ Salida            │
│Peatonal│ de Peatón         │
├─────────────────────────────┤
│  🚗    │    🚗             │
│Acceso  │ Salida            │
│Vehicul │ Vehicular         │
├─────────────────────────────┤
│  🔄    │                   │
│Relevo  │                   │
├─────────────────────────────┤
│                    🚪       │
│           (logout)          │
└─────────────────────────────┘
```

---

## ⏱️ Tiempos Típicos

| Acción | Tiempo |
|--------|--------|
| Carga inicial | 2-3s |
| Acceso peatonal | 10-15s |
| Registrar salida | 5-10s |
| Sincronización | <5s |
| Leer QR | 1-2s |

---

## 📱 En el Teléfono

### Instalar como App
```
1. Navegador Chrome
2. Ir a: http://localhost:5200
3. Menú (3 puntos) → "Instalar app"
4. Confirma
5. ✓ App en pantalla de inicio
```

### Usar Offline
```
1. Abre app instalada
2. Sin conexión = funciona con caché
3. Crea registros localmente
4. Conecta luego
5. Sincroniza automáticamente
```

---

## 🔐 Seguridad

### Protege tu dispositivo
```
✓ No compartas contraseña
✓ Logout al terminar
✓ No guardes datos sensibles en notas
✓ Usa WiFi seguro
```

### Datos en Firestore
```
✓ Encriptados en tránsito (HTTPS)
✓ Validados en servidor
✓ Backup automático
✓ Solo acceso autenticado
```

---

## 📞 Ayuda

### Dentro de la App
```
F12 → Console
Ver mensajes y errores
Reporta al equipo si hay rojo (🔴)
```

### Contacto
```
Problema urgente:
1. Documenta el error
2. Captura pantalla
3. Reporta al líder
4. Incluye DevTools console
```

---

## ✅ Checklist Diario

- [ ] Inicia sesión correctamente
- [ ] Puede acceder a todas las páginas
- [ ] Registra acceso peatonal
- [ ] Registra salida
- [ ] Lee códigos QR
- [ ] Cierra sesión
- [ ] Sin errores en consola

---

## 🎓 Próximos Pasos

1. Practicar cada función 2-3 veces
2. Crear registros reales
3. Usar modo offline (desconecta WiFi)
4. Ver sincronización funcionar
5. Reportar cualquier problema

---

**Versión:** v69  
**Última actualización:** 12 de Noviembre de 2025  
**Estado:** ✅ PRODUCCIÓN
