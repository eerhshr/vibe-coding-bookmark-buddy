import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import UploadSection from "@/components/upload-section";
import DashboardSection from "@/components/dashboard-section";
import BookmarkTable from "@/components/bookmark-table";

export default function Home() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const { data: analysisData, refetch: refetchAnalysis } = useQuery({
    queryKey: ['/api/analysis'],
    enabled: showDashboard,
  });

  const handleUploadSuccess = () => {
    setUploadSuccess(true);
    setShowDashboard(true);
    refetchAnalysis();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadSection onUploadSuccess={handleUploadSuccess} />
        
        {showDashboard && analysisData && (
          <>
            <DashboardSection data={analysisData} />
            <div id="bookmarks-section">
              <BookmarkTable />
            </div>
            
            {/* Download Section */}
            <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Download Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.open('/api/export/bookmarks', '_blank')}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Organized Bookmarks
                </button>
                
                <button
                  onClick={() => window.open('/api/export/report', '_blank')}
                  className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Analysis Report
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Bookmark Analyzer. Organize your digital life with intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
