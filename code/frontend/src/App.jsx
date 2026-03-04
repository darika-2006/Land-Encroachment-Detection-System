import React, { useState, useEffect } from 'react';
import { Menu, MapPin, AlertTriangle, CheckCircle, FileText, Bell, Settings as SettingsIcon, LogOut, X, Loader, Map as MapIcon, Sun, Moon, Globe, MessageCircle, Phone, Wifi, WifiOff } from 'lucide-react';
import MapView from './MapViewNew';
import AlertsPage from './AlertsPage';
import ReportsPage from './ReportsPage';
import SettingsPage from './SettingsPage';
import { translations, t as translate } from './translations';

// Land_Enroachement GeoJSON data
const GEOJSON_DATA = {
  "type": "FeatureCollection",
  "name": "Land_Enroachement",
  "features": [
    { "type": "Feature", "properties": { "survey_no": "123", "land_type": "Private", "owner": "Nagammal" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012077536358291, 8.38036386613719 ], [ 78.012241938997633, 8.380353275156333 ], [ 78.012310758707144, 8.380124055999937 ], [ 78.012001834677847, 8.380070344560918 ], [ 78.012077536358291, 8.38036386613719 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "124", "land_type": "Private", "owner": "Ravikumar" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012264114237354, 8.380378996109345 ], [ 78.012304641399624, 8.380183062924397 ], [ 78.012383401733842, 8.380159611455491 ], [ 78.012430046203605, 8.380202731897228 ], [ 78.012399459666057, 8.380394126080912 ], [ 78.012303876736183, 8.380409256051889 ], [ 78.012264114237354, 8.380378996109345 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "125", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012449075888327, 8.380302614007816 ], [ 78.012451260641015, 8.380189499417623 ], [ 78.012559041773358, 8.380183735615969 ], [ 78.012623856102948, 8.38022192080034 ], [ 78.012645703629758, 8.380344401555105 ], [ 78.01251243371614, 8.380345122030018 ], [ 78.012449075888327, 8.380302614007816 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "126", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012042256358555, 8.380713140454381 ], [ 78.012224855535848, 8.381160748975949 ], [ 78.01244194566884, 8.381224979752918 ], [ 78.012736133232238, 8.381030280177569 ], [ 78.012543389656216, 8.380675003381638 ], [ 78.012198480099116, 8.380592707580353 ], [ 78.012042256358555, 8.380713140454381 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "420", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.010680277412106, 8.38077894503926 ], [ 78.010680277412106, 8.38077894503926 ], [ 78.011810673347142, 8.380411733751432 ], [ 78.011793801766018, 8.38005704070105 ], [ 78.011338269075779, 8.379981929190061 ], [ 78.010865864804444, 8.379852570442678 ], [ 78.010309102627517, 8.380036176393894 ], [ 78.010680277412106, 8.38077894503926 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "429", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.011461840474283, 8.379706558530494 ], [ 78.011551975351324, 8.379752796171219 ], [ 78.011742260091708, 8.379706558530494 ], [ 78.011738921762941, 8.379675182985435 ], [ 78.011677162680527, 8.37952491060299 ], [ 78.011440141337232, 8.379586010369893 ], [ 78.011461840474283, 8.379706558530494 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "548", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012322073327738, 8.379648754117101 ], [ 78.01231108752232, 8.379590335803323 ], [ 78.012304221393975, 8.379540068875148 ], [ 78.012286369460213, 8.379450403527672 ], [ 78.012276756880482, 8.379411005110889 ], [ 78.012286369460213, 8.379319981167178 ], [ 78.012377002354697, 8.379329491132447 ], [ 78.012478621054569, 8.379311829768193 ], [ 78.012588479108473, 8.379284658437015 ], [ 78.012636542007087, 8.379260204237337 ], [ 78.012703830065107, 8.379402853713808 ], [ 78.012703830065107, 8.379402853713808 ], [ 78.012747773286677, 8.379497953335726 ], [ 78.012551402015291, 8.379652829813084 ], [ 78.012322073327738, 8.379648754117101 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "09", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.01287539255955, 8.379689485907864 ], [ 78.01287539255955, 8.379689485907864 ], [ 78.012761775293711, 8.379739666393107 ], [ 78.012863219281101, 8.379974510977993 ], [ 78.012887565838042, 8.380145124476376 ], [ 78.012986980945684, 8.380117023434732 ], [ 78.012956547749482, 8.379942395487575 ], [ 78.012940316711493, 8.37997852541411 ], [ 78.01287539255955, 8.379689485907864 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "44", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.011828299315624, 8.379331132344008 ], [ 78.012019922355989, 8.379274360480784 ], [ 78.012060911241633, 8.379147637541918 ], [ 78.012060911241633, 8.379147637541918 ], [ 78.012030169577415, 8.379086810516595 ], [ 78.012003526801749, 8.379002666449223 ], [ 78.011888757921966, 8.379000638881109 ], [ 78.011888757921966, 8.379000638881109 ], [ 78.011888757921966, 8.379000638881109 ], [ 78.011829324037777, 8.379035107537593 ], [ 78.011789359874257, 8.379163858080398 ], [ 78.011840595981312, 8.379251043463132 ], [ 78.011840595981312, 8.379251043463132 ], [ 78.011828299315624, 8.379331132344008 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "082", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.011812997709256, 8.379021326134586 ], [ 78.011963207057292, 8.378963072587402 ], [ 78.01193677021206, 8.378832299286449 ], [ 78.011909131692036, 8.378763346073695 ], [ 78.011768316754839, 8.378738016629894 ], [ 78.011768316754839, 8.378738016629894 ], [ 78.011812997709256, 8.379021326134586 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "812", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.011599495592151, 8.378221107248063 ], [ 78.01173527226068, 8.378241256392245 ], [ 78.01178053115018, 8.37819200292685 ], [ 78.011558762591577, 8.377858422474368 ], [ 78.011554236702622, 8.377858422474368 ], [ 78.011554236702622, 8.377858422474368 ], [ 78.011850682428914, 8.377809168960505 ], [ 78.011850682428914, 8.377809168960505 ], [ 78.01188688954052, 8.378046481288123 ], [ 78.01188688954052, 8.378046481288123 ], [ 78.01193214843002, 8.378185286544722 ], [ 78.01193214843002, 8.378185286544722 ], [ 78.011556499647114, 8.377869616453918 ], [ 78.011556499647114, 8.377869616453918 ], [ 78.01192309665214, 8.378178570162479 ], [ 78.011606284425582, 8.378216629660329 ], [ 78.011606284425582, 8.378216629660329 ], [ 78.011545184924728, 8.377869616453918 ], [ 78.011787319983611, 8.378200958102841 ], [ 78.011599495592151, 8.378221107248063 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "69", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012623460321876, 8.379082127099567 ], [ 78.012556776244807, 8.378675297922163 ], [ 78.012963826965219, 8.378594206920409 ], [ 78.013027732539044, 8.378980419845105 ], [ 78.012927706423469, 8.379084875943912 ], [ 78.012760996230824, 8.37910549227589 ], [ 78.012610957057404, 8.378984543112695 ], [ 78.012598453792975, 8.378944684857494 ], [ 78.012623460321876, 8.379082127099567 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "56", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.01226650791277, 8.378286886845268 ], [ 78.012401599433517, 8.37827734043279 ], [ 78.012393558271569, 8.378010040788388 ], [ 78.012215044476307, 8.37802436041685 ], [ 78.012099251744232, 8.378070501438312 ], [ 78.012104076441403, 8.378172329880108 ], [ 78.012157148110276, 8.378181876295161 ], [ 78.012129808159656, 8.37827097615768 ], [ 78.012261683215598, 8.378259838675982 ], [ 78.01226650791277, 8.378286886845268 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "712", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012084777652717, 8.37806095502053 ], [ 78.012047788307768, 8.377664778475884 ], [ 78.012142928953665, 8.377644608742608 ], [ 78.012251661120374, 8.377637885497956 ], [ 78.012421555130885, 8.377711841182782 ], [ 78.012197295037026, 8.377994217304616 ], [ 78.012360393287096, 8.377980770827271 ], [ 78.012421555130885, 8.377711841182782 ], [ 78.012084777652717, 8.37806095502053 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "21", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.011551434808055, 8.377827903888567 ], [ 78.011870640642883, 8.377780364172649 ], [ 78.011836317434827, 8.377437398907114 ], [ 78.011664701394594, 8.377393254841074 ], [ 78.011561731770456, 8.377556248290787 ], [ 78.011551434808055, 8.377827903888567 ] ] ] } },
    { "type": "Feature", "properties": { "survey_no": "06", "land_type": "Public", "owner": "Government" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 78.012036159563749, 8.377653717091027 ], [ 78.012032426085241, 8.377634017680251 ], [ 78.012072872102422, 8.377542907892435 ], [ 78.012257679288595, 8.377613087055209 ], [ 78.012257679288595, 8.377613087055209 ], [ 78.012036159563749, 8.377653717091027 ] ] ] } }
  ]
};

const getPolygonCentroid = (coordinates) => {
  const coords = coordinates[0] || [];
  if (!coords.length) return { lon: 0, lat: 0 };
  const x = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
  const y = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
  return { lon: x, lat: y };
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [geojsonData, setGeojsonData] = useState(GEOJSON_DATA);
  const [landParcels, setLandParcels] = useState([]);
  const [analyzedParcels, setAnalyzedParcels] = useState([]);
  const [dismissedParcels, setDismissedParcels] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsAnalyzedOnce, setAlertsAnalyzedOnce] = useState(false);
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [language, setLanguage] = useState('en'); // 'en' or 'ta'
  const [whatsappStatus, setWhatsappStatus] = useState(null);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappQuery, setWhatsappQuery] = useState('');
  const [whatsappResponse, setWhatsappResponse] = useState(null);
  const [showWhatsappPanel, setShowWhatsappPanel] = useState(false);

  useEffect(() => {
    const loadGeoJson = async () => {
      try {
        const response = await fetch('/Land_Enroachement.geojson');
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        const data = await response.json();
        if (data?.features?.length) {
          setGeojsonData(data);
        }
      } catch (error) {
        console.warn('Using bundled fallback GeoJSON data:', error.message);
      }
    };

    loadGeoJson();
  }, []);

  useEffect(() => {
    // Filter only government lands
    const governmentLands = (geojsonData?.features || []).filter(feature => {
      const landType = (feature.properties.land_type || '').trim();
      return landType.toLowerCase() === 'public';
    });

    setLandParcels(governmentLands);
    setLoading(false);
  }, [geojsonData]);

  const handleMapDataUpdate = (parcels, dismissed) => {
    setAnalyzedParcels(parcels);
    setDismissedParcels(dismissed);
    if (parcels.length > 0) {
      setAlertsAnalyzedOnce(true);
    }
  };

  useEffect(() => {
    if (currentPage !== 'alerts') return;
    if (alertsAnalyzedOnce || alertsLoading) return;
    if (landParcels.length === 0) return;

    let cancelled = false;

    const analyzeForAlerts = async () => {
      setAlertsLoading(true);
      try {
        const results = [];
        for (let i = 0; i < landParcels.length; i += 3) {
          const batch = landParcels.slice(i, i + 3);
          const batchResults = await Promise.all(
            batch.map(async (feature) => {
              const centroid = getPolygonCentroid(feature.geometry.coordinates);
              try {
                const res = await fetch('http://127.0.0.1:8000/getinfo', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lat: centroid.lat, lon: centroid.lon, language }),
                });
                const data = await res.json();
                const risk = data?.risk_assessment || {};
                const night = data?.enhanced_detection?.nighttime_lights?.nighttime_lights_detected === true;
                const hasEncroachment =
                  (risk.encroachment_score || 0) >= 15 ||
                  risk.alert_color === 'RED' ||
                  risk.alert_color === 'ORANGE' ||
                  risk.alert_color === 'YELLOW' ||
                  night;
                return { ...feature, centroid, apiData: data, hasEncroachment };
              } catch (error) {
                return { ...feature, centroid, apiData: null, hasEncroachment: false, error: error.message };
              }
            })
          );
          results.push(...batchResults);
        }

        if (!cancelled) {
          setAnalyzedParcels(results);
        }
      } finally {
        if (!cancelled) {
          setAlertsLoading(false);
          setAlertsAnalyzedOnce(true);
        }
      }
    };

    analyzeForAlerts();
    return () => {
      cancelled = true;
    };
  }, [currentPage, alertsAnalyzedOnce, alertsLoading, landParcels, language]);

  const activeAlerts = analyzedParcels.filter(p => {
    if (!p?.apiData) return false;
    if (dismissedParcels.includes(p.properties.survey_no)) return false;
    const risk = p.apiData.risk_assessment || {};
    const night = p.apiData.enhanced_detection?.nighttime_lights?.nighttime_lights_detected === true;
    return risk.alert_color === 'RED' || risk.alert_color === 'ORANGE' || (risk.encroachment_score || 0) >= 30 || night;
  });
  const encroachmentCount = activeAlerts.length;
  const totalGovtLand = landParcels.length;
  const analysisPercent = totalGovtLand > 0 ? Math.round((analyzedParcels.length / totalGovtLand) * 100) : 0;
  const t = translations[language];

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ta' : 'en');
  };

  // WhatsApp bot functions
  const checkWhatsappStatus = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/whatsapp/status');
      const data = await res.json();
      setWhatsappStatus(data);
    } catch (err) {
      setWhatsappStatus({ connected: false, error: err.message });
    }
  };

  const sendWhatsappQuery = async () => {
    if (!whatsappQuery.trim()) return;
    setWhatsappLoading(true);
    setWhatsappResponse(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/whatsapp/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: whatsappQuery, query_type: 'text' }),
      });
      const data = await res.json();
      setWhatsappResponse(data);
    } catch (err) {
      setWhatsappResponse({ status: 'error', message: err.message });
    } finally {
      setWhatsappLoading(false);
    }
  };

  useEffect(() => {
    checkWhatsappStatus();
  }, []);

  if (currentPage === 'map') {
    return <MapView onBack={() => setCurrentPage('dashboard')} geojsonData={geojsonData} theme={theme} language={language} onDataUpdate={handleMapDataUpdate} />;
  }

  if (currentPage === 'alerts') {
    return <AlertsPage onBack={() => setCurrentPage('dashboard')} analyzedParcels={analyzedParcels} dismissedParcels={dismissedParcels} landParcels={landParcels} theme={theme} language={language} alertsLoading={alertsLoading} onViewMap={() => setCurrentPage('map')} />;
  }

  if (currentPage === 'reports') {
    return <ReportsPage onBack={() => setCurrentPage('dashboard')} landParcels={landParcels} theme={theme} language={language} />;
  }

  if (currentPage === 'settings') {
    return <SettingsPage onBack={() => setCurrentPage('dashboard')} theme={theme} language={language} onToggleTheme={toggleTheme} onToggleLanguage={toggleLanguage} />;
  }

  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-stone-100 text-stone-800';
  const sidebarBg = theme === 'dark' ? 'from-gray-900 to-black border-gray-800' : 'from-stone-50 to-white border-stone-200';
  const headerBg = theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white/90 border-stone-200';

  return (
    <div className={`flex h-screen ${bgClass} font-sans overflow-hidden`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b ${sidebarBg} border-r transition-transform duration-300`}>
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <img src="/nizhan.jpeg" alt="Nizhan Logo" className="h-12 w-auto" />
            <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>
              <X size={24} />
            </button>
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-emerald-500' : 'text-rose-900'}`}>Nizhan</h1>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'} mb-8`}>Nizhan Land Intelligence</p>
          
          {/* Theme and Language Toggles */}
          <div className="mb-6 space-y-3">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-rose-100 text-rose-900'} hover:opacity-80 transition-opacity`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-rose-100 text-rose-900'} hover:opacity-80 transition-opacity`}
            >
              <Globe size={18} />
              <span className="text-sm">{language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>
          </div>
          
          <nav className="flex-1 space-y-2">
            <NavItem 
              icon={<MapPin size={20} />} 
              label={t.dashboard} 
              active={currentPage === 'dashboard'} 
              onClick={() => setCurrentPage('dashboard')}
              theme={theme}
            />
            <NavItem 
              icon={<AlertTriangle size={20} />} 
              label={t.alerts} 
              badge={encroachmentCount.toString()} 
              active={currentPage === 'alerts'}
              onClick={() => setCurrentPage('alerts')}
              theme={theme}
            />
            <NavItem 
              icon={<FileText size={20} />} 
              label={t.reports}
              active={currentPage === 'reports'}
              onClick={() => setCurrentPage('reports')}
              theme={theme}
            />
            <NavItem 
              icon={<Bell size={20} />} 
              label={t.notifications}
              theme={theme}
            />
            <NavItem 
              icon={<SettingsIcon size={20} />} 
              label={t.settings}
              active={currentPage === 'settings'}
              onClick={() => setCurrentPage('settings')}
              theme={theme}
            />
          </nav>
          
          <button className={`flex items-center gap-3 ${theme === 'dark' ? 'text-gray-400 hover:text-red-400' : 'text-stone-500 hover:text-red-600'} mt-auto transition-colors`}>
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${headerBg} backdrop-blur-sm border-b p-4 flex items-center justify-between sticky top-0 z-40`}>
          <button onClick={() => setSidebarOpen(true)} className={`lg:hidden ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}>
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold">{t.monitoring}</h2>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'}`}>{t.officer}: A. Kumar</span>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${theme === 'dark' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-100 text-rose-900'}`}>AK</div>
          </div>
        </header>

        {/* Dashboard Content with Blurred Map Background - SCROLLABLE */}
        <div className="flex-1 relative overflow-y-auto">
          {/* Blurred Map Background */}
          <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black' : 'bg-gradient-to-br from-stone-100 via-stone-50 to-white'}`}>
            <div className="absolute inset-0 opacity-10 blur-3xl">
              <svg className="w-full h-full" viewBox="0 0 1000 800">
                {landParcels.slice(0, 5).map((feature, idx) => {
                  const coords = feature.geometry.coordinates[0];
                  const points = coords.map(c => `${c[0] * 50},${c[1] * 100}`).join(' ');
                  return (
                    <polygon
                      key={idx}
                      points={points}
                      fill={theme === 'dark' ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 0.5)"}
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Content Layer */}
          <div className="relative z-10 p-6 space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard 
                title={t.govtParcels} 
                value={loading ? '...' : totalGovtLand.toString()} 
                icon={<MapPin className={theme === 'dark' ? 'text-emerald-500' : 'text-rose-900'} size={24} />} 
                subtitle={t.totalParcels}
                theme={theme}
              />
              <MetricCard 
                title={t.activeAlerts} 
                value={loading ? '...' : encroachmentCount.toString()} 
                icon={<AlertTriangle className="text-yellow-500" size={24} />} 
                subtitle={t.requiresAttention}
                theme={theme}
              />
              <MetricCard 
                title={t.analysisComplete} 
                value={loading ? '...' : `${analysisPercent}%`} 
                icon={<CheckCircle className={theme === 'dark' ? 'text-emerald-500' : 'text-rose-900'} size={24} />} 
                subtitle={t.allScanned}
                theme={theme}
              />
            </div>

            {/* Map Access Card */}
            <div className={`bg-gradient-to-br ${theme === 'dark' ? 'from-emerald-900/40 to-gray-900/40 border-emerald-500/30' : 'from-rose-50 to-white border-rose-200'} backdrop-blur-xl border rounded-2xl p-8 shadow-2xl`}>
              <div className="flex items-start justify-between flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-rose-100'}`}>
                      <MapIcon size={32} className={theme === 'dark' ? 'text-emerald-500' : 'text-rose-900'} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-stone-800'}`}>{t.interactiveMap}</h3>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-emerald-500' : 'text-rose-700'}`}>{t.poweredBy}</p>
                    </div>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-stone-600'} mb-6 leading-relaxed`}>
                    {t.mapDescription}
                  </p>
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge text="Real-time Satellite Data" theme={theme} />
                    <Badge text="NDBI Analysis" theme={theme} />
                    <Badge text="Temporal Comparison (2019-2026)" theme={theme} />
                    <Badge text="AI Detection" theme={theme} />
                  </div>
                  <button
                    onClick={() => setCurrentPage('map')}
                    className={`group text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-3 ${theme === 'dark' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-900 hover:bg-rose-950'}`}
                  >
                    <MapIcon size={24} />
                    <span>{t.openMap}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:block">
                  <div className={`w-48 h-48 ${theme === 'dark' ? 'bg-gray-800/50 border-emerald-500/30' : 'bg-stone-100 border-rose-200'} rounded-xl border-2 overflow-hidden relative`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme === 'dark' ? 'from-emerald-500/20' : 'from-rose-300/20'} to-transparent`}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MapIcon size={64} className={`${theme === 'dark' ? 'text-emerald-400/30' : 'text-rose-800/30'}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
              {/* WhatsApp Bot Card */}
              <div className={`${theme === 'dark' ? 'bg-gradient-to-br from-green-900/40 to-gray-900/40 border-green-500/30' : 'bg-gradient-to-br from-rose-50 to-white border-rose-200'} backdrop-blur-xl border rounded-xl p-5 transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-rose-100'}`}>
                      <MessageCircle size={24} className={theme === 'dark' ? 'text-green-500' : 'text-rose-900'} />
                    </div>
                    <div>
                      <h4 className={`${theme === 'dark' ? 'text-white' : 'text-stone-800'} font-bold text-sm`}>WhatsApp Bot</h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {whatsappStatus?.connected ? (
                          <>
                            <Wifi size={12} className="text-green-400" />
                            <span className="text-green-400 text-xs">Connected</span>
                          </>
                        ) : (
                          <>
                            <WifiOff size={12} className="text-red-400" />
                            <span className="text-red-400 text-xs">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWhatsappPanel(!showWhatsappPanel)}
                    className={`${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-900 hover:bg-rose-950'} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors`}
                  >
                    <Phone size={16} />
                    {showWhatsappPanel ? 'Close' : 'Connect'}
                  </button>
                </div>

                {showWhatsappPanel && (
                  <div className="space-y-3 mt-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={whatsappQuery}
                        onChange={(e) => setWhatsappQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendWhatsappQuery()}
                        placeholder="Enter survey number or query..."
                        className={`flex-1 px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-stone-300 text-stone-800 placeholder-stone-400'} border focus:outline-none focus:ring-2 ${theme === 'dark' ? 'focus:ring-green-500' : 'focus:ring-rose-800'}`}
                      />
                      <button
                        onClick={sendWhatsappQuery}
                        disabled={whatsappLoading}
                        className={`${theme === 'dark' ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-900 hover:bg-rose-950'} text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors`}
                      >
                        {whatsappLoading ? '...' : 'Send'}
                      </button>
                    </div>
                    {whatsappResponse && (
                      <div className={`p-3 rounded-lg text-sm ${
                        whatsappResponse.status === 'error'
                          ? (theme === 'dark' ? 'bg-red-900/30 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-700')
                          : whatsappResponse.result?.is_government
                            ? (theme === 'dark' ? 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700')
                            : (theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 border-gray-200 text-gray-700')
                      } border`}>
                        <p className="whitespace-pre-line">{whatsappResponse.message}</p>
                        {whatsappResponse.result && (
                          <div className="mt-2 pt-2 border-t border-current/10 space-y-1">
                            <p><span className="font-medium">Survey:</span> {whatsappResponse.result.survey_no}</p>
                            <p><span className="font-medium">Type:</span> {whatsappResponse.result.land_type}</p>
                            <p><span className="font-medium">Owner:</span> {whatsappResponse.result.owner}</p>
                            {whatsappResponse.result.is_government && (
                              <p className="font-bold text-yellow-400 mt-1">⚠️ Government (Poramboke) Land</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-stone-400'}`}>
                      Try: "hi", "126", "420", or any survey number
                    </p>
                  </div>
                )}
              </div>

              <StatsCard
                title={t.latestScan}
                value="2 hours ago"
                description={t.nextScan}
                icon={<Bell size={20} className="text-blue-500" />}
                theme={theme}
              />
              <StatsCard
                title={t.dataSource}
                value="Sentinel-2 SR"
                description={t.resolution}
                icon={<FileText size={20} className="text-purple-500" />}
                theme={theme}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Badge({ text, theme }) {
  return (
    <span className={`${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-50 border-rose-300 text-rose-800'} border px-3 py-1 rounded-full text-xs font-medium`}>
      {text}
    </span>
  );
}

function StatsCard({ title, value, description, icon, theme }) {
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900/40 border-gray-700 hover:border-gray-600' : 'bg-white border-stone-200 shadow-sm hover:border-stone-300'} backdrop-blur-xl border rounded-xl p-5 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className={`${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'} text-sm font-medium`}>{title}</h4>
        {icon}
      </div>
      <p className={`${theme === 'dark' ? 'text-white' : 'text-stone-800'} text-xl font-bold mb-1`}>{value}</p>
      <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-stone-500'} text-xs`}>{description}</p>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick, theme }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${
        active 
          ? theme === 'dark' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-100 text-rose-900'
          : theme === 'dark' 
            ? 'text-gray-400 hover:bg-gray-800 hover:text-white' 
            : 'text-stone-500 hover:bg-rose-50 hover:text-rose-900'
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      {badge && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function MetricCard({ title, value, icon, subtitle, theme }) {
  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900/50 border-gray-800 hover:border-gray-700' : 'bg-white border-stone-200 shadow-sm hover:border-stone-300'} backdrop-blur-xl border rounded-xl p-6 flex items-start gap-4 shadow-lg hover:shadow-rose-900/10 transition-all`}>
      <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-rose-50'} p-3 rounded-lg`}>{icon}</div>
      <div className="flex-1">
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-stone-500'} text-xs uppercase tracking-wide mb-1`}>{title}</p>
        <p className={`${theme === 'dark' ? 'text-white' : 'text-stone-800'} text-3xl font-bold mb-1`}>{value}</p>
        {subtitle && <p className={`${theme === 'dark' ? 'text-gray-500' : 'text-stone-500'} text-xs`}>{subtitle}</p>}
      </div>
    </div>
  );
}
