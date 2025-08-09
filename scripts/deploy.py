import os
import subprocess
from datetime import datetime
import shutil
import dotenv

dotenv.load_dotenv()

REPO_URL = os.getenv("REPO_URL", "https://github.com/Mahanth-Maha/blogs.git")
TARGET_BRANCH = os.getenv("TARGET_BRANCH", "gh-pages")
PUBLIC_DIR = os.getenv("PUBLIC_DIR", "public")
DIR = os.getenv("DIR", ".")

def run(cmd):
    print(f"> {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0:
        raise SystemExit(f"❌ Command failed: {cmd}")

print(f"Using REPO_URL: {REPO_URL}")
print(f"Using TARGET_BRANCH: {TARGET_BRANCH}")
print(f"Using PUBLIC_DIR: {PUBLIC_DIR}")

os.chdir(DIR)
print(f"Changed working directory to: {os.getcwd()}")

# 1. Build Hugo site
print("🚀 Building Hugo site...")
run("hugo --minify")

# 2. Ensure we have gh-pages locally
run("git fetch origin")
branches = subprocess.getoutput("git branch --list").split()
if TARGET_BRANCH not in branches:
    run(f"git checkout --orphan {TARGET_BRANCH}")
    run("git rm -rf .")
else:
    run(f"git checkout {TARGET_BRANCH}")
exit(1)
# 3. Copy public into root (clean old files first, but keep .git)
for item in os.listdir("."):
    if item == ".git":
        continue
    if os.path.isdir(item):
        shutil.rmtree(item)
    else:
        os.remove(item)

for item in os.listdir(PUBLIC_DIR):
    src_path = os.path.join(PUBLIC_DIR, item)
    if os.path.isdir(src_path):
        shutil.copytree(src_path, item)
    else:
        shutil.copy2(src_path, item)

# 4. Commit & push
run("git add .")
timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
run(f'git commit -m "🚀 Deploy blog on {timestamp}"')
run(f"git push -f origin {TARGET_BRANCH}")

# 5. Switch back to main (optional)
run("git checkout main")

print(f"✅ Deployment successful: https://mahanthyalla.in/blogs/")
