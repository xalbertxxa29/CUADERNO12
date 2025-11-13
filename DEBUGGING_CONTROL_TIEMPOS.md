# 🔍 Protocolo de Debugging - Control de Tiempos v75

## Qué Hicimos

Actualicé `auth.js` para:
1. ✅ Guardar referencia global a `db` en `window.firestoreDb`
2. ✅ Usar esta referencia global en todas las funciones
3. ✅ Agregar logging DETALLADO de CADA PASO
4. ✅ Mostrar errores completos con código y mensaje

---

## 🧪 AHORA PRUEBA ESTO

### PASO 1: Abre Firefox DevTools
- Presiona **F12**
- Ve a la pestaña **Console**
- **Limpia todo** (icono de papelera o Ctrl+Shift+K)

### PASO 2: Abre la Aplicación NUEVA
- Recarga la página: **Ctrl+Shift+Delete** (limpia caché) 
- Luego **Ctrl+F5** (recarga forzada)

### PASO 3: Inicia Sesión
- Ingresa usuario y contraseña
- Presiona Enter

### PASO 4: En la Consola, Busca EXACTAMENTE ESTO

Deberías ver en este ORDEN:

```
[auth] Login exitoso, iniciando control de tiempo...
[control-tiempos] ⏳ Iniciando control para [tu-usuario]... Razón: LOGIN
[control-tiempos] DB disponible: true
[control-tiempos] Tipo DB: object
[control-tiempos] Datos usuario obtenidos: {usuarioID: '[...]', nombreUsuario: '[...]', ...}
[control-tiempos] 💾 Intentando guardar en Firestore...
[control-tiempos] Colección: CONTROL_TIEMPOS_USUARIOS
[control-tiempos] Datos: { ... JSON del registro ... }
[control-tiempos] ✅ ÉXITO: Control iniciado con ID: abc123xyz456
```

---

## ❌ SI VES UN ERROR

Si ves algo como esto en ROJO:

```
[control-tiempos] ❌ ERROR COMPLETO: ...
[control-tiempos] Código de error: ...
[control-tiempos] Mensaje: ...
[control-tiempos] Stack: ...
```

**COPIA EXACTAMENTE TODO ESO** y envíamelo.

Los errores más comunes serían:

### Error 1: `permission-denied`
**Significa:** Las reglas de Firestore están bloqueando la escritura
**Solución:** Necesitamos ajustar las reglas

### Error 2: `not-found`
**Significa:** El usuario no existe en colección `USUARIOS`
**Solución:** Asegúrate que el usuario esté creado

### Error 3: `unauthenticated`
**Significa:** El usuario no está autenticado
**Solución:** Verificar que el login fue exitoso

---

## ✅ SI VES ÉXITO

Si ves `✅ ÉXITO: Control iniciado con ID:` entonces:

1. **Ve a Firebase Console**
2. **Firestore Database** → **CONTROL_TIEMPOS_USUARIOS**
3. Deberías ver un documento con los datos

---

## 🧪 PASO 5: Prueba Logout

1. En la App, haz clic en el botón **Logout** (X rojo)
2. En DevTools Console, deberías ver:

```
[menu] 🔴 Iniciando logout...
[menu] 📝 Finalizando control de tiempo para [tu-usuario]
[control-tiempos] ⏳ Finalizando control... Razón: LOGOUT
[control-tiempos] 📝 ID de control activo: [el-id-anterior]
[control-tiempos] 📥 Obteniendo documento actual...
[control-tiempos] Duración calculada: [X] segundos
[control-tiempos] 💾 Actualizando registro en Firestore...
[control-tiempos] Datos a actualizar: { ... }
[control-tiempos] ✅ Control finalizado exitosamente
[menu] ✅ Control de tiempo finalizado
[menu] 🚪 Cerrando sesión de Firebase...
```

---

## 📋 Checklist

- [ ] Ves `DB disponible: true`
- [ ] Ves `Tipo DB: object`
- [ ] Ves `Datos usuario obtenidos:`
- [ ] Ves `✅ ÉXITO: Control iniciado con ID:`
- [ ] El documento aparece en Firestore
- [ ] Al logout, ves `✅ Control finalizado exitosamente`
- [ ] En Firestore el documento cambió a `estado: "CERRADO"`

---

## 📊 Si Todo Funciona

El documento en Firestore debería verse así:

**Después de LOGIN:**
```
usuarioID: "jsolis"
nombreUsuario: "JUAN SOLIS"
cliente: "EMPRESA"
estado: "ACTIVO"
razonInicio: "LOGIN"
fechaHoraInicio: Nov 12, 2025, 9:29:30 PM
fechaHoraCierre: (vacío)
duracionSegundos: (vacío)
```

**Después de LOGOUT:**
```
estado: "CERRADO"  ← CAMBIÓ
razonCierre: "LOGOUT"
fechaHoraCierre: Nov 12, 2025, 9:35:15 PM  ← AHORA TIENE VALOR
duracionSegundos: 345  ← TIEMPO EN SEGUNDOS
```

---

## 🚀 Próximo Paso

Haz el test ahora y envíame:

1. Una captura de la consola con los logs
2. Una captura de Firestore mostrando el documento
3. Si hay error, copia el error completo

**Así podré ver exactamente qué está pasando.**
