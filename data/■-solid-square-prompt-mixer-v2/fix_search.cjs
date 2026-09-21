const fs = require('fs');
let code = fs.readFileSync('src/components/PreviewColumn.tsx', 'utf8');

// 1. Add Search to lucide-react imports
code = code.replace(
  "import { Trash2, ChevronDown, Save, PlusSquare, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, ArrowDown, ArrowUp, Copy, Plus, X, List, ArrowRightLeft } from 'lucide-react';",
  "import { Trash2, ChevronDown, Save, PlusSquare, Undo2, Redo2, ChevronLeft, ChevronRight, RotateCcw, ArrowDown, ArrowUp, Copy, Plus, X, List, ArrowRightLeft, Search } from 'lucide-react';"
);

// 2. Add appliedFindText state
code = code.replace(
  "const [searchSelectionActive, setSearchSelectionActive] = useState(false);",
  "const [searchSelectionActive, setSearchSelectionActive] = useState(false);\n  const [appliedFindText, setAppliedFindText] = useState('');"
);

// 3. Update onChange to clear appliedFindText if findText is empty
code = code.replace(
  "setFindText(e.target.value);",
  "setFindText(e.target.value);\n                if (e.target.value === '') setAppliedFindText('');"
);

// Also in onDrop
code = code.replace(
  "setFindText(text);",
  "setFindText(text);\n                  if (text === '') setAppliedFindText('');"
);

// 4. Update handleFindNext and handleFindPrev to update appliedFindText
code = code.replace(
  "const handleFindNext = () => {\n    if (!findText) return;\n",
  "const handleFindNext = () => {\n    if (!findText) return;\n    setAppliedFindText(findText);\n"
);
code = code.replace(
  "const handleFindPrev = () => {\n    if (!findText) return;\n",
  "const handleFindPrev = () => {\n    if (!findText) return;\n    setAppliedFindText(findText);\n"
);

// 5. Update renderHighlightedText to use appliedFindText instead of findText
code = code.replace(
  "if (findText) {",
  "if (appliedFindText) {"
);
code = code.replace(
  "const searchRegex = new RegExp(`(${escapeRegExp(findText)})`, 'gi');",
  "const searchRegex = new RegExp(`(${escapeRegExp(appliedFindText)})`, 'gi');"
);
code = code.replace(
  "if (sPart.toLowerCase() === findText.toLowerCase()) {",
  "if (sPart.toLowerCase() === appliedFindText.toLowerCase()) {"
);

// 6. Add Search button next to Prev/Next buttons
const searchButtonHtml = `            <div className="flex -space-x-px">
              <button 
                onClick={() => setAppliedFindText(findText)}
                className={\`shrink-0 flex items-center justify-center px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] border border-border-hover rounded-l text-text-dim transition-colors\`}
                title={lang === 'en' ? 'Search' : '検索'}
              >
                <Search className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleFindPrev}
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover text-text-dim transition-colors\`}
                title="Shift+Enter"
              >
                {lang === 'en' ? 'Prev' : '前へ'}
              </button>
              <button 
                onClick={handleFindNext}
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-r text-text-dim transition-colors\`}
                title="Enter"
              >
                {lang === 'en' ? 'Next' : '次へ'}
              </button>
            </div>`;

code = code.replace(
  `            <div className="flex -space-x-px">
              <button 
                onClick={handleFindPrev}
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-l text-text-dim transition-colors\`}
                title="Shift+Enter"
              >
                {lang === 'en' ? 'Prev' : '前へ'}
              </button>
              <button 
                onClick={handleFindNext}
                className={\`shrink-0 whitespace-nowrap px-2 py-1.5 \${theme === 'mono' ? 'bg-bg-surface hover:bg-gray-500 hover:text-white' : 'bg-bg-surface hover:bg-border-main'} text-[10px] font-mono border border-border-hover rounded-r text-text-dim transition-colors\`}
                title="Enter"
              >
                {lang === 'en' ? 'Next' : '次へ'}
              </button>
            </div>`,
  searchButtonHtml
);

fs.writeFileSync('src/components/PreviewColumn.tsx', code);
