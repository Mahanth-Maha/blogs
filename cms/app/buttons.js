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

// Insert Markdown snippets
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
