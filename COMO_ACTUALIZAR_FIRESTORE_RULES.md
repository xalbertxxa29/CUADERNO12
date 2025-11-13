# 🔐 Actualizar Reglas de Firestore - PASO A PASO

## ⚠️ IMPORTANTE: Esto es lo que falta para que funcione

Las reglas de Firestore que tienes ahora **NO permiten escribir en `CONTROL_TIEMPOS_USUARIOS`**.

Por eso no se crea la colección ni los documentos.

---

## 📝 Cómo Actualizar las Reglas

### Paso 1: Abre Firebase Console
1. Ve a: https://console.firebase.google.com
2. Selecciona tu proyecto: **incidencias-85d73**
3. En el menú izquierdo, haz clic en **Firestore Database**

### Paso 2: Ve a la Pestaña "Reglas"
1. En la parte superior, verás varias pestañas: **Datos | Reglas | Índices | etc.**
2. Haz clic en la pestaña **Reglas**

### Paso 3: Reemplaza las Reglas Actuales
1. Verás el código actual de reglas en un editor
2. **Selecciona TODOOO** el código actual (Ctrl+A)
3. **Elimina todo** (Delete/Backspace)
4. **Pega el nuevo código** de abajo

### Paso 4: Nuevo Código de Reglas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regla general: Cualquier usuario autenticado puede leer y escribir en su propio documento en 'usuarios'
    match /USUARIOS/{userId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.usuarioID;
      allow update: if request.auth != null && request.auth.uid == resource.data.usuarioID;
      allow delete: if false;
    }

    // 🆕 NUEVA REGLA: Control de Tiempos - Todos los usuarios autenticados pueden crear y actualizar registros
    match /CONTROL_TIEMPOS_USUARIOS/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    // Regla para CUADERNO (registros)
    match /CUADERNO/{document=**} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    // Regla para CLIENTE_UNIDAD (catálogos)
    match /CLIENTE_UNIDAD/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }

    // Regla por defecto: Denegar todo lo no especificado
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Paso 5: Publicar las Reglas
1. Verás un botón **"Publicar"** en la esquina inferior derecha (azul)
2. Haz clic en **Publicar**
3. Espera 1-2 segundos a que se actualicen
4. Deberías ver un mensaje de éxito

---

## ✅ Verificación

Después de publicar:
1. Recarga la aplicación en el navegador (Ctrl+F5)
2. Inicia sesión nuevamente
3. Abre DevTools (F12) y ve a Console
4. Deberías ver:
   ```
   [control-tiempos] ✅ Control iniciado exitosamente: <ID>
   ```

5. Abre Firestore Database y ve a la colección **CONTROL_TIEMPOS_USUARIOS**
6. Deberías ver un nuevo documento con tus datos

---

## 📌 Explicación de las Reglas Nuevas

```javascript
match /CONTROL_TIEMPOS_USUARIOS/{document=**} {
  // ✅ Permite que usuarios autenticados creen documentos
  allow create: if request.auth != null;
  
  // ✅ Permite que usuarios autenticados lean documentos
  allow read: if request.auth != null;
  
  // ✅ Permite que usuarios autenticados actualicen documentos
  allow update: if request.auth != null;
  
  // ❌ NO permite eliminar documentos (para auditoría)
  allow delete: if false;
}
```

---

## ⚠️ Importante Notar

La nueva regla:
- ✅ Permite a **cualquier usuario autenticado** crear/leer/actualizar
- ❌ NO permite eliminar (para mantener auditoría)
- ✅ Es **segura** porque solo usuarios autenticados pueden acceder
- ✅ No valida propietario (todos pueden ver tiempos de todos) - esto es intencional para reportes

Si quieres que solo cada usuario vea sus propios tiempos, cambia a:

```javascript
match /CONTROL_TIEMPOS_USUARIOS/{document=**} {
  allow create, read, update: if request.auth != null && request.auth.uid == resource.data.usuarioID;
  allow delete: if false;
}
```

---

## 🆘 Si Necesitas Ayuda

Si algo sale mal:
1. Recuerda el código anterior (aún está en tu imagen)
2. Puedes revertir reemplazando nuevamente con el código anterior
3. Las reglas actuales nunca eliminan datos, solo cambian permisos

---

**Una vez hagas esto, todo debería funcionar ✅**

Avísame cuando hayas actualizado las reglas y vuelve a probar.
