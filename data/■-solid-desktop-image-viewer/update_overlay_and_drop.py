import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. Update global onDrop
old_global_ondrop = """    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      setDragTarget(null);
    };"""

new_global_ondrop = """    const onDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter = 0;
      setIsDragging(false);
      setDragTarget(null);
      await handleFilesDrop(e, false);
    };"""
app = app.replace(old_global_ondrop, new_global_ondrop)

# 2. Add full screen overlay back
overlay_insert_target = """      {/* Notification Toast */}"""

new_overlay = """      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-root-bg/80 backdrop-blur-sm border-2 border-dashed border-accent m-4 flex flex-col items-center justify-center font-mono pointer-events-none"
          >
            <FolderPlus size={64} className="text-accent mb-4" />
            <h2 className="text-2xl text-text-primary tracking-widest mb-2">
              {t("DROP TO ADD TO ACTIVE", "ドロップして現在のリストに追加")}
            </h2>
            <p className="text-text-secondary">
              {t("OR DRAG TO 'CREATE BY FOLDER' IN SIDEBAR", "新規リストとして作成する場合はサイドバーへ")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}"""
app = app.replace(overlay_insert_target, new_overlay)

# 3. Update the text in the small drop zone from "CREATE NEW" to "CREATE BY FOLDER"
old_create_new = '{t("CREATE", "新しいリストを")}<br/>{t("NEW", "作成")}'
new_create_by_folder = '{t("CREATE BY", "フォルダー名で")}<br/>{t("FOLDER", "リストを作成")}'
app = app.replace(old_create_new, new_create_by_folder)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
