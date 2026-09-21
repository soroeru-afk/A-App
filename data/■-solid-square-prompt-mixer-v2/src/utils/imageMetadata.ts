export const extractMetadataFromImage = async (file: File): Promise<{ positive: string, negative: string, settings: string } | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve(null);
        return;
      }

      const view = new DataView(buffer);
      
      // Check if PNG
      if (view.getUint32(0) === 0x89504E47 && view.getUint32(4) === 0x0D0A1A0A) {
        let offset = 8;
        let textChunks: { keyword: string, text: string }[] = [];
        
        while (offset < view.byteLength) {
          const length = view.getUint32(offset);
          const type = String.fromCharCode(
            view.getUint8(offset + 4),
            view.getUint8(offset + 5),
            view.getUint8(offset + 6),
            view.getUint8(offset + 7)
          );
          
          if (type === 'tEXt') {
            const chunkData = new Uint8Array(buffer, offset + 8, length);
            const nullIdx = chunkData.indexOf(0);
            if (nullIdx !== -1) {
              const keyword = new TextDecoder('latin1').decode(chunkData.slice(0, nullIdx));
              const text = new TextDecoder('utf-8').decode(chunkData.slice(nullIdx + 1));
              textChunks.push({ keyword, text });
            }
          } else if (type === 'iTXt') {
            const chunkData = new Uint8Array(buffer, offset + 8, length);
            const nullIdx1 = chunkData.indexOf(0);
            if (nullIdx1 !== -1) {
              const keyword = new TextDecoder('latin1').decode(chunkData.slice(0, nullIdx1));
              // iTXt has compression flag, compression method, language tag, translated keyword before text.
              let textStart = nullIdx1 + 1;
              const compressionFlag = chunkData[textStart];
              const compressionMethod = chunkData[textStart + 1];
              textStart += 2;
              
              let nullsFound = 0;
              while (textStart < chunkData.length && nullsFound < 2) {
                if (chunkData[textStart] === 0) nullsFound++;
                textStart++;
              }
              
              if (compressionFlag === 0) {
                const text = new TextDecoder('utf-8').decode(chunkData.slice(textStart));
                textChunks.push({ keyword, text });
              } else {
                 // Compressed iTXt not supported without zlib, usually SD uses uncompressed tEXt
              }
            }
          }
          
          offset += 8 + length + 4; // length(4) + type(4) + data(length) + crc(4)
        }
        
        const paramsChunk = textChunks.find(c => c.keyword === 'parameters');
        if (paramsChunk) {
          resolve(parseSDParameters(paramsChunk.text));
          return;
        }
        
        const naiComment = textChunks.find(c => c.keyword === 'Comment');
        const naiDescription = textChunks.find(c => c.keyword === 'Description');
        if (naiComment && naiDescription) {
           try {
              const commentData = JSON.parse(naiComment.text);
              resolve({
                 positive: naiDescription.text,
                 negative: commentData.uc || '',
                 settings: naiComment.text
              });
              return;
           } catch(e) {}
        }
      } else if (view.getUint16(0) === 0xFFD8) {
        // Exif parsing for JPEG
        let offset = 2;
        let exifData = null;
        while (offset < view.byteLength) {
          if (view.getUint16(offset) === 0xFFE1) {
            // APP1 marker (EXIF)
            const length = view.getUint16(offset + 2);
            const identifier = String.fromCharCode(
              view.getUint8(offset + 4),
              view.getUint8(offset + 5),
              view.getUint8(offset + 6),
              view.getUint8(offset + 7)
            );
            
            if (identifier === 'Exif') {
              // Basic Exif parse to find UserComment
              // It's a bit involved, let's try reading the whole APP1 chunk as string for a quick find
              const chunkData = new Uint8Array(buffer, offset + 4, length - 2);
              const chunkStr = new TextDecoder('utf-8', { fatal: false }).decode(chunkData).replace(/\u0000/g, '');
              
              const match = chunkStr.match(/UNICODE([\s\S]+)/);
              if (match) {
                 const text = match[1].replace(/[^a-zA-Z0-9\s:,\.\{\}\[\]\(\)\-\_]/g, '');
                 if (text.includes('Steps:')) {
                    resolve(parseSDParameters(text));
                    return;
                 }
              }
            }
            offset += 2 + length;
          } else {
             const marker = view.getUint16(offset);
             if ((marker & 0xFF00) !== 0xFF00) break;
             if (marker === 0xFFDA) break; // Start of Scan
             const length = view.getUint16(offset + 2);
             offset += 2 + length;
          }
        }
      }
      
      resolve(null);
    };
    reader.readAsArrayBuffer(file);
  });
};

const parseSDParameters = (text: string): { positive: string, negative: string, settings: string } => {
  text = text.replace(/\u0000/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  let positive = '';
  let negative = '';
  let settings = '';
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const settingsLineIndex = lines.findIndex(l => l.startsWith('Steps: '));
  
  if (settingsLineIndex !== -1) {
    settings = lines[settingsLineIndex];
    const beforeSettings = lines.slice(0, settingsLineIndex);
    
    let negIndex = -1;
    for (let i = 0; i < beforeSettings.length; i++) {
      if (beforeSettings[i].startsWith('Negative prompt:')) {
        negIndex = i;
        break;
      }
    }
    
    if (negIndex !== -1) {
      const posLines = beforeSettings.slice(0, negIndex);
      positive = posLines.join('\n').trim();
      
      let negLines = beforeSettings.slice(negIndex);
      negLines[0] = negLines[0].substring('Negative prompt:'.length).trim();
      negative = negLines.join('\n').trim();
    } else {
      positive = beforeSettings.join('\n').trim();
    }
  } else {
    const negMatch = text.match(/Negative prompt:([\s\S]*)/);
    if (negMatch) {
      positive = text.substring(0, negMatch.index).trim();
      negative = negMatch[1].trim();
    } else {
      positive = text;
    }
  }
  
  return { positive, negative, settings };
};
