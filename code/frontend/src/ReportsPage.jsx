import React from 'react';
import { ArrowLeft, FileText, Download, Calendar } from 'lucide-react';
import { translations } from './translations';

export default function ReportsPage({ onBack, landParcels, theme, language }) {
  const t = translations[language];
  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const headerBg = theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200';
  const cardBg = theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200';

  const reports = [
    { id: 1, title: t.monthlyReport, date: `${t.february} 2026`, status: 'completed', parcels: 18 },
    { id: 2, title: t.quarterlyAnalysis, date: `${t.q1} 2026`, status: 'completed', parcels: 18 },
    { id: 3, title: t.annualSurvey, date: '2025', status: 'completed', parcels: 18 },
    { id: 4, title: t.temporalChange, date: '2019-2026', status: 'completed', parcels: 18 },
  ];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`${headerBg} backdrop-blur-sm border-b p-4 sticky top-0 z-40`}>
        <button onClick={onBack} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-medium">
          <ArrowLeft size={20} />
          {t.backToDashboard}
        </button>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t.generatedReports}</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          {t.viewDownload}
        </p>

        <div className="space-y-4">
          {reports.map(report => (
            <div key={report.id} className={`${cardBg} backdrop-blur-xl border rounded-xl p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                    <FileText size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{report.title}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        <Calendar size={14} className="inline mr-1" />
                        {report.date}
                      </span>
                      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {report.parcels} {t.parcelsAnalyzed}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                  <Download size={16} />
                  {t.downloadPDF}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} border rounded-xl p-8 mt-6`}>
          <h3 className="text-xl font-bold mb-4">{t.generateNewReport}</h3>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-colors">
            {t.createCustomReport}
          </button>
        </div>
      </div>
    </div>
  );
}
