'use client';

import { useEffect, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);


  useEffect(() => {
    fetch('http://localhost:8000/posts')
      .then(res => res.json())
      .then(data => setPosts(data.posts));
  }, []);
  
  const savePost = async () => {
    if (!selected) return;
    await fetch(`http://localhost:8000/posts/${selected}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    alert('Saved!');
  };

  const refreshPost = async () => {
    if (!selected) return;
    const res = await fetch(`http://localhost:8000/posts/${selected}`);
    const data = await res.json();
    setContent(data.content);
  };

  const insert = (syntax) => {
    const textarea = document.getElementById("markdown");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const selectedText = textarea.value.substring(start, end);

    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic'}*`;
        break;
      case 'heading':
        newText = `# ${selectedText || 'Heading'}`;
        break;
      case 'code':
        newText = `\`\`\`\n${selectedText || 'code'}\n\`\`\``;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote'}`;
        break;
    }

    setContent(before + newText + after);
  };

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

  const renderTree = (node, parent = "",depth = 0) => {
    return (
      <ul>
        {Object.entries(node).map(([name, subtree]) => {
          const fullPath = parent ? `${parent}/${name}` : name;
          const isFile = Object.keys(subtree).length === 0;
          const paddingLeft = `${depth * 1.25}rem`;

          return (
            <li key={fullPath} className="text-sm">
              {isFile ? (
                <button
                  onClick={() => loadPost(fullPath)}
                  className="flex items-center text-left text-white-600 hover:underline"
                  style={{ paddingLeft }}
                >
                  📄 {name}
                </button>
              ) : (
                <details>
                  <summary
                    className="flex items-center font-semibold cursor-pointer"
                    style={{ paddingLeft }}
                  >
                    📁 {name}
                  </summary>
                  {renderTree(subtree, fullPath, depth + 1)}
                </details>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <main className="min-h-screen bg-gray-600">
      <PanelGroup direction="horizontal">
        {/* File Tree Panel */}
        <Panel defaultSize={25} minSize={15} maxSize={40}>
          <div className="p-4 bg-gray-800 h-screen overflow-y-auto border-r text-white">
            <h2 className="text-xl font-bold mb-4">📁 Content Tree</h2>
            {renderTree(buildTree(posts.map(p => p.path)))} 
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-gray-800 cursor-col-resize" />

        {/* Editor Panel */}
        <Panel defaultSize={75}>
          <div className="p-4 h-screen">
            <h2 className="text-xl font-semibold mb-2">{selected || 'No file selected'}</h2>
            {/* Toolbar */}
            <div className="mb-2 flex gap-2 flex-wrap justify-between items-center">
              <div className="flex gap-2">
                <button onClick={refreshPost} className="px-3 py-1 bg-gray-600 text-white rounded">🔁 Refresh</button>

                <button onClick={() => insert('bold')} className="bg-blue-600 px-2 rounded">**B**</button>
                <button onClick={() => insert('italic')} className="bg-blue-600 px-2 rounded"><i>I</i></button>
                <button onClick={() => insert('heading')} className="bg-blue-600 px-2 rounded">H1</button>
                <button onClick={() => insert('code')} className="bg-blue-600 px-2 rounded">`Code`</button>
                <button onClick={() => insert('quote')} className="bg-blue-600 px-2 rounded">❝Quote</button>
              </div>
            <div className="flex gap-2">
                {/* Preview Toggle */}
                <button onClick={savePost} className="px-3 py-1 bg-green-600 text-white rounded">
                  💾 Save
                </button>
                
                <button onClick={() => setPreviewMode(!previewMode)} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded">
                  {previewMode ? '✏️ Edit Mode' : '👁 Preview'}
                </button>
              </div>
            </div>

            {/* Markdown Textarea */}
            {previewMode ? (
              <div className="prose max-w-none p-4 bg-blue-900 h-[90%] overflow-auto rounded border">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                id="markdown"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[90%] border rounded p-2 font-mono text-sm resize-none"
              />
            )}
          </div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
