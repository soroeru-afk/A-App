import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We need to replace the initializations:
# const [sidebarOrder, setSidebarOrder] = useState([{ id: "formation" }, { id: "datasets" }, { id: "trackInfo" }]);
# const [isFormationExpanded, setIsFormationExpanded] = useState(true);
# const [isDataSetsExpanded, setIsDataSetsExpanded] = useState(true);
# const [isTrackInfoCollapsed, setIsTrackInfoCollapsed] = useState(true);

# Replacement definitions:
new_states = """  const [sidebarOrder, setSidebarOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarOrder");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [{ id: "formation" }, { id: "datasets" }, { id: "trackInfo" }];
  });
  const [isFormationExpanded, setIsFormationExpanded] = useState(() => {
    const saved = localStorage.getItem("isFormationExpanded");
    return saved ? saved === "true" : true;
  });
  const [isDataSetsExpanded, setIsDataSetsExpanded] = useState(() => {
    const saved = localStorage.getItem("isDataSetsExpanded");
    return saved ? saved === "true" : true;
  });
  const [isTrackInfoCollapsed, setIsTrackInfoCollapsed] = useState(() => {
    const saved = localStorage.getItem("isTrackInfoCollapsed");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOrder", JSON.stringify(sidebarOrder));
  }, [sidebarOrder]);
  useEffect(() => {
    localStorage.setItem("isFormationExpanded", String(isFormationExpanded));
  }, [isFormationExpanded]);
  useEffect(() => {
    localStorage.setItem("isDataSetsExpanded", String(isDataSetsExpanded));
  }, [isDataSetsExpanded]);
  useEffect(() => {
    localStorage.setItem("isTrackInfoCollapsed", String(isTrackInfoCollapsed));
  }, [isTrackInfoCollapsed]);"""

content = re.sub(r'const \[isTrackInfoCollapsed, setIsTrackInfoCollapsed\] = useState\(true\);\n', '', content)

old_states = """  const [sidebarOrder, setSidebarOrder] = useState([{ id: "formation" }, { id: "datasets" }, { id: "trackInfo" }]);
  const [isFormationExpanded, setIsFormationExpanded] = useState(true);
  const [isDataSetsExpanded, setIsDataSetsExpanded] = useState(true);"""

content = content.replace(old_states, new_states)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
