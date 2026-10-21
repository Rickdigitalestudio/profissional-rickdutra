"""Servidor local de desenvolvimento com cache desativado.

Uso:  python dev-server.py [porta]
Raiz: a pasta deste arquivo (profissional-rickdutra)
"""
import sys
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8899


class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    print(f"KONSTRUCT dev server -> http://localhost:{PORT}/konstruct/index.html")
    ThreadingHTTPServer(("127.0.0.1", PORT), NoCacheHandler).serve_forever()
