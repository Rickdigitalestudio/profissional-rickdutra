#!/usr/bin/env python3
"""Gera feed.xml (RSS 2.0) e social-feed.xml (Atom) do portfolio.

Servem para:
  - syndicar o conteudo em leitores, newsletters e apps (Feedly, Inoreader)
  - hibridar com as redes sociais via IFTTT / Make / Zapier (plano gratis)
  - mostrar seus posts numa pagina propria (feed aggregator)

Uso: python automacao/gerar_feeds.py
"""
from __future__ import annotations

import html
import re
import sys
from pathlib import Path
from xml.sax.saxutils import escape

BASE = Path(__file__).resolve().parent.parent
SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PAGINAS = [
    ("criacao-de-sites-profissionais.html",
     "Criação de Sites Profissionais que Vendem",
     "Site institucional completo, responsivo, com SEO on-page e entrega em até 10 dias. A partir de R$ 997."),
    ("fanpage-que-vende.html",
     "Fanpage que Vende: Página de Vendas que Converte",
     "Oferta clara, copy de venda, prova social e botão de WhatsApp com mensagem pronta. A partir de R$ 497."),
    ("criacao-de-logo-profissional.html",
     "Criação de Logo Profissional",
     "Conceito próprio, arquivo vetorial, versões para fundo claro e escuro e manual de uso. A partir de R$ 200."),
    ("site-para-pequenas-empresas.html",
     "Site para Pequenas Empresas que Traz Cliente Novo",
     "Com SEO local e ficha no Google Maps. Você aparece quando alguém pesquisa por serviço na sua cidade."),
    ("landing-page-que-converte.html",
     "Landing Page Profissional que Converte",
     "Uma página, um objetivo: gerar pedido de orçamento. Entrega em 5 dias a partir de R$ 697."),
    ("loja-virtual-completa.html",
     "Criar Loja Virtual que Vende Enquanto Você Dorme",
     "Catálogo, carrinho, pagamento online, frete, cupom e integração com o WhatsApp. A partir de R$ 2.497."),
    ("otimizacao-de-perfil-linkedin.html",
     "Otimização de Perfil no LinkedIn",
     "Título, resumo, palavras-chave e experiência reescritos para atrair recrutadores e clientes."),
    ("trabalho-academico-abnt.html",
     "Formatação de Trabalho Acadêmico ABNT",
     "Capa, sumário, referências e margens conforme a NBR 14724. A partir de R$ 120."),
    ("projetos.html",
     "Projetos: Sites, Lojas, Fanpages e Landing Pages",
     "Portfolio de projetos entregues: landing pages 3D, sites institucionais, lojas virtuais e fanpages de venda."),
    ("orcamento.html",
     "Orçamento em 30 Segundos",
     "Responda 3 perguntas e receba o valor e o prazo direto no WhatsApp. Resposta em até 24 horas."),
]


def gerador() -> str:
    itens = []
    for arquivo, titulo, desc in PAGINAS:
        url = f"{SITE}/{arquivo}"
        itens.append(f"""    <item>
      <title>{escape(titulo)}</title>
      <link>{url}</link>
      <guid isPermaLink="true">{url}</guid>
      <description>{escape(desc)}</description>
      <category>Estúdio Rick Digital</category>
    </item>""")
    return """<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Estúdio Rick Digital</title>
    <link>{site}</link>
    <atom:link href="{site}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Estúdio Rick Digital — sites profissionais, fanpages que vendem, logos e lojas virtuais. Orçamento em 30 segundos.</description>
    <language>pt-BR</language>
    <copyright>Estúdio Rick Digital — Henrique Luiz Dutra</copyright>
    <managingEditor>estudiorickdigital@gmail.com</managingEditor>
{items}
  </channel>
</rss>
""".format(site=SITE, items="\n".join(itens))


def atom() -> str:
    entradas = []
    for arquivo, titulo, desc in PAGINAS:
        url = f"{SITE}/{arquivo}"
        entradas.append(f"""  <entry>
    <title>{escape(titulo)}</title>
    <link href="{url}"/>
    <id>{url}</id>
    <summary type="html">{escape(desc)}</summary>
    <category term="Estúdio Rick Digital"/>
  </entry>""")
    return """<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="pt-BR">
  <title>Estúdio Rick Digital</title>
  <subtitle>sites profissionais, fanpages que vendem, logos e lojas virtuais</subtitle>
  <link href="{site}/social-feed.xml" rel="self"/>
  <link href="{site}/"/>
  <id>{site}/</id>
  <author><name>Estúdio Rick Digital</name><email>estudiorickdigital@gmail.com</email></author>
{entradas}
</feed>
""".format(site=SITE, entradas="\n".join(entradas))


def main() -> int:
    (BASE / "feed.xml").write_text(gerador(), encoding="utf-8")
    (BASE / "social-feed.xml").write_text(atom(), encoding="utf-8")
    print("feed.xml e social-feed.xml gerados com", len(PAGINAS), "itens.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
