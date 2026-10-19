/* ============================================================
   site-viewer.js — visualizador de sites do portfólio
   ------------------------------------------------------------
   Ao clicar em um projeto ("Visitar site", "Abrir …", etc.) o
   site abre em tela cheia DENTRO do portfólio, com barra de
   voltar garantida:
     ← Voltar ao portfólio : fecha e devolve você ao ponto de origem
     ⌂ Início              : primeira página do portfólio
     ↗ Nova aba            : fallback (se o site bloquear iframe)
     ✕                     : fecha
   Também fecha com ESC e com o botão "voltar" do navegador.
   ============================================================ */
(function () {
    "use strict";

    if (window.__siteViewerReady) return;
    window.__siteViewerReady = true;

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* Hosts que NUNCA abrem no visualizador (redes, código, etc.) */
    var NEVER_VIEW = [
        "wa.me", "www.wa.me", "github.com", "www.github.com", "api.github.com",
        "linkedin.com", "www.linkedin.com", "instagram.com", "www.instagram.com",
        "tiktok.com", "www.tiktok.com", "twitter.com", "x.com",
        "open.spotify.com", "www.spotify.com", "youtube.com", "www.youtube.com",
        "google.com", "www.google.com", "docs.google.com", "forms.gle",
        "paypal.me", "www.paypal.com"
    ];

    /* Hosts que bloqueiam iframe (testados) → vão direto para nova aba */
    var ALWAYS_NEW_TAB = ["gamma.app", "www.gamma.app", "docs.gamma.app"];

    /* Páginas internas do próprio portfólio (navegação normal) */
    var OWN_PAGE_RE = /^(index|projetos|sobre|orcamento|servicos-adicionais|tecnologias|termos|midia|tecnologia-[a-z]+)\.html?$/i;

    /* Base do portfólio quando publicado (ex.: /profissional-rickdutra/) */
    function portfolioBase() {
        var p = (location.pathname || "").replace(/\\/g, "/");
        var i = p.toLowerCase().indexOf("/profissional-rickdutra/");
        return i >= 0 ? p.slice(0, i + "/profissional-rickdutra/".length) : "";
    }
    var BASE = portfolioBase();

    /* É uma página de navegação do próprio portfólio? */
    function isOwnPage(abs) {
        if (abs.origin !== location.origin) return false;
        var path = (abs.pathname || "").replace(/\\/g, "/");
        if (BASE) {
            var low = path.toLowerCase();
            var baseNoSlash = BASE.replace(/\/+$/, "").toLowerCase();
            if (low === baseNoSlash) return true;
            if (low.indexOf(BASE.toLowerCase()) !== 0) return false; // outro repositório do mesmo host
            path = path.slice(BASE.length);
        }
        path = path.replace(/^\/+/, "");
        if (path.indexOf("/") !== -1) return false; // subpasta = demo (techverse/, konstruct/)
        if (path === "") return true;
        return OWN_PAGE_RE.test(path);
    }

    /* Este link representa "entrar em um site"? */
    function canView(a) {
        if (!a || a.hasAttribute("data-no-view") || a.hasAttribute("download")) return false;
        var href = (a.getAttribute("href") || "").trim();
        if (!href || href.charAt(0) === "#") return false;
        if (/^(mailto:|tel:|javascript:|data:)/i.test(href)) return false;
        var abs;
        try { abs = new URL(href, location.href); } catch (e) { return false; }
        if (abs.protocol !== "http:" && abs.protocol !== "https:") return false;
        var host = abs.hostname.toLowerCase();
        if (NEVER_VIEW.indexOf(host) !== -1) return false;
        if (isOwnPage(abs)) return false;
        return true;
    }

    function titleFor(a, abs) {
        var t = (a.getAttribute("aria-label") || "").trim();
        t = t.replace(/^(abrir|visitar|ver|conhecer)\s+(o\s+site\s+|site\s+)?/i, "").trim();
        if (!t) {
            var card = a.closest(".pj-row, .proj-card, .work-card, .hero-actions, article, section");
            var h = card && card.querySelector("h1, h2, h3");
            if (h) t = h.textContent.trim();
        }
        if (!t) t = abs.hostname;
        return t;
    }

    /* ---------------- construção da interface ---------------- */
    var overlay, frame, loading, warn, nameEl, urlEl, newTab, warnLink, backBtn, homeBtn, closeBtn;
    var isOpen = false, pushedState = false, lastFocus = null, loadTimer = null, loaded = false;

    function build() {
        overlay = document.createElement("div");
        overlay.className = "sv-overlay";
        overlay.id = "siteViewer";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Site aberto dentro do portfólio");
        overlay.innerHTML =
            '<div class="sv-bar">' +
                '<button type="button" class="sv-btn sv-back"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> <span>Voltar ao portfólio</span></button>' +
                '<button type="button" class="sv-btn sv-home" title="Primeira página do portfólio"><i class="fa-solid fa-house" aria-hidden="true"></i> <span>Início</span></button>' +
                '<div class="sv-title"><span class="sv-dot"></span><b class="sv-name"></b><em class="sv-url"></em></div>' +
                '<a class="sv-btn sv-newtab" target="_blank" rel="noopener" title="Abrir o site em outra aba"><i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i> <span>Nova aba</span></a>' +
                '<button type="button" class="sv-btn sv-close" aria-label="Fechar visualizador"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>' +
            "</div>" +
            '<div class="sv-stage">' +
                '<iframe class="sv-frame" title="Projeto aberto dentro do portfólio"></iframe>' +
                '<div class="sv-loading"><span class="sv-spin"></span><p>carregando o site…</p></div>' +
                '<div class="sv-warn" hidden>Este site não abriu aqui dentro. ' +
                    '<a class="sv-warn-link" target="_blank" rel="noopener">Abrir em nova aba ↗</a></div>' +
            "</div>";

        document.body.appendChild(overlay);

        frame = overlay.querySelector(".sv-frame");
        loading = overlay.querySelector(".sv-loading");
        warn = overlay.querySelector(".sv-warn");
        warnLink = overlay.querySelector(".sv-warn-link");
        nameEl = overlay.querySelector(".sv-name");
        urlEl = overlay.querySelector(".sv-url");
        newTab = overlay.querySelector(".sv-newtab");
        backBtn = overlay.querySelector(".sv-back");
        homeBtn = overlay.querySelector(".sv-home");
        closeBtn = overlay.querySelector(".sv-close");

        backBtn.addEventListener("click", requestClose);
        closeBtn.addEventListener("click", requestClose);
        homeBtn.addEventListener("click", goHome);
        newTab.addEventListener("click", function () { /* abre em nova aba; viewer fica aberto */ });
        warnLink.addEventListener("click", function () { /* fallback explícito */ });

        frame.addEventListener("load", onFrameLoad);

        overlay.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { e.preventDefault(); requestClose(); return; }
            if (e.key !== "Tab") return;
            var f = Array.prototype.filter.call(
                overlay.querySelectorAll("button, a[href]"),
                function (el) { return el.offsetParent !== null; }
            );
            if (!f.length) return;
            var first = f[0], last = f[f.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        });
    }

    /* ---------------- abrir / fechar ---------------- */
    function lockScroll(on) {
        if (on) {
            var sbw = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.classList.add("sv-lock");
            document.body.classList.add("sv-lock");
            if (sbw > 0) document.body.style.paddingRight = sbw + "px";
        } else {
            document.documentElement.classList.remove("sv-lock");
            document.body.classList.remove("sv-lock");
            document.body.style.paddingRight = "";
        }
    }

    function loadInto(url, title) {
        loaded = false;
        warn.hidden = true;
        loading.classList.remove("done");
        nameEl.textContent = title || "Site do projeto";
        try { urlEl.textContent = new URL(url, location.href).hostname; } catch (e) { urlEl.textContent = ""; }
        newTab.href = url;
        warnLink.href = url;
        frame.src = url;

        clearTimeout(loadTimer);
        loadTimer = setTimeout(function () {
            if (loaded) return;
            loading.classList.add("done"); // libera a área mesmo sem "load"
            showWarn();
        }, 10000);
    }

    function openViewer(url, title) {
        if (!overlay) build();
        if (isOpen) { loadInto(url, title); return; } // já aberto: só troca de site

        lastFocus = document.activeElement;
        overlay.classList.add("open");
        isOpen = true;
        lockScroll(true);
        loadInto(url, title);

        try { history.pushState({ sv: 1 }, "", location.href); pushedState = true; }
        catch (e) { pushedState = false; } // file:// não permite pushState

        // foco só depois do overlay ficar visível (senão o focus é ignorado)
        setTimeout(function () { if (isOpen) backBtn.focus(); }, 90);
    }

    function doClose() {
        if (!isOpen) return;
        isOpen = false;
        clearTimeout(loadTimer);
        overlay.classList.remove("open");
        lockScroll(false);
        frame.src = "about:blank";
        if (lastFocus && typeof lastFocus.focus === "function") {
            try { lastFocus.focus(); } catch (e) { /* elemento sumiu da página */ }
        }
    }

    function requestClose() {
        if (!isOpen) return;
        doClose();
        if (pushedState) {
            pushedState = false;
            try { history.back(); } catch (e) { /* sem histórico navegável */ }
        }
    }

    /* Primeira página do portfólio */
    function goHome() {
        var path = (location.pathname || "").replace(/\\/g, "/");
        var isHome = /(^|\/)index\.html?$/i.test(path) || /\/$/.test(path);
        if (isHome) {
            requestClose();
            window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
        } else {
            location.href = "index.html"; // primeira página do portfólio
        }
    }

    function showWarn() { if (warn) warn.hidden = false; }

    function onFrameLoad() {
        if (!isOpen) return;               // evento vindo do "about:blank" ao fechar
        loaded = true;
        clearTimeout(loadTimer);
        loading.classList.add("done");

        // mesma origem: confere se veio conteúdo de verdade
        var empty = false;
        try {
            var d = frame.contentDocument;
            if (d) {
                var b = d.body;
                if (!b || (b.childElementCount === 0 && !(b.textContent || "").trim())) empty = true;
            }
        } catch (e) { empty = false; } // cross-origin: não dá para conferir, segue normal
        if (empty) showWarn();
    }

    /* ---------------- clique nos links de projeto ---------------- */
    document.addEventListener("click", function (e) {
        if (!e.defaultPrevented && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
            var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
            if (!a || !canView(a)) return;
            if (overlay && overlay.contains(a)) return;      // botões do próprio viewer
            var abs;
            try { abs = new URL(a.getAttribute("href"), location.href); } catch (err) { return; }

            // sites que bloqueiam iframe já vão para nova aba, sem passar pelo viewer
            if (ALWAYS_NEW_TAB.indexOf(abs.hostname.toLowerCase()) !== -1) return;

            e.preventDefault();
            openViewer(abs.href, titleFor(a, abs));
        }
    }, true);

    /* voltar do navegador fecha o viewer antes de sair da página */
    window.addEventListener("popstate", function () {
        if (isOpen) { pushedState = false; doClose(); }
    });

    /* cria a interface assim que o DOM estiver pronto */
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
    else build();
})();
