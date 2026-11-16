import React from "react";
import { getCompanyKpis } from "../data/company-dashboard";
import { useT } from "@/i18n";
import type { KpiItem } from "../types/dashboard";

export interface DeltaChipProps {
  delta?: number | null;
  good?: boolean;
}

export const DeltaChip = ({ delta, good = true }: DeltaChipProps) => {
  if (delta === undefined || delta === null) return null;
  return (
    <span className={`edash-delta ${good ? "edash-delta-up" : "edash-delta-down"}`}>
      <i className={`fa-solid ${delta >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}></i>
      {Math.abs(delta)}%
    </span>
  );
};

export interface KpiGridProps {
  /** Tiles to show; the company KPIs by default */
  items?: KpiItem[];
}

const KpiGrid = ({ items = getCompanyKpis() }: KpiGridProps) => {
  const { t } = useT();
  return (
  <div className="row g-4 edash-kpis">
    {items.map((kpi) => (
      <div className="col-xl-3 col-lg-6 col-md-6" key={kpi.id}>
        <div className="edash-card edash-kpi">
          <div className={`edash-kpi-icon edash-tone-${kpi.tone}`}>
            <i className={kpi.icon}></i>
          </div>
          <div>
            <p className="edash-kpi-label">{t(kpi.label)}</p>
            <div className="edash-kpi-row">
              <h4 className="edash-kpi-value">
                {typeof kpi.value === "string" ? t(kpi.value) : kpi.value}
                {kpi.valueSuffix}
              </h4>
              <DeltaChip delta={kpi.delta} good={kpi.good} />
            </div>
            <p className="edash-kpi-note">{t(kpi.note || "vs. previous 30 days")}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
  );
};

export default KpiGrid;
