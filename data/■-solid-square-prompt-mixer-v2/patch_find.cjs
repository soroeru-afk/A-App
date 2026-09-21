const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const prevCode = `
  const handleFindPrev = () => {
    if (!findText) return;

    const searchFromPos = (text: string, pos: number, ref: React.RefObject<HTMLTextAreaElement>, setActive: () => void, setCursor: (p: number) => void, setSelectionEnd: (p: number) => void) => {
      const lowerText = text.toLowerCase();
      const lowerFind = findText.toLowerCase();
      
      let searchPos = Math.max(0, pos - findText.length - 1);
      let index = lowerText.lastIndexOf(lowerFind, searchPos);
      if (index === -1) {
        // Wrap around
        index = lowerText.lastIndexOf(lowerFind);
      }
      
      if (index !== -1) {
        setActive();
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(index, index + findText.length);
          // Browsers usually scroll to selection automatically, but just in case:
          const textBefore = text.substring(0, index);
          const newLines = (textBefore.match(/\\n/g) || []).length;
          const lineHeight = parseInt(getComputedStyle(ref.current).lineHeight) || 20;
          ref.current.scrollTop = newLines * lineHeight;
        }
        setCursor(index);
        setSelectionEnd(index + findText.length);
        return true;
      }
      return false;
    };

    const isNegativeFocused = activeEditor === 'negative';
    
    if (isNegativeFocused) {
       const foundInNeg = searchFromPos(
         negativeEditorText,
         negativeSelectionEnd !== null && negativeSelectionEnd !== undefined ? negativeSelectionEnd : (negativeCursorPos || 0),
         negativeTextRef,
         () => setActiveEditor('negative'),
         setNegativeCursorPos,
         setNegativeSelectionEnd!
       );
       if (!foundInNeg) {
         searchFromPos(editorText, editorText.length, positiveTextRef, () => setActiveEditor('positive'), setPositiveCursorPos, setPositiveSelectionEnd!);
       }
    } else {
       const foundInPos = searchFromPos(
         editorText,
         positiveSelectionEnd !== null && positiveSelectionEnd !== undefined ? positiveSelectionEnd : (positiveCursorPos || 0),
         positiveTextRef,
         () => setActiveEditor('positive'),
         setPositiveCursorPos,
         setPositiveSelectionEnd!
       );
       if (!foundInPos) {
         searchFromPos(negativeEditorText, negativeEditorText.length, negativeTextRef, () => setActiveEditor('negative'), setNegativeCursorPos, setNegativeSelectionEnd!);
       }
    }
  };
`;

code = code.replace(/  const handleReplace = \(\) => {/, prevCode + '\n  const handleReplace = () => {');

const buttonCode = `
          <button 
            onClick={handleFindPrev}
            className={\`px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors\`}
          >
            {lang === 'en' ? 'Prev' : '前へ'}
          </button>
          <button 
            onClick={handleFindNext}
            className={\`px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded text-text-dim transition-colors\`}
          >
            {lang === 'en' ? 'Next' : '次へ'}
          </button>
`;

code = code.replace(
/          <button [\s\S]*?onClick={handleFindNext}[\s\S]*?className={`px-3 py-1\.5[^>]*>[\s\S]*?<\/button>/,
buttonCode.trim()
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
