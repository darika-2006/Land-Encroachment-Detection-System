import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, CheckCircle, Loader, Layers, RefreshCw } from 'lucide-react';
import { translations, translateAPIResponse } from './translations';

const PARCEL_CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const PARCEL_CACHE_PREFIX = 'nizhan.parcel.analysis.v1';

const getPolygonCentroid = (coordinates) => {
  const coords = coordinates[0];
  const x = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
  const y = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
  return { lon: x, lat: y };
};

const getParcelCacheKey = (surveyNo, language) => `${PARCEL_CACHE_PREFIX}:${language}:${surveyNo}`;

const isCacheFresh = (cacheEntry) => {
  if (!cacheEntry?.timestamp) return false;
  return (Date.now() - cacheEntry.timestamp) <= PARCEL_CACHE_TTL_MS;
};

const getCachedParcelData = (surveyNo, language) => {
  try {
    const raw = localStorage.getItem(getParcelCacheKey(surveyNo, language));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isCacheFresh(parsed)) return null;
    return parsed.data || null;
  } catch {
    return null;
  }
};

const setCachedParcelData = (surveyNo, language, data) => {
  try {
    localStorage.setItem(
      getParcelCacheKey(surveyNo, language),
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // ignore quota/storage errors
  }
};

const computeHasEncroachment = (data) => {
  const score = data?.risk_assessment?.encroachment_score || 0;
  const color = data?.risk_assessment?.alert_color;
  const nightActivity = data?.enhanced_detection?.nighttime_lights?.nighttime_lights_detected === true;
  return (
    data?.current_activity?.includes('ENCROACHMENT') ||
    data?.current_activity?.includes('BUILDING DETECTED') ||
    data?.current_activity?.includes('PRE-EXISTING') ||
    score >= 15 ||
    color === 'RED' ||
    color === 'ORANGE' ||
    color === 'YELLOW' ||
    nightActivity
  );
};

export default function MapView({ onBack, geojsonData, theme = 'dark', language = 'en', onDataUpdate }) {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ done: 0, total: 0 });
  const [landParcels, setLandParcels] = useState([]);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [verified, setVerified] = useState(false);
  const [showFMBOverlay, setShowFMBOverlay] = useState(true);
  const [cursorCoords, setCursorCoords] = useState(null);
  const [dismissedParcels, setDismissedParcels] = useState([]);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef({ polygons: [], labels: [], markers: [], floatingLabels: [] });
  const landParcelsRef = useRef([]);
  const t = translations[language] || translations['en'];

  useEffect(() => { landParcelsRef.current = landParcels; }, [landParcels]);

  // Push data to parent for Alerts/Reports pages
  useEffect(() => {
    if (onDataUpdate && landParcels.length > 0) {
      onDataUpdate(landParcels, dismissedParcels);
    }
  }, [landParcels, dismissedParcels]);

  useEffect(() => {
    if (!window.google) {
      console.error('Google Maps API not loaded');
      setLoading(false);
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    geojsonData.features.forEach(feature => {
      feature.geometry.coordinates[0].forEach(coord => {
        bounds.extend({ lat: coord[1], lng: coord[0] });
      });
    });
    const map = new google.maps.Map(mapContainerRef.current, {
      center: bounds.getCenter(),
      zoom: 17,
      mapTypeId: 'satellite',
      tilt: 0,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    });
    mapRef.current = map;
    map.fitBounds(bounds, { top: 80, bottom: 60, left: 60, right: 60 });
    drawAllPolygons(map);
    map.addListener('mousemove', (e) => {
      setCursorCoords({ lat: e.latLng.lat().toFixed(6), lng: e.latLng.lng().toFixed(6) });
    });
    map.addListener('mouseout', () => { setCursorCoords(null); });
    if (!document.getElementById('map-float-style')) {
      const style = document.createElement('style');
      style.id = 'map-float-style';
      style.textContent = '@keyframes floatBounce { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } } .floating-alert-label { animation: floatBounce 2s ease-in-out infinite; pointer-events: none; }';
      document.head.appendChild(style);
    }
    fetchAllParcelData(map);
    return () => {
      overlaysRef.current.polygons.forEach(p => p.setMap(null));
      overlaysRef.current.labels.forEach(l => l.setMap(null));
      overlaysRef.current.markers.forEach(m => m.setMap(null));
      overlaysRef.current.floatingLabels.forEach(f => f.close());
      overlaysRef.current = { polygons: [], labels: [], markers: [], floatingLabels: [] };
    };
  }, [geojsonData]);

  const drawAllPolygons = (map) => {
    geojsonData.features.forEach((feature) => {
      const isPublic = (feature.properties.land_type || '').trim().toLowerCase() === 'public';
      const surveyNo = feature.properties.survey_no;
      const coords = feature.geometry.coordinates[0];
      const paths = coords.map(coord => ({ lat: coord[1], lng: coord[0] }));
      const centroid = getPolygonCentroid(feature.geometry.coordinates);
      const polygon = new google.maps.Polygon({
        paths, strokeColor: isPublic ? '#10b981' : '#6b7280', strokeOpacity: 1.0,
        strokeWeight: isPublic ? 3 : 1.5, fillColor: isPublic ? '#10b981' : '#6b7280',
        fillOpacity: isPublic ? 0.3 : 0.1, map, clickable: true,
      });
      overlaysRef.current.polygons.push(polygon);
      const labelMarker = new google.maps.Marker({
        position: { lat: centroid.lat, lng: centroid.lon }, map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 0 },
        label: { text: surveyNo, color: isPublic ? '#10b981' : '#9ca3af',
          fontSize: isPublic ? '13px' : '10px', fontWeight: 'bold' },
        clickable: isPublic,
      });
      overlaysRef.current.labels.push(labelMarker);
      if (isPublic) {
        const clickHandler = () => handleParcelClick(feature, centroid);
        polygon.addListener('click', clickHandler);
        labelMarker.addListener('click', clickHandler);
      }
    });
  };

  const handleParcelClick = async (feature, centroid) => {
    const surveyNo = feature.properties.survey_no;
    const existing = landParcelsRef.current.find(p => p.properties.survey_no === surveyNo);
    if (existing && existing.apiData) {
      setSelectedParcel(existing);
      setShowAlert(true);
      setVerified(false);
      if (mapRef.current) mapRef.current.panTo({ lat: centroid.lat, lng: centroid.lon });
      return;
    }
    const cachedData = getCachedParcelData(surveyNo, language);
    if (cachedData) {
      const cachedParcel = {
        ...feature,
        centroid,
        apiData: cachedData,
        hasEncroachment: computeHasEncroachment(cachedData),
      };
      setSelectedParcel(cachedParcel);
      setShowAlert(true);
      setVerified(false);
      if (mapRef.current) mapRef.current.panTo({ lat: centroid.lat, lng: centroid.lon });
      setLandParcels(prev => {
        const idx = prev.findIndex(p => p.properties.survey_no === surveyNo);
        if (idx >= 0) { const updated = [...prev]; updated[idx] = cachedParcel; return updated; }
        return [...prev, cachedParcel];
      });
      return;
    }
    const tempParcel = { ...feature, centroid, apiData: null, hasEncroachment: false, loading: true };
    setSelectedParcel(tempParcel);
    setShowAlert(true);
    setVerified(false);
    if (mapRef.current) mapRef.current.panTo({ lat: centroid.lat, lng: centroid.lon });
    try {
      const response = await fetch('http://127.0.0.1:8000/getinfo', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat: centroid.lat, lon: centroid.lon, language }),
      });
      const data = await response.json();
      setCachedParcelData(surveyNo, language, data);
      const hasEncroachment = computeHasEncroachment(data);
      const updatedParcel = { ...feature, centroid, apiData: data, hasEncroachment };
      setSelectedParcel(updatedParcel);
      setLandParcels(prev => {
        const idx = prev.findIndex(p => p.properties.survey_no === surveyNo);
        if (idx >= 0) { const u = [...prev]; u[idx] = updatedParcel; return u; }
        return [...prev, updatedParcel];
      });
    } catch (err) {
      setSelectedParcel({ ...feature, centroid, apiData: null, hasEncroachment: false, error: err.message });
    }
  };

  const fetchAllParcelData = async (map) => {
    const publicParcels = geojsonData.features.filter(f =>
      (f.properties.land_type || '').trim().toLowerCase() === 'public'
    );
    setLoadingProgress({ done: 0, total: publicParcels.length });
    const parcelResults = new Map();
    const parcelsToFetch = [];
    let done = 0;
    publicParcels.forEach((feature) => {
      const surveyNo = feature.properties.survey_no;
      const centroid = getPolygonCentroid(feature.geometry.coordinates);
      const cachedData = getCachedParcelData(surveyNo, language);
      if (cachedData) {
        parcelResults.set(surveyNo, { ...feature, centroid, apiData: cachedData, hasEncroachment: computeHasEncroachment(cachedData) });
        done += 1;
      } else {
        parcelsToFetch.push({ feature, centroid });
      }
    });

    setLoadingProgress({ done, total: publicParcels.length });

    if (done > 0) {
      const cachedOnlyResults = publicParcels
        .map(f => parcelResults.get(f.properties.survey_no))
        .filter(Boolean);
      setLandParcels(cachedOnlyResults);
      colorCodePolygons(cachedOnlyResults);
      addEncroachmentOverlays(map, cachedOnlyResults);
    }

    for (let i = 0; i < parcelsToFetch.length; i += 3) {
      const batch = parcelsToFetch.slice(i, i + 3);
      const batchResults = await Promise.all(
        batch.map(async ({ feature, centroid }) => {
          try {
            const res = await fetch('http://127.0.0.1:8000/getinfo', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: centroid.lat, lon: centroid.lon, language }),
            });
            const data = await res.json();
            const surveyNo = feature.properties.survey_no;
            setCachedParcelData(surveyNo, language, data);
            const hasEncroachment = computeHasEncroachment(data);
            return { surveyNo, result: { ...feature, centroid, apiData: data, hasEncroachment } };
          } catch (err) {
            return {
              surveyNo: feature.properties.survey_no,
              result: { ...feature, centroid, apiData: null, hasEncroachment: false, error: err.message }
            };
          }
        })
      );

      batchResults.forEach(({ surveyNo, result }) => {
        parcelResults.set(surveyNo, result);
      });

      done += batchResults.length;
      setLoadingProgress({ done, total: publicParcels.length });
    }

    const results = publicParcels
      .map(f => parcelResults.get(f.properties.survey_no))
      .filter(Boolean);

    setLandParcels(results);
    setLoading(false);
    colorCodePolygons(results);
    addEncroachmentOverlays(map, results);
  };

  const colorCodePolygons = (parcels) => {
    // Recolor public polygons based on risk level
    parcels.forEach(parcel => {
      const surveyNo = parcel.properties.survey_no;
      const idx = geojsonData.features.findIndex(f => f.properties.survey_no === surveyNo);
      if (idx < 0 || !overlaysRef.current.polygons[idx]) return;
      const alertColor = parcel.apiData?.risk_assessment?.alert_color || 'GREEN';
      const colorMap = {
        RED: { stroke: '#dc2626', fill: '#dc2626', opacity: 0.4 },
        ORANGE: { stroke: '#ea580c', fill: '#ea580c', opacity: 0.35 },
        YELLOW: { stroke: '#eab308', fill: '#eab308', opacity: 0.3 },
        GREEN: { stroke: '#10b981', fill: '#10b981', opacity: 0.2 },
      };
      const c = colorMap[alertColor] || colorMap.GREEN;
      overlaysRef.current.polygons[idx].setOptions({
        strokeColor: c.stroke, fillColor: c.fill, fillOpacity: c.opacity, strokeWeight: 3
      });
      // Also update label color
      if (overlaysRef.current.labels[idx]) {
        overlaysRef.current.labels[idx].setLabel({
          text: surveyNo, color: c.stroke,
          fontSize: '13px', fontWeight: 'bold'
        });
      }
    });
  };

  const addEncroachmentOverlays = (map, parcels) => {
    overlaysRef.current.markers.forEach(m => m.setMap(null));
    overlaysRef.current.floatingLabels.forEach(f => f.close());
    overlaysRef.current.markers = [];
    overlaysRef.current.floatingLabels = [];
    parcels.forEach(parcel => {
      if (!parcel.hasEncroachment) return;
      const alertColor = parcel.apiData?.risk_assessment?.alert_color || 'YELLOW';
      // Only show floating labels for ORANGE and RED (high risk)
      if (alertColor !== 'RED' && alertColor !== 'ORANGE') return;
      const pos = { lat: parcel.centroid.lat, lng: parcel.centroid.lon };
      const score = parcel.apiData?.risk_assessment?.encroachment_score || 0;
      const colorMap = { RED: '#dc2626', ORANGE: '#ea580c', YELLOW: '#ca8a04', GREEN: '#16a34a' };
      const bgColor = colorMap[alertColor] || '#dc2626';
      const alertMarker = new google.maps.Marker({
        position: pos, map,
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 10,
          fillColor: bgColor, fillOpacity: 0.9, strokeColor: '#fff', strokeWeight: 2 },
        zIndex: 999,
      });
      alertMarker.addListener('click', () => {
        setSelectedParcel(parcel); setShowAlert(true); setVerified(false);
      });
      overlaysRef.current.markers.push(alertMarker);
      const infoWindow = new google.maps.InfoWindow({
        content: '<div class="floating-alert-label" style="background:' + bgColor + ';color:white;padding:6px 14px;border-radius:10px;font-size:11px;font-weight:700;box-shadow:0 4px 15px rgba(0,0,0,0.6);text-align:center;line-height:1.5;min-width:100px;border:2px solid rgba(255,255,255,0.3);">⚠ Survey ' + parcel.properties.survey_no + '<br/>Risk: ' + score + '/100<br/><span style="font-size:9px;opacity:0.8;">' + alertColor + ' ALERT</span></div>',
        position: pos, disableAutoPan: true,
        pixelOffset: new google.maps.Size(0, -35),
      });
      infoWindow.open(map);
      overlaysRef.current.floatingLabels.push(infoWindow);
    });
  };

  const toggleFMBOverlay = () => {
    setShowFMBOverlay(prev => {
      const next = !prev;
      overlaysRef.current.polygons.forEach(p => p.setVisible(next));
      overlaysRef.current.labels.forEach(l => l.setVisible(next));
      return next;
    });
  };

  const handleVerify = () => setVerified(true);
  const handleFalseAlarm = () => {
    if (selectedParcel) {
      const surveyNo = selectedParcel.properties.survey_no;
      setDismissedParcels(prev => [...prev, surveyNo]);
      // Update landParcels to mark as not encroached
      setLandParcels(prev => prev.map(p =>
        p.properties.survey_no === surveyNo ? { ...p, hasEncroachment: false, dismissed: true } : p
      ));
      // Remove floating label and marker for this parcel
      if (mapRef.current) {
        recolorPolygon(surveyNo, '#16a34a', 0.2);
      }
    }
    setShowAlert(false);
    setSelectedParcel(null);
    setVerified(false);
  };

  const recolorPolygon = (surveyNo, color, opacity) => {
    const idx = geojsonData.features.findIndex(f => f.properties.survey_no === surveyNo);
    if (idx >= 0 && overlaysRef.current.polygons[idx]) {
      overlaysRef.current.polygons[idx].setOptions({
        strokeColor: color, fillColor: color, fillOpacity: opacity
      });
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex flex-col">
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 p-3 flex items-center justify-between z-50">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">{t?.backToDashboard || 'Back to Dashboard'}</span>
        </button>
        <h1 className="text-lg font-semibold text-white">{t?.satelliteMap || 'Earth Engine Satellite Map'}</h1>
        <div className="flex items-center gap-3">
          <button onClick={toggleFMBOverlay}
            className={'px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ' + (showFMBOverlay ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300')}>
            <Layers size={16} /> FMB Sketch
          </button>
        </div>
      </header>
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm pointer-events-none">
            <div className="text-center">
              <Loader className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
              <p className="text-white text-lg font-semibold">{t?.analyzing || 'Analyzing satellite data...'}</p>
              <p className="text-gray-400 text-sm mt-2">
                {loadingProgress.total > 0 ? ('Processing parcel ' + loadingProgress.done + '/' + loadingProgress.total + '...') : (t?.loading || 'Loading...')}
              </p>
            </div>
          </div>
        )}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute bottom-6 right-6 bg-black/90 backdrop-blur-xl px-5 py-4 rounded-xl border border-gray-700 shadow-2xl z-30 space-y-3">
          <h4 className="text-white font-bold text-sm mb-2">{t?.mapLegend || 'Map Legend'}</h4>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-red-500 bg-red-500/40 rounded" />
            <span className="text-xs text-gray-300">Critical Risk (RED)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-orange-500 bg-orange-500/35 rounded" />
            <span className="text-xs text-gray-300">High Risk (ORANGE)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-yellow-500 bg-yellow-500/30 rounded" />
            <span className="text-xs text-gray-300">Moderate Risk (YELLOW)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-400 bg-emerald-400/20 rounded" />
            <span className="text-xs text-gray-300">Low Risk (GREEN)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-500 bg-gray-500/20 rounded" />
            <span className="text-xs text-gray-300">{t?.privateLand || 'Private Land'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-3 bg-red-600 rounded text-white flex items-center justify-center font-bold" style={{fontSize:'8px'}}>⚠</div>
            <span className="text-xs text-gray-300">Floating Risk Alert</span>
          </div>
        </div>
        <div className="absolute top-6 left-6 bg-black/90 backdrop-blur-xl px-5 py-4 rounded-xl border border-gray-700 shadow-2xl z-30">
          <h4 className="text-emerald-400 font-bold text-sm mb-2">{t?.activeMonitoring || 'Active Monitoring'}</h4>
          <p className="text-white text-xs mb-1">
            {geojsonData.features.filter(f => (f.properties.land_type || '').trim().toLowerCase() === 'public').length} {t?.govtParcelsCount || 'Government Parcels'}
          </p>
          <p className="text-gray-400 text-xs">Source: Sentinel-2 SR (10m)</p>
          <p className="text-gray-400 text-xs mt-1">Analysis: 2019 vs 2026</p>
          {landParcels.filter(p => p.hasEncroachment).length > 0 && (
            <p className="text-red-400 text-xs mt-2 font-semibold">
              {'⚠ ' + landParcels.filter(p => p.hasEncroachment).length + ' encroachments detected'}
            </p>
          )}
        </div>
        {showAlert && selectedParcel && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-40 p-4">
            <div className="bg-gray-900/98 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-emerald-400">{t?.satelliteReport || 'Satellite Analysis Report'}</h3>
                <button onClick={() => { setShowAlert(false); setSelectedParcel(null); }} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              {selectedParcel.loading && !selectedParcel.apiData && !selectedParcel.error ? (
                <div className="text-center py-12">
                  <Loader className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">{'Fetching satellite data for Survey No: ' + selectedParcel.properties.survey_no + '...'}</p>
                </div>
              ) : selectedParcel.error ? (
                <div className="text-red-400 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                  <strong>Error:</strong> {selectedParcel.error}
                  <p className="text-xs text-gray-500 mt-2">Make sure backend is running at http://127.0.0.1:8000</p>
                  <button onClick={() => handleParcelClick(selectedParcel, selectedParcel.centroid)}
                    className="mt-3 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs flex items-center gap-2 text-gray-300">
                    <RefreshCw size={14} /> Retry
                  </button>
                </div>
              ) : selectedParcel.apiData ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <InfoBox label="Survey No" value={selectedParcel.apiData.survey_no || selectedParcel.properties.survey_no} />
                    <InfoBox label="Land Type" value={translateAPIResponse(language, selectedParcel.apiData.land_type) || 'Public (Poramboke)'} />
                    <InfoBox label="Current Status"
                      value={translateAPIResponse(language, selectedParcel.apiData.current_activity) || 'N/A'}
                      valueClass={selectedParcel.hasEncroachment ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'} />
                    <InfoBox label="Temporal Analysis" value={translateAPIResponse(language, selectedParcel.apiData.temporal_history) || 'N/A'} />
                  </div>
                  {selectedParcel.apiData.enhanced_detection && (
                    <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 space-y-4">
                      <h4 className="text-white font-semibold mb-3">Enhanced Detection</h4>
                      {selectedParcel.apiData.enhanced_detection.fencing_analysis && (
                        <DetectionRow icon="🔒" label="Fencing Detection"
                          text={selectedParcel.apiData.enhanced_detection.fencing_analysis.interpretation}
                          isAlert={selectedParcel.apiData.enhanced_detection.fencing_analysis.fence_detected} />
                      )}
                      {selectedParcel.apiData.enhanced_detection.agricultural_pattern && (
                        <DetectionRow icon="🌾" label="Agricultural Activity"
                          text={selectedParcel.apiData.enhanced_detection.agricultural_pattern.interpretation}
                          isAlert={selectedParcel.apiData.enhanced_detection.agricultural_pattern.agricultural_activity} />
                      )}
                      {selectedParcel.apiData.enhanced_detection.nighttime_lights && (
                        <DetectionRow icon="🌙" label="Night-time Activity"
                          text={selectedParcel.apiData.enhanced_detection.nighttime_lights.interpretation}
                          isAlert={selectedParcel.apiData.enhanced_detection.nighttime_lights.nighttime_lights_detected} />
                      )}
                    </div>
                  )}
                  {selectedParcel.apiData.risk_assessment && (
                    <RiskPanel risk={selectedParcel.apiData.risk_assessment} />
                  )}
                  {selectedParcel.apiData.vao_summary && (
                    <div className="bg-blue-500/10 p-5 rounded-xl border border-blue-500/30 space-y-3">
                      <h4 className="text-blue-400 font-semibold">VAO Summary</h4>
                      <p className="text-xs text-gray-300">{selectedParcel.apiData.vao_summary.report_summary}</p>
                      {selectedParcel.apiData.vao_summary.recommended_actions?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Recommended Actions:</p>
                          {selectedParcel.apiData.vao_summary.recommended_actions.map((a, i) => (
                            <p key={i} className="text-xs text-gray-300">{'→ ' + a}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {selectedParcel.hasEncroachment && !verified ? (
                    <div className="flex gap-4 pt-4">
                      <button onClick={handleFalseAlarm} className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl font-medium">
                        {t?.markFalse || 'Mark as False Alarm'}
                      </button>
                      <button onClick={handleVerify} className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium shadow-lg">
                        {t?.verifyEncroachment || 'Verify Encroachment'}
                      </button>
                    </div>
                  ) : verified ? (
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-500/30">
                        <CheckCircle size={24} />
                        <span className="font-medium">{t?.verificationRecorded || 'Verification recorded'}</span>
                      </div>
                      <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium shadow-lg">
                        {t?.generateNotice || 'Generate Official Notice'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 px-5 py-4 rounded-xl border border-emerald-500/30 text-emerald-400">
                      {'✓ ' + (t?.noEncroachment || 'No encroachment detected')}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Loader className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-400">Loading data...</p>
                </div>
              )}
            </div>
          </div>
        )}
        {cursorCoords && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between z-30 border-t border-gray-700">
            <div className="flex items-center gap-6">
              <span className="text-emerald-400 text-xs font-mono font-bold">📍 Cursor Position</span>
              <span className="text-white text-xs font-mono">{'Lat: ' + cursorCoords.lat + '°N'}</span>
              <span className="text-white text-xs font-mono">{'Lng: ' + cursorCoords.lng + '°E'}</span>
            </div>
            <span className="text-gray-500 text-xs">WGS 84 / EPSG:4326</span>
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
      <p className={valueClass + ' font-semibold text-sm'}>{value}</p>
    </div>
  );
}

function DetectionRow({ icon, label, text, isAlert }) {
  return (
    <div className="p-3 bg-gray-900/50 rounded-lg">
      <p className="text-xs text-gray-400 mb-1">{icon} {label}</p>
      <p className={'text-sm font-semibold ' + (isAlert ? 'text-yellow-400' : 'text-green-400')}>{text}</p>
    </div>
  );
}

function RiskPanel({ risk }) {
  const colorMap = {
    RED: { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', badge: 'bg-red-500 text-white' },
    ORANGE: { bg: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500 text-white' },
    YELLOW: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500 text-black' },
    GREEN: { bg: 'bg-green-500/10 border-green-500/30', text: 'text-green-400', badge: 'bg-green-500 text-white' },
  };
  const c = colorMap[risk.alert_color] || colorMap.GREEN;
  return (
    <div className={'p-5 rounded-xl border ' + c.bg}>
      <p className="text-xs text-gray-400 mb-2">Risk Assessment</p>
      <div className="flex items-center justify-between mb-2">
        <p className={'text-2xl font-bold ' + c.text}>{risk.encroachment_score}/100</p>
        <span className={'px-3 py-1 rounded-full text-xs font-bold ' + c.badge}>{risk.alert_color}</span>
      </div>
      <p className="text-sm text-white mb-3">{risk.alert_level}</p>
      {risk.flags_raised?.length > 0 && (
        <div className="space-y-1">
          {risk.flags_raised.map((flag, i) => <p key={i} className="text-xs text-gray-300">{'• ' + flag}</p>)}
        </div>
      )}
    </div>
  );
}
    