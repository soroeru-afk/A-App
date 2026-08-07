import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Add overwriteFiles state
state_old = """  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);"""
state_new = """  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);
  const [overwriteFiles, setOverwriteFiles] = useState<{ files: File[], datasetId: string, forceLoad: boolean, existingMap: Map<string, ImageRecord> } | null>(null);"""
app = app.replace(state_old, state_new)

# Update processFiles
process_old = """    try {
      const existingImages = await getImagesByDataset(datasetId);
      const existingNames = new Set(existingImages.map((img) => img.name));

      const newFiles: File[] = [];
      let skippedCount = 0;

      for (const f of files) {
        if (existingNames.has(f.name)) {
          skippedCount++;
        } else {
          newFiles.push(f);
        }
      }

      if (newFiles.length > 0) {
        // Compute autoBg asynchronously for each file
        const records = await Promise.all(
          newFiles.map(async (f) => {
            const autoBg = await analyzeImageBlob(f);
            return {
              id: `${datasetId}-${f.name}-${f.lastModified}-${f.size}`,
              datasetId,
              name: f.name,
              type: f.type,
              size: f.size,
              lastModified: f.lastModified,
              addedAt: Date.now(),
              data: f,
              autoBg,
            };
          })
        );

        await storeImages(records);
        await loadDatasets();
        if (datasetId === activeDatasetId || forceLoad) {
          await loadImages(datasetId);
        }
      }

      if (skippedCount > 0) {
        showNotification(
          language === "JP"
            ? `${skippedCount} 件のファイルは既に存在するためスキップしました`
            : `Skipped ${skippedCount} file(s) that already exist`
        );
      }
    } catch (e) {"""

process_new = """    try {
      const existingImages = await getImagesByDataset(datasetId);
      const existingMap = new Map<string, ImageRecord>(existingImages.map((img) => [img.name, img]));

      const newFiles: File[] = [];
      const duplicateFiles: File[] = [];

      for (const f of files) {
        if (existingMap.has(f.name)) {
          duplicateFiles.push(f);
        } else {
          newFiles.push(f);
        }
      }

      if (newFiles.length > 0) {
        // Compute autoBg asynchronously for each file
        const records = await Promise.all(
          newFiles.map(async (f) => {
            const autoBg = await analyzeImageBlob(f);
            return {
              id: `${datasetId}-${f.name}-${f.lastModified}-${f.size}`,
              datasetId,
              name: f.name,
              type: f.type,
              size: f.size,
              lastModified: f.lastModified,
              addedAt: Date.now(),
              data: f,
              autoBg,
            };
          })
        );

        await storeImages(records);
        await loadDatasets();
        if (datasetId === activeDatasetId || forceLoad) {
          await loadImages(datasetId);
        }
      }

      if (duplicateFiles.length > 0) {
        setOverwriteFiles({ files: duplicateFiles, datasetId, forceLoad, existingMap });
      }
    } catch (e) {"""

app = app.replace(process_old, process_new)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
