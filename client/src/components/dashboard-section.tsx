import { useEffect, useRef } from "react";
import { Bookmark, Folder, Globe, AlertTriangle, Download, Search, Trash2, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Chart from "chart.js/auto";
import type { AnalysisData } from "@shared/schema";

interface DashboardSectionProps {
  data: AnalysisData;
}

export default function DashboardSection({ data }: DashboardSectionProps) {
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const domainChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartInstance = useRef<Chart | null>(null);
  const domainChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Cleanup existing charts
    if (categoryChartInstance.current) {
      categoryChartInstance.current.destroy();
    }
    if (domainChartInstance.current) {
      domainChartInstance.current.destroy();
    }

    // Create category chart (Doughnut)
    if (categoryChartRef.current && data.categories.length > 0) {
      const ctx = categoryChartRef.current.getContext('2d');
      if (ctx) {
        categoryChartInstance.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.categories.map(cat => cat.name),
            datasets: [{
              data: data.categories.map(cat => cat.count),
              backgroundColor: data.categories.map(cat => cat.color),
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }

    // Create domain chart (Bar)
    if (domainChartRef.current && data.topDomains.length > 0) {
      const ctx = domainChartRef.current.getContext('2d');
      if (ctx) {
        domainChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.topDomains.map(domain => domain.domain),
            datasets: [{
              label: 'Bookmarks',
              data: data.topDomains.map(domain => domain.count),
              backgroundColor: '#1976D2',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
      if (domainChartInstance.current) {
        domainChartInstance.current.destroy();
      }
    };
  }, [data]);

  const getProgressPercentage = (count: number, total: number) => {
    return total > 0 ? (count / total) * 100 : 0;
  };

  return (
    <section id="dashboard" className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Bookmark Analysis Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookmarks</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.totalBookmarks.toLocaleString()}</p>
              </div>
              <Bookmark className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.categories}</p>
              </div>
              <Folder className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Domains</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.domains}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Duplicates Found</p>
                <p className="text-3xl font-bold text-gray-900">{data.stats.duplicates}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Bookmark Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <canvas ref={categoryChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => window.dispatchEvent(new CustomEvent('filter-category', { detail: category.name }))}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{category.count} bookmarks</span>
                  <div className="w-24">
                    <Progress 
                      value={getProgressPercentage(category.count, data.stats.totalBookmarks)}
                      className="h-2"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </section>
  );
}
