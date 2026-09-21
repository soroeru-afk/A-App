#!/bin/bash
sed -i 's/setFindCursorPos(newPos);/const newPos = start + insertedStr.length;\n        setFindCursorPos(newPos);/g' src/App.tsx
sed -i 's/setReplaceCursorPos(newPos);/const newPos = start + insertedStr.length;\n        setReplaceCursorPos(newPos);/g' src/App.tsx
