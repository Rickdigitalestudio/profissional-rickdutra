#!/usr/bin/env python3
"""Gera o sitemap.xml a partir dos .htmlpublicados no repositorio.

Uso: python automacao/gerar_sitemap.py
"""
from __future__ import annotations

import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"

# paginas com prioridade maxima (páginas de servico = alvo das buscas)
PAGINAS_SERVICO = [
    "criacao-de-sites-profissionais.html",
    "fanpage-que-vende.html",
    "criacao-de-logo-profissional.html",
    "site-para-pequenas-empresas.html",
    "otimizacao-de-perfil-linkedin.html",
    "trabalho-academico-abnt.html",
]

# paginas que nao devem entrar no indice
FORA = {"termos.html"}


def prioridade(nome: str) -> tuple[str, str]:
    if nome == "index.html":
        return "1.0", "weekly"
    if nome in PAGINAS_SERVICO:
        return "0.9", "weekly"
    if nome in {"projetos.html", "orcamento.html", "servicos-adicionais.html",
                "tecnologias.html"}:
        return "0.8", "weekly"
    if nome in {"sobre.html", "midia.html"}:
        return "0.7", "monthly"
    return "0.6", "monthly"


def main() -> int:
    htmls = sorted(
        p for p in BASE.glob("*.html")
        if p.name not in FORA and not p.name.startswith("_")
    )
    # ordem: index, servicos, resto
    def chave(p: Path) -> tuple:
        if p.name == "index.html":
            return (0, p.name)
        if p.name in PAGINAS_SERVICO:
            return (1, PAGINAS_SERVICO.index(p.name))
        return (2, p.name)

    linhas = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for p in sorted(htmls, key=chave):
        prio, freq = prioridade(p.name)
        url = f"{SITE}/" if p.name == "index.html" else f"{SITE}/{p.name}"
        linhas.append(
            f"  <url><loc>{url}</loc><changefreq>{freq}</changefreq>"
            f"<priority>{prio}</priority></url>")

    # feeds (syndication e integracao com redes)
    for feed in ("feed.xml", "social-feed.xml"):
        linhas.append(
            f"  <url><loc>{SITE}/{feed}</loc><changefreq>weekly</changefreq>"
            f"<priority>0.5</priority></url>")

    # subpaginas de demonstracao (repos publicos do usuario)
    for sub, prio in (("techverse/", "0.9"), ("konstruct/", "0.9")):
        linhas.append(
            f"  <url><loc>{SITE}/{sub}</loc><changefreq>weekly</changefreq>"
            f"<priority>{prio}</priority></url>")

    linhas.append("</urlset>")

    saida = "\n".join(linhas) + "\n"
    (BASE / "sitemap.xml").write_text(saida, encoding="utf-8")
    print(f"sitemap.xml gerado com {len(htmls) + 4} URLs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
