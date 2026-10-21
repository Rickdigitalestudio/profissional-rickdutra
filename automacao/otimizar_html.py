#!/usr/bin/env python3
"""Converte as <img> das paginas do portfolio em <picture> com WebP.

Ganha: -90% de peso nas imagens, width/height fixo (CLS = 0) e lazy loading.

So mexe nas paginas .html da raiz do repositorio. Nao mexe em techverse/,
konstruct/ (sao demos 3D com layout proprio) nem nas paginas geradas por
automacao/gerar_cases.py (que ja usam <picture>).

Uso:
    python automacao/otimizar_html.py            # aplica
    python automacao/otimizar_html.py --check    # so mostra o que mudaria
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from PIL import Image

BASE = Path(__file__).resolve().parent.parent
IMG = BASE / "img"

# paginas geradas por script: nao mexer (o gerador ja emite <picture>)
IGNORAR = {"cases.html"}
for p in BASE.glob("case-*.html"):
    IGNORAR.add(p.name)

# atributos permitidos na tag <img> original
RE_IMG = re.compile(
    r'<img\s+src="(img/[^"]+?\.(?:jpg|jpeg|png))"([^>]*)>', re.IGNORECASE)


def dimensoes(caminho: Path) -> tuple[int, int]:
    try:
        with Image.open(caminho) as im:
            return im.size
    except Exception:
        return 0, 0


def main() -> int:
    check = "--check" in sys.argv
    mudou = []

    for arq in sorted(BASE.glob("*.html")):
        if arq.name in IGNORAR:
            continue
        texto = arq.read_text(encoding="utf-8")
        original = texto

        def troca(m: re.Match) -> str:
            src, resto = m.group(1), m.group(2)
            if "width=" in resto and "loading=" in resto:
                return m.group(0)  # ja otimizada
            nome = Path(src).name
            webp = IMG / (Path(nome).stem + ".webp")
            if not webp.exists():
                return m.group(0)
            w, h = dimensoes(IMG / nome)
            if not w or not h:
                return m.group(0)
            # limpa atributos repetidos
            resto = re.sub(r'\s*(loading|decoding|width|height)="[^"]*"', "", resto)
            return (f'<picture><source srcset="{src[:-4]}.webp" type="image/webp">'
                    f'<img src="{src}"{resto} width="{w}" height="{h}" '
                    f'loading="lazy" decoding="async"></picture>')

        texto = RE_IMG.sub(troca, texto)

        if texto != original:
            mudou.append(arq.name)
            if not check:
                arq.write_text(texto, encoding="utf-8")

    print(("Alteradas: " + ", ".join(mudou)) if mudou else "Sem diferencas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
