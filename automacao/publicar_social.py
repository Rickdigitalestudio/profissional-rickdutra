#!/usr/bin/env python3
"""Publica o status diario (imagem + legenda) no WhatsApp via Evolution API.

Duas formas de usar:
  1) No PC, com a Evolution API rodando (Docker):
       python automacao/publicar_whatsapp_status.py
  2) No GitHub Actions, com os segredos:
       FB_PAGE_ID, FB_ACCESS_TOKEN, IG_USER_ID

O script escolhe o post do dia/hora a partir de automacao/conteudo/social/post.json,
baixa a midia, publica no WhatsApp (Status) e, se as credenciais do Facebook
estiverem presentes, publica tambem na Fanpage e no Instagram.

Nao publica atrasado: depois de 25 min do horario o conteudo perde o pico.
Use --forcar para publicar mesmo assim.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
CONTEUDO = BASE / "automacao" / "conteudo" / "social" / "post.json"
ESTADO = BASE / "automacao" / "conteudo" / "social" / "estado.json"
MIDIA_DIR = BASE / "automacao" / "conteudo" / "social" / "midia"

# Console do Windows (cp1252) nao aguenta emoji — forca UTF-8.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SITE = "https://rickdigitalestudio.github.io/profissional-rickdutra"
WA_NUMERO = "5511989426415"
DIAS = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
GRAPH = "https://graph.facebook.com/v21.0"


# ------------------------------------------------------------------ utils ---
def log(msg: str) -> None:
    print(f"[{dt.datetime.now():%d/%m/%Y %H:%M:%S}] {msg}", flush=True)


def carregar() -> dict:
    if not CONTEUDO.exists():
        return {}
    bruto = json.loads(CONTEUDO.read_text(encoding="utf-8"))
    return bruto.get("post", {})


def salvar_estado(estado: dict) -> None:
    ESTADO.parent.mkdir(parents=True, exist_ok=True)
    ESTADO.write_text(json.dumps(estado, ensure_ascii=False, indent=2), encoding="utf-8")


def chave_slot(dia: str, hora: str) -> str:
    return f"{dia}|{hora}"


def slot_de_agora() -> str:
    agora = dt.datetime.now()
    return chave_slot(DIAS[agora.weekday()], f"{agora:%H:%M}")


def post_do_slot(dados: dict, slot: str) -> dict | None:
    """Procura o post do slot; se nao houver, pega o mais recente do mesmo dia."""
    if slot in dados:
        return dados[slot]
    dia = slot.split("|")[0]
    candidatos = [k for k in dados if k.startswith(dia + "|")]
    if not candidatos:
        return None
    return dados[max(candidatos)]


def ja_publicado(estado: dict, slot: str) -> bool:
    return slot in estado.get("publicados", {})


def marcar(estado: dict, slot: str, onde: list[str]) -> None:
    estado.setdefault("publicados", {})[slot] = {
        "quando": dt.datetime.now().isoformat(timespec="seconds"),
        "onde": onde,
    }
    salvar_estado(estado)


# ------------------------------------------------------------- whatsapp -----
def whatsapp_publicar(texto: str, midia: Path | None) -> tuple[bool, str]:
    """Publica no Status do WhatsApp. Retorna (ok, mensagem)."""
    url_base = os.environ.get("EVOLUTION_URL", "http://localhost:8080").rstrip("/")
    apikey = os.environ.get("EVOLUTION_APIKEY", "")
    instancia = os.environ.get("EVOLUTION_INSTANCE", "atendente")

    if not apikey:
        return False, "EVOLUTION_APIKEY nao configurada (rode local com a Evolution API)."

    headers = {"apikey": apikey, "Content-Type": "application/json"}

    def chamar(metodo: str, caminho: str, corpo: dict | None = None) -> dict:
        dados = json.dumps(corpo).encode() if corpo is not None else None
        req = urllib.request.Request(f"{url_base}{caminho}", data=dados,
                                     headers=headers, method=metodo)
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode() or "{}")

    try:
        estado = chamar("GET", f"/instance/connectionState/{instancia}")
        if (estado.get("state") or "") != "open":
            return False, f"instancia {instancia} nao esta conectada"
    except Exception as e:
        return False, f"Evolution API nao respondeu: {e}"

    try:
        if midia and midia.exists():
            import base64
            b64 = base64.b64encode(midia.read_bytes()).decode()
            corpo = {
                "type": "image",
                "fileName": midia.name,
                "mimetype": "image/jpeg",
                "media": b64,
                "caption": texto,
                "allContacts": True,
                "delay": 5,
            }
        else:
            corpo = {"type": "text", "content": texto, "allContacts": True,
                     "backgroundColor": "#075E54", "font": 2}
        r = chamar("POST", f"/message/sendStatus/{instancia}", corpo)
        return True, json.dumps(r, ensure_ascii=False)[:200]
    except Exception as e:
        return False, f"falha ao publicar: {e}"


# ------------------------------------------------------------- facebook -----
def graph_post(endpoint: str, token: str, corpo: dict) -> tuple[bool, str]:
    dados = urllib.parse.urlencode(corpo).encode()
    url = f"{GRAPH}/{endpoint}"
    try:
        req = urllib.request.Request(url, data=dados, method="POST")
        req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read().decode() or "{}")
            return True, resp.get("id", "ok")
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode()[:200]}"
    except Exception as e:
        return False, str(e)[:200]


def graph_get(endpoint: str, token: str) -> dict:
    url = f"{GRAPH}/{endpoint}"
    try:
        req = urllib.request.Request(url, method="GET")
        req.add_header("Authorization", f"Bearer {token}")
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode() or "{}")
    except Exception:
        return {}


def publicar_facebook(post: dict, token: str) -> tuple[bool, str]:
    page_id = os.environ.get("FB_PAGE_ID", "")
    ig_id = os.environ.get("IG_USER_ID", "")
    texto = post.get("texto", "")
    link = post.get("link", SITE)
    midia_url = post.get("midia_url", "")

    resultados = []
    if page_id:
        corpo = {"message": f"{texto}\n\n{link}"}
        if midia_url:
            corpo["link"] = midia_url
        ok, msg = graph_post(f"{page_id}/feed", token, corpo)
        resultados.append(("Facebook", ok, msg))
    if ig_id and midia_url:
        ok, media_id = graph_post(f"{ig_id}/media", token,
                                  {"image_url": midia_url, "caption": texto})
        if ok and media_id:
            ok2, msg2 = graph_post(f"{ig_id}/media_publish", token, {"creation_id": media_id})
            resultados.append(("Instagram", ok2, msg2))
        else:
            resultados.append(("Instagram", False, media_id))
    return (any(r[1] for r in resultados), json.dumps(resultados, ensure_ascii=False))


# ------------------------------------------------------------------ main ----
def main() -> int:
    ap = argparse.ArgumentParser(description="Publica o post do dia nas redes")
    ap.add_argument("--slot", help='ex.: "terca|12:00"')
    ap.add_argument("--forcar", action="store_true", help="publica mesmo atrasado")
    ap.add_argument("--dry-run", action="store_true", help="so mostra o que publicaria")
    ap.add_argument("--listar", action="store_true", help="lista os slots")
    ap.add_argument("--teste", action="store_true", help="publica um post de teste")
    args = ap.parse_args()

    dados = carregar()
    if not dados:
        log("Nenhum post encontrado em automacao/conteudo/social/post.json")
        return 1

    if args.listar:
        for k in sorted(dados):
            p = dados[k]
            print(f"  {k:22} {p.get('texto','')[:60]}...")
        return 0

    estado = json.loads(ESTADO.read_text(encoding="utf-8")) if ESTADO.exists() else {}

    if args.teste:
        post = {"texto": "TESTE do automatizador de posts ✅",
                "link": SITE, "midia": ""}
        slot = "teste"
    else:
        slot = args.slot or slot_de_agora()
        if ja_publicado(estado, slot) and not args.forcar:
            log(f"Slot {slot} ja publicado em {estado['publicados'][slot]['quando']}. Use --forcar.")
            return 0
        post = post_do_slot(dados, slot)
        if not post:
            log(f"ERRO: nao ha post para o slot {slot}")
            return 1

        # nao publica atrasado (pico de rede se perde)
        if not args.forcar and not args.teste:
            try:
                dia, hora = slot.split("|")
                hh, mm = (int(x) for x in hora.split(":"))
                alvo = dt.datetime.now().replace(hour=hh, minute=mm, second=0, microsecond=0)
                if dt.datetime.now() > alvo + dt.timedelta(minutes=25):
                    log(f"AVISO: slot {slot} atrasado — NAO publicado. Use --forcar.")
                    return 0
            except Exception:
                pass

    texto = post.get("texto", "")
    link = post.get("link", SITE)
    midia_nome = post.get("midia", "")
    midia = MIDIA_DIR / midia_nome if midia_nome else None

    print("=" * 62)
    print(f"SLOT   : {slot}")
    print(f"PLATAF : {', '.join(post.get('plataformas', []))}")
    print(f"LINK   : {link}")
    print("-" * 62)
    print(texto)
    if post.get("hashtags"):
        print("-" * 62)
        print(post["hashtags"])
    print("=" * 62)

    if args.dry_run:
        log("DRY RUN — nada foi publicado.")
        return 0

    onde = []

    # 1) WhatsApp Status
    wa_txt = f"{texto}\n\n{link}"
    if post.get("plataformas") and "whatsapp" in post["plataformas"]:
        ok, msg = whatsapp_publicar(wa_txt, midia)
        log(("WhatsApp OK: " if ok else "WhatsApp FALHOU: ") + msg)
        if ok:
            onde.append("whatsapp")

    # 2) Facebook + Instagram
    token = os.environ.get("FB_ACCESS_TOKEN", "")
    if token and post.get("plataformas"):
        if any(p in post["plataformas"] for p in ("facebook", "instagram")):
            post_ig = dict(post)
            if midia and midia.exists():
                post_ig["midia_url"] = f"{SITE}/automacao/conteudo/social/midia/{midia.name}"
            ok, msg = publicar_facebook(post_ig, token)
            log(("Meta OK: " if ok else "Meta FALHOU: ") + msg)
            if ok:
                onde.extend(["facebook", "instagram"])

    if onde:
        marcar(estado, slot, onde)
        log(f"PUBLICADO em: {', '.join(sorted(set(onde)))}")
    else:
        log("Nada publicado. Verifique as credenciais (EVOLUTION_APIKEY / FB_ACCESS_TOKEN).")

    return 0


if __name__ == "__main__":
    sys.exit(main())
