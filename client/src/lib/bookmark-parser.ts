export interface ParsedBookmark {
  title: string;
  url: string;
  domain: string;
  folder?: string;
  favicon?: string;
}

export class BookmarkParser {
  static parseHtml(html: string): ParsedBookmark[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const bookmarks: ParsedBookmark[] = [];
    
    function extractDomain(url: string): string {
      try {
        const domain = new URL(url).hostname;
        return domain.replace(/^www\./, '');
      } catch {
        return 'unknown';
      }
    }
    
    function processBookmarkNode(element: Element, folder = '') {
      // Find all anchor tags (bookmarks)
      const links = element.querySelectorAll('a');
      links.forEach(link => {
        const title = link.textContent?.trim();
        const url = link.getAttribute('href');
        
        if (title && url && url.startsWith('http')) {
          const domain = extractDomain(url);
          bookmarks.push({
            title,
            url,
            domain,
            folder: folder || 'Bookmarks',
            favicon: `https://www.google.com/s2/favicons?domain=${domain}`
          });
        }
      });
      
      // Process nested folders
      const folders = element.querySelectorAll('dt');
      folders.forEach(dt => {
        const folderName = dt.querySelector('h3')?.textContent?.trim();
        if (folderName) {
          const nextElement = dt.nextElementSibling;
          if (nextElement && nextElement.tagName === 'DL') {
            processBookmarkNode(nextElement, folderName);
          }
        }
      });
    }
    
    // Start processing from the root
    processBookmarkNode(doc.body);
    
    return bookmarks;
  }
}
