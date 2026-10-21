/* ============================================================
   ANALYTICS — medicao de conversao (GA4)
   Sem isso voce tem visitas e nao sabe de onde vem o lead.

   Eventos disparados:
     - portfolio_view        (carga da pagina)
     - whatsapp_click        (todo clique em link de WhatsApp)
     - lead_form_submit      (envio do formulario de lead)
     - lead_form_error       (falha no envio)
     - scroll_depth          (25 / 50 / 75 / 100)
     - project_filter        (filtro do portfolio)
     - case_view             (case study aberta)
     - cv_download           (download do curriculo em PDF)
     - budget_step           (passo do montador de orcamento)
   ============================================================ */
(function () {
  'use strict';

  // Respeita Do Not Track: nao rastrear quem pediu para nao ser rastreado.
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function track(event, params) {
    if (typeof window.gtag !== 'function') return;
    try { window.gtag('event', event, params || {}); } catch (_) {}
  }

  ready(function () {
    var page = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
    track('portfolio_view', { page_name: page, page_path: location.pathname });

    /* ---------- clique no WhatsApp (todo o site) ---------- */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
      if (!a) return;
      var label = a.getAttribute('data-evento')
        || (a.classList.contains('proj-cta') ? 'projeto_quero_um_assim'
          : a.classList.contains('talk-btn') ? 'nav_talk'
          : a.classList.contains('wa-float') ? 'flutuante'
          : a.classList.contains('btn-light') ? 'cta_principal'
          : 'link_whatsapp');
      track('whatsapp_click', {
        event_category: 'lead',
        event_label: label,
        page_name: page,
        link_url: a.href.split('?')[0]
      });
    }, true);

    /* ---------- formulario de lead ---------- */
    var form = document.getElementById('lead-form');
    if (form) {
      form.addEventListener('submit', function () {
        track('lead_form_submit', { page_name: page, form_name: 'lead_form' });
      });
    }

    /* ---------- download do curriculo ---------- */
    document.querySelectorAll('a[href$=".pdf"]').forEach(function (a) {
      a.addEventListener('click', function () {
        track('cv_download', { page_name: page, link_url: a.getAttribute('href') });
      });
    });

    /* ---------- filtro do portfolio ---------- */
    document.querySelectorAll('.todos-filter button').forEach(function (b) {
      b.addEventListener('click', function () {
        track('project_filter', { page_name: page, filter_name: b.dataset.filter || 'all' });
      });
    });

    /* ---------- profundidade de rolagem ---------- */
    var marks = { 25: 0, 50: 0, 75: 0, 100: 0 };
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var pct = max > 0 ? (window.scrollY / max) * 100 : 100;
        [25, 50, 75, 100].forEach(function (m) {
          if (pct >= m && !marks[m]) {
            marks[m] = 1;
            track('scroll_depth', { page_name: page, percent_scrolled: m });
          }
        });
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- passos do montador de orcamento ---------- */
    document.querySelectorAll('#r_detalhe, .orc-resumo, #orcamento-resumo').forEach(function (el) {
      if (!el.id) el.id = 'r_detalhe';
      var obs = new MutationObserver(function () {
        track('budget_step', { page_name: page, step_value: (el.textContent || '').slice(0, 120) });
      });
      obs.observe(el, { childList: true, subtree: true, characterData: true });
    });
  });
})();
