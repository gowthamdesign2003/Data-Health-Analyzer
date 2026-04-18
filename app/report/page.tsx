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

export default function ReportPage() {
  const [columnStats, setColumnStats] = useState<ColumnStats[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const storedStats = sessionStorage.getItem('columnStats');
    const storedFileName = sessionStorage.getItem('fileName');
    if (!storedStats) {
      router.push('/');
      return;
    }
    setColumnStats(JSON.parse(storedStats));
    setFileName(storedFileName || 'report');
  }, [router]);

  const totalColumns = columnStats.length;
  const avgFillRate =
    totalColumns > 0
      ? columnStats.reduce((sum, col) => sum + col.fillRate, 0) / totalColumns
      : 0;

  let bestColumn = null;
  let worstColumn = null;

  if (columnStats.length > 0) {
    bestColumn = columnStats.reduce((best, current) =>
      current.fillRate > best.fillRate ? current : best
    );
    worstColumn = columnStats.reduce((worst, current) =>
      current.fillRate < worst.fillRate ? current : worst
    );
  }

  const allColumnsSame = bestColumn && worstColumn && 
    bestColumn.fillRate === worstColumn.fillRate;

  const downloadReport = () => {
    const report = {
      fileName,
      generatedAt: new Date().toISOString(),
      summary: {
        totalColumns,
        avgFillRate: avgFillRate.toFixed(1),
        bestColumn: { name: bestColumn?.columnName, fillRate: bestColumn?.fillRate.toFixed(1) },
        worstColumn: { name: worstColumn?.columnName, fillRate: worstColumn?.fillRate.toFixed(1) },
      },
      columnStats,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace('.csv', '').replace('.json', '')}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBack = () => {
    router.push('/insights');
  };

  const handleNewAnalysis = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold py-2 px-4 rounded-xl hover:bg-white/70 transition-all duration-200"
            onClick={handleBack}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Report
          </h1>
          <div className="w-28"></div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-lg shadow-blue-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Total Columns</p>
                <p className="text-4xl font-extrabold text-gray-900">{totalColumns}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <p className="text-sm font-semibold text-blue-700 mb-3 uppercase tracking-wide">Average Fill Rate</p>
                <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  {avgFillRate.toFixed(1)}%
                </p>
              </div>
            </div>

            {allColumnsSame ? (
              <div className="mt-8 p-8 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-yellow-800 mb-2">All Columns Are Equal</h3>
                <p className="text-lg text-yellow-700">
                  All {totalColumns} column{totalColumns !== 1 ? 's' : ''} have the same fill rate of {bestColumn?.fillRate.toFixed(1)}%
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide">Best Column</p>
                  <p className="text-2xl font-bold text-green-900 break-all">{bestColumn?.columnName}</p>
                  <p className="text-4xl font-extrabold text-green-600 mt-2">{bestColumn?.fillRate.toFixed(1)}%</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <p className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">Worst Column</p>
                  <p className="text-2xl font-bold text-red-900 break-all">{worstColumn?.columnName}</p>
                  <p className="text-4xl font-extrabold text-red-600 mt-2">{worstColumn?.fillRate.toFixed(1)}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={downloadReport}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download JSON Report</span>
              </div>
            </button>
            <button
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold text-lg py-5 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={handleNewAnalysis}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Analysis</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
