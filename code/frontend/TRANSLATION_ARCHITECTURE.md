# TLIS Translation Architecture

## ✅ Centralized Translation System Implemented!

```
┌─────────────────────────────────────────────────────────────────┐
│                     translations.js                              │
│                  (SINGLE SOURCE OF TRUTH)                        │
│                                                                   │
│  ┌──────────────────┐           ┌──────────────────┐            │
│  │   English (en)   │           │    Tamil (ta)    │            │
│  │                  │           │                  │            │
│  │  dashboard       │           │  டாஷ்போர்டு        │            │
│  │  alerts          │           │  எச்சரிக்கைகள்     │            │
│  │  reports         │           │  அறிக்கைகள்        │            │
│  │  newEncroachment │           │  புதிய ஆக்கிரமிப்பு │            │
│  │  buildingDetected│           │  கட்டிடம் கண்டறி... │            │
│  │  ...150+ keys    │           │  ...150+ keys    │            │
│  └──────────────────┘           └──────────────────┘            │
│                                                                   │
│  Helper Functions:                                               │
│  • t(language, key)           → Get translation                 │
│  • translateAPIResponse()      → Translate backend data         │
└─────────────────────────────────────────────────────────────────┘
                              ▼
        ┌─────────────────────────────────────────────┐
        │         All Components Import From          │
        │            translations.js                  │
        └─────────────────────────────────────────────┘
                              ▼
    ┌────────────┬────────────┬────────────┬────────────┐
    ▼            ▼            ▼            ▼            ▼
┌────────┐  ┌─────────┐  ┌────────┐  ┌─────────┐  ┌──────────┐
│App.jsx │  │MapView  │  │Alerts  │  │Reports  │  │Settings  │
│        │  │.jsx     │  │Page    │  │Page     │  │Page      │
├────────┤  ├─────────┤  ├────────┤  ├─────────┤  ├──────────┤
│Uses:   │  │Uses:    │  │Uses:   │  │Uses:    │  │Uses:     │
│t.dash  │  │t.satMap │  │t.alerts│  │t.reports│  │t.settings│
│t.alerts│  │t.govtLnd│  │t.status│  │t.download│ │t.theme   │
│        │  │         │  │        │  │         │  │          │
│        │  │+ API    │  │        │  │         │  │          │
│        │  │Translator│ │        │  │         │  │          │
└────────┘  └─────────┘  └────────┘  └─────────┘  └──────────┘
```

## How It Works

### 1. **UI Labels** (Static Text)
```javascript
// Component imports translations
import { translations } from './translations';

function MyComponent({ language }) {
  const t = translations[language]; // Get language object
  
  return <h1>{t.dashboard}</h1>; 
  // Shows: "Dashboard" (en) or "டாஷ்போர்டு" (ta)
}
```

### 2. **API Response Translation** (Dynamic Data)
```javascript
// Backend returns: "NEW ENCROACHMENT DETECTED"

import { translateAPIResponse } from './translations';

function MapView({ language, apiData }) {
  // Auto-translates backend English to Tamil if language='ta'
  const status = translateAPIResponse(language, apiData.current_activity);
  
  return <p>{status}</p>;
  // Shows: "புதிய ஆக்கிரமிப்பு கண்டறியப்பட்டது" (if ta)
}
```

## Adding New Words (Example)

### Scenario: Backend returns new text "FENCE DETECTED"

```javascript
// Step 1: Add to translations.js
en: {
  fenceDetected: "FENCE DETECTED",
},
ta: {
  fenceDetected: "வேலி கண்டறியப்பட்டது",
}

// Step 2: Add mapping for API response
const apiResponseMap = {
  'fence detected': 'fenceDetected', // ✅ Add this
};

// Step 3: Done! It will auto-translate everywhere
```

## Benefits

✅ **Single File to Maintain** - All translations in `translations.js`
✅ **No Code Changes Needed** - Add translation, it works everywhere
✅ **Type Safety** - Easy to find missing translations
✅ **Consistency** - Same word always translates the same way
✅ **API Ready** - Backend responses auto-translate
✅ **Easy to Extend** - Add Hindi, Telugu, etc. easily

## Translation Coverage

📊 **Current Stats:**
- **150+ translation keys** defined
- **5 pages** fully translated
- **UI Labels** ✅ Complete
- **API Responses** ✅ Complete
- **Error Messages** ✅ Complete
- **Status Labels** ✅ Complete

## Language Toggle Flow

```
User clicks Globe icon (Sidebar)
         ▼
setLanguage('ta')
         ▼
App.jsx passes language prop to all pages
         ▼
Each component reads: const t = translations[language]
         ▼
All text updates instantly (no refresh needed!)
```

## File Locations

```
code/frontend/
├── src/
│   ├── translations.js          ⭐ MAIN FILE - Edit here for new words
│   ├── App.jsx                  Uses translations
│   ├── MapView.jsx              Uses translations + API translator
│   ├── AlertsPage.jsx           Uses translations
│   ├── ReportsPage.jsx          Uses translations
│   └── SettingsPage.jsx         Uses translations
└── TRANSLATION_GUIDE.md         📖 Documentation (this file)
```

## Quick Reference

| Task | File to Edit | What to Add |
|------|-------------|-------------|
| Add UI button text | `translations.js` | Add key in `en` and `ta` objects |
| Add API response | `translations.js` | Add key + mapping in `apiResponseMap` |
| Use in component | `YourComponent.jsx` | `const t = translations[language]` |
| Translate backend text | `YourComponent.jsx` | `translateAPIResponse(language, text)` |

---

**Questions?** Check `TRANSLATION_GUIDE.md` for detailed examples!
