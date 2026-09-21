#!/bin/bash
sed -i 's/const finalPos = (typeof safePrev !== '"'"'undefined'"'"' ? end === safePrev.length : end === result.length) ? cleaned.length : start + insertedStr.length;/const finalPos = (end === result.length) ? cleaned.length : start + insertedStr.length;/g' src/App.tsx

# Then restore the correct ones where safePrev actually exists
sed -i 's/const finalPos = (end === result.length) ? cleaned.length : start + insertedStr.length;/const finalPos = (end === safePrev.length) ? cleaned.length : start + insertedStr.length;/g' src/App.tsx
# Now fix the 4 lines in handleApplyMasterList back to result
sed -i '747s/safePrev/result/' src/App.tsx
sed -i '759s/safePrev/result/' src/App.tsx
sed -i '796s/safePrev/result/' src/App.tsx
sed -i '807s/safePrev/result/' src/App.tsx
