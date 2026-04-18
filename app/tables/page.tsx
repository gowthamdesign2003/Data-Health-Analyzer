'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TablesPage() {
  const [columns, setColumns] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedData = sessionStorage.getItem('data');
    if (!storedData) {
      router.push('/');
      return;
    }
    const parsedData = JSON.parse(storedData);
    setData(parsedData);
    if (parsedData.length > 0) {
      setColumns(Object.keys(parsedData[0]));
    }
  }, [router]);

  const handleAnalyzeColumns = () => {
    router.push('/analysis');
  };

  const handleBack = () => {
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
            Table Selector
          </h1>
          <div className="w-28"></div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg shadow-green-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Detected Table</h2>
                <p className="text-gray-600">
                  {data.length > 0 
                    ? `Single table with ${columns.length} columns and ${data.length.toLocaleString()} rows` 
                    : 'No data found'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Columns
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {columns.map((column, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-5 text-center hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="text-3xl mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    📊
                  </div>
                  <span className="font-semibold text-gray-800 text-lg break-all">{column}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-6 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1"
            onClick={handleAnalyzeColumns}
          >
            <div className="flex items-center justify-center gap-3">
              <span>Analyze Columns</span>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
