'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch('http://localhost:8000/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  }, []);

  const loadPost = async (path) => {
    const res = await fetch(`http://localhost:8000/posts/${path}`);
    const data = await res.json();
    setSelected(path);
    setContent(data.content);
  };

  return (
    <main className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">📚 Hugo Markdown CMS</h1>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Post list */}
        <ul className="border rounded p-4 bg-white">
          <h2 className="text-xl font-semibold mb-2">Posts</h2>
          {posts.map((post, idx) => (
            <li key={idx}>
              <button
                onClick={() => loadPost(post.path)}
                className="text-blue-600 hover:underline"
              >
                {post.path}
              </button>
            </li>
          ))}
        </ul>

        {/* Markdown Editor */}
        <div className="border rounded p-4 bg-gray-800 w-full">
          <h2 className="text-xl font-semibold mb-2">{selected || 'No file selected'}</h2>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={25}
            className="w-full border rounded p-2 font-mono text-sm"
          />
        </div>
      </div>
    </main>
  );
}
