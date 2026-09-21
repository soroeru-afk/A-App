#!/bin/bash
sed -i 's/\.replace(\/\^\[\\s,\]+\|\[\\s,\]+\$\/g, '"'"''"'"')/\.replace(\/\^\[\\s,\]+\/g, '"'"''"'"')/g' src/components/PreviewColumn.tsx

# Wait, we need to apply the exact same fix as we did in App.tsx
