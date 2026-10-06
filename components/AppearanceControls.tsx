"use client";

import { usePreferences } from "@/components/Preferences";

export default function AppearanceControls() {
  const { theme, language, languageOptions, setLanguage, toggleTheme, t } = usePreferences();
  return <div className="appearance-controls">
    <label className="language-picker" aria-label={t("settingsLanguage")}>
      <span aria-hidden="true">文A</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)} aria-label={t("settingsLanguage")}>
        {languageOptions.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
      </select>
    </label>
    <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === "light" ? t("darkMode") : t("lightMode")} title={theme === "light" ? t("darkMode") : t("lightMode")}>
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span><span className="theme-toggle-label">{theme === "light" ? t("darkMode") : t("lightMode")}</span>
    </button>
  </div>;
}
