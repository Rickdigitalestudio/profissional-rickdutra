/* ═══════════════════════════════════════════════════════════
   KONSTRUCT — fábrica de modelos 3D procedurais
   Cada produto do catálogo é reconstruído com geometria real
   para o visor interativo (giro, zoom, wireframe, vista explodida).
   ═══════════════════════════════════════════════════════════ */
var KModel = (function () {
  'use strict';
  if (!window.THREE) return { build: function () { return null; } };

  var T = window.THREE;

  /* ── materiais (cache compartilhado) ─────────────────── */
  var cache = {};
  function M(color, o) {
    o = o || {};
    var key = color + '|' + (o.rough !== undefined ? o.rough : .45) + '|' +
      (o.metal !== undefined ? o.metal : .25) + '|' + (o.ei !== undefined ? o.ei : 0) +
      '|' + (o.emissive !== undefined ? o.emissive : 0) + '|' + (o.opacity !== undefined ? o.opacity : 1);
    if (cache[key]) return cache[key];
    var m = new T.MeshStandardMaterial({
      color: new T.Color(color),
      roughness: o.rough !== undefined ? o.rough : .45,
      metalness: o.metal !== undefined ? o.metal : .25,
      emissive: new T.Color(o.emissive !== undefined ? o.emissive : 0x000000),
      emissiveIntensity: o.ei !== undefined ? o.ei : 1,
      transparent: o.opacity !== undefined && o.opacity < 1,
      opacity: o.opacity !== undefined ? o.opacity : 1
    });
    cache[key] = m;
    return m;
  }

  var STEEL = function () { return M(0xc2c9d4, { rough: .22, metal: .95 }); };
  var DARKSTEEL = function () { return M(0x4a515e, { rough: .4, metal: .85 }); };
  var RUBBER = function () { return M(0x14161b, { rough: .95, metal: .05 }); };
  var PLASTIC = function (c) { return M(c, { rough: .48, metal: .12 }); };
  var GOLD = function () { return M(0xf5b301, { rough: .28, metal: .9 }); };

  /* ── helpers de geometria ────────────────────────────── */
  function rrShape(w, h, r) {
    r = Math.max(.0005, Math.min(r, w / 2 - .0005, h / 2 - .0005));
    var x = -w / 2, y = -h / 2, s = new T.Shape();
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }

  /* caixa com cantos arredondados (bevelled) */
  function rbox(w, h, d, r, mat) {
    r = Math.max(.004, Math.min(r, w / 2 - .002, h / 2 - .002, d / 2 - .002));
    var bev = Math.min(r * .55, d / 3, w / 3, h / 3);
    var shape = rrShape(w - bev * 2, h - bev * 2, Math.max(.002, r - bev));
    var geo = new T.ExtrudeGeometry(shape, {
      depth: Math.max(.002, d - bev * 2), bevelEnabled: true,
      bevelSize: bev, bevelThickness: bev, bevelSegments: 2, curveSegments: 6
    });
    geo.center();
    return new T.Mesh(geo, mat);
  }

  function cyl(rt, rb, h, seg, mat, open) {
    return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 24, 1, !!open), mat);
  }
  function sph(r, mat, w) { return new T.Mesh(new T.SphereGeometry(r, w || 20, w ? Math.max(12, w * .7) : 14), mat); }
  function tor(r, t, mat, seg, ring, arc) { return new T.Mesh(new T.TorusGeometry(r, t, seg || 10, ring || 30, arc), mat); }

  function at(o, x, y, z) { o.position.set(x, y, z); return o; }
  function rot(o, x, y, z) { o.rotation.set(x, y, z); return o; }

  /* tubo a partir de pontos (cabos, mangueiras) */
  function tube(pts, radius, mat, seg) {
    var curve = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
    return new T.Mesh(new T.TubeGeometry(curve, seg || 26, radius, 8, false), mat);
  }

  /* ── paletas por produto ─────────────────────────────── */
  function palette(p) {
    return {
      body: PLASTIC(p.color),
      alt: PLASTIC(p.alt || 0x1a1d23),
      dark: PLASTIC(0x191c22),
      rubber: RUBBER(),
      steel: STEEL(),
      darkSteel: DARKSTEEL(),
      gold: GOLD(),
      accent: M(0xe33, { rough: .4, metal: .3 }),
      glass: M(0x101318, { rough: .15, metal: .5 }),
      led: M(0xfff4cf, { rough: .2, metal: 0, emissive: 0xffd27a, ei: 2.4 })
    };
  }

  /* ═══════════════════════════════════════════════════════
     CONSTRUTORES
     ═══════════════════════════════════════════════════════ */

  /* furadeira / martelete / parafusadeira */
  function drill(p) {
    var g = new T.Group(), m = palette(p), v = p.variant || 'cordless';

    var len = v === 'demolition' ? .62 : (v === 'rotary' ? .56 : .48);
    var rad = v === 'demolition' ? .21 : (v === 'rotary' ? .19 : .165);

    /* motor */
    var motor = at(cyl(rad, rad, len, 26, m.body), .02, 0, 0);
    rot(motor, 0, 0, Math.PI / 2); g.add(motor);

    /* aletas de ventilação */
    for (var i = 0; i < 3; i++) {
      var fin = at(tor(rad + .003, .007, m.alt, 8, 24), -len * .2 + i * .05, 0, 0);
      rot(fin, 0, Math.PI / 2, 0); g.add(fin);
    }

    /* tampa traseira */
    var cap = at(cyl(rad * .9, rad * 1.02, .14, 26, m.alt), -len / 2 - .06, 0, 0);
    rot(cap, 0, 0, Math.PI / 2); g.add(cap);

    /* bucha / mandril */
    var chuckLen = v === 'demolition' ? .22 : .16;
    var chuck = at(cyl(.085, .105, chuckLen, 22, m.steel), len / 2 + chuckLen / 2 - .02, 0, 0);
    rot(chuck, 0, 0, Math.PI / 2); g.add(chuck);

    var nose = at(cyl(.045, .085, .11, 20, m.darkSteel), len / 2 + chuckLen + .04, 0, 0);
    rot(nose, 0, 0, Math.PI / 2); g.add(nose);

    /* colar da bucha */
    var collar = at(cyl(rad * .98, rad * .98, .04, 26, m.gold), len / 2 - .04, 0, 0);
    rot(collar, 0, 0, Math.PI / 2); g.add(collar);

    /* empunhadura */
    var grip = at(rbox(.18, .46, .2, .06, m.rubber), -.03, -.34, 0);
    rot(grip, 0, 0, .16); g.add(grip);

    /* gatilho */
    var trig = at(rbox(.09, .15, .16, .025, m.dark), .08, -.15, 0);
    rot(trig, 0, 0, .16); g.add(trig);

    /* seletor de torque */
    var sel = at(cyl(.055, .055, .17, 16, m.gold), -.03, -.16, 0);
    rot(sel, Math.PI / 2, 0, 0); g.add(sel);

    /* bateria */
    if (v !== 'demolition') {
      var bat = at(rbox(.26, .19, .32, .045, m.alt), -.05, -.62, 0);
      g.add(bat);
      var batCap = at(rbox(.21, .05, .27, .02, m.gold), -.05, -.51, 0);
      g.add(batCap);
      var led = at(sph(.032, m.led, 10), .04, -.13, .1);
      g.add(led);
    } else {
      /* cabo de força */
      var cord = tube([[-.45, -.05, .06], [-.68, -.32, .16], [-.62, -.62, .34], [-.86, -.5, .52]], .032, m.rubber, 20);
      g.add(cord);
    }

    /* empunhadura auxiliar (martelete) */
    if (v === 'rotary' || v === 'demolition') {
      var aux = at(cyl(.045, .045, .42, 14, m.dark), -.02, .0, .24);
      rot(aux, Math.PI / 2, 0, 0); g.add(aux);
      var auxEnd = at(cyl(.06, .05, .06, 14, m.gold), -.02, 0, .46);
      rot(auxEnd, Math.PI / 2, 0, 0); g.add(auxEnd);
    }

    /* faixa da marca */
    var plate = at(rbox(.24, .045, .175, .012, m.gold), .0, .09, 0);
    g.add(plate);

    return g;
  }

  /* serra circular */
  function circularSaw(p) {
    var g = new T.Group(), m = palette(p);

    /* base */
    var base = at(rbox(.72, .035, .46, .012, m.steel), 0, -.24, 0);
    g.add(base);
    var slot = at(rbox(.46, .012, .04, .006, m.dark), 0, -.222, .0);
    g.add(slot);

    /* disco */
    var blade = at(cyl(.21, .21, .012, 44, M(0x8d95a3, { rough: .34, metal: .95 })), .08, .02, 0);
    rot(blade, 0, 0, Math.PI / 2); g.add(blade);
    var teeth = at(tor(.207, .017, M(0x5d6470, { rough: .3, metal: .9 }), 8, 48), .08, .02, 0);
    rot(teeth, 0, Math.PI / 2, 0); g.add(teeth);
    var hub = at(cyl(.052, .052, .03, 20, m.gold), .08, .02, 0);
    rot(hub, 0, 0, Math.PI / 2); g.add(hub);

    /* proteção do disco (carcaça aberta em arco) */
    var guard = at(tor(.228, .042, m.alt, 8, 28, Math.PI), .08, .02, 0);
    rot(guard, 0, Math.PI / 2, 0); g.add(guard);
    var guardWall = at(cyl(.234, .234, .09, 28, m.alt, true), .08, .02, 0);
    rot(guardWall, 0, 0, Math.PI / 2); g.add(guardWall);

    /* motor */
    var motor = at(rbox(.42, .36, .36, .07, m.body), -.32, .09, 0);
    g.add(motor);
    var capTop = at(rbox(.38, .06, .32, .02, m.gold), -.32, .28, 0);
    g.add(capTop);

    /* punho superior */
    var handle = at(tor(.15, .032, m.rubber, 8, 20, Math.PI), -.32, .36, 0);
    rot(handle, 0, 0, 0); g.add(handle);
    var hTop = at(rbox(.24, .06, .11, .02, m.alt), -.32, .48, 0);
    g.add(hTop);

    /* punho traseiro */
    var rear = at(rbox(.28, .11, .12, .03, m.rubber), -.52, .05, 0);
    g.add(rear);

    /* ajuste de profundidade */
    var lever = at(rbox(.05, .32, .05, .015, m.gold), -.16, -.06, .15);
    g.add(lever);

    return g;
  }

  /* serra de fita (jigsaw) */
  function jigSaw(p) {
    var g = new T.Group(), m = palette(p);

    var shoe = at(rbox(.42, .03, .3, .01, m.steel), 0, -.26, 0);
    g.add(shoe);

    var body = at(rbox(.19, .42, .2, .05, m.body), .02, -.02, 0);
    g.add(body);

    var motor = at(cyl(.1, .1, .2, 20, m.alt), -.08, .04, 0);
    rot(motor, 0, 0, Math.PI / 2); g.add(motor);

    var head = at(rbox(.2, .16, .19, .05, m.dark), .02, -.22, 0);
    g.add(head);

    /* lâmina */
    var blade = at(rbox(.035, .3, .012, .004, m.steel), .02, -.4, 0);
    g.add(blade);
    var teeth = at(rbox(.04, .05, .02, .004, m.darkSteel), .02, -.55, 0);
    g.add(teeth);

    /* punho superior */
    var handle = at(tor(.13, .03, m.rubber, 8, 20, Math.PI), .02, .26, 0);
    g.add(handle);

    /* botão */
    var btn = at(rbox(.07, .05, .14, .02, m.gold), -.06, .18, 0);
    g.add(btn);

    /* ajustador de oscilação */
    var knob = at(cyl(.05, .05, .08, 14, m.gold), -.1, -.12, .1);
    rot(knob, Math.PI / 2, 0, 0); g.add(knob);

    return g;
  }

  /* serra de reciprocação */
  function recipSaw(p) {
    var g = new T.Group(), m = palette(p);

    /* punho em D */
    var dloop = at(tor(.15, .032, m.rubber, 8, 22, Math.PI * 1.15), -.16, .12, 0);
    rot(dloop, 0, 0, -.5); g.add(dloop);
    var bar = at(rbox(.34, .05, .09, .02, m.alt), -.05, .24, 0);
    g.add(bar);

    /* corpo */
    var body = at(rbox(.5, .2, .19, .055, m.body), .05, .06, 0);
    g.add(body);

    /* motor */
    var motor = at(cyl(.1, .1, .22, 20, m.alt), -.18, .04, 0);
    rot(motor, 0, 0, Math.PI / 2); g.add(motor);

    /* cabeça + sapata */
    var head = at(rbox(.22, .22, .18, .05, m.dark), .3, .04, 0);
    g.add(head);
    var shoe = at(rbox(.26, .04, .2, .01, m.steel), .36, -.08, 0);
    g.add(shoe);

    /* lâmina */
    var blade = at(rbox(.42, .06, .015, .004, m.steel), .55, -.05, 0);
    g.add(blade);
    var tip = at(rbox(.05, .075, .022, .004, m.darkSteel), .75, -.05, 0);
    g.add(tip);

    /* gatilho */
    var trig = at(rbox(.06, .12, .12, .02, m.gold), .02, -.08, 0);
    g.add(trig);

    /* bateria */
    var bat = at(rbox(.2, .22, .16, .03, m.alt), -.24, -.16, 0);
    g.add(bat);

    return g;
  }

  /* esmerilhadeira angular */
  function grinder(p) {
    var g = new T.Group(), m = palette(p);

    /* disco */
    var disc = at(cyl(.185, .185, .026, 40, m.darkSteel), .1, 0, 0);
    rot(disc, 0, 0, Math.PI / 2); g.add(disc);
    var discFace = at(cyl(.16, .16, .028, 40, m.steel), .1, 0, 0);
    rot(discFace, 0, 0, Math.PI / 2); g.add(discFace);
    var nut = at(cyl(.05, .05, .05, 18, m.gold), .14, 0, 0);
    rot(nut, 0, 0, Math.PI / 2); g.add(nut);

    /* proteção */
    var guard = new T.Mesh(new T.CylinderGeometry(.215, .215, .095, 30, 1, true, Math.PI * .05, Math.PI * 1.25), m.alt);
    at(guard, .1, 0, 0); rot(guard, 0, 0, Math.PI / 2); g.add(guard);

    /* corpo */
    var body = at(cyl(.105, .105, .5, 24, m.body), -.22, 0, 0);
    rot(body, 0, 0, Math.PI / 2); g.add(body);

    /* caixa de engrenagens */
    var gear = at(rbox(.2, .22, .18, .04, m.alt), .0, 0, 0);
    g.add(gear);
    var gearLid = at(rbox(.07, .12, .12, .02, m.gold), .0, .13, 0);
    g.add(gearLid);

    /* punho lateral */
    var side = at(cyl(.042, .05, .26, 14, m.rubber), .0, 0, .21);
    rot(side, Math.PI / 2, 0, 0); g.add(side);

    /* punho traseiro */
    var rear = at(rbox(.16, .1, .12, .03, m.rubber), -.46, 0, 0);
    g.add(rear);

    /* interruptor */
    var sw = at(rbox(.1, .05, .07, .015, m.gold), -.32, .1, 0);
    g.add(sw);

    return g;
  }

  /* lixadeira orbital */
  function orbitalSander(p) {
    var g = new T.Group(), m = palette(p);

    /* base */
    var pad = at(cyl(.26, .26, .035, 34, m.alt), 0, -.2, 0);
    g.add(pad);
    var padTop = at(cyl(.25, .25, .02, 34, m.darkSteel), 0, -.175, 0);
    g.add(padTop);

    /* corpo abaulado */
    var dome = at(sph(.27, m.body, 24), 0, .02, 0);
    dome.scale.set(1, .62, 1); g.add(dome);
    var band = at(tor(.25, .035, m.gold, 10, 30), 0, -.06, 0);
    rot(band, Math.PI / 2, 0, 0); g.add(band);

    /* botão de ligar + dial */
    var dial = at(cyl(.06, .06, .04, 16, m.gold), 0, .18, .0);
    g.add(dial);
    var btn = at(rbox(.07, .03, .07, .012, m.dark), .12, .15, .08);
    g.add(btn);

    /* punho superior */
    var grip = at(tor(.16, .035, m.rubber, 8, 22, Math.PI), 0, .14, 0);
    g.add(grip);
    var post = at(rbox(.05, .12, .05, .015, m.alt), -.16, .1, 0);
    g.add(post);
    var post2 = at(rbox(.05, .12, .05, .015, m.alt), .16, .1, 0);
    g.add(post2);

    /* duto de pó */
    var port = at(cyl(.06, .07, .18, 14, m.alt), -.24, .02, 0);
    rot(port, 0, 0, Math.PI / 2.4); g.add(port);
    var bag = at(cyl(.1, .13, .22, 16, m.dark), -.38, .02, 0);
    rot(bag, 0, 0, Math.PI / 2.4); g.add(bag);

    return g;
  }

  /* lixadeira de cinta */
  function beltSander(p) {
    var g = new T.Group(), m = palette(p);

    /* tambores */
    var d1 = at(cyl(.15, .15, .3, 24, m.alt), -.2, 0, 0);
    rot(d1, 0, 0, Math.PI / 2); g.add(d1);
    var d2 = at(cyl(.15, .15, .3, 24, m.alt), .2, 0, 0);
    rot(d2, 0, 0, Math.PI / 2); g.add(d2);

    /* cinta (faixa superior e inferior) */
    var topBelt = at(rbox(.46, .03, .32, .012, m.rubber), 0, .145, 0);
    g.add(topBelt);
    var botBelt = at(rbox(.46, .03, .32, .012, m.rubber), 0, -.145, 0);
    g.add(botBelt);
    for (var i = -1; i <= 1; i += 2) {
      var side = at(rbox(.03, .3, .32, .012, m.rubber), i * .225, 0, 0);
      g.add(side);
    }

    /* corpo/motor */
    var body = at(rbox(.34, .26, .3, .05, m.body), -.02, .06, 0);
    g.add(body);

    /* punho */
    var handle = at(rbox(.3, .07, .1, .025, m.rubber), .02, .22, 0);
    g.add(handle);
    var hpost = at(rbox(.06, .14, .08, .02, m.alt), -.1, .16, 0);
    g.add(hpost);

    /* saco de pó */
    var bag = at(cyl(.11, .14, .24, 16, m.dark), .34, .06, 0);
    rot(bag, 0, 0, Math.PI / 2.6); g.add(bag);

    /* botão + ajuste */
    var btn = at(rbox(.08, .04, .07, .012, m.gold), .12, .2, .1);
    g.add(btn);
    var knob = at(cyl(.05, .05, .05, 14, m.gold), -.16, .18, .1);
    g.add(knob);

    return g;
  }

  /* jogo de chaves */
  function wrenchSet(p) {
    var g = new T.Group(), m = palette(p);
    var sizes = [1.0, .86, .72, .6];
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i], w = new T.Group();
      var shaft = at(rbox(.075 * s, .62 * s, .035, .014, m.steel), 0, 0, 0);
      w.add(shaft);
      var ring = at(tor(.085 * s, .028 * s, m.steel, 8, 24), 0, .34 * s, 0);
      w.add(ring);
      var open1 = at(rbox(.03 * s, .13 * s, .035, .008, m.steel), -.05 * s, -.36 * s, 0);
      rot(open1, 0, 0, -.22); w.add(open1);
      var open2 = at(rbox(.03 * s, .13 * s, .035, .008, m.steel), .05 * s, -.36 * s, 0);
      rot(open2, 0, 0, .22); w.add(open2);
      var base = at(rbox(.13 * s, .06 * s, .035, .01, m.steel), 0, -.3 * s, 0);
      w.add(base);
      var grip = at(rbox(.07 * s, .18 * s, .038, .012, m.gold), 0, -.02 * s, .002);
      w.add(grip);
      rot(w, 0, 0, -.18 + i * .12);
      at(w, -.22 + i * .15, -.02 + (i % 2) * .04, -.06 + i * .035);
      g.add(w);
    }
    return g;
  }

  /* jogo de soquetes */
  function socketSet(p) {
    var g = new T.Group(), m = palette(p);

    /* maleta */
    var base = at(rbox(.72, .16, .42, .03, m.dark), 0, -.2, 0);
    g.add(base);
    var lid = at(rbox(.72, .1, .42, .03, m.alt), 0, .02, -.16);
    rot(lid, -.35, 0, 0); g.add(lid);

    /* espuma */
    var foam = at(rbox(.66, .04, .36, .01, M(0x101216, { rough: .95 })), 0, -.105, 0);
    g.add(foam);

    /* soquetes */
    for (var i = 0; i < 8; i++) {
      var h = .08 + (i % 4) * .035;
      var sock = at(cyl(.035, .042, h, 16, m.steel), -.26 + i * .075, -.06 + h / 2, .06);
      g.add(sock);
    }
    for (var j = 0; j < 5; j++) {
      var s2 = at(cyl(.05, .055, .05 + j * .015, 16, m.darkSteel), -.24 + j * .1, -.08, -.1);
      g.add(s2);
    }

    /* trilho */
    var rail = at(rbox(.6, .05, .05, .015, m.gold), 0, .06, -.06);
    g.add(rail);

    /* trava */
    var latch = at(rbox(.07, .06, .03, .01, m.gold), 0, -.14, .21);
    g.add(latch);

    return g;
  }

  /* maleta de ferramentas */
  function toolcase(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(rbox(.92, .3, .56, .045, m.body), 0, -.16, 0);
    g.add(body);
    var seam = at(rbox(.94, .035, .58, .015, m.dark), 0, -.02, 0);
    g.add(seam);

    var lid = at(rbox(.92, .16, .56, .045, m.alt), 0, .09, -.09);
    rot(lid, -.28, 0, 0); g.add(lid);

    /* interior com ferramentas */
    var foam = at(rbox(.84, .05, .48, .012, M(0x0d0f13, { rough: .95 })), 0, .0, .04);
    g.add(foam);
    var drillB = at(rbox(.16, .14, .42, .04, m.gold), -.24, .05, .02);
    g.add(drillB);
    var bits = at(rbox(.3, .06, .12, .02, m.steel), .16, .04, .08);
    g.add(bits);

    /* travas */
    var l1 = at(rbox(.09, .07, .04, .012, m.gold), -.28, -.04, .29);
    g.add(l1);
    var l2 = at(rbox(.09, .07, .04, .012, m.gold), .28, -.04, .29);
    g.add(l2);

    /* alça */
    var handle = at(tor(.12, .028, m.rubber, 8, 20, Math.PI), 0, .12, .26);
    rot(handle, Math.PI / 2, 0, 0); g.add(handle);

    /* cantoneiras */
    [[-.44, -.29], [.44, -.29], [-.44, .29], [.44, .29]].forEach(function (c) {
      var cn = at(rbox(.07, .07, .07, .02, m.darkSteel), c[0], -.29, c[1]);
      g.add(cn);
    });

    return g;
  }

  /* carrinho de oficina */
  function cabinet(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(rbox(.78, .78, .56, .04, m.body), 0, .02, 0);
    g.add(body);

    /* gavetas */
    for (var i = 0; i < 5; i++) {
      var y = -.28 + i * .145;
      var dr = at(rbox(.7, .125, .03, .012, m.alt), 0, y, .285);
      g.add(dr);
      var h = at(rbox(.34, .028, .035, .01, m.steel), 0, y, .31);
      g.add(h);
      var pull = at(rbox(.05, .05, .03, .01, m.gold), -.3, y, .3);
      g.add(pull);
    }

    /* tampo */
    var top = at(rbox(.84, .05, .6, .02, m.dark), 0, .43, 0);
    g.add(top);
    var lip = at(rbox(.84, .07, .04, .015, m.dark), 0, .47, -.28);
    g.add(lip);
    var lip2 = at(rbox(.84, .07, .04, .015, m.dark), 0, .47, .28);
    g.add(lip2);

    /* rodízios */
    [[-.3, -.2], [.3, -.2], [-.3, .2], [.3, .2]].forEach(function (c) {
      var w = at(cyl(.075, .075, .05, 16, m.rubber), c[0], -.42, c[1]);
      rot(w, 0, 0, Math.PI / 2); g.add(w);
      var f = at(rbox(.05, .06, .05, .012, m.steel), c[0], -.36, c[1]);
      g.add(f);
    });

    /* alça lateral */
    var side = at(rbox(.04, .26, .05, .015, m.gold), .41, .3, .0);
    g.add(side);

    return g;
  }

  /* estante industrial */
  function shelfRack(p) {
    var g = new T.Group(), m = palette(p);
    var W = .92, D = .56, H = 1.5;

    /* montantes */
    [[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2]].forEach(function (c) {
      var up = at(rbox(.06, H, .06, .012, m.body), c[0], 0, c[1]);
      g.add(up);
      for (var h = -1; h <= 1; h += 2) {
        var hole = at(rbox(.02, .05, .02, .006, m.dark), c[0] + (c[0] > 0 ? -.035 : .035), h * H * .33, c[1] + (c[1] > 0 ? -.035 : .035));
        g.add(hole);
      }
    });

    /* travessas diagonais */
    [[-W / 2, -D / 2], [W / 2, D / 2]].forEach(function (c) {
      var br = at(rbox(.03, H * 1.12, .03, .008, m.darkSteel), c[0], 0, c[1]);
      rot(br, 0, 0, .09); g.add(br);
    });

    /* prateleiras */
    for (var i = 0; i < 4; i++) {
      var y = -.56 + i * .42;
      var sh = at(rbox(W, .035, D, .01, m.dark), 0, y, 0);
      g.add(sh);
      var lip = at(rbox(W, .05, .025, .008, m.gold), 0, y + .04, D / 2 - .01);
      g.add(lip);
    }

    /* caixa no topo */
    var box1 = at(rbox(.34, .24, .3, .02, m.alt), -.2, .28, 0);
    g.add(box1);
    var box2 = at(rbox(.28, .2, .26, .02, m.alt), .24, .3, .02);
    g.add(box2);

    return g;
  }

  /* inversor de solda */
  function welder(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(rbox(.62, .6, .36, .035, m.body), 0, 0, 0);
    g.add(body);

    /* painel */
    var panel = at(rbox(.5, .26, .03, .012, m.dark), 0, .1, .185);
    g.add(panel);
    var disp = at(rbox(.22, .1, .02, .006, M(0x0a1a12, { rough: .3, emissive: 0x22ff88, ei: 1.4 })), 0, .12, .2);
    g.add(disp);
    for (var i = 0; i < 4; i++) {
      var knob = at(cyl(.04, .04, .04, 14, i < 2 ? m.gold : m.steel), -.19 + i * .12, -.01, .21);
      rot(knob, Math.PI / 2, 0, 0); g.add(knob);
    }

    /* alça */
    var handle = at(tor(.16, .026, m.rubber, 8, 20, Math.PI), 0, .32, 0);
    g.add(handle);

    /* cabos */
    var cab1 = tube([[-.3, -.22, -.1], [-.55, -.42, -.05], [-.66, -.62, .1]], .026, m.rubber, 18);
    g.add(cab1);
    var cab2 = tube([[.3, -.22, -.1], [.58, -.38, -.14], [.62, -.58, .05]], .026, m.rubber, 18);
    g.add(cab2);

    /* porta-eletrodo */
    var holder = at(rbox(.07, .2, .09, .02, m.dark), -.66, -.66, .12);
    rot(holder, 0, 0, .3); g.add(holder);
    var tipc = at(cyl(.015, .01, .12, 10, m.steel), -.72, -.74, .12);
    rot(tipc, 0, 0, .3); g.add(tipc);

    /* carretel */
    var spool = at(cyl(.13, .13, .1, 24, m.darkSteel), .5, .42, 0);
    g.add(spool);
    var spoolHub = at(cyl(.05, .05, .13, 16, m.gold), .5, .42, 0);
    g.add(spoolHub);

    /* pés */
    var ft = at(rbox(.56, .05, .3, .012, m.dark), 0, -.32, 0);
    g.add(ft);

    return g;
  }

  /* compressor de ar */
  function compressor(p) {
    var g = new T.Group(), m = palette(p);

    /* tanque */
    var tank = at(cyl(.26, .26, .82, 32, m.body), 0, -.06, 0);
    rot(tank, 0, 0, Math.PI / 2); g.add(tank);
    var capL = at(sph(.26, m.body, 22), -.41, -.06, 0);
    capL.scale.set(.55, 1, 1); g.add(capL);
    var capR = at(sph(.26, m.body, 22), .41, -.06, 0);
    capR.scale.set(.55, 1, 1); g.add(capR);

    /* motor + compressor */
    var motor = at(cyl(.15, .15, .3, 22, m.dark), -.18, .3, 0);
    rot(motor, 0, 0, Math.PI / 2); g.add(motor);
    var pump = at(cyl(.1, .1, .22, 18, m.steel), .2, .3, 0);
    rot(pump, 0, 0, Math.PI / 2); g.add(pump);
    var guard = at(cyl(.17, .17, .06, 24, m.darkSteel), -.02, .3, 0);
    rot(guard, 0, 0, Math.PI / 2); g.add(guard);

    /* manômetro */
    var gaugeBody = at(cyl(.08, .08, .05, 20, m.steel), .18, .14, .28);
    rot(gaugeBody, Math.PI / 2, 0, 0); g.add(gaugeBody);
    var gaugeFace = at(cyl(.065, .065, .012, 20, M(0xf5f5f0, { rough: .6 })), .18, .14, .31);
    rot(gaugeFace, Math.PI / 2, 0, 0); g.add(gaugeFace);
    var needle = at(rbox(.05, .008, .006, .002, m.accent), .2, .155, .315);
    rot(needle, 0, 0, .6); g.add(needle);

    /* saídas */
    var outlet = at(cyl(.05, .05, .12, 14, m.gold), -.02, .14, .28);
    rot(outlet, Math.PI / 2, 0, 0); g.add(outlet);

    /* alça e suportes */
    var handle = at(tor(.2, .026, m.rubber, 8, 22, Math.PI), -.3, .12, -.3);
    rot(handle, 0, 0, Math.PI / 2); g.add(handle);
    var bar = at(rbox(.72, .05, .06, .015, m.darkSteel), 0, .2, 0);
    g.add(bar);

    /* rodas */
    var w1 = at(cyl(.13, .13, .06, 20, m.rubber), -.28, -.4, .2);
    rot(w1, 0, 0, Math.PI / 2); g.add(w1);
    var w2 = at(cyl(.13, .13, .06, 20, m.rubber), -.28, -.4, -.2);
    rot(w2, 0, 0, Math.PI / 2); g.add(w2);
    var foot = at(rbox(.1, .18, .14, .02, m.dark), .34, -.32, 0);
    g.add(foot);

    /* mangueira */
    var hose = tube([[.0, .1, .3], [.24, -.06, .36], [.42, -.3, .2], [.36, -.42, -.05]], .022, M(0x2a2e36, { rough: .9 }), 20);
    g.add(hose);

    return g;
  }

  /* medidor laser */
  function laser(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(rbox(.24, .34, .11, .025, m.body), 0, 0, 0);
    g.add(body);

    /* lente emissiva */
    var lens = at(cyl(.035, .035, .03, 18, m.led), 0, .12, .06);
    rot(lens, Math.PI / 2, 0, 0); g.add(lens);
    var lens2 = at(cyl(.022, .022, .03, 14, m.led), .07, .12, .06);
    rot(lens2, Math.PI / 2, 0, 0); g.add(lens2);

    /* visor */
    var scr = at(rbox(.16, .1, .015, .01, M(0x0c1a14, { rough: .25, emissive: 0x1eff88, ei: .9 })), 0, -.01, .062);
    g.add(scr);

    /* botões */
    var b1 = at(rbox(.05, .035, .02, .008, m.gold), -.05, -.1, .062);
    g.add(b1);
    var b2 = at(rbox(.05, .035, .02, .008, m.dark), .05, -.1, .062);
    g.add(b2);

    /* base e suporte */
    var foot = at(rbox(.26, .04, .16, .012, m.alt), 0, -.19, 0);
    g.add(foot);
    var clip = at(tor(.07, .018, m.alt, 8, 18, Math.PI), 0, -.24, .0);
    rot(clip, Math.PI / 2, 0, 0); g.add(clip);

    /* feixe de laser (volume discreto) */
    var beam = new T.Mesh(new T.ConeGeometry(.05, .42, 14, 1, true), M(0xff2d2d, {
      rough: 1, metal: 0, emissive: 0xff2020, ei: 2.2, opacity: .1
    }));
    beam.material.transparent = true;
    beam.material.blending = T.AdditiveBlending;
    beam.material.depthWrite = false;
    beam.position.set(0, .28, .06);
    beam.rotation.x = Math.PI;
    g.add(beam);

    return g;
  }

  /* sprayer de tinta */
  function sprayer(p) {
    var g = new T.Group(), m = palette(p);

    /* copo */
    var cup = at(cyl(.17, .14, .34, 28, M(0xdfe4ea, { rough: .3, metal: .1, opacity: .82 })), 0, -.02, 0);
    cup.material.transparent = true; g.add(cup);
    var cupBase = at(cyl(.14, .12, .04, 28, m.body), 0, -.2, 0);
    g.add(cupBase);

    /* tampa + alça */
    var lid = at(cyl(.18, .17, .05, 28, m.body), 0, .18, 0);
    g.add(lid);
    var handle = at(tor(.13, .022, m.rubber, 8, 20, Math.PI), 0, .24, 0);
    g.add(handle);

    /* motor */
    var motor = at(rbox(.2, .18, .18, .04, m.alt), .0, -.36, 0);
    g.add(motor);
    var swBtn = at(rbox(.06, .04, .1, .012, m.gold), .0, -.36, .1);
    g.add(swBtn);

    /* bico */
    var nozzle = at(cyl(.045, .03, .1, 16, m.steel), 0, .24, 0);
    g.add(nozzle);
    var tip = at(cyl(.018, .03, .04, 12, m.gold), 0, .3, 0);
    g.add(tip);

    /* mangueira */
    var hose = tube([[.08, -.36, .04], [.26, -.44, .12], [.3, -.2, .2], [.2, .0, .16]], .018, M(0x2a2e36, { rough: .9 }), 18);
    g.add(hose);

    return g;
  }

  /* soprador de calor */
  function heatGun(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(cyl(.1, .11, .36, 26, m.body), 0, .12, 0);
    rot(body, Math.PI / 2, 0, 0); g.add(body);

    var nozzle = at(cyl(.055, .1, .18, 24, m.alt), 0, .12, .27);
    rot(nozzle, Math.PI / 2, 0, 0); g.add(nozzle);
    var tip = at(cyl(.04, .055, .05, 20, m.darkSteel), 0, .12, .37);
    rot(tip, Math.PI / 2, 0, 0); g.add(tip);

    var rear = at(cyl(.09, .09, .06, 22, m.dark), 0, .12, -.2);
    rot(rear, Math.PI / 2, 0, 0); g.add(rear);
    var grill = at(tor(.085, .012, m.gold, 8, 24), 0, .12, -.21);
    g.add(grill);

    /* empunhadura */
    var grip = at(rbox(.11, .34, .13, .04, m.rubber), 0, -.12, -.03);
    rot(grip, .2, 0, 0); g.add(grip);
    var trigger = at(rbox(.05, .1, .09, .015, m.gold), 0, -.06, .04);
    g.add(trigger);

    /* suporte de bancada */
    var stand = at(rbox(.24, .03, .16, .01, m.alt), 0, -.3, -.02);
    g.add(stand);
    var arm = at(rbox(.04, .12, .04, .012, m.alt), 0, -.24, -.02);
    g.add(arm);

    return g;
  }

  /* pistola de pregos */
  function nailGun(p) {
    var g = new T.Group(), m = palette(p);

    var body = at(rbox(.32, .26, .16, .04, m.body), 0, .12, 0);
    g.add(body);

    /* magazine */
    var mag = at(rbox(.1, .38, .12, .02, m.alt), -.2, -.02, 0);
    rot(mag, 0, 0, .18); g.add(mag);
    var feed = at(rbox(.05, .34, .07, .012, m.gold), -.16, -.02, .02);
    rot(feed, 0, 0, .18); g.add(feed);

    /* punho */
    var grip = at(rbox(.12, .3, .13, .035, m.rubber), .0, -.14, 0);
    rot(grip, 0, 0, .25); g.add(grip);
    var trig = at(rbox(.05, .11, .1, .015, m.gold), .05, -.04, 0);
    g.add(trig);

    /* bico */
    var nose = at(rbox(.08, .1, .08, .015, m.darkSteel), .17, .06, 0);
    g.add(nose);
    var tip = at(rbox(.04, .05, .04, .008, m.gold), .17, -.01, 0);
    g.add(tip);

    /* bateria */
    var bat = at(rbox(.2, .16, .14, .025, m.alt), -.02, -.3, 0);
    g.add(bat);

    return g;
  }

  /* bancada dobrável */
  function workbench(p) {
    var g = new T.Group(), m = palette(p);

    /* tampo */
    var top = at(rbox(1.4, .07, .62, .015, M(0x8a5a2b, { rough: .78, metal: .05 })), 0, .5, 0);
    g.add(top);
    var edge = at(rbox(1.42, .03, .64, .01, m.dark), 0, .455, 0);
    g.add(edge);

    /* pernas */
    [[-.6, -.24], [.6, -.24], [-.6, .24], [.6, .24]].forEach(function (c) {
      var leg = at(rbox(.07, 1, .07, .014, m.body), c[0], -.02, c[1]);
      g.add(leg);
    });

    /* travessas */
    var cross1 = at(rbox(1.2, .05, .05, .012, m.body), 0, -.42, -.24);
    g.add(cross1);
    var cross2 = at(rbox(1.2, .05, .05, .012, m.body), 0, -.42, .24);
    g.add(cross2);
    var cross3 = at(rbox(.05, .05, .48, .012, m.body), -.6, -.42, 0);
    g.add(cross3);
    var cross4 = at(rbox(.05, .05, .48, .012, m.body), .6, -.42, 0);
    g.add(cross4);
    var shelf = at(rbox(1.16, .035, .42, .01, m.alt), 0, -.28, 0);
    g.add(shelf);

    /* morsa */
    var viseBase = at(rbox(.2, .1, .16, .02, m.darkSteel), -.48, .58, .06);
    g.add(viseBase);
    var viseJaw = at(rbox(.2, .09, .05, .015, m.gold), -.48, .65, .1);
    g.add(viseJaw);
    var viseScrew = at(cyl(.02, .02, .16, 12, m.steel), -.48, .62, .18);
    rot(viseScrew, Math.PI / 2, 0, 0); g.add(viseScrew);

    /* ferramentas em cima */
    var drillBody = at(rbox(.12, .12, .3, .035, m.gold), .34, .6, -.08);
    g.add(drillBody);
    var tool1 = at(rbox(.04, .04, .26, .012, m.steel), .52, .55, .12);
    rot(tool1, 0, .5, 0); g.add(tool1);

    return g;
  }

  /* kit de teste de tensão */
  function voltTester(p) {
    var g = new T.Group(), m = palette(p);

    /* maleta aberta */
    var base = at(rbox(.6, .16, .4, .03, m.body), 0, -.18, 0);
    g.add(base);
    var lid = at(rbox(.6, .09, .4, .03, m.alt), 0, .0, -.14);
    rot(lid, -.3, 0, 0); g.add(lid);
    var foam = at(rbox(.54, .04, .34, .01, M(0x101216, { rough: .95 })), 0, -.08, 0);
    g.add(foam);

    /* multímetro */
    var meter = at(rbox(.2, .24, .08, .015, m.dark), -.13, -.02, .03);
    g.add(meter);
    var screen = at(rbox(.14, .08, .012, .005, M(0x0c1a14, { rough: .25, emissive: 0x2bff8c, ei: 1.1 })), -.13, .05, .075);
    g.add(screen);
    var dial = at(cyl(.04, .04, .03, 16, m.gold), -.13, -.07, .075);
    rot(dial, Math.PI / 2, 0, 0); g.add(dial);
    for (var i = 0; i < 2; i++) {
      var jack = at(cyl(.022, .022, .03, 12, m.steel), -.2 + i * .14, -.12, .075);
      rot(jack, Math.PI / 2, 0, 0); g.add(jack);
    }

    /* sondas */
    var probe1 = at(cyl(.018, .022, .34, 12, m.body), .12, .0, .1);
    rot(probe1, .5, 0, .3); g.add(probe1);
    var probe2 = at(cyl(.018, .022, .34, 12, m.body), .2, .0, .12);
    rot(probe2, .5, 0, -.3); g.add(probe2);
    var tip1 = at(cyl(.006, .012, .07, 10, m.steel), .17, .16, .16);
    rot(tip1, .5, 0, .3); g.add(tip1);

    return g;
  }

  /* cortador de cerâmica */
  function tileCutter(p) {
    var g = new T.Group(), m = palette(p);

    var base = at(rbox(.72, .06, .5, .012, m.body), 0, -.24, 0);
    g.add(base);
    var rail = at(rbox(.74, .04, .06, .008, m.steel), 0, -.19, 0);
    g.add(rail);

    /* carro do disco */
    var carriage = at(rbox(.18, .12, .24, .02, m.alt), .1, -.12, 0);
    g.add(carriage);
    var wheel = at(cyl(.085, .085, .03, 26, m.steel), .1, -.09, 0);
    rot(wheel, 0, 0, Math.PI / 2); g.add(wheel);
    var wheel2 = at(cyl(.085, .085, .03, 26, m.steel), .1, -.09, -.13);
    rot(wheel2, 0, 0, Math.PI / 2); g.add(wheel2);

    /* barra e punho */
    var bar = at(rbox(.06, .06, .5, .012, m.steel), .1, -.04, 0);
    g.add(bar);
    var handle = at(rbox(.05, .05, .3, .012, m.rubber), .1, -.04, .3);
    g.add(handle);
    var knob = at(sph(.045, m.gold, 12), .1, -.04, .46);
    g.add(knob);

    /* régua */
    var ruler = at(rbox(.6, .01, .05, .004, M(0xf0f0ec, { rough: .7 })), -.02, -.2, .2);
    g.add(ruler);

    /* azulejo de exemplo */
    var tile = at(rbox(.34, .015, .34, .005, M(0xd9dde3, { rough: .3, metal: .05 })), -.18, -.19, .02);
    g.add(tile);

    return g;
  }

  /* ═══════════════════════════════════════════════════════
     CONSTRUTORES — equipamentos de segurança, marcenaria,
     jardim, energia e medição
     ═══════════════════════════════════════════════════════ */

  /* capacete de segurança */
  function cap(p) {
    var g = new T.Group(), m = palette(p);
    /* casco (perfil torneado) */
    var pts = [
      new T.Vector2(.001, -.14), new T.Vector2(.29, -.14), new T.Vector2(.335, -.11),
      new T.Vector2(.34, -.05), new T.Vector2(.305, .03), new T.Vector2(.27, .12),
      new T.Vector2(.205, .21), new T.Vector2(.115, .265), new T.Vector2(.001, .285)
    ];
    var shell = new T.Mesh(new T.LatheGeometry(pts, 44), m.body);
    g.add(shell);
    /* aba frontal */
    var peak = at(rbox(.30, .032, .28, .015, m.body), 0, -.125, .25);
    rot(peak, -.2, 0, 0); g.add(peak);
    /* aba traseira */
    var back = at(rbox(.30, .028, .16, .014, m.body), 0, -.12, -.24);
    rot(back, .22, 0, 0); g.add(back);
    /* nervuras */
    for (var i = 0; i < 2; i++) {
      var rib = at(rbox(.03, .04, .42, .012, m.alt), -.115 + i * .23, .175, -.02);
      rot(rib, 0, 0, 0); g.add(rib);
    }
    /* borda inferior escura */
    var edge = at(tor(.335, .018, m.dark, 8, 36), 0, -.13, 0);
    edge.scale.set(1, 1, 1); rot(edge, Math.PI / 2, 0, 0); g.add(edge);
    /* ajuste de nuca */
    var knob = at(cyl(.05, .05, .04, 14, m.gold), 0, -.02, -.3);
    rot(knob, Math.PI / 2, 0, 0); g.add(knob);
    var cradle = at(tor(.16, .015, m.dark, 8, 22, Math.PI), 0, -.1, -.25);
    g.add(cradle);
    /* marca */
    var logo = at(rbox(.09, .04, .02, .008, m.gold), 0, -.05, .28);
    g.add(logo);
    return g;
  }

  /* óculos de proteção */
  function glasses(p) {
    var g = new T.Group(), m = palette(p);
    var lensMat = M(0xbfd8e8, { rough: .06, metal: .1, opacity: .38 });
    lensMat.transparent = true;
    for (var i = 0; i < 2; i++) {
      var lens = at(cyl(.11, .11, .02, 24, lensMat), -.12 + i * .24, 0, 0);
      rot(lens, Math.PI / 2, 0, 0); g.add(lens);
      var ring = at(tor(.11, .014, m.dark, 8, 26), -.12 + i * .24, 0, 0);
      g.add(ring);
    }
    var bridge = at(rbox(.05, .02, .02, .008, m.dark), 0, .02, 0);
    g.add(bridge);
    var arm1 = at(rbox(.02, .02, .26, .008, m.dark), -.23, .02, -.12);
    rot(arm1, .2, 0, 0); g.add(arm1);
    var arm2 = at(rbox(.02, .02, .26, .008, m.dark), .23, .02, -.12);
    rot(arm2, .2, 0, 0); g.add(arm2);
    return g;
  }

  /* luva de raspa */
  function glove(p) {
    var g = new T.Group(), m = palette(p);
    var leather = M(p.color, { rough: .88, metal: .02 });
    var palm = at(rbox(.26, .3, .07, .06, leather), 0, 0, 0);
    g.add(palm);
    var cuff = at(rbox(.27, .1, .08, .03, M(0x2a2e36, { rough: .9 })), 0, -.2, 0);
    g.add(cuff);
    for (var i = 0; i < 4; i++) {
      var f = at(cyl(.028, .03, .17 - i * .012, 10, leather), -.085 + i * .057, .22, 0);
      g.add(f);
      var tip = at(sph(.03, leather, 10), -.085 + i * .057, .3 - i * .006, 0);
      g.add(tip);
    }
    var thumb = at(cyl(.032, .034, .14, 10, leather), -.15, .04, .02);
    rot(thumb, 0, 0, .9); g.add(thumb);
    var stitch = at(rbox(.24, .012, .075, .005, M(0xd8c9a8, { rough: .9 })), 0, .13, .001);
    g.add(stitch);
    return g;
  }

  /* cinto de ferramentas */
  function belt(p) {
    var g = new T.Group(), m = palette(p);
    var strap = at(tor(.3, .035, M(0x3a2a18, { rough: .9 })), 0, .1, 0);
    rot(strap, Math.PI / 2, 0, 0); g.add(strap);
    var buckle = at(rbox(.1, .08, .04, .012, m.steel), 0, .1, .3);
    g.add(buckle);
    var pouches = [[-.18, -.12], [.1, -.16], [-.05, .12]];
    pouches.forEach(function (c, i) {
      var po = at(rbox(.15, .2, .1, .03, m.body), c[0], c[1], .24);
      rot(po, 0, 0, i * .12); g.add(po);
      var lip = at(rbox(.16, .035, .11, .012, m.alt), c[0], c[1] + .1, .245);
      g.add(lip);
    });
    var hammerH = at(cyl(.024, .026, .34, 12, m.steel), .26, -.02, .26);
    rot(hammerH, 0, 0, .12); g.add(hammerH);
    var hammerHead = at(rbox(.1, .07, .07, .02, m.darkSteel), .26, .17, .26);
    g.add(hammerHead);
    return g;
  }

  /* plaina elétrica */
  function planer(p) {
    var g = new T.Group(), m = palette(p);
    var body = at(rbox(.44, .18, .17, .035, m.body), 0, .02, 0);
    g.add(body);
    var sole = at(rbox(.46, .04, .18, .012, m.steel), 0, -.1, 0);
    g.add(sole);
    var knob = at(cyl(.05, .05, .1, 16, m.dark), 0, .18, 0);
    g.add(knob);
    var knobTop = at(cyl(.07, .07, .03, 16, m.gold), 0, .24, 0);
    g.add(knobTop);
    var handle = at(tor(.13, .032, m.rubber, 8, 20, Math.PI), -.02, .12, 0);
    g.add(handle);
    var trigger = at(rbox(.05, .1, .09, .015, m.gold), .06, .04, 0);
    g.add(trigger);
    var chip = at(rbox(.06, .05, .09, .015, m.darkSteel), .17, -.03, .0);
    g.add(chip);
    var cord = tube([[-.22, .05, .06], [-.36, -.05, .12], [-.44, -.28, .2]], .018, M(0x2a2e36, { rough: .9 }), 16);
    g.add(cord);
    return g;
  }

  /* roçadeira */
  function brushCutter(p) {
    var g = new T.Group(), m = palette(p);
    /* motor */
    var engine = at(rbox(.28, .26, .24, .04, m.body), 0, .3, 0);
    g.add(engine);
    var tank = at(rbox(.2, .16, .18, .03, m.alt), 0, .48, 0);
    g.add(tank);
    var cap = at(cyl(.04, .04, .03, 12, m.gold), 0, .57, 0);
    g.add(cap);
    var muffler = at(cyl(.06, .06, .16, 12, m.darkSteel), -.16, .3, 0);
    rot(muffler, 0, 0, Math.PI / 2); g.add(muffler);
    /* eixo */
    var shaft = at(cyl(.035, .035, .78, 14, m.steel), 0, -.1, 0);
    g.add(shaft);
    /* guidão */
    var bar = at(cyl(.028, .028, .56, 12, m.dark), 0, .12, 0);
    rot(bar, 0, 0, Math.PI / 2); g.add(bar);
    var grip1 = at(cyl(.032, .032, .16, 12, m.rubber), -.26, .12, 0);
    rot(grip1, 0, 0, Math.PI / 2); g.add(grip1);
    var grip2 = at(cyl(.032, .032, .16, 12, m.rubber), .26, .12, 0);
    rot(grip2, 0, 0, Math.PI / 2); g.add(grip2);
    /* disco de corte */
    var disc = at(cyl(.2, .2, .015, 30, m.darkSteel), 0, -.5, 0);
    g.add(disc);
    var head = at(cyl(.05, .07, .12, 14, m.alt), 0, -.42, 0);
    g.add(head);
    /* proteção */
    var guard = at(new T.Mesh(new T.CylinderGeometry(.24, .24, .14, 24, 1, true, Math.PI, Math.PI), m.alt), 0, -.36, 0);
    g.add(guard);
    /* alça de segurança */
    var hoop = at(tor(.16, .018, m.steel, 8, 22, Math.PI), 0, .5, -.18);
    rot(hoop, .5, 0, 0); g.add(hoop);
    return g;
  }

  /* nível a laser 360° */
  function laserLevel(p) {
    var g = new T.Group(), m = palette(p);
    var base = at(rbox(.16, .06, .16, .02, m.alt), 0, -.26, 0);
    g.add(base);
    var col = at(cyl(.035, .035, .1, 14, m.steel), 0, -.19, 0);
    g.add(col);
    var body = at(rbox(.18, .18, .16, .03, m.body), 0, -.02, 0);
    g.add(body);
    var head = at(cyl(.07, .07, .16, 18, m.alt), 0, .1, 0);
    g.add(head);
    var win = at(cyl(.045, .045, .02, 16, M(0x220808, { rough: .1, metal: .2, emissive: 0xff2b2b, ei: 2.6 })), 0, .1, .085);
    rot(win, Math.PI / 2, 0, 0); g.add(win);
    var pend = at(rbox(.1, .12, .02, .01, M(0x3a4048, { rough: .5, metal: .4 })), 0, -.04, .085);
    g.add(pend);
    var knob = at(cyl(.035, .035, .03, 12, m.gold), .07, .1, .085);
    rot(knob, Math.PI / 2, 0, 0); g.add(knob);
    /* feixe de laser */
    var beam = new T.Mesh(new T.ConeGeometry(.09, 1.1, 16, 1, true), M(0xff3b3b, { rough: 1, metal: 0, emissive: 0xff2020, ei: 2, opacity: .1 }));
    beam.material.transparent = true;
    beam.material.blending = T.AdditiveBlending;
    beam.material.depthWrite = false;
    beam.position.set(0, .6, .08);
    beam.rotation.x = Math.PI;
    g.add(beam);
    return g;
  }

  /* trena */
  function tape(p) {
    var g = new T.Group(), m = palette(p);
    var body = at(rbox(.22, .22, .075, .035, M(p.color, { rough: .5, metal: .08 })), 0, 0, 0);
    g.add(body);
    var beltClip = at(rbox(.06, .05, .03, .012, m.steel), 0, .11, .04);
    g.add(beltClip);
    var blade = at(rbox(.5, .05, .008, .003, M(0xf2c200, { rough: .4, metal: .3 })), .28, -.04, .04);
    g.add(blade);
    var hook = at(rbox(.03, .06, .02, .005, m.steel), .53, -.04, .04);
    g.add(hook);
    var grip = at(rbox(.16, .05, .085, .02, m.rubber), -.02, .04, 0);
    g.add(grip);
    return g;
  }

  /* serra de bancada */
  function benchSaw(p) {
    var g = new T.Group(), m = palette(p);
    /* mesa */
    var table = at(rbox(.9, .05, .62, .015, m.steel), 0, .28, 0);
    g.add(table);
    var slot = at(rbox(.6, .012, .05, .004, m.dark), 0, .3, .0);
    g.add(slot);
    /* disco */
    var blade = at(cyl(.26, .26, .012, 40, M(0x8d95a3, { rough: .34, metal: .95 })), 0, .12, 0);
    g.add(blade);
    var teeth = at(tor(.256, .016, M(0x5d6470, { rough: .3, metal: .9 }), 8, 44), 0, .12, 0);
    rot(teeth, Math.PI / 2, 0, 0); g.add(teeth);
    /* motor sob a mesa */
    var motor = at(cyl(.13, .13, .3, 20, m.body), 0, -.06, -.12);
    rot(motor, 0, 0, Math.PI / 2); g.add(motor);
    var mount = at(rbox(.34, .12, .12, .02, m.alt), 0, .04, -.12);
    g.add(mount);
    /* guia paralela */
    var fence = at(rbox(.08, .16, .5, .012, m.alt), .3, .38, 0);
    g.add(fence);
    var fenceKnob = at(cyl(.04, .04, .06, 12, m.gold), .3, .44, .18);
    rot(fenceKnob, Math.PI / 2, 0, 0); g.add(fenceKnob);
    /* guiador de esquadria */
    var gauge = at(rbox(.06, .1, .3, .012, m.gold), -.2, .34, .1);
    g.add(gauge);
    /* pernas */
    [[-.36, -.22], [.36, -.22], [-.36, .22], [.36, .22]].forEach(function (c) {
      var leg = at(rbox(.055, .72, .055, .012, m.body), c[0], -.14, c[1]);
      g.add(leg);
    });
    var brace = at(rbox(.76, .045, .045, .01, m.body), 0, -.44, -.22);
    g.add(brace);
    return g;
  }

  /* gerador */
  function generator(p) {
    var g = new T.Group(), m = palette(p);
    /* quadro */
    [[-.3, -.18], [.3, -.18], [-.3, .18], [.3, .18]].forEach(function (c) {
      var t = at(rbox(.05, .62, .05, .012, m.body), c[0], 0, c[1]);
      g.add(t);
    });
    var topBar = at(rbox(.66, .05, .42, .012, m.body), 0, .3, 0);
    g.add(topBar);
    /* motor */
    var block = at(rbox(.4, .32, .32, .04, m.dark), 0, .02, 0);
    g.add(block);
    var tank = at(rbox(.42, .2, .34, .04, m.alt), 0, .24, 0);
    g.add(tank);
    var cap = at(cyl(.05, .05, .04, 12, m.gold), 0, .36, 0);
    g.add(cap);
    var muffler = at(cyl(.06, .06, .18, 12, m.darkSteel), -.26, .12, 0);
    rot(muffler, 0, 0, Math.PI / 2); g.add(muffler);
    /* painel */
    var panel = at(rbox(.2, .16, .04, .012, m.alt), 0, .1, .19);
    g.add(panel);
    var disp = at(rbox(.1, .06, .02, .005, M(0x0a1a12, { rough: .3, emissive: 0x22ff88, ei: 1.2 })), -.03, .12, .21);
    g.add(disp);
    for (var i = 0; i < 2; i++) {
      var sock = at(cyl(.032, .032, .03, 12, m.gold), .04 + i * .0, .04 + i * .08, .21);
      rot(sock, Math.PI / 2, 0, 0); g.add(sock);
    }
    /* alça */
    var handle = at(tor(.26, .026, m.rubber, 8, 22, Math.PI), 0, .3, 0);
    rot(handle, 0, 0, 0); g.add(handle);
    /* rodas */
    var w1 = at(cyl(.11, .11, .06, 18, m.rubber), -.26, -.32, .16);
    rot(w1, 0, 0, Math.PI / 2); g.add(w1);
    var w2 = at(cyl(.11, .11, .06, 18, m.rubber), -.26, -.32, -.16);
    rot(w2, 0, 0, Math.PI / 2); g.add(w2);
    var foot = at(rbox(.1, .14, .12, .02, m.dark), .28, -.28, 0);
    g.add(foot);
    return g;
  }

  /* extintor de incêndio */
  function extinguisher(p) {
    var g = new T.Group(), m = palette(p);
    var body = at(cyl(.14, .15, .58, 26, M(p.color, { rough: .38, metal: .25 })), 0, .0, 0);
    g.add(body);
    var dome = at(sph(.14, M(p.color, { rough: .38, metal: .25 }), 22), 0, .29, 0);
    dome.scale.set(1, .55, 1); g.add(dome);
    var base = at(cyl(.15, .15, .04, 26, m.dark), 0, -.3, 0);
    g.add(base);
    var neck = at(cyl(.05, .06, .1, 14, m.steel), 0, .35, 0);
    g.add(neck);
    var valve = at(rbox(.12, .09, .09, .02, m.steel), 0, .42, 0);
    g.add(valve);
    var lever = at(rbox(.16, .03, .05, .01, m.accent), .04, .48, 0);
    rot(lever, 0, 0, .1); g.add(lever);
    var handle = at(rbox(.15, .03, .05, .01, m.accent), .04, .44, 0);
    g.add(handle);
    var gauge = at(cyl(.05, .05, .03, 16, m.steel), .1, .42, .06);
    rot(gauge, Math.PI / 2, 0, 0); g.add(gauge);
    var gf = at(cyl(.038, .038, .012, 14, M(0xf5f5f0, { rough: .6 })), .1, .42, .08);
    rot(gf, Math.PI / 2, 0, 0); g.add(gf);
    var hose = tube([[.04, .4, .08], [.2, .26, .14], [.24, -.04, .12]], .022, M(0x22262d, { rough: .9 }), 18);
    g.add(hose);
    var label = at(cyl(.152, .152, .2, 26, M(0xf2f2ee, { rough: .7 }), true), 0, .02, 0);
    g.add(label);
    return g;
  }

  /* rolo de pintura profissional */
  function paintRoller(p) {
    var g = new T.Group(), m = palette(p);
    var roller = at(cyl(.075, .075, .3, 22, M(0xe8e2d4, { rough: .95 })), 0, .1, 0);
    rot(roller, 0, 0, Math.PI / 2); g.add(roller);
    var core = at(cyl(.028, .028, .32, 12, m.steel), 0, .1, 0);
    rot(core, 0, 0, Math.PI / 2); g.add(core);
    var frame = at(rbox(.02, .26, .02, .008, m.steel), 0, -.04, .0);
    g.add(frame);
    var bend = at(rbox(.02, .02, .08, .008, m.steel), 0, -.16, .03);
    g.add(bend);
    var handle = at(cyl(.022, .026, .16, 12, m.rubber), 0, -.24, .06);
    rot(handle, .5, 0, 0); g.add(handle);
    var tray = at(rbox(.28, .04, .34, .02, m.body), 0, -.38, 0);
    g.add(tray);
    var paint = at(rbox(.24, .02, .3, .014, M(p.alt || 0xf5b301, { rough: .6 })), 0, -.355, 0);
    g.add(paint);
    return g;
  }

  /* registro ─────────────────────────────────────────── */
  var BUILDERS = {
    drill: drill,
    circularSaw: circularSaw,
    jigSaw: jigSaw,
    recipSaw: recipSaw,
    grinder: grinder,
    orbitalSander: orbitalSander,
    beltSander: beltSander,
    wrenchSet: wrenchSet,
    socketSet: socketSet,
    toolcase: toolcase,
    cabinet: cabinet,
    shelfRack: shelfRack,
    welder: welder,
    compressor: compressor,
    laser: laser,
    sprayer: sprayer,
    heatGun: heatGun,
    nailGun: nailGun,
    workbench: workbench,
    voltTester: voltTester,
    tileCutter: tileCutter,
    cap: cap,
    glasses: glasses,
    glove: glove,
    belt: belt,
    planer: planer,
    brushCutter: brushCutter,
    laserLevel: laserLevel,
    tape: tape,
    benchSaw: benchSaw,
    generator: generator,
    extinguisher: extinguisher,
    paintRoller: paintRoller
  };

  /* material isolado por instância (wireframe seguro) */
  function isolateMaterials(root) {
    var map = new Map();
    root.traverse(function (o) {
      if (!o.material) return;
      if (Array.isArray(o.material)) {
        o.material = o.material.map(function (m) {
          if (!map.has(m)) map.set(m, m.clone());
          return map.get(m);
        });
      } else {
        if (!map.has(o.material)) map.set(o.material, o.material.clone());
        o.material = map.get(o.material);
      }
    });
    return Array.from(map.values());
  }

  function dispose(root) {
    if (!root) return;
    root.traverse(function (o) {
      if (o.geometry) o.geometry.dispose();
    });
  }

  /* ajusta escala e centraliza o modelo */
  function fit(g, size) {
    var box = new T.Box3().setFromObject(g);
    var c = box.getCenter(new T.Vector3());
    var s = box.getSize(new T.Vector3());
    var max = Math.max(s.x, s.y, s.z) || 1;
    var k = size / max;
    var wrap = new T.Group();
    g.position.set(-c.x * k, -c.y * k, -c.z * k);
    g.scale.setScalar(k);
    wrap.add(g);
    /* altura útil: metade da altura do modelo já escalado (apoio em Y) */
    wrap.userData.halfHeight = (s.y * k) / 2;
    wrap.userData.size = size;
    wrap.userData.radius = (Math.max(s.x, s.y, s.z) * k) / 2;
    return wrap;
  }

  /* constrói o modelo completo de um produto */
  function build(product, size) {
    if (!product) return null;
    var builder = BUILDERS[product.model] || drill;
    var g = builder(product);
    if (!g) return null;
    var wrap = fit(g, size || 2.1);
    wrap.userData.materials = isolateMaterials(wrap);
    wrap.userData.parts = [];
    wrap.children[0].children.forEach(function (child) {
      child.userData.home = child.position.clone();
      wrap.userData.parts.push(child);
    });
    return wrap;
  }

  return { build: build, dispose: dispose, M: M, BUILDERS: BUILDERS };
})();
