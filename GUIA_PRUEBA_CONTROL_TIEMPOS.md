# 🧪 Guía de Prueba - Control de Tiempos v75

## Cómo Probar que el Control de Tiempos Funciona

### Paso 1: Abrir la Consola del Navegador

1. Abre **Firefox Developer Tools** (F12)
2. Ve a la pestaña **Console**
3. **Limpia la consola** (Ctrl+Shift+K)

---

### Paso 2: LOGIN - Prueba Iniciar Sesión

**Qué deberías ver en la consola:**

```
[auth] Login exitoso, iniciando control de tiempo...
[control-tiempos] ⏳ Iniciando control para jsolis... Razón: LOGIN
[control-tiempos] DB disponible: true
[control-tiempos] Datos usuario obtenidos: {usuarioID: 'jsolis', nombreUsuario: 'JUAN SOLIS', ...}
[control-tiempos] 💾 Guardando registro en Firestore...
[control-tiempos] ✅ Control iniciado exitosamente: abc123def456xyz
```

**Si ves estos mensajes ✅:**
- La función se ejecutó
- Se conectó a Firestore (DB: true)
- Se guardó el documento

**Si ves un error ❌:**
- Busca líneas con `❌ Error` o `Stack:`
- Anota el error completo

---

### Paso 3: Verificar en Firestore

1. Abre **Firebase Console** → `https://console.firebase.google.com`
2. Ve a tu proyecto → **Firestore Database**
3. Busca la colección **`CONTROL_TIEMPOS_USUARIOS`**
4. Deberías ver un documento con:
   ```
   usuarioID: "jsolis"
   nombreUsuario: "JUAN SOLIS"
   estado: "ACTIVO"
   fechaHoraInicio: <timestamp actual>
   fechaHoraCierre: null
   duracionSegundos: null
   razonInicio: "LOGIN"
   ```

---

### Paso 4: LOGOUT - Prueba Cerrar Sesión

1. En Firefox DevTools, **limpia la consola nuevamente**
2. Haz clic en el botón **logout** (X rojo)

**Qué deberías ver en la consola:**

```
[menu] 🔴 Iniciando logout...
[menu] 📝 Finalizando control de tiempo para jsolis
[control-tiempos] ⏳ Finalizando control... Razón: LOGOUT
[control-tiempos] 📝 ID de control activo: abc123def456xyz
[control-tiempos] ⏳ Finalizando control... Razón: LOGOUT
[control-tiempos] 📝 ID de control activo: abc123def456xyz
[control-tiempos] 💾 Actualizando registro en Firestore...
[control-tiempos] ✅ Control finalizado exitosamente
[menu] ✅ Control de tiempo finalizado
[menu] 🚪 Cerrando sesión de Firebase...
[menu] ✅ Sesión cerrada, redirigiendo a index.html
```

**Si ves estos mensajes ✅:**
- El control se finalizó
- Se actualizó en Firestore

---

### Paso 5: Verificar en Firestore (Logout)

1. Regresa a **Firestore Database**
2. Ve a colección **`CONTROL_TIEMPOS_USUARIOS`**
3. El documento debe estar actualizado:
   ```
   estado: "CERRADO"  ← CAMBIÓ de ACTIVO a CERRADO
   fechaHoraCierre: <timestamp actual>  ← AHORA tiene valor
   duracionSegundos: 3600  ← Ejemplo: 1 hora
   razonCierre: "LOGOUT"
   ```

---

### Paso 6: RELEVO - Prueba Cambio de Usuario

1. **Inicia sesión** (p.ej. con usuario `jsolis`)
2. Espera unos segundos
3. En el menú, ve a **Relevo**
4. Ingresa ID de otro usuario (p.ej. `mgarcia`) + contraseña
5. Completa el formulario y confirma relevo

**Qué deberías ver en la consola:**

```
[menu-relevo] 📝 Finalizando control de jsolis por RELEVO a mgarcia
[control-tiempos] ⏳ Finalizando control... Razón: RELEVO
[control-tiempos] Relevo por: MIGUEL GARCIA
[control-tiempos] 💾 Actualizando registro en Firestore...
[control-tiempos] ✅ Control finalizado exitosamente
[menu-relevo] ✅ Control del saliente finalizado
...
[menu-relevo] 📝 Iniciando control para nuevo usuario mgarcia por RELEVO_ENTRADA
[control-tiempos] ⏳ Iniciando control para mgarcia... Razón: RELEVO_ENTRADA
[control-tiempos] DB disponible: true
[control-tiempos] 💾 Guardando registro en Firestore...
[control-tiempos] ✅ Control iniciado exitosamente: xyz789abc123
[menu-relevo] ✅ Control del entrante iniciado
```

---

### Paso 7: Verificar en Firestore (Relevo)

En **`CONTROL_TIEMPOS_USUARIOS`** deberías ver **2 documentos**:

**Documento 1 (Usuario Saliente):**
```
usuarioID: "jsolis"
estado: "CERRADO"
razonCierre: "RELEVO"
relevoPor: "mgarcia"
nombreRelevoPor: "MIGUEL GARCIA"
fechaHoraCierre: <timestamp>
duracionSegundos: <X segundos>
```

**Documento 2 (Usuario Entrante):**
```
usuarioID: "mgarcia"
estado: "ACTIVO"
razonInicio: "RELEVO_ENTRADA"
fechaHoraInicio: <timestamp actual>
fechaHoraCierre: null
duracionSegundos: null
```

---

## 🔍 Checklist de Validación

### LOGIN
- [ ] Aparecen mensajes `[control-tiempos]` en consola
- [ ] Se creó documento en Firestore
- [ ] Documento tiene `estado: "ACTIVO"`
- [ ] Documento tiene `razonInicio: "LOGIN"`

### LOGOUT
- [ ] Se ven mensajes de finalización en consola
- [ ] Documento en Firestore cambió a `estado: "CERRADO"`
- [ ] Documento tiene `razonCierre: "LOGOUT"`
- [ ] Se calculó `duracionSegundos` (no es null)

### RELEVO
- [ ] Aparecen 2 conjuntos de mensajes (saliente + entrante)
- [ ] Documento saliente tiene `estado: "CERRADO"` y `razonCierre: "RELEVO"`
- [ ] Documento saliente tiene `relevoPor` y `nombreRelevoPor` relleno
- [ ] Se creó nuevo documento para usuario entrante
- [ ] Nuevo documento tiene `estado: "ACTIVO"` y `razonInicio: "RELEVO_ENTRADA"`

---

## ❌ Si Algo No Funciona

### Problema: No aparecen logs en consola
**Soluciones:**
1. Verifica que DevTools esté abierto ANTES de iniciar sesión
2. Limpia caché del navegador (Ctrl+Shift+Delete)
3. Recarga la página (Ctrl+F5)

### Problema: Logs aparecen pero no se crea documento en Firestore
**Posibles causas:**
1. **Permisos**: Verifica reglas de Firestore permiten crear docs en `CONTROL_TIEMPOS_USUARIOS`
2. **Red**: Verifica que el navegador tenga conexión a internet
3. **Firestore offline**: Si está en modo offline, esperará a conectarse

### Problema: "DB disponible: false"
**Causa:** Firebase no se inicializó correctamente
**Solución:** Verifica que `initFirebase.js` se cargue antes que `auth.js`

### Problema: "Error obteniendo datos usuario"
**Causa:** El usuario no existe en colección `USUARIOS`
**Solución:** Verifica que el usuario esté correctamente creado en Firebase

---

## 📊 Datos Esperados en Firestore

```javascript
{
  // Identificación
  usuarioID: String,              // ID del usuario (p.ej: "jsolis")
  nombreUsuario: String,          // Nombre completo (p.ej: "JUAN SOLIS")
  cliente: String,                // (p.ej: "EMPRESA XYZ")
  unidad: String,                 // (p.ej: "SEDE PRINCIPAL")
  puesto: String,                 // (p.ej: "SEGURIDAD")

  // Tiempos
  fechaHoraInicio: Timestamp,     // Cuándo comenzó
  fechaHoraCierre: Timestamp | null, // Cuándo terminó
  duracionSegundos: Number | null, // Segundos conectado

  // Estado
  estado: "ACTIVO" | "CERRADO",
  razonInicio: "LOGIN" | "RELEVO_ENTRADA",
  razonCierre: "LOGOUT" | "RELEVO" | null,

  // Relevo
  relevoPor: String | null,        // ID de quien lo releva
  nombreRelevoPor: String | null,  // Nombre de quien lo releva

  // Administrativo
  creadoEn: Timestamp,
  actualizadoEn: Timestamp | null
}
```

---

## 🎯 Próximos Pasos si Todo Funciona

Si todos los checklists están ✅:
1. ✅ Sistema está funcionando correctamente
2. Puedes crear reportes basados en esta data
3. Puedes hacer análisis de tiempo de conexión por usuario
4. Puedes hacer gráficos de actividad

---

**Última actualización:** 2025-11-12
**Versión:** v75
