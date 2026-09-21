const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('  const handleExport = async () => {');
const endIndex = code.indexOf('  const handleImportOverall = (e: React.ChangeEvent<HTMLInputElement>) => {');

if (startIndex !== -1 && endIndex !== -1) {
  const newExportLogic = `
  const handleExportOverall = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = \`\${now.getFullYear()}/\${pad(now.getMonth() + 1)}/\${pad(now.getDate())} \${pad(now.getHours())}:\${pad(now.getMinutes())}:\${pad(now.getSeconds())}\`;
    const dateStr = \`\${now.getFullYear()}\${pad(now.getMonth() + 1)}\${pad(now.getDate())}_\${pad(now.getHours())}\${pad(now.getMinutes())}\${pad(now.getSeconds())}\`;
    
    // Sanitize data before export
    const cleanedData = {
      ...data,
      masters: data.masters.map(m => ({ ...m, content: cleanString(m.content) })),
      negatives: data.negatives?.map(n => ({ ...n, content: cleanString(n.content) })),
      parts: data.parts.map(p => ({ ...p, content: cleanString(p.content) }))
    };

    const presetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    const combosStr = localStorage.getItem('attribute_mixer_combinations_v1') || localStorage.getItem('attribute_mixer_combinations');
    const catsStr = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
    
    const exportData = {
      title: "Solid Square Prompt Mixer (Overall)",
      exportDate: formattedDate,
      ...cleanedData,
      attributeMixerPresets: presetsStr ? JSON.parse(presetsStr) : undefined,
      attributeMixerCombos: combosStr ? JSON.parse(combosStr) : undefined,
      attributeMixerCategories: catsStr ? JSON.parse(catsStr) : undefined,
      uiEditorTabs: localStorage.getItem('ui_editor_tabs') ? JSON.parse(localStorage.getItem('ui_editor_tabs')!) : undefined,
      variationSectionOrder: localStorage.getItem('variation_section_order') ? JSON.parse(localStorage.getItem('variation_section_order')!) : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const fallbackDownload = () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`全体バックアップ_\${dateStr}.json\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if ('showSaveFilePicker' in window && window.self === window.top) {
      try {
        let dirHandle = await getFileHandle('export_directory');
        let fileHandle = null;
        let hasDirPermission = false;
        
        if (dirHandle) {
          const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            hasDirPermission = true;
          } else {
            const request = await dirHandle.requestPermission({ mode: 'readwrite' });
            if (request === 'granted') {
              hasDirPermission = true;
            }
          }
        }
        
        if (hasDirPermission && dirHandle) {
           fileHandle = await dirHandle.getFileHandle(\`全体バックアップ_\${dateStr}.json\`, { create: true });
        } else {
           fileHandle = await (window as any).showSaveFilePicker({
             id: 'prompt_mixer_export',
             suggestedName: \`全体バックアップ_\${dateStr}.json\`,
             types: [{
               description: 'JSON Files',
               accept: { 'application/json': ['.json'] },
             }],
           });
        }
        
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage('全体エクスポート完了！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('File System API Error:', err);
          fallbackDownload();
          setSaveSuccessMessage('全体エクスポート完了！ (Downloaded)');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      }
    } else {
      fallbackDownload();
      setSaveSuccessMessage('全体エクスポート完了！ (Downloaded)');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleExportParts = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = \`\${now.getFullYear()}/\${pad(now.getMonth() + 1)}/\${pad(now.getDate())} \${pad(now.getHours())}:\${pad(now.getMinutes())}:\${pad(now.getSeconds())}\`;
    const dateStr = \`\${now.getFullYear()}\${pad(now.getMonth() + 1)}\${pad(now.getDate())}_\${pad(now.getHours())}\${pad(now.getMinutes())}\${pad(now.getSeconds())}\`;
    
    const presetsStr = localStorage.getItem('attribute_mixer_custom_presets_v7') || localStorage.getItem('attribute_mixer_custom_presets_v6') || localStorage.getItem('attribute_mixer_custom_presets_v5') || localStorage.getItem('attribute_mixer_custom_presets_v4') || localStorage.getItem('attribute_mixer_custom_presets_v3') || localStorage.getItem('attribute_mixer_custom_presets_v2') || localStorage.getItem('attribute_mixer_custom_presets_v1') || localStorage.getItem('attribute_mixer_custom_presets');
    const combosStr = localStorage.getItem('attribute_mixer_combinations_v1') || localStorage.getItem('attribute_mixer_combinations');
    const catsStr = localStorage.getItem('attribute_mixer_categories_v2') || localStorage.getItem('attribute_mixer_categories_v1') || localStorage.getItem('attribute_mixer_categories');
    
    const exportData = {
      title: "Solid Square Prompt Mixer (Parts Only)",
      exportDate: formattedDate,
      parts: data.parts.map(p => ({ ...p, content: cleanString(p.content) })),
      customCategories: data.customCategories,
      attributeMixerPresets: presetsStr ? JSON.parse(presetsStr) : undefined,
      attributeMixerCombos: combosStr ? JSON.parse(combosStr) : undefined,
      attributeMixerCategories: catsStr ? JSON.parse(catsStr) : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    
    const fallbackDownload = () => {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = \`パーツ_\${dateStr}.json\`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    if ('showSaveFilePicker' in window && window.self === window.top) {
      try {
        let dirHandle = await getFileHandle('export_directory');
        let fileHandle = null;
        let hasDirPermission = false;
        
        if (dirHandle) {
          const permission = await dirHandle.queryPermission({ mode: 'readwrite' });
          if (permission === 'granted') {
            hasDirPermission = true;
          } else {
            const request = await dirHandle.requestPermission({ mode: 'readwrite' });
            if (request === 'granted') {
              hasDirPermission = true;
            }
          }
        }
        
        if (hasDirPermission && dirHandle) {
           fileHandle = await dirHandle.getFileHandle(\`パーツ_\${dateStr}.json\`, { create: true });
        } else {
           fileHandle = await (window as any).showSaveFilePicker({
             id: 'prompt_mixer_export_parts',
             suggestedName: \`パーツ_\${dateStr}.json\`,
             types: [{
               description: 'JSON Files',
               accept: { 'application/json': ['.json'] },
             }],
           });
        }
        
        if (fileHandle) {
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage('パーツエクスポート完了！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('File System API Error:', err);
          fallbackDownload();
          setSaveSuccessMessage('パーツエクスポート完了！ (Downloaded)');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        }
      }
    } else {
      fallbackDownload();
      setSaveSuccessMessage('パーツエクスポート完了！ (Downloaded)');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

`;

  code = code.substring(0, startIndex) + newExportLogic + code.substring(endIndex);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Export functions updated successfully.");
} else {
  console.log("Could not find start or end index.");
}
