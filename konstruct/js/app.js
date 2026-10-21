/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — lógica da loja (filtros avançados, carrinho, 3D)
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var K = window.KONSTRUCT;
  if (!K) return;

  var P = K.P;
  var PER = 12;
  var FREE_SHIP_FROM = 300;      /* frete grátis acima de R$ 300 */
  var PRICE_MIN = 0;
  var PRICE_MAX = Math.ceil(Math.max.apply(null, P.map(function (p) { return p.p; })) / 100) * 100;

  var state = {
    q: '', cats: [], brands: [], minP: PRICE_MIN, maxP: PRICE_MAX,
    rate: 0, sale: false, freeShip: false, sort: 'pop', page: 1, view: 'grid'
  };
  var cart = [], wish = [];
  var modalProduct = null, modalQty = 1;
  var spotIndex = 0, spotTimer = null;

  try {
    cart = JSON.parse(localStorage.getItem('ks_cart') || '[]');
    wish = JSON.parse(localStorage.getItem('ks_wish') || '[]');
  } catch (e) { }

  /* ═════════ UTILITÁRIOS ═════════ */
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  var money = function (n) { return BRL.format(Number(n) || 0); };
  var moneyShort = function (n) {
    n = Number(n) || 0;
    return 'R$ ' + n.toLocaleString('pt-BR');
  };
  var stars = function (r) {
    r = r || 0;
    return '★'.repeat(r) + '<em>' + '☆'.repeat(5 - r) + '</em>';
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* ícones do sprite SVG */
  var HEART = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-heart"></use></svg>';
  var XIC = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-close"></use></svg>';
  var CUBE = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-cube"></use></svg>';
  var CHECK = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"></use></svg>';

  var toastEl = $('toast'), toastTimer;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = 'toast show' + (kind ? ' ' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.className = 'toast'; }, 2600);
  }

  function syncLabels() {
    var c = cart.reduce(function (s, p) { return s + p.q; }, 0);
    var cw = wish.length;
    $('cartBtn').setAttribute('aria-label', 'Carrinho, ' + c + (c === 1 ? ' item' : ' itens'));
    $('cartFab').setAttribute('aria-label', 'Abrir carrinho, ' + c + (c === 1 ? ' item' : ' itens'));
    $('wishBtn').setAttribute('aria-label', 'Lista de desejos, ' + cw + (cw === 1 ? ' item' : ' itens'));
  }

  /* ═════════ FILTRAGEM ═════════ */
  function matches(p, opt) {
    opt = opt || {};
    var skipCat = opt.skipCat, skipBrand = opt.skipBrand, skipPrice = opt.skipPrice;
    if (state.q) {
      var q = state.q.trim().toLowerCase();
      var hay = (p.n + ' ' + p.brand + ' ' + p.c + ' ' + (K.CAT_LABEL[p.c] || '') + ' ' + p.desc + ' ' + p.specs.join(' ')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (!skipCat && state.cats.length && state.cats.indexOf(p.c) === -1) return false;
    if (!skipBrand && state.brands.length && state.brands.indexOf(p.brand) === -1) return false;
    if (!skipPrice) {
      if (p.p < state.minP || p.p > state.maxP) return false;
    }
    if (state.rate && p.r < state.rate) return false;
    if (state.sale && !p.sale) return false;
    if (state.freeShip && p.p < FREE_SHIP_FROM) return false;
    return true;
  }

  function filtered() {
    var list = P.filter(function (p) { return matches(p); });
    var s = state.sort;
    if (s === 'asc') list.sort(function (a, b) { return a.p - b.p; });
    else if (s === 'desc') list.sort(function (a, b) { return b.p - a.p; });
    else if (s === 'name') list.sort(function (a, b) { return a.n.localeCompare(b.n, 'pt-BR'); });
    else if (s === 'rate') list.sort(function (a, b) { return (b.r - a.r) || (b.rc - a.rc); });
    else if (s === 'news') list.sort(function (a, b) { return (b.sale ? 1 : 0) - (a.sale ? 1 : 0) || b.pop - a.pop; });
    else list.sort(function (a, b) { return (b.pop - a.pop) || (b.sold - a.sold); });
    return list;
  }

  /* contagem de cada categoria considerando os OUTROS filtros (padrão de loja) */
  function catCount(cat) {
    var n = 0;
    P.forEach(function (p) {
      if (p.c !== cat) return;
      if (matches(p, { skipCat: true })) n++;
    });
    return n;
  }
  function brandCount(br) {
    var n = 0;
    P.forEach(function (p) {
      if (p.brand !== br) return;
      if (matches(p, { skipBrand: true })) n++;
    });
    return n;
  }
  function rateCount(r) {
    var n = 0;
    P.forEach(function (p) { if (p.r >= r && matches(p)) n++; });
    return n;
  }
  function flagCount(kind) {
    var n = 0;
    P.forEach(function (p) {
      if (kind === 'sale' && !p.sale) return;
      if (kind === 'free' && p.p < FREE_SHIP_FROM) return;
      if (matches(p)) n++;
    });
    return n;
  }

  function activeCount() {
    var n = state.cats.length + state.brands.length;
    if (state.minP > PRICE_MIN || state.maxP < PRICE_MAX) n++;
    if (state.rate) n++;
    if (state.sale) n++;
    if (state.freeShip) n++;
    if (state.q) n++;
    return n;
  }

  /* ═════════ CARTÃO DE PRODUTO ═════════ */
  function cardHTML(p) {
    var off = p.old ? Math.round((1 - p.p / p.old) * 100) : 0;
    var isWish = wish.indexOf(p.n) !== -1;
    var lowStock = p.stock <= 5;
    var badge = p.sale
      ? '<span class="badge3d sale">' + (off ? '-' + off + '%' : 'OFERTA') + '</span>'
      : (p.isNew ? '<span class="badge3d new">NOVO</span>' : '');
    return '' +
      '<article class="card" data-id="' + p.id + '">' +
      badge +
      '<button class="like3d' + (isWish ? ' on' : '') + '" data-act="like" data-id="' + p.id + '" aria-label="' + (isWish ? 'Remover dos favoritos' : 'Adicionar aos favoritos') + '">' + HEART + '</button>' +
      '<div class="card-media">' +
      '<img loading="lazy" src="' + p.img + '" alt="' + esc(p.n) + '" onerror="this.removeAttribute(\'src\');this.classList.add(\'noimg\')">' +
      '<span class="card-sold">🔥 ' + p.sold.toLocaleString('pt-BR') + ' vendidos</span>' +
      '</div>' +
      '<div class="card-body">' +
      '<span class="card-cat">' + esc(p.brand) + ' · ' + esc(K.CAT_LABEL[p.c] || p.c) + '</span>' +
      '<h4>' + esc(p.n) + '</h4>' +
      '<div class="card-pr">' + (p.old ? '<s>' + money(p.old) + '</s>' : '') + money(p.p) +
      (off ? '<span class="off">-' + off + '%</span>' : '') + '</div>' +
      '<div class="card-meta"><div class="stars">' + stars(p.r) + '<i class="rc">(' + p.rc + ')</i></div>' +
      '<span class="stock ' + (lowStock ? 'low' : 'ok') + '">' + (lowStock ? '⚡ ' + p.stock + ' restantes' : '✓ Em estoque') + '</span></div>' +
      (p.sale ? '<div class="soldbar"><i style="width:' + Math.min(94, 32 + p.pop) + '%"></i></div>' : '') +
      '<div class="card-quick">' +
      '<button class="q-add" data-act="add" data-id="' + p.id + '">Adicionar</button>' +
      '<button data-act="view" data-id="' + p.id + '">Visor 3D</button>' +
      '</div>' +
      '<button class="view3d" data-act="view" data-id="' + p.id + '" aria-label="Ver ' + esc(p.n) + ' em 3D">' + CUBE + '<span>Ver em 3D</span></button>' +
      '</div></article>';
  }

  /* ═════════ RENDER ═════════ */
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
      : '<div class="empty"><b>Nenhum produto encontrado</b>Tente remover algum filtro ou buscar por outro termo.</div>';

    var from = list.length ? (state.page - 1) * PER + 1 : 0;
    var to = from + items.length - 1;
    $('count').textContent = list.length
      ? 'Mostrando ' + from + '–' + to + ' de ' + list.length + ' produtos'
      : 'Nenhum resultado';

    renderPagination(total);
    renderFacets();
    renderChips();
    renderHistogram();
    updateShipBars();
  }

  function renderPagination(total) {
    var html = '', win = 2;
    for (var i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= state.page - win && i <= state.page + win)) {
        html += '<button class="' + (i === state.page ? 'on' : '') + '" data-page="' + i + '"' + (i === state.page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      } else if (i === 2 || i === total - 1) {
        html += '<button class="pg-gap">…</button>';
      }
    }
    if (total > 1) html += '<button data-page="' + Math.min(total, state.page + 1) + '" aria-label="Próxima página">→</button>';
    $('pag').innerHTML = html;
  }

  /* facetas (checkbox) */
  function renderFacets() {
    $('cats').innerHTML = K.CATS.map(function (c) {
      var n = catCount(c);
      var on = state.cats.indexOf(c) !== -1;
      var label = K.CAT_LABEL[c] || c;
      return '<li class="check' + (on ? ' on' : '') + (n === 0 && !on ? ' zero' : '') + '">' +
        '<button class="check-box" data-cat="' + esc(c) + '" aria-pressed="' + on + '" aria-label="Filtrar por ' + esc(label) + '"><span class="tick">' + CHECK + '</span></button>' +
        '<span class="check-label">' + esc(label) + '</span>' +
        '<span class="check-n">' + n + '</span></li>';
    }).join('');

    $('brands').innerHTML = K.BRANDS.map(function (b) {
      var n = brandCount(b);
      var on = state.brands.indexOf(b) !== -1;
      return '<li class="check' + (on ? ' on' : '') + (n === 0 && !on ? ' zero' : '') + '">' +
        '<button class="check-box" data-brand="' + esc(b) + '" aria-pressed="' + on + '" aria-label="Filtrar pela marca ' + esc(b) + '"><span class="tick">' + CHECK + '</span></button>' +
        '<span class="check-label">' + esc(b) + '</span>' +
        '<span class="check-n">' + n + '</span></li>';
    }).join('');

    var rates = [[4, '4 ou mais estrelas'], [3, '3 ou mais estrelas'], [2, '2 ou mais estrelas']];
    $('rates').innerHTML = rates.map(function (r) {
      var on = state.rate === r[0];
      var n = rateCount(r[0]);
      return '<li class="check' + (on ? ' on' : '') + (n === 0 && !on ? ' zero' : '') + '">' +
        '<button class="check-box" data-rate="' + r[0] + '" aria-pressed="' + on + '" aria-label="Avaliação ' + r[1] + '"><span class="tick">' + CHECK + '</span></button>' +
        '<span class="check-label"><span class="stars-inline">' + '★'.repeat(r[0]) + '</span> ' + r[1] + '</span>' +
        '<span class="check-n">' + n + '</span></li>';
    }).join('');

    var flags = [
      { k: 'sale', l: 'Somente em promoção', n: flagCount('sale') },
      { k: 'free', l: 'Frete grátis', n: flagCount('free') }
    ];
    $('flags').innerHTML = flags.map(function (f) {
      var on = f.k === 'sale' ? state.sale : state.freeShip;
      return '<li class="check' + (on ? ' on' : '') + '">' +
        '<button class="check-box" data-flag="' + f.k + '" aria-pressed="' + on + '" aria-label="' + f.l + '"><span class="tick">' + CHECK + '</span></button>' +
        '<span class="check-label">' + f.l + '</span>' +
        '<span class="check-n">' + f.n + '</span></li>';
    }).join('');

    $('popularTags').innerHTML = K.POPULAR.map(function (t) {
      return '<button class="tag" data-q="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');

    /* mais desejados */
    $('feat').innerHTML = K.FEAT.map(function (i) {
      var p = K.byId(i);
      if (!p) return '';
      return '<div class="feat" data-act="view" data-id="' + p.id + '">' +
        '<div class="feat-img"><img src="' + p.img + '" alt="' + esc(p.n) + '" loading="lazy"></div>' +
        '<div class="feat-txt"><b>' + esc(p.n) + '</b>' +
        '<small>' + '★'.repeat(p.r || 5) + '</small> <em>' + money(p.p) + '</em></div></div>';
    }).join('');

    $('filterCount').textContent = activeCount();
  }

  /* chips de filtros ativos */
  function renderChips() {
    var chips = [];
    state.cats.forEach(function (c) {
      chips.push('<button class="chip" data-rm="cat" data-val="' + esc(c) + '">' + esc(K.CAT_LABEL[c] || c) + XIC + '</button>');
    });
    state.brands.forEach(function (b) {
      chips.push('<button class="chip" data-rm="brand" data-val="' + esc(b) + '">' + esc(b) + XIC + '</button>');
    });
    if (state.minP > PRICE_MIN || state.maxP < PRICE_MAX) {
      chips.push('<button class="chip" data-rm="price">' + moneyShort(state.minP) + ' – ' + moneyShort(state.maxP) + XIC + '</button>');
    }
    if (state.rate) chips.push('<button class="chip" data-rm="rate">' + state.rate + '+ estrelas' + XIC + '</button>');
    if (state.sale) chips.push('<button class="chip" data-rm="sale">Em promoção' + XIC + '</button>');
    if (state.freeShip) chips.push('<button class="chip" data-rm="free">Frete grátis' + XIC + '</button>');
    if (state.q) chips.push('<button class="chip" data-rm="q">“' + esc(state.q) + '”' + XIC + '</button>');

    $('activeChips').innerHTML = chips.join('');
    $('activeChips').classList.toggle('on', chips.length > 0);
    $('clearFilters').style.display = chips.length ? '' : 'none';
  }

  /* histograma de preços */
  function renderHistogram() {
    var BUCKETS = 16;
    var step = (PRICE_MAX - PRICE_MIN) / BUCKETS;
    var bins = new Array(BUCKETS).fill(0);
    P.forEach(function (p) {
      var i = Math.min(BUCKETS - 1, Math.floor((p.p - PRICE_MIN) / step));
      bins[i]++;
    });
    var max = Math.max.apply(null, bins) || 1;
    var html = bins.map(function (n, i) {
      var lo = PRICE_MIN + i * step, hi = lo + step;
      var active = state.maxP > lo && state.minP < hi;
      return '<button class="hbar' + (active ? ' on' : '') + '" data-lo="' + Math.round(lo) + '" data-hi="' + Math.round(hi) + '" ' +
        'aria-label="Preço entre ' + moneyShort(lo) + ' e ' + moneyShort(hi) + ' (' + n + ' produtos)" ' +
        'title="' + money(lo) + ' – ' + money(hi) + ' (' + n + ')" style="height:' + Math.max(6, (n / max) * 100) + '%"></button>';
    }).join('');
    $('hist').innerHTML = html;
  }

  /* ═════════ CARRINHO ═════════ */
  function addToCart(id, qty) {
    var p = K.byId(id);
    if (!p) return;
    qty = qty || 1;
    var found = null;
    for (var i = 0; i < cart.length; i++) if (cart[i].n === p.n) { found = cart[i]; break; }
    if (found) found.q += qty;
    else cart.push({ n: p.n, p: p.p, img: p.img, q: qty });
    saveCart();
    toast('🛒 ' + p.n + ' no carrinho', 'good');
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
    var ship = cart.length ? (after >= FREE_SHIP_FROM ? 0 : 19.9) : 0;
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
          '<button data-cq="dec" data-i="' + i + '" aria-label="Diminuir">−</button><b>' + p.q + '</b>' +
          '<button data-cq="inc" data-i="' + i + '" aria-label="Aumentar">+</button></div></div>' +
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
    var pct = cart.length ? Math.min(100, (t.after / FREE_SHIP_FROM) * 100) : 0;
    var msg = !cart.length
      ? 'Adicione produtos para calcular o frete'
      : (t.after >= FREE_SHIP_FROM ? '🎉 Frete grátis desbloqueado!' : 'Faltam ' + money(FREE_SHIP_FROM - t.after) + ' para frete grátis');
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
  function toggleWish(id) {
    var p = K.byId(id);
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
    try {
      viewer = new KViewer($('viewerCanvas'), {
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
    var p = K.byId(id);
    if (!p) return;
    modalProduct = p;
    modalQty = 1;
    $('vQty').textContent = '1';
    $('vName').textContent = p.n;
    $('vBrand').textContent = p.brand;
    $('vStars').innerHTML = stars(p.r) + '<i class="rc">(' + p.rc + ' avaliações)</i>';
    $('vDesc').textContent = p.desc;
    $('vCredit').innerHTML = p.credit
      ? '📷 Foto: <a href="' + esc(p.credit.fonte) + '" target="_blank" rel="noopener">' +
        esc(p.credit.autor) + '</a> · ' + esc(p.credit.licenca) + ' · via ' + esc(p.credit.origem)
      : '🖥️ Imagem gerada a partir do modelo 3D deste produto.';
    $('vSpecs').innerHTML = p.specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
    $('vBadge').textContent = p.sale ? 'Oferta' : (K.CAT_LABEL[p.c] || p.c);
    $('vPrice').innerHTML = (p.old ? '<s>' + money(p.old) + '</s>' : '') + money(p.p) +
      (p.sold ? '<span class="save">' + p.sold.toLocaleString('pt-BR') + ' vendidos</span>' : '');
    $('vWish').textContent = wish.indexOf(p.n) !== -1 ? 'Remover dos desejos' : 'Adicionar aos desejos';

    $('viewer').classList.add('open');
    document.body.classList.add('locked');

    initViewer();
    if (viewer) { viewer.setProduct(p); viewer.start(); }
  }

  function closeViewer() {
    $('viewer').classList.remove('open');
    if (!$('drawer').classList.contains('open')) document.body.classList.remove('locked');
    if (viewer) viewer.stop();
  }

  /* ═════════ VITRINE 3D ═════════ */
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
    var p = K.byId(K.SPOT[spotIndex]);
    if (!p) return;
    $('spBrand').textContent = p.brand;
    $('spTag').textContent = p.sale ? 'Oferta' : (K.CAT_LABEL[p.c] || p.c);
    $('spName').textContent = p.n;
    $('spStars').innerHTML = stars(p.r) + '<i class="rc">(' + p.rc + ')</i>';
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
    try {
      window.__konstructHero = new KHero($('heroCanvas'), {
        onPick: function (product) { openViewer(product.id); },
        onHover: function (product) {
          var tag = $('heroTag');
          if (!tag) return;
          if (product) {
            tag.innerHTML = '<b>' + esc(product.brand) + '</b> — ' + esc(product.n);
            tag.classList.add('show');
          } else tag.classList.remove('show');
        }
      });
    } catch (e) { }
  }

  /* ═════════ TILT 3D NOS CARDS ═════════ */
  function bindTilt() {
    var grid = $('grid');
    var current = null;
    grid.addEventListener('pointermove', function (e) {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      var card = e.target.closest('.card');
      if (!card) { if (current) { resetTilt(current); current = null; } return; }
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

  /* ═════════ FILTROS: INTERAÇÕES ═════════ */
  function refresh(resetPage) {
    if (resetPage !== false) state.page = 1;
    render();
  }

  function toggleIn(arr, val) {
    var i = arr.indexOf(val);
    if (i === -1) arr.push(val); else arr.splice(i, 1);
  }

  function bindFilters() {
    /* categorias / marcas / avaliação / flags */
    $('sideFilters').addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat],[data-brand],[data-rate],[data-flag]');
      if (!b) return;
      if (b.dataset.cat !== undefined) toggleIn(state.cats, b.dataset.cat);
      else if (b.dataset.brand !== undefined) toggleIn(state.brands, b.dataset.brand);
      else if (b.dataset.rate !== undefined) state.rate = state.rate === +b.dataset.rate ? 0 : +b.dataset.rate;
      else if (b.dataset.flag === 'sale') state.sale = !state.sale;
      else if (b.dataset.flag === 'free') state.freeShip = !state.freeShip;
      refresh();
    });

    /* chips de filtro ativo */
    $('activeChips').addEventListener('click', function (e) {
      var c = e.target.closest('[data-rm]');
      if (!c) return;
      var k = c.dataset.rm;
      if (k === 'cat') toggleIn(state.cats, c.dataset.val);
      else if (k === 'brand') toggleIn(state.brands, c.dataset.val);
      else if (k === 'price') { state.minP = PRICE_MIN; state.maxP = PRICE_MAX; }
      else if (k === 'rate') state.rate = 0;
      else if (k === 'sale') state.sale = false;
      else if (k === 'free') state.freeShip = false;
      else if (k === 'q') { state.q = ''; $('q').value = ''; }
      syncRange();
      refresh();
    });

    /* limpar tudo */
    $('clearFilters').addEventListener('click', function () {
      state.cats = []; state.brands = []; state.rate = 0;
      state.sale = false; state.freeShip = false; state.q = '';
      state.minP = PRICE_MIN; state.maxP = PRICE_MAX;
      $('q').value = '';
      syncRange();
      refresh();
      toast('Filtros limpos');
    });

    /* busca */
    $('q').addEventListener('input', function () { state.q = $('q').value; refresh(); });
    $('searchBtn').addEventListener('click', function () { state.q = $('q').value; refresh(); $('q').focus(); });

    /* buscas populares */
    $('popularTags').addEventListener('click', function (e) {
      var t = e.target.closest('[data-q]');
      if (!t) return;
      state.q = t.dataset.q;
      $('q').value = t.dataset.q;
      refresh();
      $('produtos').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* faixa de preço (duplo) */
    var minEl = $('minP'), maxEl = $('maxP');
    function onRange() {
      var a = +minEl.value, b = +maxEl.value;
      if (a > b - 10) { if (document.activeElement === minEl) a = b - 10; else b = a + 10; }
      state.minP = Math.max(PRICE_MIN, a);
      state.maxP = Math.min(PRICE_MAX, b);
      minEl.value = state.minP; maxEl.value = state.maxP;
      $('minLbl').textContent = moneyShort(state.minP);
      $('maxLbl').textContent = moneyShort(state.maxP);
      var fill = $('dualFill');
      fill.style.left = (state.minP / PRICE_MAX * 100) + '%';
      fill.style.width = ((state.maxP - state.minP) / PRICE_MAX * 100) + '%';
      refresh();
    }
    minEl.addEventListener('input', onRange);
    maxEl.addEventListener('input', onRange);

    /* histograma: clique define a faixa */
    $('hist').addEventListener('click', function (e) {
      var b = e.target.closest('[data-lo]');
      if (!b) return;
      state.minP = +b.dataset.lo;
      state.maxP = Math.min(PRICE_MAX, +b.dataset.hi);
      minEl.value = state.minP; maxEl.value = state.maxP;
      $('minLbl').textContent = moneyShort(state.minP);
      $('maxLbl').textContent = moneyShort(state.maxP);
      var fill = $('dualFill');
      fill.style.left = (state.minP / PRICE_MAX * 100) + '%';
      fill.style.width = ((state.maxP - state.minP) / PRICE_MAX * 100) + '%';
      refresh();
    });

    /* ordenação */
    $('sort').addEventListener('change', function () { state.sort = this.value; refresh(); });

    /* visualização */
    document.querySelector('.view-toggle').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      state.view = b.dataset.view;
      this.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      render();
    });

    /* paginação */
    $('pag').addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || !b.dataset.page) return;
      state.page = +b.dataset.page;
      render();
      window.scrollTo({ top: $('produtos').offsetTop - 90, behavior: 'smooth' });
    });

    /* filtros no mobile */
    $('filterToggle').addEventListener('click', function () {
      document.body.classList.toggle('filters-open');
      $('scrim').classList.toggle('on', document.body.classList.contains('filters-open'));
    });
    $('filterClose').addEventListener('click', function () {
      document.body.classList.remove('filters-open');
      $('scrim').classList.remove('on');
    });
  }

  function syncRange() {
    $('minP').value = state.minP;
    $('maxP').value = state.maxP;
    $('minLbl').textContent = moneyShort(state.minP);
    $('maxLbl').textContent = moneyShort(state.maxP);
    var fill = $('dualFill');
    fill.style.left = (state.minP / PRICE_MAX * 100) + '%';
    fill.style.width = ((state.maxP - state.minP) / PRICE_MAX * 100) + '%';
  }

  /* ═════════ REVEAL / CONTADORES / CONTAGEM ═════════ */
  function bindReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: .12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function bindCounters() {
    var els = document.querySelectorAll('[data-count], .cnt');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = (+el.dataset.count || +el.dataset.n || 0).toLocaleString('pt-BR'); });
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
          el.textContent = Math.floor(n * (1 - Math.pow(1 - pr, 3))).toLocaleString('pt-BR');
          if (pr < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: .4 });
    els.forEach(function (el) { io.observe(el); });
  }

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
        if (!el || last[pair[0]] === pair[1]) return;
        last[pair[0]] = pair[1];
        el.textContent = pair[1];
        el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick');
      });
    }
    tick(); setInterval(tick, 1000);
  }

  /* ═════════ MAGNÉTICO / CURSOR / SCROLL / NAV ═════════ */
  function bindMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .28) + 'px,' +
          ((e.clientY - r.top - r.height / 2) * .35) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

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
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.classList.remove('on'); }
    });
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

  function splitTitle() {
    var el = $('heroTitle');
    if (!el) return;
    var txt = el.dataset.text || el.textContent;
    el.innerHTML = txt.split('').map(function (ch, i) {
      return '<span class="ch' + (ch === 'O' ? ' g' : '') + '" style="animation-delay:' + (i * .045) + 's">' + ch + '</span>';
    }).join('');
  }

  /* ═════════ DEMAIS AÇÕES ═════════ */
  function bindActions() {
    $('grid').addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var id = +btn.dataset.id, act = btn.dataset.act;
      if (act === 'add') addToCart(id, 1);
      else if (act === 'view') openViewer(id);
      else if (act === 'like') toggleWish(id);
    });
    $('feat').addEventListener('click', function (e) {
      var el = e.target.closest('[data-act="view"]');
      if (el) openViewer(+el.dataset.id);
    });

    $('cartBtn').addEventListener('click', function () { toggleCart(true); });
    $('cartFab').addEventListener('click', function () { toggleCart(true); });
    $('drawerClose').addEventListener('click', function () { toggleCart(false); });
    $('checkoutBtn').addEventListener('click', checkout);
    $('cupom').addEventListener('input', renderCart);
    $('wishBtn').addEventListener('click', function () {
      toast(wish.length ? '♥ ' + wish.length + ' item(ns) na lista de desejos' : 'Sua lista de desejos está vazia');
    });

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
      toggleWish(modalProduct.id);
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

    $('spPrev').addEventListener('click', function () { showSpot(spotIndex - 1); });
    $('spNext').addEventListener('click', function () { showSpot(spotIndex + 1); });
    $('spDots').addEventListener('click', function (e) {
      var i = e.target.closest('i');
      if (i) showSpot(+i.dataset.i);
    });
    $('spAdd').addEventListener('click', function () {
      var p = K.byId(K.SPOT[spotIndex]);
      if (p) addToCart(p.id, 1);
    });
    $('spOpen').addEventListener('click', function () {
      var p = K.byId(K.SPOT[spotIndex]);
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

    document.querySelectorAll('.coupon-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        $('cupom').value = chip.dataset.coupon;
        renderCart();
        toggleCart(true);
        toast('🎟️ Cupom ' + chip.dataset.coupon + ' aplicado', 'good');
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if ($('viewer').classList.contains('open')) closeViewer();
        else if (document.body.classList.contains('filters-open')) {
          document.body.classList.remove('filters-open');
          $('scrim').classList.remove('on');
        } else if ($('drawer').classList.contains('open')) toggleCart(false);
      }
    });
  }

  /* ═════════ LOADER ═════════ */
  function loader() {
    var el = $('loader'), bar = $('loaderBar'), tip = $('loaderTip');
    var p = 0;
    var steps = ['Iniciando motor 3D…', 'Carregando modelos…', 'Montando o palco…', 'Ajustando a iluminação…', 'Tudo pronto!'];
    var iv = setInterval(function () {
      p += 4 + Math.random() * 9;
      if (p > 100) p = 100;
      bar.style.width = p + '%';
      tip.textContent = steps[Math.min(steps.length - 1, Math.floor(p / 25))];
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
    bindFilters();

    /* limites do slider */
    $('minP').max = PRICE_MAX; $('maxP').max = PRICE_MAX;
    $('minP').value = PRICE_MIN; $('maxP').value = PRICE_MAX;
    syncRange();

    render();
    renderCart();
    $('wc').textContent = wish.length;
    $('sideFilters').classList.add('ready');

    initHero();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { initSpotlight(); startSpotCycle(); io.disconnect(); }
      }, { threshold: .12 });
      io.observe($('spotlight'));
    } else { initSpotlight(); startSpotCycle(); }
    setTimeout(function () { if (!spotReady) { initSpotlight(); startSpotCycle(); } }, 3500);

    $('year').textContent = new Date().getFullYear();
    loader();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
