#!/bin/bash
sed -i 's/const newPos = start + insertedStr.length;/const cleaned = cleanString(before + insertedStr + after);\n        const finalPos = (end === safePrev.length) ? cleaned.length : start + insertedStr.length;/g' src/App.tsx
sed -i 's/setNegativeCursorPos(newPos);/setNegativeCursorPos(finalPos);/g' src/App.tsx
sed -i 's/setNegativeSelectionEnd(newPos);/setNegativeSelectionEnd(finalPos);/g' src/App.tsx
sed -i 's/setPositiveCursorPos(newPos);/setPositiveCursorPos(finalPos);/g' src/App.tsx
sed -i 's/setPositiveSelectionEnd(newPos);/setPositiveSelectionEnd(finalPos);/g' src/App.tsx
sed -i 's/return cleanString(before + insertedStr + after);/return cleaned;/g' src/App.tsx
