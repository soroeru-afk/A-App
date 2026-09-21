const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// Find the start and end of renderHighlightedText
const startString = "const renderHighlightedText = (text: string, isNegative: boolean) => {";
const endString = "  const charCount = (editorText?.length || 0) + (negativeEditorText?.length || 0);";

const startIndex = code.indexOf(startString);
const endIndex = code.indexOf(endString);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries.");
  process.exit(1);
}

const newRender = `const renderHighlightedText = (text: string, isNegative: boolean) => {
    const isLight = paperMode || (theme === 'light' || theme === 'mono') || theme === 'paper';
    const highlightColorClass = isLight ? 'text-[#059669] drop-shadow-sm' : 'text-[#34d399] drop-shadow-sm';
    const highlightBgClass = isLight ? 'bg-[#059669]' : 'bg-[#34d399]';

    let currentGlobalIndex = 0;

    const parenParts = text.split(/(\\([^)]+\\))/g);

    return parenParts.map((parenPart, i) => {
      const isParen = parenPart.startsWith('(') && parenPart.endsWith(')');
      const baseClass = isParen ? highlightColorClass : '';

      if (appliedFindText) {
        const searchRegex = new RegExp(\`(\\\${escapeRegExp(appliedFindText)})\`, 'gi');
        const searchParts = parenPart.split(searchRegex);

        return searchParts.map((sPart, j) => {
          const partStartIndex = currentGlobalIndex;
          currentGlobalIndex += sPart.length;

          if (sPart.toLowerCase() === appliedFindText.toLowerCase()) {
            const cursorPos = isNegative ? negativeCursorPos : positiveCursorPos;
            const isActiveEditor = activeEditor === (isNegative ? 'negative' : 'positive');
            const isMatchActive = searchSelectionActive && isActiveEditor && cursorPos !== null && partStartIndex === cursorPos;

            if (isMatchActive) {
              const activeStyle = isParen
                ? \`\${highlightBgClass} text-white\`
                : \`bg-blue-600 text-white\`;

              return (
                <span key={\`find-\${i}-\${j}\`} className={\`\${activeStyle} rounded-[2px] z-10 relative\`}>
                  {sPart}
                </span>
              );
            } else {
              return (
                <span key={\`find-\${i}-\${j}\`} className={\`bg-amber-500/40 rounded-[2px] \${baseClass}\`}>
                  {sPart}
                </span>
              );
            }
          }

          return <span key={\`text-\${i}-\${j}\`} className={baseClass}>{sPart}</span>;
        });
      }

      currentGlobalIndex += parenPart.length;
      return <span key={\`text-\${i}\`} className={baseClass}>{parenPart}</span>;
    });
  };

`;

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

fs.writeFileSync('src/components/PreviewColumn.tsx', before + newRender + after);
console.log("Success");
