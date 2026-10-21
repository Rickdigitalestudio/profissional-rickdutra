#!/usr/bin/env python3
"""Avisa os buscadores que o site mudou (IndexNow) e reenvia o sitemap.

IndexNow e um protocolo aberto e gratuito: ao avisar, Bing, Yandex, Naver,
Seznam, Qwant e outros indexadores reconstroem a pagina em minutos, em vez de
esperar o robô passar.

O Google nao participa do IndexNow — para ele o caminho e o Search Console
(Inspecionar URL > Solicitar indexacao), que e feito pelo Search Console.

Uso:
    python automacao/indexar.py            # avisa com as URLs do sitemap
    python automacao/indexar.py --urls a,b # avisa com URLs especificas
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"
HOST = "rickdigitalestudio.github.io"
KEY_FILE = BASE / "14d081f6b42c4be395d649e1292ade6b.txt"
ESTADO = BASE / "automacao" / "conteudo" / "social" / "estado-indexacao.json"

# Console do Windows (cp1252) nao aguenta acentos/emoji — forca UTF-8.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# indexadores que aceitam IndexNow.
# api.indexnow.org e o endpoint compartilhado: ele repassa para todos os
# participantes (Bing, Yandex, Naver, Seznam, Qwant...). O do Bing direto exige
# a chave na raiz do host, entao fica como complemento.
INDEXADORES = [
    "https://api.indexnow.org/indexnow",
    "https://yandex.com/indexnow",
    "https://api.bing.com/indexnow",
]


def log(msg: str) -> None:
    print(f"[{dt.datetime.now():%d/%m/%Y %H:%M:%S}] {msg}", flush=True)


def urls_do_sitemap() -> list[str]:
    sm = BASE / "sitemap.xml"
    if not sm.exists():
        return []
    return re.findall(r"<loc>(.*?)</loc>", sm.read_text(encoding="utf-8"))


def index_now(urls: list[str], key: str, key_location: str) -> dict:
    """Manda o aviso para todos os indexadores. Retorna {indexador: ok}."""
    corpo = {
        "host": HOST,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls,
    }
    dados = json.dumps(corpo).encode()
    resultado = {}
    for endpoint in INDEXADORES:
        try:
            req = urllib.request.Request(
                endpoint, data=dados, method="POST",
                headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=30) as r:
                resultado[endpoint] = {"ok": True, "status": r.status}
            log(f"IndexNow OK  {endpoint} ({len(urls)} URLs)")
        except urllib.error.HTTPError as e:
            resultado[endpoint] = {"ok": False, "status": e.code,
                                   "erro": e.read().decode()[:150]}
            log(f"IndexNow {e.code} {endpoint}: {e.read().decode()[:120]}")
        except Exception as e:
            resultado[endpoint] = {"ok": False, "erro": str(e)[:150]}
            log(f"IndexNow falhou {endpoint}: {e}")
    return resultado


def ping_sitemap() -> None:
    """Reenvia o sitemap para o Bing.

    O endpoint antigo /ping?sitemap= foi descontinuado pelo Bing (HTTP 410),
    entao usamos a API oficial de envio de sitemap, que exige a chave gerada
    em bing.com/webmasters (Settings > API access). Sem a chave, o IndexNow
    ja cobre o recrawl — nao e um bloqueio.
    """
    chave = os.environ.get("BING_SITEMAP_KEY", "").strip()
    if not chave:
        log("Bing sitemap: sem BING_SITEMAP_KEY — coberto pelo IndexNow.")
        return
    url = f"https://www.bing.com/webmaster/api.sitemap/submit?siteurl={SITE}&sitemapurl={SITE}/sitemap.xml"
    try:
        req = urllib.request.Request(url, method="POST")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as r:
            log(f"Bing sitemap: HTTP {r.status}")
    except urllib.error.HTTPError as e:
        log(f"Bing sitemap: HTTP {e.code}")
    except Exception as e:
        log(f"Bing sitemap falhou: {e}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--urls", help="lista de URLs separadas por virgula")
    ap.add_argument("--key", help="chave do IndexNow (padrao: a do arquivo no repo)")
    args = ap.parse_args()

    key = args.key or os.environ.get("INDEXNOW_KEY", "")
    if not key and KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8").strip()

    if args.urls:
        urls = [u.strip() for u in args.urls.split(",") if u.strip()]
    else:
        urls = urls_do_sitemap()

    if not urls:
        log("ERRO: sitemap.xml nao encontrado ou vazio.")
        return 1

    if not key:
        log("ERRO: sem chave do IndexNow. Crie uma com 'python -c \"import uuid;print(uuid.uuid4().hex)\"' "
            "e salve como <chave>.txt na raiz do repo.")
        return 1

    key_location = f"{SITE}/{key}.txt"
    log(f"Indexando {len(urls)} URLs em {SITE}")
    resultado = index_now(urls, key, key_location)
    ping_sitemap()

    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps({
        "ultima_indexacao": dt.datetime.now().isoformat(timespec="seconds"),
        "urls": len(urls),
        "resultado": resultado,
    }, ensure_ascii=False, indent=2), encoding="utf-8")

    ok = sum(1 for r in resultado.values() if r.get("ok"))
    log(f"Concluido: {ok}/{len(resultado)} indexadores avisados.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
