document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const isMobile = window.innerWidth < 720;

    /* ---------- Preloader ---------- */
    const preloader = document.getElementById('preloader');
    const loadbar = document.getElementById('loadbar');
    const loadpct = document.getElementById('loadpct');
    let pct = 0;
    const tick = setInterval(() => {
        pct = Math.min(100, pct + Math.random() * 22);
        if (loadbar) loadbar.style.width = pct + '%';
        if (loadpct) loadpct.textContent = Math.floor(pct) + '%';
        if (pct >= 100) {
            clearInterval(tick);
            setTimeout(() => preloader && preloader.classList.add('done'), 250);
        }
    }, 120);
    setTimeout(() => { // segurança: nunca trava
        clearInterval(tick);
        if (preloader) preloader.classList.add('done');
    }, 2500);

    /* ---------- Menu mobile ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;
    const setMenu = (open) => {
        if (!navMenu) return;
        navMenu.classList.toggle('active', open);
        if (menuIcon) menuIcon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
        if (open && header) header.classList.remove('nav-hidden');
    };
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('active')));
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && header && !header.contains(e.target)) setMenu(false);
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    }

    /* ---------- Scroll suave ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); setMenu(false); }
        });
    });

    /* ---------- Menu flutuante: encolhe/esconde + link ativo ---------- */
    const navLinks = Array.from(document.querySelectorAll('.nav-menu a'));
    if (header) {
        let lastY = window.scrollY;
        const headerState = () => {
            const y = window.scrollY;
            header.classList.toggle('scrolled', y > 24);
            const open = navMenu && navMenu.classList.contains('active');
            if (!open) {
                if (y > lastY + 6 && y > 320) header.classList.add('nav-hidden');
                else if (y < lastY - 6 || y < 160) header.classList.remove('nav-hidden');
            }
            lastY = y;
        };
        window.addEventListener('scroll', headerState, { passive: true });
        header.addEventListener('mouseenter', () => header.classList.remove('nav-hidden'));
        headerState();

        // link da página atual (páginas internas)
        const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
        navLinks.forEach(a => {
            const file = (a.getAttribute('href') || '').split('#')[0].toLowerCase();
            if (file && file === here) a.classList.add('active');
        });

        // scrollspy nas âncoras desta página (home)
        const anchors = navLinks.filter(a => {
            const h = a.getAttribute('href') || '';
            return h.charAt(0) === '#' && h.length > 1 && !!document.querySelector(h);
        });
        if (anchors.length) {
            const spy = () => {
                let cur = null;
                anchors.forEach(a => {
                    if (document.querySelector(a.getAttribute('href')).getBoundingClientRect().top <= window.innerHeight * .4) cur = a;
                });
                anchors.forEach(a => a.classList.toggle('active', a === cur));
            };
            window.addEventListener('scroll', spy, { passive: true });
            spy();
        }
    }

    /* ---------- Barra de progresso ---------- */
    const progress = document.getElementById('scroll-progress');
    const onScrollBar = () => {
        if (!progress) return;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', onScrollBar, { passive: true }); onScrollBar();

    /* ---------- Reveal (GSAP se houver, senão fallback) ---------- */
    const els = document.querySelectorAll('.animate-on-scroll, .reveal');
    if (!reduceMotion && window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        els.forEach(el => {
            el.style.opacity = '1'; el.style.transform = 'none'; // GSAP controla
            gsap.fromTo(el, { y: 34, opacity: 0 }, {
                y: 0, opacity: 1, duration: .9, ease: 'power3.out',
                scrollTrigger: { trigger: el, start: 'top 88%' }
            });
        });
        // Parallax leve no hero
        const heroLeft = document.querySelector('[data-hero-parallax]');
        const heroRight = document.querySelector('[data-tilt-stage]');
        if (heroLeft) gsap.to(heroLeft, { y: -30, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
        if (heroRight) gsap.to(heroRight, { y: 40, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    } else {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('animate'); entry.target.classList.add('in'); } });
        }, { threshold: 0.1 });
        els.forEach(el => obs.observe(el));
    }

    /* ---------- Contadores animados ---------- */
    const stats = document.querySelector('[data-counters]');
    if (stats) {
        const run = () => {
            stats.querySelectorAll('strong').forEach(s => {
                const raw = s.textContent.trim();
                const num = parseInt(raw, 10);
                if (isNaN(num)) return;
                const suffix = raw.replace(/[0-9]/g, '');
                const t0 = performance.now(), dur = 1200;
                const step = (t) => {
                    const p = Math.min(1, (t - t0) / dur);
                    s.textContent = Math.floor(num * (1 - Math.pow(1 - p, 3))) + suffix;
                    if (p < 1) requestAnimationFrame(step);
                };
                if (!reduceMotion) requestAnimationFrame(step);
            });
        };
        new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: .4 }).observe(stats);
    }

    /* ---------- Cards 3D interativos (todos) ---------- */
    if (!reduceMotion) {
        document.querySelectorAll('.tilt, .work-card, .proj-card, .cap, .bio-card, .card, .tec-card, .pj-row, .proj, .steps > div, .tools a span').forEach(card => {
            const max = parseFloat(card.dataset.tilt || '9');
            let raf = null, tx = 0, ty = 0, cx = 0, cy = 0, active = false;
            card.classList.add('card3d');
            const render = () => {
                cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14;
                const done = !active && Math.abs(tx - cx) < 0.002 && Math.abs(ty - cy) < 0.002;
                if (done) { raf = null; card.style.transform = ''; card.classList.remove('is-hover'); return; }
                card.style.transform = `perspective(950px) rotateY(${(cx * max * 2).toFixed(2)}deg) rotateX(${(-cy * max * 2).toFixed(2)}deg) scale(${active ? 1.02 : 1})`;
                raf = requestAnimationFrame(render);
            };
            const kick = () => { if (!raf) raf = requestAnimationFrame(render); };
            card.addEventListener('pointermove', (e) => {
                const r = card.getBoundingClientRect();
                if (!r.width || !r.height) return;
                tx = (e.clientX - r.left) / r.width - 0.5;
                ty = (e.clientY - r.top) / r.height - 0.5;
                card.style.setProperty('--mx', ((tx + 0.5) * 100) + '%');
                card.style.setProperty('--my', ((ty + 0.5) * 100) + '%');
                if (!active) { active = true; card.classList.add('is-hover'); }
                kick();
            });
            const leave = () => { active = false; tx = 0; ty = 0; kick(); };
            card.addEventListener('pointerleave', leave);
            card.addEventListener('pointercancel', leave);
        });
    }

    /* ---------- Botões magnéticos ---------- */
    if (finePointer && !reduceMotion) {
        document.querySelectorAll('[data-magnetic]').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * .12}px, ${y * .12}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        });
    }

    /* ---------- Cursor premium ---------- */
    if (finePointer && !reduceMotion) {
        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        let mx = -100, my = -100, rx = -100, ry = -100;
        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; } });
        (function loop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; } requestAnimationFrame(loop); })();
        document.querySelectorAll('a, button, .tilt').forEach(el => {
            el.addEventListener('mouseenter', () => ring && ring.classList.add('hovering'));
            el.addEventListener('mouseleave', () => ring && ring.classList.remove('hovering'));
        });
    }

    /* ---------- FUNDO 3D INTERATIVO (Three.js): geometrias + túnel em grade + parallax + repulsão ---------- */
    try {
        const canvas = document.getElementById('bg3d');
        if (canvas && window.THREE && !reduceMotion) {
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 1.9));
            const scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x0b0b10, 0.03);
            const camera = new THREE.PerspectiveCamera(60, 1, .1, 160);
            camera.position.set(0, 0, 26);
            const resize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight, false);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            };
            resize(); window.addEventListener('resize', resize);

            /* Luzes: base branco-quente + chaves dourada e fria */
            scene.add(new THREE.AmbientLight(0xffffff, 0.5));
            const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
            keyLight.position.set(8, 12, 10); scene.add(keyLight);
            const warm = new THREE.PointLight(0xd8c3a5, 70, 95);
            warm.position.set(-16, 8, 12); scene.add(warm);
            const cool = new THREE.PointLight(0x6f8dff, 55, 95);
            cool.position.set(18, -10, 4); scene.add(cool);

            /* Mundo (recebe parallax do mouse) */
            const world = new THREE.Group();
            scene.add(world);

            /* Túnel em grade: chão e teto deslizando com a velocidade do scroll */
            const CELL = 5;
            const floor = new THREE.GridHelper(250, 50, 0xd8c3a5, 0x4a422f);
            floor.material.transparent = true; floor.material.opacity = 0.17;
            floor.position.y = -10; world.add(floor);
            const ceil = new THREE.GridHelper(250, 50, 0xd8c3a5, 0x3a3527);
            ceil.material.transparent = true; ceil.material.opacity = 0.07;
            ceil.position.y = 11; world.add(ceil);

            /* Geometrias flutuantes: núcleo escuro metálico + wireframe dourado */
            const geos = [
                new THREE.IcosahedronGeometry(1.7, 0),
                new THREE.TorusGeometry(1.35, 0.45, 14, 56),
                new THREE.BoxGeometry(1.9, 1.9, 1.9),
                new THREE.OctahedronGeometry(1.7, 0),
                new THREE.TetrahedronGeometry(1.7, 0),
                new THREE.TorusKnotGeometry(1, 0.3, 90, 12),
                new THREE.DodecahedronGeometry(1.6, 0),
                new THREE.ConeGeometry(1.3, 2.4, 6),
                new THREE.CylinderGeometry(1.1, 1.1, 1.8, 8, 1),
                new THREE.SphereGeometry(1.5, 16, 12)
            ];
            const objs = [];
            const COUNT = isMobile ? 13 : 26;
            for (let i = 0; i < COUNT; i++) {
                const geo = geos[i % geos.length];
                const solidMat = new THREE.MeshStandardMaterial({
                    color: 0x14141c, metalness: 0.75, roughness: 0.34,
                    emissive: 0xd8c3a5, emissiveIntensity: 0.12,
                    transparent: true, opacity: 0.92
                });
                const wireMat = new THREE.MeshBasicMaterial({
                    color: 0xd8c3a5, wireframe: true, transparent: true, opacity: 0.32
                });
                const g = new THREE.Group();
                g.add(new THREE.Mesh(geo, solidMat));
                const wireMesh = new THREE.Mesh(geo, wireMat);
                wireMesh.scale.setScalar(1.012);
                g.add(wireMesh);

                const side = Math.random() < 0.5 ? -1 : 1;
                g.position.set(side * (5 + Math.random() * 14), (Math.random() - 0.5) * 19, -36 + Math.random() * 44);
                g.scale.setScalar(0.7 + Math.random() * 0.9);
                world.add(g);
                objs.push({
                    g: g, solid: solidMat, wire: wireMat,
                    base: g.position.clone(),
                    rot: new THREE.Vector3((Math.random() - .5) * .5, (Math.random() - .5) * .6, (Math.random() - .5) * .4),
                    ph: Math.random() * Math.PI * 2,
                    amp: 0.4 + Math.random() * 0.7,
                    ox: 0, oy: 0, vx: 0, vy: 0, spin: 0, flash: 0, sx: 0, sy: 0
                });
            }

            /* Poeira dourada + brilho branco (profundidade) */
            const N = isMobile ? 320 : 950;
            const pos = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                pos[i * 3] = (Math.random() - .5) * 64;
                pos[i * 3 + 1] = (Math.random() - .5) * 42;
                pos[i * 3 + 2] = -42 + Math.random() * 58;
            }
            const pgeo = new THREE.BufferGeometry();
            pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const pMat = new THREE.PointsMaterial({ color: 0xd8c3a5, size: 0.12, transparent: true, opacity: 0.6, sizeAttenuation: true, depthWrite: false });
            const points = new THREE.Points(pgeo, pMat);
            world.add(points);
            const pMat2 = new THREE.PointsMaterial({ color: 0xffffff, size: 0.07, transparent: true, opacity: 0.3, sizeAttenuation: true, depthWrite: false });
            const points2 = new THREE.Points(pgeo.clone(), pMat2);
            points2.position.set(3, -2, -6);
            world.add(points2);

            /* Mouse / toque */
            let mX = 0, mY = 0, tX = 0, tY = 0;
            const pointAt = (cx, cy) => {
                tX = (cx / window.innerWidth - 0.5) * 2;
                tY = (cy / window.innerHeight - 0.5) * 2;
            };
            if (finePointer) window.addEventListener('mousemove', (e) => pointAt(e.clientX, e.clientY), { passive: true });
            window.addEventListener('touchmove', (e) => { if (e.touches[0]) pointAt(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

            /* Clique/toque = onda de energia: empurra, gira e faz brilhar */
            let pulse = 0;
            window.addEventListener('pointerdown', (e) => {
                pulse = 1;
                const cx = (e.clientX / window.innerWidth) * 2 - 1;
                const cy = -((e.clientY / window.innerHeight) * 2 - 1);
                objs.forEach((o) => {
                    const dx = o.sx - cx, dy = o.sy - cy;
                    const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
                    const f = Math.max(0, 1 - d / 1.7);
                    o.vx += (dx / d) * f * 10;
                    o.vy += (dy / d) * f * 10;
                    o.spin = Math.max(o.spin, 0.5 + f * 2.2);
                    o.flash = Math.max(o.flash, 0.35 + f * 0.65);
                });
            }, { passive: true });

            /* Paleta viva que muda com o scroll: champagne → branco → azul suave */
            const PAL = [new THREE.Color(0xd8c3a5), new THREE.Color(0xffffff), new THREE.Color(0x9db8ff), new THREE.Color(0xd8c3a5)];
            const acc = PAL[0].clone();

            const clock = new THREE.Clock();
            let t = 0, lastY = window.scrollY, scrollV = 0, scrollP = 0;
            const V = new THREE.Vector3();

            (function animate() {
                requestAnimationFrame(animate);
                const dt = Math.min(clock.getDelta(), 0.05);
                t += dt;

                /* scroll: profundidade do túnel + velocidade da grade */
                const y = window.scrollY;
                scrollV = scrollV * 0.88 + (y - lastY) * 0.12;
                lastY = y;
                const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                scrollP = Math.min(1, Math.max(0, y / maxS));
                const gridSpeed = (2.4 + Math.min(26, Math.abs(scrollV)) * 0.45) * dt;
                floor.position.z = (floor.position.z + gridSpeed) % CELL;
                ceil.position.z = (ceil.position.z + gridSpeed * 0.7) % CELL;

                /* parallax do mouse (suavizado) */
                mX += (tX - mX) * 0.06;
                mY += (tY - mY) * 0.06;
                world.rotation.y = mX * 0.12;
                world.rotation.x = mY * 0.06;

                const camZ = 26 - scrollP * 13;
                camera.position.z += (camZ - camera.position.z) * 0.06;
                camera.position.x += (mX * 2.6 - camera.position.x) * 0.05;
                camera.position.y += (-mY * 1.8 - camera.position.y) * 0.05;
                camera.lookAt(0, 0, -12);

                pulse = Math.max(0, pulse - dt * 1.9);
                const fovT = 60 + pulse * 5;
                if (Math.abs(camera.fov - fovT) > 0.02) { camera.fov = fovT; camera.updateProjectionMatrix(); }
                floor.material.opacity = 0.17 + pulse * 0.22;

                /* paleta viva pela posição do scroll */
                const seg = scrollP * (PAL.length - 1);
                const si = Math.min(PAL.length - 2, Math.floor(seg));
                acc.copy(PAL[si]).lerp(PAL[si + 1], seg - si);

                /* objetos: flutuam, giram, fogem do cursor e voltam (mola) */
                objs.forEach((o) => {
                    const ndc = V.set(o.g.position.x, o.g.position.y, o.g.position.z).project(camera);
                    o.sx = ndc.x; o.sy = ndc.y;
                    if (finePointer) {
                        const dx = ndc.x - tX, dy = ndc.y - (-tY);
                        const d = Math.sqrt(dx * dx + dy * dy) + 0.0001;
                        if (d < 0.5) {
                            const f = (0.5 - d) / 0.5;
                            o.vx += (dx / d) * f * dt * 24;
                            o.vy += (dy / d) * f * dt * 24;
                        }
                    }
                    o.vx += (-o.ox * 7 - o.vx * 3.4) * dt;
                    o.vy += (-o.oy * 7 - o.vy * 3.4) * dt;
                    o.ox += o.vx * dt;
                    o.oy += o.vy * dt;

                    o.g.position.set(
                        o.base.x + o.ox,
                        o.base.y + o.oy + Math.sin(t * (0.35 + o.amp * 0.3) + o.ph) * o.amp,
                        o.base.z + Math.cos(t * 0.3 + o.ph) * 0.5
                    );
                    const sp = 1 + o.spin;
                    o.g.rotation.x += o.rot.x * dt * sp;
                    o.g.rotation.y += o.rot.y * dt * sp;
                    o.g.rotation.z += o.rot.z * dt * sp;
                    o.spin = Math.max(0, o.spin - dt * 1.6);
                    o.flash = Math.max(0, o.flash - dt * 1.7);

                    /* some suavemente se chegar perto demais da câmera */
                    const dist = camera.position.z - o.g.position.z;
                    const near = Math.min(1, Math.max(0, (dist - 2.5) / 4.5));
                    o.solid.opacity = 0.92 * near;
                    o.wire.opacity = (0.32 + o.flash * 0.6) * near;
                    o.wire.color.copy(acc);
                    o.solid.emissive.copy(acc);
                    o.solid.emissiveIntensity = 0.12 + o.flash * 0.9;
                });

                /* poeira respira com o mouse e sobe devagar */
                points.rotation.y = t * 0.02 + mX * 0.3;
                points.rotation.x = mY * 0.2;
                points.position.y += dt * 0.3;
                if (points.position.y > 8) points.position.y -= 16;
                points2.rotation.y = -t * 0.012 + mX * 0.15;
                pMat.color.copy(acc);
                warm.color.copy(acc);
                floor.material.color.copy(acc);
                ceil.material.color.copy(acc);

                /* fade ao rolar: cena viva, mas dá protagonismo ao conteúdo */
                const fade = Math.max(0.5, 1 - y / (window.innerHeight * 3.5));
                canvas.style.opacity = fade.toFixed(2);

                renderer.render(scene, camera);
            })();
        } else if (canvas) { canvas.style.display = 'none'; }
    } catch (_) { const c = document.getElementById('bg3d'); if (c) c.style.display = 'none'; }

    /* ---------- Compartilhar (sem instalacao de app) ---------- */
    const shareBtn = document.getElementById('pwa-share');
    if (shareBtn) shareBtn.addEventListener('click', async () => {
        const data = { title: 'Estúdio Rick Digital', text: 'Fanpages que convertem e sites ultraprofissionais — veja o portfólio:', url: location.href };
        if (navigator.share) { try { await navigator.share(data); } catch (_) {} }
        else { try { await navigator.clipboard.writeText(data.url); alert('Link copiado!'); } catch (_) {} }
    });

    /* ---------- LEADS: origem de cada clique no WhatsApp ---------- */
    const pageTag = location.pathname.split('/').pop() || 'home';
    document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
        a.addEventListener('click', () => {
            try {
                const u = new URL(a.href);
                const t = u.searchParams.get('text') || '';
                if (!t.includes('(via ')) u.searchParams.set('text', (t + ` (via ${pageTag})`).trim());
                a.href = u.toString();
            } catch (_) {}
        });
    });

    /* ---------- LEADS: formulário -> e-mail + WhatsApp ---------- */
    const leadForm = document.getElementById('lead-form');
    if (leadForm) leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = (leadForm.nome.value || '').trim();
        const zap = (leadForm.whatsapp.value || '').trim();
        if (!zap) return;
        const btn = leadForm.querySelector('button[type="submit"]');
        const ok = leadForm.querySelector('.lead-ok');
        const now = leadForm.querySelector('#lead-wa-now');
        const detalheEl = document.getElementById('r_detalhe');
        const extra = detalheEl ? ' | Orcamento: ' + detalheEl.textContent : '';
        const msg = `Olá! Sou ${nome || 'interessado'} (${zap}) — vim pelo site (via ${pageTag})${extra}. Quero conversar!`;
        if (now) now.href = 'https://wa.me/5511989426415?text=' + encodeURIComponent(msg);
        if (btn) { btn.disabled = true; btn.style.opacity = '.6'; }
        try {
            const res = await fetch('https://formsubmit.co/ajax/estudiorickdigital@gmail.com', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ nome: nome || '-', whatsapp: zap, origem: pageTag, detalhe: extra || '-', _subject: `Novo lead do site (${pageTag}): ${nome || zap}`, _honey: leadForm._honey.value })
            });
            if (!res.ok) throw new Error('falha no envio');
        } catch (_) { /* fallback: lead segue pelo WhatsApp abaixo */ }
        /* ---------- CRM: espelha no Firebase p/ cair no funil sozinho ---------- */
        try {
            fetch('https://rick-digital-default-rtdb.firebaseio.com/site-leads.json', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: nome || 'Visitante', zap, origem: 'Site Portfólio (' + pageTag + ')', detalhe: extra || '-', data: new Date().toISOString() })
            }).catch(() => {});
        } catch (_) {}
        if (btn) btn.style.display = 'none';
        if (ok) ok.hidden = false;
    });

    /* ---------- CARROSSEL DESTAQUES: 4 visiveis ---------- */
    const track = document.getElementById('carTrack');
    if (track) {
        const cards = () => Array.from(track.children);
        let idx = 0, timer = null;
        const dotsBox = document.getElementById('carDots');
        const perView = () => 1;
        const maxIdx = () => Math.max(0, cards().length - 1);
        const renderDots = () => {
            if (!dotsBox) return; dotsBox.innerHTML = '';
            for (let i = 0; i <= maxIdx(); i++) {
                const b = document.createElement('button');
                if (i === idx) b.classList.add('on');
                b.setAttribute('aria-label', 'Ir para ' + (i + 1));
                b.addEventListener('click', () => { idx = i; update(); restart(); });
                dotsBox.appendChild(b);
            }
        };
        const update = () => {
            idx = Math.min(Math.max(0, idx), maxIdx());
            track.style.transform = `translateX(${-idx * 100}%)`;
            renderDots();
        };
        const next = () => { idx = idx >= maxIdx() ? 0 : idx + 1; update(); };
        const prev = () => { idx = idx <= 0 ? maxIdx() : idx - 1; update(); };
        const restart = () => { if (timer) clearInterval(timer); if (!reduceMotion) timer = setInterval(next, 3500); };
        document.getElementById('carNext')?.addEventListener('click', () => { next(); restart(); });
        document.getElementById('carPrev')?.addEventListener('click', () => { prev(); restart(); });
        track.parentElement.addEventListener('pointerenter', () => timer && clearInterval(timer));
        track.parentElement.addEventListener('pointerleave', restart);
        window.addEventListener('resize', update);
        update(); restart();
    }
});
