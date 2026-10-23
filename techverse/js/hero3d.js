/* ============================================================
   TechVerse — Hero 3D (Three.js)
   Carrossel de produtos em 3D usando as fotos originais.
   Arraste para girar, passe o mouse para ver, clique para abrir.
   ============================================================ */
(function () {
  'use strict';

  var stage = document.querySelector('.hr');
  var canvas = document.getElementById('hero3d');
  if (!stage || !canvas || !window.THREE || !window.TV) return;

  try {
    var tctx = document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl');
    if (!tctx) throw 0;
  } catch (e) { return; }

  var ALL = window.TV.products;
  // Hero com 18 produtos distribuídos entre todas as categorias
  var RING_N = Math.min(ALL.length, 18);
  var RING = [];
  for (var ri = 0; ri < RING_N; ri++) RING.push(ALL[Math.min(ALL.length - 1, Math.floor((ri * ALL.length) / RING_N))]);
  var N = RING.length;
  var CARD_W = 1.42, CARD_H = 1.78, R = 4.9, STEP = (Math.PI * 2) / N;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer, scene, camera, ring, cards = [], meshes = [], particles;
  var rot = 0, vel = 0, dragging = false, moved = 0, lastX = 0;
  var mouse = { x: 0, y: 0 }, ndc = { x: 0, y: 0 };
  var hover = null;
  var label = document.getElementById('heroLabel');
  var loopStarted = false;
  var running = true;
  var t0 = performance.now();
  var cameraState = { x: 0, y: 0.25 };

  function brl(v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) { return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x9c0f1c, 7.5, 17);

  camera = new THREE.PerspectiveCamera(44, 1, 0.1, 60);
  camera.position.set(0, 0.25, 8.4);
  camera.lookAt(0, 0, 0);

  ring = new THREE.Group();
  scene.add(ring);

  (function () {
    var g = new THREE.BufferGeometry(), n = 240, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    particles = new THREE.Points(g, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.055, transparent: true, opacity: 0.55,
      depthWrite: false, sizeAttenuation: true
    }));
    scene.add(particles);
  })();

  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  function cover(tex) {
    var img = tex.image;
    if (!img || !img.width) return;
    if (THREE.sRGBEncoding) tex.encoding = THREE.SRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
    var boxA = CARD_W / CARD_H, imgA = img.width / img.height;
    if (imgA > boxA) {
      var r = boxA / imgA;
      tex.repeat.set(r, 1); tex.offset.set((1 - r) / 2, 0);
    } else {
      var r2 = imgA / boxA;
      tex.repeat.set(1, r2); tex.offset.set(0, (1 - r2) / 2);
    }
    tex.needsUpdate = true;
  }

  for (var i = 0; i < N; i++) {
    var prod = RING[i];
    var grp = new THREE.Group();
    var a = i * STEP;
    grp.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    grp.rotation.y = a;
    grp.userData = { i: i, pi: Math.min(ALL.length - 1, Math.floor((i * ALL.length) / RING_N)), a: a, baseY: (i % 2 ? 0.09 : -0.09) };

    var back = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W + 0.14, CARD_H + 0.14),
      new THREE.MeshBasicMaterial({ color: 0x141419, side: THREE.DoubleSide })
    );
    back.position.z = -0.05;
    grp.add(back);

    var frame = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W + 0.12, CARD_H + 0.12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    frame.position.z = -0.025;
    grp.add(frame);

    var photo = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W, CARD_H),
      new THREE.MeshBasicMaterial({ color: 0x2a2a30, side: THREE.DoubleSide })
    );
    photo.userData = { i: i, grp: grp };
    grp.add(photo);
    meshes.push(photo);

    /* carrega a textura preservando a referência do card via IIFE */
    (function (meshPhoto, url) {
      loader.load(url, function (tex) {
        cover(tex);
        if (THREE.sRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        meshPhoto.material.map = tex;
        meshPhoto.material.color.set(0xffffff);
        meshPhoto.material.needsUpdate = true;
      });
    })(photo, prod.img);

    ring.add(grp);
    cards.push(grp);
  }

  function setNDC(e) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }

  function onDown(e) {
    dragging = true; moved = 0; lastX = e.clientX;
    stage.classList.add('dragging');
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function onMove(e) {
    setNDC(e);
    if (e.pointerType === 'touch') return;
    if (dragging) {
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      rot += dx * 0.006;
      vel = dx * 0.006;
    }
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    if (moved < 6 && hover !== null) {
      window.dispatchEvent(new CustomEvent('tv-hero-select', { detail: { i: hover, pi: cards[hover].userData.pi } }));
    }
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointerleave', function () { if (!dragging) { ndc.x = 99; ndc.y = 99; } });
  canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 1) { lastX = e.touches[0].clientX; moved = 0; } }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length !== 1) return;
    var dx = e.touches[0].clientX - lastX;
    lastX = e.touches[0].clientX;
    moved += Math.abs(dx);
    if (Math.abs(dx) > 2 && e.cancelable) e.preventDefault();
    rot += dx * 0.006; vel = dx * 0.006; dragging = false;
  }, { passive: false });

  var targetRot = null;
  var activeIdxCache = 0;

  function go(i) {
    i = ((i % N) + N) % N;
    var want = -i * STEP;
    while (want - rot > Math.PI) want -= Math.PI * 2;
    while (rot - want > Math.PI) want += Math.PI * 2;
    targetRot = want;
    vel = 0;
  }

  window.Hero3D = {
    next: function () { go((activeIdxCache + 1) % N); },
    prev: function () { go((activeIdxCache - 1 + N) % N); },
    go: go,
    isReady: true
  };

  function resize() {
    var w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 1.15 ? 56 : 44;
    camera.updateProjectionMatrix();
  }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
  window.addEventListener('resize', resize);

  function startLoop() { if (loopStarted) return; loopStarted = true; requestAnimationFrame(tick); }
  function tick(now) {
    if (!running) { loopStarted = false; return; }
    requestAnimationFrame(tick);
    var t = (now - t0) / 1000;
    if (targetRot !== null) {
      rot += (targetRot - rot) * 0.09;
      if (Math.abs(targetRot - rot) < 0.0008) { rot = targetRot; targetRot = null; }
    } else if (!dragging) {
      if (Math.abs(vel) > 0.0004) { rot += vel; vel *= 0.94; }
      else if (!reduce) { rot += 0.0016; }
    }

    ring.rotation.y = rot;
    ring.rotation.x = 0;
    particles.rotation.y = t * 0.02;
    particles.rotation.x = Math.sin(t * 0.15) * 0.05;

    for (var i = 0; i < cards.length; i++) {
      var g = cards[i];
      g.position.y = g.userData.baseY + (reduce ? 0 : Math.sin(t * 0.9 + i * 0.7) * 0.11);
      var target = (hover === i) ? 1.22 : 1;
      var cur = g.scale.x + (target - g.scale.x) * 0.14;
      g.scale.setScalar(cur);
      g.position.y += (hover === i ? 0.16 : 0);
      g.rotation.z = reduce ? 0 : Math.sin(t * 0.6 + i) * 0.035;
    }

    if (!dragging) {
      var rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, camera);
      var hits = rc.intersectObjects(meshes, false);
      var h = hits.length ? hits[0].object.userData.i : null;
      if (h !== hover) {
        hover = h;
        canvas.style.cursor = hover === null ? 'grab' : 'pointer';
        if (label) {
          if (hover === null) label.classList.remove('on');
          else {
            var p = RING[hover];
            label.innerHTML = p.n + ' &nbsp;<i>' + brl(p.p) + '</i>';
            label.classList.add('on');
          }
        }
      }
      if (hover !== null && label) { label.style.left = mouse.x + 'px'; label.style.top = mouse.y + 'px'; }
    }

    var idx = Math.round(-rot / STEP);
    idx = ((idx % N) + N) % N;
    var changed = idx !== activeIdxCache;
    if (changed) {
      activeIdxCache = idx;
      var pr = RING[idx];
      window.dispatchEvent(new CustomEvent('tv-hero-caption', {
        detail: { i: idx, total: N, n: pr.n, p: pr.p, img: pr.img, c: pr.c }
      }));
    }

    cameraState.x += (ndc.x * 0.55 - cameraState.x) * 0.05;
    cameraState.y += (0.25 + ndc.y * 0.35 - cameraState.y) * 0.05;
    camera.position.set(cameraState.x, cameraState.y, 8.4);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  stage.classList.add('has3d');
  new window.IntersectionObserver(function (es) {
    running = es[0].isIntersecting;
    if (running) startLoop();
  }, { threshold: 0.02 }).observe(stage);
  startLoop();
})();
