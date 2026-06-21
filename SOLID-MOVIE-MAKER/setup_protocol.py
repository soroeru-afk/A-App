import os
import sys
import winreg

def register_protocol():
    try:
        # Get current dir and play_launcher.py path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        launcher_path = os.path.normpath(os.path.join(current_dir, "play_launcher.py"))
        
        # Locate py.exe (Python Launcher)
        py_launcher = None
        for path in os.environ.get("PATH", "").split(os.pathsep):
            candidate = os.path.join(path, "py.exe")
            if os.path.exists(candidate):
                py_launcher = candidate
                break
        
        if not py_launcher:
            # Fallback to current python.exe
            py_launcher = sys.executable

        py_launcher = os.path.normpath(py_launcher)

        # Command to run
        command = f'"{py_launcher}" "{launcher_path}" "%1"'

        # Registry key path (Requires admin privileges for HKEY_CLASSES_ROOT)
        key_path = r"solid-play"
        
        # Create and write registry keys
        key = winreg.CreateKey(winreg.HKEY_CLASSES_ROOT, key_path)
        winreg.SetValueEx(key, "", 0, winreg.REG_SZ, "URL:Solid Play Protocol")
        winreg.SetValueEx(key, "URL Protocol", 0, winreg.REG_SZ, "")
        
        shell_key = winreg.CreateKey(key, "shell")
        open_key = winreg.CreateKey(shell_key, "open")
        command_key = winreg.CreateKey(open_key, "command")
        winreg.SetValueEx(command_key, "", 0, winreg.REG_SZ, command)
        
        print("==========================================================")
        print(" Solid Play Protocol Handler Registered Successfully!")
        print(" Registered to HKEY_CLASSES_ROOT")
        print("==========================================================")
    except Exception as e:
        print(f"Error during registry registration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    register_protocol()
