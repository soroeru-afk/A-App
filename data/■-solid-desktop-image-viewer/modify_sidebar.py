import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Extract formation panel content
formation_start = content.find('<Panel\n            title={t("01 FORMATION ENGINE"')
formation_end = content.find('</Panel>', formation_start) + len('</Panel>')
formation_html = content[formation_start:formation_end]
# Remove the <Panel ...> and </Panel> tags to get the children
formation_inner_start = formation_html.find('>') + 1
formation_inner = formation_html[formation_inner_start:-8].strip()

# Extract datasets panel content
datasets_start = content.find('<Panel\n            title={t("02 DATA SETS"')
datasets_end = content.find('</Panel>', datasets_start) + len('</Panel>')
datasets_html = content[datasets_start:datasets_end]
datasets_inner_start = datasets_html.find('contentClassName="flex flex-col p-4 overflow-hidden gap-3 h-full"\n          >') + len('contentClassName="flex flex-col p-4 overflow-hidden gap-3 h-full"\n          >')
datasets_inner = datasets_html[datasets_inner_start:-8].strip()

# Extract track info panel content
trackinfo_start = content.find('<Panel\n            title={t("03 TRACK INFO"')
trackinfo_end = content.find('</Panel>', trackinfo_start) + len('</Panel>')
trackinfo_html = content[trackinfo_start:trackinfo_end]
# The track info children start after the opening tag which includes headerRight
trackinfo_inner_start = trackinfo_html.find('          >\n            {selectedImage') + len('          >\n')
trackinfo_inner = trackinfo_html[trackinfo_inner_start:-8].strip()

new_sidebar = f"""<ReactSortable
            list={{sidebarOrder}}
            setList={{setSidebarOrder}}
            animation={{200}}
            handle=".sidebar-drag-handle"
            className="flex flex-col gap-4 h-full"
          >
            {{sidebarOrder.map((section) => {{
              if (section.id === "formation") {{
                return (
                  <Panel
                    key="formation"
                    title={{t("01 FORMATION ENGINE", "01 フォーム設定")}}
                    className="shrink-0"
                    isCollapsible
                    isExpanded={{isFormationExpanded}}
                    onToggle={{() => setIsFormationExpanded(!isFormationExpanded)}}
                    dragHandle
                  >
                    {formation_inner}
                  </Panel>
                );
              }} else if (section.id === "datasets") {{
                return (
                  <Panel
                    key="datasets"
                    title={{t("02 DATA SETS", "02 データセット")}}
                    className={{cn("shrink-0 flex flex-col", isDataSetsExpanded && "flex-1 min-h-[200px]")}}
                    contentClassName="flex flex-col p-4 overflow-hidden gap-3 h-full"
                    isCollapsible
                    isExpanded={{isDataSetsExpanded}}
                    onToggle={{() => setIsDataSetsExpanded(!isDataSetsExpanded)}}
                    dragHandle
                  >
                    {datasets_inner}
                  </Panel>
                );
              }} else if (section.id === "trackInfo") {{
                return (
                  <Panel
                    key="trackInfo"
                    title={{t("03 TRACK INFO", "03 トラック情報")}}
                    className={{cn(
                      "shrink-0 flex flex-col items-center min-w-0 w-full transition-all duration-300",
                      isTrackInfoCollapsed ? "h-[37px]" : "h-[260px]",
                    )}}
                    contentClassName={{cn(
                      "flex flex-col w-full min-w-0 transition-opacity duration-300",
                      isTrackInfoCollapsed
                        ? "opacity-0 p-0 pointer-events-none hidden"
                        : "opacity-100 p-4",
                    )}}
                    isCollapsible
                    isExpanded={{!isTrackInfoCollapsed}}
                    onToggle={{() => setIsTrackInfoCollapsed(!isTrackInfoCollapsed)}}
                    dragHandle
                  >
                    {trackinfo_inner}
                  </Panel>
                );
              }}
              return null;
            }})}}
          </ReactSortable>"""

# Replace the three panels with the new_sidebar
old_sidebar_full = content[formation_start:trackinfo_end]
content = content.replace(old_sidebar_full, new_sidebar)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done replacing sidebar")
