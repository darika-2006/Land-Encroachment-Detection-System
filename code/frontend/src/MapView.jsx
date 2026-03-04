import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, CheckCircle, AlertTriangle, Loader, Maximize2 } from 'lucide-react';
import { translations, translateAPIResponse } from './translations';

// Helper to get polygon centroid
const getPolygonCentroid = (coordinates) => {
  const coords = coordinates[0];
  const x = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
  const y = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
  return { lon: x, lat: y };
};

export default function MapView({ onBack, geojsonData, theme = 'dark', language = 'en' }) {
  const [loading, setLoading] = useState(true);
  const [landParcels, setLandParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [verified, setVerified] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [satelliteLayer, setSatelliteLayer] = useState('visible');

  const t = translations[language];

  useEffect(() => {
    // Calculate map bounds
    let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
    geojsonData.features.forEach(feature => {
      feature.geometry.coordinates[0].forEach(coord => {
        minLon = Math.min(minLon, coord[0]);
        maxLon = Math.max(maxLon, coord[0]);
        minLat = Math.min(minLat, coord[1]);
        maxLat = Math.max(maxLat, coord[1]);
      });
    });
    
    const centerLon = (minLon + maxLon) / 2;
    const centerLat = (minLat + maxLat) / 2;
    
    setMapBounds({ minLon, maxLon, minLat, maxLat, centerLon, centerLat });

    // Process government lands and fetch encroachment data
    const governmentLands = geojsonData.features.filter(feature => {
      const landType = (feature.properties.land_type || '').trim();
      return landType.toLowerCase() === 'public';
    });

    const fetchPromises = governmentLands.map(async (feature) => {
      const centroid = getPolygonCentroid(feature.geometry.coordinates);
      try {
        const response = await fetch('http://127.0.0.1:8000/getinfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lat: centroid.lat, 
            lon: centroid.lon,
            language: language // Pass language to API
          })
        });
        const data = await response.json();
        return {
          ...feature,
          centroid,
          apiData: data,
          hasEncroachment: data.current_activity?.includes('ENCROACHMENT') || data.current_activity?.includes('BUILDING DETECTED')
        };
      } catch (err) {
        return {
          ...feature,
          centroid,
          apiData: null,
          hasEncroachment: false,
          error: err.message
        };
      }
    });

    Promise.all(fetchPromises).then(results => {
      setLandParcels(results);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [geojsonData]);

  const handleMarkerClick = (parcel) => {
    setSelectedParcel(parcel);
    setShowAlert(true);
    setVerified(false);
  };

  const handleVerify = () => {
    setVerified(true);
  };

  const handleFalseAlarm = () => {
    setShowAlert(false);
    setSelectedParcel(null);
    setVerified(false);
  };

  // Google Maps embed URL with satellite view
  const googleMapsUrl = mapBounds 
    ? `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${mapBounds.centerLat},${mapBounds.centerLon}&zoom=17&maptype=satellite`
    : '';

  // For demo, use OpenStreetMap tile server with custom styling
  const getTileUrl = (z, x, y) => {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-4 flex items-center justify-between z-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">{t.backToDashboard}</span>
        </button>
        <h1 className="text-lg font-semibold text-white">{t.satelliteMap}</h1>
        <div className="flex items-center gap-3">
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">
            <Maximize2 size={16} className="inline mr-2" />
            {t.fullscreen}
          </button>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-sm">
            <div className="text-center">
              <Loader className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
              <p className="text-white text-lg font-semibold">{t.analyzing}</p>
              <p className="text-gray-400 text-sm mt-2">{t.loading}</p>
            </div>
          </div>
        )}

        {/* Satellite Background using Static Map API approach */}
        <div className="absolute inset-0">
          {/* Using ArcGIS World Imagery as high-quality satellite base */}
          <iframe
            title="Satellite Map"
            src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d500!2d${mapBounds?.centerLon || 78.012}!3d${mapBounds?.centerLat || 8.379}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin`}
            className="w-full h-full border-0"
            loading="lazy"
          ></iframe>
        </div>

        {/* SVG Overlay for Polygons */}
        {!loading && mapBounds && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {geojsonData.features.map((feature, idx) => {
              const coords = feature.geometry.coordinates[0];
              const landType = (feature.properties.land_type || '').trim();
              const isPublic = landType.toLowerCase() === 'public';
              const surveyNo = feature.properties.survey_no;
              
              // Convert lat/lon to screen coordinates (simple mercator projection)
              const toScreen = (lon, lat) => {
                const x = ((lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 100;
                const y = 100 - ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
                return `${x}%,${y}%`;
              };

              const points = coords.map(coord => toScreen(coord[0], coord[1])).join(' ');
              const centroid = coords.reduce((acc, c) => {
                const [x, y] = toScreen(c[0], c[1]).split(',').map(v => parseFloat(v));
                return [acc[0] + x / coords.length, acc[1] + y / coords.length];
              }, [0, 0]);

              return (
                <g key={idx} className="pointer-events-auto">
                  <polygon
                    points={points}
                    fill={isPublic ? "rgba(16, 185, 129, 0.25)" : "rgba(100, 100, 100, 0.15)"}
                    stroke={isPublic ? "#10b981" : "#6b7280"}
                    strokeWidth="2"
                    strokeDasharray={isPublic ? "8,4" : "none"}
                    className="transition-all hover:fill-opacity-40 cursor-pointer"
                    filter={isPublic ? "url(#glow)" : "none"}
                  />
                  {isPublic && (
                    <text
                      x={`${centroid[0]}%`}
                      y={`${centroid[1]}%`}
                      fill="#10b981"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-lg"
                      style={{ textShadow: '0 0 4px black, 0 0 8px black' }}
                    >
                      {surveyNo}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}

        {/* Encroachment Markers */}
        {!loading && landParcels.map((parcel, idx) => {
          if (!parcel.hasEncroachment) return null;
          
          const screenX = ((parcel.centroid.lon - mapBounds.minLon) / (mapBounds.maxLon - mapBounds.minLon)) * 100;
          const screenY = 100 - ((parcel.centroid.lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
          
          return (
            <button
              key={idx}
              onClick={() => handleMarkerClick(parcel)}
              className="absolute z-20 group"
              style={{
                left: `${screenX}%`,
                top: `${screenY}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative bg-red-500 p-3 rounded-full shadow-2xl border-3 border-red-300 group-hover:scale-125 transition-transform">
                  <AlertTriangle size={24} className="text-white" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-6 right-6 bg-black/90 backdrop-blur-xl px-5 py-4 rounded-xl border border-gray-700 shadow-2xl z-30 space-y-3">
          <h4 className="text-white font-bold text-sm mb-2">{t.mapLegend}</h4>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 bg-emerald-400/30 rounded"></div>
            <span className="text-xs text-gray-300">{t.govtLand}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-500 bg-gray-500/20 rounded"></div>
            <span className="text-xs text-gray-300">{t.privateLand}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-lg"></div>
            <span className="text-xs text-gray-300">{t.encroachmentAlert}</span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="absolute top-6 left-6 bg-black/90 backdrop-blur-xl px-5 py-4 rounded-xl border border-gray-700 shadow-2xl z-30">
          <h4 className="text-emerald-400 font-bold text-sm mb-2">{t.activeMonitoring}</h4>
          <p className="text-white text-xs mb-1">{landParcels.length} {t.govtParcelsCount}</p>
          <p className="text-gray-400 text-xs">{t.source}: {t.sentinelResolution}</p>
          <p className="text-gray-400 text-xs mt-2">{t.analysis}: 2019 vs 2026</p>
        </div>

        {/* Alert Detail Modal */}
        {showAlert && selectedParcel && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4">
            <div className="bg-gray-900/98 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-emerald-400">{t.satelliteReport}</h3>
                <button onClick={() => { setShowAlert(false); setSelectedParcel(null); }} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {selectedParcel.error ? (
                <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                  <strong>Error:</strong> {selectedParcel.error}
                </div>
              ) : selectedParcel.apiData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoBox label={t.surveyNo} value={selectedParcel.apiData.survey_no || selectedParcel.properties.survey_no} />
                    <InfoBox label={t.landType} value={translateAPIResponse(language, selectedParcel.apiData.land_type) || translateAPIResponse(language, 'Public (Poramboke)')} />
                    <InfoBox 
                      label={t.currentStatus} 
                      value={translateAPIResponse(language, selectedParcel.apiData.current_activity) || 'N/A'} 
                      valueClass={selectedParcel.hasEncroachment ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}
                    />
                    <InfoBox label={t.temporalAnalysis} value={translateAPIResponse(language, selectedParcel.apiData.temporal_history) || 'N/A'} />
                  </div>

                  {selectedParcel.apiData.analysis_details && (
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 space-y-3">
                      <h4 className="text-white font-semibold mb-3">{t.spectralAnalysis}</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs mb-1">{t.baselineNDBI}</p>
                          <p className="text-white text-lg font-bold">{selectedParcel.apiData.analysis_details['2020_ndbi']?.toFixed(3) || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs mb-1">{t.currentNDBI}</p>
                          <p className="text-yellow-400 text-lg font-bold">{selectedParcel.apiData.analysis_details['2026_ndbi']?.toFixed(3) || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedParcel.apiData.risk_score !== undefined && (
                    <div className={`p-4 rounded-xl border ${selectedParcel.apiData.risk_score > 0.5 ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                      <p className="text-xs text-gray-400 mb-1">{t.riskScore}</p>
                      <p className={`text-2xl font-bold ${selectedParcel.apiData.risk_score > 0.5 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {selectedParcel.apiData.risk_score}
                      </p>
                    </div>
                  )}

                  {selectedParcel.hasEncroachment && !verified ? (
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={handleFalseAlarm}
                        className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition-colors font-medium"
                      >
                        {t.markFalse}
                      </button>
                      <button 
                        onClick={handleVerify}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium shadow-lg"
                      >
                        {t.verifyEncroachment}
                      </button>
                    </div>
                  ) : verified ? (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-500/30">
                        <CheckCircle size={24} />
                        <span className="font-medium">{t.verificationRecorded}</span>
                      </div>
                      <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors font-medium shadow-lg">
                        {t.generateNotice}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-500/30 text-emerald-400">
                      ✓ {t.noEncroachment}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Loader className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">{t.fetchingData}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
      <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">{label}</p>
      <p className={`${valueClass} font-semibold text-sm`}>{value}</p>
    </div>
  );
}
