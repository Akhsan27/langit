"use client";

import Link from "next/link";
import AppSidebar from "@/components/AppSidebar";
import AppearanceControls from "@/components/AppearanceControls";
import { usePreferences } from "@/components/Preferences";

const features = [
  { icon: "☀", key: "aboutFeatureCurrent" },
  { icon: "◷", key: "aboutFeatureForecast" },
  { icon: "⌁", key: "aboutFeatureCharts" },
  { icon: "⌖", key: "aboutFeatureLocation" },
  { icon: "✦", key: "aboutFeatureActivities" },
];

export default function AboutPage() {
  const { t } = usePreferences();
  return <main className="app-shell"><AppSidebar active="about"/><section className="main-content">
    <header className="topbar"><div className="breadcrumb"><Link href="/">{t("dashboard")}</Link> <span>/</span> {t("aboutPageTitle")}</div><div className="top-actions"><AppearanceControls/><div className="avatar">L</div></div></header>
    <div className="dashboard about-dashboard">
      <div className="about-hero"><span className="about-logo">☼</span><div><div className="eyebrow">LANGIT</div><h1>{t("aboutPageTitle")}</h1><p>{t("aboutPageIntro")}</p></div></div>
      <section className="panel about-purpose"><div className="about-section-icon">◎</div><div><h2>{t("aboutPurposeTitle")}</h2><p>{t("aboutPurpose")}</p></div></section>
      <section className="about-features"><div className="about-section-heading"><div className="eyebrow">LANGIT</div><h2>{t("aboutFeaturesTitle")}</h2></div><div className="about-feature-grid">{features.map((feature) => <article className="panel about-feature-card" key={feature.key}><span className="about-feature-icon">{feature.icon}</span><p>{t(feature.key)}</p></article>)}</div></section>
      <section className="panel about-data"><div className="about-section-icon">↗</div><div><h2>{t("aboutDataTitle")}</h2><p>{t("aboutDataText")}</p><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo ↗</a></div></section>
      <Link className="about-back" href="/">← {t("aboutBack")}</Link>
    </div>
  </section></main>;
}
