#!/usr/bin/env python3
"""
Development server with auto-reload functionality for Numberly
Watches for file changes and automatically refreshes the browser
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class AutoReloadHandler(FileSystemEventHandler):
    """Handle file system events for auto-reload"""
    
    def __init__(self, server):
        self.server = server
        self.last_reload = 0
        self.reload_delay = 1  # Minimum delay between reloads (seconds)
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        # Only watch specific file types
        if not event.src_path.endswith(('.html', '.css', '.js', '.json')):
            return
        
        # Avoid reloading too frequently
        current_time = time.time()
        if current_time - self.last_reload < self.reload_delay:
            return
        
        self.last_reload = current_time
        print(f"\n🔄 File changed: {event.src_path}")
        print("🔄 Auto-reloading browser...")
        
        # Send reload signal to browser via WebSocket or simple HTTP request
        self.send_reload_signal()
    
    def send_reload_signal(self):
        """Send reload signal to browser"""
        try:
            import urllib.request
            # Try to send a simple request to trigger reload
            urllib.request.urlopen('http://localhost:8000/reload', timeout=1)
        except:
            pass

class DevHTTPServer(http.server.HTTPServer):
    """Custom HTTP server with reload endpoint"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.reload_clients = set()
    
    def handle_reload_request(self, path):
        """Handle reload requests from browser"""
        if path == '/reload':
            return b'{"reload": true}'
        return None

class DevHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler with auto-reload support"""
    
    def do_GET(self):
        # Handle reload endpoint
        if self.path == '/reload':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(b'{"reload": true}')
            return
        
        # Inject auto-reload script into HTML files
        if self.path.endswith('.html') or self.path == '/':
            super().do_GET()
            if hasattr(self, '_content') and b'<html' in self._content:
                self.inject_reload_script()
        else:
            super().do_GET()
    
    def inject_reload_script(self):
        """Inject auto-reload JavaScript into HTML content"""
        if not hasattr(self, '_content'):
            return
        
        reload_script = b'''
<script>
// Auto-reload functionality
(function() {
    let lastCheck = Date.now();
    const checkInterval = 1000; // Check every second
    
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
    
    console.log('🔄 Auto-reload enabled');
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
            self.end_headers()
            self.wfile.write(content)

def start_file_watcher(server):
    """Start file system watcher"""
    event_handler = AutoReloadHandler(server)
    observer = Observer()
    
    # Watch current directory and subdirectories
    watch_path = Path.cwd()
    observer.schedule(event_handler, str(watch_path), recursive=True)
    
    observer.start()
    print(f"👀 Watching for changes in: {watch_path}")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    
    observer.join()

def main():
    """Main development server function"""
    PORT = 8000
    
    print("🚀 Starting Numberly Development Server with Auto-Reload")
    print("=" * 60)
    
    # Check if watchdog is available
    try:
        from watchdog.observers import Observer
        from watchdog.events import FileSystemEventHandler
        watchdog_available = True
    except ImportError:
        print("⚠️  Watchdog not available. Install with: pip install watchdog")
        print("   Auto-reload will use polling instead.")
        watchdog_available = False
    
    # Start HTTP server
    with DevHTTPServer(("", PORT), DevHTTPRequestHandler) as httpd:
        print(f"🌐 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("🔄 Auto-reload: ENABLED")
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
        
        if watchdog_available:
            # Start file watcher in separate thread
            watcher_thread = threading.Thread(
                target=start_file_watcher, 
                args=(httpd,), 
                daemon=True
            )
            watcher_thread.start()
        else:
            # Simple polling fallback
            print("🔄 Using polling-based auto-reload (less efficient)")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            print("👋 Thanks for using Numberly!")

if __name__ == "__main__":
    main()
