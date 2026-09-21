export const calculateCursorPos = (before: string, insertedStr: string, cleaned: string, isAtEnd: boolean): number => {
    if (isAtEnd) return cleaned.length;
    
    const targetStr = before + insertedStr;
    
    let charCount = 0;
    for (let i = 0; i < targetStr.length; i++) {
        const c = targetStr[i];
        if (c !== ' ' && c !== '\t' && c !== ',' && c !== '\u3000' && c !== '\n') {
            charCount++;
        }
    }
    
    if (charCount === 0) {
        if (cleaned.startsWith(', ')) return 2;
        if (cleaned.startsWith(',') || cleaned.startsWith(' ')) return 1;
        return 0;
    }
    
    let cleanedCharCount = 0;
    let scanIndex = 0;
    for (let i = 0; i < cleaned.length; i++) {
        const c = cleaned[i];
        if (c !== ' ' && c !== '\t' && c !== ',' && c !== '\u3000' && c !== '\n') {
            cleanedCharCount++;
        }
        if (cleanedCharCount === charCount) {
            scanIndex = i;
            break;
        }
    }
    
    let finalPos = scanIndex + 1;
    
    if (cleaned.substring(finalPos, finalPos + 2) === ', ') {
       finalPos += 2;
    } else if (cleaned.substring(finalPos, finalPos + 1) === ',') {
       finalPos += 1;
    } else if (cleaned.substring(finalPos, finalPos + 1) === ' ') {
       finalPos += 1;
    }
    
    return finalPos;
};
