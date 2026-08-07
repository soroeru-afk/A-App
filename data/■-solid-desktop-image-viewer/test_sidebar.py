import re

with open("src/App.tsx", "r") as f:
    app = f.read()

# Add states for sidebar width
insertion = """  const [sidebarOrder, setSidebarOrder] = useState(() => {"""
new_states = """  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("app_sidebarWidth");
    return saved ? Math.max(300, parseInt(saved, 10)) : 300;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  
  useEffect(() => {
    localStorage.setItem("app_sidebarWidth", sidebarWidth.toString());
  }, [sidebarWidth]);

  const sidebarOrder"""

print(insertion in app)
