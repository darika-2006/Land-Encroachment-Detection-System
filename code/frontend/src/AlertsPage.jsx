import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Clock, X, Shield, Zap, Leaf, Moon, MapPin, Eye } from 'lucide-react';
import { translations } from './translations';

export default function AlertsPage({ onBack, analyzedParcels = [], dismissedParcels = [], landParcels = [], theme, language, alertsLoading = false, onViewMap }) {
  const t = translations[language];
  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-stone-100 text-stone-800';
  const headerBg = theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-stone-200';
  const cardBg = theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-stone-200 shadow-sm';
  const modalBg = theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-stone-200';
  const subText = theme === 'dark' ? 'text-gray-400' : 'text-stone-500';

  const [detailParcel, setDetailParcel] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all'); // all, high, medium, low

  // Build alerts from analyzedParcels (real API data)
  const allAlerts = analyzedParcels
    .filter(p => p.apiData)
    .map((p, idx) => {
      const api = p.apiData;
      const surveyNo = p.properties.survey_no || 'N/A';
      const isDismissed = dismissedParcels.includes(surveyNo);
      const risk = api.risk_assessment || {};
      const enhanced = api.enhanced_detection || {};
      const color = (risk.alert_color || 'GREEN').toUpperCase();
      const score = risk.encroachment_score || 0;
      const lightsDetected = enhanced?.nighttime_lights?.nighttime_lights_detected === true;
      const isHighEncroachment = color === 'RED' || color === 'ORANGE' || score >= 30;

      if (!isHighEncroachment && !lightsDetected) {
        return null;
      }

      const severity = isHighEncroachment ? 'high' : (color === 'YELLOW' || score >= 15) ? 'medium' : 'low';

      // Build title from detected flags
      const flags = Array.isArray(risk.flags_raised) ? [...risk.flags_raised] : [];
      if (lightsDetected && !flags.some(f => f.toLowerCase().includes('night'))) {
        flags.push('Night-time human activity detected');
      }

      let title = lightsDetected && !isHighEncroachment
        ? 'Night-time Activity Detected'
        : (api.current_activity || flags[0] || (t.newConstruction || 'Encroachment Detected'));

      return {
        id: idx + 1,
        survey_no: surveyNo,
        severity,
        color,
        score,
        status: isDismissed ? 'resolved' : 'pending',
        title,
        flags,
        api,
        parcel: p,
      };
    })
    .filter(Boolean);

  // Apply filter
  const filteredAlerts = allAlerts.filter(a => {
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const activeAlerts = allAlerts.filter(a => a.status === 'pending');
  const resolvedAlerts = allAlerts.filter(a => a.status === 'resolved');

  // If no analyzed data yet, show a prompt
  const hasData = analyzedParcels.length > 0;

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`${headerBg} backdrop-blur-sm border-b p-4 sticky top-0 z-40 flex items-center justify-between`}>
        <button onClick={onBack} className={`flex items-center gap-2 font-medium ${theme === 'dark' ? 'text-emerald-500 hover:text-emerald-600' : 'text-rose-900 hover:text-rose-700'}`}>
          <ArrowLeft size={20} />
          {t.backToDashboard}
        </button>
        {onViewMap && (
          <button onClick={onViewMap} className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm transition-colors ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-900 hover:bg-rose-950'}`}>
            <MapPin size={16} />
            {t.openMap || 'Open Map'}
          </button>
        )}
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t.encroachmentAlerts}</h1>
        <p className={`${subText} mb-6`}>
          {t.monitorManage}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title={t.totalAlerts} value={allAlerts.length} color="blue" theme={theme} />
          <StatCard title={t.pending} value={activeAlerts.length} color="red" theme={theme} />
          <StatCard title={t.resolved} value={resolvedAlerts.length} color="green" theme={theme} />
        </div>

        {!hasData ? (
          /* No data prompt */
          <div className={`${cardBg} border rounded-xl p-12 text-center`}>
            <AlertTriangle size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{alertsLoading ? (language === 'ta' ? 'பகுப்பாய்வு நடைபெறுகிறது...' : 'Analyzing Real Data...') : (language === 'ta' ? 'இன்னும் தரவு இல்லை' : 'No Analysis Data Yet')}</h3>
            <p className={`${subText} mb-6`}>
              {alertsLoading
                ? (language === 'ta' ? 'உயர் ஆபத்து மற்றும் இரவு நேர செயல்பாட்டு பகுதிகள் சர்வரில் இருந்து பெறப்படுகிறது.' : 'Fetching high-encroachment and night-time activity areas from backend.')
                : language === 'ta'
                ? 'நிலவரைபடத்தில் நிலப் பகுதிகளை பகுப்பாய்வு செய்யுங்கள். பின் இங்கே எச்சரிக்கைகள் தோன்றும்.'
                : 'Open the map and analyze land parcels first. Alerts will appear here once the satellite analysis is complete.'}
            </p>
            {onViewMap && (
              <button onClick={onViewMap} className={`text-white px-6 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2 ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-900 hover:bg-rose-950'}`}>
                <MapPin size={20} />
                {t.openMap || 'Open Map'}
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Severity filter */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-sm font-medium ${subText}`}>{language === 'ta' ? 'வடிகட்டு:' : 'Filter:'}</span>
              {['all', 'high', 'medium', 'low'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    filterSeverity === sev
                      ? theme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-rose-900 text-white'
                      : theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                  }`}
                >
                  {sev === 'all' ? (language === 'ta' ? 'அனைத்தும்' : 'All')
                    : sev === 'high' ? (language === 'ta' ? 'அதிக ஆபத்து' : '🔴 High')
                    : sev === 'medium' ? (language === 'ta' ? 'நடுத்தர ஆபத்து' : '🟠 Medium')
                    : (language === 'ta' ? 'குறைந்த ஆபத்து' : '🟡 Low')}
                </button>
              ))}
            </div>

            {/* Alert cards */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className={`${cardBg} border rounded-xl p-8 text-center`}>
                  <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                  <p className="font-medium">{language === 'ta' ? 'எச்சரிக்கைகள் இல்லை' : 'No alerts match this filter'}</p>
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <div key={alert.id} className={`${cardBg} backdrop-blur-xl border rounded-xl p-6 hover:shadow-lg transition-shadow ${alert.status === 'resolved' ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Severity icon */}
                        <div className={`p-3 rounded-lg flex-shrink-0 ${
                          alert.severity === 'high' ? 'bg-red-500/20' :
                          alert.severity === 'medium' ? 'bg-orange-500/20' : 'bg-yellow-500/20'
                        }`}>
                          <AlertTriangle size={24} className={
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-orange-500' : 'text-yellow-500'
                          } />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-lg">{alert.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              alert.status === 'pending' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                            }`}>
                              {alert.status === 'pending' ? (t.statusPending || 'Pending') : (t.statusResolved || 'Resolved')}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                              alert.color === 'RED' ? 'bg-red-600/20 text-red-400' :
                              alert.color === 'ORANGE' ? 'bg-orange-500/20 text-orange-400' :
                              alert.color === 'YELLOW' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-emerald-500/20 text-emerald-500'
                            }`}>
                              {language === 'ta' ? 'மதிப்பெண்' : 'Score'}: {alert.score}
                            </span>
                          </div>
                          <p className={`text-sm ${subText} mb-2`}>
                            {t.surveyNo}: {alert.survey_no} &nbsp;|&nbsp; {language === 'ta' ? 'நிலை' : 'Risk'}: {alert.color}
                          </p>
                          {/* Show flags as tags */}
                          {alert.flags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {alert.flags.map((flag, fi) => (
                                <span key={fi} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-stone-200 text-stone-700'}`}>
                                  {flag.toLowerCase().includes('fenc') ? <Shield size={12} /> :
                                   flag.toLowerCase().includes('agri') ? <Leaf size={12} /> :
                                   flag.toLowerCase().includes('night') ? <Moon size={12} /> :
                                   <Zap size={12} />}
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* View Details button */}
                      <button
                        onClick={() => setDetailParcel(alert)}
                        className={`text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1.5 flex-shrink-0 ml-4 ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-900 hover:bg-rose-950'}`}
                      >
                        <Eye size={16} />
                        {t.viewDetails}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailParcel && (
        <DetailModal alert={detailParcel} onClose={() => setDetailParcel(null)} theme={theme} language={language} modalBg={modalBg} subText={subText} />
      )}
    </div>
  );
}

/* ─── Detail Modal ───────────────────────────────────────── */
function DetailModal({ alert, onClose, theme, language, modalBg, subText }) {
  const t = translations[language];
  const api = alert.api;
  const risk = api.risk_assessment || {};
  const enhanced = api.enhanced_detection || {};
  const analysis = api.analysis_details || {};
  const vaoSummary = api.vao_summary || {};
  const fencingDetected = enhanced?.fencing_analysis?.fence_detected === true;
  const agriDetected = enhanced?.agricultural_pattern?.agricultural_activity === true;
  const lightsDetected = enhanced?.nighttime_lights?.nighttime_lights_detected === true;

  const riskColor = alert.color === 'RED' ? 'text-red-500' : alert.color === 'ORANGE' ? 'text-orange-500' : 'text-yellow-500';
  const riskBg = alert.color === 'RED' ? 'bg-red-500/10 border-red-500/30' : alert.color === 'ORANGE' ? 'bg-orange-500/10 border-orange-500/30' : 'bg-yellow-500/10 border-yellow-500/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className={`${modalBg} border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-inherit">
          <div>
            <h2 className="text-xl font-bold">{language === 'ta' ? 'எச்சரிக்கை விவரங்கள்' : 'Alert Details'}</h2>
            <p className={`text-sm ${subText}`}>{t.surveyNo}: {alert.survey_no}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-stone-100 text-stone-500'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Risk score banner */}
          <div className={`${riskBg} border rounded-xl p-4 flex items-center gap-4`}>
            <div className={`text-4xl font-black ${riskColor}`}>{alert.score}</div>
            <div>
              <p className={`font-semibold ${riskColor}`}>
                {alert.color === 'RED' ? (language === 'ta' ? 'அதிக ஆபத்து' : 'High Risk') :
                 alert.color === 'ORANGE' ? (language === 'ta' ? 'நடுத்தர ஆபத்து' : 'Medium Risk') :
                 (language === 'ta' ? 'குறைந்த ஆபத்து' : 'Low Risk')}
              </p>
              <p className={`text-sm ${subText}`}>{language === 'ta' ? 'ஒட்டுமொத்த ஆக்கிரமிப்பு மதிப்பெண்' : 'Overall Encroachment Score'}</p>
            </div>
          </div>

          {/* Summary / VAO summary */}
          {api.vao_summary && (
            <div>
              <h4 className="font-semibold mb-2">{language === 'ta' ? 'VAO சுருக்கம்' : 'VAO Summary'}</h4>
              <p className={`text-sm ${subText} leading-relaxed`}>{vaoSummary.officer_note || '-'}</p>
              {Array.isArray(vaoSummary.what_was_found) && vaoSummary.what_was_found.length > 0 && (
                <ul className={`text-sm ${subText} mt-2 list-disc pl-5 space-y-1`}>
                  {vaoSummary.what_was_found.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Detection flags */}
          {alert.flags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">{language === 'ta' ? 'கண்டறிந்த குறிகள்' : 'Detection Flags'}</h4>
              <div className="space-y-2">
                {alert.flags.map((flag, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-stone-100'}`}>
                    {flag.toLowerCase().includes('fenc') ? <Shield size={18} className="text-blue-400" /> :
                     flag.toLowerCase().includes('agri') ? <Leaf size={18} className="text-green-400" /> :
                     flag.toLowerCase().includes('night') ? <Moon size={18} className="text-purple-400" /> :
                     <Zap size={18} className="text-yellow-400" />}
                    <span className="text-sm font-medium">{flag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed metrics */}
          <div>
            <h4 className="font-semibold mb-2">{language === 'ta' ? 'பகுப்பாய்வு அளவீடுகள்' : 'Analysis Metrics'}</h4>
            <div className="grid grid-cols-2 gap-3">
              <MetricRow label={language === 'ta' ? 'ஆக்கிரமிப்பு மதிப்பெண்' : 'Encroachment Score'} value={risk.encroachment_score ?? 'N/A'} theme={theme} />
              <MetricRow label={language === 'ta' ? 'வேலி கண்டறிதல்' : 'Fencing Detected'} value={fencingDetected ? '✅ Yes' : '❌ No'} theme={theme} />
              <MetricRow label={language === 'ta' ? 'வேளாண்மை' : 'Agricultural Activity'} value={agriDetected ? '✅ Yes' : '❌ No'} theme={theme} />
              <MetricRow label={language === 'ta' ? 'இரவு ஒளி' : 'Nighttime Lights'} value={lightsDetected ? '✅ Yes' : '❌ No'} theme={theme} />
              <MetricRow label="NDBI (Current)" value={typeof analysis.current_ndbi === 'number' ? analysis.current_ndbi.toFixed(4) : 'N/A'} theme={theme} />
              <MetricRow label="NDBI (Baseline)" value={typeof analysis.past_ndbi === 'number' ? analysis.past_ndbi.toFixed(4) : 'N/A'} theme={theme} />
              <MetricRow label={language === 'ta' ? 'NDVI மாற்றம்' : 'NDVI Change'} value={typeof analysis.ndvi_change === 'number' ? analysis.ndvi_change.toFixed(4) : 'N/A'} theme={theme} />
              <MetricRow label={language === 'ta' ? 'விழிப்பு நிறம்' : 'Alert Color'} value={risk.alert_color || 'N/A'} theme={theme} />
            </div>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${alert.status === 'resolved' ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
            {alert.status === 'resolved' ? <CheckCircle size={18} className="text-green-500" /> : <AlertTriangle size={18} className="text-red-500" />}
            <span className="text-sm font-medium">
              {alert.status === 'resolved'
                ? (language === 'ta' ? 'தவறான எச்சரிக்கை என குறிக்கப்பட்டது' : 'Marked as False Alarm — Resolved')
                : (language === 'ta' ? 'நிலுவையில் — விசாரணை தேவை' : 'Pending — Requires Investigation')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Metric Row ─────────────────────────────────────────── */
function MetricRow({ label, value, theme }) {
  return (
    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-stone-100'}`}>
      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ title, value, color, theme }) {
  const colors = theme === 'dark' ? {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
  } : {
    blue: 'from-rose-50 to-white border-rose-200',
    red: 'from-red-100 to-white border-red-300',
    green: 'from-green-50 to-white border-green-200',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-6`}>
      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'} mb-2`}>{title}</p>
      <p className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-stone-800'}`}>{value}</p>
    </div>
  );
}
