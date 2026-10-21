#!/usr/bin/env python3
"""Gera o sitemap.xml a partir dos .html publicados no repositorio.

Usa a URL base de automacao/site.json (o mesmo do resto do site), entao a
migracao para o dominio proprio e um comando so.

Uso: python automacao/gerar_sitemap.py
"""
from __future__ import annotations

import json
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONF = json.loads((BASE / "automacao" / "site.json").read_text(encoding="utf-8"))
SITE = CONF["site_url"].rstrip("/")

# paginas com prioridade maxima (paginas de servico = alvo das buscas)
PAGINAS_SERVICO = [
    "criacao-de-sites-profissionais.html",
    "fanpage-que-vende.html",
    "criacao-de-logo-profissional.html",
    "site-para-pequenas-empresas.html",
    "otimizacao-de-perfil-linkedin.html",
    "trabalho-academico-abnt.html",
    "landing-page-que-converte.html",
    "loja-virtual-completa.html",
]

# cases: prova social que o Google reward
PAGINAS_CASE = [
    "cases.html",
    "case-barbearia-gui-leiros.html",
    "case-ad-santos-a-pioneira.html",
    "case-konstruct-store.html",
]

# paginas legais (baixa prioridade, mas uteis para busca de marca)
PAGINAS_LEGAIS = ["termos.html", "privacidade.html"]

# paginas que nao devem entrar no indice
FORA = {"404.html", "cv-henrique-dutra.html"}


def prioridade(nome: str) -> tuple[str, str]:
    if nome == "index.html":
        return "1.0", "weekly"
    if nome in PAGINAS_SERVICO:
        return "0.9", "weekly"
    if nome in PAGINAS_CASE:
        return "0.8", "monthly"
    if nome in {"projetos.html", "orcamento.html", "servicos-adicionais.html",
                "tecnologias.html"}:
        return "0.8", "weekly"
    if nome in PAGINAS_LEGAIS:
        return "0.3", "yearly"
    if nome in {"sobre.html", "midia.html"}:
        return "0.7", "monthly"
    return "0.6", "monthly"


def main() -> int:
    htmls = sorted(
        p for p in BASE.glob("*.html")
        if p.name not in FORA and not p.name.startswith("_")
    )

    def chave(p: Path) -> tuple:
        if p.name == "index.html":
            return (0, p.name)
        if p.name in PAGINAS_SERVICO:
            return (1, PAGINAS_SERVICO.index(p.name))
        if p.name in PAGINAS_CASE:
            return (2, PAGINAS_CASE.index(p.name))
        return (3, p.name)

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

    # subpaginas de demonstracao (repos publicos do usuario)
    for sub in ("techverse/", "konstruct/"):
        linhas.append(
            f"  <url><loc>{SITE}/{sub}</loc><changefreq>weekly</changefreq>"
            f"<priority>0.9</priority></url>")

    linhas.append("</urlset>")

    saida = "\n".join(linhas) + "\n"
    (BASE / "sitemap.xml").write_text(saida, encoding="utf-8")
    print(f"sitemap.xml gerado com {len(htmls) + 2} URLs (base: {SITE}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
