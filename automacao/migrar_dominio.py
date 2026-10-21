#!/usr/bin/env python3
"""Migra o site do endereco github.io para o dominio proprio.

O que ele faz:
  1. Atualiza automacao/site.json com o novo endereco
  2. Reescreve a URL base em todos os .html, .xml, .json e .py
  3. Cria o arquivo CNAME (obrigatorio para o GitHub Pages)
  4. Gera a pagina de redirecionamento 301 do endereco antigo
  5. Reexecuta os geradores (sitemap, cases, prova social)

PASSO ANTES: compre o dominio e aponte o DNS:
    A      @      185.199.108.153
    CNAME  www    SEU-USUARIO.github.io

Uso:
    python automacao/migrar_dominio.py https://rickdigital.com.br
    python automacao/migrar_dominio.py https://rickdigital.com.br --sem-cname
    python automacao/migrar_dominio.py --reverter
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONF = BASE / "automacao" / "site.json"
ANTIGO = "https://rickdigitalestudio.github.io/profissional-rickdutra"

EXTENSOES = {".html", ".xml", ".json", ".py", ".md", ".webmanifest", ".txt"}
IGNORAR_DIRS = {".git", "img", "techverse", "konstruct", "node_modules", ".anima"}


def Conf() -> dict:
    return json.loads(CONF.read_text(encoding="utf-8"))


def arquivos():
    for p in BASE.rglob("*"):
        if not p.is_file():
            continue
        if any(d in IGNORAR_DIRS for d in p.parts):
            continue
        if p.suffix.lower() in EXTENSOES:
            yield p


def reescreve(antigo: str, novo: str) -> int:
    n = 0
    for p in arquivos():
        try:
            s = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if antigo not in s:
            continue
        p.write_text(s.replace(antigo, novo), encoding="utf-8")
        n += 1
        print(f"  atualizado: {p.relative_to(BASE)}")
    return n


def atualiza_conf(novo: str, dominio: str) -> None:
    c = Conf()
    c["site_url"] = novo
    c["dominio_proprio"] = dominio
    CONF.write_text(json.dumps(c, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  automacao/site.json -> site_url={novo} | dominio_proprio={dominio}")


def gera_cname(dominio: str) -> None:
    destino = BASE / "CNAME"
    destino.write_text(dominio + "\n", encoding="utf-8")
    print(f"  CNAME criado com '{dominio}'")


def gera_redirect(dominio: str) -> None:
    """Pagina de redirect 301 do endereco antigo para o novo."""
    destino = BASE.parent / "redirect-301" / "profissional-rickdutra"
    destino.mkdir(parents=True, exist_ok=True)
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Estúdio Rick Digital — Novo endereço</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://{dominio}/">
<meta http-equiv="refresh" content="0; url=https://{dominio}/">
<script>location.replace("https://{dominio}/" + location.pathname.replace(/^\\/profissional-rickdutra/, "") + location.search);</script>
</head>
<body>
<p>Este endereço mudou. <a href="https://{dominio}/">Clique aqui</a> para ir ao novo site do Estúdio Rick Digital.</p>
</body>
</html>
"""
    (destino / "index.html").write_text(html, encoding="utf-8")
    print(f"  redirect 301 criado em {destino.relative_to(BASE.parent)}")
    print("  --> copie esse arquivo para o repositorio rickdigitalestudio.github.io")


def roda_generadores() -> None:
    for script in ("gerar_sitemap.py", "gerar_cases.py", "gerar_prova_social.py"):
        alvo = BASE / "automacao" / script
        if not alvo.exists():
            continue
        print(f"\n>> python automacao/{script}")
        subprocess.run([sys.executable, str(alvo)], cwd=str(BASE), check=False)


def main() -> int:
    if "--reverter" in sys.argv:
        atualiza_conf(ANTIGO, "")
        reescreve(Conf()["site_url"], ANTIGO)
        (BASE / "CNAME").unlink(missing_ok=True)
        print("Revertido para o endereco do GitHub Pages.")
        return 0

    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    novo = sys.argv[2] if sys.argv[1].startswith("--") else sys.argv[1]
    novo = novo.rstrip("/")
    if not novo.startswith("http"):
        novo = "https://" + novo
    dominio = novo.split("//", 1)[1].split("/")[0]

    atual = Conf()["site_url"]
    print(f"Migrando {atual} -> {novo}\n")
    atualiza_conf(novo, dominio)
    total = reescreve(atual, novo)
    print(f"\n{total} arquivo(s) reescrito(s).")

    if "--sem-cname" not in sys.argv:
        gera_cname(dominio)
    gera_redirect(dominio)
    roda_generadores()

    print("\n" + "=" * 60)
    print("PROXIMOS PASSOS (no painel do GitHub):")
    print(f"  1. Settings > Pages > Custom domain: {dominio}")
    print("  2. Marque 'Enforce HTTPS'")
    print("  3. No DNS do registrador:")
    print(f"       A      @      185.199.108.153")
    print(f"       CNAME  www    rickdigitalestudio.github.io")
    print("  4. Copie o redirect 301 para o repositorio rickdigitalestudio.github.io")
    print("  5. No Search Console, adicione a propriedade do tipo Dominio")
    print("  6. Reenvie o sitemap.xml")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
