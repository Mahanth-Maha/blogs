from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pathlib import Path
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from datetime import datetime
import yaml
import os

def format_date(dt):
    if isinstance(dt, datetime):
        return dt.strftime('%Y-%m-%d %H:%M:%S%z')
    if isinstance(dt, str):
        try:
            parsed = datetime.fromisoformat(dt)
            return parsed.strftime('%Y-%m-%d %H:%M:%S%z')
        except:
            return dt
    return dt

class PostUpdate(BaseModel):
    content: str
    frontmatter: dict = {}

app = FastAPI()

# Allow your Next.js frontend (http://localhost:3000) to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

HUGO_CONTENT_DIR = Path("./../content")

@app.get("/posts")
def list_posts():
    posts = []
    for file in HUGO_CONTENT_DIR.glob("**/*.md"):
        if file.name.endswith("_index.md") or file.name.startswith("."):
            continue
        posts.append({"title": file.stem, "path": str(file.relative_to(HUGO_CONTENT_DIR).as_posix())})
    return {"posts": posts}

@app.get("/posts/{slug:path}")
def get_post(slug: str):
    post_path = HUGO_CONTENT_DIR / slug
    if not post_path.exists():
        raise HTTPException(status_code=404, detail="Post not found")

    full = post_path.read_text(encoding='utf-8')
    if full.startswith('---'):
        _, front, body = full.split('---', 2)
        frontmatter = yaml.safe_load(front.strip())
    else:
        frontmatter = {}
        body = full

    return {
        "slug": slug,
        "content": body.strip(),
        "frontmatter": frontmatter
    }


@app.put("/posts/{slug:path}")
def save_post(slug: str, post: PostUpdate):
    post_path = HUGO_CONTENT_DIR / slug
    
    post_path.parent.mkdir(parents=True, exist_ok=True)
    
    post.frontmatter['date'] = format_date(post.frontmatter.get('date'))
    post.frontmatter['lastMod'] = datetime.now().strftime('%Y-%m-%dT%H:%M:%S%z')
    front = '---\n' + yaml.safe_dump(post.frontmatter).strip() + '\n---\n'
    full = front + "\n" + post.content.strip()
    post_path.write_text(full, encoding='utf-8')
    return {"message": "Saved successfully"}

@app.get("/meta")
def get_all_categories_tags():
    categories = set()
    tags = set()

    for file in HUGO_CONTENT_DIR.glob("**/*.md"):
        content = file.read_text(encoding='utf-8')
        if content.startswith('---'):
            try:
                _, front, _ = content.split('---', 2)
                data = yaml.safe_load(front.strip())
                if isinstance(data, dict):
                    categories.update(data.get("categories", []))
                    tags.update(data.get("tags", []))
            except Exception:
                continue

    return {
        "categories": sorted(categories),
        "tags": sorted(tags)
    }

@app.get("/folders")
def list_folders():
    folders = set()
    for path in HUGO_CONTENT_DIR.glob("**/*.md"):
        rel = path.relative_to(HUGO_CONTENT_DIR).parent.as_posix()
        if rel != ".":
            folders.add(rel)
    return {"folders": sorted(folders)}

@app.delete("/posts/{slug:path}")
def delete_post(slug: str):
    post_path = HUGO_CONTENT_DIR / slug
    if not post_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    os.remove(post_path)
    return JSONResponse(content={"message": "Deleted successfully"})