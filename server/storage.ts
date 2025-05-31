import { 
  bookmarks, 
  categories, 
  analysisResults,
  type Bookmark, 
  type InsertBookmark,
  type Category,
  type InsertCategory,
  type AnalysisResult,
  type InsertAnalysisResult,
  type AnalysisData,
  type BookmarkStats,
  type DomainCount
} from "@shared/schema";

export interface IStorage {
  // Bookmark operations
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getBookmarks(): Promise<Bookmark[]>;
  getBookmarksByCategory(category: string): Promise<Bookmark[]>;
  searchBookmarks(query: string): Promise<Bookmark[]>;
  clearBookmarks(): Promise<void>;
  
  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getCategories(): Promise<Category[]>;
  clearCategories(): Promise<void>;
  
  // Analysis operations
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  getLatestAnalysisResult(): Promise<AnalysisResult | undefined>;
  
  // Bulk operations
  createBookmarksBulk(bookmarks: InsertBookmark[]): Promise<Bookmark[]>;
  getAnalysisData(): Promise<AnalysisData>;
}

export class MemStorage implements IStorage {
  private bookmarks: Map<number, Bookmark>;
  private categories: Map<number, Category>;
  private analysisResults: Map<number, AnalysisResult>;
  private currentBookmarkId: number;
  private currentCategoryId: number;
  private currentAnalysisId: number;

  constructor() {
    this.bookmarks = new Map();
    this.categories = new Map();
    this.analysisResults = new Map();
    this.currentBookmarkId = 1;
    this.currentCategoryId = 1;
    this.currentAnalysisId = 1;
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const bookmark: Bookmark = { 
      ...insertBookmark, 
      id,
      category: insertBookmark.category || null,
      folder: insertBookmark.folder || null,
      favicon: insertBookmark.favicon || null
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values());
  }

  async getBookmarksByCategory(category: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) => bookmark.category === category
    );
  }

  async searchBookmarks(query: string): Promise<Bookmark[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.bookmarks.values()).filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(lowercaseQuery) ||
        bookmark.url.toLowerCase().includes(lowercaseQuery) ||
        bookmark.domain.toLowerCase().includes(lowercaseQuery)
    );
  }

  async clearBookmarks(): Promise<void> {
    this.bookmarks.clear();
    this.currentBookmarkId = 1;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      count: insertCategory.count ?? 0
    };
    this.categories.set(id, category);
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async clearCategories(): Promise<void> {
    this.categories.clear();
    this.currentCategoryId = 1;
  }

  async createAnalysisResult(insertResult: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = this.currentAnalysisId++;
    const result: AnalysisResult = { ...insertResult, id };
    this.analysisResults.set(id, result);
    return result;
  }

  async getLatestAnalysisResult(): Promise<AnalysisResult | undefined> {
    const results = Array.from(this.analysisResults.values());
    return results[results.length - 1];
  }

  async createBookmarksBulk(insertBookmarks: InsertBookmark[]): Promise<Bookmark[]> {
    const bookmarks: Bookmark[] = [];
    for (const insertBookmark of insertBookmarks) {
      const bookmark = await this.createBookmark(insertBookmark);
      bookmarks.push(bookmark);
    }
    return bookmarks;
  }

  async getAnalysisData(): Promise<AnalysisData> {
    const bookmarks = await this.getBookmarks();
    const categories = await this.getCategories();
    
    // Calculate stats
    const uniqueDomains = new Set(bookmarks.map(b => b.domain)).size;
    const duplicateUrls = bookmarks.map(b => b.url);
    const duplicates = duplicateUrls.length - new Set(duplicateUrls).size;
    
    const stats: BookmarkStats = {
      totalBookmarks: bookmarks.length,
      categories: categories.length,
      domains: uniqueDomains,
      duplicates: duplicates
    };

    // Calculate top domains
    const domainCounts = new Map<string, number>();
    bookmarks.forEach(bookmark => {
      const count = domainCounts.get(bookmark.domain) || 0;
      domainCounts.set(bookmark.domain, count + 1);
    });

    const topDomains: DomainCount[] = Array.from(domainCounts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      stats,
      categories,
      topDomains,
      bookmarks
    };
  }
}

export const storage = new MemStorage();
