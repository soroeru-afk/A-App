const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `    window.dispatchEvent(new CustomEvent('PARTS_COPIED', { detail: { added, skipped } }));
  }, [data.parts, data.customCategories]);`;

const replacementStr = `    window.dispatchEvent(new CustomEvent('PARTS_COPIED', { detail: { added, skipped } }));
    showToast(lang === 'en' ? 'Copied to Parts' : 'パーツへコピーしました');
  }, [data.parts, data.customCategories, showToast, lang]);`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('Fixed handleCopyToParts toast');
