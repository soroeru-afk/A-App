#!/bin/bash

# VariationColumn.tsx
sed -i '/onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(part.content); setCopiedPartId(part.id); setTimeout(() => setCopiedPartId(null), 2000); }}/,/<\/button>/d' src/components/VariationColumn.tsx

# MasterColumn.tsx
sed -i '/onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(item.content); setCopiedItemId(item.id); setTimeout(() => setCopiedItemId(null), 2000); }}/,/<\/button>/d' src/components/MasterColumn.tsx

# MemoColumn.tsx
sed -i '/onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(item.content); setCopiedItemId(item.id); setTimeout(() => setCopiedItemId(null), 2000); }}/,/<\/button>/d' src/components/MemoColumn.tsx

