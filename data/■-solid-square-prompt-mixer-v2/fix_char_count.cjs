const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const target = `  };

  return (
    <>`;

const replacement = `  };

  const charCount = (editorText?.length || 0) + (negativeEditorText?.length || 0);
  const MAX_CHARS = 4096;

  return (
    <>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
