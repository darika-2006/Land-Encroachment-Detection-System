import React from 'react';
import { ArrowLeft, Sun, Moon, Globe, Bell, Shield, User } from 'lucide-react';
import { translations } from './translations';

export default function SettingsPage({ onBack, theme, language, onToggleTheme, onToggleLanguage }) {
  const t = translations[language];
  const bgClass = theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900';
  const headerBg = theme === 'dark' ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200';
  const cardBg = theme === 'dark' ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className={`${headerBg} backdrop-blur-sm border-b p-4 sticky top-0 z-40`}>
        <button onClick={onBack} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-medium">
          <ArrowLeft size={20} />
          {t.backToDashboard}
        </button>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t.settingsTitle}</h1>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
          {t.managePreferences}
        </p>

        <div className="space-y-4">
          {/* Appearance */}
          <div className={`${cardBg} backdrop-blur-xl border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              {theme === 'dark' ? <Moon size={20} className="text-emerald-500" /> : <Sun size={20} className="text-emerald-500" />}
              <h2 className="text-xl font-semibold">{t.appearance}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">{t.theme}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.chooseColorScheme}
                </p>
              </div>
              <button
                onClick={onToggleTheme}
                className={`relative w-16 h-8 rounded-full transition-colors ${theme === 'dark' ? 'bg-emerald-600' : 'bg-gray-300'}`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${theme === 'dark' ? 'translate-x-9' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Language */}
          <div className={`${cardBg} backdrop-blur-xl border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Globe size={20} className="text-emerald-500" />
              <h2 className="text-xl font-semibold">{t.language}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">{t.displayLanguage}</p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t.switchLanguages}
                </p>
              </div>
              <button
                onClick={onToggleLanguage}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
              >
                {language === 'en' ? 'தமிழ்' : 'English'}
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className={`${cardBg} backdrop-blur-xl border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Bell size={20} className="text-emerald-500" />
              <h2 className="text-xl font-semibold">{t.notificationsTitle}</h2>
            </div>
            <div className="space-y-3">
              <SettingToggle 
                label={t.emailAlerts} 
                description={t.receiveEmail}
                enabled={true}
                theme={theme}
              />
              <SettingToggle 
                label={t.pushNotifications} 
                description={t.instantNotifications}
                enabled={true}
                theme={theme}
              />
            </div>
          </div>

          {/* Account */}
          <div className={`${cardBg} backdrop-blur-xl border rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <User size={20} className="text-emerald-500" />
              <h2 className="text-xl font-semibold">{t.account}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">A. Kumar</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>akumar@tn.gov.in</p>
                </div>
                <button className="text-emerald-500 hover:text-emerald-600 text-sm font-medium">
                  {t.editProfile}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ label, description, enabled, theme }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium">{label}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
      <button className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-emerald-600' : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}>
        <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
      </button>
    </div>
  );
}
