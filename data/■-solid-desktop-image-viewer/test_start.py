# Just for a final sanity check that no syntax error is introduced
import subprocess
try:
    subprocess.run(["npm", "run", "lint"], check=True)
except Exception as e:
    print(e)
