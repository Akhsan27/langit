"use client";

import Link from "next/link";
import { usePreferences } from "@/components/Preferences";

type AppSidebarProps = { active: "dashboard" | "locations" | "details" | "about" };

export default function AppSidebar({ active }: AppSidebarProps) {
  const { t } = usePreferences();
  return <>
    <aside className="sidebar">
      <Link className="brand" href="/"><span className="brand-mark">☼</span><span>langit<span className="brand-dot">.</span></span></Link>
      <div className="side-label">MENU</div>
      <Link className={`nav-item ${active === "dashboard" ? "active" : ""}`} href="/"><span className="nav-icon">◉</span>{t("dashboard")}</Link>
      <Link className={`nav-item ${active === "locations" ? "active" : ""}`} href="/locations"><span className="nav-icon">⌕</span>{t("locations")}</Link>
      <Link className={`nav-item ${active === "details" ? "active" : ""}`} href="/details"><span className="nav-icon">▦</span>{t("details")}</Link>
      <div className="side-divider" />
      <div className="side-label">{t("about")}</div>
      <Link className={`nav-item ${active === "about" ? "active" : ""}`} href="/about"><span className="nav-icon">ⓘ</span>{t("aboutPageTitle")}</Link>
      <div className="sidebar-bottom"><div className="mini-weather-icon">🌤️</div><div className="mini-title">{t("brandTitle")}</div><div className="mini-copy">{t("brandText")}</div></div>
    </aside>
    <nav className="mobile-nav" aria-label={t("dashboard")}>
      <Link className={active === "dashboard" ? "active" : ""} href="/"><span>◉</span>{t("dashboard")}</Link>
      <Link className={active === "locations" ? "active" : ""} href="/locations"><span>⌕</span>{t("locations")}</Link>
      <Link className={active === "details" ? "active" : ""} href="/details"><span>▦</span>{t("details")}</Link>
      <Link className={active === "about" ? "active" : ""} href="/about"><span>ⓘ</span>{t("aboutPageTitle")}</Link>
    </nav>
  </>;
}
