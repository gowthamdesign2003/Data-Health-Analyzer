'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

  const downloadJSONReport = () => {
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

  const downloadPDFReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Data Health Analyzer Report', 14, 22);
    
    // Subtitle
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
    doc.text(`File: ${fileName}`, 14, 40);
    
    // Summary section
    doc.setFontSize(16);
    doc.text('Summary', 14, 55);
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Columns', totalColumns.toString()],
      ['Average Fill Rate', `${avgFillRate.toFixed(1)}%`],
    ];
    
    if (!allColumnsSame) {
      summaryData.push(['Best Column', `${bestColumn?.columnName} (${bestColumn?.fillRate.toFixed(1)}%)`]);
      summaryData.push(['Worst Column', `${worstColumn?.columnName} (${worstColumn?.fillRate.toFixed(1)}%)`]);
    }
    
    autoTable(doc, {
      head: [summaryData[0]],
      body: summaryData.slice(1),
      startY: 60,
    });
    
    // Column stats section
    const tableData = columnStats.map(stat => [
      stat.columnName,
      stat.totalRows.toString(),
      stat.nonNullCount.toString(),
      stat.nullCount.toString(),
      `${stat.fillRate.toFixed(1)}%`,
    ]);
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(16);
    doc.text('Column Statistics', 14, finalY);
    
    autoTable(doc, {
      head: [['Column Name', 'Total Rows', 'Non-null', 'Null', 'Fill Rate']],
      body: tableData,
      startY: finalY + 5,
    });
    
    doc.save(`${fileName.replace('.csv', '').replace('.json', '')}_report.pdf`);
  };

  const downloadXLSXReport = () => {
    const summarySheetData = [
      ['Data Health Analyzer Report'],
      ['Generated', new Date().toLocaleString()],
      ['File', fileName],
      [],
      ['Summary'],
      ['Metric', 'Value'],
      ['Total Columns', totalColumns],
      ['Average Fill Rate', `${avgFillRate.toFixed(1)}%`],
    ];
    
    if (!allColumnsSame) {
      summarySheetData.push(['Best Column', `${bestColumn?.columnName} (${bestColumn?.fillRate.toFixed(1)}%)`]);
      summarySheetData.push(['Worst Column', `${worstColumn?.columnName} (${worstColumn?.fillRate.toFixed(1)}%)`]);
    }
    
    summarySheetData.push([]);
    summarySheetData.push(['Column Statistics']);
    summarySheetData.push(['Column Name', 'Total Rows', 'Non-null', 'Null', 'Fill Rate (%)']);
    
    columnStats.forEach(stat => {
      summarySheetData.push([
        stat.columnName,
        stat.totalRows,
        stat.nonNullCount,
        stat.nullCount,
        stat.fillRate,
      ]);
    });
    
    const worksheet = XLSX.utils.aoa_to_sheet(summarySheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${fileName.replace('.csv', '').replace('.json', '')}_report.xlsx`);
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg py-5 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={downloadJSONReport}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>JSON Report</span>
              </div>
            </button>
            <button
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-lg py-5 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={downloadPDFReport}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>PDF Report</span>
              </div>
            </button>
            <button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg py-5 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={downloadXLSXReport}
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h5a2 2 0 012 2v6a2 2 0 01-2 2h-5a2 2 0 01-2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 012 2h2a2 2 0 012 2m0 0V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-5a2 2 0 01-2-2z" />
                </svg>
                <span>Excel Report</span>
              </div>
            </button>
          </div>

          <div className="flex justify-center">
            <button
              className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-bold text-lg py-5 px-10 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              onClick={handleNewAnalysis}
            >
              <div className="flex items-center gap-3">
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
