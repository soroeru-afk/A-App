import sys, re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Extract side color
side_color_str = """                    <div>
                      <div className="ss-label mb-1 text-[8px] justify-between">
                        {t("labelSideColor")}{" "}
                        <ResetBtn onClick={() => setColorSide("#808080")} />
                      </div>
                      <div className="flex bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                        <input
                          type="color"
                          value={colorSide}
                          onChange={(e) => setColorSide(e.target.value)}
                          className="w-full h-8 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                    </div>"""

bg_color_str = """                    <div>
                      <div className="ss-label mb-1 text-[8px] justify-between">
                        {t("labelBgColor2")}{" "}
                        <ResetBtn onClick={() => setBgColor("#1A1A1A")} />
                      </div>
                      <div className="flex bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-full h-8 cursor-pointer border-none bg-transparent"
                        />
                      </div>
                    </div>"""

color_grid_start = """                  <div className="grid grid-cols-2 gap-2 mt-3">
"""
# If we remove side and bg, the grid becomes empty, so we might as well remove it or restructure.
# Actually, wait, background color should be moved to be next to AI Mark face/edge.
# Let's remove them from the original location.
if side_color_str in content:
    content = content.replace(side_color_str, '')
if bg_color_str in content:
    content = content.replace(bg_color_str, '')

# We will just replace the empty grid if it becomes empty
content = content.replace('                  <div className="grid grid-cols-2 gap-2 mt-3">\n                                        \n                  </div>\n                  <div className="border-t border-[var(--border-base)] mt-4 pt-3 grid grid-cols-2 gap-x-4 gap-y-3">', '                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-3">')
content = content.replace('                  <div className="grid grid-cols-2 gap-2 mt-3">\n                                        \n                  </div>', '') # fallback

# Now let's inject Side Color to 3D engine tab
# find Extrude Depth section
extrude_depth_section = """                  <input
                    type="range"
                    min="0.1"
                    max="100"
                    step="0.5"
                    value={thickness}
                    onChange={(e) => setThickness(Number(e.target.value))}
                    className="ss-slider"
                  />"""

side_color_for_3d = """
                  <div className="ss-label mb-2 mt-4 text-[10px] flex items-center">
                    <span>{t("labelSideColor")}</span>
                    <span className="ml-auto opacity-70 mr-2">
                      {colorSide}
                    </span>
                    <ResetBtn onClick={() => setColorSide("#808080")} />
                  </div>
                  <div className="flex bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                    <input
                      type="color"
                      value={colorSide}
                      onChange={(e) => setColorSide(e.target.value)}
                      className="w-full h-6 cursor-pointer border-none bg-transparent"
                    />
                  </div>"""

if extrude_depth_section in content:
    content = content.replace(extrude_depth_section, extrude_depth_section + side_color_for_3d)

# Now inject Background Color into AI MARK section
# It's in the Color Settings, at the end of AI MARK
# wait, AI Mark is:
#                     {attachedMark && (
#                       <div className="col-span-2">
#                         <div className="ss-label text-[9px] mb-1 opacity-80">
#                           AI MARK
#                         </div>
#                         ...
#                         </div>
#                       </div>
#                     )}
# If we put background color there, what if attachedMark is false? Background color should still be visible!
# Oh, the user says "AIマークの隣あたりに背景色持っていけばいいんじゃないかな"
# Wait, AI MARK takes col-span-2. So we can make it:
# {attachedMark && ( AI Mark stuff )}
# <div className="col-span-2"> Background color stuff </div>
# But the user specifically said "AIマークの隣あたり" (Next to AI Mark).
# If attachedMark is true, AI Mark takes w-1/2. We can put Background Color in the other w-1/2!
# And if attachedMark is false, we can still render it.

ai_mark_section = """                    {attachedMark && (
                      <div className="col-span-2">
                        <div className="ss-label text-[9px] mb-1 opacity-80">
                          AI MARK
                        </div>
                        <div className="flex gap-2 w-1/2 pr-2">
                          <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                            FACE
                            <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                              <input
                                type="color"
                                value={colorMark}
                                onChange={(e) => setColorMark(e.target.value)}
                                className="w-full h-4 cursor-pointer border-none bg-transparent"
                              />
                            </div>
                          </label>
                          <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                            EDGE
                            <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                              <input
                                type="color"
                                value={outlineMark}
                                onChange={(e) => setOutlineMark(e.target.value)}
                                className="w-full h-4 cursor-pointer border-none bg-transparent"
                              />
                            </div>
                          </label>
                        </div>
                      </div>
                    )}"""

bg_color_next_to_mark = """                    <div className="col-span-2 flex">
                      {attachedMark ? (
                        <div className="w-1/2 pr-2 border-r border-[var(--border-base)]">
                          <div className="ss-label text-[9px] mb-1 opacity-80">
                            AI MARK
                          </div>
                          <div className="flex gap-2">
                            <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                              FACE
                              <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                                <input
                                  type="color"
                                  value={colorMark}
                                  onChange={(e) => setColorMark(e.target.value)}
                                  className="w-full h-4 cursor-pointer border-none bg-transparent"
                                />
                              </div>
                            </label>
                            <label className="flex-1 flex flex-col items-start text-[8px] text-[var(--text-base)]">
                              EDGE
                              <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                                <input
                                  type="color"
                                  value={outlineMark}
                                  onChange={(e) => setOutlineMark(e.target.value)}
                                  className="w-full h-4 cursor-pointer border-none bg-transparent"
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="w-1/2 pr-2 border-r border-[var(--border-base)]"></div>
                      )}
                      <div className="w-1/2 pl-2">
                        <div className="ss-label text-[9px] mb-1 opacity-80 flex justify-between w-full">
                          {t("labelBgColor2")}
                          <ResetBtn onClick={() => setBgColor("#1A1A1A")} />
                        </div>
                        <div className="flex w-full mt-1 bg-[var(--bg-panel)] p-1 rounded-sm border border-[var(--border-base)]">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                            className="w-full h-4 cursor-pointer border-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>"""

if ai_mark_section in content:
    content = content.replace(ai_mark_section, bg_color_next_to_mark)

with open(file_path, 'w') as f:
    f.write(content)

print("Colors moved.")
