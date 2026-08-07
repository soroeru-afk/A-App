import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# 1. renderImageCard の motion.div に id を追加
old_render = """  const renderImageCard = (
    img: LoadedImage,
    i: number,
    isSelected: boolean,
    isMultiSelected: boolean,
  ) => (
    <motion.div
      key={img.id}"""
new_render = """  const renderImageCard = (
    img: LoadedImage,
    i: number,
    isSelected: boolean,
    isMultiSelected: boolean,
  ) => (
    <motion.div
      id={`image-card-${img.id}`}
      key={img.id}"""
app = app.replace(old_render, new_render)

with open("src/App.tsx", "w") as f:
    f.write(app)
print("done")
