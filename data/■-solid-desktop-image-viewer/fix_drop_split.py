import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Add state for dragTarget
target_state = '  const [isDragging, setIsDragging] = useState(false);'
replacement_state = '''  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<"add" | "new" | null>(null);'''
app = app.replace(target_state, replacement_state)

# 2. Add handleFilesDrop function before setup global drag & drop
target_drop_setup = '  // Setup Global Drag & Drop on the window'
replacement_drop_setup = '''  const handleFilesDrop = async (e: React.DragEvent | DragEvent, forceNewDataset: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragTarget(null);
    // reset global counter by simulating drag end
    
    if (e.dataTransfer && e.dataTransfer.items) {
      setIsReadingDirectory(true);
      const { files, folderNames } = await getFilesFromDataTransferItems(e.dataTransfer.items as any);
      setIsReadingDirectory(false);
      
      if (files.length === 0) return;
      
      let targetDatasetId = activeDatasetId;
      
      if (forceNewDataset || !targetDatasetId || targetDatasetId === "all") {
        const dsName = folderNames.length > 0 ? folderNames[0] : "NEW DATASET";
        const ds = await createDataset(dsName.toUpperCase());
        targetDatasetId = ds.id;
        setActiveDatasetId(ds.id);
        await loadDatasets();
      }
      
      if (targetDatasetId && targetDatasetId !== "all") {
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
    }
  };

  // Setup Global Drag & Drop on the window'''
app = app.replace(target_drop_setup, replacement_drop_setup)

# 3. Replace global onDrop
old_global_ondrop = """    const onDrop = async (e: DragEvent) => {
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
          const ds = await createDataset(dsName.toUpperCase());
          targetDatasetId = ds.id;
          setActiveDatasetId(ds.id);
          await loadDatasets();
        }
        
        if (targetDatasetId && targetDatasetId !== "all") {
          await processFiles(files, targetDatasetId);
        }
      } else if (e.dataTransfer && e.dataTransfer.files) {
        if (!activeDatasetId || activeDatasetId === "all") {
           const newId = Date.now().toString();
           const ds = await createDataset("NEW DATASET");
           setActiveDatasetId(ds.id);
           await loadDatasets();
           await processFiles(e.dataTransfer.files, ds.id);
        } else {
           await processFiles(e.dataTransfer.files, activeDatasetId);
        }
      }
    };"""

new_global_ondrop = """    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      setDragTarget(null);
    };"""
app = app.replace(old_global_ondrop, new_global_ondrop)

# 4. Replace Drag Overlay UI
old_overlay = """      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-root-bg/80 backdrop-blur-sm border-2 border-dashed border-accent m-4 flex flex-col items-center justify-center font-mono pointer-events-none"
          >
            <FolderOpen size={64} className="text-accent mb-4" />
            <h2 className="text-2xl text-text-primary tracking-widest mb-2">
              DROP FILES HERE
            </h2>
            <p className="text-text-secondary">
              {!activeDatasetId || activeDatasetId === "all" ? "CREATING NEW DATASET" : "ADDING TO ACTIVE DATASET"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>"""

new_overlay = """      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-root-bg/90 backdrop-blur-sm m-4 flex gap-4 font-mono pointer-events-auto"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              setDragTarget(null);
            }}
          >
            {/* ADD TO ACTIVE DATASET AREA */}
            <div
              className={cn(
                "flex-1 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300",
                dragTarget === "add" ? "border-accent bg-accent/10" : "border-panel-border bg-panel-bg/30 text-text-muted hover:border-text-muted"
              )}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("add"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("add"); e.dataTransfer.dropEffect = "copy"; }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget(null); }}
              onDrop={(e) => {
                 e.preventDefault(); e.stopPropagation();
                 // manually call the drop handler
                 handleFilesDrop(e, false);
                 
                 // need to manually reset the global counter by dispatching a fake dragleave to window, or just setting state
                 setIsDragging(false); 
                 setDragTarget(null);
              }}
            >
              <FolderPlus size={64} className={dragTarget === "add" ? "text-accent mb-4" : "mb-4"} />
              <h2 className={cn("text-2xl tracking-widest mb-2", dragTarget === "add" ? "text-text-primary" : "")}>
                ADD TO ACTIVE
              </h2>
              <p className="text-sm">Add files to the currently selected dataset</p>
            </div>

            {/* CREATE NEW DATASET AREA */}
            <div
              className={cn(
                "flex-1 border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300",
                dragTarget === "new" ? "border-accent bg-accent/10" : "border-panel-border bg-panel-bg/30 text-text-muted hover:border-text-muted"
              )}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("new"); }}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget("new"); e.dataTransfer.dropEffect = "copy"; }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragTarget(null); }}
              onDrop={(e) => {
                 e.preventDefault(); e.stopPropagation();
                 handleFilesDrop(e, true);
                 setIsDragging(false); 
                 setDragTarget(null);
              }}
            >
              <FolderOpen size={64} className={dragTarget === "new" ? "text-accent mb-4" : "mb-4"} />
              <h2 className={cn("text-2xl tracking-widest mb-2", dragTarget === "new" ? "text-text-primary" : "")}>
                CREATE NEW
              </h2>
              <p className="text-sm">Import as a new dataset</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>"""
app = app.replace(old_overlay, new_overlay)

# Since FolderPlus might not be imported, let's add it to lucide-react imports
if "FolderPlus" not in app:
    app = app.replace("FolderOpen,", "FolderOpen, FolderPlus,")

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
