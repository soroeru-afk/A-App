const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const brokenModal = /<ImportModal\s+isOpen=\{showImportModal\}\s+onImport=\{handleImport\}\s+onClose=\{\(\) => setShowImportModal\(false\)\}\s+lang=\{lang\}\s+\/>/;

const correctModal = \`        <ImportModal
          isOpen={importPendingData !== null}
          onMerge={() => { executeImport(true); setImportPendingData(null); }}
          onOverwrite={() => { executeImport(false); setImportPendingData(null); }}
          onCancel={() => setImportPendingData(null)}
          lang={lang}
        />\`;

code = code.replace(brokenModal, correctModal);
fs.writeFileSync('src/App.tsx', code, 'utf8');
console.log('Fixed ImportModal');
