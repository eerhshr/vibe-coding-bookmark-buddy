import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ExternalLink, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Bookmark, Category } from "@shared/schema";

interface BookmarkTableProps {}

interface BookmarkResponse {
  bookmarks: Bookmark[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type SortField = 'title' | 'domain' | 'category';
type SortOrder = 'asc' | 'desc';

const categoryColors: Record<string, string> = {
  'Development': 'bg-blue-100 text-blue-800',
  'News & Media': 'bg-orange-100 text-orange-800',
  'Recipes': 'bg-yellow-100 text-yellow-800',
  'Certification': 'bg-green-100 text-green-800',
  'Shopping': 'bg-purple-100 text-purple-800',
  'Social Media': 'bg-blue-100 text-blue-800',
  'Entertainment': 'bg-red-100 text-red-800',
  'Reference': 'bg-gray-100 text-gray-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export default function BookmarkTable({}: BookmarkTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Listen for category filter events
  useEffect(() => {
    const handleCategoryFilter = (event: CustomEvent) => {
      const categoryName = event.detail;
      setSelectedCategory(categoryName);
      setCurrentPage(1);
      
      // Scroll to bookmarks section
      setTimeout(() => {
        const bookmarksSection = document.getElementById('bookmarks-section');
        if (bookmarksSection) {
          bookmarksSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('filter-category', handleCategoryFilter as EventListener);
    return () => {
      window.removeEventListener('filter-category', handleCategoryFilter as EventListener);
    };
  }, []);

  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: bookmarkData, isLoading } = useQuery<BookmarkResponse>({
    queryKey: ['/api/bookmarks', { 
      search: debouncedSearch, 
      category: selectedCategory, 
      page: currentPage,
      limit: 10
    }],
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === 'all' ? '' : value);
    setCurrentPage(1);
  };

  const openBookmark = (url: string) => {
    window.open(url, '_blank');
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-3 h-3 opacity-0 group-hover:opacity-50" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="w-3 h-3" /> : 
      <ChevronDown className="w-3 h-3" />;
  };

  const getCategoryBadgeColor = (category: string) => {
    return categoryColors[category] || categoryColors.Other;
  };

  // Sort bookmarks on frontend
  const sortedBookmarks = bookmarkData?.bookmarks.slice().sort((a, b) => {
    let aValue = '';
    let bValue = '';
    
    switch (sortField) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'domain':
        aValue = a.domain.toLowerCase();
        bValue = b.domain.toLowerCase();
        break;
      case 'category':
        aValue = (a.category || '').toLowerCase();
        bValue = (b.category || '').toLowerCase();
        break;
    }

    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  return (
    <section id="bookmarks">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle className="text-2xl">Your Bookmarks</CardTitle>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex space-x-2">
                <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesData?.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Title</span>
                      {getSortIcon('title')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                    onClick={() => handleSort('domain')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Domain</span>
                      {getSortIcon('domain')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      Loading bookmarks...
                    </td>
                  </tr>
                ) : sortedBookmarks?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No bookmarks found
                    </td>
                  </tr>
                ) : (
                  sortedBookmarks?.map((bookmark) => (
                    <tr key={bookmark.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={bookmark.favicon || `https://www.google.com/s2/favicons?domain=${bookmark.domain}`}
                            alt="Favicon" 
                            className="w-4 h-4"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${bookmark.domain}`;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {bookmark.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {bookmark.url}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{bookmark.domain}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <Badge 
                          variant="secondary"
                          className={getCategoryBadgeColor(bookmark.category || 'Other')}
                        >
                          {bookmark.category || 'Other'}
                        </Badge>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openBookmark(bookmark.url)}
                            className="text-primary hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {bookmarkData && bookmarkData.pagination.total > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium">
                  {((bookmarkData.pagination.page - 1) * bookmarkData.pagination.limit) + 1}
                </span> to <span className="font-medium">
                  {Math.min(bookmarkData.pagination.page * bookmarkData.pagination.limit, bookmarkData.pagination.total)}
                </span> of <span className="font-medium">
                  {bookmarkData.pagination.total.toLocaleString()}
                </span> bookmarks
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= bookmarkData.pagination.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
