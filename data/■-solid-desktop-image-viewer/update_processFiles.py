import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Update processFiles signature
old_sig = """  const processFiles = async (
    fileList: FileList | File[],
    datasetId: string,
  ) => {"""
new_sig = """  const processFiles = async (
    fileList: FileList | File[],
    datasetId: string,
    forceLoad: boolean = false
  ) => {"""
app = app.replace(old_sig, new_sig)

# Update loadImages logic inside processFiles
old_load = """        await storeImages(records);
        await loadDatasets();
        if (datasetId === activeDatasetId) {
          await loadImages(datasetId);
        }"""
new_load = """        await storeImages(records);
        await loadDatasets();
        if (datasetId === activeDatasetId || forceLoad) {
          await loadImages(datasetId);
        }"""
app = app.replace(old_load, new_load)

# Update handleFilesDrop usages
old_handle_drop = """      if (targetDatasetId && targetDatasetId !== "all") {
        await processFiles(files, targetDatasetId);
      }
    } else if (e.dataTransfer && e.dataTransfer.files) {
      if (forceNewDataset || !activeDatasetId || activeDatasetId === "all") {
         const ds = await createDataset("NEW DATASET");
         setActiveDatasetId(ds.id);
         await loadDatasets();
         await processFiles(e.dataTransfer.files, ds.id);
      } else {
         await processFiles(e.dataTransfer.files, activeDatasetId);
      }
    }"""
new_handle_drop = """      if (targetDatasetId && targetDatasetId !== "all") {
        await processFiles(files, targetDatasetId, forceNewDataset || !activeDatasetId || activeDatasetId === "all");
      }
    } else if (e.dataTransfer && e.dataTransfer.files) {
      if (forceNewDataset || !activeDatasetId || activeDatasetId === "all") {
         const ds = await createDataset("NEW DATASET");
         setActiveDatasetId(ds.id);
         await loadDatasets();
         await processFiles(e.dataTransfer.files, ds.id, true);
      } else {
         await processFiles(e.dataTransfer.files, activeDatasetId);
      }
    }"""
app = app.replace(old_handle_drop, new_handle_drop)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
