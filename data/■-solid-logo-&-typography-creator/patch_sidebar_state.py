import re

file_path = '/app/applet/App.tsx'
with open(file_path, 'r') as f:
    content = f.read()

state_code = """const App: React.FC = () => {
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(288);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(256);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  
  const handleLeftSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = leftSidebarWidth;
    
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(startWidth + (e.clientX - startX), 600));
      setLeftSidebarWidth(newWidth);
    };
    
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = 'default';
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = 'col-resize';
  };
  
  const handleRightSidebarResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightSidebarWidth;
    
    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(200, Math.min(startWidth - (e.clientX - startX), 600));
      setRightSidebarWidth(newWidth);
    };
    
    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = 'default';
    };
    
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = 'col-resize';
  };"""

content = content.replace('const App: React.FC = () => {', state_code)

with open(file_path, 'w') as f:
    f.write(content)

print("State patched")
