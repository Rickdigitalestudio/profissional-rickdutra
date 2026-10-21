"""Servidor local de desenvolvimento com cache desativado.

Uso:  python automacao/servidor-local.py [porta]
Raiz: a pasta do repositorio (um nível acima de automacao/)
"""
import sys
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_POST(self):
        """Salva um arquivo enviado pelo navegador (usado no render das imagens 3D).

        Corpo: caminho relativo + "\\n" + conteudo binario.
        """
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            rel, _, data = body.partition(b"\n")
            target = os.path.normpath(os.path.join(ROOT, rel.decode("utf-8", "ignore")))
            if not target.startswith(ROOT):
                self.send_error(403, "caminho invalido")
                return
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, "wb") as fh:
                fh.write(data)
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"ok")
        except Exception as exc:  # pragma: no cover
            self.send_error(500, str(exc))

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    print(f"KONSTRUCT dev server -> http://localhost:{PORT}/konstruct/index.html")
    ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler).serve_forever()
