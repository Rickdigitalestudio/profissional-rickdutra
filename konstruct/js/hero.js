/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — cena 3D do topo (showroom)
   Palco escuro, ferramentas girando, partículas, paralaxe
   pelo mouse e pelo scroll, e clique para abrir o visor.
   ═══════════════════════════════════════════════════════════ */
var KHero = (function () {
  'use strict';
  if (!window.THREE) return null;
  var T = window.THREE;

  /* peças exibidas no palco (ids do catálogo) */
  var PICKS = [
    { id: 1, size: 1.62 },
    { id: 9, size: 1.66 },
    { id: 16, size: 1.5 },
    { id: 31, size: 1.58 },
    { id: 46, size: 1.75 }
  ];

  /* altura do topo da plataforma */
  var DECK_Y = -1.07;
  var PED_TOP = -0.95;

  /* fundo em degradê (esfera invertida) */
  function backdropTexture() {
    var c = document.createElement('canvas');
    c.width = 32; c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#1b2233');
    g.addColorStop(.34, '#11151d');
    g.addColorStop(.62, '#0a0c11');
    g.addColorStop(1, '#050609');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 32, 256);
    var t = new T.CanvasTexture(c);
    if ('encoding' in t) t.encoding = T.sRGBEncoding;
    return t;
  }

  /* textura de chão (grade radial suave) */
  function floorTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 512;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0c0f14'; ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = 'rgba(245,179,1,.10)';
    ctx.lineWidth = 1.4;
    for (var i = 0; i <= 16; i++) {
      var p = i * 32;
      ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(512, p); ctx.stroke();
    }
    var rg = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
    rg.addColorStop(0, 'rgba(245,179,1,.16)');
    rg.addColorStop(.55, 'rgba(245,179,1,.03)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 512, 512);
    var t = new T.CanvasTexture(c);
    t.wrapS = t.wrapT = T.RepeatWrapping;
    t.repeat.set(4, 4);
    if ('encoding' in t) t.encoding = T.sRGBEncoding;
    return t;
  }

  /* partícula redonda */
  function dotTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,235,190,1)');
    g.addColorStop(.35, 'rgba(245,179,1,.55)');
    g.addColorStop(1, 'rgba(245,179,1,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
    return new T.CanvasTexture(c);
  }

  function Hero(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.opts = opts;
    this.onPick = opts.onPick || function () { };
    this.onHover = opts.onHover || function () { };
    this.hovered = null;
    this.pickables = [];
    this.scroll = 0;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this._init();
  }

  Hero.prototype._init = function () {
    var self = this;
    var c = this.canvas;

    try {
      this.renderer = new T.WebGLRenderer({ canvas: c, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { this.failed = true; return; }

    var mobile = window.matchMedia('(pointer: coarse)').matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2));
    this.renderer.outputEncoding = T.sRGBEncoding;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;

    this.scene = new T.Scene();
    this.scene.fog = new T.FogExp2(0x080a0e, .052);

    this.camera = new T.PerspectiveCamera(42, 1, .1, 120);
    this.camBase = { x: 0, y: 1.72, z: 7.4 };
    this.camera.position.set(0, this.camBase.y, this.camBase.z);
    this.camera.lookAt(0, .15, 0);

    /* ambiente PBR */
    try {
      var pmrem = new T.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
      var envC = document.createElement('canvas');
      envC.width = 512; envC.height = 256;
      var ectx = envC.getContext('2d');
      var eg = ectx.createLinearGradient(0, 0, 0, 256);
      eg.addColorStop(0, '#39445c'); eg.addColorStop(.45, '#14181f');
      eg.addColorStop(.6, '#0a0c11'); eg.addColorStop(1, '#05060a');
      ectx.fillStyle = eg; ectx.fillRect(0, 0, 512, 256);
      function soft(x, y, w, h, col) {
        var rg = ectx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) / 2);
        rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
        ectx.fillStyle = rg; ectx.fillRect(x - w / 2, y - h / 2, w, h);
      }
      soft(140, 50, 250, 160, 'rgba(255,244,225,.95)');
      soft(380, 80, 190, 140, 'rgba(255,200,110,.55)');
      var envTex = new T.CanvasTexture(envC);
      envTex.mapping = T.EquirectangularReflectionMapping;
      if ('encoding' in envTex) envTex.encoding = T.sRGBEncoding;
      this.envRT = pmrem.fromEquirectangular(envTex);
      this.scene.environment = this.envRT.texture;
    } catch (e) { /* sem env */ }

    /* fundo */
    var sky = new T.Mesh(
      new T.SphereGeometry(46, 24, 16),
      new T.MeshBasicMaterial({ map: backdropTexture(), side: T.BackSide, fog: false, depthWrite: false })
    );
    this.scene.add(sky);

    /* luzes */
    this.scene.add(new T.HemisphereLight(0x9fb4d8, 0x14171d, .55));
    this.key = new T.DirectionalLight(0xfff2dd, 2.1);
    this.key.position.set(4.5, 6, 4);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.near = 1;
    this.key.shadow.camera.far = 22;
    this.key.shadow.camera.left = -6;
    this.key.shadow.camera.right = 6;
    this.key.shadow.camera.top = 6;
    this.key.shadow.camera.bottom = -6;
    this.key.shadow.bias = -.0015;
    this.scene.add(this.key);

    this.rim = new T.PointLight(0xffb301, 3.2, 22, 2);
    this.rim.position.set(-3.4, 1.6, -3.4);
    this.scene.add(this.rim);

    this.fill = new T.PointLight(0x5c8cff, 1.5, 20, 2);
    this.fill.position.set(3.6, 1.4, -2.6);
    this.scene.add(this.fill);

    this.warm = new T.PointLight(0xffd9a0, .9, 14, 2);
    this.warm.position.set(0, 2.4, 2.6);
    this.scene.add(this.warm);

    /* chão */
    var floor = new T.Mesh(
      new T.CircleGeometry(22, 64),
      new T.MeshStandardMaterial({
        map: floorTexture(), color: 0xffffff, roughness: .38, metalness: .55
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.26;
    floor.receiveShadow = true;
    this.scene.add(floor);

    /* plataforma central */
    var platform = new T.Mesh(
      new T.CylinderGeometry(2.85, 3.05, .18, 72),
      new T.MeshStandardMaterial({ color: 0x151a22, roughness: .32, metalness: .78 })
    );
    platform.position.y = -1.16;
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.scene.add(platform);

    var rimRing = new T.Mesh(
      new T.TorusGeometry(2.9, .026, 10, 96),
      new T.MeshStandardMaterial({ color: 0xf5b301, roughness: .22, metalness: 1, emissive: 0x5a3f00, emissiveIntensity: 1.1 })
    );
    rimRing.rotation.x = Math.PI / 2;
    rimRing.position.y = -1.07;
    this.scene.add(rimRing);
    this.rimRing = rimRing;

    var innerRing = new T.Mesh(
      new T.TorusGeometry(1.9, .012, 8, 80),
      new T.MeshStandardMaterial({ color: 0xf5b301, roughness: .3, metalness: 1, emissive: 0x3a2a00 })
    );
    innerRing.rotation.x = Math.PI / 2;
    innerRing.position.y = -1.06;
    this.scene.add(innerRing);
    this.innerRing = innerRing;

    /* peças em exposição */
    this.turntable = new T.Group();
    this.scene.add(this.turntable);
    this.items = [];

    var self2 = this;
    PICKS.forEach(function (pick, i) {
      var product = window.KONSTRUCT.byId(pick.id);
      if (!product || !window.KModel) return;
      var model = KModel.build(product, pick.size);
      if (!model) return;

      var ang = (i / PICKS.length) * Math.PI * 2 + .35;
      var radius = 1.92;
      var holder = new T.Group();
      holder.position.set(Math.cos(ang) * radius, PED_TOP, Math.sin(ang) * radius);
      holder.rotation.y = ang + Math.PI;   /* de frente para o centro, sem inclinar */
      holder.add(model);
      this.turntable.add(holder);

      /* apoia a peça sobre o pedestal */
      model.position.y = model.userData.halfHeight || 0;

      /* pedestal */
      var ped = new T.Mesh(
        new T.CylinderGeometry(.42, .5, .12, 28),
        new T.MeshStandardMaterial({ color: 0x1b2029, roughness: .4, metalness: .7 })
      );
      ped.position.set(holder.position.x, DECK_Y + .06, holder.position.z);
      ped.receiveShadow = true;
      this.turntable.add(ped);
      var pedRing = new T.Mesh(
        new T.TorusGeometry(.44, .01, 8, 40),
        new T.MeshStandardMaterial({ color: 0xf5b301, roughness: .3, metalness: 1, emissive: 0x3a2a00 })
      );
      pedRing.rotation.x = Math.PI / 2;
      pedRing.position.set(holder.position.x, PED_TOP, holder.position.z);
      this.turntable.add(pedRing);

      /* halo de luz na base */
      var halo = new T.Mesh(
        new T.CircleGeometry(.46, 32),
        new T.MeshBasicMaterial({
          color: 0xf5b301, transparent: true, opacity: .12,
          blending: T.AdditiveBlending, depthWrite: false
        })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(holder.position.x, PED_TOP + .002, holder.position.z);
      this.turntable.add(halo);

      model.traverse(function (o) {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
      });

      var item = {
        product: product, model: model, holder: holder, halo: halo,
        phase: i * 1.3, spin: (i % 2 ? 1 : -1) * .28,
        baseY: model.position.y
      };
      self2.items.push(item);
      self2.pickables.push(model);
    }, this);

    /* partículas */
    var count = window.matchMedia('(pointer: coarse)').matches ? 220 : 520;
    var pos = new Float32Array(count * 3);
    var spd = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      var r = 1.2 + Math.random() * 6;
      var a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = -1.2 + Math.random() * 5.2;
      pos[i * 3 + 2] = Math.sin(a) * r;
      spd[i] = .05 + Math.random() * .16;
    }
    var pgeo = new T.BufferGeometry();
    pgeo.setAttribute('position', new T.BufferAttribute(pos, 3));
    this.parts = new T.Points(pgeo, new T.PointsMaterial({
      size: .055, map: dotTexture(), transparent: true, opacity: .85,
      blending: T.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    this.scene.add(this.parts);
    this.speeds = spd;

    /* eventos */
    this.ray = new T.Raycaster();
    this.ndc = new T.Vector2(-2, -2);
    this._bind();

    this._resize();
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(function () { self._resize(); });
      this._ro.observe(c);
    } else {
      this._onWin = function () { self._resize(); };
      window.addEventListener('resize', this._onWin);
    }
    window.addEventListener('scroll', this._onScroll = function () {
      var h = c.getBoundingClientRect().height || window.innerHeight;
      self.scroll = Math.max(0, Math.min(1, window.scrollY / h));
    }, { passive: true });

    if (window.IntersectionObserver) {
      this._io = new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (self.visible) self.start(); else self.stop();
      }, { threshold: .01 });
      this._io.observe(c);
    }

    this.start();
  };

  /* ── eventos ──────────────────────────────────────────── */
  Hero.prototype._bind = function () {
    var self = this, c = this.canvas;

    window.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      self.ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      self.ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      self.pointer.tx = self.ndc.x;
      self.pointer.ty = self.ndc.y;
      self._move();
    }, { passive: true });

    c.addEventListener('click', function () {
      if (self._moved) return;
      var item = self._hit();
      if (item) self.onPick(item.product, item);
    });

    c.addEventListener('pointerleave', function () {
      self.ndc.set(-2, -2);
      self.pointer.tx = 0; self.pointer.ty = 0;
      self._setHover(null);
    });
  };

  /* detecta a peça sob o cursor */
  Hero.prototype._hit = function () {
    if (!this.ray) return null;
    this.ray.setFromCamera(this.ndc, this.camera);
    var hits = this.ray.intersectObjects(this.pickables, true);
    if (!hits.length) return null;
    var obj = hits[0].object;
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      if (it.model === obj || (obj.parent && obj.parent.parent === it.model) || isChild(it.model, obj)) return it;
    }
    return null;
  };

  function isChild(root, node) {
    var p = node;
    while (p) { if (p === root) return true; p = p.parent; }
    return false;
  }

  Hero.prototype._move = function () {
    var it = this._hit();
    if (it !== this.hovered) {
      this._setHover(it);
      this.canvas.style.cursor = it ? 'pointer' : '';
    }
  };

  Hero.prototype._setHover = function (item) {
    this.hovered = item;
    this.onHover(item ? item.product : null, item);
  };

  /* ── resize ───────────────────────────────────────────── */
  Hero.prototype._resize = function () {
    if (!this.renderer) return;
    var w = this.canvas.clientWidth || this.canvas.parentElement.clientWidth || 1200;
    var h = this.canvas.clientHeight || this.canvas.parentElement.clientHeight || 700;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  /* ── loop ─────────────────────────────────────────────── */
  Hero.prototype.start = function () {
    if (this.running || !this.renderer) return;
    this.running = true;
    var self = this;
    this._last = performance.now();
    (function loop(now) {
      if (!self.running) return;
      self.raf = requestAnimationFrame(loop);
      var dt = Math.min(.05, (now - self._last) / 1000);
      self._last = now;
      self.tick(dt, now / 1000);
    })(this._last);
  };

  Hero.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  Hero.prototype.tick = function (dt, t) {
    /* paralaxe do mouse */
    this.pointer.x += (this.pointer.tx - this.pointer.x) * Math.min(1, dt * 3.4);
    this.pointer.y += (this.pointer.ty - this.pointer.y) * Math.min(1, dt * 3.4);

    var s = this.scroll;
    var tx = this.camBase.x + this.pointer.x * 1.15;
    var ty = this.camBase.y + this.pointer.y * .45 + s * .55;
    var tz = this.camBase.z - s * 2.3;

    this.camera.position.x += (tx - this.camera.position.x) * Math.min(1, dt * 3);
    this.camera.position.y += (ty - this.camera.position.y) * Math.min(1, dt * 3);
    this.camera.position.z += (tz - this.camera.position.z) * Math.min(1, dt * 3);
    this.camera.lookAt(this.pointer.x * .18, .05 + s * .1, 0);

    /* plataforma girando devagar */
    this.turntable.rotation.y += dt * .085;
    this.rimRing.rotation.z += dt * .18;
    this.innerRing.rotation.z -= dt * .25;

    /* peças */
    for (var i = 0; i < this.items.length; i++) {
      var it = this.items[i];
      it.model.rotation.y += dt * it.spin;
      it.model.position.y = it.baseY + Math.sin(t * .9 + it.phase) * .05;
      var target = (it === this.hovered) ? 1.12 : 1;
      it.model.scale.x += (target - it.model.scale.x) * Math.min(1, dt * 8);
      it.model.scale.y = it.model.scale.x;
      it.model.scale.z = it.model.scale.x;
      var op = (it === this.hovered) ? .3 : .1;
      it.halo.material.opacity += (op - it.halo.material.opacity) * Math.min(1, dt * 8);
    }

    /* partículas */
    var p = this.parts.geometry.attributes.position;
    var arr = p.array;
    for (var j = 0; j < arr.length; j += 3) {
      arr[j + 1] += this.speeds[j / 3] * dt;
      if (arr[j + 1] > 4.2) arr[j + 1] = -1.3;
    }
    p.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  };

  Hero.prototype.dispose = function () {
    this.stop();
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    if (this._onWin) window.removeEventListener('resize', this._onWin);
    if (this._onScroll) window.removeEventListener('scroll', this._onScroll);
    if (this.envRT) { this.envRT.dispose(); this.envRT = null; }
    if (this.renderer) { this.renderer.dispose(); this.renderer = null; }
  };

  Hero.PICKS = PICKS;
  return Hero;
})();
