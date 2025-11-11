// ronda.js (v65) - Control de Rondas con QR
// Funcionalidad: Listar rondas, validar horarios/frecuencia, iniciar marcación

document.addEventListener('DOMContentLoaded', () => {
  // Firebase ya debe estar inicializado
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();

  let currentUser = null;
  let userCtx = { email: '', uid: '', cliente: '', unidad: '', puesto: '' };
  let rondaActiva = null; // Ronda actualmente en progreso
  let tiempoInicio = null;

  // ===================== OBTENER USUARIO =====================
  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    currentUser = user;
    userCtx.email = user.email;
    userCtx.uid = user.uid;

    // Obtener datos del usuario
    try {
      if (window.OfflineStorage) {
        const userData = await window.OfflineStorage.getUserData();
        if (userData && userData.cliente && userData.unidad && userData.puesto) {
          userCtx.cliente = userData.cliente;
          userCtx.unidad = userData.unidad;
          userCtx.puesto = userData.puesto;
          console.log('✓ Datos obtenidos de OfflineStorage');
          cargarRondas();
          return;
        }
      }
    } catch (e) {
      console.warn('OfflineStorage error:', e.message);
    }

    // Obtener de Firestore si no está en OfflineStorage
    try {
      const userId = user.email.split('@')[0];
      const snap = await db.collection('USUARIOS').doc(userId).get();
      
      if (snap.exists) {
        const datos = snap.data();
        userCtx.cliente = datos.CLIENTE || datos.cliente || '';
        userCtx.unidad = datos.UNIDAD || datos.unidad || '';
        userCtx.puesto = datos.PUESTO || datos.puesto || '';
        
        console.log('✓ Datos obtenidos de Firestore');
        cargarRondas();
      }
    } catch (e) {
      console.error('Error obteniendo usuario:', e);
    }
  });

  // ===================== CARGAR RONDAS =====================
  async function cargarRondas() {
    const listDiv = document.getElementById('rondas-list') || crearContenedor();
    listDiv.innerHTML = '<p style="text-align:center; padding:20px;">Cargando rondas...</p>';

    try {
      const query = db.collection('Ronda_QR')
        .where('cliente', '==', userCtx.cliente)
        .where('unidad', '==', userCtx.unidad);

      const snapshot = await query.get();

      if (snapshot.empty) {
        listDiv.innerHTML = '<p style="text-align:center; padding:20px; color:#999;">No hay rondas asignadas</p>';
        return;
      }

      listDiv.innerHTML = '';
      snapshot.forEach(doc => {
        const ronda = doc.data();
        const estado = validarRonda(ronda);
        crearCardRonda(listDiv, doc.id, ronda, estado);
      });

    } catch (error) {
      console.error('Error cargando rondas:', error);
      listDiv.innerHTML = '<p style="color:red; text-align:center; padding:20px;">Error al cargar rondas</p>';
    }
  }

  // ===================== VALIDAR RONDA =====================
  function validarRonda(ronda) {
    const ahora = new Date();
    const horaActual = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    const diaHoy = ahora.getDay();
    
    let activa = false;
    let motivo = '';

    // Validar frecuencia
    if (ronda.frecuencia === 'diaria') {
      // Validar horario
      if (ronda.horario && ronda.tolerancia && ronda.toleranciaTipo) {
        const [horaIni, minIni] = ronda.horario.split(':').map(Number);
        const minToleranciaTot = ronda.toleranciaTipo === 'minutos' ? ronda.tolerancia : ronda.tolerancia * 60;
        
        const inicioMs = horaIni * 3600000 + minIni * 60000;
        const finMs = inicioMs + minToleranciaTot * 60000;
        const ahoraMs = ahora.getHours() * 3600000 + ahora.getMinutes() * 60000;

        if (ahoraMs >= inicioMs && ahoraMs <= finMs) {
          activa = true;
        } else {
          motivo = ahoraMs < inicioMs ? 'Aún no comienza' : 'Horario expirado';
        }
      } else {
        activa = true; // Sin validación de horario
      }
    } else {
      motivo = 'Frecuencia no configurada';
    }

    return { activa, motivo, horaActual };
  }

  // ===================== CREAR CARD RONDA =====================
  function crearCardRonda(container, docId, ronda, estado) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--surface, #222);
      border: 1px solid var(--border, #333);
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      opacity: ${estado.activa ? '1' : '0.5'};
    `;

    const numPuntos = ronda.puntoRonda ? Object.keys(ronda.puntoRonda).length : 0;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:var(--text-primary, #fff);">${ronda.nombre || 'Ronda sin nombre'}</h3>
        <span style="background:${estado.activa ? '#4ade80' : '#888'}; color:#fff; padding:4px 8px; border-radius:4px; font-size:0.8em;">
          ${estado.activa ? 'Activa' : 'Inactiva'}
        </span>
      </div>
      
      <div style="font-size:0.9em; color:var(--text-secondary, #ccc);">
        <div>📍 Puntos: ${numPuntos}</div>
        <div>🕐 Horario: ${ronda.horario || 'Sin horario'}</div>
        <div>⏱️ Tolerancia: ${ronda.tolerancia} ${ronda.toleranciaTipo || 'min'}</div>
        ${!estado.activa ? `<div style="color:#f87171;">⚠️ ${estado.motivo}</div>` : ''}
      </div>
      
      <button class="btn-iniciar-ronda" data-doc-id="${docId}" ${!estado.activa ? 'disabled' : ''} 
        style="
          padding: 10px;
          border: none;
          border-radius: 6px;
          cursor: ${estado.activa ? 'pointer' : 'not-allowed'};
          background: ${estado.activa ? 'var(--primary, #3b82f6)' : '#666'};
          color: white;
          font-weight: 500;
          transition: opacity 0.2s;
        "
      >
        Iniciar Ronda
      </button>
    `;

    container.appendChild(card);

    // Event listener
    const btn = card.querySelector('.btn-iniciar-ronda');
    if (estado.activa) {
      btn.addEventListener('click', () => abrirModalIniciarRonda(docId, ronda));
    }
  }

  // ===================== CREAR CONTENEDOR SI NO EXISTE =====================
  function crearContenedor() {
    let div = document.getElementById('rondas-list');
    if (!div) {
      div = document.createElement('div');
      div.id = 'rondas-list';
      div.style.cssText = 'padding:15px; max-width:640px; margin:0 auto;';
      
      const main = document.querySelector('main') || document.body;
      main.appendChild(div);
    }
    return div;
  }

  // ===================== MODAL INICIAR RONDA =====================
  function abrirModalIniciarRonda(docId, ronda) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 15px;
    `;

    modal.innerHTML = `
      <div style="
        background: var(--surface, #222);
        border-radius: 12px;
        padding: 20px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      ">
        <h3 style="margin-top:0;">¿Desea iniciar la ronda?</h3>
        <p style="color:var(--text-secondary, #ccc); margin:10px 0;">
          <strong>${ronda.nombre}</strong><br>
          Se abrirá el sistema de marcación con cronómetro.
        </p>
        
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn-cancelar" style="flex:1; padding:10px; border:1px solid var(--border, #444); background:transparent; color:var(--text-primary, #fff); border-radius:6px; cursor:pointer;">
            Cancelar
          </button>
          <button class="btn-iniciar" style="flex:1; padding:10px; border:none; background:var(--primary, #3b82f6); color:#fff; border-radius:6px; cursor:pointer; font-weight:500;">
            Iniciar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-cancelar').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.btn-iniciar').addEventListener('click', () => {
      modal.remove();
      iniciarRonda(docId, ronda);
    });
  }

  // ===================== INICIAR RONDA =====================
  function iniciarRonda(docId, ronda) {
    rondaActiva = { docId, ronda };
    tiempoInicio = Date.now();
    
    // Guardar en sessionStorage para recuperar si se cierra
    sessionStorage.setItem('ronda_activa', JSON.stringify({
      docId,
      tiempoInicio,
      rondaNombre: ronda.nombre
    }));

    console.log('🚀 Ronda iniciada:', ronda.nombre);

    // Mostrar pantalla de marcación
    mostrarPantalaMarcacion(ronda);
  }

  // ===================== PANTALLA MARCACIÓN =====================
  function mostrarPantalaMarcacion(ronda) {
    // Crear contenedor si no existe
    let marcacionDiv = document.getElementById('marcacion-container');
    if (!marcacionDiv) {
      marcacionDiv = document.createElement('div');
      marcacionDiv.id = 'marcacion-container';
      document.body.appendChild(marcacionDiv);
    }

    const numPuntos = ronda.puntoRonda ? Object.keys(ronda.puntoRonda).length : 0;

    marcacionDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--background, #111);
        z-index: 999;
        display: flex;
        flex-direction: column;
        padding: 15px;
      ">
        <header style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border, #333);
        ">
          <h2 style="margin:0; color:var(--text-primary, #fff);">${ronda.nombre}</h2>
          <div style="display:flex; gap:10px; align-items:center;">
            <span id="cronometro" style="font-size:1.2em; font-weight:bold; color:var(--primary, #3b82f6); font-family:monospace;">00:00:00</span>
            <button id="btn-terminar-ronda" style="
              padding: 8px 12px;
              background: #ef4444;
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 500;
            ">
              Terminar Ronda
            </button>
          </div>
        </header>

        <div style="flex:1; overflow-y:auto;">
          <div id="puntos-marcacion" style="display:flex; flex-direction:column; gap:10px;">
            <!-- Se llenará con los puntos -->
          </div>
        </div>
      </div>
    `;

    // Iniciar cronómetro
    iniciarCronometro();

    // Cargar puntos
    cargarPuntosRonda(ronda);

    // Botón terminar ronda
    document.getElementById('btn-terminar-ronda').addEventListener('click', terminarRonda);
  }

  // ===================== CRONÓMETRO =====================
  let intervaloCronometro = null;

  function iniciarCronometro() {
    const cronometroEl = document.getElementById('cronometro');
    
    if (intervaloCronometro) clearInterval(intervaloCronometro);

    intervaloCronometro = setInterval(() => {
      const elapsed = Math.floor((Date.now() - tiempoInicio) / 1000);
      const horas = Math.floor(elapsed / 3600);
      const minutos = Math.floor((elapsed % 3600) / 60);
      const segundos = elapsed % 60;

      cronometroEl.textContent = 
        `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

      // Guardar progreso cada 10 segundos
      if (elapsed % 10 === 0) {
        sessionStorage.setItem('ronda_tiempo', String(elapsed));
      }
    }, 1000);
  }

  // ===================== CARGAR PUNTOS RONDA =====================
  function cargarPuntosRonda(ronda) {
    const container = document.getElementById('puntos-marcacion');
    if (!container) return;

    container.innerHTML = '';

    if (!ronda.puntoRonda) {
      container.innerHTML = '<p style="color:#999;">Sin puntos de ronda configurados</p>';
      return;
    }

    Object.entries(ronda.puntoRonda).forEach(([indice, punto]) => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: var(--surface, #222);
        border: 1px solid var(--border, #333);
        border-radius: 8px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.2s;
      `;

      const numQRs = punto.length;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong style="color:var(--text-primary, #fff);">Punto ${parseInt(indice) + 1}</strong>
            <div style="font-size:0.8em; color:var(--text-secondary, #ccc);">📍 ${numQRs} código(s) QR</div>
          </div>
          <div style="
            background: var(--primary, #3b82f6);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 500;
          ">
            Marcar
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        abrirEscaneadorPunto(ronda, indice, punto);
      });

      container.appendChild(card);
    });
  }

  // ===================== ESCANEADOR PUNTO =====================
  async function abrirEscaneadorPunto(ronda, indice, codigosQR) {
    console.log(`📸 Abriendo escaneador para punto ${indice}`, codigosQR);

    // Crear modal de escaneador
    const modal = document.createElement('div');
    modal.id = 'scanner-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #000;
      z-index: 2000;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 15px;
    `;

    modal.innerHTML = `
      <div style="text-align:center; color:white; margin-bottom:20px;">
        <h3>Escanear QR - Punto ${parseInt(indice) + 1}</h3>
        <p style="font-size:0.9em; color:#ccc;">Apunta la cámara al código QR</p>
      </div>
      <video id="scanner-video" style="width:100%; max-width:400px; border-radius:8px; background:#111;"></video>
      <canvas id="scanner-canvas" hidden></canvas>
      <div style="margin-top:20px; color:white;">
        <p id="scanner-status" style="margin:0; font-size:0.9em; color:#aaa;">Esperando código...</p>
        <p id="scanner-result" style="margin:10px 0 0; font-size:0.9em; color:#4ade80;"></p>
      </div>
      <button id="btn-close-scanner" style="
        margin-top:20px;
        padding:10px 20px;
        background:#ef4444;
        color:white;
        border:none;
        border-radius:6px;
        cursor:pointer;
        font-weight:500;
      ">
        Cerrar
      </button>
    `;

    document.body.appendChild(modal);

    // Cargar zxing si no está disponible
    if (!window.ZXing) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.2/umd/index.min.js';
      script.onload = () => iniciarEscaneo();
      document.head.appendChild(script);
    } else {
      iniciarEscaneo();
    }

    function iniciarEscaneo() {
      const video = document.getElementById('scanner-video');
      const canvas = document.getElementById('scanner-canvas');
      const statusEl = document.getElementById('scanner-status');
      const resultEl = document.getElementById('scanner-result');

      let qrsEscaneados = [];

      // Acceder a cámara
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          video.srcObject = stream;
          video.play();

          // Configurar escaneador
          const codeReader = new window.ZXing.BrowserMultiFormatReader();

          const scanLoop = () => {
            const canvasContext = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (canvas.width > 0 && canvas.height > 0) {
              canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

              try {
                const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
                const luminanceSource = new window.ZXing.HTMLCanvasElementLuminanceSource(canvas);
                const binaryBitmap = new window.ZXing.BinaryBitmap(
                  new window.ZXing.HybridBinarizer(luminanceSource)
                );
                const result = codeReader.decodeFromBitmap(binaryBitmap);

                if (result) {
                  const qrId = result.getText();
                  console.log('✓ QR Escaneado:', qrId);

                  // Validar que el QR esté en los códigos esperados
                  if (codigosQR.includes(qrId)) {
                    // QR válido
                    if (!qrsEscaneados.includes(qrId)) {
                      qrsEscaneados.push(qrId);
                      resultEl.textContent = `✓ ${qrId} (${qrsEscaneados.length}/${codigosQR.length})`;
                      resultEl.style.color = '#4ade80';

                      // Obtener información del QR desde la colección QR_CODES
                      obtenerInfoQR(qrId, ronda, indice, codigosQR);

                      // Si se escanearon todos, cerrar automáticamente
                      if (qrsEscaneados.length === codigosQR.length) {
                        statusEl.textContent = '✓ Punto completado!';
                        setTimeout(() => {
                          cerrarScanner();
                        }, 1500);
                      }
                    }
                  } else {
                    resultEl.textContent = `✗ QR no válido para este punto`;
                    resultEl.style.color = '#f87171';
                  }
                }
              } catch (e) {
                // Sin QR detectado, continuar
              }
            }

            if (modal.parentElement) {
              requestAnimationFrame(scanLoop);
            }
          };

          scanLoop();
        })
        .catch(err => {
          console.error('Error accediendo cámara:', err);
          statusEl.textContent = '✗ No se pudo acceder a la cámara';
          resultEl.style.color = '#f87171';
        });
    }

    // Botón cerrar
    modal.querySelector('#btn-close-scanner').addEventListener('click', cerrarScanner);

    function cerrarScanner() {
      const video = document.getElementById('scanner-video');
      if (video && video.srcObject) {
        video.srcObject.getTracks().forEach(t => t.stop());
      }
      modal.remove();
    }
  }

  // ===================== OBTENER INFO QR =====================
  async function obtenerInfoQR(qrId, ronda, puntoIndice, codigosQR) {
    try {
      const snap = await db.collection('QR_CODES').doc(qrId).get();

      if (snap.exists) {
        const qrData = snap.data();
        console.log('📋 Info QR:', qrData);

        // Verificar si requiere preguntas
        if (qrData.questions && qrData.questions.some(q => q.requireQuestion === true)) {
          console.log('❓ Este QR requiere responder preguntas');
          abrirModalPreguntas(qrId, qrData, ronda, puntoIndice);
        } else {
          // Sin preguntas, guardar marcación directamente
          guardarMarcacion(qrId, ronda, puntoIndice, qrData, {});
        }
      } else {
        console.warn('QR no encontrado en QR_CODES:', qrId);
      }
    } catch (e) {
      console.error('Error obteniendo info del QR:', e);
    }
  }

  // ===================== MODAL PREGUNTAS =====================
  function abrirModalPreguntas(qrId, qrData, ronda, puntoIndice) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2001;
      padding: 15px;
    `;

    const respuestas = {};

    let contenidoPreguntas = '';
    if (qrData.questions && Array.isArray(qrData.questions)) {
      qrData.questions.forEach((q, idx) => {
        if (q.requireQuestion === true) {
          contenidoPreguntas += `
            <div style="margin-bottom:15px; padding:12px; background:var(--background, #111); border-radius:6px;">
              <label style="display:block; margin-bottom:8px; font-weight:500;">
                ${q.nombre || `Pregunta ${idx + 1}`}
              </label>
              <textarea id="resp-${idx}" rows="3" style="
                width:100%;
                padding:8px;
                background:var(--surface, #222);
                border:1px solid var(--border, #333);
                border-radius:4px;
                color:var(--text-primary, #fff);
                font-family:inherit;
                box-sizing:border-box;
              " placeholder="Tu respuesta..."></textarea>
            </div>
          `;
        }
      });
    }

    modal.innerHTML = `
      <div style="
        background: var(--surface, #222);
        border-radius: 12px;
        padding: 20px;
        max-width: 500px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      ">
        <h3 style="margin-top:0; color:var(--text-primary, #fff);">Responder Preguntas</h3>
        <p style="color:var(--text-secondary, #ccc);">QR: <strong>${qrId}</strong></p>
        
        ${contenidoPreguntas}
        
        <div style="display:flex; gap:10px; margin-top:20px;">
          <button class="btn-cancelar" style="flex:1; padding:10px; border:1px solid var(--border, #444); background:transparent; color:var(--text-primary, #fff); border-radius:6px; cursor:pointer;">
            Cancelar
          </button>
          <button class="btn-confirmar" style="flex:1; padding:10px; border:none; background:var(--primary, #3b82f6); color:#fff; border-radius:6px; cursor:pointer; font-weight:500;">
            Confirmar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.btn-cancelar').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('.btn-confirmar').addEventListener('click', () => {
      // Recopilar respuestas
      if (qrData.questions && Array.isArray(qrData.questions)) {
        qrData.questions.forEach((q, idx) => {
          if (q.requireQuestion === true) {
            respuestas[`pregunta_${idx}`] = document.getElementById(`resp-${idx}`)?.value || '';
          }
        });
      }

      console.log('✓ Respuestas guardadas:', respuestas);
      guardarMarcacion(qrId, ronda, puntoIndice, qrData, respuestas);
      modal.remove();
    });
  }

  // ===================== GUARDAR MARCACIÓN =====================
  async function guardarMarcacion(qrId, ronda, puntoIndice, qrData, respuestas) {
    if (!rondaActiva) return;

    try {
      const ahora = new Date();
      const docId = `${rondaActiva.docId}_${puntoIndice}_${qrId}_${Date.now()}`;

      const marcacionData = {
        rondaId: rondaActiva.docId,
        rondaNombre: ronda.nombre,
        punto: parseInt(puntoIndice),
        qrId: qrId,
        qrNombre: qrData.nombre || qrData.qrId || 'Sin nombre',
        usuario: {
          email: currentUser.email,
          uid: currentUser.uid
        },
        cliente: userCtx.cliente,
        unidad: userCtx.unidad,
        puesto: userCtx.puesto,
        timestamp: ahora.toISOString(),
        respuestas: respuestas,
        tiempoTranscurrido: Math.floor((ahora - new Date(tiempoInicio)) / 1000)
      };

      // Guardar en Firestore
      await db.collection('RONDAS').doc(docId).set(marcacionData);
      console.log('✓ Marcación guardada:', docId);

      // Actualizar UI
      const modal = document.getElementById('scanner-modal');
      if (modal) {
        const statusEl = document.getElementById('scanner-status');
        if (statusEl) statusEl.textContent = '✓ Marcación guardada';
      }
    } catch (e) {
      console.error('Error guardando marcación:', e);
      alert('Error: ' + e.message);
    }
  }

  // ===================== TERMINAR RONDA =====================
  function terminarRonda() {
    if (!rondaActiva) return;

    const confirmar = confirm('¿Está seguro de terminar la ronda?');
    if (!confirmar) return;

    if (intervaloCronometro) clearInterval(intervaloCronometro);

    const tiempoTotal = Math.floor((Date.now() - tiempoInicio) / 1000);
    
    console.log('✓ Ronda terminada después de', tiempoTotal, 'segundos');

    // Limpiar
    sessionStorage.removeItem('ronda_activa');
    sessionStorage.removeItem('ronda_tiempo');
    rondaActiva = null;
    tiempoInicio = null;

    const marcacionDiv = document.getElementById('marcacion-container');
    if (marcacionDiv) marcacionDiv.remove();

    // Volver a mostrar lista
    cargarRondas();
  }

  // ===================== RECUPERAR RONDA EN PROGRESO =====================
  window.addEventListener('load', () => {
    const rondaEnCache = sessionStorage.getItem('ronda_activa');
    if (rondaEnCache) {
      const { tiempoInicio: tiempoGuardado } = JSON.parse(rondaEnCache);
      tiempoInicio = tiempoGuardado;
      console.log('📝 Ronda recuperada del caché');
      // TODO: Recuperar y mostrar estado anterior
    }
  });
});
