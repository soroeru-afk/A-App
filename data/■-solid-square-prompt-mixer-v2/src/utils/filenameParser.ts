/**
 * Clean filename to extract the memo title:
 * Removes date prefix (e.g. 20260922_1529_, 2026-09-22-1529-, etc.),
 * removes extension (.txt, .md, etc.),
 * and trims whitespace.
 */
export function extractMemoTitleFromFilename(filename: string): string {
  // Strip extension
  let name = filename.replace(/\.[^/.]+$/, '');

  // Strip leading date patterns like:
  // 20260922_1529_title
  // 20260922-1529-title
  // 20260922_152900_title
  // 2026-09-22_15-29_title
  // 20260922_title
  // 2026-09-22_title
  name = name.replace(/^\d{4}[-_]?\d{2}[-_]?\d{2}[-_]\d{2,6}[-_]?/, '');
  name = name.replace(/^\d{8}[-_]\d{4,6}[-_]?/, '');
  name = name.replace(/^\d{4}[-_]?\d{2}[-_]?\d{2}[-_]?/, '');

  name = name.trim();

  // If stripping left it empty, fall back to base filename without extension
  if (!name) {
    name = filename.replace(/\.[^/.]+$/, '').trim() || 'Untitled Memo';
  }

  return name;
}
