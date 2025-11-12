// ronda-v2.js - Sistema mejorado de rondas con persistencia y QR
// Características:
// - Usa RONDAS_COMPLETADAS con estado EN_PROGRESO/TERMINADA
// - Registra si el QR fue escaneado en cada punto
// - Guarda usuario que inició la ronda
// - Recupera ronda al recargar navegador
// - Cronómetro basado en horarioInicio (tiempo real)
// - Auto-termina si pasa tolerancia

document.addEventListener('DOMContentLoaded', async () => {
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  let currentUser = null;
  let userCtx = { email: '', uid: '', cliente: '', unidad: '', puesto: '', userId: '' };
  let rondaEnProgreso = null;
  let scannerActivo = false;
  let animFrameId = null;
  let lastUpdateTime = Date.now();

  // ===================== AUTH =====================
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    currentUser = user;
    userCtx.email = user.email;
    userCtx.uid = user.uid;
    const userId = user.email.split('@')[0];
    userCtx.userId = userId;

    try {
      const snap = await db.collection('USUARIOS').doc(userId).get();
      if (snap.exists) {
        const datos = snap.data();
        userCtx.cliente = (datos.CLIENTE || '').toUpperCase();
        userCtx.unidad = (datos.UNIDAD || '').toUpperCase();
        userCtx.puesto = datos.PUESTO || '';
        
        // Verificar si hay ronda EN_PROGRESO del usuario actual
        await verificarRondaEnProgreso(userId);
        // Cargar rondas disponibles
        await cargarRondas();
      }
    } catch (e) {
      console.error('[Ronda] Error:', e);
    }
  });

  // ===================== VERIFICAR RONDA EN PROGRESO =====================
  async function verificarRondaEnProgreso(userId) {
    try {
      // Buscar rondas EN_PROGRESO del usuario actual
      const query = db.collection('RONDAS_COMPLETADAS')
        .where('estado', '==', 'EN_PROGRESO')
        .where('usuario', '==', userId);
      
      const snapshot = await query.get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        rondaEnProgreso = { id: doc.id, ...doc.data() };
        
        console.log('[Ronda] Ronda recuperada:', rondaEnProgreso.nombre);
        
        // Verificar si ya pasó la tolerancia
        const ahoraMs = new Date().getTime();
        const inicioMs = new Date(rondaEnProgreso.horarioInicio).getTime();
        const elapsedMs = ahoraMs - inicioMs;
        
        const toleranciaMs = 
          rondaEnProgreso.toleranciaTipo === 'horas'
            ? rondaEnProgreso.tolerancia * 3600000
            : rondaEnProgreso.tolerancia * 60000;
        
        if (elapsedMs > toleranciaMs) {
          console.log('[Ronda] Tolerancia expirada, terminando automáticamente...');
          await terminarRondaAuto();
        } else {
          mostrarRondaEnProgreso();
          iniciarCronometro();
        }
      }
    } catch (e) {
      console.error('[Ronda] Error verificando ronda:', e);
    }
  }

  // ===================== CARGAR RONDAS =====================
  async function cargarRondas() {
    const listDiv = document.getElementById('rondas-list');
    if (!listDiv) return;

    // Si hay ronda en progreso, no mostrar otras
    if (rondaEnProgreso) return;

    try {
      let snapshot = await db.collection('Rondas_QR').get();
      let rondasFiltradas = [];

      snapshot.forEach(doc => {
        const ronda = doc.data();
        if (
          (ronda.cliente || '').toUpperCase() === userCtx.cliente &&
          (ronda.unidad || '').toUpperCase() === userCtx.unidad
        ) {
          rondasFiltradas.push({ id: doc.id, ...ronda });
        }
      });

      if (rondasFiltradas.length === 0) {
        listDiv.innerHTML = '<p style="color:#999;">No hay rondas</p>';
        return;
      }

      listDiv.innerHTML = '';
      rondasFiltradas.forEach(ronda => {
        const card = crearCardRonda(ronda);
        listDiv.appendChild(card);
      });
    } catch (e) {
      console.error('[Ronda] Error cargando:', e);
    }
  }

  // ===================== CREAR CARD RONDA =====================
  function crearCardRonda(ronda) {
    const div = document.createElement('div');
    
    // Validar si la ronda puede iniciarse
    const validacion = validarRonda(ronda);
    const puedeIniciar = validacion.activa;
    const motivo = validacion.motivo;
    
    div.style.cssText = `
      background: ${puedeIniciar ? '#222' : '#3f3f3f'}; 
      border: 1px solid ${puedeIniciar ? '#333' : '#555'}; 
      border-radius: 8px; padding: 15px;
      margin: 10px 0; cursor: ${puedeIniciar ? 'pointer' : 'not-allowed'}; 
      transition: all 0.2s; opacity: ${puedeIniciar ? '1' : '0.6'};
    `;

    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: ${puedeIniciar ? '#fff' : '#999'}; font-size: 1.1em;">${ronda.nombre || 'Ronda'}</strong>
          <div style="font-size: 0.9em; color: ${puedeIniciar ? '#ccc' : '#666'}; margin-top: 5px;">
            🕒 ${ronda.horario || '--:--'} | ⏱️ ${ronda.tolerancia || '--'} ${ronda.toleranciaTipo || 'minutos'}
          </div>
          ${!puedeIniciar ? `<div style="font-size: 0.85em; color: #ff6b6b; margin-top: 8px;">⚠️ ${motivo}</div>` : ''}
        </div>
        <button style="
          background: ${puedeIniciar ? '#ef4444' : '#999'}; 
          color: white; border: none; padding: 8px 16px;
          border-radius: 4px; cursor: ${puedeIniciar ? 'pointer' : 'not-allowed'}; 
          font-weight: 500;
        " ${!puedeIniciar ? 'disabled' : ''}>${puedeIniciar ? 'Iniciar' : 'Inactiva'}</button>
      </div>
    `;

    if (puedeIniciar) {
      div.querySelector('button').addEventListener('click', () => iniciarRonda(ronda));
    }
    
    return div;
  }

  // ===================== VALIDAR RONDA =====================
  function validarRonda(ronda) {
    const ahora = new Date();
    const horaActualMs = ahora.getHours() * 3600000 + ahora.getMinutes() * 60000;
    
    let activa = false;
    let motivo = '';

    if (!ronda.frecuencia) {
      motivo = 'Frecuencia no configurada';
      return { activa: false, motivo };
    }

    if (ronda.frecuencia === 'diaria') {
      if (!ronda.horario) {
        motivo = 'Horario no configurado';
        return { activa: false, motivo };
      }

      const [horaStr, minStr] = ronda.horario.split(':');
      const horaIni = parseInt(horaStr) || 0;
      const minIni = parseInt(minStr) || 0;
      const inicioMs = horaIni * 3600000 + minIni * 60000;

      if (!ronda.tolerancia || !ronda.toleranciaTipo) {
        motivo = 'Tolerancia no configurada';
        return { activa: false, motivo };
      }

      const toleranciaMs = 
        ronda.toleranciaTipo === 'horas'
          ? ronda.tolerancia * 3600000
          : ronda.tolerancia * 60000;

      const finMs = inicioMs + toleranciaMs;

      if (horaActualMs < inicioMs) {
        const minutosFalta = Math.floor((inicioMs - horaActualMs) / 60000);
        motivo = `Comienza en ${minutosFalta} minutos`;
        return { activa: false, motivo };
      } else if (horaActualMs > finMs) {
        motivo = `Horario expirado`;
        return { activa: false, motivo };
      } else {
        activa = true;
      }
    } else {
      motivo = `Frecuencia "${ronda.frecuencia}" no soportada`;
      return { activa: false, motivo };
    }

    return { activa, motivo };
  }

  // ===================== INICIAR RONDA =====================
  async function iniciarRonda(ronda) {
    try {
      const sesionId = Date.now().toString();
      const ahora = new Date();

      const puntosRondaArray = Array.isArray(ronda.puntosRonda)
        ? ronda.puntosRonda
        : Object.values(ronda.puntosRonda || {});

      const puntosRegistrados = {};
      puntosRondaArray.forEach((punto, idx) => {
        puntosRegistrados[idx] = {
          nombre: punto.nombre || `Punto ${idx + 1}`,
          qrEscaneado: false,
          codigoQR: null,
          timestamp: null,
          respuestas: {}, // Guardar respuestas de preguntas
          foto: null // Guardar foto en base64
        };
      });

      rondaEnProgreso = {
        id: sesionId,
        nombre: ronda.nombre,
        rondaId: ronda.id,
        cliente: userCtx.cliente,
        unidad: userCtx.unidad,
        usuario: userCtx.userId,
        usuarioEmail: currentUser.email,
        horarioInicio: ahora.toISOString(),
        horarioTermino: null,
        estado: 'EN_PROGRESO',
        puntosRonda: puntosRondaArray,
        puntosRegistrados: puntosRegistrados,
        tolerancia: ronda.tolerancia,
        toleranciaTipo: ronda.toleranciaTipo
      };

      await db.collection('RONDAS_COMPLETADAS').doc(sesionId).set(rondaEnProgreso);

      console.log('[Ronda] Iniciada:', sesionId);
      mostrarRondaEnProgreso();
      iniciarCronometro();
    } catch (e) {
      console.error('[Ronda] Error iniciando:', e);
      alert('Error: ' + e.message);
    }
  }

  // ===================== MOSTRAR RONDA EN PROGRESO =====================
  function mostrarRondaEnProgreso() {
    const listDiv = document.getElementById('rondas-list');
    if (!listDiv || !rondaEnProgreso) return;

    listDiv.innerHTML = '';

    const header = document.createElement('div');
    header.style.cssText = `
      background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 15px;
      margin-bottom: 20px;
    `;
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="color: #fff; font-size: 1.2em;">${rondaEnProgreso.nombre}</strong>
          <div style="color: #999; margin-top: 5px;">Estado: EN PROGRESO</div>
        </div>
        <div>
          <div id="cronometro" style="font-size: 2em; font-weight: bold; color: #ef4444; font-family: monospace;">00:00:00</div>
          <button id="btn-terminar" style="
            background: #ef4444; color: white; border: none; padding: 8px 16px;
            border-radius: 4px; cursor: pointer; margin-top: 10px; width: 100%;
          ">Terminar Ronda</button>
        </div>
      </div>
    `;
    listDiv.appendChild(header);

    const puntosDiv = document.createElement('div');
    puntosDiv.id = 'puntos-container';
    
    Object.entries(rondaEnProgreso.puntosRegistrados).forEach(([idx, punto]) => {
      const qrEscaneado = punto.qrEscaneado;
      const tieneRespuestas = punto.respuestas && Object.keys(punto.respuestas).length > 0;
      const tieneFoto = punto.foto !== null && punto.foto !== undefined;
      
      const card = document.createElement('div');
      card.style.cssText = `
        background: ${qrEscaneado ? '#065f46' : '#222'}; 
        border: 1px solid ${qrEscaneado ? '#10b981' : '#333'};
        border-radius: 8px; padding: 15px; margin: 10px 0; 
        cursor: pointer; transition: all 0.2s;
      `;
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff; font-size: 1.1em;">${punto.nombre}</strong>
            <div style="font-size: 0.9em; color: #ccc; margin-top: 5px;">
              ${qrEscaneado ? '✅ QR Escaneado' : '⏳ Pendiente'}
            </div>
            ${qrEscaneado ? `<div style="font-size: 0.85em; color: #10b981;">📱 ${punto.codigoQR}</div>` : ''}
            ${tieneRespuestas ? `<div style="font-size: 0.85em; color: #10b981;">📋 ${Object.keys(punto.respuestas).length} respuesta(s)</div>` : ''}
            ${tieneFoto ? `<div style="font-size: 0.85em; color: #10b981;">📷 Foto guardada</div>` : ''}
          </div>
          <button style="
            background: ${qrEscaneado ? '#10b981' : '#3b82f6'}; color: white; border: none; 
            padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500;
          ">${qrEscaneado ? 'Completado' : 'Escanear'}</button>
        </div>
      `;

      if (!qrEscaneado) {
        card.querySelector('button').addEventListener('click', () => {
          // Obtener punto completo de puntosRonda usando el índice numérico
          const puntoCompleto = rondaEnProgreso.puntosRonda[parseInt(idx)];
          abrirEscaner(parseInt(idx), puntoCompleto);
        });
      }

      puntosDiv.appendChild(card);
    });

    listDiv.appendChild(puntosDiv);
    header.querySelector('#btn-terminar').addEventListener('click', terminarRonda);
  }

  // ===================== ABRIR ESCÁNER QR =====================
  function abrirEscaner(indice, punto) {
    if (scannerActivo) return;
    scannerActivo = true;

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.95); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 1000;
    `;

    modal.innerHTML = `
      <div style="color: white; text-align: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Escanear QR - ${punto.nombre}</h2>
        <p style="margin: 10px 0 0 0; color: #ccc;">Apunta la cámara al código QR</p>
      </div>
      <video id="scanner-video" style="width: 80%; max-width: 500px; border: 2px solid #ef4444; border-radius: 8px;"></video>
      <button id="close-scanner" style="
        background: #666; color: white; border: none; padding: 10px 20px;
        border-radius: 4px; cursor: pointer; margin-top: 20px;
      ">Cerrar</button>
    `;

    document.body.appendChild(modal);

    iniciarVideoQR(indice, punto, modal);

    modal.querySelector('#close-scanner').addEventListener('click', () => {
      detenerVideoQR(modal);
      scannerActivo = false;
    });
  }

  // ===================== INICIAR VIDEO QR =====================
  async function iniciarVideoQR(indice, punto, modal) {
    try {
      const video = modal.querySelector('#scanner-video');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      video.play();

      const codeReader = new ZXing.BrowserMultiFormatReader();
      codeReader.decodeFromVideoDevice(undefined, video, (result, err) => {
        if (result) {
          procesarQR(result.getText(), indice, punto, modal);
        }
      });
    } catch (e) {
      console.error('[QR] Error:', e);
      const input = modal.querySelector('#qr-input');
      input.focus();
      input.placeholder = 'Error de cámara, ingresa manualmente';
    }
  }

  // ===================== PROCESAR QR =====================
  async function procesarQR(codigoQR, indice, punto, modal) {
    try {
      console.log('[QR] Procesando:', codigoQR);
      console.log('[QR] Punto:', punto.nombre);
      console.log('[QR] QR esperado:', punto.qrId);

      // VALIDAR ESTRICTAMENTE que el código coincida con qrId del punto
      if (!punto.qrId) {
        console.error('[QR] El punto no tiene qrId configurado');
        alert('❌ Error: El punto no tiene QR configurado.');
        scannerActivo = false;
        return;
      }

      // Validación exacta del QR
      const esValido = codigoQR.trim() === punto.qrId.trim();
      
      if (!esValido) {
        console.error('[QR] RECHAZO - No coincide');
        console.error('[QR] Esperado:', JSON.stringify(punto.qrId));
        console.error('[QR] Escaneado:', JSON.stringify(codigoQR));
        
        mostrarErrorQR(indice, punto, modal);
        scannerActivo = false;
        return; // NO continúa - rechaza el QR
      }

      console.log('[QR] ✅ QR VÁLIDO para', punto.nombre);

      // QR es válido, ahora procesar
      const puntoCompleto = rondaEnProgreso.puntosRonda[indice];
      const tienePreguntas = puntoCompleto && puntoCompleto.questions && puntoCompleto.questions.length > 0;

      console.log('[QR] ¿Tiene preguntas?', tienePreguntas);

      // Si el punto tiene preguntas, mostrar formulario
      if (tienePreguntas) {
        detenerVideoQR(modal);
        if (modal) modal.remove();
        scannerActivo = false;
        mostrarFormularioPreguntas(codigoQR, indice, puntoCompleto);
      } else {
        // Sin preguntas, guardar directamente
        guardarPuntoEscaneado(codigoQR, indice, puntoCompleto);
        detenerVideoQR(modal);
        if (modal) modal.remove();
        scannerActivo = false;
        mostrarRondaEnProgreso();
      }
    } catch (e) {
      console.error('[Ronda] Error registrando:', e);
      alert('Error: ' + e.message);
      scannerActivo = false;
    }
  }

  // ===================== MOSTRAR ERROR QR MODAL =====================
  function mostrarErrorQR(indice, punto, modal) {
    const errorOverlay = document.createElement('div');
    errorOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85); display: flex; align-items: center;
      justify-content: center; z-index: 2000;
    `;

    const errorBox = document.createElement('div');
    errorBox.style.cssText = `
      background: #1a1a1a; border: 2px solid #ef4444; border-radius: 12px;
      padding: 40px; text-align: center; max-width: 350px;
      box-shadow: 0 10px 40px rgba(239, 68, 68, 0.3);
    `;

    errorBox.innerHTML = `
      <div style="font-size: 3em; margin-bottom: 20px;">❌</div>
      <h2 style="color: #ef4444; margin: 0 0 15px 0; font-size: 1.3em;">Código QR Incorrecto</h2>
      <p style="color: #ccc; margin: 0; font-size: 0.95em;">Por favor, intenta de nuevo.</p>
      <button id="retry-qr" style="
        background: #ef4444; color: white; border: none; padding: 12px 30px;
        border-radius: 6px; cursor: pointer; margin-top: 25px; font-weight: 600;
        font-size: 0.95em;
      ">Reintentar</button>
    `;

    errorOverlay.appendChild(errorBox);
    document.body.appendChild(errorOverlay);

    errorBox.querySelector('#retry-qr').addEventListener('click', () => {
      errorOverlay.remove();
      scannerActivo = false;
      // Reiniciar video del scanner
      if (modal && modal.parentNode) {
        const video = modal.querySelector('#scanner-video');
        if (video && video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }
        iniciarVideoQR(indice, punto, modal);
      }
    });
  }

  // ===================== DETENER VIDEO QR =====================
  function detenerVideoQR(modal) {
    if (!modal) return;
    const video = modal.querySelector('#scanner-video');
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }
  }

  // ===================== MOSTRAR FORMULARIO DE PREGUNTAS =====================
  function mostrarFormularioPreguntas(codigoQR, indice, punto) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.95); display: flex; flex-direction: column;
      align-items: center; justify-content: center; z-index: 1001; overflow-y: auto;
      padding: 20px 0;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: #1a1a1a; border: 1px solid #444; border-radius: 8px;
      padding: 25px; max-width: 500px; width: 90%; margin: auto;
      color: white;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `margin-bottom: 25px;`;
    header.innerHTML = `
      <h2 style="margin: 0; color: #fff; font-size: 1.3em;">${punto.nombre}</h2>
      <p style="margin: 8px 0 0 0; color: #ccc; font-size: 0.9em;">📝 Responde las preguntas</p>
    `;
    container.appendChild(header);

    // Preguntas
    const respuestasObj = {};
    let preguntas = punto.questions || {};

    // Si preguntas es array, convertir a objeto
    if (Array.isArray(preguntas)) {
      const preguntasObj = {};
      preguntas.forEach((p, idx) => {
        preguntasObj[idx] = p;
      });
      preguntas = preguntasObj;
    }

    const preguntasArray = Object.entries(preguntas);

    if (preguntasArray.length === 0) {
      container.innerHTML += '<p style="color: #999; text-align: center;">Sin preguntas</p>';
    } else {
      preguntasArray.forEach(([qKey, pregunta]) => {
        const fieldKey = `question_${qKey}`;
        respuestasObj[fieldKey] = '';

        const questionDiv = document.createElement('div');
        questionDiv.style.cssText = `margin-bottom: 20px;`;
        
        const label = document.createElement('label');
        label.style.cssText = `display: block; margin-bottom: 8px; color: #fff; font-weight: 500; font-size: 0.95em;`;
        
        // Extraer el texto de la pregunta de diferentes posibles campos
        let textoPreg = '';
        if (typeof pregunta === 'string') {
          textoPreg = pregunta;
        } else if (pregunta.pregunta) {
          textoPreg = pregunta.pregunta;
        } else if (pregunta.requireQuestion) {
          textoPreg = pregunta.requireQuestion;
        } else {
          textoPreg = JSON.stringify(pregunta).substring(0, 50);
        }
        
        label.textContent = textoPreg || `Pregunta ${qKey}`;
        questionDiv.appendChild(label);

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Respuesta...';
        input.dataset.fieldKey = fieldKey;
        input.style.cssText = `
          width: 100%; padding: 10px; background: #222; border: 1px solid #444;
          border-radius: 4px; color: #fff; font-size: 0.95em; box-sizing: border-box;
        `;
        input.addEventListener('input', (e) => {
          respuestasObj[fieldKey] = e.target.value;
        });
        questionDiv.appendChild(input);

        container.appendChild(questionDiv);
      });
    }

    // Sección de Foto
    const fotoDiv = document.createElement('div');
    fotoDiv.style.cssText = `margin-top: 25px; padding-top: 20px; border-top: 1px solid #444;`;
    
    const fotoLabel = document.createElement('label');
    fotoLabel.style.cssText = `display: block; margin-bottom: 12px; color: #fff; font-weight: 500; font-size: 0.95em;`;
    fotoLabel.textContent = '📷 Tomar Foto (Opcional)';
    fotoDiv.appendChild(fotoLabel);

    const fotoContainer = document.createElement('div');
    fotoContainer.style.cssText = `
      background: #222; border: 1px solid #444; border-radius: 4px; 
      padding: 12px; margin-bottom: 12px; min-height: 200px; display: flex;
      align-items: center; justify-content: center;
    `;
    
    const video = document.createElement('video');
    video.id = 'foto-video';
    video.style.cssText = `width: 100%; border-radius: 4px; display: none; max-height: 250px; object-fit: cover;`;
    video.autoplay = true;
    video.playsInline = true;
    fotoContainer.appendChild(video);

    const canvas = document.createElement('canvas');
    canvas.id = 'foto-canvas';
    canvas.style.cssText = `width: 100%; border-radius: 4px; display: none;`;
    canvas.style.maxHeight = '250px';
    fotoContainer.appendChild(canvas);

    const preview = document.createElement('img');
    preview.id = 'foto-preview';
    preview.style.cssText = `width: 100%; border-radius: 4px; display: none; max-height: 250px; object-fit: cover;`;
    fotoContainer.appendChild(preview);

    const placeholder = document.createElement('div');
    placeholder.style.cssText = `color: #999; font-size: 0.9em; text-align: center;`;
    placeholder.textContent = 'Sin foto capturada';
    placeholder.id = 'foto-placeholder';
    fotoContainer.appendChild(placeholder);

    fotoDiv.appendChild(fotoContainer);

    const fotoButtonsDiv = document.createElement('div');
    fotoButtonsDiv.style.cssText = `display: flex; gap: 8px; margin-bottom: 12px;`;

    const btnAbrirCamara = document.createElement('button');
    btnAbrirCamara.textContent = 'Abrir Cámara';
    btnAbrirCamara.style.cssText = `
      flex: 1; padding: 10px; background: #3b82f6; color: white; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.9em;
    `;
    btnAbrirCamara.addEventListener('click', () => {
      abrirCamaraFoto(video, placeholder);
    });
    fotoButtonsDiv.appendChild(btnAbrirCamara);

    const btnCapturar = document.createElement('button');
    btnCapturar.textContent = 'Capturar';
    btnCapturar.style.cssText = `
      flex: 1; padding: 10px; background: #ef4444; color: white; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 500; font-size: 0.9em;
    `;
    btnCapturar.addEventListener('click', () => {
      capturarFoto(video, canvas, preview, placeholder);
    });
    fotoButtonsDiv.appendChild(btnCapturar);

    fotoDiv.appendChild(fotoButtonsDiv);
    container.appendChild(fotoDiv);

    // Botones de Acción
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = `display: flex; gap: 10px; margin-top: 25px;`;

    const btnGuardar = document.createElement('button');
    btnGuardar.textContent = 'Guardar';
    btnGuardar.style.cssText = `
      flex: 1; padding: 12px; background: #10b981; color: white; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.95em;
    `;
    btnGuardar.addEventListener('click', async () => {
      const fotoBase64 = canvas.dataset.fotoBase64 || null;
      await guardarPuntoConRespuestas(codigoQR, indice, punto, respuestasObj, fotoBase64);
      overlay.remove();
      mostrarRondaEnProgreso();
    });
    buttonsDiv.appendChild(btnGuardar);

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.cssText = `
      flex: 1; padding: 12px; background: #666; color: white; border: none;
      border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.95em;
    `;
    btnCancelar.addEventListener('click', () => {
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
      overlay.remove();
      mostrarRondaEnProgreso();
    });
    buttonsDiv.appendChild(btnCancelar);

    container.appendChild(buttonsDiv);
    overlay.appendChild(container);
    document.body.appendChild(overlay);
  }

  // ===================== ABRIR CÁMARA PARA FOTO =====================
  // ===================== ABRIR CÁMARA PARA FOTO =====================
  async function abrirCamaraFoto(video, placeholder) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      video.srcObject = stream;
      video.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } catch (e) {
      console.error('[Foto] Error:', e);
      alert('❌ Error al acceder a la cámara');
    }
  }

  // ===================== CAPTURAR FOTO =====================
  function capturarFoto(video, canvas, preview, placeholder) {
    if (!video.srcObject) {
      alert('❌ Abre la cámara primero');
      return;
    }

    // Esperar un poco para que el video esté completamente listo
    setTimeout(() => {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dibujar el video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convertir a base64
      try {
        const base64 = canvas.toDataURL('image/jpeg', 0.9);
        canvas.dataset.fotoBase64 = base64;

        // Mostrar preview
        preview.src = base64;
        preview.style.display = 'block';
        video.style.display = 'none';
        if (placeholder) placeholder.style.display = 'none';

        // Cerrar stream
        if (video.srcObject) {
          video.srcObject.getTracks().forEach(track => track.stop());
        }

        console.log('[Foto] ✅ Foto capturada - tamaño:', canvas.width, 'x', canvas.height);
      } catch (e) {
        console.error('[Foto] Error capturando:', e);
        alert('❌ Error al capturar la foto');
      }
    }, 200);
  }

  // ===================== GUARDAR PUNTO CON RESPUESTAS =====================
  async function guardarPuntoConRespuestas(codigoQR, indice, punto, respuestas, fotoBase64) {
    try {
      rondaEnProgreso.puntosRegistrados[indice] = {
        nombre: punto.nombre,
        qrEscaneado: true,
        codigoQR: codigoQR,
        timestamp: new Date().toISOString(),
        respuestas: respuestas,
        foto: fotoBase64
      };

      await db.collection('RONDAS_COMPLETADAS').doc(rondaEnProgreso.id).update({
        puntosRegistrados: rondaEnProgreso.puntosRegistrados
      });

      console.log('[Ronda] Punto completado:', indice);
    } catch (e) {
      console.error('[Ronda] Error guardando:', e);
      alert('Error: ' + e.message);
    }
  }

  // ===================== GUARDAR PUNTO SIN PREGUNTAS =====================
  async function guardarPuntoEscaneado(codigoQR, indice, punto) {
    try {
      rondaEnProgreso.puntosRegistrados[indice] = {
        nombre: punto.nombre,
        qrEscaneado: true,
        codigoQR: codigoQR,
        timestamp: new Date().toISOString(),
        respuestas: {},
        foto: null
      };

      await db.collection('RONDAS_COMPLETADAS').doc(rondaEnProgreso.id).update({
        puntosRegistrados: rondaEnProgreso.puntosRegistrados
      });

      console.log('[Ronda] Punto marcado:', indice);
    } catch (e) {
      console.error('[Ronda] Error registrando:', e);
      alert('Error: ' + e.message);
    }
  }

  // ===================== CRONÓMETRO =====================
  // ===================== CRONÓMETRO OPTIMIZADO =====================
  function iniciarCronometro() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    lastUpdateTime = Date.now();

    function actualizarCronometro() {
      const ahora = Date.now();
      // Solo actualizar pantalla cada 500ms (en lugar de cada 1000ms)
      if (ahora - lastUpdateTime >= 500) {
        const inicioMs = new Date(rondaEnProgreso.horarioInicio).getTime();
        const elapsedMs = ahora - inicioMs;

        const horas = Math.floor(elapsedMs / 3600000);
        const minutos = Math.floor((elapsedMs % 3600000) / 60000);
        const segundos = Math.floor((elapsedMs % 60000) / 1000);

        const display = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
        const elem = document.querySelector('#cronometro');
        if (elem) elem.textContent = display;

        verificarTolerancia(elapsedMs);
        lastUpdateTime = ahora;
      }
      animFrameId = requestAnimationFrame(actualizarCronometro);
    }

    animFrameId = requestAnimationFrame(actualizarCronometro);
  }

  // ===================== VERIFICAR TOLERANCIA =====================
  function verificarTolerancia(elapsedMs) {
    if (!rondaEnProgreso) return;

    const toleranciaMs = 
      rondaEnProgreso.toleranciaTipo === 'horas'
        ? rondaEnProgreso.tolerancia * 3600000
        : rondaEnProgreso.tolerancia * 60000;

    if (elapsedMs > toleranciaMs) {
      console.log('[Ronda] Tolerancia excedida, auto-terminando...');
      terminarRondaAuto();
    }
  }

  // ===================== TERMINAR RONDA AUTOMÁTICA =====================
  async function terminarRondaAuto() {
    if (!rondaEnProgreso) return;

    try {
      if (animFrameId) cancelAnimationFrame(animFrameId);

      const ahora = new Date();
      await db.collection('RONDAS_COMPLETADAS').doc(rondaEnProgreso.id).update({
        estado: 'TERMINADA',
        horarioTermino: ahora.toISOString()
      });

      mostrarResumen();
      rondaEnProgreso = null;

      setTimeout(() => {
        location.href = 'menu.html';
      }, 5000);
    } catch (e) {
      console.error('[Ronda] Error terminando:', e);
    }
  }

  // ===================== TERMINAR RONDA (MANUAL) =====================
  async function terminarRonda() {
    if (!rondaEnProgreso) return;

    try {
      if (animFrameId) cancelAnimationFrame(animFrameId);

      const ahora = new Date();
      await db.collection('RONDAS_COMPLETADAS').doc(rondaEnProgreso.id).update({
        estado: 'TERMINADA',
        horarioTermino: ahora.toISOString()
      });

      mostrarResumen();
      rondaEnProgreso = null;

      setTimeout(() => {
        location.href = 'menu.html';
      }, 5000);
    } catch (e) {
      console.error('[Ronda] Error terminando:', e);
      alert('Error: ' + e.message);
    }
  }

  // ===================== MOSTRAR RESUMEN =====================
  // ===================== MOSTRAR RESUMEN =====================
  function mostrarResumen() {
    const listDiv = document.getElementById('rondas-list');
    if (!listDiv || !rondaEnProgreso) return;

    const puntosRegistrados = Object.values(rondaEnProgreso.puntosRegistrados);
    const marcados = puntosRegistrados.filter(p => p.qrEscaneado).length;
    const totales = puntosRegistrados.length;
    const noMarcados = puntosRegistrados.filter(p => !p.qrEscaneado);

    let resumenHTML = `
      <div style="background: #1a1a1a; border: 1px solid #444; border-radius: 8px; padding: 30px; text-align: center;">
        <h2 style="color: ${marcados === totales ? '#10b981' : '#f97316'}; margin: 0;">
          ${marcados === totales ? '✅ Ronda Completada' : '⚠️ Ronda Incompleta'}
        </h2>
        <div style="font-size: 2em; color: #fff; margin: 20px 0; font-weight: bold;">
          ${marcados} / ${totales} Puntos Escaneados
        </div>
    `;

    if (noMarcados.length > 0) {
      resumenHTML += `
        <div style="background: #3f2020; border: 1px solid #ef4444; border-radius: 4px; padding: 15px; margin: 20px 0; text-align: left;">
          <strong style="color: #ef4444; display: block; margin-bottom: 10px;">❌ Puntos NO escaneados:</strong>
          <ul style="margin: 0; padding-left: 20px; color: #ccc;">
      `;
      noMarcados.forEach(p => {
        resumenHTML += `<li>${p.nombre}</li>`;
      });
      resumenHTML += `
          </ul>
        </div>
      `;
    }

    resumenHTML += `
        <div style="color: #ccc; margin: 20px 0;">
          Redirigiendo a menú en 5 segundos...
        </div>
      </div>
    `;

    listDiv.innerHTML = resumenHTML;
  }
});
