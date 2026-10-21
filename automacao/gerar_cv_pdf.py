#!/usr/bin/env python3
"""Gera o PDF do curriculo a partir de cv-henrique-dutra.html.

Usa o Chrome headless instalado no Windows para imprimir em PDF.
Se o Chrome nao for encontrado no caminho padrao, informe o caminho:

    python automacao/gerar_cv_pdf.py "C:\\...\\chrome.exe"

Uso:
    python automacao/gerar_cv_pdf.py
"""
from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
HTML = BASE / "cv-henrique-dutra.html"
PDF = BASE / "cv-henrique-dutra.pdf"

CANDIDATOS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
]


def acha_chrome(arg: str | None) -> str | None:
    if arg and Path(arg).exists():
        return arg
    for c in CANDIDATOS:
        if Path(c).exists():
            return c
    return shutil.which("chrome") or shutil.which("msedge")


def main() -> int:
    chrome = acha_chrome(sys.argv[1] if len(sys.argv) > 1 else None)
    if not chrome:
        print("Chrome/Edge nao encontrado. Informe o caminho: "
              "python automacao/gerar_cv_pdf.py \"C:\\\\...\\\\chrome.exe\"")
        return 1
    if not HTML.exists():
        print(f"HTML nao encontrado: {HTML}")
        return 1

    url = "file:///" + str(HTML).replace("\\", "/").replace(" ", "%20")
    cmd = [
        chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--no-pdf-header-footer",
        f"--print-to-pdf={PDF}",
        url,
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if not PDF.exists():
        print("Falha ao gerar o PDF.")
        print(res.stdout[-800:], res.stderr[-800:])
        return 1
    kb = PDF.stat().st_size / 1024
    print(f"PDF gerado: {PDF.name} ({kb:.0f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
