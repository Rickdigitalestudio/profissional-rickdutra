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

    /* ---------- Fundo 3D: partículas champagne (Three.js) ---------- */
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

            // Partículas
            const N = isMobile ? 350 : 900;
            const pos = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                pos[i * 3] = (Math.random() - .5) * 22;
                pos[i * 3 + 1] = (Math.random() - .5) * 14;
                pos[i * 3 + 2] = (Math.random() - .5) * 10;
            }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.PointsMaterial({ color: 0xd8c3a5, size: .035, transparent: true, opacity: .55, sizeAttenuation: true });
            const points = new THREE.Points(geo, mat);
            scene.add(points);

            // Grade sutil / névoa: segundo layer dourado fraco
            const mat2 = new THREE.PointsMaterial({ color: 0xffffff, size: .02, transparent: true, opacity: .25 });
            const points2 = new THREE.Points(geo.clone(), mat2);
            points2.position.x = 2; scene.add(points2);

            let tx = 0, ty = 0;
            if (finePointer) window.addEventListener('mousemove', (e) => {
                tx = (e.clientX / window.innerWidth - .5);
                ty = (e.clientY / window.innerHeight - .5);
            });

            const clock = new THREE.Clock();
            let visible = true;
            new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.querySelector('.hero'));
            (function animate() {
                requestAnimationFrame(animate);
                const t = clock.getElapsedTime();
                // Pausa render fora da dobra pra economizar bateria — mas mantém fundo visível
                const y = window.scrollY;
                const fade = Math.max(.25, 1 - y / (window.innerHeight * 2.2));
                canvas.style.opacity = fade.toFixed(2);
                points.rotation.y = t * .03 + tx * .4;
                points.rotation.x = ty * .25;
                points.position.y = Math.sin(t * .3) * .15;
                points2.rotation.y = -t * .015 + tx * .2;
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
