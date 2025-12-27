// Helper function to convert HTML string with {{variable}} syntax to HTML with span elements
export function convertVariablesToHtml(html: string): string {
  // Replace {{variable}} with span elements that Tiptap can parse
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return `<span data-type="variable" data-key="${key}" data-label="${key}">{{${key}}}</span>`;
  });
}
