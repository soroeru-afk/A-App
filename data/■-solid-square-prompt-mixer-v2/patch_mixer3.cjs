const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

const regexRenderCategory = /const currentIdx = selections\[key\] \?\? 0;[\s\S]*?(return \([\s\S]*?)<select[\s\S]*?<\/select>\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\};/m;

const replacement = `const currentSelection = selections[key];
    const currentIndices = Array.isArray(currentSelection) ? currentSelection : (currentSelection !== undefined ? [currentSelection] : [0]);
    const isSelected = currentIndices.length > 0 && !(currentIndices.length === 1 && currentIndices[0] === 0);
    const isEditing = editModes[key] || false;
    const isRenaming = editingCatName === key;

    $1
            <div className="relative flex-1 min-w-0" ref={activeDropdown === key ? dropdownRef : undefined}>
              <div 
                className={\`flex-1 min-w-0 bg-bg-input border \${isSelected ? 'border-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.1)]' : 'border-border-main'} rounded px-2 py-1.5 text-[13px] text-text-main truncate transition-colors cursor-pointer flex justify-between items-center\`}
                onClick={() => setActiveDropdown(activeDropdown === key ? null : key)}
              >
                <span className="truncate">
                  {currentIndices.length === 0 || (currentIndices.length === 1 && currentIndices[0] === 0) 
                    ? items[0].label 
                    : currentIndices.filter(idx => idx !== 0).map(idx => items[idx]?.label).join(', ')}
                </span>
                <ChevronDown className="w-4 h-4 ml-2 shrink-0 text-text-dim" />
              </div>
              
              {activeDropdown === key && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-panel border border-border-main rounded shadow-lg max-h-60 overflow-y-auto">
                  {items.map((o, idx) => {
                    const checked = currentIndices.includes(idx);
                    return (
                      <label key={idx} className="flex items-center gap-2 px-3 py-2 hover:bg-bg-input cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelections(prev => {
                              let newSel = Array.isArray(prev[key]) ? [...prev[key]] : (prev[key] !== undefined ? [prev[key] as number] : [0]);
                              if (idx === 0) {
                                 return { ...prev, [key]: [0] };
                              } else {
                                 newSel = newSel.filter(i => i !== 0);
                                 if (checked) {
                                   newSel = newSel.filter(i => i !== idx);
                                   if (newSel.length === 0) newSel = [0];
                                 } else {
                                   newSel = [...newSel, idx];
                                 }
                                 return { ...prev, [key]: newSel };
                              }
                            });
                          }}
                          className="rounded bg-bg-surface border-border-main text-blue-500 focus:ring-blue-500/50 cursor-pointer w-4 h-4"
                        />
                        <span className="text-[13px] text-text-main truncate">{o.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };`;

content = content.replace(regexRenderCategory, replacement);

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
