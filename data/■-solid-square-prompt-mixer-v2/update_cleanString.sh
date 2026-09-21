#!/bin/bash
sed -i 's/\.replace(\/\^\[\\s,\]+\|\[\\s,\]+\$\/g, '"'"''"'"')/\.replace(\/\^\[\\s,\]+\/g, '"'"''"'"')\.replace(\/\[\\s,\]+\$\/g, '"'"','"'"')/g' src/App.tsx
