export function normalizePath(input?: string): string {
  if (!input || typeof input !== 'string') return '#';
  // Trim whitespace
  let url = input.trim();

  // If it's a full URL (http/https), return as-is
  if (/^https?:\/\//i.test(url)) return url;

  // Ensure it starts with a single slash
  url = '/' + url.replace(/^\/*/, '');

  // Collapse duplicate path segments like "/courses/courses/" -> "/courses/"
  const parts = url.split('/').filter(Boolean);
  const collapsed: string[] = [];
  for (const p of parts) {
    if (collapsed.length > 0 && collapsed[collapsed.length - 1] === p) {
      continue; // skip duplicate consecutive segment
    }
    collapsed.push(p);
  }
  let out = '/' + collapsed.join('/');

  // Remove trailing slash if not root and keep ".html" endings intact
  if (out.length > 1 && out.endsWith('/') && !out.endsWith('.html/')) {
    out = out.slice(0, -1);
  }

  // Specific fix: remove unintended duplicated base folder such as services/services or courses/courses
  out = out.replace(/\/(courses|services)\/(?:\1)(\/|$)/g, '/$1$2');

  return out;
}
