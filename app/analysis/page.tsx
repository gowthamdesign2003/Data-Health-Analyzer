'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ColumnStats {
  columnName: string;
  totalRows: number;
  nonNullCount: number;
  nullCount: number;
  fillRate: number;
}

export default function AnalysisPage() {
  const [columnStats, setColumnStats] = useState<ColumnStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('data');
    if (!storedData) {
      router.push('/');
      return;
    }
    const data = JSON.parse(storedData);
    const stats: ColumnStats[] = [];
    
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        let nonNull = 0;
        let nulls = 0;
        data.forEach((row: any) => {
          const val = row[col];
          if (val === null || val === undefined || val === '') {
            nulls++;
          } else {
            nonNull++;
          }
        });
        const fillRate = (nonNull / data.length) * 100;
        stats.push({
          columnName: col,
          totalRows: data.length,
          nonNullCount: nonNull,
          nullCount: nulls,
          fillRate: fillRate,
        });
      });
    }
    
    setColumnStats(stats);
    sessionStorage.setItem('columnStats', JSON.stringify(stats));
    setLoading(false);
  }, [router]);

  const getBadgeColor = (fillRate: number) => {
    if (fillRate > 80) return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
    if (fillRate >= 50) return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200';
    return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200';
  };

  const getProgressColor = (fillRate: number) => {
    if (fillRate > 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (fillRate >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-rose-500';
  };

  const [savingToSupabase, setSavingToSupabase] = useState<boolean>(false);

  const handleNext = async () => {
    setSavingToSupabase(true);
    
    try {
      const fileName = sessionStorage.getItem('fileName') || 'unknown';
      
      // Generate AI insights
      const goodColumns = columnStats.filter((s) => s.fillRate > 80);
      const mediumColumns = columnStats.filter((s) => s.fillRate >= 50 && s.fillRate <= 80);
      const badColumns = columnStats.filter((s) => s.fillRate < 50);
      const avgFillRate = columnStats.reduce((sum, s) => sum + s.fillRate, 0) / columnStats.length;
      
      let aiInsightsText = `📊 Dataset Quality Analysis
========================

📈 Overall Dataset Quality: `;
      
      if (avgFillRate > 80) {
        aiInsightsText += `Good (${avgFillRate.toFixed(1)}% average fill rate)
✅ Recommendation: Usable for most purposes

`;
      } else if (avgFillRate >= 50) {
        aiInsightsText += `Fair (${avgFillRate.toFixed(1)}% average fill rate)
⚠️ Recommendation: Partially usable (use with caution)

`;
      } else {
        aiInsightsText += `Poor (${avgFillRate.toFixed(1)}% average fill rate)
❌ Recommendation: Not usable for critical applications

`;
      }
      
      if (goodColumns.length > 0) {
        aiInsightsText += `✅ Good Columns (${goodColumns.length}):
`;
        goodColumns.forEach((col) => {
          aiInsightsText += `  • ${col.columnName}: ${col.fillRate.toFixed(1)}% fill rate (${col.nonNullCount} non-null values) - USABLE
`;
        });
        aiInsightsText += '\n';
      }
      
      if (mediumColumns.length > 0) {
        aiInsightsText += `⚠️ Medium Columns (${mediumColumns.length}):
`;
        mediumColumns.forEach((col) => {
          aiInsightsText += `  • ${col.columnName}: ${col.fillRate.toFixed(1)}% fill rate - USE WITH CAUTION (${col.nullCount} null values)
`;
        });
        aiInsightsText += '\n';
      }
      
      if (badColumns.length > 0) {
        aiInsightsText += `❌ Poor Columns (${badColumns.length}):
`;
        badColumns.forEach((col) => {
          aiInsightsText += `  • ${col.columnName}: ${col.fillRate.toFixed(1)}% fill rate - NOT USABLE (${col.nullCount} null values)
`;
        });
      }
      
      // Generate report data
      let bestColumn = columnStats[0];
      let worstColumn = columnStats[0];
      
      if (columnStats.length > 0) {
        bestColumn = columnStats.reduce((best, current) =>
          current.fillRate > best.fillRate ? current : best
        );
        worstColumn = columnStats.reduce((worst, current) =>
          current.fillRate < worst.fillRate ? current : worst
        );
      }
      
      const reportData = {
        fileName,
        generatedAt: new Date().toISOString(),
        summary: {
          totalColumns: columnStats.length,
          avgFillRate: avgFillRate.toFixed(1),
          bestColumn: { name: bestColumn?.columnName, fillRate: bestColumn?.fillRate.toFixed(1) },
          worstColumn: { name: worstColumn?.columnName, fillRate: worstColumn?.fillRate.toFixed(1) },
        },
        columnStats
      };
      
      // Save all to Supabase!
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileName, 
          columnStats,
          aiInsights: aiInsightsText,
          reportData: reportData
        }),
      });
      
      if (!response.ok) {
        console.warn('Could not save to Supabase, but proceeding anyway');
      } else {
        console.log('✅ All data saved to Supabase!');
      }
      
      // Save to sessionStorage for next pages
      sessionStorage.setItem('aiInsights', aiInsightsText);
      sessionStorage.setItem('reportData', JSON.stringify(reportData));
      
    } catch (err) {
      console.warn('Error saving to Supabase:', err);
    } finally {
      setSavingToSupabase(false);
      router.push('/insights');
    }
  };

  const handleBack = () => {
    router.push('/');
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
            <div className="text-2xl font-bold text-gray-900">Analyzing Data</div>
            <div className="text-lg text-gray-600">Calculating fill rates...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
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
            Column Analysis
          </h1>
          <div className="w-28"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-br from-gray-50 to-blue-50">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Column Name</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Total Rows</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Non-null Count</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Null Count</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Status</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wide">Fill Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {columnStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200">
                    <td className="px-8 py-6 text-base font-semibold text-gray-900 break-all">{stat.columnName}</td>
                    <td className="px-8 py-6 text-base text-gray-700 font-medium">{stat.totalRows.toLocaleString()}</td>
                    <td className="px-8 py-6 text-base text-green-700 font-semibold">{stat.nonNullCount.toLocaleString()}</td>
                    <td className="px-8 py-6 text-base text-red-700 font-semibold">{stat.nullCount.toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                        stat.fillRate > 80 
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200' 
                          : stat.fillRate >= 50 
                          ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-2 border-amber-200' 
                          : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-2 border-red-200'
                      }`}>
                        {stat.fillRate > 80 ? 'Excellent' : stat.fillRate >= 50 ? 'Good' : 'Poor'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getBadgeColor(stat.fillRate)}`}>
                            {stat.fillRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getProgressColor(stat.fillRate)}`}
                            style={{ width: `${stat.fillRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-5 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            onClick={handleNext}
            disabled={savingToSupabase}
          >
            <div className="flex items-center gap-3">
              {savingToSupabase ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <span>Get AI Insights</span>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
