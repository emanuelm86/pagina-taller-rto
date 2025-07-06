document.addEventListener('DOMContentLoaded', () => {
  // Configuración automática del API URL basado en el entorno
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const API_URL = isProduction 
    ? 'https://api.controltrans.com.ar/api/consulta-rto'  // Subdominio desde hosting
    : 'http://localhost:3000/api/consulta-rto';
  
  // URL de respaldo con IP del Cloud Server (HTTP para evitar problemas SSL)
  const API_URL_BACKUP = 'http://179.43.126.137/api/consulta-rto';
  
  // Log para debugging
  console.log('🔗 API URL principal:', API_URL);
  console.log('🔗 API URL respaldo:', API_URL_BACKUP);
  console.log('🌐 Entorno:', isProduction ? 'Producción' : 'Desarrollo');
  console.log('🎉 Usando subdominio desde hosting: api.controltrans.com.ar');

  const form          = document.getElementById('formDominio');
  const resultadosDiv = document.getElementById('resultados');
  const rtoContent    = document.querySelector('.rto__content');
  const historialDiv  = document.getElementById('rto-historial');
  const historialDet  = document.getElementById('rto-historial-details');
  const inputField    = document.getElementById('dominio');

  if (resultadosDiv)  resultadosDiv.style.display = 'none';
  if (rtoContent)     rtoContent.style.display    = 'none';
  if (historialDet)   historialDet.open           = false;
  if (!form || !inputField) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const valor = inputField.value.trim().toUpperCase();
    inputField.value = valor;

    const regex1 = /^[A-Z]{3}\d{3}$/;
    const regex2 = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
    if (!regex1.test(valor) && !regex2.test(valor)) {
      return showError('Ingrese un dominio válido: ABC123 o AB123CD');
    }

    clearError();
    showLoading();

    // Función para intentar consulta con respaldo
    async function consultarAPI(url, esRespaldo = false) {
      try {
        console.log(`🔗 Intentando: ${url}`);
        
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ dominio: valor }),
          // Configuración para HTTPS en producción
          ...(isProduction && {
            mode: 'cors',
            credentials: 'omit'
          })
        });

        if (!resp.ok) {
          throw new Error(`Error ${resp.status}: ${resp.statusText}`);
        }

        const data = await resp.json();
        
        // Mostrar mensaje de éxito si se usó respaldo
        if (esRespaldo && isProduction) {
          console.log('✅ Usando URL de respaldo (IP). Dominio puede no estar propagado aún.');
          showSuccessMessage('Consulta exitosa usando servidor de respaldo');
        } else if (!esRespaldo && isProduction) {
          console.log('✅ Usando URL principal (dominio).');
        }
        
        return data;
      } catch (error) {
        console.log(`❌ Error con ${esRespaldo ? 'respaldo' : 'principal'}: ${error.message}`);
        
        if (esRespaldo) {
          throw error; // Si falla el respaldo, lanzar error
        }
        
        // Si falla la URL principal y estamos en producción, intentar con respaldo
        if (isProduction) {
          console.log('⚠️ Fallo URL principal, intentando con respaldo...');
          return consultarAPI(API_URL_BACKUP, true);
        }
        
        throw error;
      }
    }

    try {
      const data = await consultarAPI(API_URL);
      renderResult(data);
    } catch (err) {
      console.error('❌ Error en consulta:', err);
      
      // Detectar si es un problema de certificado SSL
      if (err.message.includes('Failed to fetch') || 
          err.message.includes('certificate') || 
          err.message.includes('SSL') ||
          err.message.includes('net::ERR_CERT')) {
        
        // Mostrar mensaje específico para certificado SSL
        showError('⚠️ Error de certificado SSL. Esto puede deberse a:\n• Dominio aún no propagado completamente\n• Certificado SSL en proceso de validación\n• Es necesario aceptar el certificado en el navegador');
        return;
      }
      
      // Mensajes de error específicos para otros casos
      let mensaje = `Error: ${err.message}`;
      if (err.message.includes('Failed to fetch')) {
        mensaje = '❌ Error de conexión. Verifique:\n• Su conexión a internet\n• Que el servidor esté funcionando\n• Propagación DNS del dominio';
      } else if (err.message.includes('CORS')) {
        mensaje = '❌ Error de política de seguridad (CORS)';
      }
      
      showError(mensaje);
    }
  });

  function showLoading() {
    resultadosDiv.innerHTML = 'Cargando…';
    resultadosDiv.classList.add('solo-cargando');
    resultadosDiv.style.display = 'flex';
    resultadosDiv.style.alignItems = 'center';
    resultadosDiv.style.justifyContent = 'center';
    if (rtoContent)  rtoContent.style.display = 'none';
    if (historialDet) historialDet.open = false;
  }

  function showError(msg) {
    resultadosDiv.innerHTML = `<span style="color:red;">${msg}</span>`;
    resultadosDiv.classList.remove('solo-cargando');
    resultadosDiv.style.display = 'flex';
    inputField.classList.add('input-error');
  }

  function showSuccessMessage(msg) {
    console.log(`✅ ${msg}`);
    // Mostrar mensaje temporal de éxito
    const tempMsg = document.createElement('div');
    tempMsg.style.cssText = 'position:fixed;top:20px;right:20px;background:#4CAF50;color:white;padding:10px;border-radius:5px;z-index:1000;';
    tempMsg.textContent = msg;
    document.body.appendChild(tempMsg);
    setTimeout(() => document.body.removeChild(tempMsg), 3000);
  }

  function clearError() {
    inputField.classList.remove('input-error');
    inputField.removeAttribute('aria-invalid');
  }

  function renderResult(data) {
    let mensaje = '';
    let cssClass = '';
    
    if (data.success) {
      // Verificar si está vigente comparando con la fecha actual
      if (data.vencimiento) {
        const fechaVencimiento = new Date(data.vencimiento.split('/').reverse().join('-'));
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
        
        if (fechaVencimiento >= hoy) {
          mensaje = `VIGENTE - ${data.vencimiento}`;
          cssClass = 'rto-estado--vigente';
        } else {
          mensaje = `VENCIDA - ${data.vencimiento}`;
          cssClass = 'rto-estado--vencida';
        }
      } else {
        mensaje = `VIGENTE`;
        cssClass = 'rto-estado--vigente';
      }
      
      // Mostrar el historial completo
      if (rtoContent) rtoContent.style.display = 'block';
      if (historialDiv && data.htmlCompleto) {
        historialDiv.innerHTML = data.htmlCompleto;
        if (historialDet) historialDet.open = false;
      }
    } else {
      // Sin RTO o error
      mensaje = 'NO POSEE RTO';
      cssClass = 'rto-estado--no-rto';
      
      // Ocultar historial
      if (rtoContent) rtoContent.style.display = 'none';
    }
    
    // Mostrar el mensaje simple
    const estadoHtml = `
      <div class="rto-estado ${cssClass}">
        <div class="rto-estado__info">
          <span class="rto-estado__resultado">${mensaje}</span>
        </div>
      </div>
    `;
    
    resultadosDiv.innerHTML = estadoHtml;
    resultadosDiv.classList.remove('solo-cargando');
    resultadosDiv.style.display = 'flex';
  }

  inputField.addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
  });
  inputField.placeholder = 'ABC123 o AB123CD';
  inputField.addEventListener('focus', () => {
    inputField.placeholder = '';
  });
  inputField.addEventListener('blur', () => {
    if (!inputField.value) {
      inputField.placeholder = 'ABC123 o AB123CD';
    }
  });
});