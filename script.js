/*
  script.js - comportamiento para navbar y FAQ
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
});
