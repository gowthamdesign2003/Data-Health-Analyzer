'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setJsonInput('');
      setError(null);
    }
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (!jsonData || jsonData.length === 0) {
          setError('No data found in Excel file');
          setLoading(false);
          return;
        }
        
        sessionStorage.setItem('data', JSON.stringify(jsonData));
        sessionStorage.setItem('fileName', file.name);
        router.push('/analysis');
        setLoading(false);
      } catch (err) {
        setError('Failed to parse Excel file');
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setLoading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleAnalyze = () => {
    setLoading(true);
    setError(null);

    try {
      if (file) {
        const fileName = file.name.toLowerCase();
        
        if (fileName.endsWith('.csv')) {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                setError('Error parsing CSV file');
                setLoading(false);
                return;
              }
              if (!results.data || results.data.length === 0) {
                setError('No data found in CSV');
                setLoading(false);
                return;
              }
              sessionStorage.setItem('data', JSON.stringify(results.data));
              sessionStorage.setItem('fileName', file.name);
              router.push('/analysis');
              setLoading(false);
            },
            error: () => {
              setError('Failed to parse CSV');
              setLoading(false);
            },
          });
        } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
          parseExcelFile(file);
        } else {
          setError('Unsupported file format. Please use CSV or Excel (XLSX/XLS) files');
          setLoading(false);
        }
      } else if (jsonInput.trim()) {
        try {
          const data = JSON.parse(jsonInput);
          if (!Array.isArray(data) || data.length === 0) {
            setError('JSON must be a non-empty array of objects');
            setLoading(false);
            return;
          }
          sessionStorage.setItem('data', JSON.stringify(data));
          sessionStorage.setItem('fileName', 'json_data.json');
          router.push('/analysis');
          setLoading(false);
        } catch (err) {
          setError('Invalid JSON format');
          setLoading(false);
        }
      } else {
        setError('Please upload a file (CSV, XLSX, or XLS) or paste JSON data');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-6 shadow-xl shadow-blue-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Data Health Analyzer AI
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze your data quality with powerful insights and beautiful visualizations
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">Upload File (CSV / Excel)</label>
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  file 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className={`text-6xl mb-6 ${file ? 'text-blue-500' : 'text-gray-400'}`}>
                  {file ? '✅' : '📁'}
                </div>
                <p className={`text-lg font-medium mb-2 ${file ? 'text-blue-700' : 'text-gray-700'}`}>
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  CSV, XLSX, or XLS files
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-6 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Or
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 tracking-wide uppercase">Paste JSON Data</label>
              <textarea
                className="w-full h-52 p-6 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none resize-none text-base leading-relaxed transition-all duration-200 font-mono"
                placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": null}]'
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value);
                  setFile(null);
                  setError(null);
                }}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-5 rounded-2xl flex items-start gap-3">
                <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              className={`w-full font-bold text-lg py-5 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:-translate-y-0.5'
              }`}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>Analyze Data</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
