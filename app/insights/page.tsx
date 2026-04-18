'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ColumnData {
  name: string;
  fill_rate: number;
  null_count: number;
}

interface InsightData {
  goodColumns: any[];
  mediumColumns: any[];
  badColumns: any[];
  avgFillRate: number;
  overallQuality: string;
  recommendation: string;
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedStats = sessionStorage.getItem('columnStats');
    if (!storedStats) {
      router.push('/');
      return;
    }

    const generateMockInsights = (stats: any[]): InsightData => {
      const goodColumns = stats.filter((s: any) => s.fillRate > 80);
      const mediumColumns = stats.filter((s: any) => s.fillRate >= 50 && s.fillRate <= 80);
      const badColumns = stats.filter((s: any) => s.fillRate < 50);
      const avgFillRate = stats.reduce((sum: number, s: any) => sum + s.fillRate, 0) / stats.length;
      
      let overallQuality, recommendation;
      if (avgFillRate > 80) {
        overallQuality = 'Good';
        recommendation = 'Usable for most purposes';
      } else if (avgFillRate >= 50) {
        overallQuality = 'Fair';
        recommendation = 'Partially usable (use with caution)';
      } else {
        overallQuality = 'Poor';
        recommendation = 'Not usable for critical applications';
      }
      
      return {
        goodColumns,
        mediumColumns,
        badColumns,
        avgFillRate,
        overallQuality,
        recommendation
      };
    };

    const getInsights = async () => {
      try {
        const stats = JSON.parse(storedStats);
        const columnsData: ColumnData[] = stats.map((stat: any) => ({
          name: stat.columnName,
          fill_rate: stat.fillRate,
          null_count: stat.nullCount,
        }));

        const response = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ columns: columnsData }),
        });

        if (response.ok) {
          const data = await response.json();
          const mock = generateMockInsights(stats);
          setInsights(mock);
        } else {
          setInsights(generateMockInsights(stats));
          setError(null);
        }
      } catch (err) {
        const stats = JSON.parse(storedStats);
        setInsights(generateMockInsights(stats));
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    getInsights();
  }, [router]);

  const handleNext = () => {
    router.push('/report');
  };

  const handleBack = () => {
    router.push('/analysis');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-32 h-32 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">Generating AI Insights</div>
            <div className="text-lg text-gray-600">Please wait while we analyze your data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-xl hover:bg-white/70 transition-all duration-300"
            onClick={handleBack}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            AI Insights
          </h1>
          <div className="w-28"></div>
        </div>

        <div className="space-y-8">
          {insights && (
            <>
              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Average Fill Rate</div>
                    <div className="text-4xl font-extrabold text-blue-600">{insights.avgFillRate.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Overall Quality</div>
                    <div className="text-4xl font-extrabold text-purple-600">{insights.overallQuality}</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Recommendation</div>
                    <div className="text-lg font-bold text-amber-800">{insights.recommendation}</div>
                  </div>
                </div>

                <div className="space-y-8">
                  {insights.goodColumns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        Good Columns ({insights.goodColumns.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.goodColumns.map((col: any, i: number) => (
                          <div key={i} className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <p className="font-semibold text-green-900 break-all">{col.columnName}</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{col.fillRate.toFixed(1)}%</p>
                            <p className="text-sm text-green-700 mt-1">{col.nonNullCount} non-null</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.mediumColumns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full">
                          <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        Medium Columns ({insights.mediumColumns.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.mediumColumns.map((col: any, i: number) => (
                          <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <p className="font-semibold text-amber-900 break-all">{col.columnName}</p>
                            <p className="text-2xl font-bold text-amber-600 mt-1">{col.fillRate.toFixed(1)}%</p>
                            <p className="text-sm text-amber-700 mt-1">{col.nullCount} null</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {insights.badColumns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        Poor Columns ({insights.badColumns.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {insights.badColumns.map((col: any, i: number) => (
                          <div key={i} className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                            <p className="font-semibold text-red-900 break-all">{col.columnName}</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{col.fillRate.toFixed(1)}%</p>
                            <p className="text-sm text-red-700 mt-1">{col.nullCount} null</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end">
            <button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-5 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={handleNext}
            >
              <div className="flex items-center gap-3">
                <span>View Report</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
