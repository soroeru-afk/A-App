const lines = [
  "これはテストです。",
  "1girl, solo",
  "This is a test.",
  "おはよう！",
  "tag1, tag2"
];

lines.forEach(line => {
        let cleanedLine = line
          .replace(/[\u3000]/g, ' ')
          .replace(/[ \t]+/g, ' ')
          .replace(/\.\s*,/g, ',')
          .replace(/\.\s*$/g, '')
          .replace(/(^|,\s*)\.(?=$|\s*,)/g, '$1')
          .replace(/[ \t]+,/g, ',')
          .replace(/,+/g, ',')
          .replace(/,[ \t]*,/g, ',')
          .replace(/,([^\s])/g, ', $1')
          .trim();
        if (cleanedLine.length > 0) {
          if (!/[。！？]$/.test(cleanedLine)) {
            cleanedLine = cleanedLine.replace(/[\s,]*$/, ',');
          }
        }
        console.log(cleanedLine);
});
