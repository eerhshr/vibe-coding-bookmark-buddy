import { useState, useRef } from "react";
import { Upload, CloudUpload, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadSectionProps {
  onUploadSuccess: () => void;
}

export default function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.html')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an HTML file from your browser's bookmark export.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/bookmarks/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      const result = await response.json();

      setUploadedFile(file);
      toast({
        title: "Upload successful",
        description: `Processed ${result.bookmarksCount} bookmarks successfully.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload bookmark file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis time
    setTimeout(() => {
      setIsAnalyzing(false);
      onUploadSuccess();
      
      // Scroll to dashboard
      setTimeout(() => {
        const dashboardElement = document.getElementById('dashboard');
        if (dashboardElement) {
          dashboardElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 2000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <section id="upload" className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyze Your Bookmarks</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your Chrome or Safari bookmark HTML file to get insights into your browsing habits and organize your digital life.
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <p className="text-lg font-medium text-gray-900">Uploading your bookmarks...</p>
              </div>
            ) : isAnalyzing ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <p className="text-lg font-medium text-gray-900">Processing your bookmarks...</p>
              </div>
            ) : uploadedFile ? (
              <div className="space-y-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">File uploaded successfully!</p>
                  <p className="text-gray-600">{uploadedFile.name}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <CloudUpload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">Drop your bookmark file here</p>
                  <p className="text-gray-600">or <span className="text-primary font-medium">browse to upload</span></p>
                </div>
                <p className="text-sm text-gray-500">Supports Chrome and Safari bookmark exports (.html files)</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".html"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={openFileDialog}
              disabled={isUploading || isAnalyzing}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </Button>
            
            <Button
              onClick={handleAnalyze}
              disabled={!uploadedFile || isUploading || isAnalyzing}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Analyze Bookmarks
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
