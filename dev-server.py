#!/usr/bin/env python3
"""
Dev server with path aliasing for webOS Enyo framework
"""
import http.server
import os

PORT = 8080
WEBROOT = os.path.dirname(os.path.abspath(__file__))

# Path aliases: request path -> filesystem path
ALIASES = {
    '/usr/palm/frameworks/enyo/0.10/': '/opt/PalmSDK/Current/share/framework/enyo/1.0/',
    '/usr/palm/frameworks/': '/opt/PalmSDK/Current/share/framework/'
}

class AliasedHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Check if path matches any alias
        for alias, target in ALIASES.items():
            if path.startswith(alias):
                real_path = path.replace(alias, target, 1)
                return real_path

        # Default behavior - serve from webroot
        return os.path.join(WEBROOT, path.lstrip('/'))

if __name__ == '__main__':
    os.chdir(WEBROOT)
    with http.server.HTTPServer(('', PORT), AliasedHTTPRequestHandler) as httpd:
        print(f"Dev server running at http://localhost:{PORT}")
        print(f"Aliasing /usr/palm/frameworks/ -> /opt/PalmSDK/Current/share/framework/")
        httpd.serve_forever()
