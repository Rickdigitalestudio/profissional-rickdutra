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
    if (menuToggle && navMenu) menuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));

    /* ---------- Scroll suave ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) { e.preventDefault(); target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' }); navMenu && navMenu.classList.remove('active'); }
        });
    });

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
        document.querySelectorAll('.tilt, .work-card, .all-grid a, .cap, .bio-card, .card, .tec-card, .pj-row, .proj, .steps > div, .tools a span').forEach(card => {
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

    /* ---------- Fundo 3D: quadrados flutuantes como estrelas (todo o site) ---------- */
    try {
        const canvas = document.getElementById('bg3d');
        if (canvas && window.THREE && !reduceMotion) {
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(60, 1, .1, 100);
            camera.position.z = 8;
            const resize = () => {
                renderer.setSize(window.innerWidth, window.innerHeight, false);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            };
            resize(); window.addEventListener('resize', resize);

            // Quadrados-estrelas: 2 camadas (champagne + branco) com InstancedMesh
            const dummy = new THREE.Object3D();
            const layers = [];
            const mkLayer = (count, color, size, opacity) => {
                const geoL = new THREE.PlaneGeometry(size, size);
                const matL = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false });
                const mesh = new THREE.InstancedMesh(geoL, matL, count);
                const seeds = [];
                for (let i = 0; i < count; i++) {
                    seeds.push({
                        x: (Math.random() - .5) * 20,
                        y: (Math.random() - .5) * 13,
                        z: (Math.random() - .5) * 8,
                        rot: Math.random() * Math.PI * 2,
                        rotSpd: (Math.random() - .5) * .6,
                        floatSpd: .08 + Math.random() * .25,
                        tw: Math.random() * Math.PI * 2,
                        twSpd: .6 + Math.random() * 1.6,
                        base: .6 + Math.random() * .4
                    });
                }
                mesh.userData.seeds = seeds;
                scene.add(mesh);
                layers.push(mesh);
                return mesh;
            };
            const total = isMobile ? 70 : 150;
            mkLayer(Math.round(total * .7), 0xd8c3a5, .085, .8);   // champagne
            mkLayer(Math.round(total * .3), 0xffffff, .06, .55);   // brancas menores

            let tx = 0, ty = 0;
            if (finePointer) window.addEventListener('mousemove', (e) => {
                tx = (e.clientX / window.innerWidth - .5);
                ty = (e.clientY / window.innerHeight - .5);
            });

            const clock = new THREE.Clock();
            (function animate() {
                requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                // Mantém as estrelas visíveis no site todo (fade suave, nunca some)
                const y = window.scrollY;
                const fade = Math.max(.55, 1 - y / (window.innerHeight * 4));
                canvas.style.opacity = fade.toFixed(2);
                const H = 6.5; // metade da altura visível: recicla ao sair do topo
                layers.forEach((mesh, li) => {
                    const seeds = mesh.userData.seeds;
                    for (let i = 0; i < seeds.length; i++) {
                        const s = seeds[i];
                        s.rot += s.rotSpd * .01;
                        let yy = (((s.y + H + t * s.floatSpd) % (H * 2) + H * 2) % (H * 2)) - H;
                        const twinkle = s.base * (.55 + .45 * Math.sin(t * s.twSpd + s.tw));
                        dummy.position.set(s.x + tx * (li + 1) * .5, yy + ty * (li + 1) * .3, s.z);
                        dummy.rotation.set(0, 0, s.rot);
                        dummy.scale.setScalar(Math.max(.05, twinkle));
                        dummy.updateMatrix();
                        mesh.setMatrixAt(i, dummy.matrix);
                    }
                    mesh.instanceMatrix.needsUpdate = true;
                });
                scene.rotation.y = tx * .12;
                scene.rotation.x = ty * .08;
                renderer.render(scene, camera);
            })();
        } else if (canvas && !reduceMotion) {
            // Fallback 2D (sem Three.js): quadrados flutuando no canvas 2D
            const ctx = canvas.getContext('2d');
            if (!ctx) { canvas.style.display = 'none'; }
            else {
                const SN = window.innerWidth < 720 ? 50 : 110;
                const stars = Array.from({ length: SN }, () => ({
                    x: Math.random(), y: Math.random(),
                    s: 1 + Math.random() * 3, r: Math.random() * Math.PI,
                    rs: (Math.random() - .5) * .02, vy: .0004 + Math.random() * .0012,
                    tw: Math.random() * Math.PI * 2, ts: .01 + Math.random() * .03,
                    c: Math.random() < .7 ? '216,195,165' : '255,255,255'
                }));
                const fit = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
                fit(); window.addEventListener('resize', fit);
                (function tick2d() {
                    requestAnimationFrame(tick2d);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    stars.forEach(p => {
                        p.y -= p.vy; p.r += p.rs; p.tw += p.ts;
                        if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
                        const a = .35 + .45 * Math.abs(Math.sin(p.tw));
                        ctx.save();
                        ctx.translate(p.x * canvas.width, p.y * canvas.height);
                        ctx.rotate(p.r);
                        ctx.fillStyle = `rgba(${p.c},${a.toFixed(2)})`;
                        ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
                        ctx.restore();
                    });
                })();
            }
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
            const res = await fetch('https://formsubmit.co/ajax/henriqueluizd91@gmail.com', {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ nome: nome || '-', whatsapp: zap, origem: pageTag, detalhe: extra || '-', _subject: `Novo lead do site (${pageTag}): ${nome || zap}`, _honey: leadForm._honey.value })
            });
            if (!res.ok) throw new Error('falha no envio');
        } catch (_) { /* fallback: lead segue pelo WhatsApp abaixo */ }
        if (btn) btn.style.display = 'none';
        if (ok) ok.hidden = false;
    });
});
