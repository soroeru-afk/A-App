const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const expandButtonRegex = /      <div className="flex justify-end px-4 pt-2 shrink-0">\s*<button\s*onClick=\{\(\) => \{\s*const isAllExpanded = categories\.length > 0 && categories\.every\(c => editModes\[c\.id\]\);\s*if \(isAllExpanded\) \{\s*setEditModes\(\{\}\);\s*\} else \{\s*const next = \{\};\s*categories\.forEach\(c => next\[c\.id\] = true\);\s*setEditModes\(next\);\s*\}\s*\}\}\s*className="px-2 py-1 bg-bg-surface hover:bg-bg-input border border-border-main rounded text-\[11px\] font-bold flex items-center gap-1 transition-colors text-text-main shadow-sm"\s*>\s*\{categories\.length > 0 && categories\.every\(c => editModes\[c\.id\]\) \? <ChevronsUp className="w-3\.5 h-3\.5" \/> : <ChevronsDown className="w-3\.5 h-3\.5" \/>\}\s*\{categories\.length > 0 && categories\.every\(c => editModes\[c\.id\]\) \? t\('collapse_all', lang\) : t\('expand_all', lang\)\}\s*<\/button>\s*<\/div>/;

const expandButtonReplacement = `      <div className="flex justify-between items-center px-4 pt-2 shrink-0 border-t border-border-main mt-2">
        <div className="flex gap-2">
          <button 
            onClick={handleReset}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-400 text-white rounded text-[11px] font-mono font-bold transition-colors shadow-sm"
          >
            {t('reset', lang) || "リセット"}
          </button>
          <button 
            onClick={handleApply}
            className={\`px-3 py-1 \${theme === 'mono' ? 'bg-black hover:bg-gray-800' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded text-[11px] font-mono font-bold transition-colors flex items-center gap-1 shadow-sm\`}
          >
            <Check className="w-3.5 h-3.5" /> {t('apply', lang) || "適用する"}
          </button>
        </div>
        <button
          onClick={() => {
            const isAllExpanded = categories.length > 0 && categories.every(c => editModes[c.id]);
            if (isAllExpanded) {
              setEditModes({});
            } else {
              const next = {};
              categories.forEach(c => next[c.id] = true);
              setEditModes(next);
            }
          }}
          className="px-2 py-1 bg-bg-surface hover:bg-bg-input border border-border-main rounded text-[11px] font-bold flex items-center gap-1 transition-colors text-text-main shadow-sm"
        >
          {categories.length > 0 && categories.every(c => editModes[c.id]) ? <ChevronsUp className="w-3.5 h-3.5" /> : <ChevronsDown className="w-3.5 h-3.5" />}
          {categories.length > 0 && categories.every(c => editModes[c.id]) ? t('collapse_all', lang) : t('expand_all', lang)}
        </button>
      </div>`;

content = content.replace(expandButtonRegex, expandButtonReplacement);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
