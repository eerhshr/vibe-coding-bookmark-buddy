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
            <BookmarkTable />
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
