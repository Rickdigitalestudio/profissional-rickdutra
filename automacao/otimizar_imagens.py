#!/usr/bin/env python3
"""Otimiza as imagens do portfolio: gera .webp (com fallback .jpg/.png) e
imprime as dimensoes para eu preencher width/height (evita CLS).

O site carregava 923 KB so de imagens (83% do peso total). O WebP corta
isso pela metade sem perda visivel.

Uso:
    python automacao/otimizar_imagens.py           # gera os .webp
    python automacao/otimizar_imagens.py --relatorio
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "img"

# apenas as imagens usadas nas paginas do portfolio (o resto e dos projetos 3D)
ALVOS = [
    "barbearia-gui-leiros.jpg",
    "ad-santos-3d.jpg",
    "techverse.jpg",
    "viverdefreelancer.jpg",
    "festa-gui-leiros.png",
    "konstruct.jpg",
    "react-universe.jpg",
    "CrescerBem.png",
    "pousada-do-adao.png",
    "nepofit-performance.png",
    "residencial-tradicao-3d.jpg",
    "DncWeather.png",
    "linkbio-henrique.png",
    "chacasanova-3d.jpg",
    "dwelling-shine-show.jpg",
    "seu-projeto-destaque.png",
    "1_Construindo-um-Portfolio-Profissional-com-React.png",
    "Cha-de-Casa-Nova-Lauane-and-Eduardo-Estao-Prontos.png",
]

# largura maxima do webp (cobre 3 colunas em 1240px + retina ate 2x)
MAXW = 1200
QUALIDADE = 78


def main() -> int:
    relatorio = "--relatorio" in sys.argv
    linhas = []
    original = webp = 0

    for nome in ALVOS:
        src = IMG / nome
        if not src.exists():
            linhas.append(f"[ignorado] {nome} nao existe")
            continue
        if relatorio:
            out = src.with_suffix(".webp")
            tam_o = src.stat().st_size
            tam_w = out.stat().st_size if out.exists() else 0
            with Image.open(src) as im:
                linhas.append(
                    f"{nome:<52} {im.size[0]}x{im.size[1]:<5} "
                    f"orig {tam_o/1024:6.0f}KB -> webp {tam_w/1024:6.0f}KB "
                    f"(-{100 - (tam_w*100/tam_o if tam_o else 0):.0f}%)")
            continue

        with Image.open(src) as im:
            im = im.convert("RGB")
            if im.width > MAXW:
                h = round(im.height * MAXW / im.width)
                im = im.resize((MAXW, h), Image.LANCZOS)
            destino = src.with_suffix(".webp")
            im.save(destino, "WEBP", quality=QUALIDADE, method=6)
            original += src.stat().st_size
            webp += destino.stat().st_size
            linhas.append(
                f"{nome:<52} -> {destino.name:<52} "
                f"{src.stat().st_size/1024:6.0f}KB -> {destino.stat().st_size/1024:6.0f}KB")

    print("\n".join(linhas))
    if not relatorio and original:
        print(f"\nTotal dos alvos: {original/1024:.0f}KB -> {webp/1024:.0f}KB "
              f"(-{100 - webp*100/original:.0f}%) | economia de {(original-webp)/1024:.0f}KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
