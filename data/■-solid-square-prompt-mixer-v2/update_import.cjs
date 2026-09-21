const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `        if (parsed.masters && parsed.parts) {
          // 直接上書き (Overwrite completely)
          setData(parsed);
          
          if (parsed.attributeMixerCategories) {
            localStorage.setItem('attribute_mixer_categories_v2', typeof parsed.attributeMixerCategories === 'string' ? parsed.attributeMixerCategories : JSON.stringify(parsed.attributeMixerCategories));
          }
          if (parsed.attributeMixerPresets) {
            localStorage.setItem('attribute_mixer_custom_presets_v7', typeof parsed.attributeMixerPresets === 'string' ? parsed.attributeMixerPresets : JSON.stringify(parsed.attributeMixerPresets));
          }
          if (parsed.attributeMixerCombos) {
            localStorage.setItem('attribute_mixer_combinations_v1', typeof parsed.attributeMixerCombos === 'string' ? parsed.attributeMixerCombos : JSON.stringify(parsed.attributeMixerCombos));
          }
          
          window.dispatchEvent(new Event('attributeMixerDataImported'));
          setSelectedMasterId(parsed.masters[0]?.id || null);
          setSaveSuccessMessage(lang === 'en' ? 'Overall Import completed!' : '全体のインポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        } else {`;

const newCode = `        if (parsed.masters && parsed.parts) {
          setData(prev => {
            const hasExistingParts = prev.parts && prev.parts.length > 0;
            const hasExistingCategories = prev.customCategories && prev.customCategories.length > 0;
            const hasExistingSectionNames = prev.customSectionNames && Object.keys(prev.customSectionNames).length > 0;
            
            return {
              ...parsed,
              // パーツデータが既に存在する場合は上書きせず保護する
              parts: hasExistingParts ? prev.parts : parsed.parts,
              customCategories: hasExistingCategories ? prev.customCategories : (parsed.customCategories || []),
              customSectionNames: hasExistingSectionNames ? prev.customSectionNames : (parsed.customSectionNames || {}),
            };
          });
          
          // ミキサーのデータも、既存データがある場合は上書きせず保護する
          const existingCategories = localStorage.getItem('attribute_mixer_categories_v2');
          if ((!existingCategories || existingCategories === '[]') && parsed.attributeMixerCategories) {
            localStorage.setItem('attribute_mixer_categories_v2', typeof parsed.attributeMixerCategories === 'string' ? parsed.attributeMixerCategories : JSON.stringify(parsed.attributeMixerCategories));
          }
          
          const existingPresets = localStorage.getItem('attribute_mixer_custom_presets_v7');
          if ((!existingPresets || existingPresets === '[]') && parsed.attributeMixerPresets) {
            localStorage.setItem('attribute_mixer_custom_presets_v7', typeof parsed.attributeMixerPresets === 'string' ? parsed.attributeMixerPresets : JSON.stringify(parsed.attributeMixerPresets));
          }
          
          const existingCombos = localStorage.getItem('attribute_mixer_combinations_v1');
          if ((!existingCombos || existingCombos === '[]') && parsed.attributeMixerCombos) {
            localStorage.setItem('attribute_mixer_combinations_v1', typeof parsed.attributeMixerCombos === 'string' ? parsed.attributeMixerCombos : JSON.stringify(parsed.attributeMixerCombos));
          }
          
          window.dispatchEvent(new Event('attributeMixerDataImported'));
          setSelectedMasterId(parsed.masters[0]?.id || null);
          setSaveSuccessMessage(lang === 'en' ? 'Overall Import completed!' : '全体のインポートが完了しました！');
          setTimeout(() => setSaveSuccessMessage(null), 3000);
        } else {`;

code = code.replace(target, newCode);

fs.writeFileSync('src/App.tsx', code);
