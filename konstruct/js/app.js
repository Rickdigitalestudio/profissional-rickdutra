/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — lógica da loja (filtros, carrinho, 3D, UI)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var K = window.KONSTRUCT;
  if (!K) return;

  var P = K.P;
  var PER = 9;
  var state = {
    cat: 'All', page: 1, sort: 'def', view: 'grid',
    maxPrice: 100, query: ''
  };
  var cart = [], wish = [];
  var modalProduct = null, modalQty = 1;
  var spotIndex = 0, spotTimer = null;

  try {
    cart = JSON.parse(localStorage.getItem('ks_cart') || '[]');
    wish = JSON.parse(localStorage.getItem('ks_wish') || '[]');
  } catch (e) { }

  /* ═════════ UTILITÁRIOS ═════════ */
  var stars = function (r) {
    r = r || 0;
    return '★'.repeat(r) + '<em>' + '☆'.repeat(5 - r) + '</em>';
  };
  var money = function (n) { return '£' + Number(n).toFixed(2); };

  /* ícones do sprite SVG */
  var HEART = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"></use></svg>';
  var XIC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-close"></use></svg>';
  var CUBE = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cube"></use></svg>';

  /* rótulos acessíveis com a contagem visível */
  function syncLabels() {
    var c = cart.reduce(function (s, p) { return s + p.q; }, 0);
    var cw = wish.length;
    $('cartBtn').setAttribute('aria-label', 'Carrinho, ' + c + (c === 1 ? ' item' : ' itens'));
    $('cartFab').setAttribute('aria-label', 'Abrir carrinho, ' + c + (c === 1 ? ' item' : ' itens'));
    $('wishBtn').setAttribute('aria-label', 'Lista de desejos, ' + cw + (cw === 1 ? ' item' : ' itens'));
  }
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var toastEl = $('toast'), toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, 2600);
  }

  /* ═════════ CATÁLOGO ═════════ */
  function filtered() {
    var q = state.query.trim().toLowerCase();
    var list = P.filter(function (p) {
      if (state.cat !== 'All' && p.c !== state.cat) return false;
      if (p.p > state.maxPrice) return false;
      if (!q) return true;
      /* busca por nome, marca, categoria original e rótulo em português */
      var hay = (p.n + ' ' + p.brand + ' ' + p.c + ' ' + (K.CAT_LABEL[p.c] || '') + ' ' + p.desc).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    var s = state.sort;
    if (s === 'asc') list.sort(function (a, b) { return a.p - b.p; });
    else if (s === 'desc') list.sort(function (a, b) { return b.p - a.p; });
    else if (s === 'name') list.sort(function (a, b) { return a.n.localeCompare(b.n); });
    else if (s === 'rate') list.sort(function (a, b) { return b.r - a.r; });
    else if (s === 'new') list.sort(function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); });
    return list;
  }

  function cardHTML(p) {
    var off = p.old ? Math.round((1 - p.p / p.old) * 100) : 0;
    var stock = (p.id * 7) % 12 + 3;
    var isWish = wish.indexOf(p.n) !== -1;
    var badge = p.sale
      ? '<span class="badge3d sale">' + (off ? '-' + off + '%' : 'SALE') + '</span>'
      : (p.isNew ? '<span class="badge3d new">NOVO</span>' : '');
    return '' +
      '<article class="card" data-id="' + p.id + '">' +
      badge +
      '<button class="like3d' + (isWish ? ' on' : '') + '" data-act="like" data-id="' + p.id + '" aria-label="' + (isWish ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' + HEART + '</button>' +
      '<div class="card-media"><img loading="lazy" src="' + p.img + '" alt="' + esc(p.n) + '" onerror="this.src=\'https://picsum.photos/seed/konstruct' + p.id + '/600/500\'"></div>' +
      '<div class="card-body">' +
      '<span class="card-cat">' + esc(p.c) + '</span>' +
      '<h4>' + esc(p.n) + '</h4>' +
      '<div class="card-pr">' + (p.old ? '<s>' + money(p.old) + '</s>' : '') + money(p.p) +
      (off ? '<span class="off">-' + off + '%</span>' : '') + '</div>' +
      '<div class="card-meta"><div class="stars">' + stars(p.r) + '</div>' +
      '<span class="stock ' + (stock <= 5 ? 'low' : 'ok') + '">' + (stock <= 5 ? '🔥 ' + stock + ' restantes' : '✓ Em estoque') + '</span></div>' +
      (p.sale ? '<div class="soldbar"><i style="width:' + Math.min(92, 38 + p.id * 3) + '%"></i></div>' : '') +
      '<div class="card-quick">' +
      '<button class="q-add" data-act="add" data-id="' + p.id + '">Adicionar</button>' +
      '<button data-act="view" data-id="' + p.id + '">Visor 3D</button>' +
      '</div>' +
      '<button class="view3d" data-act="view" data-id="' + p.id + '" aria-label="Ver ' + esc(p.n) + ' em 3D">' + CUBE + '<span>Ver em 3D</span></button>' +
      '</div></article>';
  }

  function render() {
    var list = filtered();
    var total = Math.max(1, Math.ceil(list.length / PER));
    if (state.page > total) state.page = total;
    if (state.page < 1) state.page = 1;

    var items = list.slice((state.page - 1) * PER, state.page * PER);
    var grid = $('grid');
    grid.className = 'grid' + (state.view === 'list' ? ' list' : '');

    grid.innerHTML = items.length
      ? items.map(cardHTML).join('')
      : '<div class="empty"><b>Nenhum produto encontrado</b>Ajuste o filtro de preço ou tente outro termo de busca.</div>';

    var from = list.length ? (state.page - 1) * PER + 1 : 0;
    var to = from + items.length - 1;
    $('count').textContent = list.length
      ? 'Mostrando ' + from + '–' + to + ' de ' + list.length + ' produtos'
      : 'Nenhum resultado';

    /* paginação */
    var pag = $('pag');
    var html = '';
    var window_ = 2;
    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= state.page - window_ && i <= state.page + window_)) {
        html += '<button class="' + (i === state.page ? 'on' : '') + '" data-page="' + i + '">' + i + '</button>';
      } else if (i === 2 || i === total - 1) {
        html += '<button class="pg-gap">…</button>';
      }
    }
    if (total > 1) html += '<button data-page="' + Math.min(total, state.page + 1) + '" aria-label="Próxima">→</button>';
    pag.innerHTML = html;

    /* categorias */
    $('cats').innerHTML = K.CATS.map(function (c) {
      var n = c === 'All' ? P.length : P.filter(function (p) { return p.c === c; }).length;
      var label = c === 'All' ? 'Todos os produtos' : (K.CAT_LABEL[c] || c);
      return '<li class="' + (c === state.cat ? 'on' : '') + '" data-cat="' + esc(c) + '">' +
        '<span>' + esc(label) + '</span><span>(' + n + ')</span></li>';
    }).join('');

    /* destaques */
    $('feat').innerHTML = K.FEAT.map(function (i) {
      var p = P[i];
      return '<div class="feat" data-act="view" data-id="' + i + '">' +
        '<div class="feat-img"><img src="' + p.img + '" alt="' + esc(p.n) + '" onerror="this.src=\'https://picsum.photos/seed/konstruct' + i + '/120/120\'"></div>' +
        '<div class="feat-txt"><b>' + esc(p.n) + '</b>' +
        '<small>' + '★'.repeat(p.r || 5) + '</small> <em>' + money(p.p) + '</em></div></div>';
    }).join('');

    /* barra lateral do carrinho */
    updateShipBars();
  }

  /* ═════════ CARRINHO ═════════ */
  function addToCart(id, qty) {
    var p = P[id];
    if (!p) return;
    qty = qty || 1;
    var found = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].n === p.n) { found = cart[i]; break; }
    if (found) found.q += qty;
    else cart.push({ n: p.n, p: p.p, img: p.img, q: qty });
    saveCart();
    toast('🛒 ' + p.n + ' adicionado', 'good');
    bump($('cartBtn'));
    bump($('cartFab'));
  }

  function saveCart() {
    try { localStorage.setItem('ks_cart', JSON.stringify(cart)); } catch (e) { }
    renderCart();
  }

  function totals() {
    var cup = ($('cupom').value || '').trim().toUpperCase();
    var sub = cart.reduce(function (s, p) { return s + p.p * p.q; }, 0);
    var disc = cup === 'KONSTRUCT10' ? .10 : (cup === 'FLASH5' ? .05 : 0);
    var after = sub * (1 - disc);
    var ship = cart.length ? (after > 50 ? 0 : 6.9) : 0;
    return { sub: sub, disc: disc, after: after, ship: ship, total: after + ship };
  }

  function renderCart() {
    var count = cart.reduce(function (s, p) { return s + p.q; }, 0);
    $('cc').textContent = count;
    $('ccFab').textContent = count;
    $('drawerCount').textContent = count;
    $('cartBtn').classList.toggle('has', count > 0);

    $('items').innerHTML = cart.length
      ? cart.map(function (p, i) {
        return '<div class="citem">' +
          '<div class="citem-img"><img src="' + p.img + '" alt="' + esc(p.n) + '"></div>' +
          '<div class="citem-info"><b>' + esc(p.n) + '</b><small>' + money(p.p) + '</small>' +
          '<div class="citem-qty">' +
          '<button data-cq="dec" data-i="' + i + '">−</button><b>' + p.q + '</b>' +
          '<button data-cq="inc" data-i="' + i + '">+</button></div></div>' +
          '<button class="citem-del" data-cq="del" data-i="' + i + '" aria-label="Remover ' + esc(p.n) + ' do carrinho">' + XIC + '</button>' +
          '</div>';
      }).join('')
      : '<div class="drawer-empty"><b>🛒</b>Seu carrinho está vazio.<br>Explore a vitrine 3D e escolha suas ferramentas.</div>';

    var t = totals();
    $('subTotal').textContent = money(t.sub);
    $('shipCost').textContent = t.ship === 0 ? 'Grátis' : money(t.ship);
    $('total').textContent = money(t.total);
    syncLabels();

    updateShipBars();
  }

  function updateShipBars() {
    var t = totals();
    var pct = cart.length ? Math.min(100, (t.after / 50) * 100) : 0;
    var msg = !cart.length
      ? 'Adicione produtos para calcular o frete'
      : (t.after >= 50 ? '🎉 Frete grátis desbloqueado!' : 'Faltam ' + money(50 - t.after) + ' para frete grátis');
    if ($('shipFill')) $('shipFill').style.width = pct + '%';
    if ($('shipMsg')) $('shipMsg').textContent = msg;
    if ($('promoFill')) $('promoFill').style.width = pct + '%';
    if ($('promoTxt')) $('promoTxt').textContent = msg;
  }

  function toggleCart(open) {
    $('drawer').classList.toggle('open', open);
    $('scrim').classList.toggle('on', open);
    document.body.classList.toggle('locked', open);
    if (open) renderCart();
  }

  function checkout() {
    if (!cart.length) { toast('⚠️ Seu carrinho está vazio', 'warn'); return; }
    var t = totals();
    var num = 'KS-' + Date.now().toString().slice(-6);
    var lines = cart.map(function (p) { return '- ' + p.n + ' x' + p.q + ' ' + money(p.p); }).join('\n');
    var msg = 'Pedido ' + num + ' KONSTRUCT:\n' + lines +
      '\nSubtotal: ' + money(t.sub) +
      (t.disc ? '\nCupom aplicado: -' + Math.round(t.disc * 100) + '%' : '') +
      '\nFrete: ' + (t.ship === 0 ? 'Grátis' : money(t.ship)) +
      '\nTotal: ' + money(t.total);
    window.open('https://wa.me/5511989426415?text=' + encodeURIComponent(msg), '_blank');
    cart = [];
    saveCart();
    toggleCart(false);
    toast('✅ Pedido ' + num + ' enviado!', 'good');
  }

  /* ═════════ LISTA DE DESEJOS ═════════ */
  function toggleWish(id, btn) {
    var p = P[id];
    if (!p) return;
    var i = wish.indexOf(p.n);
    if (i !== -1) { wish.splice(i, 1); toast('Removido dos desejos'); }
    else { wish.push(p.n); toast('♥ ' + p.n + ' nos desejos', 'good'); }
    $('wc').textContent = wish.length;
    try { localStorage.setItem('ks_wish', JSON.stringify(wish)); } catch (e) { }
    document.querySelectorAll('.like3d[data-id="' + id + '"]').forEach(function (b) {
      var on = wish.indexOf(p.n) !== -1;
      b.classList.toggle('on', on);
      b.setAttribute('aria-label', on ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    });
    syncLabels();
    if (btn) btn.classList.toggle('on', wish.indexOf(p.n) !== -1);
  }

  function bump(el) {
    if (!el) return;
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }

  /* ═════════ VISOR 3D (MODAL) ═════════ */
  var viewer = null, viewerReady = false;

  function initViewer() {
    if (viewerReady || !window.KViewer) return;
    viewerReady = true;
    var canvas = $('viewerCanvas');
    try {
      viewer = new KViewer(canvas, {
        size: 2.15,
        onPreset: function (name) {
          var lbl = $('vLight').querySelector('span');
          if (lbl) lbl.textContent = name;
        }
      });
    } catch (e) {
      viewer = null;
      var fb = $('vFallback');
      if (fb) fb.hidden = false;
    }
  }

  function openViewer(id) {
    var p = P[id];
    if (!p) return;
    modalProduct = p;
    modalQty = 1;
    $('vQty').textContent = '1';
    $('vName').textContent = p.n;
    $('vBrand').textContent = p.brand;
    $('vStars').innerHTML = stars(p.r);
    $('vDesc').textContent = p.desc;
    $('vSpecs').innerHTML = p.specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('vBadge').textContent = p.sale ? 'Oferta' : (p.isNew ? 'Novidade' : p.c);
    $('vPrice').innerHTML = (p.old ? '<s>' + money(p.old) + '</s>' : '') + money(p.p);
    $('vWish').textContent = wish.indexOf(p.n) !== -1 ? 'Remover dos desejos' : 'Adicionar aos desejos';

    $('viewer').classList.add('open');
    document.body.classList.add('locked');

    initViewer();
    if (viewer) {
      viewer.setProduct(p);
      viewer.start();
    }
  }

  function closeViewer() {
    $('viewer').classList.remove('open');
    if (!$('drawer').classList.contains('open')) document.body.classList.remove('locked');
    if (viewer) viewer.stop();
  }

  /* ═════════ VITRINE 3D (SPOTLIGHT) ═════════ */
  var spotViewer = null, spotReady = false;

  function initSpotlight() {
    if (spotReady || !window.KViewer) return;
    spotReady = true;
    try {
      spotViewer = new KViewer($('spotCanvas'), {
        size: 2.0, pedestal: true, autoSpin: true,
        onPreset: function (name) {
          var lbl = $('spLight').querySelector('span');
          if (lbl) lbl.textContent = name;
        }
      });
    } catch (e) { spotViewer = null; }
    showSpot(0, true);
  }

  function showSpot(idx, instant) {
    spotIndex = (idx + K.SPOT.length) % K.SPOT.length;
    var p = P[K.SPOT[spotIndex]];
    if (!p) return;
    $('spBrand').textContent = p.brand;
    $('spTag').textContent = p.sale ? 'Oferta' : (p.isNew ? 'Novidade' : p.c);
    $('spName').textContent = p.n;
    $('spStars').innerHTML = stars(p.r);
    $('spDesc').textContent = p.desc;
    $('spSpecs').innerHTML = p.specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('spPrice').innerHTML = (p.old ? '<s>' + money(p.old) + '</s>' : '') + money(p.p) +
      (p.old ? '<span class="save">-' + Math.round((1 - p.p / p.old) * 100) + '%</span>' : '');
    $('spDots').innerHTML = K.SPOT.map(function (s, i) {
      return '<i class="' + (i === spotIndex ? 'on' : '') + '" data-i="' + i + '"></i>';
    }).join('');

    if (spotViewer) {
      spotViewer.setProduct(p);
      if (!instant) {
        spotViewer.intro = 0;
        spotViewer.applyExplode(false);
        $('spExplode').classList.remove('on');
      }
    }
  }

  function startSpotCycle() {
    clearInterval(spotTimer);
    spotTimer = setInterval(function () {
      if ($('spotlight').getBoundingClientRect().bottom < 0) return;
      if ($('viewer').classList.contains('open')) return;
      showSpot(spotIndex + 1);
    }, 7000);
  }

  /* ═════════ HERO 3D ═════════ */
  function initHero() {
    if (!window.KHero) return;
    var canvas = $('heroCanvas');
    try {
      var hero = new KHero(canvas, {
        onPick: function (product) {
          openViewer(product.id);
        },
        onHover: function (product) {
          var tag = $('heroTag');
          if (!tag) return;
          if (product) {
            tag.innerHTML = '<b>' + esc(product.brand) + '</b> — ' + esc(product.n);
            tag.classList.add('show');
          } else {
            tag.classList.remove('show');
          }
        }
      });
      window.__konstructHero = hero;
    } catch (e) { }
  }

  /* ═════════ TILT 3D NOS CARDS ═════════ */
  function bindTilt() {
    var grid = $('grid');
    var current = null;

    grid.addEventListener('pointermove', function (e) {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      var card = e.target.closest('.card');
      if (!card) {
        if (current) { resetTilt(current); current = null; }
        return;
      }
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5;
      var y = (e.clientY - r.top) / r.height - .5;
      card.style.setProperty('--ry', (x * 11).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-y * 11).toFixed(2) + 'deg');
      card.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
      card.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
      current = card;
    });

    grid.addEventListener('pointerleave', function () {
      if (current) { resetTilt(current); current = null; }
    });
  }

  function resetTilt(card) {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  }

  /* ═════════ REVEAL ═════════ */
  function bindReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ═════════ CONTADORES ═════════ */
  function bindCounters() {
    var els = document.querySelectorAll('[data-count], .cnt');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) {
        el.textContent = (+el.dataset.count || +el.dataset.n || 0).toLocaleString('pt-BR');
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var n = +(el.dataset.count || el.dataset.n || 0);
        var t0 = performance.now();
        (function step(t) {
          var pr = Math.min(1, (t - t0) / 1500);
          var eased = 1 - Math.pow(1 - pr, 3);
          el.textContent = Math.floor(n * eased).toLocaleString('pt-BR');
          if (pr < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ═════════ CONTAGEM REGRESSIVA ═════════ */
  function bindCountdown() {
    var els = {
      h: document.querySelector('.clk[data-u="h"]'),
      m: document.querySelector('.clk[data-u="m"]'),
      s: document.querySelector('.clk[data-u="s"]')
    };
    var last = {};
    function tick() {
      var now = new Date();
      var end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      var diff = Math.max(0, end - now);
      var h = String(Math.floor(diff / 36e5)).padStart(2, '0');
      var m = String(Math.floor(diff % 36e5 / 6e4)).padStart(2, '0');
      var s = String(Math.floor(diff % 6e4 / 1e3)).padStart(2, '0');
      [['h', h], ['m', m], ['s', s]].forEach(function (pair) {
        var el = els[pair[0]];
        if (!el) return;
        if (last[pair[0]] === pair[1]) return;
        last[pair[0]] = pair[1];
        el.textContent = pair[1];
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      });
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ═════════ MAGNÉTICO NOS BOTÕES ═════════ */
  function bindMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * .28;
        var y = (e.clientY - r.top - r.height / 2) * .35;
        el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ═════════ CURSOR GLOW ═════════ */
  function bindCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    var glow = $('cursorGlow');
    var x = 0, y = 0, tx = 0, ty = 0;
    document.body.classList.add('has-pointer');
    window.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      x += (tx - x) * .12; y += (ty - y) * .12;
      glow.style.transform = 'translate(' + (x - 210) + 'px,' + (y - 210) + 'px)';
      requestAnimationFrame(loop);
    })();
  }

  /* ═════════ NAV / SCROLL ═════════ */
  function bindScroll() {
    var nav = $('nav'), bar = $('scrollBar'), top = $('topBtn');
    function onScroll() {
      var y = window.scrollY;
      nav.classList.toggle('scrolled', y > 40);
      top.classList.toggle('show', y > 700);
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  function bindNav() {
    var toggle = $('menuToggle'), links = $('navLinks');
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.classList.toggle('on', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.classList.remove('on');
      }
    });
    /* link ativo conforme a seção */
    var sections = ['top', 'spotlight', 'produtos', 'categorias', 'contato'];
    window.addEventListener('scroll', function () {
      var y = window.scrollY + 140, current = 'top';
      sections.forEach(function (id) {
        var el = $(id);
        if (el && el.offsetTop !== undefined && el.offsetTop <= y) current = id;
      });
      links.querySelectorAll('a').forEach(function (a) {
        a.classList.toggle('on', a.getAttribute('href') === '#' + current);
      });
    }, { passive: true });
  }

  /* ═════════ FORMULÁRIO ═════════ */
  function bindForm() {
    var form = $('contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('fn'), mail = $('fm'), msg = $('fmsg');
      var ok = true;
      [name, mail].forEach(function (el) { el.classList.remove('err'); });
      if (!name.value.trim()) { name.classList.add('err'); ok = false; }
      if (!/^\S+@\S+\.\S+$/.test(mail.value.trim())) { mail.classList.add('err'); ok = false; }
      if (!ok) { toast('⚠️ Preencha nome e e-mail válido', 'warn'); return; }
      var text = 'Contato pelo site KONSTRUCT\nNome: ' + name.value + '\nE-mail: ' + mail.value + '\n\n' + msg.value;
      window.open('https://wa.me/5511989426415?text=' + encodeURIComponent(text), '_blank');
      name.value = mail.value = msg.value = '';
      toast('✅ Mensagem enviada!', 'good');
    });
  }

  /* ═════════ TÍTULO HERO (letras 3D) ═════════ */
  function splitTitle() {
    var el = $('heroTitle');
    if (!el) return;
    var txt = el.dataset.text || el.textContent;
    el.innerHTML = txt.split('').map(function (ch, i) {
      return '<span class="ch' + (ch === 'O' ? ' g' : '') + '" style="animation-delay:' + (i * .045) + 's">' + ch + '</span>';
    }).join('');
  }

  /* ═════════ EVENTOS GLOBAIS ═════════ */
  function bindActions() {
    /* cards: delegação */
    $('grid').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var id = +btn.dataset.id;
      var act = btn.dataset.act;
      if (act === 'add') addToCart(id, 1);
      else if (act === 'view') openViewer(id);
      else if (act === 'like') toggleWish(id, btn);
    });
    $('feat').addEventListener('click', function (e) {
      var el = e.target.closest('[data-act="view"]');
      if (el) openViewer(+el.dataset.id);
    });

    /* categorias */
    $('cats').addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      state.cat = li.dataset.cat;
      state.page = 1;
      render();
      document.querySelector('#produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* paginação */
    $('pag').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !b.dataset.page) return;
      state.page = +b.dataset.page;
      render();
      window.scrollTo({ top: $('produtos').offsetTop - 90, behavior: 'smooth' });
    });

    /* busca */
    $('q').addEventListener('input', function () {
      state.query = $('q').value;
      state.page = 1;
      render();
    });
    $('searchBtn').addEventListener('click', function () {
      state.query = $('q').value;
      state.page = 1;
      render();
      $('q').focus();
    });

    /* preço */
    $('maxP').addEventListener('input', function () {
      state.maxPrice = +this.value;
      $('plabel').textContent = '£12 – £' + this.value;
      state.page = 1;
      render();
    });
    $('filterBtn').addEventListener('click', function () {
      state.maxPrice = +$('maxP').value;
      state.page = 1;
      render();
      toast('Filtro aplicado: até ' + money(state.maxPrice));
    });

    /* ordenação */
    $('sort').addEventListener('change', function () {
      state.sort = this.value;
      state.page = 1;
      render();
    });

    /* visualização */
    document.querySelector('.view-toggle').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.view = b.dataset.view;
      this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      render();
    });

    /* carrinho */
    $('cartBtn').addEventListener('click', function () { toggleCart(true); });
    $('cartFab').addEventListener('click', function () { toggleCart(true); });
    $('drawerClose').addEventListener('click', function () { toggleCart(false); });
    $('scrim').addEventListener('click', function () { toggleCart(false); });
    $('checkoutBtn').addEventListener('click', checkout);
    $('cupom').addEventListener('input', renderCart);
    $('wishBtn').addEventListener('click', function () {
      toast(wish.length ? '♥ ' + wish.length + ' item(ns) na lista de desejos' : 'Sua lista de desejos está vazia');
    });

    /* itens do carrinho (delegação) */
    $('items').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cq]');
      if (!b) return;
      var i = +b.dataset.i, act = b.dataset.cq;
      if (!cart[i]) return;
      if (act === 'inc') cart[i].q++;
      else if (act === 'dec') { cart[i].q--; if (cart[i].q < 1) cart.splice(i, 1); }
      else if (act === 'del') cart.splice(i, 1);
      saveCart();
    });

    /* modal 3D */
    $('vClose').addEventListener('click', closeViewer);
    $('viewer').addEventListener('click', function (e) { if (e.target === this) closeViewer(); });
    $('vPlus').addEventListener('click', function () { modalQty = Math.min(99, modalQty + 1); $('vQty').textContent = modalQty; });
    $('vMinus').addEventListener('click', function () { modalQty = Math.max(1, modalQty - 1); $('vQty').textContent = modalQty; });
    $('vAdd').addEventListener('click', function () {
      if (!modalProduct) return;
      addToCart(modalProduct.id, modalQty);
      closeViewer();
    });
    $('vWish').addEventListener('click', function () {
      if (!modalProduct) return;
      toggleWish(modalProduct.id, null);
      $('vWish').textContent = wish.indexOf(modalProduct.n) !== -1 ? 'Remover dos desejos' : 'Adicionar aos desejos';
    });
    $('vSpin').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (viewer) viewer.setAutoSpin(on);
    });
    $('vExplode').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (viewer) viewer.applyExplode(on);
    });
    $('vWire').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (viewer) viewer.applyWireframe(on);
    });
    $('vLight').addEventListener('click', function () {
      if (viewer) {
        var name = viewer.applyPreset(viewer.preset + 1);
        var lbl = this.querySelector('span');
        if (lbl) lbl.textContent = name;
      }
    });
    $('vReset').addEventListener('click', function () { if (viewer) viewer.reset(); });
    $('vShot').addEventListener('click', function () {
      if (!viewer) return;
      var url = viewer.snapshot();
      if (!url) { toast('⚠️ Não foi possível gerar a imagem', 'warn'); return; }
      var a = document.createElement('a');
      a.href = url;
      a.download = (modalProduct ? modalProduct.n.replace(/[^a-z0-9]+/gi, '-').toLowerCase() : 'konstruct') + '-3d.png';
      a.click();
      toast('📸 Imagem 3D salva!', 'good');
    });

    /* vitrine */
    $('spPrev').addEventListener('click', function () { showSpot(spotIndex - 1); });
    $('spNext').addEventListener('click', function () { showSpot(spotIndex + 1); });
    $('spDots').addEventListener('click', function (e) {
      var i = e.target.closest('i');
      if (i) showSpot(+i.dataset.i);
    });
    $('spAdd').addEventListener('click', function () {
      var p = P[K.SPOT[spotIndex]];
      if (p) addToCart(p.id, 1);
    });
    $('spOpen').addEventListener('click', function () {
      var p = P[K.SPOT[spotIndex]];
      if (p) openViewer(p.id);
    });
    $('spSpin').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (spotViewer) spotViewer.setAutoSpin(on);
    });
    $('spExplode').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (spotViewer) spotViewer.applyExplode(on);
    });
    $('spWire').addEventListener('click', function () {
      var on = !this.classList.contains('on');
      this.classList.toggle('on', on);
      if (spotViewer) spotViewer.applyWireframe(on);
    });
    $('spLight').addEventListener('click', function () {
      if (spotViewer) {
        var name = spotViewer.applyPreset(spotViewer.preset + 1);
        var lbl = this.querySelector('span');
        if (lbl) lbl.textContent = name;
      }
    });
    $('heroSpinBtn').addEventListener('click', function () {
      $('spotlight').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* cupons */
    document.querySelectorAll('.coupon-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $('cupom').value = chip.dataset.coupon;
        renderCart();
        toggleCart(true);
        toast('🎟️ Cupom ' + chip.dataset.coupon + ' aplicado', 'good');
      });
    });

    /* ESC fecha overlays */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('viewer').classList.contains('open')) closeViewer();
        else if ($('drawer').classList.contains('open')) toggleCart(false);
      }
    });
  }

  /* ═════════ LOADER ═════════ */
  function loader() {
    var el = $('loader'), bar = $('loaderBar'), tip = $('loaderTip');
    var p = 0;
    var steps = [
      'Iniciando motor 3D…', 'Carregando modelos…', 'Montando o palco…',
      'Ajustando a iluminação…', 'Tudo pronto!'
    ];
    var iv = setInterval(function () {
      p += 4 + Math.random() * 9;
      if (p > 100) p = 100;
      bar.style.width = p + '%';
      var si = Math.min(steps.length - 1, Math.floor(p / 25));
      tip.textContent = steps[si];
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(function () {
          el.classList.add('done');
          setTimeout(function () { el.style.display = 'none'; }, 800);
        }, 260);
      }
    }, 90);
  }

  /* ═════════ BOOT ═════════ */
  function boot() {
    splitTitle();
    bindTilt();
    bindReveal();
    bindCounters();
    bindCountdown();
    bindMagnetic();
    bindCursor();
    bindScroll();
    bindNav();
    bindForm();
    bindActions();

    render();
    renderCart();
    $('wc').textContent = wish.length;

    /* cena 3D do topo */
    initHero();

    /* vitrine 3D só quando visível (economiza CPU) */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          initSpotlight();
          startSpotCycle();
          io.disconnect();
        }
      }, { threshold: .12 });
      io.observe($('spotlight'));
    }
    /* rede de segurança: se o observer não disparar, inicializa assim mesmo */
    setTimeout(function () {
      if (!spotReady) { initSpotlight(); startSpotCycle(); }
    }, 3500);

    $('year').textContent = new Date().getFullYear();
    loader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
