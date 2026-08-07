import re

with open("src/App.tsx", "r") as f:
    app = f.read()

target1 = """          await createDataset({
            id: newId,
            name: dsName.toUpperCase(),
            createdAt: Date.now(),
          });
          targetDatasetId = newId;
          setActiveDatasetId(newId);"""
replacement1 = """          const ds = await createDataset(dsName.toUpperCase());
          targetDatasetId = ds.id;
          setActiveDatasetId(ds.id);"""
app = app.replace(target1, replacement1)


target2 = """           await createDataset({
             id: newId,
             name: "NEW DATASET",
             createdAt: Date.now(),
           });
           setActiveDatasetId(newId);
           await loadDatasets();
           await processFiles(e.dataTransfer.files, newId);"""
replacement2 = """           const ds = await createDataset("NEW DATASET");
           setActiveDatasetId(ds.id);
           await loadDatasets();
           await processFiles(e.dataTransfer.files, ds.id);"""
app = app.replace(target2, replacement2)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
