#!/bin/bash
sed -i 's/const finalPos = (end === safePrev.length) ? cleaned.length : start + insertedStr.length;/const finalPos = (typeof safePrev !== '"'"'undefined'"'"' ? end === safePrev.length : end === result.length) ? cleaned.length : start + insertedStr.length;/g' src/App.tsx
