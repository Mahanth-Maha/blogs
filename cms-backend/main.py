from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pathlib import Path
from pydantic import BaseModel
import toml

class PostUpdate(BaseModel):
    content: str

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

    content = post_path.read_text(encoding='utf-8')
    return {"slug": slug, "content": content}

@app.put("/posts/{slug:path}")
def save_post(slug: str, post: PostUpdate):
    post_path = HUGO_CONTENT_DIR / slug
    if not post_path.exists():
        raise HTTPException(status_code=404, detail="Post not found")
    
    post_path.write_text(post.content, encoding='utf-8')
    return {"message": "Saved successfully"}

