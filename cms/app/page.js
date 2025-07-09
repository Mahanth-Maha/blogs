'use client';

import { useEffect, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

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

  const buildTree = (paths) => {
    const root = {};
    for (const path of paths) {
      const parts = path.split('/');
      let node = root;
      for (const part of parts) {
        node[part] = node[part] || {};
        node = node[part];
      }
    }
    return root;
  };

  const renderTree = (node, parent = "") => {
    return (
      <ul className="ml-2">
        {Object.entries(node).map(([name, subtree]) => {
          const fullPath = parent ? `${parent}/${name}` : name;
          const isFile = Object.keys(subtree).length === 0;
          return (
            <li key={fullPath}>
              {isFile ? (
                <button
                  onClick={() => loadPost(fullPath)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  📄 {name}
                </button>
              ) : (
                <details className="text-sm">
                  <summary className="font-semibold">📁 {name}</summary>
                  {renderTree(subtree, fullPath)}
                </details>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <main className="min-h-screen bg-gray-800">
      <PanelGroup direction="horizontal">
        {/* File Tree Panel */}
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <div className="p-4 bg-gray-800 h-screen overflow-y-auto border-r">
            <h2 className="text-xl font-bold mb-4">📁 Content Tree</h2>
            {renderTree(buildTree(posts.map(p => p.path)))}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-800 cursor-col-resize" />

        {/* Editor Panel */}
        <Panel defaultSize={75}>
          <div className="p-4 h-screen">
            <h2 className="text-xl font-semibold mb-2">{selected || 'No file selected'}</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[90%] border rounded p-2 font-mono text-sm"
            />
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
