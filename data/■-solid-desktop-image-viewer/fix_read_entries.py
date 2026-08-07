import re

with open("src/App.tsx", "r") as f:
    app = f.read()

old_read_entries = """  while (queue.length > 0) {
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
  }"""

new_read_entries = """  while (queue.length > 0) {
    const entry = queue.shift();
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => entry.file(resolve));
      files.push(file);
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      let allEntries: any[] = [];
      
      const readAll = async () => {
        return new Promise<any[]>((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            if (entries.length > 0) {
              allEntries.push(...entries);
              await readAll();
            }
            resolve(allEntries);
          });
        });
      };
      
      await readAll();
      queue.push(...allEntries);
    }
  }"""

if old_read_entries in app:
    app = app.replace(old_read_entries, new_read_entries)
    print("Replaced read entries successfully.")
else:
    print("Could not find read entries block.")

with open("src/App.tsx", "w") as f:
    f.write(app)
