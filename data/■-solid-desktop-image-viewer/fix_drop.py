import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add getFilesFromDataTransferItems outside or inside component
# Actually, better to define it outside App component to avoid clutter, or inside to use state?
# It doesn't use state, so outside is fine. Let's find a good place.
# Let's just put it before `export default function App() {`
helper_code = """
const getFilesFromDataTransferItems = async (items: DataTransferItemList) => {
  const files: File[] = [];
  const queue: any[] = [];
  const folderNames = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        queue.push(entry);
        if (entry.isDirectory) {
          folderNames.add(entry.name);
        }
      } else {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
  }
  
  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => entry.file(resolve));
      files.push(file);
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries = await new Promise<any[]>((resolve) => {
        dirReader.readEntries(resolve);
      });
      queue.push(...entries);
    }
  }
  
  return { files, folderNames: Array.from(folderNames) };
};
"""

app = app.replace("export default function App() {", helper_code + "\nexport default function App() {")


# 2. Update the useEffect for Drag & Drop
# Target:
old_use_effect = """  // Setup Global Drag & Drop on the window
  useEffect(() => {
    if (!activeDatasetId || activeDatasetId === "all") return;

    let dragCounter = 0;"""

new_use_effect = """  // Setup Global Drag & Drop on the window
  useEffect(() => {
    let dragCounter = 0;"""

app = app.replace(old_use_effect, new_use_effect)

# Update onDrop
old_ondrop = """    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      if (e.dataTransfer && e.dataTransfer.files) {
        await processFiles(e.dataTransfer.files, activeDatasetId);
      }
    };"""

new_ondrop = """    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      
      if (e.dataTransfer && e.dataTransfer.items) {
        setIsReadingDirectory(true);
        const { files, folderNames } = await getFilesFromDataTransferItems(e.dataTransfer.items);
        setIsReadingDirectory(false);
        
        if (files.length === 0) return;
        
        let targetDatasetId = activeDatasetId;
        
        if (!targetDatasetId || targetDatasetId === "all") {
          const dsName = folderNames.length > 0 ? folderNames[0] : "NEW DATASET";
          const newId = Date.now().toString();
          await createDataset({
            id: newId,
            name: dsName.toUpperCase(),
            createdAt: Date.now(),
          });
          targetDatasetId = newId;
          setActiveDatasetId(newId);
          await loadDatasets();
        }
        
        if (targetDatasetId && targetDatasetId !== "all") {
          await processFiles(files, targetDatasetId);
        }
      } else if (e.dataTransfer && e.dataTransfer.files) {
        if (!activeDatasetId || activeDatasetId === "all") {
           const newId = Date.now().toString();
           await createDataset({
             id: newId,
             name: "NEW DATASET",
             createdAt: Date.now(),
           });
           setActiveDatasetId(newId);
           await loadDatasets();
           await processFiles(e.dataTransfer.files, newId);
        } else {
           await processFiles(e.dataTransfer.files, activeDatasetId);
        }
      }
    };"""

app = app.replace(old_ondrop, new_ondrop)

# 3. Update Drag overlay condition
old_overlay = """      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && activeDatasetId && ("""

new_overlay = """      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && ("""

app = app.replace(old_overlay, new_overlay)

old_overlay_text = """            <p className="text-text-secondary">ADDING TO ACTIVE DATASET</p>"""
new_overlay_text = """            <p className="text-text-secondary">
              {!activeDatasetId || activeDatasetId === "all" ? "CREATING NEW DATASET" : "ADDING TO ACTIVE DATASET"}
            </p>"""
app = app.replace(old_overlay_text, new_overlay_text)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("done")
