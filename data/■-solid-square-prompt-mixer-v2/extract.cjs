const fs = require('fs');

async function extract() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('http://localhost:3000/src/components/AttributeMixer.tsx');
  const text = await res.text();
  
  const mapUrlMatch = text.match(/sourceMappingURL=data:application\/json;base64,(.*)$/);
  if (mapUrlMatch) {
    const base64 = mapUrlMatch[1];
    const mapStr = Buffer.from(base64, 'base64').toString('utf8');
    const mapObj = JSON.parse(mapStr);
    
    // sourcesContent に元のソースがある
    const sourceContent = mapObj.sourcesContent[0];
    fs.writeFileSync('src/components/AttributeMixer.tsx.recovered', sourceContent);
    console.log('Recovered successfully! length:', sourceContent.length);
  } else {
    console.log('No source map found');
  }
}
extract();
