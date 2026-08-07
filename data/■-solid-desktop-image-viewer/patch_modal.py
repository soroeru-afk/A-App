import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Add confirmOverwrite function
func_marker = "  const confirmDeleteDataset = async () => {"

new_func = """  const confirmOverwrite = async () => {
    if (!overwriteFiles) return;
    setIsLoading(true);
    const data = overwriteFiles;
    setOverwriteFiles(null);
    try {
      const { files, datasetId, forceLoad, existingMap } = data;
      
      const oldIds: string[] = [];
      const newRecords: ImageRecord[] = [];

      await Promise.all(files.map(async (f) => {
        const oldImg = existingMap.get(f.name);
        if (oldImg) {
          oldIds.push(oldImg.id);
        }
        
        const autoBg = await analyzeImageBlob(f);
        newRecords.push({
          id: `${datasetId}-${f.name}-${f.lastModified}-${f.size}`,
          datasetId,
          name: f.name,
          type: f.type,
          size: f.size,
          lastModified: f.lastModified,
          addedAt: oldImg?.addedAt || Date.now(),
          orderIndex: oldImg?.orderIndex,
          data: f,
          autoBg,
        });
      }));

      for (const oldId of oldIds) {
        await deleteImage(oldId);
      }

      await storeImages(newRecords);
      await loadDatasets();
      if (datasetId === activeDatasetId || forceLoad) {
        await loadImages(datasetId);
      }

      showNotification(
        language === "JP"
          ? `${files.length} 件のファイルを更新しました`
          : `Updated ${files.length} file(s)`
      );

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDataset = async () => {"""

app = app.replace(func_marker, new_func)

# Add Modal JSX
modal_marker = """      {/* Delete Dataset Modal */}"""

new_modal = """      {/* Overwrite Confirmation Modal */}
      <AnimatePresence>
        {overwriteFiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-root-bg/80 flex items-center justify-center p-8 backdrop-blur-sm"
          >
            <div className="bg-panel-bg border border-orange-500/50 p-6 font-mono w-[400px] shadow-[0_0_30px_rgba(249,115,22,0.2)]">
              <h2 className="text-orange-500 mb-4 uppercase">
                {t("UPDATE EXISTING FILES", "既存のファイルを更新")}
              </h2>
              <p className="text-text-primary text-xs mb-6 leading-relaxed">
                {t(
                  `${overwriteFiles.files.length} file(s) already exist. Do you want to overwrite and update them?`,
                  `同じ名前の画像が ${overwriteFiles.files.length} 件あります。これらを新しい画像で上書き更新しますか？`
                )}
              </p>
              <div className="flex justify-end gap-3">
                <SolidButton
                  onClick={() => setOverwriteFiles(null)}
                  className="bg-transparent border-transparent text-text-secondary hover:text-text-primary shadow-none"
                >
                  {t("CANCEL", "キャンセル")}
                </SolidButton>
                <SolidButton
                  onClick={confirmOverwrite}
                  className="text-orange-500 hover:text-orange-400 border-orange-900/50"
                >
                  {t("UPDATE", "更新する")}
                </SolidButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Dataset Modal */}"""

app = app.replace(modal_marker, new_modal)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("modal added")
