import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Add states
state_target = '  const [showDeleteFullscreenModal, setShowDeleteFullscreenModal] = useState(false);'
state_replacement = '''  const [showDeleteFullscreenModal, setShowDeleteFullscreenModal] = useState(false);
  const [showDeleteDatasetModal, setShowDeleteDatasetModal] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<string | null>(null);'''
app = app.replace(state_target, state_replacement)

# Replace function
func_target = '''  const handleDeleteDataset = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this dataset?")) return;
    await deleteDataset(id);
    await loadDatasets();
  };'''

func_replacement = '''  const handleDeleteDataset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDatasetToDelete(id);
    setShowDeleteDatasetModal(true);
  };

  const confirmDeleteDataset = async () => {
    if (!datasetToDelete) return;
    setIsLoading(true);
    await deleteDataset(datasetToDelete);
    if (activeDatasetId === datasetToDelete) {
      setActiveDatasetId(null);
    }
    await loadDatasets();
    setShowDeleteDatasetModal(false);
    setDatasetToDelete(null);
    setIsLoading(false);
  };'''

app = app.replace(func_target, func_replacement)

# Add modal JSX
modal_target = '''      {/* Delete Selected Modal */}
      <AnimatePresence>'''

modal_replacement = '''      {/* Delete Dataset Modal */}
      <AnimatePresence>
        {showDeleteDatasetModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-root-bg/80 flex items-center justify-center p-8 backdrop-blur-sm"
          >
            <div className="bg-panel-bg border border-red-500/50 p-6 font-mono w-[400px] shadow-[0_0_30px_rgba(239,68,68,0.2)]">
              <h2 className="text-red-500 mb-4 uppercase">
                DELETE DATASET
              </h2>
              <p className="text-text-primary text-xs mb-6">
                Are you sure you want to delete this dataset? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <SolidButton
                  onClick={() => {
                    setShowDeleteDatasetModal(false);
                    setDatasetToDelete(null);
                  }}
                  className="bg-transparent border-transparent text-text-secondary hover:text-text-primary shadow-none"
                >
                  CANCEL
                </SolidButton>
                <SolidButton
                  onClick={confirmDeleteDataset}
                  className="text-red-500 hover:text-red-400 border-red-900/50"
                >
                  DELETE DATASET
                </SolidButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Selected Modal */}
      <AnimatePresence>'''

app = app.replace(modal_target, modal_replacement)

with open("src/App.tsx", "w") as f:
    f.write(app)

print("done")
