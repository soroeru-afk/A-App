const fs = require('fs');
let content = fs.readFileSync('src/components/AttributeMixer.tsx', 'utf8');
content = content.replace(
  "import React, { useState, useEffect } from 'react';", 
  "import React, { useState, useEffect, useRef } from 'react';"
);
fs.writeFileSync('src/components/AttributeMixer.tsx', content);
