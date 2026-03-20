/*
  script.js - comportamiento para navbar y FAQ (public)
*/
document.addEventListener('DOMContentLoaded', function(){
  // año en el footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // nav toggle (movil)
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if(navToggle && navList){
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('show');
    });
  }
  
  // FAQ: cada bloque con la estructura .faq-item > .faq-question + .faq-answer
  // El markup es muy fácil de copiar/pegar para añadir nuevas preguntas.
  const faqs = Array.from(document.querySelectorAll('.faq-item'));
  faqs.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    // ensure accessible aria attributes
    if(question){
      question.setAttribute('role','button');
      question.setAttribute('tabindex','0');
    }

    const toggle = () => {
      const isActive = item.classList.toggle('active');
      // simple animation using max-height in CSS; also set aria-expanded
      if(question) question.setAttribute('aria-expanded', String(isActive));
    };

    question && question.addEventListener('click', toggle);
    question && question.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  // Close mobile nav when clicking outside or on link
  document.addEventListener('click', (e) => {
    if(!e.target.closest('.navbar')){
      navList && navList.classList.remove('show');
    }
  });

 
  const PROXY_URL = 'https://tight-violet-b91d.geniololoxd.workers.dev/';

  const licenseForm = document.getElementById('license-form');
  const submitPaid = document.getElementById('submit-paid');
  const formError = document.getElementById('form-error');
  const overlay = document.getElementById('confirm-overlay');
  const overlayClose = document.getElementById('confirm-close');


  function showPopup(el){
    if(!el) return;
    el.classList.remove('hidden');
    // ensure the browser applies the change before adding active
    requestAnimationFrame(() => el.classList.add('active'));
  }

  // --- Ticket generator ---
  // Generates a random ticket in format PNR-XXXXX (letters + digits)
  function generateTicket(){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for(let i=0;i<5;i++){
      result += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return 'PNR-' + result;
  }

  function hidePopup(el){
    if(!el) return;
    el.classList.remove('active');
    // wait for overlay opacity transition to finish, then hide from layout
    const onEnd = (e) => {
      if(e.target !== el || e.propertyName !== 'opacity') return;
      el.classList.add('hidden');
      el.removeEventListener('transitionend', onEnd);
    };
    el.addEventListener('transitionend', onEnd);
    // fallback in case transitionend doesn't fire
    setTimeout(() => { if(!el.classList.contains('hidden')) el.classList.add('hidden'); }, 400);
  }

  if(licenseForm && submitPaid){
    // Helper to show error elegantly
    function showError(msg){
      if(!formError) return alert(msg);
      formError.hidden = false;
      formError.textContent = msg;
      formError.classList.remove('hidden');
      // small animation
      formError.animate([{opacity:0, transform:'translateY(-6px)'},{opacity:1, transform:'translateY(0)'}],{duration:260});
    }

    function clearError(){ if(formError){ formError.hidden = true; formError.textContent = ''; } }

    submitPaid.addEventListener('click', async function(){
      clearError();
      const name = (document.getElementById('fld-name') || {}).value || '';
      const country = (document.getElementById('fld-country') || {}).value || '';
      const payment = (document.getElementById('fld-payment') || {}).value || '';
      const email = (document.getElementById('fld-email') || {}).value.trim() || '';
      const whatsapp = (document.getElementById('fld-whatsapp') || {}).value.trim() || '';
      const legal = (document.getElementById('fld-legal') || {}).checked;

      // Validations
      if(!name) { showError('Por favor ingresa tu nombre.'); return; }
      if(!country) { showError('Por favor ingresa tu país.'); return; }
      if(!email && !whatsapp){ showError('Debes completar Email o WhatsApp (al menos uno).'); return; }
      if(!legal){ showError('Debes aceptar la condición legal para continuar.'); return; }

      // Generate ticket and prepare payload for the proxy (which will forward to Discord)
      // Ticket is generated only when the form is valid
      const ticket = generateTicket();
        const now = new Date();

      const payload = {
        nombre: name,
        email: email,
        whatsapp: whatsapp,
        payment: payment,
        pais: country,
        ticket: ticket,
        fecha: now.toISOString()
      };
      
      // Disable button to prevent double submits
      submitPaid.disabled = true;
      submitPaid.textContent = 'Enviando...';
            
      let sentOk = false;
      try{
        const resp = await fetch(PROXY_URL, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        });
        sentOk = resp.ok;
      }catch(err){
        console.error('Error sending to proxy:', err);
        sentOk = false;
      }

      // small visual register (toast)
      const statusEl = document.getElementById('send-status');
      if(statusEl){
        statusEl.hidden = false;
        statusEl.innerHTML = '';
        const toast = document.createElement('div');
        toast.className = 'send-toast ' + (sentOk ? 'toast-success' : 'toast-error');
        if(sentOk){
          toast.textContent = 'Envío correcto: su pedido fue recibido.';
        } else {
          // show the exact requested message on error
          toast.textContent = 'Error: contactarse con soporte';
        }
        statusEl.appendChild(toast);
        // auto-hide after 6s
        setTimeout(() => {
          if(statusEl){ statusEl.hidden = true; statusEl.innerHTML = ''; }
        }, 6000);
      }

      if(sentOk){
        // put ticket into the popup and show overlay (only on success)
        const ticketEl = document.getElementById('ticketNumber');
        if(ticketEl){
          ticketEl.textContent = ticket;
          // reveal for assistive tech
          const ticketBox = ticketEl.closest('.ticket-box');
          if(ticketBox) ticketBox.setAttribute('aria-hidden','false');
        }
        // Show confirmation overlay (pantalla) only on success (with animation)
        if(overlay){ showPopup(overlay); overlay.scrollIntoView({behavior:'smooth'}); }
        // mark button as sent
        submitPaid.textContent = 'Enviado';
        submitPaid.disabled = true;
      } else {
        // Re-enable button so user can retry
        submitPaid.disabled = false;
        submitPaid.textContent = 'Ya pague / Enviar formulario';
      }
    });
  }

  // Close handler for confirmation overlay (small red X)
  if(overlayClose && overlay){
    overlayClose.addEventListener('click', () => {
      hidePopup(overlay);
      if(submitPaid){ submitPaid.disabled = false; submitPaid.textContent = 'Ya pague / Enviar formulario'; }
    });
  }

  // Close overlay when clicking outside the card
  if(overlay){
    overlay.addEventListener('click', (e) => {
      if(e.target === overlay){
        hidePopup(overlay);
        // re-enable button so user may try again
        if(submitPaid){ submitPaid.disabled = false; submitPaid.textContent = 'Ya pague / Enviar formulario'; }
      }
    });
  }

  // Close overlay on Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')){
      hidePopup(overlay);
      if(submitPaid){ submitPaid.disabled = false; submitPaid.textContent = 'Ya pague / Enviar formulario'; }
    }
  });
});
