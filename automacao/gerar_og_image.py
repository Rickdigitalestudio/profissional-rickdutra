#!/usr/bin/env python3
"""Gera a imagem de compartilhamento social (Open Graph) 1200x630 do portfolio.

A marca vem primeiro: logo + ESTUDIO RICK DIGITAL. O portfolio inteiro se
resume em "sites que vendem" — entao o titulo grande e a promessa, e a marca
fica no topo e no rodape.

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
    for c in (Path("C:/Windows/Fonts") / nome, BASE / "fonte" / nome):
        if c.exists():
            return ImageFont.truetype(str(c), tamanho)
    return ImageFont.load_default()


def logomarca(caminho: Path, tamanho: int) -> Image.Image:
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


def principal() -> None:
    img = Image.new("RGB", (W, H), BG)
    brilho = Image.new("RGB", (W, H), BG)
    bd = ImageDraw.Draw(brilho)
    bd.ellipse([W - 300, -250, W + 200, 260], fill=(48, 42, 33))
    bd.ellipse([-240, H - 240, 300, H + 160], fill=(26, 24, 22))
    img = Image.blend(img, brilho.filter(ImageFilter.GaussianBlur(120)), 0.85)
    d = ImageDraw.Draw(img)

    for x in range(0, W, 40):
        d.line([(x, 0), (x, H)], fill=(18, 18, 24), width=1)
    for y in range(0, H, 40):
        d.line([(0, y), (W, y)], fill=(18, 18, 24), width=1)

    d.rectangle([0, 0, W, 8], fill=CHAMPAGNE)

    # ---------- marca em destaque (topo) ----------
    logo = logomarca(BASE / "img" / "logo-rd-512.png", 72)
    img.paste(logo, (72, 52), logo)
    d = ImageDraw.Draw(img)
    f_marca = fonte("bahnschrift.ttf", 44)
    d.text((164, 58), "EST", font=f_marca, fill=MUTED)
    w = d.textbbox((0, 0), "EST ", font=f_marca)[2]
    d.text((164 + w - 8, 58), "\u00daDIO RICK DIGITAL", font=f_marca, fill=CHAMPAGNE)

    # ---------- promessa (titulo grande) ----------
    f_display = fonte("bahnschrift.ttf", 92)
    f_display2 = fonte("bahnschrift.ttf", 100)
    f_body = fonte("arial.ttf", 30)
    f_small = fonte("arialbd.ttf", 24)
    f_tiny = fonte("arial.ttf", 21)

    d.text((72, 176), "SITES QUE", font=f_display, fill=WHITE)
    d.text((72, 264), "VENDEM.", font=f_display2, fill=CHAMPAGNE)

    d.text((72, 396), "Cria\u00e7\u00e3o de sites profissionais \u00b7 landing pages \u00b7 lojas 3D",
           font=f_body, fill=MUTED)
    d.text((72, 436), "S\u00e3o Paulo e todo o Brasil \u00b7 do layout ao c\u00f3digo",
           font=f_body, fill=MUTED)

    # ---------- selo de preco ----------
    selo = (846, 382, 1128, 502)
    d.rounded_rectangle(selo, radius=16, outline=(62, 56, 46), width=2, fill=(17, 17, 23))
    d.text((874, 402), "A PARTIR DE", font=f_tiny, fill=MUTED)
    d.text((874, 430), "R$ 497", font=f_small, fill=GREEN)
    d.text((874, 466), "site \u00b7 10 dias", font=f_tiny, fill=MUTED)

    # ---------- rodape ----------
    d.line([(72, 552), (W - 72, 552)], fill=(30, 30, 38), width=1)
    d.text((72, 570), "estudiorickdigital.github.io/profissional-rickdutra",
           font=f_tiny, fill=MUTED)
    direita = "15+ PROJETOS NO AR \u00b7 LIGHTHOUSE 100/100/100"
    wd = d.textbbox((0, 0), direita, font=f_tiny)[2]
    d.text((W - 72 - wd, 570), direita, font=f_tiny, fill=(90, 86, 80))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, "PNG", optimize=True)
    print(f"OK {OUT} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    principal()
