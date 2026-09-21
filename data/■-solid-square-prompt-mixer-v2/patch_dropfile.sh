#!/bin/bash
sed -i 's/setEditorText(prev => prev ? prev + '"'"'\\n'"'"' + metadata.positive : metadata.positive);/setEditorText(prev => cleanString(prev ? prev + '"'"'\\n'"'"' + metadata.positive : metadata.positive));/g' src/components/PreviewColumn.tsx
sed -i 's/setNegativeEditorText(prev => prev ? prev + '"'"'\\n'"'"' + metadata.negative : metadata.negative);/setNegativeEditorText(prev => cleanString(prev ? prev + '"'"'\\n'"'"' + metadata.negative : metadata.negative));/g' src/components/PreviewColumn.tsx

sed -i 's/setNegativeEditorText(prev => prev ? prev + '"'"'\\n'"'"' + content : content);/setNegativeEditorText(prev => cleanString(prev ? prev + '"'"'\\n'"'"' + content : content));/g' src/components/PreviewColumn.tsx
sed -i 's/setEditorText(prev => prev ? prev + '"'"'\\n'"'"' + content : content);/setEditorText(prev => cleanString(prev ? prev + '"'"'\\n'"'"' + content : content));/g' src/components/PreviewColumn.tsx
