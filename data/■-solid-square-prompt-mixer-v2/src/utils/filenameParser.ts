/**
 * Utility to extract clean title from filenames (e.g. log viewer export filenames)
 * Removes date/time prefixes (e.g. "20260922_1529_- ", "20260922_1529_") and file extensions (.txt, .md).
 */
export function parseFileNameToTitle(filename: string): string {
  if (!filename) return 'NEW_MEMO';
  
  // Strip extension
  let name = filename.replace(/\.[^/.]+$/, '');
  
  // Remove date/time timestamp prefix (e.g. 20260922_1529 or 20260922_152930)
  name = name.replace(/^\d{8}[_-]?\d{4,6}[_-]?\s*/, '');
  
  // Remove any remaining leading hyphens, underscores, or spaces
  name = name.replace(/^[-_\s]+/, '');
  
  name = name.trim();
  return name || filename.replace(/\.[^/.]+$/, '') || 'NEW_MEMO';
}
