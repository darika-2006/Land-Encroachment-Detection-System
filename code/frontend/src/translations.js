// Centralized Translation System for Nizhan
// All UI labels, API responses, and dynamic content translations

export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    alerts: "Alerts",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings",
    logout: "Logout",
    backToDashboard: "Back to Dashboard",

    // Dashboard
    monitoring: "Land Monitoring Dashboard",
    officer: "Officer",
    govtParcels: "Government Parcels Monitored",
    activeAlerts: "Active Alerts",
    analysisComplete: "Analysis Complete",
    totalParcels: "Total land parcels under surveillance",
    requiresAttention: "Requires immediate attention",
    allScanned: "All parcels scanned",
    interactiveMap: "Interactive Satellite Map",
    poweredBy: "Powered by Google Earth Engine",
    mapDescription: "View high-resolution satellite imagery with real-time encroachment detection. Click on government land parcels to see detailed analysis including NDBI scores, temporal changes, and AI-powered alerts.",
    openMap: "Open Satellite Map View",
    latestScan: "Latest Scan",
    nextScan: "Next scheduled scan in 6 hours",
    dataSource: "Data Source",
    resolution: "10m resolution satellite imagery",

    // Map View
    satelliteMap: "Earth Engine Satellite Map",
    fullscreen: "Fullscreen",
    analyzing: "Analyzing government lands with Earth Engine...",
    loading: "Loading satellite imagery and detecting encroachments",
    mapLegend: "Map Legend",
    govtLand: "Government Land",
    privateLand: "Private Land",
    encroachmentAlert: "Encroachment Alert",
    activeMonitoring: "Active Monitoring",
    govtParcelsCount: "Government Parcels",
    source: "Source",
    sentinelResolution: "Sentinel-2 SR (10m resolution)",
    analysis: "Analysis",

    // Satellite Analysis Report
    satelliteReport: "Satellite Analysis Report",
    surveyNo: "Survey No",
    landType: "Land Type",
    currentStatus: "Current Status",
    temporalAnalysis: "Temporal Analysis",
    spectralAnalysis: "Spectral Index Analysis",
    baselineNDBI: "NDBI (2019 Baseline)",
    currentNDBI: "NDBI (2026 Current)",
    riskScore: "Encroachment Risk Score",
    markFalse: "Mark as False Alarm",
    verifyEncroachment: "Verify Encroachment",
    verificationRecorded: "Verification recorded successfully",
    generateNotice: "Generate Eviction Notice",
    noEncroachment: "No encroachment detected - Land status is stable",
    fetchingData: "Fetching analysis data...",
    error: "Error",

    // Alerts Page
    encroachmentAlerts: "Encroachment Alerts",
    monitorManage: "Monitor and manage detected encroachments",
    totalAlerts: "Total Alerts",
    pending: "Pending",
    resolved: "Resolved",
    viewDetails: "View Details",
    newConstruction: "New Construction Detected",
    buildingActivity: "Building Activity",
    landClearing: "Land Clearing Observed",
    falseAlarm: "False Alarm - Vegetation",
    hoursAgo: "hours ago",
    dayAgo: "day ago",
    daysAgo: "days ago",
    investigating: "Investigating",

    // Reports Page
    generatedReports: "Generated Reports",
    viewDownload: "View and download analysis reports",
    monthlyReport: "Monthly Encroachment Report",
    quarterlyAnalysis: "Quarterly Analysis",
    annualSurvey: "Annual Land Survey",
    temporalChange: "Temporal Change Analysis",
    parcelsAnalyzed: "parcels analyzed",
    downloadPDF: "Download PDF",
    generateNewReport: "Generate New Report",
    createCustomReport: "Create Custom Report",

    // Settings Page
    settingsTitle: "Settings",
    managePreferences: "Manage your application preferences",
    appearance: "Appearance",
    theme: "Theme",
    chooseColorScheme: "Choose your preferred color scheme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language",
    displayLanguage: "Display Language",
    switchLanguages: "Switch between English and Tamil",
    notificationsTitle: "Notifications",
    emailAlerts: "Email Alerts",
    receiveEmail: "Receive alerts via email",
    pushNotifications: "Push Notifications",
    instantNotifications: "Get instant notifications",
    account: "Account",
    editProfile: "Edit Profile",

    // API Response Translations (from backend)
    // Land Types
    publicLand: "Public",
    publicPoramboke: "Public (Poramboke)",
    privateLandType: "Private",
    governmentLand: "Government Land",

    // Activity Status
    newEncroachment: "NEW ENCROACHMENT DETECTED",
    veryStrongSignal: "VERY STRONG SIGNAL",
    moderateSignal: "MODERATE SIGNAL",
    buildingDetected: "BUILDING DETECTED",
    stableNoConstruction: "Stable (No construction)",
    analysisSkipped: "Analysis skipped: Private Land",
    
    // Temporal History
    noBuildingBaseline: "No building detected in 2019 (Pre-Covid)",
    existingStructure: "Pre-existing structure (2019)",
    stableVegetation: "Stable vegetation cover",
    
    // Status Messages
    outsideArea: "Location outside survey data area",
    privateSkip: "Analysis skipped: Private Land",
    success: "Success",
    errorMsg: "Error",
    
    // Signal Strengths
    veryStrong: "VERY STRONG",
    strong: "STRONG",
    moderate: "MODERATE",
    weak: "WEAK",

    // Dates & Time
    february: "February",
    q1: "Q1",
    annual: "Annual",
    
    // Common Actions
    download: "Download",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    open: "Open",
    view: "View",
    
    // Status Labels
    statusPending: "PENDING",
    statusInvestigating: "INVESTIGATING",
    statusResolved: "RESOLVED",
    statusCompleted: "completed",
  },
  ta: {
    // Navigation
    dashboard: "டாஷ்போர்டு",
    alerts: "எச்சரிக்கைகள்",
    reports: "அறிக்கைகள்",
    notifications: "அறிவிப்புகள்",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    backToDashboard: "டாஷ்போர்டுக்கு திரும்பு",

    // Dashboard
    monitoring: "நில கண்காணிப்பு டாஷ்போர்டு",
    officer: "அதிகாரி",
    govtParcels: "அரசு நிலங்கள் கண்காணிக்கப்படுகின்றன",
    activeAlerts: "செயலில் உள்ள எச்சரிக்கைகள்",
    analysisComplete: "பகுப்பாய்வு முடிந்தது",
    totalParcels: "கண்காணிப்பில் உள்ள மொத்த நில பார்சல்கள்",
    requiresAttention: "உடனடி கவனம் தேவை",
    allScanned: "அனைத்து பார்சல்களும் ஸ்கேன் செய்யப்பட்டன",
    interactiveMap: "ஊடாடும் செயற்கைக்கோள் வரைபடம்",
    poweredBy: "கூகுள் எர்த் இன்ஜின் மூலம்",
    mapDescription: "நிகழ்நேர ஆக்கிரமிப்பு கண்டறிதலுடன் உயர்-தெளிவுத்திறன் செயற்கைக்கோள் படங்களைக் காண்க. NDBI மதிப்பெண்கள், தற்காலிக மாற்றங்கள் மற்றும் AI-இயங்கும் எச்சரிக்கைகள் உள்ளிட்ட விரிவான பகுப்பாய்வைக் காண அரசு நில பார்சல்களைக் கிளிக் செய்யவும்.",
    openMap: "செயற்கைக்கோள் வரைபடத்தைத் திறக்கவும்",
    latestScan: "சமீபத்திய ஸ்கேன்",
    nextScan: "அடுத்த திட்டமிடப்பட்ட ஸ்கேன் 6 மணி நேரத்தில்",
    dataSource: "தரவு மூலம்",
    resolution: "10மீ தெளிவுத்திறன் செயற்கைக்கோள் படங்கள்",

    // Map View
    satelliteMap: "எர்த் இன்ஜின் செயற்கைக்கோள் வரைபடம்",
    fullscreen: "முழுத்திரை",
    analyzing: "எர்த் இன்ஜின் மூலம் அரசு நிலங்களை பகுப்பாய்வு செய்கிறது...",
    loading: "செயற்கைக்கோள் படங்களை ஏற்றுகிறது மற்றும் ஆக்கிரமிப்புகளை கண்டறிகிறது",
    mapLegend: "வரைபட குறியீடு",
    govtLand: "அரசு நிலம்",
    privateLand: "தனியார் நிலம்",
    encroachmentAlert: "ஆக்கிரமிப்பு எச்சரிக்கை",
    activeMonitoring: "செயலில் உள்ள கண்காணிப்பு",
    govtParcelsCount: "அரசு பார்சல்கள்",
    source: "மூலம்",
    sentinelResolution: "செண்டினல்-2 SR (10மீ தெளிவுத்திறன்)",
    analysis: "பகுப்பாய்வு",

    // Satellite Analysis Report
    satelliteReport: "செயற்கைக்கோள் பகுப்பாய்வு அறிக்கை",
    surveyNo: "கணக்கெடுப்பு எண்",
    landType: "நில வகை",
    currentStatus: "தற்போதைய நிலை",
    temporalAnalysis: "தற்காலிக பகுப்பாய்வு",
    spectralAnalysis: "ஸ்பெக்ட்ரல் குறியீடு பகுப்பாய்வு",
    baselineNDBI: "NDBI (2019 அடிப்படை)",
    currentNDBI: "NDBI (2026 தற்போதைய)",
    riskScore: "ஆக்கிரமிப்பு ஆபத்து மதிப்பெண்",
    markFalse: "தவறான எச்சரிக்கை என குறிக்கவும்",
    verifyEncroachment: "ஆக்கிரமிப்பை சரிபார்க்கவும்",
    verificationRecorded: "சரிபார்ப்பு வெற்றிகரமாக பதிவு செய்யப்பட்டது",
    generateNotice: "வெளியேற்ற அறிவிப்பு உருவாக்கு",
    noEncroachment: "ஆக்கிரமிப்பு இல்லை - நில நிலை நிலையானது",
    fetchingData: "பகுப்பாய்வு தரவு பெறப்படுகிறது...",
    error: "பிழை",

    // Alerts Page
    encroachmentAlerts: "ஆக்கிரமிப்பு எச்சரிக்கைகள்",
    monitorManage: "கண்டறியப்பட்ட ஆக்கிரமிப்புகளை கண்காணித்து நிர்வகிக்கவும்",
    totalAlerts: "மொத்த எச்சரிக்கைகள்",
    pending: "நிலுவையில்",
    resolved: "தீர்க்கப்பட்டது",
    viewDetails: "விவரங்களைக் காண்க",
    newConstruction: "புதிய கட்டுமானம் கண்டறியப்பட்டது",
    buildingActivity: "கட்டிட செயல்பாடு",
    landClearing: "நிலம் அகற்றுதல் கவனிக்கப்பட்டது",
    falseAlarm: "தவறான எச்சரிக்கை - தாவரங்கள்",
    hoursAgo: "மணி நேரங்களுக்கு முன்",
    dayAgo: "நாள் முன்",
    daysAgo: "நாட்களுக்கு முன்",
    investigating: "விசாரணை",

    // Reports Page
    generatedReports: "உருவாக்கப்பட்ட அறிக்கைகள்",
    viewDownload: "பகுப்பாய்வு அறிக்கைகளைப் பார்க்கவும் பதிவிறக்கவும்",
    monthlyReport: "மாதாந்திர ஆக்கிரமிப்பு அறிக்கை",
    quarterlyAnalysis: "காலாண்டு பகுப்பாய்வு",
    annualSurvey: "ஆண்டு நில கணக்கெடுப்பு",
    temporalChange: "தற்காலிக மாற்ற பகுப்பாய்வு",
    parcelsAnalyzed: "பார்சல்கள் பகுப்பாய்வு",
    downloadPDF: "PDF பதிவிறக்கு",
    generateNewReport: "புதிய அறிக்கை உருவாக்கு",
    createCustomReport: "தனிப்பயன் அறிக்கை உருவாக்கு",

    // Settings Page
    settingsTitle: "அமைப்புகள்",
    managePreferences: "உங்கள் பயன்பாட்டு விருப்பங்களை நிர்வகிக்கவும்",
    appearance: "தோற்றம்",
    theme: "தீம்",
    chooseColorScheme: "உங்கள் விருப்பமான வண்ணத் திட்டத்தைத் தேர்ந்தெடுக்கவும்",
    lightMode: "ஒளி பயன்முறை",
    darkMode: "இருண்ட பயன்முறை",
    language: "மொழி",
    displayLanguage: "காட்சி மொழி",
    switchLanguages: "ஆங்கிலம் மற்றும் தமிழ் இடையே மாறவும்",
    notificationsTitle: "அறிவிப்புகள்",
    emailAlerts: "மின்னஞ்சல் எச்சரிக்கைகள்",
    receiveEmail: "மின்னஞ்சல் மூலம் எச்சரிக்கைகளைப் பெறுங்கள்",
    pushNotifications: "புஷ் அறிவிப்புகள்",
    instantNotifications: "உடனடி அறிவிப்புகளைப் பெறுங்கள்",
    account: "கணக்கு",
    editProfile: "சுயவிவரத்தைத் திருத்து",

    // API Response Translations (from backend)
    // Land Types
    publicLand: "பொது",
    publicPoramboke: "பொது (பொரம்போக்கு)",
    privateLandType: "தனியார்",
    governmentLand: "அரசு நிலம்",

    // Activity Status
    newEncroachment: "புதிய ஆக்கிரமிப்பு கண்டறியப்பட்டது",
    veryStrongSignal: "மிக வலுவான சமிக்ஞை",
    moderateSignal: "மிதமான சமிக்ஞை",
    buildingDetected: "கட்டிடம் கண்டறியப்பட்டது",
    stableNoConstruction: "நிலையான (கட்டுமானம் இல்லை)",
    analysisSkipped: "பகுப்பாய்வு தவிர்க்கப்பட்டது: தனியார் நிலம்",
    
    // Temporal History
    noBuildingBaseline: "2019 இல் கட்டிடம் இல்லை (கோவிட் முன்)",
    existingStructure: "ஏற்கனவே உள்ள கட்டமைப்பு (2019)",
    stableVegetation: "நிலையான தாவர உறை",
    
    // Status Messages
    outsideArea: "கணக்கெடுப்பு தரவு பகுதிக்கு வெளியே உள்ள இடம்",
    privateSkip: "பகுப்பாய்வு தவிர்க்கப்பட்டது: தனியார் நிலம்",
    success: "வெற்றி",
    errorMsg: "பிழை",
    
    // Signal Strengths
    veryStrong: "மிக வலுவான",
    strong: "வலுவான",
    moderate: "மிதமான",
    weak: "பலவீனமான",

    // Dates & Time
    february: "பிப்ரவரி",
    q1: "Q1",
    annual: "ஆண்டு",
    
    // Common Actions
    download: "பதிவிறக்கு",
    create: "உருவாக்கு",
    edit: "திருத்து",
    delete: "நீக்கு",
    save: "சேமி",
    cancel: "ரத்து செய்",
    confirm: "உறுதிப்படுத்து",
    close: "மூடு",
    open: "திற",
    view: "காண்க",
    
    // Status Labels
    statusPending: "நிலுவையில்",
    statusInvestigating: "விசாரணை",
    statusResolved: "தீர்க்கப்பட்டது",
    statusCompleted: "முடிந்தது",
  }
};

// Helper function to get translated text
export const t = (language, key) => {
  return translations[language]?.[key] || translations.en[key] || key;
};

// Helper function to translate API response text
export const translateAPIResponse = (language, text) => {
  if (!text) return text;
  
  const textLower = text.toLowerCase();
  
  // Map English API responses to translation keys
  const apiResponseMap = {
    'new encroachment detected': 'newEncroachment',
    'very strong signal': 'veryStrongSignal',
    'moderate signal': 'moderateSignal',
    'building detected': 'buildingDetected',
    'stable (no construction)': 'stableNoConstruction',
    'analysis skipped: private land': 'analysisSkipped',
    'no building detected in 2019 (pre-covid)': 'noBuildingBaseline',
    'pre-existing structure (2019)': 'existingStructure',
    'stable vegetation cover': 'stableVegetation',
    'location outside survey data area': 'outsideArea',
    'public': 'publicLand',
    'private': 'privateLandType',
    'government land': 'governmentLand',
    'public (poramboke)': 'publicPoramboke',
  };
  
  // Check if we have a translation for this response
  for (const [englishText, key] of Object.entries(apiResponseMap)) {
    if (textLower.includes(englishText.toLowerCase())) {
      return translations[language][key] || text;
    }
  }
  
  return text; // Return original if no translation found
};

export default translations;
