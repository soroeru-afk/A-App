const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const findNextFn = `  const handleFindNext = () => {
    if (!findText) return;

    const searchFromPos = (text: string, pos: number, ref: React.RefObject<HTMLTextAreaElement>, setActive: () => void, setCursor: (p: number) => void, setSelectionEnd: (p: number) => void) => {
      const lowerText = text.toLowerCase();
      const lowerFind = findText.toLowerCase();
      let index = lowerText.indexOf(lowerFind, pos);
      if (index === -1) {
        // Wrap around
        index = lowerText.indexOf(lowerFind, 0);
      }
      if (index !== -1) {
        setActive();
        if (ref.current) {
          ref.current.focus();
          ref.current.setSelectionRange(index, index + findText.length);
          // Browsers usually scroll to selection automatically, but just in case:
          const textBefore = text.substring(0, index);
          const newLines = (textBefore.match(/\\n/g) || []).length;
          // Approximate scrolling
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
         searchFromPos(editorText, 0, positiveTextRef, () => setActiveEditor('positive'), setPositiveCursorPos, setPositiveSelectionEnd!);
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
         searchFromPos(negativeEditorText, 0, negativeTextRef, () => setActiveEditor('negative'), setNegativeCursorPos, setNegativeSelectionEnd!);
       }
    }
  };

`;

code = code.replace('  const handleReplace = () => {', findNextFn + '  const handleReplace = () => {');

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
