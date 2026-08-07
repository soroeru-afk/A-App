with open('/app/applet/App.tsx', 'r') as f:
    content = f.read()

idx = content.find('{activeTab === "mark" && (')
if idx != -1:
    print(content[idx-500:idx])
