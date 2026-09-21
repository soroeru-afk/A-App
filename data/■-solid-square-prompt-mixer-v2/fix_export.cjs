const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  const handleExport = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = \\\`\\\${now.getFullYear()}/\\\${pad(now.getMonth() + 1)}/\\\${pad(now.getDate())} \\\${pad(now.getHours())}:\\\${pad(now.getMinutes())}:\\\${pad(now.getSeconds())}\\\`;
    const dateStr = \\\`\\\${now.getFullYear()}\\\${pad(now.getMonth() + 1)}\\\${pad(now.getDate())}_\\\${pad(now.getHours())}\\\${pad(now.getMinutes())}\\\${pad(now.getSeconds())}\\\`;
    
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
      title: "Solid Square Prompt Mixer",
      exportDate: formattedDate,
      ...cleanedData,
      attributeMixerPresets: presetsStr ? JSON.parse(presetsStr) : undefined,
      attributeMixerCombos: combosStr ? JSON.parse(combosStr) : undefined,
      attributeMixerCategories: catsStr ? JSON.parse(catsStr) : undefined,
      uiEditorTabs: localStorage.getItem('ui_editor_tabs') ? JSON.parse(localStorage.getItem('ui_editor_tabs')!) : undefined,
      variationSectionOrder: localStorage.getItem('variation_section_order') ? JSON.parse(localStorage.getItem('variation_section_order')!) : undefined
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    try {
      if (exportDirectoryName) {
        const handle = await getFileHandle('export_directory');
        if (handle) {
          const fileName = \\\`prompt_mixer_\\\${dateStr}.json\\\`;
          const fileHandle = await handle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage(lang === 'en' ? 'Export completed!' : 'エクスポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to save to directory, falling back to download', e);
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \\\`prompt_mixer_\\\${dateStr}.json\\\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };`;

const newExportLogic = `
  const handleExportOverall = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = \\\`\\\${now.getFullYear()}/\\\${pad(now.getMonth() + 1)}/\\\${pad(now.getDate())} \\\${pad(now.getHours())}:\\\${pad(now.getMinutes())}:\\\${pad(now.getSeconds())}\\\`;
    const dateStr = \\\`\\\${now.getFullYear()}\\\${pad(now.getMonth() + 1)}\\\${pad(now.getDate())}_\\\${pad(now.getHours())}\\\${pad(now.getMinutes())}\\\${pad(now.getSeconds())}\\\`;
    
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
    
    try {
      if (exportDirectoryName) {
        const handle = await getFileHandle('export_directory');
        if (handle) {
          const fileName = \\\`全体バックアップ_\\\${dateStr}.json\\\`;
          const fileHandle = await handle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage(lang === 'en' ? 'Overall Export completed!' : '全体エクスポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to save to directory, falling back to download', e);
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \\\`全体バックアップ_\\\${dateStr}.json\\\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportParts = async () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = \\\`\\\${now.getFullYear()}/\\\${pad(now.getMonth() + 1)}/\\\${pad(now.getDate())} \\\${pad(now.getHours())}:\\\${pad(now.getMinutes())}:\\\${pad(now.getSeconds())}\\\`;
    const dateStr = \\\`\\\${now.getFullYear()}\\\${pad(now.getMonth() + 1)}\\\${pad(now.getDate())}_\\\${pad(now.getHours())}\\\${pad(now.getMinutes())}\\\${pad(now.getSeconds())}\\\`;
    
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
    
    try {
      if (exportDirectoryName) {
        const handle = await getFileHandle('export_directory');
        if (handle) {
          const fileName = \\\`パーツ_\\\${dateStr}.json\\\`;
          const fileHandle = await handle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();
          setSaveSuccessMessage(lang === 'en' ? 'Parts Export completed!' : 'パーツのエクスポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to save to directory, falling back to download', e);
    }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \\\`パーツ_\\\${dateStr}.json\\\`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
`;

code = code.replace(/const handleExport = async \(\) => \{[\s\S]*?const url = URL\.createObjectURL\(blob\);\n\s*const a = document\.createElement\('a'\);\n\s*a\.href = url;\n\s*a\.download = \`prompt_mixer_\$\{dateStr\}\.json\`;\n\s*document\.body\.appendChild\(a\);\n\s*a\.click\(\);\n\s*document\.body\.removeChild\(a\);\n\s*\};/, newExportLogic);

fs.writeFileSync('src/App.tsx', code);
