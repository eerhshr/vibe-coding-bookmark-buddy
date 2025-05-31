import type { ParsedBookmark } from './bookmark-parser';

export interface BookmarkCategory {
  name: string;
  count: number;
  color: string;
}

export interface DomainAnalysis {
  domain: string;
  count: number;
}

export interface BookmarkStats {
  totalBookmarks: number;
  totalCategories: number;
  totalDomains: number;
  duplicates: number;
}

export class BookmarkAnalyzer {
  private static categoryKeywords = {
    'Development': ['github', 'stackoverflow', 'codepen', 'dev.to', 'programming', 'code', 'developer', 'api', 'documentation', 'tutorial'],
    'News & Media': ['news', 'bbc', 'cnn', 'reuters', 'medium', 'blog', 'article', 'press'],
    'Recipes': ['recipe', 'cooking', 'food', 'kitchen', 'chef', 'culinary', 'restaurant', 'dinner'],
    'Certification': ['certification', 'course', 'training', 'udemy', 'coursera', 'aws', 'certified', 'exam'],
    'Shopping': ['amazon', 'shop', 'store', 'buy', 'purchase', 'retail', 'ecommerce'],
    'Social Media': ['facebook', 'twitter', 'instagram', 'linkedin', 'social', 'reddit'],
    'Entertainment': ['youtube', 'netflix', 'entertainment', 'movie', 'video', 'music', 'game'],
    'Reference': ['wikipedia', 'reference', 'documentation', 'manual', 'guide'],
  };

  private static categoryColors = {
    'Development': '#1976D2',
    'News & Media': '#FF5722',
    'Recipes': '#FFC107',
    'Certification': '#4CAF50',
    'Shopping': '#9C27B0',
    'Social Media': '#2196F3',
    'Entertainment': '#F44336',
    'Reference': '#607D8B',
    'Other': '#9E9E9E'
  };

  static classifyBookmark(title: string, url: string, folder?: string): string {
    const text = `${title} ${url} ${folder || ''}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  static analyzeBookmarks(bookmarks: ParsedBookmark[]) {
    // Categorize bookmarks
    const categorizedBookmarks = bookmarks.map(bookmark => ({
      ...bookmark,
      category: this.classifyBookmark(bookmark.title, bookmark.url, bookmark.folder)
    }));

    // Calculate category distribution
    const categoryStats = new Map<string, number>();
    categorizedBookmarks.forEach(bookmark => {
      const count = categoryStats.get(bookmark.category) || 0;
      categoryStats.set(bookmark.category, count + 1);
    });

    const categories: BookmarkCategory[] = Array.from(categoryStats.entries()).map(([name, count]) => ({
      name,
      count,
      color: this.categoryColors[name] || this.categoryColors.Other
    }));

    // Calculate domain distribution
    const domainStats = new Map<string, number>();
    categorizedBookmarks.forEach(bookmark => {
      const count = domainStats.get(bookmark.domain) || 0;
      domainStats.set(bookmark.domain, count + 1);
    });

    const topDomains: DomainAnalysis[] = Array.from(domainStats.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate duplicates
    const urlCounts = new Map<string, number>();
    bookmarks.forEach(bookmark => {
      const count = urlCounts.get(bookmark.url) || 0;
      urlCounts.set(bookmark.url, count + 1);
    });
    
    const duplicates = Array.from(urlCounts.values()).reduce((sum, count) => {
      return sum + Math.max(0, count - 1);
    }, 0);

    const stats: BookmarkStats = {
      totalBookmarks: bookmarks.length,
      totalCategories: categories.length,
      totalDomains: domainStats.size,
      duplicates
    };

    return {
      bookmarks: categorizedBookmarks,
      categories,
      topDomains,
      stats
    };
  }
}
