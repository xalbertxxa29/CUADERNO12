# 🧪 GUÍA DE PRUEBA RÁPIDA - RONDA v70

## ⏱️ Tiempo estimado: 10-15 minutos

---

## PRUEBA 1: Escanear QR Correctamente
**Tiempo: 2 minutos**

```
1. Abre la página de Ronda
2. Selecciona una ronda activa
3. Presiona "Iniciar"
   └─ Debe aparecer overlay "Iniciando ronda..."
   └─ Debe desaparecer en 2-3 segundos
4. Presiona "Escanear" en el primer punto
5. Escanea el código QR correcto
   ├─ Debe detener el video
   ├─ Debe aparecer overlay "Guardando punto..."
   └─ Scanner debe reiniciarse automáticamente
6. Observa que el punto aparece como ✅ Escaneado

RESULTADO ESPERADO:
├─ ✅ Overlay funciona
├─ ✅ QR se guarda
└─ ✅ Scanner se reinicia
```

---

## PRUEBA 2: Escanear QR Incorrecto
**Tiempo: 2 minutos**

```
1. En el scanner QR, escanea un código incorrecto
2. Debe aparecer modal de error: "Código QR Incorrecto"
3. Presiona "Reintentar"
   └─ Modal se cierra
   └─ Scanner debe reenfocarse automáticamente
4. Escanea el código QR correcto
   └─ Debe funcionar normalmente

RESULTADO ESPERADO:
├─ ✅ Error detectado correctamente
├─ ✅ Reintentar reinicia el scanner
└─ ✅ Código correcto se acepta
```

---

## PRUEBA 3: Botón Cancelar Funcional
**Tiempo: 1 minuto**

```
1. Presiona "Escanear" en cualquier punto
2. Espera 2 segundos (el scanner debe estar activo)
3. Presiona botón "Cancelar"
4. Debe cerrar el modal y volver a la lista
5. Observa que el punto sigue como "⏳ Pendiente"

RESULTADO ESPERADO:
├─ ✅ Botón Cancelar cierra el modal
├─ ✅ Cámara se detiene (sin error)
└─ ✅ Vuelve a la lista correctamente
```

---

## PRUEBA 4: Botón Reintentar Funcional
**Tiempo: 1 minuto**

```
1. Presiona "Escanear" en cualquier punto
2. Presiona botón "Reintentar"
   └─ Modal permanece abierto
   └─ Video se reinicia
3. Ahora escanea un QR correcto
   └─ Debe guardarse normalmente

RESULTADO ESPERADO:
├─ ✅ Reintentar no cierra el modal
├─ ✅ Video se reinicia
└─ ✅ Scanner funciona después
```

---

## PRUEBA 5: Escanear Múltiples Puntos
**Tiempo: 3 minutos**

```
1. Inicia una ronda
2. Escanea el primer punto correctamente
   └─ Overlay "Guardando punto..."
   └─ Scanner se reinicia automáticamente
3. Inmediatamente escanea el segundo punto
4. Repite para 3-4 puntos
5. Observa que no hay demoras entre escaneos

RESULTADO ESPERADO:
├─ ✅ Cada punto se guarda con overlay
├─ ✅ Scanner se reinicia automáticamente
└─ ✅ Flujo es rápido y sin fricciones
```

---

## PRUEBA 6: Completar Ronda Completamente
**Tiempo: 5 minutos**

```
1. Inicia una ronda con 3-5 puntos
2. Escanea TODOS los puntos correctamente
3. Presiona "Terminar Ronda"
   └─ Debe aparecer overlay "Terminando ronda..."
4. Espera a que muestre el resumen
5. Observa:
   ├─ ✅ Estado: TERMINADA
   ├─ ✅ Icono: ✅ (verde)
   └─ ✅ Puntos: X/X Escaneados

RESULTADO ESPERADO:
├─ ✅ Overlay funciona
├─ ✅ Estado = TERMINADA
└─ ✅ Se redirige en 5 segundos
```

---

## PRUEBA 7: Ronda Incompleta
**Tiempo: 5 minutos**

```
1. Inicia una ronda con 5 puntos
2. Escanea solo 3 puntos correctamente
3. Presiona "Terminar Ronda"
   └─ Debe aparecer overlay "Terminando ronda..."
4. Observa el resumen:
   ├─ ✅ Estado: INCOMPLETA
   ├─ ✅ Icono: ⚠️ (naranja)
   ├─ ✅ Puntos: 3/5 Escaneados
   └─ ✅ Lista de puntos no escaneados

RESULTADO ESPERADO:
├─ ✅ Overlay funciona
├─ ✅ Estado = INCOMPLETA
├─ ✅ Muestra puntos pendientes
└─ ✅ Se redirige en 5 segundos
```

---

## PRUEBA 8: Ronda No Realizada
**Tiempo: 3 minutos**

```
1. Inicia una ronda con 3+ puntos
2. NO escanees ningún punto
3. Presiona "Terminar Ronda"
   └─ Debe aparecer overlay "Terminando ronda..."
4. Observa el resumen:
   ├─ ✅ Estado: NO_REALIZADA
   ├─ ✅ Icono: ❌ (rojo)
   ├─ ✅ Puntos: 0/X Escaneados
   └─ ✅ Lista de TODOS los puntos sin escanear

RESULTADO ESPERADO:
├─ ✅ Overlay funciona
├─ ✅ Estado = NO_REALIZADA
├─ ✅ Muestra todos los puntos pendientes
└─ ✅ Se redirige en 5 segundos
```

---

## PRUEBA 9: Recuperación de Ronda en Progreso
**Tiempo: 3 minutos**

```
1. Inicia una ronda
2. Escanea 2-3 puntos
3. Cierra o recarga la página
4. Vuelve a entrar a Ronda
5. Debe mostrar la ronda EN PROGRESO
6. Los puntos escaneados deben estar marcados ✅

RESULTADO ESPERADO:
├─ ✅ Ronda se recupera automáticamente
├─ ✅ Muestra puntos escaneados anteriormente
└─ ✅ Puedes continuar escaneando
```

---

## PRUEBA 10: Auto-Terminación por Tolerancia
**Tiempo: Varía según tolerancia configurada**

```
NOTA: Esta prueba se puede hacer rápido si la ronda tiene 
tolerancia en minutos (ej: 1 minuto en lugar de 1 hora)

1. Inicia una ronda con tolerancia corta (ej: 1 minuto)
2. No escanees nada o escanea parcialmente
3. Espera a que se supere la tolerancia
4. El sistema debe auto-terminar automáticamente
5. Se muestra resumen con estado correcto:
   ├─ Si escaneaste todo: TERMINADA
   ├─ Si escaneaste parcial: INCOMPLETA
   └─ Si no escaneaste: NO_REALIZADA
6. horarioTermino debe ser: inicio + tolerancia

RESULTADO ESPERADO:
├─ ✅ Auto-terminación funciona
├─ ✅ Estado se determina correctamente
└─ ✅ horarioTermino es correcto
```

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Overlay funciona al iniciar
- [ ] Overlay funciona al guardar
- [ ] Overlay funciona al terminar
- [ ] Scanner se reinicia después de escanear
- [ ] Botón Cancelar funciona
- [ ] Botón Reintentar funciona
- [ ] QR correcto se guarda
- [ ] QR incorrecto muestra error
- [ ] Estado TERMINADA funciona
- [ ] Estado INCOMPLETA funciona
- [ ] Estado NO_REALIZADA funciona
- [ ] Recuperación de ronda funciona
- [ ] Auto-terminación funciona
- [ ] horarioTermino es correcto
- [ ] Resumen final muestra estado exacto

---

## 🐛 SI ENCUENTRAS PROBLEMAS

### Problema: Overlay no aparece
**Solución**: 
```
1. Abre DevTools (F12)
2. Ve a Console
3. Verifica si hay errores
4. Recarga la página (Ctrl+Shift+R)
```

### Problema: Scanner congelado
**Solución**:
```
1. Presiona botón "Cancelar"
2. Si no funciona: Recarga la página
3. Si persiste: Limpiar cache (Ctrl+Shift+Del)
```

### Problema: QR se rechaza incorrectamente
**Solución**:
```
1. Verifica que el QR sea válido
2. Comprueba que coincida exactamente con qrId
3. Abre DevTools → Console
4. Verifica qué código está siendo escaneado
```

### Problema: Estado incorrecto en resumen
**Solución**:
```
1. Abre DevTools → Console
2. Busca logs: "[Ronda] Estado:"
3. Verifica cuántos puntos tienen qrEscaneado = true
4. Estado debe ser: 0 = NO_REALIZADA, algunos = INCOMPLETA, todos = TERMINADA
```

---

## 📊 MONITOREO EN FIRESTORE

Para verificar que los datos se guardan correctamente:

```
Colección: RONDAS_COMPLETADAS
```

Cada documento debe tener:
```json
{
  "id": "sesion-id",
  "nombre": "Nombre Ronda",
  "estado": "TERMINADA | INCOMPLETA | NO_REALIZADA",
  "horarioInicio": Timestamp(...),
  "horarioTermino": Timestamp(...),  // = Inicio + Tolerancia
  "puntosRegistrados": {
    "0": {
      "nombre": "Punto 1",
      "qrEscaneado": true,
      "codigoQR": "QR-12345",
      "timestamp": Timestamp(...),
      "respuestas": {...},
      "foto": null | "base64..."
    }
  }
}
```

---

## 🎯 RESULTADO FINAL

Después de completar todas las pruebas, debe haber:

- ✅ Overlays funcionando en todas las operaciones largas
- ✅ Scanner reiniciándose automáticamente
- ✅ Botones Cancelar y Reintentar funcionales
- ✅ Estados correctos guardándose en Firestore
- ✅ horarioTermino consistente con fórmula: inicio + tolerancia
- ✅ Auto-terminación funcionando correctamente

**El sistema está listo para producción** 🚀

