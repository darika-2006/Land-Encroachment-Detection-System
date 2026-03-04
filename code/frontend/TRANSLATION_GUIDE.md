# Translation System Documentation

## Overview
The TLIS (Thoothukudi Land Intelligence System) uses a centralized translation system located in `src/translations.js`. This allows for easy management of both UI labels and API response translations in English and Tamil.

## File Structure
```
src/
├── translations.js          # ⭐ MAIN TRANSLATION FILE (edit here)
├── App.jsx                  # Uses translations
├── MapView.jsx              # Uses translations + API translator
├── AlertsPage.jsx           # Uses translations
├── ReportsPage.jsx          # Uses translations
└── SettingsPage.jsx         # Uses translations
```

## How to Add New Translations

### 1. **For UI Labels (Buttons, Headers, etc.)**

Open `src/translations.js` and add your key in both `en` and `ta` objects:

```javascript
export const translations = {
  en: {
    // Existing translations...
    myNewButton: "Click Here",      // ✅ Add English
    myNewTitle: "Welcome Message",
  },
  ta: {
    // Existing translations...
    myNewButton: "இங்கே கிளிக் செய்க",     // ✅ Add Tamil
    myNewTitle: "வரவேற்பு செய்தி",
  }
};
```

### 2. **For API Response Text**

If your backend returns new English text that needs Tamil translation:

**Step 1:** Add to `translations.js`:
```javascript
en: {
  // API Responses
  construction_detected: "Construction Detected",
},
ta: {
  // API Responses  
  construction_detected: "கட்டுமானம் கண்டறியப்பட்டது",
}
```

**Step 2:** Add mapping in `translateAPIResponse` function:
```javascript
const apiResponseMap = {
  // Existing mappings...
  'construction detected': 'construction_detected',  // ✅ Add mapping
};
```

### 3. **Using Translations in Components**

#### Basic Usage:
```javascript
import { translations } from './translations';

function MyComponent({ language }) {
  const t = translations[language];
  
  return (
    <div>
      <h1>{t.myNewTitle}</h1>
      <button>{t.myNewButton}</button>
    </div>
  );
}
```

#### For API Responses:
```javascript
import { translateAPIResponse } from './translations';

function MyComponent({ language, apiData }) {
  const translatedStatus = translateAPIResponse(language, apiData.status);
  
  return <p>{translatedStatus}</p>;
}
```

## Current Translation Keys

### Navigation
- `dashboard`, `alerts`, `reports`, `notifications`, `settings`, `logout`

### Dashboard
- `monitoring`, `govtParcels`, `activeAlerts`, `analysisComplete`
- `totalParcels`, `requiresAttention`, `allScanned`

### Map View
- `satelliteMap`, `mapLegend`, `govtLand`, `privateLand`
- `encroachmentAlert`, `activeMonitoring`

### Satellite Report
- `surveyNo`, `landType`, `currentStatus`, `temporalAnalysis`
- `spectralAnalysis`, `baselineNDBI`, `currentNDBI`, `riskScore`

### Alerts Page
- `encroachmentAlerts`, `totalAlerts`, `pending`, `resolved`
- `newConstruction`, `buildingActivity`, `landClearing`

### Reports Page
- `generatedReports`, `monthlyReport`, `quarterlyAnalysis`
- `downloadPDF`, `generateNewReport`

### Settings Page
- `appearance`, `theme`, `language`, `notificationsTitle`
- `emailAlerts`, `pushNotifications`, `account`

### API Response Translations
- `newEncroachment`, `buildingDetected`, `stableNoConstruction`
- `noBuildingBaseline`, `existingStructure`, `stableVegetation`
- `publicLand`, `privateLandType`, `governmentLand`

### Status Labels
- `statusPending`, `statusInvestigating`, `statusResolved`
- `veryStrong`, `strong`, `moderate`, `weak`

### Common Actions
- `download`, `create`, `edit`, `delete`, `save`, `cancel`
- `confirm`, `close`, `open`, `view`

## Examples

### Example 1: Adding a New Alert Type
```javascript
// 1. Add to translations.js
en: {
  waterEncroachment: "Water Body Encroachment",
},
ta: {
  waterEncroachment: "நீர்நிலை ஆக்கிரமிப்பு",
}

// 2. Use in AlertsPage.jsx
const alerts = [
  { id: 5, title: t.waterEncroachment, ... }
];
```

### Example 2: Adding Backend API Translation
```javascript
// Backend returns: "WATER BODY DETECTED"

// 1. Add to translations.js
en: {
  waterBodyDetected: "WATER BODY DETECTED",
},
ta: {
  waterBodyDetected: "நீர்நிலை கண்டறியப்பட்டது",
}

// 2. Add mapping
const apiResponseMap = {
  'water body detected': 'waterBodyDetected',
};

// 3. Automatically translated when displayed
<p>{translateAPIResponse(language, apiData.status)}</p>
```

## Best Practices

1. ✅ **Use camelCase** for translation keys: `myNewKey`, not `my-new-key`
2. ✅ **Keep keys descriptive**: `downloadReport` not `dr1`
3. ✅ **Group related keys** together in the file
4. ✅ **Always add BOTH** English and Tamil translations
5. ✅ **Test both languages** after adding new keys
6. ✅ **Use `translateAPIResponse`** for backend data, not for UI labels

## Language Toggle

Users can switch languages using:
- **Sidebar button** (Globe icon) on Dashboard
- **Settings page** Language section

The language state is stored in `App.jsx` and passed to all child components.

## Adding a New Language (e.g., Hindi)

```javascript
export const translations = {
  en: { ... },
  ta: { ... },
  hi: {  // ✅ Add Hindi
    dashboard: "डैशबोर्ड",
    alerts: "अलर्ट",
    // ... add all keys
  }
};
```

Then update language toggle in `App.jsx`:
```javascript
const [language, setLanguage] = useState('en'); // 'en', 'ta', or 'hi'
```

## Troubleshooting

**Problem:** Text shows in English even when Tamil is selected
- ✅ Check if the key exists in `ta` object
- ✅ Verify you're using `t.keyName` not hardcoded text
- ✅ Check console for undefined translation warnings

**Problem:** API response not translating
- ✅ Add the text to `apiResponseMap` in `translateAPIResponse`
- ✅ Ensure backend text matches the mapping key (case-insensitive)
- ✅ Use `translateAPIResponse(language, text)` in component

## Support
For questions about translations, contact the development team or refer to existing components for examples.
