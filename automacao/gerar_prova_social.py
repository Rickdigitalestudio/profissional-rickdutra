#!/usr/bin/env python3
"""Injeta os blocos de prova social (depoimentos, resultados, confianca, FAQ,
clientes) no index.html a partir de automacao/conteudo/prova-social.json.

Marcadores usados no index.html:
    <!-- PS:CLIENTES --> ... <!-- /PS:CLIENTES -->
    <!-- PS:DEPOIMENTOS --> ... <!-- /PS:DEPOIMENTOS -->
    <!-- PS:RESULTADOS --> ... <!-- /PS:RESULTADOS -->
    <!-- PS:CONFIANCA --> ... <!-- /PS:CONFIANCA -->
    <!-- PS:FAQ --> ... <!-- /PS:FAQ -->

Uso:
    python automacao/gerar_prova_social.py
    python automacao/gerar_prova_social.py --check
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
ARQ = BASE / "automacao" / "conteudo" / "prova-social.json"
INDEX = BASE / "index.html"


def e(t) -> str:
    return html.escape(str(t), quote=True)


def bloco_clientes(d: dict) -> str:
    c = d["clientes"]
    cards = []
    for x in c["lista"]:
        inicial = "".join(w[0] for w in x["nome"].split()[:2]).upper()
        demo = ' <span class="cliente-tag">demo</span>' if x.get("demo") else ""
        cards.append(f"""        <a class="cliente-card" href="{e(x["url"])}" target="_blank" rel="noopener">
            <span class="cliente-avatar">{e(inicial)}</span>
            <span class="cliente-info">
                <b class="cliente-dono">{e(x["nome"])}{demo}</b>
                <span class="cliente-empresa">{e(x["empresa"])}</span>
                <em class="cliente-servico">{e(x["servico"])}</em>
                <small class="cliente-segmento">{e(x["segmento"])}</small>
            </span>
        </a>""")
    aviso = f'<p class="clientes-aviso"><b>Nota:</b> {e(c["aviso"])}</p>' if c.get("aviso") else ""
    return f"""<div class="clientes-grid">
{chr(10).join(cards)}
    </div>{aviso}"""


def bloco_avaliacao(d: dict) -> str:
    """Selo de credibilidade. Padrao: score do Lighthouse (verificavel por
    qualquer um). Se existir 'avaliacao' no JSON, usa a nota do Google."""
    a = d.get("selo") or d.get("avaliacao") or {}
    if not a:
        return ""
    url = a.get("url") or ""
    # UM link so: <a> dentro de <a> e HTML invalido e quebra o contraste.
    atributos = f'href="{e(url)}" target="_blank" rel="noopener"' if url else 'role="group"'
    if "valor" in a:
        linhas = "".join(f'<span class="selo-linha">{e(x)}</span>' for x in a.get("linhas", []))
        corpo = (f'<span class="nota">{e(a["valor"])}<small>{e(a.get("sufixo", ""))}</small></span>'
                 f'<span class="selo-info">'
                 f'<span class="txt">{e(a["rotulo"])}</span>{linhas}'
                 f'<span class="txt fonte">{e(a["fonte"])}</span>'
                 f'</span>')
    else:
        corpo = (f'<span class="nota">{e(a["nota"])}<small>/5</small></span>'
                 f'<span class="selo-info">'
                 f'<span class="stars">{e(a["estrelas"])}</span>'
                 f'<span class="txt">{e(a["rotulo"])}</span>'
                 f'<span class="txt fonte">{e(a["fonte"])}</span>'
                 f'</span>')
    return f'<a class="selo-avaliacao" {atributos}>{corpo}</a>'


def bloco_depoimentos(d: dict) -> str:
    dp = d["depoimentos"]
    cards = []
    for x in dp["lista"]:
        modelo = x.get("estado") != "real"
        inicial = "".join(w[0] for w in x["nome"].split()[:2]).upper()
        badge = '<span class="dep-modelo">Texto de exemplo</span>' if modelo else ""
        fonte = ""
        if x.get("url"):
            fonte = (f'<a class="dep-fonte" href="{e(x["url"])}" target="_blank" rel="noopener">'
                     f'<i class="fa-solid fa-arrow-up-right-from-square"></i> ver no site · {e(x.get("fonte", "fonte"))}</a>')
        cards.append(f"""        <article class="dep-card">
            {badge}
            <span class="dep-servico">{e(x["servico"])}</span>
            <p class="dep-quote">{e(x["texto"])}</p>
            <div class="dep-who">
                <span class="dep-avatar">{e(inicial)}</span>
                <span><b>{e(x["nome"])}</b><small>{e(x["cargo"])} · {e(x["empresa"])}</small></span>
            </div>
            {fonte}
        </article>""")
    aviso = f'<p class="dep-aviso"><b>Sobre estes depoimentos:</b> {e(dp["aviso"])}</p>' if dp.get("aviso") else ""
    return f"""<div class="dep-grid">
{chr(10).join(cards)}
    </div>{aviso}"""


def bloco_resultados(d: dict) -> str:
    r = d["resultados"]
    cards = []
    for x in r["lista"]:
        uni = f'<small>{e(x["unidade"])}</small>' if x.get("unidade") else ""
        fonte = (f'<p class="res-fonte"><i class="fa-solid fa-circle-info"></i> {e(x["fonte"])}</p>'
                 if x.get("fonte") else "")
        cards.append(f"""        <article class="res-card">
            <p class="res-valor">{e(x["valor"])}{uni}</p>
            <p class="res-rotulo">{e(x["rotulo"])}</p>
            <p class="res-desc">{e(x["desc"])}</p>
            {fonte}
        </article>""")
    return f"""<div class="res-grid">
{chr(10).join(cards)}
    </div>"""


def bloco_confianca(d: dict) -> str:
    c = d["confianca"]
    cards = []
    for x in c["lista"]:
        cards.append(f"""        <article class="conf-card">
            <i class="{e(x["icone"])}"></i>
            <h3>{e(x["titulo"])}</h3>
            <p>{x["texto"]}</p>
        </article>""")
    return f"""<div class="conf-grid">
{chr(10).join(cards)}
    </div>"""


def bloco_faq(d: dict) -> str:
    f = d["faq"]
    items = []
    for x in f["lista"]:
        items.append(f"""        <details>
            <summary>{e(x["pergunta"])}</summary>
            <p>{x["resposta"]}</p>
        </details>""")
    return f"""<div class="faq-list">
{chr(10).join(items)}
    </div>"""


BLOCOS = {
    "CLIENTES": bloco_clientes,
    "DEPOIMENTOS": bloco_depoimentos,
    "RESULTADOS": bloco_resultados,
    "CONFIANCA": bloco_confianca,
    "FAQ": bloco_faq,
}


def substitui(html_txt: str, nome: str, conteudo: str) -> str:
    padrao = re.compile(
        rf"(<!-- PS:{nome} -->).*?(<!-- /PS:{nome} -->)", re.DOTALL)
    return padrao.sub(lambda m: f"{m.group(1)}\n{conteudo}\n    {m.group(2)}",
                      html_txt, count=1)


def main() -> int:
    check = "--check" in sys.argv
    d = json.loads(ARQ.read_text(encoding="utf-8"))
    atual = INDEX.read_text(encoding="utf-8")
    novo = atual

    for nome, fn in BLOCOS.items():
        if f"<!-- PS:{nome} -->" not in novo:
            print(f"[aviso] marcador PS:{nome} nao encontrado no index.html")
            continue
        novo = substitui(novo, nome, fn(d))

    # selo de avaliacao entra junto dos clientes
    selo = bloco_avaliacao(d)
    if selo and "<!-- PS:SELO -->" in novo:
        novo = substitui(novo, "SELO", selo)

    if novo == atual:
        print("index.html sem diferencas.")
        return 0
    if not check:
        INDEX.write_text(novo, encoding="utf-8")
    print("index.html atualizado com a prova social." if not check
          else "index.html teria diferencas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
