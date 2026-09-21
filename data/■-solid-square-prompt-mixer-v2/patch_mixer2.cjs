const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');

// replace the single select dropdown with a multi-select custom dropdown
// First, add a state for activeDropdown
if (!content.includes('const [activeDropdown')) {
  content = content.replace(
    /const \[confirmDeleteCatId, setConfirmDeleteCatId\] = useState<string \| null>\(null\);/,
    'const [activeDropdown, setActiveDropdown] = useState<string | null>(null);\n  const dropdownRef = useRef<HTMLDivElement>(null);\n  useEffect(() => { const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) { setActiveDropdown(null); } }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);\n  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);'
  );
}

// Ensure useRef is imported
if (!content.includes('useRef')) {
  content = content.replace(/import React, { useState, useEffect } from 'react';/, "import React, { useState, useEffect, useRef } from 'react';");
}

fs.writeFileSync('src/components/AttributeMixer.tsx', content);
