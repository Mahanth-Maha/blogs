'use client';

import { useEffect, useState ,useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import ReactMarkdown from 'react-markdown';
import { Dialog } from '@headlessui/react'


function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [frontmatter, setFrontmatter] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const textareaRef = useRef(null);
  const historyRef = useRef([]);
  const [cursor, setCursor] = useState(0);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newPath, setNewPath] = useState("post/my-post");
  const [allFolders, setAllFolders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/folders")
      .then(res => res.json())
      .then(data => setAllFolders(data.folders || []));
  }, []);

  
  useEffect(() => {
    fetch('http://localhost:8000/posts')
    .then(res => res.json())
    .then(data => setPosts(data.posts));
  }, []);
  
  useEffect(() => {
    fetch("http://localhost:8000/meta")
      .then(res => res.json())
      .then(data => {
        setAllCategories(data.categories || []);
        setAllTags(data.tags || []);
      });
  }, []);

  useEffect(() => {
    historyRef.current = [content];
    setCursor(0);
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== textareaRef.current) return;
      const ctrl = e.ctrlKey || e.metaKey;

      // Undo
      if (ctrl && e.key === 'z') {
        e.preventDefault();
        if (cursor > 0) {
          setCursor(cursor - 1);
          setContent(historyRef.current[cursor - 1]);
        }
      }

      // Redo
      if (ctrl && e.key === 'y') {
        e.preventDefault();
        if (cursor < historyRef.current.length - 1) {
          setCursor(cursor + 1);
          setContent(historyRef.current[cursor + 1]);
        }
      }

      // Copy
      if (ctrl && e.key === 'c') {
        // Default behavior: allow native copy
        return;
      }

      // Paste (manual for fallback)
      if (ctrl && e.key === 'v') {
        // Let native handle it
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursor]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const textarea = document.getElementById("markdown");

      if (!textarea) return;

      // Ctrl or Cmd
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z") {
        e.preventDefault();
        document.execCommand("undo");
      }
      if (ctrl && e.key === "c") {
        if (document.activeElement === textarea) return; // default behavior
        e.preventDefault();
        navigator.clipboard.writeText(content);
      }
      if (ctrl && e.key === "v") {
        e.preventDefault();
        navigator.clipboard.readText().then(text => {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const before = content.substring(0, start);
          const after = content.substring(end);
          setContent(before + text + after);
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [content]);

  const savePost = async () => {
    if (!selected) return;

    // Auto-fill metadata on first save
    const fm = { ...frontmatter };

    if (!fm.date) {
      const now = new Date();
      fm.date = now.toISOString().replace("T", " ").split(".")[0] + "+0000";
    }

    if (!fm.slug && fm.title) {
      fm.slug = slugify(fm.title);
    }

    fm.lastMod = new Date().toISOString().replace("T", " ").split(".")[0] + "+0000";

    const normalizedPath = selected.replace(/\\/g, "/");

    await fetch(`http://localhost:8000/posts/${normalizedPath}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, frontmatter: fm }),
    });

    alert("Saved!");
    setFrontmatter(fm); // update state
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
      case 'heading1':
        newText = `# ${selectedText || 'Heading 1'}`;
        break;
      case 'heading2':
        newText = `## ${selectedText || 'Heading 2'}`;
        break;
      case 'heading3':
        newText = `### ${selectedText || 'Heading 3'}`;
        break;
      case 'heading4':
        newText = `#### ${selectedText || 'Heading 4'}`;
        break;
      case 'heading5':
        newText = `##### ${selectedText || 'Heading 5'}`;
        break;
      case 'heading6':
        newText = `###### ${selectedText || 'Heading 6'}`;
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
    setFrontmatter(data.frontmatter || {});
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
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold mb-4">📁 Content Tree</h2>
              <button
                onClick={() => {
                  setNewPath("post/");
                  setCreateModalOpen(true);
                }}
                className="text-sm px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                ➕ New
              </button>
            </div>
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
              <div className="flex gap-2 flex-wrap">
                <button onClick={refreshPost} className="px-3 py-1 bg-blue-600 text-white rounded">🔁 Refresh</button>
                <button
                  onClick={() => {
                    if (cursor > 0) {
                      setCursor(cursor - 1);
                      setContent(historyRef.current[cursor - 1]);
                    }
                  }}
                  className="bg-gray-800 px-2 rounded"
                  title="Undo"
                >
                  🔄 Undo
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(content);
                  }}
                  className="bg-gray-800 px-2 rounded"
                  title="Copy"
                >
                  📋 Copy
                </button>

                <button
                  onClick={async () => {
                    const text = await navigator.clipboard.readText();
                    const textarea = textareaRef.current;
                    if (!textarea) return;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const before = content.substring(0, start);
                    const after = content.substring(end);
                    const newContent = before + text + after;
                    setContent(newContent);
                    textarea.focus();
                  }}
                  className="bg-gray-800 px-2 rounded"
                  title="Paste"
                >
                  📥 Paste
                </button>

                <button onClick={() => insert('bold')} className="bg-blue-600 px-2 rounded">B</button>
                <button onClick={() => insert('italic')} className="bg-blue-600 px-2 rounded"><i>i</i></button>
                <button onClick={() => insert('heading1')} className="bg-gray-900 px-2 rounded">H1</button>
                <button onClick={() => insert('heading2')} className="bg-gray-900 px-2 rounded">H2</button>
                <button onClick={() => insert('heading3')} className="bg-gray-900 px-2 rounded">H3</button>
                {/* <button onClick={() => insert('heading4')} className="bg-gray-900 px-2 rounded">H4</button>
                <button onClick={() => insert('heading5')} className="bg-gray-900 px-2 rounded">H5</button>
                <button onClick={() => insert('heading6')} className="bg-gray-900 px-2 rounded">H6</button> */}
                <button onClick={() => insert('code')} className="bg-blue-600 px-2 rounded">`Code Block`</button>
                <button onClick={() => insert('quote')} className="bg-blue-600 px-2 rounded">❝Quote</button>
              </div>
            <div className="flex gap-2">
                {/* Preview Toggle */}
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="px-3 py-1 bg-gray-800 text-white rounded"
                >
                  ⚙️ Settings
                </button>


                <button onClick={savePost} className="px-3 py-1 bg-green-600 text-white rounded">
                  💾 Save
                </button>

                {/* <button onClick={() => setPreviewMode(!previewMode)} className="ml-auto px-3 py-1 bg-purple-600 text-white rounded">
                  {previewMode ? '✏️ Edit Mode' : '👁 Preview'}
                </button> */}
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
                className="w-full h-[90%] border rounded p-2 font-mono text-sm resize-none"
                onChange={(e) => {
                  setContent(e.target.value);
                  const hist = historyRef.current.slice(0, cursor + 1);
                  hist.push(e.target.value);
                  historyRef.current = hist;
                  setCursor(hist.length - 1);
                }}
              />
            )}
          </div>
        </Panel>
      </PanelGroup>



      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="relative bg-gray-800 p-6 rounded shadow max-w-lg w-full space-y-4">
            <Dialog.Title className="text-lg font-bold">⚙️ Edit Frontmatter</Dialog.Title>
            <button
              onClick={() => setSettingsOpen(false)}
              className="absolute top-2 right-3 text-white text-lg hover:text-red-300"
              aria-label="Close"
            >
              ❌
            </button>

            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                className="w-full border p-1 rounded"
                value={frontmatter.title || ""}
                onChange={e => setFrontmatter({ ...frontmatter, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                className="w-full border p-1 rounded"
                value={frontmatter.description || ""}
                onChange={e => setFrontmatter({ ...frontmatter, description: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={frontmatter.pinned || false}
                  onChange={e => setFrontmatter({ ...frontmatter, pinned: e.target.checked })}
                />
                📌 Pinned
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={frontmatter.math || false}
                  onChange={e => setFrontmatter({ ...frontmatter, math: e.target.checked })}
                />
                🧮 Math
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium">Categories (comma-separated)</label>
              <input
                className="w-full border p-1 rounded"
                value={(frontmatter.categories || []).join(", ")}
                onChange={e =>
                  setFrontmatter({ ...frontmatter, categories: e.target.value.split(",").map(c => c.trim()) })
                }
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1 text-gray-700">Available Categories:</label>
              <div className="flex flex-wrap gap-2 text-sm text-blue-800">
                {allCategories.map((cat, idx) => (
                  <span key={idx} className="bg-blue-100 px-2 py-0.5 rounded">{cat}</span>
                ))}
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium">Tags (comma-separated)</label>
              <input
                className="w-full border p-1 rounded"
                value={(frontmatter.tags || []).join(", ")}
                onChange={e =>
                  setFrontmatter({ ...frontmatter, tags: e.target.value.split(",").map(t => t.trim()) })
                }
              />
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1 mt-4 text-gray-700">Available Tags:</label>
              <div className="flex flex-wrap gap-2 text-sm text-green-800">
                {allTags.map((tag, idx) => (
                  <span key={idx} className="bg-green-100 px-2 py-0.5 rounded">{tag}</span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Date of Creation</label>
              <input
                type="date"
                className="w-full border p-1 rounded"
                value={frontmatter.date || ""}
                onChange={e => setFrontmatter({ ...frontmatter, date: e.target.value })}
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium">Last Edited</label>
              <input
                type="date"
                className="w-full border p-1 rounded"
                value={frontmatter.lastMod || ""}
                onChange={e => setFrontmatter({ ...frontmatter, lastMod: e.target.value })}
              />
            </div> */}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            
              <div className="text-left">
                <button
                  onClick={async () => {
                    const confirm = window.confirm("Are you sure you want to delete this file?");
                    if (!confirm) return;

                    await fetch(`http://localhost:8000/posts/${selected}`, {
                      method: "DELETE",
                    });

                    // Clear everything
                    setSettingsOpen(false);
                    setSelected(null);
                    setContent("");
                    setFrontmatter({});
                    
                    // ✅ Trigger file list refresh
                    fetch("http://localhost:8000/posts")
                      .then(res => res.json())
                      .then(data => setPosts(data.posts));
                  }}
                  className="px-5 py-3 text-black text-white underline hover:text-red-200 rounded-2xl bg-red-900"
                >
                  🗑 Delete This File
                </button>
              </div>
              <div className="text-right">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setSettingsOpen(false)}
              >
                Done
              </button>

            </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>


    <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="relative bg-gray-600 p-6 rounded shadow max-w-md w-full space-y-4 text-white">
          <Dialog.Title className="text-lg font-bold">📄 Create New Markdown File</Dialog.Title>
          <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-2 right-3 text-white text-lg hover:text-red-300"
              aria-label="Close"
            >
              ❌
          </button>
          {/* Folder Selector */}
          <div>
            <label className="text-sm font-medium">Available Folders:</label>
            <ul className="text-sm max-h-40 overflow-y-auto border rounded p-2 bg-gray-100 text-black mt-1">
              {allFolders
                .filter(f => f.startsWith(newPath)) // optional: scope to current path
                .map((folder, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setNewPath(folder + "/")}
                      className="text-blue-600 hover:underline"
                    >
                      📁 {folder}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* Folder Path Input */}
          <div>
            <label className="block text-sm font-medium">Select Folder Path</label>
            <input
              className="w-full border p-1 rounded text-gray-200"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
            />
            <p className="text-sm text-cyan-200 mt-1">`.md` will be auto-added</p>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="w-full border p-1 rounded text-gray-200"
              value={frontmatter.title || ""}
              onChange={(e) => {
                const title = e.target.value;
                setFrontmatter(fm => ({
                  ...fm,
                  title,
                  slug: fm.slug || slugify(title)
                }));
              }}
            />
          </div>

          {/* Create Button */}
          <div className="text-right">
            <button
              disabled={!frontmatter.title?.trim()}
              onClick={async () => {
                const now = new Date();
                const formattedDate = now.toISOString().replace("T", " ").split(".")[0] + "+0000";
                const filename = newPath.trim().replace(/\/$/, "") + "/" + (slugify(frontmatter.title) || "untitled") + ".md";

                const fm = {
                  ...frontmatter,
                  title: frontmatter.title,
                  slug: slugify(frontmatter.title),
                  date: formattedDate,
                  lastMod: formattedDate
                };

                await fetch(`http://localhost:8000/posts/${filename}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ content: "", frontmatter: fm }),
                });

                setCreateModalOpen(false);
                setSelected(filename);
                setFrontmatter(fm);
                setContent(""); // empty content
                setSettingsOpen(false); // we already filled title/date/slug
                await loadPost(filename);
              }}
              className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>

    </main>
  );
}
