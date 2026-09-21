const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

const oldAppStr = `            positiveCursorPos={positiveCursorPos}
            negativeCursorPos={negativeCursorPos}
            setPositiveCursorPos={setPositiveCursorPos}
            setNegativeCursorPos={setNegativeCursorPos}
            setPositiveSelectionEnd={setPositiveSelectionEnd}
            setNegativeSelectionEnd={setNegativeSelectionEnd}`;

const newAppStr = `            positiveCursorPos={positiveCursorPos}
            negativeCursorPos={negativeCursorPos}
            positiveSelectionEnd={positiveSelectionEnd}
            negativeSelectionEnd={negativeSelectionEnd}
            setPositiveCursorPos={setPositiveCursorPos}
            setNegativeCursorPos={setNegativeCursorPos}
            setPositiveSelectionEnd={setPositiveSelectionEnd}
            setNegativeSelectionEnd={setNegativeSelectionEnd}`;

appCode = appCode.replace(oldAppStr, newAppStr);
fs.writeFileSync('src/App.tsx', appCode);

let previewCode = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

const oldPreviewType = `  positiveCursorPos: number | null;
  negativeCursorPos: number | null;
  setPositiveCursorPos: (pos: number) => void;
  setNegativeCursorPos: (pos: number) => void;`;

const newPreviewType = `  positiveCursorPos: number | null;
  negativeCursorPos: number | null;
  positiveSelectionEnd?: number | null;
  negativeSelectionEnd?: number | null;
  setPositiveCursorPos: (pos: number) => void;
  setNegativeCursorPos: (pos: number) => void;`;

previewCode = previewCode.replace(oldPreviewType, newPreviewType);

const oldPreviewProps = `  activeEditor, setActiveEditor, findText, setFindText, replaceText, setReplaceText, findCursorPos, setFindCursorPos, replaceCursorPos, setReplaceCursorPos, findSelectionEnd, setFindSelectionEnd, replaceSelectionEnd, setReplaceSelectionEnd, positiveCursorPos, negativeCursorPos, setPositiveCursorPos, setNegativeCursorPos, setPositiveSelectionEnd, setNegativeSelectionEnd,`;

const newPreviewProps = `  activeEditor, setActiveEditor, findText, setFindText, replaceText, setReplaceText, findCursorPos, setFindCursorPos, replaceCursorPos, setReplaceCursorPos, findSelectionEnd, setFindSelectionEnd, replaceSelectionEnd, setReplaceSelectionEnd, positiveCursorPos, negativeCursorPos, positiveSelectionEnd, negativeSelectionEnd, setPositiveCursorPos, setNegativeCursorPos, setPositiveSelectionEnd, setNegativeSelectionEnd,`;

previewCode = previewCode.replace(oldPreviewProps, newPreviewProps);

fs.writeFileSync('src/components/PreviewColumn.tsx', previewCode);

