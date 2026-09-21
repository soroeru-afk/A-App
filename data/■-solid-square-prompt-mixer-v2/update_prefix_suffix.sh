#!/bin/bash
# Replaces prefix and suffix checks to ignore spaces and properly append commas.
# For prefix: if before.length > 0 and before doesn't end with a comma (ignoring trailing whitespace) -> add comma.
# For suffix: if after.length > 0 and after doesn't start with a comma (ignoring leading whitespace) -> add comma.
sed -i 's/const prefix = autoOptimize && before.length > 0 && !before.endsWith('"'"', '"'"') && !before.endsWith('"'"','"'"') && !before.endsWith('"'"' '"'"') && !before.endsWith('"'"'\\n'"'"') ? '"'"', '"'"' : '"'"''"'"';/const prefix = autoOptimize \&\& before.length > 0 \&\& !before.match(\/,\\s*$\/) \&\& !before.endsWith('"'"'\\n'"'"') ? '"'"', '"'"' : '"'"''"'"';/g' src/App.tsx

sed -i 's/const suffix = autoOptimize && after.length > 0 && !after.startsWith('"'"','"'"') && !after.startsWith('"'"' '"'"') && !after.startsWith('"'"'\\n'"'"') ? '"'"', '"'"' : '"'"''"'"';/const suffix = autoOptimize \&\& after.length > 0 \&\& !after.match(\/^\\s*,\/) \&\& !after.startsWith('"'"'\\n'"'"') ? '"'"', '"'"' : '"'"''"'"';/g' src/App.tsx
