#!/usr/bin/env python3
"""
Simple development server with auto-reload for Numberly
No external dependencies required - uses built-in Python modules only
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys
from pathlib import Path

class AutoReloadHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with auto-reload functionality"""
    
    def do_GET(self):
        # Handle reload endpoint
        if self.path == '/reload':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"reload": true}')
            return
        
        # Serve regular files
        super().do_GET()
    
    def end_headers(self):
        # Add auto-reload script to HTML files
        if (self.path.endswith('.html') or self.path == '/') and hasattr(self, '_content'):
            if b'<html' in self._content and b'</body>' in self._content:
                self.inject_reload_script()
        super().end_headers()
    
    def inject_reload_script(self):
        """Inject auto-reload JavaScript into HTML content"""
        if not hasattr(self, '_content'):
            return
        
        reload_script = b'''
<script>
// Simple auto-reload functionality
(function() {
    let lastCheck = Date.now();
    const checkInterval = 2000; // Check every 2 seconds
    
    function checkForReload() {
        fetch('/reload?t=' + Date.now())
            .then(response => response.json())
            .then(data => {
                if (data.reload) {
                    console.log('🔄 Auto-reloading...');
                    window.location.reload();
                }
            })
            .catch(() => {
                // Server might be restarting, try again later
            });
    }
    
    // Start checking for reloads
    setInterval(checkForReload, checkInterval);
    
    console.log('🔄 Auto-reload enabled - checking every 2 seconds');
})();
</script>
'''
        
        # Find the closing </body> tag and inject script before it
        content = self._content
        if b'</body>' in content:
            content = content.replace(b'</body>', reload_script + b'</body>')
            self._content = content
            # Update content length
            self.send_header('Content-Length', str(len(content)))

class FileWatcher:
    """Simple file watcher using polling"""
    
    def __init__(self, server):
        self.server = server
        self.watch_path = Path.cwd()
        self.file_times = {}
        self.last_reload = 0
        self.reload_delay = 2  # Minimum delay between reloads (seconds)
        self.running = True
        
        # Initialize file times
        self.scan_files()
    
    def scan_files(self):
        """Scan all relevant files and record their modification times"""
        self.file_times = {}
        for file_path in self.watch_path.rglob('*'):
            if file_path.is_file() and file_path.suffix in ['.html', '.css', '.js', '.json']:
                try:
                    self.file_times[str(file_path)] = file_path.stat().st_mtime
                except (OSError, FileNotFoundError):
                    pass
    
    def check_for_changes(self):
        """Check if any files have changed"""
        current_time = time.time()
        
        # Avoid checking too frequently
        if current_time - self.last_reload < self.reload_delay:
            return
        
        for file_path in self.watch_path.rglob('*'):
            if file_path.is_file() and file_path.suffix in ['.html', '.css', '.js', '.json']:
                try:
                    current_mtime = file_path.stat().st_mtime
                    file_str = str(file_path)
                    
                    if file_str in self.file_times:
                        if current_mtime > self.file_times[file_str]:
                            print(f"\n🔄 File changed: {file_path.name}")
                            print("🔄 Auto-reloading browser...")
                            self.trigger_reload()
                            self.file_times[file_str] = current_mtime
                            self.last_reload = current_time
                            return
                    else:
                        # New file
                        self.file_times[file_str] = current_mtime
                        
                except (OSError, FileNotFoundError):
                    pass
    
    def trigger_reload(self):
        """Trigger browser reload"""
        try:
            import urllib.request
            urllib.request.urlopen('http://localhost:8000/reload', timeout=1)
        except:
            pass
    
    def start_watching(self):
        """Start the file watcher loop"""
        print(f"👀 Watching for changes in: {self.watch_path}")
        print("🔄 Auto-reload: ENABLED (polling every 2 seconds)")
        
        while self.running:
            try:
                self.check_for_changes()
                time.sleep(2)  # Check every 2 seconds
            except KeyboardInterrupt:
                break

def main():
    """Main development server function"""
    PORT = 8000
    
    print("🚀 Starting Numberly Development Server with Auto-Reload")
    print("=" * 60)
    
    # Start HTTP server
    with socketserver.TCPServer(("", PORT), AutoReloadHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("=" * 60)
        print("Press Ctrl+C to stop the server")
        print()
        
        # Open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}')
            print("🌐 Browser opened automatically")
        except:
            print("🌐 Please open http://localhost:8000 in your browser")
        
        print()
        
        # Start file watcher in separate thread
        watcher = FileWatcher(httpd)
        watcher_thread = threading.Thread(target=watcher.start_watching, daemon=True)
        watcher_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            print("👋 Thanks for using Numberly!")

if __name__ == "__main__":
    main()
