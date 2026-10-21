#!/usr/bin/env python3
"""Gera as paginas de case study (hub + uma pagina por projeto).

Cada case tem contexto -> problema -> solucao -> meu papel -> stack ->
resultados com metrica -> depoimento -> o que entreguei.

Os textos ficam em automacao/conteudo/cases/<slug>.json.

Uso:
    python automacao/gerar_cases.py           # gera
    python automacao/gerar_cases.py --check   # so confere o diff
"""
from __future__ import annotations

import html
import json
import sys
from pathlib import Path
from string import Template

BASE = Path(__file__).resolve().parent.parent
CONT = BASE / "automacao" / "conteudo" / "cases"
SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"
WA = "5511989426415"
WA_MSG = "Vi o case de {cliente} no seu portfólio e quero um site assim"
LINKEDIN = "https://linkedin.com/in/henrique-luiz-dutra-a10346146/"
GITHUB = "https://github.com/Rickdigitalestudio"

HEAD = Template("""<!DOCTYPE html>
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
    <meta property="og:type" content="article">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Estúdio Rick Digital">
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
    <script type="application/ld+json">$jsonld_article</script>
    <script type="application/ld+json">$jsonld_breadcrumb</script>
    <!-- GA4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-H6CS8VRB52"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-H6CS8VRB52');</script>
    <link rel="stylesheet" href="css/style.css?v=5d0">
    <link rel="stylesheet" href="css/cases.css?v=1">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="manifest" href="manifest.webmanifest">
</head>
<body>
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header class="header">
        <nav class="nav-container">
            <a class="logo" href="index.html"><img class="brand-logo" src="img/logo-rd.svg" alt="Estúdio Rick Digital" width="38" height="38"><span class="brand-name">ESTÚDIO <b>RICK DIGITAL</b></span></a>
            <ul class="nav-menu">
                <li><a href="projetos.html">Trabalhos</a></li>
                <li><a href="cases.html">Cases</a></li>
                <li><a href="servicos-adicionais.html">Serviços</a></li>
                <li><a href="tecnologias.html">Tecnologias</a></li>
                <li><a href="orcamento.html">Orçamento</a></li>
                <li><a href="index.html#sobre">Sobre</a></li>
                <li><a href="index.html#contato">Contato</a></li>
            </ul>
            <div class="nav-right">
                <a href="$wa_link" target="_blank" rel="noopener" class="talk-btn">Vamos conversar <i class="fa-solid fa-arrow-right"></i></a>
                <div class="menu-toggle"><i class="fas fa-bars"></i></div>
            </div>
        </nav>
    </header>
""")

FOOT = Template("""
    <footer class="rodape-profissional">
        <div class="conteudo-rodape">
            <div class="coluna-rodape marca">
                <a class="logo-rodape" href="index.html"><img src="img/logo-rd.svg" alt="" width="34" height="34">ESTÚDIO RICK DIGITAL</a>
                <p class="slogan-rodape">Experiências digitais que inspiram.<br>Do layout ao código, resultados reais.</p>
                <ul class="destaque-rodape">
                    <li><i class="fa-solid fa-circle-check"></i> 15+ Projetos no ar</li>
                    <li><i class="fa-solid fa-circle-check"></i> 100% Responsivo</li>
                    <li><i class="fa-solid fa-circle-check"></i> SEO Otimizado</li>
                </ul>
            </div>
            <div class="coluna-rodape">
                <h3 class="titulo-coluna">Serviços</h3>
                <ul class="lista-links">
                    <li><a href="criacao-de-sites-profissionais.html"><i class="fa-solid fa-laptop-code"></i> Web Design</a></li>
                    <li><a href="fanpage-que-vende.html"><i class="fa-solid fa-bullhorn"></i> Fanpages que Convertem</a></li>
                    <li><a href="site-para-pequenas-empresas.html"><i class="fa-solid fa-building"></i> Sites Institucionais</a></li>
                    <li><a href="loja-virtual-completa.html"><i class="fa-solid fa-cart-shopping"></i> Lojas Virtuais</a></li>
                    <li><a href="landing-page-que-converte.html"><i class="fa-solid fa-arrow-up-right-from-square"></i> Landing Pages</a></li>
                    <li><a href="cases.html"><i class="fa-solid fa-folder-open"></i> Cases e Resultados</a></li>
                </ul>
            </div>
            <div class="coluna-rodape">
                <h3 class="titulo-coluna">Navegação</h3>
                <ul class="lista-links">
                    <li><a href="index.html">Início</a></li>
                    <li><a href="index.html#sobre">Sobre Mim</a></li>
                    <li><a href="projetos.html">Portfólio</a></li>
                    <li><a href="cases.html">Cases</a></li>
                    <li><a href="index.html#resultados">Resultados</a></li>
                    <li><a href="index.html#depoimentos">Depoimentos</a></li>
                    <li><a href="index.html#contato">Contato</a></li>
                </ul>
            </div>
            <div class="coluna-rodape contato">
                <h3 class="titulo-coluna">Fale Comigo</h3>
                <ul class="lista-contato">
                    <li><i class="fa-solid fa-envelope"></i><a href="mailto:estudiorickdigital@gmail.com">estudiorickdigital@gmail.com</a></li>
                    <li><i class="fab fa-whatsapp"></i><a href="https://wa.me/$wa" target="_blank" rel="noopener">(11) 98942-6415</a></li>
                    <li><i class="fa-solid fa-location-dot"></i><span>São Paulo — SP</span></li>
                </ul>
                <div class="redes-sociais">
                    <a href="$github" target="_blank" rel="noopener" class="botao-rede"><i class="fab fa-github"></i> GitHub</a>
                    <a href="$linkedin" target="_blank" rel="noopener" class="botao-rede"><i class="fab fa-linkedin"></i> LinkedIn</a>
                    <a href="https://wa.me/$wa" target="_blank" rel="noopener" class="botao-rede"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                </div>
            </div>
        </div>
        <div class="barra-inferior">
            <p class="texto-copyright">
                © 2026 Estúdio Rick Digital — Todos os direitos reservados. ·
                <a href="termos.html">Termos de Serviço</a> ·
                <a href="privacidade.html">Privacidade</a> ·
                <a href="midia.html">Kit de Mídia</a>
            </p>
            <p class="texto-copyright"><span>Criado com <i class="fa-solid fa-heart"></i> e código próprio.</span></p>
        </div>
    </footer>

    <a href="$wa_link" target="_blank" rel="noopener" class="wa-float" aria-label="Falar no WhatsApp"><i class="fab fa-whatsapp"></i></a>
    <script src="js/main.js?v=5d0"></script>
    <script src="js/analytics.js?v=1" defer></script>
</body>
</html>
""")


def e(t: str) -> str:
    return html.escape(str(t), quote=True)


def img_tag(src: str, fallback: str, w: int, h: int, alt: str, cls: str = "") -> str:
    return (f'<picture><source srcset="{src}" type="image/webp">'
            f'<img src="{fallback}" alt="{e(alt)}" width="{w}" height="{h}" '
            f'loading="lazy" decoding="async" class="{cls}"></picture>')


def render_case(d: dict) -> str:
    slug = d["slug"]
    url = f"{SITE}/{slug}.html"
    wa_msg = WA_MSG.format(cliente=d["cliente"])
    wa_link = f"https://wa.me/{WA}?text={wa_msg.replace(' ', '%20').replace('?', '%3F')}"

    res = "\n".join(
        f'            <div><b>{e(r["valor"])}{("<small>" + e(r["unidade"]) + "</small>") if r["unidade"] else ""}</b>'
        f'<span>{e(r["rotulo"])}</span></div>'
        for r in d["resultados"])

    problema = "\n".join(f"                    <li>{e(x)}</li>" for x in d["problema"])
    solucao = "\n".join(f"                    <li>{e(x)}</li>" for x in d["solucao"])
    papel = "\n".join(f"                    <li>{e(x)}</li>" for x in d["papel"])
    stack = "".join(f'<span>{e(s)}</span>' for s in d["stack"])
    entrega = "".join(f'<span><i class="fa-solid fa-circle-check"></i>{e(x)}</span>' for x in d["eu_entrego"])
    destaques = "\n".join(f"                    <li>{e(x)}</li>" for x in d["destaques"])
    metas = "".join(f'<span>{e(m)}</span>' for m in d["meta"])

    dep = d["depoimento"]
    modelo = dep.get("estado") == "modelo"
    dep_badge = '<span class="dep-modelo">Texto de exemplo</span>' if modelo else ""
    dep_texto = e(dep["texto"])

    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": d["h1"],
        "description": d["desc"],
        "image": f"{SITE}/{d['img']}",
        "datePublished": "2026-09-01",
        "dateModified": "2026-10-21",
        "author": {"@type": "Person", "name": "Henrique Luiz Dutra",
                   "url": f"{SITE}/sobre.html",
                   "jobTitle": "Web Designer e Desenvolvedor Front-End"},
        "publisher": {"@type": "ProfessionalService", "name": "Estúdio Rick Digital",
                      "url": f"{SITE}/", "logo": f"{SITE}/img/logo-rd-512.png",
                      "telephone": "+55-11-98942-6415"},
        "mainEntityOfPage": {"@type": "WebPage", "@id": url},
        "articleSection": d["tipo"],
        "keywords": ", ".join(d["stack"]),
    }, ensure_ascii=False, indent=2)

    breadcrumb = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Início", "item": f"{SITE}/"},
            {"@type": "ListItem", "position": 2, "name": "Cases", "item": f"{SITE}/cases.html"},
            {"@type": "ListItem", "position": 3, "name": d["h1"], "item": url},
        ],
    }, ensure_ascii=False, indent=2)

    body = Template("""
    <main id="conteudo" class="case-page">
        <section class="case-hero">
            <div>
                <span class="eyebrow">Case study · $segmento</span>
                <h1>$h1</h1>
                <p class="case-lead">$lead</p>
                <div class="case-meta">$metas</div>
                <div class="case-cta">
                    <a href="$url_site" target="_blank" rel="noopener" class="btn-light">Ver o site no ar <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                    <a href="$url_codigo" target="_blank" rel="noopener" class="btn-line">Ver o código <i class="fab fa-github"></i></a>
                </div>
            </div>
            <figure class="case-shot">
                $shot
                <figcaption>$cliente · $tipo</figcaption>
            </figure>
        </section>

        <section class="case-res">
$res
        </section>

        <section class="case-block">
            <span class="eyebrow">01 · Contexto</span>
            <h2>De onde o projeto nasceu</h2>
            <p>$contexto</p>
        </section>

        <section class="case-block case-cols">
            <div class="case-list problema">
                <h3><i class="fa-solid fa-triangle-exclamation"></i> O problema</h3>
                <ul>
$problema
                </ul>
            </div>
            <div class="case-list">
                <h3><i class="fa-solid fa-wand-magic-sparkles"></i> A solução</h3>
                <ul>
$solucao
                </ul>
            </div>
        </section>

        <section class="case-block">
            <span class="eyebrow">02 · Meu papel</span>
            <h2>O que eu fiz, na prática</h2>
            <div class="case-list">
                <ul>
$papel
                </ul>
            </div>
            <div class="case-stack">$stack</div>
        </section>

        <section class="case-block case-cols">
            <div class="case-list">
                <h3><i class="fa-solid fa-star"></i> Entregáveis em destaque</h3>
                <ul>
$destaques
                </ul>
            </div>
            <div class="case-list">
                <h3><i class="fa-solid fa-box-open"></i> O que entreguei</h3>
                <div class="case-entrega">$entrega</div>
                <p style="margin-top:16px;color:var(--muted);font-size:.86rem">Prazo: <strong style="color:var(--text)">$prazo</strong>. Código, arquivos e direitos de uso ficam com o cliente após o pagamento integral.</p>
            </div>
        </section>

        <section class="case-block">
            <span class="eyebrow">03 · Resultado</span>
            <h2>O que o projeto entrega</h2>
            <div class="case-dep">
                $dep_badge
                <p class="dep-quote">$dep_texto</p>
                <div class="dep-who">
                    <span class="dep-avatar">$iniciais</span>
                    <span><b>$dep_nome</b><small>$dep_cargo · $dep_empresa</small></span>
                </div>
            </div>
        </section>

        <section class="case-block">
            <div class="cta" style="margin-top:0">
                <div class="cta-left">
                    <h2>QUERO UM SITE<br>ASSIM NO MEU NEGÓCIO</h2>
                </div>
                <div class="cta-mid">
                    <p>Mesma estrutura, adapted ao seu segmento. Briefing, escopo e valor fechado em até 24 horas.</p>
                    <a href="$wa_link" target="_blank" rel="noopener" class="btn-light">Quero um site assim <i class="fa-solid fa-arrow-right"></i></a>
                    <a href="orcamento.html" class="btn-line" style="margin-top:10px;display:inline-flex">Monte seu orçamento em 30s <i class="fa-solid fa-arrow-right"></i></a>
                </div>
                <div class="cta-contacts">
                    <a href="mailto:estudiorickdigital@gmail.com"><i class="fa-solid fa-envelope"></i> estudiorickdigital@gmail.com</a>
                    <a href="https://wa.me/$wa" target="_blank"><i class="fab fa-whatsapp"></i> (11) 98942-6415</a>
                    <a href="cases.html"><i class="fa-solid fa-folder-open"></i> Ver outros cases</a>
                </div>
            </div>
        </section>

        <nav class="case-nav" aria-label="Navegação entre cases">
            <a href="cases.html"><i class="fa-solid fa-arrow-left"></i> Todos os cases</a>
            <a href="projetos.html">Ver todos os projetos <i class="fa-solid fa-arrow-right"></i></a>
        </nav>
    </main>
""").substitute(
        segmento=e(d["segmento"]), h1=e(d["h1"]), lead=e(d["lead"]), metas=metas,
        url_site=e(d["url_site"]), url_codigo=e(d["url_codigo"]),
        shot=img_tag(d["img"], d["img_fallback"], d["img_w"], d["img_h"],
                     f"{d['cliente']} — {d['tipo']}"),
        cliente=e(d["cliente"]), tipo=e(d["tipo"]), prazo=e(d["prazo"]),
        res=res, contexto=e(d["contexto"]), problema=problema, solucao=solucao,
        papel=papel, stack=stack, destaques=destaques, entrega=entrega,
        dep_badge=dep_badge, dep_texto=dep_texto,
        iniciais=e("".join(x[0] for x in d["cliente"].split()[:2]).upper()),
        dep_nome=e(dep["nome"]), dep_cargo=e(dep["cargo"]), dep_empresa=e(dep["empresa"]),
        wa_link=wa_link, wa=WA,
    )

    head = HEAD.substitute(
        title=e(d["title"]), desc=e(d["desc"]), canonical=url,
        og_title=e(f"{d['cliente']} — {d['tipo']} | Estúdio Rick Digital"),
        og_desc=e(d["desc"]),
        og_image=f"{SITE}/{d['img_fallback']}",
        jsonld_article=jsonld,
        jsonld_breadcrumb=breadcrumb,
        wa_link=wa_link, linkedin=LINKEDIN, github=GITHUB, wa=WA,
    )
    foot = FOOT.substitute(wa_link=wa_link, linkedin=LINKEDIN, github=GITHUB, wa=WA)
    return head + body + foot


def render_hub(cases: list[dict]) -> str:
    wa_link = f"https://wa.me/{WA}?text=Quero%20um%20site%20assim%20como%20os%20do%20seu%20portf%C3%B3lio"

    tiles = []
    for d in cases:
        res = d["resultados"][:3]
        mini = "".join(f'<span>{e(r["valor"])}{e(r["unidade"])} {e(r["rotulo"])}</span>' for r in res)
        tiles.append(f"""        <article class="case-tile">
            <a class="shot" href="{e(d["slug"])}.html">
                <span class="tag">{e(d["tipo"])}</span>
                {img_tag(d["img"], d["img_fallback"], d["img_w"], d["img_h"], f"{d['cliente']} — {d['tipo']}")}
            </a>
            <div class="body">
                <span class="seg">{e(d["segmento"])}</span>
                <h3>{e(d["cliente"])}</h3>
                <p>{e(d["lead"])}</p>
                <div class="mini">{mini}</div>
                <a class="ver" href="{e(d["slug"])}.html">Ver o case completo <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </article>""")

    jsonld = json.dumps({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Cases e resultados — Estúdio Rick Digital",
        "description": "Case studies com problema, solução e resultado de cada projeto publicado.",
        "url": f"{SITE}/cases.html",
        "isPartOf": {"@type": "WebSite", "name": "Estúdio Rick Digital", "url": f"{SITE}/"},
        "hasPart": [
            {"@type": "Article", "headline": d["h1"], "url": f"{SITE}/{d['slug']}.html",
             "image": f"{SITE}/{d['img']}", "description": d["desc"],
             "author": {"@type": "Person", "name": "Henrique Luiz Dutra"}}
            for d in cases
        ],
    }, ensure_ascii=False, indent=2)

    body = Template("""
    <main id="conteudo" class="case-page">
        <section class="case-hero" style="margin-bottom:10px">
            <div>
                <span class="eyebrow">Cases &amp; resultados</span>
                <h1>Cada projeto,<br>uma história</h1>
                <p class="case-lead">Não é só "está no ar". Aqui está o contexto, o problema que resolvi, o que eu fiz e o número que ficou no fim.</p>
                <div class="case-cta">
                    <a href="#lista" class="btn-light">Ver os cases <i class="fa-solid fa-arrow-down"></i></a>
                    <a href="orcamento.html" class="btn-line">Monte seu orçamento</a>
                </div>
            </div>
            <div class="case-res" style="margin-top:0;grid-template-columns:repeat(2,1fr)">
                <div><b>3</b><span>cases completos</span></div>
                <div><b>15+</b><span>projetos no ar</span></div>
                <div><b>73</b><span>produtos numa única loja</span></div>
                <div><b>-90<small>%</small></b><span>peso das imagens</span></div>
            </div>
        </section>

        <section class="cases-grid" id="lista">
$tiles
        </section>

        <section class="case-block">
            <div class="cta" style="margin-top:0">
                <div class="cta-left">
                    <h2>SEU NEGÓCIO<br>PODE SER O PRÓXIMO</h2>
                </div>
                <div class="cta-mid">
                    <p>Mesma estrutura, adaptada ao seu segmento. Briefing, escopo e valor fechado em até 24 horas.</p>
                    <a href="$wa_link" target="_blank" rel="noopener" class="btn-light">Quero um site assim <i class="fa-solid fa-arrow-right"></i></a>
                    <a href="orcamento.html" class="btn-line" style="margin-top:10px;display:inline-flex">Monte seu orçamento em 30s <i class="fa-solid fa-arrow-right"></i></a>
                </div>
                <div class="cta-contacts">
                    <a href="mailto:estudiorickdigital@gmail.com"><i class="fa-solid fa-envelope"></i> estudiorickdigital@gmail.com</a>
                    <a href="https://wa.me/$wa" target="_blank"><i class="fab fa-whatsapp"></i> (11) 98942-6415</a>
                    <a href="projetos.html"><i class="fa-solid fa-grip"></i> Ver todos os projetos</a>
                </div>
            </div>
        </section>
    </main>
""").substitute(tiles="\n".join(tiles), wa_link=wa_link, wa=WA)

    head = HEAD.substitute(
        title="Cases e Resultados — Projetos com problema, solução e número | Estúdio Rick Digital",
        desc="Case studies reais do Estúdio Rick Digital: barbearia, igreja e loja 3D. Veja o contexto, o problema, a solução e o resultado medido de cada projeto.",
        canonical=f"{SITE}/cases.html",
        og_title="Cases e Resultados — Estúdio Rick Digital",
        og_desc="Case studies com problema, solução e resultado medido: barbearia, igreja e loja 3D com 73 produtos.",
        og_image=f"{SITE}/img/og-estudio-rick-digital.png",
        jsonld_article=jsonld,
        jsonld_breadcrumb=json.dumps({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Início", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": "Cases", "item": f"{SITE}/cases.html"},
            ],
        }, ensure_ascii=False, indent=2),
        wa_link=wa_link, linkedin=LINKEDIN, github=GITHUB, wa=WA,
    )
    foot = FOOT.substitute(wa_link=wa_link, linkedin=LINKEDIN, github=GITHUB, wa=WA)
    return head + body + foot


def main() -> int:
    check = "--check" in sys.argv
    arquivos = sorted(CONT.glob("*.json"))
    if not arquivos:
        print("Nenhum case em automacao/conteudo/cases/")
        return 1
    cases = [json.loads(p.read_text(encoding="utf-8")) for p in arquivos]

    alvos = [("cases.html", render_hub(cases))]
    for d in cases:
        alvos.append((f"{d['slug']}.html", render_case(d)))

    mudou = []
    for nome, html_txt in alvos:
        out = BASE / nome
        antigo = out.read_text(encoding="utf-8") if out.exists() else ""
        if html_txt != antigo:
            mudou.append(nome)
            if not check:
                out.write_text(html_txt, encoding="utf-8")
    print(f"{len(alvos)} pagina(s) verificada(s). "
          f"{'Alteradas: ' + ', '.join(mudou) if mudou else 'Sem diferencas.'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
