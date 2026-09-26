"""Local preview server for the static site: python _source/tools/serve.py  ->  http://localhost:8123/speaking.html"""
import http.server, os, pathlib, socketserver

os.chdir(pathlib.Path(__file__).resolve().parents[2])   # site root


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(("127.0.0.1", 8123), NoCache) as s:
    print("serving on http://localhost:8123")
    s.serve_forever()
