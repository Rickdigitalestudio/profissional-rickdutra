#!/usr/bin/env python3
"""Gera a imagem de compartilhamento social (Open Graph) 1200x630.

Uso: python automacao/gerar_og_image.py
Saida: img/og-estudio-rick-digital.png
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

BASE = Path(__file__).resolve().parent.parent
OUT = BASE / "img" / "og-estudio-rick-digital.png"

W, H = 1200, 630
BG = (11, 11, 16)
CHAMPAGNE = (216, 195, 165)
WHITE = (255, 255, 255)
MUTED = (143, 139, 132)
GREEN = (74, 222, 128)


def fonte(nome: str, tamanho: int) -> ImageFont.FreeTypeFont:
    candidatos = [
        Path("C:/Windows/Fonts") / nome,
        BASE / "fonte" / nome,
    ]
    for c in candidatos:
        if c.exists():
            return ImageFont.truetype(str(c), tamanho)
    return ImageFont.load_default()


def centro(d: ImageDraw.ImageDraw, texto: str, f, y: int, fill) -> None:
    w = d.textbbox((0, 0), texto, font=f)[2]
    d.text(((W - w) / 2, y), texto, font=f, fill=fill)


def principal() -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # brilho champagne no canto superior direito
    brilho = Image.new("RGB", (W, H), BG)
    bd = ImageDraw.Draw(brilho)
    bd.ellipse([W - 320, -260, W + 220, 280], fill=(46, 40, 32))
    bd.ellipse([-260, H - 260, 320, H + 180], fill=(28, 26, 24))
    img = Image.blend(img, brilho.filter(ImageFilter.GaussianBlur(120)), 0.85)
    d = ImageDraw.Draw(img)

    # textura de grade fina
    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(18, 18, 24), width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(18, 18, 24), width=1)

    f_display = fonte("bahnschrift.ttf", 96)
    f_display2 = fonte("bahnschrift.ttf", 104)
    f_body = fonte("arial.ttf", 34)
    f_small = fonte("arialbd.ttf", 26)
    f_tiny = fonte("arial.ttf", 22)

    # barra de acento
    d.rectangle([0, 0, W, 8], fill=CHAMPAGNE)

    # marca
    d.text((80, 74), "EST\u00daDIO", font=f_small, fill=MUTED)
    w = d.textbbox((0, 0), "EST\u00daDIO ", font=f_small)[2]
    d.text((80 + w, 74), "RICK DIGITAL", font=f_small, fill=CHAMPAGNE)

    # titulo
    d.text((80, 150), "SITES, FANPAGES", font=f_display, fill=WHITE)
    d.text((80, 244), "E LOGOS QUE", font=f_display, fill=WHITE)
    d.text((80, 338), "VENDEM.", font=f_display2, fill=CHAMPAGNE)

    # subtitulo
    d.text((80, 470), "Web Design \u00b7 SEO \u00b7 LinkedIn \u00b7 ABNT",
           font=f_body, fill=MUTED)

    # selo de preco
    selo = (760, 452, 1120, 548)
    d.rounded_rectangle(selo, radius=14, outline=(60, 56, 48), width=2, fill=(17, 17, 23))
    d.text((790, 468), "A PARTIR DE", font=f_tiny, fill=MUTED)
    d.text((790, 492), "R$ 497", font=f_small, fill=GREEN)

    # rodape
    d.line([(80, 566), (W - 80, 566)], fill=(28, 28, 36), width=1)
    d.text((80, 580), "rickdigitalestudio.github.io/profissional-rickdutra",
           font=f_tiny, fill=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"OK {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    principal()
