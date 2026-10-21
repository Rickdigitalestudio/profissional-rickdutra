#!/usr/bin/env python3
"""Checagem de consistencia do portfolio.

Aponta: links internos quebrados, placeholders esquecidos, numeros que nao
batem entre as paginas, imagens sem alt/dimensoes, paginas fora do sitemap
e conteudo de exemplo (depoimento) ainda publicado.

Uso:
    python automacao/checar_site.py
"""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ERROS: list[str] = []
AVISOS: list[str] = []


def erro(msg: str) -> None:
    ERROS.append(msg)


def aviso(msg: str) -> None:
    AVISOS.append(msg)


def main() -> int:
    htmls = sorted(p for p in BASE.glob("*.html")
                   if not p.name.startswith("_") and p.name != "404.html")

    # ---------- 1. links internos quebrados ----------
    for arq in htmls:
        txt = arq.read_text(encoding="utf-8")
        for m in re.finditer(r'(?:href|src)="([^"]+)"', txt):
            link = m.group(1)
            if link.startswith(("http", "mailto:", "tel:", "#", "data:", "javascript:")):
                continue
            alvo = link.split("#")[0].split("?")[0]
            if not alvo:
                continue
            caminho = BASE / alvo
            if not caminho.exists():
                erro(f"[link quebrado] {arq.name} -> {alvo}")

    # ---------- 2. placeholders de verificacao ----------
    for arq in htmls:
        txt = arq.read_text(encoding="utf-8")
        # ignora o que esta dentro de comentario HTML
        sem_comentario = re.sub(r"<!--.*?-->", "", txt, flags=re.S)
        for tag in re.findall(r'<meta[^>]+name="(?:google-site-verification|msvalidate\.01)"[^>]*>', sem_comentario):
            if "COLE" in tag:
                erro(f"[placeholder] {arq.name}: codigo de verificacao nao preenchido -> {tag[:90]}")
            else:
                aviso(f"[verificacao] {arq.name}: meta de verificacao preenchida (confirme o codigo)")

    # ---------- 3. imagens sem alt / sem dimensoes ----------
    for arq in htmls:
        txt = arq.read_text(encoding="utf-8")
        for tag in re.findall(r'<img\b[^>]*>', txt):
            if "alt=" not in tag:
                erro(f"[img] {arq.name}: <img> sem alt -> {tag[:90]}")
            if "width=" not in tag or "height=" not in tag:
                aviso(f"[img] {arq.name}: <img> sem width/height (CLS) -> {tag[:90]}")
            if "loading=" not in tag and not tag.endswith(".svg\">") and "logo" not in tag:
                aviso(f"[img] {arq.name}: <img> sem loading=lazy -> {tag[:90]}")

    # ---------- 4. contagem de projetos ----------
    home = (BASE / "index.html").read_text(encoding="utf-8")
    cards_home = re.findall(r'<article class="proj-card"', home)
    proj = (BASE / "projetos.html").read_text(encoding="utf-8")
    rows_proj = re.findall(r'<article class="pj-row"', proj)
    if len(cards_home) != len(rows_proj):
        erro(f"[contagem] home tem {len(cards_home)} projetos e projetos.html tem {len(rows_proj)}")

    # filtros da home batem com as categorias reais
    cont = Counter(re.findall(r'<article class="proj-card" data-cat="(\w+)"', home))
    for cat, esperado in (("loja", cont.get("loja", 0)), ("site", cont.get("site", 0)),
                          ("landing", cont.get("landing", 0))):
        achou = re.search(r'data-filter="%s"[^>]*>\s*[^<]*<b>(\d+)</b>' % cat, home)
        if achou and int(achou.group(1)) != esperado:
            erro(f"[filtro] home: '{cat}' mostra {achou.group(1)} mas existem {esperado}")
    if len(cards_home) != int(re.search(r'id="todosCount">(\d+)', home).group(1)):
        erro("[contagem] #todosCount nao bate com o numero de cards")

    # ---------- 5. sitemap ----------
    sm = (BASE / "sitemap.xml").read_text(encoding="utf-8")
    urls = re.findall(r"<loc>(.*?)</loc>", sm)
    for arq in htmls:
        if arq.name in ("404.html", "cv-henrique-dutra.html"):
            continue
        if not any(u.endswith("/" + arq.name) or u.endswith("/" + arq.name.replace("index.html", "")) for u in urls):
            aviso(f"[sitemap] {arq.name} nao esta no sitemap.xml")
    for u in urls:
        if u.endswith(".xml"):
            aviso(f"[sitemap] feed dentro do sitemap: {u}")

    # ---------- 6. depoimentos de exemplo ----------
    if "Texto de exemplo" in home:
        erro("[prova social] ainda ha depoimento de exemplo publicado na home "
             "(troque em automacao/conteudo/prova-social.json e rode gerar_prova_social.py)")

    # ---------- 7. coerencia de preco/prazo ----------
    home_txt = home
    for termo in ["R$ 997", "R$ 497", "R$ 697", "R$ 2.497", "R$ 200", "R$ 297", "R$ 120"]:
        if termo not in home_txt:
            aviso(f"[preco] {termo} nao aparece na home")
    prazos = set(re.findall(r"entrega em (?:até )?(\d+) dias", home))
    if prazos and not {"5", "10", "15"} <= prazos:
        aviso(f"[prazo] home usa prazos inesperados: {sorted(prazos)}")

    # ---------- 8. marca ----------
    for arq in htmls:
        txt = arq.read_text(encoding="utf-8")
        if "Rick Cria Web" in txt:
            erro(f"[marca] {arq.name} ainda usa o nome antigo 'Rick Cria Web'")

    # ---------- 9. JSON-LD ----------
    for arq in htmls:
        txt = arq.read_text(encoding="utf-8")
        for bloco in re.findall(r'<script type="application/ld\+json">(.*?)</script>', txt, re.S):
            import json
            try:
                json.loads(bloco)
            except Exception as exc:
                erro(f"[jsonld] {arq.name}: JSON invalido -> {exc}")

    # ---------- resultado ----------
    print(f"{len(htmls)} pagina(s) checada(s).")
    if AVISOS:
        print(f"\n{len(AVISOS)} AVISO(S):")
        for a in AVISOS:
            print("  -", a)
    if ERROS:
        print(f"\n{len(ERROS)} ERRO(S):")
        for e in ERROS:
            print("  *", e)
        return 1
    print("\nNenhum erro bloqueante.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
