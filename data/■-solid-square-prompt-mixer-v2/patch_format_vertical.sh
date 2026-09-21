#!/bin/bash
sed -i '/const items = cleanedText.split(\/[\\n,]+\/).map(s => s.trim()).filter(s => s.length > 0);/c\
      let rawTokens: string[] = [];\
      let currentStart = 0;\
      let inParen = 0;\
      for (let i = 0; i < cleanedText.length; i++) {\
        if (cleanedText[i] === '"'"'('"'"') inParen++;\
        else if (cleanedText[i] === '"'"')'"'"') inParen--;\
        if ((cleanedText[i] === '"'"','"'"' || cleanedText[i] === '"'"'\\n'"'"') && inParen <= 0) {\
          rawTokens.push(cleanedText.substring(currentStart, i));\
          currentStart = i + 1;\
        }\
      }\
      rawTokens.push(cleanedText.substring(currentStart));\
      const items = rawTokens.map(s => s.trim()).filter(s => s.length > 0);' src/components/PreviewColumn.tsx
