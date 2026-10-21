/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — motor do visor 3D
   Usado tanto na vitrine (spotlight) quanto no modal.
   Recursos: giro por arrasto, zoom, rotação automática,
   vista explodida, wireframe, presets de luz e captura PNG.
   ═══════════════════════════════════════════════════════════ */
var KViewer = (function () {
  'use strict';
  if (!window.THREE) return null;
  var T = window.THREE;

  /* presets de iluminação */
  var PRESETS = [
    {
      name: 'Estúdio',
      key: { c: 0xfff4e0, i: 2.3, p: [2.4, 3.2, 2.6] },
      fill: { c: 0x9fc2ff, i: .9, p: [-2.8, 1.4, 1.8] },
      rim: { c: 0xffc23f, i: 2.8, p: [0, 1.4, -3.2] },
      amb: { s: 0xdfe9ff, g: 0x1a1d24, i: .8 }
    },
    {
      name: 'Oficina',
      key: { c: 0xffc98a, i: 2.8, p: [2.2, 2.6, 1.4] },
      fill: { c: 0x5a7bb5, i: .55, p: [-2.4, 1.2, 1.2] },
      rim: { c: 0xff7a2f, i: 1.7, p: [.4, 1.2, -2.6] },
      amb: { s: 0xffd9b0, g: 0x140f0a, i: .5 }
    },
    {
      name: 'Vitrine',
      key: { c: 0xffffff, i: 3.4, p: [0, 4.2, 1.2] },
      fill: { c: 0xffffff, i: 1.5, p: [0, 2.2, -2.6] },
      rim: { c: 0xf5b301, i: 2.4, p: [3, 1.4, -1] },
      amb: { s: 0xffffff, g: 0x2a2f3a, i: 1.2 }
    },
    {
      name: 'Noite',
      key: { c: 0x8fb6ff, i: 1.6, p: [-2.6, 3, 2.2] },
      fill: { c: 0x7a5cff, i: .95, p: [2.4, 1.2, 1.6] },
      rim: { c: 0xf5b301, i: 3.4, p: [0, 1, -3] },
      amb: { s: 0x3a4a7a, g: 0x0a0c12, i: .6 }
    }
  ];

  /* ── ambiente (equiretangular procedural) ─────────────── */
  function envTexture() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#3b465c');
    g.addColorStop(.42, '#171c26');
    g.addColorStop(.58, '#0b0d12');
    g.addColorStop(1, '#05060a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 256);
    function soft(x, y, w, h, col) {
      var rg = ctx.createRadialGradient(x, y, 0, x, y, Math.max(w, h) / 2);
      rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = rg; ctx.fillRect(x - w / 2, y - h / 2, w, h);
    }
    soft(150, 55, 250, 170, 'rgba(255,246,228,.95)');
    soft(370, 80, 200, 150, 'rgba(255,206,120,.6)');
    soft(255, 220, 460, 130, 'rgba(70,100,160,.3)');
    soft(40, 40, 120, 120, 'rgba(255,255,255,.5)');
    var tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    if ('encoding' in tex) tex.encoding = T.sRGBEncoding;
    return tex;
  }

  /* ═══════════════════════════════════════════════════════ */
  function Viewer(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.opts = opts;
    this.autoSpin = opts.autoSpin !== false;
    this.wireframe = false;
    this.explode = false;
    this.explodeAmt = 0;
    this.spin = 0;
    this.yaw = 0;
    this.pitch = 0;
    this.zoom = 1;
    this.targetZoom = 1;
    this.intro = 0;
    this.running = false;
    this.visible = true;
    this.preset = 0;
    this.model = null;
    this.product = null;
    this.onReady = opts.onReady || function () { };
    this._init();
  }

  Viewer.prototype._init = function () {
    var self = this;
    var c = this.canvas;

    try {
      this.renderer = new T.WebGLRenderer({
        canvas: c, antialias: true, alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      this.failed = true;
      return;
    }
    var mobile = window.matchMedia('(pointer: coarse)').matches;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.7 : 2));
    this.renderer.outputEncoding = T.sRGBEncoding;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;

    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(38, 1, .1, 100);
    this.baseZ = 4.3;
    this.camera.position.set(0, .28, this.baseZ);

    /* ambiente PBR */
    try {
      var pmrem = new T.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
      this.envRT = pmrem.fromEquirectangular(envTexture());
      this.scene.environment = this.envRT.texture;
    } catch (e) { /* segue sem env */ }

    this.holder = new T.Group();
    this.scene.add(this.holder);

    /* luzes */
    this.hemi = new T.HemisphereLight(0xdfe9ff, 0x1a1d24, .8);
    this.scene.add(this.hemi);

    this.key = new T.DirectionalLight(0xfff4e0, 2.3);
    this.key.position.set(2.4, 3.2, 2.6);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.key.shadow.camera.near = .5;
    this.key.shadow.camera.far = 16;
    this.key.shadow.camera.left = -3;
    this.key.shadow.camera.right = 3;
    this.key.shadow.camera.top = 3;
    this.key.shadow.camera.bottom = -3;
    this.key.shadow.bias = -.0012;
    this.scene.add(this.key);

    this.fill = new T.PointLight(0x9fc2ff, .9, 18, 2);
    this.fill.position.set(-2.8, 1.4, 1.8);
    this.scene.add(this.fill);

    this.rim = new T.PointLight(0xffc23f, 2.8, 16, 2);
    this.rim.position.set(0, 1.4, -3.2);
    this.scene.add(this.rim);

    /* chão com sombra */
    var shadowPlane = new T.Mesh(
      new T.CircleGeometry(3.4, 48),
      new T.ShadowMaterial({ opacity: .42 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.12;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);
    this.shadowPlane = shadowPlane;

    /* pedestal (só na vitrine) */
    if (this.opts.pedestal) {
      var ped = new T.Mesh(
        new T.CylinderGeometry(1.5, 1.62, .1, 56),
        new T.MeshStandardMaterial({ color: 0x14181f, roughness: .45, metalness: .6 })
      );
      ped.position.y = -1.16;
      ped.receiveShadow = true;
      this.scene.add(ped);
      var ring = new T.Mesh(
        new T.TorusGeometry(1.53, .018, 8, 72),
        new T.MeshStandardMaterial({ color: 0xf5b301, roughness: .25, metalness: 1, emissive: 0x3a2a00, emissiveIntensity: 1 })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.11;
      this.scene.add(ring);
      this.ring = ring;
    }

    /* eventos */
    this._pointers = new Map();
    this._bind();

    this._resize();
    if (window.ResizeObserver) {
      this._ro = new ResizeObserver(function () { self._resize(); });
      this._ro.observe(c);
    } else {
      this._onWinResize = function () { self._resize(); };
      window.addEventListener('resize', this._onWinResize);
    }

    if (window.IntersectionObserver) {
      this._io = new IntersectionObserver(function (es) {
        self.visible = es[0].isIntersecting;
        if (self.visible) self.start(); else self.stop();
      }, { threshold: .02 });
      this._io.observe(c);
    }

    this.applyPreset(0);
    this.onReady(this);
  };

  /* ── interação ───────────────────────────────────────── */
  Viewer.prototype._bind = function () {
    var self = this, c = this.canvas;

    c.addEventListener('pointerdown', function (e) {
      c.setPointerCapture && c.setPointerCapture(e.pointerId);
      self._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      self._pinch = null;
      self._dragged = false;
      c.style.cursor = 'grabbing';
    });

    c.addEventListener('pointermove', function (e) {
      var p = self._pointers.get(e.pointerId);
      if (!p) return;
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 1) self._dragged = true;

      if (self._pointers.size >= 2) {
        var pts = Array.from(self._pointers.values());
        var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        if (self._lastPinch) {
          self.targetZoom = Math.max(.55, Math.min(2.4, self.targetZoom * (d / self._lastPinch)));
        }
        self._lastPinch = d;
        return;
      }

      self.yaw += dx * .009;
      self.pitch = Math.max(-1.0, Math.min(1.0, self.pitch + dy * .007));
      self.autoSpinHold = true;
      clearTimeout(self._spinTimer);
      self._spinTimer = setTimeout(function () { self.autoSpinHold = false; }, 1400);
    });

    function up(e) {
      self._pointers.delete(e.pointerId);
      if (self._pointers.size < 2) self._lastPinch = null;
      if (!self._pointers.size) c.style.cursor = 'grab';
    }
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('pointerleave', up);

    c.addEventListener('wheel', function (e) {
      e.preventDefault();
      self.targetZoom = Math.max(.55, Math.min(2.4, self.targetZoom * (1 - e.deltaY * .0012)));
    }, { passive: false });

    c.addEventListener('dblclick', function () { self.reset(); });
  };

  /* ── redimensionamento ────────────────────────────────── */
  Viewer.prototype._resize = function () {
    if (!this.renderer) return;
    var w = this.canvas.clientWidth || this.canvas.parentElement.clientWidth || 600;
    var h = this.canvas.clientHeight || this.canvas.parentElement.clientHeight || 500;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  /* ── presets de luz ───────────────────────────────────── */
  Viewer.prototype.applyPreset = function (i) {
    this.preset = ((i % PRESETS.length) + PRESETS.length) % PRESETS.length;
    var p = PRESETS[this.preset];
    if (!this.key) return p.name;
    this.key.color.setHex(p.key.c); this.key.intensity = p.key.i;
    this.key.position.set(p.key.p[0], p.key.p[1], p.key.p[2]);
    this.fill.color.setHex(p.fill.c); this.fill.intensity = p.fill.i;
    this.fill.position.set(p.fill.p[0], p.fill.p[1], p.fill.p[2]);
    this.rim.color.setHex(p.rim.c); this.rim.intensity = p.rim.i;
    this.rim.position.set(p.rim.p[0], p.rim.p[1], p.rim.p[2]);
    this.hemi.color.setHex(p.amb.s); this.hemi.groundColor.setHex(p.amb.g);
    this.hemi.intensity = p.amb.i;
    if (this.opts.onPreset) this.opts.onPreset(p.name, this.preset);
    return p.name;
  };

  /* ── produto ──────────────────────────────────────────── */
  Viewer.prototype.setProduct = function (product) {
    if (!this.renderer || !window.KModel) return;
    this.product = product;

    if (this.model) {
      this.holder.remove(this.model);
      KModel.dispose(this.model);
      this.model = null;
    }

    var size = this.opts.size || 2.1;
    var m = KModel.build(product, size);
    if (!m) return;
    this.model = m;
    this.holder.add(m);
    /* apoia a peça sobre o chão/pedestal */
    this.modelBaseY = (m.userData.halfHeight || 1) - 1.11;

    /* directions para a vista explodida */
    var parts = m.userData.parts || [];
    var avg = new T.Vector3();
    parts.forEach(function (p) { avg.add(p.position); });
    if (parts.length) avg.divideScalar(parts.length);
    parts.forEach(function (p) {
      var dir = new T.Vector3().subVectors(p.position, avg);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      p.userData.dir = dir.clone().normalize();
      p.userData.home = p.position.clone();
    });

    this.yaw = 0;
    this.pitch = 0;
    this.spin = 0;
    this.intro = 0;
    this.zoom = this.targetZoom = 1;
    this.applyWireframe(this.wireframe);
    this.applyExplode(this.explode);
    this.start();
  };

  /* ── toggles ──────────────────────────────────────────── */
  Viewer.prototype.applyWireframe = function (on) {
    this.wireframe = !!on;
    if (!this.model) return;
    var mats = this.model.userData.materials || [];
    mats.forEach(function (m) { m.wireframe = this.wireframe; }, this);
  };

  Viewer.prototype.applyExplode = function (on) {
    this.explode = !!on;
  };

  Viewer.prototype.setAutoSpin = function (on) {
    this.autoSpin = !!on;
  };

  Viewer.prototype.reset = function () {
    this.yaw = 0; this.pitch = 0; this.spin = 0;
    this.zoom = this.targetZoom = 1;
  };

  /* ── captura PNG ──────────────────────────────────────── */
  Viewer.prototype.snapshot = function () {
    if (!this.renderer) return null;
    this.renderer.render(this.scene, this.camera);
    try {
      return this.canvas.toDataURL('image/png');
    } catch (e) {
      return null;
    }
  };

  /* ── loop ─────────────────────────────────────────────── */
  Viewer.prototype.start = function () {
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

  Viewer.prototype.stop = function () {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  };

  Viewer.prototype.tick = function (dt, t) {
    /* entrada */
    this.intro = Math.min(1, this.intro + dt * 1.6);
    var e = 1 - Math.pow(1 - this.intro, 3);
    this.holder.scale.setScalar(.55 + .45 * e);

    /* giro automático */
    if (this.autoSpin && !this.autoSpinHold && !this._dragged) this.spin += dt * .55;

    /* zoom suave */
    this.zoom += (this.targetZoom - this.zoom) * Math.min(1, dt * 9);
    this.camera.position.z = this.baseZ / this.zoom;

    /* vista explodida */
    var target = this.explode ? 1 : 0;
    if (Math.abs(this.explodeAmt - target) > .0008) {
      this.explodeAmt += (target - this.explodeAmt) * Math.min(1, dt * 5);
      var parts = this.model && this.model.userData.parts;
      if (parts) {
        var self = this;
        parts.forEach(function (p) {
          if (!p.userData.dir) return;
          var off = p.userData.dir.clone().multiplyScalar(self.explodeAmt * .34);
          /* limita o afastamento para as peças não saírem do enquadramento */
          if (off.length() > .42) off.setLength(.42);
          p.position.copy(p.userData.home).add(off);
        });
      }
    }

    /* apply */
    this.holder.rotation.y = this.yaw + this.spin;
    this.holder.rotation.x = this.pitch;

    /* flutuação suave */
    if (this.model) {
      this.model.position.y = (this.modelBaseY || 0) + Math.sin(t * 1.1) * .03;
      this.model.rotation.z = Math.sin(t * .7) * .015;
    }

    if (this.ring) this.ring.rotation.z += dt * .3;

    this.renderer.render(this.scene, this.camera);
  };

  Viewer.prototype.dispose = function () {
    this.stop();
    if (this._ro) this._ro.disconnect();
    if (this._io) this._io.disconnect();
    if (this._onWinResize) window.removeEventListener('resize', this._onWinResize);
    if (this.model) { KModel.dispose(this.model); this.model = null; }
    if (this.envRT) { this.envRT.dispose(); this.envRT = null; }
    if (this.renderer) { this.renderer.dispose(); this.renderer = null; }
  };

  Viewer.PRESETS = PRESETS;
  Viewer.supported = (function () {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  })();

  return Viewer;
})();
