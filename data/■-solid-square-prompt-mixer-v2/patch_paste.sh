#!/bin/bash
sed -i 's/const newText = currentText.slice(0, start) + content + currentText.slice(end);/const rawNewText = currentText.slice(0, start) + content + currentText.slice(end);\n      const newText = cleanString(rawNewText);/g' src/components/PreviewColumn.tsx
