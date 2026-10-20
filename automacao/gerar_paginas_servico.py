#!/usr/bin/env python3
"""Gera as paginas de servico do portfolio (paginas que visam palavra-chave).

Cada pagina gerada tem: title/description otimizados, canonical, Open Graph,
Twitter Card, JSON-LD (Service + FAQPage + BreadcrumbList), conteudo proprio,
tabela de investimento, FAQ e CTA para o WhatsApp.

Os textos ficam em automacao/conteudo/<slug>.json (um arquivo por servico),
para editar o texto sem mexer no codigo.

Uso:
    python automacao/gerar_paginas_servico.py          # gera todas
    python automacao/gerar_paginas_servico.py --check  # so confere o diff
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from string import Template

BASE = Path(__file__).resolve().parent.parent
CONT = BASE / "automacao" / "conteudo"
SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"
WA = "5511989426415"
EMAIL = "estudiorickdigital@gmail.com"
LINKEDIN = "https://linkedin.com/in/henrique-luiz-dutra-a10346146/"
GITHUB = "https://github.com/Rickdigitalestudio"

TEMPLATE = Template("""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <meta name="description" content="$desc">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="theme-color" content="#0B0B10">
    <meta name="author" content="Henrique Luiz Dutra">
    <link rel="canonical" href="$canonical">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Estudio Rick Digital">
    <meta property="og:title" content="$og_title">
    <meta property="og:description" content="$og_desc">
    <meta property="og:url" content="$canonical">
    <meta property="og:image" content="$og_image">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="$og_title">
    <meta name="twitter:description" content="$og_desc">
    <meta name="twitter:image" content="$og_image">
    <link rel="icon" type="image/png" href="img/favicon.png">
    <link rel="apple-touch-icon" href="img/apple-touch-icon.png">
    <script type="application/ld+json">$jsonld_service</script>
    <script type="application/ld+json">$jsonld_faq</script>
    <script type="application/ld+json">$jsonld_breadcrumb</script>
    <link rel="stylesheet" href="css/style.css?v=4d1">
    <link rel="stylesheet" href="css/servico.css?v=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="manifest" href="manifest.webmanifest">
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

    <header class="header">
        <nav class="nav-container">
            <a class="logo" href="index.html"><img class="brand-logo" src="img/logo-rd.svg" alt="Estudio Rick Digital" width="38" height="38"><span class="brand-name">ESTUDIO <b>RICK DIGITAL</b></span></a>
            <ul class="nav-menu">
                <li><a href="index.html#trabalhos">Trabalhos</a></li>
                <li><a href="servicos-adicionais.html">Servicos</a></li>
                <li><a href="tecnologias.html">Tecnologias</a></li>
                <li><a href="orcamento.html">Orcamento</a></li>
                <li><a href="sobre.html">Sobre</a></li>
                <li><a href="index.html#contato">Contato</a></li>
            </ul>
            <div class="nav-right">
                <a href="$wa_link" target="_blank" rel="noopener" class="talk-btn">Vamos conversar <i class="fa-solid fa-arrow-right"></i></a>
                <div class="menu-toggle"><i class="fas fa-bars"></i></div>
            </div>
        </nav>
    </header>

    <main>
        <section class="svc-hero">
            <span class="eyebrow">$eyebrow</span>
            <h1>$h1</h1>
            <p class="svc-lead">$lead</p>
            <div class="svc-cta">
                <a href="$wa_link" target="_blank" rel="noopener" class="btn-light">Pedir orcamento no WhatsApp <i class="fa-solid fa-arrow-right"></i></a>
                <a href="orcamento.html" class="btn-line">Montar orcamento online</a>
            </div>
            <div class="svc-tags">$tags</div>
        </section>

        <section class="svc-proof">
            <div><strong>$proof1_n</strong><span>$proof1_l</span></div>
            <div><strong>$proof2_n</strong><span>$proof2_l</span></div>
            <div><strong>$proof3_n</strong><span>$proof3_l</span></div>
            <div><strong>$proof4_n</strong><span>$proof4_l</span></div>
        </section>

        <section class="svc-block" id="entregaveis">
            <span class="eyebrow">O que voce recebe</span>
            <h2 class="svc-h2">$h2_entregaveis</h2>
            <div class="svc-grid">$entregaveis</div>
        </section>

        <section class="svc-block" id="processo">
            <span class="eyebrow">Como funciona</span>
            <h2 class="svc-h2">$h2_processo</h2>
            <ol class="svc-steps">$processo</ol>
        </section>

        <section class="svc-block" id="investimento">
            <span class="eyebrow">Investimento</span>
            <h2 class="svc-h2">$h2_precos</h2>
            <div class="svc-plans">$precos</div>
            <p class="svc-note">Valor final depende do escopo. voce recebe a proposta fechada por escrito antes de qualquer pagamento. Sem surprise no final do projeto.</p>
        </section>

        <section class="svc-block" id="faq">
            <span class="eyebrow">Perguntas frequentes</span>
            <h2 class="svc-h2">$h2_faq</h2>
            <div class="svc-faq">$faq</div>
        </section>

        <section class="svc-cta-final">
            <h2>$cta_h2</h2>
            <p>$cta_p</p>
            <div class="svc-cta">
                <a href="$wa_link" target="_blank" rel="noopener" class="btn-light">Falar no WhatsApp <i class="fa-solid fa-arrow-right"></i></a>
                <a href="orcamento.html" class="btn-line">Montar orcamento online</a>
            </div>
            <div class="svc-relacionados">
                <span>Veja tambem:</span>
                $relacionados
            </div>
        </section>
    </main>

    <footer class="footer">
        <span>(c) 2026 Estudio Rick Digital - Henrique Luiz Dutra. Todos os direitos reservados. <a href="termos.html" style="color:#fff">Termos de Servico</a></span>
        <span class="connect">Vamos nos conectar
            <a href="$linkedin" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="$github" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://wa.me/$wa" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
        </span>
    </footer>

    <a href="$wa_link" target="_blank" rel="noopener" class="wa-float" aria-label="Falar no WhatsApp"><i class="fab fa-whatsapp"></i></a>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.158.0/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="js/main.js?v=4d0"></script>
</body>
</html>
""")


def esc(t: str) -> str:
    """Escapa texto para HTML."""
    return (t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def carrega(slug: str) -> dict:
    p = CONT / f"{slug}.json"
    if not p.exists():
        raise SystemExit(f"ERRO: conteudo nao encontrado: {p}")
    return json.loads(p.read_text(encoding="utf-8"))


def render(d: dict) -> str:
    slug = d["slug"]
    url = f"{SITE}/{slug}.html"
    wa_msg = d.get("wa_msg", "Quero um orcamento deste servico")
    wa_link = f"https://wa.me/{WA}?text={wa_msg.replace(' ', '%20').replace('?', '%3F').replace('&', '%26')}"

    entregaveis = "\n".join(
        f'            <article class="svc-card"><i class="fa-solid {ic}"></i>'
        f"<h3>{esc(t)}</h3><p>{esc(d2)}</p></article>"
        for ic, t, d2 in d["entregaveis"])

    processo = "\n".join(
        f'            <li><span class="step-n">{esc(n)}</span>'
        f'<div><h3>{esc(t)}</h3><p>{esc(d2)}</p></div></li>'
        for n, t, d2 in d["processo"])

    precos = "\n".join(
        f'            <article class="svc-plan{" svc-plan-hi" if hi else ""}">'
        f'<h3>{esc(nome)}</h3><p class="plan-price">{esc(preco)}</p>'
        f'<p class="plan-desc">{esc(desc)}</p>'
        f'<ul>{"".join(f"<li><i class=fa-solid fa-check></i>{esc(i)}</li>" for i in itens)}</ul>'
        f'<a href="{wa_link}" target="_blank" rel="noopener" class="btn-light">Quero este</a></article>'
        for nome, preco, desc, itens, hi in d["precos"])

    faq = "\n".join(
        f'            <details><summary>{esc(q)}</summary><p>{esc(a)}</p></details>'
        for q, a in d["faq"])

    relacionados = " ".join(
        f'<a href="{u}">{esc(t)}</a>' for t, u in d["relacionados"])

    tags = "".join(f"<span>{esc(t)}</span>" for t in d["tags"])

    p = d["prova"]
    jsonld_service = json.dumps({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": d["kw_titulo"],
        "serviceType": d["kw_titulo"],
        "description": d["desc"],
        "url": url,
        "image": f"{SITE}/img/og-estudio-rick-digital.png",
        "provider": {
            "@type": "ProfessionalService",
            "name": "Estudio Rick Digital",
            "url": SITE + "/",
            "logo": f"{SITE}/img/logo-rd-512.png",
            "telephone": "+55-11-98942-6415",
            "email": EMAIL,
            "founder": {"@type": "Person", "name": "Henrique Luiz Dutra"},
            "areaServed": [
                {"@type": "City", "name": "Rio Grande da Serra"},
                {"@type": "State", "name": "Sao Paulo"},
                {"@type": "Country", "name": "Brazil"},
            ],
            "sameAs": [LINKEDIN, GITHUB],
        },
        "areaServed": {"@type": "Country", "name": "Brazil"},
        "offers": [
            {"@type": "Offer", "name": nome, "price": preco_num,
             "priceCurrency": "BRL", "description": desc}
            for nome, preco, desc, itens, hi in d["precos"]
            for preco_num in [preco.replace("R$", "").replace(".", "").replace(",", ".").strip()]
        ],
    }, ensure_ascii=False, indent=2)

    jsonld_faq = json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in d["faq"]
        ],
    }, ensure_ascii=False, indent=2)

    jsonld_breadcrumb = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Servicos", "item": SITE + "/servicos-adicionais.html"},
            {"@type": "ListItem", "position": 3, "name": d["kw_titulo"], "item": url},
        ],
    }, ensure_ascii=False, indent=2)

    return TEMPLATE.substitute(
        title=esc(d["title"]),
        desc=esc(d["desc"]),
        canonical=url,
        og_title=esc(d["og_title"]),
        og_desc=esc(d["og_desc"]),
        og_image=f"{SITE}/img/og-estudio-rick-digital.png",
        jsonld_service=jsonld_service,
        jsonld_faq=jsonld_faq,
        jsonld_breadcrumb=jsonld_breadcrumb,
        wa_link=wa_link,
        linkedin=LINKEDIN,
        github=GITHUB,
        wa=WA,
        eyebrow=esc(d["eyebrow"]),
        h1=esc(d["h1"]),
        lead=esc(d["lead"]),
        tags=tags,
        proof1_n=esc(p[0][0]), proof1_l=esc(p[0][1]),
        proof2_n=esc(p[1][0]), proof2_l=esc(p[1][1]),
        proof3_n=esc(p[2][0]), proof3_l=esc(p[2][1]),
        proof4_n=esc(p[3][0]), proof4_l=esc(p[3][1]),
        h2_entregaveis=esc(d["h2_entregaveis"]),
        entregaveis=entregaveis,
        h2_processo=esc(d["h2_processo"]),
        processo=processo,
        h2_precos=esc(d["h2_precos"]),
        precos=precos,
        h2_faq=esc(d["h2_faq"]),
        faq=faq,
        cta_h2=esc(d["cta_h2"]),
        cta_p=esc(d["cta_p"]),
        relacionados=relacionados,
    )


def main() -> int:
    check = "--check" in sys.argv
    slugs = [p.stem for p in sorted(CONT.glob("*.json"))]
    if not slugs:
        print("Nenhum conteudo em automacao/conteudo/")
        return 1
    mudou = []
    for slug in slugs:
        d = carrega(slug)
        out = BASE / f"{slug}.html"
        html = render(d)
        antigo = out.read_text(encoding="utf-8") if out.exists() else ""
        if html != antigo:
            mudou.append(slug)
            if not check:
                out.write_text(html, encoding="utf-8")
    print(f"{len(slugs)} pagina(s) verificada(s). "
          f"{'Alteradas: ' + ', '.join(mudou) if mudou else 'Sem diferencas.'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
