import { Bookmark, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Bookmark className="text-primary text-2xl" />
            <h1 className="text-xl font-bold text-gray-900">Bookmark Analyzer</h1>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <button 
              onClick={() => scrollToSection('upload')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Upload
            </button>
            <button 
              onClick={() => scrollToSection('dashboard')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Dashboard
            </button>
            <button 
              onClick={() => scrollToSection('bookmarks')}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Bookmarks
            </button>
          </nav>
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
