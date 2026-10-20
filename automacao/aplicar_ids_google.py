#!/usr/bin/env python3
"""Aplica os IDs do Google (Search Console, Bing, GA4, AdSense) em todas as paginas.

Uso:
    python automacao/aplicar_ids_google.py --gsc CODIGO --bing CODIGO --ga4 G-XXXXXXXXXX --adsense ca-pub-XXXXXXXXXXXXXXXX
    python automacao/aplicar_ids_google.py --verificar

Exemplos:
    python automacao/aplicar_ids_google.py --gsc abc123def456
    python automacao/aplicar_ids_google.py --ga4 G-9X8Y7Z6W5V

O script troca em todos os .html da raiz do repositorio:
  COLE_SEU_CODIGO_SEARCH_CONSOLE_AQUI  -> codigo do Search Console
  COLE_SEU_CODIGO_BING_AQUI            -> codigo do Bing Webmaster
  G-SEU-ID                             -> ID do Google Analytics 4
  ca-pub-SEU-ID                        -> ID do AdSense (e descomenta o script)
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent

MARCADORES = {
    "gsc": ("COLE_SEU_CODIGO_SEARCH_CONSOLE_AQUI", "Search Console"),
    "bing": ("COLE_SEU_CODIGO_BING_AQUI", "Bing Webmaster"),
    "ga4": ("G-SEU-ID", "Google Analytics 4"),
    "adsense": ("ca-pub-SEU-ID", "Google AdSense"),
}


def paginas() -> list[Path]:
    return sorted(BASE.glob("*.html"))


def verifica() -> int:
    achados = []
    for p in paginas():
        t = p.read_text(encoding="utf-8")
        for chave, (marcador, nome) in MARCADORES.items():
            if marcador in t:
                achados.append((p.name, nome))
    if not achados:
        print("Todos os IDs ja estao aplicados em todas as paginas.")
        return 0
    print("Marcadores ainda nao substituidos:")
    vistos = set()
    for nome_pag, nome_id in achados:
        if (nome_pag, nome_id) in vistos:
            continue
        vistos.add((nome_pag, nome_id))
        print(f"  {nome_pag:<40} {nome_id}")
    print(f"\n{len(vistos)} combinacao(oes) pendente(s).")
    return 1


def aplica(args) -> int:
    mudanças = 0
    for p in paginas():
        t = orig = p.read_text(encoding="utf-8")
        for chave in ("gsc", "bing", "ga4", "adsense"):
            valor = getattr(args, chave, None)
            if not valor:
                continue
            marcador, _ = MARCADORES[chave]
            if marcador not in t:
                continue
            t = t.replace(marcador, valor)
        if chave == "adsense" and args.adsense:
            # descomenta o script do AdSense
            t = re.sub(
                r"<!--\s*(<script async src=\"https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js[^\n]*?)\s*-->",
                r"\1",
                t,
            )
        if t != orig:
            p.write_text(t, encoding="utf-8")
            print(f"atualizado: {p.name}")
            mudancas += 1
    if mudancas:
        print(f"\n{mudancas} pagina(s) atualizada(s). Revise e faca o commit.")
    else:
        print("Nada a fazer (ou nenhum ID fornecido).")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                   formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--gsc", help="codigo de verificacao do Google Search Console")
    ap.add_argument("--bing", help="codigo de verificacao do Bing Webmaster")
    ap.add_argument("--ga4", help="ID do Google Analytics 4 (G-XXXXXXXXXX)")
    ap.add_argument("--adsense", help="ID do AdSense (ca-pub-XXXXXXXXXXXXXXXX)")
    ap.add_argument("--verificar", action="store_true", help="so mostra o que falta")
    args = ap.parse_args()

    if args.verificar:
        return verifica()
    return aplica(args)


if __name__ == "__main__":
    raise SystemExit(main())
