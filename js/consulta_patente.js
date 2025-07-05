// js/consulta_patente.js

document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api/consulta-rto';

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

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dominio: valor })
      });

      if (!resp.ok) {
        throw new Error(`Error ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      renderResult(data);
    } catch (err) {
      showError(`Error: ${err.message}`);
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