const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const replaceCurrent = () => {
    if (!findInput) return;
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editorText.slice(start, end);
    
    if (selected === findInput) {
      const newText = editorText.slice(0, start) + replaceInput + editorText.slice(end);
      setEditorText(newText);
      findCursor = start + replaceInput.length;
      setStatusText("ONE MATCH REPLACED");
      return;
    }

    findNext();
  };`;

const replacement = `  const replaceCurrent = () => {
    if (!findInput) return;
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = editorText.slice(start, end);
    
    if (selected === findInput) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(start, end);
      document.execCommand('insertText', false, replaceInput);
      findCursor = start + replaceInput.length;
      setStatusText("ONE MATCH REPLACED");
      return;
    }

    findNext();
  };`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Patched replaceCurrent");
} else {
    console.log("target not found");
}
