import re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'className="ss-slider mb-2"' in line and 'newOrn[idx].dash = Number' in lines[i-3]:
        # we found the end of the dash slider input
        insert_idx = i + 3 # down past closing tags
        # double check context
        if '                              </div>' in lines[insert_idx-1]:
            lines.insert(insert_idx, """
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <div className="ss-label mb-2 text-[9px] flex items-center">
                                    <span>{t("labelOrnamentRotation")}</span>
                                    <span className="ml-auto opacity-70 mr-1">
                                      {ornament.rotation}°
                                    </span>
                                    <ResetBtn
                                      onClick={() => {
                                        const newOrn = [...ornaments];
                                        newOrn[idx].rotation = 0;
                                        setOrnaments(newOrn);
                                      }}
                                    />
                                  </div>

                                  <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    step="1"
                                    value={ornament.rotation}
                                    onChange={(e) => {
                                      const newOrn = [...ornaments];
                                      newOrn[idx].rotation = Number(e.target.value);
                                      setOrnaments(newOrn);
                                    }}
                                    className="ss-slider mb-2"
                                  />
                                </div>
                                <div className="flex-1"></div>
                              </div>
""")
            break

with open(file_path, 'w') as f:
    f.writelines(lines)

print("Rotation UI inserted cleanly")
