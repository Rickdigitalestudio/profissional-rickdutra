/**
 * Gera a pagina divulgacoes.html a partir dos .md de divulgacao/anuncios/.
 * Uso: node divulgacao/gerar-divulgacoes.js
 */
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "anuncios");
const OUT = path.join(__dirname, "..", "divulgacoes.html");
const BASE = "https://rickdigitalestudio.github.io/profissional-rickdutra/";

const files = fs
  .readdirSync(DIR)
  .filter((f) => /^2026-.*\.md$/.test(f))
  .sort();

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])https?:\/\/[^\s<)]+/g, (m, pre) => {
      let url = m.slice(pre.length).replace(/[.,;]+$/, "");
      const rest = m.slice(pre.length).slice(url.length);
      return `${pre}<a href="${url}" target="_blank" rel="noopener">${url}</a>${rest}`;
    });
}

function parse(file) {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8").replace(/\r/g, "");
  const lines = raw.split("\n");
  const titleLine = lines.find((l) => l.startsWith("# "));
  const m = titleLine.match(/^#\s*An[úu]ncio\s*(\d+)\s*[-—–]\s*(.+)$/);
  if (!m) throw new Error("titulo nao reconhecido: " + file);
  const ad = { num: m[1].padStart(2, "0"), title: m[2].trim(), file, meta: {}, body: [] };

  const metaRe = /^\*\*(Data de publica[çc][ãa]o|Tipo|Onde postar|Arte sugerida):\*\*\s*(.+)$/;
  const chunks = raw.split(/\n-{3,}\n/);
  for (const line of chunks[0].split("\n")) {
    const mm = line.match(metaRe);
    if (mm) ad.meta[mm[1]] = mm[2].trim();
  }
  for (const rawChunk of chunks.slice(1)) {
    const chunk = rawChunk.trim();
    const i = chunk.indexOf("\n");
    const head = i === -1 ? chunk : chunk.slice(0, i);
    const body = i === -1 ? "" : chunk.slice(i + 1).trim();
    if (/^##\s*Legenda/.test(head)) ad.legend = body;
    else if (/^##\s*Vers/.test(head)) ad.short = body;
    else if (/^##\s*Hashtags/.test(head)) ad.tags = body;
  }
  ad.tipo = (ad.meta.Tipo || "OUTRO").match(/^[A-Za-z]+/)[0].toUpperCase();
  if (!ad.legend) throw new Error("sem legenda: " + file);
  return ad;
}

const ads = files.map(parse);
const TIPOS = ["PROVA", "OFERTA", "EDUCA", "CTA", "PESSOAL"];

const card = (a) => {
  const meta = [];
  if (a.meta["Data de publicação"])
    meta.push(`<span><i class="fa-regular fa-calendar"></i> ${esc(a.meta["Data de publicação"])}</span>`);
  if (a.meta["Onde postar"])
    meta.push(`<span><i class="fa-solid fa-share-nodes"></i> ${esc(a.meta["Onde postar"])}</span>`);
  if (a.meta["Arte sugerida"])
    meta.push(`<span><i class="fa-regular fa-image"></i> ${esc(a.meta["Arte sugerida"].replace(/`/g, ""))}</span>`);
  const blk = (icon, label, text, id) =>
    text
      ? `<div class="blk"><div class="blk-head"><h3><i class="fa-solid ${icon}"></i>${label}</h3>
        <button type="button" class="copy-btn" data-copy="${id}"><i class="fa-regular fa-copy"></i> Copiar</button></div>
        <div class="txt" id="${id}">${inline(text)}</div></div>`
      : "";
  return `<article class="ad" data-tipo="${a.tipo}">
    <div class="ad-top">
      <span class="ad-num">${a.num}</span>
      <div class="ad-head">
        <h2>${esc(a.title)}</h2>
        <p class="ad-meta"><span class="tag tag-${a.tipo.toLowerCase()}">${a.tipo}</span> ${meta.join(" ")}</p>
      </div>
    </div>
    ${blk("fa-bullhorn", "Legenda (copiar e colar)", a.legend, `lg${a.num}`)}
    ${blk("fa-mobile-screen-button", "Versão curta — Stories / Status / TikTok", a.short, `sh${a.num}`)}
    ${blk("fa-hashtag", "Hashtags", a.tags, `tg${a.num}`)}
  </article>`;
};

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<script>document.documentElement.classList.add("js");</script>
<title>Divulgações — Estúdio Rick Digital</title>
<meta name="description" content="Central de divulgações do Estúdio Rick Digital: ${ads.length} anúncios prontos (cases, ofertas, dicas e chamadas) com legenda, versão curta e hashtags para copiar e publicar.">
<link rel="canonical" href="${BASE}divulgacoes.html">
<link rel="alternate" type="application/rss+xml" title="Estúdio Rick Digital — RSS" href="${BASE}feed.xml">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-H6CS8VRB52"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-H6CS8VRB52');</script>
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Estúdio Rick Digital">
<meta property="og:title" content="Divulgações — Estúdio Rick Digital">
<meta property="og:description" content="${ads.length} anúncios prontos do Estúdio Rick Digital: cases, ofertas, dicas e chamadas para orçamento.">
<meta property="og:url" content="${BASE}divulgacoes.html">
<meta property="og:image" content="${BASE}img/og-estudio-rick-digital.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Divulgações — Estúdio Rick Digital">
<meta name="twitter:description" content="${ads.length} anúncios prontos do Estúdio Rick Digital: cases, ofertas, dicas e chamadas para orçamento.">
<meta name="twitter:image" content="${BASE}img/og-estudio-rick-digital.png">
<link rel="stylesheet" href="css/style.css?v=5d5">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
.dvg{max-width:1000px;margin:0 auto;padding:70px 28px 80px}
.dvg h1{font-family:var(--display);font-size:clamp(2.2rem,6vw,4rem);line-height:1;color:var(--pill);text-transform:uppercase}
.dvg h1 span{color:var(--champagne)}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin:24px 0 8px}
.filters button{font-family:var(--display);letter-spacing:.08em;text-transform:uppercase;font-size:.72rem;padding:8px 16px;border-radius:99px;background:transparent;border:1px solid var(--line);color:var(--muted);cursor:pointer;transition:.2s}
.filters button:hover{border-color:var(--champagne);color:var(--champagne)}
.filters button.on{background:var(--champagne);border-color:var(--champagne);color:#0b0b10}
.ad{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:26px;margin-top:18px}
.ad-top{display:flex;gap:16px;align-items:flex-start}
.ad-num{font-family:var(--display);font-size:1.6rem;line-height:1;color:#0b0b10;background:var(--champagne);border-radius:10px;padding:8px 12px;flex:0 0 auto}
.ad-head h2{font-family:var(--display);font-size:1.25rem;color:#fff;text-transform:uppercase}
.ad-meta{font-size:.76rem;color:var(--muted);margin-top:6px;display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center}
.ad-meta i{color:var(--champagne);margin-right:5px}
.tag{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;border-radius:20px;padding:3px 10px;border:1px solid;font-family:var(--display)}
.tag-prova{color:#4ade80;border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.08)}
.tag-oferta{color:#fbbf24;border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
.tag-educa{color:#60a5fa;border-color:rgba(96,165,250,.4);background:rgba(96,165,250,.08)}
.tag-cta{color:#f472b6;border-color:rgba(244,114,182,.4);background:rgba(244,114,182,.08)}
.tag-pessoal{color:#c084fc;border-color:rgba(192,132,252,.4);background:rgba(192,132,252,.08)}
.tag-outro{color:var(--muted);border-color:var(--line)}
.blk{margin-top:18px;border-top:1px solid var(--line);padding-top:14px}
.blk-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.blk h3{font-family:var(--display);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:var(--champagne)}
.blk h3 i{margin-right:8px}
.copy-btn{font-family:var(--display);font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;background:transparent;border:1px solid var(--line);color:var(--muted);border-radius:99px;padding:6px 14px;cursor:pointer;transition:.2s}
.copy-btn:hover{border-color:var(--champagne);color:var(--champagne)}
.copy-btn.ok{background:#4ade80;border-color:#4ade80;color:#0b0b10}
.txt{background:#000;border:1px solid var(--line);border-radius:12px;padding:16px;color:#d7d4ce;font-size:.84rem;line-height:1.7;white-space:pre-wrap;margin-top:10px;overflow-x:auto}
.txt a{color:var(--champagne);word-break:break-all}
.txt strong{color:#fff}
.dvg-cta{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(216,195,165,.12));border:1px solid var(--line);border-radius:18px;padding:30px;margin-top:26px;text-align:center}
.dvg-cta h2{font-family:var(--display);font-size:1.4rem;color:#fff;text-transform:uppercase}
.dvg-cta p{color:var(--muted);font-size:.9rem;margin:10px auto 18px;max-width:640px}
.dvg-cta .btn-light{margin:0 6px}
</style>
<style>
#preloader{position:fixed;inset:0;z-index:9999;background:#0B0B10;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:18px;transition:opacity .6s ease,visibility .6s}
#preloader.done{opacity:0;visibility:hidden;pointer-events:none}
#bg3d{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.9}
body{position:relative}
body > .header{z-index:60}body > main,body > footer.footer{position:relative;z-index:1}
</style>
</head>
<body>
<div id="preloader" aria-hidden="true">
  <div style="font-family:Oswald,sans-serif;letter-spacing:.35em;font-size:.75rem;color:#d8c3a5">ESTUDIO RICK DIGITAL</div>
  <div style="width:180px;height:2px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden"><div id="loadbar" style="height:100%;width:0%;background:#d8c3a5;transition:width .2s"></div></div>
  <div id="loadpct" style="font-size:.72rem;color:#8f8b84;letter-spacing:.2em">0%</div>
</div>
<canvas id="bg3d" aria-hidden="true"></canvas>
<div id="scroll-progress" aria-hidden="true"></div>
<div class="cursor-dot" aria-hidden="true"></div>
<div class="cursor-ring" aria-hidden="true"></div>
<header class="header"><nav class="nav-container">
<a class="logo" href="index.html"><img class="brand-logo" src="img/logo-rd.svg" alt="Estúdio Rick Digital" width="38" height="38"><span class="brand-name">ESTÚDIO <b>RICK DIGITAL</b></span></a>
<ul class="nav-menu"><li><a href="index.html#trabalhos">Trabalhos</a></li><li><a href="tecnologias.html">Tecnologias</a></li><li><a href="orcamento.html">Orçamento</a></li><li><a href="sobre.html">Sobre</a></li><li><a href="termos.html">Termos</a></li><li><a href="index.html#contato">Contato</a></li></ul>
<div class="nav-right"><a href="https://wa.me/5511989426415" target="_blank" class="talk-btn">Vamos conversar <i class="fa-solid fa-arrow-right"></i></a><div class="menu-toggle"><i class="fas fa-bars"></i></div></div>
</nav></header>
<main class="dvg">
<span class="eyebrow">Arquivo de posts · outubro/novembro 2026</span>
<h1>Central de <span>divulgações</span></h1>
<p style="color:var(--muted);margin-top:10px">${ads.length} anúncios prontos do <strong style="color:#fff">Estúdio Rick Digital</strong>: cases reais, ofertas, dicas e chamadas para orçamento. Cada um já vem com legenda, versão curta (Stories/status) e hashtags — clique em <strong style="color:#d8c3a5">Copiar</strong> e publique.</p>
<div class="filters" id="filters" role="group" aria-label="Filtrar por tipo">
<button type="button" class="on" data-f="ALL">Todos (${ads.length})</button>
${TIPOS.filter((t) => ads.some((a) => a.tipo === t))
  .map((t) => `<button type="button" data-f="${t}">${t} (${ads.filter((a) => a.tipo === t).length})</button>`)
  .join("\n")}
</div>
<div id="ads">
${ads.map(card).join("\n")}
</div>
<div class="dvg-cta">
<h2>Quer um projeto assim?</h2>
<p>Portfólio com ${ads.length} divulgações, cases completos e orçamento em 30 segundos — resposta em até 24 horas.</p>
<a class="btn-light" href="${BASE}orcamento.html">Montar orçamento</a>
<a class="btn-light" href="https://wa.me/5511989426415" target="_blank" rel="noopener">WhatsApp (11) 98942-6415</a>
</div>
</main>
<footer class="footer"><span>© 2026 Estúdio Rick Digital · Henrique Luiz Dutra.</span></footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<a href="https://wa.me/5511989426415?text=Ol%C3%A1!%20Vi%20seu%20portf%C3%B3lio%20e%20quero%20um%20or%C3%A7amento." target="_blank" class="wa-float" aria-label="Falar no WhatsApp"><i class="fab fa-whatsapp"></i></a>
<script src="js/main.js?v=5d1" defer></script>
<script src="js/analytics.js?v=1" defer></script>
<script>
document.getElementById("filters").addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;
document.querySelectorAll("#filters button").forEach(x=>x.classList.toggle("on",x===b));
const f=b.dataset.f;
document.querySelectorAll("#ads .ad").forEach(a=>{a.style.display=(f==="ALL"||a.dataset.tipo===f)?"":"none";});
});
document.addEventListener("click",e=>{
const b=e.target.closest("[data-copy]");if(!b)return;
const t=document.getElementById(b.dataset.copy);
navigator.clipboard.writeText(t.innerText.trim()).then(()=>{
const old=b.innerHTML;b.classList.add("ok");b.innerHTML='<i class="fa-solid fa-check"></i> Copiado!';
setTimeout(()=>{b.classList.remove("ok");b.innerHTML=old;},1800);
});
});
</script>
</body>
</html>
`;

fs.writeFileSync(OUT, html, "utf8");
console.log(`OK: ${path.basename(OUT)} gerado com ${ads.length} anuncios.`);
