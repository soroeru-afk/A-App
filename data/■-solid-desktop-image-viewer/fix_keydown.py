import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_keydown = """  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      const getDragBounds = () => {"""

new_keydown = """  useEffect(() => {
    // 選択画像が変わったらスクロール (isFullscreen時も裏側でスクロールされて良い)
    if (selectedImage && !isFullscreen) {
      const el = document.getElementById(`image-card-${selectedImage.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [selectedImage, isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 共通ショートカット
      const key = e.key;
      const code = e.code;
      
      // input などの入力中は除外
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (key === "f" || key === "F") {
        e.preventDefault();
        toggleAppFullscreen();
        return;
      }
      if (key === "p" || key === "P" || key === "r" || key === "R") {
        e.preventDefault();
        if (portraitMode === "off") setPortraitMode("left");
        else if (portraitMode === "left") setPortraitMode("right");
        else setPortraitMode("off");
        return;
      }

      if (!isFullscreen) {
        // 一覧画面での操作
        if (key === "ArrowRight") {
          e.preventDefault();
          goToNextImage();
        } else if (key === "ArrowLeft") {
          e.preventDefault();
          goToPrevImage();
        } else if (key === "Enter") {
          e.preventDefault();
          if (selectedImage) {
            setIsFullscreen(true);
          }
        }
        return;
      }

      // フルスクリーン時
      if (key === "Escape" || key === "Backspace") {
        e.preventDefault();
        setIsFullscreen(false);
        return;
      }

      const getDragBounds = () => {"""

app = app.replace(old_keydown, new_keydown)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
