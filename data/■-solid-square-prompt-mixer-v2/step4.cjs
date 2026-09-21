const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldRender = `  const renderHighlightedText = (text: string) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper' || theme === 'mono';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    
    const parts = text.split(/(\\([^)]+\\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('(') && part.endsWith(')')) {
        return <span key={i} className={highlightColorClass}>{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };`;

const newRender = `  const renderHighlightedText = (text: string) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper' || theme === 'mono';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    
    // First, split by findText if it exists
    if (findText) {
      const searchRegex = new RegExp(\`(\${escapeRegExp(findText)})\`, 'gi');
      const searchParts = text.split(searchRegex);
      
      return searchParts.map((sPart, j) => {
        if (sPart.toLowerCase() === findText.toLowerCase()) {
          return <span key={\`find-\${j}\`} className="bg-yellow-500/50 text-white rounded-[2px]">{sPart}</span>;
        }
        // Further split by parentheses
        const parts = sPart.split(/(\\([^)]+\\))/g);
        return parts.map((part, i) => {
          if (part.startsWith('(') && part.endsWith(')')) {
            return <span key={\`paren-\${j}-\${i}\`} className={highlightColorClass}>{part}</span>;
          }
          return <span key={\`text-\${j}-\${i}\`}>{part}</span>;
        });
      });
    } else {
      const parts = text.split(/(\\([^)]+\\))/g);
      return parts.map((part, i) => {
        if (part.startsWith('(') && part.endsWith(')')) {
          return <span key={i} className={highlightColorClass}>{part}</span>;
        }
        return <span key={i}>{part}</span>;
      });
    }
  };`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('src/components/PreviewColumn.tsx', code);
