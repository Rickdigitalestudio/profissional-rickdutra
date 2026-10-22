/* ============================================================
   TechVerse — Hero 3D (Three.js)
   Carrossel de produtos em 3D usando as fotos originais.
   Arraste para girar, passe o mouse para ver, clique para abrir.
   ============================================================ */
(function () {
  'use strict';

  var stage = document.getElementById('hero3d') ? document.querySelector('.hr') : null;
  var canvas = document.getElementById('hero3d');
  if (!stage || !canvas || !window.THREE || !window.TV) return;

  // WebGL disponível?
  try {
    var test = document.createElement('canvas').getContext('webgl') ||
               document.createElement('canvas').getContext('experimental-webgl');
    if (!test) throw 0;
  } catch (e) { return; }

  var P = window.TV.products;
  var N = P.length;
  var CARD_W = 1.42, CARD_H = 1.78, R = 4.9, STEP = (Math.PI * 2) / N;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer, scene, camera, ring, cards = [], meshes = [], particles;
  var rot = 0, vel = 0, dragging = false, moved = 0, lastX = 0;
  var mouse = { x: 0, y: 0 }, ndc = { x: 0, y: 0 };
  var hover = null, targetRot = null, activeIdx = -1, running = true, t0 = performance.now();

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

  /* ---- partículas de fundo ---- */
  (function () {
    var g = new THREE.BufferGeometry(), n = 260, pos = new Float32Array(n * 3);
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

  /* ---- anel de cards ---- */
  var loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');

  function cover(tex) {
    var img = tex.image;
    if (!img || !img.width) return;
    if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
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
    var prod = P[i];
    var grp = new THREE.Group();
    var a = i * STEP;
    grp.position.set(Math.sin(a) * R, 0, Math.cos(a) * R);
    grp.rotation.y = a;
    grp.userData = { i: i, a: a, baseY: (i % 2 ? 0.09 : -0.09) };

    // traseira escura (o que se vê dos cards do outro lado)
    var back = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W + 0.14, CARD_H + 0.14),
      new THREE.MeshBasicMaterial({ color: 0x141419, side: THREE.DoubleSide })
    );
    back.position.z = -0.05;
    grp.add(back);

    // moldura branca
    var frame = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W + 0.12, CARD_H + 0.12),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    frame.position.z = -0.025;
    grp.add(frame);

    // foto original do produto
    var photo = new THREE.Mesh(
      new THREE.PlaneGeometry(CARD_W, CARD_H),
      new THREE.MeshBasicMaterial({ color: 0x2a2a30, side: THREE.DoubleSide })
    );
    photo.userData = { i: i, grp: grp };
    grp.add(photo);
    meshes.push(photo);

    (function (mesh, url) {
      loader.load(url, function (tex) {
        cover(tex);
        mesh.material.map = tex;
        mesh.material.color.set(0xffffff);
        mesh.material.needsUpdate = true;
      });
    })(photo, prod.img);

    ring.add(grp);
    cards.push(grp);
  }

  /* ---- eventos de ponteiro ---- */
  function setNDC(e) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }

  canvas.addEventListener('pointerdown', function (e) {
    dragging = true; moved = 0; lastX = e.clientX;
    targetRot = null;
    stage.classList.add('dragging');
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', function (e) {
    setNDC(e);
    if (e.pointerType === 'touch') return; // touch é tratado em touchmove
    if (dragging) {
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      rot += dx * 0.006;
      vel = dx * 0.006;
    }
  });

  window.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
    if (moved < 6 && hover !== null) {
      window.dispatchEvent(new CustomEvent('tv-hero-select', { detail: { i: hover } }));
    }
  });

  canvas.addEventListener('pointerleave', function () {
    if (!dragging) { ndc.x = 99; ndc.y = 99; }
  });

  // touch: arrastar horizontalmente não rola a página
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) { lastX = e.touches[0].clientX; moved = 0; }
  }, { passive: true });
  canvas.addEventListener('touchmove', function (e) {
    if (e.touches.length !== 1) return;
    var dx = e.touches[0].clientX - lastX;
    lastX = e.touches[0].clientX;
    moved += Math.abs(dx);
    if (Math.abs(dx) > 2 && e.cancelable) e.preventDefault();
    rot += dx * 0.006; vel = dx * 0.006; targetRot = null;
  }, { passive: false });

  /* ---- navegação ---- */
  function go(i) {
    i = ((i % N) + N) % N;
    var want = -i * STEP;
    while (want - rot > Math.PI) want -= Math.PI * 2;
    while (rot - want > Math.PI) want += Math.PI * 2;
    targetRot = want;
    vel = 0;
  }

  window.Hero3D = {
    next: function () { go(activeIdx + 1); },
    prev: function () { go(activeIdx - 1); },
    go: go,
    isReady: true
  };

  /* ---- redimensionar ---- */
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

  /* ---- pausar quando fora da tela ---- */
  if (window.IntersectionObserver) {
    new IntersectionObserver(function (es) {
      running = es[0].isIntersecting;
      if (running) { t0 = performance.now(); tick(t0); }
    }, { threshold: 0.02 }).observe(stage);
  }

  /* ---- raycaster (hover) ---- */
  var ray = new THREE.Raycaster();
  var label = document.getElementById('heroLabel');
  var tick0 = 0;

  function tick(now) {
    if (!running) return;
    requestAnimationFrame(tick);
    var t = (now - t0) / 1000;
    if (t - tick0 < 1 / 60) { /* limita a ~60fps */ }
    tick0 = t;

    // rotação: automática, inércia ou alvo
    if (targetRot !== null) {
      rot += (targetRot - rot) * 0.09;
      if (Math.abs(targetRot - rot) < 0.0008) { rot = targetRot; targetRot = null; }
    } else if (!dragging) {
      if (Math.abs(vel) > 0.0004) { rot += vel; vel *= 0.94; }
      else if (!reduce) { rot += 0.0016; }
    }

    ring.rotation.y = rot;
    ring.rotation.x = THREE.MathUtils.lerp(ring.rotation.x, mouse.y * 0.00018, 0.06);
    particles.rotation.y = t * 0.02;
    particles.rotation.x = Math.sin(t * 0.15) * 0.05;

    // cards: flutuação + escala no hover
    for (var i = 0; i < cards.length; i++) {
      var g = cards[i];
      g.position.y = g.userData.baseY + (reduce ? 0 : Math.sin(t * 0.9 + i * 0.7) * 0.11);
      var target = (hover === i) ? 1.22 : 1;
      var cur = g.scale.x + (target - g.scale.x) * 0.14;
      g.scale.setScalar(cur);
      g.position.y += (hover === i ? 0.16 : 0);
      g.rotation.z = reduce ? 0 : Math.sin(t * 0.6 + i) * 0.035;
    }

    // hover
    if (!dragging) {
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(meshes, false);
      var h = hits.length ? hits[0].object.userData.i : null;
      if (h !== hover) {
        hover = h;
        canvas.style.cursor = hover === null ? 'grab' : 'pointer';
        if (label) {
          if (hover === null) label.classList.remove('on');
          else {
            var p = P[hover];
            label.innerHTML = p.n + ' &nbsp;<i>$' + p.p.toFixed(2) + '</i>';
            label.classList.add('on');
          }
        }
      }
      if (hover !== null && label) {
        label.style.left = mouse.x + 'px';
        label.style.top = mouse.y + 'px';
      }
    }

    // card ativo (frente da câmera)
    var idx = Math.round(-rot / STEP);
    idx = ((idx % N) + N) % N;
    if (idx !== activeIdx) {
      activeIdx = idx;
      var pr = P[idx];
      window.dispatchEvent(new CustomEvent('tv-hero-caption', {
        detail: { i: idx, n: pr.n, p: pr.p, img: pr.img, c: pr.c }
      }));
    }

    // parallax suave da câmera
    camera.position.x += (ndc.x * 0.55 - camera.position.x) * 0.05;
    camera.position.y += (0.25 + ndc.y * 0.35 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  stage.classList.add('has3d');
  requestAnimationFrame(tick);
})();
