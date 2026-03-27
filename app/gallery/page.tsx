"use client";

import { useState } from "react";
import NasaImageGallery from "@/components/NasaImageGallery";

const tabs = [
  { id: "mars", label: "🔴 Mars", query: "mars rover", placeholder: "Search Mars imagery..." },
  { id: "earth", label: "🌍 Earth", query: "earth from space", placeholder: "Search Earth imagery..." },
  { id: "nebula", label: "🌌 Deep Space", query: "nebula galaxy", placeholder: "Search deep space..." },
  { id: "iss", label: "🛸 ISS", query: "international space station", placeholder: "Search ISS imagery..." },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("mars");
  const activeTabData = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="p-4 pt-14 lg:pt-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Gallery</h1>
      <p className="text-base-content/60">
        Browse NASA&apos;s image library — over 140,000 photos from across the cosmos.
      </p>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-bordered">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            className={`tab ${activeTab === tab.id ? "tab-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content — key forces remount on tab change */}
      <NasaImageGallery
        key={activeTab}
        defaultQuery={activeTabData.query}
        placeholder={activeTabData.placeholder}
      />
    </div>
  );
}
