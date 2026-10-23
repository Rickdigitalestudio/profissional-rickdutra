/* ============================================================
   TechVerse — loja interativa (filtros, 3D, carrinho, compare)
   ============================================================ */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var T = window.TV, P = T.products;
  var fmt = function (v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- estado ---------------- */
  var S = {
    filter: 'All', q: '', sort: 'featured', max: 3200, view: 'grid',
    shown: 12, cart: [], wish: [], cmp: [], theme: 'light'
  };
  function load(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f; } catch (e) { return f; } }
  S.cart = load('tv_cart', []);
  S.wish = load('tv_wish', []);
  S.cmp = load('tv_cmp', []);
  S.theme = localStorage.getItem('tv_theme') || 'light';
  document.documentElement.setAttribute('data-theme', S.theme);

  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function toast(msg) {
    var e = $('toast'); e.textContent = msg; e.classList.add('show');
    clearTimeout(e._t); e._t = setTimeout(function () { e.classList.remove('show'); }, 2400);
  }
  window.toast = toast;

  /* ---------------- hero: legenda + navegação ---------------- */
  window.addEventListener('tv-hero-caption', function (e) {
    var d = e.detail;
    $('capImg').src = d.img; $('capName').textContent = d.n;
    $('capCat').textContent = d.c + ' • ' + (d.i + 1) + '/' + (d.total || P.length);
    $('capPrice').textContent = fmt(d.p);
  });
  window.addEventListener('tv-hero-select', function (e) { openQuick(typeof e.detail.pi === 'number' ? e.detail.pi : e.detail.i); });
  $('capPrev').addEventListener('click', function () { window.Hero3D && Hero3D.prev(); });
  $('capNext').addEventListener('click', function () { window.Hero3D && Hero3D.next(); });
  if (!window.Hero3D) { $('capPrev').style.display = 'none'; $('capNext').style.display = 'none'; }

  /* headline com efeito de digitação */
  (function () {
    var words = ['Gadgets', 'Future', 'Audio', 'Wearables'], w = 0, c = 0, del = false;
    var el = $('rot'); if (!el) return;
    (function type() {
      var word = words[w];
      c += del ? -1 : 1;
      el.innerHTML = word.slice(0, c) + '<span class="cur"></span>';
      var wait = del ? 45 : 95;
      if (!del && c === word.length) { wait = 1700; del = true; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 300; }
      setTimeout(type, reduce ? 4000 : wait);
    })();
  })();

  /* contadores do hero */
  function countUp(el) {
    var to = parseFloat(el.dataset.to), suf = el.dataset.suf || '', st = null;
    function step(ts) {
      if (!st) st = ts;
      var p = Math.min((ts - st) / 1400, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to % 1 ? (to * e).toFixed(1) : Math.round(to * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------------- categorias ---------------- */
  function countOf(c) {
    if (c === 'All') return P.length;
    if (c === 'Deals') return P.filter(function (p) { return p.old > 0; }).length;
    return P.filter(function (p) { return p.c === c; }).length;
  }
  function renderChips() {
    var list = ['All', 'Gadgets', 'Audio', 'Wearables', 'Accessories', 'Smart Devices', 'Deals'];
    $('cats').innerHTML = list.map(function (c) {
      return '<span class="chip ' + (S.filter === c ? 'on' : '') + '" data-f="' + c + '">' +
        c + '<i>' + countOf(c) + '</i></span>';
    }).join('');
  }
  function renderCatGrid() {
    $('catGrid').innerHTML = T.cats.map(function (c) {
      return '<div class="cat ' + (S.filter === c.n ? 'on' : '') + '" data-f="' + c.n + '">' +
        '<img src="' + c.img + '" alt="' + c.n + '" loading="lazy">' +
        '<div><b>' + c.n + '</b><small>' + c.s + ' • ' + countOf(c.n) + ' itens</small></div></div>';
    }).join('');
  }
  function setFilter(f, silent) {
    S.filter = f; S.shown = 12;
    renderChips(); renderCatGrid(); renderProducts();
    if (!silent) toast('Filtro aplicado: ' + f);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-f]');
    if (el) { setFilter(el.dataset.f); if (el.classList.contains('cat')) $('catalog').scrollIntoView({ behavior: 'smooth' }); }
  });

  /* ---------------- produtos ---------------- */
  function matches(p) {
    if (S.filter !== 'All') {
      if (S.filter === 'Deals') { if (!(p.old > 0)) return false; }
      else if (p.c !== S.filter) return false;
    }
    if (p.p > S.max) return false;
    if (S.q) {
      var hay = (p.n + ' ' + p.c + ' ' + p.d).toLowerCase();
      if (hay.indexOf(S.q) < 0) return false;
    }
    return true;
  }
  function likes(p) { return parseFloat(p.l) * (p.l.indexOf('k') > 0 ? 1000 : 1); }
  function sortList(l) {
    var s = S.sort, a = l.slice();
    if (s === 'asc') a.sort(function (x, y) { return x.p - y.p; });
    else if (s === 'desc') a.sort(function (x, y) { return y.p - x.p; });
    else if (s === 'rate') a.sort(function (x, y) { return y.r - x.r; });
    else if (s === 'sold') a.sort(function (x, y) { return soldOf(y) - soldOf(x); });
    else if (s === 'likes') a.sort(function (x, y) { return likes(y) - likes(x); });
    else if (s === 'off') a.sort(function (x, y) { return (y.old ? y.old - y.p : 0) - (x.old ? x.old - x.p : 0); });
    return a;
  }
  function card(p, i) {
    var gi = P.indexOf(p), off = p.old ? Math.round((1 - p.p / p.old) * 100) : 0;
    var inW = S.wish.indexOf(gi) > -1, inC = S.cmp.indexOf(gi) > -1;
    return '<article class="pc" style="animation-delay:' + Math.min(i * 45, 500) + 'ms" data-i="' + gi + '">' +
      '<div class="pi"><img loading="lazy" src="' + p.img + '" alt="' + p.n + '">' +
      (p.badge ? '<span class="tag' + (p.badge === 'Novo' ? ' new' : '') + '">' + p.badge + (off ? ' -' + off + '%' : '') + '</span>' : '') +
      '<button class="like' + (inW ? ' on' : '') + '" data-act="wish" title="Favoritar">♥</button>' +
      '<div class="quick"><button class="q1" data-act="add">Adicionar +</button>' +
      '<button class="q2" data-act="view">Ver em 3D</button></div></div>' +
      '<h4>' + p.n + '</h4>' +
      '<div class="prow"><span class="price">' + fmt(p.p) + (p.old ? '<s class="old">' + fmt(p.old) + '</s>' : '') + '</span>' +
      '<span class="rate"><b>★</b>' + p.r.toFixed(1) + '</span></div>' +
      '<div class="bar"><i style="width:' + Math.min(100, Math.round(p.s / 1.2)) + '%"></i></div>' +
      '<div class="meta"><span class="stock' + (p.s < 15 ? ' low' : '') + '">' +
      (p.s < 15 ? 'últimas ' + p.s + ' un.' : 'estoque ' + p.s + ' un.') + '</span>' +
      '<span class="cmp' + (inC ? ' on' : '') + '" data-act="cmp">⇄ comparar</span></div>' +
      '<div class="meta"><span class="likec">♥ ' + p.l + ' gostos · 🔥 ' + fmtSold(soldOf(p)) + ' vendidos</span></div></article>';
  }
  function renderProducts() {
    var all = sortList(P.filter(matches));
    var list = all.slice(0, S.shown);
    $('count').textContent = all.length + ' produto' + (all.length === 1 ? '' : 's') +
      (S.q ? ' para “' + S.q + '”' : '') + ' • filtro: ' + S.filter;
    $('trend').className = S.view === 'list' ? 'trend list' : 'trend';
    $('trend').innerHTML = list.length
      ? list.map(card).join('')
      : '<div class="empty"><b>Nada por aqui 😕</b>Nenhum produto encontrado. Tente outro termo ou limpe os filtros.<br><br>' +
        '<button class="bR" id="resetAll">Limpar filtros</button></div>';
    var r = $('resetAll');
    if (r) r.addEventListener('click', resetFilters);
    $('more').style.display = all.length > S.shown ? 'block' : 'none';
    $('more').textContent = 'Carregar mais (' + (all.length - S.shown) + ' restantes)';
  }
  function resetFilters() {
    S.filter = 'All'; S.q = ''; S.max = 3200; S.shown = 12; S.sort = 'featured';
    $('q').value = ''; $('sort').value = 'featured'; $('range').value = 3200;
    paintRange(); renderChips(); renderCatGrid(); renderProducts();
    toast('Filtros limpos ✨');
  }

  /* tilt 3D nos cards (delegação) */
  var lastCard = null;
  $('trend').addEventListener('mousemove', function (e) {
    var cardEl = e.target.closest('.pc'); if (!cardEl) return;
    if (lastCard !== cardEl) { if (lastCard) lastCard.style.transform = ''; lastCard = cardEl; }
    var r = cardEl.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    cardEl.style.transform = 'perspective(900px) rotateY(' + (x * 16) + 'deg) rotateX(' + (-y * 16) + 'deg) translateY(-6px) scale(1.02)';
  });
  $('trend').addEventListener('mouseleave', function () {
    if (lastCard) { lastCard.style.transform = ''; lastCard = null; }
  });

  /* cliques nos cards */
  $('trend').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    var art = e.target.closest('.pc'); if (!art) return;
    var i = +art.dataset.i;
    if (!btn) { openQuick(i); return; }
    var act = btn.dataset.act;
    if (act === 'add') addCart(i, 1, true);
    else if (act === 'view') openQuick(i);
    else if (act === 'wish') toggleWish(i);
    else if (act === 'cmp') toggleCmp(i);
  });

  /* ---------------- toolbar ---------------- */
  function paintRange() {
    var r = $('range');
    r.style.setProperty('--pc', (r.value / r.max * 100) + '%');
    $('rval').textContent = 'Até ' + fmt(+r.value);
  }
  $('range').addEventListener('input', function () { S.max = +this.value; S.shown = 12; paintRange(); renderProducts(); });
  $('sort').addEventListener('change', function () { S.sort = this.value; renderProducts(); });
  $('clearF').addEventListener('click', resetFilters);
  document.querySelectorAll('.vbtn').forEach(function (b) {
    b.addEventListener('click', function () {
      S.view = b.dataset.view;
      document.querySelectorAll('.vbtn').forEach(function (x) { x.classList.toggle('on', x === b); });
      renderProducts();
    });
  });
  $('more').addEventListener('click', function () { S.shown += 12; renderProducts(); });
  $('viewAll').addEventListener('click', function () { resetFilters(); $('catalog').scrollIntoView({ behavior: 'smooth' }); });

  /* ---------------- busca + sugestões ---------------- */
  function suggest() {
    var v = $('q').value.trim().toLowerCase();
    if (!v) { $('sug').classList.remove('on'); return; }
    var hits = P.filter(function (p) {
      return (p.n + ' ' + p.c + ' ' + p.d).toLowerCase().indexOf(v) > -1;
    }).slice(0, 5);
    if (!hits.length) { $('sug').classList.remove('on'); return; }
    $('sug').innerHTML = hits.map(function (p) {
      return '<div data-sug="' + P.indexOf(p) + '"><img src="' + p.img + '" alt=""><b>' + p.n + '</b><span>' + fmt(p.p) + '</span></div>';
    }).join('');
    $('sug').classList.add('on');
  }
  $('q').addEventListener('input', function () {
    S.q = this.value.trim().toLowerCase(); S.shown = 12;
    suggest(); renderProducts();
  });
  $('q').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { $('sug').classList.remove('on'); $('catalog').scrollIntoView({ behavior: 'smooth' }); }
    if (e.key === 'Escape') $('sug').classList.remove('on');
  });
  $('sug').addEventListener('mousedown', function (e) {
    var d = e.target.closest('[data-sug]'); if (!d) return;
    $('sug').classList.remove('on'); openQuick(+d.dataset.sug);
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search')) $('sug').classList.remove('on');
  });
  $('searchBtn').addEventListener('click', function () {
    $('catalog').scrollIntoView({ behavior: 'smooth' });
    toast($('q').value ? 'Buscando: ' + $('q').value : 'Mostrando todos os produtos');
  });

  /* ---------------- utilidades deterministicas ---------------- */
  function seed(n) {
    var x = (n * 2654435761) % 2147483647; if (x <= 0) x += 2147483646;
    return function () { x = (x * 48271) % 2147483647; return x / 2147483647; };
  }
  function soldOf(p) { return 60 + (p.id * 137) % 2400; }
  function fmtSold(v) { return v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + 'k' : String(v); }
  function starsOf(k) { return '<b class="st">' + '★★★★★'.slice(0, k) + '<i>' + '☆☆☆☆☆'.slice(0, 5 - k) + '</i></b>'; }

  /* ---------------- cores por produto ---------------- */
  var PALETTE = {
    'Audio': [['Preto', '#17171b'], ['Branco', '#f1f2f4'], ['Azul', '#2b6cff'], ['Grafite', '#4a4f57'], ['Coral', '#ff5a63'], ['Verde névoa', '#7fd1c1']],
    'Wearables': [['Preto', '#141418'], ['Prata', '#c9ccd4'], ['Dourado', '#d9a441'], ['Rosa', '#ff6b9d'], ['Verde', '#2fbf71'], ['Azul noite', '#233554']],
    'Accessories': [['Preto', '#1a1a1f'], ['Branco', '#eceef1'], ['Cinza', '#8b9099'], ['Vermelho', '#e5202d'], ['Azul', '#2b6cff'], ['Bege', '#d8c3a5']],
    'Gadgets': [['Preto', '#101014'], ['Branco', '#e9ebee'], ['Laranja', '#ff8a2b'], ['Verde militar', '#3f5e3a'], ['Azul oceano', '#1f6f8b'], ['Prata', '#c9ccd4']],
    'Smart Devices': [['Branco', '#f4f5f7'], ['Preto', '#17171b'], ['Azul noite', '#233554'], ['Salmão', '#ffb3a7'], ['Verde menta', '#9fd8cb'], ['Cinza', '#8b9099']]
  };
  function colorsOf(p) {
    var pool = PALETTE[p.c] || PALETTE.Audio, rnd = seed(p.id * 3 + 11), out = [], used = {};
    for (var k = 0; k < 4; k++) {
      var i = Math.floor(rnd() * pool.length);
      if (used[i]) i = (i + 1) % pool.length;
      used[i] = 1; out.push(pool[i]);
    }
    return out;
  }

  /* ---------------- avaliacoes dos clientes ---------------- */
  var RNAMES = ['Cecília Almeida', 'Rafael Souza', 'Mariana Costa', 'João Pedro Lima', 'Beatriz Ferreira', 'Lucas Martins', 'Ana Clara Ribeiro', 'Thiago Oliveira', 'Fernanda Dias', 'Gustavo Rocha', 'Patrícia Nunes', 'Diego Barbosa', 'Camila Andrade', 'Rodrigo Teixeira', 'Juliana Moreira', 'Marcos Vinícius', 'Larissa Pinto', 'André Cavalcanti'];
  var RTEXTS = {
    'Audio': ['Som limpo e o cancelamento de ruido surpreendeu, uso todo dia no trabalho.', 'Bateria dura o dia inteiro como prometido, o estojo carrega rapidinho.', 'Graves encorpados sem estourar, assisti uma serie inteira com conforto.', 'Custo beneficio imbativel, comparei com modelos bem mais caros.'],
    'Wearables': ['Acompanho sono e treinos ha um mes e os dados batem com o meu relogio de marca.', 'Tela bonita e legivel mesmo no sol, a bateria vai para mais de uma semana.', 'Uso para correr e nunca perdeu o GPS, resistiu a chuva sem problema.', 'As notificacoes no pulso sao praticas e o app e facil de configurar.'],
    'Accessories': ['Chegou rapido e cabe perfeitamente na minha mesa, acabamento premium.', 'Carrega meus tres aparelhos juntos, nao uso mais tomada cheia em casa.', 'Teclado silencioso e confortavel, trabalho 8h por dia sem cansar os dedos.', 'Melhor acessorio que comprei este ano, recomendo sem medo.'],
    'Gadgets': ['Voo estavel e a camera gravou em qualidade excelente nas minhas viagens.', 'Cabo robusto e carregamento rapido de verdade, testei com o notebook.', 'Leve e dovelavel, cabe na mochila e sai voando em menos de um minuto.', 'Gravacoes nitidas com estabilizacao que parece de gimbal profissional.'],
    'Smart Devices': ['Configurei em 2 minutos e agora controla luzes e tomadas por voz.', 'A voz entende bem mesmo de outro comodo, audio limpo para o tamanho.', 'Integrou com toda a casa inteligente, virou o centro dos meus automatismos.', 'Rotinas automaticas economizaram energia, nota maxima aqui em casa.'],
    '_': ['Produto acima das expectativas, entrega rapida e bem embalado.', 'Qualidade percebida muito superior ao pago, recomendo.', 'Uso diario ha semanas e continua como novo.']
  };
  function revCount(p) { return 24 + (p.id * 13) % 460; }
  function reviewsFor(p) {
    var rnd = seed(p.id + 7), n = 3 + Math.floor(rnd() * 3);
    var pool = RTEXTS[p.c] || RTEXTS._, out = [], usedN = {};
    for (var k = 0; k < n; k++) {
      var ni = Math.floor(rnd() * RNAMES.length);
      if (usedN[ni]) ni = (ni + 1 + k) % RNAMES.length;
      usedN[ni] = 1;
      var st = rnd() < 0.68 ? 5 : (rnd() < 0.6 ? 4 : 3);
      var dias = 2 + Math.floor(rnd() * 200);
      out.push({ n: RNAMES[ni], s: st, t: pool[Math.floor(rnd() * pool.length)], d: dias });
    }
    return out;
  }
  function myRevs(id) { var all = load('tv_revs', {}); return all[id] || []; }
  function revHtml(r) {
    var ini = r.n.trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase();
    return '<div class="rev' + (r.me ? ' me' : '') + '"><span class="av">' + ini + '</span>' +
      '<b>' + r.n + (r.me ? ' <i class="vfy me">sua avaliação</i>' : ' <i class="vfy">✓ compra verificada</i>') + '</b>' +
      starsOf(r.s) +
      '<small>' + (r.d === 0 ? 'agora mesmo' : 'há ' + r.d + ' dias') + '</small>' +
      '<p>' + r.t + '</p></div>';
  }
  function renderRevs(p) {
    var mine = myRevs(p.id).map(function (r) { return { n: r.n, s: r.s, t: r.t, d: 0, me: true }; });
    var revs = mine.concat(reviewsFor(p));
    var media = mine.length ? ((p.r * revCount(p) + mine.reduce(function (s, r) { return s + r.s; }, 0)) / (revCount(p) + mine.length)) : p.r;
    $('revAgg').innerHTML = '★ <b>' + media.toFixed(1) + '</b> · ' + (revCount(p) + mine.length) + ' avaliações';
    $('revList').innerHTML = revs.slice(0, 6).map(revHtml).join('') +
      (revs.length > 6 ? '<button class="bW recl" id="revMore">Ver mais avaliações (' + (revs.length - 6) + ')</button>' : '');
    var more = $('revMore');
    if (more) more.addEventListener('click', function () { $('revList').innerHTML = revs.map(revHtml).join(''); });
  }

  /* ---------------- recomendados ---------------- */
  function renderRecs(p) {
    var same = [];
    for (var k = 0; k < P.length; k++) if (P[k].c === p.c && k !== mIdx) same.push(k);
    var rnd = seed(p.id + 101), picks = {}, out = [];
    while (out.length < 4 && same.length) {
      var k = same[Math.floor(rnd() * same.length)];
      if (!picks[k]) { picks[k] = 1; out.push(k); }
    }
    $('mrecs').innerHTML = out.map(function (k) {
      var q = P[k];
      return '<button class="rec" data-rec="' + k + '"><img loading="lazy" src="' + q.img + '" alt="">' +
        '<b>' + q.n + '</b><span class="rec-p">' + fmt(q.p) + '</span>' +
        '<span class="rec-r">★ ' + q.r.toFixed(1) + ' · ' + fmtSold(soldOf(q)) + ' vendidos</span></button>';
    }).join('');
    $('recCat').textContent = 'Ver todos em ' + p.c + ' →';
  }

  /* ---------------- modal produto (visor 3D) ---------------- */
  var mIdx = 0, mQty = 1, spin = 0, mDrag = false, mLast = 0, spinRaf = null, mColor = '', revStars = 0;

  function specs(p) {
    var off = p.old ? Math.round((1 - p.p / p.old) * 100) : 0;
    return '<div><small>Categoria</small>' + p.c + '</div>' +
      '<div><small>Avaliação</small>★ ' + p.r.toFixed(1) + ' · ' + revCount(p) + ' avaliações</div>' +
      '<div><small>Estoque</small>' + (p.s < 15 ? 'últimas ' + p.s + ' unidades' : p.s + ' unidades') + '</div>' +
      '<div><small>Desconto</small>' + (off ? '-' + off + '%' : 'melhor preço do mês') + '</div>' +
      '<div><small>Entrega</small>grátis acima de ' + fmt(1000) + '</div>' +
      '<div><small>Garantia</small>12 meses • troca 30 dias</div>';
  }
  function openQuick(i) {
    mIdx = i; mQty = 1; spin = 0;
    var p = P[i];
    $('mimg').src = p.img; $('mimg').alt = p.n;
    $('mcat').textContent = p.c + ' • ' + (i + 1) + ' de ' + P.length;
    $('mt').textContent = p.n;
    $('mp').textContent = fmt(p.p);
    $('mold').textContent = p.old ? fmt(p.old) : '';
    $('mdesc').textContent = p.d;
    $('mspecs').innerHTML = specs(p);
    $('mqty').textContent = '1';
    mColor = renderColors(p);
    renderRevs(p);
    renderRecs(p);
    revStars = 0; paintRevStars();
    $('revText').value = ''; $('revName').value = '';
    var mb = $('modal').querySelector('.mbox'); if (mb) mb.scrollTop = 0;
    var inW = S.wish.indexOf(i) > -1;
    $('mwish').textContent = inW ? '♥ Na lista' : '♡ Favoritar';
    var inC = S.cmp.indexOf(i) > -1;
    $('mcmp').classList.toggle('bR', !inC);
    $('mcmp').classList.toggle('bW', inC);
    $('mcmp').textContent = inC ? '✓ Na comparação' : '⇄ Comparar';
    $('modal').classList.add('open');
    document.body.classList.add('lock');
    startSpin();
    $('mcard').style.transform = 'rotateY(0deg)';
  }
  function closeQuick() {
    $('modal').classList.remove('open');
    document.body.classList.remove('lock');
    stopSpin();
  }
  function startSpin() {
    stopSpin();
    if (reduce) return;
    var card = $('mcard');
    (function loop() {
      spinRaf = requestAnimationFrame(loop);
      if (!mDrag) spin += 0.18;
      card.style.transform = 'rotateY(' + spin + 'deg) rotateX(' + tiltX + 'deg)';
    })();
  }
  function stopSpin() { if (spinRaf) cancelAnimationFrame(spinRaf); spinRaf = null; }

  var tiltX = 0;
  $('mview').addEventListener('mousemove', function (e) {
    if (mDrag) return;
    var r = this.getBoundingClientRect();
    var y = (e.clientY - r.top) / r.height - .5;
    tiltX = -y * 16;
  });
  $('mview').addEventListener('mouseleave', function () { tiltX = 0; });
  $('mcard').addEventListener('pointerdown', function (e) {
    mDrag = true; mLast = e.clientX; this.setPointerCapture && this.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', function (e) {
    if (!mDrag) return;
    spin += (e.clientX - mLast) * 0.6; mLast = e.clientX;
  });
  window.addEventListener('pointerup', function () { mDrag = false; });

  function renderColors(p) {
    var cols = colorsOf(p);
    $('colors').innerHTML = 'Cores: ' + cols.map(function (c, k) {
      return '<i data-col="' + k + '" class="' + (k === 0 ? 'on' : '') + '" style="background:' + c[1] + '" title="' + c[0] + '"></i>';
    }).join('') + ' <b id="mcolName">' + cols[0][0] + '</b>';
    return cols[0][0];
  }
  $('colors').addEventListener('click', function (e) {
    var b = e.target.closest('[data-col]'); if (!b) return;
    var cols = colorsOf(P[mIdx]), k = +b.dataset.col;
    mColor = cols[k][0];
    $('colors').querySelectorAll('i').forEach(function (c) { c.classList.remove('on'); });
    b.classList.add('on');
    var nm = $('mcolName'); if (nm) nm.textContent = mColor;
  });
  $('mrecs').addEventListener('click', function (e) {
    var b = e.target.closest('[data-rec]');
    if (b) { openQuick(+b.dataset.rec); var mb = $('modal').querySelector('.mbox'); if (mb) mb.scrollTop = 0; }
  });
  $('recCat').addEventListener('click', function () {
    var f = P[mIdx].c;
    closeQuick(); setFilter(f);
    $('catalog').scrollIntoView({ behavior: 'smooth' });
  });
  function paintRevStars() {
    $('revStars').querySelectorAll('button').forEach(function (b) { b.classList.toggle('on', +b.dataset.s <= revStars); });
  }
  $('revStars').addEventListener('click', function (e) {
    var b = e.target.closest('[data-s]'); if (!b) return;
    revStars = +b.dataset.s; paintRevStars();
  });
  $('revSend').addEventListener('click', function () {
    var txt = $('revText').value.trim(), nome = $('revName').value.trim() || 'Cliente TechVerse';
    if (!revStars) return toast('⚠️ Escolha de 1 a 5 estrelas');
    if (txt.length < 5) return toast('⚠️ Escreva um comentário com pelo menos 5 letras');
    var all = load('tv_revs', {});
    (all[mIdx] = all[mIdx] || []).unshift({ n: nome, s: revStars, t: txt, ts: Date.now() });
    save('tv_revs', all);
    $('revText').value = ''; $('revName').value = ''; revStars = 0; paintRevStars();
    renderRevs(P[mIdx]);
    toast('⭐ Obrigado pela avaliação, ' + nome.split(' ')[0] + '!');
  });

  $('mqm').addEventListener('click', function () { if (mQty > 1) $('mqty').textContent = --mQty; });
  $('mqp').addEventListener('click', function () { if (mQty < P[mIdx].s) $('mqty').textContent = ++mQty; });
  $('madd').addEventListener('click', function () { addCart(mIdx, mQty, true, mColor); closeQuick(); });
  $('mwish').addEventListener('click', function () { toggleWish(mIdx); });
  $('mcmp').addEventListener('click', function () { toggleCmp(mIdx); });
  $('mclose').addEventListener('click', closeQuick);
  $('modal').addEventListener('click', function (e) { if (e.target === this) closeQuick(); });

  /* ---------------- carrinho ---------------- */
  function addCart(i, qty, notify, color) {
    qty = qty || 1;
    var f = S.cart.filter(function (x) { return x.i === i; })[0];
    if (f) { f.q += qty; if (color) f.color = color; }
    else S.cart.push({ i: i, q: qty, color: color || '' });
    save('tv_cart', S.cart); renderCart(true);
    if (notify) toast('🛒 ' + P[i].n + (color ? ' (' + color + ')' : '') + ' adicionado ao carrinho');
  }
  function totals() {
    var sub = S.cart.reduce(function (s, x) { return s + P[x.i].p * x.q; }, 0);
    var off = (($('cupom').value || '').trim().toUpperCase() === 'TECH10') ? sub * 0.1 : 0;
    var base = sub - off;
    var ship = S.cart.length ? (base > 1000 ? 0 : 29.9) : 0;
    return { sub: sub, off: off, ship: ship, tot: base + ship };
  }
  function renderCart(pop) {
    var n = S.cart.reduce(function (s, x) { return s + x.q; }, 0);
    var cc = $('cc'); cc.textContent = n; cc.classList.toggle('hide', !n);
    if (pop && n) { cc.classList.remove('pop'); void cc.offsetWidth; cc.classList.add('pop'); }

    $('items').innerHTML = S.cart.length ? S.cart.map(function (x, k) {
      var p = P[x.i];
      return '<div class="d-item"><img src="' + p.img + '" alt=""><div class="t"><b>' + p.n + '</b>' +
        (x.color ? '<small class="colr">cor: ' + x.color + '</small>' : '') +
        '<small>' + fmt(p.p) + '</small>' +
        '<div class="qty"><button data-cq="' + k + '|-1">−</button><span>' + x.q + '</span>' +
        '<button data-cq="' + k + '|1">+</button></div></div>' +
        '<button class="rm" data-crm="' + k + '" title="Remover">✕</button></div>';
    }).join('') : '<div class="empty-d"><span>🛒</span>Seu carrinho está vazio.<br>Adicione produtos incríveis!</div>';

    var t = totals();
    $('fsub').textContent = fmt(t.sub);
    $('foff').textContent = t.off ? '− ' + fmt(t.off) : '—';
    $('fship').textContent = t.ship ? fmt(t.ship) : (S.cart.length ? 'GRÁTIS' : '—');
    $('ftot').textContent = fmt(t.tot);
    var gap = 1000 - (t.sub - t.off);
    var free = $('free');
    free.style.display = (S.cart.length && gap > 0) ? 'block' : 'none';
    free.textContent = gap > 0 ? 'Faltam ' + fmt(gap) + ' para frete grátis 🚚' : '';
  }
  $('items').addEventListener('click', function (e) {
    var q = e.target.closest('[data-cq]'), rm = e.target.closest('[data-crm]');
    if (q) {
      var parts = q.dataset.cq.split('|'), k = +parts[0], d = +parts[1];
      S.cart[k].q += d;
      if (S.cart[k].q < 1) S.cart.splice(k, 1);
      save('tv_cart', S.cart); renderCart();
    } else if (rm) {
      S.cart.splice(+rm.dataset.crm, 1); save('tv_cart', S.cart); renderCart();
      toast('Produto removido');
    }
  });
  $('cupom').addEventListener('input', renderCart);
  $('clearCart').addEventListener('click', function () {
    if (!S.cart.length) return;
    S.cart = []; save('tv_cart', S.cart); renderCart(); toast('Carrinho esvaziado');
  });
  $('checkout').addEventListener('click', function () {
    if (!S.cart.length) return toast('Carrinho vazio 🛒');
    var t = totLines();
    var num = 'TV-' + Date.now().toString().slice(-6);
    var msg = 'Pedido ' + num + ' TechVerse:%0A' +
      S.cart.map(function (x) { return '- ' + P[x.i].n + (x.color ? ' (' + x.color + ')' : '') + ' x' + x.q + ' = ' + fmt(P[x.i].p * x.q); }).join('%0A') +
      (t.off ? '%0ACupom TECH10: -' + fmt(t.off) : '') +
      '%0AFrete: ' + (t.ship ? fmt(t.ship) : 'GRÁTIS') +
      '%0ATotal: ' + fmt(t.tot);
    localStorage.setItem('tv_last', num);
    toast('✅ Pedido ' + num + ' gerado! Total ' + fmt(t.tot));
    window.open('https://wa.me/' + T.phone + '?text=' + msg, '_blank');
    S.cart = []; save('tv_cart', S.cart); renderCart(); toggleDrawer('drawer', false);
  });
  function totLines() { return totals(); }

  function toggleDrawer(id, force) {
    var el = $(id), open = force !== undefined ? force : !el.classList.contains('open');
    el.classList.toggle('open', open);
    if (open && id !== 'drawer') toggleDrawer('drawer', false);
    if (open && id !== 'wdrawer') toggleDrawer('wdrawer', false);
  }
  $('cartBtn').addEventListener('click', function () { toggleDrawer('drawer'); });
  $('wishBtn').addEventListener('click', function () { toggleDrawer('wdrawer'); });
  $('closeCart').addEventListener('click', function () { toggleDrawer('drawer', false); });
  $('closeWish').addEventListener('click', function () { toggleDrawer('wdrawer', false); });

  /* ---------------- favoritos ---------------- */
  function syncCard(i) {
    document.querySelectorAll('.pc[data-i="' + i + '"]').forEach(function (el) {
      var l = el.querySelector('.like'), c = el.querySelector('.cmp');
      if (l) l.classList.toggle('on', S.wish.indexOf(i) > -1);
      if (c) c.classList.toggle('on', S.cmp.indexOf(i) > -1);
    });
  }
  function syncModal() {
    if (!$('modal').classList.contains('open')) return;
    var inW = S.wish.indexOf(mIdx) > -1;
    $('mwish').textContent = inW ? '♥ Na lista' : '♡ Favoritar';
    var inC = S.cmp.indexOf(mIdx) > -1;
    $('mcmp').classList.toggle('bR', !inC);
    $('mcmp').classList.toggle('bW', inC);
    $('mcmp').textContent = inC ? '✓ Na comparação' : '⇄ Comparar';
  }
  function toggleWish(i) {
    var k = S.wish.indexOf(i);
    if (k > -1) { S.wish.splice(k, 1); toast('Removido dos favoritos'); }
    else { S.wish.push(i); toast('♥ ' + P[i].n + ' nos favoritos'); }
    save('tv_wish', S.wish); renderWish(); syncCard(i); syncModal();
  }
  function renderWish() {
    var wc = $('wc'); wc.textContent = S.wish.length; wc.classList.toggle('hide', !S.wish.length);
    $('wcount').textContent = S.wish.length;
    $('witems').innerHTML = S.wish.length ? S.wish.map(function (i) {
      var p = P[i];
      return '<div class="d-item"><img src="' + p.img + '" alt=""><div class="t"><b>' + p.n + '</b>' +
        '<small>' + fmt(p.p) + '</small><div class="qty">' +
        '<button data-wadd="' + i + '" style="width:auto;padding:0 8px">mover p/ carrinho</button></div></div>' +
        '<button class="rm" data-wrm="' + i + '">✕</button></div>';
    }).join('') : '<div class="empty-d"><span>♡</span>Sua lista de desejos está vazia.</div>';
  }
  $('witems').addEventListener('click', function (e) {
    var a = e.target.closest('[data-wadd]'), r = e.target.closest('[data-wrm]');
    if (a) { addCart(+a.dataset.wadd, 1, true); toggleWish(+a.dataset.wadd); }
    else if (r) toggleWish(+r.dataset.wrm);
  });

  /* ---------------- comparar ---------------- */
  function toggleCmp(i) {
    var k = S.cmp.indexOf(i);
    if (k > -1) S.cmp.splice(k, 1);
    else {
      if (S.cmp.length >= 3) return toast('Máximo de 3 produtos na comparação');
      S.cmp.push(i);
    }
    save('tv_cmp', S.cmp); renderCmp(); syncCard(i); syncModal();
  }
  function renderCmp() {
    var bar = $('cmpBar');
    bar.classList.toggle('on', S.cmp.length > 0);
    $('cmpItems').innerHTML = S.cmp.map(function (i) {
      return '<span class="chipi"><img src="' + P[i].img + '" alt="">' + P[i].n.split(' ').slice(0, 2).join(' ') +
        '<button class="rm" data-cc="' + i + '">✕</button></span>';
    }).join('');
    $('cmpOpen').textContent = 'Comparar (' + S.cmp.length + ')';
    $('cmpOpen').style.display = S.cmp.length < 2 ? 'none' : 'inline-block';
  }
  $('cmpItems').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cc]'); if (b) toggleCmp(+b.dataset.cc);
  });
  $('cmpClear').addEventListener('click', function () {
    S.cmp = []; save('tv_cmp', S.cmp); renderCmp(); renderProducts();
  });
  $('cmpOpen').addEventListener('click', function () {
    var row = function (label, fn) {
      return '<tr><td>' + label + '</td>' + S.cmp.map(function (i) { return '<td>' + fn(P[i], i) + '</td>'; }).join('') + '</tr>';
    };
    $('cmpTable').innerHTML =
      '<table><thead><tr><th>Produto</th>' +
      S.cmp.map(function (i) { return '<th><img src="' + P[i].img + '" alt="">' + P[i].n + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      row('Preço', function (p) { return '<b style="font-size:17px">' + fmt(p.p) + '</b>'; }) +
      row('Categoria', function (p) { return p.c; }) +
      row('Avaliação', function (p) { return '★ ' + p.r.toFixed(1); }) +
      row('Gostos', function (p) { return '♥ ' + p.l; }) +
      row('Estoque', function (p) { return p.s + ' un.'; }) +
      row('Desconto', function (p) { return p.old ? '-' + Math.round((1 - p.p / p.old) * 100) + '%' : '—'; }) +
      row('Ação', function (p, i) { return '<button class="bR" data-addc="' + i + '">Adicionar</button>'; }) +
      '</tbody></table>';
    $('cmpModal').classList.add('open');
    document.body.classList.add('lock');
  });
  $('cmpTable').addEventListener('click', function (e) {
    var b = e.target.closest('[data-addc]');
    if (b) { addCart(+b.dataset.addc, 1, true); $('cmpModal').classList.remove('open'); document.body.classList.remove('lock'); }
  });
  $('cmpClose').addEventListener('click', function () {
    $('cmpModal').classList.remove('open'); document.body.classList.remove('lock');
  });
  $('cmpModal').addEventListener('click', function (e) { if (e.target === this) { this.classList.remove('open'); document.body.classList.remove('lock'); } });

  /* ---------------- ideias ---------------- */
  function renderIdeas() {
    $('ideasGrid').innerHTML = T.ideas.map(function (a) {
      return '<div class="idea reveal" data-key="' + a[3] + '"><img loading="lazy" src="' + a[2] + '" alt="' + a[0] + '">' +
        '<div><b>' + a[0] + '</b><span>' + a[1] + ' ideias • explorar →</span></div></div>';
    }).join('');
    document.querySelectorAll('.idea').forEach(function (el) {
      el.addEventListener('click', function () {
        S.q = ''; $('q').value = '';
        S.filter = 'All'; S.shown = 12;
        var key = el.dataset.key;
        var byCat = ['Audio', 'Wearables', 'Accessories', 'Gadgets', 'Smart Devices'].indexOf(key) > -1;
        S.filter = byCat ? key : 'All';
        if (!byCat) { S.q = key.toLowerCase(); $('q').value = key; }
        renderChips(); renderCatGrid(); renderProducts();
        $('catalog').scrollIntoView({ behavior: 'smooth' });
        toast('💡 Ideia aplicada ao catálogo');
      });
    });
    observeReveal();
  }

  /* ---------------- deals / newsletter ---------------- */
  $('copyCup').addEventListener('click', function () {
    var c = 'TECH10';
    if (navigator.clipboard) navigator.clipboard.writeText(c).catch(function () {});
    $('cupom').value = c; renderCart();
    toast('🎟️ Cupom ' + c + ' copiado: 10% OFF');
  });
  (function countdown() {
    var boxes = [$('cd1'), $('cd2'), $('cd3'), $('cd4')];
    function pad(v) { return v < 10 ? '0' + v : '' + v; }
    setInterval(function () {
      var now = new Date(), end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      var s = Math.max(0, Math.floor((end - now) / 1000));
      var vals = [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60, 7];
      boxes.forEach(function (b, i) { if (b) b.textContent = i === 3 ? vals[3] : pad(vals[i]); });
    }, 1000);
  })();
  $('newsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('mail').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return toast('⚠️ Digite um e-mail válido');
    toast('✅ Inscrição confirmada: ' + v);
    $('mail').value = '';
  });

  /* ---------------- navegação, tema, scroll ---------------- */
  document.querySelectorAll('.nav span').forEach(function (s) {
    s.addEventListener('click', function () {
      document.querySelectorAll('.nav span').forEach(function (x) { x.classList.remove('a'); });
      s.classList.add('a');
      var t = $(s.dataset.go);
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    });
  });
  $('shopNow').addEventListener('click', function () { $('catalog').scrollIntoView({ behavior: 'smooth' }); });
  $('browseBtn').addEventListener('click', function () { $('catGrid').scrollIntoView({ behavior: 'smooth' }); });

  $('themeBtn').addEventListener('click', function () {
    S.theme = S.theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', S.theme);
    localStorage.setItem('tv_theme', S.theme);
    this.textContent = S.theme === 'light' ? '◐' : '☀';
    toast(S.theme === 'light' ? 'Modo claro ☀' : 'Modo escuro 🌙');
  });
  $('themeBtn').textContent = S.theme === 'light' ? '◐' : '☀';

  var toTop = $('toTop');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    $('progress').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    $('top').classList.toggle('shr', y > 12);
    toTop.classList.toggle('on', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* revelar elementos + contadores */
  var io = null;
  if (window.IntersectionObserver) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('v');
        io.unobserve(e.target);
      });
    }, { threshold: .15 });
  }
  function observeReveal() {
    document.querySelectorAll('.reveal:not(.v)').forEach(function (el) { io && io.observe(el); });
  }

  /* atalhos */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && document.activeElement !== $('q')) { e.preventDefault(); $('q').focus(); }
    if (e.key === 'Escape') {
      closeQuick();
      $('cmpModal').classList.remove('open');
      toggleDrawer('drawer', false); toggleDrawer('wdrawer', false);
      document.body.classList.remove('lock');
    }
  });

  /* ---------------- init ---------------- */
  renderChips(); renderCatGrid(); renderProducts(); renderIdeas();
  renderCart(); renderWish(); renderCmp();
  paintRange(); onScroll(); observeReveal();
  document.querySelectorAll('[data-st]').forEach(countUp);
  if (!window.IntersectionObserver) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('v'); });
  }
})();
