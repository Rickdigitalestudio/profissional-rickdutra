#!/usr/bin/env python3
"""Aplica a marca do Estúdio Rick Digital na prévia de compartilhamento (Open Graph).

O que faz:
  1. Gera uma imagem 1200x630 com o logo e o nome do ESTÚDIO RICK DIGITAL
     (o resto é o projeto), dentro de cada repositorio de projeto
  2. Insere/atualiza as tags og:* e twitter:* do index.html de cada projeto
     para que a prévia no WhatsApp/LinkedIn mostre o estudio como marca
     principal e o projeto como prova

Por que a imagem fica dentro do repo do projeto: o WhatsApp, o Facebook e o
LinkedIn so puxam og:image do MESMO dominio da pagina. Se a imagem morasse
no portfolio, a previa nao apareceria em boa parte dos apps.

Uso:
    python automacao/branding_projetos.py             # gera e aplica em todos
    python automacao/branding_projetos.py --so-imagem # so gera as imagens
    python automacao/branding_projetos.py --so-tags   # so aplica as tags
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE = Path(__file__).resolve().parent.parent
RAIZ = BASE.parent  # pasta que contem os repos do usuario

W, H = 1200, 630
BG = (11, 11, 16)
CHAMPAGNE = (216, 195, 165)
WHITE = (255, 255, 255)
MUTED = (143, 139, 132)
VERDE = (74, 222, 128)

# --------------------------------------------------------------------------
# Lista de projetos. 'print' = imagem de referencia (print do site).
# --------------------------------------------------------------------------
PROJETOS = [
    {
        "repo": "barbearia-gui-leiros",
        "host": "https://rickdigitalestudio.github.io/barbearia-gui-leiros/",
        "titulo": "BARBEARIA GUI LEIROS",
        "subtitulo": "Barbearia · Vila Conde Siciliano, Rio Grande da Serra/SP",
        "servico": "Site oficial 3D · 11 fotos reais · agendamento no WhatsApp",
        "descricao": "Site oficial 3D da Barbearia Gui Leiros: fundo de partículas interativo, tabela de serviços com filtro, portfólio com 11 fotos reais e agendamento direto no WhatsApp.",
        "print": "barbearia-gui-leiros.jpg",
    },
    {
        "repo": "nepofit-publish",
        "host": "https://rickdigitalestudio.github.io/nepofit-performance/",
        "titulo": "NEPOFIT PERFORMANCE",
        "subtitulo": "Academia · R. Ribeirão Pires, Rio Grande da Serra/SP",
        "servico": "Landing page de conversão · planos e agendamento no WhatsApp",
        "descricao": "Landing page de alta conversão da Nepofit Performance: planos, modalidades, depoimentos e agendamento de aula experimental pelo WhatsApp.",
        "print": "nepofit-performance.png",
    },
    {
        "repo": "pousada-do-adao",
        "host": "https://rickdigitalestudio.github.io/pousada-do-adao/",
        "titulo": "POUSADA DO ADÃO",
        "subtitulo": "Hotelaria e restaurante · Rio Grande da Serra/SP",
        "servico": "Site completo · cardápio, suítes e reservas no WhatsApp",
        "descricao": "Site da Pousada e Restaurante do Adão: suítes, cardápio, galeria, depoimentos e reservas integradas ao WhatsApp.",
        "print": "pousada-do-adao.png",
    },
    {
        "repo": "ad-ministerio-santos-3d",
        "host": "https://rickdigitalestudio.github.io/ad-ministerio-santos-3d/",
        "titulo": "AD SANTOS — A PIONEIRA",
        "subtitulo": "Institucional · Assembleia de Deus Ministério de Santos/SP",
        "servico": "Site institucional 3D · maquete do templo, mapa e rádio ao vivo",
        "descricao": "Site institucional 3D da AD Santos — A Pioneira: maquete procedural do templo em Three.js, linha do tempo com mapa ao vivo, mapa de igrejas clicável e rádio Fly 99 FM no ar.",
        "print": "ad-santos-3d.jpg",
    },
    {
        "repo": "CrescerBem",
        "host": "https://rickdigitalestudio.github.io/CrescerBem/",
        "titulo": "CRESCERBEM",
        "subtitulo": "Plataforma · desenvolvimento infantil do nascimento aos 6 anos",
        "servico": "Plataforma com guias por idade, consultas e área de depoimentos",
        "descricao": "Plataforma CrescerBem: guias de alimentação, sono, rotina e atividades por fase, com consulta com especialistas e área de depoimentos.",
        "print": "CrescerBem.png",
    },
    {
        "repo": "viverdefreelancer",
        "host": "https://rickdigitalestudio.github.io/viverdefreelancer/",
        "titulo": "VIVER DE FREELANCER",
        "subtitulo": "Plataforma de conteúdo · marca pessoal",
        "servico": "Migração do Gamma para código 3D próprio",
        "descricao": "Viver de Freelancer: plataforma migrada do Gamma para código 3D próprio, com hero, serviços, portfólio, clientes, preços, processo e depoimentos.",
        "print": "viverdefreelancer.jpg",
    },
    {
        "repo": "festa-gui-leiros",
        "host": "https://rickdigitalestudio.github.io/festadascriacas2.0guileiros/",
        "titulo": "FESTA DAS CRIANÇAS 2.0",
        "subtitulo": "Evento 3D · Vila Conde Siciliano/SP",
        "servico": "Landing 3D interativa · balões, presentes e mapa do tesouro",
        "descricao": "Landing 3D da Festa das Crianças 2.0: cena WebGL com balões e confete, cards flip, mapa do tesouro com rota animada e CTA no WhatsApp.",
        "print": "festa-gui-leiros.png",
    },
    {
        "repo": "cha-casa-nova-3d",
        "host": "https://rickdigitalestudio.github.io/cha-casa-nova-3d/",
        "titulo": "CHÁ DE CASA NOVA 3D",
        "subtitulo": "Convite interativo · Two.js/WebGL em mansão de dois pavimentos",
        "servico": "Convite 3D com tour guiado, contador e 2 formulários",
        "descricao": "Convite 3D do Chá de Casa Nova: mansão de dois pavimentos em Three.js, tour guiado pelo scroll, contador regressivo, mapa e dois formulários.",
        "print": "chacasanova-3d.jpg",
    },
    {
        "repo": "react-universe",
        "host": "https://rickdigitalestudio.github.io/react-universe/",
        "titulo": "REACT UNIVERSE",
        "subtitulo": "Guia interativo · React, Three.js e Hooks",
        "servico": "Cena 3D, demos de hooks, roadmap, quiz e checklist",
        "descricao": "React Universe: guia interativo do zero ao deploy para montar um portfólio profissional com React, em cena 3D com demos reais de hooks.",
        "print": "react-universe.jpg",
    },
    {
        "repo": "Landing-Page-Arquitetura",
        "host": "https://rickdigitalestudio.github.io/Landing-Page-Arquitetura/",
        "titulo": "RESIDENCIAL TRADIÇÃO",
        "subtitulo": "Imobiliário · landing de empreendimento",
        "servico": "Maquete 3D da fachada, giro 360° e captura de leads",
        "descricao": "Landing premium do Residencial Tradição: maquete 3D da fachada com giro 360° em Three.js, vitrine de imóveis e captura de leads.",
        "print": "residencial-tradicao-3d.jpg",
    },
    {
        "repo": "Desafio-2-Dnc-consumo-de-API",
        "host": "https://rickdigitalestudio.github.io/Desafio-2-Dnc-consumo-de-API/",
        "titulo": "DNC WEATHER 3D",
        "subtitulo": "Consumo de API · previsão do tempo e busca de endereços",
        "servico": "Consumo de APIs públicas com cena 3D",
        "descricao": "DncWeather 3D: previsão do tempo e busca de endereços em tempo real com consumo de APIs públicas e cena 3D.",
        "print": "DncWeather.png",
    },
    # --- demos que moram dentro do proprio portfolio ---
    {
        "repo": "profissional-rickdutra/techverse",
        "host": "https://rickdigitalestudio.github.io/profissional-rickdutra/techverse/",
        "titulo": "TECHVERSE",
        "subtitulo": "Loja 3D de tecnologia · 18 produtos no carrinho real",
        "servico": "Loja 3D com categorias, hero de produto e checkout no WhatsApp",
        "descricao": "TechVerse: loja de tecnologia em 3D com 18 produtos por categoria, hero 3D, carrinho real e pedido pelo WhatsApp.",
        "print": "techverse.jpg",
    },
    {
        "repo": "profissional-rickdutra/konstruct",
        "host": "https://rickdigitalestudio.github.io/profissional-rickdutra/konstruct/",
        "titulo": "KONSTRUCT STORE",
        "subtitulo": "Loja 3D de ferramentas · 73 produtos e 67 fotos reais",
        "servico": "Vitrine 3D navegável, filtro, busca e carrinho com persistência",
        "descricao": "Konstruct Store: loja de ferramentas em 3D com 73 produtos catalogados, 67 fotos reais de produto, vitrine navegável e carrinho com persistência.",
        "print": "konstruct.jpg",
    },
]

ARQUIVO_OG = "og-estudio-rick-digital.png"


# --------------------------------------------------------------------------
# imagem
# --------------------------------------------------------------------------
def fonte(nome: str, tamanho: int) -> ImageFont.FreeTypeFont:
    for c in (Path("C:/Windows/Fonts") / nome, BASE / "fonte" / nome):
        if c.exists():
            return ImageFont.truetype(str(c), tamanho)
    return ImageFont.load_default()


def logomarca(caminho: Path, tamanho: int) -> Image.Image:
    """Desenha a marca RD (o mesmo desenho do logo-rd.svg)."""
    m = Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([1, 1, tamanho - 2, tamanho - 2], radius=int(tamanho * 0.26),
                        fill=(20, 20, 27, 255), outline=(216, 195, 165, 255), width=3)
    f = fonte("arialbd.ttf", int(tamanho * 0.42))
    txt = "RD"
    w = d.textbbox((0, 0), txt, font=f)[2]
    d.text(((tamanho - w) / 2, tamanho * 0.30), txt, font=f, fill=(242, 239, 233, 255))
    r = tamanho * 0.09
    cx, cy = tamanho - r * 1.5, r * 1.5
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(11, 11, 16, 255))
    d.ellipse([cx - r * .64, cy - r * .64, cx + r * .64, cy + r * .64], fill=(74, 222, 128, 255))
    return m


def quebra(texto: str, f, d, max_w: int) -> list[str]:
    palavras, linhas, atual = texto.split(), [], ""
    for p in palavras:
        teste = (atual + " " + p).strip()
        if d.textbbox((0, 0), teste, font=f)[2] <= max_w:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = p
    if atual:
        linhas.append(atual)
    return linhas


def gera_imagem(p: dict) -> Path:
    destino_repo = RAIZ / p["repo"]
    destino = destino_repo / ARQUIVO_OG
    destino_repo.mkdir(parents=True, exist_ok=True)

    img = Image.new("RGB", (W, H), BG)
    brilho = Image.new("RGB", (W, H), BG)
    bd = ImageDraw.Draw(brilho)
    bd.ellipse([W - 300, -250, W + 200, 260], fill=(46, 40, 32))
    bd.ellipse([-240, H - 240, 300, H + 160], fill=(26, 24, 22))
    img = Image.blend(img, brilho.filter(ImageFilter.GaussianBlur(120)), 0.85)
    d = ImageDraw.Draw(img)

    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(18, 18, 24), width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(18, 18, 24), width=1)

    d.rectangle([0, 0, W, 8], fill=CHAMPAGNE)

    # ---- cabecalho: logo + nome do estudio ----
    logo = logomarca(BASE / "img" / "logo-rd-512.png", 56)
    img.paste(logo, (72, 52), logo)
    d = ImageDraw.Draw(img)
    f_marca = fonte("bahnschrift.ttf", 34)
    d.text((144, 62), "EST", font=f_marca, fill=MUTED)
    w = d.textbbox((0, 0), "EST ", font=f_marca)[2]
    d.text((144 + w - 6, 62), "\u00daDIO RICK DIGITAL", font=f_marca, fill=CHAMPAGNE)

    # ---- print do projeto (lado direito) ----
    print_path = BASE / "img" / p["print"]
    if print_path.exists():
        try:
            with Image.open(print_path) as pr:
                alvo_w, alvo_h = 430, 330
                escala = max(alvo_w / pr.width, alvo_h / pr.height)
                pr = pr.convert("RGB").resize(
                    (max(1, int(pr.width * escala)), max(1, int(pr.height * escala))),
                    Image.LANCZOS)
                esq = (pr.width - alvo_w) // 2
                topo = 0
                pr = pr.crop((esq, topo, esq + alvo_w, topo + alvo_h))
                # moldura
                d.rounded_rectangle([746, 196, 746 + alvo_w + 12, 196 + alvo_h + 12],
                                    radius=16, outline=(48, 44, 38), width=2, fill=(17, 17, 23))
                img.paste(pr, (752, 202))
                d = ImageDraw.Draw(img)
        except Exception as exc:
            print(f"  [aviso] nao consegui abrir {print_path.name}: {exc}")

    # ---- titulo do projeto ----
    f_titulo = fonte("bahnschrift.ttf", 62)
    f_sub = fonte("arial.ttf", 26)
    f_serv = fonte("arialbd.ttf", 24)
    f_pe = fonte("arial.ttf", 21)

    y = 176
    for linha in quebra(p["titulo"], f_titulo, d, 620):
        d.text((72, y), linha, font=f_titulo, fill=WHITE)
        y += 64
    d.text((72, y + 6), p["subtitulo"], font=f_sub, fill=CHAMPAGNE)
    yy = y + 44
    for linha in quebra(p["servico"], f_serv, d, 620):
        d.text((72, yy), linha, font=f_serv, fill=(190, 186, 178))
        yy += 30

    # ---- rodape ----
    d.line([(72, 566), (W - 72, 566)], fill=(30, 30, 38), width=1)
    d.text((72, 580), "estudiorickdigital.github.io/profissional-rickdutra",
           font=f_pe, fill=MUTED)
    marca_pe = "CRIADO POR EST\u00daDIO RICK DIGITAL"
    wm = d.textbbox((0, 0), marca_pe, font=f_pe)[2]
    d.text((W - 72 - wm, 580), marca_pe, font=f_pe, fill=(90, 86, 80))

    img.save(destino, "PNG", optimize=True)
    return destino


# --------------------------------------------------------------------------
# tags
# --------------------------------------------------------------------------
def bloco_tags(p: dict) -> str:
    img_url = p["host"].rstrip("/") + "/" + ARQUIVO_OG
    titulo = f"Estúdio Rick Digital \u2014 {p['titulo'].title()}"
    desc = f"{p['descricao']} Criado pelo Estúdio Rick Digital."
    return f"""    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="Estúdio Rick Digital">
    <meta property="og:title" content="{titulo}">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{p['host']}">
    <meta property="og:image" content="{img_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{titulo}">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{img_url}">"""


BLOCO_RE = re.compile(
    r"[ \t]*<!-- OG-ESTUDIO-RICK-DIGITAL -->.*?<!-- OG-ESTUDIO-RICK-DIGITAL-END -->",
    re.S)


def aplica_tags(p: dict) -> bool:
    """Reescreve o bloco de Open Graph de forma determinística e idempotente:
    remove TODAS as tags og:/twitter: e os marcadores do gerador, e reinsere
    o bloco novo logo depois do </title>."""
    index = RAIZ / p["repo"] / "index.html"
    if not index.exists():
        print(f"  [aviso] {p['repo']}/index.html nao encontrado")
        return False
    s = index.read_text(encoding="utf-8")

    # 1) limpa marcadores do gerador (inclusive sobras de execucoes antigas)
    s = re.sub(r"[ \t]*<!-- OG-ESTUDIO-RICK-DIGITAL-END -->\n?", "", s)
    s = re.sub(r"[ \t]*<!-- OG-ESTUDIO-RICK-DIGITAL -->\n?", "", s)
    # 2) limpa todas as tags og:/twitter: (inclusive as duplicadas)
    s = re.sub(r'[ \t]*<meta property="og:[^"]+"[^>]*>\n?', "", s)
    s = re.sub(r'[ \t]*<meta name="twitter:[^"]+"[^>]*>\n?', "", s)

    m = re.search(r"</title>", s)
    if not m:
        print(f"  [aviso] {p['repo']}/index.html sem <title>")
        return False

    bloco = ("    <!-- OG-ESTUDIO-RICK-DIGITAL -->\n" + bloco_tags(p) +
             "\n    <!-- OG-ESTUDIO-RICK-DIGITAL-END -->")
    s = s[:m.end()] + "\n" + bloco + s[m.end():]
    index.write_text(s, encoding="utf-8")
    return True


CREDITO_HTML = """<p class="credito-estudio" style="text-align:center;font-size:.7rem;letter-spacing:.06em;opacity:.6;padding:16px;margin:0;line-height:1.6">
      Site criado por <a href="https://rickdigitalestudio.github.io/profissional-rickdutra/" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">Estúdio Rick Digital</a>
    </p>"""


def aplica_credito(p: dict) -> bool:
    """Insere o credito visivel do estudio no rodape do projeto."""
    index = RAIZ / p["repo"] / "index.html"
    if not index.exists():
        return False
    s = index.read_text(encoding="utf-8")
    if "credito-estudio" in s:
        return False
    if "</footer>" in s:
        s = s.replace("</footer>", CREDITO_HTML + "\n</footer>", 1)
    elif "</body>" in s:
        s = s.replace("</body>", CREDITO_HTML + "\n</body>", 1)
    else:
        return False
    index.write_text(s, encoding="utf-8")
    return True


def main() -> int:
    so_img = "--so-imagem" in sys.argv
    so_tags = "--so-tags" in sys.argv
    so_credito = "--so-credito" in sys.argv
    n = 0
    c = 0
    for p in PROJETOS:
        repo = RAIZ / p["repo"]
        if not repo.exists():
            print(f"[pula] {p['repo']} nao esta na pasta local")
            continue
        print(f"* {p['repo']}")
        if not so_tags:
            dest = gera_imagem(p)
            print(f"    imagem: {dest.name} ({dest.stat().st_size // 1024} KB)")
        if not so_img:
            if aplica_tags(p):
                print("    tags OG/Twitter atualizadas")
                n += 1
        if not so_img and not so_tags:
            if aplica_credito(p):
                print("    credito do estudio no rodape")
                c += 1
    print(f"\n{n} projeto(s) com tags aplicadas, {c} com credito no rodape.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
