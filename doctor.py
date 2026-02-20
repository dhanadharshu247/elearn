import os
import sys
import subprocess
import socket

def check_port(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def check_python_deps():
    print("[1/4] Checking Python dependencies...")
    try:
        import fastapi
        import sqlalchemy
        import jose
        import bcrypt
        print("  ✅ Python dependencies are installed.")
    except ImportError as e:
        print(f"  ❌ Missing dependency: {e.name}")
        print("  👉 Run: pip install -r backend/requirements.txt")

def check_node_deps():
    print("[2/4] Checking Frontend dependencies...")
    if os.path.exists("frontend/node_modules"):
        print("  ✅ node_modules found.")
    else:
        print("  ❌ node_modules missing.")
        print("  👉 Run: cd frontend && npm install")

def check_database():
    print("[3/4] Checking Database...")
    if os.path.exists("backend/edweb.db"):
        print("  ✅ edweb.db found.")
    else:
        print("  ❌ edweb.db missing.")
        print("  👉 The run_project.bat will automatically seed it, or run: cd backend && python seed.py")

def check_ports():
    print("[4/4] Checking Ports...")
    if check_port(8000):
        print("  ⚠️ Port 8000 (Backend) is already in use. Ensure no other server is running.")
    else:
        print("  ✅ Port 8000 is available.")
    
    if check_port(5173):
        print("  ⚠️ Port 5173 (Frontend) is already in use.")
    else:
        print("  ✅ Port 5173 is available.")

def main():
    print("=== EdWeb Project Health Doctor ===\n")
    check_python_deps()
    print()
    check_node_deps()
    print()
    check_database()
    print()
    check_ports()
    print("\n===================================")
    print("If everything is ✅, run 'run_project.bat' to start!")

if __name__ == "__main__":
    main()
